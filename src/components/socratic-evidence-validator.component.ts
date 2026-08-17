import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocraticEvidenceLiteracyService, ISocraticClaimAnalysis } from '../services/socratic-evidence-literacy.service';

@Component({
  selector: 'app-socratic-evidence-validator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 font-sans overflow-y-auto"
         (click)="close.emit()">
      
      <!-- Modal Container -->
      <div class="w-full max-w-5xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">⚖️</span>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                  Socratic Evidence Literacy &amp; Claim Validator
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Cochrane RoB 2 • Popperian Epistemology
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                Deconstruct Health Claims • Correlation vs. Causation • Falsification Radar • Methodological Socratic Inquiries
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Scrollable Content Body -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

          <!-- Claim Input Section -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Enter Any Health Headline, Supplement Claim, or Clinical Assertion:
              </label>
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <textarea
                [ngModel]="claimInput()"
                (ngModelChange)="claimInput.set($event)"
                rows="2"
                placeholder="e.g. 'Taking 10,000mg of Vitamin C daily prevents all viral colds' or 'Continuous glucose monitors improve non-diabetic athletic lifespan'..."
                class="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none">
              </textarea>
              <button (click)="analyzeClaim()"
                [disabled]="!claimInput().trim()"
                class="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shrink-0">
                🔍 Audit Evidence
              </button>
            </div>

            <!-- Preset Claim Quick Pills -->
            <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              <span class="text-zinc-400 font-bold uppercase text-[10px] mr-1">Presets:</span>
              @for (preset of literacyService.presetClaims; track preset.topic) {
                <button (click)="loadPreset(preset.claim)"
                  class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer border border-zinc-200 dark:border-zinc-700">
                  {{ preset.topic }}
                </button>
              }
            </div>
          </div>

          <!-- Active Analysis Results Block -->
          @if (literacyService.activeAnalysis(); as result) {
            <div class="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">

              <!-- Top Verdict & Tier Badge Header -->
              <div class="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Topic: {{ result.analyzedTopic }}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      [class.bg-emerald-100]="result.evidenceTier.includes('Level A')"
                      [class.text-emerald-800]="result.evidenceTier.includes('Level A')"
                      [class.bg-blue-100]="result.evidenceTier.includes('Level B')"
                      [class.text-blue-800]="result.evidenceTier.includes('Level B')"
                      [class.bg-amber-100]="result.evidenceTier.includes('Level C') || result.evidenceTier.includes('Level D')"
                      [class.text-amber-800]="result.evidenceTier.includes('Level C') || result.evidenceTier.includes('Level D')">
                      {{ result.evidenceTier }}
                    </span>
                  </div>
                  <h3 class="text-base font-serif font-bold text-zinc-900 dark:text-zinc-100">
                    "{{ result.originalClaim }}"
                  </h3>
                </div>

                <div class="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center shrink-0 w-full md:w-auto">
                  <span class="text-[10px] font-mono uppercase text-zinc-400 block">Popperian Falsifiability</span>
                  <span class="text-xs font-bold font-mono"
                    [class.text-emerald-600]="result.falsifiabilityStatus.includes('Tested')"
                    [class.text-amber-600]="result.falsifiabilityStatus.includes('Unproven')"
                    [class.text-red-600]="result.falsifiabilityStatus.includes('Unfalsifiable')">
                    {{ result.falsifiabilityStatus }}
                  </span>
                </div>
              </div>

              <!-- Two-Column Breakdown: Cochrane RoB 2 & Causation Audit -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <!-- Cochrane RoB 2 Domain Radar -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>🛡️ Cochrane RoB 2 Bias Assessment</span>
                    <span class="text-[10px] text-zinc-400">Domain Breakdown</span>
                  </h4>

                  <div class="space-y-2 font-mono text-xs">
                    <div class="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span class="text-zinc-600 dark:text-zinc-400">Randomization Bias (D1)</span>
                      <span class="font-bold text-[11px]" [class.text-emerald-600]="result.cochraneRoB2Radar.randomizationBias === 'Low Risk'" [class.text-amber-600]="result.cochraneRoB2Radar.randomizationBias !== 'Low Risk'">
                        {{ result.cochraneRoB2Radar.randomizationBias }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span class="text-zinc-600 dark:text-zinc-400">Deviations from Intended (D2)</span>
                      <span class="font-bold text-[11px]" [class.text-emerald-600]="result.cochraneRoB2Radar.deviationBias === 'Low Risk'" [class.text-amber-600]="result.cochraneRoB2Radar.deviationBias !== 'Low Risk'">
                        {{ result.cochraneRoB2Radar.deviationBias }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span class="text-zinc-600 dark:text-zinc-400">Missing Outcome Data (D3)</span>
                      <span class="font-bold text-[11px]" [class.text-emerald-600]="result.cochraneRoB2Radar.missingDataBias === 'Low Risk'" [class.text-amber-600]="result.cochraneRoB2Radar.missingDataBias !== 'Low Risk'">
                        {{ result.cochraneRoB2Radar.missingDataBias }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span class="text-zinc-600 dark:text-zinc-400">Measurement of Outcome (D4)</span>
                      <span class="font-bold text-[11px]" [class.text-emerald-600]="result.cochraneRoB2Radar.measurementBias === 'Low Risk'" [class.text-amber-600]="result.cochraneRoB2Radar.measurementBias !== 'Low Risk'">
                        {{ result.cochraneRoB2Radar.measurementBias }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span class="text-zinc-600 dark:text-zinc-400">Selection of Reported Results (D5)</span>
                      <span class="font-bold text-[11px]" [class.text-emerald-600]="result.cochraneRoB2Radar.selectiveReportingBias === 'Low Risk'" [class.text-amber-600]="result.cochraneRoB2Radar.selectiveReportingBias !== 'Low Risk'">
                        {{ result.cochraneRoB2Radar.selectiveReportingBias }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Correlation vs. Causation & Confounder Diagnostic -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 mb-2">
                      🔗 Correlation vs. Causation Audit
                    </h4>

                    <div class="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                      <div class="flex items-center justify-between">
                        <span class="text-zinc-600 dark:text-zinc-400 font-mono">Causality Formally Proven:</span>
                        <span class="font-bold font-mono" [class.text-emerald-600]="result.correlationVsCausationCheck.isCausalProven" [class.text-amber-600]="!result.correlationVsCausationCheck.isCausalProven">
                          {{ result.correlationVsCausationCheck.isCausalProven ? '✓ Verified RCT Causation' : '⚠️ Correlation Only / Confounded' }}
                        </span>
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-zinc-600 dark:text-zinc-400 font-mono">Healthy User Bias Risk:</span>
                        <span class="font-bold font-mono" [class.text-red-500]="result.correlationVsCausationCheck.healthyUserBiasRisk" [class.text-emerald-600]="!result.correlationVsCausationCheck.healthyUserBiasRisk">
                          {{ result.correlationVsCausationCheck.healthyUserBiasRisk ? 'High Confounding Risk' : 'Controlled' }}
                        </span>
                      </div>
                    </div>

                    <div class="mt-3 space-y-1">
                      <span class="text-[11px] font-mono text-zinc-500 font-bold uppercase">Identified Confounders:</span>
                      <div class="flex flex-wrap gap-1">
                        @for (conf of result.correlationVsCausationCheck.primaryConfounders; track conf) {
                          <span class="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono">
                            {{ conf }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Clinical Consensus Verdict Box -->
                  <div class="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs font-sans">
                    <span class="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-amber-400 block mb-0.5">
                      Clinical Consensus Verdict:
                    </span>
                    <p class="text-zinc-800 dark:text-zinc-200 leading-relaxed text-[11px]">
                      {{ result.clinicalConsensusVerdict }}
                    </p>
                  </div>
                </div>

              </div>

              <!-- Socratic Counter-Questions & Peer-Reviewed Citations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <!-- Socratic Questions -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <span>💡</span>
                    <span>Socratic Inquiries for the Proponent</span>
                  </h4>
                  <ul class="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 list-disc list-inside leading-relaxed font-sans">
                    @for (q of result.socraticCounterQuestions; track q) {
                      <li>{{ q }}</li>
                    }
                  </ul>
                </div>

                <!-- Canonical Citations -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <span>📚</span>
                    <span>Canonical Peer-Reviewed Literature</span>
                  </h4>
                  <ul class="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-mono text-[11px] leading-relaxed">
                    @for (cit of result.canonicalCitations; track cit) {
                      <li class="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        {{ cit }}
                      </li>
                    }
                  </ul>
                </div>

              </div>

            </div>
          }

        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
          <span class="text-[11px] font-mono text-zinc-500">
            Popperian Null-Hypothesis Engine • Anti-Science-Washing Guard
          </span>
          <button (click)="close.emit()"
            class="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition cursor-pointer">
            Close Validator
          </button>
        </div>

      </div>

    </div>
  `
})
export class SocraticEvidenceValidatorComponent {
  literacyService = inject(SocraticEvidenceLiteracyService);
  close = output<void>();

  claimInput = signal<string>('Treating active periodontal probing depths (PPD >= 4mm) measurably lowers systemic inflammatory burden (hs-CRP) and cardiovascular risk.');

  constructor() {
    this.analyzeClaim();
  }

  loadPreset(claim: string): void {
    this.claimInput.set(claim);
    this.analyzeClaim();
  }

  analyzeClaim(): void {
    const text = this.claimInput().trim();
    if (text) {
      this.literacyService.evaluateClaim(text);
    }
  }
}
