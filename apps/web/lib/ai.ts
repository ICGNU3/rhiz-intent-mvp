import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';
import { logger } from './logger';
import { AIError, ValidationError } from './errors';
import { AI_CONFIG } from './constants';

// Initialize AI providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configurations with fallback hierarchy
export const models = {
  // OpenAI models
  gpt4: openai('gpt-4-turbo-preview'),
  gpt35: openai('gpt-3.5-turbo'),
  whisper: openai('whisper-1'), // For transcription
  
  // Anthropic models (if API key provided)
  claude3: process.env.ANTHROPIC_API_KEY ? anthropic('claude-3-sonnet-20240229') : null,
  
  // Default model with fallback hierarchy
  get default() {
    if (process.env.OPENAI_API_KEY) return openai('gpt-3.5-turbo');
    if (process.env.ANTHROPIC_API_KEY) return anthropic('claude-3-sonnet-20240229');
    return null;
  },
  
  // Backup model for reliability
  get backup() {
    if (process.env.ANTHROPIC_API_KEY) return anthropic('claude-3-sonnet-20240229');
    if (process.env.OPENAI_API_KEY) return openai('gpt-3.5-turbo');
    return null;
  },
};

// Structured extraction schemas
export const extractionSchemas = {
  // Extract people from voice notes or text
  people: z.object({
    people: z.array(z.object({
      fullName: z.string().describe('Full name of the person'),
      role: z.string().optional().describe('Their job title or role'),
      company: z.string().optional().describe('Company they work at'),
      email: z.string().email().optional().describe('Email address if mentioned'),
      context: z.string().describe('Context in which they were mentioned'),
    })),
  }),
  
  // Extract insights from conversations
  insights: z.object({
    insights: z.array(z.object({
      type: z.enum(['opportunity', 'action_item', 'follow_up', 'introduction']),
      title: z.string().describe('Brief title of the insight'),
      description: z.string().describe('Detailed description'),
      priority: z.enum(['low', 'medium', 'high']),
      relatedPeople: z.array(z.string()).optional(),
    })),
  }),
  
  // Extract goals and intents
  goals: z.object({
    goals: z.array(z.object({
      type: z.enum(['hire', 'fundraise', 'sell', 'learn', 'connect']),
      title: z.string(),
      description: z.string(),
      timeframe: z.string().optional(),
      requirements: z.array(z.string()).optional(),
    })),
  }),
  
  // Extract relationship data
  relationships: z.object({
    relationships: z.array(z.object({
      person1: z.string(),
      person2: z.string(),
      type: z.enum(['colleague', 'friend', 'advisor', 'investor', 'customer', 'partner']),
      strength: z.number().min(1).max(10),
      context: z.string(),
    })),
  }),
};

// Voice transcription with Whisper
export async function transcribeAudio(audioBuffer: ArrayBuffer): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    logger.debug('No OpenAI API key, returning mock transcription', { component: 'ai', operation: 'transcribeAudio' });
    return 'Mock transcription: Discussed project timeline with Sarah Chen and Mike Rodriguez. They can help with frontend and backend respectively.';
  }
  
  try {
    // Convert ArrayBuffer to File-like object for OpenAI
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    logger.error('Transcription error', error as Error, { component: 'ai', operation: 'transcribeAudio' });
    return 'Transcription failed. Please try again.';
  }
}

