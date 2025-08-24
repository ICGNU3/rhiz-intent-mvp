import { AgentResponse, AgentTask } from '../types';

/**
 * Builds the agent's reply with natural language text and structured data
 */
export class AgentResponder {
  /**
   * Build a complete agent response
   */
  static buildResponse(
    text: string,
    cards?: AgentResponse['cards']
  ): AgentResponse {
    return {
      text,
      cards
    };
  }
  
  /**
   * Build a simple text-only response
   */
  static textOnly(text: string): AgentResponse {
    return {
      text
    };
  }
  
  /**
   * Build a response with people cards
   */
  static withPeople(
    text: string,
    people: NonNullable<AgentResponse['cards']>['people']
  ): AgentResponse {
    return {
      text,
      cards: {
        people
      }
    };
  }
  
  /**
   * Build a response with suggestion cards
   */
  static withSuggestions(
    text: string,
    suggestions: AgentResponse['cards']['suggestions']
  ): AgentResponse {
    return {
      text,
      cards: {
        suggestions
      }
    };
  }
  
  /**
   * Build a response with goal cards
   */
  static withGoals(
    text: string,
    goals: AgentResponse['cards']['goals']
  ): AgentResponse {
    return {
      text,
      cards: {
        goals
      }
    };
  }
  
  /**
   * Build a clarifying response
   */
  static clarify(task: AgentTask, context?: string): AgentResponse {
    const clarifications = {
      capture_note: "Who did you meet with and what did you discuss?",
      find_people: "What kind of person are you looking for? What skills or connections do you need?",
      suggest_intros: "Who would you like me to suggest introductions for?",
      draft_intro: "Who would you like me to draft an introduction for?",
      followup: "Who should I create a follow-up task for?",
      set_goal: "What goal would you like to set? For example: 'raise seed round' or 'hire engineer'",
      clarify: "Could you provide more details about what you're looking for?"
    };
    
    const baseText = clarifications[task] || clarifications.clarify;
    const fullText = context ? `${baseText} ${context}` : baseText;
    
    return {
      text: fullText
    };
  }
  
  /**
   * Build an error response
   */
  static error(message: string): AgentResponse {
    return {
      text: `I encountered an issue: ${message}. Please try again or rephrase your request.`
    };
  }
  
  /**
   * Build a success response with action confirmation
   */
  static success(action: string, details?: string): AgentResponse {
    const baseText = `I've ${action}.`;
    const fullText = details ? `${baseText} ${details}` : baseText;
    
    return {
      text: fullText
    };
  }
}
