// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import { Injectable, signal, computed } from '@angular/core';

export interface ICriticalSlowingDownMetrics {
  lag1Autocorrelation: number;
  variance: number;
  coefficientOfVariation: number;
  recoveryRateLambda: number;
  tippingProbability: number;
  warningLevel: 'STABLE_HOMEOSTASIS' | 'EARLY_WARNING_DETECTED' | 'CRITICAL_BIFURCATION_IMMINENT';
}

export interface IAllometricScalingResult {
  bodyMassKg: number;
  basalMetabolicRateWatts: number;
  massSpecificMetabolicRate: number;
  allometricClearanceRatio: number;
  wbeRecommendedDosageFactor: number;
  allostaticLoadScore: number;
}

export interface IAttractorBasinState {
  currentBasin: 'HOMEOSTATIC_BASIN' | 'CRITICAL_TRANSITION_ZONE' | 'ALLOSTATIC_INFLAMMATORY_SINK';
  potentialEnergy: number;
  curvatureNabla2V: number;
  attractorDepth: number;
  clinicalDirective: string;
}

export interface ISfiCasComprehensiveReport {
  timestamp: string;
  csd: ICriticalSlowingDownMetrics;
  allometry: IAllometricScalingResult;
  attractor: IAttractorBasinState;
  sfiTheoreticalCitation: string;
}

/**
 * SFI (Santa Fe Institute) Complex Adaptive Systems Service
 * Implements non-linear dynamical systems analysis:
 * 1. Critical Slowing Down (CSD) early warning signals (Scheffer et al., 2009)
 * 2. West-Brown-Enquist (WBE) M^(3/4) fractal allometric scaling (West et al., 1997)
 * 3. Landau-Thom Catastrophe phase-space attractor potential wells (Kauffman, 1993)
 */
@Injectable({
  providedIn: 'root'
})
export class SfiComplexAdaptiveService {
  // Reactive baseline signals for continuous telemetry monitoring
  readonly recentTelemetrySeries = signal<number[]>([72, 74, 71, 75, 73, 76, 72, 75]);
  readonly patientBodyMassKg = signal<number>(70.0);
  readonly currentPhaseSpaceCoordinate = signal<number>(0.1);

  readonly currentReport = computed<ISfiCasComprehensiveReport>(() => {
    return this.generateCasTelemetry(
      this.recentTelemetrySeries(),
      this.patientBodyMassKg(),
      this.currentPhaseSpaceCoordinate()
    );
  });

  /**
   * Computes Critical Slowing Down (CSD) early warning metrics on continuous time series biometrics
   * (e.g. hourly resting heart rate, HRV SDNN, continuous glucose, or skin temperature).
   */
  computeCriticalSlowingDown(timeSeries: number[]): ICriticalSlowingDownMetrics {
    if (!timeSeries || timeSeries.length < 3) {
      return {
        lag1Autocorrelation: 0.0,
        variance: 0.0,
        coefficientOfVariation: 0.0,
        recoveryRateLambda: 1.0,
        tippingProbability: 0.05,
        warningLevel: 'STABLE_HOMEOSTASIS'
      };
    }

    const n = timeSeries.length;
    const mean = timeSeries.reduce((acc, val) => acc + val, 0) / n;

    // Variance sigma^2
    const variance = timeSeries.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const cv = mean !== 0 ? (stdDev / Math.abs(mean)) : 0;

    // Lag-1 Autocorrelation rho_1
    let numerator = 0;
    let denom = 0;
    for (let t = 0; t < n - 1; t++) {
      numerator += (timeSeries[t] - mean) * (timeSeries[t + 1] - mean);
      denom += Math.pow(timeSeries[t] - mean, 2);
    }

    let rho1 = denom > 1e-9 ? (numerator / denom) : 0.0;
    // Bound autocorrelation to [-1.0, 1.0]
    rho1 = Math.max(-1.0, Math.min(1.0, rho1));

    // Recovery rate lambda: as rho1 -> 1, lambda -> 0 (Critical Slowing Down: system loses resilience)
    // For resilient/homeostatic systems (rho1 <= 0), recovery rate is maximal (1.0).
    const effectiveRho = Math.max(0, Math.min(0.999, rho1));
    const lambda = 1.0 - effectiveRho;

    // Tipping point probability model: Sigmoid on autocorrelation threshold rho > 0.60
    const logit = 8.0 * (rho1 - 0.60) + Math.min(2.0, cv * 5.0);
    const tippingProbability = 1.0 / (1.0 + Math.exp(-logit));

    let warningLevel: ICriticalSlowingDownMetrics['warningLevel'] = 'STABLE_HOMEOSTASIS';
    if (rho1 >= 0.72 || tippingProbability >= 0.70) {
      warningLevel = 'CRITICAL_BIFURCATION_IMMINENT';
    } else if (rho1 >= 0.48 || tippingProbability >= 0.40) {
      warningLevel = 'EARLY_WARNING_DETECTED';
    }

    return {
      lag1Autocorrelation: parseFloat(rho1.toFixed(4)),
      variance: parseFloat(variance.toFixed(4)),
      coefficientOfVariation: parseFloat(cv.toFixed(4)),
      recoveryRateLambda: parseFloat(lambda.toFixed(4)),
      tippingProbability: parseFloat(tippingProbability.toFixed(4)),
      warningLevel
    };
  }

