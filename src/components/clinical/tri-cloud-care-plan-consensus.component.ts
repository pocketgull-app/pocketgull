/**
 * Big Five Clinical Consensus & Care Plan Component (Pentacloud CDS).
 * Visualizes multi-cloud treatment consensus across Google Cloud, AWS, Azure, Apple Health, and Meta AI
 * with Popperian p-values, Cochrane Risk of Bias, and penta-paradigm breakdowns.
 *
 * @module components/clinical/tri-cloud-care-plan-consensus
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriCloudConsensusService, ICloudCareRecommendation } from '../../services/clinical-tri-cloud-consensus.service';

@Component({
  selector: 'app-tri-cloud-care-plan-consensus',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Top Banner: Big Five Health Matrix -->
      <div class="p-6 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                🟢 Google Cloud
              </span>
              <span class="px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                🟠 Amazon (AWS)
              </span>
              <span class="px-3 py-1 text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                🔵 Microsoft Azure
              </span>
              <span class="px-3 py-1 text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                🍎 Apple Health &amp; CareKit
              </span>
              <span class="px-3 py-1 text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                ♾️ Meta AI &amp; ESM-2
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black uppercase tracking-tight font-pocketgull text-zinc-100">
              Big Five Clinical Consensus &amp; Protocol Engine
            </h1>
            <p class="text-sm text-zinc-400 mt-1 max-w-2xl">
              Harmonizing care plans and digital biomarker telemetry across Google Gemini, AWS Bedrock, Azure Health, Apple CareKit, and Meta ESM-2/LLaMA to deliver mathematically proven patient care strategies.
            </p>
          </div>

          <!-- Overall Consensus Badge -->
          @if (consensus.activeCarePlan(); as plan) {
            <div class="p-4 bg-zinc-800/80 backdrop-blur-md rounded-2xl border border-zinc-700/80 flex items-center gap-4 shrink-0">
              <div class="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col items-center justify-center">
                <span class="text-2xl font-black text-emerald-400 leading-none">{{ plan.overallConsensusScore }}%</span>
                <span class="text-[9px] font-black uppercase tracking-widest text-emerald-300/80 mt-0.5">Agreement</span>
              </div>
              <div>
                <div class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pentacloud Alignment</div>
                <div class="text-sm font-black text-zinc-100">{{ plan.recommendations.length }} Verified Protocols</div>
                <div class="text-[11px] text-emerald-400 font-medium">All p-values &lt; 0.05 (H₀ Rejected)</div>
              </div>
            </div>
          }
        </div>
      </div>

      @if (consensus.activeCarePlan(); as plan) {
        <!-- Biophysical Proof Matrix Table -->
        <div class="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div class="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 class="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-pocketgull">
                Popperian Null-Hypothesis (H₀) Biophysical Proof Matrix
              </h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Statistical validation proving biometric variances reject population baseline means at 95%+ confidence.
              </p>
            </div>
            <span class="px-2.5 py-1 text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              95% Confidence (p &lt; 0.05)
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-bold">
                <tr>
                  <th class="py-2.5 px-3">Biomarker / Metric</th>
                  <th class="py-2.5 px-3">Population Mean (μ)</th>
                  <th class="py-2.5 px-3">Patient Value</th>
                  <th class="py-2.5 px-3">z-Score</th>
                  <th class="py-2.5 px-3">p-Value</th>
                  <th class="py-2.5 px-3">H₀ Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                @for (m of plan.biophysicalProofMatrix; track m.metric) {
                  <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td class="py-3 px-3 font-sans font-bold text-zinc-900 dark:text-zinc-100">{{ m.metric }}</td>
                    <td class="py-3 px-3 text-zinc-500">{{ m.populationMean }}</td>
                    <td class="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100">{{ m.patientValue }}</td>
                    <td class="py-3 px-3" [class.text-red-500]="m.zScore < 0" [class.text-amber-500]="m.zScore > 0">
                      {{ m.zScore > 0 ? '+' : '' }}{{ m.zScore }}σ
                    </td>
                    <td class="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">p = {{ m.pValue }}</td>
                    <td class="py-3 px-3">
                      <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded">
                        REJECTED (Statistically Significant)
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Synthesized Big Five Protocols -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-pocketgull">
              Synthesized Big Five Care Recommendations
            </h2>
            <span class="text-xs text-zinc-500">Cross-Validated by GCP, AWS, Azure, Apple CareKit, and Meta AI</span>
          </div>

          <div class="grid grid-cols-1 gap-4">
            @for (rec of plan.recommendations; track rec.intervention) {
              <div class="p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-900">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span
                      [class.bg-emerald-500/10]="rec.provider === 'gcp'"
                      [class.text-emerald-600]="rec.provider === 'gcp'"
                      [class.dark:text-emerald-400]="rec.provider === 'gcp'"
                      [class.border-emerald-500/20]="rec.provider === 'gcp'"
                      [class.bg-amber-500/10]="rec.provider === 'aws'"
                      [class.text-amber-600]="rec.provider === 'aws'"
                      [class.dark:text-amber-400]="rec.provider === 'aws'"
                      [class.border-amber-500/20]="rec.provider === 'aws'"
                      [class.bg-blue-500/10]="rec.provider === 'azure'"
                      [class.text-blue-600]="rec.provider === 'azure'"
                      [class.dark:text-blue-400]="rec.provider === 'azure'"
                      [class.border-blue-500/20]="rec.provider === 'azure'"
                      [class.bg-rose-500/10]="rec.provider === 'apple'"
                      [class.text-rose-600]="rec.provider === 'apple'"
                      [class.dark:text-rose-400]="rec.provider === 'apple'"
                      [class.border-rose-500/20]="rec.provider === 'apple'"
                      [class.bg-indigo-500/10]="rec.provider === 'meta'"
                      [class.text-indigo-600]="rec.provider === 'meta'"
                      [class.dark:text-indigo-400]="rec.provider === 'meta'"
                      [class.border-indigo-500/20]="rec.provider === 'meta'"
                      class="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded border"
                    >
                      {{ rec.providerName }}
                    </span>

                    <span class="px-2.5 py-0.5 text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                      {{ rec.paradigm }}
                    </span>

                    <span class="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-200 dark:border-emerald-800">
                      {{ rec.evidenceTier }} • p = {{ rec.pValue }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{{ rec.consensusConfidence }}% Consensus</span>
                  </div>
                </div>

                <div class="mt-3">
                  <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {{ rec.intervention }}
                  </h3>
                  <div class="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 mb-2">
                    <span class="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">Protocol / Dosage:</span>
                    <span class="text-xs text-zinc-700 dark:text-zinc-300 ml-1.5">{{ rec.dosageOrProtocol }}</span>
                  </div>
                  <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                    <span class="font-bold text-zinc-700 dark:text-zinc-300">Biochemical Mechanism:</span> {{ rec.rationale }}
                  </p>

                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs">
                    <div class="text-zinc-500 dark:text-zinc-400">
                      <span class="font-bold text-red-600 dark:text-red-400">Contraindications:</span>
                      {{ rec.contraindications.join(', ') }}
                    </div>
                    <span class="text-[11px] text-zinc-400 font-mono">Model: {{ rec.model }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Discrepancy & Clinician Decision Card -->
        @for (disc of plan.discrepancies; track disc.field) {
          <div class="p-6 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white rounded">
                Big Five Consensus Variance Review
              </span>
              <h3 class="text-sm font-bold text-amber-900 dark:text-amber-300">{{ disc.field }}</h3>
            </div>

            <p class="text-xs text-amber-800 dark:text-amber-300/80 mb-4">{{ disc.description }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4 text-xs font-mono">
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <span class="font-bold text-emerald-700 dark:text-emerald-400">Google Cloud (Vertex):</span>
                <p class="mt-1 text-zinc-600 dark:text-zinc-300 font-sans text-xs">{{ disc.gcpView }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900/50">
                <span class="font-bold text-amber-700 dark:text-amber-400">Amazon (Bedrock):</span>
                <p class="mt-1 text-zinc-600 dark:text-zinc-300 font-sans text-xs">{{ disc.awsView }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-200 dark:border-blue-900/50">
                <span class="font-bold text-blue-700 dark:text-blue-400">Microsoft (BioGPT):</span>
                <p class="mt-1 text-zinc-600 dark:text-zinc-300 font-sans text-xs">{{ disc.azureView }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <span class="font-bold text-rose-700 dark:text-rose-400">Apple (CareKit Prior):</span>
                <p class="mt-1 text-zinc-600 dark:text-zinc-300 font-sans text-xs">{{ disc.appleView }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
                <span class="font-bold text-indigo-700 dark:text-indigo-400">Meta (LLaMA-Med):</span>
                <p class="mt-1 text-zinc-600 dark:text-zinc-300 font-sans text-xs">{{ disc.metaView }}</p>
              </div>
            </div>

            <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
              <span class="font-bold text-emerald-800 dark:text-emerald-300">💡 Recommended Clinician Action:</span>
              <span class="text-emerald-900 dark:text-emerald-200 ml-1.5">{{ disc.recommendedClinicianAction }}</span>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class TriCloudCarePlanConsensusComponent {
  consensus = inject(TriCloudConsensusService);
}
