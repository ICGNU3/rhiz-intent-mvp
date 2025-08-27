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

// Real-time calendar sync with webhook support
export class RealTimeCalendarSync {
  private config: GoogleCalendarConfig;
  private syncStatus: Map<string, {
    lastSync: Date;
    status: 'active' | 'paused' | 'error';
    errorCount: number;
  }> = new Map();

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  async setupWebhook(workspaceId: string, calendarId: string): Promise<boolean> {
    try {
      // Set up Google Calendar webhook
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/calendar/webhook`;
      
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/watch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken(workspaceId)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: `rhiz-calendar-${workspaceId}`,
          type: 'web_hook',
          address: webhookUrl,
          params: {
            workspaceId,
            calendarId,
          },
        }),
      });

      if (response.ok) {
        this.syncStatus.set(workspaceId, {
          lastSync: new Date(),
          status: 'active',
          errorCount: 0,
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to setup calendar webhook:', error);
      return false;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const { workspaceId, calendarId } = payload.params;
      const events = payload.events || [];

      // Process each event change
      for (const event of events) {
        await this.processEventChange(workspaceId, calendarId, event);
      }

      // Update sync status
      const status = this.syncStatus.get(workspaceId);
      if (status) {
        status.lastSync = new Date();
        status.errorCount = 0;
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      
      // Increment error count
      const status = this.syncStatus.get(payload.params?.workspaceId);
      if (status) {
        status.errorCount++;
        if (status.errorCount > 5) {
          status.status = 'error';
        }
      }
    }
  }

  private async processEventChange(workspaceId: string, calendarId: string, event: any): Promise<void> {
    const { db, encounter, person, claim, personEncounter } = await import('@rhiz/db');
    const { addJob, QUEUE_NAMES } = await import('@rhiz/workers');

    try {
      // Check for conflicts with existing encounters
      const existingEncounter = await db
        .select()
        .from(encounter)
        .where(({ and, eq }) => 
          and(
            eq(encounter.workspaceId, workspaceId),
            eq(encounter.raw, { eventId: event.id })
          )
        )
        .limit(1);

      if (existingEncounter.length > 0) {
        // Update existing encounter
        await this.updateEncounter(existingEncounter[0].id, event);
      } else {
        // Create new encounter
        await this.createEncounter(workspaceId, event);
      }

      // Queue for goal extraction
      await addJob(QUEUE_NAMES.EVENTS_INGESTED, {
        ownerId: 'demo-user-123', // TODO: Get from context
        type: 'calendar',
        data: this.convertToCalendarEvent(event),
        source: 'google_calendar_webhook',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error('Event processing failed:', error);
      throw error;
    }
  }

  private async createEncounter(workspaceId: string, event: any): Promise<void> {
    const { db, encounter, person, claim, personEncounter } = await import('@rhiz/db');

    // Create encounter record
    const [encounterRecord] = await db.insert(encounter).values({
      workspaceId,
      ownerId: 'demo-user-123', // TODO: Get from context
      kind: 'meeting',
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      occurredAt: new Date(event.start.dateTime || event.start.date),
      raw: {
        eventId: event.id,
        attendees: event.attendees || [],
        organizer: event.organizer,
        location: event.location,
        source: 'google_calendar_webhook'
      }
    }).returning();

    // Process attendees
    if (event.attendees) {
      for (const attendee of event.attendees) {
        await this.processAttendee(workspaceId, encounterRecord.id, attendee, event);
      }
    }
  }

  private async updateEncounter(encounterId: string, event: any): Promise<void> {
    const { db, encounter } = await import('@rhiz/db');

    await db
      .update(encounter)
      .set({
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        occurredAt: new Date(event.start.dateTime || event.start.date),
        raw: {
          eventId: event.id,
          attendees: event.attendees || [],
          organizer: event.organizer,
          location: event.location,
          source: 'google_calendar_webhook',
          updatedAt: new Date().toISOString()
        }
      })
      .where(eq(encounter.id, encounterId));
  }

  private async processAttendee(workspaceId: string, encounterId: string, attendee: any, event: any): Promise<void> {
    const { db, person, claim, personEncounter } = await import('@rhiz/db');

    if (!attendee.email) return;

    // Find or create person
    let personRecord = await db
      .select()
      .from(person)
      .where(({ and, eq }) => 
        and(
          eq(person.workspaceId, workspaceId),
          eq(person.primaryEmail, attendee.email)
        )
      )
      .limit(1);

    if (personRecord.length === 0) {
      // Create new person
      [personRecord] = await db.insert(person).values({
        workspaceId,
        ownerId: 'demo-user-123', // TODO: Get from context
        fullName: attendee.displayName || attendee.email.split('@')[0],
        primaryEmail: attendee.email,
      }).returning();
    }

    // Create person-encounter relationship
    await db.insert(personEncounter).values({
      personId: personRecord[0].id,
      encounterId,
      role: attendee.email === event.organizer?.email ? 'organizer' : 'attendee',
    });

    // Create claims from attendee info
    if (attendee.displayName) {
      await db.insert(claim).values({
        workspaceId,
        ownerId: 'demo-user-123', // TODO: Get from context
        subjectType: 'person',
        subjectId: personRecord[0].id,
        key: 'full_name',
        value: attendee.displayName,
        confidence: 95,
        source: 'google_calendar',
        lawfulBasis: 'legitimate_interest',
        provenance: {
          source: 'google_calendar_event',
          eventId: event.id,
          attendeeEmail: attendee.email,
        },
      });
    }

    // Extract company from email domain
    const domain = attendee.email.split('@')[1];
    if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com')) {
      await db.insert(claim).values({
        workspaceId,
        ownerId: 'demo-user-123', // TODO: Get from context
        subjectType: 'person',
        subjectId: personRecord[0].id,
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

  private convertToCalendarEvent(event: any): any {
    return {
      id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      startTime: new Date(event.start.dateTime || event.start.date),
      endTime: new Date(event.end.dateTime || event.end.date),
      attendees: (event.attendees || []).map((att: any) => ({
        email: att.email,
        name: att.displayName,
        responseStatus: att.responseStatus || 'needsAction'
      })),
      organizer: event.organizer ? {
        email: event.organizer.email,
        name: event.organizer.displayName
      } : { email: 'unknown@example.com', name: 'Unknown' },
      location: event.location || '',
      source: 'google'
    };
  }

  async getSyncStatus(workspaceId: string): Promise<any> {
    return this.syncStatus.get(workspaceId) || {
      lastSync: null,
      status: 'inactive',
      errorCount: 0,
    };
  }

  async pauseSync(workspaceId: string): Promise<void> {
    const status = this.syncStatus.get(workspaceId);
    if (status) {
      status.status = 'paused';
    }
  }

  async resumeSync(workspaceId: string): Promise<void> {
    const status = this.syncStatus.get(workspaceId);
    if (status) {
      status.status = 'active';
      status.errorCount = 0;
    }
  }

  private async getAccessToken(workspaceId: string): Promise<string> {
    // TODO: Implement OAuth token retrieval
    return 'mock-access-token';
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
