import '@angular/compiler';
import { describe, it, expect, vi, afterEach } from 'vitest';
import fsPromises from 'node:fs/promises';
import { createPatientsRouter } from './patients.routes';
import type { Request, Response } from 'express';

function createMockReqRes(
  body: unknown = {},
  params: Record<string, string> = {},
  method = 'GET',
  headers: Record<string, string> = {}
) {
  const req = {
    body,
    params,
    method,
    headers
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: any = null;
  const resHeaders: Record<string, string> = {};

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    setHeader: vi.fn((key: string, val: string) => {
      resHeaders[key.toLowerCase()] = val;
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
    getHeader: (key: string) => resHeaders[key.toLowerCase()]
  } as unknown as Response & { getStatus: () => number; getJson: () => any; getHeader: (k: string) => string | undefined };

  return { req, res };
}

describe('Patients & FHIR R4 Routes Suite', () => {
  const router = createPatientsRouter();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Initializes Express patients router with endpoints', () => {
    expect(router).toBeDefined();
    expect(router.stack.length).toBeGreaterThanOrEqual(3);
  });

  it('2. GET /api/patients/export/fhir returns FHIR R4 Bundle with valid structure', async () => {
    const fhirHandler = (router.stack.find((layer: any) => layer.route?.path === '/export/fhir')?.route?.stack[1] as any)?.handle;
    expect(fhirHandler).toBeDefined();

    const { req, res } = createMockReqRes({}, {}, 'GET');
    await fhirHandler(req, res);

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

  it('3. Enforces Mandiant M-of-N Dual-Custody Anti-Whaling gate when exporting > 50 records', async () => {
    const fhirHandler = (router.stack.find((layer: any) => layer.route?.path === '/export/fhir')?.route?.stack[1] as any)?.handle;
    const largeRoster = Array.from({ length: 55 }, (_, i) => ({
      id: `pt-${i + 1}`,
      gender: 'unknown',
      vitals: { heartRate: 72 }
    }));
    vi.spyOn(fsPromises, 'readFile').mockResolvedValue(JSON.stringify(largeRoster) as any);

    // Without Dual-Custody headers -> HTTP 403
    const blocked = createMockReqRes({}, {}, 'GET');
    await fhirHandler(blocked.req, blocked.res);
    expect(blocked.res.getStatus()).toBe(403);
    expect(blocked.res.getJson().error).toContain('Anti-Whaling Guard');

    // With distinct DPO + Clinical Lead Dual-Custody headers -> HTTP 200
    const authorized = createMockReqRes({}, {}, 'GET', {
      'x-dual-custody-requestor': 'ATTENDING_CLINICIAN',
      'x-dual-custody-authorizer': 'DPO_OFFICER',
      'x-dual-custody-rationale': 'Audited IRB registry export'
    });
    await fhirHandler(authorized.req, authorized.res);
    expect(authorized.res.getStatus()).toBe(200);
    expect(authorized.res.getJson().resourceType).toBe('Bundle');
  });
});
