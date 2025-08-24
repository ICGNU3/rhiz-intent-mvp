import { logger } from './logger';

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
  outputFormat: 'mp3' | 'wav' | 'flac';
  sampleRate: number;
}

export interface VoiceSettings {
  stability: number; // 0-1
  similarityBoost: number; // 0-1
  style: number; // 0-1
  useSpeakerBoost: boolean;
}

export interface TTSRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  voiceSettings?: Partial<VoiceSettings>;
  outputFormat?: 'mp3' | 'wav' | 'flac';
}

export interface Voice {
  voice_id: string;
  name: string;
  samples: any[];
  category: string;
  fine_tuning: any;
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: VoiceSettings;
  sharing: any;
  high_quality_base_model_ids: string[];
  safety_control: any;
  safety_control_retrieval: any;
  voice_verification: any;
}

class ElevenLabsClient {
  private config: ElevenLabsConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ElevenLabsConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Accept': 'application/json',
      'xi-api-key': this.config.apiKey,
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs API error', new Error(errorText), {
        component: 'elevenlabs',
        endpoint,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    // Handle binary responses (audio data)
    if (options.headers?.['Accept'] === 'audio/*') {
      return response.arrayBuffer() as T;
    }

    return response.json();
  }

  async generateSpeech(request: TTSRequest): Promise<Buffer> {
    try {
      logger.info('Generating speech with ElevenLabs', {
        component: 'elevenlabs',
        textLength: request.text.length,
        voiceId: request.voiceId || this.config.voiceId,
      });

      const voiceId = request.voiceId || this.config.voiceId;
      const modelId = request.modelId || this.config.modelId;
      const outputFormat = request.outputFormat || this.config.outputFormat;

      const response = await this.request<ArrayBuffer>(
        `/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'audio/*',
          },
          body: JSON.stringify({
            text: request.text,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true,
              ...request.voiceSettings,
            },
            output_format: outputFormat,
          }),
        }
      );

      return Buffer.from(response);
    } catch (error) {
      logger.error('Failed to generate speech', error, { component: 'elevenlabs' });
      throw error;
    }
  }

  async getVoices(): Promise<Voice[]> {
    try {
      logger.info('Fetching available voices', { component: 'elevenlabs' });
      
      const response = await this.request<{ voices: Voice[] }>('/voices');
      return response.voices;
    } catch (error) {
      logger.error('Failed to fetch voices', error, { component: 'elevenlabs' });
      throw error;
    }
  }

  async getVoice(voiceId: string): Promise<Voice> {
    try {
      logger.info('Fetching voice details', { component: 'elevenlabs', voiceId });
      
      return await this.request<Voice>(`/voices/${voiceId}`);
    } catch (error) {
      logger.error('Failed to fetch voice', error, { component: 'elevenlabs', voiceId });
      throw error;
    }
  }

  async getModels(): Promise<any[]> {
    try {
      logger.info('Fetching available models', { component: 'elevenlabs' });
      
      const response = await this.request<{ models: any[] }>('/models');
      return response.models;
    } catch (error) {
      logger.error('Failed to fetch models', error, { component: 'elevenlabs' });
      throw error;
    }
  }

  async getHistory(): Promise<any[]> {
    try {
      logger.info('Fetching generation history', { component: 'elevenlabs' });
      
      const response = await this.request<{ history: any[] }>('/history');
      return response.history;
    } catch (error) {
      logger.error('Failed to fetch history', error, { component: 'elevenlabs' });
      throw error;
    }
  }
}

// Default configuration
const defaultConfig: ElevenLabsConfig = {
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  modelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1',
  outputFormat: 'mp3',
  sampleRate: 44100,
};

// Create client instance
const client = new ElevenLabsClient(defaultConfig);

// Export functions for easy use
export async function generateSpeech(text: string, options?: Partial<TTSRequest>): Promise<Buffer> {
  return client.generateSpeech({ text, ...options });
}

export async function getVoices(): Promise<Voice[]> {
  return client.getVoices();
}

export async function getVoice(voiceId: string): Promise<Voice> {
  return client.getVoice(voiceId);
}

export async function getModels(): Promise<any[]> {
  return client.getModels();
}

export async function getHistory(): Promise<any[]> {
  return client.getHistory();
}

// Voice presets for different conversation types
export const VOICE_PRESETS = {
  professional: {
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
    voiceSettings: {
      stability: 0.7,
      similarityBoost: 0.8,
      style: 0.0,
      useSpeakerBoost: true,
    },
  },
  friendly: {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      useSpeakerBoost: true,
    },
  },
  enthusiastic: {
    voiceId: 'VR6AewLTigWG4xSOukaG', // Josh
    voiceSettings: {
      stability: 0.6,
      similarityBoost: 0.8,
      style: 0.5,
      useSpeakerBoost: true,
    },
  },
  calm: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
    voiceSettings: {
      stability: 0.8,
      similarityBoost: 0.7,
      style: 0.0,
      useSpeakerBoost: true,
    },
  },
};

// Helper function to generate speech with preset
export async function generateSpeechWithPreset(
  text: string,
  preset: keyof typeof VOICE_PRESETS = 'professional'
): Promise<Buffer> {
  const presetConfig = VOICE_PRESETS[preset];
  return generateSpeech(text, presetConfig);
}

// Check if ElevenLabs is configured
export function isElevenLabsConfigured(): boolean {
  return !!(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

// Get configuration info
export function getElevenLabsConfig(): Partial<ElevenLabsConfig> {
  return {
    apiKey: process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Not configured',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'Not configured',
    modelId: process.env.ELEVENLABS_MODEL_ID || 'Not configured',
  };
}
