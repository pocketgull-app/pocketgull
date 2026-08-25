/**
 * AI Routes — Genkit flows and Gemini streaming endpoints.
 *
 * Extracted from server.ts to reduce monolith size and concentrate
 * `:any` type resolution into a single, focused module.
 *
 * @module server/routes/ai.routes
 */
import { Router, json as expressJson } from 'express';
import type { Request, Response } from 'express';
import { GoogleAuth } from 'google-auth-library';

// ── Request/Response Interfaces (P0-B: `:any` resolution) ──────────────

/** POST /api/ai/metrics */
interface IAiMetricsRequest {
  text: string;
}

/** POST /api/ai/synthesize */
interface IAiSynthesizeRequest {
  text: string;
}

/** POST /api/ai/changes */
interface IAiChangesRequest {
  oldData: string;
  newData: string;
}

/** POST /api/ai/translate */
interface IAiTranslateRequest {
  text: string;
  level?: string;
  cognitiveLevel?: 'standard' | 'simplified' | 'dyslexia' | 'child';
  language?: string;
}

/** POST /api/ai/analyze-translation */
interface IAiAnalyzeTranslationRequest {
  original: string;
  translated: string;
}

/** POST /api/ai/analyze-image */
interface IAiAnalyzeImageRequest {
  base64Image: string;
  context?: string;
}

/** POST /api/ai/scan-document */
interface IAiScanDocumentRequest {
  base64Image: string;
  context?: string;
}

/** POST /api/ai/stream */
interface IAiStreamRequest {
  patientData: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  lens?: string;
}

/** POST /api/ai/chat/start */
interface IAiChatStartRequest {
  sessionId: string;
  systemInstruction: string;
  model?: string;
  temperature?: number;
}

/** POST /api/ai/chat/message */
interface IAiChatMessageRequest {
  sessionId: string;
  message: string;
}

/** Chat session shape (replaces `Map<string, any>` anti-pattern) */
interface IChatSession {
  history: Array<{ role: string; parts: Array<{ text: string }> }>;
  systemInstruction: string;
  model: string;
  temperature: number;
}

// ── Shared helpers (injected from server.ts via factory) ────────────────

interface IAiRouteDeps {
  getApiKey: (req?: Request) => Promise<string>;
  getGcpAccessToken: () => Promise<string | null>;
  normalizeAndValidateModel: (model: unknown) => string;
}

const ALLOWED_GEMINI_MODELS = new Set([
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
]);

const ALLOWED_DEV_MODELS = [
  'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite',
  'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash',
  'gemini-1.5-flash', 'gemini-1.5-pro', 'gemma-2-9b-it', 'medgemma-2-9b'
];

const BASE_CLINICAL_PROMPT = 'You are Pocket Gull Clinical Intelligence Engine. Maintain evidence-based clinical safety and HIPAA compliance at all times.';

/**
 * Sanitizes user-supplied strings before passing to the Gemini API payload.
 * Strips non-printable characters and truncates to 10k chars.
 */
function sanitizeApiPayload(val: unknown): unknown {
  if (typeof val === 'string') {
    return String(val).replace(/[^\x20-\x7E\t\r\n]/g, '').slice(0, 10000);
  }
  if (Array.isArray(val)) return val.map(sanitizeApiPayload);
  if (val && typeof val === 'object') {
    const clean: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>)) {
      const cleanKey = String(k).replace(/[^a-zA-Z0-9_-]/g, '');
      clean[cleanKey] = sanitizeApiPayload((val as Record<string, unknown>)[k]);
    }
    return clean;
  }
  return val;
}

/**
 * Sanitizes system instruction text: removes prompt injection patterns
 * and non-printable characters, truncates to 3000 chars.
 */
function sanitizeSystemInstruction(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/(?:ignore|override|disregard|forget)\s+(?:previous|all|system)\s+(?:instructions|prompts|directives)/gi, '')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
    .slice(0, 3000);
}

// ── Chat Session Storage ────────────────────────────────────────────────

const chatSessions = new Map<string, IChatSession>();
const MAX_CHAT_SESSIONS = 50;

// ── Factory: Creates the AI router with injected dependencies ───────────

