import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';
import { models, extractionSchemas } from './ai';
import { Matching } from './matching';
import { logger } from './logger';
import { AIError, handleError } from './errors';
import { 
  GOAL_TYPES, 
  ACTION_TYPES, 
  SENTIMENT_TYPES, 
  URGENCY_LEVELS,
  AI_CONFIG 
} from './constants';

// Enhanced schemas for better structured extraction
const parseSchema = z.object({
  people: z.array(z.object({
    name: z.string().describe('Full name of the person'),
    role: z.string().optional().describe('Their job title or role'),
    company: z.string().optional().describe('Company they work at'),
    context: z.string().optional().describe('Context in which they were mentioned'),
  })).optional(),
  goals: z.array(z.object({
    kind: z.enum([
      GOAL_TYPES.RAISE_SEED,
      GOAL_TYPES.HIRE_ENGINEER,
      GOAL_TYPES.HIRE_DESIGNER,
      GOAL_TYPES.HIRE_SALES,
      GOAL_TYPES.FIND_INVESTOR,
      GOAL_TYPES.FIND_CUSTOMER,
      GOAL_TYPES.LEARN_SKILL,
      GOAL_TYPES.CONNECT
    ]).describe('Type of goal'),
    title: z.string().describe('Human-readable goal title'),
    confidence: z.number().min(0).max(100).describe('Confidence score 0-100'),
    timeframe: z.string().optional().describe('When they want to achieve this'),
    requirements: z.array(z.string()).optional().describe('Specific requirements or constraints'),
  })).optional(),
  actions: z.array(z.enum([
    ACTION_TYPES.CAPTURE_NOTE,
    ACTION_TYPES.SET_GOAL, 
    ACTION_TYPES.FIND_PEOPLE,
    ACTION_TYPES.SUGGEST_INTROS,
    ACTION_TYPES.SCHEDULE_FOLLOWUP,
    ACTION_TYPES.ADD_REMINDER,
    ACTION_TYPES.CLARIFY
  ])).describe('What actions the user wants to take'),
  facts: z.array(z.object({
    subject: z.enum(['person', 'org']).describe('Whether this fact is about a person or organization'),
    key: z.string().describe('The type of fact (e.g., title, company, location)'),
    value: z.string().describe('The actual fact value'),
    confidence: z.number().min(0).max(100).optional().describe('Confidence in this fact'),
  })).optional(),
  sentiment: z.enum([
    SENTIMENT_TYPES.POSITIVE,
    SENTIMENT_TYPES.NEUTRAL,
    SENTIMENT_TYPES.NEGATIVE
  ]).optional().describe('Overall sentiment of the input'),
  urgency: z.enum([
    URGENCY_LEVELS.LOW,
    URGENCY_LEVELS.MEDIUM,
    URGENCY_LEVELS.HIGH
  ]).optional().describe('How urgent this request is'),
});

const agentResponseSchema = z.object({
  text: z.string().describe('Natural language response to the user'),
  cards: z.object({
    people: z.array(z.object({
      id: z.string(),
      name: z.string(),
      role: z.string().optional(),
      company: z.string().optional(),
      lastEncounter: z.string().optional(),
      actions: z.array(z.object({
        label: z.string(),
        action: z.string(),
        data: z.record(z.any()),
      })),
    })).optional(),
    suggestions: z.array(z.object({
      id: z.string(),
      score: z.number(),
      why: z.array(z.string()),
      actions: z.array(z.object({
        label: z.string(),
        action: z.string(),
        data: z.record(z.any()),
      })),
    })).optional(),
    goals: z.array(z.object({
      id: z.string(),
      kind: z.string(),
      title: z.string(),
      status: z.string(),
    })).optional(),
  }).optional(),
  metadata: z.object({
    confidence: z.number().min(0).max(100).optional(),
    processingTime: z.number().optional(),
    modelUsed: z.string().optional(),
  }).optional(),
});

