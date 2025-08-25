// STRATEGIST AGENT: Outreach Planning & Timing Optimization
// Develops strategic communication plans with optimal timing

import { runAgent } from './orchestrator';

export interface StrategistInput {
  userId: string;
  target_contact: {
    contact_id: string;
    relationship_strength: number;
    dunbar_layer: number;
    last_interaction_at?: string;
    preferred_channels?: string[];
    communication_style?: string;
    timezone?: string;
    availability_patterns?: object;
  };
  goal_context?: {
    id: string;
    description: string;
    urgency: number;
    mutual_benefit_potential: number;
  };
  relationship_history: {
    interaction_count: number;
    average_response_time: number;
    preferred_topics: string[];
    successful_outreach_patterns: string[];
    last_positive_interaction?: string;
  };
  current_context?: {
    season: string;
    user_availability: string;
    recent_life_events: string[];
    mutual_connections?: string[];
  };
}

export async function planOutreach(input: StrategistInput) {
  return runAgent("strategist", {
    task: "plan_outreach",
    context: "Develop strategic outreach plan considering timing, channel, approach, and follow-up sequence. Optimize for relationship building and goal achievement.",
    ...input
  });
}

export async function optimizeTiming(input: StrategistInput & {
  time_constraints?: string[];
  competing_priorities?: object[];
}) {
  return runAgent("strategist", {
    task: "optimize_timing",
    context: "Determine optimal outreach timing based on recipient patterns, user availability, and contextual factors.",
    ...input
  });
}

export async function sequenceInteractions(input: StrategistInput & {
  interaction_sequence_length?: number;
  relationship_deepening_goals?: string[];
}) {
  return runAgent("strategist", {
    task: "sequence_interactions",
    context: "Plan multi-touch sequence for deepening relationship over time while respecting Dunbar layer constraints.",
    ...input
  });
}