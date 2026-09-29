import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ActuarialQalyCalculatorComponent } from './actuarial-qaly-calculator.component';
import { PatientStateService } from '../services/patient-state.service';

describe('ActuarialQalyCalculatorComponent', () => {
  const createComponent = () => {
    const mockPatientState = {
      vitals: signal({ bp: '120/80', hr: '68', spO2: '99' }),
      issues: signal({})
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    return runInInjectionContext(injector, () => new ActuarialQalyCalculatorComponent());
  };

  it('1. Initializes with target baseline values and valid bio-age delta', () => {
    const comp = createComponent();
    expect(comp.vagalBreathingMins()).toBe(15);
    expect(comp.chronoAdherence()).toBe(80);
    expect(comp.zone2Hours()).toBe(3.5);
    expect(comp.precisionDosing()).toBe(70);

    const delta = comp.bioAgeDelta();
    expect(delta).toBeLessThan(0);
    expect(comp.biologicalAge()).toBeLessThan(42.5);
    expect(comp.qalyGained()).toBeGreaterThan(0);
  });

  it('2. Dynamically updates biological age delta when protocol adherence increases', () => {
    const comp = createComponent();
    const initialDelta = comp.bioAgeDelta();

    // Maximize adherence
    comp.vagalBreathingMins.set(30);
    comp.chronoAdherence.set(100);
    comp.zone2Hours.set(8);
    comp.precisionDosing.set(100);

    const optimizedDelta = comp.bioAgeDelta();
    expect(optimizedDelta).toBeLessThan(initialDelta);
    expect(comp.biologicalAge()).toBeLessThan(36);
    expect(parseFloat(comp.dnamAgeSpeed())).toBeLessThan(1.0);
  });

  it('3. Resets to default target protocol values upon resetCalculator invocation', () => {
    const comp = createComponent();
    comp.vagalBreathingMins.set(0);
    comp.chronoAdherence.set(20);
    comp.zone2Hours.set(0);
    comp.precisionDosing.set(0);

    expect(comp.vagalBreathingMins()).toBe(0);

    comp.resetCalculator();
    expect(comp.vagalBreathingMins()).toBe(15);
    expect(comp.chronoAdherence()).toBe(80);
    expect(comp.zone2Hours()).toBe(3.5);
    expect(comp.precisionDosing()).toBe(70);
  });
});