// Extract structured data from text with retry logic
export async function extractFromText<T>(
  text: string,
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  maxRetries: number = 3
): Promise<T | null> {
  if (!text?.trim()) {
    logger.warn('Empty text provided for extraction', { component: 'ai', operation: 'extractFromText' });
    return null;
  }

  // Input validation and sanitization
  const sanitizedText = text.substring(0, 50000);
  
  let lastError: Error | null = null;
  
  // Try primary model first
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelToUse = attempt === 0 ? models.default : models.backup;
    
    if (!modelToUse) {
      logger.debug('No AI model available', { component: 'ai', operation: 'extractFromText', attempt });
      continue;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      const { object } = await generateObject({
        model: modelToUse,
        schema,
        prompt: sanitizedText,
        system: systemPrompt,
        abortSignal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Validate the response
      const validatedObject = schema.parse(object);
      return validatedObject as T;
      
    } catch (error) {
      lastError = error as Error;
      logger.warn(`AI extraction attempt ${attempt + 1} failed`, {
        component: 'ai',
        operation: 'extractFromText',
        attempt: attempt + 1,
        maxRetries,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Exponential backoff for retries
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  logger.error('All extraction attempts failed', lastError || undefined, { component: 'ai', operation: 'extractFromText' });
  return null;
}

// Generate insights from graph data
export async function generateGraphInsights(
  graphData: any,
  goals: any[]
): Promise<any[]> {
  if (!models.default) {
    return [];
  }
  
  try {
    const prompt = `
      Analyze this network graph data and active goals to generate actionable insights:
      
      Graph Data: ${JSON.stringify(graphData)}
      Active Goals: ${JSON.stringify(goals)}
      
      Generate insights about:
      1. Network gaps that need filling
      2. Potential valuable introductions
      3. Dormant ties to reactivate
      4. Goal alignment opportunities
    `;
    
    const { text } = await generateText({
      model: models.default,
      prompt,
      system: 'You are a network analysis expert. Generate actionable insights from relationship data.',
    });
    
    // Parse insights from text response
    return parseInsightsFromText(text);
  } catch (error) {
    logger.error('Insight generation error', error as Error, { component: 'ai', operation: 'generateGraphInsights' });
    return [];
  }
}

// Stream chat responses with enhanced reliability
export async function streamChatResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onChunk?: (chunk: string) => void,
  maxRetries: number = 3
) {
  if (!models.default && !models.backup) {
    throw new AIError('No AI model configured');
  }
  
  // Validate and sanitize messages
  const sanitizedMessages = messages
    .filter(msg => msg?.content?.trim())
    .map(msg => ({
      ...msg,
      content: msg.content.substring(0, 50000)
    }))
    .slice(-20);
  
  if (sanitizedMessages.length === 0) {
    throw new ValidationError('No valid messages provided');
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelToUse = attempt === 0 ? models.default : models.backup;
    
    if (!modelToUse) continue;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      const { textStream } = await streamText({
        model: modelToUse,
        messages: sanitizedMessages,
        abortSignal: controller.signal,

        temperature: AI_CONFIG.TEMPERATURE,
      });
      
      let fullResponse = '';
      let chunkCount = 0;
      
      for await (const chunk of textStream) {
        chunkCount++;
        fullResponse += chunk;
        
        // Prevent infinite streams
        if (chunkCount > 1000 || fullResponse.length > 100000) {
          // Stop streaming when limit is reached
          break;
        }
        
        if (onChunk) {
          onChunk(chunk);
        }
      }
      
      clearTimeout(timeoutId);
      return fullResponse;
      
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Streaming attempt ${attempt + 1} failed`, {
        component: 'ai',
        operation: 'streamChatResponse',
        attempt: attempt + 1,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw new AIError(`All streaming attempts failed: ${lastError?.message}`);
}

// Helper function to parse insights from text
function parseInsightsFromText(text: string): any[] {
  // Simple parsing logic - in production, use structured extraction
  const insights = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('Gap:') || line.includes('Opportunity:') || line.includes('Introduction:')) {
      insights.push({
        type: 'insight',
        title: line.substring(0, 50),
        description: line,
        confidence: 0.8,
      });
    }
  }
  
  return insights;
}

// Smart suggestion ranking
export async function rankSuggestions(
  suggestions: any[],
  userContext: any
): Promise<any[]> {
  if (!models.default || suggestions.length === 0) {
    return suggestions;
  }
  
  try {
    const { object } = await generateObject({
      model: models.default,
      schema: z.object({
        rankedSuggestions: z.array(z.object({
          id: z.string(),
          score: z.number().min(0).max(100),
          reasoning: z.string(),
        })),
      }),
      prompt: `
        Rank these suggestions based on user context:
        Suggestions: ${JSON.stringify(suggestions)}
        User Context: ${JSON.stringify(userContext)}
      `,
      system: 'You are an expert at ranking professional networking suggestions.',
    });
    
    // Merge rankings with original suggestions
    return suggestions.map(s => {
      const ranking = object.rankedSuggestions.find(r => r.id === s.id);
      return {
        ...s,
        aiScore: ranking?.score || s.score,
        aiReasoning: ranking?.reasoning,
      };
    }).sort((a, b) => (b.aiScore || b.score) - (a.aiScore || a.score));
  } catch (error) {
    logger.error('Ranking error', error as Error, { component: 'ai', operation: 'rankSuggestions' });
    return suggestions;
  }
}

// Check if AI is configured
export function isAIConfigured(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
}

// Get configured model info
export function getModelInfo() {
  return {
    configured: isAIConfigured(),
    provider: process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'none',
    model: models.default ? 'active' : 'inactive',
  };
}