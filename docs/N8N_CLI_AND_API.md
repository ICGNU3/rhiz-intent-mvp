# n8n CLI and API Guide for AI Agents

n8n provides powerful CLI and API capabilities that allow you to automate workflows programmatically without using the web interface.

## n8n CLI

### Installation
```bash
# Install n8n CLI globally
npm install n8n -g

# Or use npx
npx n8n
```

### Basic CLI Commands

```bash
# Start n8n server
n8n start

# Start with specific config
n8n start --tunnel

# Execute workflow from file
n8n execute --file workflow.json

# Execute workflow by ID
n8n execute --id workflow-id

# List all workflows
n8n list workflows

# Export workflow
n8n export:workflow --id workflow-id --output workflow.json

# Import workflow
n8n import:workflow --input workflow.json

# Create workflow from template
n8n create:workflow --template hubspot-to-rhiz
```

## n8n REST API

n8n exposes a REST API that allows full programmatic control.

### Authentication
```bash
# Get API key from n8n settings
# Or set environment variable
export N8N_API_KEY=your-api-key
```

### API Endpoints

#### Workflows
```bash
# List all workflows
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  http://localhost:5678/api/v1/workflows

# Get specific workflow
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  http://localhost:5678/api/v1/workflows/{id}

# Create workflow
curl -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow.json \
  http://localhost:5678/api/v1/workflows

# Update workflow
curl -X PUT -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow.json \
  http://localhost:5678/api/v1/workflows/{id}

# Delete workflow
curl -X DELETE -H "X-N8N-API-KEY: $N8N_API_KEY" \
  http://localhost:5678/api/v1/workflows/{id}
```

#### Execute Workflows
```bash
# Execute workflow with data
curl -X POST -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"data": {"contact": {"email": "test@example.com"}}}' \
  http://localhost:5678/api/v1/workflows/{id}/execute
```

## Programmatic Workflow Creation

### Create Workflow via API

```javascript
// Create HubSpot to Rhiz workflow programmatically
const workflow = {
  name: "HubSpot to Rhiz Contact Sync",
  active: true,
  nodes: [
    {
      id: "hubspot-trigger",
      name: "HubSpot Trigger",
      type: "n8n-nodes-base.hubspotTrigger",
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        resource: "contact",
        operation: "create"
      }
    },
    {
      id: "transform-data",
      name: "Transform Data",
      type: "n8n-nodes-base.function",
      typeVersion: 1,
      position: [460, 300],
      parameters: {
        functionCode: `
          const contact = $input.first().json;
          
          return {
            workspaceId: "your-workspace-id",
            userId: "your-user-id",
            action: "contact.created",
            contact: {
              id: contact.id,
              email: contact.properties.email,
              firstName: contact.properties.firstname,
              lastName: contact.properties.lastname,
              fullName: \`\${contact.properties.firstname} \${contact.properties.lastname}\`,
              company: contact.properties.company,
              title: contact.properties.jobtitle,
              location: \`\${contact.properties.city}, \${contact.properties.state}\`,
            },
            source: "hubspot"
          };
        `
      }
    },
    {
      id: "rhiz-webhook",
      name: "Rhiz Webhook",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        method: "POST",
        url: "https://your-rhiz-domain.com/api/webhooks/crm",
        headers: {
          "Content-Type": "application/json"
        },
        body: "={{ $json }}"
      }
    }
  ],
  connections: {
    "HubSpot Trigger": {
      main: [["Transform Data"]]
    },
    "Transform Data": {
      main: [["Rhiz Webhook"]]
    }
  }
};

