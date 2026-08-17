import { Component, ChangeDetectionStrategy, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicCitationService, ICitationEntry, ICitationDossier } from '../services/academic-citation.service';

@Component({
  selector: 'app-academic-citation-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity duration-300 font-sans"
         (click)="close.emit()">
      
      <!-- Slide-over Drawer Panel -->
      <div class="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col p-6 sm:p-8 overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">📚</span>
            <div>
              <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-serif">
                Academic Citation &amp; Evidence Ledger
              </h2>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                Peer-Reviewed RCTs • Cochrane RoB 2 • AMA / BibTeX / RIS Exports
              </p>
            </div>
          </div>

          <button (click)="close.emit()"
            class="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-lg font-bold">
            ✕
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="mb-5 space-y-2">
          <div class="relative">
            <input type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              placeholder="Filter by condition, component, statute (e.g. 504, SIBI, CGM, FDA)..."
              class="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-sans text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')"
                class="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                Clear
              </button>
            }
          </div>

          <!-- Quick Filter Pills -->
          <div class="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <button (click)="searchQuery.set('Section 504')"
              class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition cursor-pointer border border-zinc-200 dark:border-zinc-700">
              🎒 Section 504
            </button>
            <button (click)="searchQuery.set('SIBI')"
              class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition cursor-pointer border border-zinc-200 dark:border-zinc-700">
              🦷 Teledentistry SIBI
            </button>
            <button (click)="searchQuery.set('FDA')"
              class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition cursor-pointer border border-zinc-200 dark:border-zinc-700">
              🏛️ FDA §520(o)
            </button>
            <button (click)="searchQuery.set('Caslon')"
              class="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition cursor-pointer border border-zinc-200 dark:border-zinc-700">
              🖋️ Caslon Typo
            </button>
            <button (click)="searchQuery.set('')"
              class="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-bold transition cursor-pointer">
              All ({{ filteredDossier().totalCitations }})
            </button>
          </div>
        </div>

        <!-- Export Action Bar -->
        <div class="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <span class="text-zinc-500 font-bold">Export:</span>
          <button (click)="copyToClipboard(filteredDossier().amaBibliography.join('\n\n'), 'AMA')"
            class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-teal-500 text-zinc-800 dark:text-zinc-200 transition cursor-pointer">
            📋 Copy AMA List
          </button>
          <button (click)="copyToClipboard(filteredDossier().bibTexBundle, 'BibTeX')"
            class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-teal-500 text-zinc-800 dark:text-zinc-200 transition cursor-pointer">
            📜 Copy BibTeX
          </button>
          <button (click)="copyToClipboard(filteredDossier().risBundle, 'RIS')"
            class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-teal-500 text-zinc-800 dark:text-zinc-200 transition cursor-pointer">
            📑 Copy RIS
          </button>
          @if (copiedFormat()) {
            <span class="text-teal-600 dark:text-teal-400 font-bold ml-auto animate-pulse">
              ✓ Copied {{ copiedFormat() }}!
            </span>
          }
        </div>

        <!-- Scrollable Citation Cards List -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-1">
          @for (c of filteredDossier().entries; track c.id) {
            <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs font-sans hover:border-teal-500/50 transition">
              
              <!-- Card Header -->
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                    {{ c.topic }}
                  </span>
                  <h4 class="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5 font-serif">
                    {{ c.title }}
                  </h4>
                </div>
                
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                  {{ c.evidenceTier }}
                </span>
              </div>

              <!-- Authors & Journal -->
              <div class="text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                {{ c.authors.join(', ') }} • <em>{{ c.journalOrPublisher }}</em> ({{ c.year }})
              </div>

              <!-- Abstract Summary -->
              <p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {{ c.abstractSummary }}
              </p>

              <!-- Identifiers & Statute Pill Strip -->
              <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[10px]">
                @if (c.pmid) {
                  <a [href]="'https://pubmed.ncbi.nlm.nih.gov/' + c.pmid" target="_blank" rel="noopener noreferrer"
                    class="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:underline">
                    PMID: {{ c.pmid }} ↗
                  </a>
                }

                @if (c.doi) {
                  <a [href]="'https://doi.org/' + c.doi" target="_blank" rel="noopener noreferrer"
                    class="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:underline">
                    DOI: {{ c.doi }} ↗
                  </a>
                }

                @if (c.cochraneRoB2Grade) {
                  <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    RoB 2: {{ c.cochraneRoB2Grade }}
                  </span>
                }

                @if (c.statuteReference) {
                  <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    ⚖️ {{ c.statuteReference }}
                  </span>
                }

                @if (c.componentRef) {
                  <span class="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 ml-auto">
                    Anchor: <code>{{ c.componentRef }}</code>
                  </span>
                }
              </div>

            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class AcademicCitationDrawerComponent {
  citationService = inject(AcademicCitationService);
  close = output<void>();

  searchQuery = signal<string>('');
  copiedFormat = signal<string | null>(null);

  filteredDossier = computed<ICitationDossier>(() => {
    return this.citationService.exportCitationDossier(this.searchQuery());
  });

  copyToClipboard(text: string, formatName: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.copiedFormat.set(formatName);
      setTimeout(() => this.copiedFormat.set(null), 2500);
    }
  }
}
