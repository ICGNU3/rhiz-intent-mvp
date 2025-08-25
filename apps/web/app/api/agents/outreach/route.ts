import { NextRequest, NextResponse } from 'next/server';
import { db, person, goal, claim, encounter, agentEvents, setUserContext, eq, and, desc } from '@rhiz/db';
import { getUserId } from '@/lib/auth-mock';
import { planOutreach, craftMessage } from '@rhiz/agents';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contact_id, goal_id, agent_type = 'strategist' } = body;

    if (!contact_id) {
      return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    }

    try {
      // Set user context for RLS
      await setUserContext(userId);

      // Get target contact details
      const contacts = await db.select()
        .from(person)
        .where(and(eq(person.id, contact_id), eq(person.ownerId, userId)))
        .limit(1);

      if (contacts.length === 0) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      const contact = contacts[0];

      // Get contact claims for context
      const contactClaims = await db.select()
        .from(claim)
        .where(and(
          eq(claim.subjectId, contact_id),
          eq(claim.subjectType, 'person'),
          eq(claim.ownerId, userId)
        ))
        .orderBy(desc(claim.confidence));

      // Get goal context if provided
      let goalContext;
      if (goal_id) {
        const goals = await db.select()
          .from(goal)
          .where(and(eq(goal.id, goal_id), eq(goal.ownerId, userId)))
          .limit(1);
        
        if (goals.length > 0) {
          goalContext = {
            id: goals[0].id,
            description: goals[0].details || goals[0].title,
            urgency: 7, // Default urgency
            mutual_benefit_potential: 8 // Default mutual benefit
          };
        }
      }

      // Get relationship history
      const recentEncounters = await db.select()
        .from(encounter)
        .where(eq(encounter.ownerId, userId))
        .orderBy(desc(encounter.occurredAt))
        .limit(10);

      // Build relationship context
      const sharedInterests = contactClaims
        .filter(c => c.key === 'interests')
        .map(c => c.value);
      
      const expertise = contactClaims
        .filter(c => c.key === 'expertise')
        .map(c => c.value);

      const relationshipHistory = {
        interaction_count: recentEncounters.length,
        average_response_time: 24, // Default hours
        preferred_topics: [...sharedInterests, ...expertise],
        successful_outreach_patterns: ['professional', 'helpful'],
        last_positive_interaction: recentEncounters[0]?.occurredAt.toISOString()
      };

      if (agent_type === 'strategist') {
        // Use Strategist for planning
        const strategistInput = {
          userId,
          target_contact: {
            contact_id: contact.id,
            relationship_strength: 7, // Default strength
            dunbar_layer: 3, // Default layer
            last_interaction_at: recentEncounters[0]?.occurredAt.toISOString(),
            preferred_channels: ['email'],
            communication_style: 'professional',
            timezone: 'US/Pacific'
          },
          goal_context: goalContext,
          relationship_history: relationshipHistory,
          current_context: {
            season: 'Q1',
            user_availability: 'normal',
            recent_life_events: []
          }
        };

        const action = await planOutreach(strategistInput);

        // Persist agent event
        await db.insert(agentEvents).values({
          userId,
          goalId: goal_id || null,
          agent: 'strategist',
          action: action.action,
          payload: action
        });

        return NextResponse.json(action);

      } else if (agent_type === 'storyweaver') {
        // Use Storyweaver for message crafting
        const storyweaverInput = {
          userId,
          target_contact: {
            contact_id: contact.id,
            full_name: contact.fullName,
            relationship_strength: 7,
            dunbar_layer: 3,
            communication_preferences: {
              formality_level: 'professional',
              preferred_topics: relationshipHistory.preferred_topics,
              response_patterns: ['thoughtful', 'detailed'],
              tone_preferences: 'warm professional'
            }
          },
          relationship_context: {
            shared_history: recentEncounters.map(e => e.summary || ''),
            mutual_connections: [], // TODO: Get from graph
            shared_interests: sharedInterests,
            recent_developments: [],
            last_conversation_topics: relationshipHistory.preferred_topics,
            successful_interaction_patterns: relationshipHistory.successful_outreach_patterns
          },
          outreach_intent: {
            primary_goal: goalContext?.description || 'Reconnect and explore collaboration',
            mutual_benefit: 'Knowledge sharing and potential collaboration',
            urgency_level: 5,
            desired_outcome: 'Schedule a coffee chat to catch up'
          },
          contextual_hooks: {
            recent_achievements: [],
            shared_experiences: [],
            mutual_interests_updates: sharedInterests,
            industry_developments: [],
            seasonal_opportunities: []
          }
        };

        const action = await craftMessage(storyweaverInput);

        // Persist agent event
        await db.insert(agentEvents).values({
          userId,
          goalId: goal_id || null,
          agent: 'storyweaver',
          action: action.action,
          payload: action
        });

        return NextResponse.json(action);
      }

      return NextResponse.json({ error: 'Invalid agent type' }, { status: 400 });

    } catch (dbError) {
      console.error('Database query failed:', dbError);
      
      // Fallback mock response
      const mockAction = {
        action: 'outreach_plan',
        contact_id: contact_id,
        subject: 'Quick catch-up over coffee?',
        message_draft: 'Hi there! Hope you&apos;ve been doing well. I&apos;d love to catch up and hear about what you&apos;ve been working on lately. Would you be interested in grabbing coffee sometime in the next couple weeks?',
        follow_up_days: 14
      };

      return NextResponse.json(mockAction);
    }

  } catch (error) {
    console.error('Agent outreach error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}