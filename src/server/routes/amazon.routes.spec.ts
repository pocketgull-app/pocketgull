import '@angular/compiler';
import { expect, describe, it, vi } from 'vitest';
import { amazonRouter } from './amazon.routes';
import type { Request, Response } from 'express';

function createMockReqRes(
  query: Record<string, string> = {},
  params: Record<string, string> = {},
  method = 'GET'
) {
  const req = {
    query,
    params,
    method
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

describe('Express Amazon Creators API Router (/api/amazon)', () => {
  const searchHandler = (amazonRouter.stack.find((layer: any) => layer.route?.path === '/search')?.route?.stack[0] as any)?.handle;
  const itemHandler = (amazonRouter.stack.find((layer: any) => layer.route?.path === '/item/:asin')?.route?.stack[0] as any)?.handle;
  const statusHandler = (amazonRouter.stack.find((layer: any) => layer.route?.path === '/status')?.route?.stack[0] as any)?.handle;

  it('1. GET /api/amazon/search returns filtered items with affiliate tag and FTC disclaimer', () => {
    const { req, res } = createMockReqRes({ q: 'blood pressure', hsaOnly: 'true' });
    searchHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.searchQuery).toBe('blood pressure');
    expect(body.affiliateTag).toBe('pgdpo-20');
    expect(body.disclaimer).toContain('As an Amazon Associate');
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].hsaFsaEligible).toBe(true);
  });

  it('2. GET /api/amazon/search returns empty array for blank query', () => {
    const { req, res } = createMockReqRes({ q: '' });
    searchHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.items).toEqual([]);
    expect(body.totalResults).toBe(0);
  });

  it('3. GET /api/amazon/item/:asin returns product details for valid ASIN', () => {
    const { req, res } = createMockReqRes({}, { asin: 'B07S2CV4N7' });
    itemHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.success).toBe(true);
    expect(body.item.asin).toBe('B07S2CV4N7');
    expect(body.item.title).toContain('Omron');
    expect(body.item.detailPageUrl).toContain('tag=pgdpo-20');
  });

  it('4. GET /api/amazon/item/:asin rejects invalid ASIN format', () => {
    const { req, res } = createMockReqRes({}, { asin: 'invalid!' });
    itemHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.getJson();
    expect(body.error).toContain('Invalid ASIN format');
  });

  it('5. GET /api/amazon/status returns router health and catalog metrics', () => {
    const { req, res } = createMockReqRes();
    statusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.status).toBe('ACTIVE');
    expect(body.ftcCompliant).toBe(true);
    expect(body.catalogSize).toBeGreaterThan(0);
  });
});
