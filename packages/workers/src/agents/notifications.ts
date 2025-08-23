import { Job } from 'bullmq';
import { db, notification, workspaceMember, integration } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';
import { createSlackIntegration } from '@rhiz/integrations';

// Notification event types
export interface NotificationEvent {
  type: 'suggestions.ready' | 'suggestions.accepted' | 'goals.created';
  workspaceId: string;
  userId: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

// Notification agent handler
export async function notificationHandler(job: Job<NotificationEvent>) {
  const { type, workspaceId, userId, entityId, metadata } = job.data;
  
  try {
    console.log(`Processing notification: ${type} for workspace ${workspaceId}`);
    
    // Create in-app notification
    const notificationMessage = generateNotificationMessage(type, metadata);
    
    await db.insert(notification).values({
      workspaceId,
      userId,
      type: type.replace('.', '_'), // Convert to snake_case
      message: notificationMessage,
    });
    
    // Send Slack notification if integration is connected
    await sendSlackNotification(workspaceId, userId, type, notificationMessage, metadata);
    
    console.log(`Notification processed successfully: ${type}`);
    
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
}

// Generate notification message based on event type
function generateNotificationMessage(type: string, metadata?: Record<string, any>): string {
  switch (type) {
    case 'suggestions.ready':
      return `🎯 New introduction suggestion ready! Check your dashboard for details.`;
    
    case 'suggestions.accepted':
      return `✅ Introduction accepted! We'll help you follow up.`;
    
    case 'goals.created':
      const goalTitle = metadata?.goalTitle || 'New goal';
      return `🎯 New goal created: "${goalTitle}". We'll find relevant connections.`;
    
    default:
      return `📢 New activity in your Rhiz workspace.`;
  }
}

// Send Slack notification if integration is connected
async function sendSlackNotification(
  workspaceId: string, 
  userId: string, 
  type: string, 
  message: string, 
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Check if Slack integration is connected
    const slackIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.workspaceId, workspaceId),
          eq(integration.provider, 'slack')
        )
      )
      .limit(1);
    
    if (slackIntegration.length === 0 || slackIntegration[0].status !== 'connected') {
      console.log(`Slack integration not connected for workspace ${workspaceId}`);
      return;
    }
    
    // Create Slack integration instance
    const slack = createSlackIntegration();
    if (!slack) {
      console.log('Slack integration not configured');
      return;
    }
    
    // Send notification
    await slack.sendNotification(workspaceId, userId, message);
    
    console.log(`Slack notification sent for ${type}`);
    
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    // Don't throw - notification failure shouldn't break the job
  }
}

// Helper function to trigger notifications from other agents
export async function triggerNotification(
  type: NotificationEvent['type'],
  workspaceId: string,
  userId: string,
  entityId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  // This would typically add a job to the notifications queue
  // For now, we'll process it directly
  await notificationHandler({
    data: { type, workspaceId, userId, entityId, metadata },
    id: 'manual',
    name: 'notification',
    queue: 'notifications',
  } as Job<NotificationEvent>);
}
