import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OncDsiTransparencyService, IDsiModelCard } from '../services/onc-dsi-transparency.service';

type DsiTab = 'metrics' | 'demographics' | 'governance' | 'contraindications';

@Component({
  selector: 'app-onc-dsi-transparency-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
      <!-- Header & Model Switcher -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
              ONC HTI-2 Certified DSI
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-zinc-400">§170.315(b)(11)</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1">
            {{ activeCard().name }}
          </h2>
        </div>

        <!-- Model Switcher Tabs -->
        <div class="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
          @for (model of dsiService.availableModels(); track model.id) {
            <button
              type="button"
              (click)="dsiService.selectModel(model.id)"
              [class.bg-white]="dsiService.selectedModelId() === model.id"
              [class.dark:bg-zinc-700]="dsiService.selectedModelId() === model.id"
              [class.shadow-xs]="dsiService.selectedModelId() === model.id"
              class="px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-zinc-300 transition-all min-h-[44px] flex items-center justify-center focus:outline-hidden"
            >
              {{ model.version }}
            </button>
          }
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          (click)="activeTab.set('metrics')"
          [class.border-indigo-600]="activeTab() === 'metrics'"
          [class.text-indigo-600]="activeTab() === 'metrics'"
          [class.dark:text-indigo-400]="activeTab() === 'metrics'"
          class="px-3 py-2 text-xs font-bold border-b-2 border-transparent text-slate-600 dark:text-zinc-400 hover:text-indigo-600 transition-all min-h-[44px] shrink-0"
        >
          Validation Metrics
        </button>
        <button
          type="button"
          (click)="activeTab.set('demographics')"
          [class.border-indigo-600]="activeTab() === 'demographics'"
          [class.text-indigo-600]="activeTab() === 'demographics'"
          [class.dark:text-indigo-400]="activeTab() === 'demographics'"
          class="px-3 py-2 text-xs font-bold border-b-2 border-transparent text-slate-600 dark:text-zinc-400 hover:text-indigo-600 transition-all min-h-[44px] shrink-0"
        >
          Cohort Demographics
        </button>
        <button
          type="button"
          (click)="activeTab.set('governance')"
          [class.border-indigo-600]="activeTab() === 'governance'"
          [class.text-indigo-600]="activeTab() === 'governance'"
          [class.dark:text-indigo-400]="activeTab() === 'governance'"
          class="px-3 py-2 text-xs font-bold border-b-2 border-transparent text-slate-600 dark:text-zinc-400 hover:text-indigo-600 transition-all min-h-[44px] shrink-0"
        >
          Governance & IRB
        </button>
        <button
          type="button"
          (click)="activeTab.set('contraindications')"
          [class.border-indigo-600]="activeTab() === 'contraindications'"
          [class.text-indigo-600]="activeTab() === 'contraindications'"
          [class.dark:text-indigo-400]="activeTab() === 'contraindications'"
          class="px-3 py-2 text-xs font-bold border-b-2 border-transparent text-slate-600 dark:text-zinc-400 hover:text-indigo-600 transition-all min-h-[44px] shrink-0"
        >
          Contraindications
        </button>
      </div>

      <!-- Tab Content Area -->
      @switch (activeTab()) {
        @case ('metrics') {
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">AUROC Score</span>
              <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {{ activeCard().validationMetrics.auroc.toFixed(3) }}
              </div>
              <span class="text-[10px] text-slate-400">High Discriminative Power</span>
            </div>

            <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Sensitivity</span>
              <div class="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
                {{ (activeCard().validationMetrics.sensitivity * 100).toFixed(1) }}%
              </div>
              <span class="text-[10px] text-slate-400">True Positive Rate</span>
            </div>

            <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Specificity</span>
              <div class="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
                {{ (activeCard().validationMetrics.specificity * 100).toFixed(1) }}%
              </div>
              <span class="text-[10px] text-slate-400">True Negative Rate</span>
            </div>

            <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase">Cohort Size (N)</span>
              <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {{ activeCard().validationMetrics.validationSampleSize.toLocaleString() }}
              </div>
              <span class="text-[10px] text-slate-400">{{ activeCard().validationMetrics.groupKFoldSplits }}-Fold Grouped CV</span>
            </div>
          </div>
        }

        @case ('demographics') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Age & Gender Distribution</h4>
                <ul class="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300">
                  <li class="flex justify-between"><span>Median Age:</span> <strong>{{ activeCard().demographics.ageMedian }} yrs</strong></li>
                  <li class="flex justify-between"><span>Age Range:</span> <strong>{{ activeCard().demographics.ageRange }}</strong></li>
                  <li class="flex justify-between"><span>Female:</span> <strong>{{ activeCard().demographics.femalePct }}%</strong></li>
                  <li class="flex justify-between"><span>Male:</span> <strong>{{ activeCard().demographics.malePct }}%</strong></li>
                </ul>
              </div>

              <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">Race & Ethnicity Diversity</h4>
                <ul class="text-xs space-y-1.5 text-slate-700 dark:text-zinc-300">
                  <li class="flex justify-between"><span>White / Caucasian:</span> <strong>{{ activeCard().demographics.ethnicityWhitePct }}%</strong></li>
                  <li class="flex justify-between"><span>Black / African American:</span> <strong>{{ activeCard().demographics.ethnicityBlackPct }}%</strong></li>
                  <li class="flex justify-between"><span>Hispanic / Latino:</span> <strong>{{ activeCard().demographics.ethnicityHispanicPct }}%</strong></li>
                  <li class="flex justify-between"><span>Asian American:</span> <strong>{{ activeCard().demographics.ethnicityAsianPct }}%</strong></li>
                </ul>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-zinc-400 italic">
              Validated across {{ activeCard().demographics.studySitesCount }} diverse clinical study sites in accordance with FDA GMLP demographic balance requirements.
            </p>
          </div>
        }

        @case ('governance') {
          <div class="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-3">
            <div>
              <span class="text-slate-500 dark:text-zinc-400 font-semibold uppercase">IRB & Ethical Protocol:</span>
              <p class="font-mono text-slate-800 dark:text-zinc-200 mt-0.5">{{ activeCard().governance.irbApprovalId }}</p>
            </div>
            <div>
              <span class="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Reference Standard Methodology:</span>
              <p class="text-slate-700 dark:text-zinc-300 mt-0.5">{{ activeCard().governance.referenceStandardMethodology }}</p>
            </div>
            <div>
              <span class="text-slate-500 dark:text-zinc-400 font-semibold uppercase">Funding & Conflict of Interest:</span>
              <p class="text-slate-700 dark:text-zinc-300 mt-0.5">{{ activeCard().governance.conflictOfInterestDeclaration }} ({{ activeCard().governance.fundingSources.join(', ') }})</p>
            </div>
          </div>
        }

        @case ('contraindications') {
          <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 text-xs space-y-2">
            <span class="font-bold text-amber-800 dark:text-amber-300 uppercase">Clinical Contraindications & Exclusions:</span>
            <ul class="list-disc list-inside space-y-1 text-amber-900 dark:text-amber-200">
              @for (contra of activeCard().contraindications; track contra) {
                <li>{{ contra }}</li>
              }
            </ul>
          </div>
        }
      }

      <!-- 1-Click Export Actions -->
      <div class="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          type="button"
          (click)="downloadHti2Json()"
          class="px-4 py-2 text-xs font-bold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:bg-slate-800 transition-all min-h-[44px] flex items-center gap-1.5 focus:outline-hidden"
        >
          <span>📜 Download ONC HTI-2 Dossier (.json)</span>
        </button>

        <button
          type="button"
          (click)="downloadFhirDeviceDef()"
          class="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all min-h-[44px] flex items-center gap-1.5 focus:outline-hidden"
        >
          <span>🔥 Export FHIR R4 DeviceDefinition</span>
        </button>
      </div>
    </div>
  `
})
export class OncDsiTransparencyCardComponent {
  readonly dsiService = inject(OncDsiTransparencyService);
  readonly activeTab = signal<DsiTab>('metrics');

  readonly activeCard = computed<IDsiModelCard>(() => this.dsiService.activeModelCard());

  downloadHti2Json(): void {
    const json = this.dsiService.exportHti2ComplianceJson(this.activeCard().id);
    this.triggerBlobDownload(json, `onc-hti2-${this.activeCard().id}.json`, 'application/json');
  }

  downloadFhirDeviceDef(): void {
    const fhir = this.dsiService.exportFhirDeviceDefinition(this.activeCard().id);
    this.triggerBlobDownload(JSON.stringify(fhir, null, 2), `fhir-device-${this.activeCard().id}.json`, 'application/json');
  }

  private triggerBlobDownload(content: string, filename: string, mime: string): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
