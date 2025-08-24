// Mock agent system for development
export interface AgentResponse {
  text: string;
  cards?: {
    people?: Array<{
      id: string;
      name: string;
      role?: string;
      company?: string;
      lastEncounter?: string;
      actions: Array<{
        label: string;
        action: string;
        data: any;
      }>;
    }>;
    suggestions?: Array<{
      id: string;
      score: number;
      why: string[];
      actions: Array<{
        label: string;
        action: string;
        data: any;
      }>;
    }>;
    goals?: Array<{
      id: string;
      kind: string;
      title: string;
      status: string;
    }>;
  };
}

export class MockAgent {
  async process(text: string, context: any): Promise<AgentResponse> {
    const lowerText = text.toLowerCase();
    
    // Simple rule-based responses
    if (lowerText.includes('seed') || lowerText.includes('raise')) {
      return {
        text: "I've set a goal for you: Raise seed round. I'll help you track progress and find relevant connections.",
        cards: {
          goals: [{
            id: 'mock-goal-raise_seed',
            kind: 'raise_seed',
            title: 'Raise seed round',
            status: 'active'
          }]
        }
      };
    }
    
    if (lowerText.includes('hire') || lowerText.includes('engineer')) {
      return {
        text: "I've set a goal for you: Hire engineer. Here are some people in your network who might be relevant:",
        cards: {
          goals: [{
            id: 'mock-goal-hire_engineer',
            kind: 'hire_engineer',
            title: 'Hire engineer',
            status: 'active'
          }],
          people: [
            {
              id: 'mock-sarah-chen',
              name: 'Sarah Chen',
              role: 'CTO',
              company: 'Stripe',
              lastEncounter: '2 days ago',
              actions: [
                {
                  label: 'Open',
                  action: 'open_person',
                  data: { personId: 'mock-sarah-chen' }
                },
                {
                  label: 'Add note',
                  action: 'add_note',
                  data: { personId: 'mock-sarah-chen' }
                },
                {
                  label: 'Intro with...',
                  action: 'intro_with',
                  data: { personId: 'mock-sarah-chen' }
                }
              ]
            },
            {
              id: 'mock-michael-rodriguez',
              name: 'Michael Rodriguez',
              role: 'Senior Engineer',
              company: 'Netflix',
              lastEncounter: '1 week ago',
              actions: [
                {
                  label: 'Open',
                  action: 'open_person',
                  data: { personId: 'mock-michael-rodriguez' }
                },
                {
                  label: 'Add note',
                  action: 'add_note',
                  data: { personId: 'mock-michael-rodriguez' }
                },
                {
                  label: 'Intro with...',
                  action: 'intro_with',
                  data: { personId: 'mock-michael-rodriguez' }
                }
              ]
            }
          ]
        }
      };
    }
    
    if (lowerText.includes('introduce') || lowerText.includes('intro')) {
      return {
        text: "Here are some introduction suggestions based on your network:",
        cards: {
          suggestions: [
            {
              id: 'mock-suggestion-1',
              score: 85,
              why: [
                'Both work in fintech',
                'Sarah is hiring engineers',
                'Michael has relevant experience'
              ],
              actions: [
                {
                  label: 'Draft intro',
                  action: 'draft_intro',
                  data: { suggestionId: 'mock-suggestion-1' }
                },
                {
                  label: 'Accept',
                  action: 'accept_suggestion',
                  data: { suggestionId: 'mock-suggestion-1' }
                }
              ]
            },
            {
              id: 'mock-suggestion-2',
              score: 72,
              why: [
                'Both interested in React',
                'Similar company stage',
                'Complementary skills'
              ],
              actions: [
                {
                  label: 'Draft intro',
                  action: 'draft_intro',
                  data: { suggestionId: 'mock-suggestion-2' }
                },
                {
                  label: 'Accept',
                  action: 'accept_suggestion',
                  data: { suggestionId: 'mock-suggestion-2' }
                }
              ]
            }
          ]
        }
      };
    }
    
    if (lowerText.includes('met') || lowerText.includes('talked') || lowerText.includes('spoke')) {
      return {
        text: "I've captured that note. I've linked it to the people mentioned and noted some facts about their roles and companies.",
        cards: {
          people: [
            {
              id: 'mock-person-1',
              name: 'Sarah Chen',
              role: 'CTO',
              company: 'Stripe',
              lastEncounter: 'Just now',
              actions: [
                {
                  label: 'Add note',
                  action: 'add_note',
                  data: { personId: 'mock-person-1' }
                },
                {
                  label: 'Intro with...',
                  action: 'intro_with',
                  data: { personId: 'mock-person-1' }
                }
              ]
            }
          ]
        }
      };
    }
    
    // Default response
    return {
      text: "I'd like to help you better. What specific help are you looking for? Are you looking to meet someone new or follow up with existing contacts?"
    };
  }
}

export class MockModelRouter {
  // Mock implementation
}

export class MockMatching {
  // Mock implementation
}
