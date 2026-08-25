import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopulationHealthEquityService, IPatientCohortProfile } from '../services/population-health-equity.service';

@Component({
  selector: 'app-population-health-equity-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-indigo-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-lg">
            🌍
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Population Health & Global Patient Equity Hub
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Demographic cohort switching, Social Determinants of Health (SDoH), and synthetic FHIR R4 clinical trial export.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold font-mono">
            5 Diverse Demographic Archetypes Active
          </span>
        </div>
      </div>

      <!-- Cohort Switcher Tabs -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
          Select Patient Demographic Cohort Archetype:
        </label>
        <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-950/80 rounded-xl border border-zinc-200 dark:border-zinc-800">
          @for (cohort of health.cohorts(); track cohort.id) {
            <button
              (click)="health.selectCohort(cohort.id)"
              [class.bg-indigo-600]="health.activeCohortId() === cohort.id"
              [class.text-white]="health.activeCohortId() === cohort.id"
              [class.text-gray-700]="health.activeCohortId() !== cohort.id"
              [class.dark:text-zinc-300]="health.activeCohortId() !== cohort.id"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
              <span>👥</span>
              <span>{{ cohort.demographicGroup }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Active Cohort Profile & SDoH Telemetry Grid -->
      @let active = health.selectedCohort();
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Cohort Summary Card -->
        <div class="p-4 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 font-mono text-xs md:col-span-2">
          <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <span class="font-bold text-indigo-400 font-sans text-sm">{{ active.name }}</span>
            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold">
              SIBI Score: {{ active.sibiScore }} / 100
            </span>
          </div>

          <div class="space-y-1 font-sans">
            <span class="font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">Chief Clinical Presentation:</span>
            <p class="text-gray-800 dark:text-zinc-200 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
              "{{ active.chiefComplaint }}"
            </p>
          </div>

          <!-- SDoH Environmental Matrix Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span class="text-zinc-500 block text-[10px]">Food Security:</span>
              <span class="font-bold text-amber-500">{{ active.sdoh.foodDesertIndex }}</span>
            </div>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span class="text-zinc-500 block text-[10px]">HPSA Clinic Dist:</span>
              <span class="font-bold text-indigo-400">{{ active.sdoh.hpsaDistanceMiles }} mi</span>
            </div>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span class="text-zinc-500 block text-[10px]">Air Quality (AQI):</span>
              <span class="font-bold" [class.text-rose-400]="active.sdoh.environmentalAqi > 100" [class.text-emerald-400]="active.sdoh.environmentalAqi <= 100">
                {{ active.sdoh.environmentalAqi }} AQI
              </span>
            </div>
            <div class="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span class="text-zinc-500 block text-[10px]">Digital Literacy:</span>
              <span class="font-bold text-cyan-400">{{ active.sdoh.digitalLiteracyTier }}</span>
            </div>
          </div>
        </div>

        <!-- Health Equity Burden Index (HEBI Dial) Card -->
        <div class="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl flex flex-col justify-between items-center text-center space-y-3 font-mono">
          <span class="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Health Equity Burden Index</span>
          <div class="text-4xl font-black text-indigo-400 font-sans my-1">
            {{ health.hebiIndex() }} <span class="text-xs font-normal text-zinc-500">/ 100</span>
          </div>
          <p class="text-[10px] text-zinc-400 font-sans leading-relaxed">
            Multidimensional risk index quantifying food access barriers, rural clinic distance, and environmental vulnerability.
          </p>
          <span class="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            🛡️ Safe Harbor Certified
          </span>
        </div>
      </div>

      <!-- Synthetic FHIR R4 Bundle Exporter -->
      <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-base">📦</span>
            <span class="font-bold text-indigo-300 uppercase tracking-wider text-[11px]">
              Synthetic FHIR R4 Bundle Exporter (Clinical Trials & Zenodo Open-Science)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="generateFhirJson()"
              class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5">
              <span>📥 Generate FHIR R4 JSON</span>
            </button>
          </div>
        </div>

        @if (generatedBundle(); as bundle) {
          <div class="p-3 bg-zinc-900 border border-indigo-500/30 rounded-lg space-y-2 animate-in fade-in duration-200">
            <div class="flex items-center justify-between text-[10px] text-indigo-300">
              <span>FHIR R4 Bundle ID: {{ bundle.id }}</span>
              <span>Timestamp: {{ bundle.timestamp }}</span>
            </div>
            <pre class="text-[11px] text-emerald-400 bg-black/60 p-3 rounded-lg overflow-x-auto max-h-48 font-mono border border-zinc-800 leading-relaxed">{{ getFormattedJson(bundle) }}</pre>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PopulationHealthEquityHubComponent {
  readonly health = inject(PopulationHealthEquityService);
  readonly generatedBundle = signal<any>(null);

  constructor() {
    this.generateFhirJson();
  }

  generateFhirJson() {
    const bundle = this.health.generateSyntheticFhirBundle();
    this.generatedBundle.set(bundle);
  }

  getFormattedJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}
