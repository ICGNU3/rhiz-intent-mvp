import { Job } from 'bullmq';
import { db, claim, eventLog } from '@rhiz/db';
import { createEnrichmentProvider } from '@rhiz/core';

interface EnrichmentJob {
  ownerId: string;
  personId: string;
  email?: string;
  name?: string;
  reason: string;
  costBudget?: number; // in cents
  tokenBudget?: number;
}

export async function enrichmentHandler(job: Job<EnrichmentJob>) {
  const { ownerId, personId, email, name, reason, costBudget = 50, tokenBudget = 1000 } = job.data;
  
  console.log(`EnrichmentAgent processing person ${personId} for ${ownerId}`);
  
  try {
    // Check if we've already enriched this person recently
    const recentEnrichment = await db
      .select()
      .from(claim)
      .where(({ and, eq, gte }) => 
        and(
          eq(claim.ownerId, ownerId),
          eq(claim.subjectId, personId),
          eq(claim.source, 'enrichment'),
          gte(claim.observedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        )
      )
      .limit(1);
    
    if (recentEnrichment.length > 0) {
      console.log(`Skipping enrichment for ${personId} - already enriched recently`);
      return { skipped: true, reason: 'recent_enrichment' };
    }
    
    // Create enrichment provider
    const provider = createEnrichmentProvider();
    
    if (!provider.isAvailable()) {
      console.log(`Enrichment provider not available for ${personId}`);
      return { skipped: true, reason: 'provider_unavailable' };
    }
    
    // Track costs and tokens
    let totalCost = 0;
    let totalTokens = 0;
    
    // Enrich person data
    const enrichmentData = await provider.enrich(personId, email, name);
    
    // Simulate cost tracking (in production, track actual API costs)
    const estimatedCost = 10; // cents
    const estimatedTokens = 100;
    
    totalCost += estimatedCost;
    totalTokens += estimatedTokens;
    
    // Check budgets
    if (totalCost > costBudget) {
      throw new Error(`Cost budget exceeded: ${totalCost} > ${costBudget} cents`);
    }
    
    if (totalTokens > tokenBudget) {
      throw new Error(`Token budget exceeded: ${totalTokens} > ${tokenBudget} tokens`);
    }
    
    // Create claims from enrichment data
    for (const claimData of enrichmentData.claims) {
      await db.insert(claim).values({
        ownerId,
        subjectType: 'person',
        subjectId: personId,
        key: claimData.key,
        value: claimData.value,
        confidence: claimData.confidence,
        source: 'enrichment',
        lawfulBasis: 'legitimate_interest',
        observedAt: new Date(),
        provenance: {
          source: 'enrichment',
          provider: enrichmentData.provider,
          reason,
          cost: estimatedCost,
          tokens: estimatedTokens,
          metadata: enrichmentData.metadata,
        },
      });
    }
    
    // Log enrichment event
    await db.insert(eventLog).values({
      ownerId,
      event: 'person_enriched',
      entityType: 'person',
      entityId: personId,
      metadata: {
        provider: enrichmentData.provider,
        claimsAdded: enrichmentData.claims.length,
        cost: totalCost,
        tokens: totalTokens,
        reason,
      },
    });
    
    console.log(`EnrichmentAgent completed for ${personId}, added ${enrichmentData.claims.length} claims`);
    
    return {
      claimsAdded: enrichmentData.claims.length,
      cost: totalCost,
      tokens: totalTokens,
      provider: enrichmentData.provider,
    };
    
  } catch (error) {
    console.error('EnrichmentAgent failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'enrichment_error',
      entityType: 'person',
      entityId: personId,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        reason,
      },
    });
    
    throw error;
  }
}
