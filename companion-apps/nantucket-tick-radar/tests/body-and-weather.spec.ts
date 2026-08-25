import { describe, it, expect } from 'vitest';
import { computeIslandDesiccationIndex, ISLAND_WEATHER_PRESETS } from '../src/data/island-weather.js';
import { getEngorgementStageForHours, ENGORGEMENT_STAGES } from '../src/engine/engorgement-visualizer.js';
import { BODY_INSPECTION_ZONES } from '../src/data/body-inspection-zones.js';
import { FerryKitStore, DEFAULT_FERRY_KIT_ITEMS } from '../src/engine/ferry-kit-planner.js';

describe('Body Hotspots, Desiccation Weather & Engorgement Engines', () => {
  it('1. Verifies 360-degree body inspection zones contain all 7 critical areas', () => {
    expect(BODY_INSPECTION_ZONES.length).toBe(7);
    const ids = BODY_INSPECTION_ZONES.map(z => z.id);
    expect(ids).toContain('zone-hairline');
    expect(ids).toContain('zone-underarms');
    expect(ids).toContain('zone-beltline');
    expect(ids).toContain('zone-behind-knees');
    expect(ids).toContain('zone-ankles');
  });

  it('2. Computes biological Vapor Pressure Deficit and Questing Risk accurately', () => {
    // Damp morning fog -> High questing
    const fog = computeIslandDesiccationIndex(68, 92, 4);
    expect(fog.vaporPressureDeficitKpa).toBeLessThan(0.5);
    expect(fog.tickQuestingRiskIndex).toBeGreaterThan(65);
    expect(fog.riskTier).toBe('Extreme Questing');

    // Sunny breezy afternoon -> Lethal desiccation
    const sunny = computeIslandDesiccationIndex(78, 52, 16);
    expect(sunny.vaporPressureDeficitKpa).toBeGreaterThan(1.0);
    expect(sunny.tickQuestingRiskIndex).toBeLessThan(45);
  });

  it('3. Validates Optical Engorgement stages match IDSA clinical thresholds', () => {
    const stage0 = getEngorgementStageForHours(4);
    expect(stage0.everydayObjectComparison).toBe('Poppy Seed');
    expect(stage0.doxycyclineIndicated).toBe(false);

    const stage36 = getEngorgementStageForHours(38);
    expect(stage36.everydayObjectComparison).toBe('Small Lentil');
    expect(stage36.doxycyclineIndicated).toBe(true);
    expect(stage36.ospSwitchState).toBe('Midgut Breakthrough');

    const stage72 = getEngorgementStageForHours(80);
    expect(stage72.everydayObjectComparison).toContain('Raisin');
    expect(stage72.transmissionRiskPercent).toBeGreaterThan(80);
  });

  it('4. Verifies Ferry Kit Store manages packing completion status', () => {
    const store = new FerryKitStore();
    const stats = store.getCompletionStats();
    expect(stats.total).toBeGreaterThanOrEqual(8);
    expect(stats.essentialTotal).toBeGreaterThan(0);
  });
});
