import OpenAI from 'openai';
import { VoiceExtraction, IntentKind } from './types';

export class ModelRouter {
  private openai: OpenAI;
  private model: string;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = 'gpt-4-turbo-preview';
  }
  
  async extractFromVoiceNote(transcript: string): Promise<VoiceExtraction> {
    const prompt = `You are a relationship intelligence assistant. Extract structured information from this voice note transcript.

Transcript: "${transcript}"

Extract the following information in JSON format:
1. Entities: People, companies, locations, skills, and goals mentioned
2. Needs: What the speaker needs help with
3. Offers: What the speaker can offer to others
4. Explicit Goals: Specific goals or intents mentioned

Return only valid JSON with this structure:
{
  "entities": [
    {
      "name": "string",
      "type": "person|company|location|skill|goal",
      "confidence": 0-100
    }
  ],
  "needs": [
    {
      "description": "string",
      "urgency": "low|medium|high",
      "confidence": 0-100
    }
  ],
  "offers": [
    {
      "description": "string",
      "value": "string",
      "confidence": 0-100
    }
  ],
  "explicitGoals": [
    {
      "kind": "raise_seed|raise_series_a|hire_engineer|hire_designer|hire_sales|break_into_city|find_mentor|find_cofounder|get_customer|get_partner|learn_skill|speak_conference|write_article|join_board|invest_startup|sell_company|custom",
      "title": "string",
      "details": "string (optional)",
      "confidence": 0-100
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a precise relationship intelligence assistant. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and return
      return {
        entities: parsed.entities || [],
        needs: parsed.needs || [],
        offers: parsed.offers || [],
        explicitGoals: parsed.explicitGoals || [],
      };
    } catch (error) {
      console.error('Voice extraction failed:', error);
      
      // Return empty extraction on error
      return {
        entities: [],
        needs: [],
        offers: [],
        explicitGoals: [],
      };
    }
  }
  
  async draftIntro(
    personA: {
      name: string;
      title?: string;
      company?: string;
      context?: string;
    },
    personB: {
      name: string;
      title?: string;
      company?: string;
      context?: string;
    },
    goal?: {
      kind: IntentKind;
      title: string;
      details?: string;
    },
    mutualInterests?: string[],
    tone: 'professional' | 'casual' | 'enthusiastic' = 'professional'
  ): Promise<{
    preIntroPing: string;
    doubleOptIntro: string;
  }> {
    const toneInstructions = {
      professional: 'Use a professional, business-appropriate tone',
      casual: 'Use a friendly, casual tone',
      enthusiastic: 'Use an enthusiastic, energetic tone',
    };

    const prompt = `You are drafting introduction messages between two people. Create two messages:

Person A: ${personA.name}${personA.title ? ` (${personA.title})` : ''}${personA.company ? ` at ${personA.company}` : ''}${personA.context ? ` - ${personA.context}` : ''}
Person B: ${personB.name}${personB.title ? ` (${personB.title})` : ''}${personB.company ? ` at ${personB.company}` : ''}${personB.context ? ` - ${personB.context}` : ''}
${goal ? `Goal: ${goal.title} (${goal.kind})${goal.details ? ` - ${goal.details}` : ''}` : ''}
${mutualInterests && mutualInterests.length > 0 ? `Mutual Interests: ${mutualInterests.join(', ')}` : ''}
Tone: ${toneInstructions[tone]}

Create two messages:

1. Pre-intro ping to Person A (asking if they're open to an intro)
2. Double-opt intro message (introducing both people to each other)

Return only valid JSON:
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
            content: 'You are a professional networking assistant. Create clear, concise introduction messages.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        preIntroPing: parsed.preIntroPing || 'Hey, would you be open to an intro?',
        doubleOptIntro: parsed.doubleOptIntro || 'Hi, I\'d like to introduce you two.',
      };
    } catch (error) {
      console.error('Intro drafting failed:', error);
      
      // Return fallback messages
      return {
        preIntroPing: `Hey ${personA.name}, I think you'd really connect with ${personB.name}. Would you be open to an intro?`,
        doubleOptIntro: `Hi ${personB.name}, I'd like to introduce you to ${personA.name}. I think you two would have a great conversation.\n\n${personA.name}, ${personB.name} is someone I think you should know.\n\nWould you both be open to connecting?`,
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
