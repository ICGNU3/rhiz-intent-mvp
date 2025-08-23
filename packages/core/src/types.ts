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
  }),
  confidence: z.number().min(0).max(100),
});

export type ConnectionScore = z.infer<typeof ConnectionScore>;

// Suggestion types
export const SuggestionKind = z.enum([
  'introduction',
  'follow_up',
  'reconnect',
  'collaboration',
  'mentorship',
  'investment',
]);

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
  })),
  needs: z.array(z.object({
    description: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
    confidence: z.number().min(0).max(100),
  })),
  offers: z.array(z.object({
    description: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(100),
  })),
  explicitGoals: z.array(z.object({
    kind: IntentKind,
    title: z.string(),
    details: z.string().optional(),
    confidence: z.number().min(0).max(100),
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

// Provider types
export const EnrichmentProvider = z.enum([
  'null',
  'clearbit',
  'apollo',
  'hunter',
  'slack',
  'google',
]);

export type EnrichmentProvider = z.infer<typeof EnrichmentProvider>;

export const EnrichmentData = z.object({
  provider: EnrichmentProvider,
  personId: z.string(),
  claims: z.array(z.object({
    key: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(100),
    source: z.string(),
  })),
  metadata: z.record(z.any()),
});

export type EnrichmentData = z.infer<typeof EnrichmentData>;
