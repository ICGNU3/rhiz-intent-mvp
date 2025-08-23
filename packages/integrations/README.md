# Rhiz Integrations

This package provides safe, minimal integrations to extend Rhiz into daily workflows.

## Available Integrations

### 1. Slack Integration

**Features:**
- `/rhiz intro` command to show top 3 ready introductions with accept/skip buttons
- Push notifications for new suggestions, accepted intros, and goal creation
- Slack user ID storage in workspace members
- Event webhook handling at `/api/slack/events`

**Configuration:**
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token  # Optional, for socket mode
```

**Usage:**
```typescript
import { createSlackIntegration } from '@rhiz/integrations'

const slack = createSlackIntegration()
if (slack) {
  await slack.start(3000)
}
```

### 2. Google Calendar Integration

**Features:**
- Read-only Google Calendar access (events + attendees only)
- ICS file import support
- Automatic attendee parsing into Encounters and People
- OAuth token encryption at rest
- Explicit exclusion of email sending, calendar editing, and Gmail access

**Configuration:**
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

**Usage:**
```typescript
import { createGoogleCalendarIntegration } from '@rhiz/integrations'

const googleCalendar = createGoogleCalendarIntegration()
if (googleCalendar) {
  const authUrl = googleCalendar.generateAuthUrl(workspaceId)
  // Redirect user to authUrl for OAuth flow
}
```

### 3. CRM Integration (HubSpot/Salesforce)

**Features:**
- Bidirectional contact sync with HubSpot and Salesforce
- Contact mapping between Rhiz People and CRM contacts
- Feature flag controlled: `FEATURE_CRM_SYNC=true`
- Sync status tracking and error handling

**Configuration:**
```env
FEATURE_CRM_SYNC=true
HUBSPOT_API_KEY=your-hubspot-api-key
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
SALESFORCE_REDIRECT_URI=your-salesforce-redirect-uri
```

**Usage:**
```typescript
import { createCrmIntegration } from '@rhiz/integrations'

const hubspot = createCrmIntegration('hubspot')
if (hubspot) {
  const result = await hubspot.syncToCrm(workspaceId)
}
```

## Provider Extensions

The integrations also extend the core enrichment providers:

### SlackProvider
- Surfaces recent mentions and Slack DMs (if token present)
- Respects lawful basis and provenance stamping

### GoogleProvider
- Enriches with Calendar event metadata
- Provides meeting frequency and last interaction data

## Notification System

The `NotificationAgent` listens to events and dispatches notifications:

- `suggestions.ready` - New introduction suggestions
- `suggestions.accepted` - Accepted introductions
- `goals.created` - New goals created

Notifications are sent to:
- Slack (if connected)
- In-app notifications (stored in database)

## Database Schema

The integrations add several new tables:

- `integration` - Integration status and configuration
- `oauth_token` - Encrypted OAuth tokens
- `crm_contact_sync` - CRM contact mapping
- `workspace_member.slack_user_id` - Slack user ID storage

## Security & Privacy

### Data Protection
- OAuth tokens encrypted at rest using AES-256-GCM
- Row-level security (RLS) on all integration tables
- Multi-tenant data isolation

### Safe Scopes
- Google Calendar: Read-only access only
- Slack: Minimal scopes for notifications and commands
- CRM: Contact sync only, no email sending

### Exclusions
- No Gmail server-side integration
- No calendar editing permissions
- No unauthorized data collection
- No LinkedIn automation or scraping

## API Endpoints

### Slack
- `POST /api/slack/events` - Handle Slack webhooks

### Google Calendar
- `GET /api/integrations/google/calendar/import` - Generate OAuth URL
- `POST /api/integrations/google/calendar/import` - Handle OAuth callback
- `PUT /api/integrations/google/calendar/import` - Manual sync
- `DELETE /api/integrations/google/calendar/import` - Disconnect

### CRM
- `POST /api/integrations/crm/sync` - Sync contacts
- `GET /api/integrations/crm/sync` - Get sync status
- `PUT /api/integrations/crm/sync` - Connect CRM
- `DELETE /api/integrations/crm/sync` - Disconnect

## Testing

Run the integration tests:

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

## Demo Data

The seed data includes demo integration records:

- Connected Slack workspace
- Connected Google Calendar
- Disconnected HubSpot integration
- Sample OAuth tokens and sync records

## Environment Variables

Required for all integrations:

```env
# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret

# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=your-redirect-uri

# CRM (optional)
FEATURE_CRM_SYNC=true
HUBSPOT_API_KEY=your-hubspot-api-key
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
SALESFORCE_REDIRECT_URI=your-salesforce-redirect-uri
```

## Contributing

When adding new integrations:

1. Follow the existing pattern with factory functions
2. Include proper error handling and logging
3. Add comprehensive tests
4. Document security considerations
5. Include demo data in seed files
6. Respect lawful basis and provenance requirements
