import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MonkSkinToneEquityService } from './monk-skin-tone-equity.service';

describe('MonkSkinToneEquityService (Optical Bias Calibration & Occult Hypoxemia Defense)', () => {
  let service: MonkSkinToneEquityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MonkSkinToneEquityService]
    });
    service = TestBed.inject(MonkSkinToneEquityService);
  });

  it('1. Initializes with the canonical 10-point Monk Skin Tone (MST 01–MST 10) spectrum', () => {
    expect(service).toBeTruthy();
    expect(service.monkSkinTones.length).toBe(10);

    const shades = service.monkSkinTones.map(t => t.shade);
    expect(shades).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    // Check light and dark extremes
    const mst01 = service.monkSkinTones[0];
    expect(mst01.code).toBe('MST 01');
    expect(mst01.hex).toBe('#f6ede4');
    expect(mst01.fitzpatrickScale).toBe('I');

    const mst10 = service.monkSkinTones[9];
    expect(mst10.code).toBe('MST 10');
    expect(mst10.hex).toBe('#292420');
    expect(mst10.fitzpatrickScale).toBe('VI');
    expect(mst10.melaninIndex).toBeGreaterThan(90);
  });

  it('2. Evaluates minimal optical bias in fair skin tones (MST 01–MST 03)', () => {
    service.setMstShade(2);
    service.observedSpO2.set(98);
    const assessment = service.occultHypoxemiaAssessment();

    expect(assessment.mstCode).toBe('MST 02');
    expect(assessment.estimatedBiasOffsetPct).toBeLessThanOrEqual(0.5);
    expect(assessment.riskTier).toBe('NORMAL_LOW');
    expect(assessment.abgCoTestRecommended).toBe(false);
  });

  it('3. Flags occult hypoxemia and elevated bias in darker skin tones (MST 07–MST 10) in the critical 88-93% zone', () => {
    // Patient with MST 08 showing displayed SpO2 = 91% (typical occult hypoxemia presentation)
    service.setMstShade(8);
    service.observedSpO2.set(91);
    const assessment = service.occultHypoxemiaAssessment();

    expect(assessment.mstCode).toBe('MST 08');
    expect(assessment.estimatedBiasOffsetPct).toBeGreaterThanOrEqual(3.0);
    // True SaO2 estimated to be ~87-88%
    expect(assessment.calibratedSaO2EstimatePct).toBeLessThan(88.0);
    expect(assessment.abgCoTestRecommended).toBe(true);
    expect(['HIGH_ALERT', 'CRITICAL_STAT']).toContain(assessment.riskTier);
    expect(assessment.clinicalGuidance).toContain('Arterial Blood Gas');
  });

  it('4. Amplifies bias variance and alerts when Perfusion Index (PI) is severely diminished (<0.5%)', () => {
    const normalPi = service.calculateOccultHypoxemiaRisk(6, 92, 1.5);
    const lowPi = service.calculateOccultHypoxemiaRisk(6, 92, 0.3);

    expect(lowPi.perfusionIndexAlert).toBe(true);
    expect(lowPi.estimatedBiasOffsetPct).toBeGreaterThan(normalPi.estimatedBiasOffsetPct);
    expect(lowPi.abgCoTestRecommended).toBe(true);
  });

  it('5. Computes adaptive rPPG weights shifting from green to red/NIR across skin tones', () => {
    // Light skin: green dominant
    const lightWeights = service.computeAdaptiveRppgWeights(1);
    expect(lightWeights.wGreen).toBeGreaterThan(lightWeights.wRed);
    expect(lightWeights.snrBoostDb).toBe(0.0);

    // Melanin-rich skin: red enhanced to avoid green photon extinction
    const darkWeights = service.computeAdaptiveRppgWeights(9);
    expect(darkWeights.wRed).toBeGreaterThan(lightWeights.wRed);
    expect(darkWeights.snrBoostDb).toBeGreaterThan(5.0);
    expect(darkWeights.frequencyGainMultiplier).toBeGreaterThan(2.0);
  });

  it('6. Matches RGB dermal reflectance to nearest Monk Skin Tone shade', () => {
    // Very light skin RGB
    const lightEst = service.estimateSkinToneFromRgb(245, 235, 225);
    expect([1, 2]).toContain(lightEst.shade);

    // Deep melanin skin RGB
    const darkEst = service.estimateSkinToneFromRgb(45, 38, 32);
    expect([9, 10]).toContain(darkEst.shade);
  });
});
