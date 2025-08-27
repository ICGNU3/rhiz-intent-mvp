import { z } from 'zod';
import { OpenAI } from 'openai';
import { VoiceExtraction } from './types';

// Multi-model ensemble for improved reliability
export class ModelEnsemble {
  private openai: OpenAI;
  private models: string[];
  private fallbackModel: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.models = ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    this.fallbackModel = 'gpt-3.5-turbo';
  }

  async extractFromVoiceNote(transcript: string, audioMetadata?: {
    duration: number;
    quality: 'high' | 'medium' | 'low';
    backgroundNoise: boolean;
  }): Promise<VoiceExtraction> {
    const prompt = this.buildVoiceExtractionPrompt(transcript, audioMetadata);
    
    try {
      // Try primary model first
      const primaryResult = await this.extractWithModel(this.models[0], prompt);
      if (primaryResult && this.validateExtraction(primaryResult)) {
        return this.processExtraction(primaryResult);
      }
      
      // Try secondary model if primary fails
      const secondaryResult = await this.extractWithModel(this.models[1], prompt);
      if (secondaryResult && this.validateExtraction(secondaryResult)) {
        return this.processExtraction(secondaryResult);
      }
      
      // Fallback to reliable model
      const fallbackResult = await this.extractWithModel(this.fallbackModel, prompt);
      if (fallbackResult && this.validateExtraction(fallbackResult)) {
        return this.processExtraction(fallbackResult);
      }
      
      // Return minimal extraction if all models fail
      return this.getMinimalExtraction();
      
    } catch (error) {
      console.error('Model ensemble extraction failed:', error);
      return this.getMinimalExtraction();
    }
  }

  private async extractWithModel(model: string, prompt: string): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a precise relationship intelligence assistant. Extract only high-confidence information and be specific about context and details.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return null;

      return JSON.parse(content);
    } catch (error) {
      console.error(`Model ${model} extraction failed:`, error);
      return null;
    }
  }

  private buildVoiceExtractionPrompt(transcript: string, audioMetadata?: any): string {
    return `You are a relationship intelligence assistant. Extract structured information from this voice note transcript.

Transcript: "${transcript}"

${audioMetadata ? `
Audio Quality Context:
- Duration: ${audioMetadata.duration}s
- Quality: ${audioMetadata.quality}
- Background Noise: ${audioMetadata.backgroundNoise ? 'Yes' : 'No'}
` : ''}

Extract the following information in JSON format with high confidence scores only (70+):
1. Entities: People, companies, locations, skills, and goals mentioned
2. Needs: What the speaker needs help with (be specific)
3. Offers: What the speaker can offer to others (be specific)
4. Explicit Goals: Specific goals or intents mentioned
5. Sentiment: Overall sentiment of the voice note
6. Action Items: Specific actions mentioned or implied

Return only valid JSON with this structure:
{
  "entities": [
    {
      "name": "string",
      "type": "person|company|location|skill|goal",
      "confidence": 0-100,
      "context": "string (how this entity was mentioned)"
    }
  ],
  "needs": [
    {
      "description": "string",
      "urgency": "low|medium|high",
      "confidence": 0-100,
      "deadline": "string (if mentioned)"
    }
  ],
  "offers": [
    {
      "description": "string",
      "value": "string",
      "confidence": 0-100,
      "targetAudience": "string (who this offer is for)"
    }
  ],
  "explicitGoals": [
    {
      "kind": "raise_seed|raise_series_a|hire_engineer|hire_designer|hire_sales|break_into_city|find_mentor|find_cofounder|get_customer|get_partner|learn_skill|speak_conference|write_article|join_board|invest_startup|sell_company|custom",
      "title": "string",
      "details": "string (optional)",
      "confidence": 0-100,
      "timeline": "string (if mentioned)"
    }
  ],
  "sentiment": {
    "overall": "positive|neutral|negative",
    "confidence": 0-100,
    "emotions": ["string"]
  },
  "actionItems": [
    {
      "description": "string",
      "assignee": "string (if mentioned)",
      "deadline": "string (if mentioned)",
      "priority": "low|medium|high"
    }
  ]
}`;
  }

  private validateExtraction(extraction: any): boolean {
    try {
      // Basic validation
      if (!extraction || typeof extraction !== 'object') return false;
      
      // Check required fields
      const requiredFields = ['entities', 'needs', 'offers', 'explicitGoals', 'sentiment', 'actionItems'];
      for (const field of requiredFields) {
        if (!Array.isArray(extraction[field])) return false;
      }
      
      // Validate sentiment structure
      if (!extraction.sentiment.overall || !extraction.sentiment.confidence) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  private processExtraction(extraction: any): VoiceExtraction {
    return {
      entities: extraction.entities?.filter((e: any) => e.confidence >= 70) || [],
      needs: extraction.needs?.filter((n: any) => n.confidence >= 70) || [],
      offers: extraction.offers?.filter((o: any) => o.confidence >= 70) || [],
      explicitGoals: extraction.explicitGoals?.filter((g: any) => g.confidence >= 70) || [],
      sentiment: extraction.sentiment || { overall: 'neutral', confidence: 50, emotions: [] },
      actionItems: extraction.actionItems || [],
    };
  }

  private getMinimalExtraction(): VoiceExtraction {
    return {
      entities: [],
      needs: [],
      offers: [],
      explicitGoals: [],
      sentiment: { overall: 'neutral', confidence: 0, emotions: [] },
      actionItems: [],
    };
  }
}

export class ModelRouter {
  private openai: OpenAI;
  private model: string;
  private ensemble: ModelEnsemble;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = 'gpt-4-turbo-preview';
    this.ensemble = new ModelEnsemble();
  }
  
  async extractFromVoiceNote(transcript: string, audioMetadata?: {
    duration: number;
    quality: 'high' | 'medium' | 'low';
    backgroundNoise: boolean;
  }): Promise<VoiceExtraction> {
    // Use ensemble for better reliability
    return this.ensemble.extractFromVoiceNote(transcript, audioMetadata);
  }

  async draftIntro(
    personA: any,
    personB: any,
    goal?: any,
    mutualInterests: string[] = [],
    tone: 'professional' | 'casual' | 'enthusiastic' = 'professional'
  ): Promise<{
    preIntroPing: string;
    doubleOptIntro: string;
  }> {
    const prompt = `Draft two introduction messages for connecting ${personA.name} with ${personB.name}.

Context:
- Person A: ${personA.name} (${personA.title || 'Professional'}) at ${personA.company || 'Company'}
- Person B: ${personB.name} (${personB.title || 'Professional'}) at ${personB.company || 'Company'}
- Goal: ${goal ? goal.title : 'General networking'}
- Mutual Interests: ${mutualInterests.join(', ') || 'None specified'}
- Tone: ${tone}

Create two messages:
1. Pre-intro ping (short, casual message to Person A asking if they're open to an intro)
2. Double-opt-in intro (formal introduction message to both parties)

Return as JSON:
{
  "preIntroPing": "string",
  "doubleOptIntro": "string"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at writing professional introduction messages that lead to successful connections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);
      return {
        preIntroPing: result.preIntroPing || 'Hey! I think you\'d really connect with [Person B]. Would you be open to an intro?',
        doubleOptIntro: result.doubleOptIntro || 'I\'d like to introduce you two...',
      };

    } catch (error) {
      console.error('Intro drafting failed:', error);
      
      // Fallback templates
      return {
        preIntroPing: `Hey ${personA.name}! I think you'd really connect with ${personB.name}. Would you be open to an intro?`,
        doubleOptIntro: `I'd like to introduce you two! ${personA.name} is ${personA.title || 'a professional'} at ${personA.company || 'their company'}, and ${personB.name} is ${personB.title || 'a professional'} at ${personB.company || 'their company'}. I think you'd have a great conversation!`,
      };
    }
  }
  
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
        model: 'whisper-1',
        language: 'en',
      });
      
      return response.text;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
}