export interface AgentResponse {
  text: string;
  cards?: {
    people?: Array<{
      id: string;
      name: string;
      role?: string;
      company?: string;
      lastEncounter?: string;
      actions: Array<{
        label: string;
        action: string;
        data: any;
      }>;
    }>;
    suggestions?: Array<{
      id: string;
      score: number;
      why: string[];
      actions: Array<{
        label: string;
        action: string;
        data: any;
      }>;
    }>;
    goals?: Array<{
      id: string;
      kind: string;
      title: string;
      status: string;
    }>;
  };
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
}

export interface Parse {
  people?: Array<{ name: string; role?: string; company?: string; context?: string }>;
  goals?: Array<{ 
    kind: string; 
    title?: string; 
    confidence: number;
    timeframe?: string;
    requirements?: string[];
  }>;
  actions: string[];
  facts?: Array<{ 
    subject: 'person'|'org'; 
    key: string; 
    value: string;
    confidence?: number;
  }>;
  sentiment?: string;
  urgency?: string;
}

export class Agent {
  private matching: Matching;

  constructor() {
    this.matching = new Matching();
  }

  async process(text: string, context: any): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Parse user input with structured extraction
      const parse = await this.parseInput(text);
      
      // Step 2: Execute actions based on parse
      const response = await this.executeActions(parse, context);
      
      // Step 3: Generate final response with AI SDK
      const finalResponse = await this.generateResponse(parse, response, text);
      
