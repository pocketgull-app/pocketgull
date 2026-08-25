import { Component, ChangeDetectionStrategy, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IGlossaryEntry {
  term: string;
  category: 'clinical' | 'tcm' | 'ayurveda' | 'arborist' | 'mechanic' | 'ai';
  categoryLabel: string;
  badgeColor: string;
  definition: string;
  allopathicEquivalent?: string;
  analogyEquivalent?: string;
}

@Component({
  selector: 'app-glossary-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn font-sans">
      <div class="w-full max-w-3xl bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <!-- Header -->
        <div class="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 font-mono">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📚</span>
            <div>
              <h2 class="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>Pocket-Gull Interactive Health Glossary</span>
              </h2>
              <p class="text-xs text-zinc-400 font-sans">Cross-Paradigm Medical, AI & Analogy Reference Dictionary</p>
            </div>
          </div>

          <button (click)="close.emit()" class="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-sm transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Filter Bar -->
        <div class="p-4 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <!-- Search Input -->
          <div class="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 w-full sm:w-64">
            <span class="text-zinc-500 mr-2">🔍</span>
            <input type="text" 
                   [value]="searchQuery()" 
                   (input)="updateSearch($event)"
                   placeholder="Search terms, DTC codes..." 
                   class="bg-transparent text-zinc-100 text-xs focus:outline-none w-full font-sans" />
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1 overflow-x-auto py-1">
            <button (click)="activeCategory.set('all')" 
                    [class]="activeCategory() === 'all' ? 'bg-indigo-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              All
            </button>
            <button (click)="activeCategory.set('clinical')" 
                    [class]="activeCategory() === 'clinical' ? 'bg-sky-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              🔬 Clinical
            </button>
            <button (click)="activeCategory.set('tcm')" 
                    [class]="activeCategory() === 'tcm' ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              🟢 TCM
            </button>
            <button (click)="activeCategory.set('ayurveda')" 
                    [class]="activeCategory() === 'ayurveda' ? 'bg-amber-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              🟡 Ayurveda
            </button>
            <button (click)="activeCategory.set('arborist')" 
                    [class]="activeCategory() === 'arborist' ? 'bg-emerald-700 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              🌳 Arborist
            </button>
            <button (click)="activeCategory.set('mechanic')" 
                    [class]="activeCategory() === 'mechanic' ? 'bg-cyan-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'"
                    class="px-2.5 py-1 rounded-lg transition text-[11px] cursor-pointer">
              🚗 Mechanic
            </button>
          </div>
        </div>

        <!-- Glossary Entry List -->
        <div class="p-5 flex-1 overflow-y-auto space-y-3">
          @for (entry of filteredEntries(); track entry.term) {
            <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-extrabold text-white flex items-center gap-2 font-mono">
                  <span>{{ entry.term }}</span>
                </h3>
                <span class="text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border"
                      [class]="entry.badgeColor">
                  {{ entry.categoryLabel }}
                </span>
              </div>
              <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                {{ entry.definition }}
              </p>
              @if (entry.allopathicEquivalent) {
                <div class="text-[11px] font-mono text-cyan-300 pt-1 border-t border-zinc-800/50 flex items-center gap-1.5">
                  <span class="text-zinc-500">Medical Code:</span>
                  <span class="font-bold">{{ entry.allopathicEquivalent }}</span>
                </div>
              }
            </div>
          } @empty {
            <div class="text-center py-12 text-zinc-500 font-mono text-xs">
              No glossary terms found matching "{{ searchQuery() }}".
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Showing {{ filteredEntries().length }} terms</span>
          <button (click)="close.emit()" class="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition cursor-pointer">
            Done
          </button>
        </div>

      </div>
    </div>
  `
})
export class GlossaryModalComponent {
  close = output<void>();

  readonly searchQuery = signal<string>('');
  readonly activeCategory = signal<string>('all');

  updateSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  readonly entries: IGlossaryEntry[] = [
    {
      term: 'Hypertension (I10)',
      category: 'clinical',
      categoryLabel: 'Allopathic Clinical',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
      definition: 'Persistently elevated systemic arterial blood pressure requiring vascular pressure monitoring and lifestyle intervention.',
      allopathicEquivalent: 'ICD-10 I10 / SNOMED 38341003'
    },
    {
      term: 'Liver Yang Rising',
      category: 'tcm',
      categoryLabel: 'TCM Wu Xing',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      definition: 'Pathological TCM syndrome where Wood element Heat surges upward, causing temporal headaches, dizziness, and emotional irritability.',
      allopathicEquivalent: 'Acupoint LV-3 (Taichong)'
    },
    {
      term: 'Pitta Vata Vascular Pulse',
      category: 'ayurveda',
      categoryLabel: 'Ayurveda Tridosha',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      definition: 'Elevated Fire/Air doshic aggravation causing arterial turbulence and hypermetabolic heat.',
      allopathicEquivalent: 'Manipura Chakra / Yakrit Marma'
    },
    {
      term: 'Trunk Xylem Sap Pressure',
      category: 'arborist',
      categoryLabel: 'Arborist Botanical',
      badgeColor: 'bg-emerald-950 text-emerald-200 border-emerald-700',
      definition: 'Health literacy analogy mapping blood pressure to fluid transport velocity through the central redwood trunk axis.',
      allopathicEquivalent: 'Translates SysBP / DiaBP to Sap Velocity'
    },
    {
      term: 'High Oil Hydraulic Pressure (DTC P0520)',
      category: 'mechanic',
      categoryLabel: 'Mechanic Automotive',
      badgeColor: 'bg-cyan-950 text-cyan-200 border-cyan-700',
      definition: 'Health literacy analogy mapping blood pressure to engine oil pump line PSI and OBD-II trouble code P0520.',
      allopathicEquivalent: 'OBD-II DTC Code P0520'
    },
    {
      term: 'L5-S1 Lumbar Trailer Hitch',
      category: 'mechanic',
      categoryLabel: 'Mechanic Automotive',
      badgeColor: 'bg-cyan-950 text-cyan-200 border-cyan-700',
      definition: 'Health literacy analogy mapping lumbo-sacral spinal joint compression to a heavy-duty trailer hitch under towed payload weight.',
      allopathicEquivalent: 'ICD-10 M54.16 Lumbar Radiculopathy'
    },
    {
      term: 'WebMCP Tool Catalog',
      category: 'ai',
      categoryLabel: 'AI & Architecture',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      definition: 'Standardized Model Context Protocol catalog allowing local and remote AI agents to discover patient state tools and run clinical intelligence tasks.'
    }
  ];

  readonly filteredEntries = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.activeCategory();

    return this.entries.filter(e => {
      const matchCat = cat === 'all' || e.category === cat;
      const matchQuery = !q || e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q) || (e.allopathicEquivalent && e.allopathicEquivalent.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  });
}
