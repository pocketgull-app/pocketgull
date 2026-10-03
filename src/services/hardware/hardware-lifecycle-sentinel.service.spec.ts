import { TestBed } from '@angular/core/testing';
import { HardwareLifecycleSentinelService } from './hardware-lifecycle-sentinel.service';
import { TippssIngestionGuardService } from './tippss-ingestion-guard.service';

describe('HardwareLifecycleSentinelService (Circular IoMT & Anti-E-Waste)', () => {
  let service: HardwareLifecycleSentinelService;
  let guardService: TippssIngestionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TippssIngestionGuardService,
        HardwareLifecycleSentinelService
      ]
    });
    service = TestBed.inject(HardwareLifecycleSentinelService);
    guardService = TestBed.inject(TippssIngestionGuardService);
  });

  it('1. Initializes with default battery state and lifespan calculations', () => {
    expect(service.batteryTelemetry()).toBeDefined();
    expect(service.estimatedHardwareLifespanExtensionYears()).toBeGreaterThanOrEqual(1.5);
    expect(service.bedsideSentinelConfig().isEnabled).toBe(false);
  });

  it('2. Flags lithium pouch cell swelling risk when wall-tethered overcharge occurs', () => {
    service.simulateBatteryParameters({
      levelPercent: 100,
      isCharging: true
    });

    const telemetry = service.batteryTelemetry();
    expect(telemetry.swellingRiskDetected).toBe(true);
    expect(telemetry.recommendation).toContain('Wall-tethered 100% overcharge detected');
    expect(telemetry.recommendation).toContain('20%–80%');
  });

  it('3. Confirms optimal preservation state when cycled between 20% and 80%', () => {
    service.simulateBatteryParameters({
      levelPercent: 65,
      isCharging: false
    });

    const telemetry = service.batteryTelemetry();
    expect(telemetry.swellingRiskDetected).toBe(false);
    expect(telemetry.recommendation).toContain('Optimal battery preservation zone');
  });

  it('4. Activates Bedside Sentinel Kiosk mode and registers repurposed device in TIPPSS registry', () => {
    service.toggleBedsideSentinelMode(true);
    const config = service.bedsideSentinelConfig();
    expect(config.isEnabled).toBe(true);
    expect(config.dimDisplay).toBe(true);
    expect(config.highContrastNight).toBe(true);

    const devices = guardService.enrolledDevices();
    const kioskDevice = devices.find(d => d.deviceId.includes('BEDSIDE-KIOSK'));
    expect(kioskDevice).toBeDefined();
    expect(kioskDevice?.model).toContain('Bedside Sentinel Kiosk');
    expect(service.estimatedHardwareLifespanExtensionYears()).toBeGreaterThanOrEqual(4.5);
  });

  it('5. Registers decoupled sensor hot-swap without discarding host computer', () => {
    const initialYears = service.estimatedHardwareLifespanExtensionYears();
    service.registerDecoupledSensorSwap('Polar H10 Replacement Sensor', 'Degraded Optical Strap');

    expect(service.sensorHotSwapsCount()).toBe(1);
    expect(service.estimatedHardwareLifespanExtensionYears()).toBeGreaterThan(initialYears);

    const devices = guardService.enrolledDevices();
    const swapped = devices.find(d => d.deviceId.includes('REPLACED-SENSOR'));
    expect(swapped).toBeDefined();
    expect(swapped?.model).toBe('Polar H10 Replacement Sensor');
  });

  it('6. Updates partial bedside sentinel kiosk settings', () => {
    service.setBedsideConfig({ dimDisplay: true, audibleAlarmsOnlyOnEmergency: false });
    const config = service.bedsideSentinelConfig();
    expect(config.dimDisplay).toBe(true);
    expect(config.audibleAlarmsOnlyOnEmergency).toBe(false);
  });
});
