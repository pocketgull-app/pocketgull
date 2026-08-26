import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DyadicCoRegulationService } from './dyadic-co-regulation.service';

describe('DyadicCoRegulationService', () => {
  let service: DyadicCoRegulationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DyadicCoRegulationService]
    });
    service = TestBed.inject(DyadicCoRegulationService);
  });

  it('should initialize with dual-participant baseline telemetry', () => {
    expect(service.isPaired()).toBe(true);
    expect(service.dyadicCoherenceIndex()).toBeGreaterThanOrEqual(40);
    expect(service.harmonyState()).toBe('High Entrainment');
  });

  it('should reflect harmony state changes', () => {
    service.dyadicCoherenceIndex.set(65);
    expect(service.harmonyState()).toBe('Synchronizing');

    service.dyadicCoherenceIndex.set(75);
    expect(service.harmonyState()).toBe('Resonant Coherence');
  });
});
