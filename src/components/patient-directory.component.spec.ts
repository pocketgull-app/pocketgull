import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PatientDirectoryComponent } from './patient-directory.component';
import { PatientManagementService } from '../services/patient-management.service';
import { PatientStateService } from '../services/patient-state.service';
import { CoppaPrivacyShieldService } from '../services/coppa-privacy-shield.service';
import { ClinicalMoERouterService } from '../services/clinical-moe-router.service';

describe('PatientDirectoryComponent', () => {
  let component: PatientDirectoryComponent;
  let moeRouter: ClinicalMoERouterService;
  let patientService: PatientManagementService;

  const mockPatients = [
    {
      id: 'p_marie_curie',
      name: 'Marie Curie',
      age: 66,
      gender: 'Female',
      preexistingConditions: ['Aplastic Anemia', 'Radiation Poisoning', 'Pancytopenia'],
      vitals: { bp: '82/50', hr: '112', spO2: '89', temp: '101.4' },
      lastVisit: '1934-07-04'
    },
    {
      id: 'p_charles_darwin',
      name: 'Charles Darwin',
      age: 73,
      gender: 'Male',
      preexistingConditions: ['Severe Dysautonomia', 'Chagas Disease', 'Chronic Fatigue'],
      vitals: { bp: '138/88', hr: '76', spO2: '97', temp: '98.6' },
      lastVisit: '1882-04-19'
    },
    {
      id: 'p_wellness_check',
      name: 'Healthy Individual',
      age: 28,
      gender: 'Male',
      preexistingConditions: ['Routine Preventive Wellness Checkup'],
      vitals: { bp: '118/76', hr: '64', spO2: '99', temp: '98.4' },
      lastVisit: '2026-09-15'
    }
  ];

  beforeEach(() => {
    const mockPatientService = {
      patients: signal(mockPatients),
      selectedPatientId: signal(null),
      selectPatient: vi.fn(),
      addPatient: vi.fn().mockReturnValue('p_new_001')
    };

    const mockPatientState = {
      liveAgentInput: signal(''),
      isLiveAgentActive: signal(false),
      isEmergencyMode: signal(false),
      issues: signal({}),
      vitals: signal(null)
    };

    TestBed.configureTestingModule({
      imports: [PatientDirectoryComponent],
      providers: [
        { provide: PatientManagementService, useValue: mockPatientService },
        { provide: PatientStateService, useValue: mockPatientState },
        CoppaPrivacyShieldService,
        ClinicalMoERouterService
      ]
    });

    moeRouter = TestBed.inject(ClinicalMoERouterService);
    patientService = TestBed.inject(PatientManagementService);
    const fixture = TestBed.createComponent(PatientDirectoryComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with default triage view mode and calculate triage evaluations', () => {
    expect(component).toBeTruthy();
    expect(component.viewMode()).toBe('triage');
    expect(component.acuityFilter()).toBe('all');

    const triaged = component.allTriagedPatients();
    expect(triaged.length).toBe(3);

    // ESI-1 sorting invariant: Marie Curie (aplastic crisis + spO2 89) should be first with ESI Level 1
    expect(triaged[0].patient.id).toBe('p_marie_curie');
    expect(triaged[0].esiLevel).toBe(1);
    expect(triaged[0].acuityTier).toBe('STAT Emergency');
    expect(triaged[0].predictedTopExperts.length).toBe(2);

    // Healthy Individual should be ESI Level 5
    const wellness = triaged.find(t => t.patient.id === 'p_wellness_check');
    expect(wellness?.esiLevel).toBe(5);
  });

  it('should filter patients by acuity tier (critical, urgent, stable)', () => {
    component.acuityFilter.set('critical');
    const critical = component.filteredTriagedPatients();
    expect(critical.length).toBeGreaterThanOrEqual(1);
    expect(critical.every(c => c.esiLevel <= 2)).toBe(true);

    component.acuityFilter.set('stable');
    const stable = component.filteredTriagedPatients();
    expect(stable.every(s => s.esiLevel >= 4)).toBe(true);
  });

  it('should filter patients by search query across name, condition, and predicted expert', () => {
    component.searchQuery.set('curie');
    expect(component.filteredTriagedPatients().length).toBe(1);
    expect(component.filteredTriagedPatients()[0].patient.id).toBe('p_marie_curie');

    component.searchQuery.set('nonexistent_condition');
    expect(component.filteredTriagedPatients().length).toBe(0);
  });

  it('should compute triage counts accurately', () => {
    const counts = component.triageCounts();
    expect(counts.total).toBe(3);
    expect(counts.esi1).toBe(1);
    expect(counts.critical).toBeGreaterThanOrEqual(1);
  });

  it('should select chart, activate canvas mode in moeRouter, and emit closeDirectory', () => {
    let closed = false;
    component.closeDirectory.subscribe(() => { closed = true; });

    component.selectChart('p_charles_darwin', true);
    expect(patientService.selectPatient).toHaveBeenCalledWith('p_charles_darwin');
    expect(moeRouter.analysisViewMode()).toBe('canvas');
    expect(closed).toBe(true);
  });
});
