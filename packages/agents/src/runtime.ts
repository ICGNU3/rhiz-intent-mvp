import OpenAI from 'openai';
import { RhizActionSchema, type RhizAction } from './schema';

// OpenAI client configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CallOpenAIParams {
  system: string;
  user: string;
  schema: typeof RhizActionSchema;
}

export async function callOpenAI({ system, user, schema }: CallOpenAIParams): Promise<RhizAction> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: system
        },
        {
          role: "user", 
          content: user
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rhiz_action",
          schema: schema,
          strict: true
        }
      },
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return JSON.parse(content) as RhizAction;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    throw new Error(`Agent call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}