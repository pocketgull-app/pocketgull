import { AcidBaseStewartService } from './acid-base-stewart.service';

describe('AcidBaseStewartService (Clinical Model P7)', () => {
  let service: AcidBaseStewartService;

  beforeEach(() => {
    service = new AcidBaseStewartService();
  });

  it('1. Computes normal baseline Stewart parameters (SIDa, SIDe, SIG, Atot)', () => {
    // Normal: Na 140, K 4.0, Cl 102, Lactate 1.0, Alb 4.0, Phos 3.5, pH 7.40, HCO3 24
    const sida = service.calculateSida(140, 4.0, 102, 1.0, true, 4.0);
    expect(sida).toBe(45.0); // (140 + 4 + 4) - (102 + 1) = 45.0

    const side = service.calculateSide(7.40, 24, 4.0, 3.5);
    expect(side).toBeGreaterThan(36);
    expect(side).toBeLessThan(44);

    const sig = service.calculateSig(sida, side);
    expect(sig).toBeGreaterThanOrEqual(0.0);
    expect(sig).toBeLessThanOrEqual(10.0);

    const atot = service.calculateAtot(4.0, 3.5);
    expect(atot).toBe(13.3); // 2.8*4.0 + 0.6*3.5 = 11.2 + 2.1 = 13.3
  });

  it('2. Corrects anion gap for hypoalbuminemia (Figge equation: +2.5 per 1 g/dL albumin drop)', () => {
    // Patient with Na 140, Cl 104, HCO3 24 (Observed AG = 12, appears "normal")
    // But severe hypoalbuminemia with Albumin 2.0 g/dL!
    // Corrected AG = 12 + 2.5 * (4.0 - 2.0) = 17.0 (Hidden HAGMA revealed!)
    const ag = service.calculateCorrectedAnionGap(140, 104, 24, 2.0);
    expect(ag.observedAg).toBe(12.0);
    expect(ag.correctedAg).toBe(17.0);
  });

  it('3. Computes Delta-Delta ratio detecting mixed HAGMA and NAGMA (ratio 0.4 - 0.8)', () => {
    // Corrected AG = 18 (Delta AG = 6). HCO3 = 14 (Delta HCO3 = 10). Ratio = 6/10 = 0.60
    const delta = service.calculateDeltaRatio(18, 14);
    expect(delta.deltaRatio).toBe(0.60);
    expect(delta.interpretation).toBe('Mixed HAGMA and NAGMA (0.4 - 0.8)');
  });

  it('4. Computes Delta-Delta ratio detecting mixed HAGMA and Metabolic Alkalosis (ratio > 2.0)', () => {
    // Corrected AG = 26 (Delta AG = 14). HCO3 = 20 (Delta HCO3 = 4). Ratio = 14/4 = 3.50
    const delta = service.calculateDeltaRatio(26, 20);
    expect(delta.deltaRatio).toBe(3.50);
    expect(delta.interpretation).toBe('Mixed HAGMA and Metabolic Alkalosis (> 2.0)');
  });

  it('5. Evaluates Winter\'s formula respiratory compensation in metabolic acidosis', () => {
    // HCO3 = 12. Expected pCO2 = 1.5 * 12 + 8 = 26 +/- 2 (24 to 28 mmHg)
    // Case A: Measured pCO2 = 25 -> Adequate Compensation
    const adequate = service.evaluateWintersFormula(12, 25);
    expect(adequate.expectedPco2Min).toBe(24);
    expect(adequate.expectedPco2Max).toBe(28);
    expect(adequate.respiratoryStatus).toBe('Adequate Compensation');

    // Case B: Measured pCO2 = 34 -> Concomitant Respiratory Acidosis (Failure to hyperventilate)
    const respAcid = service.evaluateWintersFormula(12, 34);
    expect(respAcid.respiratoryStatus).toBe('Concomitant Respiratory Acidosis (Hypoventilation)');

    // Case C: Measured pCO2 = 20 -> Concomitant Respiratory Alkalosis (Overbreathing / Pain)
    const respAlk = service.evaluateWintersFormula(12, 20);
    expect(respAlk.respiratoryStatus).toBe('Concomitant Respiratory Alkalosis (Hyperventilation)');
  });

  it('6. Recommends Balanced Crystalloids when chloride is elevated or SIDa is low', () => {
    // Hyperchloremia (Cl 112, SIDa 32)
    const fluid = service.evaluateFluidSelection(112, 7.28, 16, 32);
    expect(fluid.preferredFluid).toContain('Balanced Crystalloid');
    expect(fluid.renalPerfusionImpact).toContain('Renoprotective');
    expect(fluid.clinicalRationale).toContain('Normal Saline');
  });

  it('7. Recommends 0.9% Normal Saline for hypochloremic metabolic alkalosis', () => {
    // Vomiting: Cl 90, pH 7.52, HCO3 34, SIDa 46
    const fluid = service.evaluateFluidSelection(90, 7.52, 34, 46);
    expect(fluid.preferredFluid).toContain('0.9% Normal Saline');
    expect(fluid.clinicalRationale).toContain('Hypochloremic metabolic alkalosis');
  });

  it('8. Activates 3-phase hyperkalemia emergency protocol for potassium >= 6.5 mEq/L', () => {
    const plan = service.evaluateHyperkalemia(6.8);
    expect(plan.severity).toBe('Severe / Emergent (>= 6.5)');
    expect(plan.membraneStabilizationRequired).toBe(true);
    expect(plan.intracellularShiftRequired).toBe(true);
    expect(plan.potassiumEliminationRequired).toBe(true);
    expect(plan.orders.some(o => o.includes('Calcium Gluconate'))).toBe(true);
    expect(plan.orders.some(o => o.includes('Regular Insulin'))).toBe(true);
    expect(plan.orders.some(o => o.includes('Lokelma'))).toBe(true);
  });

  it('9. Simulates Diabetic Ketoacidosis (DKA) scenario accurately', () => {
    service.simulateScenario('dka_hagma');
    expect(service.ph()).toBe(7.15);
    expect(service.primaryDisorder()).toBe('High Anion Gap Metabolic Acidosis (HAGMA)');
    expect(service.observedAnionGap()).toBeGreaterThan(20);
    expect(service.wintersCompensation()).not.toBeNull();
    expect(service.wintersCompensation()?.respiratoryStatus).toBe('Adequate Compensation');
  });

  it('10. Simulates Iatrogenic Saline-Induced Hyperchloremic Acidosis (NAGMA)', () => {
    service.simulateScenario('saline_hyperchloremic_nagma');
    expect(service.chloride()).toBe(118);
    expect(service.primaryDisorder()).toBe('Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloremic)');
    expect(service.stewartParameters().hyperchloremicAcidosisRisk).toBe(true);
    expect(service.fluidGuideline().preferredFluid).toContain('Balanced Crystalloid');
  });

  it('11. Simulates Triple Mixed Acid-Base Disorder with occult HAGMA in hypoalbuminemia', () => {
    service.simulateScenario('triple_mixed_disorder');
    // Normal-appearing pH (7.38), but massive hidden HAGMA with corrected AG >= 25
    expect(service.correctedAnionGap()).toBeGreaterThanOrEqual(25);
    expect(service.primaryDisorder()).toBe('High Anion Gap Metabolic Acidosis (HAGMA)');
    expect(service.deltaRatioResult().interpretation).toBe('Mixed HAGMA and Metabolic Alkalosis (> 2.0)');
  });

  it('12. Simulates Severe Hyperkalemia Emergency scenario', () => {
    service.simulateScenario('severe_hyperkalemia_emergency');
    expect(service.potassium()).toBe(6.8);
    expect(service.hyperkalemiaPlan().severity).toBe('Severe / Emergent (>= 6.5)');
    expect(service.hyperkalemiaPlan().membraneStabilizationRequired).toBe(true);
  });

  it('13. Generates complete comprehensive assessment snapshot with all indices', () => {
    service.simulateScenario('normal_homeostasis');
    const assessment = service.fullAssessment();
    expect(assessment.timestamp).toBeDefined();
    expect(assessment.ph).toBe(7.40);
    expect(assessment.primaryDisorder).toBe('Normal Acid-Base Homeostasis');
    expect(assessment.stewart.sida).toBeDefined();
  });
});
