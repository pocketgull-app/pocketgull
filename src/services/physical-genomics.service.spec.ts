import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicalGenomicsService } from './physical-genomics.service';

describe('PhysicalGenomicsService', () => {
  let service: PhysicalGenomicsService;

  beforeEach(() => {
    service = new PhysicalGenomicsService();
  });

  describe('1. 3D Chromatin Loop Extrusion & Hi-C Matrix', () => {
    it('simulates cohesin loop extrusion and generates populated contact matrix', () => {
      const result = service.simulateLoopExtrusion(2000, 1.0, 0.20, undefined, 32);

      expect(result).toBeDefined();
      expect(result.locusLengthKb).toBe(2000);
      expect(result.contactMatrixDim).toBe(32);
      expect(result.contactMatrixFlat.length).toBe(32 * 32);
      expect(result.tadInsulationScore).toBeGreaterThan(0.5);
      expect(result.fractalGlobuleScalingGamma).toBeCloseTo(1.08, 2);
      // Diagonal elements should be 1.0
      expect(result.contactMatrixFlat[0]).toBe(1.0);
      expect(result.contactMatrixFlat[32 * 10 + 10]).toBe(1.0);
    });

    it('attenuates contact frequencies across strict CTCF barriers', () => {
      const strictBarriers = [
        { positionKb: 1000, orientation: 'FORWARD' as const, bindingAffinityScore: 1.0 }
      ];
      const lowPermeability = service.simulateLoopExtrusion(2000, 1.0, 0.05, strictBarriers, 32);
      const highPermeability = service.simulateLoopExtrusion(2000, 1.0, 0.90, strictBarriers, 32);

      // Contact across the barrier (bin 5 to bin 25) should be lower under strict insulation
      const binI = 5;
      const binJ = 25;
      const contactStrict = lowPermeability.contactMatrixFlat[binI * 32 + binJ];
      const contactLeaky = highPermeability.contactMatrixFlat[binI * 32 + binJ];

      expect(contactStrict).toBeLessThan(contactLeaky);
      expect(lowPermeability.tadInsulationScore).toBeGreaterThan(highPermeability.tadInsulationScore);
    });
  });

  describe('2. Super-Enhancer Transcriptional Condensates (LLPS)', () => {
    it('forms dynamic liquid droplets when coactivator concentration exceeds phase threshold', () => {
      const result = service.computeSuperEnhancerCondensate(5.0, 4.0, 2.0, 120.0);

      expect(result.isCondensateFormed).toBe(true);
      expect(result.dropletRadiusNm).toBeGreaterThan(150);
      expect(result.polIiEnrichmentFold).toBeGreaterThan(5.0);
      expect(result.transcriptionalBurstFrequencyPerHour).toBeGreaterThan(10.0);
      expect(result.condensateStabilityVerdict).toBe('DYNAMIC_LIQUID_CONDENSATE');
    });

    it('identifies sub-critical diffuse state when below critical threshold', () => {
      const result = service.computeSuperEnhancerCondensate(1.0, 1.0, 0.5, 50.0);

      expect(result.isCondensateFormed).toBe(false);
      expect(result.dropletRadiusNm).toBe(0);
      expect(result.polIiEnrichmentFold).toBe(1.0);
      expect(result.condensateStabilityVerdict).toBe('SUB_CRITICAL_DIFFUSE');
    });
  });

  describe('3. CRISPR-Cas Mechanical R-Loop Energetics & Off-Target Falsification', () => {
    it('evaluates perfect on-target guide RNA with high cleavage probability and zero mismatches', () => {
      const guide = 'GACUUGACAGUCUACGAUCG';
      const target = 'GACTTGACAGTCTACGATCG';
      const result = service.evaluateCrisprMechanicalRLoop(guide, target, 'NGG', -0.06);

      expect(result.seedMismatchCount).toBe(0);
      expect(result.totalMismatchesCount).toBe(0);
      expect(result.rLoopCompletionFraction).toBe(1.0);
      expect(result.offTargetCleavageProbability).toBeGreaterThan(0.95);
      expect(result.kineticProofreadingPassed).toBe(true);
      expect(result.cleavageFalsificationVerdict).toBe('ON_TARGET_OPTIMAL');
      expect(result.energyProfile.length).toBe(20);
    });

    it('rejects seed-region mismatches with high energetic barrier', () => {
      const guide = 'GACUUGACAGUCUACGAUCG';
      // Mismatch at PAM-proximal seed position (last 2 bases of target)
      const mutatedTarget = 'GACTTGACAGTCTACGATAA';
      const result = service.evaluateCrisprMechanicalRLoop(guide, mutatedTarget, 'NGG', -0.06);

      expect(result.seedMismatchCount).toBeGreaterThan(0);
      expect(result.kineticProofreadingPassed).toBe(false);
      expect(result.offTargetCleavageProbability).toBeLessThan(0.05);
      expect(result.cleavageFalsificationVerdict).toBe('SEED_REJECTED_SAFE');
    });
  });

  describe('4. Nucleosome Force Spectroscopy & Epigenetics', () => {
    it('exhibits lower mechanical rupture barrier under hyperacetylation (H3K27ac)', () => {
      const acetylated = service.simulateNucleosomeForceSpectroscopy('HYPERACETYLATED_H3K27AC', 150.0);
      const heterochromatin = service.simulateNucleosomeForceSpectroscopy('HETEROCHROMATIN_H3K9ME3', 150.0);

      expect(acetylated.innerCoreRuptureForcePn).toBeLessThan(heterochromatin.innerCoreRuptureForcePn);
      expect(acetylated.chromatinAccessibilityPercent).toBeGreaterThan(heterochromatin.chromatinAccessibilityPercent);
      expect(acetylated.forceExtensionCurve.length).toBe(36);
    });
  });

  describe('5. Nuclear Lamina & LINC Mechanotransduction', () => {
    it('predicts elevated YAP/TAZ nuclear translocation on stiff fibrotic ECM', () => {
      const soft = service.evaluateLincMechanotransduction(1.0, 0.5);
      const stiff = service.evaluateLincMechanotransduction(35.0, 8.0);

      expect(stiff.yapTazNuclearToCytoplasmicRatio).toBeGreaterThan(soft.yapTazNuclearToCytoplasmicRatio);
      expect(stiff.nuclearAspectRatio).toBeLessThan(soft.nuclearAspectRatio);
      expect(stiff.transcriptionalMechanostate).toBe('STIFF_PRO_FIBROTIC_ONCOGENIC');
      expect(soft.transcriptionalMechanostate).toBe('SOFT_QUIESCENT');
    });
  });
});
