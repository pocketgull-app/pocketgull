import { describe, it, expect } from 'vitest';
import { cdsHooksRouter } from './cds-hooks.routes';

describe('HL7 SMART-on-FHIR CDS Hooks Router', () => {
  it('should expose discovery endpoint with 3 registered clinical CDS services', () => {
    const getHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/' && layer.route?.methods?.get)?.route?.stack[0]?.handle);
    expect(getHandler).toBeDefined();

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

    getHandler(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(jsonResult).toBeDefined();
    expect(jsonResult.services.length).toBe(3);
    expect(jsonResult.services[0].id).toBe('pocketgull-rx-phenoconversion');
  });

  it('should return critical CDS warning card when Berberine and Metformin clash', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-rx-phenoconversion' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'medication-prescribe',
        context: {
          patientId: 'p_123',
          medications: ['Berberine 500mg', 'Metformin 1000mg']
        }
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

    postHandler(req, res, () => {});
    expect(statusCode).toBe(200);
    expect(jsonResult.cards.length).toBe(1);
    expect(jsonResult.cards[0].indicator).toBe('critical');
    expect(jsonResult.cards[0].summary).toContain('Phenoconversion');
  });
});
