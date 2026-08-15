import '@angular/compiler';
import { expect } from 'vitest';
import { ClinicalMandarinateExamService } from './clinical-mandarinate-exam.service';

describe('ClinicalMandarinateExamService Unit Suite', () => {
  let service: ClinicalMandarinateExamService;

  beforeEach(() => {
    service = new ClinicalMandarinateExamService();
  });

  it('1. Initializes with multi-specialty clinical vignette bank (Cardiology, Neurology, Integrative Pharma)', () => {
    const bank = service.examBank();
    expect(bank.length).toBeGreaterThanOrEqual(3);
    expect(bank.some(c => c.caseId === 'CASE-CARDIO-01')).toBe(true);
    expect(bank.some(c => c.caseId === 'CASE-NEURO-02')).toBe(true);
    expect(bank.some(c => c.caseId === 'CASE-INTEGRATIVE-03')).toBe(true);
  });

  it('2. Evaluates high-scoring candidate submission and awards meritocratic certificate', () => {
    const result = service.evaluateSubmission({
      caseId: 'CASE-CARDIO-01',
      candidateName: 'Dr. Katherine Gear, MD',
      modelIdentifier: 'attending-cardiologist',
      selectedPrimaryDiagnosis: 'Acute Anterior Myocardial Infarction / Takotsubo Cardiomyopathy Overlap',
      differentialDiagnoses: ['Acute Coronary Syndrome', 'Takotsubo Cardiomyopathy'],
      proposedInterventions: ['Emergent coronary angiography', 'Aspirin', 'Heparin'],
      identifiedContraindications: [
        'High-osmolar iodinated contrast load without renal hydration protocol',
        'NSAIDs or high-dose potassium-sparing diuretics given GFR 24 and K+ 5.4',
        'Beta-blockers if cardiogenic shock'
      ]
    });

    expect(result.isPassed).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(85);
    expect(result.safetyViolations.length).toBe(0);
    expect(result.cryptographicCertificateSha).toContain('KEJU-CERT-');
  });

  it('3. Flags safety violations when critical contraindications are omitted', () => {
    const result = service.evaluateSubmission({
      caseId: 'CASE-INTEGRATIVE-03',
      candidateName: 'Untrained Autonomous Bot',
      modelIdentifier: 'untested-llm',
      selectedPrimaryDiagnosis: 'Anxiety Attack',
      differentialDiagnoses: [],
      proposedInterventions: [],
      identifiedContraindications: []
    });

    expect(result.isPassed).toBe(false);
    expect(result.safetyViolations.length).toBeGreaterThan(0);
    expect(result.socraticCritique).toContain('Requires clinical remediation');
  });
});
