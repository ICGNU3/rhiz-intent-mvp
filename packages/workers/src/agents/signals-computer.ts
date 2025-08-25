// Signals Computer Worker
// Computes relationship signals for all users on a schedule

import { db, signals, person, encounter, personEncounter, claim, setUserContext, eq, and, sql, desc } from '@rhiz/db';

export interface SignalsComputeJobData {
  userId?: string; // If provided, compute for specific user only
  batchSize?: number;
  force?: boolean; // Force recompute even if recent
}

export async function processSignalsCompute(job: any): Promise<any> {
  const { userId, batchSize = 100, force = false }: SignalsComputeJobData = job.data;

  console.log(`Processing signals compute job${userId ? ` for user ${userId}` : ' for all users'}`);

  try {
    // Get users to process
    let usersToProcess: string[] = [];
    
    if (userId) {
      usersToProcess = [userId];
    } else {
      // Get all unique user IDs from person table
      const users = await db.select({ ownerId: person.ownerId })
        .from(person)
        .groupBy(person.ownerId)
        .limit(batchSize);
      
      usersToProcess = users.map(u => u.ownerId);
    }

    let processedCount = 0;
    let updatedCount = 0;

    for (const currentUserId of usersToProcess) {
      try {
        await setUserContext(currentUserId);

        // Get all contacts for this user
        const userContacts = await db.select({ id: person.id })
          .from(person)
          .where(eq(person.ownerId, currentUserId));

        for (const contact of userContacts) {
          const contactSignals = await computeContactSignals(currentUserId, contact.id, force);
          if (contactSignals) {
            // Upsert signals
            await db.insert(signals).values({
              userId: currentUserId,
              contactId: contact.id,
              ...contactSignals
            })
            .onConflictDoUpdate({
              target: [signals.userId, signals.contactId],
              set: {
                ...contactSignals,
                updatedAt: sql`NOW()`
              }
            });
            updatedCount++;
          }
        }

        processedCount++;
      } catch (userError) {
        console.error(`Failed to process signals for user ${currentUserId}:`, userError);
        // Continue with next user
      }
    }

    console.log(`Signals compute completed: processed ${processedCount} users, updated ${updatedCount} signals`);

    return { 
      success: true, 
      processedUsers: processedCount,
      updatedSignals: updatedCount
    };

  } catch (error) {
    console.error('Signals compute job failed:', error);
    throw error;
  }
}

async function computeContactSignals(userId: string, contactId: string, force: boolean = false) {
  try {
    // Check if we need to compute (skip if recently updated and not forced)
    if (!force) {
      const existing = await db.select({ updatedAt: signals.updatedAt })
        .from(signals)
        .where(and(eq(signals.userId, userId), eq(signals.contactId, contactId)))
        .limit(1);
      
      if (existing.length > 0) {
        const hoursSinceUpdate = (Date.now() - existing[0].updatedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceUpdate < 24) { // Skip if updated in last 24 hours
          return null;
        }
      }
    }

    // Get encounters for this contact (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const recentEncounters = await db.select({
      id: encounter.id,
      occurredAt: encounter.occurredAt,
      kind: encounter.kind
    })
    .from(encounter)
    .innerJoin(personEncounter, eq(encounter.id, personEncounter.encounterId))
    .where(and(
      eq(encounter.ownerId, userId),
      eq(personEncounter.personId, contactId),
      sql`${encounter.occurredAt} >= ${ninetyDaysAgo}`
    ))
    .orderBy(desc(encounter.occurredAt));

    // Get all encounters for reciprocity calculation
    const allEncounters = await db.select({
      id: encounter.id,
      occurredAt: encounter.occurredAt,
      kind: encounter.kind
    })
    .from(encounter)
    .innerJoin(personEncounter, eq(encounter.id, personEncounter.encounterId))
    .where(and(
      eq(encounter.ownerId, userId),
      eq(personEncounter.personId, contactId)
    ))
    .orderBy(desc(encounter.occurredAt));

    // Get claims for context tags
    const contactClaims = await db.select({ key: claim.key, value: claim.value })
      .from(claim)
      .where(and(
        eq(claim.subjectId, contactId),
        eq(claim.subjectType, 'person'),
        eq(claim.ownerId, userId)
      ));

    // Compute metrics
    const interactions90d = recentEncounters.length;
    const lastInteractionAt = allEncounters[0]?.occurredAt || null;
    const decayDays = lastInteractionAt 
      ? Math.floor((Date.now() - lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    // Simple reciprocity calculation (assumes outbound/inbound ratio)
    const sentCount = allEncounters.filter(e => e.kind === 'email' || e.kind === 'call').length;
    const receivedCount = allEncounters.filter(e => e.kind === 'meeting').length; // Meetings are more mutual
    const reciprocityRatio = Math.round(
      receivedCount > 0 ? Math.min(100, (sentCount / receivedCount) * 50) : 0
    );

    // Simple sentiment calculation (based on interaction frequency and recency)
    const sentimentAvg = Math.round(
      Math.max(0, Math.min(100, 
        (interactions90d > 0 ? 70 : 30) - (decayDays * 0.2)
      ))
    );

    // Extract role and context tags
    const roleTags = contactClaims
      .filter(c => c.key === 'role' || c.key === 'title')
      .map(c => c.value.toLowerCase())
      .filter(v => v.length > 0);

    const contextTags = contactClaims
      .filter(c => ['company', 'location', 'expertise', 'interests'].includes(c.key))
      .flatMap(c => c.value.split(',').map(v => v.trim().toLowerCase()))
      .filter(v => v.length > 0);

    // Simple goal alignment (based on shared interests/expertise)
    const goalAlignmentScore = Math.round(
      Math.min(100, (contextTags.length * 10) + (interactions90d * 5))
    );

    // Capacity cost based on relationship maintenance needs
    const capacityCost = Math.round(
      100 - Math.max(0, Math.min(50, interactions90d * 2 + (100 - decayDays)))
    );

    return {
      lastInteractionAt,
      interactions90d,
      reciprocityRatio,
      sentimentAvg,
      decayDays,
      roleTags: JSON.stringify(roleTags),
      sharedContextTags: JSON.stringify(contextTags),
      goalAlignmentScore,
      capacityCost
    };

  } catch (error) {
    console.error(`Failed to compute signals for contact ${contactId}:`, error);
    return null;
  }
}