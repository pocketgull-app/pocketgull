import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vata-pitta-kapha-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-amber-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-amber-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🪷</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-amber-300">
              Vata-Pitta-Kapha Dosha & Agni Matrix
            </h3>
            <p class="text-[10px] text-amber-400/80">
              Ayurvedic Tridosha Equilibrium & Digestive Fire Dynamics
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-950 border border-amber-700/60 text-amber-300">
          Tridosha Balancer
        </span>
      </div>

      <!-- Tridosha Proportion Gauges -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="p-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase text-amber-300 block">🌬️ Vata (Air)</span>
          <strong class="text-amber-200 text-sm font-bold block">42% (Elevated)</strong>
          <span class="text-[9px] text-zinc-400">Dryness & Motility</span>
        </div>

        <div class="p-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase text-amber-300 block">🔥 Pitta (Fire)</span>
          <strong class="text-amber-200 text-sm font-bold block">35% (Balanced)</strong>
          <span class="text-[9px] text-zinc-400">Agni Transformation</span>
        </div>

        <div class="p-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase text-amber-300 block">🌊 Kapha (Earth)</span>
          <strong class="text-amber-200 text-sm font-bold block">23% (Baseline)</strong>
          <span class="text-[9px] text-zinc-400">Stability & Cohesion</span>
        </div>
      </div>

      <!-- Agni Metabolic Fire Bar -->
      <div class="space-y-1.5 mt-auto">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-400">Agni Metabolic Fire Status:</span>
          <strong class="text-amber-300">Vishamagni (Irregular Fire)</strong>
        </div>
        <div class="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-amber-950">
          <div class="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[65%]"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class VataPittaKaphaMatrixComponent {}
