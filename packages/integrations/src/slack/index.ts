import { App } from '@slack/bolt';
import { z } from 'zod';
import { db, integration, workspaceMember, suggestion, notification } from '@rhiz/db';
import { eq, and, desc, limit } from 'drizzle-orm';

// Slack configuration schema
export const SlackConfig = z.object({
  botToken: z.string(),
  signingSecret: z.string(),
  appToken: z.string().optional(),
});

export type SlackConfig = z.infer<typeof SlackConfig>;

// Slack integration class
export class SlackIntegration {
  private app: App;
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
    this.app = new App({
      token: config.botToken,
      signingSecret: config.signingSecret,
      socketMode: !!config.appToken,
      appToken: config.appToken,
    });

    this.setupCommands();
    this.setupEvents();
  }

  private setupCommands() {
    // /rhiz intro command
    this.app.command('/rhiz', async ({ command, ack, respond }) => {
      await ack();

      if (command.text === 'intro') {
        await this.handleIntroCommand(command, respond);
      } else {
        await respond({
          text: 'Available commands:\n• `/rhiz intro` - Show top 3 ready introductions',
          response_type: 'ephemeral'
        });
      }
    });
  }

  private setupEvents() {
    // Handle app mentions
    this.app.event('app_mention', async ({ event, say }) => {
      await say({
        text: `Hi <@${event.user}>! I'm Rhiz, your relationship intelligence assistant. Use \`/rhiz intro\` to see your top introductions.`,
        thread_ts: event.ts
      });
    });
  }

  private async handleIntroCommand(command: any, respond: any) {
    try {
      // Find workspace by Slack team ID
      const workspaceIntegration = await db
        .select()
        .from(integration)
        .where(
          and(
            eq(integration.provider, 'slack'),
            eq(integration.config, { teamId: command.team_id })
          )
        )
        .limit(1);

      if (workspaceIntegration.length === 0) {
        await respond({
          text: '❌ No Rhiz workspace connected to this Slack workspace. Please connect your workspace first.',
          response_type: 'ephemeral'
        });
        return;
      }

      const workspaceId = workspaceIntegration[0].workspaceId;

      // Get top 3 ready suggestions
      const suggestions = await db
        .select({
          id: suggestion.id,
          score: suggestion.score,
          why: suggestion.why,
          aName: suggestion.aId,
          bName: suggestion.bId,
        })
        .from(suggestion)
        .where(
          and(
            eq(suggestion.workspaceId, workspaceId),
            eq(suggestion.state, 'proposed')
          )
        )
        .orderBy(desc(suggestion.score))
        .limit(3);

      if (suggestions.length === 0) {
        await respond({
          text: '🎯 No introductions ready yet. Keep adding people and goals to get personalized suggestions!',
          response_type: 'ephemeral'
        });
        return;
      }

      // Build response with accept/skip buttons
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎯 Top Introductions Ready',
            emoji: true
          }
        }
      ];

      for (const suggestion of suggestions) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Score: ${suggestion.score}/100*\n${suggestion.why?.reason || 'Great potential connection!'}`
          },
          accessory: {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Accept',
                  emoji: true
                },
                style: 'primary',
                value: suggestion.id,
                action_id: `accept_intro_${suggestion.id}`
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Skip',
                  emoji: true
                },
                value: suggestion.id,
                action_id: `skip_intro_${suggestion.id}`
              }
            ]
          }
        });
      }

      await respond({
        blocks,
        response_type: 'ephemeral'
      });

    } catch (error) {
      console.error('Error handling intro command:', error);
      await respond({
        text: '❌ Sorry, something went wrong. Please try again later.',
        response_type: 'ephemeral'
      });
    }
  }

  // Send notification to Slack user
  async sendNotification(workspaceId: string, userId: string, message: string, channel?: string) {
    try {
      // Find Slack user ID for the Rhiz user
      const member = await db
        .select({ slackUserId: workspaceMember.slackUserId })
        .from(workspaceMember)
        .where(
          and(
            eq(workspaceMember.workspaceId, workspaceId),
            eq(workspaceMember.userId, userId)
          )
        )
        .limit(1);

      if (member.length === 0 || !member[0].slackUserId) {
        console.log(`No Slack user ID found for user ${userId} in workspace ${workspaceId}`);
        return;
      }

      const target = channel || `@${member[0].slackUserId}`;

      await this.app.client.chat.postMessage({
        channel: target,
        text: message,
        unfurl_links: false
      });

    } catch (error) {
      console.error('Error sending Slack notification:', error);
    }
  }

  // Start the Slack app
  async start(port: number = 3000) {
    await this.app.start(port);
    console.log(`⚡️ Slack app is running on port ${port}`);
  }

  // Stop the Slack app
  async stop() {
    await this.app.stop();
  }
}

// Factory function to create Slack integration
export function createSlackIntegration(): SlackIntegration | null {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  const appToken = process.env.SLACK_APP_TOKEN;

  if (!botToken || !signingSecret) {
    console.log('Slack integration not configured - missing SLACK_BOT_TOKEN or SLACK_SIGNING_SECRET');
    return null;
  }

  return new SlackIntegration({
    botToken,
    signingSecret,
    appToken,
  });
}
