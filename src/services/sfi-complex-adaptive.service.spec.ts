// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { TestBed } from '@angular/core/testing';
import { SfiComplexAdaptiveService } from './sfi-complex-adaptive.service';

describe('SfiComplexAdaptiveService (Santa Fe Institute CAS Engine)', () => {
  let service: SfiComplexAdaptiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SfiComplexAdaptiveService]
    });
    service = TestBed.inject(SfiComplexAdaptiveService);
  });

  describe('Critical Slowing Down (CSD) Early Warning Signals', () => {
    it('should identify STABLE_HOMEOSTASIS for rapidly recovering perturbations', () => {
      // White noise / alternating perturbations around mean 70
      const stableSeries = [70, 72, 69, 71, 70, 72, 69, 70, 71, 69];
      const metrics = service.computeCriticalSlowingDown(stableSeries);

      expect(metrics.lag1Autocorrelation).toBeLessThan(0.40);
      expect(metrics.warningLevel).toBe('STABLE_HOMEOSTASIS');
      expect(metrics.tippingProbability).toBeLessThan(0.50);
      expect(metrics.recoveryRateLambda).toBeGreaterThan(0.5);
    });

    it('should detect CRITICAL_BIFURCATION_IMMINENT when lag-1 autocorrelation approaches 1.0', () => {
      // Strongly persistent, sluggish autoregressive series (sluggish recovery)
      const sluggishSeries = [60, 63, 67, 71, 76, 80, 85, 89, 94, 98, 102];
      const metrics = service.computeCriticalSlowingDown(sluggishSeries);

      expect(metrics.lag1Autocorrelation).toBeGreaterThanOrEqual(0.70);
      expect(metrics.warningLevel).toBe('CRITICAL_BIFURCATION_IMMINENT');
      expect(metrics.tippingProbability).toBeGreaterThanOrEqual(0.60);
    });

    it('should gracefully handle small series with safe default bounds', () => {
      const metrics = service.computeCriticalSlowingDown([72, 73]);
      expect(metrics.warningLevel).toBe('STABLE_HOMEOSTASIS');
      expect(metrics.lag1Autocorrelation).toBe(0.0);
    });
  });

  describe('West-Brown-Enquist (WBE) Fractal Allometric Scaling', () => {
    it('should return exact 1.0 dosage factor for 70 kg reference human baseline', () => {
      const res = service.computeWbeAllometricScaling(70.0, 70.0);

      expect(res.bodyMassKg).toBe(70.0);
      expect(res.basalMetabolicRateWatts).toBeCloseTo(70.0, 1);
      expect(res.wbeRecommendedDosageFactor).toBeCloseTo(1.0, 3);
      expect(res.allometricClearanceRatio).toBeCloseTo(1.0, 3);
    });

    it('should apply sub-linear WBE scaling to prevent overdosing in 140 kg patients', () => {
      const res = service.computeWbeAllometricScaling(140.0, 70.0);

      // (140/70)^(-0.25) = 2^(-0.25) ~ 0.8409
      expect(res.wbeRecommendedDosageFactor).toBeCloseTo(0.8409, 2);
      expect(res.wbeRecommendedDosageFactor).toBeLessThan(1.0);
    });

    it('should apply elevated WBE scaling to prevent under-dosing in 35 kg pediatric patients', () => {
      const res = service.computeWbeAllometricScaling(35.0, 70.0);

      // (35/70)^(-0.25) = 0.5^(-0.25) ~ 1.1892
      expect(res.wbeRecommendedDosageFactor).toBeCloseTo(1.1892, 2);
      expect(res.wbeRecommendedDosageFactor).toBeGreaterThan(1.0);
    });
  });

  describe('Attractor Landscape & Phase-Space Topology', () => {
    it('should classify shallow saddle potential as CRITICAL_TRANSITION_ZONE', () => {
      // Control parameter mu = 1.0, stateCoordinate = 0.5 -> curvature = -1 + 3*(0.25) = -0.25 < 0.2
      const basin = service.classifyAttractorLandscape(0.5, 1.0);

      expect(basin.currentBasin).toBe('CRITICAL_TRANSITION_ZONE');
      expect(basin.curvatureNabla2V).toBeLessThan(0.2);
      expect(basin.clinicalDirective).toContain('shallow saddle region');
    });

    it('should classify high-entropy state as ALLOSTATIC_INFLAMMATORY_SINK', () => {
      const basin = service.classifyAttractorLandscape(1.2, 1.0);

      expect(basin.currentBasin).toBe('ALLOSTATIC_INFLAMMATORY_SINK');
      expect(basin.clinicalDirective).toContain('allostatic inflammatory attractor');
    });

    it('should classify equilibrium center as HOMEOSTATIC_BASIN', () => {
      const basin = service.classifyAttractorLandscape(-1.0, 1.0);

      expect(basin.currentBasin).toBe('HOMEOSTATIC_BASIN');
      expect(basin.clinicalDirective).toContain('resilient restoring force');
    });
  });

  describe('Angular Reactive Signal Integration', () => {
    it('should dynamically update currentReport computed signal when inputs update', () => {
      const initialReport = service.currentReport();
      expect(initialReport.csd).toBeDefined();
      expect(initialReport.sfiTheoreticalCitation).toContain('Santa Fe Institute');

      // Update weight
      service.patientBodyMassKg.set(120.0);
      const updatedReport = service.currentReport();
      expect(updatedReport.allometry.bodyMassKg).toBe(120.0);
      expect(updatedReport.allometry.wbeRecommendedDosageFactor).toBeLessThan(1.0);
    });
  });
});
