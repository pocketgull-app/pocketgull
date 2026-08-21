import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { AntiSlopSealBadgeComponent } from './antislop-seal-badge.component';

describe('AntiSlopSealBadgeComponent Unit Suite', () => {
  let comp: AntiSlopSealBadgeComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [AntiSlopSealBadgeComponent]
    });
    comp = runInInjectionContext(injector, () => injector.get(AntiSlopSealBadgeComponent));
  });

  it('1. Initializes and computes default Anti-Slop verification seal values', () => {
    expect(comp).toBeTruthy();
    expect(comp.audit().isAntiSlopCertified).toBe(true);
    expect(comp.audit().epistemicGroundingTier).toBe('LEVEL_A_DETERMINISTIC');
    expect(comp.audit().antislopSealHash).toBe('ANTISLOP-VERIFIED');
  });

  it('2. Reflects custom audit signal properties when populated', () => {
    expect(comp.audit().rigorScorePercent).toBe(100);
    expect(comp.audit().evidenceDensityPerHundredWords).toBe(5.0);
  });
});
