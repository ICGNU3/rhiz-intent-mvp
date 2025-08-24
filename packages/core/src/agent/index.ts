import { AgentRouter } from './router';
import { NLU } from './nlu';
import { AgentExecutor } from './executor';
import { AgentResponder } from './respond';
import { AgentTask, Parse, AgentResponse } from '../types';
import { ModelRouter } from '../llm';

/**
 * Main agent orchestrator
 * Coordinates router, NLU, executor, and responder
 */
export class Agent {
  private nlu: NLU;
  private executor: AgentExecutor;
  
  constructor(modelRouter: ModelRouter) {
    this.nlu = new NLU(modelRouter);
    this.executor = new AgentExecutor();
  }
  
  /**
   * Process user input and return agent response
   */
  async process(
    text: string,
    context: {
      workspaceId: string;
      userId: string;
      conversationId: string;
    }
  ): Promise<AgentResponse> {
    try {
      // Step 1: Route to determine tasks
      const tasks = AgentRouter.route(text);
      
      // Step 2: Parse user input
      const parse = await this.nlu.parse(text);
      parse.actions = tasks; // Add routed tasks to parse
      
      // Step 3: Execute tasks
      const responses: Partial<AgentResponse>[] = [];
      
      for (const task of tasks) {
        const response = await this.executor.execute(task, parse, context);
        responses.push(response);
      }
      
      // Step 4: Combine responses
      return this.combineResponses(responses);
      
    } catch (error) {
      console.error('Agent processing error:', error);
      return AgentResponder.error('Failed to process your request');
    }
  }
  
  /**
   * Combine multiple task responses into a single response
   */
  private combineResponses(responses: Partial<AgentResponse>[]): AgentResponse {
    if (responses.length === 0) {
      return AgentResponder.textOnly("I'm not sure how to help with that.");
    }
    
    if (responses.length === 1) {
      return responses[0] as AgentResponse;
    }
    
    // Combine multiple responses
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
    
    return AgentResponder.buildResponse(combinedText, combinedCards);
  }
}

// Export individual components for testing
export { AgentRouter, NLU, AgentExecutor, AgentResponder };
