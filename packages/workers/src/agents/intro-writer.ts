import { Job } from 'bullmq';
import { db, suggestion, person, goal, eventLog } from '@rhiz/db';
import { ModelRouter } from '@rhiz/core';
import { eq, and } from 'drizzle-orm';

interface IntroWriterJob {
  ownerId: string;
  suggestionId: string;
  personAId: string;
  personBId: string;
  goalId?: string;
  costBudget?: number; // in cents
  tokenBudget?: number;
}

export async function introWriterHandler(job: Job<IntroWriterJob>) {
  const { ownerId, suggestionId, personAId, personBId, goalId, costBudget = 100, tokenBudget = 2000 } = job.data;
  
  console.log(`IntroWriter processing suggestion ${suggestionId} for ${ownerId}`);
  
  try {
    // Check if suggestion already has drafts
    const existingSuggestion = await db
      .select()
      .from(suggestion)
      .where(({ and, eq }) => 
        and(
          eq(suggestion.id, suggestionId),
          eq(suggestion.ownerId, ownerId)
        )
      )
      .limit(1);
    
    if (existingSuggestion.length === 0) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }
    
    const suggestionRecord = existingSuggestion[0];
    
    if (suggestionRecord.draft && Object.keys(suggestionRecord.draft).length > 0) {
      console.log(`Suggestion ${suggestionId} already has drafts, skipping`);
      return { skipped: true, reason: 'drafts_exist' };
    }
    
    // Get person data
    const [personA, personB] = await Promise.all([
      db.select().from(person).where(eq(person.id, personAId)).limit(1),
      db.select().from(person).where(eq(person.id, personBId)).limit(1),
    ]);
    
    if (personA.length === 0 || personB.length === 0) {
      throw new Error('Person data not found');
    }
    
    // Get goal data if provided
    let goalData = null;
    if (goalId) {
      const goalResult = await db
        .select()
        .from(goal)
        .where(and(eq(goal.id, goalId), eq(goal.ownerId, ownerId)))
        .limit(1);
      goalData = goalResult[0] || null;
    }
    
    // Get claims for context
    const [claimsA, claimsB] = await Promise.all([
      db.select().from(claim).where(and(eq(claim.subjectId, personAId), eq(claim.ownerId, ownerId))),
      db.select().from(claim).where(and(eq(claim.subjectId, personBId), eq(claim.ownerId, ownerId))),
    ]);
    
    // Build person context
    const personAContext = {
      name: personA[0].fullName,
      title: claimsA.find(c => c.key === 'title')?.value,
      company: claimsA.find(c => c.key === 'company')?.value,
      location: personA[0].location,
    };
    
    const personBContext = {
      name: personB[0].fullName,
      title: claimsB.find(c => c.key === 'title')?.value,
      company: claimsB.find(c => c.key === 'company')?.value,
      location: personB[0].location,
    };
    
    // Track costs and tokens
    let totalCost = 0;
    let totalTokens = 0;
    
    // Initialize ModelRouter
    const modelRouter = new ModelRouter();
    
    // Draft introduction messages
    const introDrafts = await modelRouter.draftIntro(
      personAContext,
      personBContext,
      goalData ? {
        kind: goalData.kind,
        title: goalData.title,
        details: goalData.details,
      } : undefined,
      suggestionRecord.why?.mutualInterests || [],
      'professional'
    );
    
    // Simulate cost tracking (in production, track actual API costs)
    const estimatedCost = 25; // cents
    const estimatedTokens = 500;
    
    totalCost += estimatedCost;
    totalTokens += estimatedTokens;
    
    // Check budgets
    if (totalCost > costBudget) {
      throw new Error(`Cost budget exceeded: ${totalCost} > ${costBudget} cents`);
    }
    
    if (totalTokens > tokenBudget) {
      throw new Error(`Token budget exceeded: ${totalTokens} > ${tokenBudget} tokens`);
    }
    
    // Update suggestion with drafts
    await db
      .update(suggestion)
      .set({
        draft: {
          preIntroPing: introDrafts.preIntroPing,
          doubleOptIntro: introDrafts.doubleOptIntro,
          generatedAt: new Date().toISOString(),
          cost: totalCost,
          tokens: totalTokens,
        },
        state: 'ready',
      })
      .where(eq(suggestion.id, suggestionId));
    
    // Log intro writing event
    await db.insert(eventLog).values({
      ownerId,
      event: 'intro_drafted',
      entityType: 'suggestion',
      entityId: suggestionId,
      metadata: {
        personAId,
        personBId,
        goalId,
        cost: totalCost,
        tokens: totalTokens,
        draftsGenerated: 2,
      },
    });
    
    console.log(`IntroWriter completed for suggestion ${suggestionId}`);
    
    return {
      draftsGenerated: 2,
      cost: totalCost,
      tokens: totalTokens,
      state: 'ready',
    };
    
  } catch (error) {
    console.error('IntroWriter failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'intro_writer_error',
      entityType: 'suggestion',
      entityId: suggestionId,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        personAId,
        personBId,
        goalId,
      },
    });
    
    throw error;
  }
}
