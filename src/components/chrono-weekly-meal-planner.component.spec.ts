import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ChronoWeeklyMealPlannerComponent } from './chrono-weekly-meal-planner.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

describe('ChronoWeeklyMealPlannerComponent Unit Suite', () => {
  let component: ChronoWeeklyMealPlannerComponent;

  beforeEach(async () => {
    const mockPatientManager = {
      selectedPatientId: signal('p001'),
      patients: signal([{ id: 'p001', name: 'Charles Darwin' }])
    };

    await TestBed.configureTestingModule({
      imports: [ChronoWeeklyMealPlannerComponent],
      providers: [
        { provide: PatientStateService, useValue: { patientId: signal('p001') } },
        { provide: PatientManagementService, useValue: mockPatientManager }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ChronoWeeklyMealPlannerComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with Monday as default day', () => {
    expect(component).toBeTruthy();
    expect(component.selectedDay()).toBe('Mon');
    expect(component.selectedRegion()).toBe('Pacific Northwest');
    expect(component.selectedPrepFilter()).toBe('ALL');
    expect(component.activePatientName()).toBe('Charles Darwin');
  });

  it('2. Flips individual meal cards with debounce guard', () => {
    expect(component.isMealFlipped('mon-1')).toBe(false);
    component.toggleMealFlip('mon-1');
    expect(component.isMealFlipped('mon-1')).toBe(true);

    // Call immediately within debounce window -> should remain flipped
    component.toggleMealFlip('mon-1');
    expect(component.isMealFlipped('mon-1')).toBe(true);
  });

  it('3. Changes selected day of the week', () => {
    component.selectedDay.set('Wed');
    expect(component.selectedDay()).toBe('Wed');
    component.selectedDay.set('Fri');
    expect(component.selectedDay()).toBe('Fri');
  });

  it('4. Filters meals by preparation complexity', () => {
    component.selectedPrepFilter.set('Quick Meal');
    expect(component.selectedPrepFilter()).toBe('Quick Meal');
  });

  it('5. Maintains 7-day chronobiological meal schedule with slots', () => {
    const schedule = component.weeklySchedule();
    expect(schedule.length).toBeGreaterThan(0);
    const mon = schedule.find(d => d.day === 'Mon');
    expect(mon).toBeDefined();
    expect(mon!.slots.length).toBeGreaterThan(0);
  });
});
