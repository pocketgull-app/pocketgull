import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type InterventionSubTab = 'allopathic' | 'tcm' | 'ayurvedic' | 'lifestyle';

@Component({
  selector: 'app-interventions-lens-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Sub-Lens Tab Ribbon -->
      <div class="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-4xl overflow-x-auto">
        <button (click)="subTab.set('allopathic')"
          [class.bg-white]="subTab() === 'allopathic'"
          [class.dark:bg-zinc-800]="subTab() === 'allopathic'"
          [class.text-cyan-600]="subTab() === 'allopathic'"
          [class.dark:text-cyan-400]="subTab() === 'allopathic'"
          [class.text-zinc-500]="subTab() !== 'allopathic'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🌐 Western Allopathic Rx
        </button>
        <button (click)="subTab.set('tcm')"
          [class.bg-white]="subTab() === 'tcm'"
          [class.dark:bg-zinc-800]="subTab() === 'tcm'"
          [class.text-emerald-600]="subTab() === 'tcm'"
          [class.dark:text-emerald-400]="subTab() === 'tcm'"
          [class.text-zinc-500]="subTab() !== 'tcm'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🐉 TCM Botanical & Acupoints
        </button>
        <button (click)="subTab.set('ayurvedic')"
          [class.bg-white]="subTab() === 'ayurvedic'"
          [class.dark:bg-zinc-800]="subTab() === 'ayurvedic'"
          [class.text-amber-600]="subTab() === 'ayurvedic'"
          [class.dark:text-amber-400]="subTab() === 'ayurvedic'"
          [class.text-zinc-500]="subTab() !== 'ayurvedic'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🧘 Ayurvedic Tridosha & Marma
        </button>
        <button (click)="subTab.set('lifestyle')"
          [class.bg-white]="subTab() === 'lifestyle'"
          [class.dark:bg-zinc-800]="subTab() === 'lifestyle'"
          [class.text-indigo-600]="subTab() === 'lifestyle'"
          [class.dark:text-indigo-400]="subTab() === 'lifestyle'"
          [class.text-zinc-500]="subTab() !== 'lifestyle'"
          class="py-1.5 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer active:scale-95 border-0 whitespace-nowrap">
          🌱 Circadian Lifestyle & Sleep
        </button>
      </div>

      <!-- Tab Content Cards -->
      <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
        @if (subTab() === 'allopathic') {
          <h4 class="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono">Western Evidence-Based Guidelines</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            First-line clinical protocols, pharmacogenomic dosing modifications, and drug-nutrient interaction safety matrix.
          </p>
        } @else if (subTab() === 'tcm') {
          <h4 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">Traditional Chinese Medicine (Zang-Fu)</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Pattern differentiation, botanical decoction formulas (e.g., Xiao Yao San), and specific meridian acupoint stimulation protocols.
          </p>
        } @else if (subTab() === 'ayurvedic') {
          <h4 class="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">Ayurvedic Integrative Medicine</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Tridosha balancing protocols (Vata / Pitta / Kapha), Rasayana adaptogens, and Marma point somatic therapy.
          </p>
        } @else {
          <h4 class="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">Chrono-Nutrition & Circadian Hygiene</h4>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            Time-restricted feeding windows, polyphenol supplementation timing, and blue-light circadian alignment protocols.
          </p>
        }
      </div>
    </div>
  `
})
export class InterventionsLensTabComponent {
  subTab = signal<InterventionSubTab>('allopathic');
}
