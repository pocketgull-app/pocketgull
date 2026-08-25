import { Injectable, inject, computed, signal } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ILeastActionHabit {
  habitName: string;
  actionCostUnits: number; // Lower is less metabolic friction
  qalyYield: number;      // Higher is greater health return
  leverageRatio: number; // qalyYield / actionCostUnits
  category: 'Circadian' | 'Vagal' | 'Nutritional' | 'Movement';
}

export interface IPhysicBiophysicsTelemetry {
  // 1. Hamilton's Principle of Least Action
  leastActionPath: ILeastActionHabit[];
  totalActionFrictionScore: number;

  // 2. Friston Free Energy & Thermodynamic Negentropy
  variationalFreeEnergyScore: number; // Lower is more stable (0-100)
  negentropicHomeostasisScore: number; // Higher is better entropy export (0-100)
  markovBlanketStatus: 'Intact & Exporting' | 'Moderate Noise' | 'Leaky & Entropic';

  // 3. Noether's Temporal Symmetry
  circadianNoetherSymmetryPercent: number; // 0-100%
  energyConservationIndex: number; // 0-10

  // 4. Quantum Vagal Co-Regulation
  entangledVagalCoherencePercent: number; // 0-100%
  dyadicVagalEntrainmentBpm: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhysicsBiophysicsService {
  private patientState = inject(PatientStateService);

  readonly physicsTelemetry = computed<IPhysicBiophysicsTelemetry>(() => this.computePhysicsTelemetry());

  computePhysicsTelemetry(stateOverride?: any): IPhysicBiophysicsTelemetry {
    const state = stateOverride || this.patientState;
    const vitals = state.vitals();
    const hr = parseFloat(vitals.hr) || 72;
    const temp = parseFloat(vitals.temp) || 98.6;
    const issues = state.issues();
    const activeIssueCount = Object.values(issues).flat().length;

    // 1. Principle of Least Action (Hamiltonian S = ∫(T - V)dt)
    const habitStack: ILeastActionHabit[] = [
      { habitName: 'Morning Sun Photons (SCN Reset)', actionCostUnits: 1.2, qalyYield: 1.8, leverageRatio: 1.5, category: 'Circadian' as const },
      { habitName: '0.1 Hz Vagal Coherent Resonant Breathing', actionCostUnits: 0.8, qalyYield: 2.1, leverageRatio: 2.625, category: 'Vagal' as const },
      { habitName: 'Polyphenol & Anti-Inflammatory Fasting', actionCostUnits: 2.0, qalyYield: 2.4, leverageRatio: 1.2, category: 'Nutritional' as const },
      { habitName: 'Zone 2 Mitochondrial Aerobic Walk', actionCostUnits: 2.5, qalyYield: 2.7, leverageRatio: 1.08, category: 'Movement' as const }
    ].sort((a, b) => b.leverageRatio - a.leverageRatio);

    const totalActionFrictionScore = parseFloat((habitStack.reduce((acc, h) => acc + h.actionCostUnits, 0) / habitStack.length).toFixed(2));

    // 2. Friston Free Energy & Thermodynamic Negentropy (F = Internal Disorder + Surprise)
    const freeEnergy = Math.min(100, Math.max(10, (activeIssueCount * 12) + (hr > 85 ? 20 : 5) + (temp > 99.5 ? 25 : 5)));
    const negentropicScore = Math.max(0, 100 - freeEnergy);
    const markovBlanketStatus = negentropicScore > 75 ? 'Intact & Exporting' : (negentropicScore > 45 ? 'Moderate Noise' : 'Leaky & Entropic');

    // 3. Noether's Temporal Symmetry (Circadian energy conservation)
    const circadianNoetherSymmetryPercent = Math.min(100, Math.max(20, 100 - (activeIssueCount * 8) - (hr > 90 ? 15 : 0)));
    const energyConservationIndex = parseFloat((circadianNoetherSymmetryPercent / 10).toFixed(1));

    // 4. Quantum Vagal Co-Regulation (Inter-individual entrainment)
    const entangledVagalCoherencePercent = Math.min(99, Math.max(40, 88 - (activeIssueCount * 5)));
    const dyadicVagalEntrainmentBpm = hr > 80 ? 60 : 72;

    return {
      leastActionPath: habitStack,
      totalActionFrictionScore,
      variationalFreeEnergyScore: freeEnergy,
      negentropicHomeostasisScore: negentropicScore,
      markovBlanketStatus,
      circadianNoetherSymmetryPercent,
      energyConservationIndex,
      entangledVagalCoherencePercent,
      dyadicVagalEntrainmentBpm
    };
  }
}
