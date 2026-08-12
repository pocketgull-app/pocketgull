import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { RiskTierBadgeComponent } from './risk-tier-badge.component';

describe('RiskTierBadgeComponent', () => {
  let comp: RiskTierBadgeComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [RiskTierBadgeComponent]
    });
    comp = runInInjectionContext(injector, () => injector.get(RiskTierBadgeComponent));
  });

  it('1. Initializes default LOW risk tier badge signal outputs', () => {
    expect(comp.level()).toBe('LOW');
    expect(comp.badgeClasses()).toContain('emerald');
    expect(comp.dotClass()).toContain('emerald');
  });
});
