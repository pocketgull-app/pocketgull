import { extractNlpProbabilities, applyCoOccurrenceCalibration, computeKinematicsAssessment, rsnaKneeRouter } from './rsna-knee.routes';
import { Request, Response } from 'express';

describe('RSNA Knee Abnormality Detection & 3D Kinematics Router Suite', () => {
  it('1. Extracts positive clinical abnormalities from unstructured radiology report impressions', () => {
    const report = 'High-grade full-thickness tear of the anterior cruciate ligament with marked bone contusion in the lateral femoral condyle and moderate joint effusion.';
    const probs = extractNlpProbabilities(report);

    expect(probs['acl']).toBeGreaterThan(0.90);
    expect(probs['contusion']).toBeGreaterThan(0.90);
    expect(probs['effusion']).toBeGreaterThan(0.90);
    expect(probs['fracture']).toBeLessThan(0.10);
  });

  it('2. Correctly handles explicit medical negations in radiology text', () => {
    const report = 'No evidence of ACL tear or meniscal tear. Ligaments intact. No joint effusion or fracture.';
    const probs = extractNlpProbabilities(report);

    expect(probs['acl']).toBeLessThan(0.05);
    expect(probs['medial_meniscus']).toBeLessThan(0.05);
    expect(probs['lateral_meniscus']).toBeLessThan(0.05);
    expect(probs['effusion']).toBeLessThan(0.10);
    expect(probs['fracture']).toBeLessThan(0.05);
  });

  it('3. Applies Bayesian co-occurrence calibration (ACL tear + Bone Contusion pivot)', () => {
    const initial = {
      acl: 0.95,
      mcl: 0.05,
      medial_meniscus: 0.10,
      lateral_meniscus: 0.05,
      medial_oa: 0.10,
      lateral_oa: 0.05,
      pf_oa: 0.05,
      effusion: 0.20,
      synovitis: 0.10,
      bakers_cyst: 0.05,
      contusion: 0.30,
      fracture: 0.02
    };

    const calibrated = applyCoOccurrenceCalibration(initial);
    expect(calibrated['contusion']).toBeGreaterThanOrEqual(0.88);
    expect(calibrated['effusion']).toBeGreaterThanOrEqual(0.85);
  });

  it('4. Computes 3D Musculoskeletal Kinematics assessment (Q-angle, KL Grade, Joint Space)', () => {
    const severeOaProbs = {
      medial_oa: 0.95,
      medial_meniscus: 0.90,
      acl: 0.10
    };

    const kinematics = computeKinematicsAssessment(severeOaProbs);
    expect(kinematics.alignment).toBe('Genu Varum (Bow-legged)');
    expect(kinematics.qAngleDegrees).toBeLessThan(14.5);
    expect(kinematics.kellgrenLawrenceGrade).toBe(4);
    expect(kinematics.jointSpaceNarrowingMm).toBeLessThan(3.0);
    expect(kinematics.kineticChainRiskFactor).toBe('Severe');
  });

  it('5. Handles express POST /predict route execution and returns FHIR bundle + ONC DSI metadata', () => {
    const handler = (rsnaKneeRouter.stack.find((layer: any) => layer.route?.path === '/predict')?.route?.stack[0]?.handle);
    expect(handler).toBeDefined();

    const req = {
      body: {
        study_id: 'STUDY-TEST-001',
        report_text: 'Complete tear of anterior cruciate ligament with effusion.',
        apply_calibration: true
      }
    } as unknown as Request;

    let statusCode = 0;
    let jsonResponse: any = null;

    const res = {
      status: vi.fn((code: number) => {
        statusCode = code;
        return res;
      }),
      json: vi.fn((payload: any) => {
        jsonResponse = payload;
        return res;
      })
    } as unknown as Response;

    const next = vi.fn();
    handler(req, res, next);

    expect(statusCode).toBe(200);
    expect(jsonResponse).toBeDefined();
    expect(jsonResponse.study_id).toBe('STUDY-TEST-001');
    expect(jsonResponse.targets.length).toBe(12);
    expect(jsonResponse.kinematics).toBeDefined();
    expect(jsonResponse.fhir_bundle.resourceType).toBe('Bundle');
    expect(jsonResponse.onc_dsi_metadata.macro_auc).toBe(0.9428);
  });
});
