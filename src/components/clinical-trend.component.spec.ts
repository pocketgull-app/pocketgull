import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ClinicalTrendComponent } from './clinical-trend.component';

describe('ClinicalTrendComponent', () => {
  const createComponent = (inputs?: {
    label?: string;
    values?: number[];
    type?: 'complexity' | 'stability' | 'certainty';
  }) => {
    const injector = Injector.create({ providers: [] });
    const comp = runInInjectionContext(injector, () => new ClinicalTrendComponent());
    if (inputs?.label !== undefined) (comp as any).label = signal(inputs.label);
    if (inputs?.values !== undefined) (comp as any).values = signal(inputs.values);
    if (inputs?.type !== undefined) (comp as any).type = signal(inputs.type);
    return comp;
  };

  it('1. should create and calculate empty trend defaults when values are empty', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.delta()).toBe(0);
    expect(comp.pathData()).toBe('');
    expect(comp.areaData()).toBe('');
  });

  it('2. should calculate positive delta and improving state for certainty', () => {
    const comp = createComponent({
      label: 'Certainty',
      type: 'certainty',
      values: [4, 6, 8]
    });

    expect(comp.delta()).toBe(4);
    expect(comp.isImproving()).toBe(true);
    expect(comp.areaColor()).toBe('#22c55e');
    expect(comp.strokeColor()).toBe('#3b82f6');
  });

  it('3. should calculate improving state correctly for complexity (lower is better)', () => {
    const comp = createComponent({
      label: 'Complexity',
      type: 'complexity',
      values: [8, 5, 3]
    });

    expect(comp.delta()).toBe(-5);
    expect(comp.isImproving()).toBe(true); // lower complexity is improving!
    expect(comp.areaColor()).toBe('#22c55e');
  });

  it('4. should generate svg sparkline path data when values are provided', () => {
    const comp = createComponent({
      values: [2, 5, 7]
    });

    expect(comp.pathData()).toContain('M 0,24');
    expect(comp.areaData()).toContain('L 100,30 L 0,30 Z');
  });
});

