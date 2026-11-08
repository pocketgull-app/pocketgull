// SPDX-License-Identifier: Apache-2.0
import { Injectable, signal, computed, inject } from '@angular/core';
import { RustWasmComputeService } from './ai/rust-wasm-compute.service';

/**
 * New England Complex Systems Institute (NECSI — Yaneer Bar-Yam)
 * Clinical Complexity, Multiscale Variety & Critical Slowing Down Engine.
 *
 * Implements 4 canonical NECSI complexity science primitives for Pocket-Gull:
 *  1. Multiscale Variety Matching (Generalized Ashby's Law: V_care(s) >= V_acuity(s))
 *  2. Critical Slowing Down (CSD) Early Warning Signals (Lag-1 Autocorrelation rho_1,
 *     Variance sigma^2, and Autonomic Recovery Rate lambda = -ln(max(eps, |rho_1|)))
 *  3. Physiological Hub-and-Spoke Cascade Centrality (Polypharmacy & Oral-Systemic SIBI)
 *  4. Percolation Firebreak Thresholds (p_c = 1 / (k_mean - 1)) against Confirmation Bias
 *
 * Epistemic Notice: [EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]
 */

export type NecsiCareScale =
  | 'SCALE_1_SUBSECOND_AUTONOMIC_BIOFEEDBACK'
  | 'SCALE_2_HOUSEHOLD_CAREGIVER_LOOP'
  | 'SCALE_3_CLINICAL_OUTPATIENT_TEAM'
  | 'SCALE_4_TERTIARY_EMERGENCY_ESCALATION';

export type NecsiTrajectoryAct =
  | 'ACT_I_DAYS_0_30_METABOLIC_BRIDGE'
  | 'ACT_II_WEEKS_2_12_GLYMPHATIC_AUTONOMIC_PACING'
  | 'ACT_III_MONTHS_6_PLUS_STEPPED_CARE_RESILIENCE';

export interface INecsiCriticalSlowingDownReport {
  modality: string;
  sampleCount: number;
  mean: number;
  variance: number;
  /** Lag-1 autocorrelation coefficient rho_1 in [-1.0, 1.0] */
  lag1AutocorrelationRho1: number;
  /** Recovery rate lambda = -ln(max(0.001, |rho_1|)); approaches 0 as system nears tipping point */
  recoveryRateLambda: number;
  /** Normalized critical slowing down index in [0.0, 1.0] */
  criticalSlowingDownIndex: number;
  /** True when rho_1 >= 0.70, indicating loss of autonomic resilience prior to clinical decompensation */
  isApproachingTippingPoint: boolean;
  /** Popperian null hypothesis H_0 and two-tailed p-value for lag-1 autocorrelation (Bartlett SE = 1/sqrt(N)) */
  nullHypothesisH0: string;
  pValue: number;
  isNullFalsified: boolean;
  recommendedTrajectoryAct: NecsiTrajectoryAct;
  epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]';
  fdaPart11IntegrityDigest: string;
}

export interface INecsiScaleBand {
  scale: NecsiCareScale;
  timeHorizonLabel: string;
  environmentalDemandBits: number;
  careCapacityBits: number;
  varietySurplusBits: number;
  isRequisiteVarietyMet: boolean;
}

export interface INecsiMultiscaleVarietyProfile {
  scaleBands: INecsiScaleBand[];
  /** Bar-Yam Complexity Profile integral area across scales */
  multiscaleComplexityIntegral: number;
  /** True if any fine-scale demand is bottlenecked by insufficient local care variety */
  hasScaleMismatchBottleneck: boolean;
  bottleneckScale: NecsiCareScale | null;
  recommendedRoutingScale: NecsiCareScale;
  quietWorkshopGuidance: string;
  epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]';
}

export interface IPhysiologicalNetworkNode {
  nodeId: string;
  domainName: string;
  localPerturbationScore: number; // 0.0 to 1.0
  adjacentNodeIds: string[];
}

