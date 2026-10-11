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
    expect(jsonResult.services.length).toBe(5);
    expect(jsonResult.services[0].id).toBe('pocketgull-rx-phenoconversion');
    expect(jsonResult.services.some((s: any) => s.id === 'pocketgull-cardiometabolic-radar')).toBe(true);
    expect(jsonResult.services.some((s: any) => s.id === 'pocketgull-chrono-nutrition-guard')).toBe(true);
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

  it('should trigger SPU non-insulin GLUT4 recommendation card on high glucose velocity (dG/dt >= 1.5 mg/dL/min)', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-cardiometabolic-radar' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'patient-view',
        context: {
          patientId: 'SUBJ-7A2F',
          glucoseMgDl: 155,
          glucoseVelocity: 1.6
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
    expect(jsonResult.cards.length).toBeGreaterThanOrEqual(1);
    const spuCard = jsonResult.cards.find((c: any) => c.summary.includes('High Postprandial Glucose Velocity'));
    expect(spuCard).toBeDefined();
    expect(spuCard.detail).toContain('soleus pushup');
    expect(spuCard.detail).toContain('Hamilton et al. (2022)');
  });

  it('should trigger critical Tier 4 safety stop card for Level 2 hypoglycemia (<54 mg/dL)', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-cardiometabolic-radar' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'patient-view',
        context: {
          patientId: 'SUBJ-7A2F',
          glucoseMgDl: 48,
          glucoseVelocity: -1.2
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
    const hypoCard = jsonResult.cards.find((c: any) => c.summary.includes('Level 2 Hypoglycemia'));
    expect(hypoCard).toBeDefined();
    expect(hypoCard.indicator).toBe('critical');
    expect(hypoCard.detail).toContain('Rule of 15');
  });

  it('should flag CYP3A4 interaction when Berberine co-administered with Atorvastatin', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-cardiometabolic-radar' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'patient-view',
        context: {
          patientId: 'SUBJ-7A2F',
          glucoseMgDl: 110,
          glucoseVelocity: 0.2,
          medications: ['Berberine 500mg BID', 'Atorvastatin 40mg daily']
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
    const ddiCard = jsonResult.cards.find((c: any) => c.summary.includes('CYP3A4 Inhibition Risk'));
    expect(ddiCard).toBeDefined();
    expect(ddiCard.indicator).toBe('warning');
  });

  it('should flag Grapefruit Furanocoumarin surge when Atorvastatin is prescribed', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-chrono-nutrition-guard' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'order-select',
        context: {
          patientId: 'P001',
          draftOrders: [{ resourceType: 'MedicationRequest', medicationCodeableConcept: { text: 'Atorvastatin 40mg PO QHS' } }]
        }
      }
    };
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return { json: (payload: any) => { jsonResult = payload; } };
      }
    };

    postHandler(req, res, () => {});
    expect(statusCode).toBe(200);
    const statinCard = jsonResult.cards.find((c: any) => c.summary.includes('Furanocoumarin Surge Risk'));
    expect(statinCard).toBeDefined();
    expect(statinCard.indicator).toBe('warning');
    expect(statinCard.detail).toContain('+330%');
    expect(statinCard.links[0].type).toBe('smart');
    expect(statinCard.suggestions[0].label).toContain('Citrus Sinensis');
  });

  it('should flag Potassium Chloride salt-substitute hyperkalemia when Lisinopril is prescribed', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-chrono-nutrition-guard' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        hook: 'order-select',
        context: {
          patientId: 'P001',
          draftOrders: [{ resourceType: 'MedicationRequest', medicationCodeableConcept: { text: 'Lisinopril 20mg PO Daily' } }],
          labs: { serumPotassium: 5.2 }
        }
      }
    };
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return { json: (payload: any) => { jsonResult = payload; } };
      }
    };

    postHandler(req, res, () => {});
    expect(statusCode).toBe(200);
    const aceiCard = jsonResult.cards.find((c: any) => c.summary.includes('Salt-Substitute & Potassium Hyperkalemia'));
    expect(aceiCard).toBeDefined();
    expect(aceiCard.indicator).toBe('critical'); // K+ >= 5.0 triggers critical
    expect(aceiCard.detail).toContain('5.2 mEq/L');
    expect(aceiCard.links[0].type).toBe('smart');
  });

  it('should validate and commit signed FHIR R4 CarePlan and NutritionOrder bundle', () => {
    const postHandler = (cdsHooksRouter.stack.find((layer: any) => layer.route?.path === '/pocketgull-push-careplan' && layer.route?.methods?.post)?.route?.stack[0]?.handle);
    expect(postHandler).toBeDefined();

    let jsonResult: any = null;
    let statusCode = 0;
    const req: any = {
      body: {
        resourceType: 'Bundle',
        id: 'bundle-tx-99',
        type: 'transaction',
        entry: [
          { resource: { resourceType: 'NutritionOrder', id: 'no-1' } },
          { resource: { resourceType: 'CarePlan', id: 'cp-1' } }
        ]
      }
    };
    const res: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return { json: (payload: any) => { jsonResult = payload; } };
      }
    };

    postHandler(req, res, () => {});
    expect(statusCode).toBe(201);
    expect(jsonResult.status).toBe('TRANSFERRED_TO_EHR');
    expect(jsonResult.sha256TamperSeal.length).toBe(64);
  });
});
