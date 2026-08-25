import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mrna-lipid-nanoparticle-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-indigo-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-indigo-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧬</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-indigo-300">
              mRNA LNP & Pseudouridine Matrix (Lasker / Karikó Model)
            </h3>
            <p class="text-[10px] text-indigo-400/80">
              Lasker & Breakthrough Prize — N1-Methylpseudouridine (Ψ) mRNA & Ionizable LNP
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-950 border border-indigo-700/60 text-indigo-300">
          Ψ-Modified
        </span>
      </div>

      <!-- mRNA Stability Slider -->
      <div class="space-y-1 mb-4">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-zinc-400 font-bold uppercase">Pseudouridine Substitution Ratio:</span>
          <span class="text-indigo-300 font-bold font-mono">{{ modificationRatio() }}% Ψ</span>
        </div>
        <input type="range" min="0" max="100" step="5" [value]="modificationRatio()" (input)="onRatioChange($event)"
               class="w-full accent-indigo-500 cursor-pointer" />
      </div>

      <!-- LNP Encapsulation Metrics -->
      <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div class="p-2.5 bg-indigo-950/30 border border-indigo-800/30 rounded-xl">
          <span class="text-[10px] text-zinc-400 font-bold uppercase block">TLR7/TLR8 Inflammatory Evasion</span>
          <strong class="text-indigo-300 text-sm font-bold mt-1 block">{{ tlrEvasionScore() }}%</strong>
          <span class="text-[9px] text-zinc-500">Innate Immune Tolerance</span>
        </div>
        <div class="p-2.5 bg-indigo-950/30 border border-indigo-800/30 rounded-xl">
          <span class="text-[10px] text-zinc-400 font-bold uppercase block">Ribosomal Translation Yield</span>
          <strong class="text-indigo-300 text-sm font-bold mt-1 block">{{ translationYield() }}x Baseline</strong>
          <span class="text-[9px] text-zinc-500">Antigen / Protein Expression</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-indigo-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Lasker DeBakey Clinical Medical Research Award</span>
        <span>Ionizable Lipid Nanoparticle Delivery</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class MrnaLipidNanoparticleMatrixComponent {
  readonly modificationRatio = signal<number>(100);

  readonly tlrEvasionScore = computed(() => Math.round((this.modificationRatio() / 100) * 98));
  readonly translationYield = computed(() => (1.0 + (this.modificationRatio() / 100) * 4.2).toFixed(1));

  onRatioChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.modificationRatio.set(val);
  }
}
