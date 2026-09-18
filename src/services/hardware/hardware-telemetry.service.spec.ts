import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { HardwareTelemetryService } from './hardware-telemetry.service';

describe('HardwareTelemetryService', () => {
  let service: HardwareTelemetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HardwareTelemetryService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(HardwareTelemetryService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should initialize with telemetry signal', () => {
    expect(service.telemetry).toBeDefined();
    expect(typeof service.hasGpu).toBe('function');
  });

  it('should provide fallback telemetry data when endpoint is unavailable', async () => {
    await service.refreshTelemetry();
    const data = service.telemetry();
    expect(data).not.toBeNull();
    expect(data?.gpus.length).toBeGreaterThan(0);
    expect(data?.cpuName).toBeDefined();
    expect(data?.systemMemoryTotalGb).toBeGreaterThan(0);
  });

  it('should calculate recommended execution path based on hardware', async () => {
    await service.refreshTelemetry();
    const path = service.recommendedExecutionPath();
    expect(['cloud', 'local-nvidia', 'local-lemonade', 'local-webgpu', 'on-device-nano']).toContain(path);
  });
});
