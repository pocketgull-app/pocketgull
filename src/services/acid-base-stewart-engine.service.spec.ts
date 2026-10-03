import { describe, it, expect, beforeEach } from 'vitest';
import { AcidBaseStewartEngineService, IAcidBaseLabInput } from './acid-base-stewart-engine.service';

describe('AcidBaseStewartEngineService (Clinical Model P7)', () => {
  let service: AcidBaseStewartEngineService;

  beforeEach(() => {
    service = new AcidBaseStewartEngineService();
  });

  const normalBaseline: IAcidBaseLabInput = {
    ph: 7.40,
    pco2Mmhg: 40,
    sodiumMeqL: 140,
    potassiumMeqL: 4.0,
    chlorideMeqL: 102,
    bicarbonateMeqL: 24,
    albuminGdl: 4.0,
    phosphateMgDl: 3.5,
    lactateMeqL: 1.0,
    calciumMeqL: 2.5,
    magnesiumMeqL: 1.5
  };

  it('1. should evaluate normal physiological baseline with SIG close to 0 mEq/L', () => {
    const evalResult = service.evaluateAcidBaseState(normalBaseline);

    expect(evalResult.clinicalTriageSeverity).toBe('NORMAL');
    expect(evalResult.traditional.primaryDisorder).toBe('Normal Acid-Base Profile');
    expect(evalResult.traditional.anionGap).toBe(14); // 140 - (102 + 24) = 14
    expect(evalResult.traditional.correctedAnionGap).toBe(14);
    expect(evalResult.stewart.sidaMeqL).toBeGreaterThan(40);
    expect(Math.abs(evalResult.stewart.sigMeqL)).toBeLessThanOrEqual(4.0);
    expect(evalResult.hyperkalemiaProtocol).toBeNull();
  });

  it('2. should correctly identify Pure High Anion Gap Metabolic Acidosis (DKA)', () => {
    const dkaInput: IAcidBaseLabInput = {
      ph: 7.20,
      pco2Mmhg: 26, // Expected: 1.5 * 12 + 8 = 26 (perfect Winter's compensation)
      sodiumMeqL: 136,
      potassiumMeqL: 5.2,
      chlorideMeqL: 98,
      bicarbonateMeqL: 12,
      albuminGdl: 4.0,
      phosphateMgDl: 3.5,
      lactateMeqL: 1.5
    };

    const evalResult = service.evaluateAcidBaseState(dkaInput);

    expect(evalResult.traditional.primaryDisorder).toBe('Primary Metabolic Acidosis');
    expect(evalResult.traditional.correctedAnionGap).toBe(26); // 136 - (98 + 12) = 26
    expect(evalResult.traditional.deltaAnionGap).toBe(14); // 26 - 12 = 14
    expect(evalResult.traditional.deltaBicarbonate).toBe(12); // 24 - 12 = 12
    expect(evalResult.traditional.deltaDeltaRatio).toBe(1.17); // 14 / 12 = 1.17 (Pure HAGMA)
    expect(evalResult.traditional.respiratoryCompensationState).toBe('Appropriate Compensation');
    expect(evalResult.stewart.unmeasuredAnionsPresent).toBe(true);
    expect(evalResult.stewart.sigMeqL).toBeGreaterThan(5.0);
  });

  it('3. should detect Mixed HAGMA + NAGMA with Delta-Delta ratio < 0.8', () => {
    const mixedInput: IAcidBaseLabInput = {
      ph: 7.15,
      pco2Mmhg: 22,
      sodiumMeqL: 140,
      potassiumMeqL: 4.5,
      chlorideMeqL: 116, // Severe hyperchloremia
      bicarbonateMeqL: 8,
      albuminGdl: 4.0,
      phosphateMgDl: 3.0,
      lactateMeqL: 2.0
    };

    const evalResult = service.evaluateAcidBaseState(mixedInput);

    // AG = 140 - (116 + 8) = 16. Delta AG = 16 - 12 = 4. Delta HCO3 = 24 - 8 = 16.
    // Delta-Delta = 4 / 16 = 0.25 (< 0.8 -> mixed HAGMA + NAGMA)
    expect(evalResult.traditional.deltaDeltaRatio).toBe(0.25);
    expect(evalResult.traditional.deltaDeltaInterpretation).toContain('Mixed High Anion Gap Metabolic Acidosis (HAGMA) AND Normal Anion Gap');
    expect(evalResult.stewart.sidaMeqL).toBeLessThanOrEqual(31); // Reduced SIDa from hyperchloremia
  });

  it('4. should detect Mixed HAGMA + Metabolic Alkalosis with Delta-Delta ratio > 2.0', () => {
    const dkaVomitingInput: IAcidBaseLabInput = {
      ph: 7.38, // Pseudo-normalized pH due to opposing metabolic alkalosis
      pco2Mmhg: 40,
      sodiumMeqL: 140,
      potassiumMeqL: 3.2,
      chlorideMeqL: 86, // Hypochloremia from vomiting
      bicarbonateMeqL: 22,
      albuminGdl: 4.0,
      phosphateMgDl: 3.0,
      lactateMeqL: 1.0
    };

    const evalResult = service.evaluateAcidBaseState(dkaVomitingInput);

    // AG = 140 - (86 + 22) = 32. Delta AG = 32 - 12 = 20. Delta HCO3 = 24 - 22 = 2.
    // Delta-Delta = 20 / 2 = 10.0 (> 2.0 -> mixed HAGMA + Metabolic Alkalosis)
    expect(evalResult.traditional.deltaDeltaRatio).toBe(10.0);
    expect(evalResult.traditional.deltaDeltaInterpretation).toContain('Metabolic Alkalosis');
  });

  it('5. should adjust Anion Gap for Hypoalbuminemia accurately', () => {
    const hypoalbuminInput: IAcidBaseLabInput = {
      ...normalBaseline,
      chlorideMeqL: 108,
      bicarbonateMeqL: 20,
      albuminGdl: 2.0 // Severe hypoalbuminemia (normal is 4.0)
    };

    const evalResult = service.evaluateAcidBaseState(hypoalbuminInput);

    // Raw AG = 140 - (108 + 20) = 12
    // Corrected AG = 12 + 2.5 * (4.0 - 2.0) = 12 + 5 = 17
    expect(evalResult.traditional.anionGap).toBe(12);
    expect(evalResult.traditional.correctedAnionGap).toBe(17);
    expect(evalResult.stewart.albuminChargeMeqL).toBeLessThan(6.0); // reduced negative charge
  });

  it('6. should detect failure of Winter\'s formula compensation (Concurrent Respiratory Acidosis)', () => {
    const severeAcidosisHypoventilation: IAcidBaseLabInput = {
      ph: 7.10,
      pco2Mmhg: 42, // Expected: 1.5 * 10 + 8 = 23 mmHg. Actual is 42 -> severe alveolar hypoventilation!
      sodiumMeqL: 138,
      potassiumMeqL: 4.8,
      chlorideMeqL: 104,
      bicarbonateMeqL: 10,
      albuminGdl: 4.0,
      phosphateMgDl: 3.5,
      lactateMeqL: 1.2
    };

    const evalResult = service.evaluateAcidBaseState(severeAcidosisHypoventilation);

    expect(evalResult.traditional.expectedPco2Mmhg).toBe(23);
    expect(evalResult.traditional.respiratoryCompensationState).toBe('Concurrent Respiratory Acidosis');
    expect(evalResult.clinicalTriageSeverity).toBe('STAT_EMERGENCY');
  });

  it('7. should recommend Balanced Crystalloid (Plasma-Lyte) over 0.9% Normal Saline for hyperchloremic acidosis', () => {
    const hyperchloremicInput: IAcidBaseLabInput = {
      ...normalBaseline,
      ph: 7.28,
      chlorideMeqL: 114,
      bicarbonateMeqL: 18
    };

    const evalResult = service.evaluateAcidBaseState(hyperchloremicInput);
    const fluids = evalResult.fluidRecommendations;

    const plasmaLyte = fluids.find(f => f.fluidName.includes('Plasma-Lyte'));
    const normalSaline = fluids.find(f => f.fluidName.includes('0.9% Normal Saline'));

    expect(plasmaLyte?.isRecommended).toBe(true);
    expect(plasmaLyte?.hyperchloremiaRisk).toBe('Low');
    expect(normalSaline?.isRecommended).toBe(false);
    expect(normalSaline?.hyperchloremiaRisk).toContain('High');
  });

  it('8. should activate Hyperkalemia Emergency Stabilization Protocol when K+ >= 5.5 mEq/L', () => {
    const hyperkalemiaInput: IAcidBaseLabInput = {
      ...normalBaseline,
      potassiumMeqL: 6.8 // Severe hyperkalemia
    };

    const evalResult = service.evaluateAcidBaseState(hyperkalemiaInput);
    const protocol = evalResult.hyperkalemiaProtocol;

    expect(protocol).not.toBeNull();
    expect(protocol!.length).toBeGreaterThanOrEqual(4);

    // Verify 3 distinct phases
    const phase1 = protocol!.find(p => p.phase === 'Phase 1: Membrane Antagonism');
    const phase2Insulin = protocol!.find(p => p.intervention.includes('Regular Insulin'));
    const phase3 = protocol!.find(p => p.phase === 'Phase 3: Total Body K+ Elimination');

    expect(phase1?.intervention).toContain('Calcium Gluconate');
    expect(phase2Insulin?.dose).toContain('Regular Insulin 10 units IV');
    expect(phase3?.intervention).toContain('Lokelma');

    // ISMP safety verification: confirm no trailing zeros like '5.0' or naked decimals like '.5'
    for (const card of protocol!) {
      expect(card.dose).not.toMatch(/(^|[^\d])\.\d+/); // no naked decimals
      expect(card.dose).not.toMatch(/\d+\.0\s*(mg|g|mL|units)/); // no trailing zeros in doses
      expect(card.ismpCautionNote).toContain('ISMP');
    }
  });
});
