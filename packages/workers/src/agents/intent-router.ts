import { Job } from 'bullmq';
import { db, goal, eventLog } from '@rhiz/db';
import { addJob, QUEUE_NAMES } from '../queue';
import { ModelRouter } from '@rhiz/core';
import { VoiceExtraction, CalendarEvent } from '@rhiz/core';

interface IngestedEvent {
  ownerId: string;
  type: 'calendar' | 'voice';
  data: CalendarEvent | VoiceExtraction;
  source: string;
  timestamp: string;
}

export async function intentRouterHandler(job: Job<IngestedEvent>) {
  const { ownerId, type, data, source, timestamp } = job.data;
  
  console.log(`IntentRouter processing ${type} event for ${ownerId}`);
  
  try {
    const modelRouter = new ModelRouter();
    const goals: Array<{
      kind: string;
      title: string;
      details?: string;
      confidence: number;
    }> = [];
    
    // Extract goals based on event type
    if (type === 'voice' && 'explicitGoals' in data) {
      const voiceData = data as VoiceExtraction;
      
      // Add explicit goals from voice note
      goals.push(...voiceData.explicitGoals.map(g => ({
        kind: g.kind,
        title: g.title,
        details: g.details,
        confidence: g.confidence,
      })));
      
      // Extract implicit goals from needs
      voiceData.needs.forEach(need => {
        if (need.confidence > 70) {
          goals.push({
            kind: 'custom',
            title: `Address: ${need.description}`,
            details: `Urgency: ${need.urgency}`,
            confidence: need.confidence,
          });
        }
      });
    } else if (type === 'calendar' && 'attendees' in data) {
      const calendarData = data as CalendarEvent;
      
      // Extract goals from calendar event title/description
      const text = `${calendarData.title} ${calendarData.description || ''}`.toLowerCase();
      
      if (text.includes('fundraising') || text.includes('investor') || text.includes('pitch')) {
        goals.push({
          kind: 'raise_seed',
          title: 'Fundraising discussion',
          details: `From calendar event: ${calendarData.title}`,
          confidence: 80,
        });
      }
      
      if (text.includes('hiring') || text.includes('interview') || text.includes('candidate')) {
        goals.push({
          kind: 'hire_engineer',
          title: 'Hiring discussion',
          details: `From calendar event: ${calendarData.title}`,
          confidence: 75,
        });
      }
      
      if (text.includes('mentor') || text.includes('advice') || text.includes('guidance')) {
        goals.push({
          kind: 'find_mentor',
          title: 'Seeking mentorship',
          details: `From calendar event: ${calendarData.title}`,
          confidence: 70,
        });
      }
    }
    
    // Create or update goals
    for (const goalData of goals) {
      if (goalData.confidence > 60) {
        // Check if similar goal already exists
        const existingGoal = await db
          .select()
          .from(goal)
          .where(({ and, eq, like }) => 
            and(
              eq(goal.ownerId, ownerId),
              eq(goal.kind, goalData.kind),
              like(goal.title, `%${goalData.title.split(' ').slice(0, 3).join(' ')}%`)
            )
          )
          .limit(1);
        
        if (existingGoal.length === 0) {
          // Create new goal
          const [newGoal] = await db.insert(goal).values({
            ownerId,
            kind: goalData.kind,
            title: goalData.title,
            details: goalData.details,
            status: 'active',
          }).returning();
          
          console.log(`Created new goal: ${newGoal.id}`);
          
          // Log event
          await db.insert(eventLog).values({
            ownerId,
            event: 'goal_created',
            entityType: 'goal',
            entityId: newGoal.id,
            metadata: {
              source,
              confidence: goalData.confidence,
              extractedFrom: type,
            },
          });
          
          // Trigger matching for this goal
          await addJob(QUEUE_NAMES.GOALS_UPDATED, {
            ownerId,
            goalId: newGoal.id,
            action: 'created',
          });
        } else {
          // Update existing goal
          const existing = existingGoal[0];
          await db
            .update(goal)
            .set({
              details: existing.details 
                ? `${existing.details}\n\nAdditional context: ${goalData.details}`
                : goalData.details,
            })
            .where(({ eq }) => eq(goal.id, existing.id));
          
          console.log(`Updated existing goal: ${existing.id}`);
          
          // Log event
          await db.insert(eventLog).values({
            ownerId,
            event: 'goal_updated',
            entityType: 'goal',
            entityId: existing.id,
            metadata: {
              source,
              confidence: goalData.confidence,
              extractedFrom: type,
            },
          });
          
          // Trigger matching for this goal
          await addJob(QUEUE_NAMES.GOALS_UPDATED, {
            ownerId,
            goalId: existing.id,
            action: 'updated',
          });
        }
      }
    }
    
    // Log the ingestion event
    await db.insert(eventLog).values({
      ownerId,
      event: 'event_ingested',
      entityType: type,
      metadata: {
        source,
        timestamp,
        goalsExtracted: goals.length,
        goalsCreated: goals.filter(g => g.confidence > 60).length,
      },
    });
    
    console.log(`IntentRouter completed for ${ownerId}, extracted ${goals.length} goals`);
    
    return {
      goalsExtracted: goals.length,
      goalsCreated: goals.filter(g => g.confidence > 60).length,
    };
    
  } catch (error) {
    console.error('IntentRouter failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'intent_router_error',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        source,
        timestamp,
      },
    });
    
    throw error;
  }
}
