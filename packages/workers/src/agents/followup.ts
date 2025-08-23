import { Job } from 'bullmq';
import { db, suggestion, task, eventLog } from '@rhiz/db';
import { eq, and, gte, lte } from 'drizzle-orm';

interface FollowUpJob {
  ownerId: string;
  suggestionId?: string;
  taskId?: string;
  action: 'schedule_nudge' | 'track_outcome' | 'process_feedback';
  costBudget?: number; // in cents
  tokenBudget?: number;
}

export async function followUpHandler(job: Job<FollowUpJob>) {
  const { ownerId, suggestionId, taskId, action, costBudget = 25, tokenBudget = 500 } = job.data;
  
  console.log(`FollowUp processing ${action} for ${ownerId}`);
  
  try {
    // Track costs and tokens
    let totalCost = 0;
    let totalTokens = 0;
    
    if (action === 'schedule_nudge') {
      // Get accepted suggestions that need follow-up
      const acceptedSuggestions = await db
        .select()
        .from(suggestion)
        .where(({ and, eq, gte }) => 
          and(
            eq(suggestion.ownerId, ownerId),
            eq(suggestion.state, 'accepted'),
            gte(suggestion.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
          )
        );
      
      for (const suggestionRecord of acceptedSuggestions) {
        // Check if we already have a follow-up task
        const existingTask = await db
          .select()
          .from(task)
          .where(({ and, eq, like }) => 
            and(
              eq(task.ownerId, ownerId),
              like(task.title, `%Follow up on intro: ${suggestionRecord.id}%`)
            )
          )
          .limit(1);
        
        if (existingTask.length === 0) {
          // Create follow-up task
          const daysSinceAcceptance = Math.floor(
            (Date.now() - suggestionRecord.createdAt.getTime()) / (24 * 60 * 60 * 1000)
          );
          
          let followUpMessage = '';
          if (daysSinceAcceptance <= 3) {
            followUpMessage = 'Check in on recent introduction';
          } else if (daysSinceAcceptance <= 7) {
            followUpMessage = 'Follow up on introduction outcome';
          } else {
            followUpMessage = 'Long-term follow up on introduction';
          }
          
          await db.insert(task).values({
            ownerId,
            title: `Follow up on intro: ${suggestionRecord.id}`,
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 1 day
            data: {
              suggestionId: suggestionRecord.id,
              personAId: suggestionRecord.aId,
              personBId: suggestionRecord.bId,
              daysSinceAcceptance,
              followUpMessage,
            },
            completed: false,
          });
          
          totalCost += 5; // cents
          totalTokens += 50;
        }
      }
      
    } else if (action === 'track_outcome') {
      if (!suggestionId) {
        throw new Error('suggestionId required for track_outcome action');
      }
      
      // Get suggestion and update outcome
      const suggestionRecord = await db
        .select()
        .from(suggestion)
        .where(({ and, eq }) => 
          and(
            eq(suggestion.id, suggestionId),
            eq(suggestion.ownerId, ownerId)
          )
        )
        .limit(1);
      
      if (suggestionRecord.length === 0) {
        throw new Error(`Suggestion ${suggestionId} not found`);
      }
      
      // Update suggestion state based on outcome
      await db
        .update(suggestion)
        .set({
          state: 'completed',
        })
        .where(eq(suggestion.id, suggestionId));
      
      totalCost += 5; // cents
      totalTokens += 50;
      
    } else if (action === 'process_feedback') {
      if (!taskId) {
        throw new Error('taskId required for process_feedback action');
      }
      
      // Process feedback from completed tasks
      const taskRecord = await db
        .select()
        .from(task)
        .where(({ and, eq }) => 
          and(
            eq(task.id, taskId),
            eq(task.ownerId, ownerId)
          )
        )
        .limit(1);
      
      if (taskRecord.length === 0) {
        throw new Error(`Task ${taskId} not found`);
      }
      
      // Mark task as completed
      await db
        .update(task)
        .set({
          completed: true,
        })
        .where(eq(task.id, taskId));
      
      totalCost += 5; // cents
      totalTokens += 50;
    }
    
    // Check budgets
    if (totalCost > costBudget) {
      throw new Error(`Cost budget exceeded: ${totalCost} > ${costBudget} cents`);
    }
    
    if (totalTokens > tokenBudget) {
      throw new Error(`Token budget exceeded: ${totalTokens} > ${tokenBudget} tokens`);
    }
    
    // Log follow-up event
    await db.insert(eventLog).values({
      ownerId,
      event: 'followup_processed',
      entityType: action === 'schedule_nudge' ? 'suggestion' : 'task',
      entityId: suggestionId || taskId,
      metadata: {
        action,
        cost: totalCost,
        tokens: totalTokens,
        suggestionId,
        taskId,
      },
    });
    
    console.log(`FollowUp completed ${action} for ${ownerId}`);
    
    return {
      action,
      cost: totalCost,
      tokens: totalTokens,
      processed: true,
    };
    
  } catch (error) {
    console.error('FollowUp failed:', error);
    
    // Log error
    await db.insert(eventLog).values({
      ownerId,
      event: 'followup_error',
      entityType: 'task',
      entityId: taskId,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        action,
        suggestionId,
        taskId,
      },
    });
    
    throw error;
  }
}
