import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ElectroacupunctureService, PROTOCOL_CATALOG } from './electroacupuncture.service';

describe('ElectroacupunctureService', () => {
  let service: ElectroacupunctureService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [ElectroacupunctureService]
    });
    service = runInInjectionContext(injector, () => injector.get(ElectroacupunctureService));
  });

  it('should initialize with default vagal anti-inflammatory protocol', () => {
    expect(service).toBeTruthy();
    expect(service.activeProtocol().id).toBe('vagal_cytokine_reset');
    expect(service.frequencyHz()).toBe(10);
    expect(service.intensityMa()).toBe(1.5);
    expect(service.isRunning()).toBe(false);
  });

  it('should select Dense-Disperse sciatica protocol and update parameters', () => {
    const sciaticaProto = PROTOCOL_CATALOG[1];
    service.selectProtocol(sciaticaProto);

    expect(service.activeProtocol().id).toBe('sciatica_dynorphin_decompression');
    expect(service.waveform()).toBe('dense_disperse');
    expect(service.intensityMa()).toBe(2.5);
  });

  it('should toggle session and increment elapsed time on tick', () => {
    service.toggleSession();
    expect(service.isRunning()).toBe(true);

    service.tickSecond();
    service.tickSecond();
    expect(service.sessionElapsedTimeSeconds()).toBe(2);

    service.resetSession();
    expect(service.isRunning()).toBe(false);
    expect(service.sessionElapsedTimeSeconds()).toBe(0);
  });

  it('should compute frequency-specific opioid and cytokine suppression telemetry', () => {
    service.waveform.set('high_100hz');
    service.toggleSession();
    service.sessionElapsedTimeSeconds.set(60); // 1 minute into session

    const telemetry = service.neuroChemicalTelemetry();
    expect(telemetry.dynorphinScore).toBeGreaterThan(telemetry.betaEndorphinScore);
    expect(telemetry.cytokineSuppressionPercentage).toBeGreaterThan(0);
    expect(telemetry.vagalToneMultiplier).toBeGreaterThan(1.0);
  });
});
