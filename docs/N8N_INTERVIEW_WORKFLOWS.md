# n8n Interview Processing Workflows

This document outlines the n8n workflows that enhance the interview system with real-time enrichment and background processing.

## 🎯 Overview

The interview agent now integrates with n8n to provide:
- **Real-time entity enrichment** during conversations
- **Background relationship analysis** after interviews
- **Automated data enhancement** from external sources
- **CRM synchronization** of discovered entities
- **Introduction drafting** based on goals and connections

## 🔧 Required n8n Workflows

### 1. Entity Enrichment Workflow (`entity-enrichment`)

**Trigger**: Webhook (`/webhook/entity-enrichment`)
**Purpose**: Process completed interview data with comprehensive enrichment

**Nodes**:
1. **Webhook** - Receives interview completion data
2. **Set Variables** - Extract people, organizations, goals
3. **Split In Batches** - Process entities in parallel
4. **HTTP Request (Clearbit)** - Enrich person/company data
5. **HTTP Request (LinkedIn)** - Find professional profiles
6. **AI Task (OpenAI)** - Generate relationship insights
7. **HTTP Request (Rhiz)** - Send enriched data back via webhook

**Input Schema**:
```json
{
  "conversationId": "uuid",
  "entities": {
    "people": [{"name": "John Doe", "company": "TechCorp", "role": "VP Engineering"}],
    "organizations": [{"name": "TechCorp", "industry": "Technology"}],
    "goals": [{"type": "raise_seed", "description": "Raise $2M Series A"}]
  },
  "transcript": ["User: I met with John...", "Agent: Tell me more..."],
  "summary": "Interview summary text"
}
```

### 2. Person Lookup Workflow (`person-lookup`)

**Trigger**: Webhook (`/webhook/person-lookup`)
**Purpose**: Real-time person enrichment during interviews

**Nodes**:
1. **Webhook** - Receives person data
2. **Switch** - Route by available data (email vs name+company)
3. **HTTP Request (Clearbit Person)** - Enrich by email
4. **HTTP Request (LinkedIn)** - Search by name+company
5. **HTTP Request (Apollo)** - Find contact info
6. **Merge** - Combine enrichment results
7. **HTTP Request (Rhiz)** - Return enriched person data

### 3. Company Enrichment Workflow (`company-enrichment`)

**Trigger**: Webhook (`/webhook/company-enrichment`)
**Purpose**: Enrich organization data with industry, size, etc.

**Nodes**:
1. **Webhook** - Receives company data
2. **HTTP Request (Clearbit Company)** - Get company details
3. **HTTP Request (Crunchbase)** - Get funding/industry info
4. **AI Task (OpenAI)** - Categorize and analyze
5. **HTTP Request (Rhiz)** - Return enriched company data

### 4. Email Finder Workflow (`email-finder`)

**Trigger**: Webhook (`/webhook/email-finder`)
**Purpose**: Find email addresses for contacts

**Nodes**:
1. **Webhook** - Receives person name + company
2. **HTTP Request (Hunter.io)** - Find email patterns
3. **HTTP Request (Apollo)** - Search contact database
4. **Email Validator** - Verify email exists
5. **HTTP Request (Rhiz)** - Return found email

### 5. Social Profile Lookup (`social-profile`)

**Trigger**: Webhook (`/webhook/social-profile`)
**Purpose**: Find LinkedIn, Twitter, GitHub profiles

**Nodes**:
1. **Webhook** - Receives person data
2. **HTTP Request (LinkedIn Search)** - Find LinkedIn profile
3. **HTTP Request (Twitter Search)** - Find Twitter handle
4. **HTTP Request (GitHub Search)** - Find GitHub profile
5. **HTTP Request (Rhiz)** - Return social profiles

### 6. Relationship Analyzer (`relationship-analyzer`)

**Trigger**: Webhook (`/webhook/relationship-analyzer`)
**Purpose**: Analyze connections between people for suggestions

**Nodes**:
1. **Webhook** - Receives two people + context + goals
2. **AI Task (OpenAI)** - Analyze mutual value/fit
3. **HTTP Request (LinkedIn)** - Check mutual connections
4. **AI Task (OpenAI)** - Generate introduction reasoning
5. **HTTP Request (Rhiz)** - Create suggestion with score

### 7. Introduction Drafter (`introduction-drafter`)

**Trigger**: Webhook (`/webhook/introduction-drafter`)
**Purpose**: Generate personalized introduction emails

