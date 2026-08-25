import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { NihWhoGoalTrackerComponent } from './nih-who-goal-tracker.component';
import { GlobalHealthInitiativesService } from '../../services/global-health-initiatives.service';
import { PatientStateService } from '../../services/patient-state.service';

describe('NihWhoGoalTrackerComponent Unit Suite', () => {
  const createComponent = () => {
    const mockPatientState = {
      patientName: signal('John Doe'),
      patientAge: signal(49),
      patientGender: signal('Female'),
      vitals: signal({ bp: '122/80', hr: '70', spO2: '98', temp: '37.0', weight: '68', height: '170' }),
      patientHistory: signal([{ summary: 'Hypertension prevention' }]),
      issues: signal({}),
      patientGoals: signal('Cardiometabolic & Longevity')
    };

    const injector = Injector.create({
      providers: [
        { provide: GlobalHealthInitiativesService, useClass: GlobalHealthInitiativesService },
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    return runInInjectionContext(injector, () => new NihWhoGoalTrackerComponent());
  };

  it('1. Initializes with 6 comprehensive NIH/WHO goals and computes fulfillment', () => {
    const component = createComponent();
    expect(component.goals().length).toBe(6);
    expect(component.overallFulfillmentScore()).toBeGreaterThan(0);
    expect(component.activeGoalsCount()).toBeGreaterThan(0);
  });

  it('2. Filters goals by agency tab (all, who, nih)', () => {
    const component = createComponent();
    expect(component.filteredGoals().length).toBe(6);

    component.activeTab.set('who');
    expect(component.filteredGoals().length).toBe(3);
    expect(component.filteredGoals().every(g => g.agency === 'WHO')).toBe(true);

    component.activeTab.set('nih');
    expect(component.filteredGoals().length).toBe(3);
    expect(component.filteredGoals().every(g => g.agency === 'NIH')).toBe(true);
  });

  it('3. Interactively logs Zone 2 cardio, vagal pacing minutes, and streak count', () => {
    const component = createComponent();
    const initialZone2 = component.weeklyZone2Minutes();
    component.addZone2(15);
    expect(component.weeklyZone2Minutes()).toBe(initialZone2 + 15);

    const initialVagal = component.dailyVagalPacingMinutes();
    component.addVagalPacing(5);
    expect(component.dailyVagalPacingMinutes()).toBe(initialVagal + 5);

    const initialStreak = component.streakDays();
    component.incrementStreak();
    expect(component.streakDays()).toBe(initialStreak + 1);
  });

  it('4. Simulates FHIR Goals export trigger', () => {
    const component = createComponent();
    expect(component.exported()).toBe(false);
    component.exportFhirGoals();
    expect(component.exported()).toBe(true);
  });
});
