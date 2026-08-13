import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { LateralThinkingHealthEngineService } from './lateral-thinking-health.service';

describe('LateralThinkingHealthEngineService (Pivot & Pulse Lateral Thinking for Health)', () => {
  let service: LateralThinkingHealthEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [LateralThinkingHealthEngineService]
    });
    service = runInInjectionContext(injector, () => injector.get(LateralThinkingHealthEngineService));
  });

  it('1. Initializes default Oblique Strategy cards and Edward de Bono Six Thinking Hats', () => {
    expect(service.cards().length).toBe(3);
    expect(service.sixHats().length).toBe(6);
    expect(service.sixHats()[0].hatColor).toBe('WHITE');
  });

  it('2. Draws a random lateral thinking strategy card for creative health problem solving', () => {
    const card = service.drawRandomStrategyCard();
    expect(card).toBeDefined();
    expect(card.strategyTitle).toBeDefined();
  });
});
