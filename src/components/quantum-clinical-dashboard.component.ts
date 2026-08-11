import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantumClinicalEngineService, IQuantumDrugBindingResult } from '../services/quantum-clinical-engine.service';

@Component({
  selector: 'app-quantum-clinical-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-purple-900/50 text-gray-100 shadow-2xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚛️</span>
            <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              Quantum Clinical Intelligence & VQE Molecular Engine
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              32-Qubit Hardware Register
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Hybrid Quantum-Classical VQE Molecular Docking & QAOA Clinical Trial Cohort Optimization.
          </p>
        </div>

        <button 
          (click)="runDockingSimulation()"
          [disabled]="quantum.isExecuting()"
          class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-lg">
          <span>{{ quantum.isExecuting() ? '⚛️ Simulating Quantum Circuit...' : '⚡ Run VQE Quantum Docking' }}</span>
        </button>
      </div>

      <!-- Quantum Register Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-purple-400 font-bold mb-1">Quantum Hardware Provider</div>
          <div class="text-sm font-semibold text-gray-200">{{ quantum.circuitState().provider }}</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-pink-400 font-bold mb-1">Active Qubits & Gate Shots</div>
          <div class="text-sm font-semibold text-gray-200 font-mono">{{ quantum.circuitState().numQubits }} Qubits &bull; {{ quantum.circuitState().measurementShots }} Shots</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-emerald-400 font-bold mb-1">Quantum State Fidelity</div>
          <div class="text-sm font-semibold text-emerald-400 font-mono">{{ (quantum.circuitState().fidelity * 100).toFixed(2) }}%</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-indigo-400 font-bold mb-1">Post-Quantum Security</div>
          <div class="text-sm font-semibold text-indigo-300 font-mono">NIST ML-KEM (Kyber)</div>
        </div>
      </div>

      <!-- VQE Binding Output Card -->
      @if (dockingResult()) {
        <div class="p-4 bg-purple-950/30 rounded-xl border border-purple-700/50">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-purple-300">VQE Ground-State Binding Affinity Result:</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/50 text-purple-300 border border-purple-700/50">Quantum Solved</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
              <span class="text-gray-400 block text-[10px]">Molecule Candidate:</span>
              <span class="font-bold text-gray-200">{{ dockingResult()?.moleculeName }}</span>
            </div>

            <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
              <span class="text-gray-400 block text-[10px]">Target Receptor:</span>
              <span class="font-bold text-gray-200">{{ dockingResult()?.targetProtein }}</span>
            </div>

            <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
              <span class="text-gray-400 block text-[10px]">Binding Free Energy (ΔG):</span>
              <span class="font-bold text-emerald-400 font-mono">{{ dockingResult()?.bindingAffinityKcalMol }} kcal/mol</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class QuantumClinicalDashboardComponent {
  readonly quantum = inject(QuantumClinicalEngineService);
  readonly dockingResult = signal<IQuantumDrugBindingResult | null>(null);

  async runDockingSimulation(): Promise<void> {
    const res = await this.quantum.runVqeDrugDocking();
    this.dockingResult.set(res);
  }
}
