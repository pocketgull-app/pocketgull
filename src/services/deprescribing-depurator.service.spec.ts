import { describe, it, expect, beforeEach } from 'vitest';
import { DeprescribingDepuratorService } from './deprescribing-depurator.service';

describe('DeprescribingDepuratorService (Engine 1: Polypharmacy Discontinuation Engine)', () => {
  let service: DeprescribingDepuratorService;

  beforeEach(() => {
    service = new DeprescribingDepuratorService();
  });

  it('1. Detects Amlodipine -> Edema -> Furosemide prescribing cascade', () => {
    const meds = ['Amlodipine 10mg daily', 'Furosemide 20mg daily', 'Metformin 500mg BID'];
    const audit = service.analyzeMedicationList(meds, 72);

    expect(audit.identifiedCascades.length).toBe(1);
    const cascade = audit.identifiedCascades[0];
    expect(cascade.primaryDrug).toBe('Amlodipine');
    expect(cascade.secondaryPrescribedDrug).toBe('Furosemide');
    expect(cascade.adverseReaction).toContain('Ankle Edema');
    expect(cascade.deprescribingGuidance).toContain('substitute with an ACE inhibitor/ARB');
  });

  it('2. Detects Donepezil + Oxybutynin therapeutic antagonism cascade', () => {
    const meds = ['Donepezil 10mg nightly', 'Oxybutynin 5mg daily'];
    const audit = service.analyzeMedicationList(meds, 78);

    expect(audit.identifiedCascades.some(c => c.id === 'cascade-cholinesterase-incontinence-anticholinergic')).toBe(true);
    expect(audit.anticholinergicCognitiveBurdenScore).toBeGreaterThanOrEqual(3);
  });

  it('3. Flags STOPP v3 criteria violations (Prolonged Omeprazole in elder)', () => {
    const meds = ['Omeprazole 40mg daily', 'Atorvastatin 20mg daily'];
    const audit = service.analyzeMedicationList(meds, 68);

    expect(audit.stoppAlerts.some(s => s.criterionCode === 'STOPP_PPI_PROLONGED')).toBe(true);
    expect(audit.deprescribingCandidatesCount).toBeGreaterThanOrEqual(1);
  });

  it('4. Generates structured multi-week PPI tapering protocol with physiological monitoring parameters', () => {
    const plan = service.generateTaperingSchedule('Omeprazole', '40mg daily');

    expect(plan.medication).toBe('Omeprazole');
    expect(plan.taperSteps.length).toBe(3);
    expect(plan.taperSteps[0].dosePercentage).toBe(50);
    expect(plan.taperSteps[0].reboundSymptomAlert).toContain('rebound acid hypersecretion');
    expect(plan.physicianAttestationRequired).toBe(true);
    expect(plan.clinicalSafetyStamp).toContain('STOPP/START v3');
  });
});
