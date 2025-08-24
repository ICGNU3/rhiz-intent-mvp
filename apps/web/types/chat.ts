// Chat-related type definitions

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: ChatResponseData;
  metadata?: MessageMetadata;
  timestamp?: Date;
}

export interface MessageMetadata {
  confidence?: number;
  processingTime?: number;
  modelUsed?: string;
}

export interface ChatResponseData {
  people?: PersonCard[];
  suggestions?: SuggestionCard[];
  goals?: GoalCard[];
}

export interface PersonCard {
  id: string;
  name: string;
  role?: string;
  company?: string;
  lastEncounter?: string;
  actions: CardAction[];
}

export interface SuggestionCard {
  id: string;
  score: number;
  why: string[];
  actions: CardAction[];
}

export interface GoalCard {
  id: string;
  kind: string;
  title: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
}

export interface CardAction {
  label: string;
  action: string;
  data: Record<string, unknown>;
}

export interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
}

export interface StreamResponse {
  type?: 'start' | 'chunk' | 'complete';
  chunk?: string;
  done?: boolean;
  response?: {
    text: string;
    cards?: ChatResponseData;
    metadata?: MessageMetadata;
  };
  error?: string;
}

// API types
export interface ChatApiRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  stream?: boolean;
  workspaceId?: string;
}

export interface ChatApiResponse {
  response: {
    text: string;
    cards?: ChatResponseData;
    metadata?: MessageMetadata;
  };
}

// Error types
export class ChatError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export class StreamError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'StreamError';
  }
}