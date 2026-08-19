/**
 * Popperian Null-Hypothesis Statistical Engine & Polygenic Risk Score (PRS) Models
 */

export interface ITelemetrySignificanceResult {
  mean: number;
  variance: number;
  stdDev: number;
  zScore: number;
  pValueTwoTailed: number;
  rejectNullHypothesis: boolean;
  skepticalWarningNotice?: string;
}

export interface IPolygenicRiskPercentileResult {
  rawScore: number;
  zScore: number;
  percentile: number; // 0.0 - 100.0
  riskTier: 'Low Risk' | 'Average Risk' | 'Elevated Risk' | 'High Polygenic Risk';
  oddsRatioEstimated: number;
}

/**
 * Complementary error function approximation (Abramowitz and Stegun 7.1.26)
 */
export function erfc(x: number): number {
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign === 1 ? 1.0 - y : 1.0 + y;
}

/**
 * Standard Normal Cumulative Distribution Function (CDF)
 */
export function normalCdf(z: number): number {
  return 0.5 * erfc(-z / Math.SQRT2);
}

/**
 * Calculates statistical metrics and tests the null hypothesis (H0) against population baseline.
 * @param samples Array of numeric telemetry observations (e.g. HRV, heart rate, systolic BP)
 * @param populationBaselineMean Expected mean under the null hypothesis (H0)
 * @param alpha Significance threshold (default: 0.05)
 */
export function calculateTelemetrySignificance(
  samples: number[],
  populationBaselineMean: number,
  alpha: number = 0.05
): ITelemetrySignificanceResult {
  const n = samples.length;
  if (n === 0) {
    throw new Error('Sample array cannot be empty');
  }

  const sum = samples.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  if (n === 1) {
    return {
      mean,
      variance: 0,
      stdDev: 0,
      zScore: 0,
      pValueTwoTailed: 1.0,
      rejectNullHypothesis: false,
      skepticalWarningNotice: 'Sample size n=1 is insufficient to reject the null hypothesis (H0).'
    };
  }

  const sumSquaredDiff = samples.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = sumSquaredDiff / (n - 1);
  const stdDev = Math.sqrt(variance);

  const sem = stdDev / Math.sqrt(n);
  const zScore = sem > 1e-9 ? (mean - populationBaselineMean) / sem : 0;

  const pValueTwoTailed = Math.min(1.0, Math.max(0.0, erfc(Math.abs(zScore) / Math.SQRT2)));
  const rejectNullHypothesis = pValueTwoTailed < alpha;

  const result: ITelemetrySignificanceResult = {
    mean: Number(mean.toFixed(4)),
    variance: Number(variance.toFixed(4)),
    stdDev: Number(stdDev.toFixed(4)),
    zScore: Number(zScore.toFixed(4)),
    pValueTwoTailed: Number(pValueTwoTailed.toFixed(6)),
    rejectNullHypothesis
  };

  if (!rejectNullHypothesis) {
    result.skepticalWarningNotice = `Observation cannot reject the null hypothesis (p = ${result.pValueTwoTailed} >= α = ${alpha}). Finding may be attributable to random biological variation.`;
  }

  return result;
}

/**
 * Computes Polygenic Risk Score (PRS) population percentiles and estimated Odds Ratio
 * @param score Patient raw polygenic risk score
 * @param populationMean Reference population mean score
 * @param populationStdDev Reference population score standard deviation
 */
export function calculatePolygenicRiskPercentile(
  score: number,
  populationMean: number,
  populationStdDev: number
): IPolygenicRiskPercentileResult {
  if (populationStdDev <= 0) {
    throw new Error('Population standard deviation must be strictly positive');
  }

  const zScore = (score - populationMean) / populationStdDev;
  const percentile = Math.min(99.9, Math.max(0.1, Number((normalCdf(zScore) * 100).toFixed(1))));

  // Approximate Odds Ratio relative to population median: OR ≈ exp(β * z)
  const oddsRatioEstimated = Number(Math.exp(0.45 * zScore).toFixed(2));

  let riskTier: 'Low Risk' | 'Average Risk' | 'Elevated Risk' | 'High Polygenic Risk' = 'Average Risk';
  if (percentile >= 90) {
    riskTier = 'High Polygenic Risk';
  } else if (percentile >= 75) {
    riskTier = 'Elevated Risk';
  } else if (percentile <= 20) {
    riskTier = 'Low Risk';
  }

  return {
    rawScore: score,
    zScore: Number(zScore.toFixed(3)),
    percentile,
    riskTier,
    oddsRatioEstimated
  };
}
