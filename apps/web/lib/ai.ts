import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject, streamText } from 'ai';
import { z } from 'zod';

// Initialize AI providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  compatibility: 'strict',
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configurations
export const models = {
  // OpenAI models
  gpt4: openai('gpt-4-turbo-preview'),
  gpt35: openai('gpt-3.5-turbo'),
  whisper: openai('whisper-1'), // For transcription
  
  // Anthropic models (if API key provided)
  claude3: process.env.ANTHROPIC_API_KEY ? anthropic('claude-3-sonnet-20240229') : null,
  
  // Default model based on available API keys
  default: process.env.OPENAI_API_KEY ? openai('gpt-3.5-turbo') : null,
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
    console.log('No OpenAI API key, returning mock transcription');
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
    console.error('Transcription error:', error);
    return 'Transcription failed. Please try again.';
  }
}

// Extract structured data from text
export async function extractFromText<T>(
  text: string,
  schema: z.ZodSchema<T>,
  systemPrompt: string
): Promise<T | null> {
  if (!models.default) {
    console.log('No AI model available, returning null');
    return null;
  }
  
  try {
    const { object } = await generateObject({
      model: models.default,
      schema,
      prompt: text,
      system: systemPrompt,
    });
    
    return object as T;
  } catch (error) {
    console.error('Extraction error:', error);
    return null;
  }
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
    console.error('Insight generation error:', error);
    return [];
  }
}

// Stream chat responses
export async function streamChatResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onChunk?: (chunk: string) => void
) {
  if (!models.default) {
    throw new Error('No AI model configured');
  }
  
  const { textStream } = await streamText({
    model: models.default,
    messages,
  });
  
  let fullResponse = '';
  for await (const chunk of textStream) {
    fullResponse += chunk;
    if (onChunk) {
      onChunk(chunk);
    }
  }
  
  return fullResponse;
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
    console.error('Ranking error:', error);
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