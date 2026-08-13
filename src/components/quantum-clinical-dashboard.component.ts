import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  QuantumClinicalEngineService, 
  IQuantumDrugBindingResult,
  INvMagnetometryResult,
  IQaoaCohortResult,
  IDuneKineticTransportResult,
  IPqcKeyAndEncryptionResult
} from '../services/quantum-clinical-engine.service';

type ActiveTab = 'vqe-qaoa' | 'sensing' | 'dune' | 'pqc';

@Component({
  selector: 'app-quantum-clinical-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-zinc-950 rounded-2xl border border-purple-900/50 text-gray-100 shadow-2xl">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">⚛️</span>
            <h2 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
              DOE Quantum Outposts & QIS Intelligence Suite
            </h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              64-Qubit DOE Outpost Register
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-1">
            Quantum Sensing, High-Energy DUNE Transport Kinetics, QAOA Cohort Optimization & NIST PQC Sovereignty.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 overflow-x-auto">
          <button 
            (click)="activeTab.set('vqe-qaoa')"
            [class.bg-purple-600]="activeTab() === 'vqe-qaoa'"
            [class.text-white]="activeTab() === 'vqe-qaoa'"
            [class.text-gray-400]="activeTab() !== 'vqe-qaoa'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition">
            ⚛️ VQE & QAOA
          </button>
          <button 
            (click)="activeTab.set('sensing')"
            [class.bg-purple-600]="activeTab() === 'sensing'"
            [class.text-white]="activeTab() === 'sensing'"
            [class.text-gray-400]="activeTab() !== 'sensing'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition">
            💎 NV Sensing
          </button>
          <button 
            (click)="activeTab.set('dune')"
            [class.bg-purple-600]="activeTab() === 'dune'"
            [class.text-white]="activeTab() === 'dune'"
            [class.text-gray-400]="activeTab() !== 'dune'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition">
            🌌 DUNE Kinetics
          </button>
          <button 
            (click)="activeTab.set('pqc')"
            [class.bg-purple-600]="activeTab() === 'pqc'"
            [class.text-white]="activeTab() === 'pqc'"
            [class.text-gray-400]="activeTab() !== 'pqc'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition">
            🛡️ NIST PQC
          </button>
        </div>
      </div>

      <!-- Hardware Register Status Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-purple-400 font-bold mb-1">Quantum Hardware Outpost</div>
          <div class="text-sm font-semibold text-gray-200">{{ quantum.circuitState().provider }}</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-pink-400 font-bold mb-1">Qubits & Measurement Shots</div>
          <div class="text-sm font-semibold text-gray-200 font-mono">{{ quantum.circuitState().numQubits }} Qubits &bull; {{ quantum.circuitState().measurementShots }} Shots</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-emerald-400 font-bold mb-1">Gate Fidelity</div>
          <div class="text-sm font-semibold text-emerald-400 font-mono">{{ (quantum.circuitState().fidelity * 100).toFixed(2) }}%</div>
        </div>

        <div class="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800">
          <div class="text-[11px] text-indigo-400 font-bold mb-1">Active QIS Algorithm</div>
          <div class="text-sm font-semibold text-indigo-300 font-mono">{{ quantum.circuitState().algorithm }}</div>
        </div>
      </div>

      <!-- Tab Content 1: VQE & QAOA -->
      @if (activeTab() === 'vqe-qaoa') {
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div>
              <h3 class="text-sm font-bold text-purple-300">Variational Quantum Eigensolver & QAOA Cohort Optimization</h3>
              <p class="text-xs text-gray-400">Simulate molecular ground-state binding energy or solve NP-hard hospital triage allocations.</p>
            </div>
            <div class="flex gap-2">
              <button 
                (click)="runVqeDocking()"
                [disabled]="quantum.isExecuting()"
                class="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition">
                ⚡ Run VQE Docking
              </button>
              <button 
                (click)="runQaoaTriage()"
                [disabled]="quantum.isExecuting()"
                class="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition">
                ⚡ Run QAOA Triage
              </button>
            </div>
          </div>

          @if (dockingResult()) {
            <div class="p-4 bg-purple-950/30 rounded-xl border border-purple-700/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-purple-300">VQE Ground-State Binding Result</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/50 text-purple-300 border border-purple-700/50">VQE Solved</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Candidate Molecule:</span>
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

          @if (qaoaResult()) {
            <div class="p-4 bg-pink-950/30 rounded-xl border border-pink-700/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-pink-300">QAOA Hospital Cohort Triage Result</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-900/50 text-pink-300 border border-pink-700/50">QAOA Solved</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Cohort Patients:</span>
                  <span class="font-bold text-gray-200 font-mono">{{ qaoaResult()?.cohortSize }} Patients</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Friction Reduction:</span>
                  <span class="font-bold text-pink-400 font-mono">{{ qaoaResult()?.maxCostReductionPercent }}%</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Optimized Score:</span>
                  <span class="font-bold text-emerald-400 font-mono">{{ qaoaResult()?.optimizedTriageScore }}/100</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Circuit Depth:</span>
                  <span class="font-bold text-purple-300 font-mono">{{ qaoaResult()?.circuitDepth }} Layers</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab Content 2: NV-Center Quantum Sensing -->
      @if (activeTab() === 'sensing') {
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div>
              <h3 class="text-sm font-bold text-cyan-300">Room-Temperature NV-Center Diamond Quantum Magnetometry</h3>
              <p class="text-xs text-gray-400">Non-invasive MCG/MEG magnetometry detecting femtotesla magnetic fields from cardiac action potentials.</p>
            </div>
            <button 
              (click)="runNvSensing()"
              [disabled]="quantum.isExecuting()"
              class="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition">
              💎 Acquire NV Magnetometry
            </button>
          </div>

          @if (nvResult()) {
            <div class="p-4 bg-cyan-950/30 rounded-xl border border-cyan-700/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-cyan-300">NV Diamond Quantum Telemetry Output</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-900/50 text-cyan-300 border border-cyan-700/50">Signal Acquired</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Anatomical Region:</span>
                  <span class="font-bold text-gray-200">{{ nvResult()?.targetRegion }}</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Magnetic Flux Density:</span>
                  <span class="font-bold text-cyan-400 font-mono">{{ nvResult()?.magneticFluxFemtotesla }} fT</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Spatial Resolution:</span>
                  <span class="font-bold text-emerald-400 font-mono">{{ nvResult()?.spatialResolutionMicrons }} µm</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Spin State:</span>
                  <span class="font-bold text-purple-300 font-mono">{{ nvResult()?.quantumSpinState }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab Content 3: DUNE Particle Transport Kinetics -->
      @if (activeTab() === 'dune') {
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div>
              <h3 class="text-sm font-bold text-amber-300">DUNE High-Energy Particle Transport Kinetics</h3>
              <p class="text-xs text-gray-400">Particle physics collision transport differential equations applied to cell membrane ion channels.</p>
            </div>
            <button 
              (click)="runDuneTransport()"
              [disabled]="quantum.isExecuting()"
              class="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition">
              🌌 Run DUNE Transport Simulation
            </button>
          </div>

          @if (duneResult()) {
            <div class="p-4 bg-amber-950/30 rounded-xl border border-amber-700/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-amber-300">DUNE Particle Kinetic Simulation Output</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-900/50 text-amber-300 border border-amber-700/50">Transport Solved</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Target Ion Channel:</span>
                  <span class="font-bold text-gray-200">{{ duneResult()?.channelType }}</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Particle Flux Density:</span>
                  <span class="font-bold text-amber-400 font-mono">{{ duneResult()?.fluxDensityParticlesSec?.toExponential(2) }} /sec</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Mitochondrial ATP Yield:</span>
                  <span class="font-bold text-emerald-400 font-mono">{{ duneResult()?.mitochondrialAtpYieldMmol }} mmol</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Cross Section (σ):</span>
                  <span class="font-bold text-purple-300 font-mono">{{ duneResult()?.particleCrossSectionBarns }} b</span>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Tab Content 4: NIST Post-Quantum Security -->
      @if (activeTab() === 'pqc') {
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div>
              <h3 class="text-sm font-bold text-indigo-300">NIST Post-Quantum Cryptography (PQC) Lattice Sovereignty</h3>
              <p class="text-xs text-gray-400">Generate NIST ML-KEM-1024 (Kyber) lattice keys and encrypt HIPAA FHIR R4 Bundle payloads.</p>
            </div>
            <button 
              (click)="runPqcEncryption()"
              [disabled]="quantum.isExecuting()"
              class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition">
              🛡️ Generate PQC Lattice Key & Encrypt
            </button>
          </div>

          @if (pqcResult()) {
            <div class="p-4 bg-indigo-950/30 rounded-xl border border-indigo-700/50">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold text-indigo-300">NIST PQC Key & Lattice Ciphertext Verification</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">Verified Lattice Secure</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">PQC Standard Algorithm:</span>
                  <span class="font-bold text-indigo-300 font-mono">{{ pqcResult()?.algorithm }}</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Public Key Fingerprint:</span>
                  <span class="font-bold text-gray-200 font-mono text-[10px]">{{ pqcResult()?.publicKeyFingerprint }}</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Lattice Dimension:</span>
                  <span class="font-bold text-emerald-400 font-mono">{{ pqcResult()?.latticeDimension }}d ({{ pqcResult()?.postQuantumSecurityBits }}-bit)</span>
                </div>
                <div class="p-2.5 bg-black/60 rounded-lg border border-zinc-800">
                  <span class="text-gray-400 block text-[10px]">Ciphertext Payload:</span>
                  <span class="font-bold text-pink-300 font-mono">{{ pqcResult()?.ciphertextLengthBytes }} bytes</span>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class QuantumClinicalDashboardComponent {
  readonly quantum = inject(QuantumClinicalEngineService);

  readonly activeTab = signal<ActiveTab>('vqe-qaoa');

  readonly dockingResult = signal<IQuantumDrugBindingResult | null>(null);
  readonly nvResult = signal<INvMagnetometryResult | null>(null);
  readonly qaoaResult = signal<IQaoaCohortResult | null>(null);
  readonly duneResult = signal<IDuneKineticTransportResult | null>(null);
  readonly pqcResult = signal<IPqcKeyAndEncryptionResult | null>(null);

  async runVqeDocking(): Promise<void> {
    const res = await this.quantum.runVqeDrugDocking();
    this.dockingResult.set(res);
  }

  async runQaoaTriage(): Promise<void> {
    const res = await this.quantum.runQaoaCohortTriage();
    this.qaoaResult.set(res);
  }

  async runNvSensing(): Promise<void> {
    const res = await this.quantum.runNvCenterMagnetometry();
    this.nvResult.set(res);
  }

  async runDuneTransport(): Promise<void> {
    const res = await this.quantum.runDuneKineticTransport();
    this.duneResult.set(res);
  }

  async runPqcEncryption(): Promise<void> {
    const res = await this.quantum.encryptFhirBundlePqc();
    this.pqcResult.set(res);
  }
}
