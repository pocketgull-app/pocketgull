import { describe, it, expect } from 'vitest';
import { ModelArmorService } from './model-armor.service';

describe('ModelArmorService', () => {
  it('should pass clean clinical note with no findings', () => {
    const text = 'Patient reports improved sleep quality following sleep hygiene adjustments.';
    const result = ModelArmorService.scan(text);

    expect(result.passed).toBe(true);
    expect(result.findings.length).toBe(0);
    expect(result.sanitizedText).toBe(text);
    expect(result.executionMode).toBe('IN_PROCESS_EDGE');
  });

  it('should redact SSN and mark critical severity', () => {
    const text = 'Patient identifier SSN 123-45-6789 presented at intake.';
    const result = ModelArmorService.scan(text);

    expect(result.passed).toBe(false);
    expect(result.findings.some(f => f.ruleId === 'US_SOCIAL_SECURITY_NUMBER')).toBe(true);
    expect(result.sanitizedText).toContain('[REDACTED_SSN]');
    expect(result.sanitizedText).not.toContain('123-45-6789');
  });

  it('should redact DEA physician numbers and credit card tokens', () => {
    const text = 'Provider DEA AB1234567 submitted card 4111-2222-3333-4444.';
    const result = ModelArmorService.scan(text);

    expect(result.sanitizedText).toContain('[REDACTED_DEA_NUMBER]');
    expect(result.sanitizedText).toContain('[REDACTED_PAYMENT_CARD]');
  });
});
