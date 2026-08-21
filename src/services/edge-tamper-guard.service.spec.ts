import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { EdgeTamperGuardService } from './edge-tamper-guard.service';

describe('EdgeTamperGuardService Unit Suite', () => {
  let service: EdgeTamperGuardService;

  beforeEach(() => {
    service = new EdgeTamperGuardService();
  });

  it('1. Initializes and completes initial edge security audit cleanly', () => {
    expect(service).toBeTruthy();
    const telemetry = service.telemetry();
    expect(telemetry).toBeDefined();
    expect(telemetry.tamperRiskScore).toBeGreaterThanOrEqual(0);
    expect(['ALLOW', 'MOCK_DECOY_SUBSTITUTION', 'QUARANTINE_BLOCK']).toContain(telemetry.recommendedAction);
  });

  it('2. Computes reactive signals for isAutomationDetected and tamperRiskScore', () => {
    expect(typeof service.isAutomationDetected()).toBe('boolean');
    expect(typeof service.tamperRiskScore()).toBe('number');
  });
});
