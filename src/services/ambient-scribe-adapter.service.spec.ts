import { TestBed } from '@angular/core/testing';
import { AmbientScribeAdapterService, IScribeIngestRequest } from './ambient-scribe-adapter.service';
import { PatientStateService } from './patient-state.service';
import { IsmpSafetyGuardService } from './ismp-safety-guard.service';

describe('AmbientScribeAdapterService', () => {
  let service: AmbientScribeAdapterService;
  let patientState: PatientStateService;
  let ismpGuard: IsmpSafetyGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AmbientScribeAdapterService,
        PatientStateService,
        IsmpSafetyGuardService
      ]
    });
    service = TestBed.inject(AmbientScribeAdapterService);
    patientState = TestBed.inject(PatientStateService);
    ismpGuard = TestBed.inject(IsmpSafetyGuardService);
  });

  it('1. Initializes with empty adjudication history', () => {
    expect(service).toBeTruthy();
    expect(service.adjudicationHistory().length).toBe(0);
    expect(service.totalTranscriptsIngested()).toBe(0);
    expect(service.activeAlertsCount()).toBe(0);
  });

  it('2. Strips HIPAA §164.514 Safe Harbor direct identifiers', () => {
    const raw = 'Patient SSN: 123-45-6789. Contact at (555) 234-5678 or 555-876-5432. MRN: MRN998877. DOB: 05/14/1982.';
    const sanitized = service.sanitizeHipaaSafeHarbor(raw);

    expect(sanitized).not.toContain('123-45-6789');
    expect(sanitized).toContain('[REDACTED-SSN]');
    expect(sanitized).not.toContain('(555) 234-5678');
    expect(sanitized).toContain('[REDACTED-PHONE]');
    expect(sanitized).not.toContain('MRN998877');
    expect(sanitized).toContain('[REDACTED-MRN]');
    expect(sanitized).not.toContain('05/14/1982');
    expect(sanitized).toContain('[REDACTED-DOB]');
  });

  it('3. Ingests transcript, extracts vitals, symptoms, and proposed medications', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'abridge',
      rawTranscript: `
        Clinician: Good morning. Patient reports burning pain in lower back radiating with numbness.
        Exam: BP is 136/88, pulse 76, temp 98.6. O2 sat 98%.
        Plan: Start gabapentin 300 mg at bedtime.
      `
    };

    const result = await service.adjudicateTranscript(request);

    expect(result.adjudicationId).toContain('adj_abridge_');
    expect(result.extractedEntities.symptoms).toContain('burning pain');
    expect(result.extractedEntities.symptoms).toContain('numbness');
    expect(result.extractedEntities.vitals.bloodPressureSystolic).toBe(136);
    expect(result.extractedEntities.vitals.bloodPressureDiastolic).toBe(88);
    expect(result.extractedEntities.vitals.heartRate).toBe(76);
    expect(result.extractedEntities.vitals.temperatureFahrenheit).toBe(98.6);
    expect(result.extractedEntities.vitals.oxygenSaturation).toBe(98);
    expect(result.extractedEntities.medications.length).toBeGreaterThan(0);
    expect(result.extractedEntities.medications[0].name.toLowerCase()).toContain('gabapentin');
  });

  it('4. Detects critical lethal Drug-Drug Interactions (Gabapentinoids + Benzodiazepines/Opioids)', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'nuance_dax',
      rawTranscript: `
        Patient with chronic sciatica. Clinician plans to continue gabapentin 300 mg and add clonazepam 0.5 mg for nighttime spasms.
      `
    };

    const result = await service.adjudicateTranscript(request);

    expect(result.drugInteractions.length).toBeGreaterThan(0);
    const ddi = result.drugInteractions.find(i => i.primaryDrug.includes('Gabapentinoid'));
    expect(ddi).toBeDefined();
    expect(ddi?.severity).toBe('CRITICAL_LETHAL');
    expect(ddi?.fdaBlackBoxWarning).toBe(true);
    expect(ddi?.clinicalMechanism).toContain('respiratory depression');

    // Verify STAT intervention pathway recommended
    const statPathway = result.recommendedPathways.find(p => p.pathwayId === 'STAT_DDI_INTERVENTION');
    expect(statPathway).toBeDefined();
    expect(statPathway?.actTier).toBe('ACUTE_CRITICAL');
  });

  it('5. Detects ISMP posology defects (trailing zeroes and naked decimals)', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'suki',
      rawTranscript: `
        Order lisinopril 10.0 mg daily and .5 mg clonazepam at bedtime.
      `
    };

    const result = await service.adjudicateTranscript(request);

    expect(result.ismpSafetyAudit.hasViolations).toBe(true);
    const trailingZero = result.ismpSafetyAudit.violations.find(v => v.type === 'TRAILING_ZERO');
    expect(trailingZero).toBeDefined();
    expect(trailingZero?.corrected).toBe('10 mg');

    const nakedDecimal = result.ismpSafetyAudit.violations.find(v => v.type === 'NAKED_DECIMAL');
    expect(nakedDecimal).toBeDefined();
    expect(nakedDecimal?.corrected).toBe('0.5 mg');
  });

  it('6. Maps Three Acts clinical pathways based on symptoms and vitals', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'abridge',
      rawTranscript: `
        Patient with BP 142/92. Reports severe insomnia and burning pain.
      `
    };

    const result = await service.adjudicateTranscript(request);

    const actI = result.recommendedPathways.find(p => p.actTier === 'ACT_I_METABOLIC');
    const actII = result.recommendedPathways.find(p => p.actTier === 'ACT_II_GLYMPHATIC');
    const actIII = result.recommendedPathways.find(p => p.actTier === 'ACT_III_RESILIENCE');

    expect(actI).toBeDefined();
    expect(actI?.pathwayName).toContain('Act I');
    expect(actII).toBeDefined();
    expect(actII?.pathwayName).toContain('Act II');
    expect(actIII).toBeDefined();
  });

  it('7. Commits to PatientStateService when autoCommitToPatientState is true', async () => {
    const updateVitalSpy = vi.spyOn(patientState, 'updateVital');
    const addNoteSpy = vi.spyOn(patientState, 'addClinicalNote');

    const request: IScribeIngestRequest = {
      scribeSource: 'abridge',
      rawTranscript: `
        Patient encounter. BP 130/82, HR 72, SpO2 99%. Patient complains of back pain.
      `,
      autoCommitToPatientState: true
    };

    const result = await service.adjudicateTranscript(request);

    expect(result.appliedToPatientState).toBe(true);
    expect(updateVitalSpy).toHaveBeenCalledWith('bp', '130/82');
    expect(updateVitalSpy).toHaveBeenCalledWith('hr', '72');
    expect(updateVitalSpy).toHaveBeenCalledWith('spO2', '99%');
    expect(addNoteSpy).toHaveBeenCalledWith(expect.objectContaining({
      id: result.adjudicationId,
      sourceLens: 'Ambient Scribe (abridge)'
    }));
  });

  it('8. Computes SHA-256 integrity digest for FDA 21 CFR Part 11 attestation', async () => {
    const hash = await service.computeIntegrityDigest('PocketGull Ambient Scribe Attestation');
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(10);
  });

  it('9. Evaluates CPT Remote Physiologic Monitoring (RPM) and RTM reimbursement codes', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'nuance_dax',
      rawTranscript: `
        Patient with stage 2 hypertension. BP 146/92, HR 78. Planning home blood pressure cuff daily tracking.
      `
    };

    const result = await service.adjudicateTranscript(request);

    expect(result.cptReimbursement.length).toBeGreaterThanOrEqual(3);
    const cpt99453 = result.cptReimbursement.find(c => c.cptCode === '99453');
    const cpt99454 = result.cptReimbursement.find(c => c.cptCode === '99454');
    expect(cpt99453).toBeDefined();
    expect(cpt99454).toBeDefined();
    expect(result.totalEstimatedAnnualReimbursementUsd).toBeGreaterThanOrEqual(1000);
  });

  it('10. Recommends Salutogenic Stepped-Care Intercept prior to prescribing', async () => {
    const request: IScribeIngestRequest = {
      scribeSource: 'abridge',
      rawTranscript: `
        Clinician: Patient has lower back pain and severe insomnia.
        Plan: Start gabapentin 300 mg and clonazepam 0.5 mg.
      `
    };

    const result = await service.adjudicateTranscript(request);

    // Verify Salutogenic First-Line Pathway is recommended
    const salutogenicPathway = result.recommendedPathways.find(p => p.actTier === 'SALUTOGENIC_PRE_Rx');
    expect(salutogenicPathway).toBeDefined();
    expect(salutogenicPathway?.pathwayName).toContain('Salutogenic Stepped-Care Intercept');
    expect(salutogenicPathway?.actionDirectives.some(d => d.includes('McKenzie') || d.includes('nerve flossing'))).toBe(true);
    expect(salutogenicPathway?.actionDirectives.some(d => d.includes('CBT-I'))).toBe(true);
    expect(salutogenicPathway?.actionDirectives.some(d => d.includes('Antonovsky'))).toBe(true);

    // Verify SBAR Recommendation prioritizes salutogenic stepped-care
    expect(result.sbarSummary.recommendation).toContain('Prioritize Salutogenic Stepped-Care Interventions');
  });
});
