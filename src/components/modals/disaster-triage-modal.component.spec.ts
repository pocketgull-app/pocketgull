import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisasterTriageModalComponent } from './disaster-triage-modal.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('DisasterTriageModalComponent Unit Suite', () => {
  let component: DisasterTriageModalComponent;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      getCurrentState: vi.fn().mockReturnValue({}),
      addClinicalNote: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        DisasterTriageModalComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(DisasterTriageModalComponent));
  });

  it('1. Initializes cleanly with capacity counters and casualty roster', () => {
    expect(component).toBeTruthy();
    expect(component.casualties().length).toBe(5);
    expect(component.capacity().traumaBaysOccupied).toBe(3);
    expect(component.capacity().traumaBaysTotal).toBe(4);
    expect(component.redCount()).toBe(2);
    expect(component.yellowCount()).toBe(1);
    expect(component.greenCount()).toBe(1);
    expect(component.blackCount()).toBe(1);
  });

  it('2. Evaluates START algorithm to GREEN when patient can walk', () => {
    component.canWalk.set(true);
    expect(component.computedTag()).toBe('GREEN');
    expect(component.computedTagDescription()).toContain('Walking Wounded');
  });

  it('3. Evaluates START algorithm to RED for tachypneic breathing (>= 30 bpm)', () => {
    component.canWalk.set(false);
    component.respRate.set(34);
    expect(component.computedTag()).toBe('RED');
  });

  it('4. Evaluates START algorithm to RED when radial pulse is absent or capillary refill > 2s', () => {
    component.canWalk.set(false);
    component.respRate.set(22);
    component.radialPulse.set('absent');
    expect(component.computedTag()).toBe('RED');

    component.radialPulse.set('present');
    component.capRefillOver2.set(true);
    expect(component.computedTag()).toBe('RED');
  });

  it('5. Evaluates START algorithm to YELLOW for stable non-ambulatory patient obeying commands', () => {
    component.canWalk.set(false);
    component.respRate.set(18);
    component.radialPulse.set('present');
    component.capRefillOver2.set(false);
    component.mentalStatus.set('follows_commands');
    expect(component.computedTag()).toBe('YELLOW');
  });

  it('6. Evaluates START algorithm to BLACK when respiratory rate is 0', () => {
    component.canWalk.set(false);
    component.respRate.set(0);
    expect(component.computedTag()).toBe('BLACK');
    expect(component.computedTagDescription()).toContain('Expectant');
  });

  it('7. Commits new casualty and updates trauma bay capacity', () => {
    component.canWalk.set(false);
    component.respRate.set(32); // RED
    component.lsiTourniquet = true;

    const initialCount = component.casualties().length;
    const initialTraumaOccupied = component.capacity().traumaBaysOccupied;

    component.commitNewCasualty();

    expect(component.casualties().length).toBe(initialCount + 1);
    expect(component.capacity().traumaBaysOccupied).toBe(initialTraumaOccupied + 1);
    expect(mockPatientState.addClinicalNote).toHaveBeenCalled();
  });

  it('8. Cycles casualty tag when clinician overrides triage', () => {
    const firstCas = component.casualties()[0];
    const initialTag = firstCas.tag; // RED
    component.cycleTag(firstCas.id);
    const updated = component.casualties().find(c => c.id === firstCas.id);
    expect(updated?.tag).not.toBe(initialTag);
  });
});
