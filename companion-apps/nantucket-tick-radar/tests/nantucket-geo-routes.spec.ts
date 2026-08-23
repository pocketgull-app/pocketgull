import { describe, it, expect } from 'vitest';
import {
  calculateDistanceMiles,
  computeHospitalTransitStats,
  NANTUCKET_LOCATIONS,
  SAFE_CORRIDOR_ROUTES
} from '../src/data/nantucket-geo.js';
import { NantucketMapEngine } from '../src/engine/nantucket-map-engine.js';

describe('Nantucket Geographic & Eco-Routing Engine', () => {
  it('should accurately compute distance in miles between Nantucket landmarks', () => {
    // Town to 'Sconset Bluff (~7.3 miles)
    const distTownSconset = calculateDistanceMiles(41.2835, -70.0995, 41.2642, -69.9615);
    expect(distTownSconset).toBeGreaterThan(6.5);
    expect(distTownSconset).toBeLessThan(8.0);

    // Sanford Farm to NCH Hospital (~3.2 miles)
    const distSanfordNch = calculateDistanceMiles(41.2662, -70.1585, 41.2721, -70.0984);
    expect(distSanfordNch).toBeGreaterThan(2.5);
    expect(distSanfordNch).toBeLessThan(4.0);
  });

  it('should compute STAT emergency hospital transit parameters', () => {
    // From Squam Swamp to NCH Hospital
    const transit = computeHospitalTransitStats(41.3128, -69.9982);
    expect(transit.hospitalName).toContain('Nantucket Cottage Hospital');
    expect(transit.distanceMiles).toBeGreaterThan(5.0);
    expect(transit.drivingMinutes).toBeGreaterThan(10);
    expect(transit.bikingMinutes).toBeGreaterThan(20);
    expect(transit.googleMapsDirectionsUrl).toContain('google.com/maps/dir');
  });

  it('should manage map layer states and vector coordinate projection in NantucketMapEngine', () => {
    const engine = new NantucketMapEngine();
    
    // Initial layers
    const layers = engine.getLayers();
    expect(layers.showRiskHeatmap).toBe(true);
    expect(layers.showSafeCorridors).toBe(true);

    // Toggle layer
    engine.setLayer('showRiskHeatmap', false);
    expect(engine.getLayers().showRiskHeatmap).toBe(false);

    // Active location
    engine.setActiveLocation('squam-swamp');
    expect(engine.getActiveLocation().name).toContain('Squam Swamp');

    // SVG projection
    const centerProj = engine.projectToSvg(41.2835, -70.0995);
    expect(centerProj.x).toBeGreaterThan(0);
    expect(centerProj.x).toBeLessThan(900);
    expect(centerProj.y).toBeGreaterThan(0);
    expect(centerProj.y).toBeLessThan(500);
  });

  it('should ensure all safe corridor routes meet strict safety score bounds', () => {
    expect(SAFE_CORRIDOR_ROUTES.length).toBeGreaterThanOrEqual(5);

    SAFE_CORRIDOR_ROUTES.forEach(route => {
      expect(route.distanceMiles).toBeGreaterThan(0);
      expect(route.tickExposureScore).toBeGreaterThanOrEqual(0);
      expect(route.tickExposureScore).toBeLessThanOrEqual(10);
      expect(route.waypointCoordinates.length).toBeGreaterThanOrEqual(2);

      if (route.isPavedCorridor) {
        expect(route.tickExposureScore).toBeLessThanOrEqual(2.0);
      } else {
        expect(route.tickExposureScore).toBeGreaterThanOrEqual(5.0);
      }
    });
  });
});
