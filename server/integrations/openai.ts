import OpenAI from 'openai';
import { Router } from 'express';

const router = Router();

// OpenAI Integration Service
class OpenAIIntegration {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateText(prompt: string, model = 'gpt-4o') {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  }

  async summarizeText(text: string) {
    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;
    return this.generateText(prompt);
  }

  async analyzeSentiment(text: string) {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { "rating": number, "confidence": number }'
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence))
    };
  }

  async analyzeImage(base64Image: string, prompt?: string) {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt || 'Analyze this image in detail and describe its key elements, context, and any notable aspects.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  }

  async generateImage(prompt: string) {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    return response.data[0];
  }

  async transcribeAudio(audioBuffer: Buffer, filename: string) {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const file = new File([audioBuffer], filename, { type: 'audio/mpeg' });
    
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });

    return transcription;
  }

  async createEmbedding(text: string) {
    if (!this.openai) {
      throw new Error('OpenAI API not configured');
    }

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  isConfigured() {
    return this.openai !== null;
  }
}

const openaiService = new OpenAIIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: openaiService.isConfigured()
  });
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await openaiService.generateText(prompt, model);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await openaiService.summarizeText(text);
    res.json({ summary: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await openaiService.analyzeSentiment(text);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-image', async (req, res) => {
  try {
    const { imageData, prompt } = req.body;
    const result = await openaiService.analyzeImage(imageData, prompt);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await openaiService.generateImage(prompt);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/transcribe', async (req, res) => {
  try {
    const { audioData, filename } = req.body;
    const audioBuffer = Buffer.from(audioData, 'base64');
    const result = await openaiService.transcribeAudio(audioBuffer, filename);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/embeddings', async (req, res) => {
  try {
    const { text } = req.body;
    const embedding = await openaiService.createEmbedding(text);
    res.json({ embedding });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { openaiService };
export default router;