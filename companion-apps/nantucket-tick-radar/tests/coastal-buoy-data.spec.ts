import { describe, it, expect } from 'vitest';
import { COASTAL_BUOY_STATIONS } from '../src/data/coastal-buoy-data.js';
import { computeIslandDesiccationIndex } from '../src/data/island-weather.js';

describe('NOAA & NERACOOS Coastal Buoy Telemetry Suite', () => {
  it('should define all 4 critical offshore buoy stations', () => {
    expect(COASTAL_BUOY_STATIONS.length).toBe(4);
    const stationIds = COASTAL_BUOY_STATIONS.map(b => b.id);
    expect(stationIds).toContain('buoy-44020');
    expect(stationIds).toContain('buoy-44008');
    expect(stationIds).toContain('buoy-8449130');
    expect(stationIds).toContain('buoy-44017');
  });

  it('should provide valid oceanographic coordinates and telemetry ranges for Station 44020', () => {
    const buoyM = COASTAL_BUOY_STATIONS.find(b => b.id === 'buoy-44020')!;
    expect(buoyM).toBeDefined();
    expect(buoyM.coordinates[0]).toBeGreaterThan(41.0);
    expect(buoyM.coordinates[1]).toBeLessThan(-70.0);
    expect(buoyM.waterTempF).toBeGreaterThan(50);
    expect(buoyM.waterTempF).toBeLessThan(80);
    expect(buoyM.relativeHumidityPercent).toBeGreaterThanOrEqual(80); // Marine layer fog
    expect(buoyM.waveHeightFt).toBeGreaterThan(0);
  });

  it('should compute elevated tick questing risk when buoy humidity exceeds 85%', () => {
    const buoyM = COASTAL_BUOY_STATIONS.find(b => b.id === 'buoy-44020')!;
    const analysis = computeIslandDesiccationIndex(
      Math.round(buoyM.airTempF),
      buoyM.relativeHumidityPercent,
      Math.round(buoyM.windSpeedKnots)
    );

    // High humidity (>90%) with mild wind should produce high questing risk
    expect(analysis.relativeHumidityPercent).toBe(91);
    expect(analysis.vaporPressureDeficitKpa).toBeLessThan(0.6); // Low VPD indicates low drying power
    expect(analysis.tickQuestingRiskIndex).toBeGreaterThanOrEqual(60);
    expect(['Extreme Questing', 'Moderate Questing']).toContain(analysis.riskTier);
  });

  it('should provide valid NOAA URLs and distance descriptions for all buoys', () => {
    COASTAL_BUOY_STATIONS.forEach(buoy => {
      expect(buoy.noaaUrl).toMatch(/^https:\/\/(www\.ndbc\.noaa\.gov|tidesandcurrents\.noaa\.gov)/);
      expect(buoy.distanceFromIsland.length).toBeGreaterThan(5);
      expect(buoy.tickEcologyImpact.length).toBeGreaterThan(20);
      expect(buoy.ferryCrossingAdvice.length).toBeGreaterThan(15);
    });
  });
});