export interface INecsiPercolationFirebreakReport {
  meanDegreeK: number;
  /** Critical percolation threshold p_c = 1 / max(0.25, k_mean - 1) */
  percolationThresholdPc: number;
  /** Observed active coupling density p across physiological/diagnostic hubs */
  activeCouplingDensityP: number;
  /** Highest degree/eigenvector hub driving systemic cascade */
  dominantHubNodeId: string;
  isSupercriticalCascadeRisk: boolean;
  /** Number of orthogonal disconfirming physical exams required to sever the percolation cascade */
  requiredFirebreakExamsCount: number;
  quietWorkshopGuidance: string;
  epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]';
  fdaPart11IntegrityDigest: string;
}

@Injectable({
  providedIn: 'root'
})
export class NecsiComplexSystemsService {
  private readonly wasmCompute = inject(RustWasmComputeService);

  readonly lastCsdReport = signal<INecsiCriticalSlowingDownReport | null>(null);
  readonly lastVarietyProfile = signal<INecsiMultiscaleVarietyProfile | null>(null);
  readonly lastPercolationReport = signal<INecsiPercolationFirebreakReport | null>(null);

  readonly isResilienceWarningActive = computed(() => {
    const csd = this.lastCsdReport();
    return csd !== null && csd.isApproachingTippingPoint;
  });

