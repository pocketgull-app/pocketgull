import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ICounterfactualScenario {
  deltaHbA1c: number;      // -2.0% to +2.0%
  deltaSteps: number;      // -5000 to +5000 steps/day
  deltaSleep: number;      // -30% to +30% sleep efficiency
  deltaHrv: number;        // -20ms to +40ms
  deltaSystolic: number;   // -30mmHg to +30mmHg
}

@Injectable({
  providedIn: 'root'
})
export class CounterfactualSimulationService {
  private patientState?: PatientStateService | null;

  constructor(patientState?: PatientStateService) {
    if (patientState) {
      this.patientState = patientState;
    } else {
      try {
        this.patientState = inject(PatientStateService, { optional: true });
      } catch (e) {
        console.debug('[CounterfactualSimulation] PatientStateService DI fallback:', (e as Error)?.message);
        this.patientState = null;
      }
    }
  }

  // Delta Signals
  readonly deltaHbA1c = signal<number>(0);
  readonly deltaSteps = signal<number>(0);
  readonly deltaSleep = signal<number>(0);
  readonly deltaHrv = signal<number>(0);
  readonly deltaSystolic = signal<number>(0);

  // Baseline extraction from PatientStateService
  readonly baselineHbA1c = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const cmp = vitals?.cmpLabs;
    const val = parseFloat(String(cmp?.hba1c || '6.8'));
    return isNaN(val) ? 6.8 : val;
  });

  readonly baselineSteps = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.steps || '5400'));
    return isNaN(val) ? 5400 : val;
  });

  readonly baselineSleep = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.sleepEfficiency || '72'));
    return isNaN(val) ? 72 : val;
  });

  readonly baselineHrv = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const val = parseFloat(String(vitals?.hrvRmssd || '34'));
    return isNaN(val) ? 34 : val;
  });

  readonly baselineSystolic = computed<number>(() => {
    const vitals = this.patientState?.vitals();
    const bp = String(vitals?.bp || '128/82');
    const sys = parseInt(bp.split('/')[0], 10);
    return isNaN(sys) ? 128 : sys;
  });

  // Simulated Values
  readonly simulatedHbA1c = computed<number>(() => {
    const target = this.baselineHbA1c() + this.deltaHbA1c();
    return +(Math.max(4.0, Math.min(14.0, target)).toFixed(1));
  });

  readonly simulatedSteps = computed<number>(() => {
    const target = this.baselineSteps() + this.deltaSteps();
    return Math.max(1000, Math.min(25000, Math.round(target)));
  });

  readonly simulatedSleep = computed<number>(() => {
    const target = this.baselineSleep() + this.deltaSleep();
    return Math.max(30, Math.min(100, Math.round(target)));
  });

  readonly simulatedHrv = computed<number>(() => {
    const target = this.baselineHrv() + this.deltaHrv();
    return Math.max(10, Math.min(150, Math.round(target)));
  });

  readonly simulatedSystolic = computed<number>(() => {
    const target = this.baselineSystolic() + this.deltaSystolic();
    return Math.max(80, Math.min(210, Math.round(target)));
  });

  // Baseline & Simulated Calculated Risk Scores
  readonly baselineSibiScore = computed<number>(() => {
    const hba1c = this.baselineHbA1c();
    const hrv = this.baselineHrv();
    const sys = this.baselineSystolic();
    // Systemic Inflammatory Burden Index (SIBI) calculation
    let sibi = 3.2;
    if (hba1c > 6.5) sibi += (hba1c - 6.5) * 1.4;
    if (hrv < 35) sibi += (35 - hrv) * 0.08;
    if (sys > 130) sibi += (sys - 130) * 0.06;
    return +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));
  });

  readonly simulatedSibiScore = computed<number>(() => {
    const hba1c = this.simulatedHbA1c();
    const hrv = this.simulatedHrv();
    const sys = this.simulatedSystolic();
    let sibi = 3.2;
    if (hba1c > 6.5) sibi += (hba1c - 6.5) * 1.4;
    if (hrv < 35) sibi += (35 - hrv) * 0.08;
    if (sys > 130) sibi += (sys - 130) * 0.06;
    return +(Math.min(10, Math.max(0.5, sibi)).toFixed(1));
  });

  readonly baselineCvRisk = computed<number>(() => {
    const sys = this.baselineSystolic();
    const hba1c = this.baselineHbA1c();
    let risk = 8.5;
    if (sys > 120) risk += (sys - 120) * 0.25;
    if (hba1c > 6.0) risk += (hba1c - 6.0) * 2.2;
    return +(Math.min(50, Math.max(2.0, risk)).toFixed(1));
  });

  readonly simulatedCvRisk = computed<number>(() => {
    const sys = this.simulatedSystolic();
    const hba1c = this.simulatedHbA1c();
    let risk = 8.5;
    if (sys > 120) risk += (sys - 120) * 0.25;
    if (hba1c > 6.0) risk += (hba1c - 6.0) * 2.2;
    return +(Math.min(50, Math.max(2.0, risk)).toFixed(1));
  });

  // Overall Improvement Metrics
  readonly sibiDelta = computed<number>(() => {
    return +(this.simulatedSibiScore() - this.baselineSibiScore()).toFixed(1);
  });

  readonly cvRiskDelta = computed<number>(() => {
    return +(this.simulatedCvRisk() - this.baselineCvRisk()).toFixed(1);
  });

  readonly hasActiveSimulation = computed<boolean>(() => {
    return (
      this.deltaHbA1c() !== 0 ||
      this.deltaSteps() !== 0 ||
      this.deltaSleep() !== 0 ||
      this.deltaHrv() !== 0 ||
      this.deltaSystolic() !== 0
    );
  });

  // Actions
  resetDeltas(): void {
    this.deltaHbA1c.set(0);
    this.deltaSteps.set(0);
    this.deltaSleep.set(0);
    this.deltaHrv.set(0);
    this.deltaSystolic.set(0);
  }

  applySimulationToPatientState(): void {
    if (!this.patientState || !this.hasActiveSimulation()) return;

    // Apply simulated vitals to active PatientStateService
    const currentVitals = this.patientState.vitals();
    const sys = this.simulatedSystolic();
    const dia = 80;

    const currentCmp = currentVitals?.cmpLabs || {};
    this.patientState.vitals.set({
      ...currentVitals,
      steps: String(this.simulatedSteps()),
      sleepEfficiency: String(this.simulatedSleep()),
      hrvRmssd: String(this.simulatedHrv()),
      bp: `${sys}/${dia}`,
      cmpLabs: {
        ...currentCmp,
        hba1c: String(this.simulatedHbA1c())
      }
    });

    // Reset deltas after applying target to active care plan state
    this.resetDeltas();
  }
}
