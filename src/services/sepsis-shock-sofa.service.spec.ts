import { describe, it, expect, beforeEach } from 'vitest';
import { SepsisShockSofaService, DEFAULT_SEPSIS_INPUTS } from './sepsis-shock-sofa.service';

describe('SepsisShockSofaService (Clinical Model P8)', () => {
  let service: SepsisShockSofaService;

  beforeEach(() => {
    service = new SepsisShockSofaService();
  });

  it('1. Initializes with pristine physiological baseline (SOFA = 0, qSOFA = 0, normal CRT)', () => {
    const s = service.sofa();
    const q = service.qsofa();
    const m = service.microvascular();
    const diag = service.diagnosis();

    expect(s.totalSofa).toBe(0);
    expect(s.deltaSofa).toBe(0);
    expect(q.score).toBe(0);
    expect(q.isPositive).toBe(false);
    expect(m.isCrtNormal).toBe(true);
    expect(m.capillaryRefillTimeSec).toBe(2.2);
    expect(diag.category).toBe('Non-Septic Infection / Homeostasis');
    expect(diag.severityTier).toBe('Low Risk');
  });

  it('2. Evaluates qSOFA bedside screening accurately', () => {
    // Tachypnea only (RR 24) -> score 1 (negative)
    service.updateInputs({ respiratoryRateBpm: 24, systolicBpMmhg: 118, glasgowComaScale: 15 });
    expect(service.qsofa().score).toBe(1);
    expect(service.qsofa().isPositive).toBe(false);

    // Add altered mentation (GCS 13) -> score 2 (positive)
    service.updateInputs({ glasgowComaScale: 13 });
    expect(service.qsofa().score).toBe(2);
    expect(service.qsofa().isPositive).toBe(true);

    // Add hypotension (SBP 92) -> score 3
    service.updateInputs({ systolicBpMmhg: 92 });
    expect(service.qsofa().score).toBe(3);
    expect(service.qsofa().criteriaMet.length).toBe(3);
  });

  it('3. Calculates SOFA multi-organ subscores across all 6 systems', () => {
    service.updateInputs({
      pao2Mmhg: 65,
      fio2Percent: 50, // P/F = 130
      isMechanicallyVentilated: true, // Resp score = 3
      plateletsKUl: 45,                // Coag score = 3
      totalBilirubinMgDl: 2.8,         // Liver score = 2
      meanArterialPressureMmhg: 62,
      norepinephrineDoseMcgKgMin: 0.15,// CV score = 4
      glasgowComaScale: 11,            // CNS score = 2
      serumCreatinineMgDl: 2.4         // Renal score = 2
    });

    const s = service.sofa();
    expect(s.respiratory).toBe(3);
    expect(s.coagulation).toBe(3);
    expect(s.liver).toBe(2);
    expect(s.cardiovascular).toBe(4);
    expect(s.cns).toBe(2);
    expect(s.renal).toBe(2);
    expect(s.totalSofa).toBe(16);
    expect(s.deltaSofa).toBe(16);
  });

  it('4. Assesses ANDROMEDA-SHOCK capillary refill time & lactate clearance velocity', () => {
    // Baseline lactate 4.0, 2-hour repeat 2.8 -> 30% clearance (adequate)
    service.updateInputs({
      capillaryRefillTimeSec: 4.5,
      serumLactateInitialMmolL: 4.0,
      serumLactateCurrentMmolL: 2.8,
      meanArterialPressureMmhg: 68,
      mottlingScore: 2
    });

    const m = service.microvascular();
    expect(m.isCrtNormal).toBe(false);
    expect(m.lactateClearancePercent).toBe(30);
    expect(m.isLactateClearanceAdequate).toBe(true);
    // Microvascular uncoupling: MAP >= 65 but CRT > 3.0s and Mottling >= 2
    expect(m.isMicrovascularUncoupled).toBe(true);
  });

  it('5. Escalates through Vasopressor Sparing Tiers to Refractory Shock Hydrocortisone', () => {
    // Tier 1: Low NE
    service.updateInputs({ norepinephrineDoseMcgKgMin: 0.1, vasopressinDoseUnitsMin: 0 });
    expect(service.vasopressorGuidance().currentTier).toBe('Tier 1: Norepinephrine Monotherapy');
    expect(service.vasopressorGuidance().isHydrocortisoneIndicated).toBe(false);

    // Tier 2: NE > 0.25 with Vasopressin sparing
    service.updateInputs({ norepinephrineDoseMcgKgMin: 0.28, vasopressinDoseUnitsMin: 0.03 });
    expect(service.vasopressorGuidance().currentTier).toBe('Tier 4: Refractory Shock Hydrocortisone');
    expect(service.vasopressorGuidance().isHydrocortisoneIndicated).toBe(true);
    expect(service.vasopressorGuidance().recommendedInterventions.some(r => r.includes('Hydrocortisone 200 mg/day'))).toBe(true);
  });

  it('6. Diagnostic classification transitions: Non-Septic -> Sepsis -> Septic Shock', () => {
    // 1. Non-septic
    expect(service.diagnosis().category).toBe('Non-Septic Infection / Homeostasis');

    // 2. Sepsis: infection + delta SOFA >= 2
    service.updateInputs({
      hasSuspectedOrConfirmedInfection: true,
      plateletsKUl: 85, // Coag = 2 (SOFA = 2, delta = 2)
      serumLactateCurrentMmolL: 1.6
    });
    expect(service.diagnosis().category).toBe('Sepsis (Organ Dysfunction Present)');
    expect(service.diagnosis().severityTier).toBe('Moderate Sepsis Risk');

    // 3. Septic Shock: Sepsis + Vasopressor + Lactate > 2.0
    service.updateInputs({
      norepinephrineDoseMcgKgMin: 0.2,
      serumLactateCurrentMmolL: 3.2
    });
    expect(service.diagnosis().category).toBe('Septic Shock (Refractory Vasoplegia & Cellular Dysoxia)');
    expect(service.diagnosis().severityTier).toBe('High-Risk Septic Shock');
    expect(service.diagnosis().mortalityEstimatePercent).toBe(40);
  });

  it('7. Resets to default parameters correctly', () => {
    service.updateInputs({
      systolicBpMmhg: 80,
      norepinephrineDoseMcgKgMin: 0.4
    });
    service.resetToDefault();
    expect(service.inputs()).toEqual(DEFAULT_SEPSIS_INPUTS);
    expect(service.sofa().totalSofa).toBe(0);
  });
});
