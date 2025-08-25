// Signals computation utilities
// Provides functions to compute relationship signals without requiring agents package

import { db, signals, person, encounter, personEncounter, claim, setUserContext, eq, and, sql, desc } from '@rhiz/db';

export interface ContactSignals {
  contactId: string;
  lastInteractionAt?: Date | null;
  interactions90d: number;
  reciprocityRatio: number; // 0-100 scale
  sentimentAvg: number; // 0-100 scale  
  decayDays: number;
  roleTags: string[];
  sharedContextTags: string[];
  goalAlignmentScore: number; // 0-100 scale
  capacityCost: number; // 0-100 scale
}

export async function getSignalsForUser(userId: string): Promise<ContactSignals[]> {
  try {
    await setUserContext(userId);

    const userSignals = await db.select({
      contact_id: signals.contactId,
      last_interaction_at: signals.lastInteractionAt,
      interactions_90d: signals.interactions90d,
      reciprocity_ratio: signals.reciprocityRatio,
      sentiment_avg: signals.sentimentAvg,
      decay_days: signals.decayDays,
      role_tags: signals.roleTags,
      shared_context_tags: signals.sharedContextTags,
      goal_alignment_score: signals.goalAlignmentScore,
      capacity_cost: signals.capacityCost
    })
    .from(signals)
    .where(eq(signals.userId, userId));

    return userSignals.map(signal => ({
      contactId: signal.contact_id,
      lastInteractionAt: signal.last_interaction_at,
      interactions90d: signal.interactions_90d,
      reciprocityRatio: signal.reciprocity_ratio,
      sentimentAvg: signal.sentiment_avg,
      decayDays: signal.decay_days,
      roleTags: Array.isArray(signal.role_tags) ? signal.role_tags : [],
      sharedContextTags: Array.isArray(signal.shared_context_tags) ? signal.shared_context_tags : [],
      goalAlignmentScore: signal.goal_alignment_score,
      capacityCost: signal.capacity_cost
    }));

  } catch (error) {
    console.error('Failed to get signals for user:', error);
    return [];
  }
}

export async function computeContactSignals(userId: string, contactId: string): Promise<ContactSignals | null> {
  try {
    await setUserContext(userId);

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
    const reciprocityRatio = receivedCount > 0 ? Math.min(100, (sentCount / receivedCount) * 50) : 0;

    // Simple sentiment calculation (based on interaction frequency and recency)
    const sentimentAvg = Math.max(0, Math.min(100, 
      (interactions90d > 0 ? 70 : 30) - (decayDays * 0.2)
    ));

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
    const goalAlignmentScore = Math.min(100, (contextTags.length * 10) + (interactions90d * 5));

    // Capacity cost based on relationship maintenance needs
    const capacityCost = 100 - Math.max(0, Math.min(50, interactions90d * 2 + (100 - decayDays)));

    return {
      contactId,
      lastInteractionAt,
      interactions90d,
      reciprocityRatio,
      sentimentAvg,
      decayDays,
      roleTags,
      sharedContextTags: contextTags,
      goalAlignmentScore,
      capacityCost
    };

  } catch (error) {
    console.error(`Failed to compute signals for contact ${contactId}:`, error);
    return null;
  }
}

export async function upsertContactSignals(userId: string, contactSignals: ContactSignals): Promise<boolean> {
  try {
    await setUserContext(userId);

    await db.insert(signals).values({
      userId,
      contactId: contactSignals.contactId,
      lastInteractionAt: contactSignals.lastInteractionAt,
      interactions90d: contactSignals.interactions90d,
      reciprocityRatio: contactSignals.reciprocityRatio,
      sentimentAvg: contactSignals.sentimentAvg,
      decayDays: contactSignals.decayDays,
      roleTags: JSON.stringify(contactSignals.roleTags),
      sharedContextTags: JSON.stringify(contactSignals.sharedContextTags),
      goalAlignmentScore: contactSignals.goalAlignmentScore,
      capacityCost: contactSignals.capacityCost
    })
    .onConflictDoUpdate({
      target: [signals.userId, signals.contactId],
      set: {
        lastInteractionAt: contactSignals.lastInteractionAt,
        interactions90d: contactSignals.interactions90d,
        reciprocityRatio: contactSignals.reciprocityRatio,
        sentimentAvg: contactSignals.sentimentAvg,
        decayDays: contactSignals.decayDays,
        roleTags: JSON.stringify(contactSignals.roleTags),
        sharedContextTags: JSON.stringify(contactSignals.sharedContextTags),
        goalAlignmentScore: contactSignals.goalAlignmentScore,
        capacityCost: contactSignals.capacityCost,
        updatedAt: sql`NOW()`
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to upsert contact signals:', error);
    return false;
  }
}

export function calculateDunbarLayer(signals: ContactSignals): {
  layer: 1 | 2 | 3 | 4 | 5;
  name: 'intimate' | 'close' | 'meaningful' | 'stable' | 'extended';
} {
  const { interactions90d, reciprocityRatio, sentimentAvg, decayDays } = signals;
  
  // Convert reciprocity and sentiment to 0-1 scale for calculation
  const reciprocity = reciprocityRatio / 100;
  const sentiment = sentimentAvg / 100;
  
  // Calculate relationship strength (0-10 scale)
  const recencyFactor = Math.max(0, 1 - decayDays / 365);
  const frequencyFactor = Math.min(1, interactions90d / 12); // normalize to monthly
  const strength = (recencyFactor * 0.3 + frequencyFactor * 0.4 + sentiment * 0.3) * 10;

  // Determine layer based on strength and interaction patterns
  const monthlyFrequency = interactions90d / 3; // Last 3 months
  
  if (strength >= 8 && monthlyFrequency >= 8) {
    return { layer: 1, name: 'intimate' };
  } else if (strength >= 7 && monthlyFrequency >= 2) {
    return { layer: 2, name: 'close' };
  } else if (strength >= 5 && monthlyFrequency >= 0.5) {
    return { layer: 3, name: 'meaningful' };
  } else if (strength >= 3 && monthlyFrequency >= 0.1) {
    return { layer: 4, name: 'stable' };
  } else {
    return { layer: 5, name: 'extended' };
  }
}