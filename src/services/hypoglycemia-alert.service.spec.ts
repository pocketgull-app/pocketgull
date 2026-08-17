import '@angular/compiler';
import { HypoglycemiaAlertService } from './hypoglycemia-alert.service';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { MedicalDecoderService } from './medical-decoder.service';

describe('HypoglycemiaAlertService', () => {
  let service: HypoglycemiaAlertService;
  let mockPatientState: any;
  let mockDecoder: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%', cgmGlucoseMgDl: 65 })
    };

    mockDecoder = {
      readingLevel: signal('patient'),
      speakTermDefinition: () => {}
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: MedicalDecoderService, useValue: mockDecoder }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      service = new HypoglycemiaAlertService();
    });
  });

  it('should initialize and trigger critical rescue alert for glucose < 70 mg/dL', () => {
    service.triggerRescueAlert(62, -3.0, 'critical_rescue');
    const alert = service.alertState();

    expect(alert.isAlertActive).toBe(true);
    expect(alert.urgencyTier).toBe('critical_rescue');
    expect(alert.recommendedAction).toContain('Low Blood Sugar Alert');
    expect(alert.recommendedAction).toContain('Orange Juice');
  });

  it('should dismiss alert when glucose stabilizes', () => {
    service.triggerRescueAlert(62, -3.0, 'critical_rescue');
    expect(service.alertState().isAlertActive).toBe(true);

    service.dismissAlert();
    expect(service.alertState().isAlertActive).toBe(false);
  });
});
