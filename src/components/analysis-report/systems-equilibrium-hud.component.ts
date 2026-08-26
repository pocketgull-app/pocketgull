import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalIntelligenceService } from '../../services/clinical-intelligence.service';
import { PharmacogenomicsService } from '../../services/pharmacogenomics.service';

export type SystemsNavMode = 'overview' | 'crosstalk' | 'lens' | 'gemma' | 'anatomy' | 'auxiliary';

@Component({
  selector: 'app-systems-equilibrium-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-2xl backdrop-blur-md font-mono text-zinc-200 transition-all duration-300">
      
      <!-- Top Systems Header & Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        
        <!-- Left: Systems Branding & Dynamic Acuity State -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black text-sm shadow-[0_0_12px_rgba(20,184,166,0.2)]">
            <span>⟁</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black uppercase tracking-wider text-zinc-100">Macro Systems Equilibrium</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                    [ngClass]="acuityBadgeClass()">
                {{ acuityStatus() }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans">
              Donella Meadows Multi-Loop Feedback & Biophysical Coupling
            </p>
          </div>
        </div>

        <!-- Right: View Modes Navigation -->
        <div class="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <button type="button"
                  (click)="selectMode('overview')"
                  [class.bg-teal-600]="activeMode() === 'overview'"
                  [class.text-white]="activeMode() === 'overview'"
                  [class.text-zinc-400]="activeMode() !== 'overview'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition hover:text-zinc-200 cursor-pointer flex items-center gap-1">
            <span>📊</span>
            <span class="hidden sm:inline">Systems</span>
          </button>
          
          <button type="button"
                  (click)="selectMode('crosstalk')"
                  [class.bg-teal-600]="activeMode() === 'crosstalk'"
                  [class.text-white]="activeMode() === 'crosstalk'"
                  [class.text-zinc-400]="activeMode() !== 'crosstalk'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition hover:text-zinc-200 cursor-pointer flex items-center gap-1">
            <span>⥯</span>
            <span class="hidden sm:inline">Cross-Talk</span>
          </button>

          <button type="button"
                  (click)="selectMode('gemma')"
                  [class.bg-violet-600]="activeMode() === 'gemma'"
                  [class.text-white]="activeMode() === 'gemma'"
                  [class.text-zinc-400]="activeMode() !== 'gemma'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition hover:text-zinc-200 cursor-pointer flex items-center gap-1">
            <span>⚡</span>
            <span>Edge AI</span>
          </button>

          <button type="button"
                  (click)="selectMode('auxiliary')"
                  [class.bg-amber-600]="activeMode() === 'auxiliary'"
                  [class.text-white]="activeMode() === 'auxiliary'"
                  [class.text-zinc-400]="activeMode() !== 'auxiliary'"
                  class="px-2.5 py-1.5 rounded-lg font-bold transition hover:text-zinc-200 cursor-pointer flex items-center gap-1">
            <span>🛠️</span>
            <span class="hidden sm:inline">Tools</span>
          </button>
        </div>
      </div>

      <!-- Biophysical Stocks & Flows Matrix (3 Core Gauges) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
        
        <!-- Metric 1: Autonomic Tone (HRV / Vagal Index) -->
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-teal-500/40 transition">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              Autonomic Tone
            </span>
            <span class="text-xs font-black text-teal-300">{{ autonomicRatio() }}%</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
                 [style.width.%]="autonomicRatio()"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-zinc-400">
            <span>Parasympathetic Vagal</span>
            <span class="text-zinc-300 font-bold">{{ hrValue() }} bpm</span>
          </div>
        </div>

        <!-- Metric 2: Metabolic Reserve Stock -->
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              Metabolic Reserve
            </span>
            <span class="text-xs font-black text-amber-300">{{ metabolicBuffer() }}%</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                 [style.width.%]="metabolicBuffer()"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-zinc-400">
            <span>Mitochondrial Stock</span>
            <span class="text-zinc-300 font-bold">BP {{ bpValue() }}</span>
          </div>
        </div>

        <!-- Metric 3: Systemic Inflammatory Load -->
        <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-rose-500/40 transition">
          <div class="flex items-center justify-between text-xs mb-1">
            <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-rose-400"></span>
              Inflammatory Burden
            </span>
            <span class="text-xs font-black text-rose-300">{{ inflammatoryLoad() }}%</span>
          </div>
          <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full transition-all duration-500"
                 [style.width.%]="inflammatoryLoad()"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-zinc-400">
            <span>Active Issues ({{ issuesCount() }})</span>
            <span class="text-zinc-300 font-bold">PGx {{ pgxProfile() }}</span>
          </div>
        </div>

      </div>

    </div>
  `
})
export class SystemsEquilibriumHudComponent {
  private readonly state = inject(PatientStateService);
  private readonly intel = inject(ClinicalIntelligenceService);
  private readonly pgx = inject(PharmacogenomicsService);

  readonly activeMode = signal<SystemsNavMode>('overview');
  readonly modeChange = output<SystemsNavMode>();

  readonly hrValue = computed(() => {
    const v = this.state.vitals();
    return parseFloat(v.hr || '72') || 72;
  });

  readonly bpValue = computed(() => {
    const v = this.state.vitals();
    return v.bp || '120/80';
  });

  readonly issuesCount = computed(() => Object.keys(this.state.issues()).length);

  readonly pgxProfile = computed(() => {
    const profile = this.pgx.activeProfile();
    const cyp = profile?.variants.find(v => v.gene === 'CYP2C19');
    return cyp ? `${cyp.gene} ${cyp.diplotype}` : 'CYP2C19 *1/*1 Norm';
  });

  readonly autonomicRatio = computed(() => {
    const hr = this.hrValue();
    const normalized = Math.max(20, Math.min(95, 100 - (hr - 55) * 1.2));
    return Math.round(normalized);
  });

  readonly metabolicBuffer = computed(() => {
    const bp = this.bpValue();
    const parts = bp.split('/');
    const sys = parseInt(parts[0], 10) || 120;
    const dia = parseInt(parts[1], 10) || 80;
    const dev = Math.abs(sys - 120) + Math.abs(dia - 80);
    return Math.max(25, Math.min(98, Math.round(100 - dev * 0.8)));
  });

  readonly inflammatoryLoad = computed(() => {
    const count = this.issuesCount();
    return Math.max(15, Math.min(90, 20 + count * 15));
  });

  readonly acuityStatus = computed(() => {
    if (this.state.isEmergencyMode()) return 'STAT Emergency';
    const metrics = this.intel.analysisMetrics();
    if (metrics && metrics.complexity > 7) return 'High Complexity';
    if (this.inflammatoryLoad() > 60) return 'Elevated Stress';
    return 'Homeostatic Equilibrium';
  });

  readonly acuityBadgeClass = computed(() => {
    const s = this.acuityStatus();
    if (s.includes('STAT')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (s.includes('Elevated') || s.includes('High')) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  });

  selectMode(mode: SystemsNavMode): void {
    this.activeMode.set(mode);
    this.modeChange.emit(mode);
  }
}
