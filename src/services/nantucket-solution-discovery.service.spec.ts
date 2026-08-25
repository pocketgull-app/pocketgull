import '@angular/compiler';
import {
  NantucketSolutionDiscoveryService,
  NOVEL_TICK_SOLUTIONS,
  SOCRATIC_TICK_CHALLENGES
} from './nantucket-solution-discovery.service';

describe('NantucketSolutionDiscoveryService', () => {
  it('should initialize with 5 novel solution candidates and default parameters', () => {
    const service = new NantucketSolutionDiscoveryService();

    expect(service.solutions().length).toBe(5);
    expect(service.selectedSolutionId()).toBe('metarhizium_bio_barrier');
    expect(service.activeSolution().name).toContain('Metarhizium');
    expect(service.activeSolution().cohenEffectSizeD).toBeGreaterThan(0.8);
    expect(service.activeSolution().causalEValue).toBeGreaterThan(2.0);
  });

  it('should simulate Popperian falsification and reject H0 when sample size and power are adequate', () => {
    const service = new NantucketSolutionDiscoveryService();
    const candidate = NOVEL_TICK_SOLUTIONS.find(s => s.id === 'botanical_cedrene_synergy')!;

    // With N=64 and d=1.40
    const result = service.simulateFalsification(candidate, 64, 1.0, 0.20);

    expect(result.isH0Falsified).toBe(true);
    expect(result.computedPValue).toBeLessThan(0.05);
    expect(result.statisticalPowerPercent).toBeGreaterThanOrEqual(80);
    expect(result.epistemicStatus).toBe('H0_FALSIFIED_STRONG');
    expect(result.epistemicCommentary).toContain('Popperian Falsification Achieved');
  });

  it('should retain H0 and trigger warning when sample size is insufficient or noise is extreme', () => {
    const service = new NantucketSolutionDiscoveryService();
    const candidate = NOVEL_TICK_SOLUTIONS.find(s => s.id === 'semiochemical_pheromone_trap')!;

    // Very small sample size (N=4) with high ecological noise (sigma=0.70)
    const result = service.simulateFalsification(candidate, 4, 0.3, 0.70);

    expect(result.isH0Falsified).toBe(false);
    expect(result.computedPValue).toBeGreaterThanOrEqual(0.05);
    expect(result.epistemicStatus).toBe('H0_RETAINED_INSUFFICIENT');
    expect(result.epistemicCommentary).toContain('Null Hypothesis Retained');
  });

  it('should compute valid causal E-Value sensitivities for unmeasured ecological confounding', () => {
    const service = new NantucketSolutionDiscoveryService();
    const candidate = NOVEL_TICK_SOLUTIONS.find(s => s.id === 'reservoir_oral_bait_vax')!;

    const result = service.simulateFalsification(candidate, 48, 1.0, 0.25);

    expect(result.causalEValueAssessment.pointEstimateEValue).toBe(4.85);
    expect(result.causalEValueAssessment.lowerBoundEValue).toBeGreaterThan(1.0);
    expect(result.causalEValueAssessment.confounderRobustnessSummary).toContain('4.85');
  });

  it('should generate a comprehensive Markdown study protocol dossier', () => {
    const service = new NantucketSolutionDiscoveryService();
    const candidate = service.activeSolution();
    const md = service.generateStudyProtocolMarkdown(candidate);

    expect(md).toContain('# Field Trial Protocol & Epistemic Dossier');
    expect(md).toContain(candidate.name);
    expect(md).toContain('Popperian Null Hypothesis & Statistical Framing');
    expect(md).toContain('Causal Inference & Confounder Sensitivity (E-Value)');
    expect(md).toContain('Cochrane Risk of Bias (RoB 2) Mitigation');
  });

  it('should provide active Socratic epistemic challenges with explanations', () => {
    const service = new NantucketSolutionDiscoveryService();
    const challenge = service.activeSocraticChallenge();

    expect(challenge).toBeDefined();
    expect(challenge.options.length).toBe(4);
    expect(challenge.correctIndex).toBeGreaterThanOrEqual(0);
    expect(challenge.explanation.length).toBeGreaterThan(20);
  });
});
