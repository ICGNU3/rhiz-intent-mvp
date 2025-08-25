// MAPPER AGENT: Relationship Prioritization & Network Analysis
// Ranks contacts and discovers rhizomatic connections

import { runAgent } from './orchestrator';

export interface MapperInput {
  userId: string;
  goal?: {
    id: string;
    description: string;
    timeframe?: string;
  };
  signals: {
    contact_id: string;
    last_interaction_at?: string;
    interactions_90d: number;
    reciprocity_ratio: number;
    sentiment_avg: number;
    decay_days: number;
    role_tags: string[];
    shared_context_tags: string[];
    goal_alignment_score: number;
    capacity_cost: number;
  }[];
  network_context?: {
    total_contacts: number;
    active_conversations: number;
    dunbar_layer_counts: Record<string, number>;
  };
}

export async function prioritizeRelationships(input: MapperInput) {
  return runAgent("mapper", {
    task: "prioritize_relationships",
    context: "Analyze relationship signals and goal context to rank contacts by priority. Consider Dunbar layer capacity, decay patterns, goal alignment, and reciprocity balance.",
    ...input
  });
}

export async function discoverConnections(input: MapperInput & {
  focus_contact?: string;
  connection_types?: string[];
}) {
  return runAgent("mapper", {
    task: "discover_connections", 
    context: "Find rhizomatic connections between contacts based on shared attributes, temporal overlap, or complementary expertise. Propose new graph edges.",
    ...input
  });
}