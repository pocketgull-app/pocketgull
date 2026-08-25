import '@angular/compiler';
import { expect } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { BioSymphonyEngineService } from './bio-symphony-engine.service';
import { PatientStateService } from './patient-state.service';

describe('BioSymphonyEngineService Generative Music Suite', () => {
  let service: BioSymphonyEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        BioSymphonyEngineService,
        {
          provide: PatientStateService,
          useValue: {
            vitals: () => ({ heartRate: 72, respiratoryRate: 14 })
          }
        }
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(BioSymphonyEngineService));
  });

  it('should initialize with 432Hz Persian Dastgah scales and resting vitals', () => {
    expect(service.isPlaying()).toBe(false);
    expect(service.heartRateBpm()).toBe(72);
    expect(service.respiratoryRateBpm()).toBe(14);
    expect(service.selectedDastgah()).toBe('Shur');
    expect(service.dastgahScales.Shur.frequencies).toContain(432.0);
  });

  it('should compute parasympathetic tone when stress is low', () => {
    service.setStressScore(15);
    expect(service.autonomicState().label).toContain('Parasympathetic Coherence');
  });

  it('should compute sympathetic tone when stress is high', () => {
    service.setStressScore(85);
    expect(service.autonomicState().label).toContain('Sympathetic Hyperarousal');
  });

  it('should switch Persian Dastgah modes and validate frequencies', () => {
    service.setDastgah('Homayoun');
    expect(service.selectedDastgah()).toBe('Homayoun');
    expect(service.dastgahScales.Homayoun.frequencies.length).toBeGreaterThan(8);

    service.setDastgah('Chahargah');
    expect(service.selectedDastgah()).toBe('Chahargah');
  });

  it('should update heart rate and clamp within safe bounds', () => {
    service.setHeartRate(65);
    expect(service.heartRateBpm()).toBe(65);

    service.setHeartRate(250);
    expect(service.heartRateBpm()).toBe(180); // Clamped at 180
  });

  it('should configure binaural entrainment wave modes', () => {
    service.setBinauralMode('Alpha (10Hz Focus)');
    expect(service.binauralMode()).toBe('Alpha (10Hz Focus)');

    service.setBinauralMode('Gamma (40Hz Insight)');
    expect(service.binauralMode()).toBe('Gamma (40Hz Insight)');
  });
});
