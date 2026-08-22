import '@angular/compiler';
import { OcularVocalTelemetryService } from './ocular-vocal-telemetry.service';

describe('OcularVocalTelemetryService', () => {
  let service: OcularVocalTelemetryService;

  beforeEach(() => {
    service = new OcularVocalTelemetryService();
  });

  it('1. Initializes with normal baseline ocular and vocal telemetry', () => {
    expect(service.ocular().isPupilSymmetric).toBe(true);
    expect(service.vocal().isVocalTremorDetected).toBe(false);
    expect(service.rppg().heartRateBpm).toBe(72);
    expect(service.overallNeuroVascularScore()).toBeGreaterThan(80);
  });

  it('2. Detects anisocoria and triggers neuro alert for asymmetrical pupils', () => {
    service.updateOcularMetrics(2.5, 4.5, 18);
    expect(service.ocular().isPupilSymmetric).toBe(false);
    expect(service.ocular().anisocoriaAsymmetryPct).toBeGreaterThan(10);
    expect(service.ocular().neuroAlertNotice).toContain('Asymmetric Pupillary Diameter');
  });

  it('3. Detects acoustic micro-tremor when jitter exceeds normal physiological threshold', () => {
    service.updateVocalAcoustics(110.0, 1.45, 4.2);
    expect(service.vocal().isVocalTremorDetected).toBe(true);
    expect(service.vocal().acousticNote).toContain('Elevated micro-tremor jitter');
    expect(service.vocal().vocalStressIndex).toBeGreaterThan(50);
  });

  it('4. Updates rPPG capillary pulse and perfusion quality score', () => {
    service.updateRPpgPulse(78, 55);
    expect(service.rppg().heartRateBpm).toBe(78);
    expect(service.rppg().hrvRmssdMs).toBe(55);
    expect(service.rppg().perfusionQualityIndex).toBeGreaterThanOrEqual(85);
  });

  it('5. Toggles HUD and viewfinder states cleanly', () => {
    const initialHud = service.isHudActive();
    service.toggleHud();
    expect(service.isHudActive()).toBe(!initialHud);

    const initialViewfinder = service.isViewfinderOpen();
    service.toggleViewfinder();
    expect(service.isViewfinderOpen()).toBe(!initialViewfinder);
  });
});
