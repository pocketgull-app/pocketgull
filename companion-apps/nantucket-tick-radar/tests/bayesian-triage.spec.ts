import { describe, it, expect } from 'vitest';
import { evaluateBayesianTriage, EMPIRICAL_NANTUCKET_PRIORS } from '../src/engine/bayesian-triage.js';

describe('Empirical Bayesian Triage Engine (Nantucket Surveillance Grounded)', () => {
  it('1. Verifies empirical priors match UMass Amherst TickReport & MA DPH standards', () => {
    expect(EMPIRICAL_NANTUCKET_PRIORS.lyme_borrelia.nymphPrevalenceAck).toBe(0.52);
    expect(EMPIRICAL_NANTUCKET_PRIORS.babesiosis.nymphPrevalenceAck).toBe(0.18);
    expect(EMPIRICAL_NANTUCKET_PRIORS.anaplasmosis.nymphPrevalenceAck).toBe(0.11);
  });

  it('2. Retains Null Hypothesis H0 (p >= 0.05) for short attachment (<24h) without symptoms', () => {
    const results = evaluateBayesianTriage('ixodes_nymph', { attachmentHours: 8 });
    const lyme = results.find(r => r.pathogenId === 'lyme_borrelia')!;

    expect(lyme.nullHypothesisRejected).toBe(false);
    expect(lyme.pValueH0).toBeGreaterThanOrEqual(0.05);
    expect(lyme.riskTier).toBe('NULL_HYPOTHESIS_BASELINE');
    expect(lyme.prophylaxisEligible).toBe(false);
  });

  it('3. Rejects Null Hypothesis H0 (p < 0.05) and flags prophylaxis for >=36h attachment', () => {
    const results = evaluateBayesianTriage('ixodes_nymph', {
      attachmentHours: 48,
      hasErythemaMigrans: true
    });
    const lyme = results.find(r => r.pathogenId === 'lyme_borrelia')!;

    expect(lyme.nullHypothesisRejected).toBe(true);
    expect(lyme.pValueH0).toBeLessThan(0.05);
    expect(lyme.riskTier).toBe('CRITICAL_CLINICAL');
    expect(lyme.prophylaxisEligible).toBe(true);
    expect(lyme.prophylaxisRationale).toContain('Meets IDSA 2020 Criteria');
  });

  it('4. Correctly computes Babesia microti posterior and hemolytic risk', () => {
    const results = evaluateBayesianTriage('ixodes_adult', {
      attachmentHours: 48,
      hasDrenchingSweats: true,
      hasDarkUrineJaundice: true
    });
    const babesia = results.find(r => r.pathogenId === 'babesiosis')!;

    expect(babesia.nullHypothesisRejected).toBe(true);
    expect(babesia.posteriorPercent).toBeGreaterThanOrEqual(80);
    expect(babesia.clinicalRecommendation).toContain('Atovaquone');
  });

  it('5. Adjusts calculations with Desiccation Index modifier', () => {
    const humid = evaluateBayesianTriage('ixodes_nymph', { attachmentHours: 36 }, 1.0, 90);
    const arid = evaluateBayesianTriage('ixodes_nymph', { attachmentHours: 36 }, 1.0, 10);

    const lymeHumid = humid.find(r => r.pathogenId === 'lyme_borrelia')!;
    const lymeArid = arid.find(r => r.pathogenId === 'lyme_borrelia')!;

    expect(lymeHumid.posteriorProbability).toBeGreaterThan(lymeArid.posteriorProbability);
  });
});
