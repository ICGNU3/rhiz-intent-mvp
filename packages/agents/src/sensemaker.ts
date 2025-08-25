// SENSEMAKER AGENT: Signal Analysis & Relationship Health
// Processes interaction patterns and provides cybernetic feedback

import { runAgent } from './orchestrator';

export interface SensemakerInput {
  userId: string;
  signals: {
    contact_id: string;
    last_interaction_at?: string;
    interactions_90d: number;
    reciprocity_ratio: number;
    sentiment_avg: number;
    decay_days: number;
    dunbar_layer: number;
    relationship_strength: number;
    capacity_cost: number;
  }[];
  recent_interactions: {
    contact_id: string;
    interaction_type: string;
    sentiment: number;
    timestamp: string;
    context?: string;
  }[];
  current_workload?: {
    active_conversations: number;
    pending_outreach: number;
    capacity_utilization: number;
  };
}

export async function analyzeRelationshipHealth(input: SensemakerInput) {
  return runAgent("sensemaker", {
    task: "analyze_relationship_health",
    context: "Process relationship signals to identify patterns, imbalances, and maintenance needs. Provide cybernetic feedback for relationship optimization.",
    ...input
  });
}

export async function detectCapacityIssues(input: SensemakerInput) {
  return runAgent("sensemaker", {
    task: "detect_capacity_issues",
    context: "Analyze workload and relationship distribution across Dunbar layers. Flag overload risks and suggest rebalancing strategies.",
    ...input
  });
}

export async function identifyReactivationOpportunities(input: SensemakerInput & {
  dormant_threshold_days?: number;
  target_layer?: number;
}) {
  return runAgent("sensemaker", {
    task: "identify_reactivation_opportunities", 
    context: "Find dormant relationships with high reactivation potential based on historical strength and strategic value.",
    ...input
  });
}