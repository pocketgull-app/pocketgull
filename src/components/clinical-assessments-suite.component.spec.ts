import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClinicalAssessmentsSuiteComponent } from './clinical-assessments-suite.component';
import { ClinicalAssessmentsService } from '../services/clinical-assessments/clinical-assessments.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { StorageService } from '../services/storage.service';

describe('ClinicalAssessmentsSuiteComponent & Active Room Integration', () => {
  let component: ClinicalAssessmentsSuiteComponent;
  let mockPatientState: any;
  let assessmentsSvc: ClinicalAssessmentsService;

  beforeEach(() => {
    mockPatientState = {
      clinicalNotes: signal([]),
      checklist: signal([]),
      addClinicalNote: vi.fn((note) => {
        mockPatientState.clinicalNotes.update((n: any[]) => [...n, note]);
      }),
      addChecklistItem: vi.fn((item) => {
        mockPatientState.checklist.update((t: any[]) => [...t, item]);
      }),
      selectPart: vi.fn(),
      toggleBodyPart: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        ClinicalAssessmentsService,
        { provide: PatientStateService, useValue: mockPatientState },
        {
          provide: PatientManagementService,
          useValue: {
            selectedPatientId: signal('P-TEST'),
            selectedPatient: signal({ id: 'P-TEST', history: [] })
          }
        },
        { provide: StorageService, useValue: { savePatient: vi.fn() } }
      ]
    });

    assessmentsSvc = injector.get(ClinicalAssessmentsService);
    component = runInInjectionContext(injector, () => new ClinicalAssessmentsSuiteComponent());
  });

  it('should initialize component instance with default active assessment', () => {
    expect(component).toBeTruthy();
    expect(component.currentAssessment()).toBeDefined();
    expect(component.currentScore()).toBe(0);
    expect(component.isHeaderFlipped()).toBe(false);
  });

  it('should toggle header flip between quantitative metrics and OARS guidance', () => {
    expect(component.isHeaderFlipped()).toBe(false);
    component.toggleHeaderFlip();
    expect(component.isHeaderFlipped()).toBe(true);
  });

  it('should explicitly send assessment findings and care checklist to Active Room', () => {
    component.svc.activeTab.set('phq9');
    component.svc.setAnswer('phq9', 1, 3);
    component.svc.setAnswer('phq9', 2, 2);

    component.sendToActiveRoom();

    expect(mockPatientState.addClinicalNote).toHaveBeenCalledTimes(1);
    expect(mockPatientState.addChecklistItem).toHaveBeenCalledTimes(1);

    const noteCall = mockPatientState.addClinicalNote.mock.calls[0][0];
    expect(noteCall.sourceLens).toBe('Clinical Assessments Suite');
    expect(noteCall.text).toContain('PHQ-9');
    expect(noteCall.date).toBeDefined();

    const taskCall = mockPatientState.addChecklistItem.mock.calls[0][0];
    expect(taskCall.text).toBeDefined();
    expect(taskCall.completed).toBe(false);

    expect(component.toastMessage()).toContain('Active Room');
  });

  it('should synchronize findings into Active Room when committing to FHIR timeline', () => {
    component.svc.activeTab.set('gad7');
    component.svc.setAnswer('gad7', 1, 2);

    component.commitAssessment();

    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
    expect(mockPatientState.addChecklistItem).toHaveBeenCalled();
    expect(component.toastMessage()).toContain('FHIR Patient Timeline & Active Room');
  });
});
