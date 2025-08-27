import { NextRequest, NextResponse } from 'next/server';
import { isElevenLabsConfigured, getElevenLabsConfig } from '@/lib/elevenlabs';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Testing voice chat infrastructure', { component: 'voice-test' });
    
    // Test ElevenLabs configuration
    const elevenLabsConfigured = isElevenLabsConfigured();
    const elevenLabsConfig = getElevenLabsConfig();
    
    // Debug environment variables
    const envDebug = {
      apiKey: process.env.ELEVENLABS_API_KEY ? 'Set' : 'Not set',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'Not set',
      modelId: process.env.ELEVENLABS_MODEL_ID || 'Not set',
    };
    
    // Test basic functionality
    const testResults = {
      timestamp: new Date().toISOString(),
      elevenLabs: { 
        configured: elevenLabsConfigured,
        config: elevenLabsConfig,
        envDebug,
      },
      features: {
        realTimeTranscription: true,
        aiProcessing: true,
        textToSpeech: elevenLabsConfigured,
        voiceStreaming: true,
      },
      status: 'ready',
      message: elevenLabsConfigured 
        ? 'Voice chat infrastructure is ready!' 
        : 'Voice chat ready but ElevenLabs not configured for TTS'
    };
    
    return NextResponse.json(testResults);
  } catch (error) {
    logger.error('Voice test failed', error instanceof Error ? error : undefined, { component: 'voice-test' });
    return NextResponse.json(
      { 
        error: 'Voice test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
