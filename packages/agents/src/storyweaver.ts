// STORYWEAVER AGENT: Message Crafting & Authentic Communication
// Creates personalized messages using real relationship context

import { runAgent } from './orchestrator';

export interface StoryweaverInput {
  userId: string;
  target_contact: {
    contact_id: string;
    full_name: string;
    relationship_strength: number;
    dunbar_layer: number;
    communication_preferences?: {
      formality_level: string;
      preferred_topics: string[];
      response_patterns: string[];
      tone_preferences: string;
    };
  };
  relationship_context: {
    shared_history: string[];
    mutual_connections: string[];
    shared_interests: string[];
    recent_developments: string[];
    last_conversation_topics?: string[];
    successful_interaction_patterns: string[];
  };
  outreach_intent: {
    primary_goal: string;
    secondary_goals?: string[];
    mutual_benefit: string;
    urgency_level: number;
    desired_outcome: string;
  };
  contextual_hooks?: {
    recent_achievements: string[];
    shared_experiences: string[];
    mutual_interests_updates: string[];
    industry_developments: string[];
    seasonal_opportunities: string[];
  };
}

export async function craftMessage(input: StoryweaverInput) {
  return runAgent("storyweaver", {
    task: "craft_message",
    context: "Create authentic, personalized message using real relationship context. Build trust through genuine connection while advancing strategic goals.",
    ...input
  });
}

export async function adaptMessageTone(input: StoryweaverInput & {
  base_message?: string;
  target_tone?: string;
  channel_constraints?: object;
}) {
  return runAgent("storyweaver", {
    task: "adapt_message_tone",
    context: "Adjust message tone and format for specific communication channel while maintaining authenticity and relationship depth.",
    ...input
  });
}

export async function createFollowUpSequence(input: StoryweaverInput & {
  initial_message?: string;
  sequence_length?: number;
  relationship_deepening_milestones?: string[];
}) {
  return runAgent("storyweaver", {
    task: "create_followup_sequence",
    context: "Design follow-up message sequence that naturally progresses relationship depth over time.",
    ...input
  });
}