  /**
   * West-Brown-Enquist (WBE) Fractal Allometry & Non-Linear Posology
   * Organism metabolic rate scales as B = B0 * M^(0.75) due to space-filling fractal networks.
   */
  computeWbeAllometricScaling(bodyMassKg: number, basalReferenceWatts = 70.0): IAllometricScalingResult {
    const mass = Math.max(1.0, bodyMassKg);
    const referenceMass = 70.0;

    // Basal Metabolic Rate via WBE 3/4 allometric scaling
    const bmr = basalReferenceWatts * Math.pow(mass / referenceMass, 0.75);

    // Mass-specific metabolic rate B/M ~ M^(-0.25)
    const massSpecific = bmr / mass;

    // Ratio of non-linear fractal clearance vs linear per-kg expectation
    const linearRatio = mass / referenceMass;
    const fractalRatio = Math.pow(mass / referenceMass, 0.75);
    const clearanceRatio = linearRatio > 0 ? (fractalRatio / linearRatio) : 1.0;

    // Recommended posology adjustment factor
    const wbeFactor = Math.pow(mass / referenceMass, -0.25);

    // Allostatic load deviation from ideal allometric efficiency
    const allostaticLoad = Math.min(10.0, Math.abs(1.0 - wbeFactor) * 12.0);

    return {
      bodyMassKg: mass,
      basalMetabolicRateWatts: parseFloat(bmr.toFixed(2)),
      massSpecificMetabolicRate: parseFloat(massSpecific.toFixed(4)),
      allometricClearanceRatio: parseFloat(clearanceRatio.toFixed(4)),
      wbeRecommendedDosageFactor: parseFloat(wbeFactor.toFixed(4)),
      allostaticLoadScore: parseFloat(allostaticLoad.toFixed(2))
    };
  }

  /**
   * Classifies phase-space attractor topology using Thom-Landau double-well catastrophe potential:
   * V(x) = - (mu / 2) * x^2 + (1 / 4) * x^4
   * Curvature V''(x) = -mu + 3 * x^2 (represents restoring elasticity)
   */
  classifyAttractorLandscape(stateCoordinate: number, controlParameterMu = 1.0): IAttractorBasinState {
    const x = stateCoordinate;
    const mu = controlParameterMu;

    // Potential energy
    const potentialEnergy = -0.5 * mu * Math.pow(x, 2) + 0.25 * Math.pow(x, 4);

    // Curvature Nabla^2 V (restoring force)
    const curvature = -mu + 3.0 * Math.pow(x, 2);

    let currentBasin: IAttractorBasinState['currentBasin'];
    let clinicalDirective: string;
    let attractorDepth: number;

    if (curvature < 0.2) {
      currentBasin = 'CRITICAL_TRANSITION_ZONE';
      attractorDepth = Math.max(0.01, 0.25 * Math.pow(mu, 2) - potentialEnergy);
      clinicalDirective = 'System in shallow saddle region with diminished restoring force. Implement autonomic stabilization and avoid acute metabolic or thermal stressors.';
    } else if (x > 0.6) {
      currentBasin = 'ALLOSTATIC_INFLAMMATORY_SINK';
      attractorDepth = Math.abs(potentialEnergy);
      clinicalDirective = 'System trapped in high-entropy allostatic inflammatory attractor. Active clinical detours, parasympathetic pacing, and metabolic reboot required.';
    } else {
      currentBasin = 'HOMEOSTATIC_BASIN';
      attractorDepth = Math.abs(potentialEnergy);
      clinicalDirective = 'Robust homeostatic basin with resilient restoring force. Fast dissipation of transient biophysical perturbations.';
    }

    return {
      currentBasin,
      potentialEnergy: parseFloat(potentialEnergy.toFixed(4)),
      curvatureNabla2V: parseFloat(curvature.toFixed(4)),
      attractorDepth: parseFloat(attractorDepth.toFixed(4)),
      clinicalDirective
    };
  }

  /**
   * Generates comprehensive multi-scale Santa Fe Institute Complex Adaptive Systems Report
   */
  generateCasTelemetry(
    timeSeries: number[],
    bodyMassKg: number,
    stateCoordinate = 0.1
  ): ISfiCasComprehensiveReport {
    return {
      timestamp: new Date().toISOString(),
      csd: this.computeCriticalSlowingDown(timeSeries),
      allometry: this.computeWbeAllometricScaling(bodyMassKg),
      attractor: this.classifyAttractorLandscape(stateCoordinate),
      sfiTheoreticalCitation: 'Santa Fe Institute (SFI) Applied Complexity & Biological Computation Framework (West-Brown-Enquist 1997, Scheffer 2009, Kauffman 1993)'
    };
  }
}
