import { generateText, streamText } from 'ai';
import { z } from 'zod';
import { models } from './ai';
import { logger } from './logger';
import { n8nClient, N8NTriggerType } from './n8n-client';

// Interview stages for guiding conversation flow
export enum InterviewStage {
  GREETING = 'greeting',
  CONTEXT_GATHERING = 'context_gathering',
  RELATIONSHIP_MAPPING = 'relationship_mapping',
  GOAL_DISCOVERY = 'goal_discovery',
  DEEP_DIVE = 'deep_dive',
  WRAP_UP = 'wrap_up'
}

// Interview context that persists across the conversation
export interface InterviewContext {
  stage: InterviewStage;
  transcript: string[];
  entities: {
    people: Map<string, PersonEntity>;
    organizations: Map<string, OrgEntity>;
    goals: GoalEntity[];
  };
  currentTopic?: string;
  questionsAsked: string[];
  followUpQueue: string[];
}

interface PersonEntity {
  name: string;
  role?: string;
  company?: string;
  relationship?: string;
  context: string[];
  lastMentioned: Date;
}

interface OrgEntity {
  name: string;
  industry?: string;
  size?: string;
  relationship?: string;
  context: string[];
}

interface GoalEntity {
  type: string;
  description: string;
  timeframe?: string;
  blockers?: string[];
  relatedPeople?: string[];
}

// Question templates for different interview stages
const INTERVIEW_QUESTIONS = {
  [InterviewStage.GREETING]: [
    "Hi! I'm here to help you capture and leverage your relationships. What brings you here today?",
    "Tell me about a recent meeting or conversation you'd like to capture.",
    "What's on your mind regarding your professional network?"
  ],
  
  [InterviewStage.CONTEXT_GATHERING]: [
    "Can you tell me more about {topic}?",
    "What was the context of your interaction with {person}?",
    "How did you meet {person}?",
    "What project or initiative brought you together?"
  ],
  
  [InterviewStage.RELATIONSHIP_MAPPING]: [
    "How would you describe your relationship with {person}?",
    "Who else was involved in {context}?",
    "Does {person} know anyone who might be helpful for {goal}?",
    "What's {person}'s role at {company}?",
    "How strong would you say your connection is with {person}?"
  ],
  
  [InterviewStage.GOAL_DISCOVERY]: [
    "What are you hoping to achieve in the next few months?",
    "What kind of introductions would be most valuable to you right now?",
    "Are you looking to hire, raise funding, or find customers?",
    "What's blocking you from reaching {goal}?",
    "Who would be the ideal person to help with {goal}?"
  ],
  
  [InterviewStage.DEEP_DIVE]: [
    "Tell me more about {person}'s background and expertise.",
    "What specific skills or connections does {person} have?",
    "Have you discussed {goal} with {person}?",
    "What did {person} say about {topic}?",
    "Would {person} be open to making an introduction?"
  ],
  
  [InterviewStage.WRAP_UP]: [
    "Is there anything else about {person} I should know?",
    "Any other people from this {context} worth noting?",
    "Would you like me to suggest some introductions based on what we discussed?",
    "Should I set up any follow-up reminders?"
  ]
};

// Dynamic follow-up questions based on entity types
const FOLLOW_UP_TEMPLATES = {
  person_role_missing: "What does {person} do professionally?",
  person_company_missing: "Where does {person} work?",
  relationship_unclear: "How do you know {person}?",
  goal_timeframe_missing: "When are you hoping to achieve {goal}?",
  goal_requirements_missing: "What specifically are you looking for in {goal_context}?",
  connection_potential: "Do you think {person1} and {person2} would benefit from knowing each other?",
  expertise_probe: "What is {person} particularly good at or known for?",
  introduction_readiness: "Would you be comfortable if I drafted an introduction between you and {person}?"
};

export class InterviewAgent {
  private context: InterviewContext;
  private model = models.smart;

  constructor() {
    this.context = this.initializeContext();
  }

  private initializeContext(): InterviewContext {
    return {
      stage: InterviewStage.GREETING,
      transcript: [],
      entities: {
        people: new Map(),
        organizations: new Map(),
        goals: []
      },
      questionsAsked: [],
      followUpQueue: []
    };
  }

