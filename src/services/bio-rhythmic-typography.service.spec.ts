import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { BioRhythmicTypographyService } from './bio-rhythmic-typography.service';
import { ClinicalVagalResonantPacingService } from './clinical-vagal-resonant-pacing.service';

describe('BioRhythmicTypographyService', () => {
  let service: BioRhythmicTypographyService;
  let vagalPacing: ClinicalVagalResonantPacingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BioRhythmicTypographyService, ClinicalVagalResonantPacingService]
    });
    service = TestBed.inject(BioRhythmicTypographyService);
    vagalPacing = TestBed.inject(ClinicalVagalResonantPacingService);
  });

  it('should initialize with baseline typographic weight of 400', () => {
    expect(service.currentWeight()).toBeGreaterThanOrEqual(400);
    expect(service.currentWeight()).toBeLessThanOrEqual(440);
  });

  it('should dynamically increase kinetic weight when lung expansion increases', () => {
    // Set baseline expansion (scale 1.0)
    vagalPacing.liveState.set({
      phase: 'inhale',
      phaseProgress: 0.0,
      overallCycleProgress: 0.0,
      expansionScale: 1.0,
      phaseLabel: 'Gently Inhale',
      secondsRemainingInPhase: 4.0
    });

    const baselineWeight = service.currentWeight();
    expect(baselineWeight).toBe(400);

    // Simulate full inhalation peak (scale 1.25)
    vagalPacing.liveState.set({
      phase: 'pause_top',
      phaseProgress: 1.0,
      overallCycleProgress: 0.45,
      expansionScale: 1.25,
      phaseLabel: 'Hold Gently',
      secondsRemainingInPhase: 0.5
    });

    const peakWeight = service.currentWeight();
    expect(peakWeight).toBe(430);
    expect(peakWeight).toBeGreaterThan(baselineWeight);
  });

  it('should modulate optical size within safe clinical bounds', () => {
    vagalPacing.liveState.set({
      phase: 'pause_top',
      phaseProgress: 1.0,
      overallCycleProgress: 0.45,
      expansionScale: 1.25,
      phaseLabel: 'Hold Gently',
      secondsRemainingInPhase: 0.5
    });

    expect(service.currentOpticalSize()).toBe(15.0);
    expect(service.currentBreatheScale()).toBe(1.02);
  });

  it('should revert to static baseline when reduced motion is preferred', () => {
    service.isReducedMotion.set(true);

    vagalPacing.liveState.set({
      phase: 'pause_top',
      phaseProgress: 1.0,
      overallCycleProgress: 0.45,
      expansionScale: 1.25,
      phaseLabel: 'Hold Gently',
      secondsRemainingInPhase: 0.5
    });

    expect(service.currentWeight()).toBe(400);
    expect(service.currentOpticalSize()).toBe(14);
    expect(service.currentBreatheScale()).toBe(1.0);
  });

  it('should toggle kinetic engine smoothly', () => {
    service.setKineticEnabled(false);
    expect(service.currentWeight()).toBe(400);

    service.setKineticEnabled(true);
    expect(service.config().enabled).toBe(true);
  });

  it('should export telemetry with RSA efficiency and phase status', () => {
    const telemetry = service.kineticTelemetry();
    expect(telemetry).toHaveProperty('activeWeight');
    expect(telemetry).toHaveProperty('activeOpticalSize');
    expect(telemetry).toHaveProperty('breatheScale');
    expect(telemetry).toHaveProperty('pacingPhase');
    expect(telemetry).toHaveProperty('vagalCoherenceIndex');
  });
});
