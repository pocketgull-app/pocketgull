import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { SymptomHabitJournalComponent } from './symptom-habit-journal.component';
import { PatientStateService } from '../services/patient-state.service';

describe('SymptomHabitJournalComponent', () => {
  let component: SymptomHabitJournalComponent;

  beforeEach(() => {
    const mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({})
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    component = runInInjectionContext(injector, () => new SymptomHabitJournalComponent());
  });

  it('should initialize with default vitals and initial journal history', () => {
    expect(component.energyLevel()).toBe(8);
    expect(component.painLevel()).toBe(2);
    expect(component.journalHistory().length).toBe(2);
  });

  it('should toggle habit tag selection correctly', () => {
    const tag = '15-min Sunlight';
    expect(component.isHabitSelected(tag)).toBe(false);

    component.toggleHabitTag(tag);
    expect(component.isHabitSelected(tag)).toBe(true);

    component.toggleHabitTag(tag);
    expect(component.isHabitSelected(tag)).toBe(false);
  });

  it('should save a new journal entry into history', () => {
    const initialLength = component.journalHistory().length;
    component.saveJournalEntry('Felt energized after morning walk.');

    expect(component.journalHistory().length).toBe(initialLength + 1);
    const newest = component.journalHistory()[0];
    expect(newest.notes).toBe('Felt energized after morning walk.');
    expect(newest.energyLevel).toBe(8);
  });
});
