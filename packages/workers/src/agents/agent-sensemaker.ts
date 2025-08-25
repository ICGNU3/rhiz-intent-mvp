// Agent Sensemaker Worker
// Runs daily relationship health analysis and capacity monitoring

import { db, signals, encounter, agentEvents, person, setUserContext, eq, and, sql, desc } from '@rhiz/db';
// import { analyzeRelationshipHealth, detectCapacityIssues } from '@rhiz/agents';

export interface AgentSenseJobData {
  userId: string;
  analysisType?: 'health' | 'capacity' | 'reactivation';
  trigger?: 'scheduled' | 'manual' | 'threshold';
}

export async function processAgentSense(job: any): Promise<any> {
  const { userId, analysisType = 'health', trigger = 'scheduled' }: AgentSenseJobData = job.data;

  console.log(`Processing agent sense job for user ${userId}, analysis: ${analysisType}, trigger: ${trigger}`);

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

    if (userSignals.length === 0) {
      console.log(`No signals found for user ${userId}, skipping sense analysis`);
      return { success: true, reason: 'no_signals' };
    }

    // Convert to expected format with enhanced metrics
    const formattedSignals = userSignals.map(signal => ({
      contact_id: signal.contact_id,
      last_interaction_at: signal.last_interaction_at?.toISOString(),
      interactions_90d: signal.interactions_90d,
      reciprocity_ratio: signal.reciprocity_ratio / 100,
      sentiment_avg: signal.sentiment_avg / 100,
      decay_days: signal.decay_days,
      dunbar_layer: Math.floor(Math.random() * 5) + 1, // TODO: Calculate actual layer
      relationship_strength: Math.min(10, Math.max(1, 10 - (signal.decay_days / 30))),
      capacity_cost: signal.capacity_cost / 100
    }));

    // Get recent interactions for context
    const recentInteractions = await db.select({
      id: encounter.id,
      kind: encounter.kind,
      occurredAt: encounter.occurredAt,
      summary: encounter.summary
    })
    .from(encounter)
    .where(eq(encounter.ownerId, userId))
    .orderBy(desc(encounter.occurredAt))
    .limit(50);

    const formattedInteractions = recentInteractions.map(interaction => ({
      contact_id: interaction.id, // Will need proper person mapping
      interaction_type: interaction.kind,
      sentiment: Math.random() * 2 - 1, // TODO: Calculate actual sentiment
      timestamp: interaction.occurredAt.toISOString(),
      context: interaction.summary || undefined
    }));

    // Calculate current workload
    const activeConversations = formattedSignals.filter(s => s.interactions_90d > 0).length;
    const capacityUtilization = formattedSignals.reduce((sum, s) => sum + s.capacity_cost, 0) / formattedSignals.length;

    const currentWorkload = {
      active_conversations: activeConversations,
      pending_outreach: 0, // TODO: Get from suggestions/tasks
      capacity_utilization: capacityUtilization
    };

    // Prepare input for sensemaker
    const sensemakerInput = {
      userId,
      signals: formattedSignals,
      recent_interactions: formattedInteractions,
      current_workload: currentWorkload
    };

    // Create mock action for now (until agents package is ready)
    let action;
    switch (analysisType) {
      case 'capacity':
        action = {
          action: 'feedback_digest',
          observations: [
            `Managing ${activeConversations} active conversations`,
            `Capacity utilization at ${Math.round(capacityUtilization * 100)}%`,
            'Detected potential overload in Layer 2 relationships'
          ],
          adjustments: [
            'Consider reducing interaction frequency for Layer 4 contacts',
            'Focus on high-priority relationships this week',
            'Schedule relationship maintenance for dormant connections'
          ]
        };
        break;
      case 'reactivation':
        const dormantContacts = formattedSignals.filter(s => s.decay_days > 90);
        action = {
          action: 'reactivation',
          contacts: dormantContacts.slice(0, 5).map(contact => ({
            contact_id: contact.contact_id,
            prompt_seed: `Dormant for ${contact.decay_days} days, was ${contact.relationship_strength}/10 strength`
          }))
        };
        break;
      default:
        action = {
          action: 'feedback_digest',
          observations: [
            `Analyzed ${formattedSignals.length} relationships`,
            `Found ${formattedSignals.filter(s => s.relationship_strength < 5).length} relationships needing attention`,
            `Average reciprocity: ${Math.round(formattedSignals.reduce((sum, s) => sum + s.reciprocity_ratio, 0) / formattedSignals.length * 100)}%`
          ],
          adjustments: [
            'Focus on improving reciprocity with key contacts',
            'Schedule maintenance touches for decaying relationships',
            'Leverage high-strength connections for introductions'
          ]
        };
    }

    // Persist agent event
    await db.insert(agentEvents).values({
      userId,
      goalId: null,
      agent: 'sensemaker',
      action: action.action,
      payload: action
    });

    console.log(`Agent sense completed for user ${userId}:`, action);

    return { success: true, action, analysisType, trigger };

  } catch (error) {
    console.error(`Agent sense job failed for user ${userId}:`, error);
    throw error;
  }
}