import { Router } from 'express';
import slackRouter from './slack';
import githubRouter from './github';
import stripeRouter from './stripe';
import notionRouter from './notion';
import googleRouter from './google';
import anthropicRouter from './anthropic';
import openaiRouter from './openai';

const router = Router();

// Mount all integration routes
router.use('/slack', slackRouter);
router.use('/github', githubRouter);
router.use('/stripe', stripeRouter);
router.use('/notion', notionRouter);
router.use('/google', googleRouter);
router.use('/anthropic', anthropicRouter);
router.use('/openai', openaiRouter);

// Get status of all integrations
router.get('/status', async (req, res) => {
  try {
    const integrationStatus = {
      slack: {
        connected: process.env.SLACK_BOT_TOKEN ? true : false,
        hasChannel: process.env.SLACK_CHANNEL_ID ? true : false
      },
      github: {
        connected: process.env.GITHUB_TOKEN ? true : false
      },
      stripe: {
        connected: process.env.STRIPE_SECRET_KEY ? true : false,
        hasPublicKey: process.env.VITE_STRIPE_PUBLIC_KEY ? true : false
      },
      notion: {
        connected: process.env.NOTION_INTEGRATION_SECRET ? true : false,
        hasPageUrl: process.env.NOTION_PAGE_URL ? true : false
      },
      google: {
        geminiConnected: process.env.GEMINI_API_KEY ? true : false,
        authConnected: process.env.GOOGLE_APPLICATION_CREDENTIALS ? true : false
      },
      anthropic: {
        connected: process.env.ANTHROPIC_API_KEY ? true : false
      },
      openai: {
        connected: process.env.OPENAI_API_KEY ? true : false
      },
      xai: {
        connected: process.env.XAI_API_KEY ? true : false
      },
      perplexity: {
        connected: process.env.PERPLEXITY_API_KEY ? true : false
      },
      resend: {
        connected: process.env.RESEND_API_KEY ? true : false
      }
    };

    res.json(integrationStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List all available integrations
router.get('/available', (req, res) => {
  const availableIntegrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and collaboration',
      category: 'communication',
      requiredSecrets: ['SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID'],
      features: ['Send messages', 'Channel management', 'Rich notifications']
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Version control and code collaboration',
      category: 'development',
      requiredSecrets: ['GITHUB_TOKEN'],
      features: ['Repository management', 'Commit tracking', 'Pull requests', 'Issues', 'Webhooks']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and billing',
      category: 'finance',
      requiredSecrets: ['STRIPE_SECRET_KEY', 'VITE_STRIPE_PUBLIC_KEY'],
      features: ['Payment intents', 'Customer management', 'Subscriptions', 'Payment tracking']
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Knowledge management and documentation',
      category: 'productivity',
      requiredSecrets: ['NOTION_INTEGRATION_SECRET', 'NOTION_PAGE_URL'],
      features: ['Database management', 'Page creation', 'Content sync', 'Task integration']
    },
    {
      id: 'google',
      name: 'Google Services',
      description: 'AI generation and Google services',
      category: 'ai',
      requiredSecrets: ['GEMINI_API_KEY', 'GOOGLE_APPLICATION_CREDENTIALS'],
      features: ['Text generation', 'Image analysis', 'Translation', 'Summarization']
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Advanced AI assistance and analysis',
      category: 'ai',
      requiredSecrets: ['ANTHROPIC_API_KEY'],
      features: ['Text generation', 'Sentiment analysis', 'Image analysis', 'Content summarization']
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models and AI capabilities',
      category: 'ai',
      requiredSecrets: ['OPENAI_API_KEY'],
      features: ['Text generation', 'Image generation', 'Audio transcription', 'Embeddings', 'Vision analysis']
    }
  ];

  res.json(availableIntegrations);
});

export default router;