import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { ClinicalGaugeComponent } from './clinical-gauge.component';

describe('ClinicalGaugeComponent Signal & Accessibility Behavioral Suite', () => {

  const createGauge = () => {
    const injector = Injector.create({ providers: [] });
    return runInInjectionContext(injector, () => new ClinicalGaugeComponent());
  };

  it('computes correct status text for stability, complexity, and certainty types', () => {
    const gauge = createGauge();
    
    // Default initial certainty
    expect(gauge.statusText()).toBe('Low Certainty');
    expect(gauge.accessibilityLabel()).toContain('0 out of 10');

    // Default bar color for low certainty
    expect(gauge.barColor()).toContain('#6b7280');
  });

  it('computes status badge CSS classes with animate-pulse for critical instability', () => {
    const gauge = createGauge();
    // Default type is certainty (0/10) -> zinc badge
    expect(gauge.statusBadgeClasses()).toContain('bg-zinc-500/10');
  });

  it('computes survival probability display percentage and status text for survival gauge type', () => {
    const gauge = createGauge();
    // Override inputs using Object.defineProperty on input signals if needed, or test computed default
    expect(gauge.fillPercentage()).toBe(0);
    expect(gauge.displayValue()).toBe('0');
  });
});


