import '@angular/compiler';
import { hsaRouter } from './hsa.routes';
import type { Request, Response } from 'express';

function createMockReqRes(body: Record<string, unknown> = {}, params: Record<string, string> = {}, method = 'POST') {
  const req = {
    body,
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

describe('Express HSA Incentive Router (/api/hsa)', () => {
  const linkHandler = (hsaRouter.stack.find((layer: any) => layer.route?.path === '/cards/link')?.route?.stack[0] as any)?.handle;
  const disburseHandler = (hsaRouter.stack.find((layer: any) => layer.route?.path === '/rebate/disburse')?.route?.stack[0] as any)?.handle;
  const ledgerHandler = (hsaRouter.stack.find((layer: any) => layer.route?.path?.startsWith('/ledger'))?.route?.stack[0] as any)?.handle;

  it('1. POST /api/hsa/cards/link tokens and links card', () => {
    const { req, res } = createMockReqRes({
      patientId: 'P001',
      issuerName: 'Fidelity HSA',
      cardType: 'HSA',
      last4: '7721'
    });
    linkHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.success).toBe(true);
    expect(body.issuerName).toBe('Fidelity HSA');
    expect(body.maskedPan).toContain('7721');
    expect(body.iiasCompliant).toBe(true);
  });

  it('2. POST /api/hsa/rebate/disburse disburses Stackelberg adherence rebate', () => {
    const { req, res } = createMockReqRes({
      patientId: 'P001',
      adherenceDomain: 'MEDICATION_PDC',
      amountUsd: 25.00,
      reason: '90-Day Metformin PDC > 80%'
    });
    disburseHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.success).toBe(true);
    expect(body.disbursedAmountUsd).toBe(25.00);
    expect(body.fhirClaimResponse).toBeDefined();
    expect(body.fhirClaimResponse.resourceType).toBe('ClaimResponse');
  });

  it('3. GET /api/hsa/ledger/:patientId returns patient transaction history', () => {
    const { req, res } = createMockReqRes({}, { patientId: 'P001' }, 'GET');
    ledgerHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.patientId).toBe('P001');
    expect(body.count).toBeGreaterThan(0);
    expect(Array.isArray(body.ledger)).toBe(true);
  });
});
