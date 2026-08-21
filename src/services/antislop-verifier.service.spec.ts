import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { AntiSlopVerifierService } from './antislop-verifier.service';

describe('AntiSlopVerifierService Unit Suite', () => {
  let service: AntiSlopVerifierService;

  beforeEach(() => {
    service = new AntiSlopVerifierService();
  });

  it('1. Flags generic AI slop phrases and assigns UNVERIFIED_SLOP_WARNING tier', () => {
    const slopText = `As an AI language model, I can delve into the rich tapestry of your symptoms. 
    It is important to remember that this game changer will unlock the secrets of health.`;

    const result = service.evaluateText(slopText);
    expect(result.isAntiSlopCertified).toBe(false);
    expect(result.slopPhrasesDetected.length).toBeGreaterThanOrEqual(4);
    expect(result.epistemicGroundingTier).toBe('UNVERIFIED_SLOP_WARNING');
    expect(result.rigorScorePercent).toBeLessThan(50);
  });

  it('2. Certifies rigorous, quantitatively grounded clinical text with LEVEL_A seal', () => {
    const rigorousText = `SANS Frisén Grade II optic disc edema noted with peripapillary RNFL thickness of 365 µm. 
    Blood pressure 128/82 mmHg, heart rate 72 bpm. Protocol LOINC 89063-2 confirms cephalad venous shift. 
    Administer Acetazolamide 250 mg PO BID and initiate LBNP @ -25 mmHg for 60 min. DOI: 10.5281/zenodo.20647514.`;

    const result = service.evaluateText(rigorousText);
    expect(result.isAntiSlopCertified).toBe(true);
    expect(result.slopPhrasesDetected.length).toBe(0);
    expect(result.quantitativeMetricsCount).toBeGreaterThanOrEqual(5);
    expect(result.epistemicGroundingTier).toBe('LEVEL_A_DETERMINISTIC');
    expect(result.antislopSealHash).toContain('ANTISLOP-');
  });

  it('3. Handles empty input gracefully without throwing exceptions', () => {
    const result = service.evaluateText('');
    expect(result.isAntiSlopCertified).toBe(false);
    expect(result.epistemicGroundingTier).toBe('UNVERIFIED_SLOP_WARNING');
  });
});
