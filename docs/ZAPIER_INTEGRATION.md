# Zapier Integration Guide

Rhiz provides webhook endpoints that can be easily integrated with Zapier to sync data with any CRM or business tool.

## Available Webhooks

### 1. CRM Contact Sync (`/api/webhooks/crm`)

**Purpose**: Sync contacts from your CRM into Rhiz

**Trigger**: When a contact is created/updated/deleted in your CRM
**Action**: Creates or updates people records in Rhiz

**Webhook URL**: `https://your-domain.com/api/webhooks/crm`

**Payload Format**:
```json
{
  "workspaceId": "your-workspace-id",
  "userId": "your-user-id", 
  "action": "contact.created",
  "contact": {
    "id": "crm-contact-id",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "company": "TechCorp",
    "title": "CTO",
    "location": "San Francisco, CA"
  },
  "source": "hubspot"
}
```

**Supported Actions**:
- `contact.created` - New contact in CRM
- `contact.updated` - Contact updated in CRM  
- `contact.deleted` - Contact deleted in CRM

### 2. Insights Webhook (`/api/webhooks/insights`)

**Purpose**: Get relationship insights and suggestions for a person

**Trigger**: When you need insights about a contact
**Action**: Returns relationship data and introduction suggestions

**Webhook URL**: `https://your-domain.com/api/webhooks/insights`

**Payload Format**:
```json
{
  "workspaceId": "your-workspace-id",
  "userId": "your-user-id",
  "personId": "rhiz-person-id",
  "action": "get.insights"
}
```

**Supported Actions**:
- `get.insights` - Get relationship insights for a person
- `get.suggestions` - Get introduction suggestions for a person

## Zapier Setup Examples

### Example 1: HubSpot → Rhiz Contact Sync

1. **Create Zap**
   - Trigger: HubSpot - New Contact
   - Action: Webhooks by Zapier - POST

2. **Configure Webhook**
   - URL: `https://your-domain.com/api/webhooks/crm`
   - Method: POST
   - Data: 
   ```json
   {
     "workspaceId": "{{workspace_id}}",
     "userId": "{{user_id}}",
     "action": "contact.created",
     "contact": {
       "id": "{{hubspot_contact_id}}",
       "email": "{{hubspot_contact_email}}",
       "firstName": "{{hubspot_contact_firstname}}",
       "lastName": "{{hubspot_contact_lastname}}",
       "fullName": "{{hubspot_contact_firstname}} {{hubspot_contact_lastname}}",
       "company": "{{hubspot_contact_company}}",
       "title": "{{hubspot_contact_jobtitle}}",
       "location": "{{hubspot_contact_city}}, {{hubspot_contact_state}}"
     },
     "source": "hubspot"
   }
   ```

### Example 2: Salesforce → Rhiz Contact Sync

1. **Create Zap**
   - Trigger: Salesforce - New Lead
   - Action: Webhooks by Zapier - POST

2. **Configure Webhook**
   - URL: `https://your-domain.com/api/webhooks/crm`
   - Method: POST
   - Data:
   ```json
   {
     "workspaceId": "{{workspace_id}}",
     "userId": "{{user_id}}",
     "action": "contact.created",
     "contact": {
       "id": "{{salesforce_lead_id}}",
       "email": "{{salesforce_lead_email}}",
       "firstName": "{{salesforce_lead_firstname}}",
       "lastName": "{{salesforce_lead_lastname}}",
       "fullName": "{{salesforce_lead_firstname}} {{salesforce_lead_lastname}}",
       "company": "{{salesforce_lead_company}}",
       "title": "{{salesforce_lead_title}}",
       "location": "{{salesforce_lead_city}}, {{salesforce_lead_state}}"
     },
     "source": "salesforce"
   }
   ```

### Example 3: Rhiz Insights → CRM Custom Fields

1. **Create Zap**
   - Trigger: Webhooks by Zapier - Catch Hook
   - Action: HubSpot - Update Contact

2. **Configure Trigger**
   - URL: `https://hooks.zapier.com/hooks/catch/your-webhook-url/`
   - Method: POST

3. **Configure Action**
   - Contact: Find by email
   - Custom Fields:
     - Relationship Strength: `{{insights.relationships.averageStrength}}`
     - Total Connections: `{{insights.relationships.totalConnections}}`
     - Top Connection: `{{insights.relationships.topConnections.0.fullName}}`

## Security Considerations

### Authentication
- All webhooks require `workspaceId` and `userId` for authentication
- Use Row Level Security (RLS) to ensure data isolation
- Consider adding API keys for additional security

### Data Privacy
- Only sync necessary contact information
- Respect GDPR and privacy regulations
- Use `lawfulBasis` field for compliance tracking

### Rate Limiting
- Zapier has built-in rate limiting
- Monitor webhook performance
- Implement retry logic for failed requests

## Error Handling

### Common Error Responses
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid workspace/user
- `404 Not Found` - Person not found
- `500 Internal Server Error` - Server error

### Retry Logic
- Zapier automatically retries failed requests
- Configure retry intervals in Zapier settings
- Monitor webhook logs for debugging

## Best Practices

### 1. Data Mapping
- Map CRM fields to Rhiz fields consistently
- Handle missing or null values gracefully
- Use standardized field names across integrations

### 2. Testing
- Test webhooks with sample data first
- Use Zapier's test mode for validation
- Monitor logs for successful integrations

### 3. Monitoring
- Set up alerts for webhook failures
- Track sync success rates
- Monitor data quality and consistency

### 4. Performance
- Batch operations when possible
- Use efficient database queries
- Implement caching for frequently accessed data

## Troubleshooting

### Webhook Not Firing
- Check Zapier trigger configuration
- Verify webhook URL is correct
- Test with Postman or curl

### Data Not Syncing
- Check payload format
- Verify required fields are present
- Review server logs for errors

### Authentication Issues
- Confirm workspaceId and userId are correct
- Check RLS policies
- Verify user permissions

## Support

For help with Zapier integrations:
1. Check Zapier's documentation
2. Review webhook logs
3. Test with sample data
4. Contact support with specific error messages
