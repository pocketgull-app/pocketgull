import '@angular/compiler';
import { expect } from 'vitest';
import { evaluateClinicalPrContent } from './evaluator';

describe('@pocketgull/github-app Evaluator Unit Suite', () => {
  it('1. Correctly levels Level 1 RCT clinical evidence from SPRINT trial diff', () => {
    const diff = `
      + export const SPRINT_TRIAL_HYPERTENSION = {
      +   trial: 'SPRINT RCT (Randomized Controlled Trial)',
      +   auroc: 0.942,
      +   demographics: 'GroupKFold partition across 9,361 patients',
      +   pValue: 0.003
      + };
    `;

    const result = evaluateClinicalPrContent(diff);
    expect(result.hasClinicalClaims).toBe(true);
    expect(result.oxfordCebmLevel).toBe('Level 1');
    expect(result.cochraneRob2Status).toBe('Low Risk');
    expect(result.nullHypothesisPassed).toBe(true);
    expect(result.oncHti2Compliant).toBe(true);
    expect(result.reviewCommentMarkdown).toContain('Oxford CEBM Evidence');
  });

  it('2. Flags null hypothesis failure when p >= 0.05', () => {
    const diff = `
      + // Clinical pilot evaluation
      + const finding = { effect: 'moderate', p: 0.082 };
    `;

    const result = evaluateClinicalPrContent(diff);
    expect(result.nullHypothesisPassed).toBe(false);
    expect(result.reviewCommentMarkdown).toContain('Null Hypothesis Not Rejected');
  });

  it('3. Handles non-clinical PR diffs gracefully', () => {
    const diff = `
      + // Pure stylesheet update
      + .header-btn { color: #fff; }
    `;

    const result = evaluateClinicalPrContent(diff);
    expect(result.hasClinicalClaims).toBe(false);
    expect(result.oxfordCebmLevel).toBe('Unclassified');
  });
});
