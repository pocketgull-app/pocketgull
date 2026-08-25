import { Component, ChangeDetectionStrategy, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PlanSignOffStatus = 'PENDING_REVIEW' | 'ACCEPTED_AI' | 'MODIFIED' | 'REVERTED_BASELINE';

export interface IDifferentialItem {
  id: string;
  category: string;
  baselineText: string;
  adaptedText: string;
  deviationType: 'ADDITION' | 'MODIFICATION' | 'EXCLUSION' | 'CONCORDANT';
  justification: string;
  evidenceCitation: string;
  evidenceTier: 'Level A (RCT)' | 'Level B (Cohort)' | 'Level C (Expert)';
  isAccepted: boolean;
}

const DEFAULT_DIFFERENTIAL_ITEMS: IDifferentialItem[] = [
  {
    id: 'DIFF-001',
    category: 'Pharmacotherapy / Titration',
    baselineText: 'Standard Lisinopril 10 mg PO daily for stage 1 hypertension / renal protection.',
    adaptedText: 'Switch to Losartan 50 mg PO daily due to documented patient ACEi-induced dry cough history.',
    deviationType: 'MODIFICATION',
    justification: 'Patient history indicates bradykinin-mediated ACEi cough; ARB provides equivalent renal hemodynamic protection without cough.',
    evidenceCitation: 'AHA/ACC 2024 Hypertension Guidelines (Class I, Level A)',
    evidenceTier: 'Level A (RCT)',
    isAccepted: true
  },
  {
    id: 'DIFF-002',
    category: 'Targeted Cardiorenal Protection',
    baselineText: 'Standard lifestyle modification + metformin monotherapy for T2D with eGFR > 45.',
    adaptedText: 'Add Empagliflozin 10 mg PO daily for cardiorenal protection given uACR > 300 mg/g.',
    deviationType: 'ADDITION',
    justification: 'EMPA-REG OUTCOME & KDIGO 2024 demonstrate significant slowing of CKD progression and CV death reduction.',
    evidenceCitation: 'KDIGO 2024 Clinical Practice Guideline (Grade 1A)',
    evidenceTier: 'Level A (RCT)',
    isAccepted: true
  },
  {
    id: 'DIFF-003',
    category: 'Contraindication Safety Intercept',
    baselineText: 'Standard PRN Ibuprofen 400 mg for tension headaches or musculoskeletal pain.',
    adaptedText: 'Strictly EXCLUDE NSAIDs; substitute Acetaminophen 500 mg PRN + magnesium glycinate 200 mg.',
    deviationType: 'EXCLUSION',
    justification: 'NSAIDs cause afferent arteriolar vasoconstriction and accelerate renal decline in CKD stage 3.',
    evidenceCitation: 'FDA Drug Safety Communication / KDIGO 2024 (Class III: Harm)',
    evidenceTier: 'Level A (RCT)',
    isAccepted: true
  },
  {
    id: 'DIFF-004',
    category: 'Chronobiology & Lifestyle',
    baselineText: 'General recommendation to exercise 150 minutes per week.',
    adaptedText: 'Structured morning Zone-2 aerobic walking (7:30 AM) to entrain circadian cortisol rhythm.',
    deviationType: 'ADDITION',
    justification: 'Circadian chronobiology research demonstrates morning light + movement steepens diurnal cortisol slope.',
    evidenceCitation: 'Cell Metabolism Circadian Synchrony (Level B)',
    evidenceTier: 'Level B (Cohort)',
    isAccepted: true
  }
];

@Component({
  selector: 'app-plan-differential-inspector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl font-sans space-y-5">
      
      <!-- Header & Review Status Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300 text-lg shadow-sm">
            ⚖️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 dark:text-zinc-100 font-mono">
                "Trust but Verify" Differential Plan Inspector
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase font-mono"
                    [class]="statusBadgeClass()">
                {{ signOffStatus() }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-zinc-400">
              Side-by-side comparison of Standard-of-Care Baseline vs. AI Personalized Adaptations
            </p>
          </div>
        </div>

        <!-- 1-Click Verification Action Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <button type="button" (click)="setSignOffStatus('ACCEPTED_AI')"
                  [class]="signOffStatus() === 'ACCEPTED_AI' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
            <span>✓</span> Accept Adaptations
          </button>

          <button type="button" (click)="setSignOffStatus('MODIFIED')"
                  [class]="signOffStatus() === 'MODIFIED' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
            <span>✏️</span> Custom Edits
          </button>

          <button type="button" (click)="setSignOffStatus('REVERTED_BASELINE')"
                  [class]="signOffStatus() === 'REVERTED_BASELINE' ? 'bg-zinc-800 text-white shadow-md' : 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-800'"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5">
            <span>↺</span> Revert to Baseline
          </button>
        </div>
      </div>

      <!-- Comparison Matrix Column Headers -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono font-bold uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-2 text-slate-500 dark:text-zinc-400">
        <div class="flex items-center gap-1.5">
          <span>🏛️ Standard Clinical Baseline Pathway</span>
        </div>
        <div class="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
          <span>✨ AI Personalized Adaptation (Patient-Specific)</span>
        </div>
      </div>

      <!-- Differential Item Rows -->
      <div class="space-y-4">
        @for (item of items(); track item.id) {
          <div class="p-4 rounded-xl border transition-all text-xs space-y-3"
               [class.border-emerald-500\/40]="item.deviationType === 'ADDITION'"
               [class.bg-emerald-500\/5]="item.deviationType === 'ADDITION'"
               [class.border-sky-500\/40]="item.deviationType === 'MODIFICATION'"
               [class.bg-sky-500\/5]="item.deviationType === 'MODIFICATION'"
               [class.border-amber-500\/40]="item.deviationType === 'EXCLUSION'"
               [class.bg-amber-500\/5]="item.deviationType === 'EXCLUSION'">
            
            <!-- Category and Tag -->
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-mono font-bold text-xs uppercase tracking-wide text-slate-800 dark:text-zinc-200">
                {{ item.category }}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded border"
                      [class.bg-emerald-500\/20]="item.deviationType === 'ADDITION'"
                      [class.text-emerald-700]="item.deviationType === 'ADDITION'"
                      [class.dark:text-emerald-300]="item.deviationType === 'ADDITION'"
                      [class.border-emerald-500\/40]="item.deviationType === 'ADDITION'"
                      [class.bg-sky-500\/20]="item.deviationType === 'MODIFICATION'"
                      [class.text-sky-700]="item.deviationType === 'MODIFICATION'"
                      [class.dark:text-sky-300]="item.deviationType === 'MODIFICATION'"
                      [class.border-sky-500\/40]="item.deviationType === 'MODIFICATION'"
                      [class.bg-amber-500\/20]="item.deviationType === 'EXCLUSION'"
                      [class.text-amber-700]="item.deviationType === 'EXCLUSION'"
                      [class.dark:text-amber-300]="item.deviationType === 'EXCLUSION'"
                      [class.border-amber-500\/40]="item.deviationType === 'EXCLUSION'">
                  {{ item.deviationType === 'ADDITION' ? '+ Tailored Addition' : (item.deviationType === 'EXCLUSION' ? '⊘ Safety Intercept' : '⇄ Adapted Option') }}
                </span>
                <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                  {{ item.evidenceTier }}
                </span>
              </div>
            </div>

            <!-- Side-by-Side Comparison -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Left: Baseline -->
              <div class="p-3 rounded-lg bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                <span class="text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 block mb-1 uppercase">Baseline:</span>
                {{ item.baselineText }}
              </div>

              <!-- Right: AI Adaptation -->
              <div class="p-3 rounded-lg border leading-relaxed font-sans"
                   [class.bg-emerald-500\/10]="item.deviationType === 'ADDITION'"
                   [class.border-emerald-500\/30]="item.deviationType === 'ADDITION'"
                   [class.text-emerald-950]="item.deviationType === 'ADDITION'"
                   [class.dark:text-emerald-200]="item.deviationType === 'ADDITION'"
                   [class.bg-sky-500\/10]="item.deviationType === 'MODIFICATION'"
                   [class.border-sky-500\/30]="item.deviationType === 'MODIFICATION'"
                   [class.text-sky-950]="item.deviationType === 'MODIFICATION'"
                   [class.dark:text-sky-200]="item.deviationType === 'MODIFICATION'"
                   [class.bg-amber-500\/10]="item.deviationType === 'EXCLUSION'"
                   [class.border-amber-500\/30]="item.deviationType === 'EXCLUSION'"
                   [class.text-amber-950]="item.deviationType === 'EXCLUSION'"
                   [class.dark:text-amber-200]="item.deviationType === 'EXCLUSION'">
                <span class="text-[10px] font-mono font-bold block mb-1 uppercase opacity-75">AI Adaptation:</span>
                {{ item.adaptedText }}
              </div>
            </div>

            <!-- Grounding & Justification Line -->
            <div class="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-zinc-400 font-sans">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-slate-700 dark:text-zinc-300">Justification:</span>
                <span>{{ item.justification }}</span>
              </div>
              <div class="flex items-center gap-1 text-[10px] font-mono text-purple-700 dark:text-purple-300 font-medium">
                <span>📚</span> {{ item.evidenceCitation }}
              </div>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class PlanDifferentialInspectorComponent {
  /** Input differential items list */
  customItems = input<IDifferentialItem[] | null>(null);

  /** Active items signal defaulting to standard care plan diffs */
  readonly items = computed<IDifferentialItem[]>(() => {
    return this.customItems() || DEFAULT_DIFFERENTIAL_ITEMS;
  });

  /** Clinician sign-off status */
  readonly signOffStatus = signal<PlanSignOffStatus>('ACCEPTED_AI');

  /** Event emitter for status change */
  readonly signOffChange = output<PlanSignOffStatus>();

  readonly statusBadgeClass = computed(() => {
    switch (this.signOffStatus()) {
      case 'ACCEPTED_AI':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'MODIFIED':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'REVERTED_BASELINE':
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
      default:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    }
  });

  public setSignOffStatus(status: PlanSignOffStatus): void {
    this.signOffStatus.set(status);
    this.signOffChange.emit(status);
  }
}
