import { Injectable, signal, computed } from '@angular/core';

export interface IBiometricTelemetry {
  rmssdMs: number;          // Heart Rate Variability (Parasympathetic index)
  heartRateBpm: number;     // Resting / active pulse
  respirationBpm: number;   // Respiration frequency
  cgmGlucoseMgDl: number;   // Real-time interstitial glucose
  timestampIso: string;     // Telemetry timestamp
  minutesSinceMeal?: number;
}

export interface IBreathingPacerConfig {
  pacerActive: boolean;
  targetFrequencyHz: number;
  cadenceBpm: number;
  inhaleSeconds: number;
  exhaleSeconds: number;
  neuroTarget: string;
}

export interface IVagalCircadianEvaluation {
  timestamp: string;
  vagalToneStatus: 'STABLE_PARASYMPATHETIC' | 'SYMPATHETIC_DOMINANCE';
  rmssdMs: number;
  ambientTheme: 'SCOTOPIC_650NM_RED' | 'ORGANIC_RICE_PAPERCRAFT';
  breathingPacer: IBreathingPacerConfig;
  metabolicAction: {
    glut4WalkingPromptActive: boolean;
    glucoseMgDl: number;
    rationale: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VagalCircadianShieldService {
  readonly rmssdThreshold = signal<number>(25.0);
  readonly glucoseSpikeThreshold = signal<number>(140.0);

  readonly lastEvaluation = signal<IVagalCircadianEvaluation | null>(null);

  /**
   * Evaluates streaming biometric telemetry and dynamically orchestrates
   * vagal baroreflex pacing (0.1 Hz), Scotopic 650nm protection, and GLUT4 movement prompts.
   */
  evaluateTelemetry(telemetry: IBiometricTelemetry): IVagalCircadianEvaluation {
    const date = new Date(telemetry.timestampIso);
    const hour = isNaN(date.getTime()) ? new Date().getHours() : date.getHours();

    // 1. Autonomic Vagal Analysis
    const isSympatheticOverdrive = telemetry.rmssdMs < this.rmssdThreshold();
    const vagalToneStatus: 'STABLE_PARASYMPATHETIC' | 'SYMPATHETIC_DOMINANCE' =
      isSympatheticOverdrive ? 'SYMPATHETIC_DOMINANCE' : 'STABLE_PARASYMPATHETIC';

    // 2. Circadian Scotopic Theme Trigger (Night shift or acute distress)
    const scotopic650nmActive = (hour >= 20 || hour < 7) || isSympatheticOverdrive;

    // 3. Resonant Frequency Breathing Pacer (0.1 Hz / 6 Breaths Per Minute)
    const breathingPacer: IBreathingPacerConfig = {
      pacerActive: isSympatheticOverdrive,
      targetFrequencyHz: 0.1,
      cadenceBpm: 6.0,
      inhaleSeconds: 4.0,
      exhaleSeconds: 6.0,
      neuroTarget: 'Ventral Vagal Nucleus Ambiguus activation'
    };

    // 4. Metabolic Contraction-Mediated GLUT4 Trigger
    const minutesSinceMeal = telemetry.minutesSinceMeal ?? -1;
    let glut4WalkingPrompt = false;
    if (minutesSinceMeal >= 15 && minutesSinceMeal <= 90 && telemetry.cgmGlucoseMgDl > this.glucoseSpikeThreshold()) {
      glut4WalkingPrompt = true;
    }

    const evaluation: IVagalCircadianEvaluation = {
      timestamp: telemetry.timestampIso,
      vagalToneStatus,
      rmssdMs: telemetry.rmssdMs,
      ambientTheme: scotopic650nmActive ? 'SCOTOPIC_650NM_RED' : 'ORGANIC_RICE_PAPERCRAFT',
      breathingPacer,
      metabolicAction: {
        glut4WalkingPromptActive: glut4WalkingPrompt,
        glucoseMgDl: telemetry.cgmGlucoseMgDl,
        rationale: glut4WalkingPrompt
          ? 'Non-insulin skeletal muscle contraction GLUT4 translocation'
          : 'Euglycemic homeostasis'
      }
    };

    this.lastEvaluation.set(evaluation);
    return evaluation;
  }
}
