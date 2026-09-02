/**
 * Clinical Evidence RAG Routes
 * REST endpoints for /v1/evidence/consult streaming, semantic search, and jurisdiction filtering.
 */

import { Router, Request, Response } from 'express';
import { ParquetClinicalLoader } from './parquet_loader';
import { VectorStoreManager } from './vector_store';
import { GeminiEvidenceEnricher } from './gemini_enricher';
import { DEFAULT_RAG_CONFIG } from './config';

const router = Router();

let loader: ParquetClinicalLoader | null = null;
let vectorStore: VectorStoreManager | null = null;
let enricher: GeminiEvidenceEnricher | null = null;

/**
 * Initialize RAG pipeline on first request.
 */
router.post('/v1/evidence/init', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env['GOOGLE_API_KEY'];
    if (!apiKey) {
      return res.status(400).json({ error: 'GOOGLE_API_KEY not configured' });
    }

    loader = new ParquetClinicalLoader(DEFAULT_RAG_CONFIG.parquetDatasetPath);
    await loader.initialize();

    vectorStore = new VectorStoreManager(apiKey, DEFAULT_RAG_CONFIG.embeddingModel);
    enricher = new GeminiEvidenceEnricher(apiKey);

    res.json({ status: 'ok', message: 'Clinical Evidence RAG pipeline initialized.' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Stream evidence-grounded clinical consult.
 * POST /v1/evidence/consult
 * Body: { diagnosis: string, snomedCode: string, jurisdiction: string }
 */
router.post('/v1/evidence/consult', async (req: Request, res: Response) => {
  if (!loader || !vectorStore || !enricher) {
    return res.status(503).json({ error: 'RAG pipeline not initialized. Call /v1/evidence/init first.' });
  }

  const { diagnosis, snomedCode, jurisdiction } = req.body;

  if (!diagnosis || !snomedCode || !jurisdiction) {
    return res.status(400).json({ error: 'Missing required fields: diagnosis, snomedCode, jurisdiction' });
  }

  try {
    // Set response headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Retrieve evidence from Parquet dataset
    const records = await loader.queryBySnomedCode(snomedCode, jurisdiction);
    const stats = await loader.getStatisticsBySnomedCode(snomedCode, jurisdiction);

    // Get embedding-based semantic matches
    const embeddedMatches = await vectorStore.getRecordsBySnomedCode(snomedCode);
    const semanticMatches = embeddedMatches.slice(0, 5);

    // Build evidence context
    const context = {
      patientDiagnosis: diagnosis,
      snomedCode,
      dataEvidenceRecords: semanticMatches,
      dataStatistics: {
        recordCount: stats.count,
        meanValue: stats.mean,
        medianValue: stats.median,
      },
      jurisdiction: DEFAULT_RAG_CONFIG.fveyJurisdiction,
    };

    // Stream Gemini response with evidence enrichment
    for await (const chunk of enricher.streamEvidenceConsult(context)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
    res.end();
  }
});

/**
 * Semantic search over clinical evidence.
 * POST /v1/evidence/search
 * Body: { query: string, jurisdiction: string, topK?: number }
 */
router.post('/v1/evidence/search', async (req: Request, res: Response) => {
  if (!vectorStore) {
    return res.status(503).json({ error: 'Vector store not initialized.' });
  }

  const { query, jurisdiction, topK = 5 } = req.body;

  if (!query || !jurisdiction) {
    return res.status(400).json({ error: 'Missing required fields: query, jurisdiction' });
  }

  try {
    const results = await vectorStore.semanticSearch(query, jurisdiction, topK);
    res.json({
      query,
      jurisdiction,
      results: results.map((r) => ({
        recordId: r.recordId,
        snomedCode: r.snomedCode,
        summary: r.clinicalSummary,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Health check endpoint.
 */
router.get('/v1/evidence/health', (req: Request, res: Response) => {
  const isReady = !!(loader && vectorStore && enricher);
  res.json({
    status: isReady ? 'ready' : 'not_initialized',
    timestamp: new Date().toISOString(),
  });
});

export default router;
