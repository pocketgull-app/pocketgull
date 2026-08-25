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
  const stripeLinkHandler = (router.stack.find((layer: any) => layer.route?.path === '/payout/stripe-connect-link')?.route?.stack.slice(-1)[0] as any)?.handle;
  const payoutHandler = (router.stack.find((layer: any) => layer.route?.path === '/payout/request')?.route?.stack.slice(-1)[0] as any)?.handle;

  it('GET /api/research/cohorts should return accredited disease cohorts with k-anonymity scores', () => {
    const { req, res } = createMockReqRes();
    getCohortsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    const cohorts = data['cohorts'] as Array<Record<string, unknown>>;
    expect(cohorts.length).toBeGreaterThanOrEqual(5);
    expect(Number(cohorts[0]['kAnonymityScore'])).toBeGreaterThanOrEqual(8);
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

  it('POST /api/research/payout/stripe-connect-link should generate Stripe Express onboarding URL', () => {
    const { req, res } = createMockReqRes({ patientId: 'patient_alpha' });
    stripeLinkHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const data = res.getJson();
    expect(data['success']).toBe(true);
    expect(String(data['onboardingUrl'])).toContain('connect.stripe.com/express');
  });

  it('POST /api/research/payout/request should enforce dual-custody for disbursements >= $500', () => {
    const normalReqRes = createMockReqRes({ amountUsd: 75.0, accountId: 'acct_test' });
    payoutHandler(normalReqRes.req, normalReqRes.res);

    expect(normalReqRes.res.status).toHaveBeenCalledWith(200);
    const normalData = normalReqRes.res.getJson();
    expect(normalData['status']).toBe('disbursed');
    expect(normalData['requiresDualCustody']).toBe(false);

    const highReqRes = createMockReqRes({ amountUsd: 650.0, accountId: 'acct_test' });
    payoutHandler(highReqRes.req, highReqRes.res);

    expect(highReqRes.res.status).toHaveBeenCalledWith(200);
    const highData = highReqRes.res.getJson();
    expect(highData['status']).toBe('pending_dual_custody');
    expect(highData['requiresDualCustody']).toBe(true);
  });
});
