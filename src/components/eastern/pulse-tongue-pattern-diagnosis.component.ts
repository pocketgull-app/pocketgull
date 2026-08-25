import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pulse-tongue-pattern-diagnosis',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-teal-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-teal-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">☯️</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-teal-300">
              Pulse & Tongue Pattern Diagnostics (Si-Zhen)
            </h3>
            <p class="text-[10px] text-teal-400/80">
              Four Examinations (Look, Listen, Ask, Touch) Differential
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-teal-950 border border-teal-700/60 text-teal-300">
          Si-Zhen Diagnostic
        </span>
      </div>

      <!-- Pulse & Tongue Subsystem Cards -->
      <div class="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div class="p-3 bg-teal-950/30 border border-teal-800/30 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase text-zinc-400 block">Radial Pulse Quality (Mai)</span>
          <strong class="text-teal-300 text-sm font-bold block">Xian Mai (Wiry / Taut)</strong>
          <p class="text-[10px] text-zinc-400 font-sans">Indicates Liver Qi Stasis & Sub-costal Tension.</p>
        </div>

        <div class="p-3 bg-teal-950/30 border border-teal-800/30 rounded-xl space-y-1">
          <span class="text-[10px] font-bold uppercase text-zinc-400 block">Tongue Substrate & Coating</span>
          <strong class="text-teal-300 text-sm font-bold block">Pale Red, Thick Yellow Coating</strong>
          <p class="text-[10px] text-zinc-400 font-sans">Indicates Interior Damp-Heat & Spleen Weakness.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-teal-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>TCM Pattern Differential Formulation</span>
        <span>Cun-Guan-Chi Radial Palpation</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class PulseTonguePatternDiagnosisComponent {}
