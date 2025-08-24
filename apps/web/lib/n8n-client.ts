import { logger } from './logger';

// n8n webhook URLs and configuration
const N8N_BASE_URL = process.env.N8N_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';
const N8N_WEBHOOK_URL = `${N8N_BASE_URL}/webhook`;

// Webhook IDs for different workflows
export const N8N_WORKFLOWS = {
  ENTITY_ENRICHMENT: process.env.N8N_ENTITY_ENRICHMENT_ID || 'entity-enrichment',
  PERSON_LOOKUP: process.env.N8N_PERSON_LOOKUP_ID || 'person-lookup',
  COMPANY_ENRICHMENT: process.env.N8N_COMPANY_ENRICHMENT_ID || 'company-enrichment',
  CRM_SYNC: process.env.N8N_CRM_SYNC_ID || 'crm-sync',
  EMAIL_FINDER: process.env.N8N_EMAIL_FINDER_ID || 'email-finder',
  SOCIAL_PROFILE_LOOKUP: process.env.N8N_SOCIAL_PROFILE_ID || 'social-profile',
  RELATIONSHIP_ANALYZER: process.env.N8N_RELATIONSHIP_ANALYZER_ID || 'relationship-analyzer',
  INTRODUCTION_DRAFTER: process.env.N8N_INTRODUCTION_DRAFTER_ID || 'introduction-drafter',
  FOLLOW_UP_SCHEDULER: process.env.N8N_FOLLOW_UP_SCHEDULER_ID || 'follow-up-scheduler'
};

// Trigger types for different n8n workflows
export enum N8NTriggerType {
  // Entity enrichment triggers
  NEW_PERSON_DETECTED = 'new_person_detected',
  NEW_COMPANY_DETECTED = 'new_company_detected',
  MISSING_EMAIL = 'missing_email',
  MISSING_LINKEDIN = 'missing_linkedin',
  
  // Interview triggers
  INTERVIEW_COMPLETED = 'interview_completed',
  ENTITIES_EXTRACTED = 'entities_extracted',
  GOAL_IDENTIFIED = 'goal_identified',
  
  // Relationship triggers
  CONNECTION_REQUEST = 'connection_request',
  INTRODUCTION_NEEDED = 'introduction_needed',
  FOLLOW_UP_DUE = 'follow_up_due',
  
  // CRM triggers
  SYNC_TO_CRM = 'sync_to_crm',
  UPDATE_CRM_CONTACT = 'update_crm_contact',
  CREATE_CRM_OPPORTUNITY = 'create_crm_opportunity'
}

interface N8NWebhookPayload {
  workflowId: string;
  trigger: N8NTriggerType;
  data: any;
  metadata?: {
    userId?: string;
    workspaceId?: string;
    conversationId?: string;
    encounterId?: string;
    priority?: 'low' | 'medium' | 'high';
    callback?: string; // URL to send results back to
  };
}

interface N8NResponse {
  success: boolean;
  executionId?: string;
  data?: any;
  error?: string;
}

export class N8NClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = N8N_BASE_URL;
    this.apiKey = N8N_API_KEY;
  }

  /**
   * Trigger a n8n workflow via webhook
   */
  async triggerWorkflow(
    workflowId: string,
    trigger: N8NTriggerType,
    data: any,
    metadata?: N8NWebhookPayload['metadata']
  ): Promise<N8NResponse> {
    try {
      const webhookUrl = `${N8N_WEBHOOK_URL}/${workflowId}`;
      
      const payload: N8NWebhookPayload = {
        workflowId,
        trigger,
        data,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      };

      logger.info('Triggering n8n workflow', {
        component: 'n8n-client',
        workflowId,
        trigger,
        webhookUrl
      });

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        executionId: result.executionId,
        data: result.data
      };
    } catch (error) {
      logger.error('n8n workflow trigger failed', error as Error, {
        component: 'n8n-client',
        workflowId,
        trigger
      });
      
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Enrich a person entity with external data
   */
  async enrichPerson(person: {
    name: string;
    email?: string;
    company?: string;
    role?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.PERSON_LOOKUP,
      N8NTriggerType.NEW_PERSON_DETECTED,
      person,
      metadata
    );
  }

  /**
   * Enrich a company with external data
   */
  async enrichCompany(company: {
    name: string;
    domain?: string;
    industry?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.COMPANY_ENRICHMENT,
      N8NTriggerType.NEW_COMPANY_DETECTED,
      company,
      metadata
    );
  }

  /**
   * Find email address for a person
   */
  async findEmail(person: {
    name: string;
    company?: string;
    domain?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.EMAIL_FINDER,
      N8NTriggerType.MISSING_EMAIL,
      person,
      metadata
    );
  }

  /**
   * Find social profiles for a person
   */
  async findSocialProfiles(person: {
    name: string;
    email?: string;
    company?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.SOCIAL_PROFILE_LOOKUP,
      N8NTriggerType.MISSING_LINKEDIN,
      person,
      metadata
    );
  }

  /**
   * Sync entities to CRM
   */
  async syncToCRM(entities: {
    people: any[];
    companies: any[];
    interactions: any[];
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.CRM_SYNC,
      N8NTriggerType.SYNC_TO_CRM,
      entities,
      metadata
    );
  }

  /**
   * Analyze relationships and suggest connections
   */
  async analyzeRelationships(data: {
    person1: any;
    person2: any;
    context: string;
    goals: any[];
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.RELATIONSHIP_ANALYZER,
      N8NTriggerType.CONNECTION_REQUEST,
      data,
      metadata
    );
  }

  /**
   * Generate introduction draft
   */
  async draftIntroduction(data: {
    from: any;
    to: any;
    context: string;
    mutualConnections?: any[];
    goal?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.INTRODUCTION_DRAFTER,
      N8NTriggerType.INTRODUCTION_NEEDED,
      data,
      metadata
    );
  }

  /**
   * Schedule follow-up reminders
   */
  async scheduleFollowUp(data: {
    person: any;
    context: string;
    followUpDate: string;
    notes?: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.FOLLOW_UP_SCHEDULER,
      N8NTriggerType.FOLLOW_UP_DUE,
      data,
      metadata
    );
  }

  /**
   * Process completed interview for enrichment
   */
  async processInterviewEntities(data: {
    conversationId: string;
    entities: {
      people: any[];
      organizations: any[];
      goals: any[];
    };
    transcript: string[];
    summary: string;
  }, metadata?: N8NWebhookPayload['metadata']): Promise<N8NResponse> {
    return this.triggerWorkflow(
      N8N_WORKFLOWS.ENTITY_ENRICHMENT,
      N8NTriggerType.INTERVIEW_COMPLETED,
      data,
      metadata
    );
  }

  /**
   * Check n8n health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`, {
        method: 'GET',
        headers: this.apiKey ? { 'X-N8N-API-KEY': this.apiKey } : {}
      });
      
      return response.ok;
    } catch (error) {
      logger.error('n8n health check failed', error as Error, {
        component: 'n8n-client'
      });
      return false;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/executions/${executionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-N8N-API-KEY': this.apiKey })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get execution status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Failed to get execution status', error as Error, {
        component: 'n8n-client',
        executionId
      });
      return null;
    }
  }
}

// Export singleton instance
export const n8nClient = new N8NClient();