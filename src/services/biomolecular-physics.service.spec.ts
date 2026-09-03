import { describe, it, expect, beforeEach } from 'vitest';
import { BiomolecularPhysicsService } from './biomolecular-physics.service';

describe('BiomolecularPhysicsService', () => {
  let service: BiomolecularPhysicsService;

  beforeEach(() => {
    service = new BiomolecularPhysicsService();
  });

  describe('1. Biomolecular Condensates & LLPS (Cahn-Hilliard)', () => {
    it('should initialize a valid 2D concentration grid bounded in [0.01, 0.99]', () => {
      const grid = service.createLlpsGrid(32, 32, 0.4, 0.05);
      expect(grid.length).toBe(32 * 32);
      for (let i = 0; i < grid.length; i++) {
        expect(grid[i]).toBeGreaterThanOrEqual(0.01);
        expect(grid[i]).toBeLessThanOrEqual(0.99);
      }
    });

    it('should perform a conservative Cahn-Hilliard time step without NaN/inf', () => {
      const grid = service.createLlpsGrid(16, 16, 0.45);
      const nextGrid = service.stepCahnHilliard(grid, 16, 16, 2.4, 0.005, 0.1, 1.0);
      expect(nextGrid.length).toBe(grid.length);
      for (let i = 0; i < nextGrid.length; i++) {
        expect(Number.isNaN(nextGrid[i])).toBe(false);
        expect(Number.isFinite(nextGrid[i])).toBe(true);
      }
    });

    it('should calculate physical LLPS metrics and gelation risk score', () => {
      const grid = service.createLlpsGrid(16, 16, 0.5);
      const metrics = service.analyzeLlpsState(grid, 2.5, 310.15, 10.0);
      expect(metrics.chi).toBe(2.5);
      expect(metrics.dropletCount).toBeGreaterThan(0);
      expect(metrics.gelationRiskScore).toBeGreaterThanOrEqual(0);
      expect(metrics.gelationRiskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('2. Targeted Protein Degradation (PROTAC Hook Effect)', () => {
    it('should calculate 3-body equilibrium and exhibit the Hook Effect at high doses', () => {
      // At low/optimal dose (50 nM), ternary complex is formed
      const optimal = service.computeProtacEquilibrium(100, 100, 50, 50, 100, 5.0);
      expect(optimal.ternaryComplexNm).toBeGreaterThan(0);
      expect(optimal.hookEffectActive).toBe(false);

      // At extreme overdosing (5,000 nM), binary complexes dominate and suppress ternary complex (Hook Effect)
      const overdosed = service.computeProtacEquilibrium(100, 100, 5000, 50, 100, 5.0);
      expect(overdosed.hookEffectActive).toBe(true);
      expect(overdosed.ternaryComplexNm).toBeLessThan(optimal.ternaryComplexNm);
    });

    it('should generate a 41-point dose curve with bell-shaped ternary profile', () => {
      const curve = service.generateProtacDoseCurve(100, 100, 50, 100, 5.0);
      expect(curve.length).toBe(41);
      expect(curve[0].protacConcentrationNm).toBeCloseTo(0.001, 3);
      expect(curve[40].protacConcentrationNm).toBeCloseTo(10000, 0);

      // Verify peak ternary complex is intermediate (not at extremes)
      const ternaryValues = curve.map(c => c.ternaryComplexNm);
      const maxVal = Math.max(...ternaryValues);
      const maxIdx = ternaryValues.indexOf(maxVal);
      expect(maxIdx).toBeGreaterThan(5);
      expect(maxIdx).toBeLessThan(35);
    });
  });

  describe('3. Quantum Cryptochrome Radical Pair Spin Dynamics', () => {
    it('should compute valid singlet/triplet yields summing to ~1.0', () => {
      const state = service.simulateRadicalPairSpin(50, 45, 2.8, 0, 0);
      expect(state.geomagneticFieldMicroTesla).toBe(50);
      expect(state.singletYieldPhiS).toBeGreaterThan(0);
      expect(state.tripletYieldPhiT).toBeGreaterThan(0);
      expect(state.singletYieldPhiS + state.tripletYieldPhiT).toBeCloseTo(1.0, 3);
      expect(state.quantumCoherenceTimeNs).toBeGreaterThan(0);
    });

    it('should show RF interference decoheres coherence lifetime and disrupts yields', () => {
      const baseline = service.simulateRadicalPairSpin(50, 45, 2.8, 0, 0);
      const disturbed = service.simulateRadicalPairSpin(50, 45, 2.8, 1.4, 15.0);
      expect(disturbed.quantumCoherenceTimeNs).toBeLessThan(baseline.quantumCoherenceTimeNs);
    });
  });

  describe('4. Reticular MOF Adsorption Isotherms', () => {
    it('should compute non-negative water harvesting yield for MOF-303', () => {
      const mof30 = service.computeMofAdsorption(30, 298.15, 0.55, 358.15);
      expect(mof30.adsorptionLoadingGramsPerGram).toBeGreaterThan(0);
      expect(mof30.dailyWaterYieldLitersPerKg).toBeGreaterThan(0);
      expect(mof30.knudsenDiffusivityM2PerSec).toBeGreaterThan(0);
    });

    it('should produce higher loading at 80% RH than at 10% RH', () => {
      const mof10 = service.computeMofAdsorption(10, 298.15, 0.55, 358.15);
      const mof80 = service.computeMofAdsorption(80, 298.15, 0.55, 358.15);
      expect(mof80.adsorptionLoadingGramsPerGram).toBeGreaterThan(mof10.adsorptionLoadingGramsPerGram);
    });
  });

  describe('5. Cannabinoid Cytoskeletal Microtubule Stabilization', () => {
    it('should return all 6 structured cannabinoid profiles', () => {
      const profiles = service.getCannabinoidProfiles();
      expect(profiles.length).toBe(6);
      const compounds = profiles.map(p => p.compound);
      expect(compounds).toContain('THC');
      expect(compounds).toContain('CBD');
      expect(compounds).toContain('CBG');
      expect(compounds).toContain('CBN');
      expect(compounds).toContain('CARYOPHYLLENE');
      expect(compounds).toContain('ANANDAMIDE_2AG');
    });

    it('should simulate Δ9-THC dose-dependent Lys40 acetylation and catastrophe reduction', () => {
      const sim = service.simulateMicrotubuleDynamics('THC', 2.5);
      expect(sim.compound).toBe('THC');
      expect(sim.doseMicroMolar).toBe(2.5);
      expect(sim.acetylationLys40Ratio).toBeGreaterThan(1.2);
      expect(sim.catastropheRatePerMin).toBeLessThan(0.85);
      expect(sim.axonalTransportVelocityUmPerSec).toBeGreaterThan(1.0);
      expect(sim.stabilityVerdict).toBe('HIGHLY_STABILIZED');
    });

    it('should simulate CBD with high Lys40 acetylation and Tau bundling preservation', () => {
      const sim = service.simulateMicrotubuleDynamics('CBD', 5.0);
      expect(sim.compound).toBe('CBD');
      expect(sim.acetylationLys40Ratio).toBeGreaterThan(1.4);
      expect(sim.tauBundlingIntegrityPct).toBeGreaterThan(60);
      expect(sim.gsk3BetaInactivationPct).toBeGreaterThan(40);
    });

    it('should detect supra-physiological saturation at extreme doses (>16 μM)', () => {
      const sim = service.simulateMicrotubuleDynamics('THC', 18.0);
      expect(sim.stabilityVerdict).toBe('SUPRA_PHYSIOLOGICAL_SATURATION');
    });
  });
});