  async processUserInput(input: string): Promise<{
    response: string;
    nextQuestion?: string;
    entities: InterviewContext['entities'];
    shouldEndInterview: boolean;
  }> {
    try {
      // Add to transcript
      this.context.transcript.push(`User: ${input}`);

      // Extract entities from the input
      await this.extractEntities(input);

      // Determine next stage based on context
      this.updateStage();

      // Generate contextual response
      const response = await this.generateResponse(input);

      // Generate next question
      const nextQuestion = await this.generateNextQuestion();

      // Check if interview should end
      const shouldEndInterview = this.shouldEndInterview();

      return {
        response,
        nextQuestion,
        entities: this.context.entities,
        shouldEndInterview
      };
    } catch (error) {
      logger.error('Interview processing error:', error);
      throw error;
    }
  }

  private async extractEntities(input: string): Promise<void> {
    const extractionPrompt = `
      Extract entities from this conversational input:
      "${input}"
      
      Previous context:
      ${this.context.transcript.slice(-5).join('\n')}
      
      Currently known people: ${Array.from(this.context.entities.people.keys()).join(', ')}
      Currently known organizations: ${Array.from(this.context.entities.organizations.keys()).join(', ')}
      
      Extract:
      1. People mentioned (names, roles, companies)
      2. Organizations mentioned
      3. Goals or objectives
      4. Relationships between people
      5. Any specific expertise or skills mentioned
    `;

    const { object } = await generateObject({
      model: this.model,
      prompt: extractionPrompt,
      schema: z.object({
        people: z.array(z.object({
          name: z.string(),
          role: z.string().optional(),
          company: z.string().optional(),
          relationship: z.string().optional(),
          expertise: z.array(z.string()).optional()
        })).optional(),
        organizations: z.array(z.object({
          name: z.string(),
          industry: z.string().optional(),
          relationship: z.string().optional()
        })).optional(),
        goals: z.array(z.object({
          type: z.string(),
          description: z.string(),
          timeframe: z.string().optional(),
          relatedPeople: z.array(z.string()).optional()
        })).optional()
      })
    });

    // Update entities in context
    if (object.people) {
      object.people.forEach(person => {
        const existing = this.context.entities.people.get(person.name) || {
          name: person.name,
          context: [],
          lastMentioned: new Date()
        };
        
        const updatedPerson = {
          ...existing,
          ...person,
          context: [...existing.context, input],
          lastMentioned: new Date()
        };
        
        this.context.entities.people.set(person.name, updatedPerson);
        
        // Trigger n8n enrichment for new people
        if (!existing.role || !existing.company) {
          this.triggerPersonEnrichment(updatedPerson);
        }
      });
    }

    if (object.organizations) {
      object.organizations.forEach(org => {
        const existing = this.context.entities.organizations.get(org.name) || {
          name: org.name,
          context: []
        };
        
        const updatedOrg = {
          ...existing,
          ...org,
          context: [...existing.context, input]
        };
        
        this.context.entities.organizations.set(org.name, updatedOrg);
        
        // Trigger n8n enrichment for new organizations
        if (!existing.industry || !existing.size) {
          this.triggerCompanyEnrichment(updatedOrg);
        }
      });
    }

    if (object.goals) {
      this.context.entities.goals.push(...object.goals);
    }
  }

  private updateStage(): void {
    const { people, goals } = this.context.entities;
    const transcriptLength = this.context.transcript.length;

    // Progress through stages based on information gathered
    if (transcriptLength <= 2) {
      this.context.stage = InterviewStage.GREETING;
    } else if (people.size === 0 && goals.length === 0) {
      this.context.stage = InterviewStage.CONTEXT_GATHERING;
    } else if (people.size > 0 && people.size < 3) {
      this.context.stage = InterviewStage.RELATIONSHIP_MAPPING;
    } else if (goals.length === 0) {
      this.context.stage = InterviewStage.GOAL_DISCOVERY;
    } else if (people.size >= 3 || goals.length > 0) {
      this.context.stage = InterviewStage.DEEP_DIVE;
    }

    // Move to wrap up after sufficient conversation
    if (transcriptLength > 15 || (people.size > 5 && goals.length > 2)) {
      this.context.stage = InterviewStage.WRAP_UP;
    }
  }

  private async generateResponse(input: string): Promise<string> {
    const systemPrompt = `
      You are an intelligent interview assistant helping to capture relationship and networking information.
      Current stage: ${this.context.stage}
      Known people: ${Array.from(this.context.entities.people.values()).map(p => `${p.name} (${p.role} at ${p.company})`).join(', ')}
      Known goals: ${this.context.entities.goals.map(g => g.description).join(', ')}
      
      Respond naturally and conversationally to acknowledge what the user said.
      Be encouraging and show interest in their relationships and goals.
      Keep responses concise (1-2 sentences).
    `;

    const { text } = await generateText({
      model: this.model,
      system: systemPrompt,
      prompt: input
    });

    this.context.transcript.push(`Assistant: ${text}`);
    return text;
  }