**Nodes**:
1. **Webhook** - Receives introduction request
2. **AI Task (OpenAI)** - Generate introduction draft
3. **AI Task (OpenAI)** - Generate subject line options
4. **HTTP Request (Rhiz)** - Save introduction draft

### 8. CRM Sync Workflow (`crm-sync`)

**Trigger**: Webhook (`/webhook/crm-sync`)
**Purpose**: Synchronize entities to CRM systems

**Nodes**:
1. **Webhook** - Receives entities to sync
2. **Switch** - Route by CRM type (HubSpot, Salesforce, etc.)
3. **HTTP Request (HubSpot)** - Create/update contacts
4. **HTTP Request (Salesforce)** - Create/update leads
5. **HTTP Request (Rhiz)** - Confirm sync completion

## 🚀 Integration Flow

### During Interview
```
User speaks → Transcription → Interview Agent → Entity extraction
                                    ↓
Person mentioned → n8n person-lookup → Enriched data → Continue interview
Company mentioned → n8n company-enrichment → Industry data → Better questions
```

### After Interview Completion
```
Interview ends → Interview Agent calls:
├── triggerInterviewProcessing() → n8n entity-enrichment
├── triggerRelationshipAnalysis() → n8n relationship-analyzer  
├── triggerEmailFinding() → n8n email-finder
└── Results → n8n webhooks → Database updates → UI notifications
```

## 🛠️ Setup Instructions

### 1. Import Workflows
```bash
# Export from n8n UI or import from JSON files
curl -X POST http://localhost:5678/api/workflows/import \
  -H "Content-Type: application/json" \
  -d @entity-enrichment-workflow.json
```

### 2. Configure Credentials
In n8n, set up credentials for:
- **Clearbit** - Person/company enrichment
- **Hunter.io** - Email finding
- **Apollo** - Contact database
- **LinkedIn** - Professional profiles
- **OpenAI** - AI analysis and generation
- **HubSpot/Salesforce** - CRM integration

### 3. Set Environment Variables
```env
N8N_URL=http://localhost:5678
N8N_WEBHOOK_SECRET=your-secure-secret
N8N_ENTITY_ENRICHMENT_ID=entity-enrichment
N8N_PERSON_LOOKUP_ID=person-lookup
N8N_COMPANY_ENRICHMENT_ID=company-enrichment
N8N_EMAIL_FINDER_ID=email-finder
N8N_SOCIAL_PROFILE_ID=social-profile
N8N_RELATIONSHIP_ANALYZER_ID=relationship-analyzer
N8N_INTRODUCTION_DRAFTER_ID=introduction-drafter
N8N_CRM_SYNC_ID=crm-sync
```

### 4. Test Workflows
```bash
# Test person enrichment
curl -X POST http://localhost:5678/webhook/person-lookup \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "person-lookup",
    "trigger": "new_person_detected",
    "data": {"name": "John Doe", "company": "TechCorp"},
    "metadata": {"callback": "http://localhost:3000/api/webhooks/n8n"}
  }'
```

## 📊 Expected Results

With n8n integration, interviews become much more powerful:

### Before n8n
- User: "I met with Sarah from TechCorp"
- Agent: "Tell me more about Sarah"

### After n8n
- User: "I met with Sarah from TechCorp"
- n8n enriches: Sarah Chen, VP Engineering, LinkedIn profile, email
- Agent: "Sarah Chen, the VP of Engineering? She has an impressive background in ML infrastructure. How did your conversation go?"

### Automated Follow-ups
- **Email found**: "I found Sarah's email (s.chen@techcorp.com). Would you like me to draft an introduction?"
- **Mutual connections**: "You both know Alex Kim from Google. That could be a great introduction path."
- **CRM sync**: "I've updated Sarah's profile in HubSpot with your conversation notes."

## 🔄 Webhook Responses

All n8n workflows send results back to `/api/webhooks/n8n` with this structure:

```json
{
  "workflowId": "person-lookup",
  "executionId": "uuid",
  "status": "success",
  "data": {
    "person": {
      "name": "Sarah Chen",
      "email": "s.chen@techcorp.com",
      "linkedin_url": "linkedin.com/in/sarahchen",
      "title": "VP Engineering",
      "company": "TechCorp",
      "bio": "Leading ML infrastructure at TechCorp..."
    }
  },
  "metadata": {
    "userId": "user-id",
    "workspaceId": "workspace-id",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

This creates a seamless flow where interviews become increasingly intelligent as they progress, with real-time enrichment making each question more targeted and valuable.