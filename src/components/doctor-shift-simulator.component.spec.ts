import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { DoctorShiftSimulatorComponent } from './doctor-shift-simulator.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('DoctorShiftSimulatorComponent Unit Suite', () => {
  let component: DoctorShiftSimulatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorShiftSimulatorComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock clinical synthesis')
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DoctorShiftSimulatorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully at phase 0 with 5 total phases', () => {
    expect(component).toBeTruthy();
    expect(component.currentPhaseIndex()).toBe(0);
    expect(component.phases.length).toBe(5);
    expect(component.currentPhase().title).toContain('Inpatient Triage');
    expect(component.activeCases().length).toBeGreaterThan(0);
  });

  it('2. Computes cumulative patients, hours saved, and API spend', () => {
    expect(component.cumulativePatients()).toBeGreaterThan(0);
    expect(component.cumulativeHoursSaved()).toBeGreaterThan(0);
    expect(component.cumulativeApiSpend()).toBeGreaterThan(0);
  });

  it('3. Steps forward through phases and updates active cases', () => {
    component.stepNextPhase();
    expect(component.currentPhaseIndex()).toBe(1);
    expect(component.activeCases().length).toBeGreaterThan(0);

    component.stepNextPhase();
    expect(component.currentPhaseIndex()).toBe(2);
  });

  it('4. Toggles analytics card flip state', () => {
    expect(component.isAnalyticsFlipped()).toBe(false);
    component.toggleAnalyticsFlip();
    expect(component.isAnalyticsFlipped()).toBe(true);
  });

  it('5. Controls auto play timer and stops cleanly', () => {
    component.startAutoPlay();
    expect(component.isAutoPlaying()).toBe(true);

    component.stopAutoPlay();
    expect(component.isAutoPlaying()).toBe(false);
  });

  it('6. Resets shift back to initial phase', () => {
    component.currentPhaseIndex.set(3);
    component.resetShift();
    expect(component.currentPhaseIndex()).toBe(0);
    expect(component.isAutoPlaying()).toBe(false);
  });

  it('7. Emits closeModal event', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });

  it('8. Verifies all 14 cases across all 5 phases carry full Three Acts care plans and MED-SKEPTIC audits', () => {
    let totalCases = 0;
    for (let phase = 0; phase < component.phases.length; phase++) {
      const cases = component.patientCases[phase];
      expect(cases.length).toBeGreaterThan(0);
      for (const c of cases) {
        totalCases++;
        expect(c.carePlan).toBeDefined();
        expect(c.carePlan?.diagnosis).toBeTruthy();
        expect(c.carePlan?.icd10).toBeTruthy();
        // Three Acts Standard
        expect(c.carePlan?.threeActs.act1.length).toBeGreaterThan(10);
        expect(c.carePlan?.threeActs.act2.length).toBeGreaterThan(10);
        expect(c.carePlan?.threeActs.act3.length).toBeGreaterThan(10);
        // MED-SKEPTIC Audit
        expect(c.carePlan?.medSkepticAudit.nullHypothesisH0).toBeTruthy();
        expect(c.carePlan?.medSkepticAudit.cochraneRoB).toBeTruthy();
        expect(c.carePlan?.medSkepticAudit.dcaNetBenefit).toBeGreaterThan(0);
        expect(c.carePlan?.medSkepticAudit.unnecessaryProceduresAvoided).toBeGreaterThan(0);
        expect(c.carePlan?.medSkepticAudit.skepticalVerdict).toBeTruthy();
        // Antonovsky Manageability
        expect(c.carePlan?.antonovskyManageability.immediateRemedy).toBeTruthy();
        expect(c.carePlan?.antonovskyManageability.remineralizationWaterPlan).toBeTruthy();
        // Pharmacy Benchmark
        expect(c.carePlan?.pharmacyBenchmark.standardRetail).toBeTruthy();
        expect(c.carePlan?.pharmacyBenchmark.genericBenchmark).toBeTruthy();
      }
    }
    expect(totalCases).toBe(14);
  });

  it('9. Opens and closes care plan modal for selected case', () => {
    const firstCase = component.patientCases[0][0];
    expect(component.selectedCase()).toBeNull();

    component.openCarePlan(firstCase);
    expect(component.selectedCase()).toBe(firstCase);
    expect(component.selectedCase()?.patientName).toBe('Elena Rostova');

    component.selectedCase.set(null);
    expect(component.selectedCase()).toBeNull();
  });

  it('10. Loads patient case into active PatientStateService and sets status notification', () => {
    const patientState = TestBed.inject(PatientStateService);
    const caseToLoad = component.patientCases[0][0];

    component.loadCaseIntoPatientState(caseToLoad);

    expect(patientState.patientName()).toBe('Elena Rostova');
    expect(patientState.reasonForVisit()).toBe(caseToLoad.chiefComplaint);
    expect(patientState.activeCarePlanNotes()).toContain('Three Acts Care Plan');
    expect(component.statusNotification()).toContain('Elena Rostova');
  });

  it('11. Exports case FHIR R4 Bundle and updates status notification', () => {
    const caseToExport = component.patientCases[1][0]; // Homo Sapiens (L5-S1)
    component.exportCaseFhirBundle(caseToExport);
    expect(component.statusNotification()).toContain('Downloaded FHIR R4 Bundle');
  });

  it('12. Initiates full 12-hour simulation progression', () => {
    component.currentPhaseIndex.set(2);
    component.runFullShiftSimulation();
    expect(component.currentPhaseIndex()).toBe(0);
    expect(component.statusNotification()).toContain('Initiating Full 12-Hour Simulation');
  });
});
