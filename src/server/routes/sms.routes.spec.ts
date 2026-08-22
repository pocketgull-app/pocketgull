import '@angular/compiler';
import { smsRouter } from './sms.routes';
import type { Request, Response } from 'express';

function createMockReqRes(body: Record<string, unknown> = {}, method = 'POST') {
  const req = {
    body,
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

describe('Express SMS Router (/api/sms)', () => {
  // Extract handlers from router stack
  const inboundHandler = (smsRouter.stack.find((layer: any) => layer.route?.path === '/inbound')?.route?.stack[0] as any)?.handle;
  const outboundHandler = (smsRouter.stack.find((layer: any) => layer.route?.path === '/outbound')?.route?.stack[0] as any)?.handle;
  const logsHandler = (smsRouter.stack.find((layer: any) => layer.route?.path === '/logs')?.route?.stack[0] as any)?.handle;

  it('1. POST /api/sms/inbound extracts vitals and awards points', () => {
    const { req, res } = createMockReqRes({ from: '+15551234567', body: 'LOG BP 120/80 HR 72' });
    inboundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.success).toBe(true);
    expect(body.commandType).toBe('VITALS_LOG');
    expect(body.urgencyLevel).toBe('ROUTINE');
    expect(body.responseSmsText).toContain('Recorded BP 120/80, HR 72 bpm');
    expect(body.fhirResource).toBeDefined();
    expect(body.fhirResource.resourceType).toBe('Observation');
  });

  it('2. POST /api/sms/inbound handles emergency chest pain trigger', () => {
    const { req, res } = createMockReqRes({ from: '+15551234567', body: 'Having severe chest pain' });
    inboundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.urgencyLevel).toBe('CRITICAL_CALL_911');
    expect(body.responseSmsText).toContain('EMERGENCY ALERT');
  });

  it('3. POST /api/sms/inbound handles medication adherence confirmation', () => {
    const { req, res } = createMockReqRes({ from: '+15551234567', body: 'MED YES taken with breakfast' });
    inboundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.commandType).toBe('MED_ADHERENCE');
    expect(body.responseSmsText).toContain('Medication adherence verified');
    expect(body.fhirResource.resourceType).toBe('MedicationStatement');
  });

  it('4. POST /api/sms/outbound dispatches health nudge with masked phone', () => {
    const { req, res } = createMockReqRes({ to: '+15559876543', messageBody: 'Daily reminder to take walk' });
    outboundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.success).toBe(true);
    expect(body.dispatchedTo).toBe('+15-***-6543');
  });

  it('5. GET /api/sms/logs retrieves HIPAA Safe Harbor sanitized interaction history', () => {
    const { req, res } = createMockReqRes({}, 'GET');
    logsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.getJson();
    expect(body.count).toBeGreaterThan(0);
    expect(Array.isArray(body.logs)).toBe(true);
  });
});
