# n8n Integration Guide

n8n is a free, open-source alternative to Zapier that can handle all your CRM integrations with Rhiz.

## Why n8n?

- **Free forever** - No usage limits or per-task charges
- **Self-hosted** - Your data stays with you
- **200+ integrations** - Including all major CRMs
- **Visual workflow builder** - Easy to set up and maintain
- **Custom nodes** - Extend with your own logic
- **Webhook support** - Perfect for Rhiz integration

## Installation

### Option 1: Local Installation
```bash
# Install n8n globally
npm install n8n -g

# Start n8n
n8n start

# Access at http://localhost:5678
```

### Option 2: Docker
```bash
# Run with Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option 3: Cloud Deployment
- **Railway**: One-click deployment
- **Heroku**: Easy deployment
- **DigitalOcean**: Droplet with Docker

## Rhiz Integration Workflows

### Workflow 1: HubSpot → Rhiz Contact Sync

**Trigger**: HubSpot - Contact Created
**Action**: HTTP Request to Rhiz

**Setup Steps**:
1. Create new workflow in n8n
2. Add HubSpot trigger node
3. Configure HubSpot connection
4. Add HTTP Request node
5. Configure Rhiz webhook

**HTTP Request Configuration**:
```
Method: POST
URL: https://your-rhiz-domain.com/api/webhooks/crm
Headers: 
  Content-Type: application/json
Body:
{
  "workspaceId": "{{$json.workspaceId}}",
  "userId": "{{$json.userId}}",
  "action": "contact.created",
  "contact": {
    "id": "{{$json.id}}",
    "email": "{{$json.properties.email}}",
    "firstName": "{{$json.properties.firstname}}",
    "lastName": "{{$json.properties.lastname}}",
    "fullName": "{{$json.properties.firstname}} {{$json.properties.lastname}}",
    "company": "{{$json.properties.company}}",
    "title": "{{$json.properties.jobtitle}}",
    "location": "{{$json.properties.city}}, {{$json.properties.state}}"
  },
  "source": "hubspot"
}
```

### Workflow 2: Salesforce → Rhiz Contact Sync

**Trigger**: Salesforce - Lead Created
**Action**: HTTP Request to Rhiz

**HTTP Request Configuration**:
```
Method: POST
URL: https://your-rhiz-domain.com/api/webhooks/crm
Body:
{
  "workspaceId": "{{$json.workspaceId}}",
  "userId": "{{$json.userId}}",
  "action": "contact.created",
  "contact": {
    "id": "{{$json.Id}}",
    "email": "{{$json.Email}}",
    "firstName": "{{$json.FirstName}}",
    "lastName": "{{$json.LastName}}",
    "fullName": "{{$json.FirstName}} {{$json.LastName}}",
    "company": "{{$json.Company}}",
    "title": "{{$json.Title}}",
    "location": "{{$json.City}}, {{$json.State}}"
  },
  "source": "salesforce"
}
```

### Workflow 3: Rhiz Insights → CRM Custom Fields

**Trigger**: Schedule (every hour)
**Action**: Get insights from Rhiz, update CRM

**Setup Steps**:
1. Add Cron node (trigger every hour)
2. Add HTTP Request to get Rhiz insights
3. Add CRM update node

**Get Insights Request**:
```
Method: POST
URL: https://your-rhiz-domain.com/api/webhooks/insights
Body:
{
  "workspaceId": "{{$json.workspaceId}}",
  "userId": "{{$json.userId}}",
  "personId": "{{$json.personId}}",
  "action": "get.insights"
}
```

## Data Transformation

### Using n8n's Function Node

Add a Function node between trigger and action to transform data:

```javascript
// Transform HubSpot data to Rhiz format
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
    fullName: `${contact.properties.firstname} ${contact.properties.lastname}`,
    company: contact.properties.company,
    title: contact.properties.jobtitle,
    location: `${contact.properties.city}, ${contact.properties.state}`,
  },
  source: "hubspot"
};
```

### Using n8n's Set Node

Use the Set node for simple field mapping:
- Map `{{$json.properties.email}}` to `contact.email`
- Map `{{$json.properties.company}}` to `contact.company`

## Error Handling

### Retry Logic
Configure HTTP Request node:
- **Retry on Fail**: Enabled
- **Max Retries**: 3
- **Retry Delay**: 1000ms

### Error Notifications
Add Error Trigger node to send notifications:
- Slack notification on failure
- Email alert for critical errors
- Log to external service

## Scheduling

### Real-time Sync
- Use webhook triggers for immediate sync
- Configure CRM webhooks to call n8n

### Batch Sync
- Use Cron node for scheduled syncs
- Run every hour, day, or custom interval
- Process multiple contacts in batches

## Monitoring

### n8n Dashboard
- View workflow execution history
- Monitor success/failure rates
- Debug failed executions

### External Monitoring
- Send metrics to monitoring service
- Alert on workflow failures
- Track sync performance

## Security

### Authentication
- Use API keys for Rhiz webhooks
- Store credentials securely in n8n
- Use environment variables for sensitive data

### Data Privacy
- n8n runs on your infrastructure
- No data sent to external services
- Full control over data flow

## Advanced Features

### Conditional Logic
Use IF nodes to handle different scenarios:
```javascript
// Only sync contacts with email
if ($json.properties.email) {
  return $json;
} else {
  return null; // Skip this contact
}
```

### Data Filtering
Use Filter nodes to process only relevant data:
- Filter by contact source
- Filter by company size
- Filter by location

### Batch Processing
Use Split In Batches node to process multiple contacts:
- Process 10 contacts at a time
- Reduce API rate limiting
- Improve performance

## Troubleshooting

### Common Issues

**Webhook Not Firing**:
- Check n8n webhook URL
- Verify CRM webhook configuration
- Test with Postman

**Data Mapping Errors**:
- Check field names in CRM
- Verify JSON structure
- Use n8n's debug mode

**Authentication Issues**:
- Verify API credentials
- Check token expiration
- Test connection in n8n

### Debug Mode
Enable debug mode in n8n to see:
- Input/output data for each node
- Execution flow
- Error details

## Best Practices

### 1. Workflow Organization
- Use descriptive names for workflows
- Add comments to complex nodes
- Group related workflows in folders

### 2. Data Validation
- Validate data before sending to Rhiz
- Handle missing or null values
- Log validation errors

### 3. Performance
- Use batch processing for large datasets
- Implement rate limiting
- Monitor execution times

### 4. Maintenance
- Regular workflow testing
- Update CRM field mappings
- Monitor for API changes

## Support

### n8n Resources
- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [n8n GitHub](https://github.com/n8n-io/n8n)

### Rhiz Integration Help
- Check webhook logs
- Test with sample data
- Review error responses
