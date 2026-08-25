import { CounterfactualSimulationService } from './counterfactual-simulation.service';

describe('CounterfactualSimulationService', () => {
  let service: CounterfactualSimulationService;

  beforeEach(() => {
    service = new CounterfactualSimulationService();
  });

  it('should initialize with 0 deltas', () => {
    expect(service.deltaHbA1c()).toBe(0);
    expect(service.deltaSteps()).toBe(0);
    expect(service.deltaSleep()).toBe(0);
    expect(service.deltaHrv()).toBe(0);
    expect(service.deltaSystolic()).toBe(0);
    expect(service.hasActiveSimulation()).toBe(false);
  });

  it('should compute simulated HbA1c correctly when delta is set', () => {
    const base = service.baselineHbA1c();
    service.deltaHbA1c.set(-0.5);
    expect(service.simulatedHbA1c()).toBe(+(base - 0.5).toFixed(1));
    expect(service.hasActiveSimulation()).toBe(true);
  });

  it('should compute SIBI score improvements when vitals and labs improve', () => {
    const initialSibi = service.simulatedSibiScore();
    service.deltaHbA1c.set(-1.0);
    service.deltaHrv.set(20);
    service.deltaSystolic.set(-15);
    expect(service.simulatedSibiScore()).toBeLessThan(initialSibi);
    expect(service.sibiDelta()).toBeLessThan(0);
  });

  it('should reset deltas cleanly', () => {
    service.deltaHbA1c.set(-0.8);
    service.deltaSteps.set(2000);
    expect(service.hasActiveSimulation()).toBe(true);

    service.resetDeltas();
    expect(service.deltaHbA1c()).toBe(0);
    expect(service.deltaSteps()).toBe(0);
    expect(service.hasActiveSimulation()).toBe(false);
  });

  it('should provide Socratic What-If scenarios and apply them cleanly', () => {
    expect(service.socraticScenarios.length).toBeGreaterThanOrEqual(4);
    const vagalScenario = service.socraticScenarios.find(s => s.id === 'scenario_vagal_breath');
    expect(vagalScenario).toBeDefined();

    service.applyScenario(vagalScenario!);
    expect(service.deltaHrv()).toBe(18);
    expect(service.deltaSystolic()).toBe(-8);
    expect(service.hasActiveSimulation()).toBe(true);
  });

  it('should provide Goal Inversion pathways and apply them', () => {
    expect(service.goalInversionPathways.length).toBe(3);
    const metabolicPathway = service.goalInversionPathways.find(p => p.id === 'pathway_metabolic');
    expect(metabolicPathway).toBeDefined();

    service.applyPathway(metabolicPathway!);
    expect(service.deltaHbA1c()).toBe(-1.2);
    expect(service.deltaSteps()).toBe(2000);
  });

  it('should compute multi-paradigm checks across Western, Eastern TCM, and Ayurvedic frameworks', () => {
    const checks = service.multiParadigmChecks();
    expect(checks.length).toBe(3);
    const paradigms = checks.map(c => c.paradigm);
    expect(paradigms).toContain('Western Clinical');
    expect(paradigms).toContain('Eastern TCM');
    expect(paradigms).toContain('Ayurvedic Vedic');

    // Trigger warning on intensive SBP lowering
    service.deltaSystolic.set(-25);
    const updatedChecks = service.multiParadigmChecks();
    const westernCheck = updatedChecks.find(c => c.paradigm === 'Western Clinical');
    expect(westernCheck?.status).toBe('WARNING');
  });

  it('should contain OARS Motivational Interviewing readiness prompts for all 4 biomarkers', () => {
    const oars = service.oarsPrompts;
    expect(oars['hba1c']).toBeDefined();
    expect(oars['steps']).toBeDefined();
    expect(oars['hrv']).toBeDefined();
    expect(oars['systolic']).toBeDefined();
    expect(oars['hba1c'].readinessRulerQuestion).toContain('scale of 1 to 10');
  });

  it('should compute dynamic sensitivity insights based on simulated perturbations', () => {
    service.deltaHrv.set(16);
    expect(service.sensitivityInsight()).toContain('Physiological Equivalence Insight');
  });
});
