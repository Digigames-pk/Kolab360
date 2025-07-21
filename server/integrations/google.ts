import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAuth } from 'google-auth-library';
import { Router } from 'express';

const router = Router();

// Google Services Integration
class GoogleIntegration {
  private genAI: GoogleGenerativeAI | null = null;
  private auth: GoogleAuth | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.auth = new GoogleAuth({
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/drive',
        ],
      });
    }
  }

  async generateContent(prompt: string, model = 'gemini-2.5-flash') {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const genModel = this.genAI.getGenerativeModel({ model });
    const result = await genModel.generateContent(prompt);
    return result.response.text();
  }

  async analyzeImage(imageData: string, prompt: string) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    return result.response.text();
  }

  async summarizeText(text: string) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;
    return this.generateContent(prompt);
  }

  async translateText(text: string, targetLanguage: string) {
    if (!this.genAI) {
      throw new Error('Gemini API not configured');
    }

    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
    return this.generateContent(prompt);
  }

  isConfigured() {
    return this.genAI !== null;
  }

  isAuthConfigured() {
    return this.auth !== null;
  }
}

const googleService = new GoogleIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    geminiConnected: googleService.isConfigured(),
    authConnected: googleService.isAuthConfigured()
  });
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await googleService.generateContent(prompt, model);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-image', async (req, res) => {
  try {
    const { imageData, prompt } = req.body;
    const result = await googleService.analyzeImage(imageData, prompt);
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await googleService.summarizeText(text);
    res.json({ summary: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const result = await googleService.translateText(text, targetLanguage);
    res.json({ translation: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { googleService };
export default router;