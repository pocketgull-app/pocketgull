// SPDX-License-Identifier: Apache-2.0
import { Injectable, signal, computed, inject } from '@angular/core';
import { DirectIomtWearablesService, IIomtBiometrics } from './hardware/direct-iomt-wearables.service';

export type TWatchPlatform = 'apple_watch_healthkit' | 'android_wear_health_connect';

export interface IWearableTriModalTelemetry {
  watchPlatform: TWatchPlatform;
  monkSkinToneScale: number;
  // 1. DOING: Active Hormetic & Vagal Recruitment
  pacedBreathingMinutes: number;
  postMealWalkMinutes: number;
  hrvRmssdMs: number;
  spo2RawPercent: number;
  // 2. FEELING: Interoceptive Somatic Calibration
  subjectiveEnergyVas: number;
  perceivedTremorOrFogVas: number;
  wristTempDeltaC: number;
  // 3. NOT DOING: Strategic Restraint & PEM Crash Shield
  stoppedBeforeExhaustion: boolean;
  orthostaticHrDeltaBpm: number;
  screenBlueLightCutoffMinsBeforeBed: number;
  unnecessaryPolypharmacyAvoidedCount: number;
}

export interface ITriModalAsymmetricGainScore {
  watchPlatform: TWatchPlatform;
  mstCalibratedSpo2Percent: number;
  doingHormeticVagalGain: number;
  feelingInteroceptiveCalibrationGain: number;
  notDoingRestraintPemShieldGain: number;
  totalShockTrooperReadinessGain: number;
  estimatedPemCrashHoursSaved: number;
  seligman3pCoachingInsight: string;
  pillarBreakdown: {
    doingActionDividend: string;
    feelingInteroceptionRadar: string;
    notDoingRestraintShield: string;
  };
}

/**
 * Domain service encapsulating Apple Watch (HealthKit) & Android Wear OS (Health Connect)
 * Tri-Modal Asymmetric Clinical Gain ("Doing", "Feeling", "Not Doing") and
 * Monk Skin Tone (MST 1-10) optical PPG melanin debiasing.
 */
@Injectable({
  providedIn: 'root',
})
export class WearableAsymmetricGainService {
  private readonly directIomt: DirectIomtWearablesService | null;

  constructor() {
    try {
      this.directIomt = inject(DirectIomtWearablesService, { optional: true });
    } catch {
      this.directIomt = null;
    }
  }

  private readonly _telemetry = signal<IWearableTriModalTelemetry>({
    watchPlatform: 'apple_watch_healthkit',
    monkSkinToneScale: 4,
    pacedBreathingMinutes: 6,
    postMealWalkMinutes: 12,
    hrvRmssdMs: 48,
    spo2RawPercent: 98,
    subjectiveEnergyVas: 7.5,
    perceivedTremorOrFogVas: 1.5,
    wristTempDeltaC: 0.05,
    stoppedBeforeExhaustion: true,
    orthostaticHrDeltaBpm: 14,
    screenBlueLightCutoffMinsBeforeBed: 45,
    unnecessaryPolypharmacyAvoidedCount: 2,
  });

  readonly telemetry = this._telemetry.asReadonly();

  readonly gainEvaluation = computed<ITriModalAsymmetricGainScore>(() => {
    const t = this._telemetry();
    return this.evaluateTriModalGain(t);
  });

  updateTelemetry(patch: Partial<IWearableTriModalTelemetry>): void {
    this._telemetry.update((current) => ({
      ...current,
      ...patch,
    }));
  }

  switchWatchPlatform(platform: TWatchPlatform): void {
    this.updateTelemetry({ watchPlatform: platform });
  }

  /**
   * Synchronizes live IoMT telemetry from DirectIomtWearablesService (Apple HealthKit,
   * Garmin Connect IQ, or Samsung Health BLE) into the tri-modal asymmetric gain model.
   */
  syncFromLiveIomtHardware(customBiometrics?: Partial<IIomtBiometrics>): ITriModalAsymmetricGainScore {
    const bio = customBiometrics ?? this.directIomt?.liveBiometrics?.();
    const provider = this.directIomt?.activeProvider?.();
    const watchPlatform: TWatchPlatform =
      provider === 'GOOGLE_HEALTH_CONNECT'
        ? 'android_wear_health_connect'
        : provider === 'APPLE_HEALTHKIT'
          ? 'apple_watch_healthkit'
          : this._telemetry().watchPlatform;

    const patch: Partial<IWearableTriModalTelemetry> = { watchPlatform };
    if (bio?.hrvRmssdMs !== undefined && Number.isFinite(bio.hrvRmssdMs)) {
      patch.hrvRmssdMs = bio.hrvRmssdMs;
    }
    if (bio?.spo2Pct !== undefined && Number.isFinite(bio.spo2Pct)) {
      patch.spo2RawPercent = bio.spo2Pct;
    }
    if (bio?.wristSkinTemperatureC !== undefined && Number.isFinite(bio.wristSkinTemperatureC)) {
      patch.wristTempDeltaC = Number((bio.wristSkinTemperatureC - 33.0).toFixed(2));
    }
    this.updateTelemetry(patch);
    return this.gainEvaluation();
  }

