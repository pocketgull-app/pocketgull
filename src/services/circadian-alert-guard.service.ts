import { Injectable, signal, computed } from '@angular/core';

export type AlertUrgencyTier = 'STAT_CRITICAL' | 'URGENT' | 'ROUTINE';

export interface IPhysiologicalVarianceContext {
  vitalName: string;
  measuredValue: number;
  baselineValue: number;
  isNormalVariance: boolean;
  calmingExplanation: string;
  recommendedAction: string;
  parasympatheticPromptRecommended: boolean;
}

export interface IAlertSuppressionEvaluation {
  shouldSuppress: boolean;
  suppressionReason: string | null;
  scheduledDeliveryTime: string | null;
  alertPriority: AlertUrgencyTier;
}

export interface IParasympatheticBreathingCadence {
  frequencyHz: number; // 0.1 Hz
  cycleDurationSeconds: number; // 10s
  inhaleSeconds: number; // 4s
  exhaleSeconds: number; // 6s
  vagalToneExplanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class CircadianAlertGuardService {
  /** Signal reflecting if nighttime quiet hours are active in current patient timezone */
  readonly isNighttimeCalmActive = signal<boolean>(false);

  /** Active state of 0.1 Hz parasympathetic breathing guidance */
  readonly activeParasympatheticPacing = signal<boolean>(false);

  /**
   * Evaluates if an outbound notification or ambient alert should be suppressed
   * to protect restorative slow-wave sleep architecture.
   * STAT_CRITICAL life-safety emergencies (severe hypoglycemia, cardiac arrest) NEVER suppress.
   */
  evaluateAlertSuppression(
    timestamp: Date = new Date(),
    urgency: AlertUrgencyTier = 'ROUTINE'
  ): IAlertSuppressionEvaluation {
    const hour = timestamp.getHours();
    const isQuietHour = hour >= 22 || hour < 7;
    this.isNighttimeCalmActive.set(isQuietHour);

    // STAT_CRITICAL emergency override invariant
    if (urgency === 'STAT_CRITICAL') {
      return {
        shouldSuppress: false,
        suppressionReason: null,
        scheduledDeliveryTime: null,
        alertPriority: 'STAT_CRITICAL'
      };
    }

    if (isQuietHour) {
      // Schedule delivery for 07:15 AM
      const nextMorning = new Date(timestamp);
      if (hour >= 22) {
        nextMorning.setDate(nextMorning.getDate() + 1);
      }
      nextMorning.setHours(7, 15, 0, 0);

      return {
        shouldSuppress: true,
        suppressionReason: 'Circadian Quiet Hours active (22:00–07:00): non-emergent telemetry held to protect slow-wave restorative sleep and eliminate nighttime screen anxiety.',
        scheduledDeliveryTime: nextMorning.toISOString(),
        alertPriority: urgency
      };
    }

    return {
      shouldSuppress: false,
      suppressionReason: null,
      scheduledDeliveryTime: null,
      alertPriority: urgency
    };
  }

  /**
   * Normalizes transient biometric spikes into reassuring physiological context
   * to eliminate cyberchondria, panic attacks, and screen apnea.
   */
  normalizePhysiologicalVariance(
    vitalName: string,
    measuredValue: number,
    baselineValue: number
  ): IPhysiologicalVarianceContext {
    const lowerName = vitalName.toLowerCase();

    let isNormalVariance = true;
    let calmingExplanation = 'Biometric readings naturally fluctuate continuously throughout the day in response to posture, metabolic shifts, and environment.';
    let recommendedAction = 'Rest comfortably and re-check in 10 minutes if desired.';
    let parasympatheticPromptRecommended = false;

    if (lowerName.includes('heart') || lowerName.includes('pulse')) {
      if (measuredValue > baselineValue + 25 && measuredValue < 140) {
        calmingExplanation = 'Transient heart rate elevations are common, healthy autonomic responses to standing up quickly, recent caffeine, emotional excitement, or light dehydration.';
        recommendedAction = 'Sit down comfortably, take slow sips of cool water, and let your body settle before re-measuring.';
        parasympatheticPromptRecommended = true;
      } else if (measuredValue >= 140) {
        isNormalVariance = false;
        calmingExplanation = 'Marked sustained tachycardia noted. Check for fever, acute pain, or medication effects.';
        recommendedAction = 'Sit quietly. If accompanied by chest tightness or shortness of breath, notify your care team immediately.';
      }
    } else if (lowerName.includes('blood pressure') || lowerName.includes('systolic')) {
      if (measuredValue > baselineValue + 20 && measuredValue < 170) {
        calmingExplanation = 'Blood pressure varies widely from minute to minute. A single higher reading often reflects the "white coat effect", talking, a full bladder, or recent physical activity.';
        recommendedAction = 'Sit quietly with both feet flat on the floor and uncrossed legs for 5 minutes without speaking, then take a second reading.';
        parasympatheticPromptRecommended = true;
      } else if (measuredValue >= 170) {
        isNormalVariance = false;
        calmingExplanation = 'Significantly elevated blood pressure reading detected.';
        recommendedAction = 'Rest in a calm, dark room. Re-check in 10 minutes. If persistent with headache or vision changes, seek urgent clinical evaluation.';
      }
    } else if (lowerName.includes('glucose')) {
      if (measuredValue > baselineValue + 40 && measuredValue < 240) {
        calmingExplanation = 'Post-meal glycemic excursions are a normal, expected phase of digestion as carbohydrates enter the bloodstream.';
        recommendedAction = 'A gentle 10-minute walk after meals helps muscle cells absorb glucose naturally.';
      }
    }

    return {
      vitalName,
      measuredValue,
      baselineValue,
      isNormalVariance,
      calmingExplanation,
      recommendedAction,
      parasympatheticPromptRecommended
    };
  }

  /**
   * Returns the Rachel Nabors 0.1 Hz Parasympathetic Bio-Rhythmic Breathing Parameters.
   */
  getParasympatheticBreathingCadence(): IParasympatheticBreathingCadence {
    return {
      frequencyHz: 0.1,
      cycleDurationSeconds: 10,
      inhaleSeconds: 4,
      exhaleSeconds: 6,
      vagalToneExplanation: '0.1 Hz breathing (6 breaths/min with longer exhalation) synchronizes respiratory sinus arrhythmia with heart rate variability, signaling the brainstem to down-regulate sympathetic fight-or-flight arousal.'
    };
  }

  /**
   * Activates guided parasympathetic breathing pacing.
   */
  startCalmingExercise(): void {
    this.activeParasympatheticPacing.set(true);
  }

  /**
   * Concludes guided parasympathetic breathing pacing.
   */
  stopCalmingExercise(): void {
    this.activeParasympatheticPacing.set(false);
  }
}
