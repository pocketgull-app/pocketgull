import { createResearchRouter } from './research.routes';
import type { Request, Response } from 'express';

function createMockReqRes(body: Record<string, unknown> = {}, query: Record<string, string> = {}) {
  const req = {
    body,
    query
  } as unknown as Request;

  let statusCode = 200;
  let jsonPayload: Record<string, unknown> | null = null;

  const res = {
    status: vi.fn((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((payload: Record<string, unknown>) => {
      jsonPayload = payload;
      return res;
    }),
    getStatus: () => statusCode,
    getJson: () => jsonPayload
  } as unknown as Response & { getStatus: () => number; getJson: () => Record<string, unknown> };

  return { req, res };
}

describe('Research Routes (/api/research)', () => {
  const router = createResearchRouter();

  // Extract handlers from router stack
  const getCohortsHandler = (router.stack.find((layer: any) => layer.route?.path === '/cohorts')?.route?.stack.slice(-1)[0] as any)?.handle;
  const enrollHandler = (router.stack.find((layer: any) => layer.route?.path === '/enroll')?.route?.stack.slice(-1)[0] as any)?.handle;
  const policyHandler = (router.stack.find((layer: any) => layer.route?.path === '/policy')?.route?.stack.slice(-1)[0] as any)?.handle;

  it('GET /api/research/cohorts should return accredited disease cohorts with k-anonymity scores and zero compensation', () => {
    const { req, res } = createMockReqRes();
    getCohortsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    const cohorts = data['cohorts'] as Array<Record<string, unknown>>;
    expect(cohorts.length).toBeGreaterThanOrEqual(5);
    expect(Number(cohorts[0]['kAnonymityScore'])).toBeGreaterThanOrEqual(8);
    expect(cohorts[0]['studyFundingModel']).toBe('open_science_commons');
    expect(cohorts[0]['grantEscrowStatus']).toBe('pure_open_science');
    expect(cohorts[0]['compensationPerQueryUsd']).toBe(0.00);
  });

  it('POST /api/research/enroll should validate digital signature and return authorization hash', () => {
    const { req, res } = createMockReqRes({
      patientId: 'patient_alpha',
      cohortIds: ['cohort_diabetes_cgm'],
      signatureName: 'Dr. Jane Doe'
    });
    enrollHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    expect(String(data['authorizationSignatureHash'])).toMatch(/^sha256_/);
  });

  it('GET /api/research/policy should enforce Belmont Report open science framework', () => {
    const { req, res } = createMockReqRes();
    policyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    expect(data['model']).toBe('open_science_commons');
    expect(data['escrowEnforced']).toBe(true);
    expect(String(data['payoutPolicy'])).toContain('Pure Open Science');
  });
});
