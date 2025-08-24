import { AgentTask, Parse, AgentResponse } from '../types';

/**
 * Executor for agent tasks
 * Handles each agent_task by creating database entities and returning responses
 */
export class AgentExecutor {
  constructor() {
    // Mock matching for now
  }
  
  /**
   * Execute agent tasks and return structured response
   */
  async execute(
    task: AgentTask,
    parse: Parse,
    context: {
      workspaceId: string;
      userId: string;
      conversationId: string;
    }
  ): Promise<Partial<AgentResponse>> {
    switch (task) {
      case 'capture_note':
        return this.captureNote(parse, context);
      
      case 'set_goal':
        return this.setGoal(parse, context);
      
      case 'find_people':
        return this.findPeople(parse, context);
      
      case 'suggest_intros':
        return this.suggestIntros(parse, context);
      
      case 'draft_intro':
        return this.draftIntro(parse, context);
      
      case 'followup':
        return this.followup(parse, context);
      
      case 'clarify':
        return this.clarify(parse, context);
      
      default:
        return { text: "I'm not sure how to help with that. Could you clarify?" };
    }
  }
  
  /**
   * Capture a note/encounter
   */
  private async captureNote(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    // Mock implementation - in real version, create Encounter + Claims
    const people = parse.people || [];
    const facts = parse.facts || [];
    
    let text = "I've captured that note.";
    
    if (people.length > 0) {
      text += ` I've linked it to ${people.map(p => p.name).join(', ')}.`;
    }
    
    if (facts.length > 0) {
      text += ` I've also noted some facts about their roles and companies.`;
    }
    
    return {
      text,
      cards: {
        people: people.map(p => ({
          id: `mock-${p.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: p.name,
          role: p.role,
          company: p.company,
          lastEncounter: 'Just now',
          actions: [
            {
              label: 'Add note',
              action: 'add_note',
              data: { personId: `mock-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            },
            {
              label: 'Intro with...',
              action: 'intro_with',
              data: { personId: `mock-${p.name.toLowerCase().replace(/\s+/g, '-')}` }
            }
          ]
        }))
      }
    };
  }
  
  /**
   * Set a goal
   */
  private async setGoal(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    const goals = parse.goals || [];
    
    if (goals.length === 0) {
      return {
        text: "What kind of goal would you like to set? For example: 'I want to raise a seed round' or 'I need to hire a React engineer'."
      };
    }
    
    // Mock implementation - in real version, create Goal
    const goal = goals[0];
    
    return {
      text: `I've set a goal for you: ${goal.title}. I'll help you track progress and find relevant connections.`,
      cards: {
        goals: [{
          id: `mock-goal-${goal.kind}`,
          kind: goal.kind,
          title: goal.title || goal.kind,
          status: 'active'
        }]
      }
    };
  }
  
  /**
   * Find people in network
   */
  private async findPeople(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    // Mock implementation - in real version, query People + Claims + Edges
    const mockPeople = [
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
    ];
    
    return {
      text: "Here are some people in your network who might be relevant:",
      cards: {
        people: mockPeople
      }
    };
  }
  
  /**
   * Suggest introductions
   */
  private async suggestIntros(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    // Mock implementation - in real version, call existing Matching pipeline
    const mockSuggestions = [
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
    ];
    
    return {
      text: "Here are some introduction suggestions based on your network:",
      cards: {
        suggestions: mockSuggestions
      }
    };
  }
  
  /**
   * Draft an introduction
   */
  private async draftIntro(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    // Mock implementation - in real version, call IntroWriter
    return {
      text: "I've drafted an introduction for you. Here's what I suggest:",
      cards: {
        suggestions: [{
          id: 'mock-draft-1',
          score: 85,
          why: [
            'Professional tone',
            'Clear value proposition',
            'Specific ask'
          ],
          actions: [
            {
              label: 'Send',
              action: 'send_intro',
              data: { draftId: 'mock-draft-1' }
            },
            {
              label: 'Edit',
              action: 'edit_intro',
              data: { draftId: 'mock-draft-1' }
            }
          ]
        }]
      }
    };
  }
  
  /**
   * Create follow-up tasks
   */
  private async followup(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    // Mock implementation - in real version, create Task rows
    return {
      text: "I've created a follow-up task for you. I'll remind you in 3 days to check in."
    };
  }
  
  /**
   * Ask clarifying questions
   */
  private async clarify(parse: Parse, context: any): Promise<Partial<AgentResponse>> {
    const clarifyingQuestions = [
      "What specific help are you looking for?",
      "Are you looking to meet someone new or follow up with existing contacts?",
      "What's your timeline for this?",
      "What industry or role are you focusing on?"
    ];
    
    return {
      text: `I'd like to help you better. ${clarifyingQuestions[Math.floor(Math.random() * clarifyingQuestions.length)]}`
    };
  }
}
