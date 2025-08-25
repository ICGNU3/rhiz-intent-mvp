import { NextRequest, NextResponse } from 'next/server';
import { db, signals, encounter, agentEvents, person, setUserContext, eq, and, sql, desc } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';
import { analyzeRelationshipHealth, detectCapacityIssues, identifyReactivationOpportunities } from '@rhiz/agents';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysis_type = 'health', goal_id } = body;

    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Get signals for user with relationship metrics
      const userSignals = await db.select({
        contact_id: signals.contactId,
        last_interaction_at: signals.lastInteractionAt,
        interactions_90d: signals.interactions90d,
        reciprocity_ratio: signals.reciprocityRatio,
        sentiment_avg: signals.sentimentAvg,
        decay_days: signals.decayDays,
        capacity_cost: signals.capacityCost,
        goal_alignment_score: signals.goalAlignmentScore
      })
      .from(signals)
      .where(eq(signals.userId, userId));

      // Convert to expected format with enhanced metrics
      const formattedSignals = userSignals.map(signal => ({
        contact_id: signal.contact_id,
        last_interaction_at: signal.last_interaction_at?.toISOString(),
        interactions_90d: signal.interactions_90d,
        reciprocity_ratio: signal.reciprocity_ratio / 100,
        sentiment_avg: signal.sentiment_avg / 100,
        decay_days: signal.decay_days,
        dunbar_layer: Math.floor(Math.random() * 5) + 1, // TODO: Calculate actual layer
        relationship_strength: Math.min(10, Math.max(1, 10 - (signal.decay_days / 30))), // Simple calc
        capacity_cost: signal.capacity_cost / 100
      }));

      // Get recent interactions for context
      const recentInteractions = await db.select({
        contact_id: encounter.id, // Will need to join with person_encounter
        interaction_type: encounter.kind,
        timestamp: encounter.occurredAt,
        context: encounter.summary
      })
      .from(encounter)
      .where(eq(encounter.ownerId, userId))
      .orderBy(desc(encounter.occurredAt))
      .limit(50);

      const formattedInteractions = recentInteractions.map(interaction => ({
        contact_id: interaction.contact_id,
        interaction_type: interaction.interaction_type,
        sentiment: Math.random() * 2 - 1, // TODO: Calculate actual sentiment
        timestamp: interaction.timestamp.toISOString(),
        context: interaction.context || undefined
      }));

      // Calculate current workload
      const activeConversations = formattedSignals.filter(s => s.interactions_90d > 0).length;
      const capacityUtilization = formattedSignals.reduce((sum, s) => sum + s.capacity_cost, 0) / formattedSignals.length;

      const currentWorkload = {
        active_conversations: activeConversations,
        pending_outreach: 0, // TODO: Get from suggestions/tasks
        capacity_utilization: capacityUtilization
      };

      const sensemakerInput = {
        userId,
        signals: formattedSignals,
        recent_interactions: formattedInteractions,
        current_workload: currentWorkload
      };

      let action;
      switch (analysis_type) {
        case 'capacity':
          action = await detectCapacityIssues(sensemakerInput);
          break;
        case 'reactivation':
          action = await identifyReactivationOpportunities({
            ...sensemakerInput,
            dormant_threshold_days: 90,
            target_layer: 3
          });
          break;
        default:
          action = await analyzeRelationshipHealth(sensemakerInput);
      }

      // Persist agent event
      await db.insert(agentEvents).values({
        userId,
        goalId: goal_id || null,
        agent: 'sensemaker',
        action: action.action,
        payload: action
      });

      return NextResponse.json(action);

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      
      // Fallback to mock data
      const mockSignals = [
        {
          contact_id: '1',
          last_interaction_at: '2024-01-15T00:00:00Z',
          interactions_90d: 12,
          reciprocity_ratio: 0.8,
          sentiment_avg: 0.7,
          decay_days: 5,
          dunbar_layer: 2,
          relationship_strength: 8,
          capacity_cost: 0.6
        }
      ];

      const mockAction = await analyzeRelationshipHealth({
        userId,
        signals: mockSignals,
        recent_interactions: [],
        current_workload: { active_conversations: 5, pending_outreach: 2, capacity_utilization: 0.7 }
      });

      return NextResponse.json(mockAction);
    }

  } catch (error) {
    console.error('Agent sense error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}