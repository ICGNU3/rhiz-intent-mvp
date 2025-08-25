// Shared JSON Schema for all agent responses
// Ensures type safety and consistent outputs across the four-agent system

export const RhizActionSchema = {
  type: "object",
  oneOf: [
    {
      title: "relationship_prioritization",
      type: "object",
      properties: {
        action: { const: "relationship_prioritization" },
        top_contacts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              contact_id: { type: "string" },
              why_now: { type: "string" },
              priority_score: { type: "number" },
              time_window_days: { type: "integer" }
            },
            required: ["contact_id", "priority_score", "time_window_days"]
          }
        }
      },
      required: ["action", "top_contacts"]
    },
    {
      title: "graph_update",
      type: "object",
      properties: {
        action: { const: "graph_update" },
        edges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              relation: { type: "string" },
              weight_delta: { type: "number" }
            },
            required: ["from", "to", "relation"]
          }
        }
      },
      required: ["action", "edges"]
    },
    {
      title: "feedback_digest",
      type: "object",
      properties: {
        action: { const: "feedback_digest" },
        observations: { type: "array", items: { type: "string" } },
        adjustments: { type: "array", items: { type: "string" } }
      },
      required: ["action", "observations"]
    },
    {
      title: "reactivation",
      type: "object",
      properties: {
        action: { const: "reactivation" },
        contacts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              contact_id: { type: "string" },
              prompt_seed: { type: "string" }
            },
            required: ["contact_id"]
          }
        }
      },
      required: ["action", "contacts"]
    },
    {
      title: "outreach_plan",
      type: "object",
      properties: {
        action: { const: "outreach_plan" },
        contact_id: { type: "string" },
        subject: { type: "string" },
        message_draft: { type: "string" },
        follow_up_days: { type: "integer" }
      },
      required: ["action", "contact_id", "message_draft"]
    }
  ]
} as const;

// TypeScript types derived from schema
export type RelationshipPrioritization = {
  action: "relationship_prioritization";
  top_contacts: {
    contact_id: string;
    why_now?: string;
    priority_score: number;
    time_window_days: number;
  }[];
};

export type GraphUpdate = {
  action: "graph_update";
  edges: {
    from: string;
    to: string;
    relation: string;
    weight_delta?: number;
  }[];
};

export type FeedbackDigest = {
  action: "feedback_digest";
  observations: string[];
  adjustments: string[];
};

export type Reactivation = {
  action: "reactivation";
  contacts: {
    contact_id: string;
    prompt_seed?: string;
  }[];
};

export type OutreachPlan = {
  action: "outreach_plan";
  contact_id: string;
  subject?: string;
  message_draft: string;
  follow_up_days: number;
};

export type RhizAction = 
  | RelationshipPrioritization 
  | GraphUpdate 
  | FeedbackDigest 
  | Reactivation 
  | OutreachPlan;