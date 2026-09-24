import { describe, it, expect, beforeEach } from 'vitest';
import { WaveformDspEngineService } from './waveform-dsp-engine.service';

describe('WaveformDspEngineService', () => {
  let service: WaveformDspEngineService;

  beforeEach(() => {
    service = new WaveformDspEngineService();
  });

  it('should generate calibrated synthetic PPG waveform', () => {
    const raw = service.generateSyntheticPpgWaveform(5, 75);
    expect(raw.length).toBe(500); // 5 sec * 100 Hz
    expect(raw[0]).toBeDefined();
  });

  it('should apply bandpass filtering without NaN', () => {
    const raw = service.generateSyntheticPpgWaveform(3, 72);
    const filtered = service.applyBandpassFilter(raw);
    expect(filtered.length).toBe(raw.length);
    expect(Number.isNaN(filtered[10])).toBe(false);
  });

  it('should detect pulses and calculate morphology metrics (HR, notch, AIx, PWV)', () => {
    const raw = service.generateSyntheticPpgWaveform(10, 72, 0.5);
    const summary = service.analyzeWaveform(raw, 100);

    expect(summary.detectedPulseCount).toBeGreaterThanOrEqual(10);
    expect(summary.meanHeartRateBpm).toBeGreaterThanOrEqual(65);
    expect(summary.meanHeartRateBpm).toBeLessThanOrEqual(80);
    expect(summary.augmentationIndexPct).toBeGreaterThan(15);
    expect(summary.estimatedPwvMPerS).toBeGreaterThan(5.0);
    expect(summary.signalQualityIndex).toBeGreaterThan(0.7);
    expect(['OPTIMAL', 'MODERATE_STIFFNESS', 'ELEVATED_VASCULAR_RESISTANCE']).toContain(summary.arterialComplianceTier);
  });

  it('should objectively classify traditional Ayurvedic Dosha and TCM pulse patterns from morphology', () => {
    const raw = service.generateSyntheticPpgWaveform(10, 72, 0.4);
    const summary = service.analyzeWaveform(raw, 100);
    const classification = service.classifyTraditionalPulseWaveform(summary, 45);

    expect(classification.ayurvedicDoshaPulse).toBeDefined();
    expect(['Vata (Sarpa / Rapid-Light)', 'Pitta (Manduka / Bounding-Surging)', 'Kapha (Hamsa / Deep-Slow)']).toContain(classification.ayurvedicDoshaPulse.primaryDosha);
    expect(classification.ayurvedicDoshaPulse.doshaConfidence).toBeGreaterThan(0.5);

    expect(classification.tcmPulseMorphology).toBeDefined();
    expect(classification.tcmPulseMorphology.patternConfidence).toBeGreaterThan(0.5);
    expect(classification.tcmPulseMorphology.clinicalInterpretation.length).toBeGreaterThan(10);
    expect(classification.consilienceIndex).toBeGreaterThanOrEqual(0.7);
  });

  it('should classify high-stiffness high-HR signal as Vata / Wiry pulse', () => {
    const rawStiff = service.generateSyntheticPpgWaveform(10, 88, 0.85);
    const summary = service.analyzeWaveform(rawStiff, 100);
    const classification = service.classifyTraditionalPulseWaveform(summary, 18);

    expect(classification.ayurvedicDoshaPulse.primaryDosha).toBe('Vata (Sarpa / Rapid-Light)');
    expect(['Wiry (Xian Mai)', 'Surging (Hong Mai)']).toContain(classification.tcmPulseMorphology.pattern);
  });
});
