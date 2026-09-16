import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalVagalResonantPacingService, IAutonomicTelemetry } from './clinical-vagal-resonant-pacing.service';

describe('ClinicalVagalResonantPacingService Unit Suite', () => {
  let service: ClinicalVagalResonantPacingService;

  beforeEach(() => {
    const injector = Injector.create({ providers: [] });
    service = runInInjectionContext(injector, () => new ClinicalVagalResonantPacingService());
  });

  afterEach(() => {
    service.stopPacing();
  });

  it('1. Calibrates individual resonant frequency around 0.10 Hz baroreceptor resonance', () => {
    const vitals: IAutonomicTelemetry = {
      restingHeartRate: 68,
      systolicBp: 118,
      diastolicBp: 78,
      rmssd: 45
    };

    const profile = service.calculateResonantProfile(vitals);
    expect(profile.resonantFrequencyHz).toBeGreaterThanOrEqual(0.08);
    expect(profile.resonantFrequencyHz).toBeLessThanOrEqual(0.12);
    expect(profile.breathsPerMinute).toBeGreaterThanOrEqual(5.0);
    expect(profile.breathsPerMinute).toBeLessThanOrEqual(7.0);
    expect(profile.totalCycleSeconds).toBeGreaterThanOrEqual(8.5);
    expect(profile.totalCycleSeconds).toBeLessThanOrEqual(12.0);
  });

  it('2. Enforces parasympathetic exhale lengthening (exhale > inhale)', () => {
    const profile = service.pacingProfile();
    expect(profile.exhaleSeconds).toBeGreaterThan(profile.inhaleSeconds);
    expect(profile.pauseTopSeconds).toBeGreaterThan(0);
    expect(profile.pauseBottomSeconds).toBeGreaterThan(0);
  });

  it('3. Generates high parasympathetic vagal tone projection for healthy HRV', () => {
    const profile = service.calculateResonantProfile({
      restingHeartRate: 60,
      systolicBp: 115,
      diastolicBp: 75,
      rmssd: 58
    });
    expect(profile.vagalToneProjection).toBe('HIGH_PARASYMPATHETIC');
    expect(profile.rsaEfficiencyIndex).toBeGreaterThan(70);
  });

  it('4. Controls live animation pacing state gracefully', () => {
    expect(service.isPacingActive()).toBe(false);
    service.startPacing();
    expect(service.isPacingActive()).toBe(true);

    const state = service.liveState();
    expect(state.phase).toBeDefined();
    expect(state.expansionScale).toBeGreaterThanOrEqual(1.0);
    expect(state.expansionScale).toBeLessThanOrEqual(1.25);

    service.stopPacing();
    expect(service.isPacingActive()).toBe(false);
  });
});
