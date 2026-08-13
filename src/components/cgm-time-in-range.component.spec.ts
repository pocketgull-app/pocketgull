import '@angular/compiler';
import { CgmTimeInRangeComponent } from './cgm-time-in-range.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { CgmTimeInRangeService } from '../services/hardware/cgm-time-in-range.service';

describe('CgmTimeInRangeComponent', () => {
  let component: CgmTimeInRangeComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72', spO2: '98%' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: CgmTimeInRangeService, useFactory: () => new CgmTimeInRangeService() }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new CgmTimeInRangeComponent();
    });
  });

  it('should initialize with baseline CGM analysis and 24 readings', () => {
    expect(component).toBeTruthy();
    expect(component.readings().length).toBe(24);
    expect(component.analysis().timeInRangePercent).toBeGreaterThan(0);
  });

  it('should calculate graph heights proportionally', () => {
    const height = component.getGraphHeight(125);
    expect(height).toBeGreaterThan(15);
    expect(height).toBeLessThanOrEqual(100);
  });

  it('should update readings when postprandial spike is simulated', () => {
    const initialMean = component.analysis().meanGlucoseMgDl;
    component.simulatePostprandialSpike();
    expect(component.analysis().meanGlucoseMgDl).toBeGreaterThan(initialMean);
  });
});
