import { db } from '@rhiz/db';
import { edge, person, encounter, personEncounter, suggestion, goal } from '@rhiz/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export class GraphBuilder {
  /**
   * Create edges when two people appear in the same encounter
   */
  static async createEncounterEdges(encounterId: string, workspaceId: string, ownerId: string) {
    try {
      // Get all people in this encounter
      const encounterPeople = await db
        .select({ personId: personEncounter.personId })
        .from(personEncounter)
        .where(eq(personEncounter.encounterId, encounterId));

      const personIds = encounterPeople.map(p => p.personId);

      // Create edges between all pairs of people
      for (let i = 0; i < personIds.length; i++) {
        for (let j = i + 1; j < personIds.length; j++) {
          const fromId = personIds[i];
          const toId = personIds[j];

          // Check if edge already exists
          const existingEdge = await db
            .select()
            .from(edge)
            .where(
              and(
                eq(edge.workspaceId, workspaceId),
                eq(edge.fromId, fromId),
                eq(edge.toId, toId),
                eq(edge.type, 'encounter')
              )
            );

          if (existingEdge.length === 0) {
            // Create new edge
            await db.insert(edge).values({
              workspaceId,
              ownerId,
              fromId,
              toId,
              type: 'encounter',
              strength: 5, // Medium strength for encounters
              metadata: {
                encounterId,
                createdAt: new Date().toISOString()
              }
            });
          } else {
            // Update existing edge strength
            await db
              .update(edge)
              .set({ 
                strength: Math.min(existingEdge[0].strength + 1, 10),
                metadata: {
                  ...existingEdge[0].metadata,
                  encounterId,
                  lastUpdated: new Date().toISOString()
                }
              })
              .where(eq(edge.id, existingEdge[0].id));
          }
        }
      }
    } catch (error) {
      console.error('Failed to create encounter edges:', error);
    }
  }

  /**
   * Create edge when intro suggestion is accepted
   */
  static async createIntroEdge(suggestionId: string, workspaceId: string, ownerId: string) {
    try {
      const suggestionData = await db
        .select()
        .from(suggestion)
        .where(eq(suggestion.id, suggestionId));

      if (suggestionData.length === 0) return;

      const suggestion = suggestionData[0];

      // Check if edge already exists
      const existingEdge = await db
        .select()
        .from(edge)
        .where(
          and(
            eq(edge.workspaceId, workspaceId),
            eq(edge.fromId, suggestion.aId),
            eq(edge.toId, suggestion.bId),
            eq(edge.type, 'intro')
          )
        );

      if (existingEdge.length === 0) {
        // Create new intro edge
        await db.insert(edge).values({
          workspaceId,
          ownerId,
          fromId: suggestion.aId,
          toId: suggestion.bId,
          type: 'intro',
          strength: 8, // High strength for accepted intros
          metadata: {
            suggestionId,
            goalId: suggestion.goalId,
            score: suggestion.score,
            why: suggestion.why,
            createdAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Failed to create intro edge:', error);
    }
  }

  /**
   * Create edges when goal references people
   */
  static async createGoalEdges(goalId: string, personIds: string[], workspaceId: string, ownerId: string) {
    try {
      for (const personId of personIds) {
        // Check if edge already exists
        const existingEdge = await db
          .select()
          .from(edge)
          .where(
            and(
              eq(edge.workspaceId, workspaceId),
              eq(edge.fromId, personId),
              eq(edge.toId, goalId),
              eq(edge.type, 'goal_link')
            )
          );

        if (existingEdge.length === 0) {
          // Create new goal link edge
          await db.insert(edge).values({
            workspaceId,
            ownerId,
            fromId: personId,
            toId: goalId,
            type: 'goal_link',
            strength: 6, // Medium-high strength for goal links
            metadata: {
              goalId,
              createdAt: new Date().toISOString()
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to create goal edges:', error);
    }
  }

  /**
   * Remove edges when relationships are deleted
   */
  static async removeEdges(edgeIds: string[]) {
    try {
      await db
        .delete(edge)
        .where(inArray(edge.id, edgeIds));
    } catch (error) {
      console.error('Failed to remove edges:', error);
    }
  }

  /**
   * Update edge strength based on interaction frequency
   */
  static async updateEdgeStrength(edgeId: string, newStrength: number) {
    try {
      await db
        .update(edge)
        .set({ 
          strength: Math.max(0, Math.min(newStrength, 10)),
          metadata: {
            lastUpdated: new Date().toISOString()
          }
        })
        .where(eq(edge.id, edgeId));
    } catch (error) {
      console.error('Failed to update edge strength:', error);
    }
  }
}
