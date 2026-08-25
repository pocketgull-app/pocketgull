import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IMetaboliteSignal {
  scfa: string;
  source: string;
  vagalTarget: string;
  effect: string;
}

@Component({
  selector: 'app-scfa-microbiome-vagal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-emerald-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-emerald-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧫</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-emerald-300">
              SCFA Gut-Brain Vagal Axis (AAAS Abelson Model)
            </h3>
            <p class="text-[10px] text-emerald-400/80">
              AAAS Golden Goose Prize — Short-Chain Fatty Acid Neuro-Immune Signaling
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-950 border border-emerald-700/60 text-emerald-300">
          FFAR2/3 Active
        </span>
      </div>

      <!-- Metabolite Signals Grid -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (sig of signals; track sig.scfa) {
          <div class="p-2.5 bg-emerald-950/30 border border-emerald-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-emerald-200 flex items-center gap-2">
                <span>{{ sig.scfa }}</span>
                <span class="text-[9px] px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700/40 rounded text-emerald-300">{{ sig.vagalTarget }}</span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">Source: {{ sig.source }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-bold text-emerald-300 block">{{ sig.effect }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-emerald-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>AAAS Metagenomic Gut-Brain Signaling</span>
        <span>Nodose Ganglion Vagal Activation</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class ScfaMicrobiomeVagalComponent {
  readonly signals: IMetaboliteSignal[] = [
    {
      scfa: 'Butyrate (C4)',
      source: 'Fermentation of Resistant Starches (Bifidobacteria)',
      vagalTarget: 'FFAR3 (GPR41)',
      effect: '+45% Mucosal Barrier Integrity & Anti-Inflammatory'
    },
    {
      scfa: 'Propionate (C3)',
      source: 'Inulin & Pectin Fiber Degradation (Bacteroidetes)',
      vagalTarget: 'FFAR2 (GPR43)',
      effect: 'Gluconeogenesis Signal & Liver Lipid Regulation'
    },
    {
      scfa: 'Acetate (C2)',
      source: 'Dietary Fiber Polyphenol Breakdown (Akkermansia)',
      vagalTarget: 'Central Hypothalamus',
      effect: 'Crosses BBB to Suppress Appetite'
    }
  ];
}
