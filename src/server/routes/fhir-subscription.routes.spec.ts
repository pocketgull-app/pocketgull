import { describe, it, expect } from 'vitest';
import { fhirSubscriptionRouter } from './fhir-subscription.routes';

describe('FHIR R4 Real-time Subscription Router (/api/fhir/subscription)', () => {
  it('should expose GET /status returning subscription channel telemetry', () => {
    const layer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/status' && l.route?.methods?.get);
    expect(layer).toBeDefined();
    const handler = layer.route.stack[0].handle;

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {};
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: (payload: any) => { jsonResult = payload; }
        };
      }
    };

    handler(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(jsonResult).toBeDefined();
    expect(jsonResult.status).toBe('ACTIVE');
    expect(jsonResult.supportedTopics.length).toBeGreaterThan(0);
  });

  it('should handle POST / handshake ping from EHR webhook manager', () => {
    const layer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/' && l.route?.methods?.post);
    expect(layer).toBeDefined();
    const handler = layer.route.stack[0].handle;

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        resourceType: 'Bundle',
        type: 'handshake',
        subscription: 'Subscription/pg-adt-subscription-01'
      }
    };
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: (payload: any) => { jsonResult = payload; }
        };
      }
    };

    handler(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(jsonResult.status).toBe('HANDSHAKE_ACKNOWLEDGED');
    expect(jsonResult.message).toContain('Handshake successful');
  });

  it('should process real-time ADT Encounter notification on POST /', () => {
    const layer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/' && l.route?.methods?.post);
    expect(layer).toBeDefined();
    const handler = layer.route.stack[0].handle;

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      headers: {
        'x-ehr-source': 'Epic Hyperspace v2026'
      },
      body: {
        resourceType: 'Bundle',
        type: 'history',
        entry: [
          {
            resource: {
              resourceType: 'Encounter',
              id: 'enc-admission-7701',
              status: 'in-progress',
              class: { code: 'IMP', display: 'inpatient encounter' },
              subject: { reference: 'Patient/pat-9912', display: 'Eleanor Vance' }
            }
          }
        ]
      }
    };
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: (payload: any) => { jsonResult = payload; }
        };
      }
    };

    handler(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(jsonResult.status).toBe('RECEIVED_AND_QUEUED');
    expect(jsonResult.eventType).toBe('ADT_ADMISSION');
    expect(jsonResult.sha256Digest).toBeDefined();
  });

  it('should simulate ADT event via POST /simulate and record in history', () => {
    const simLayer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/simulate' && l.route?.methods?.post);
    expect(simLayer).toBeDefined();
    const simHandler = simLayer.route.stack[0].handle;

    let simResult: any = null;
    let simCode = 0;
    const simReq: any = {
      body: {
        type: 'ADT_ADMISSION',
        mrn: 'MRN-SIM-7849'
      }
    };
    const simRes: any = {
      setHeader: () => {},
      status: (code: number) => {
        simCode = code;
        return {
          json: (payload: any) => { simResult = payload; }
        };
      }
    };

    simHandler(simReq, simRes, () => {});
    expect(simCode).toBe(200);
    expect(simResult.status).toBe('SIMULATED_EVENT_QUEUED');
    expect(simResult.eventType).toBe('ADT_ADMISSION');
    expect(simResult.patientMrn).toBe('MRN-SIM-7849');

    // Verify history now includes this event
    const histLayer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/history' && l.route?.methods?.get);
    expect(histLayer).toBeDefined();
    const histHandler = histLayer.route.stack[0].handle;

    let histResult: any = null;
    const histReq: any = { query: { limit: '5' } };
    const histRes: any = {
      setHeader: () => {},
      status: (c: number) => ({
        json: (p: any) => { histResult = p; }
      })
    };

    histHandler(histReq, histRes, () => {});
    expect(histResult.events.length).toBeGreaterThan(0);
    expect(histResult.events[0].patientMrn).toBe('MRN-SIM-7849');
  });

  it('should expose GET /jwks returning RFC 7517 public JSON Web Key Set', () => {
    const jwksLayer = fhirSubscriptionRouter.stack.find((l: any) => l.route?.path === '/jwks' && l.route?.methods?.get);
    expect(jwksLayer).toBeDefined();
    const jwksHandler = jwksLayer.route.stack[0].handle;

    let jwksResult: any = null;
    let jwksCode = 0;
    const req: any = {};
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        jwksCode = code;
        return {
          json: (payload: any) => { jwksResult = payload; }
        };
      }
    };

    jwksHandler(req, res, () => {});
    expect(jwksCode).toBe(200);
    expect(jwksResult.keys).toBeDefined();
    expect(Array.isArray(jwksResult.keys)).toBe(true);
    expect(jwksResult.keys[0].kty).toBe('RSA');
    expect(jwksResult.keys[0].alg).toBe('RS384');
    expect(jwksResult.keys[0].kid).toBe('pg-key-2026-rsa384');
  });
});
