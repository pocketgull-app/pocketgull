import { SkepticalEpistemologyService } from './skeptical-epistemology.service';

describe('SkepticalEpistemologyService', () => {
  const service = new SkepticalEpistemologyService();

  it('1. Evaluates Popperian falsifiability and null-hypothesis (H0) p-values', () => {
    const evalResult = service.evaluateFalsifiability('Vagal Heart Rate Deceleration', 62, 72, 25);

    expect(evalResult.metricName).toBe('Vagal Heart Rate Deceleration');
    expect(evalResult.pValue).toBeLessThan(0.05);
    expect(evalResult.isFalsified).toBe(true);
    expect(evalResult.epistemicConfidencePercent).toBeGreaterThan(90);
    expect(evalResult.skepticalWarningNotice).toBeNull();
  });

  it('2. Flags high p-value observations with explicit Skeptical Guardrail notices', () => {
    const evalResult = service.evaluateFalsifiability('Quantum Coherence Frequency', 72.1, 72.0, 5);

    expect(evalResult.pValue).toBeGreaterThan(0.05);
    expect(evalResult.isFalsified).toBe(false);
    expect(evalResult.skepticalWarningNotice).toContain('Null hypothesis H0 cannot be rejected');
  });

  it('3. Generates Cochrane Risk of Bias (RoB 2) academic assessments', () => {
    const biasReport = service.evaluateCochraneRiskOfBias('cit_vagal_rsa_2023');

    expect(biasReport.citationId).toBe('cit_vagal_rsa_2023');
    expect(biasReport.overallRiskOfBias).toBe('Some Concerns');
    expect(biasReport.skepticalSummary).toContain('moderate risk of bias');
  });

  it('4. Generates FDA 21 CFR Section 520(o) non-device CDS compliance reports', () => {
    const complianceReport = service.evaluateCdsCompliance('Functional Medicine Matrix', 2);

    expect(complianceReport.isFdaSection520oCompliant).toBe(true);
    expect(complianceReport.disclaimer).toContain('Non-Device Clinical Decision Support (CDS)');
    expect(complianceReport.regulatoryMetadata.cfrReference).toContain('21 CFR Part 860');
    expect(complianceReport.regulatoryMetadata.clinicianMandate).toContain('Licensed Healthcare Professional');
    expect(['Level A (RCTs)', 'Level B (Cohort)']).toContain(complianceReport.evidenceLevel);
  });

  it('5. Generates relevant Socratic challenge questions matching lens keywords', () => {
    const questions = service.generateSocraticChallenges('Treatment Matrix', 'Check statistical significance with p-value and correlation', 3);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].question).toBeDefined();
    expect(questions[0].options.length).toBe(4);
    expect(questions[0].explanation).toBeDefined();
    expect(questions[0].epistemicTag).toBeDefined();
  });

  it('6. Generates fallback Socratic challenges when no keyword matches', () => {
    const questions = service.generateSocraticChallenges(
      'Unusual Lens Target',
      'Xyz unknown topic with no matching keywords that meets minimum length threshold for processing.',
      2
    );

    expect(questions.length).toBe(2);
    expect(questions[0].id).toContain('socratic-unusual-lens-target');
  });

  it('7. Pools calibrated Log-Likelihood Ratios across four-field evidence tuples and eliminates count-scale drift', () => {
    const tuples = [
      {
        hypothesis: 'Targeted SGLT2i Cardioprotection in HFrEF',
        reliabilityBucket: 'A_definitive_rct' as const,
        rationale: 'DAPA-HF multi-center randomized controlled trial demonstrated 26% reduction in cardiovascular death.',
        provenance: { sourceId: 'NEJM-DAPA-HF-2019', doi: '10.1056/NEJMoa1911303' },
        direction: 'supports' as const
      },
      {
        hypothesis: 'Targeted SGLT2i Cardioprotection in HFrEF',
        reliabilityBucket: 'B_validated_cohort' as const,
        rationale: 'Empagliflozin registry cohort verified sustained eGFR slope preservation across 12,000 ambulatory patients.',
        provenance: { sourceId: 'EMPA-REG-OUTCOME', doi: '10.1056/NEJMoa1504720' },
        direction: 'supports' as const
      }
    ];

    const result = service.poolCalibratedLogLikelihoodRatios(tuples, 0.15, 0.80);

    expect(result.hypothesis).toBe('Targeted SGLT2i Cardioprotection in HFrEF');
    expect(result.sourceCount).toBe(2);
    expect(result.totalLlr).toBeGreaterThan(4.0); // 2.708 + 1.609 = 4.317
    expect(result.posteriorProbability).toBeGreaterThan(0.85);
    expect(result.decisionThresholdMet).toBe(true);
    expect(result.countScaleDriftMitigated).toBe(true);
  });

  it('8. Correctly down-weights refuting or high-risk-of-bias evidence tuples', () => {
    const refutingTuples = [
      {
        hypothesis: 'Unverified Herbal Extract Reverses Atherosclerosis',
        reliabilityBucket: 'E_high_risk_bias' as const,
        rationale: 'Uncontrolled self-reported social media series with high risk of bias.',
        provenance: { sourceId: 'BLOG-SERIES-2024' },
        direction: 'supports' as const
      },
      {
        hypothesis: 'Unverified Herbal Extract Reverses Atherosclerosis',
        reliabilityBucket: 'A_definitive_rct' as const,
        rationale: 'Double-blind sham-controlled trial showed no significant reduction in CIMT arterial wall thickness.',
        provenance: { sourceId: 'LANCET-NEGATIVE-RCT-2025' },
        direction: 'refutes' as const
      }
    ];

    const result = service.poolCalibratedLogLikelihoodRatios(refutingTuples, 0.20, 0.75);

    expect(result.totalLlr).toBeLessThan(0); // -0.799 (bucket E) + (-2.708) (refuting A) = -3.507
    expect(result.posteriorProbability).toBeLessThan(0.02);
    expect(result.decisionThresholdMet).toBe(false);
  });

  it('9. Calculates theoretical Count-Scale Drift to prove uncalibrated voting failure modes', () => {
    const driftSmall = service.calculateCountScaleDrift(2, 1.8);
    const driftLarge = service.calculateCountScaleDrift(25, 1.8);

    expect(driftSmall.uncalibratedOperatingShift).toBeLessThan(1.0);
    expect(driftLarge.uncalibratedOperatingShift).toBeGreaterThan(2.5);
    expect(driftLarge.riskOfFalsePositiveInflation).toBe(true);
    expect(driftLarge.calibratedStabilityIndex).toBe(1.0);
  });

  it('10. Exposes the five empirical falsification predictions and negative results', () => {
    const predictions = service.getEpistemicFalsificationPredictions();
    const negativeResults = service.getNegativeResults();
    const confoundedComparisons = service.getConfoundedComparisons();

    expect(predictions.length).toBe(5);
    expect(predictions[0].id).toBe('FALSIFY-01');
    expect(predictions[0].verdictIfObserved).toBe('Falsified');

    expect(negativeResults.length).toBe(3);
    expect(negativeResults[0].approach).toContain('Softmax Attention Pooling');

    expect(confoundedComparisons.length).toBe(3);
    expect(confoundedComparisons[0].confounder).toBeDefined();
  });

  it('11. Returns unadjusted baseline and deferral notice when empty evidence tuple list is passed', () => {
    const result = service.poolCalibratedLogLikelihoodRatios([], 0.10, 0.80);

    expect(result.sourceCount).toBe(0);
    expect(result.totalLlr).toBe(0);
    expect(result.posteriorProbability).toBe(0.10);
    expect(result.decisionThresholdMet).toBe(false);
    expect(result.falsificationNotice).toContain('No evidence tuples provided');
  });
});
