import { NextRequest, NextResponse } from 'next/server';
import { createSlackIntegration } from '@rhiz/integrations';
import { db, integration, suggestion } from '@rhiz/db';
import { eq, and } from 'drizzle-orm';

// Slack event types
interface SlackEvent {
  type: string;
  team_id: string;
  user_id?: string;
  text?: string;
  channel?: string;
  ts?: string;
}

interface SlackAction {
  action_id: string;
  value: string;
  user: {
    id: string;
  };
}

interface SlackInteraction {
  type: string;
  team: {
    id: string;
  };
  user: {
    id: string;
  };
  actions?: SlackAction[];
  command?: {
    text: string;
    user_id: string;
  };
}

// Handle Slack events webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }
    
    // Handle events
    if (body.type === 'event_callback') {
      const event = body.event as SlackEvent;
      await handleSlackEvent(event, body.team_id);
    }
    
    // Handle interactions (button clicks, etc.)
    if (body.type === 'interactive_message' || body.type === 'block_actions') {
      const interaction = body as SlackInteraction;
      await handleSlackInteraction(interaction);
    }
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Error handling Slack webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process Slack webhook' },
      { status: 500 }
    );
  }
}

// Handle Slack events
async function handleSlackEvent(event: SlackEvent, teamId: string) {
  try {
    switch (event.type) {
      case 'app_mention':
        await handleAppMention(event, teamId);
        break;
      
      case 'message':
        // Handle direct messages or channel messages
        if (event.channel?.startsWith('D')) {
          await handleDirectMessage(event, teamId);
        }
        break;
      
      default:
        console.log(`Unhandled Slack event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling Slack event:', error);
  }
}

// Handle Slack interactions (button clicks, etc.)
async function handleSlackInteraction(interaction: SlackInteraction) {
  try {
    if (interaction.actions) {
      for (const action of interaction.actions) {
        if (action.action_id.startsWith('accept_intro_')) {
          const suggestionId = action.value;
          await handleAcceptIntro(suggestionId, interaction.team.id, interaction.user.id);
        } else if (action.action_id.startsWith('skip_intro_')) {
          const suggestionId = action.value;
          await handleSkipIntro(suggestionId, interaction.team.id, interaction.user.id);
        }
      }
    }
  } catch (error) {
    console.error('Error handling Slack interaction:', error);
  }
}

// Handle app mentions
async function handleAppMention(event: SlackEvent, teamId: string) {
  try {
    const slack = createSlackIntegration();
    if (!slack) {
      console.log('Slack integration not configured');
      return;
    }
    
    // Find workspace by team ID
    const workspaceIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.provider, 'slack'),
          eq(integration.config, { teamId })
        )
      )
      .limit(1);
    
    if (workspaceIntegration.length === 0) {
      console.log(`No workspace found for Slack team ${teamId}`);
      return;
    }
    
    const workspaceId = workspaceIntegration[0].workspaceId;
    
    // Send response
    await slack.sendNotification(
      workspaceId,
      'demo-user-123', // TODO: Get from context
      `Hi! I'm Rhiz, your relationship intelligence assistant. Use \`/rhiz intro\` to see your top introductions.`,
      event.channel
    );
    
  } catch (error) {
    console.error('Error handling app mention:', error);
  }
}

// Handle direct messages
async function handleDirectMessage(event: SlackEvent, teamId: string) {
  try {
    const slack = createSlackIntegration();
    if (!slack) {
      return;
    }
    
    // Find workspace by team ID
    const workspaceIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.provider, 'slack'),
          eq(integration.config, { teamId })
        )
      )
      .limit(1);
    
    if (workspaceIntegration.length === 0) {
      return;
    }
    
    const workspaceId = workspaceIntegration[0].workspaceId;
    
    // Handle different message types
    if (event.text?.toLowerCase().includes('intro')) {
      await slack.sendNotification(
        workspaceId,
        'demo-user-123',
        `Use \`/rhiz intro\` to see your top introduction suggestions!`,
        event.channel
      );
    } else if (event.text?.toLowerCase().includes('help')) {
      await slack.sendNotification(
        workspaceId,
        'demo-user-123',
        `Available commands:\n• \`/rhiz intro\` - Show top 3 ready introductions\n• \`help\` - Show this help message`,
        event.channel
      );
    }
    
  } catch (error) {
    console.error('Error handling direct message:', error);
  }
}

// Handle accept introduction
async function handleAcceptIntro(suggestionId: string, teamId: string, userId: string) {
  try {
    // Update suggestion state
    await db
      .update(suggestion)
      .set({
        state: 'accepted',
      })
      .where(eq(suggestion.id, suggestionId));
    
    // Find workspace by team ID
    const workspaceIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.provider, 'slack'),
          eq(integration.config, { teamId })
        )
      )
      .limit(1);
    
    if (workspaceIntegration.length > 0) {
      const workspaceId = workspaceIntegration[0].workspaceId;
      
      // Send confirmation
      const slack = createSlackIntegration();
      if (slack) {
        await slack.sendNotification(
          workspaceId,
          'demo-user-123',
          `✅ Introduction accepted! We'll help you follow up.`,
          `@${userId}`
        );
      }
    }
    
  } catch (error) {
    console.error('Error accepting introduction:', error);
  }
}

// Handle skip introduction
async function handleSkipIntro(suggestionId: string, teamId: string, userId: string) {
  try {
    // Update suggestion state
    await db
      .update(suggestion)
      .set({
        state: 'rejected',
      })
      .where(eq(suggestion.id, suggestionId));
    
    // Find workspace by team ID
    const workspaceIntegration = await db
      .select()
      .from(integration)
      .where(
        and(
          eq(integration.provider, 'slack'),
          eq(integration.config, { teamId })
        )
      )
      .limit(1);
    
    if (workspaceIntegration.length > 0) {
      const workspaceId = workspaceIntegration[0].workspaceId;
      
      // Send confirmation
      const slack = createSlackIntegration();
      if (slack) {
        await slack.sendNotification(
          workspaceId,
          'demo-user-123',
          `⏭️ Introduction skipped. We'll find better matches for you.`,
          `@${userId}`
        );
      }
    }
    
  } catch (error) {
    console.error('Error skipping introduction:', error);
  }
}
