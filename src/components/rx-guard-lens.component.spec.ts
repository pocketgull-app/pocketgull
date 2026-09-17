import '@angular/compiler';
import { runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { RxGuardLensComponent } from './rx-guard-lens.component';
import { RxGuardService } from '../services/rx-guard.service';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalPosologyService } from '../services/clinical-posology.service';
import { ClinicalSpecialtyRiskSuiteService } from '../services/clinical-specialty-risk-suite.service';

describe('RxGuardLensComponent', () => {
  let component: RxGuardLensComponent;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([
      RxGuardService,
      ClinicalPosologyService,
      ClinicalSpecialtyRiskSuiteService,
      {
        provide: PatientStateService,
        useValue: {
          asPatientSnapshot: () => ({
            id: 'p001',
            name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
            age: 58,
            gender: 'Male',
            lastVisit: '2026-08-19',
            preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
            history: [],
            bookmarks: [],
            issues: {},
            patientGoals: '',
            medications: [{ id: 'm1', name: 'Warfarin 5mg', value: '5mg' }],
            dietarySupplements: [{ id: 's1', name: 'Ginkgo Biloba 120mg', value: '120mg' }],
            vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
          })
        }
      }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new RxGuardLensComponent();
    });
  });

  it('should instantiate and evaluate patient PGx risk tier', () => {
    expect(component).toBeTruthy();
    expect(component.currentPatient().name).toContain('Homo Sapiens');
    expect(component.assessment().overallRiskTier).toBe('CONTRAINDICATED');
    expect(component.assessment().pgxProfiles.length).toBeGreaterThan(0);
  });

  it('should toggle age-stratified posology calculator view', () => {
    expect(component.showPosologyCalculator()).toBe(false);
    component.showPosologyCalculator.set(true);
    expect(component.showPosologyCalculator()).toBe(true);
    component.showPosologyCalculator.set(false);
    expect(component.showPosologyCalculator()).toBe(false);
  });

  it('should evaluate in vivo drug-botanical phenoconversion capacity and toggle simulation', () => {
    expect(component.simulateBotanicalBlockade()).toBe(false);
    expect(component.phenoData().clearancePct).toBeGreaterThan(0);
    component.toggleBotanicalSimulation();
    expect(component.simulateBotanicalBlockade()).toBe(true);
  });
});
