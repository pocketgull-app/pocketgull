import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IArchaicVariant {
  gene: string;
  archaicOrigin: 'Neanderthal' | 'Denisovan';
  trait: string;
  effect: string;
  frequency: string;
}

@Component({
  selector: 'app-paabo-paleo-genomic',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-purple-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-purple-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🦴</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-purple-300">
              Paleo-Genomic Introgression Analyzer (Pääbo Model)
            </h3>
            <p class="text-[10px] text-purple-400/80">
              2022 Nobel Prize — Svante Pääbo Neanderthal & Denisovan Alleles
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-purple-950 border border-purple-700/60 text-purple-300">
          2.1% Archaic DNA
        </span>
      </div>

      <!-- Archaic Variants Grid -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (variant of variants; track variant.gene) {
          <div class="p-2.5 bg-purple-950/30 border border-purple-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-purple-200 flex items-center gap-2">
                <span>{{ variant.gene }}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold"
                      [class.bg-purple-900]="variant.archaicOrigin === 'Neanderthal'"
                      [class.text-purple-300]="variant.archaicOrigin === 'Neanderthal'"
                      [class.bg-indigo-900]="variant.archaicOrigin === 'Denisovan'"
                      [class.text-indigo-300]="variant.archaicOrigin === 'Denisovan'">
                  {{ variant.archaicOrigin }}
                </span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">{{ variant.trait }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-bold text-purple-300 block">{{ variant.effect }}</span>
              <span class="text-[9px] text-zinc-500 font-mono">{{ variant.frequency }} freq</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-purple-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Archaic Hominin Genome Introgression Matrix</span>
        <span>Max Planck Institute</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class PaaboPaleoGenomicComponent {
  readonly variants: IArchaicVariant[] = [
    {
      gene: 'OAS1 / OAS2 / OAS3',
      archaicOrigin: 'Neanderthal',
      trait: 'Antiviral RNA Degradation Cluster',
      effect: '-60% Severe Respiratory Risk',
      frequency: '35% Eurasian'
    },
    {
      gene: 'EPAS1',
      archaicOrigin: 'Denisovan',
      trait: 'High-Altitude Hypoxia Adaptation',
      effect: '+40% Hemoglobin Oxygenation',
      frequency: '80% Tibetan'
    },
    {
      gene: 'TLR1 / TLR6 / TLR10',
      archaicOrigin: 'Neanderthal',
      trait: 'Toll-Like Receptor Pathogen Sensing',
      effect: 'Heightened Innate Immunity',
      frequency: '50% Global'
    },
    {
      gene: 'SLC16A11',
      archaicOrigin: 'Neanderthal',
      trait: 'Lipid Transport & Fasting Adaptation',
      effect: 'Enhanced Lipid Storage',
      frequency: '25% Amerindian'
    }
  ];
}
