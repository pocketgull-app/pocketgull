import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IChronotherapyItem {
  id: string;
  category: string;
  name: string;
  optimalTime: string;
  targetGene: string;
  rationale: string;
}

@Component({
  selector: 'app-hall-chronotherapy-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-amber-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-amber-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">⏰</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-amber-300">
              Circadian Chronotherapy Matrix (Hall/Rosbash/Young)
            </h3>
            <p class="text-[10px] text-amber-400/80">
              2017 Nobel Prize — SCN Clock Genes (PER1/PER2/CRY) Dosing Schedule
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-amber-950 border border-amber-700/60 text-amber-300">
          SCN Oscillation
        </span>
      </div>

      <!-- Chronotherapy Dosing Schedule List -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (item of items; track item.id) {
          <div class="p-2.5 bg-amber-950/30 border border-amber-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-amber-200 flex items-center gap-2">
                <span>{{ item.name }}</span>
                <span class="text-[9px] px-1.5 py-0.5 bg-amber-900/60 border border-amber-700/40 rounded text-amber-300">{{ item.targetGene }}</span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">{{ item.rationale }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-xs font-bold block">
                {{ item.optimalTime }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-amber-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Suprachiasmatic Nucleus (SCN) Molecular Entrainment</span>
        <span>Per1/Per2 Transcripts</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class HallChronotherapyMatrixComponent {
  readonly items: IChronotherapyItem[] = [
    {
      id: 'statins',
      category: 'Pharmacology',
      name: 'HMG-CoA Reductase Inhibitors (Statins)',
      optimalTime: '21:00 (Bedtime)',
      targetGene: 'HMGCR',
      rationale: 'Hepatic cholesterol synthesis peaks during nocturnal circadian resting phase.'
    },
    {
      id: 'antihypertensives',
      category: 'Pharmacology',
      name: 'ACE Inhibitors / ARBs',
      optimalTime: '22:00 (Evening)',
      targetGene: 'AGT / ACE',
      rationale: 'Suppresses nocturnal blood pressure non-dipping to prevent cardiovascular events.'
    },
    {
      id: 'corticosteroids',
      category: 'Endocrine',
      name: 'Glucocorticoids / Cortisol Support',
      optimalTime: '07:00 (Morning)',
      targetGene: 'NR3C1',
      rationale: 'Mirrors natural Cortisol Awakening Response (CAR) to prevent adrenal axis suppression.'
    },
    {
      id: 'magnesium',
      category: 'Nutraceutical',
      name: 'Magnesium Glycinate & L-Theanine',
      optimalTime: '21:30 (Pre-Sleep)',
      targetGene: 'GABRA1',
      rationale: 'Enhances GABAergic activation aligned with SCN melatonin release curve.'
    }
  ];
}
