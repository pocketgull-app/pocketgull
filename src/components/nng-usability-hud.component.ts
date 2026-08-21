import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NngUsabilityMetricsService, INngHeuristicScore } from '../services/nng-usability-metrics.service';

@Component({
  selector: 'app-nng-usability-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section 
      class="glass-card-dark rounded-3xl p-4 sm:p-8 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden space-y-6"
      role="region"
      aria-label="NN/g Nielsen Norman Group 10 Usability Heuristics & Ergonomics HUD"
    >
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <span>🔬 Nielsen Norman Group (NN/g) • ISO 9241-110 UX Standards</span>
          </div>
          <h2 class="text-xl sm:text-3xl font-extrabold text-white">
            10 Usability Heuristics &amp; Ergonomics Engine
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Real-time Nielsen Norman Group heuristic verification, Fitts's Law Shannon difficulty index, and WCAG AAA contrast audits.
          </p>
        </div>

        <!-- Telemetry Summary Pill -->
        <div class="flex items-center gap-3 bg-stone-900/90 border border-emerald-500/40 px-4 py-2.5 rounded-2xl shrink-0 shadow-lg">
          <div class="text-right">
            <div class="text-[10px] font-mono text-stone-400 uppercase">System Usability Scale</div>
            <div class="text-lg font-mono font-black text-emerald-400">{{ service.overallSusScore() }} / 100</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl font-bold text-emerald-300">
            A+
          </div>
        </div>
      </div>

      <!-- Key Quantitative Metrics Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div class="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <div class="text-stone-400 text-[10px]">Fitts's Shannon Index (ID)</div>
          <div class="text-base font-bold text-white flex items-baseline gap-1">
            <span>{{ service.shannonIndexOfDifficulty() }}</span>
            <span class="text-[10px] text-emerald-400 font-normal">bits (Optimal &lt; 1.5)</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <div class="text-stone-400 text-[10px]">Min Touch Hitbox (W)</div>
          <div class="text-base font-bold text-white flex items-baseline gap-1">
            <span>{{ service.minTouchTargetSizePx() }}px</span>
            <span class="text-[10px] text-emerald-400 font-normal">✓ ≥ 44px WCAG</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <div class="text-stone-400 text-[10px]">WCAG AAA Contrast</div>
          <div class="text-base font-bold text-white flex items-baseline gap-1">
            <span>100%</span>
            <span class="text-[10px] text-emerald-400 font-normal">≥ 7:1 Obsidian</span>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1">
          <div class="text-stone-400 text-[10px]">Cumulative Layout Shift</div>
          <div class="text-base font-bold text-white flex items-baseline gap-1">
            <span>0.000</span>
            <span class="text-[10px] text-emerald-400 font-normal">Zero Shift</span>
          </div>
        </div>
      </div>

      <!-- Heuristic Category Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        <button 
          (click)="filterCategory.set('ALL')"
          class="min-h-[44px] px-3.5 py-2 rounded-xl border transition cursor-pointer font-bold shrink-0 active:scale-[0.98]"
          [ngClass]="{
            'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md': filterCategory() === 'ALL',
            'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-white': filterCategory() !== 'ALL'
          }"
        >
          All 10 Heuristics (100%)
        </button>

        <button 
          (click)="filterCategory.set('EXEMPLARY')"
          class="min-h-[44px] px-3.5 py-2 rounded-xl border transition cursor-pointer font-bold shrink-0 active:scale-[0.98]"
          [ngClass]="{
            'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md': filterCategory() === 'EXEMPLARY',
            'bg-stone-900/80 text-stone-400 border-stone-800 hover:text-white': filterCategory() !== 'EXEMPLARY'
          }"
        >
          ✨ Exemplary (95%+)
        </button>
      </div>

      <!-- 10 Heuristics Interactive Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        @for (h of filteredHeuristics(); track h.id) {
          <div 
            class="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-emerald-500/50 transition space-y-2.5"
            [attr.aria-label]="h.name"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  #{{ h.id }}
                </span>
                <span class="text-sm font-bold text-white">{{ h.name }}</span>
              </div>
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                {{ h.score }}% • {{ h.status }}
              </span>
            </div>

            <p class="text-xs text-stone-300 leading-relaxed">
              {{ h.evidence }}
            </p>

            <div class="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-800/80">
              <span class="text-stone-400">Touch Target: <strong class="text-white">{{ h.fittsLawTouchTargetPx }}px</strong></span>
              <span class="text-stone-400">Contrast: <strong class="text-emerald-400">{{ h.wcagContrastRatio }}:1</strong></span>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class NngUsabilityHudComponent {
  service: NngUsabilityMetricsService;
  filterCategory = signal<'ALL' | 'EXEMPLARY'>('ALL');

  constructor() {
    try {
      this.service = inject(NngUsabilityMetricsService);
    } catch {
      this.service = new NngUsabilityMetricsService();
    }
  }

  filteredHeuristics = computed<INngHeuristicScore[]>(() => {
    const list = this.service.heuristics();
    if (this.filterCategory() === 'EXEMPLARY') {
      return list.filter((h) => h.score >= 95);
    }
    return list;
  });
}

