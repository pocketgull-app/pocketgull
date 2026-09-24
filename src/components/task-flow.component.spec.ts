import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskFlowComponent } from './task-flow.component';
import { PatientStateService } from '../services/patient-state.service';
import { DictationService } from '../services/dictation.service';
import { PatientManagementService } from '../services/patient-management.service';
import { StorageService } from '../services/storage.service';
import { ClinicalAssessmentsService } from '../services/clinical-assessments/clinical-assessments.service';

describe('TaskFlowComponent (Active Room & Direct Assessments)', () => {
  let component: TaskFlowComponent;
  let mockPatientState: any;
  let mockDictation: any;

  beforeEach(() => {
    mockPatientState = {
      clinicalNotes: signal([]),
      checklist: signal([]),
      shoppingList: signal([]),
      showActiveRoom: signal(false),
      toggleActiveRoom: vi.fn(function(this: any, force?: boolean) {
        this.showActiveRoom.update((curr: boolean) => (force !== undefined ? force : !curr));
      }),
      toggleResearchFrame: vi.fn(),
      addClinicalNote: vi.fn((note) => {
        mockPatientState.clinicalNotes.update((n: any[]) => [...n, note]);
      }),
      addChecklistItem: vi.fn((item) => {
        mockPatientState.checklist.update((t: any[]) => [...t, item]);
      }),
      removeClinicalNote: vi.fn(),
      removeChecklistItem: vi.fn(),
      toggleChecklistItem: vi.fn()
    };

    mockDictation = {
      isDictating: signal(false),
      startDictation: vi.fn(),
      stopDictation: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        ClinicalAssessmentsService,
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: DictationService, useValue: mockDictation },
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

    component = runInInjectionContext(injector, () => new TaskFlowComponent());
  });

  it('should create component with default activeView as tasks', () => {
    expect(component).toBeTruthy();
    expect(component.activeView()).toBe('tasks');
  });

  it('should switch activeView to assessments when requested', () => {
    expect(component.activeView()).toBe('tasks');
    component.activeView.set('assessments');
    expect(component.activeView()).toBe('assessments');
  });

  it('should switch activeView to collab when requested', () => {
    expect(component.activeView()).toBe('tasks');
    component.activeView.set('collab');
    expect(component.activeView()).toBe('collab');
  });

  it('should style assessment tasks with blue border in enhancedChecklist', () => {
    mockPatientState.checklist.set([
      { id: 't1', text: '[Assessment] Conduct follow-up PHQ-9 in 14 days', completed: false }
    ]);

    const enhanced = component.enhancedChecklist();
    expect(enhanced.length).toBe(1);
    expect(enhanced[0].colorClass).toContain('border-blue-500');
    expect(enhanced[0].formattedText).toContain('Assessment');
  });

  it('should style assessment notes with blue border in enhancedClinicalNotes', () => {
    mockPatientState.clinicalNotes.set([
      { id: 'n1', text: '[Assessment] PHQ-9 (Depression): Score 12/27 (Moderate Depression)', sourceLens: 'Assessments', date: new Date().toISOString() }
    ]);

    const enhanced = component.enhancedClinicalNotes();
    expect(enhanced.length).toBe(1);
    expect(enhanced[0].colorClass).toContain('border-blue-500');
    expect(enhanced[0].formattedText).toContain('Assessment');
  });

  it('should toggle showActiveRoom on patient state', () => {
    expect(mockPatientState.showActiveRoom()).toBe(false);
    mockPatientState.toggleActiveRoom();
    expect(mockPatientState.showActiveRoom()).toBe(true);
    mockPatientState.toggleActiveRoom(false);
    expect(mockPatientState.showActiveRoom()).toBe(false);
  });
});
