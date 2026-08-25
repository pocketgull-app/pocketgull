import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TParadigmType = 'western' | 'tcm' | 'ayurvedic';
export type TEvidenceGradeType = 'A' | 'B' | 'C' | 'D';
export type TUrgencyTierType = 'critical' | 'high' | 'moderate' | 'routine';

@Component({
  selector: 'app-typology-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex max-w-full flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 px-2.5 rounded-xl text-xs font-mono tracking-wider border shadow-xs transition-all duration-200 hover:shadow-md cursor-default select-none overflow-hidden"
         [class]="badgeContainerClasses()">
      
      <!-- Paradigm Identifier Pill -->
      <span class="flex items-center gap-1 font-bold uppercase text-[9.5px] px-1.5 py-0.5 rounded-md shrink-0"
            [class]="paradigmPillClasses()">
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" [class]="paradigmDotClasses()"></span>
        {{ paradigmLabel() }}
      </span>

      <!-- System / Sub-Typology Label -->
      <span class="font-semibold truncate max-w-[140px] text-[11px]">
        {{ systemTag() }}
      </span>

      <!-- Evidence Grade Badge -->
      @if (evidenceGrade()) {
        <span class="px-1.5 py-0.5 rounded-md font-extrabold text-[10px] border border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
              [title]="'Evidence Level: Grade ' + evidenceGrade()">
          GRADE {{ evidenceGrade() }}
        </span>
      }

      <!-- Urgency Indicator -->
      <span class="w-2 h-2 rounded-full shrink-0" 
            [class]="urgencyDotClasses()"
            [title]="'Urgency Level: ' + urgency()">
      </span>
    </div>
  `
})
export class TypologyBadgeComponent {
  paradigm = input<TParadigmType>('western');
  lens = input<string>('Summary Overview');
  evidenceGrade = input<TEvidenceGradeType>('A');
  urgency = input<TUrgencyTierType>('moderate');
  systemTag = input<string>('Pathophysiological');

  paradigmLabel = computed(() => {
    switch (this.paradigm()) {
      case 'tcm':
        return 'TCM :: ZANG-FU';
      case 'ayurvedic':
        return 'AYURVEDA :: DOSHA';
      case 'western':
      default:
        return 'WESTERN :: ICD-10';
    }
  });

  badgeContainerClasses = computed(() => {
    switch (this.paradigm()) {
      case 'tcm':
        return 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-200';
      case 'ayurvedic':
        return 'bg-amber-950/20 border-amber-500/30 text-amber-300 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200';
      case 'western':
      default:
        return 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-500/40 dark:text-indigo-200';
    }
  });

  paradigmPillClasses = computed(() => {
    switch (this.paradigm()) {
      case 'tcm':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'ayurvedic':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'western':
      default:
        return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40';
    }
  });

  paradigmDotClasses = computed(() => {
    switch (this.paradigm()) {
      case 'tcm':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
      case 'ayurvedic':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
      case 'western':
      default:
        return 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]';
    }
  });

  urgencyDotClasses = computed(() => {
    switch (this.urgency()) {
      case 'critical':
        return 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)] animate-ping';
      case 'high':
        return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]';
      case 'routine':
        return 'bg-emerald-500';
      case 'moderate':
      default:
        return 'bg-sky-500';
    }
  });
}
