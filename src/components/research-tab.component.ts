import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IProteinHit {
  id: string;
  name: string;
  identity: string;
  evalue: string;
}

@Component({
  selector: 'app-research-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col gap-4 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
        <h2 class="text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200 uppercase">Scientific Research</h2>
      </div>

      <div class="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        
        <!-- Empty State -->
        @if (!hits() || hits()!.length === 0) {
          <div class="h-full flex flex-col items-center justify-center p-8 text-center">
            <svg class="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">No active research requests.</p>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">When the AI agent invokes science skills (like protein searches), results will appear here.</p>
          </div>
        } @else {
          <!-- Results Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th class="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Target ID</th>
                  <th class="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Protein Name</th>
                  <th class="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Identity</th>
                  <th class="py-3 px-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">E-Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                @for (hit of hits(); track hit.id) {
                  <tr class="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/25">
                    <td class="py-3 px-4 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      <a [href]="'https://www.uniprot.org/uniprotkb/' + hit.id + '/entry'" target="_blank" class="hover:underline">{{ hit.id }}</a>
                    </td>
                    <td class="py-3 px-4 text-sm text-zinc-700 dark:text-zinc-300">{{ hit.name }}</td>
                    <td class="py-3 px-4 text-sm">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {{ hit.identity }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm font-mono text-zinc-500 dark:text-zinc-400">{{ hit.evalue }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class ResearchTabComponent {
  hits = input<IProteinHit[] | null>(null);
}
