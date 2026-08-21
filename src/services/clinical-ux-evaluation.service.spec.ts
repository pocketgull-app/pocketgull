import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicalUxEvaluationService } from './clinical-ux-evaluation.service';

describe('ClinicalUxEvaluationService Unit Suite', () => {
  let service: ClinicalUxEvaluationService;

  beforeEach(() => {
    service = new ClinicalUxEvaluationService();
  });

  it('1. Initializes clinical evidence evaluations with GRADE and Oxford CEBM grounding', () => {
    const list = service.evidenceEvaluations();
    expect(list.length).toBeGreaterThanOrEqual(4);

    // Verify p-values reject the null hypothesis (p < 0.05)
    list.forEach((evalItem) => {
      expect(evalItem.pValueVsNullHypothesis).toBeLessThan(0.05);
      expect(evalItem.isFalsifiable).toBe(true);
      expect(evalItem.fdaAdverseEventAuditPassed).toBe(true);
      expect(evalItem.pmcidCitation).toMatch(/^PMC\d+/);
    });

    expect(service.clinicalFaithfulnessScore()).toBe(100);
  });

  it('2. Computes mobile ergonomics score adhering to Fitts Law Shannon Index and WCAG AAA', () => {
    const ergonomics = service.ergonomicsEvaluations();
    expect(ergonomics.length).toBeGreaterThanOrEqual(4);

    ergonomics.forEach((e) => {
      expect(e.touchTargetWidthPx).toBeGreaterThanOrEqual(44);
      expect(e.touchTargetHeightPx).toBeGreaterThanOrEqual(44);
      expect(e.shannonIndexDifficulty).toBeLessThan(1.5);
      expect(e.frameBudgetLatencyMs).toBeLessThan(16.6);
      expect(e.wcagContrastRatio).toBeGreaterThanOrEqual(7.0);
      expect(e.zeroLayoutShiftScore).toBe(0.0);
    });

    expect(service.mobileErgonomicsScore()).toBe(100);
  });

  it('3. Enforces Differential Privacy epsilon budget bounds', () => {
    const privacy = service.privacyEvaluation();
    expect(privacy.epsilonEpsilonBudget).toBeLessThanOrEqual(1.0);
    expect(privacy.deltaSensitivity).toBeLessThanOrEqual(1e-5);
    expect(privacy.zeroKnowledgeAttestationValid).toBe(true);
  });

  it('4. Evaluates a new clinical recommendation and dynamically updates faithfulness report', () => {
    const newEval = service.evaluateRecommendation(
      'REC-005',
      'Cognitive Restructuring & Neuroplasticity',
      '1b',
      0.0045,
      'PMC9812450'
    );

    expect(newEval.gradeCertainty).toBe('HIGH');
    expect(newEval.cochraneBias).toBe('LOW_RISK');
    expect(service.evidenceEvaluations().length).toBe(5);
    expect(service.clinicalFaithfulnessScore()).toBe(100);
  });

  it('5. Generates structured comprehensive evaluation report', () => {
    const report = service.generateEvaluationReport();
    expect(report.overallClinicalFaithfulnessScore).toBe(100);
    expect(report.overallMobileErgonomicsScore).toBe(100);
    expect(report.privacyEpsilonGuarantee).toBeLessThanOrEqual(1.0);
    expect(report.evidenceEvaluations.length).toBeGreaterThanOrEqual(4);
  });
});
