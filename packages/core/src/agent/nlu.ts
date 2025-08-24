import { Parse, AgentTask } from '../types';
import { ModelRouter } from '../llm';

/**
 * Natural Language Understanding component
 * Uses ModelRouter (or mock) to parse user input into structured data
 */
export class NLU {
  private modelRouter: ModelRouter;
  
  constructor(modelRouter: ModelRouter) {
    this.modelRouter = modelRouter;
  }
  
  /**
   * Parse user text into structured data
   */
  async parse(text: string): Promise<Parse> {
    try {
      // For now, use mock parsing since we don't have real LLM integration
      return this.mockParse(text);
    } catch (error) {
      console.error('NLU parse error:', error);
      // Fallback to basic parsing
      return this.fallbackParse(text);
    }
  }
  
  /**
   * Mock parsing for development
   */
  private mockParse(text: string): Parse {
    const lowerText = text.toLowerCase();
    
    // Extract people names (simple heuristic)
    const people = this.extractPeople(text);
    
    // Extract goals
    const goals = this.extractGoals(lowerText);
    
    // Extract facts
    const facts = this.extractFacts(lowerText);
    
    return {
      people,
      goals,
      actions: [], // Will be filled by router
      facts
    };
  }
  
  /**
   * Fallback parsing when LLM fails
   */
  private fallbackParse(text: string): Parse {
    return {
      people: [],
      goals: [],
      actions: [],
      facts: []
    };
  }
  
  /**
   * Extract people names from text
   */
  private extractPeople(text: string): Parse['people'] {
    // Simple name extraction - in real implementation, use NER
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const matches = text.match(namePattern);
    
    if (!matches) return [];
    
    return matches.map(name => ({
      name,
      role: undefined,
      company: undefined
    }));
  }
  
  /**
   * Extract goals from text
   */
  private extractGoals(text: string): Parse['goals'] {
    const goals: Parse['goals'] = [];
    
    // Seed round
    if (text.includes('seed') || text.includes('seed round')) {
      goals.push({
        kind: 'raise_seed',
        title: 'Raise seed round',
        confidence: 90
      });
    }
    
    // Series A
    if (text.includes('series a') || text.includes('series-a')) {
      goals.push({
        kind: 'raise_series_a',
        title: 'Raise Series A',
        confidence: 90
      });
    }
    
    // Hiring
    if (text.includes('hire') || text.includes('hiring')) {
      if (text.includes('engineer') || text.includes('developer')) {
        goals.push({
          kind: 'hire_engineer',
          title: 'Hire engineer',
          confidence: 85
        });
      }
      if (text.includes('designer')) {
        goals.push({
          kind: 'hire_designer',
          title: 'Hire designer',
          confidence: 85
        });
      }
      if (text.includes('sales')) {
        goals.push({
          kind: 'hire_sales',
          title: 'Hire sales person',
          confidence: 85
        });
      }
    }
    
    // Break into market
    if (text.includes('break into') || text.includes('enter market')) {
      goals.push({
        kind: 'break_into_city',
        title: 'Break into new market',
        confidence: 80
      });
    }
    
    return goals;
  }
  
  /**
   * Extract facts from text
   */
  private extractFacts(text: string): Parse['facts'] {
    const facts: Parse['facts'] = [];
    
    // Company mentions
    const companyPattern = /(?:at|from|with) ([A-Z][a-zA-Z\s&]+)/g;
    let match;
    while ((match = companyPattern.exec(text)) !== null) {
      facts.push({
        subject: 'org',
        key: 'company',
        value: match[1].trim()
      });
    }
    
    // Role mentions
    const rolePattern = /(?:is|was|as) (?:a |an )?([a-zA-Z\s]+)/g;
    while ((match = rolePattern.exec(text)) !== null) {
      facts.push({
        subject: 'person',
        key: 'title',
        value: match[1].trim()
      });
    }
    
    return facts;
  }
}
