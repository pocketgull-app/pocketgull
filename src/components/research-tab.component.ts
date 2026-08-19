import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwsOpenDataBrowserComponent } from './research/aws-open-data-browser.component';
import { TriCloudCarePlanConsensusComponent } from './clinical/tri-cloud-care-plan-consensus.component';

export interface IProteinHit {
  id: string;
  name: string;
  identity: string;
  evalue: string;
}

@Component({
  selector: 'app-research-tab',
  standalone: true,
  imports: [
    CommonModule,
    AwsOpenDataBrowserComponent,
    TriCloudCarePlanConsensusComponent
  ],
  template: `
    <div class="h-full flex flex-col gap-4 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-950/50">
      <!-- Top Sub-Navigation Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
          <h2 class="text-sm font-black tracking-wide text-zinc-900 dark:text-zinc-100 uppercase font-pocketgull">
            Tri-Cloud Clinical Research &amp; Open Data Hub
          </h2>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            (click)="activeSubTab.set('open-data')"
            [class.bg-amber-500]="activeSubTab() === 'open-data'"
            [class.text-white]="activeSubTab() === 'open-data'"
            [class.bg-zinc-200]="activeSubTab() !== 'open-data'"
            [class.dark:bg-zinc-800]="activeSubTab() !== 'open-data'"
            [class.text-zinc-700]="activeSubTab() !== 'open-data'"
            [class.dark:text-zinc-300]="activeSubTab() !== 'open-data'"
            class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>🌐 Open Data Federation</span>
          </button>

          <button
            (click)="activeSubTab.set('tri-cloud-consensus')"
            [class.bg-emerald-600]="activeSubTab() === 'tri-cloud-consensus'"
            [class.text-white]="activeSubTab() === 'tri-cloud-consensus'"
            [class.bg-zinc-200]="activeSubTab() !== 'tri-cloud-consensus'"
            [class.dark:bg-zinc-800]="activeSubTab() !== 'tri-cloud-consensus'"
            [class.text-zinc-700]="activeSubTab() !== 'tri-cloud-consensus'"
            [class.dark:text-zinc-300]="activeSubTab() !== 'tri-cloud-consensus'"
            class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>⚖️ Tri-Cloud Consensus</span>
          </button>

          <button
            (click)="activeSubTab.set('structural')"
            [class.bg-indigo-600]="activeSubTab() === 'structural'"
            [class.text-white]="activeSubTab() === 'structural'"
            [class.bg-zinc-200]="activeSubTab() !== 'structural'"
            [class.dark:bg-zinc-800]="activeSubTab() !== 'structural'"
            [class.text-zinc-700]="activeSubTab() !== 'structural'"
            [class.dark:text-zinc-300]="activeSubTab() !== 'structural'"
            class="px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-1.5 shadow-xs"
          >
            <span>🧬 Protein Targets</span>
          </button>
        </div>
      </div>

      <!-- Sub-Tab 1: Multi-Cloud Open Data Browser -->
      @if (activeSubTab() === 'open-data') {
        <app-aws-open-data-browser />
      }

      <!-- Sub-Tab 2: Tri-Cloud Clinical Consensus & Care Plan Engine -->
      @if (activeSubTab() === 'tri-cloud-consensus') {
        <app-tri-cloud-care-plan-consensus />
      }

      <!-- Sub-Tab 3: Protein Targets & Structural Hits -->
      @if (activeSubTab() === 'structural') {
        <div class="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm p-4">
          @if (!hits() || hits()!.length === 0) {
            <div class="h-64 flex flex-col items-center justify-center p-8 text-center">
              <svg class="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p class="text-sm font-bold text-zinc-700 dark:text-zinc-300">No active protein structural search requests.</p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">When the AI agent invokes science skills (like Foldseek or UniProt), target results will appear here.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th class="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Target ID</th>
                    <th class="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Protein Name</th>
                    <th class="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Identity</th>
                    <th class="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">E-Value</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                  @for (hit of hits(); track hit.id) {
                    <tr class="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/25 font-mono">
                      <td class="py-3 px-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        <a [href]="'https://www.uniprot.org/uniprotkb/' + hit.id + '/entry'" target="_blank" class="hover:underline">{{ hit.id }}</a>
                      </td>
                      <td class="py-3 px-4 text-sm font-sans text-zinc-700 dark:text-zinc-300">{{ hit.name }}</td>
                      <td class="py-3 px-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {{ hit.identity }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-zinc-500 dark:text-zinc-400">{{ hit.evalue }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ResearchTabComponent {
  hits = input<IProteinHit[] | null>(null);
  activeSubTab = signal<'open-data' | 'tri-cloud-consensus' | 'structural'>('open-data');
}
