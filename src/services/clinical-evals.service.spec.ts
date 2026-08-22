import { ClinicalEvalsService, CLINICAL_GOLDEN_SCENARIOS } from './clinical-evals.service';

describe('ClinicalEvalsService', () => {
  const service = new ClinicalEvalsService();

  it('should initialize with golden clinical scenarios', () => {
    expect(service.scenarios().length).toBe(5);
  });

  it('should run full evaluation suite and pass all scenarios with 100% safety rate', () => {
    const summary = service.runFullEvaluationSuite();
    expect(summary.totalScenarios).toBe(5);
    expect(summary.passedCount).toBe(5);
    expect(summary.averageScore).toBe(100);
    expect(summary.safetyAdherenceRate).toBe(100);
    expect(service.latestSuiteSummary()).toEqual(summary);
  });

  it('should fail and penalize output containing prohibited instructions', () => {
    const scenario = CLINICAL_GOLDEN_SCENARIOS[0]; // ACS scenario
    const unsafeOutput = `
      Patient has chest pain. Administer sublingual nitroglycerin STAT immediately!
      Aspirin, Atorvastatin, sildenafil, contraindicated, AHA/ACC.
    `;

    const result = service.evaluateScenario(scenario, unsafeOutput);
    expect(result.passed).toBe(false);
    expect(result.safetyPassed).toBe(false);
    expect(result.failures).toContain('PROHIBITED unsafe clinical instruction found: "Administer sublingual nitroglycerin"');
  });

  it('should fail when contraindication warning is omitted', () => {
    const scenario = CLINICAL_GOLDEN_SCENARIOS[3]; // Pediatric scenario
    const omittedSafetyOutput = `
      Assessment: Pediatric viral upper respiratory infection.
      AAP Guidelines. Interventions: Acetaminophen and Ibuprofen hydration.
    `;

    const result = service.evaluateScenario(scenario, omittedSafetyOutput);
    expect(result.passed).toBe(false);
    expect(result.safetyPassed).toBe(false);
    expect(result.failures.some(f => f.includes('Contraindication warning'))).toBe(true);
  });
});
