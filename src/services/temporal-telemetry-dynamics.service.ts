import { Injectable, signal, computed } from '@angular/core';

export type TVitalMetricKey = 'glucose' | 'uhthoffCoreTempDelta' | 'anticholinergicBurden' | 'pocketDepthMaxMm' | 'sNflVelocity';

export interface ITimestampedObservation {
  timestampMs: number;
  value: number;
}

export interface IVitalDynamics {
  currentValue: number;
  velocityPerMin: number; // dx/dt in units / minute
  accelerationPerMin2: number; // d²x/dt² in units / minute²
  decayWeightedMean: number;
  projectedMinutesToThreshold: number | null; // null if moving away or stationary
  isDeteriorating: boolean;
  status: 'STABLE' | 'ACCELERATING_DETERIORATION' | 'DECELERATING' | 'CRITICAL_PROJECTED_BREACH';
}

export interface IPredictiveBreachAlert {
  metric: TVitalMetricKey;
  severity: 'ROUTINE' | 'ELEVATED' | 'URGENT' | 'STAT_OVERRIDE';
  headline: string;
  projectedMinutesToBreach: number;
  currentVelocity: number;
  recommendedAction: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemporalTelemetryDynamicsService {
  // Sliding window memory per metric (max 20 samples)
  private readonly historyMap = new Map<TVitalMetricKey, ITimestampedObservation[]>();
  readonly lastUpdated = signal<number>(Date.now());

  // Half-life for exponential decay kernel (in minutes)
  private readonly DECAY_LAMBDA = 0.05; // ~14 min half-life

  /**
   * Records a timestamped vital observation.
   */
  recordObservation(metric: TVitalMetricKey, value: number, timestampMs: number = Date.now()): void {
    let list = this.historyMap.get(metric);
    if (!list) {
      list = [];
      this.historyMap.set(metric, list);
    }

    list.push({ timestampMs, value });
    // Keep max 25 observations sorted by timestamp
    list.sort((a, b) => a.timestampMs - b.timestampMs);
    if (list.length > 25) {
      list.shift();
    }
    this.lastUpdated.set(Date.now());
  }

  /**
   * Computes temporal velocity (dx/dt) and acceleration (d²x/dt²) using numerical difference with time-decay.
   */
  computeDynamics(metric: TVitalMetricKey, criticalThreshold?: number, direction: 'LOW' | 'HIGH' = 'LOW'): IVitalDynamics {
    const list = this.historyMap.get(metric) || [];
    if (list.length === 0) {
      return {
        currentValue: 0,
        velocityPerMin: 0,
        accelerationPerMin2: 0,
        decayWeightedMean: 0,
        projectedMinutesToThreshold: null,
        isDeteriorating: false,
        status: 'STABLE'
      };
    }

    if (list.length === 1) {
      const single = list[0];
      return {
        currentValue: single.value,
        velocityPerMin: 0,
        accelerationPerMin2: 0,
        decayWeightedMean: single.value,
        projectedMinutesToThreshold: null,
        isDeteriorating: false,
        status: 'STABLE'
      };
    }

    const n = list.length;
    const latest = list[n - 1];
    const prev = list[n - 2];
    const dtMinLatest = Math.max((latest.timestampMs - prev.timestampMs) / 60000, 0.01);
    const instantVelocity = (latest.value - prev.value) / dtMinLatest;

    // Compute second derivative if 3+ samples exist
    let instantAcceleration = 0;
    if (n >= 3) {
      const prev2 = list[n - 3];
      const dtMinPrev = Math.max((prev.timestampMs - prev2.timestampMs) / 60000, 0.01);
      const prevVelocity = (prev.value - prev2.value) / dtMinPrev;
      instantAcceleration = (instantVelocity - prevVelocity) / dtMinLatest;
    }

    // Compute exponential decay weighted mean
    const now = latest.timestampMs;
    let weightSum = 0;
    let weightedValSum = 0;
    for (const obs of list) {
      const deltaMin = Math.max((now - obs.timestampMs) / 60000, 0);
      const weight = Math.exp(-this.DECAY_LAMBDA * deltaMin);
      weightSum += weight;
      weightedValSum += obs.value * weight;
    }
    const decayWeightedMean = weightSum > 0 ? weightedValSum / weightSum : latest.value;

    // Projected minutes to threshold
    let projectedMinutesToThreshold: number | null = null;
    let isDeteriorating = false;

    if (criticalThreshold !== undefined) {
      if (direction === 'LOW') {
        // Deterioration occurs if value is dropping toward threshold
        if (instantVelocity < -0.01 && latest.value > criticalThreshold) {
          projectedMinutesToThreshold = (latest.value - criticalThreshold) / Math.abs(instantVelocity);
          isDeteriorating = true;
        }
      } else {
        // Deterioration occurs if value is rising toward threshold
        if (instantVelocity > 0.01 && latest.value < criticalThreshold) {
          projectedMinutesToThreshold = (criticalThreshold - latest.value) / instantVelocity;
          isDeteriorating = true;
        }
      }
    }

    let status: IVitalDynamics['status'] = 'STABLE';
    if (projectedMinutesToThreshold !== null && projectedMinutesToThreshold <= 30) {
      status = 'CRITICAL_PROJECTED_BREACH';
    } else if (isDeteriorating && instantAcceleration !== 0) {
      status = 'ACCELERATING_DETERIORATION';
    } else if (isDeteriorating) {
      status = 'DECELERATING';
    }

    return {
      currentValue: latest.value,
      velocityPerMin: Number(instantVelocity.toFixed(4)),
      accelerationPerMin2: Number(instantAcceleration.toFixed(4)),
      decayWeightedMean: Number(decayWeightedMean.toFixed(2)),
      projectedMinutesToThreshold: projectedMinutesToThreshold !== null ? Number(projectedMinutesToThreshold.toFixed(1)) : null,
      isDeteriorating,
      status
    };
  }

  /**
   * Evaluates predictive pre-breach alerts for living telemetry.
   */
  evaluatePredictiveAlerts(): IPredictiveBreachAlert[] {
    const alerts: IPredictiveBreachAlert[] = [];

    // 1. Glucose check: threshold < 70 mg/dL warning, < 54 mg/dL critical
    const glucoseDyn = this.computeDynamics('glucose', 54, 'LOW');
    if (glucoseDyn.projectedMinutesToThreshold !== null && glucoseDyn.projectedMinutesToThreshold <= 45) {
      alerts.push({
        metric: 'glucose',
        severity: glucoseDyn.projectedMinutesToThreshold <= 15 ? 'STAT_OVERRIDE' : 'URGENT',
        headline: `Rapid Hypoglycemia Velocity (${glucoseDyn.velocityPerMin} mg/dL/min)`,
        projectedMinutesToBreach: glucoseDyn.projectedMinutesToThreshold,
        currentVelocity: glucoseDyn.velocityPerMin,
        recommendedAction: 'De-escalate botanical timing (Berberine) immediately; deliver fast-acting oral glucose.'
      });
    }

    // 2. Uhthoff core temp delta check: threshold >= 0.40 °C
    const tempDyn = this.computeDynamics('uhthoffCoreTempDelta', 0.40, 'HIGH');
    if (tempDyn.projectedMinutesToThreshold !== null && tempDyn.projectedMinutesToThreshold <= 30) {
      alerts.push({
        metric: 'uhthoffCoreTempDelta',
        severity: 'URGENT',
        headline: `Thermal Velocity Surge (+${tempDyn.velocityPerMin} °C/min)`,
        projectedMinutesToBreach: tempDyn.projectedMinutesToThreshold,
        currentVelocity: tempDyn.velocityPerMin,
        recommendedAction: 'Engage cooling vest and cease thermal stress to prevent conduction block.'
      });
    }

    return alerts;
  }

  /**
   * Resets observations for testing.
   */
  reset(): void {
    this.historyMap.clear();
    this.lastUpdated.set(Date.now());
  }
}