// Create workflow via API
const response = await fetch('http://localhost:5678/api/v1/workflows', {
  method: 'POST',
  headers: {
    'X-N8N-API-KEY': process.env.N8N_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(workflow)
});

const createdWorkflow = await response.json();
console.log('Created workflow:', createdWorkflow.id);
```

## AI Agent Integration

### Automated Workflow Management

```javascript
// AI Agent class for managing n8n workflows
class N8nAgent {
  constructor(apiKey, baseUrl = 'http://localhost:5678') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createWorkflow(workflowData) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });
    return response.json();
  }

  async executeWorkflow(workflowId, data = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });
    return response.json();
  }

  async listWorkflows() {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });
    return response.json();
  }

  async deleteWorkflow(workflowId) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });
    return response.json();
  }

  // Create CRM integration workflow
  async createCrmIntegration(crmType, config) {
    const workflowTemplate = this.getCrmWorkflowTemplate(crmType, config);
    return this.createWorkflow(workflowTemplate);
  }

  getCrmWorkflowTemplate(crmType, config) {
    const templates = {
      hubspot: {
        name: `HubSpot to Rhiz Sync - ${config.workspaceId}`,
        active: true,
        nodes: [
          {
            id: "hubspot-trigger",
            name: "HubSpot Contact Created",
            type: "n8n-nodes-base.hubspotTrigger",
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              resource: "contact",
              operation: "create"
            }
          },
          {
            id: "transform",
            name: "Transform to Rhiz Format",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [460, 300],
            parameters: {
              functionCode: `
                const contact = $input.first().json;
                return {
                  workspaceId: "${config.workspaceId}",
                  userId: "${config.userId}",
                  action: "contact.created",
                  contact: {
                    id: contact.id,
                    email: contact.properties.email,
                    firstName: contact.properties.firstname,
                    lastName: contact.properties.lastname,
                    fullName: \`\${contact.properties.firstname} \${contact.properties.lastname}\`,
                    company: contact.properties.company,
                    title: contact.properties.jobtitle,
                    location: \`\${contact.properties.city}, \${contact.properties.state}\`,
                  },
                  source: "hubspot"
                };
              `
            }
          },
          {
            id: "rhiz-webhook",
            name: "Send to Rhiz",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 1,
            position: [680, 300],
            parameters: {
              method: "POST",
              url: "${config.rhizWebhookUrl}",
              headers: {
                "Content-Type": "application/json"
              },
              body: "={{ $json }}"
            }
          }
        ],
        connections: {
          "HubSpot Contact Created": {
            main: [["Transform to Rhiz Format"]]
          },
          "Transform to Rhiz Format": {
            main: [["Send to Rhiz"]]
          }
        }
      },
      salesforce: {
        // Similar template for Salesforce
      }
    };

    return templates[crmType] || templates.hubspot;
  }
}

// Usage example
const n8nAgent = new N8nAgent(process.env.N8N_API_KEY);

// Create HubSpot integration for a user
const workflow = await n8nAgent.createCrmIntegration('hubspot', {
  workspaceId: 'user-workspace-id',
  userId: 'user-id',
  rhizWebhookUrl: 'https://rhiz.com/api/webhooks/crm'
});

console.log('Created workflow:', workflow.id);
```

## Automated Setup Scripts

### Setup n8n with Docker

```bash
#!/bin/bash
# setup-n8n.sh

# Create n8n directory
mkdir -p ~/n8n
cd ~/n8n

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
EOF

# Start n8n
docker-compose up -d

# Wait for n8n to start
echo "Waiting for n8n to start..."
sleep 30

# Get API key (you'll need to set this up in the UI first)
echo "Please set up your API key in the n8n UI and update the script"
```

### Automated Workflow Creation

```bash
#!/bin/bash
# create-rhiz-integrations.sh

N8N_API_KEY="your-api-key"
N8N_URL="http://localhost:5678"

# Create HubSpot integration
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @hubspot-workflow.json \
  "$N8N_URL/api/v1/workflows"

# Create Salesforce integration
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @salesforce-workflow.json \
  "$N8N_URL/api/v1/workflows"

echo "Created Rhiz integrations"
```

## Integration with Rhiz AI Agents

### AI Agent for Workflow Management

```typescript
// packages/workers/src/agents/n8n-manager.ts
import { N8nAgent } from './n8n-agent';

export class N8nManagerAgent {
  private n8nAgent: N8nAgent;

  constructor() {
    this.n8nAgent = new N8nAgent(process.env.N8N_API_KEY);
  }

  async handleIntegrationRequest(request: {
    type: 'create_crm_integration';
    crmType: 'hubspot' | 'salesforce' | 'pipedrive';
    config: {
      workspaceId: string;
      userId: string;
      rhizWebhookUrl: string;
    };
  }) {
    try {
      const workflow = await this.n8nAgent.createCrmIntegration(
        request.crmType,
        request.config
      );

      return {
        success: true,
        workflowId: workflow.id,
        message: `Created ${request.crmType} integration workflow`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async executeWorkflow(workflowId: string, data: any) {
    try {
      const result = await this.n8nAgent.executeWorkflow(workflowId, data);
      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async cleanupOldWorkflows(olderThanDays: number = 30) {
    try {
      const workflows = await this.n8nAgent.listWorkflows();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      for (const workflow of workflows.data) {
        const createdAt = new Date(workflow.createdAt);
        if (createdAt < cutoffDate) {
          await this.n8nAgent.deleteWorkflow(workflow.id);
          console.log(`Deleted old workflow: ${workflow.name}`);
        }
      }

      return {
        success: true,
        message: 'Cleaned up old workflows'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

## Environment Variables

```bash
# .env
N8N_API_KEY=your-n8n-api-key
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=https://your-n8n-domain.com
```

## Monitoring and Logging

```javascript
// Monitor n8n workflows
class N8nMonitor {
  async getWorkflowExecutions(workflowId) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/workflows/${workflowId}/executions`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );
    return response.json();
  }

  async getExecutionLogs(executionId) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/executions/${executionId}`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );
    return response.json();
  }
}
```

This setup allows you to fully automate n8n workflow creation and management through AI agents, without any manual UI interaction required.