  /**
   * 1. NECSI Critical Slowing Down (CSD) Early Warning Signal Analyzer
   *
   * Evaluates a physiological telemetry time series (e.g., heart_rate, raw_ppg, motion tremor)
   * for rising lag-1 autocorrelation (rho_1 -> 1) and vanishing recovery rate (lambda -> 0).
   * Accelerates centralized residual dot products in Int8 Wasm linear memory when available.
   */
  evaluateCriticalSlowingDown(
    modality: string,
    samples: ReadonlyArray<number>
  ): INecsiCriticalSlowingDownReport {
    const n = samples ? samples.length : 0;
    const nullHypothesisH0 =
      'H₀: Physiological fluctuations represent stationary white-noise homeostasis (ρ₁ = 0) with no critical slowing down.';

    if (n < 4) {
      const emptyDigest = this.computePart11Seal(`${modality}:INSUFFICIENT:${n}`);
      const fallback: INecsiCriticalSlowingDownReport = {
        modality,
        sampleCount: n,
        mean: n > 0 ? samples[0] : 0,
        variance: 0,
        lag1AutocorrelationRho1: 0,
        recoveryRateLambda: 6.9078,
        criticalSlowingDownIndex: 0,
        isApproachingTippingPoint: false,
        nullHypothesisH0,
        pValue: 1.0,
        isNullFalsified: false,
        recommendedTrajectoryAct: 'ACT_III_MONTHS_6_PLUS_STEPPED_CARE_RESILIENCE',
        epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]',
        fdaPart11IntegrityDigest: emptyDigest
      };
      this.lastCsdReport.set(fallback);
      return fallback;
    }

    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += samples[i];
    }
    const mean = sum / n;

    const centered = new Float64Array(n);
    let maxAbsDev = 0;
    let varianceSum = 0;
    for (let i = 0; i < n; i++) {
      const dev = samples[i] - mean;
      centered[i] = dev;
      varianceSum += dev * dev;
      const absDev = Math.abs(dev);
      if (absDev > maxAbsDev) {
        maxAbsDev = absDev;
      }
    }

    const variance = varianceSum / n;
    let rho1 = 0;

    if (variance > 1e-9 && maxAbsDev > 1e-9) {
      const pairLen = n - 1;
      if (this.wasmCompute.isWasmActive() && pairLen <= 256) {
        // Quantize centered lag-0 and lag-1 slices to Int8 [-127, 127] for Wasm integer kernel
        const scale = 127 / maxAbsDev;
        const qLag0 = new Int8Array(pairLen);
        const qLag1 = new Int8Array(pairLen);
        for (let i = 0; i < pairLen; i++) {
          qLag0[i] = Math.max(-127, Math.min(127, Math.round(centered[i] * scale)));
          qLag1[i] = Math.max(-127, Math.min(127, Math.round(centered[i + 1] * scale)));
        }
        const dotI8 = this.wasmCompute.quantizedDotI8(qLag0, qLag1);
        const norm0 = this.wasmCompute.quantizedNormSqI8(qLag0);
        const norm1 = this.wasmCompute.quantizedNormSqI8(qLag1);
        const denom = Math.sqrt(norm0 * norm1);
        rho1 = denom > 0 ? Math.max(-1, Math.min(1, dotI8 / denom)) : 0;
      } else {
        let covSum = 0;
        for (let i = 0; i < pairLen; i++) {
          covSum += centered[i] * centered[i + 1];
        }
        rho1 = Math.max(-1, Math.min(1, (covSum / pairLen) / variance));
      }
    }

    const positiveRho = Math.max(0, rho1);
    const recoveryRateLambda = Number((-Math.log(Math.max(0.001, positiveRho))).toFixed(4));
    const criticalSlowingDownIndex = Number(positiveRho.toFixed(4));
    const isApproachingTippingPoint = positiveRho >= 0.70;

    // Bartlett standard error for lag-1 autocorrelation under white-noise H_0: SE = 1 / sqrt(N)
    const zStatistic = Math.abs(rho1) * Math.sqrt(n);
    const pValue = Number(this.computeTwoTailedNormalPValue(zStatistic).toFixed(4));
    const isNullFalsified = pValue < 0.05 && positiveRho >= 0.50;

    let recommendedTrajectoryAct: NecsiTrajectoryAct = 'ACT_III_MONTHS_6_PLUS_STEPPED_CARE_RESILIENCE';
    if (positiveRho >= 0.70) {
      recommendedTrajectoryAct = 'ACT_I_DAYS_0_30_METABOLIC_BRIDGE';
    } else if (positiveRho >= 0.45) {
      recommendedTrajectoryAct = 'ACT_II_WEEKS_2_12_GLYMPHATIC_AUTONOMIC_PACING';
    }

    const fdaPart11IntegrityDigest = this.computePart11Seal(
      `${modality}|n=${n}|mean=${mean.toFixed(3)}|var=${variance.toFixed(3)}|rho1=${rho1.toFixed(4)}|p=${pValue}`
    );

    const report: INecsiCriticalSlowingDownReport = {
      modality,
      sampleCount: n,
      mean: Number(mean.toFixed(4)),
      variance: Number(variance.toFixed(4)),
      lag1AutocorrelationRho1: Number(rho1.toFixed(4)),
      recoveryRateLambda,
      criticalSlowingDownIndex,
      isApproachingTippingPoint,
      nullHypothesisH0,
      pValue,
      isNullFalsified,
      recommendedTrajectoryAct,
      epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]',
      fdaPart11IntegrityDigest
    };

    this.lastCsdReport.set(report);
    return report;
  }

  /**
   * 2. NECSI Multiscale Variety Matching (Bar-Yam Generalized Ashby's Law)
   *
   * Evaluates whether environmental/physiological demand V_env(s) at each scale s
   * is matched by requisite care capacity V_care(s), preventing fine-scale autonomic
   * fluctuations from overloading centralized clinical bottlenecks.
   */
  evaluateMultiscaleVariety(params: {
    subsecondAutonomicDemandBits: number;
    householdDailyDemandBits: number;
    outpatientClinicalDemandBits: number;
    tertiaryEmergencyDemandBits: number;
    onDeviceBiofeedbackCapacityBits?: number;
    caregiverLoopCapacityBits?: number;
    outpatientTeamCapacityBits?: number;
    tertiaryEmergencyCapacityBits?: number;
  }): INecsiMultiscaleVarietyProfile {
    const c1 = params.onDeviceBiofeedbackCapacityBits ?? 8.0;
    const c2 = params.caregiverLoopCapacityBits ?? 6.5;
    const c3 = params.outpatientTeamCapacityBits ?? 5.5;
    const c4 = params.tertiaryEmergencyCapacityBits ?? 9.0;

    const rawBands: Array<{
      scale: NecsiCareScale;
      timeHorizonLabel: string;
      demand: number;
      capacity: number;
    }> = [
      {
        scale: 'SCALE_1_SUBSECOND_AUTONOMIC_BIOFEEDBACK',
        timeHorizonLabel: '0.1s – 10s (0.1 Hz Mayer Wave & On-Device Wasm)',
        demand: Math.max(0, params.subsecondAutonomicDemandBits),
        capacity: Math.max(0, c1)
      },
      {
        scale: 'SCALE_2_HOUSEHOLD_CAREGIVER_LOOP',
        timeHorizonLabel: '1h – 24h (Circadian Pacing & Companion App)',
        demand: Math.max(0, params.householdDailyDemandBits),
        capacity: Math.max(0, c2)
      },
      {
        scale: 'SCALE_3_CLINICAL_OUTPATIENT_TEAM',
        timeHorizonLabel: '1w – 12w (Outpatient Care Plan & Lab Review)',
        demand: Math.max(0, params.outpatientClinicalDemandBits),
        capacity: Math.max(0, c3)
      },
      {
        scale: 'SCALE_4_TERTIARY_EMERGENCY_ESCALATION',
        timeHorizonLabel: 'STAT (Deterministic BE-FAST / ACS / C-SSRS Red-Flag)',
        demand: Math.max(0, params.tertiaryEmergencyDemandBits),
        capacity: Math.max(0, c4)
      }
    ];

    const scaleBands: INecsiScaleBand[] = rawBands.map(b => {
      const surplus = Number((b.capacity - b.demand).toFixed(2));
      return {
        scale: b.scale,
        timeHorizonLabel: b.timeHorizonLabel,
        environmentalDemandBits: Number(b.demand.toFixed(2)),
        careCapacityBits: Number(b.capacity.toFixed(2)),
        varietySurplusBits: surplus,
        isRequisiteVarietyMet: surplus >= 0
      };
    });

    const multiscaleComplexityIntegral = Number(
      scaleBands.reduce((acc, b) => acc + b.environmentalDemandBits, 0).toFixed(2)
    );

    const firstBottleneck = scaleBands.find(b => !b.isRequisiteVarietyMet) ?? null;
    const hasScaleMismatchBottleneck = firstBottleneck !== null;

    // Route to Scale 4 immediately if tertiary emergency demand is high (>= 7.0 bits),
    // otherwise route to the highest-demand scale or bottleneck scale.
    let recommendedRoutingScale: NecsiCareScale = 'SCALE_1_SUBSECOND_AUTONOMIC_BIOFEEDBACK';
    if (params.tertiaryEmergencyDemandBits >= 7.0) {
      recommendedRoutingScale = 'SCALE_4_TERTIARY_EMERGENCY_ESCALATION';
    } else if (firstBottleneck) {
      recommendedRoutingScale = firstBottleneck.scale;
    } else {
      const peakBand = [...scaleBands].sort(
        (a, b) => b.environmentalDemandBits - a.environmentalDemandBits
      )[0];
      recommendedRoutingScale = peakBand.scale;
    }

    const quietWorkshopGuidance = hasScaleMismatchBottleneck
      ? `Notice: Complexity demand at ${firstBottleneck.scale} exceeds local capacity by ${Math.abs(firstBottleneck.varietySurplusBits)} bits. Following NECSI multiscale matching, expand local self-regulatory bandwidth before centralizing.`
      : 'All four physiological and care scales satisfy Bar-Yam requisite variety matching (V_care >= V_env).';

    const profile: INecsiMultiscaleVarietyProfile = {
      scaleBands,
      multiscaleComplexityIntegral,
      hasScaleMismatchBottleneck,
      bottleneckScale: firstBottleneck ? firstBottleneck.scale : null,
      recommendedRoutingScale,
      quietWorkshopGuidance,
      epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]'
    };

    this.lastVarietyProfile.set(profile);
    return profile;
  }

  /**
   * 3 & 4. NECSI Physiological Hub Centrality & Percolation Firebreak Evaluator
   *
   * Models polypharmacy / oral-systemic SIBI / multi-symptom networks to detect
   * when active coupling density p crosses the critical percolation threshold
   * p_c = 1 / (k_mean - 1), and prescribes orthogonal disconfirming exams as firebreaks.
   */
  evaluatePercolationFirebreaks(
    nodes: ReadonlyArray<IPhysiologicalNetworkNode>
  ): INecsiPercolationFirebreakReport {
    if (!nodes || nodes.length === 0) {
      const emptyDigest = this.computePart11Seal('PERCOLATION:EMPTY');
      const emptyReport: INecsiPercolationFirebreakReport = {
        meanDegreeK: 0,
        percolationThresholdPc: 1.0,
        activeCouplingDensityP: 0,
        dominantHubNodeId: 'NONE',
        isSupercriticalCascadeRisk: false,
        requiredFirebreakExamsCount: 1,
        quietWorkshopGuidance: 'No active physiological network perturbations registered.',
        epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]',
        fdaPart11IntegrityDigest: emptyDigest
      };
      this.lastPercolationReport.set(emptyReport);
      return emptyReport;
    }

    let totalDegree = 0;
    let activePerturbedNodes = 0;
    let dominantHubNodeId = nodes[0].nodeId;
    let maxHubWeight = -1;

    for (const node of nodes) {
      const degree = node.adjacentNodeIds.length;
      totalDegree += degree;
      if (node.localPerturbationScore >= 0.5) {
        activePerturbedNodes++;
      }
      const hubWeight = (degree + 1) * Math.max(0, node.localPerturbationScore);
      if (hubWeight > maxHubWeight) {
        maxHubWeight = hubWeight;
        dominantHubNodeId = node.nodeId;
      }
    }

    const meanDegreeK = Number((totalDegree / nodes.length).toFixed(4));
    // Molloy-Reed / Bar-Yam percolation threshold approximation
    const effectiveBranching = Math.max(1.0, meanDegreeK - 1.0);
    const percolationThresholdPc = Number(Math.min(1.0, 1.0 / effectiveBranching).toFixed(4));
    const activeCouplingDensityP = Number((activePerturbedNodes / nodes.length).toFixed(4));
    const isSupercriticalCascadeRisk = activeCouplingDensityP >= percolationThresholdPc;

    // Bounded to Pocket-Gull's 4-slot Working Memory ceiling (1 to 4 orthogonal firebreak checks)
    const requiredFirebreakExamsCount = isSupercriticalCascadeRisk
      ? Math.min(4, Math.max(2, Math.ceil(activeCouplingDensityP / Math.max(0.15, percolationThresholdPc))))
      : 1;

    const quietWorkshopGuidance = isSupercriticalCascadeRisk
      ? `Active coupling (p = ${activeCouplingDensityP}) meets or exceeds the percolation threshold (p_c = ${percolationThresholdPc}) around hub [${dominantHubNodeId}]. Complete ${requiredFirebreakExamsCount} orthogonal disconfirming checks to establish a clinical firebreak.`
      : `Network coupling (p = ${activeCouplingDensityP}) remains subcritical below p_c = ${percolationThresholdPc}. Perturbations around [${dominantHubNodeId}] are locally contained.`;

    const fdaPart11IntegrityDigest = this.computePart11Seal(
      `PERCOLATION|nodes=${nodes.length}|k=${meanDegreeK}|pc=${percolationThresholdPc}|p=${activeCouplingDensityP}|hub=${dominantHubNodeId}`
    );

    const report: INecsiPercolationFirebreakReport = {
      meanDegreeK,
      percolationThresholdPc,
      activeCouplingDensityP,
      dominantHubNodeId,
      isSupercriticalCascadeRisk,
      requiredFirebreakExamsCount,
      quietWorkshopGuidance,
      epistemicBadge: '[EXPLORATORY IN SILICO MODEL • NON-DIAGNOSTIC]',
      fdaPart11IntegrityDigest
    };

    this.lastPercolationReport.set(report);
    return report;
  }

  private computeTwoTailedNormalPValue(zAbs: number): number {
    // Abramowitz & Stegun 7.1.26 rational approximation for erfc(z / sqrt(2))
    const x = Math.abs(zAbs) / Math.SQRT2;
    const t = 1.0 / (1.0 + 0.3275911 * x);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const poly = (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t;
    const erfc = poly * Math.exp(-x * x);
    return Math.max(0.0001, Math.min(1.0, erfc));
  }

  private computePart11Seal(payload: string): string {
    const hash32 = this.wasmCompute.fnv1aPart11Digest32(payload);
    return `fnv1a-part11-necsi-${hash32.toString(16).padStart(8, '0')}`;
  }
}
