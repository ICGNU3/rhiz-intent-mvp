export class N8nAgent {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'http://localhost:5678') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createWorkflow(workflowData: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async executeWorkflow(workflowId: string, data: any = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error(`Failed to execute workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async listWorkflows() {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list workflows: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkflow(workflowId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async updateWorkflow(workflowId: string, workflowData: any) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteWorkflow(workflowId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workflow: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkflowExecutions(workflowId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/workflows/${workflowId}/executions`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get workflow executions: ${response.statusText}`);
    }

    return response.json();
  }

  async getExecution(executionId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/executions/${executionId}`, {
      headers: {
        'X-N8N-API-KEY': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get execution: ${response.statusText}`);
    }

    return response.json();
  }

  // Create CRM integration workflow
  async createCrmIntegration(crmType: string, config: {
    workspaceId: string;
    userId: string;
    rhizWebhookUrl: string;
    crmCredentials?: any;
  }) {
    const workflowTemplate = this.getCrmWorkflowTemplate(crmType, config);
    return this.createWorkflow(workflowTemplate);
  }

  private getCrmWorkflowTemplate(crmType: string, config: any) {
    const templates: Record<string, any> = {
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
              url: `${config.rhizWebhookUrl}`,
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
        name: `Salesforce to Rhiz Sync - ${config.workspaceId}`,
        active: true,
        nodes: [
          {
            id: "salesforce-trigger",
            name: "Salesforce Lead Created",
            type: "n8n-nodes-base.salesforceTrigger",
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              resource: "lead",
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
                const lead = $input.first().json;
                return {
                  workspaceId: "${config.workspaceId}",
                  userId: "${config.userId}",
                  action: "contact.created",
                  contact: {
                    id: lead.Id,
                    email: lead.Email,
                    firstName: lead.FirstName,
                    lastName: lead.LastName,
                    fullName: \`\${lead.FirstName} \${lead.LastName}\`,
                    company: lead.Company,
                    title: lead.Title,
                    location: \`\${lead.City}, \${lead.State}\`,
                  },
                  source: "salesforce"
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
              url: `${config.rhizWebhookUrl}`,
              headers: {
                "Content-Type": "application/json"
              },
              body: "={{ $json }}"
            }
          }
        ],
        connections: {
          "Salesforce Lead Created": {
            main: [["Transform to Rhiz Format"]]
          },
          "Transform to Rhiz Format": {
            main: [["Send to Rhiz"]]
          }
        }
      },
      pipedrive: {
        name: `Pipedrive to Rhiz Sync - ${config.workspaceId}`,
        active: true,
        nodes: [
          {
            id: "pipedrive-trigger",
            name: "Pipedrive Person Created",
            type: "n8n-nodes-base.pipedriveTrigger",
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              resource: "person",
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
                const person = $input.first().json;
                return {
                  workspaceId: "${config.workspaceId}",
                  userId: "${config.userId}",
                  action: "contact.created",
                  contact: {
                    id: person.id,
                    email: person.email[0]?.value || '',
                    firstName: person.first_name,
                    lastName: person.last_name,
                    fullName: \`\${person.first_name} \${person.last_name}\`,
                    company: person.org_name,
                    title: person.title,
                    location: \`\${person.location}\`,
                  },
                  source: "pipedrive"
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
              url: `${config.rhizWebhookUrl}`,
              headers: {
                "Content-Type": "application/json"
              },
              body: "={{ $json }}"
            }
          }
        ],
        connections: {
          "Pipedrive Person Created": {
            main: [["Transform to Rhiz Format"]]
          },
          "Transform to Rhiz Format": {
            main: [["Send to Rhiz"]]
          }
        }
      }
    };

    return templates[crmType] || templates.hubspot;
  }

  // Create insights workflow (Rhiz → CRM)
  async createInsightsWorkflow(config: {
    workspaceId: string;
    userId: string;
    rhizWebhookUrl: string;
    crmType: string;
    crmCredentials?: any;
  }) {
    const workflowTemplate = {
      name: `Rhiz Insights to ${config.crmType} - ${config.workspaceId}`,
      active: true,
      nodes: [
        {
          id: "cron-trigger",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.cron",
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            rule: {
              interval: [{
                field: "hour",
                expression: "*/1"
              }]
            }
          }
        },
        {
          id: "get-contacts",
          name: `Get ${config.crmType} Contacts`,
          type: `n8n-nodes-base.${config.crmType}`,
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            resource: "contact",
            operation: "getAll"
          }
        },
        {
          id: "get-insights",
          name: "Get Rhiz Insights",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            method: "POST",
            url: `${config.rhizWebhookUrl}`,
            headers: {
              "Content-Type": "application/json"
            },
            body: "={{ { workspaceId: \"" + config.workspaceId + "\", userId: \"" + config.userId + "\", personId: $json.id, action: \"get.insights\" } }}"
          }
        },
        {
          id: "update-crm",
          name: `Update ${config.crmType} Contact`,
          type: `n8n-nodes-base.${config.crmType}`,
          typeVersion: 1,
          position: [900, 300],
          parameters: {
            resource: "contact",
            operation: "update",
            contactId: "={{ $json.id }}",
            updateFields: {
              customFields: {
                relationship_strength: "={{ $('Get Rhiz Insights').item.json.insights.relationships.averageStrength }}",
                total_connections: "={{ $('Get Rhiz Insights').item.json.insights.relationships.totalConnections }}"
              }
            }
          }
        }
      ],
      connections: {
        "Schedule Trigger": {
          main: [["Get " + config.crmType + " Contacts"]]
        },
        ["Get " + config.crmType + " Contacts"]: {
          main: [["Get Rhiz Insights"]]
        },
        "Get Rhiz Insights": {
          main: [["Update " + config.crmType + " Contact"]]
        }
      }
    };

    return this.createWorkflow(workflowTemplate);
  }

  // Test workflow execution
  async testWorkflow(workflowId: string, testData: any) {
    try {
      const result = await this.executeWorkflow(workflowId, testData);
      return {
        success: true,
        result,
        message: 'Workflow executed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Workflow execution failed'
      };
    }
  }

  // Clean up old workflows
  async cleanupOldWorkflows(olderThanDays: number = 30) {
    try {
      const workflows = await this.listWorkflows();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let deletedCount = 0;
      for (const workflow of workflows.data) {
        const createdAt = new Date(workflow.createdAt);
        if (createdAt < cutoffDate) {
          await this.deleteWorkflow(workflow.id);
          deletedCount++;
          console.log(`Deleted old workflow: ${workflow.name}`);
        }
      }

      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} old workflows`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to cleanup old workflows'
      };
    }
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId: string) {
    try {
      const executions = await this.getWorkflowExecutions(workflowId);
      const workflow = await this.getWorkflow(workflowId);

      const stats = {
        workflowId,
        workflowName: workflow.name,
        totalExecutions: executions.data.length,
        successfulExecutions: executions.data.filter((e: any) => e.finished).length,
        failedExecutions: executions.data.filter((e: any) => e.finished && e.stoppedAt).length,
        lastExecution: executions.data[0]?.startedAt || null,
        averageExecutionTime: 0
      };

      // Calculate average execution time
      const finishedExecutions = executions.data.filter((e: any) => e.finished && e.stoppedAt);
      if (finishedExecutions.length > 0) {
        const totalTime = finishedExecutions.reduce((sum: number, e: any) => {
          const start = new Date(e.startedAt).getTime();
          const end = new Date(e.stoppedAt).getTime();
          return sum + (end - start);
        }, 0);
        stats.averageExecutionTime = totalTime / finishedExecutions.length;
      }

      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
