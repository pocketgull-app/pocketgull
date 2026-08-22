import { Injector, runInInjectionContext, signal, ElementRef, PLATFORM_ID } from '@angular/core';
import { MedicalChartComponent } from './medical-chart.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { DictationService } from '../services/dictation.service';
import { GlobalHealthInitiativesService } from '../services/global-health-initiatives.service';

describe('MedicalChartComponent', () => {
  const createComponent = () => {
    const mockPatient = {
      id: 'pt-001',
      name: 'Eleanor Vance',
      age: 54,
      gender: 'Female' as const,
      vitals: { bp: '132/84', hr: '74', spO2: '98', temp: '36.7', weight: '68', height: '165' },
      preexistingConditions: ['Essential Hypertension', 'Fatigue'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Cardiovascular Longevity',
      lastVisit: '2026-08-20'
    };

    const mockPatientState = {
      viewingPastVisit: signal(null),
      issues: signal({}),
      vitals: signal(mockPatient.vitals),
      patientHistory: signal([]),
      patientGoals: signal(mockPatient.patientGoals)
    };

    const mockPatientManager = {
      selectedPatientId: signal('pt-001'),
      patients: signal([mockPatient])
    };

    const mockDictation = {
      isRecording: signal(false)
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientManager },
        { provide: DictationService, useValue: mockDictation },
        { provide: GlobalHealthInitiativesService, useClass: GlobalHealthInitiativesService },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    return runInInjectionContext(injector, () => new MedicalChartComponent());
  };

  it('1. Initializes MedicalChartComponent and loads selected patient', () => {
    const chart = createComponent();
    expect(chart.selectedPatient()?.id).toBe('pt-001');
    expect(chart.isViewerExpanded()).toBe(true);
    expect(chart.isSparklinesExpanded()).toBe(true);
  });

  it('2. Computes reactive WHO SDG 3.4 CVD Risk and ICD-11 dual-codes', () => {
    const chart = createComponent();
    const who = chart.whoRisk();
    expect(who).toBeDefined();
    expect(who?.riskScorePercent).toBeGreaterThan(0);

    const codes = chart.whoIcd11Codes();
    expect(codes.length).toBeGreaterThan(0);
    expect(codes[0].icd11Tm1Code).toContain('TM1:');
  });

  it('3. Toggles accordion cards for Sparklines and Biometrics', () => {
    const chart = createComponent();
    expect(chart.isSparklinesExpanded()).toBe(true);
    chart.isSparklinesExpanded.set(false);
    expect(chart.isSparklinesExpanded()).toBe(false);

    expect(chart.isBiometricExpanded()).toBe(true);
    chart.isBiometricExpanded.set(false);
    expect(chart.isBiometricExpanded()).toBe(false);
  });
});
