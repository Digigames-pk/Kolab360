import { WebClient } from '@slack/web-api';
import { Router } from 'express';

const router = Router();

// Slack Integration Service
class SlackIntegration {
  private client: WebClient | null = null;
  private channelId: string | null = null;

  constructor() {
    if (process.env.SLACK_BOT_TOKEN) {
      this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
      this.channelId = process.env.SLACK_CHANNEL_ID || null;
    }
  }

  async sendMessage(text: string, channel?: string) {
    if (!this.client) {
      throw new Error('Slack not configured');
    }

    const targetChannel = channel || this.channelId;
    if (!targetChannel) {
      throw new Error('No Slack channel configured');
    }

    const result = await this.client.chat.postMessage({
      channel: targetChannel,
      text,
    });

    return result;
  }

  async getChannels() {
    if (!this.client) {
      throw new Error('Slack not configured');
    }

    const result = await this.client.conversations.list({
      types: 'public_channel,private_channel',
    });

    return result.channels || [];
  }

  async sendRichMessage(blocks: any[], channel?: string) {
    if (!this.client) {
      throw new Error('Slack not configured');
    }

    const targetChannel = channel || this.channelId;
    if (!targetChannel) {
      throw new Error('No Slack channel configured');
    }

    const result = await this.client.chat.postMessage({
      channel: targetChannel,
      blocks,
    });

    return result;
  }

  isConfigured() {
    return this.client !== null;
  }
}

const slackService = new SlackIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: slackService.isConfigured(),
    hasChannel: process.env.SLACK_CHANNEL_ID ? true : false
  });
});

router.post('/send-message', async (req, res) => {
  try {
    const { text, channel } = req.body;
    const result = await slackService.sendMessage(text, channel);
    res.json({ success: true, message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/channels', async (req, res) => {
  try {
    const channels = await slackService.getChannels();
    res.json(channels);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/send-notification', async (req, res) => {
  try {
    const { title, message, type, user } = req.body;
    
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title}*\n${message}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Type: ${type} | User: ${user || 'System'}`
          }
        ]
      }
    ];

    const result = await slackService.sendRichMessage(blocks);
    res.json({ success: true, message: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { slackService };
export default router;