import { Router } from 'express';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { sendPushNotification } from '../services/notification';

export const intelligenceRouter = Router();

let geminiApiKeyCached = '';

async function fetchGeminiApiKey() {
  if (geminiApiKeyCached) return geminiApiKeyCached;
  if (process.env['GEMINI_API_KEY']) {
    geminiApiKeyCached = process.env['GEMINI_API_KEY'];
    return geminiApiKeyCached;
  }

  try {
    const client = new SecretManagerServiceClient();
    let projectId = process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'];

    if (!projectId) {
      projectId = await client.getProjectId();
    }

    if (!projectId) {
      console.warn('[Intelligence API] Could not determine project ID.');
      return '';
    }

    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`,
    });
    const payload = version.payload?.data?.toString() || '';
    geminiApiKeyCached = payload;
    return payload;
  } catch (err: any) {
    console.warn(`[Intelligence API] Failed to fetch secret: ${err.message}`);
    return '';
  }
}

intelligenceRouter.post('/chat', async (req, res) => {
  try {
    const { message, context, history, fcmToken } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = await fetchGeminiApiKey();
    if (!apiKey) {
      res.status(500).json({ error: 'AI capabilities are currently unavailable (Missing API Key)' });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    // Reconstruct history if provided, or start a new chat
    const chat = model.startChat({
      history: history || [],
    });

    // If context is provided (like patient data), send it silently first if history is empty
    if (context && (!history || history.length === 0)) {
      await chat.sendMessage(`SYSTEM CONTEXT: ${context}`);
    }

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    if (fcmToken) {
      // Dispatch notification asynchronously
      sendPushNotification(
        fcmToken,
        'Clinical Intelligence',
        'Your AI analysis is complete and ready for review.',
        { type: 'ai_chat_response' }
      ).catch(err => console.error('[Intelligence API] Failed to send push notification', err));
    }

    res.status(200).json({ response: responseText });
  } catch (error: any) {
    console.error('[Intelligence API] Error during chat generation:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});
