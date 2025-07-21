import Anthropic from '@anthropic-ai/sdk';
import { Router } from 'express';

const router = Router();

// Anthropic Claude Integration
class AnthropicIntegration {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async generateText(prompt: string, model = 'claude-sonnet-4-20250514') {
    if (!this.anthropic) {
      throw new Error('Anthropic API not configured');
    }

    const message = await this.anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0]?.text || '';
  }

  async analyzeText(text: string, analysisType: string) {
    if (!this.anthropic) {
      throw new Error('Anthropic API not configured');
    }

    const prompt = `Please perform a ${analysisType} analysis of the following text:\n\n${text}`;
    return this.generateText(prompt);
  }

  async summarizeContent(text: string) {
    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;
    return this.generateText(prompt);
  }

  async analyzeSentiment(text: string) {
    if (!this.anthropic) {
      throw new Error('Anthropic API not configured');
    }

    const prompt = `Analyze the sentiment of the following text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: {"sentiment": "positive/negative/neutral", "rating": number, "confidence": number}\n\nText: ${text}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    try {
      const result = JSON.parse(response.content[0]?.text || '{}');
      return {
        sentiment: result.sentiment,
        rating: Math.max(1, Math.min(5, Math.round(result.rating))),
        confidence: Math.max(0, Math.min(1, result.confidence))
      };
    } catch (error) {
      throw new Error('Failed to parse sentiment analysis result');
    }
  }

  async analyzeImage(base64Image: string, prompt: string) {
    if (!this.anthropic) {
      throw new Error('Anthropic API not configured');
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects."
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    return response.content[0]?.text || '';
  }

  isConfigured() {
    return this.anthropic !== null;
  }
}

const anthropicService = new AnthropicIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: anthropicService.isConfigured()
  });
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await anthropicService.generateText(prompt, model);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { text, type } = req.body;
    const result = await anthropicService.analyzeText(text, type);
    res.json({ analysis: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await anthropicService.summarizeContent(text);
    res.json({ summary: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await anthropicService.analyzeSentiment(text);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-image', async (req, res) => {
  try {
    const { imageData, prompt } = req.body;
    const result = await anthropicService.analyzeImage(imageData, prompt);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { anthropicService };
export default router;