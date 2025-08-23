import { z } from 'zod';
import { db, crmContactSync, person, integration } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// CRM configuration schema
export const CrmConfig = z.object({
  provider: z.enum(['hubspot', 'salesforce']),
  apiKey: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  redirectUri: z.string().optional(),
});

export type CrmConfig = z.infer<typeof CrmConfig>;

// CRM contact schema
export const CrmContact = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

export type CrmContact = z.infer<typeof CrmContact>;

// CRM integration base class
export abstract class CrmIntegration {
  protected config: CrmConfig;
  protected provider: string;

  constructor(config: CrmConfig) {
    this.config = config;
    this.provider = config.provider;
  }

  // Abstract methods that must be implemented by specific CRM providers
  abstract authenticate(): Promise<boolean>;
  abstract getContacts(): Promise<CrmContact[]>;
  abstract createContact(contact: CrmContact): Promise<string>;
  abstract updateContact(id: string, contact: Partial<CrmContact>): Promise<boolean>;

  // Sync Rhiz people to CRM
  async syncToCrm(workspaceId: string): Promise<{
    success: boolean;
    contactsSynced: number;
    errors: string[];
  }> {
    try {
      const errors: string[] = [];
      let contactsSynced = 0;

      // Get all people from Rhiz
      const rhizPeople = await db
        .select()
        .from(person)
        .where(eq(person.workspaceId, workspaceId));

      for (const rhizPerson of rhizPeople) {
        try {
          // Check if already synced
          const existingSync = await db
            .select()
            .from(crmContactSync)
            .where(
              and(
                eq(crmContactSync.workspaceId, workspaceId),
                eq(crmContactSync.rhizPersonId, rhizPerson.id),
                eq(crmContactSync.crmProvider, this.provider)
              )
            )
            .limit(1);

          if (existingSync.length > 0) {
            // Update existing contact
            const crmContact: Partial<CrmContact> = {
              email: rhizPerson.primaryEmail || undefined,
              firstName: rhizPerson.fullName.split(' ')[0],
              lastName: rhizPerson.fullName.split(' ').slice(1).join(' '),
            };

            const success = await this.updateContact(existingSync[0].crmId, crmContact);
            
            if (success) {
              await db
                .update(crmContactSync)
                .set({
                  lastSyncedAt: new Date(),
                  syncStatus: 'synced',
                })
                .where(eq(crmContactSync.id, existingSync[0].id));
              
              contactsSynced++;
            }
          } else {
            // Create new contact
            const crmContact: CrmContact = {
              id: '', // Will be set by CRM
              email: rhizPerson.primaryEmail || '',
              firstName: rhizPerson.fullName.split(' ')[0],
              lastName: rhizPerson.fullName.split(' ').slice(1).join(' '),
            };

            const crmId = await this.createContact(crmContact);
            
            if (crmId) {
              await db.insert(crmContactSync).values({
                workspaceId,
                crmId,
                rhizPersonId: rhizPerson.id,
                crmProvider: this.provider,
                syncStatus: 'synced',
              });
              
              contactsSynced++;
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync person ${rhizPerson.id}: ${errorMsg}`);
        }
      }

      return {
        success: errors.length === 0,
        contactsSynced,
        errors,
      };

    } catch (error) {
      console.error('Error syncing to CRM:', error);
      return {
        success: false,
        contactsSynced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Sync CRM contacts to Rhiz
  async syncFromCrm(workspaceId: string): Promise<{
    success: boolean;
    peopleCreated: number;
    peopleUpdated: number;
    errors: string[];
  }> {
    try {
      const errors: string[] = [];
      let peopleCreated = 0;
      let peopleUpdated = 0;

      // Get contacts from CRM
      const crmContacts = await this.getContacts();

      for (const crmContact of crmContacts) {
        try {
          // Check if already synced
          const existingSync = await db
            .select()
            .from(crmContactSync)
            .where(
              and(
                eq(crmContactSync.workspaceId, workspaceId),
                eq(crmContactSync.crmId, crmContact.id),
                eq(crmContactSync.crmProvider, this.provider)
              )
            )
            .limit(1);

          if (existingSync.length > 0) {
            // Update existing person
            await db
              .update(person)
              .set({
                fullName: `${crmContact.firstName || ''} ${crmContact.lastName || ''}`.trim(),
                primaryEmail: crmContact.email,
                updatedAt: new Date(),
              })
              .where(eq(person.id, existingSync[0].rhizPersonId));

            await db
              .update(crmContactSync)
              .set({
                lastSyncedAt: new Date(),
                syncStatus: 'synced',
              })
              .where(eq(crmContactSync.id, existingSync[0].id));

            peopleUpdated++;
          } else {
            // Create new person
            const newPerson = await db.insert(person).values({
              workspaceId,
              ownerId: 'demo-user-123', // TODO: Get from context
              fullName: `${crmContact.firstName || ''} ${crmContact.lastName || ''}`.trim(),
              primaryEmail: crmContact.email,
            }).returning();

            if (newPerson.length > 0) {
              await db.insert(crmContactSync).values({
                workspaceId,
                crmId: crmContact.id,
                rhizPersonId: newPerson[0].id,
                crmProvider: this.provider,
                syncStatus: 'synced',
              });

              peopleCreated++;
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync CRM contact ${crmContact.id}: ${errorMsg}`);
        }
      }

      return {
        success: errors.length === 0,
        peopleCreated,
        peopleUpdated,
        errors,
      };

    } catch (error) {
      console.error('Error syncing from CRM:', error);
      return {
        success: false,
        peopleCreated: 0,
        peopleUpdated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
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
            eq(integration.provider, this.provider)
          )
        )
        .limit(1);

      return integrationRecord.length > 0 && integrationRecord[0].status === 'connected';
    } catch (error) {
      console.error('Error checking integration status:', error);
      return false;
    }
  }
}

