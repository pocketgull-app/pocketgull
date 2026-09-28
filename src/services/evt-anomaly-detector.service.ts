/**
 * @file evt-anomaly-detector.service.ts
 * @description Extreme Value Theory (EVT) Peak-Over-Threshold (POT) Anomaly Detector.
 * 
 * Fits a Generalized Pareto Distribution (GPD) to upper-tail clinical signals (vital spikes,
 * pain scores, MRI biomarker densities) to quantify the exact return level and tail probability
 * of catastrophic clinical events rather than relying on naive Gaussian assumptions.
 */

import { Injectable } from '@angular/core';

export interface IEvtTailProfile {
  readonly threshold: number;
  readonly exceedanceCount: number;
  readonly scaleParameterSigma: number;
  readonly shapeParameterXi: number; // > 0: Heavy-tailed (Frechet), = 0: Exponential (Gumbel), < 0: Bounded (Weibull)
  readonly returnLevel99th: number;
  readonly catastrophicRiskProbability: number;
  readonly isTailAnomaly: boolean;
  readonly clinicalRecommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvtAnomalyDetectorService {
  /**
   * Fits a Generalized Pareto Distribution (GPD) on observations exceeding a high quantile threshold.
   * Uses Probability Weighted Moments (PWM) for robust parameter estimation.
   */
  public fitPotGeneralizedPareto(
    data: readonly number[],
    quantileThreshold: number = 0.90
  ): IEvtTailProfile {
    if (data.length < 5) {
      return {
        threshold: 0,
        exceedanceCount: 0,
        scaleParameterSigma: 1.0,
        shapeParameterXi: 0.0,
        returnLevel99th: 0,
        catastrophicRiskProbability: 0,
        isTailAnomaly: false,
        clinicalRecommendation: 'Insufficient sample size for EVT tail estimation.'
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const thresholdIdx = Math.floor(sorted.length * quantileThreshold);
    const threshold = sorted[thresholdIdx];

    const exceedances = sorted.filter(x => x > threshold).map(x => x - threshold);
    const k = exceedances.length;

    if (k < 2) {
      return {
        threshold,
        exceedanceCount: k,
        scaleParameterSigma: 1.0,
        shapeParameterXi: 0.0,
        returnLevel99th: threshold,
        catastrophicRiskProbability: 0,
        isTailAnomaly: false,
        clinicalRecommendation: 'Tail sample insufficient above threshold.'
      };
    }

    // Probability Weighted Moments (PWM) estimation for GPD
    const meanExceedance = exceedances.reduce((acc, x) => acc + x, 0) / k;
    let sumWeighted = 0;
    for (let i = 0; i < k; i++) {
      sumWeighted += (1.0 - (i + 0.5) / k) * exceedances[i];
    }
    const tMoment = sumWeighted / k;

    // GPD shape (xi) and scale (sigma) estimators
    let xi = 1.0 - 2.0 * tMoment / (meanExceedance - 2.0 * tMoment + 1e-7);
    xi = Math.max(-0.5, Math.min(1.5, xi)); // Constrain to realistic domain

    const sigma = Math.max(1e-4, meanExceedance * (1.0 - xi));

    // 99th percentile extreme return level: z_p = u + (sigma / xi) * ((N/k * (1 - p))^(-xi) - 1)
    const pTarget = 0.99;
    const n = data.length;
    const tailFactor = (n / k) * (1.0 - pTarget);
    let returnLevel99: number;

    if (Math.abs(xi) < 1e-4) {
      returnLevel99 = threshold - sigma * Math.log(tailFactor);
    } else {
      returnLevel99 = threshold + (sigma / xi) * (Math.pow(tailFactor, -xi) - 1.0);
    }

    const maxObserved = sorted[sorted.length - 1];
    const tailProb = (k / n) * Math.pow(Math.max(1e-5, 1.0 + (xi * Math.max(0, maxObserved - threshold)) / sigma), -1.0 / (xi || 1e-4));
    const isAnomaly = maxObserved >= returnLevel99 || (maxObserved - threshold) >= 2.5 * sigma || tailProb <= 0.05;

    let recommendation = 'Tail distribution stable within physiological bounds.';
    if (isAnomaly) {
      recommendation = `STAT ALERT: Maximum value (${maxObserved.toFixed(2)}) breached EVT tail bounds (sigma: ${sigma.toFixed(2)}, return level: ${returnLevel99.toFixed(2)}). Heavy-tail shock detected.`;
    }

    return {
      threshold,
      exceedanceCount: k,
      scaleParameterSigma: sigma,
      shapeParameterXi: xi,
      returnLevel99th: returnLevel99,
      catastrophicRiskProbability: Math.min(1.0, Math.max(0.0, tailProb)),
      isTailAnomaly: isAnomaly,
      clinicalRecommendation: recommendation
    };
  }
}
