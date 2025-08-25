// Agent Outreach Worker  
// Handles strategic outreach planning and message crafting

import { db, person, goal, claim, encounter, agentEvents, setUserContext, eq, and, desc } from '@rhiz/db';
// import { planOutreach, craftMessage } from '@rhiz/agents';

export interface AgentOutreachJobData {
  userId: string;
  contactId: string;
  goalId?: string;
  agentType?: 'strategist' | 'storyweaver';
  context?: {
    urgency?: number;
    outreach_reason?: string;
    preferred_tone?: string;
  };
}

export async function processAgentOutreach(job: any): Promise<any> {
  const { 
    userId, 
    contactId, 
    goalId, 
    agentType = 'strategist',
    context = {}
  }: AgentOutreachJobData = job.data;

  console.log(`Processing agent outreach job for user ${userId}, contact ${contactId}, agent: ${agentType}`);

  try {
    // Set user context for RLS
    await setUserContext(userId);

    // Get target contact details
    const contacts = await db.select()
      .from(person)
      .where(and(eq(person.id, contactId), eq(person.ownerId, userId)))
      .limit(1);

    if (contacts.length === 0) {
      throw new Error(`Contact ${contactId} not found for user ${userId}`);
    }

    const contact = contacts[0];

    // Get contact claims for context
    const contactClaims = await db.select()
      .from(claim)
      .where(and(
        eq(claim.subjectId, contactId),
        eq(claim.subjectType, 'person'),
        eq(claim.ownerId, userId)
      ))
      .orderBy(desc(claim.confidence));

    // Get goal context if provided
    let goalContext;
    if (goalId) {
      const goals = await db.select()
        .from(goal)
        .where(and(eq(goal.id, goalId), eq(goal.ownerId, userId)))
        .limit(1);
      
      if (goals.length > 0) {
        goalContext = {
          id: goals[0].id,
          description: goals[0].details || goals[0].title,
          urgency: context.urgency || 7,
          mutual_benefit_potential: 8
        };
      }
    }

    // Get relationship history
    const recentEncounters = await db.select()
      .from(encounter)
      .where(eq(encounter.ownerId, userId))
      .orderBy(desc(encounter.occurredAt))
      .limit(10);

    // Build relationship context
    const sharedInterests = contactClaims
      .filter(c => c.key === 'interests')
      .map(c => c.value);
    
    const expertise = contactClaims
      .filter(c => c.key === 'expertise')
      .map(c => c.value);

    // Mock action for now (until agents package is ready)
    let action;

    if (agentType === 'strategist') {
      // Strategic planning focus
      action = {
        action: 'outreach_plan',
        contact_id: contactId,
        subject: generateSubject(contact.fullName, goalContext, context.outreach_reason),
        message_draft: generateStrategicMessage(contact, goalContext, sharedInterests, expertise),
        follow_up_days: calculateFollowUpDays(recentEncounters.length, context.urgency || 5)
      };
    } else if (agentType === 'storyweaver') {
      // Message crafting focus
      action = {
        action: 'outreach_plan',
        contact_id: contactId,
        subject: generateWarmSubject(contact.fullName, sharedInterests),
        message_draft: generatePersonalMessage(contact, sharedInterests, expertise, context.preferred_tone),
        follow_up_days: 14
      };
    }

    // Persist agent event
    await db.insert(agentEvents).values({
      userId,
      goalId: goalId || null,
      agent: agentType,
      action: action.action,
      payload: action
    });

    console.log(`Agent outreach completed for user ${userId}, contact ${contactId}:`, action);

    return { success: true, action, agentType };

  } catch (error) {
    console.error(`Agent outreach job failed for user ${userId}, contact ${contactId}:`, error);
    throw error;
  }
}

// Helper functions for message generation
function generateSubject(contactName: string, goalContext?: any, reason?: string): string {
  const firstName = contactName.split(' ')[0];
  
  if (reason === 'reactivation') {
    return `${firstName} - catching up after a while`;
  }
  
  if (goalContext?.description.includes('funding')) {
    return `${firstName} - exploring potential synergies`;
  }
  
  return `${firstName} - quick catch-up?`;
}

function generateWarmSubject(contactName: string, interests: string[]): string {
  const firstName = contactName.split(' ')[0];
  
  if (interests.length > 0) {
    return `${firstName} - thought you'd find this interesting`;
  }
  
  return `${firstName} - hope you're doing well`;
}

function generateStrategicMessage(
  contact: any, 
  goalContext?: any, 
  interests?: string[], 
  expertise?: string[]
): string {
  const firstName = contact.fullName.split(' ')[0];
  
  let message = `Hi ${firstName},\n\nHope you've been doing well! `;
  
  if (goalContext) {
    message += `I've been working on ${goalContext.description.toLowerCase()} and thought there might be some interesting synergies with what you're doing. `;
  }
  
  if (expertise && expertise.length > 0) {
    message += `Given your expertise in ${expertise[0]}, I'd love to get your perspective. `;
  }
  
  message += `Would you be interested in catching up over coffee sometime in the next couple of weeks?\n\nBest regards`;
  
  return message;
}

function generatePersonalMessage(
  contact: any, 
  interests?: string[], 
  expertise?: string[], 
  tone?: string
): string {
  const firstName = contact.fullName.split(' ')[0];
  const casual = tone === 'casual';
  
  let message = casual 
    ? `Hey ${firstName}!\n\n`
    : `Hi ${firstName},\n\n`;
  
  message += `I was just thinking about you and wondering how things have been going. `;
  
  if (interests && interests.length > 0) {
    message += `I remember you mentioning your interest in ${interests[0]} - have you had a chance to dive deeper into that? `;
  }
  
  message += casual 
    ? `Would love to catch up soon if you're up for it!\n\nCheers`
    : `I'd love to hear what you've been working on lately. Any chance you're free for a coffee chat in the coming weeks?\n\nBest regards`;
  
  return message;
}

function calculateFollowUpDays(encounterCount: number, urgency: number): number {
  // More encounters = shorter follow-up window
  // Higher urgency = shorter follow-up window
  const baseFollowUp = 14;
  const encounterAdjustment = Math.max(0, 5 - encounterCount);
  const urgencyAdjustment = Math.max(0, (10 - urgency) * 2);
  
  return Math.max(7, baseFollowUp + encounterAdjustment + urgencyAdjustment);
}