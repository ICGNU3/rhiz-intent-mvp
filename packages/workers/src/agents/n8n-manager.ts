import { N8nAgent } from './n8n-agent';
import { addJob, QUEUE_NAMES } from '../queue';

export interface N8nIntegrationRequest {
  type: 'create_crm_integration' | 'create_insights_workflow' | 'test_workflow' | 'cleanup_workflows';
  crmType?: 'hubspot' | 'salesforce' | 'pipedrive';
  config?: {
    workspaceId: string;
    userId: string;
    rhizWebhookUrl: string;
    crmCredentials?: any;
  };
  workflowId?: string;
  testData?: any;
  olderThanDays?: number;
}

export class N8nManagerAgent {
  private n8nAgent: N8nAgent;

  constructor() {
    const apiKey = process.env.N8N_API_KEY;
    const baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    
    if (!apiKey) {
      throw new Error('N8N_API_KEY environment variable is required');
    }

    this.n8nAgent = new N8nAgent(apiKey, baseUrl);
  }

  async handleRequest(request: N8nIntegrationRequest) {
    try {
      switch (request.type) {
        case 'create_crm_integration':
          return await this.createCrmIntegration(request.crmType!, request.config!);
        
        case 'create_insights_workflow':
          return await this.createInsightsWorkflow(request.config!);
        
        case 'test_workflow':
          return await this.testWorkflow(request.workflowId!, request.testData);
        
        case 'cleanup_workflows':
          return await this.cleanupOldWorkflows(request.olderThanDays);
        
        default:
          return {
            success: false,
            error: `Unknown request type: ${request.type}`
          };
      }
    } catch (error) {
      console.error('N8nManagerAgent error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createCrmIntegration(crmType: string, config: any) {
    try {
      console.log(`Creating ${crmType} integration for workspace ${config.workspaceId}`);

      const workflow = await this.n8nAgent.createCrmIntegration(crmType, config);

      // Log the integration creation
      await this.logIntegrationEvent({
        type: 'integration_created',
        crmType,
        workspaceId: config.workspaceId,
        userId: config.userId,
        workflowId: workflow.id,
        workflowName: workflow.name
      });

      return {
        success: true,
        workflowId: workflow.id,
        workflowName: workflow.name,
        message: `Created ${crmType} integration workflow`
      };
    } catch (error) {
      console.error(`Failed to create ${crmType} integration:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createInsightsWorkflow(config: any) {
    try {
      console.log(`Creating insights workflow for workspace ${config.workspaceId}`);

      const workflow = await this.n8nAgent.createInsightsWorkflow(config);

      // Log the workflow creation
      await this.logIntegrationEvent({
        type: 'insights_workflow_created',
        crmType: config.crmType,
        workspaceId: config.workspaceId,
        userId: config.userId,
        workflowId: workflow.id,
        workflowName: workflow.name
      });

      return {
        success: true,
        workflowId: workflow.id,
        workflowName: workflow.name,
        message: `Created insights workflow for ${config.crmType}`
      };
    } catch (error) {
      console.error('Failed to create insights workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testWorkflow(workflowId: string, testData: any) {
    try {
      console.log(`Testing workflow ${workflowId}`);

      const result = await this.n8nAgent.testWorkflow(workflowId, testData);

      // Log the test execution
      await this.logIntegrationEvent({
        type: 'workflow_tested',
        workflowId,
        success: result.success,
        error: result.error
      });

      return result;
    } catch (error) {
      console.error(`Failed to test workflow ${workflowId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cleanupOldWorkflows(olderThanDays: number = 30) {
    try {
      console.log(`Cleaning up workflows older than ${olderThanDays} days`);

      const result = await this.n8nAgent.cleanupOldWorkflows(olderThanDays);

      // Log the cleanup
      await this.logIntegrationEvent({
        type: 'workflows_cleaned',
        deletedCount: result.deletedCount,
        olderThanDays
      });

      return result;
    } catch (error) {
      console.error('Failed to cleanup old workflows:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getWorkflowStats(workflowId: string) {
    try {
      return await this.n8nAgent.getWorkflowStats(workflowId);
    } catch (error) {
      console.error(`Failed to get stats for workflow ${workflowId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async listWorkflows() {
    try {
      return await this.n8nAgent.listWorkflows();
    } catch (error) {
      console.error('Failed to list workflows:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteWorkflow(workflowId: string) {
    try {
      console.log(`Deleting workflow ${workflowId}`);

      const result = await this.n8nAgent.deleteWorkflow(workflowId);

      // Log the deletion
      await this.logIntegrationEvent({
        type: 'workflow_deleted',
        workflowId
      });

      return {
        success: true,
        message: `Deleted workflow ${workflowId}`
      };
    } catch (error) {
      console.error(`Failed to delete workflow ${workflowId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Schedule periodic cleanup
  async scheduleCleanup() {
    try {
      // Schedule cleanup every day at 2 AM
      await addJob(QUEUE_NAMES.N8N_CLEANUP, {
        type: 'cleanup_workflows',
        olderThanDays: 30
      }, {
        repeat: {
          pattern: '0 2 * * *' // Every day at 2 AM
        }
      });

      console.log('Scheduled n8n cleanup job');
    } catch (error) {
      console.error('Failed to schedule n8n cleanup:', error);
    }
  }

  // Log integration events for monitoring
  private async logIntegrationEvent(event: any) {
    try {
      await addJob(QUEUE_NAMES.EVENTS, {
        type: 'n8n_integration_event',
        timestamp: new Date().toISOString(),
        ...event
      });
    } catch (error) {
      console.error('Failed to log integration event:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const workflows = await this.n8nAgent.listWorkflows();
      return {
        success: true,
        status: 'healthy',
        workflowCount: workflows.data?.length || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}
