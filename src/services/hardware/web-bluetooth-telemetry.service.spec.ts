import { TestBed } from '@angular/core/testing';
import { WebBluetoothTelemetryService } from './web-bluetooth-telemetry.service';
import { PatientStateService } from '../patient-state.service';
import { BiometricSensorFusionService } from './biometric-sensor-fusion.service';

describe('WebBluetoothTelemetryService', () => {
  let service: WebBluetoothTelemetryService;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      updateVital: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        WebBluetoothTelemetryService,
        { provide: PatientStateService, useValue: mockPatientState },
        BiometricSensorFusionService
      ]
    });
    service = TestBed.inject(WebBluetoothTelemetryService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should initialize disconnected', () => {
    expect(service.isConnected()).toBe(false);
    expect(service.deviceName()).toBe('Disconnected');
    expect(service.liveHeartRate()).toBeNull();
  });

  it('should accurately parse 8-bit Heart Rate GATT packets with RR-intervals', () => {
    // Flag: 0x10 (has RR-interval), HR: 75 bpm, RR: 820ms (approx 840 raw value: 840/1024*1000 = 820ms)
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint8(0, 0x10); // 8-bit HR + RR present
    view.setUint8(1, 75);   // HR = 75 bpm
    view.setUint16(2, 840, true); // Raw RR

    service.handleHeartRateData(view);

    expect(service.liveHeartRate()).toBe(75);
    expect(service.recentRrIntervals().length).toBe(1);
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('hr', '75');
  });

  it('should compute HRV RMSSD across multiple RR intervals', () => {
    // Send first packet with RR = 800ms
    const b1 = new ArrayBuffer(4);
    const v1 = new DataView(b1);
    v1.setUint8(0, 0x10);
    v1.setUint8(1, 70);
    v1.setUint16(2, 819, true); // ~800ms
    service.handleHeartRateData(v1);

    // Send second packet with RR = 850ms
    const b2 = new ArrayBuffer(4);
    const v2 = new DataView(b2);
    v2.setUint8(0, 0x10);
    v2.setUint8(1, 72);
    v2.setUint16(2, 870, true); // ~850ms
    service.handleHeartRateData(v2);

    expect(service.liveHrvRmssd()).toBeGreaterThan(0);
  });

  it('should start and stop simulated BLE telemetry', () => {
    service.startSimulatedTelemetry(80, 55, 99);
    expect(service.isConnected()).toBe(true);
    expect(service.isSimulated()).toBe(true);
    expect(service.deviceName()).toContain('Polar');
    expect(service.liveHeartRate()).toBe(80);

    const snapshot = service.getTelemetrySnapshot();
    expect(snapshot.connected).toBe(true);
    expect(snapshot.heartRateBpm).toBe(80);

    service.disconnect();
    expect(service.isConnected()).toBe(false);
  });
});
