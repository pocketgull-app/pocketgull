import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Cyp450DdiMatrixService } from './cyp450-ddi-matrix.service';

describe('Cyp450DdiMatrixService (Clinical Model P12)', () => {
  let service: Cyp450DdiMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Cyp450DdiMatrixService]
    });
    service = TestBed.inject(Cyp450DdiMatrixService);
  });

  it('1. Initializes with Simvastatin + Clarithromycin severe CYP3A4 MBI interaction', () => {
    expect(service).toBeDefined();
    expect(service.activePreset()).toBe('simvastatin_clarithromycin');

    const ddi = service.ddiAssessment();
    expect(ddi.aucRatio).toBeGreaterThan(5.0);
    expect(ddi.interactionSeverity).toBe('Contraindicated / Severe Hazard');
    expect(ddi.victim.primaryIsoform).toBe('CYP3A4');
    expect(ddi.perpetrator.inhibitionType).toBe('Mechanism-Based Inactivation (MBI)');
    expect(ddi.victim.toxicityConsequences).toContain('rhabdomyolysis');
    expect(ddi.clinicalActionProtocol).toContain('CONTRAINDICATED COMBINATION');
  });

  it('2. Predicts Warfarin + Amiodarone CYP2C9 bleeding hazard in narrow therapeutic index drug', () => {
    service.applyPreset('warfarin_amiodarone');

    const ddi = service.ddiAssessment();
    expect(ddi.aucRatio).toBeGreaterThan(2.0);
    expect(ddi.interactionSeverity).toBe('Contraindicated / Severe Hazard');
    expect(ddi.victim.therapeuticWindow).toBe('Narrow (Critical Toxicity)');
    expect(ddi.victim.toxicityConsequences).toContain('Supratherapeutic INR');
    expect(ddi.victim.toxicityConsequences).toContain('hemorrhage');
  });

  it('3. Detects Clopidogrel prodrug bioactivation failure when co-prescribed with Omeprazole (CYP2C19)', () => {
    service.applyPreset('clopidogrel_omeprazole');

    const ddi = service.ddiAssessment();
    expect(ddi.victim.isProdrugRequiringBioactivation).toBe(true);
    expect(ddi.aucRatio).toBeLessThan(0.60); // Active metabolite plummets
    expect(ddi.interactionSeverity).toBe('Contraindicated / Severe Hazard');
    expect(ddi.victim.toxicityConsequences).toContain('stent thrombosis');
    expect(ddi.clinicalActionProtocol).toContain('DO NOT CO-PRESCRIBE');
    expect(ddi.clinicalActionProtocol).toContain('pantoprazole');
  });

  it('4. Models Metoprolol + Fluoxetine CYP2D6 MBI bradycardia risk', () => {
    service.applyPreset('metoprolol_fluoxetine');

    const ddi = service.ddiAssessment();
    expect(ddi.aucRatio).toBeGreaterThan(3.0);
    expect(ddi.interactionSeverity).toBe('Major Interaction');
    expect(ddi.victim.primaryIsoform).toBe('CYP2D6');
    expect(ddi.victim.toxicityConsequences).toContain('bradycardia');
    expect(ddi.recommendedDoseAdjustment).toContain('Reduce Metoprolol dosage');
  });

  it('5. Models Theophylline + Ciprofloxacin CYP1A2 neurotoxicity risk', () => {
    service.applyPreset('theophylline_ciprofloxacin');

    const ddi = service.ddiAssessment();
    expect(ddi.aucRatio).toBeGreaterThan(2.0);
    expect(ddi.interactionSeverity).toBe('Contraindicated / Severe Hazard');
    expect(ddi.victim.toxicityConsequences).toContain('seizures');
  });

  it('6. Accurately handles mild/moderate interaction with Atorvastatin + Amlodipine', () => {
    service.applyPreset('atorvastatin_amlodipine');

    const ddi = service.ddiAssessment();
    expect(ddi.aucRatio).toBeLessThan(1.5);
    expect(ddi.interactionSeverity).toBe('Moderate Interaction');
  });

  it('7. Strictly enforces ISMP rules against trailing zeros and naked decimals', () => {
    // formatIsmpDosage
    expect(service.formatIsmpDosage('Warfarin', 5.0)).toBe('Warfarin 5 mg');
    expect(service.formatIsmpDosage('Digoxin', 0.25)).toBe('Digoxin 0.25 mg');
    expect(service.formatIsmpDosage('Levothyroxine', 0.05)).toBe('Levothyroxine 0.05 mg');

    // sanitizeIsmpPosologyText
    const rawPrescription = 'Order .5 mg clonazepam and 10.0 mg lisinopril; also .25 mg digoxin and 20.00 mg furosemide';
    const sanitized = service.sanitizeIsmpPosologyText(rawPrescription);

    expect(sanitized).not.toMatch(/(^|\s)\.5\s*mg/);
    expect(sanitized).toContain('0.5 mg');

    expect(sanitized).not.toContain('10.0 mg');
    expect(sanitized).toContain('10 mg');

    expect(sanitized).not.toMatch(/(^|\s)\.25\s*mg/);
    expect(sanitized).toContain('0.25 mg');

    expect(sanitized).not.toContain('20.00 mg');
    expect(sanitized).toContain('20 mg');
  });
});
