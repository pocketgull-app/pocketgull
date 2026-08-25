import { describe, it, expect } from 'vitest';
import { REPELLENT_DATABASE, REPELLENT_MYTHS_FACTS } from '../src/data/repellent-guide.js';

describe('Repellent Guide & Active Ingredients', () => {
  it('1. Segregates Zone 1 (Fabric / Permethrin) from Zone 2 (Skin / Picaridin, PMD, DEET)', () => {
    const zone1 = REPELLENT_DATABASE.filter(r => r.targetZone.includes('Zone 1'));
    const zone2 = REPELLENT_DATABASE.filter(r => r.targetZone.includes('Zone 2'));

    expect(zone1.length).toBe(1);
    expect(zone1[0].id).toBe('permethrin-fabric');
    expect(zone2.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Enforces EPA certification for all primary active ingredients', () => {
    for (const repellent of REPELLENT_DATABASE) {
      expect(repellent.epaCertified).toBe(true);
      expect(repellent.proTips.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('3. Debunks the essential oil trap and 2-in-1 sunscreen myth', () => {
    const essentialOilMyth = REPELLENT_MYTHS_FACTS.find(m => m.myth.includes('essential oil'));
    const sunscreenMyth = REPELLENT_MYTHS_FACTS.find(m => m.myth.includes('Sunscreen and insect repellent'));

    expect(essentialOilMyth?.verdict).toContain('Dangerous');
    expect(sunscreenMyth?.verdict).toContain('Dangerous');
  });
});
