import { describe, it, expect } from 'vitest';
import { SEVEN_GEN_TIMELINE, ISLAND_ADVENTURE_QUESTS } from '../src/data/seven-generations.js';

describe('Seven Generations & Island Adventures Module', () => {
  it('1. Contains full 7-generation timeline eras from past sheep commons to future fulfilled stewardship', () => {
    expect(SEVEN_GEN_TIMELINE.length).toBe(5);
    expect(SEVEN_GEN_TIMELINE[0].eraLabel).toContain('Generation -3');
    expect(SEVEN_GEN_TIMELINE[2].eraLabel).toContain('Generation 0');
    expect(SEVEN_GEN_TIMELINE[4].eraLabel).toContain('Seven Generations Fulfilled');
  });

  it('2. Provides 5 high-fun, tick-safe island adventure quests with zero or near-zero risk', () => {
    expect(ISLAND_ADVENTURE_QUESTS.length).toBe(5);
    for (const quest of ISLAND_ADVENTURE_QUESTS) {
      expect(quest.tickRisk).toMatch(/Zero|Low/);
      expect(quest.adventureTips.length).toBeGreaterThanOrEqual(3);
      expect(quest.sevenGenWisdom.length).toBeGreaterThan(10);
    }
  });
});
