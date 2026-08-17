import '@angular/compiler';
import { vi } from 'vitest';
import { SentinelTriageComponent } from './sentinel-triage.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector, PLATFORM_ID } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { GamificationService } from '../services/gamification.service';

describe('SentinelTriageComponent - WHO / NHI Outbreak Triage & Threat Telemetry', () => {
  let component: SentinelTriageComponent;
  let mockPatientState: any;
  let mockPatientManagement: any;
  let mockGamification: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      symptoms: signal([
        { id: '1', name: 'High Fever', severity: 'critical', bodyPartId: 'head' }
      ]),
      vitals: signal({ hr: '110', bp: '90/60', temp: '102.5°F', spO2: '94%' })
    };

    mockPatientManagement = {
      activePatient: signal({ id: 'P001', name: 'Anonymous Patient' }),
      selectedPatientId: signal('P001'),
      patients: signal([{ id: 'P001', name: 'Anonymous Patient' }])
    };

    mockGamification = {
      addXp: vi.fn(),
      unlockAchievement: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: PatientManagementService, useValue: mockPatientManagement },
      { provide: GamificationService, useValue: mockGamification },
      { provide: PLATFORM_ID, useValue: 'browser' }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SentinelTriageComponent();
    });
  });

  it('should instantiate successfully with active nodes count', () => {
    expect(component).toBeTruthy();
    expect(component.activeNodesCount()).toBeGreaterThan(0);
  });

  it('should evaluate threat level label based on critical symptoms', () => {
    expect(component.threatLevelLabel()).toBeTruthy();
  });

  it('should update regional viewpoint using setGeoViewpoint', () => {
    component.setGeoViewpoint('regional');
    expect(component.geoViewpoint()).toBe('regional');
  });
});
