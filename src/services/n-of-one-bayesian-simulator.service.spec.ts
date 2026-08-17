import '@angular/compiler';
import { NOfOneBayesianSimulatorService } from './n-of-one-bayesian-simulator.service';

describe('NOfOneBayesianSimulatorService (Single-Subject Adaptive Crossover Trials)', () => {
  let service: NOfOneBayesianSimulatorService;

  beforeEach(() => {
    service = new NOfOneBayesianSimulatorService();
  });

  it('should initialize with idle simulation state', () => {
    expect(service.isSimulating()).toBe(false);
    expect(service.currentResult()).toBeNull();
  });

  it('should simulate full 16-week ABAB trial with 112 daily data points', () => {
    const res = service.runSimulation('N-Acetylglucosamine', 'NGLY1', 0.75, 0.08, 4.0);
    
    expect(res.totalDays).toBe(112);
    expect(res.simulatedData.length).toBe(112);
    expect(res.targetGene).toBe('NGLY1');
    expect(res.drugCandidate).toBe('N-Acetylglucosamine');

    // Verify 4 distinct phases
    const a1 = res.simulatedData.filter(d => d.phase === 'A1_Baseline');
    const b1 = res.simulatedData.filter(d => d.phase === 'B1_Intervention');
    const a2 = res.simulatedData.filter(d => d.phase === 'A2_Washout');
    const b2 = res.simulatedData.filter(d => d.phase === 'B2_Rechallenge');

    expect(a1.length).toBe(28);
    expect(b1.length).toBe(28);
    expect(a2.length).toBe(28);
    expect(b2.length).toBe(28);
  });

  it('should accumulate Bayesian weight of evidence in Decibans', () => {
    const res = service.runSimulation('Caffeine Citrate', 'ADCY5', 0.80, 0.05, 2.5);
    
    expect(res.summaryMetrics.finalDecibans).toBeGreaterThan(10.0);
    expect(res.summaryMetrics.finalProbabilityEfficacy).toBeGreaterThan(0.90);
    expect(res.summaryMetrics.clinicalVerdict).toContain('Highly Effective');
    expect(res.summaryMetrics.washoutReversionPercent).toBeGreaterThan(30);
  });

  it('should accept null hypothesis when effect size is 0', () => {
    const res = service.runSimulation('Placebo Vehicle', 'VUS_GENE', 0.0, 0.15, 3.0);
    
    expect(res.summaryMetrics.finalProbabilityEfficacy).toBeLessThan(0.90);
  });
});
