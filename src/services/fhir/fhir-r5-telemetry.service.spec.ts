import '@angular/compiler';
import { Injector, runInInjectionContext, signal, PLATFORM_ID } from '@angular/core';
import { FhirR5TelemetryService } from './fhir-r5-telemetry.service';
import { PatientStateService } from '../patient-state.service';

describe('FhirR5TelemetryService Adaptive Alert Suppression (Wachter Doctrine)', () => {
  let service: FhirR5TelemetryService;
  let mockPatientState: any;
  let injector: Injector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal<any>({ hr: 72, spO2: 98 }),
      updateVital: vi.fn()
    };

    injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    runInInjectionContext(injector, () => {
      service = new FhirR5TelemetryService();
    });
  });

  it('should comply with HL7 FHIR R5 SubscriptionTopic specification and return normal state for normal vitals', () => {
    const result = service.evaluateAdaptiveAlert(72, 98, 16, 45);

    expect(result.status).toBe('active');
    expect(result.alarmSuppressionState).toBe('normal');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.95);
    expect(result.flaggedBiomarker).toBeUndefined();
  });

  it('should suppress transient isolated HR spikes with normal HRV and respiration (motion artifact)', () => {
    // Seed history with normal baseline
    service.evaluateAdaptiveAlert(72, 98, 16, 45);
    service.evaluateAdaptiveAlert(74, 98, 16, 45);

    // Single-point HR spike
    const result = service.evaluateAdaptiveAlert(135, 98, 16, 45);

    expect(result.status).toBe('active');
    expect(result.alarmSuppressionState).toBe('suppressed_transient');
    expect(result.suppressionReason).toContain('Transient HR anomaly (135 bpm) suppressed');
  });

  it('should trigger active alert when HR spike is sustained across consecutive samples', () => {
    service.evaluateAdaptiveAlert(135, 98, 16, 45);
    const secondSpike = service.evaluateAdaptiveAlert(138, 98, 16, 45);

    expect(secondSpike.status).toBe('alert');
    expect(secondSpike.alarmSuppressionState).toBe('active_alert');
    expect(secondSpike.flaggedBiomarker).toContain('Tachycardia/Bradycardia Warning');
  });

  it('should trigger immediate active alert when HR spike is correlated with low HRV distress', () => {
    service.evaluateAdaptiveAlert(72, 98, 16, 45);

    // Single HR spike combined with low HRV (< 25 ms) representing autonomic distress
    const result = service.evaluateAdaptiveAlert(135, 98, 16, 18);

    expect(result.status).toBe('alert');
    expect(result.alarmSuppressionState).toBe('active_alert');
    expect(result.confidenceScore).toBeGreaterThan(0.90);
  });
});
