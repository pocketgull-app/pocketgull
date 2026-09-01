import { describe, it, expect } from 'vitest';
import { SocraticDemystifier } from '../src/socratic-demystifier';

describe('SocraticDemystifier Suite', () => {
  it('demystifies complex lab values into 5th-grade analogies', () => {
    const text = 'Patient has elevated HbA1c of 8.2% and an eGFR of 52 mL/min with suspected radiculopathy.';
    const demystified = SocraticDemystifier.demystify(text);

    expect(demystified.length).toBe(3);
    const egfr = demystified.find(d => d.term.includes('eGFR'));
    expect(egfr).toBeDefined();
    expect(egfr?.teaspoonAnalogy).toContain('coffee filter');

    const hba1c = demystified.find(d => d.term.includes('HbA1c'));
    expect(hba1c).toBeDefined();
    expect(hba1c?.teaspoonAnalogy).toContain('sugar glaze');
  });

  it('generates a comforting plain-language summary for the patient', () => {
    const text = 'Evaluating mild hypertension and knee osteoarthritis.';
    const summary = SocraticDemystifier.generateTeaspoonSummary(text);

    expect(summary).toContain('During today\'s visit');
    expect(summary.length).toBeGreaterThan(50);
  });
});
