import { Job } from 'bullmq';
import { db, person, goal, suggestion, claim, encounter, personEncounter, eventLog } from '@rhiz/db';
import { addJob, QUEUE_NAMES } from '../queue';
import { featuresForPair, baseConnectionScore, explainWhy } from '@rhiz/core';
import { eq, and, desc } from 'drizzle-orm';

interface MatchingJob {
  ownerId: string;
  goalId: string;
  action: 'created' | 'updated';
}

export async function matchingHandler(job: Job<MatchingJob>) {
  const { ownerId, goalId, action } = job.data;
  
  console.log(`MatchingAgent processing goal ${goalId} for ${ownerId}`);
  
  try {
    // Get the goal
    const [goalRecord] = await db
      .select()
      .from(goal)
      .where(({ and, eq }) => 
        and(
          eq(goal.id, goalId),
          eq(goal.ownerId, ownerId)
        )
      );
    
    if (!goalRecord) {
      throw new Error(`Goal ${goalId} not found`);
    }
    
    // Get all people for this owner
    const people = await db
      .select()
      .from(person)
      .where(eq(person.ownerId, ownerId));
    
    // Get all claims for these people
    const personIds = people.map(p => p.id);
    const claims = await db
      .select()
      .from(claim)
      .where(and(
        eq(claim.ownerId, ownerId),
        eq(claim.subjectType, 'person')
      ));
    
    // Get all encounters for these people
    const encounters = await db
      .select({
        encounter: encounter,
        personEncounter: personEncounter,
      })
      .from(encounter)
      .innerJoin(personEncounter, eq(encounter.id, personEncounter.encounterId))
      .where(and(
        eq(encounter.ownerId, ownerId),
        personEncounter.personId.in(personIds)
      ));
    
    // Build person objects with claims and encounters
    const peopleWithData = people.map(person => {
      const personClaims = claims.filter(c => c.subjectId === person.id);
      const personEncounters = encounters
        .filter(e => e.personEncounter.personId === person.id)
        .map(e => ({
          occurredAt: e.encounter.occurredAt,
          kind: e.encounter.kind,
          summary: e.encounter.summary,
        }));
      
      return {
        id: person.id,
        fullName: person.fullName,
        primaryEmail: person.primaryEmail,
        location: person.location,
        claims: personClaims.map(c => ({
          key: c.key,
          value: c.value,
          confidence: c.confidence,
          source: c.source,
        })),
        encounters: personEncounters,
      };
    });
    
    // Generate candidate pairs
    const suggestions: Array<{
      personAId: string;
      personBId: string;
      score: number;
      why: any;
    }> = [];
    
    for (let i = 0; i < peopleWithData.length; i++) {
      for (let j = i + 1; j < peopleWithData.length; j++) {
        const personA = peopleWithData[i];
        const personB = peopleWithData[j];
        
        // Skip if they're the same person
        if (personA.id === personB.id) continue;
        
        // Calculate features and score
        const features = featuresForPair(personA, personB, {
          id: goalRecord.id,
          kind: goalRecord.kind,
          title: goalRecord.title,
          details: goalRecord.details,
        });
        
        const score = baseConnectionScore(features);
        
        // Only create suggestions for high-scoring pairs
        if (score.score >= 60) {
          const reasons = explainWhy(personA, personB, {
            id: goalRecord.id,
            kind: goalRecord.kind,
            title: goalRecord.title,
            details: goalRecord.details,
          }, features);
          
          suggestions.push({
            personAId: personA.id,
            personBId: personB.id,
            score: score.score,
            why: {
              reasons,
              mutualInterests: features.mutualInterests > 0 ? ['shared interests'] : [],
              context: `Score: ${score.score}/100 based on ${score.confidence}% confidence`,
            },
          });
        }
      }
    }
    
    // Sort by score and take top 10
    suggestions.sort((a, b) => b.score - a.score);
    const topSuggestions = suggestions.slice(0, 10);
    
    // Create suggestion records
    for (const suggestionData of topSuggestions) {
      // Check if suggestion already exists
      const existingSuggestion = await db
        .select()
        .from(suggestion)
        .where(({ and, eq }) => 
          and(
            eq(suggestion.ownerId, ownerId),
            eq(suggestion.goalId, goalId),
            eq(suggestion.aId, suggestionData.personAId),
            eq(suggestion.bId, suggestionData.personBId)
          )
        )
        .limit(1);
      
      if (existingSuggestion.length === 0) {
        // Create new suggestion
        const [newSuggestion] = await db.insert(suggestion).values({
          ownerId,
          kind: 'introduction',
          aId: suggestionData.personAId,
          bId: suggestionData.personBId,
          goalId,
          score: suggestionData.score,
          why: suggestionData.why,
          state: 'proposed',
        }).returning();
        
        console.log(`Created suggestion: ${newSuggestion.id} with score ${suggestionData.score}`);
        
        // Trigger intro writing for this suggestion
        await addJob(QUEUE_NAMES.INTRO, {
          ownerId,
          suggestionId: newSuggestion.id,
          personAId: suggestionData.personAId,
          personBId: suggestionData.personBId,
          goalId,
        });
      }
    }
    
    // Log matching results
    await db.insert(eventLog).values({
      ownerId,
      event: 'matching_completed',
      entityType: 'goal',
      entityId: goalId,
      metadata: {
        goalKind: goalRecord.kind,
        peopleProcessed: peopleWithData.length,
        suggestionsGenerated: topSuggestions.length,
        topScore: topSuggestions[0]?.score || 0,
        action,
      },
    });
    
    console.log(`MatchingAgent completed for goal ${goalId}, generated ${topSuggestions.length} suggestions`);
    
    return {
      suggestionsGenerated: topSuggestions.length,
      topScore: topSuggestions[0]?.score || 0,
    };
    
  } catch (error) {
    console.error('MatchingAgent failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'matching_error',
      entityType: 'goal',
      entityId: goalId,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
      },
    });
    
    throw error;
  }
}
