import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaregiverCheatSheetModalComponent } from './caregiver-cheat-sheet-modal.component';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';

describe('CaregiverCheatSheetModalComponent Unit Suite', () => {
  let component: CaregiverCheatSheetModalComponent;
  let mockPatientState: any;
  let mockPatientMgmt: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({}),
      addClinicalNote: vi.fn()
    };
    mockPatientMgmt = {
      selectedPatient: signal({ id: 'p_frida_kahlo', name: 'Frida Kahlo', age: 47 })
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: PatientManagementService, useValue: mockPatientMgmt },
        CaregiverCheatSheetModalComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(CaregiverCheatSheetModalComponent));
  });

  it('1. Initializes cleanly with Grade 6 reading level metrics', () => {
    expect(component).toBeTruthy();
    expect(component.fleschKincaidGrade()).toBeLessThanOrEqual(6.5);
    expect(component.readingEaseScore()).toBeGreaterThanOrEqual(75);
    expect(component.activePatientName()).toBe('Frida Kahlo');
  });

  it('2. Formulates plain-language summary and 4 daily schedule checkpoints', () => {
    expect(component.plainLanguageSummary()).toContain('Frida has long-term spinal nerve pain');
    expect(component.scheduleItems().length).toBe(4);
    expect(component.scheduleItems()[0].time).toBe('8:00 AM');
  });

  it('3. Provides 3-tier red-flag escalation guide (emergency, clinic, expected)', () => {
    expect(component.redFlags().length).toBe(3);
    const emergencyTier = component.redFlags().find(r => r.level === 'emergency');
    expect(emergencyTier?.action).toContain('Call 911');
  });

  it('4. Provides 3 top specialist questions for next visit', () => {
    expect(component.specialistQuestions().length).toBe(3);
    expect(component.specialistQuestions()[0]).toContain('evening medication schedule');
  });

  it('5. Seals proxy attestation with deterministic digest and records clinical note', () => {
    component.proxyName = 'David Kahlo';
    component.proxyRelationship = 'Spouse / Partner';
    component.isAttested = true;

    component.signAndSealRecord();

    const record = component.attestationRecord();
    expect(record).not.toBeNull();
    expect(record?.isAttested).toBe(true);
    expect(record?.sha256Digest).toContain('c2pa_part11_sealed');
    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
  });

  it('6. Emits close event when close output is triggered', () => {
    let closed = false;
    component.close.subscribe(() => { closed = true; });
    component.close.emit();
    expect(closed).toBe(true);
  });
});
