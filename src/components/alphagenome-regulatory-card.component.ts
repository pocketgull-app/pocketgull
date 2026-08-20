import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphaGenomeRegulatoryService, IRegulatoryVariant, IPolygenicTraitProfile } from '../services/alphagenome-regulatory.service';

@Component({
  selector: 'app-alphagenome-regulatory-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans space-y-6">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/50">
              AlphaGenome Deep Learning
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              ENCODE cCRE & JASPAR 2026
            </span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white mt-1">
            Non-Coding Regulatory Variant & PRS Engine
          </h2>
          <p class="text-sm text-slate-400 mt-0.5">
            Predicting transcription factor motif disruption, tissue-specific expression shifts (&Delta;log2FC), and Polygenic Risk Scores.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="exportFhirBundle()"
            class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition shadow-sm hover:shadow-cyan-500/20 active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export FHIR R4 Bundle
          </button>
        </div>
      </div>

      <!-- Regulatory Variant Master Selector -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        @for (v of alphagenome.allVariants(); track v.id) {
          <div
            (click)="alphagenome.selectVariant(v)"
            [class.border-cyan-500]="alphagenome.selectedVariant().id === v.id"
            [class.bg-slate-900]="alphagenome.selectedVariant().id === v.id"
            [class.bg-slate-900/40]="alphagenome.selectedVariant().id !== v.id"
            class="p-4 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition text-left space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-cyan-400">{{ v.rsId }}</span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
                {{ v.elementCategory }}
              </span>
            </div>
            <div class="font-bold text-white text-sm">{{ v.targetGene }}</div>
            <p class="text-xs text-slate-400 line-clamp-1">{{ v.associatedTrait }}</p>
          </div>
        }
      </div>

      <!-- Selected Variant Deep Dive -->
      @if (alphagenome.selectedVariant(); as v) {
        <div class="p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-white">{{ v.targetGene }} Locus</h3>
                <span class="text-xs font-mono text-cyan-400">{{ v.chromosome }}:{{ v.positionGRCh38 }} ({{ v.refAllele }} &rarr; {{ v.altAllele }})</span>
              </div>
              <span class="text-xs font-mono text-slate-400">ENCODE Accession: {{ v.encodeCcreAccession }}</span>
            </div>
            <span class="px-3 py-1 text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded-full self-start sm:self-auto">
              {{ v.associatedTrait }}
            </span>
          </div>

          <!-- Grid: TF Binding Disruption & Tissue Expression Shifts -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Left: Transcription Factor Binding Delta (6 cols) -->
            <div class="lg:col-span-6 space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                JASPAR Transcription Factor Binding Disruption (&Delta;Affinity)
              </h4>

              <div class="space-y-2.5">
                @for (tf of v.tfMotifs; track tf.tfName) {
                  <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-white">{{ tf.tfName }} ({{ tf.jasparId }})</span>
                      <span
                        class="px-2 py-0.5 text-[10px] font-bold rounded"
                        [class.bg-rose-950]="tf.bindingDisrupted"
                        [class.text-rose-300]="tf.bindingDisrupted"
                        [class.border-rose-700]="tf.bindingDisrupted"
                        [class.bg-slate-800]="!tf.bindingDisrupted"
                        [class.text-slate-300]="!tf.bindingDisrupted">
                        {{ tf.bindingDisrupted ? 'MOTIF DISRUPTED' : 'INTACT / ENHANCED' }}
                      </span>
                    </div>

                    <!-- Visual Binding Bar -->
                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        class="h-full bg-slate-500"
                        [style.width.%]="tf.bindingAffinityRef * 100"
                        title="Reference Allele Binding"></div>
                      <div
                        class="h-full"
                        [class.bg-rose-500]="tf.deltaAffinityScore < 0"
                        [class.bg-emerald-500]="tf.deltaAffinityScore >= 0"
                        [style.width.%]="tf.bindingAffinityAlt * 100"
                        title="Alternate Allele Binding"></div>
                    </div>

                    <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Ref Score: {{ tf.bindingAffinityRef.toFixed(2) }}</span>
                      <span [class.text-rose-400]="tf.deltaAffinityScore < 0" [class.text-emerald-400]="tf.deltaAffinityScore >= 0">
                        &Delta;Affinity: {{ tf.deltaAffinityScore > 0 ? '+' : '' }}{{ tf.deltaAffinityScore.toFixed(2) }}
                      </span>
                      <span>Alt Score: {{ tf.bindingAffinityAlt.toFixed(2) }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Right: Cell-Type Specific Expression Delta (6 cols) -->
            <div class="lg:col-span-6 space-y-3">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cell-Type-Specific Expression Shifts (&Delta;log2 Fold Change)
              </h4>

              <div class="space-y-2.5">
                @for (td of v.tissueDeltas; track td.tissueType) {
                  <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-white">{{ td.tissueType }}</span>
                      <span
                        class="px-2 py-0.5 text-[10px] font-bold rounded"
                        [class.bg-rose-950]="td.direction === 'Downregulated'"
                        [class.text-rose-300]="td.direction === 'Downregulated'"
                        [class.bg-emerald-950]="td.direction === 'Upregulated'"
                        [class.text-emerald-300]="td.direction === 'Upregulated'"
                        [class.bg-slate-800]="td.direction === 'Neutral'"
                        [class.text-slate-300]="td.direction === 'Neutral'">
                        {{ td.predictedDeltaLog2Fc > 0 ? '+' : '' }}{{ td.predictedDeltaLog2Fc }} log2FC ({{ td.direction }})
                      </span>
                    </div>

                    <div class="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Baseline: {{ td.baselineExpressionTpm }} TPM</span>
                      <span class="font-mono text-cyan-300">{{ td.chromatinAccessibilityShift }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Clinical Guidance Box -->
          <div class="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-xl space-y-2">
            <div class="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Clinical Interpretation & Pharmacogenomic Action
            </div>
            <p class="text-xs text-slate-200 leading-relaxed">{{ v.clinicalImpactSummary }}</p>
            <div class="text-xs text-cyan-200/90 pt-1 border-t border-cyan-800/40">
              <strong>Intervention:</strong> {{ v.actionableDietOrRx }}
            </div>
          </div>
        </div>
      }

      <!-- Multi-Trait Polygenic Risk Score (PRS) Section -->
      <div class="space-y-4 pt-4 border-t border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">Multi-Trait Polygenic Risk Score (PRS) Profiles</h3>
            <p class="text-xs text-slate-400">Bayesian shrinkage multi-locus scores relative to global reference populations.</p>
          </div>
          <span class="text-xs font-mono text-slate-400">LDpred2 / PRS-CS Calibrated</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (p of alphagenome.polygenicProfiles(); track p.traitName) {
            <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-bold text-white text-sm">{{ p.traitName }}</h4>
                  <span class="text-[10px] font-mono text-slate-400">{{ p.snpCount }} SNPs weighted</span>
                </div>

                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-lg border"
                  [ngClass]="getPrsBadgeClass(p.prsResult.riskTier)">
                  {{ p.prsResult.percentile }}th Percentile
                </span>
              </div>

              <!-- Percentile Visual Meter -->
              <div class="space-y-1">
                <div class="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [ngClass]="getPrsMeterClass(p.prsResult.percentile)"
                    [style.width.%]="p.prsResult.percentile"></div>
                </div>
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>0% (Low)</span>
                  <span>50% (Median)</span>
                  <span>100% (High)</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono pt-1 text-slate-300">
                <div>Z-Score: <span class="font-bold text-white">{{ p.prsResult.zScore }}</span></div>
                <div>Odds Ratio: <span class="font-bold text-white">{{ p.prsResult.oddsRatioEstimated }}x</span></div>
              </div>

              <p class="text-xs text-slate-400 pt-1 border-t border-slate-800 leading-normal">
                {{ p.actionableClinicalGuidance }}
              </p>
            </div>
          }
        </div>
      </div>

      <!-- Export Success Toast -->
      @if (exportSuccessMessage()) {
        <div class="p-3 bg-emerald-950 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportSuccessMessage() }}</span>
          <button (click)="exportSuccessMessage.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class AlphaGenomeRegulatoryCardComponent {
  public alphagenome = inject(AlphaGenomeRegulatoryService);
  public exportSuccessMessage = signal<string | null>(null);

  getPrsBadgeClass(tier: string): string {
    switch (tier) {
      case 'High Polygenic Risk':
        return 'bg-rose-950/90 text-rose-300 border-rose-700';
      case 'Elevated Risk':
        return 'bg-amber-950/90 text-amber-300 border-amber-700';
      case 'Low Risk':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  }

  getPrsMeterClass(percentile: number): string {
    if (percentile >= 90) return 'bg-rose-500';
    if (percentile >= 75) return 'bg-amber-500';
    if (percentile <= 20) return 'bg-emerald-500';
    return 'bg-cyan-500';
  }

  exportFhirBundle(): void {
    const bundle = this.alphagenome.exportFhirR4AlphaGenomeBundle('homo-sapiens-34y');
    this.exportSuccessMessage.set(`Exported standard FHIR R4 Bundle for ${this.alphagenome.selectedVariant().rsId} with ${bundle['entry']?.length || 0} Observation resources.`);
  }
}
