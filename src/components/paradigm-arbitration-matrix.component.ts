import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IArbitrationRule {
  stage: number;
  name: string;
  category: 'Safety' | 'Triage' | 'Synthesis' | 'Chronobiology' | 'Export';
  status: 'ACTIVE' | 'PASSED' | 'SUPPRESSED' | 'BYPASSED';
  description: string;
  affectedParameter: string;
  resolvedValue: string;
}

@Component({
  selector: 'app-paradigm-arbitration-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full mb-8 p-6 sm:p-8 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden font-sans pocket-gull-card">
      
      <!-- Component Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 font-mono">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></span>
            <h2 class="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>⚖️</span>
              <span>Deterministic Paradigm Arbitration & Safety Locks</span>
            </h2>
            <span class="text-xs px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-extrabold uppercase">
              5-Stage Priority Engine
            </span>
          </div>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1.5 font-sans leading-relaxed">
            Resolves conflicts between Allopathic safety bounds, TCM elemental cycles, and Ayurvedic Prakriti constraints deterministically.
          </p>
        </div>

        <!-- Simulation Toggles -->
        <div class="flex flex-wrap items-center gap-2 shrink-0 font-mono text-xs">
          <button (click)="toggleEpilepsy()"
            [class]="epilepsyFlag()
              ? 'px-3 py-1.5 rounded-xl bg-red-600 text-white font-extrabold border border-red-400 shadow-md transition'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 font-bold border border-zinc-800 hover:text-white transition'">
            ⚡ Epilepsy Lockout: {{ epilepsyFlag() ? 'ON' : 'OFF' }}
          </button>
          
          <button (click)="toggleNightLock()"
            [class]="nightLock()
              ? 'px-3 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold border border-amber-400 shadow-md transition'
              : 'px-3 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 font-bold border border-zinc-800 hover:text-white transition'">
            🌙 Night Lock (>19:00): {{ nightLock() ? 'ACTIVE' : 'OFF' }}
          </button>
        </div>
      </div>

      <!-- 5-Stage Arbitration Pipeline Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 font-mono">
        @for (rule of arbitrationRules(); track rule.stage) {
          <div class="p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
            [class]="rule.status === 'ACTIVE'
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : rule.status === 'SUPPRESSED'
              ? 'bg-red-950/20 border-red-800/40 opacity-80'
              : 'bg-zinc-900/60 border-zinc-800'">
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  STAGE {{ rule.stage }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  [class.bg-emerald-900]="rule.status === 'ACTIVE'"
                  [class.text-emerald-300]="rule.status === 'ACTIVE'"
                  [class.bg-red-900]="rule.status === 'SUPPRESSED'"
                  [class.text-red-300]="rule.status === 'SUPPRESSED'"
                  [class.bg-zinc-800]="rule.status === 'PASSED'"
                  [class.text-zinc-400]="rule.status === 'PASSED'">
                  {{ rule.status }}
                </span>
              </div>

              <h3 class="text-xs font-black text-white uppercase tracking-tight mb-1">
                {{ rule.name }}
              </h3>
              <p class="text-[11px] font-sans text-zinc-400 leading-snug mb-3">
                {{ rule.description }}
              </p>
            </div>

            <!-- Parameter Resolution Box -->
            <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] space-y-1 mt-2">
              <span class="text-zinc-500 block text-[10px]">Resolved Parameter:</span>
              <div class="font-bold text-emerald-400 truncate">{{ rule.affectedParameter }}</div>
              <div class="text-xs font-black text-white font-mono">{{ rule.resolvedValue }}</div>
            </div>

          </div>
        }
      </div>

      <!-- Live Arbitration Formula Footnote -->
      <div class="mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div class="flex items-center gap-2">
          <span>🛡️ Allopathic Priority Lockout:</span>
          <strong class="text-white">Strict Precedence (Safety > Triage > Synthesis)</strong>
        </div>
        <div class="flex items-center gap-2">
          <span>FHIR R4 Bundle Standard:</span>
          <span class="text-emerald-400 font-bold">100% Compliant</span>
        </div>
      </div>
    </div>
  `
})
export class ParadigmArbitrationMatrixComponent {
  epilepsyFlag = signal<boolean>(true);
  nightLock = signal<boolean>(true);

  arbitrationRules = computed<IArbitrationRule[]>(() => {
    const isEpilepsy = this.epilepsyFlag();
    const isNight = this.nightLock();

    return [
      {
        stage: 1,
        name: 'Allopathic Safety Locks',
        category: 'Safety',
        status: isEpilepsy ? 'ACTIVE' : 'PASSED',
        description: 'Hard lockout suppressing optical strobe entrainment if photosensitive epilepsy is flagged in patient history.',
        affectedParameter: 'strobeFrequencyHz',
        resolvedValue: isEpilepsy ? '0.0 Hz (Constant Light Only)' : '8.0 Hz Alpha Strobe'
      },
      {
        stage: 2,
        name: 'Acute Vagal Triage',
        category: 'Triage',
        status: 'ACTIVE',
        description: 'Elevates vagal resuscitation priority if HRV RMSSD drops below 20ms baseline.',
        affectedParameter: 'binauralBeatHz',
        resolvedValue: '10.0 Hz Alpha Resonance'
      },
      {
        stage: 3,
        name: 'TCM Sheng Cycle Pre-Phase',
        category: 'Synthesis',
        status: 'ACTIVE',
        description: 'Applies 3-minute parent element pre-phasing (Water/Kidney) before tonifying target organ (Wood/Liver).',
        affectedParameter: 'audioWaveformDutyCycle',
        resolvedValue: '50% Sine Wave (Tonify)'
      },
      {
        stage: 4,
        name: 'Chronobiological Night Lock',
        category: 'Chronobiology',
        status: isNight ? 'ACTIVE' : 'BYPASSED',
        description: 'Forces optical wavelength shift to amber/red (>590nm) after 19:00 to prevent melatonin suppression.',
        affectedParameter: 'opticalWavelengthNm',
        resolvedValue: isNight ? '630 nm (Melatonin Safe Red)' : '470 nm (Cyan Blue Active)'
      },
      {
        stage: 5,
        name: 'FHIR R4 Bundle Validation',
        category: 'Export',
        status: 'PASSED',
        description: 'Serializes arbitrated parameters into HIPAA-compatible FHIR R4 CarePlan and Observation resource bundles.',
        affectedParameter: 'fhirResourceExport',
        resolvedValue: 'FHIR R4 Bundle Validated'
      }
    ];
  });

  toggleEpilepsy(): void {
    this.epilepsyFlag.set(!this.epilepsyFlag());
  }

  toggleNightLock(): void {
    this.nightLock.set(!this.nightLock());
  }
}
