import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { createPatientsRouter } from './patients.routes';
import type { Request, Response } from 'express';

function createMockReqRes(body: unknown = {}, params: Record<string, string> = {}, method = 'GET') {
  const req = {
    body,
    params,
    method
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: any = null;
  const headers: Record<string, string> = {};

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    setHeader: vi.fn((key: string, val: string) => {
      headers[key.toLowerCase()] = val;
      return res;
    }),
    json: vi.fn((payload: any) => {
      jsonPayload = payload;
      return res;
    }),
    send: vi.fn((payload: any) => {
      jsonPayload = payload;
      return res;
    }),
    getStatus: () => statusCode,
    getJson: () => jsonPayload,
    getHeader: (key: string) => headers[key.toLowerCase()]
  } as unknown as Response & { getStatus: () => number; getJson: () => any; getHeader: (k: string) => string | undefined };

  return { req, res };
}

describe('Patients & FHIR R4 Routes Suite', () => {
  const router = createPatientsRouter();

  it('1. Initializes Express patients router with endpoints', () => {
    expect(router).toBeDefined();
    expect(router.stack.length).toBeGreaterThanOrEqual(3);
  });

  it('2. GET /api/patients/export/fhir returns FHIR R4 Bundle with valid structure', () => {
    const fhirHandler = (router.stack.find((layer: any) => layer.route?.path === '/export/fhir')?.route?.stack[1] as any)?.handle;
    expect(fhirHandler).toBeDefined();

    const { req, res } = createMockReqRes({}, {}, 'GET');
    fhirHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body).toBeDefined();
    expect(body.resourceType).toBe('Bundle');
    expect(body.type).toBe('collection');
    expect(Array.isArray(body.entry)).toBe(true);
    expect(Array.isArray(body.meta.tag)).toBe(true);
    expect(res.getHeader('content-type')).toContain('application/fhir+json');
    expect(res.getHeader('x-fhir-integrity-sha256')).toBeDefined();
  });
});
