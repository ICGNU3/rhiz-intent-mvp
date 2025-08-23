import { google } from 'googleapis';
import { z } from 'zod';
import { db, integration, oauthToken, person, encounter, claim } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';
import { encryptOAuthToken, decryptOAuthToken } from '@rhiz/db';

// Google Calendar configuration schema
export const GoogleCalendarConfig = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
});

export type GoogleCalendarConfig = z.infer<typeof GoogleCalendarConfig>;

// Google Calendar event schema
export const GoogleCalendarEvent = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  attendees: z.array(z.object({
    email: z.string(),
    displayName: z.string().optional(),
    responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional(),
  })).optional(),
  organizer: z.object({
    email: z.string(),
    displayName: z.string().optional(),
  }).optional(),
  location: z.string().optional(),
});

export type GoogleCalendarEvent = z.infer<typeof GoogleCalendarEvent>;

// Google Calendar integration class
export class GoogleCalendarIntegration {
  private config: GoogleCalendarConfig;
  private oauth2Client: any;

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  // Generate OAuth URL for Google Calendar access
  generateAuthUrl(workspaceId: string, state?: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state || workspaceId,
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string, workspaceId: string): Promise<boolean> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      // Store encrypted tokens
      await db.insert(oauthToken).values({
        workspaceId,
        provider: 'google',
        accessToken: encryptOAuthToken(tokens.access_token),
        refreshToken: tokens.refresh_token ? encryptOAuthToken(tokens.refresh_token) : null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        scope: 'calendar.readonly calendar.events.readonly',
      }).onConflictDoUpdate({
        target: [oauthToken.workspaceId, oauthToken.provider],
        set: {
          accessToken: encryptOAuthToken(tokens.access_token),
          refreshToken: tokens.refresh_token ? encryptOAuthToken(tokens.refresh_token) : null,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          updatedAt: new Date(),
        }
      });

      // Update integration status
      await db.insert(integration).values({
        workspaceId,
        provider: 'google',
        status: 'connected',
        config: { type: 'calendar' },
        lastSyncAt: new Date(),
      }).onConflictDoUpdate({
        target: [integration.workspaceId, integration.provider],
        set: {
          status: 'connected',
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        }
      });

