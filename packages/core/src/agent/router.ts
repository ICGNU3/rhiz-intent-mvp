import { AgentTask, Parse } from '../types';

/**
 * Cheap intent router using rules first, LLM fallback
 */
export class AgentRouter {
  /**
   * Route user input to agent tasks using rule-based classification
   */
  static route(text: string): AgentTask[] {
    const lowerText = text.toLowerCase();
    
    // Rule-based classification
    if (this.matchesIntroPattern(lowerText)) {
      return ['suggest_intros'];
    }
    
    if (this.matchesCaptureNotePattern(lowerText)) {
      return ['capture_note'];
    }
    
    if (this.matchesFindPeoplePattern(lowerText)) {
      return ['find_people'];
    }
    
    if (this.matchesSetGoalPattern(lowerText)) {
      return ['set_goal'];
    }
    
    if (this.matchesFollowupPattern(lowerText)) {
      return ['followup'];
    }
    
    if (this.matchesDraftIntroPattern(lowerText)) {
      return ['draft_intro'];
    }
    
    // Default to clarify if no clear intent
    return ['clarify'];
  }
  
  private static matchesIntroPattern(text: string): boolean {
    const introKeywords = [
      'introduce', 'intro', 'connect', 'introduction',
      'meet', 'introducing', 'connect me with', 'connect me to'
    ];
    return introKeywords.some(keyword => text.includes(keyword));
  }
  
  private static matchesCaptureNotePattern(text: string): boolean {
    const noteKeywords = [
      'met with', 'talked to', 'spoke with', 'had a meeting',
      'add note', 'note that', 'met', 'talked', 'spoke',
      'coffee', 'lunch', 'dinner', 'call', 'meeting'
    ];
    return noteKeywords.some(keyword => text.includes(keyword));
  }
  
  private static matchesFindPeoplePattern(text: string): boolean {
    const findKeywords = [
      'who should i', 'who in my network', 'find someone',
      'looking for', 'need someone', 'who knows', 'who can help',
      'recommend someone', 'suggest someone'
    ];
    return findKeywords.some(keyword => text.includes(keyword));
  }
  
  private static matchesSetGoalPattern(text: string): boolean {
    const goalKeywords = [
      'goal', 'raise', 'hire', 'break into', 'looking to',
      'want to', 'trying to', 'need to', 'planning to',
      'seed round', 'series a', 'engineer', 'designer', 'sales'
    ];
    return goalKeywords.some(keyword => text.includes(keyword));
  }
  
  private static matchesFollowupPattern(text: string): boolean {
    const followupKeywords = [
      'follow up', 'followup', 'remind', 'reminder',
      'check in', 'checkin', 'reach out', 'contact'
    ];
    return followupKeywords.some(keyword => text.includes(keyword));
  }
  
  private static matchesDraftIntroPattern(text: string): boolean {
    const draftKeywords = [
      'draft', 'write', 'compose', 'create intro',
      'write intro', 'draft intro', 'compose intro'
    ];
    return draftKeywords.some(keyword => text.includes(keyword));
  }
}
