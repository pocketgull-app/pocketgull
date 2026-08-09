import { describe, it, expect } from 'vitest';
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
});
