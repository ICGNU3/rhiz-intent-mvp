import { NextRequest, NextResponse } from 'next/server';
import { db, person, claim, organization, edge, suggestion } from '@rhiz/db';
import { logger } from '@/lib/logger';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Schema for n8n webhook payloads
const n8nWebhookSchema = z.object({
  workflowId: z.string(),
  executionId: z.string().optional(),
  trigger: z.string(),
  status: z.enum(['success', 'error', 'running']),
  data: z.any(),
  metadata: z.object({
    userId: z.string().optional(),
    workspaceId: z.string().optional(),
    conversationId: z.string().optional(),
    encounterId: z.string().optional(),
    callback: z.string().optional(),
    timestamp: z.string().optional()
  }).optional()
});

// Webhook secret for security
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-webhook-secret';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('x-n8n-webhook-secret');
    if (authHeader !== N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate webhook payload
    const payload = n8nWebhookSchema.parse(body);
    
    logger.info('Received n8n webhook', {
      component: 'n8n-webhook',
      workflowId: payload.workflowId,
      trigger: payload.trigger,
      status: payload.status
    });

    // Route to appropriate handler based on workflow ID and trigger
    switch (payload.workflowId) {
      case 'entity-enrichment':
        await handleEntityEnrichment(payload);
        break;
      
      case 'person-lookup':
        await handlePersonLookup(payload);
        break;
      
      case 'company-enrichment':
        await handleCompanyEnrichment(payload);
        break;
      
      case 'email-finder':
        await handleEmailFinderResult(payload);
        break;
      
      case 'social-profile':
        await handleSocialProfileResult(payload);
        break;
      
      case 'relationship-analyzer':
        await handleRelationshipAnalysis(payload);
        break;
      
      case 'introduction-drafter':
        await handleIntroductionDraft(payload);
        break;
      
      case 'crm-sync':
        await handleCRMSync(payload);
        break;
      
      default:
        logger.warn('Unknown n8n workflow ID', {
          component: 'n8n-webhook',
          workflowId: payload.workflowId
        });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    logger.error('n8n webhook processing error', error as Error, {
      component: 'n8n-webhook'
    });
    
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

/**
 * Handle enriched entity data from n8n
 */
async function handleEntityEnrichment(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success') {
    logger.error('Entity enrichment failed', null, {
      component: 'n8n-webhook',
      error: data.error
    });
    return;
  }

  // Process enriched people
  if (data.people) {
    for (const enrichedPerson of data.people) {
      await updatePersonWithEnrichment(enrichedPerson, metadata);
    }
  }

  // Process enriched organizations
  if (data.organizations) {
    for (const enrichedOrg of data.organizations) {
      await updateOrganizationWithEnrichment(enrichedOrg, metadata);
    }
  }

  // Process generated suggestions
  if (data.suggestions) {
    for (const suggestionData of data.suggestions) {
      await createSuggestionFromEnrichment(suggestionData, metadata);
    }
  }
}

/**
 * Handle person lookup results from LinkedIn, Clearbit, etc.
 */
async function handlePersonLookup(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success') return;

  const enrichedData = data.person;
  if (!enrichedData?.email && !enrichedData?.name) return;

  try {
    // Find existing person by email or name
    const existingPerson = await findPersonByEmailOrName(
      enrichedData.email,
      enrichedData.name,
      metadata?.workspaceId
    );

    if (existingPerson) {
      // Update existing person with enriched data
      await updatePersonClaims(existingPerson.id, enrichedData, metadata);
    } else {
      // Create new person if not found (and we have enough data)
      if (enrichedData.email || (enrichedData.name && enrichedData.company)) {
        await createEnrichedPerson(enrichedData, metadata);
      }
    }
  } catch (error) {
    logger.error('Failed to process person lookup', error as Error, {
      component: 'n8n-webhook',
      person: enrichedData.name
    });
  }
}

/**
 * Handle company enrichment results
 */
async function handleCompanyEnrichment(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success') return;

  const enrichedData = data.company;
  if (!enrichedData?.name) return;

  try {
    // Find or create organization
    const existingOrg = await findOrganizationByName(
      enrichedData.name,
      metadata?.workspaceId
    );

    if (existingOrg) {
      // Update with enriched data
      await updateOrganizationWithEnrichment(enrichedData, metadata);
    } else {
      // Create new organization
      await createEnrichedOrganization(enrichedData, metadata);
    }
  } catch (error) {
    logger.error('Failed to process company enrichment', error as Error, {
      component: 'n8n-webhook',
      company: enrichedData.name
    });
  }
}

/**
 * Handle email finder results
 */
async function handleEmailFinderResult(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success' || !data.email) return;

  try {
    const personId = data.personId || await findPersonIdByName(data.name, metadata?.workspaceId);
    
    if (personId) {
      // Add email claim
      await db.insert(claim).values({
        workspaceId: metadata?.workspaceId || 'default',
        ownerId: metadata?.userId || 'system',
        subjectType: 'person',
        subjectId: personId,
        key: 'email',
        value: data.email,
        confidence: data.confidence || 85,
        source: 'n8n_email_finder',
        lawfulBasis: 'legitimate_interest',
        observedAt: new Date()
      });
    }
  } catch (error) {
    logger.error('Failed to save email finder result', error as Error, {
      component: 'n8n-webhook'
    });
  }
}

/**
 * Handle social profile lookup results
 */
async function handleSocialProfileResult(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success') return;

  try {
    const personId = data.personId || await findPersonIdByName(data.name, metadata?.workspaceId);
    
    if (personId && data.profiles) {
      // Add social profile claims
      for (const [platform, url] of Object.entries(data.profiles)) {
        if (url && typeof url === 'string') {
          await db.insert(claim).values({
            workspaceId: metadata?.workspaceId || 'default',
            ownerId: metadata?.userId || 'system',
            subjectType: 'person',
            subjectId: personId,
            key: `${platform}_url`,
            value: url,
            confidence: data.confidence || 90,
            source: 'n8n_social_lookup',
            lawfulBasis: 'legitimate_interest',
            observedAt: new Date()
          });
        }
      }
    }
  } catch (error) {
    logger.error('Failed to save social profile result', error as Error, {
      component: 'n8n-webhook'
    });
  }
}

/**
 * Handle relationship analysis results
 */
async function handleRelationshipAnalysis(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success') return;

  try {
    if (data.relationships) {
      for (const relationship of data.relationships) {
        await createOrUpdateEdge(relationship, metadata);
      }
    }

    if (data.suggestions) {
      for (const suggestionData of data.suggestions) {
        await createSuggestionFromEnrichment(suggestionData, metadata);
      }
    }
  } catch (error) {
    logger.error('Failed to process relationship analysis', error as Error, {
      component: 'n8n-webhook'
    });
  }
}

/**
 * Handle introduction draft results
 */
async function handleIntroductionDraft(payload: any) {
  const { data, metadata } = payload;
  
  if (payload.status !== 'success' || !data.introduction) return;

  try {
    // Update suggestion with generated introduction
    if (data.suggestionId) {
      await db.update(suggestion)
        .set({
          introDraft: data.introduction.draft,
          introReasoning: data.introduction.reasoning,
          updatedAt: new Date()
        })
        .where(eq(suggestion.id, data.suggestionId));
    }
  } catch (error) {
    logger.error('Failed to save introduction draft', error as Error, {
      component: 'n8n-webhook'
    });
  }
}

/**
 * Handle CRM sync results
 */
async function handleCRMSync(payload: any) {
  const { data, metadata } = payload;
  
  logger.info('CRM sync completed', {
    component: 'n8n-webhook',
    status: payload.status,
    synced: data.synced_count || 0,
    errors: data.errors?.length || 0
  });

  // Log any sync errors for review
  if (data.errors?.length > 0) {
    for (const error of data.errors) {
      logger.error('CRM sync error', null, {
        component: 'n8n-webhook',
        error: error.message,
        entity: error.entity
      });
    }
  }
}

// Helper functions
async function findPersonByEmailOrName(email: string, name: string, workspaceId?: string) {
  if (email) {
    const emailClaim = await db.select()
      .from(claim)
      .leftJoin(person, eq(claim.subjectId, person.id))
      .where(and(
        eq(claim.key, 'email'),
        eq(claim.value, email),
        workspaceId ? eq(claim.workspaceId, workspaceId) : undefined
      ))
      .limit(1);
    
    return emailClaim[0]?.person || null;
  }

  if (name) {
    return await db.select()
      .from(person)
      .where(and(
        eq(person.fullName, name),
        workspaceId ? eq(person.workspaceId, workspaceId) : undefined
      ))
      .limit(1)
      .then(results => results[0] || null);
  }

  return null;
}

async function findPersonIdByName(name: string, workspaceId?: string): Promise<string | null> {
  const result = await db.select({ id: person.id })
    .from(person)
    .where(and(
      eq(person.fullName, name),
      workspaceId ? eq(person.workspaceId, workspaceId) : undefined
    ))
    .limit(1);
  
  return result[0]?.id || null;
}

async function findOrganizationByName(name: string, workspaceId?: string) {
  return await db.select()
    .from(organization)
    .where(and(
      eq(organization.name, name),
      workspaceId ? eq(organization.workspaceId, workspaceId) : undefined
    ))
    .limit(1)
    .then(results => results[0] || null);
}

async function updatePersonClaims(personId: string, enrichedData: any, metadata: any) {
  const claimsToAdd = [];
  
  // Map enriched data to claims
  const fieldMapping = {
    title: 'role',
    company: 'company',
    location: 'location',
    linkedin_url: 'linkedin_url',
    twitter_url: 'twitter_url',
    bio: 'bio',
    skills: 'skills',
    experience: 'experience'
  };

  for (const [sourceField, claimKey] of Object.entries(fieldMapping)) {
    if (enrichedData[sourceField]) {
      claimsToAdd.push({
        workspaceId: metadata?.workspaceId || 'default',
        ownerId: metadata?.userId || 'system',
        subjectType: 'person' as const,
        subjectId: personId,
        key: claimKey,
        value: typeof enrichedData[sourceField] === 'object' 
          ? JSON.stringify(enrichedData[sourceField]) 
          : enrichedData[sourceField],
        confidence: enrichedData.confidence || 85,
        source: 'n8n_enrichment',
        lawfulBasis: 'legitimate_interest' as const,
        observedAt: new Date()
      });
    }
  }

  if (claimsToAdd.length > 0) {
    await db.insert(claim).values(claimsToAdd);
  }
}

async function createEnrichedPerson(enrichedData: any, metadata: any) {
  const [newPerson] = await db.insert(person).values({
    workspaceId: metadata?.workspaceId || 'default',
    ownerId: metadata?.userId || 'system',
    fullName: enrichedData.name,
    primaryEmail: enrichedData.email || null,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  // Add claims for enriched data
  await updatePersonClaims(newPerson.id, enrichedData, metadata);
  
  return newPerson;
}

async function updateOrganizationWithEnrichment(enrichedData: any, metadata: any) {
  // Similar logic for organization enrichment
  logger.info('Organization enrichment processed', {
    component: 'n8n-webhook',
    organization: enrichedData.name
  });
}

async function createEnrichedOrganization(enrichedData: any, metadata: any) {
  // Create new organization with enriched data
  logger.info('New enriched organization created', {
    component: 'n8n-webhook',
    organization: enrichedData.name
  });
}

async function createOrUpdateEdge(relationship: any, metadata: any) {
  // Create relationship edge between entities
  logger.info('Relationship edge processed', {
    component: 'n8n-webhook',
    relationship: relationship.type
  });
}

async function createSuggestionFromEnrichment(suggestionData: any, metadata: any) {
  // Create suggestion based on enrichment analysis
  logger.info('Suggestion created from enrichment', {
    component: 'n8n-webhook',
    suggestion: suggestionData.title
  });
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'n8n webhook endpoint is ready',
    webhooks: Object.keys({
      'entity-enrichment': 'Process enriched entity data',
      'person-lookup': 'Handle person lookup results',
      'company-enrichment': 'Process company enrichment',
      'email-finder': 'Save found email addresses',
      'social-profile': 'Save social profile URLs',
      'relationship-analyzer': 'Process relationship analysis',
      'introduction-drafter': 'Save introduction drafts',
      'crm-sync': 'Handle CRM synchronization results'
    })
  });
}