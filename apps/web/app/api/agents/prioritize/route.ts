import { NextRequest, NextResponse } from 'next/server';
import { db, signals, goal, person, agentEvents, setUserContext, eq, and, sql } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';
import { prioritizeRelationships } from '@rhiz/agents';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goalId, limit = 10 } = body;

    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Get signals for user
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

      // Convert to expected format
      const formattedSignals = userSignals.map(signal => ({
        contact_id: signal.contact_id,
        last_interaction_at: signal.last_interaction_at?.toISOString(),
        interactions_90d: signal.interactions_90d,
        reciprocity_ratio: signal.reciprocity_ratio / 100, // Convert back to 0-1 scale
        sentiment_avg: signal.sentiment_avg / 100,
        decay_days: signal.decay_days,
        role_tags: Array.isArray(signal.role_tags) ? signal.role_tags : [],
        shared_context_tags: Array.isArray(signal.shared_context_tags) ? signal.shared_context_tags : [],
        goal_alignment_score: signal.goal_alignment_score / 100,
        capacity_cost: signal.capacity_cost / 100
      }));

      // Get goal context if provided
      let goalContext;
      if (goalId) {
        const goals = await db.select()
          .from(goal)
          .where(and(eq(goal.id, goalId), eq(goal.ownerId, userId)))
          .limit(1);
        
        if (goals.length > 0) {
          goalContext = {
            id: goals[0].id,
            description: goals[0].details || goals[0].title,
            timeframe: goals[0].status
          };
        }
      }

      // Get network context
      const totalContacts = await db.select({ count: sql`count(*)` })
        .from(person)
        .where(eq(person.ownerId, userId));

      const networkContext = {
        total_contacts: Number(totalContacts[0]?.count || 0),
        active_conversations: formattedSignals.filter(s => s.interactions_90d > 0).length,
        dunbar_layer_counts: {
          "intimate": 0, // TODO: Calculate based on relationship strength
          "close": 0,
          "meaningful": 0,
          "stable": 0,
          "extended": 0
        }
      };

      // Call the Mapper agent
      const mapperInput = {
        userId,
        goal: goalContext,
        signals: formattedSignals,
        network_context: networkContext
      };

      const action = await prioritizeRelationships(mapperInput);

      // Persist agent event
      await db.insert(agentEvents).values({
        userId,
        goalId,
        agent: 'mapper',
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
          role_tags: ['engineer', 'startup'],
          shared_context_tags: ['AI/ML', 'San Francisco'],
          goal_alignment_score: 0.9,
          capacity_cost: 0.6
        }
      ];

      const mockAction = await prioritizeRelationships({
        userId,
        signals: mockSignals
      });

      return NextResponse.json(mockAction);
    }

  } catch (error) {
    console.error('Agent prioritize error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}