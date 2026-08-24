import { Component, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SkepticalEpistemologyService,
  ICdsComplianceReport,
  ISocraticChallenge,
  CochraneRiskOfBiasLevel,
  IBiohackEpistemicAssessment,
  BiohackCategory
} from '../services/skeptical-epistemology.service';

@Component({
  selector: 'app-skeptical-epistemology-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <!-- Header HUD Bar -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-lg border border-indigo-500/20">
            H₀
          </div>
          <div>
            <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Skeptical Epistemology & Clinical Evidence HUD
              <span class="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Popperian Falsifiability
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Cochrane RoB 2 Risk Assessment • Null-Hypothesis Significance Testing • FDA 21 CFR §520(o)
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 text-xs font-semibold rounded-full border transition-all"
            [ngClass]="{
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30': report()?.evidenceLevel === 'Level A (RCTs)',
              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30': report()?.evidenceLevel === 'Level B (Cohort)',
              'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30': report()?.evidenceLevel === 'Level C (Expert Consensus)'
            }"
          >
            {{ report()?.evidenceLevel }}
          </span>
          <span class="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
            Epistemic Confidence: {{ report()?.overallConfidencePercent }}%
          </span>
        </div>
      </div>

      <!-- Null Hypothesis (H0) Falsifiability Metric -->
      @if (report()?.falsifiability; as fals) {
        <div class="mt-5 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 p-4 border border-zinc-200/60 dark:border-zinc-800/60">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Null-Hypothesis Test (H₀): {{ fals.metricName }}
            </span>
            <span class="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
              p-value = {{ fals.pValue }}
            </span>
          </div>

          <p class="mt-1 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
            H₀: {{ fals.nullHypothesisH0 }}
          </p>

          @if (fals.skepticalWarningNotice) {
            <div class="mt-3 flex items-start gap-2.5 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 border border-amber-500/30">
              <span class="text-base leading-none">⚠️</span>
              <p class="font-medium leading-relaxed">{{ fals.skepticalWarningNotice }}</p>
            </div>
          } @else {
            <div class="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span>✓</span>
              <span>Statistically significant (p &lt; 0.05). Null hypothesis H₀ rejected with {{ fals.epistemicConfidencePercent }}% confidence.</span>
            </div>
          }
        </div>
      }

      <!-- Cochrane Risk of Bias (RoB 2) Grid -->
      @if (report()?.cochraneBias; as bias) {
        <div class="mt-5">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Cochrane Risk of Bias 2.0 (RoB 2) Assessment
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">D1: Randomization</span>
              <span class="text-xs font-semibold" [ngClass]="getBiasColorClass(bias.randomizationBias)">
                {{ bias.randomizationBias }}
              </span>
            </div>

            <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">D2: Intervention</span>
              <span class="text-xs font-semibold" [ngClass]="getBiasColorClass(bias.deviationFromInterventionBias)">
                {{ bias.deviationFromInterventionBias }}
              </span>
            </div>

            <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">D3: Missing Data</span>
              <span class="text-xs font-semibold" [ngClass]="getBiasColorClass(bias.missingDataBias)">
                {{ bias.missingDataBias }}
              </span>
            </div>

            <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">D4: Measurement</span>
              <span class="text-xs font-semibold" [ngClass]="getBiasColorClass(bias.measurementBias)">
                {{ bias.measurementBias }}
              </span>
            </div>
          </div>
          <p class="mt-2 text-xs italic text-zinc-500 dark:text-zinc-400">
            "{{ bias.skepticalSummary }}"
          </p>
        </div>
      }

      <!-- Interactive Biohack & Functional Medicine Epistemology Auditor -->
      <div class="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <span>🌿</span> Biohack &amp; Functional Epistemology Evaluator
          </h4>
          <span class="text-[11px] font-mono text-zinc-500">
            Cochrane RoB 2 Meta-Analysis Graded
          </span>
        </div>

        <!-- Category Selector Chips -->
        <div class="flex flex-wrap gap-1.5 mb-3">
          @for (cat of categories; track cat) {
            <button
              type="button"
              (click)="selectedCategory.set(cat)"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all min-h-[32px] border"
              [ngClass]="{
                'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/40': selectedCategory() === cat,
                'bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700': selectedCategory() !== cat
              }"
            >
              {{ cat }}
            </button>
          }
        </div>

        <!-- Quick Biohack Selection Chips -->
        <div class="flex flex-wrap gap-2 mb-4">
          @for (bio of filteredBiohacks(); track bio.id) {
            <button
              type="button"
              (click)="selectBiohack(bio.id)"
              class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[40px] flex items-center gap-2 border"
              [ngClass]="{
                'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 shadow-sm': activeBiohackId() === bio.id,
                'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-teal-300': activeBiohackId() !== bio.id
              }"
            >
              <span class="w-2 h-2 rounded-full" [ngClass]="bio.falsifiability.isFalsified ? 'bg-emerald-500' : 'bg-amber-500'"></span>
              <span>{{ bio.name }}</span>
            </button>
          }
        </div>

        <!-- Active Biohack Assessment Card -->
        @if (activeBiohack(); as b) {
          <div class="rounded-xl bg-zinc-50 dark:bg-zinc-950/60 p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono font-bold text-[10px] border border-teal-500/30">
                  {{ b.category }}
                </span>
                <h5 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {{ b.name }}
                </h5>
              </div>
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                [ngClass]="{
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30': b.evidenceTier.startsWith('Level A'),
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30': b.evidenceTier.startsWith('Level B'),
                  'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30': b.evidenceTier.startsWith('Level C')
                }"
              >
                {{ b.evidenceTier }}
              </span>
            </div>

            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <strong class="text-zinc-800 dark:text-zinc-200">Mechanism:</strong> {{ b.biologicalMechanism }}
            </p>

            <!-- Biohack Falsifiability Check -->
            <div class="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="font-semibold text-zinc-700 dark:text-zinc-300">
                  H₀ Test: {{ b.falsifiability.metricName }}
                </span>
                <span class="font-mono font-bold" [ngClass]="b.falsifiability.isFalsified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
                  p = {{ b.falsifiability.pValue }}
                </span>
              </div>
              @if (b.falsifiability.skepticalWarningNotice) {
                <p class="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  ⚠️ {{ b.falsifiability.skepticalWarningNotice }}
                </p>
              } @else {
                <p class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Statistically significant (p &lt; 0.05). Null hypothesis H₀ rejected.
                </p>
              }
            </div>

            <!-- Protocol & Verdict -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
                <span class="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">Clinical Protocol:</span>
                <p class="text-zinc-600 dark:text-zinc-400">{{ b.recommendedProtocol }}</p>
              </div>
              <div class="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
                <span class="font-semibold text-zinc-800 dark:text-zinc-200 block mb-1">Skeptical Verdict:</span>
                <p class="text-zinc-600 dark:text-zinc-400">{{ b.skepticalVerdict }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Socratic Evidence Literacy Challenge -->
      @if (challenges().length > 0) {
        <div class="mt-6 border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span>💡</span> Socratic Critical Reasoning Challenge
            </h4>
            <span class="text-xs text-zinc-400 font-mono">
              {{ activeChallengeIndex() + 1 }} of {{ challenges().length }}
            </span>
          </div>

          @if (currentChallenge(); as challenge) {
            <div class="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 p-4 border border-indigo-100 dark:border-indigo-900/50">
              <p class="text-xs font-medium text-zinc-800 dark:text-zinc-200 mb-3">
                {{ challenge.question }}
              </p>

              <div class="space-y-2">
                @for (opt of challenge.options; track $index) {
                  <button
                    type="button"
                    (click)="selectOption($index)"
                    [disabled]="selectedOptionIndex() !== null"
                    class="w-full text-left p-3 rounded-lg text-xs font-medium transition-all duration-200 min-h-[44px] flex items-center justify-between border"
                    [ngClass]="{
                      'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-600': selectedOptionIndex() === null,
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200': selectedOptionIndex() !== null && $index === challenge.correctIndex,
                      'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200': selectedOptionIndex() === $index && $index !== challenge.correctIndex,
                      'opacity-50 border-zinc-200 dark:border-zinc-800': selectedOptionIndex() !== null && $index !== selectedOptionIndex() && $index !== challenge.correctIndex
                    }"
                  >
                    <span>{{ opt }}</span>
                    @if (selectedOptionIndex() !== null && $index === challenge.correctIndex) {
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                    }
                    @if (selectedOptionIndex() === $index && $index !== challenge.correctIndex) {
                      <span class="text-rose-600 dark:text-rose-400 font-bold">✗</span>
                    }
                  </button>
                }
              </div>

              @if (selectedOptionIndex() !== null) {
                <div class="mt-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-3 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800">
                  <span class="font-semibold block mb-1 text-indigo-600 dark:text-indigo-400">
                    Epistemic Rationale ({{ challenge.epistemicTag }}):
                  </span>
                  <p class="leading-relaxed">{{ challenge.explanation }}</p>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Peer-Reviewed DOI Citation & OpenAlex Epistemic Grounding -->
      <div class="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10px] border border-blue-500/30">
            DOI GROUNDED
          </span>
          <span class="font-medium text-zinc-700 dark:text-zinc-300 text-xs">
            {{ report()?.primaryCitation }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-[10.5px] font-mono text-zinc-500">
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          <span>OpenAlex Registry Grounded</span>
        </div>
      </div>

      <!-- FDA 21 CFR Section 520(o) CDS Footer -->
      <div class="mt-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
        <span>FDA 21 U.S.C. §360j(o)(1)(E) Non-Device CDS Transparency</span>
        <span class="font-mono text-zinc-500">Citation: {{ report()?.primaryCitation }}</span>
      </div>
    </div>
  `
})
export class SkepticalEpistemologyHudComponent {
  readonly lensName = input<string>('Summary Overview');
  readonly contentText = input<string>('Clinical blood pressure evaluation p-value p = 0.04 with RCT randomization blinding.');

  private skepticalService = inject(SkepticalEpistemologyService);

  readonly categories: Array<'All' | BiohackCategory> = ['All', 'Thermal', 'Photonic', 'Metabolic', 'Nutraceutical'];
  readonly selectedCategory = signal<'All' | BiohackCategory>('All');
  readonly activeBiohackId = signal<string>('cold-immersion');

  readonly allBiohacks = computed<IBiohackEpistemicAssessment[]>(() => {
    return this.skepticalService.getAllBiohacks();
  });

  readonly filteredBiohacks = computed<IBiohackEpistemicAssessment[]>(() => {
    const cat = this.selectedCategory();
    const list = this.allBiohacks();
    if (cat === 'All') return list;
    return list.filter(b => b.category === cat);
  });

  readonly activeBiohack = computed<IBiohackEpistemicAssessment | null>(() => {
    const id = this.activeBiohackId();
    return this.skepticalService.evaluateBiohack(id);
  });

  readonly report = computed<ICdsComplianceReport>(() => {
    return this.skepticalService.evaluateCdsCompliance(this.lensName());
  });

  readonly challenges = computed<ISocraticChallenge[]>(() => {
    return this.skepticalService.generateSocraticChallenges(this.lensName(), this.contentText(), 2);
  });

  readonly activeChallengeIndex = signal<number>(0);
  readonly selectedOptionIndex = signal<number | null>(null);

  readonly currentChallenge = computed<ISocraticChallenge | null>(() => {
    const list = this.challenges();
    const idx = this.activeChallengeIndex();
    return list[idx] || null;
  });

  selectBiohack(id: string): void {
    this.activeBiohackId.set(id);
  }

  selectOption(index: number): void {
    this.selectedOptionIndex.set(index);
  }

  getBiasColorClass(level?: CochraneRiskOfBiasLevel): string {
    switch (level) {
      case 'Low Risk of Bias':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'Some Concerns':
        return 'text-amber-600 dark:text-amber-400';
      case 'High Risk of Bias':
        return 'text-rose-600 dark:text-rose-400';
      default:
        return 'text-zinc-600 dark:text-zinc-400';
    }
  }
}
