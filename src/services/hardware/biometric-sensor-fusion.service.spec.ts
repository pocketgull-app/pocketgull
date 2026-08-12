import { describe, it, expect } from 'vitest';
import { BiometricSensorFusionService } from './biometric-sensor-fusion.service';

describe('BiometricSensorFusionService', () => {
  const service = new BiometricSensorFusionService();

  it('1. Initializes with default telemetry frame', () => {
    const frame = service.currentFrame();
    expect(frame).not.toBeNull();
    expect(frame?.ppgHrvMs).toBeGreaterThan(0);
    expect(frame?.cgmGlucoseMgDl).toBeGreaterThan(0);
    expect(service.isStreaming()).toBe(false);
  });

  it('2. Ticks new biometric sensor frames with rolling history', () => {
    const frame1 = service.tickSensorFrame();
    expect(frame1).toBeDefined();
    expect(service.recentHistory().length).toBeGreaterThan(0);
  });

  it('3. Starts and stops live sensor streaming correctly', () => {
    service.startSensorStream();
    expect(service.isStreaming()).toBe(true);

    service.stopSensorStream();
    expect(service.isStreaming()).toBe(false);
  });
});