  /**
   * Pure deterministic calculation of Tri-Modal Asymmetric Clinical Gain
   * matching `pocketgull_api/services/asymmetric_loss_engine.py`.
   */
  evaluateTriModalGain(t: IWearableTriModalTelemetry): ITriModalAsymmetricGainScore {
    const mstOffset = Math.max(0, t.monkSkinToneScale - 5) * 0.28;
    const calibratedSpo2 = Math.min(100, Math.max(70, t.spo2RawPercent - mstOffset));

    // 1. DOING GAIN: 0.1 Hz Mayer Wave Baroreflex + Post-Meal Walk + HRV RMSSD
    const breathGain = Math.min(1.0, t.pacedBreathingMinutes / 10.0) * 40.0;
    const walkGain = Math.min(1.0, t.postMealWalkMinutes / 15.0) * 30.0;
    const hrvGain = Math.min(1.0, t.hrvRmssdMs / 65.0) * 30.0;
    const doingScore = Number(
      Math.min(100, Math.max(0, breathGain + walkGain + hrvGain)).toFixed(1)
    );

    // 2. FEELING GAIN: Interoceptive Somatic Calibration
    const expectedVitality = Math.min(
      10,
      Math.max(0, (t.hrvRmssdMs / 60.0) * 6.0 + ((calibratedSpo2 - 92.0) / 8.0) * 4.0)
    );
    const interoceptiveAlignment = 1.0 - Math.abs(t.subjectiveEnergyVas - expectedVitality) / 10.0;
    const tempStability = Math.max(0, 1.0 - Math.abs(t.wristTempDeltaC) / 1.5);
    const tremorCalm = Math.max(0, 1.0 - t.perceivedTremorOrFogVas / 10.0);
    const feelingScore = Number(
      Math.min(
        100,
        Math.max(0, interoceptiveAlignment * 45.0 + tempStability * 30.0 + tremorCalm * 25.0)
      ).toFixed(1)
    );

    // 3. NOT DOING GAIN: Strategic Restraint, PEM Shield, Scotopic Darkness & Hepatic Relief
    const pemShield = t.stoppedBeforeExhaustion ? 40.0 : 10.0;
    const orthostaticCalm =
      Math.max(0, 1.0 - Math.max(0, t.orthostaticHrDeltaBpm - 12.0) / 28.0) * 25.0;
    const scotopicDarkness = Math.min(1.0, t.screenBlueLightCutoffMinsBeforeBed / 45.0) * 20.0;
    const hepaticRelief = Math.min(1.0, t.unnecessaryPolypharmacyAvoidedCount / 3.0) * 15.0;
    const notDoingScore = Number(
      Math.min(
        100,
        Math.max(0, pemShield + orthostaticCalm + scotopicDarkness + hepaticRelief)
      ).toFixed(1)
    );

    // Convex Asymmetric Readiness Multiplier
    const restraintMultiplier = t.stoppedBeforeExhaustion ? 1.12 : 0.85;
    const rawTotal =
      (doingScore * 0.34 + feelingScore * 0.3 + notDoingScore * 0.36) * restraintMultiplier;
    const totalGain = Number(Math.min(100, Math.max(0, rawTotal)).toFixed(1));

    const pemHoursSaved = Number(
      ((notDoingScore / 100.0) * (t.stoppedBeforeExhaustion ? 48.0 : 12.0)).toFixed(1)
    );

    let insight: string;
    if (totalGain >= 75.0) {
      insight = `High Asymmetric Readiness: Your strategic pacing stop and 0.1 Hz respiratory tone banked ~${Math.round(pemHoursSaved)} hours of protected motor and cognitive reserve.`;
    } else if (totalGain >= 50.0) {
      insight =
        "Steady Autonomic Buffer: Your watch sensors confirm stable oxygen and vagal tone. Honor early somatic fatigue signals tonight to compound tomorrow's glymphatic recovery.";
    } else {
      insight =
        'Protective Conservation Mode: Orthostatic and somatic signals suggest transient strain. Choosing rest right now yields the highest asymmetric return over the next 72 hours.';
    }

    return {
      watchPlatform: t.watchPlatform,
      mstCalibratedSpo2Percent: Number(calibratedSpo2.toFixed(2)),
      doingHormeticVagalGain: doingScore,
      feelingInteroceptiveCalibrationGain: feelingScore,
      notDoingRestraintPemShieldGain: notDoingScore,
      totalShockTrooperReadinessGain: totalGain,
      estimatedPemCrashHoursSaved: pemHoursSaved,
      seligman3pCoachingInsight: insight,
      pillarBreakdown: {
        doingActionDividend: `+${doingScore.toFixed(1)} pts from ${Math.round(t.pacedBreathingMinutes)}m Mayer breathing & ${Math.round(t.postMealWalkMinutes)}m walk (RMSSD ${Math.round(t.hrvRmssdMs)} ms)`,
        feelingInteroceptionRadar: `+${feelingScore.toFixed(1)} pts from somatic-sensor concordance (MST-${t.monkSkinToneScale} SpO2 ${calibratedSpo2.toFixed(1)}%)`,
        notDoingRestraintShield: `+${notDoingScore.toFixed(1)} pts from strategic PEM pacing stop & ${Math.round(t.screenBlueLightCutoffMinsBeforeBed)}m scotopic wind-down`,
      },
    };
  }
}
