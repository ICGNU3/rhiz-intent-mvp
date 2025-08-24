#!/usr/bin/env tsx

import { N8nManagerAgent } from '../packages/workers/src/agents/n8n-manager';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
n8n CLI - Manage n8n integrations for Rhiz

Usage:
  n8n-cli <command> [options]

Commands:
  create-hubspot <workspaceId> <userId> <webhookUrl>  - Create HubSpot integration
  create-salesforce <workspaceId> <userId> <webhookUrl> - Create Salesforce integration
  create-pipedrive <workspaceId> <userId> <webhookUrl> - Create Pipedrive integration
  test-workflow <workflowId> [testData]               - Test a workflow
  list-workflows                                      - List all workflows
  cleanup [days]                                      - Clean up old workflows
  health                                              - Check n8n health

Examples:
  n8n-cli create-hubspot workspace-123 user-456 https://rhiz.com/api/webhooks/crm
  n8n-cli test-workflow workflow-789 '{"contact":{"email":"test@example.com"}}'
  n8n-cli cleanup 30
  n8n-cli health
`);
    process.exit(1);
  }

  try {
    const n8nManager = new N8nManagerAgent();

    switch (command) {
      case 'create-hubspot':
      case 'create-salesforce':
      case 'create-pipedrive': {
        const [workspaceId, userId, webhookUrl] = args.slice(1);
        
        if (!workspaceId || !userId || !webhookUrl) {
          console.error('Missing required arguments: workspaceId, userId, webhookUrl');
          process.exit(1);
        }

        const crmType = command.replace('create-', '');
        const result = await n8nManager.createCrmIntegration(crmType, {
          workspaceId,
          userId,
          rhizWebhookUrl: webhookUrl
        });

        if (result.success) {
          console.log(`✅ Created ${crmType} integration workflow: ${result.workflowId}`);
        } else {
          console.error(`❌ Failed to create ${crmType} integration:`, result.error);
          process.exit(1);
        }
        break;
      }

      case 'test-workflow': {
        const [workflowId, testDataStr] = args.slice(1);
        
        if (!workflowId) {
          console.error('Missing required argument: workflowId');
          process.exit(1);
        }

        let testData = {};
        if (testDataStr) {
          try {
            testData = JSON.parse(testDataStr);
          } catch (error) {
            console.error('Invalid JSON in testData');
            process.exit(1);
          }
        }

        const result = await n8nManager.testWorkflow(workflowId, testData);

        if (result.success) {
          console.log(`✅ Workflow test successful:`, result.result);
        } else {
          console.error(`❌ Workflow test failed:`, result.error);
          process.exit(1);
        }
        break;
      }

      case 'list-workflows': {
        const result = await n8nManager.listWorkflows();

        if (result.success) {
          console.log('📋 Workflows:');
          result.data.forEach((workflow: any) => {
            console.log(`  - ${workflow.name} (${workflow.id}) - ${workflow.active ? 'Active' : 'Inactive'}`);
          });
        } else {
          console.error(`❌ Failed to list workflows:`, result.error);
          process.exit(1);
        }
        break;
      }

      case 'cleanup': {
        const days = parseInt(args[1]) || 30;
        const result = await n8nManager.cleanupOldWorkflows(days);

        if (result.success) {
          console.log(`✅ Cleaned up ${result.deletedCount} old workflows`);
        } else {
          console.error(`❌ Failed to cleanup workflows:`, result.error);
          process.exit(1);
        }
        break;
      }

      case 'health': {
        const result = await n8nManager.healthCheck();

        if (result.success) {
          console.log(`✅ n8n is healthy - ${result.workflowCount} workflows`);
        } else {
          console.error(`❌ n8n is unhealthy:`, result.error);
          process.exit(1);
        }
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('CLI error:', error);
    process.exit(1);
  }
}

// Run the CLI
main().catch(console.error);
