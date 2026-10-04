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

  it('13. Inserts patient case directly into PatientManagementService chart history', () => {
    const patientMgmt = TestBed.inject(PatientManagementService);
    const caseToInsert = component.patientCases[0][0];

    component.insertCaseIntoPatientChart(caseToInsert);

    const insertedPatient = patientMgmt.patients().find(p => p.id === caseToInsert.id || p.name === caseToInsert.patientName);
    expect(insertedPatient).toBeDefined();
    expect(insertedPatient?.history.length).toBeGreaterThan(0);
    expect(insertedPatient?.history[0].summary).toContain('12-Hour Shift Encounter');
    expect(patientMgmt.selectedPatientId()).toBe(insertedPatient?.id);
    expect(component.statusNotification()).toContain('successfully inserted into Patient Chart');
  });

  it('14. Batch inserts all encounters from the current phase into the patient chart', () => {
    const patientMgmt = TestBed.inject(PatientManagementService);
    component.currentPhaseIndex.set(0);
    const initialCases = component.activeCases();

    component.insertAllCurrentPhaseCasesIntoChart();

    for (const c of initialCases) {
      const patient = patientMgmt.patients().find(p => p.id === c.id || p.name === c.patientName);
      expect(patient).toBeDefined();
      expect(patient?.history.some(h => h.summary.includes(c.chiefComplaint) || h.summary.includes('12-Hour Shift Encounter'))).toBe(true);
    }
    expect(component.statusNotification()).toContain('encounters inserted into Patient Chart');
  });

  it('15. Opens case handoff QR modal, sets active case, and computes handoff URL and variant', () => {
    const caseToHandoff = component.patientCases[0][0]; // Elena Rostova, L1-RED
    expect(component.qrHandoffCase()).toBeNull();

    component.openCaseHandoffQr(caseToHandoff);
    expect(component.qrHandoffCase()).toBe(caseToHandoff);
    expect(component.caseHandoffUrl()).toContain('https://pocketgull.app/handoff/shift');
    expect(component.caseHandoffUrl()).toContain('id=sc01');
    expect(component.caseHandoffUrl()).toContain('Elena+Rostova');
    expect(component.caseHandoffVariant()).toBe('amber');

    // Test copying SBAR note
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });
    component.copyCaseHandoffSbar();
    expect(mockWriteText).toHaveBeenCalled();

    component.closeCaseHandoffQr();
    expect(component.qrHandoffCase()).toBeNull();
  });

  it('16. Opens phase handoff QR modal and computes phase handoff URL', () => {
    component.currentPhaseIndex.set(1);
    expect(component.isPhaseHandoffModalOpen()).toBe(false);

    component.openPhaseHandoffQrModal();
    expect(component.isPhaseHandoffModalOpen()).toBe(true);
    expect(component.phaseHandoffUrl()).toContain('https://pocketgull.app/handoff/shift-phase');
    expect(component.phaseHandoffUrl()).toContain('phase=2');

    component.closePhaseHandoffQrModal();
    expect(component.isPhaseHandoffModalOpen()).toBe(false);
  });
});

