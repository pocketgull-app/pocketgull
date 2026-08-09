import { Component, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SkepticalEpistemologyService,
  ICdsComplianceReport,
  ISocraticChallenge,
  CochraneRiskOfBiasLevel
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
              <span>Statistically significant (p < 0.05). Null hypothesis H₀ rejected with {{ fals.epistemicConfidencePercent }}% confidence.</span>
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

      <!-- FDA 21 CFR Section 520(o) CDS Footer -->
      <div class="mt-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between text-[11px] text-zinc-400">
        <span>FDA 21 U.S.C. 360j(o)(1)(E) Non-Device CDS Transparency</span>
        <span class="font-mono text-zinc-500">Citation: {{ report()?.primaryCitation }}</span>
      </div>
    </div>
  `
})
export class SkepticalEpistemologyHudComponent {
  readonly lensName = input<string>('Summary Overview');
  readonly contentText = input<string>('Clinical blood pressure evaluation p-value p = 0.04 with RCT randomization blinding.');

  private skepticalService = inject(SkepticalEpistemologyService);

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
