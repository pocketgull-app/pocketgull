import { Injectable, signal, computed } from '@angular/core';

export interface IPulseTrajectory {
  hrvMs: number;
  sibiIndex: number;
  vocalStressIndex: number;
  pulseMomentum: number; // 0.0 - 1.0
  timestamp: string;
}

export interface IPivotDecision {
  agentName: string;
  previousRegimen: string;
  pivotedRegimen: string;
  shouldPivot: boolean;
  pivotRationale: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PivotPulseAgentService {
  private currentPulse = signal<IPulseTrajectory>({
    hrvMs: 42,
    sibiIndex: 0.35,
    vocalStressIndex: 0.28,
    pulseMomentum: 0.72,
    timestamp: new Date().toISOString()
  });

  private activeRegimen = signal<string>('ACTIVE_REHAB');
  private lastPivot = signal<IPivotDecision>({
    agentName: 'Peregrine',
    previousRegimen: 'ACTIVE_REHAB',
    pivotedRegimen: 'ACTIVE_REHAB',
    shouldPivot: false,
    pivotRationale: 'Pulse trajectory stable.',
    timestamp: new Date().toISOString()
  });

  readonly pulse = this.currentPulse.asReadonly();
  readonly regimen = this.activeRegimen.asReadonly();
  readonly pivotDecision = this.lastPivot.asReadonly();

  readonly isHighMomentum = computed(() => this.currentPulse().pulseMomentum >= 0.75);

  /**
   * Evaluate real-time biometric pulse stream and execute dynamic care plan pivot if required
   */
  evaluatePulseAndPivot(hrvMs: number, sibiIndex: number, vocalStressIndex: number): IPivotDecision {
    const normHrv = Math.min(1.0, hrvMs / 100.0);
    const momentum = Math.max(0.0, normHrv * 0.5 + (1.0 - sibiIndex) * 0.3 + (1.0 - vocalStressIndex) * 0.2);
    const roundedMomentum = Math.round(momentum * 100) / 100;

    const trajectory: IPulseTrajectory = {
      hrvMs,
      sibiIndex,
      vocalStressIndex,
      pulseMomentum: roundedMomentum,
      timestamp: new Date().toISOString()
    };
    this.currentPulse.set(trajectory);

    const currentReg = this.activeRegimen();
    let shouldPivot = false;
    let targetRegimen = currentReg;
    let rationale = 'Pulse trajectory remains within optimal bounds.';

    if (roundedMomentum < 0.40 && currentReg === 'ACTIVE_REHAB') {
      shouldPivot = true;
      targetRegimen = 'SOMATIC_AVS_RECOVERY';
      rationale = 'Peregrine Pivot: Elevated stress index and low HRV momentum detected. Pivoting to 528Hz Solfeggio AVS Recovery.';
    } else if (roundedMomentum > 0.80 && currentReg === 'SOMATIC_AVS_RECOVERY') {
      shouldPivot = true;
      targetRegimen = 'PROGRESSIVE_FUNCTIONAL_MOBILITY';
      rationale = 'Peregrine Pivot: Autonomic nervous system recovery achieved (>0.80). Pivoting to Progressive Functional Mobility.';
    }

    if (shouldPivot) {
      this.activeRegimen.set(targetRegimen);
    }

    const decision: IPivotDecision = {
      agentName: 'Peregrine',
      previousRegimen: currentReg,
      pivotedRegimen: targetRegimen,
      shouldPivot,
      pivotRationale: rationale,
      timestamp: new Date().toISOString()
    };

    this.lastPivot.set(decision);
    return decision;
  }
}
