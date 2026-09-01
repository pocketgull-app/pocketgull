import { describe, it, expect } from 'vitest';
import { IsmpSafetyGuard } from '../src/ismp-safety-guard';

describe('IsmpSafetyGuard Suite', () => {
  it('detects and corrects trailing zeroes (e.g., "5.0 mg" -> "5 mg")', () => {
    const text = 'Administer Lisinopril 5.0 mg daily with 10.00 mL water.';
    const result = IsmpSafetyGuard.audit(text);

    expect(result.isSafe).toBe(false);
    expect(result.violations.length).toBe(2);
    expect(result.violations[0].ruleCode).toBe('TRAILING_ZERO');
    expect(result.sanitizedText).toBe('Administer Lisinopril 5 mg daily with 10 mL water.');
  });

  it('detects and corrects naked decimals (e.g., ".5 mg" -> "0.5 mg")', () => {
    const text = 'Take .5 mg of Clonazepam before sleep or .25 mL drops.';
    const result = IsmpSafetyGuard.audit(text);

    expect(result.isSafe).toBe(false);
    expect(result.violations.some(v => v.ruleCode === 'NAKED_DECIMAL')).toBe(true);
    expect(result.sanitizedText).toContain('0.5 mg');
    expect(result.sanitizedText).toContain('0.25 mL');
  });

  it('replaces dangerous abbreviations (e.g. "10 U" -> "10 units")', () => {
    const text = 'Inject 10 U insulin Q.D. with MS for pain.';
    const sanitized = IsmpSafetyGuard.sanitize(text);

    expect(sanitized).toContain('units');
    expect(sanitized).toContain('daily');
    expect(sanitized).toContain('morphine sulfate');
  });
});
