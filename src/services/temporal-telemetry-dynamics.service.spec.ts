import { describe, it, expect, beforeEach } from 'vitest';
import { TemporalTelemetryDynamicsService } from './temporal-telemetry-dynamics.service';

describe('TemporalTelemetryDynamicsService', () => {
  let service: TemporalTelemetryDynamicsService;

  beforeEach(() => {
    service = new TemporalTelemetryDynamicsService();
    service.reset();
  });

  it('should return stable dynamics for single observation', () => {
    service.recordObservation('glucose', 110, 100000);
    const dyn = service.computeDynamics('glucose', 54, 'LOW');
    expect(dyn.currentValue).toBe(110);
    expect(dyn.velocityPerMin).toBe(0);
    expect(dyn.status).toBe('STABLE');
    expect(dyn.projectedMinutesToThreshold).toBeNull();
  });

  it('should compute negative velocity and project time to hypoglycemic breach', () => {
    const t0 = 1000000;
    // Dropping from 100 to 80 over 10 minutes: velocity = -2.0 mg/dL/min
    service.recordObservation('glucose', 100, t0);
    service.recordObservation('glucose', 80, t0 + 10 * 60000);

    const dyn = service.computeDynamics('glucose', 54, 'LOW');
    expect(dyn.velocityPerMin).toBeCloseTo(-2.0, 1);
    expect(dyn.isDeteriorating).toBe(true);
    // (80 - 54) / 2.0 = 13.0 minutes
    expect(dyn.projectedMinutesToThreshold).toBeCloseTo(13.0, 1);
    expect(dyn.status).toBe('CRITICAL_PROJECTED_BREACH');

    const alerts = service.evaluatePredictiveAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].metric).toBe('glucose');
    expect(alerts[0].severity).toBe('STAT_OVERRIDE');
  });

  it('should compute acceleration when 3+ samples exist', () => {
    const t0 = 1000000;
    service.recordObservation('uhthoffCoreTempDelta', 0.10, t0);
    service.recordObservation('uhthoffCoreTempDelta', 0.15, t0 + 5 * 60000); // v1 = +0.01 °C/min
    service.recordObservation('uhthoffCoreTempDelta', 0.25, t0 + 10 * 60000); // v2 = +0.02 °C/min

    const dyn = service.computeDynamics('uhthoffCoreTempDelta', 0.40, 'HIGH');
    expect(dyn.velocityPerMin).toBeCloseTo(0.02, 2);
    expect(dyn.accelerationPerMin2).toBeGreaterThan(0);
    expect(dyn.projectedMinutesToThreshold).toBeCloseTo((0.40 - 0.25) / 0.02, 1);
  });
});
