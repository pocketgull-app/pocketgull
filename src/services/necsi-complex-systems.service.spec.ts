// SPDX-License-Identifier: Apache-2.0
import { TestBed } from '@angular/core/testing';
import { NecsiComplexSystemsService } from './necsi-complex-systems.service';

describe('NecsiComplexSystemsService (NECSI Complexity & Resilience Suite)', () => {
  let service: NecsiComplexSystemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NecsiComplexSystemsService]
    });
    service = TestBed.inject(NecsiComplexSystemsService);
  });

  it('1. Detects Critical Slowing Down (rising lag-1 autocorrelation rho_1 >= 0.70 and vanishing recovery rate lambda) prior to clinical tipping points', () => {
    // Smooth, sluggishly recovering autonomic trajectory (high AR(1) memory)
    const slowingDownSeries = [
      72, 74, 76, 79, 82, 85, 88, 91, 94, 96,
      98, 100, 102, 104, 105, 107, 108, 110, 111, 112
    ];

    const report = service.evaluateCriticalSlowingDown('heart_rate', slowingDownSeries);

    expect(report.sampleCount).toBe(20);
    expect(report.lag1AutocorrelationRho1).toBeGreaterThanOrEqual(0.75);
    expect(report.recoveryRateLambda).toBeLessThan(0.30);
    expect(report.isApproachingTippingPoint).toBe(true);
    expect(report.isNullFalsified).toBe(true);
    expect(report.pValue).toBeLessThan(0.05);
    expect(report.recommendedTrajectoryAct).toBe('ACT_I_DAYS_0_30_METABOLIC_BRIDGE');
    expect(report.epistemicBadge).toBe('[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]');
    expect(report.fdaPart11IntegrityDigest).toMatch(/^fnv1a-part11-necsi-[0-9a-f]{8}$/);
    expect(service.isResilienceWarningActive()).toBe(true);
  });

  it('2. Retains Popperian null hypothesis H_0 for fast-recovering homeostatic oscillations (low/negative lag-1 autocorrelation)', () => {
    // Fast alternating homeostatic recovery around 70 bpm
    const resilientSeries = [
      70, 68, 72, 69, 71, 68, 72, 69, 71, 68,
      72, 69, 71, 68, 72, 69, 71, 68, 72, 70
    ];

    const report = service.evaluateCriticalSlowingDown('heart_rate', resilientSeries);

    expect(report.lag1AutocorrelationRho1).toBeLessThan(0.20);
    expect(report.isApproachingTippingPoint).toBe(false);
    expect(report.isNullFalsified).toBe(false);
    expect(report.recommendedTrajectoryAct).toBe('ACT_III_MONTHS_6_PLUS_STEPPED_CARE_RESILIENCE');
    expect(service.isResilienceWarningActive()).toBe(false);
  });

  it('3. Evaluates Bar-Yam Multiscale Variety Matching (Ashby Law across 4 scales) and flags fine-scale bottlenecks', () => {
    const bottleneckProfile = service.evaluateMultiscaleVariety({
      subsecondAutonomicDemandBits: 9.5, // Exceeds default 8.0-bit local biofeedback capacity
      householdDailyDemandBits: 5.0,
      outpatientClinicalDemandBits: 4.0,
      tertiaryEmergencyDemandBits: 1.5
    });

    expect(bottleneckProfile.hasScaleMismatchBottleneck).toBe(true);
    expect(bottleneckProfile.bottleneckScale).toBe('SCALE_1_SUBSECOND_AUTONOMIC_BIOFEEDBACK');
    expect(bottleneckProfile.recommendedRoutingScale).toBe('SCALE_1_SUBSECOND_AUTONOMIC_BIOFEEDBACK');
    expect(bottleneckProfile.multiscaleComplexityIntegral).toBe(20.0);

    // Verify STAT escalation overrides when tertiary emergency demand >= 7.0 bits
    const emergencyProfile = service.evaluateMultiscaleVariety({
      subsecondAutonomicDemandBits: 4.0,
      householdDailyDemandBits: 4.0,
      outpatientClinicalDemandBits: 4.0,
      tertiaryEmergencyDemandBits: 8.5
    });
    expect(emergencyProfile.recommendedRoutingScale).toBe('SCALE_4_TERTIARY_EMERGENCY_ESCALATION');
  });

  it('4. Computes percolation threshold p_c and prescribes bounded (<= 4) orthogonal firebreak exams during hub cascades', () => {
    const network = [
      {
        nodeId: 'SIBI_PERIODONTAL_HUB',
        domainName: 'Oral-Systemic Inflammatory Burden',
        localPerturbationScore: 0.88,
        adjacentNodeIds: ['ENDOTHELIAL_VASCULAR', 'HBA1C_GLYCEMIC', 'HPA_CORTISOL', 'VAGAL_TONE']
      },
      {
        nodeId: 'ENDOTHELIAL_VASCULAR',
        domainName: 'Endothelial Nitric Oxide & Vascular Tone',
        localPerturbationScore: 0.72,
        adjacentNodeIds: ['SIBI_PERIODONTAL_HUB', 'HBA1C_GLYCEMIC', 'VAGAL_TONE']
      },
      {
        nodeId: 'HBA1C_GLYCEMIC',
        domainName: 'Metabolic Glycemic Trajectory',
        localPerturbationScore: 0.65,
        adjacentNodeIds: ['SIBI_PERIODONTAL_HUB', 'ENDOTHELIAL_VASCULAR', 'HPA_CORTISOL']
      },
      {
        nodeId: 'HPA_CORTISOL',
        domainName: 'Circadian HPA Axis',
        localPerturbationScore: 0.20,
        adjacentNodeIds: ['SIBI_PERIODONTAL_HUB', 'HBA1C_GLYCEMIC']
      }
    ];

    const report = service.evaluatePercolationFirebreaks(network);

    expect(report.dominantHubNodeId).toBe('SIBI_PERIODONTAL_HUB');
    expect(report.activeCouplingDensityP).toBe(0.75); // 3 of 4 nodes >= 0.5
    expect(report.percolationThresholdPc).toBeLessThanOrEqual(0.50);
    expect(report.isSupercriticalCascadeRisk).toBe(true);
    expect(report.requiredFirebreakExamsCount).toBeGreaterThanOrEqual(2);
    expect(report.requiredFirebreakExamsCount).toBeLessThanOrEqual(4); // Respects 4-slot working memory ceiling
  });
});
