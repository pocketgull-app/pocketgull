import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenomicPathogenicityService, IGenomicVariant } from '../services/genomic-pathogenicity.service';

@Component({
  selector: 'app-genomic-variant-screener',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 font-sans">
      <!-- Header Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              NCBI ClinVar & dbSNP Core
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              ACMG / AMP Tiered
            </span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-white mt-1">
            Precision Genomic Variant Screener
          </h2>
          <p class="text-sm text-slate-400 mt-0.5">
            Pathogenicity evaluation, gnomAD allele frequencies, and pharmacogenomic CPIC clinical crosswalks.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="exportCurrentFhirBundle()"
            class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm hover:shadow-indigo-500/20 active:scale-95"
            aria-label="Export FHIR R4 Genomic Bundle">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export FHIR R4 Bundle
          </button>
        </div>
      </div>

      <!-- Controls: Search & ACMG Tier Filters -->
      <div class="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div class="relative flex-1">
          <input
            type="text"
            [ngModel]="genomics.searchQuery()"
            (ngModelChange)="genomics.setSearchQuery($event)"
            placeholder="Search by gene (e.g., APOE, MTHFR), rsID (rs429358), or condition..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            aria-label="Search genomic variants" />
          <svg class="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          @for (filter of acmgFilterOptions; track filter) {
            <button
              type="button"
              (click)="genomics.setAcmgFilter(filter)"
              [class.bg-indigo-600]="genomics.selectedAcmgFilter() === filter"
              [class.text-white]="genomics.selectedAcmgFilter() === filter"
              [class.bg-slate-900]="genomics.selectedAcmgFilter() !== filter"
              [class.text-slate-400]="genomics.selectedAcmgFilter() !== filter"
              class="px-3 py-2 text-xs font-medium rounded-lg border border-slate-700/60 hover:bg-slate-800 transition whitespace-nowrap">
              {{ filter }}
            </button>
          }
        </div>
      </div>

      <!-- Main Layout: Variant Split-View List & Active Card -->
      <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Variant Selection List (5 cols) -->
        <div class="lg:col-span-5 space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
          @for (v of genomics.filteredVariants(); track v.rsId) {
            <div
              (click)="genomics.selectVariant(v)"
              [class.border-indigo-500]="genomics.selectedVariant()?.rsId === v.rsId"
              [class.bg-slate-900]="genomics.selectedVariant()?.rsId === v.rsId"
              [class.bg-slate-900/40]="genomics.selectedVariant()?.rsId !== v.rsId"
              class="p-4 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 hover:bg-slate-900/80 transition text-left group">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-bold text-white group-hover:text-indigo-300 transition">
                      {{ v.gene }}
                    </span>
                    <span class="text-xs font-mono text-indigo-400">
                      {{ v.rsId }}
                    </span>
                  </div>
                  <p class="text-xs font-mono text-slate-400 mt-0.5">
                    {{ v.hgvsProtein }} ({{ v.chromosome }}:{{ v.positionGRCh38 }})
                  </p>
                </div>

                <span
                  [ngClass]="getAcmgBadgeClass(v.acmgClassification)"
                  class="px-2 py-0.5 text-[10px] font-semibold rounded-md border whitespace-nowrap">
                  {{ v.acmgClassification }}
                </span>
              </div>

              <p class="text-xs text-slate-300 mt-2 line-clamp-1">
                {{ v.phenotypeAssociation }}
              </p>
            </div>
          } @empty {
            <div class="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
              No genetic variants matched your search criteria.
            </div>
          }
        </div>

        <!-- Detailed Variant Inspector (7 cols) -->
        <div class="lg:col-span-7">
          @if (genomics.selectedVariant(); as v) {
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
              <!-- Top Metadata -->
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2.5">
                    <h3 class="text-xl font-bold text-white">{{ v.gene }}</h3>
                    <span class="text-sm font-mono text-indigo-400">{{ v.rsId }}</span>
                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-md border" [ngClass]="getAcmgBadgeClass(v.acmgClassification)">
                      {{ v.acmgClassification }}
                    </span>
                  </div>
                  <p class="text-xs font-mono text-slate-400 mt-1">
                    {{ v.transcriptId }}:{{ v.hgvsCoding }} | {{ v.hgvsProtein }}
                  </p>
                </div>
              </div>

              <!-- Genomic Coordinates & Frequency Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Genome Build</div>
                  <div class="text-xs font-mono font-semibold text-white mt-1">GRCh38</div>
                </div>
                <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Position</div>
                  <div class="text-xs font-mono font-semibold text-white mt-1">{{ v.chromosome }}:{{ v.positionGRCh38 }}</div>
                </div>
                <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Alleles (Ref/Alt)</div>
                  <div class="text-xs font-mono font-semibold text-white mt-1">{{ v.refAllele }} &rarr; {{ v.altAllele }}</div>
                </div>
                <div class="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <div class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">gnomAD MAF</div>
                  <div class="text-xs font-mono font-semibold text-emerald-400 mt-1">{{ (v.gnomadGlobalMaf * 100).toFixed(1) }}%</div>
                </div>
              </div>

              <!-- Phenotypic Association -->
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Phenotype & Trait Association</h4>
                <p class="text-sm text-slate-200 mt-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                  {{ v.phenotypeAssociation }}
                </p>
              </div>

              <!-- ACMG Criteria Met -->
              <div>
                <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400">ACMG / AMP Pathogenicity Criteria</h4>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (crit of v.acmgCriteriaMet; track crit) {
                    <span class="px-2.5 py-1 text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-md">
                      {{ crit }}
                    </span>
                  }
                </div>
              </div>

              <!-- Actionable Clinical Guidance -->
              <div class="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
                <div class="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Actionable Clinical Guidance
                </div>
                <p class="text-sm text-amber-200/90 leading-relaxed">
                  {{ v.clinicalActionability }}
                </p>
                @if (v.cpicGuidelineLinked) {
                  <div class="pt-2 text-xs text-amber-300/80 border-t border-amber-800/30">
                    <strong class="font-semibold text-amber-200">CPIC Link:</strong> {{ v.cpicGuidelineLinked }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Export Success Toast -->
      @if (exportNotice()) {
        <div class="mt-4 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs font-mono text-emerald-200 flex items-center justify-between">
          <span>{{ exportNotice() }}</span>
          <button (click)="exportNotice.set(null)" class="text-emerald-400 hover:text-white font-bold ml-2">&times;</button>
        </div>
      }
    </div>
  `
})
export class GenomicVariantScreenerComponent {
  public genomics = inject(GenomicPathogenicityService);
  public exportNotice = signal<string | null>(null);

  readonly acmgFilterOptions = ['ALL', 'Pathogenic', 'Likely Pathogenic', 'Variant of Uncertain Significance (VUS)'];

  getAcmgBadgeClass(acmg: string): string {
    switch (acmg) {
      case 'Pathogenic':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'Likely Pathogenic':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'Variant of Uncertain Significance (VUS)':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  }

  exportCurrentFhirBundle(): void {
    const bundle = this.genomics.exportFhirR4GenomicBundle();
    const jsonStr = JSON.stringify(bundle, null, 2);
    this.exportNotice.set(`Generated FHIR R4 Bundle with ${bundle['entry']?.length || 0} resources (MolecularSequence & Observation).`);
    console.debug('[FHIR R4 Genomic Bundle Export]', jsonStr);
  }
}
