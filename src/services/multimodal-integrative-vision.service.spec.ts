import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MultimodalIntegrativeVisionService } from './multimodal-integrative-vision.service';

describe('MultimodalIntegrativeVisionService Unit Suite', () => {
  let service: MultimodalIntegrativeVisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MultimodalIntegrativeVisionService]
    });
    service = TestBed.inject(MultimodalIntegrativeVisionService);
  });

  it('1. Initializes default multimodal biophysical scan with valid values', () => {
    const scan = service.currentScan();
    expect(scan).toBeTruthy();
    expect(scan.tongueVision.lumaL).toBeGreaterThan(0);
    expect(scan.hrvTelemetry.rmssdMs).toBeGreaterThan(0);
  });

  it('2. Evaluates raw RGB tongue samples and computes CIELAB and Zang-Fu disharmonies', () => {
    const scan = service.evaluateMultimodalTelemetry(
      { r: 210, g: 80, b: 90 }, // Reddish tongue body
      0.75, // Thick coating
      'MODERATE_STASIS',
      [800, 820, 810, 830, 790, 805] // RR intervals (Mean ~810ms => ~74 BPM)
    );

    expect(scan.tongueVision.chromaA).toBeGreaterThanOrEqual(25);
    expect(scan.tongueVision.derivedZangFuDisharmonies.length).toBeGreaterThan(0);
    const patterns = scan.tongueVision.derivedZangFuDisharmonies.map(d => d.pattern);
    expect(patterns).toContain('Liver Qi Stagnation with Transformative Heat');
    expect(patterns).toContain('Spleen Qi Deficiency with Dampness');
  });

  it('3. Computes accurate mathematical HRV time-series parameters and Poincaré geometry', () => {
    const rrIntervals = [850, 820, 890, 840, 860, 830, 870, 850];
    const scan = service.evaluateMultimodalTelemetry(
      { r: 180, g: 120, b: 130 },
      0.3,
      'NORMAL',
      rrIntervals
    );

    const hrv = scan.hrvTelemetry;
    expect(hrv.heartRateBpm).toBeGreaterThan(60);
    expect(hrv.sdnnMs).toBeGreaterThan(0);
    expect(hrv.rmssdMs).toBeGreaterThan(0);
    expect(hrv.poincareSd1Ms).toBeGreaterThan(0);
    expect(hrv.poincareSd2Ms).toBeGreaterThan(0);
    expect(hrv.sd1Sd2Ratio).toBeGreaterThan(0);
    expect(hrv.osteopathicSomaticStrainReleaseProbability).toBeGreaterThan(0.7);
  });
});