      return true;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      return false;
    }
  }

  // Get stored tokens for a workspace
  private async getTokens(workspaceId: string): Promise<{ accessToken: string; refreshToken?: string } | null> {
    try {
      const tokenRecord = await db
        .select()
        .from(oauthToken)
        .where(
          and(
            eq(oauthToken.workspaceId, workspaceId),
            eq(oauthToken.provider, 'google')
          )
        )
        .limit(1);

      if (tokenRecord.length === 0) {
        return null;
      }

      const accessToken = decryptOAuthToken(tokenRecord[0].accessToken);
      const refreshToken = tokenRecord[0].refreshToken ? decryptOAuthToken(tokenRecord[0].refreshToken) : undefined;

      if (!accessToken) {
        return null;
      }

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return null;
    }
  }

  // Refresh access token if needed
  private async refreshAccessToken(refreshToken: string, workspaceId: string): Promise<string | null> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        return null;
      }

      // Update stored token
      await db
        .update(oauthToken)
        .set({
          accessToken: encryptOAuthToken(credentials.access_token),
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(oauthToken.workspaceId, workspaceId),
            eq(oauthToken.provider, 'google')
          )
        );

      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }

  // Import calendar events
  async importCalendarEvents(workspaceId: string, daysBack: number = 30): Promise<{
    success: boolean;
    eventsProcessed: number;
    peopleCreated: number;
    encountersCreated: number;
    error?: string;
  }> {
    try {
      const tokens = await this.getTokens(workspaceId);
      if (!tokens) {
        return {
          success: false,
          eventsProcessed: 0,
          peopleCreated: 0,
          encountersCreated: 0,
          error: 'No OAuth tokens found'
        };
      }

      // Set up calendar API client
      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Calculate date range
      const now = new Date();
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Fetch calendar events
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: now.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 100,
      });

      const events = response.data.items || [];
      let eventsProcessed = 0;
      let peopleCreated = 0;
      let encountersCreated = 0;

      for (const event of events) {
        try {
          const parsedEvent = GoogleCalendarEvent.parse(event);
          const result = await this.processCalendarEvent(workspaceId, parsedEvent);
          
          if (result.success) {
            eventsProcessed++;
            peopleCreated += result.peopleCreated;
            encountersCreated += result.encountersCreated;
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }

      // Update last sync time
      await db
        .update(integration)
        .set({
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(integration.workspaceId, workspaceId),
            eq(integration.provider, 'google')
          )
        );

      return {
        success: true,
        eventsProcessed,
        peopleCreated,
        encountersCreated,
      };

    } catch (error) {
      console.error('Error importing calendar events:', error);
      return {
        success: false,
        eventsProcessed: 0,
        peopleCreated: 0,
        encountersCreated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Process a single calendar event
  private async processCalendarEvent(workspaceId: string, event: GoogleCalendarEvent): Promise<{
    success: boolean;
    peopleCreated: number;
    encountersCreated: number;
  }> {
    try {
      let peopleCreated = 0;
      let encountersCreated = 0;

      // Create encounter for the event
      const encounterRecord = await db.insert(encounter).values({
        workspaceId,
        ownerId: 'demo-user-123', // TODO: Get from context
        kind: 'meeting',
        occurredAt: new Date(event.start.dateTime || event.start.date || ''),
        summary: event.summary,
        raw: event,
      }).returning();

      if (encounterRecord.length > 0) {
        encountersCreated++;
      }

      // Process attendees
      if (event.attendees) {
        for (const attendee of event.attendees) {
          if (attendee.email) {
            // Check if person already exists
            const existingPerson = await db
              .select()
              .from(person)
              .where(
                and(
                  eq(person.workspaceId, workspaceId),
                  eq(person.primaryEmail, attendee.email)
                )
              )
              .limit(1);

            if (existingPerson.length === 0) {
              // Create new person
              await db.insert(person).values({
                workspaceId,
                ownerId: 'demo-user-123', // TODO: Get from context
                fullName: attendee.displayName || attendee.email.split('@')[0],
                primaryEmail: attendee.email,
              });
              peopleCreated++;
            }

            // Create claim about company from email domain
            const domain = attendee.email.split('@')[1];
            if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
              await db.insert(claim).values({
                workspaceId,
                ownerId: 'demo-user-123', // TODO: Get from context
                subjectType: 'person',
                subjectId: existingPerson[0]?.id || 'unknown',
                key: 'company',
                value: domain.split('.')[0].replace(/[^a-zA-Z]/g, ' ').trim(),
                confidence: 70,
                source: 'google_calendar',
                lawfulBasis: 'legitimate_interest',
                provenance: {
                  source: 'google_calendar_event',
                  eventId: event.id,
                  attendeeEmail: attendee.email,
                  inferredFrom: 'email_domain',
                },
              });
            }
          }
        }
      }

      return {
        success: true,
        peopleCreated,
        encountersCreated,
      };

    } catch (error) {
      console.error('Error processing calendar event:', error);
      return {
        success: false,
        peopleCreated: 0,
        encountersCreated: 0,
      };
    }
  }

  // Check if integration is connected
  async isConnected(workspaceId: string): Promise<boolean> {
    try {
      const integrationRecord = await db
        .select()
        .from(integration)
        .where(
          and(
            eq(integration.workspaceId, workspaceId),
            eq(integration.provider, 'google')
          )
        )
        .limit(1);

      return integrationRecord.length > 0 && integrationRecord[0].status === 'connected';
    } catch (error) {
      console.error('Error checking integration status:', error);
      return false;
    }
  }

  // Disconnect integration
  async disconnect(workspaceId: string): Promise<boolean> {
    try {
      // Remove OAuth tokens
      await db
        .delete(oauthToken)
        .where(
          and(
            eq(oauthToken.workspaceId, workspaceId),
            eq(oauthToken.provider, 'google')
          )
        );

      // Update integration status
      await db
        .update(integration)
        .set({
          status: 'disconnected',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(integration.workspaceId, workspaceId),
            eq(integration.provider, 'google')
          )
        );

      return true;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      return false;
    }
  }
}

// Factory function to create Google Calendar integration
export function createGoogleCalendarIntegration(): GoogleCalendarIntegration | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.log('Google Calendar integration not configured - missing environment variables');
    return null;
  }

  return new GoogleCalendarIntegration({
    clientId,
    clientSecret,
    redirectUri,
  });
}
