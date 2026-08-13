import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalGaugeSvgComponent } from './clinical-gauge-svg.component';

describe('ClinicalGaugeSvgComponent', () => {
  let comp: ClinicalGaugeSvgComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [ClinicalGaugeSvgComponent]
    });
    comp = runInInjectionContext(injector, () => injector.get(ClinicalGaugeSvgComponent));
  });

  it('1. Initializes default 50% percentage arc gauge calculation', () => {
    expect(comp.value()).toBe(50);
    expect(comp.normalizedPercentage()).toBe(0.5);
    expect(comp.colorClass()).toContain('amber');
    expect(comp.strokeDashOffset()).toBeLessThan(comp.strokeDashArray);
  });
});
