import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PharmacogenomicsService } from '../services/pharmacogenomics.service';

@Component({
  selector: 'app-pharmacogenomics-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/90 border border-purple-500/30 text-zinc-100 shadow-xl font-mono backdrop-blur-xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🧬</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-purple-400">
              Pharmacogenomics & Spatial eQTL Dosing Safety
            </h3>
            <p class="text-[11px] text-zinc-400">
              CPIC Level 1A CYP450 Variant Screening & Gene-Drug Toxicity Guard
            </p>
          </div>
        </div>

        @if (pgx.hasHighRiskInteractions()) {
          <span class="text-xs px-3 py-1 rounded-full font-extrabold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
            ⚠️ 1A High-Risk Interactions Active
          </span>
        }
      </div>

      @if (pgx.activeProfile(); as profile) {
        <!-- CYP450 Variant Matrix -->
        <div class="mb-5">
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            Genomic CYP450 / Metabolizer Diplotypes
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            @for (v of profile.variants; track v.gene) {
              <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-extrabold text-purple-300">{{ v.gene }}</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    {{ v.diplotype }}
                  </span>
                </div>
                <span class="text-[11px] font-bold block" [ngClass]="{
                  'text-red-400': v.phenotype === 'Poor Metabolizer',
                  'text-amber-400': v.phenotype === 'Ultra-Rapid Metabolizer',
                  'text-emerald-400': v.phenotype === 'Normal Metabolizer'
                }">
                  {{ v.phenotype }}
                </span>
                <span class="text-[10px] text-zinc-500 block truncate">
                  Score: {{ v.activityScore }} · {{ v.affectedDrugClasses[0] }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Drug-Gene Interaction Guard -->
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-3">
            CPIC Level 1A / 1B Clinical Drug-Gene Warnings
          </span>
          <div class="space-y-3 text-xs">
            @for (item of profile.interactions; track item.drugName) {
              <div class="p-3.5 rounded-2xl bg-zinc-900/90 border space-y-1.5" [ngClass]="{
                'border-red-500/40 bg-red-950/20': item.severity === 'contraindicated',
                'border-amber-500/40 bg-amber-950/20': item.severity === 'warning',
                'border-sky-500/40 bg-sky-950/20': item.severity === 'dosage_adjust'
              }">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-white text-xs">{{ item.drugName }}</span>
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" [ngClass]="{
                      'bg-red-500/20 text-red-300 border border-red-500/40': item.severity === 'contraindicated',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40': item.severity === 'warning',
                      'bg-sky-500/20 text-sky-300 border border-sky-500/40': item.severity === 'dosage_adjust'
                    }">
                      {{ item.severity }}
                    </span>
                  </div>
                  <span class="text-[10px] text-purple-400 font-bold">
                    {{ item.gene }} · Level {{ item.evidenceLevel }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-300 font-sans font-medium leading-relaxed">
                  {{ item.clinicalSummary }}
                </p>
                <a [href]="item.cpicGuidelineUrl" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-[10px] text-purple-400 font-bold hover:underline">
                  <span>View CPIC Guideline</span> →
                </a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PharmacogenomicsCardComponent {
  readonly pgx = inject(PharmacogenomicsService);
}
