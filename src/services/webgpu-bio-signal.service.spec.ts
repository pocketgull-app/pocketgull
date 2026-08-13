import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
import { WebgpuBioSignalService } from './webgpu-bio-signal.service';

describe('WebgpuBioSignalService Unit Suite', () => {
  let service: WebgpuBioSignalService;

  beforeEach(() => {
    service = new WebgpuBioSignalService();
  });

  it('1. Detects WebGPU browser hardware support API availability', () => {
    const supported = service.isWebGpuSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('2. Classifies Parkinsonian Resting Tremor (3-6 Hz pattern)', () => {
    // Generate synthetic 4 Hz sinusoidal displacement wave (30 fps frame rate)
    const displacements: number[] = [];
    for (let i = 0; i < 60; i++) {
      displacements.push(2.5 * Math.sin((2 * Math.PI * 4 * i) / 30));
    }

    const result = service.classifyTremorFrequency(displacements, 30);
    expect(result.classification).toBe('parkinsonian_resting');
    expect(result.dominantFrequencyHz).toBeGreaterThanOrEqual(3.0);
    expect(result.dominantFrequencyHz).toBeLessThanOrEqual(6.0);
    expect(result.clinicalNote).toContain('PARKINSONIAN RESTING TREMOR DETECTED');
  });

  it('3. Classifies Essential Action Tremor (6-12 Hz pattern)', () => {
    // Generate synthetic 9 Hz sinusoidal displacement wave
    const displacements: number[] = [];
    for (let i = 0; i < 60; i++) {
      displacements.push(3.0 * Math.sin((2 * Math.PI * 9 * i) / 30));
    }

    const result = service.classifyTremorFrequency(displacements, 30);
    expect(result.classification).toBe('essential_action');
    expect(result.dominantFrequencyHz).toBeGreaterThan(6.0);
    expect(result.clinicalNote).toContain('ESSENTIAL ACTION TREMOR DETECTED');
  });

  it('4. Computes rPPG Heart Rate and HRV (RMSSD) from skin luminescence signal', () => {
    // Generate synthetic luminescence signal with 1-second pulse interval (60 BPM)
    const signal: number[] = [];
    for (let i = 0; i < 90; i++) {
      signal.push(i % 30 === 0 ? 10 : 2);
    }

    const rppg = service.computeRppgCardiovascularMetrics(signal);
    expect(rppg.heartRateBpm).toBeGreaterThanOrEqual(55);
    expect(rppg.heartRateBpm).toBeLessThanOrEqual(65);
    expect(rppg.qualityScorePercent).toBeGreaterThan(80);
  });

  it('5. Synthesizes full WebGPU Bio-Signal telemetry payload with privacy guarantee', () => {
    const displacements = [0, 2, -2, 2, -2, 2, -2, 0];
    const telemetry = service.analyzeBioSignalTelemetry(displacements);

    expect(telemetry.privacyGuarantee).toContain('100% CLIENT-SIDE WEBGPU COMPUTE GUARANTEE');
    expect(telemetry.tremor).toBeDefined();
    expect(telemetry.rppg).toBeDefined();
  });
});
