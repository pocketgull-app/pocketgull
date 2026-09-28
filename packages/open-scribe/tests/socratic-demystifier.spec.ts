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
    expect(egfr?.socraticInquiry).toBeDefined();
    expect(egfr?.falsifiabilityWarning).toContain('dehydration');

    const hba1c = demystified.find(d => d.term.includes('HbA1c'));
    expect(hba1c).toBeDefined();
    expect(hba1c?.teaspoonAnalogy).toContain('sugar glaze');
  });

  it('extracts interactive Socratic inquiry question cards', () => {
    const text = 'Reviewing creatinine and metformin titration for metabolic care.';
    const inquiryCards = SocraticDemystifier.generateSocraticInquiry(text);

    expect(inquiryCards.length).toBe(2);
    expect(inquiryCards[0].question).toBeDefined();
    expect(inquiryCards[0].rationale).toBeDefined();
    expect(inquiryCards[0].suggestedFocusArea).toBeDefined();
  });

  it('translates statistical probabilities into intuitive Bayesian natural frequencies', () => {
    const naturalFreq = SocraticDemystifier.toNaturalFrequency(92, 100);
    expect(naturalFreq).toBe('Out of 100 people sharing your exact profile, 92 maintain stable health when following these daily baseline steps.');
  });

  it('generates a comforting plain-language summary for the patient with falsifiability reassurance', () => {
    const text = 'Evaluating mild hypertension and knee osteoarthritis.';
    const summary = SocraticDemystifier.generateTeaspoonSummary(text);

    expect(summary).toContain('During today\'s visit');
    expect(summary).toContain('Remember:');
    expect(summary.length).toBeGreaterThan(50);
  });
});

