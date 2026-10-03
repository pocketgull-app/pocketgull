import '@angular/compiler';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ParadigmClinicalDashboardComponent } from './paradigm-clinical-dashboard.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('ParadigmClinicalDashboardComponent', () => {
  let component: ParadigmClinicalDashboardComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      {
        provide: PatientStateService,
        useValue: {
          activePhilosophy: signal('western'),
          patientAge: signal(42)
        }
      },
      {
        provide: PatientManagementService,
        useValue: {
          selectedPatientId: signal('p-darwin'),
          patients: signal([
            { id: 'p-darwin', name: 'Charles Darwin', age: 42 }
          ])
        }
      }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ParadigmClinicalDashboardComponent();
    });
  });

  it('should instantiate successfully with active patient name', () => {
    expect(component).toBeTruthy();
    expect(component.activePatientName()).toBe('Charles Darwin');
    expect(component.activeMode()).toBe('blend_all');
    expect(component.isBlendMode()).toBe(true);
  });

  it('should toggle screening navigator drawer state', () => {
    expect(component.showScreeningNavigator()).toBe(false);

    component.toggleScreeningNavigator();
    expect(component.showScreeningNavigator()).toBe(true);

    component.toggleScreeningNavigator();
    expect(component.showScreeningNavigator()).toBe(false);
  });

  it('should change active paradigm blend mode', () => {
    component.selectBlend('western');
    expect(component.activeMode()).toBe('western');
    expect(component.isBlendMode()).toBe(false);
    expect(component.showWestern()).toBe(true);
    expect(component.showTcm()).toBe(false);

    component.selectBlend('blend_west_tcm');
    expect(component.activeMode()).toBe('blend_west_tcm');
    expect(component.isBlendMode()).toBe(true);
    expect(component.showWestern()).toBe(true);
    expect(component.showTcm()).toBe(true);
  });
});
