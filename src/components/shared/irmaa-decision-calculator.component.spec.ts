import '@angular/compiler';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { IrmaaDecisionCalculatorComponent } from './irmaa-decision-calculator.component';
import { IrmaaDecisionService } from '../../services/irmaa-decision.service';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('IrmaaDecisionCalculatorComponent Unit Suite', () => {
  let component: IrmaaDecisionCalculatorComponent;
  let service: IrmaaDecisionService;

  beforeEach(() => {
    service = new IrmaaDecisionService();
    const injector = Injector.create({
      providers: [{ provide: IrmaaDecisionService, useValue: service }]
    });

    component = runInInjectionContext(injector, () => new IrmaaDecisionCalculatorComponent());
  });

  it('1. Initializes calculator component and computes default analysis', () => {
    expect(component).toBeTruthy();
    expect(component.analysis().currentTier.tier).toBe(1);
    expect(component.analysis().appealAssessment.isEligible).toBe(true);
  });

  it('2. Toggles Life-Changing Events and updates appeal eligibility state', () => {
    expect(component.hasEvent('WORK_REDUCTION')).toBe(true);

    component.toggleEvent('WORK_REDUCTION');
    expect(component.hasEvent('WORK_REDUCTION')).toBe(false);
    expect(component.analysis().appealAssessment.isEligible).toBe(false);

    component.toggleEvent('DEATH_OF_SPOUSE');
    expect(component.hasEvent('DEATH_OF_SPOUSE')).toBe(true);
    expect(component.analysis().appealAssessment.isEligible).toBe(true);
  });
});
