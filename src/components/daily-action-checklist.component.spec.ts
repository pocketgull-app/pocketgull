import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { DailyActionChecklistComponent } from './daily-action-checklist.component';
import { PatientStateService } from '../services/patient-state.service';
import { LifestyleAdjunctService } from '../services/lifestyle-adjunct.service';

describe('DailyActionChecklistComponent', () => {
  let component: DailyActionChecklistComponent;

  beforeEach(() => {
    const mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({})
    };
    const mockLifestyle = {
      getRecommendations: vi.fn().mockReturnValue([])
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: LifestyleAdjunctService, useValue: mockLifestyle }
      ]
    });

    component = runInInjectionContext(injector, () => new DailyActionChecklistComponent());
  });

  it('should initialize with default habits and calculate completion percentage correctly', () => {
    expect(component.habits().length).toBeGreaterThan(0);
    // Initially 2 out of 5 habits are completed (40%)
    expect(component.completedCount()).toBe(2);
    expect(component.completionPercent()).toBe(40);
  });

  it('should toggle habit completion status', () => {
    const firstHabit = component.habits()[0];
    const initialCompleted = firstHabit.completed;

    component.toggleHabit(firstHabit.id);

    const updatedHabit = component.habits().find(h => h.id === firstHabit.id);
    expect(updatedHabit?.completed).toBe(!initialCompleted);
  });

  it('should add custom habit correctly', () => {
    const initialCount = component.habits().length;
    component.addCustomHabit('Evening 10-min Gentle Yoga');

    expect(component.habits().length).toBe(initialCount + 1);
    const added = component.habits().find(h => h.title === 'Evening 10-min Gentle Yoga');
    expect(added).toBeDefined();
    expect(added?.completed).toBe(false);
  });
});