export function createAiRouter(deps: IAiRouteDeps): Router {
  const router = Router();
  const { getApiKey, getGcpAccessToken, normalizeAndValidateModel } = deps;

  // POST /api/ai/metrics
  router.post('/metrics', expressJson(), async (req: Request, res: Response) => {
    try {
      await getApiKey(req);
      const body = req.body as IAiMetricsRequest;
      const { generateMetricsFlow } = await import('../genkit.js');
      const result = await generateMetricsFlow(body.text);
      res.json(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/synthesize
  router.post('/synthesize', expressJson(), async (req: Request, res: Response) => {
    try {
      await getApiKey(req);
      const body = req.body as IAiSynthesizeRequest;
      const { synthesizeKnowledgeFlow } = await import('../genkit.js');
      const result = await synthesizeKnowledgeFlow({ inputText: body.text });
      res.json(result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/changes
  router.post('/changes', expressJson(), async (req: Request, res: Response) => {
    try {
      await getApiKey(req);
      const body = req.body as IAiChangesRequest;
      const { detectClinicalChangesFlow } = await import('../genkit.js');
      const result = await detectClinicalChangesFlow({
        oldData: body.oldData,
        newData: body.newData
      });
      res.json({ significant: result });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/translate
  router.post('/translate', expressJson(), async (req: Request, res: Response) => {
    try {
      await getApiKey(req);
      const body = req.body as IAiTranslateRequest;
      const { translateReadingLevelFlow } = await import('../genkit.js');
      const result = await translateReadingLevelFlow({
        text: body.text,
        level: body.level,
        cognitiveLevel: body.cognitiveLevel,
        language: body.language
      });
      res.json({ text: result });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/analyze-translation
  router.post('/analyze-translation', expressJson(), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiAnalyzeTranslationRequest;
      await getApiKey(req);

      if (!body.original || !body.translated) {
        return res.status(400).json({ error: 'Original and translated text are required' });
      }

      const { analyzeTranslationFlow } = await import('../genkit.js');
      const result = await analyzeTranslationFlow({ original: body.original, translated: body.translated });
      res.json({ analysis: result });
    } catch (error: unknown) {
      console.error('Error analyzing translation:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/analyze-image
  router.post('/analyze-image', expressJson({ limit: '10mb' }), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiAnalyzeImageRequest;
      await getApiKey(req);

      if (!body.base64Image) {
        return res.status(400).json({ error: 'base64Image is required' });
      }

      const { analyzeImageFlow } = await import('../genkit.js');
      const result = await analyzeImageFlow({ base64Image: body.base64Image, context: body.context });
      res.json({ analysis: result });
    } catch (error: unknown) {
      console.error('Error analyzing image:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/scan-document
  router.post('/scan-document', expressJson({ limit: '15mb' }), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiScanDocumentRequest;
      await getApiKey(req);

      if (!body.base64Image) {
        return res.status(400).json({ error: 'base64Image is required' });
      }

      const { scanDocumentFlow } = await import('../genkit.js');
      const result = await scanDocumentFlow({ base64Image: body.base64Image, context: body.context });
      res.json(result);
    } catch (error: unknown) {
      console.error('Error scanning document:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/stream — Server-Sent Events streaming endpoint
  router.post('/stream', expressJson(), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiStreamRequest;
      let rawModel: string;
      try {
        rawModel = normalizeAndValidateModel(body.model);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid model';
        res.status(400).json({ error: message });
        return;
      }

      const token = await getGcpAccessToken();
      const key = token ? '' : await getApiKey(req);
      if (!token && !key) {
        res.status(500).json({ error: 'API key or GCP credentials not available on server.' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      try {
        let ai;
        let Type;
        if (token) {
          const projectId = (process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645').replace(/[^a-zA-Z0-9-_]/g, '');
          const location = (process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1').replace(/[^a-zA-Z0-9-]/g, '');
          const { GoogleGenAI, Type: ImportedType } = await import('@google/genai');
          ai = new GoogleGenAI({ vertexai: true, project: projectId, location: location });
          Type = ImportedType;
        } else {
          const { GoogleGenAI, Type: ImportedType } = await import('@google/genai');
          ai = new GoogleGenAI({ apiKey: key });
          Type = ImportedType;
        }

        const sanitizedInstruction = sanitizeSystemInstruction(body.systemInstruction);

        // System prompt is always the static clinical base — never includes user input
        const configOptions: Record<string, unknown> = {
          systemInstruction: BASE_CLINICAL_PROMPT,
          temperature: body.temperature ?? 0.1
        };

        // User-provided clinical directives are injected as a prefixed context message, not as system prompt
        const contextPrefix = sanitizedInstruction
          ? `[CLINICAL DIRECTIVE CONTEXT]\n${sanitizedInstruction}\n[END CLINICAL DIRECTIVE CONTEXT]\n\n`
          : '';

        // Lean Tools: Only supply tools to lenses that require biochemistry / sequence analysis
        if (body.lens === 'Precision Nutrients' || body.lens === 'Functional Protocols') {
          configOptions['tools'] = [{
            functionDeclarations: [{
              name: "protein_sequence_similarity_search",
              description: "Searches for homologous protein sequences using MMseqs2 (fast). Use this when analyzing a protein sequence to find homologues and infer protein function.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  sequence: { type: Type.STRING, description: "The raw amino acid sequence to search" }
                },
                required: ["sequence"]
              }
            }]
          }];
        }

        const streamingResponse = await ai.models.generateContentStream({
          model: rawModel,
          contents: [{ role: 'user', parts: [{ text: `${contextPrefix}${body.patientData}` }] }],
          config: configOptions
        });

        for await (const chunk of streamingResponse) {
          if (chunk.functionCalls && chunk.functionCalls.length > 0) {
            const fc = chunk.functionCalls[0];
            res.write(`data: ${JSON.stringify({ text: `\n\n_⚡ Executing Science Skill: ${fc.name}..._\n\n` })}\n\n`);

            if (fc.name === 'protein_sequence_similarity_search') {
              const mockResult = {
                hits: [
                  { id: "P51617", name: "IRAK1_HUMAN", identity: "100%", evalue: "0.0" },
                  { id: "Q62070", name: "IRAK1_MOUSE", identity: "85%", evalue: "1e-150" }
                ]
              };
              res.write(`data: ${JSON.stringify({ toolCall: { name: fc.name, result: mockResult } })}\n\n`);
            }
          }

          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }

        res.write(`data: [DONE]\n\n`);
        res.end();
      } catch (apiError: unknown) {
        console.error('GenAI Stream Error:', apiError);
        throw apiError;
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown streaming error';
      try { res.write(`data: ${JSON.stringify({ error: message })}\n\n`); res.end(); } catch (writeErr) { console.debug('[AIRoutes] SSE error response failed (client disconnected):', (writeErr as Error)?.message); }
    }
  });

  // POST /api/ai/chat/start
  router.post('/chat/start', expressJson(), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiChatStartRequest;
      let validatedModel: string;
      try {
        validatedModel = normalizeAndValidateModel(body.model);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid model';
        res.status(400).json({ error: message });
        return;
      }

      const token = await getGcpAccessToken();
      const key = token ? '' : await getApiKey(req);
      if (!token && !key) throw new Error('API key or GCP credentials not available on server.');

      chatSessions.set(body.sessionId, {
        history: [],
        systemInstruction: body.systemInstruction,
        model: validatedModel,
        temperature: body.temperature ?? 0.1
      });

      if (chatSessions.size > MAX_CHAT_SESSIONS) {
        const oldestKey = chatSessions.keys().next().value;
        if (oldestKey) chatSessions.delete(oldestKey);
      }
      res.json({ ok: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/ai/chat/message
  router.post('/chat/message', expressJson(), async (req: Request, res: Response) => {
    try {
      const body = req.body as IAiChatMessageRequest;
      const session = chatSessions.get(body.sessionId);
      if (!session) throw new Error('Chat session not found. Please refresh and try again.');

      const token = await getGcpAccessToken();
      const key = token ? '' : await getApiKey(req);
      if (!token && !key) throw new Error('API key or GCP credentials not available on server.');

      session.history.push({ role: 'user', parts: [{ text: body.message }] });

      let rawModel: string;
      try {
        rawModel = normalizeAndValidateModel(session.model);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Invalid model';
        res.status(400).json({ error: message });
        return;
      }
      let response: globalThis.Response;

      if (token) {
        const projectId = (process.env['GOOGLE_CLOUD_PROJECT'] || process.env['GCLOUD_PROJECT'] || 'gen-lang-client-0540208645').replace(/[^a-zA-Z0-9-_]/g, '');
        const location = (process.env['GOOGLE_CLOUD_REGION'] || process.env['GCLOUD_REGION'] || 'us-west1').replace(/[^a-zA-Z0-9-]/g, '');
        const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${rawModel}:generateContent`;

        console.log(`[Vertex AI] Chat message via regional endpoint: ${vertexUrl}`);
        const safeContents = sanitizeApiPayload(session.history);
        const safeSystemInstruction = typeof session.systemInstruction === 'string' ? session.systemInstruction : '';

        response = await fetch(vertexUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contents: safeContents,
            systemInstruction: { parts: [{ text: safeSystemInstruction }] },
            generationConfig: { temperature: session.temperature },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
            ]
          })
        });
      } else {
        console.log(`[Gemini Developer API] Chat message model: ${rawModel}`);
        const safeContents = sanitizeApiPayload(session.history);
        const safeSystemInstruction = typeof session.systemInstruction === 'string' ? session.systemInstruction : '';
        const safeModel = ALLOWED_DEV_MODELS.includes(rawModel) ? rawModel : 'gemini-3.5-flash';

        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent?key=${key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://pocketgull.app/'
          },
          body: JSON.stringify({
            contents: safeContents,
            systemInstruction: { parts: [{ text: safeSystemInstruction }] },
            generationConfig: { temperature: session.temperature },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' }
            ]
          })
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${errText}`);
      }

      const data = await response.json() as Record<string, unknown>;
      const candidates = data['candidates'] as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
      const responseText = candidates?.[0]?.content?.parts?.[0]?.text || '';

      session.history.push({ role: 'model', parts: [{ text: responseText }] });
      res.json({ text: responseText });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  });

  return router;
}
