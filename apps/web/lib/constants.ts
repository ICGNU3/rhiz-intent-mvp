// Application constants and configuration

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// AI Configuration
export const AI_CONFIG = {
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
  FREQUENCY_PENALTY: 0.0,
  PRESENCE_PENALTY: 0.0,
  TIMEOUT: 45000, // 45 seconds for AI operations
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Base delay for exponential backoff
  MAX_INPUT_LENGTH: 50000, // Maximum input text length
  MAX_RESPONSE_LENGTH: 100000, // Maximum response length
  MAX_CHUNKS: 1000, // Maximum streaming chunks
  MAX_MESSAGES_HISTORY: 20, // Maximum messages to keep in context
  CIRCUIT_BREAKER_THRESHOLD: 5, // Failures before circuit opens
  CIRCUIT_BREAKER_TIMEOUT: 60000, // Time before trying again
} as const;

// Database Configuration
export const DB_CONFIG = {
  MAX_CONNECTIONS: 10,
  IDLE_TIMEOUT: 30000,
  CONNECTION_TIMEOUT: 2000,
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 200,
  PAGINATION_SIZE: 20,
} as const;

// Feature Flags
export const FEATURES = {
  AI_ENABLED: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
  VOICE_ENABLED: process.env.NEXT_PUBLIC_VOICE_ENABLED === 'true',
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  INTEGRATIONS_ENABLED: process.env.NEXT_PUBLIC_INTEGRATIONS_ENABLED === 'true',
} as const;

// Goal Types
export const GOAL_TYPES = {
  RAISE_SEED: 'raise_seed',
  HIRE_ENGINEER: 'hire_engineer',
  HIRE_DESIGNER: 'hire_designer',
  HIRE_SALES: 'hire_sales',
  FIND_INVESTOR: 'find_investor',
  FIND_CUSTOMER: 'find_customer',
  LEARN_SKILL: 'learn_skill',
  CONNECT: 'connect',
} as const;

// Action Types
export const ACTION_TYPES = {
  CAPTURE_NOTE: 'capture_note',
  SET_GOAL: 'set_goal',
  FIND_PEOPLE: 'find_people',
  SUGGEST_INTROS: 'suggest_intros',
  SCHEDULE_FOLLOWUP: 'schedule_followup',
  ADD_REMINDER: 'add_reminder',
  CLARIFY: 'clarify',
} as const;

// Sentiment Types
export const SENTIMENT_TYPES = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
} as const;

// Urgency Levels
export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

// Relationship Types
export const RELATIONSHIP_TYPES = {
  COLLEAGUE: 'colleague',
  FRIEND: 'friend',
  ADVISOR: 'advisor',
  INVESTOR: 'investor',
  CUSTOMER: 'customer',
  PARTNER: 'partner',
} as const;

// Integration Types
export const INTEGRATION_TYPES = {
  SLACK: 'slack',
  GOOGLE_CALENDAR: 'google_calendar',
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUGGESTION_READY: 'suggestions.ready',
  SUGGESTION_ACCEPTED: 'suggestions.accepted',
  GOAL_CREATED: 'goals.created',
  FOLLOWUP_DUE: 'followup.due',
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  AI_ERROR: 'AI_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  WORKSPACE_ID: 'rhiz_workspace_id',
  USER_PREFERENCES: 'rhiz_user_preferences',
  THEME: 'rhiz_theme',
  SIDEBAR_COLLAPSED: 'rhiz_sidebar_collapsed',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  PEOPLE: '/people',
  GOALS: '/goals',
  INSIGHTS: '/insights',
  ANALYTICS: '/analytics',
  GRAPH: '/graph',
  REFERRALS: '/referrals',
  SUGGESTIONS: '/suggestions',
  SETTINGS: '/settings',
  SHARE: '/share',
  LEGAL: '/legal',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  PEOPLE: '/api/people',
  GOALS: '/api/goals',
  INSIGHTS: '/api/insights',
  ANALYTICS: '/api/analytics',
  GRAPH: '/api/graph',
  REFERRALS: '/api/referrals',
  SUGGESTIONS: '/api/suggestions',
  INTEGRATIONS: '/api/integrations',
  NOTIFICATIONS: '/api/notifications',
  WORKSPACES: '/api/workspaces',
} as const;

