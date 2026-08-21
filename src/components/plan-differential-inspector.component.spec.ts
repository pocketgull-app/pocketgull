import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { PlanDifferentialInspectorComponent } from './plan-differential-inspector.component';

describe('PlanDifferentialInspectorComponent', () => {
  const createComponent = () => {
    const injector = Injector.create({ providers: [] });
    return runInInjectionContext(injector, () => new PlanDifferentialInspectorComponent());
  };

  it('should create with 4 default differential items', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.items().length).toBe(4);
    expect(comp.items()[0].category).toBe('Pharmacotherapy / Titration');
    expect(comp.signOffStatus()).toBe('ACCEPTED_AI');
  });

  it('should update signOffStatus and compute matching badge classes', () => {
    const comp = createComponent();
    expect(comp.statusBadgeClass()).toContain('emerald');

    comp.setSignOffStatus('MODIFIED');
    expect(comp.signOffStatus()).toBe('MODIFIED');
    expect(comp.statusBadgeClass()).toContain('amber');

    comp.setSignOffStatus('REVERTED_BASELINE');
    expect(comp.signOffStatus()).toBe('REVERTED_BASELINE');
    expect(comp.statusBadgeClass()).toContain('zinc');
  });
});
