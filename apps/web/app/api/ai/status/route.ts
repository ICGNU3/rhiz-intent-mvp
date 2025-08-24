import { NextResponse } from 'next/server';
import { getModelInfo, isAIConfigured } from '@/lib/ai';

export async function GET() {
  const modelInfo = getModelInfo();
  
  return NextResponse.json({
    configured: isAIConfigured(),
    ...modelInfo,
    features: {
      transcription: !!process.env.OPENAI_API_KEY,
      chat: isAIConfigured(),
      insights: isAIConfigured(),
      extraction: isAIConfigured(),
    },
    providers: {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        models: ['gpt-4-turbo-preview', 'gpt-3.5-turbo', 'whisper-1'],
      },
      anthropic: {
        configured: !!process.env.ANTHROPIC_API_KEY,
        models: ['claude-3-sonnet'],
      },
    },
    message: isAIConfigured() 
      ? 'AI features are configured and ready' 
      : 'AI features will use mock data (no API keys configured)',
  });
}