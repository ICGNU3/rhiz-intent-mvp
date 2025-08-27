import { z } from 'zod';

// Intent kinds that drive the system
export const IntentKind = z.enum([
  'raise_seed',
  'raise_series_a',
  'hire_engineer',
  'hire_designer',
  'hire_sales',
  'break_into_city',
  'find_mentor',
  'find_cofounder',
  'get_customer',
  'get_partner',
  'learn_skill',
  'speak_conference',
  'write_article',
  'join_board',
  'invest_startup',
  'sell_company',
  'custom',
]);

export type IntentKind = z.infer<typeof IntentKind>;

// Intent Card - the central UI element
export const IntentCard = z.object({
  id: z.string(),
  kind: IntentKind,
  title: z.string(),
  description: z.string(),
  status: z.enum(['active', 'completed', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
  actions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    kind: z.enum(['suggestion', 'task', 'insight']),
    data: z.record(z.any()),
  })),
  insights: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    kind: z.enum(['progress', 'opportunity', 'risk']),
    data: z.record(z.any()),
  })),
});

export type IntentCard = z.infer<typeof IntentCard>;

// Connection scoring types
export const ConnectionScore = z.object({
  score: z.number().min(0).max(100),
  factors: z.object({
    recency: z.number().min(0).max(100),
    frequency: z.number().min(0).max(100),
    affiliation: z.number().min(0).max(100),
    mutualInterests: z.number().min(0).max(100),
    goalAlignment: z.number().min(0).max(100),
    communicationPatterns: z.number().min(0).max(100),
    expertiseComplementarity: z.number().min(0).max(100),
    socialInfluence: z.number().min(0).max(100),
    semanticSimilarity: z.number().min(0).max(100),
  }),
  confidence: z.number().min(0).max(100),
});

export type ConnectionScore = z.infer<typeof ConnectionScore>;

// Person interface for matching
export interface Person {
  id: string;
  fullName: string;
  primaryEmail?: string;
  location?: string;
  claims: Array<{
    key: string;
    value: string;
    confidence: number;
    source: string;
  }>;
  encounters: Array<{
    occurredAt: Date;
    kind: string;
    summary?: string;
  }>;
}

// Goal interface for matching
export interface Goal {
  id: string;
  kind: string;
  title: string;
  details?: string;
}

// Enhanced pair features with semantic similarity
export interface PairFeatures {
  recency: number; // Days since last interaction
  frequency: number; // Interactions per month
  affiliation: number; // Company/school overlap
  mutualInterests: number; // Shared interests/topics
  goalAlignment: number; // How well they match the goal
  locationProximity: number; // Geographic closeness
  networkOverlap: number; // Common connections
  communicationPatterns: number; // Quality of communication
  expertiseComplementarity: number; // Complementary skills
  socialInfluence: number; // Network centrality
  temporalPatterns: number; // Meeting consistency
  semanticSimilarity: number; // Embedding-based similarity
}

// Suggestion types
export const SuggestionKind = z.enum(['introduction', 'follow_up', 'reconnect']);
export type SuggestionKind = z.infer<typeof SuggestionKind>;

export const Suggestion = z.object({
  id: z.string(),
  kind: SuggestionKind,
  personAId: z.string(),
  personBId: z.string(),
  goalId: z.string().optional(),
  score: z.number().min(0).max(100),
  why: z.object({
    reasons: z.array(z.string()),
    mutualInterests: z.array(z.string()),
    context: z.string(),
  }),
  draft: z.object({
    preIntroPing: z.string(),
    doubleOptIntro: z.string(),
  }),
  state: z.enum(['proposed', 'accepted', 'sent', 'completed', 'rejected']),
  createdAt: z.date(),
});

export type Suggestion = z.infer<typeof Suggestion>;

// Voice note extraction types
export const VoiceExtraction = z.object({
  entities: z.array(z.object({
    name: z.string(),
    type: z.enum(['person', 'company', 'location', 'skill', 'goal']),
    confidence: z.number().min(0).max(100),
    context: z.string().optional(),
  })),
  needs: z.array(z.object({
    description: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(100),
    deadline: z.string().optional(),
  })),
  offers: z.array(z.object({
    description: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(100),
    targetAudience: z.string().optional(),
  })),
  explicitGoals: z.array(z.object({
    kind: IntentKind,
    title: z.string(),
    details: z.string().optional(),
    confidence: z.number().min(0).max(100),
    timeline: z.string().optional(),
  })),
  sentiment: z.object({
    overall: z.enum(['positive', 'neutral', 'negative']),
    confidence: z.number().min(0).max(100),
    emotions: z.array(z.string()),
  }),
  actionItems: z.array(z.object({
    description: z.string(),
    assignee: z.string().optional(),
    deadline: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
  })),
});

export type VoiceExtraction = z.infer<typeof VoiceExtraction>;

// Calendar event types
export const CalendarEvent = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  attendees: z.array(z.object({
    email: z.string(),
    name: z.string().optional(),
    responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']),
  })),
  organizer: z.object({
    email: z.string(),
    name: z.string().optional(),
  }),
  location: z.string().optional(),
  source: z.enum(['google', 'outlook', 'ics']),
});

export type CalendarEvent = z.infer<typeof CalendarEvent>;

// Introduction outcome tracking
export const IntroOutcome = z.object({
  suggestionId: z.string(),
  accepted: z.boolean(),
  responded: z.boolean(),
  meetingScheduled: z.boolean(),
  goalProgress: z.number().min(0).max(100),
  notes: z.string().optional(),
  createdAt: z.date(),
});

export type IntroOutcome = z.infer<typeof IntroOutcome>;