      return {
        ...finalResponse,
        metadata: {
          confidence: parse.goals?.[0]?.confidence || 75,
          processingTime: Date.now() - startTime,
          modelUsed: models.default?.toString() || 'unknown',
        }
      };
    } catch (error) {
      logger.error('Agent processing error', error as Error, { component: 'agent', action: 'process' });
      return {
        text: "I encountered an issue processing your request. Please try again.",
        metadata: {
          confidence: 0,
          processingTime: Date.now() - startTime,
          modelUsed: 'error',
        }
      };
    }
  }

  async streamProcess(text: string, context: any, onChunk?: (chunk: string) => void): Promise<AgentResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Parse user input
      const parse = await this.parseInput(text);
      
      // Step 2: Execute actions
      const response = await this.executeActions(parse, context);
      
      // Step 3: Stream the response generation
      const streamedText = await this.streamResponse(parse, response, text, onChunk);
      
      return {
        text: streamedText,
        cards: response.cards,
        metadata: {
          confidence: parse.goals?.[0]?.confidence || 75,
          processingTime: Date.now() - startTime,
          modelUsed: models.default?.toString() || 'unknown',
        }
      };
    } catch (error) {
      logger.error('Agent streaming error', error as Error, { component: 'agent', action: 'streamProcess' });
      return {
        text: "I encountered an issue processing your request. Please try again.",
        metadata: {
          confidence: 0,
          processingTime: Date.now() - startTime,
          modelUsed: 'error',
        }
      };
    }
  }

  private async parseInput(text: string): Promise<Parse> {
    if (!models.default) {
      logger.debug('No AI model available, using fallback parsing', { component: 'agent', action: 'parseInput' });
      return this.fallbackParse(text);
    }

    try {
      const { object } = await generateObject({
        model: models.default,
        schema: parseSchema,
        prompt: text,
        system: `You are a natural language parser for a networking assistant. Extract structured data from user input.

Key guidelines:
- Identify people mentioned (names, roles, companies)
- Detect goals and intents (fundraising, hiring, learning, connecting)
- Determine what actions the user wants to take
- Extract relevant facts about people and organizations
- Assess sentiment and urgency

Be thorough but accurate. If uncertain about something, set lower confidence scores.`,
      });

      return object as Parse;
    } catch (error) {
      logger.error('AI parsing failed, using fallback', error as Error, { component: 'agent', action: 'parseInput' });
      return this.fallbackParse(text);
    }
  }

  private async generateResponse(parse: Parse, actionResponse: Partial<AgentResponse>, originalText: string): Promise<AgentResponse> {
    if (!models.default) {
      return actionResponse as AgentResponse;
    }

    try {
      const { object } = await generateObject({
        model: models.default,
        schema: agentResponseSchema,
        prompt: `
Original user input: "${originalText}"

Parsed data:
- People: ${JSON.stringify(parse.people || [])}
- Goals: ${JSON.stringify(parse.goals || [])}
- Actions: ${JSON.stringify(parse.actions)}
- Facts: ${JSON.stringify(parse.facts || [])}
- Sentiment: ${parse.sentiment || 'neutral'}
- Urgency: ${parse.urgency || 'medium'}

Action results: ${JSON.stringify(actionResponse)}

Generate a natural, helpful response that:
1. Acknowledges what the user said
2. Explains what you've done or will do
3. Provides relevant cards/actions
4. Maintains a professional but friendly tone
5. Addresses any urgency or sentiment appropriately
`,
        system: `You are a helpful networking assistant. Generate natural, actionable responses that help users manage their professional relationships and achieve their goals.`,
      });

      return object as AgentResponse;
    } catch (error) {
      logger.error('AI response generation failed', error as Error, { component: 'agent', action: 'generateResponse' });
      return actionResponse as AgentResponse;
    }
  }

  private async streamResponse(parse: Parse, actionResponse: Partial<AgentResponse>, originalText: string, onChunk?: (chunk: string) => void): Promise<string> {
    if (!models.default) {
      return actionResponse.text || "I've processed your request.";
    }

    try {
      const { textStream } = await streamText({
        model: models.default,
        prompt: `
Original user input: "${originalText}"

Parsed data:
- People: ${JSON.stringify(parse.people || [])}
- Goals: ${JSON.stringify(parse.goals || [])}
- Actions: ${JSON.stringify(parse.actions)}
- Sentiment: ${parse.sentiment || 'neutral'}
- Urgency: ${parse.urgency || 'medium'}

Action results: ${JSON.stringify(actionResponse)}

Generate a natural, helpful response that acknowledges what the user said and explains what you've done or will do. Keep it conversational and actionable.`,
        system: `You are a helpful networking assistant. Generate natural, actionable responses that help users manage their professional relationships and achieve their goals.`,
      });

      let fullResponse = '';
      for await (const chunk of textStream) {
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk);
        }
      }

      return fullResponse;
    } catch (error) {
      logger.error('Streaming response generation failed', error as Error, { component: 'agent', action: 'streamResponse' });
      return actionResponse.text || "I've processed your request.";
    }
  }

  private fallbackParse(text: string): Parse {
    const lowerText = text.toLowerCase();
    
    const people = this.extractPeople(text);
    const goals = this.extractGoals(lowerText);
    const actions = this.extractActions(lowerText);
    const facts = this.extractFacts(lowerText);
    
    return { people, goals, actions, facts };
  }

  private extractPeople(text: string): Parse['people'] {
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const matches = text.match(namePattern);
    
    if (!matches) return [];
    
    return matches.map(name => ({
      name,
      role: undefined,
      company: undefined,
      context: undefined
    }));
  }

  private extractGoals(text: string): Parse['goals'] {
    const goals: Parse['goals'] = [];
    
    if (text.includes('seed') || text.includes('seed round') || text.includes('fundraising')) {
      goals.push({
        kind: 'raise_seed',
        title: 'Raise seed round',
        confidence: 90
      });
    }
    
    if (text.includes('hire') || text.includes('hiring')) {
      if (text.includes('engineer') || text.includes('developer')) {
        goals.push({
          kind: 'hire_engineer',
          title: 'Hire engineer',
          confidence: 85
        });
      } else if (text.includes('designer')) {
        goals.push({
          kind: 'hire_designer',
          title: 'Hire designer',
          confidence: 85
        });
      } else if (text.includes('sales')) {
        goals.push({
          kind: 'hire_sales',
          title: 'Hire sales person',
          confidence: 85
        });
      }
    }
    
    if (text.includes('investor') || text.includes('funding')) {
      goals.push({
        kind: 'find_investor',
        title: 'Find investor',
        confidence: 80
      });
    }
    
    return goals;
  }

  private extractActions(text: string): string[] {
    const actions: string[] = [];
    
    if (text.includes('introduce') || text.includes('intro')) {
      actions.push('suggest_intros');
    }
    
    if (text.includes('met') || text.includes('talked') || text.includes('spoke') || text.includes('discussed')) {
      actions.push('capture_note');
    }
    
    if (text.includes('goal') || text.includes('raise') || text.includes('hire') || text.includes('find')) {
      actions.push('set_goal');
    }
    
    if (text.includes('who') || text.includes('find') || text.includes('looking for') || text.includes('know anyone')) {
      actions.push('find_people');
    }
    
    if (text.includes('follow up') || text.includes('followup') || text.includes('remind')) {
      actions.push('schedule_followup');
    }
    
    if (actions.length === 0) {
      actions.push('clarify');
    }
    
    return actions;
  }

  private extractFacts(text: string): Parse['facts'] {
    const facts: Parse['facts'] = [];
    
    // Company mentions
    const companyPattern = /(?:at|from|with) ([A-Z][a-zA-Z\s&]+)/g;
    let match;
    while ((match = companyPattern.exec(text)) !== null) {
      facts.push({
        subject: 'org',
        key: 'company',
        value: match[1].trim(),
        confidence: 70
      });
    }
    
    return facts;
  }

  private async executeActions(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    const responses: Partial<AgentResponse>[] = [];
    
    for (const action of parse.actions) {
      const response = await this.executeAction(action, parse, context);
      responses.push(response);
    }
    
    return this.combineResponses(responses);
  }

  private async executeAction(action: string, parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    switch (action) {
      case 'capture_note':
        return this.captureNote(parse);
      
      case 'set_goal':
        return this.setGoal(parse);
      
      case 'find_people':
        return this.findPeople(parse);
      
      case 'suggest_intros':
        return this.suggestIntros(parse);
      
      case 'schedule_followup':
        return this.scheduleFollowup(parse);
      
      case 'clarify':
        return this.clarify(parse);
      
      default:
        return { text: "I'm not sure how to help with that. Could you clarify?" };
    }
  }

  private async captureNote(parse: Parse): Promise<Partial<AgentResponse>> {
    const people = parse.people || [];
    const facts = parse.facts || [];
    
    let text = "I've captured that note.";
    
    if (people.length > 0) {
      text += ` I've linked it to ${people.map(p => p.name).join(', ')}.`;
    }
    
    if (facts.length > 0) {
      text += ` I've also noted some facts about their roles and companies.`;
    }
    
    return {
      text,
      cards: {
        people: people.map(p => ({
          id: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.name,
          role: p.role,
          company: p.company,
          lastEncounter: 'Just now',
          actions: [
            {
              label: 'Add note',
              action: 'add_note',
              data: { personId: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            },
            {
              label: 'Intro with...',
              action: 'intro_with',
              data: { personId: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            },
            {
              label: 'Schedule follow-up',
              action: 'schedule_followup',
              data: { personId: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            }
          ]
        }))
      }
    };
  }

  private async setGoal(parse: Parse): Promise<Partial<AgentResponse>> {
    const goals = parse.goals || [];
    
    if (goals.length === 0) {
      return {
        text: "What kind of goal would you like to set? For example: 'I want to raise a seed round' or 'I need to hire a React engineer'."
      };
    }
    
    const goal = goals[0];
    
    return {
      text: `I've set a goal for you: ${goal.title}. I'll help you track progress and find relevant connections.`,
      cards: {
        goals: [{
          id: `goal-${goal.kind}`,
          kind: goal.kind,
          title: goal.title || goal.kind,
          status: 'active'
        }]
      }
    };
  }

  private async findPeople(parse: Parse): Promise<Partial<AgentResponse>> {
    // In real implementation, query database for people
    const mockPeople = [
      {
        id: 'sarah-chen',
        name: 'Sarah Chen',
        role: 'CTO',
        company: 'Stripe',
        lastEncounter: '2 days ago',
        actions: [
          {
            label: 'Open',
            action: 'open_person',
            data: { personId: 'sarah-chen' }
          },
          {
            label: 'Add note',
            action: 'add_note',
            data: { personId: 'sarah-chen' }
          },
          {
            label: 'Intro with...',
            action: 'intro_with',
            data: { personId: 'sarah-chen' }
          }
        ]
      }
    ];
    
    return {
      text: "Here are some people in your network who might be relevant:",
      cards: {
        people: mockPeople
      }
    };
  }

  private async suggestIntros(parse: Parse): Promise<Partial<AgentResponse>> {
    const userId = 'demo-user';
    const workspaceId = 'mock-workspace-1';
    
    // Get top suggestions from database
    const suggestions = await this.matching.getTopSuggestions(userId, workspaceId, 3);
    
    const suggestionCards = suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      score: suggestion.score,
      why: suggestion.why?.reasons || ['Based on network analysis'],
      actions: [
        {
          label: 'Draft intro',
          action: 'draft_intro',
          data: { suggestionId: suggestion.id }
        },
        {
          label: 'Accept',
          action: 'accept_suggestion',
          data: { suggestionId: suggestion.id }
        }
      ]
    }));
    
    return {
      text: "Here are some introduction suggestions based on your network:",
      cards: {
        suggestions: suggestionCards
      }
    };
  }

  private async scheduleFollowup(parse: Parse): Promise<Partial<AgentResponse>> {
    const people = parse.people || [];
    
    if (people.length === 0) {
      return {
        text: "Who would you like me to schedule a follow-up with?"
      };
    }
    
    return {
      text: `I've scheduled a follow-up reminder for ${people.map(p => p.name).join(', ')}. I'll notify you when it's time to reach out.`,
      cards: {
        people: people.map(p => ({
          id: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.name,
          role: p.role,
          company: p.company,
          lastEncounter: 'Just now',
          actions: [
            {
              label: 'View reminder',
              action: 'view_reminder',
              data: { personId: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            },
            {
              label: 'Reschedule',
              action: 'reschedule_followup',
              data: { personId: `person-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            }
          ]
        }))
      }
    };
  }

  private async clarify(parse: Parse): Promise<Partial<AgentResponse>> {
    const clarifyingQuestions = [
      "What specific help are you looking for?",
      "Are you looking to meet someone new or follow up with existing contacts?",
      "What's your timeline for this?",
      "What industry or role are you focusing on?"
    ];
    
    return {
      text: `I'd like to help you better. ${clarifyingQuestions[Math.floor(Math.random() * clarifyingQuestions.length)]}`
    };
  }

  private combineResponses(responses: Partial<AgentResponse>[]): AgentResponse {
    if (responses.length === 0) {
      return { text: "I'm not sure how to help with that." };
    }
    
    if (responses.length === 1) {
      return responses[0] as AgentResponse;
    }
    
    const combinedText = responses
      .map(r => r.text)
      .filter(Boolean)
      .join(' ');
    
    const combinedCards = {
      people: responses
        .map(r => r.cards?.people)
        .filter(Boolean)
        .flat()
        .filter((p): p is NonNullable<typeof p> => p !== undefined),
      suggestions: responses
        .map(r => r.cards?.suggestions)
        .filter(Boolean)
        .flat()
        .filter((s): s is NonNullable<typeof s> => s !== undefined),
      goals: responses
        .map(r => r.cards?.goals)
        .filter(Boolean)
        .flat()
        .filter((g): g is NonNullable<typeof g> => g !== undefined)
    };
    
    return {
      text: combinedText,
      cards: combinedCards
    };
  }
}
