import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { SocraticRoundsService } from './socratic-rounds.service';

describe('SocraticRoundsService Multi-Agent CDS Suite', () => {
  let service: SocraticRoundsService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [SocraticRoundsService]
    });
    service = runInInjectionContext(injector, () => injector.get(SocraticRoundsService));
  });

  it('should initialize with active debate messages and consensus tier', () => {
    expect(service.debateMessages().length).toBeGreaterThanOrEqual(3);
    expect(service.consensusScore()).toBeGreaterThan(0.5);
    expect(service.consensusTier().label).toBe('Active Clinical Debate');
  });

  it('should advance debate rounds with Dr. Skeptic and Dr. Pragmatist rebuttals', () => {
    const initialCount = service.debateMessages().length;
    service.advanceDebateRound('Patient also reports morning knee stiffness');

    const updated = service.debateMessages();
    expect(updated.length).toBe(initialCount + 3); // User directive + Dr. Skeptic + Dr. Pragmatist
    expect(updated[updated.length - 2].speaker).toBe('dr_skeptic');
    expect(updated[updated.length - 1].speaker).toBe('dr_pragmatist');
    expect(service.currentTurn()).toBe(1);
  });

  it('should maintain Popperian null hypothesis p-values in differential rankings', () => {
    const rankings = service.differentialRankings();
    expect(rankings.length).toBeGreaterThanOrEqual(3);
    for (const r of rankings) {
      expect(r.pValueNullHypothesis).toBeGreaterThan(0);
      expect(r.likelihoodRatio).toBeGreaterThan(0);
    }
  });

  it('should reset rounds state correctly', () => {
    service.advanceDebateRound('Test query');
    expect(service.currentTurn()).toBe(1);
    service.resetRounds();
    expect(service.currentTurn()).toBe(0);
    expect(service.consensusScore()).toBe(0.74);
  });
});
