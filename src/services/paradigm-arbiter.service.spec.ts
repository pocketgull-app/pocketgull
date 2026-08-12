import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { ParadigmArbiterService } from './paradigm-arbiter.service';

describe('ParadigmArbiterService', () => {
  let service: ParadigmArbiterService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [ParadigmArbiterService]
    });
    service = runInInjectionContext(injector, () => injector.get(ParadigmArbiterService));
  });

  it('1. Initializes default collision list and count', () => {
    expect(service.collisionCount()).toBeGreaterThan(0);
    const initial = service.collisions()[0];
    expect(initial.paradigmsInvolved).toContain('WESTERN');
    expect(initial.paradigmsInvolved).toContain('TCM');
  });

  it('2. Arbitrates acute emergency collisions using Western priority', () => {
    const res = service.arbitrateCollision(['WESTERN', 'AYURVEDA'], 'Acute high fever vs Pitta pacification', true);
    expect(res.resolutionStrategy).toBe('WESTERN_ACUTE_PRIORITY');
    expect(res.arbitratedRecommendation).toContain('WESTERN ACUTE PRIORITY');
  });

  it('3. Arbitrates non-acute collisions using coherence fusion', () => {
    const res = service.arbitrateCollision(['WESTERN', 'TCM'], 'ST36 acupressure vs antiemetic onset', false);
    expect(res.resolutionStrategy).toBe('COHERENCE_FUSION');
    expect(res.arbitratedRecommendation).toContain('COHERENCE FUSION');
  });
});
