import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { createAiRouter } from './ai.routes';
import { vertexAgentRouter } from './vertex-agent.routes';
import { FALLBACK_SEED_ARTICLES } from '../../services/wordpress-articles.service';

function createMockReqRes(body: any = {}, method = 'POST') {
  const req = {
    body,
    method,
    headers: {
      origin: 'https://pocketgull.app',
      host: 'pocketgull.app'
    }
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: any = null;

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((payload: any) => {
      jsonPayload = payload;
      return res;
    }),
    getStatus: () => statusCode,
    getJson: () => jsonPayload
  } as unknown as Response & { getStatus: () => number; getJson: () => any };

  return { req, res };
}

describe('AI App Builder (Vertex AI Search & Agent Builder) Resilient Endpoints', () => {
  const mockDeps = {
    getApiKey: vi.fn().mockResolvedValue('test-key'),
    getGcpAccessToken: vi.fn().mockResolvedValue(null), // simulate offline / missing ADC
    normalizeAndValidateModel: vi.fn().mockReturnValue('gemini-3.7-flash')
  };

  const aiRouter = createAiRouter(mockDeps);
  const vertexSearchHandler = (aiRouter.stack.find((layer: any) => layer.route?.path === '/vertex-search')?.route?.stack[0] as any)?.handle;
  const agentBuilderHandler = (vertexAgentRouter.stack.find((layer: any) => layer.route?.path === '/search')?.route?.stack[0] as any)?.handle;

  it('1. POST /api/ai/vertex-search rejects missing or blank query with 400', async () => {
    const { req, res } = createMockReqRes({ query: '' });
    await vertexSearchHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.getJson().error).toContain('Missing or empty "query" parameter');
  });

  it('2. POST /api/ai/vertex-search falls back seamlessly to local clinical knowledgebase when offline/no ADC', async () => {
    const { req, res } = createMockReqRes({ query: 'hypertension cardiovascular management' });
    await vertexSearchHandler(req, res);

    const body = res.getJson();
    expect(body).toBeDefined();
    expect(body.fallback).toBe(true);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);

    const firstResult = body.results[0];
    expect(firstResult.document).toBeDefined();
    expect(firstResult.document.derivedStructData.title).toBeDefined();
    expect(firstResult.document.derivedStructData.link).toContain('https://pocketgull.com/articles/');
    expect(firstResult.document.derivedStructData.snippets[0].snippet).toBeDefined();
  });

  it('3. POST /api/ai/vertex-search matches specific clinical topics such as Darwin or Vagal nerve', async () => {
    const { req, res } = createMockReqRes({ query: 'Darwin vagal enigma' });
    await vertexSearchHandler(req, res);

    const body = res.getJson();
    expect(body.results.length).toBeGreaterThan(0);
    const hasDarwinArticle = body.results.some((r: any) =>
      r.document.derivedStructData.title.toLowerCase().includes('darwin')
    );
    expect(hasDarwinArticle).toBe(true);
  });

  it('4. POST /api/v1/agent-builder/search returns grounded consensus with CEBM Level 1 citations in offline/demo mode', async () => {
    const { req, res } = createMockReqRes({ query: 'intensive blood pressure control targets' });
    await agentBuilderHandler(req, res);

    const body = res.getJson();
    expect(body).toBeDefined();
    expect(body.groundingScore).toBeGreaterThanOrEqual(0.9);
    expect(body.isSimulated).toBe(true);
    expect(body.citations.length).toBeGreaterThanOrEqual(3);
    expect(body.citations[0].evidenceTier).toBe('Tier A (RCT)');
    expect(body.citations[0].title).toContain('SPRINT Research Group');
  });

  it('5. Verifies FALLBACK_SEED_ARTICLES integrity for decoupled /api/articles REST API', () => {
    expect(FALLBACK_SEED_ARTICLES.length).toBeGreaterThanOrEqual(3);
    for (const article of FALLBACK_SEED_ARTICLES) {
      expect(article.id).toBeDefined();
      expect(article.title).toBeTruthy();
      expect(article.slug).toBeTruthy();
      expect(article.contentHtml).toBeTruthy();
    }
  });
});
