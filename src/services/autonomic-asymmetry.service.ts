/**
 * @file autonomic-asymmetry.service.ts
 * @description Autonomic Neurovascular Asymmetry Service.
 * 
 * Separates physiological signals into:
 * - Right Vagus Nerve (SA Node Chronotropic Pacing: Respiratory Sinus Arrhythmia / Instantaneous Heart Rate)
 * - Left Vagus Nerve (AV Node Dromotropic Pacing: Conduction Delay / Ventricular Gating)
 * 
 * Complies strictly with MSA §14.s.ix.6 (zero emotion inferencing; strictly biophysical autonomic telemetry).
 */

import { Injectable } from '@angular/core';

export interface IAutonomicTelemetryInput {
  readonly heartRateBpm: number;
  readonly respirationRateBpm: number;
  readonly rmssdMs: number;       // Root Mean Square of Successive Differences (Parasympathetic index)
  readonly pnn50Percent: number;  // Percentage of successive RR intervals > 50 ms
  readonly prIntervalMs: number;  // AV conduction latency
}

export interface IAutonomicAsymmetryReport {
  readonly rightVagalChronotropicScore: number; // [0, 100] SA node vagal tone
  readonly leftVagalDromotropicScore: number;   // [0, 100] AV node conduction tone
  readonly autonomicBalanceRatio: number;        // Right / Left ratio
  readonly physiologicalReadiness: 'Optimal Tone' | 'Sympathetic Dominant / Fatigue' | 'Vagal Hyper-Tone';
  readonly pacingGuidance: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutonomicAsymmetryService {
  public evaluateAutonomicTelemetry(input: IAutonomicTelemetryInput): IAutonomicAsymmetryReport {
    // Right vagus primarily modulates SA node (RMSSD + respiratory sinus coupling)
    const rightVagal = Math.min(100, Math.max(0, (input.rmssdMs / 60.0) * 50 + (input.pnn50Percent / 30.0) * 50));

    // Left vagus primarily influences AV conduction time (PR interval baseline ~160ms)
    const prBaseline = 160.0;
    const prDelta = input.prIntervalMs - prBaseline;
    const leftVagal = Math.min(100, Math.max(0, 50 + (prDelta / 40.0) * 50));

    const balanceRatio = rightVagal / (leftVagal + 1e-4);

    let readiness: 'Optimal Tone' | 'Sympathetic Dominant / Fatigue' | 'Vagal Hyper-Tone' = 'Optimal Tone';
    let guidance = 'Autonomic neurovascular balance is harmonious. Pacing protocol active.';

    if (rightVagal < 35) {
      readiness = 'Sympathetic Dominant / Fatigue';
      guidance = 'Attenuated SA vagal tone. Initiate 4-7-8 parasympathetic pacing breathing bridge.';
    } else if (rightVagal > 85 && leftVagal > 85) {
      readiness = 'Vagal Hyper-Tone';
      guidance = 'High resting vagal brake. Monitor for transient orthostatic bradycardia.';
    }

    return {
      rightVagalChronotropicScore: rightVagal,
      leftVagalDromotropicScore: leftVagal,
      autonomicBalanceRatio: balanceRatio,
      physiologicalReadiness: readiness,
      pacingGuidance: guidance
    };
  }
}