// HubSpot CRM integration
export class HubSpotCrmIntegration extends CrmIntegration {
  constructor(config: CrmConfig) {
    super(config);
  }

  async authenticate(): Promise<boolean> {
    // HubSpot authentication implementation
    // This would use the HubSpot API client
    return true;
  }

  async getContacts(): Promise<CrmContact[]> {
    // HubSpot contacts fetch implementation
    // This would use the HubSpot API to fetch contacts
    return [];
  }

  async createContact(contact: CrmContact): Promise<string> {
    // HubSpot contact creation implementation
    // This would use the HubSpot API to create a contact
    return 'hubspot-contact-id';
  }

  async updateContact(id: string, contact: Partial<CrmContact>): Promise<boolean> {
    // HubSpot contact update implementation
    // This would use the HubSpot API to update a contact
    return true;
  }
}

// Salesforce CRM integration
export class SalesforceCrmIntegration extends CrmIntegration {
  constructor(config: CrmConfig) {
    super(config);
  }

  async authenticate(): Promise<boolean> {
    // Salesforce authentication implementation
    // This would use the Salesforce API client
    return true;
  }

  async getContacts(): Promise<CrmContact[]> {
    // Salesforce contacts fetch implementation
    // This would use the Salesforce API to fetch contacts
    return [];
  }

  async createContact(contact: CrmContact): Promise<string> {
    // Salesforce contact creation implementation
    // This would use the Salesforce API to create a contact
    return 'salesforce-contact-id';
  }

  async updateContact(id: string, contact: Partial<CrmContact>): Promise<boolean> {
    // Salesforce contact update implementation
    // This would use the Salesforce API to update a contact
    return true;
  }
}

// Factory function to create CRM integration
export function createCrmIntegration(provider: 'hubspot' | 'salesforce'): CrmIntegration | null {
  if (!process.env.FEATURE_CRM_SYNC || process.env.FEATURE_CRM_SYNC !== 'true') {
    console.log('CRM sync feature is disabled');
    return null;
  }

  const config: CrmConfig = {
    provider,
    apiKey: provider === 'hubspot' ? process.env.HUBSPOT_API_KEY : undefined,
    clientId: provider === 'salesforce' ? process.env.SALESFORCE_CLIENT_ID : undefined,
    clientSecret: provider === 'salesforce' ? process.env.SALESFORCE_CLIENT_SECRET : undefined,
    redirectUri: provider === 'salesforce' ? process.env.SALESFORCE_REDIRECT_URI : undefined,
  };

  switch (provider) {
    case 'hubspot':
      return new HubSpotCrmIntegration(config);
    case 'salesforce':
      return new SalesforceCrmIntegration(config);
    default:
      return null;
  }
}