  private async generateNextQuestion(): Promise<string | undefined> {
    // Check for priority follow-ups first
    if (this.context.followUpQueue.length > 0) {
      return this.context.followUpQueue.shift();
    }

    // Identify missing information for entities
    const missingInfo = this.identifyMissingInformation();
    if (missingInfo) {
      return missingInfo;
    }

    // Get stage-appropriate question
    const stageQuestions = INTERVIEW_QUESTIONS[this.context.stage];
    const unusedQuestions = stageQuestions.filter(q => !this.context.questionsAsked.includes(q));
    
    if (unusedQuestions.length === 0) {
      return undefined;
    }

    // Select and personalize question
    let question = unusedQuestions[0];
    question = this.personalizeQuestion(question);
    
    this.context.questionsAsked.push(question);
    return question;
  }

  private identifyMissingInformation(): string | undefined {
    // Check for people missing key information
    for (const [name, person] of this.context.entities.people) {
      if (!person.role) {
        return FOLLOW_UP_TEMPLATES.person_role_missing.replace('{person}', name);
      }
      if (!person.company) {
        return FOLLOW_UP_TEMPLATES.person_company_missing.replace('{person}', name);
      }
      if (!person.relationship) {
        return FOLLOW_UP_TEMPLATES.relationship_unclear.replace('{person}', name);
      }
    }

    // Check for goals missing information
    for (const goal of this.context.entities.goals) {
      if (!goal.timeframe) {
        return FOLLOW_UP_TEMPLATES.goal_timeframe_missing.replace('{goal}', goal.description);
      }
    }

    return undefined;
  }

  private personalizeQuestion(template: string): string {
    // Replace placeholders with actual entity names
    const people = Array.from(this.context.entities.people.keys());
    const orgs = Array.from(this.context.entities.organizations.keys());
    const goals = this.context.entities.goals.map(g => g.description);

    let question = template;
    
    if (template.includes('{person}') && people.length > 0) {
      const recentPerson = Array.from(this.context.entities.people.values())
        .sort((a, b) => b.lastMentioned.getTime() - a.lastMentioned.getTime())[0];
      question = question.replace('{person}', recentPerson.name);
    }
    
    if (template.includes('{company}') && orgs.length > 0) {
      question = question.replace('{company}', orgs[orgs.length - 1]);
    }
    
    if (template.includes('{goal}') && goals.length > 0) {
      question = question.replace('{goal}', goals[goals.length - 1]);
    }
    
    if (template.includes('{topic}')) {
      question = question.replace('{topic}', this.context.currentTopic || 'that');
    }
    
    if (template.includes('{context}')) {
      const lastContext = this.context.transcript[this.context.transcript.length - 1];
      const contextMatch = lastContext.match(/meeting|conversation|call|lunch|coffee|event/i);
      question = question.replace('{context}', contextMatch ? contextMatch[0] : 'interaction');
    }

    return question;
  }

  private shouldEndInterview(): boolean {
    // End if we're in wrap-up stage and have asked wrap-up questions
    if (this.context.stage === InterviewStage.WRAP_UP) {
      const wrapUpQuestionsAsked = this.context.questionsAsked.filter(q => 
        INTERVIEW_QUESTIONS[InterviewStage.WRAP_UP].includes(q)
      ).length;
      return wrapUpQuestionsAsked >= 2;
    }

    // End if conversation is very long
    return this.context.transcript.length > 30;
  }

  // Get a summary of extracted information
  async getSummary(): Promise<string> {
    const people = Array.from(this.context.entities.people.values());
    const orgs = Array.from(this.context.entities.organizations.values());
    const goals = this.context.entities.goals;

    const summary = `
## Interview Summary

### People Mentioned (${people.length})
${people.map(p => `- **${p.name}**: ${p.role || 'Unknown role'} at ${p.company || 'Unknown company'}`).join('\n')}

### Organizations (${orgs.length})
${orgs.map(o => `- **${o.name}**: ${o.industry || 'Unknown industry'}`).join('\n')}

### Goals Identified (${goals.length})
${goals.map(g => `- ${g.description} (${g.timeframe || 'No timeframe specified'})`).join('\n')}

### Key Relationships
${people.filter(p => p.relationship).map(p => `- ${p.name}: ${p.relationship}`).join('\n')}
    `;

    return summary.trim();
  }

