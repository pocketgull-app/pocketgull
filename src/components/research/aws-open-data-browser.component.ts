/**
 * Multi-Cloud Open Health Data Federation Browser Component.
 * Interactive Angular 22 Standalone component allowing clinicians and researchers
 * to explore, filter, and inspect open biomedical datasets across AWS, GCP, and Azure.
 *
 * @module components/research/aws-open-data-browser
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwsOpenDataService, IOpenHealthDataset } from '../../services/aws-open-data.service';

@Component({
  selector: 'app-aws-open-data-browser',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">
              AWS RODA
            </span>
            <span class="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              Google Cloud
            </span>
            <span class="px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
              Microsoft Azure
            </span>
            <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Zero-Egress Public Health Data</span>
          </div>
          <h2 class="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-pocketgull">
            Multi-Cloud Open Health Data Federation
          </h2>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Query open clinical trial literature, genomic variants, bioassays, and oncology datasets across AWS S3, Google BigQuery, and Azure Open Datasets.
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a
            href="https://registry.opendata.aws/"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            AWS Registry &rarr;
          </a>
          <a
            href="https://learn.microsoft.com/en-us/azure/open-datasets/"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2.5 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Azure Datasets &rarr;
          </a>
        </div>
      </div>

      <!-- Cloud Provider Filter Bar -->
      <div class="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Provider:</span>
        <button
          (click)="openData.setProvider('all')"
          [class.bg-zinc-900]="openData.activeProvider() === 'all'"
          [class.text-white]="openData.activeProvider() === 'all'"
          [class.dark:bg-zinc-100]="openData.activeProvider() === 'all'"
          [class.dark:text-zinc-900]="openData.activeProvider() === 'all'"
          [class.bg-zinc-100]="openData.activeProvider() !== 'all'"
          [class.dark:bg-zinc-900]="openData.activeProvider() !== 'all'"
          [class.text-zinc-600]="openData.activeProvider() !== 'all'"
          [class.dark:text-zinc-400]="openData.activeProvider() !== 'all'"
          class="px-3 py-1 text-xs font-bold rounded-lg transition-all"
        >
          All Clouds ({{ openData.filteredDatasets().length }})
        </button>

        <button
          (click)="openData.setProvider('aws')"
          [class.bg-amber-500]="openData.activeProvider() === 'aws'"
          [class.text-white]="openData.activeProvider() === 'aws'"
          [class.bg-zinc-100]="openData.activeProvider() !== 'aws'"
          [class.dark:bg-zinc-900]="openData.activeProvider() !== 'aws'"
          [class.text-zinc-600]="openData.activeProvider() !== 'aws'"
          [class.dark:text-zinc-400]="openData.activeProvider() !== 'aws'"
          class="px-3 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
        >
          <span>AWS RODA</span>
        </button>

        <button
          (click)="openData.setProvider('gcp')"
          [class.bg-emerald-600]="openData.activeProvider() === 'gcp'"
          [class.text-white]="openData.activeProvider() === 'gcp'"
          [class.bg-zinc-100]="openData.activeProvider() !== 'gcp'"
          [class.dark:bg-zinc-900]="openData.activeProvider() !== 'gcp'"
          [class.text-zinc-600]="openData.activeProvider() !== 'gcp'"
          [class.dark:text-zinc-400]="openData.activeProvider() !== 'gcp'"
          class="px-3 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
        >
          <span>Google Cloud</span>
        </button>

        <button
          (click)="openData.setProvider('azure')"
          [class.bg-blue-600]="openData.activeProvider() === 'azure'"
          [class.text-white]="openData.activeProvider() === 'azure'"
          [class.bg-zinc-100]="openData.activeProvider() !== 'azure'"
          [class.dark:bg-zinc-900]="openData.activeProvider() !== 'azure'"
          [class.text-zinc-600]="openData.activeProvider() !== 'azure'"
          [class.dark:text-zinc-400]="openData.activeProvider() !== 'azure'"
          class="px-3 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
        >
          <span>Microsoft Azure</span>
        </button>
      </div>

      <!-- Search & Category Filters -->
      <div class="mt-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div class="relative flex-1">
          <input
            type="text"
            placeholder="Search across all clouds by gene, disease, target, or method..."
            [value]="openData.searchQuery()"
            (input)="onSearchInput($event)"
            class="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          @for (cat of categories; track cat.id) {
            <button
              (click)="openData.setCategory(cat.id)"
              [class.bg-zinc-800]="openData.activeCategory() === cat.id"
              [class.text-white]="openData.activeCategory() === cat.id"
              [class.dark:bg-zinc-200]="openData.activeCategory() === cat.id"
              [class.dark:text-zinc-900]="openData.activeCategory() === cat.id"
              [class.bg-zinc-100]="openData.activeCategory() !== cat.id"
              [class.dark:bg-zinc-900]="openData.activeCategory() !== cat.id"
              [class.text-zinc-600]="openData.activeCategory() !== cat.id"
              [class.dark:text-zinc-400]="openData.activeCategory() !== cat.id"
              class="px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap"
            >
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- Dataset Grid -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (dataset of openData.filteredDatasets(); track dataset.id) {
          <div
            (click)="openData.selectDataset(dataset)"
            class="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span
                  [class.bg-amber-500/10]="dataset.provider === 'aws'"
                  [class.text-amber-600]="dataset.provider === 'aws'"
                  [class.dark:text-amber-400]="dataset.provider === 'aws'"
                  [class.border-amber-500/20]="dataset.provider === 'aws'"
                  [class.bg-emerald-500/10]="dataset.provider === 'gcp'"
                  [class.text-emerald-600]="dataset.provider === 'gcp'"
                  [class.dark:text-emerald-400]="dataset.provider === 'gcp'"
                  [class.border-emerald-500/20]="dataset.provider === 'gcp'"
                  [class.bg-blue-500/10]="dataset.provider === 'azure'"
                  [class.text-blue-600]="dataset.provider === 'azure'"
                  [class.dark:text-blue-400]="dataset.provider === 'azure'"
                  [class.border-blue-500/20]="dataset.provider === 'azure'"
                  class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border"
                >
                  {{ dataset.providerLabel }}
                </span>
                <span class="text-[11px] text-zinc-400 font-mono truncate max-w-[170px]">{{ dataset.storageUri }}</span>
              </div>

              <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
                {{ dataset.name }}
              </h3>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {{ dataset.description }}
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
              <span class="text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">{{ dataset.managedBy }}</span>
              <a
                [href]="dataset.documentationUrl"
                target="_blank"
                rel="noopener noreferrer"
                (click)="$event.stopPropagation()"
                class="text-zinc-800 dark:text-zinc-200 hover:underline font-bold inline-flex items-center gap-1"
              >
                Docs &rarr;
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Detail Modal -->
      @if (openData.selectedDataset(); as ds) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              (click)="openData.selectDataset(null)"
              class="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full">
                {{ ds.providerLabel }} • {{ ds.queryOrAccessMethod }}
              </span>
              <span class="text-xs text-zinc-500">{{ ds.license }}</span>
            </div>

            <h3 class="text-lg font-black text-zinc-900 dark:text-zinc-100 font-pocketgull mb-2">
              {{ ds.name }}
            </h3>
            <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
              {{ ds.description }}
            </p>

            <div class="p-3 bg-zinc-100 dark:bg-zinc-950 rounded-xl font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1 mb-4">
              <div><span class="text-zinc-500">Storage URI:</span> {{ ds.storageUri }}</div>
              <div><span class="text-zinc-500">Location:</span> {{ ds.regionOrLocation }}</div>
              <div><span class="text-zinc-500">Managed By:</span> {{ ds.managedBy }}</div>
              @if (ds.directAccessUrl) {
                <div class="truncate"><span class="text-zinc-500">Public URL:</span> <a [href]="ds.directAccessUrl" target="_blank" class="text-amber-500 underline">{{ ds.directAccessUrl }}</a></div>
              }
            </div>

            <div class="flex flex-wrap gap-1.5 mb-6">
              @for (tag of ds.tags; track tag) {
                <span class="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[11px]">
                  #{{ tag }}
                </span>
              }
            </div>

            <div class="flex items-center justify-end gap-3">
              <button
                (click)="openData.selectDataset(null)"
                class="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Close
              </button>
              <a
                [href]="ds.documentationUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-4 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-xl inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>View Documentation</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AwsOpenDataBrowserComponent {
  openData = inject(AwsOpenDataService);

  categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'clinical', label: 'Clinical Literature & Trials' },
    { id: 'genomics', label: 'Genomics & Variants' },
    { id: 'pharmacology', label: 'Pharmacology & Targets' },
    { id: 'imaging', label: 'Oncology & Imaging' },
    { id: 'epidemiology', label: 'Epidemiology' },
  ];

  onSearchInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.openData.setSearch(target.value);
  }
}