  // Reset for a new interview
  reset(): void {
    this.context = this.initializeContext();
  }

  // Get current context (for persistence/debugging)
  getContext(): InterviewContext {
    return this.context;
  }

  // Load previous context (for resuming interviews)
  loadContext(context: InterviewContext): void {
    this.context = context;
  }

  // Private methods for n8n integration
  private async triggerPersonEnrichment(person: PersonEntity): Promise<void> {
    try {
      await n8nClient.enrichPerson({
        name: person.name,
        email: person.relationship === 'self' ? undefined : undefined, // Don't have email yet
        company: person.company,
        role: person.role
      }, {
        priority: 'medium',
        callback: '/api/webhooks/n8n' // Results come back via webhook
      });

      logger.info('Triggered person enrichment', {
        component: 'interview-agent',
        person: person.name
      });
    } catch (error) {
      logger.error('Failed to trigger person enrichment', error as Error, {
        component: 'interview-agent',
        person: person.name
      });
    }
  }

  private async triggerCompanyEnrichment(org: OrgEntity): Promise<void> {
    try {
      await n8nClient.enrichCompany({
        name: org.name,
        industry: org.industry
      }, {
        priority: 'low',
        callback: '/api/webhooks/n8n'
      });

      logger.info('Triggered company enrichment', {
        component: 'interview-agent',
        company: org.name
      });
    } catch (error) {
      logger.error('Failed to trigger company enrichment', error as Error, {
        component: 'interview-agent',
        company: org.name
      });
    }
  }

  // Trigger full interview processing workflow in n8n
  async triggerInterviewProcessing(metadata?: {
    userId?: string;
    workspaceId?: string;
    conversationId?: string;
    encounterId?: string;
  }): Promise<void> {
    try {
      const summary = await this.getSummary();
      
      await n8nClient.processInterviewEntities({
        conversationId: metadata?.conversationId || 'unknown',
        entities: {
          people: Array.from(this.context.entities.people.values()),
          organizations: Array.from(this.context.entities.organizations.values()),
          goals: this.context.entities.goals
        },
        transcript: this.context.transcript,
        summary
      }, {
        ...metadata,
        priority: 'high',
        callback: '/api/webhooks/n8n'
      });

      logger.info('Triggered comprehensive interview processing', {
        component: 'interview-agent',
        peopleCount: this.context.entities.people.size,
        orgsCount: this.context.entities.organizations.size,
        goalsCount: this.context.entities.goals.length
      });
    } catch (error) {
      logger.error('Failed to trigger interview processing', error as Error, {
        component: 'interview-agent'
      });
    }
  }

  // Trigger relationship analysis between people
  async triggerRelationshipAnalysis(metadata?: any): Promise<void> {
    const people = Array.from(this.context.entities.people.values());
    
    // Only analyze if we have multiple people and at least one goal
    if (people.length < 2 || this.context.entities.goals.length === 0) {
      return;
    }

    try {
      // Create analysis jobs for each pair of people
      for (let i = 0; i < people.length; i++) {
        for (let j = i + 1; j < people.length; j++) {
          await n8nClient.analyzeRelationships({
            person1: people[i],
            person2: people[j],
            context: this.context.transcript.join(' '),
            goals: this.context.entities.goals
          }, {
            ...metadata,
            priority: 'medium',
            callback: '/api/webhooks/n8n'
          });
        }
      }

      logger.info('Triggered relationship analysis', {
        component: 'interview-agent',
        pairCount: (people.length * (people.length - 1)) / 2
      });
    } catch (error) {
      logger.error('Failed to trigger relationship analysis', error as Error, {
        component: 'interview-agent'
      });
    }
  }

  // Trigger email finding for people without emails
  async triggerEmailFinding(metadata?: any): Promise<void> {
    const peopleWithoutEmails = Array.from(this.context.entities.people.values())
      .filter(person => !person.relationship?.includes('email') && person.company);

    for (const person of peopleWithoutEmails) {
      try {
        await n8nClient.findEmail({
          name: person.name,
          company: person.company
        }, {
          ...metadata,
          priority: 'low',
          callback: '/api/webhooks/n8n'
        });
      } catch (error) {
        logger.error('Failed to trigger email finding', error as Error, {
          component: 'interview-agent',
          person: person.name
        });
      }
    }
  }
}