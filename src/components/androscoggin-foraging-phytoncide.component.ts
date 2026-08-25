import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';

export interface IForagingItem {
  id: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  name: string;
  botanicalName: string;
  phytochemicals: string;
  therapeuticBenefit: string;
  icon: string;
  safetyGuide: string;
}

@Component({
  selector: 'app-androscoggin-foraging-phytoncide',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden pocket-gull-card mb-8">
      
      <!-- Component Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3.5">
          <span class="text-3xl p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">🫐</span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Androscoggin River Valley Bioregion</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                Scribes 📖 Botanical Logbook
              </span>
              <pocket-gull-badge label="Seasonal Foraging & Terpene Phytoncides" severity="success"></pocket-gull-badge>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 uppercase">Lewiston-Auburn Riverbank Foraging & Conifer Terpene Tracker</h3>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs sm:text-sm font-mono font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Active Season: {{ selectedSeason() }}
          </span>
        </div>
      </div>

      <!-- Season Filter Buttons -->
      <div class="grid grid-cols-4 gap-2 mb-6">
        @for (s of seasons; track s) {
          <button (click)="selectedSeason.set(s)"
            [class]="selectedSeason() === s ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg scale-[1.02]' : 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 hover:bg-emerald-800/60 font-semibold'"
            class="py-2.5 px-3 min-h-[44px] rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2">
            <span>{{ getSeasonIcon(s) }}</span>
            <span class="hidden sm:inline">{{ s }}</span>
          </button>
        }
      </div>

      <!-- Model Scoring Badge Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 font-mono text-xs">
        <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block">AI Complexity Score</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">3.8 / 10</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
            Natural Entrainment
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block">Autonomic Stability Score</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">8.6 / 10</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
            Vagal Parasympathetic Shift
          </span>
        </div>

        <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase block">Diagnostic Certainty Score</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">9.3 / 10</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
            High Volatile Evidence
          </span>
        </div>
      </div>

      <!-- Terpene Phytoncide Immune Calculator Banner & Interactive Inhalation Telemetry -->
      <div class="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 mb-6 font-mono text-white shadow-xl relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-emerald-800/80 pb-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
            <span>🌲</span> Conifer Terpene Inhalation & NK-Cell Priming Telemetry
          </h4>
          <span class="text-xs text-emerald-400 font-extrabold px-3 py-1 rounded-lg bg-emerald-900/80 border border-emerald-600/40">
            NK-Cell Cytotoxicity: +{{ nkCellBoost() }}%
          </span>
        </div>

        <!-- Inhalation Duration Slider -->
        <div class="mb-4">
          <div class="flex justify-between items-center text-xs font-bold mb-1.5">
            <span class="text-emerald-300 uppercase tracking-wider">🎛️ Forest Bathing Inhalation Exposure:</span>
            <span class="text-emerald-400 font-extrabold">{{ exposureMinutes() }} Minutes</span>
          </div>
          <input type="range" min="10" max="90" step="5"
                 [value]="exposureMinutes()"
                 (input)="updateExposure($event)"
                 class="w-full h-2 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-emerald-800" />
          <div class="flex justify-between text-[9px] text-emerald-500 mt-1">
            <span>10 min (Micro-Dose)</span>
            <span>30 min (Standard Forest Bath)</span>
            <span>90 min (Full Canopy Immersion)</span>
          </div>
        </div>

        <!-- Telemetry Gauges Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">Alpha-Pinene & Limonene</div>
            <div class="text-sm font-black text-white mt-1">{{ terpeneSerum() }} nmol/L</div>
            <div class="text-[9px] text-emerald-300/80 mt-0.5">Airway Bronchodilation</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">NK Perforin / Granulysin</div>
            <div class="text-sm font-black text-emerald-300 mt-1">+{{ nkCellBoost() }}% Upregulation</div>
            <div class="text-[9px] text-emerald-300/80 mt-0.5">Antiviral Immune Priming</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">Salivary Cortisol</div>
            <div class="text-sm font-black text-amber-300 mt-1">-{{ cortisolDrop() }}% Reduction</div>
            <div class="text-[9px] text-emerald-300/80 mt-0.5">Stress Axis Attenuation</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-950/80 border border-emerald-800/80">
            <div class="text-[10px] text-emerald-400 font-bold uppercase">HRV Vagal Coherence</div>
            <div class="text-sm font-black text-teal-300 mt-1">{{ hrvCoherence() }} / 100</div>
            <div class="text-[9px] text-emerald-300/80 mt-0.5">Parasympathetic Tone</div>
          </div>
        </div>
      </div>

      <!-- Seasonal Foraging Items Grid with 3D Double-Click Flip State Machines -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
        @for (item of filteredItems(); track item.id) {
          @let isItemFlipped = isItemFlippedMethod(item.id);
          <div (dblclick)="toggleItemFlip(item.id); $event.stopPropagation()"
               class="relative perspective-1000 group cursor-pointer h-60"
               title="Double-click to flip over for Botanical Safety Guide & Identification Rationale">
            
            <div [class.rotate-y-180]="isItemFlipped"
                 class="relative w-full h-full transition-transform duration-500 transform-style-3d">

              <!-- FRONT FACE -->
              <div class="p-5 rounded-2xl bg-zinc-950/90 border border-emerald-800/80 hover:border-emerald-500/50 transition flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">{{ item.icon }}</span>
                      <div>
                        <h5 class="text-sm font-bold text-white">{{ item.name }}</h5>
                        <span class="text-[11px] font-mono italic text-emerald-400 opacity-90">{{ item.botanicalName }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-1.5 font-mono">
                      <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        dblclick 🔄
                      </span>
                      <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-bold">
                        {{ item.season }}
                      </span>
                    </div>
                  </div>

                  <div class="text-xs text-zinc-300 space-y-1.5 mt-3">
                    <p><strong class="text-emerald-400 font-mono">Key Phytochemicals:</strong> {{ item.phytochemicals }}</p>
                    <p><strong class="text-emerald-400 font-mono">Clinical Benefit:</strong> {{ item.therapeuticBenefit }}</p>
                  </div>
                </div>

                <div class="pt-2 border-t border-zinc-800 flex items-center justify-between font-mono text-[9.5px]">
                  <button (click)="logForagedItem(item); $event.stopPropagation()"
                    class="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold uppercase transition active:scale-95 cursor-pointer">
                    + Log Harvest
                  </button>
                  <span class="text-zinc-500">Androscoggin Bioregion</span>
                </div>
              </div>

              <!-- BACK FACE -->
              <div class="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-500/40 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                <div>
                  <div class="flex items-center justify-between border-b border-emerald-800 pb-1.5 mb-2 font-mono text-xs">
                    <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                      <span>⚠️</span> Safety & Identification Guide
                    </span>
                    <span class="text-emerald-400 font-mono text-[10px]">dblclick flip</span>
                  </div>
                  <div class="space-y-1.5 text-emerald-100">
                    <p class="text-[11px]">
                      <strong>Safety Protocol:</strong> {{ item.safetyGuide }}
                    </p>
                    <p class="text-[11px]">
                      <strong>Preparation:</strong> Steep or decoct gently in 185°F water for 15 mins. Avoid high boiling to preserve volatile monoterpenes.
                    </p>
                  </div>
                </div>
                <div class="pt-1.5 border-t border-emerald-900 font-mono text-[9px] text-emerald-400 flex justify-between">
                  <span>Ethical Bioregional Foraging</span>
                  <span>Double-click to return</span>
                </div>
              </div>

            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class AndroscogginForagingPhytoncideComponent {
  state = inject(PatientStateService);

  readonly flippedItems = signal<Set<string>>(new Set());

  private lastItemFlipTimeMap = new Map<string, number>();

  toggleItemFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastItemFlipTimeMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastItemFlipTimeMap.set(id, now);
    const current = new Set(this.flippedItems());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedItems.set(current);
  }

  isItemFlippedMethod(id: string): boolean {
    return this.flippedItems().has(id);
  }

  logForagedItem(item: IForagingItem) {
    this.state.addClinicalNote({
      id: `forage-${Date.now()}`,
      text: `🌿 Foraged ${item.name} (${item.botanicalName}). Key compounds: ${item.phytochemicals}.`,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`🌿 Logged ${item.name} harvest to patient chart!`);
  }

  readonly seasons: ('Spring' | 'Summer' | 'Autumn' | 'Winter')[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
  readonly selectedSeason = signal<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Spring');

  readonly exposureMinutes = signal<number>(30);

  updateExposure(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.exposureMinutes.set(val);
  }

  readonly nkCellBoost = computed(() => {
    const mins = this.exposureMinutes();
    return Math.round(Math.min(58, Math.max(15, (mins / 30) * 42)));
  });

  readonly cortisolDrop = computed(() => {
    const mins = this.exposureMinutes();
    return Math.round(Math.min(36, Math.max(10, (mins / 30) * 30)));
  });

  readonly hrvCoherence = computed(() => {
    const mins = this.exposureMinutes();
    return Math.round(Math.min(98, Math.max(60, 68 + (mins / 90) * 28)));
  });

  readonly terpeneSerum = computed(() => {
    const mins = this.exposureMinutes();
    return (12.4 + (mins / 30) * 18.2).toFixed(1);
  });

  readonly foragingDatabase: IForagingItem[] = [
    {
      id: 'f_fiddlehead',
      season: 'Spring',
      name: 'Ostrich Fern Fiddleheads',
      botanicalName: 'Matteuccia struthiopteris',
      phytochemicals: 'Omega-3 Fatty Acids, Potassium, Vitamin A, Chlorophyll',
      therapeuticBenefit: 'Potent vascular anti-inflammatory & antioxidant support harvested along wet Androscoggin riverbanks.',
      icon: '🌿',
      safetyGuide: 'Harvest only uncurled fronds with brown papery scales. Always steam thoroughly for 10-15 mins before eating.'
    },
    {
      id: 'f_elderberry',
      season: 'Summer',
      name: 'American Black Elderberry',
      botanicalName: 'Sambucus nigra ssp. canadensis',
      phytochemicals: 'Anthocyanins, Quercetin, Rutin, Vitamin C',
      therapeuticBenefit: 'Inhibits viral replication spikes and strengthens upper respiratory mucosal barriers.',
      icon: '🫐',
      safetyGuide: 'Consume only fully ripe dark purple berries. Cook berries to neutralize cyanogenic glycosides in raw seeds.'
    },
    {
      id: 'f_chaga',
      season: 'Autumn',
      name: 'Wild Birch Chaga Mushroom',
      botanicalName: 'Inonotus obliquus',
      phytochemicals: 'Betulinic Acid, Polysaccharides, Superoxide Dismutase (SOD)',
      therapeuticBenefit: 'Top-tier antioxidant cellular protection and immune modulation harvested from Maine white paper birch trees.',
      icon: '🍄',
      safetyGuide: 'Harvest sustainably leaving 30% of sclerotium intact on host tree. Simmer ground chaga in hot water at 80°C for 2 hours.'
    },
    {
      id: 'f_pine',
      season: 'Winter',
      name: 'Eastern White Pine Needle Infusion',
      botanicalName: 'Pinus strobus',
      phytochemicals: 'Shikimic Acid, Vitamin C (5x lemon concentration), Alpha-Pinene',
      therapeuticBenefit: 'Expectorant airway clearance, immune enhancement, and metabolic brown fat activation during winter cold fronts.',
      icon: '🌲',
      safetyGuide: 'Use 5-needle bundle Eastern White Pine only. Avoid Ponderosa or Yew needles. Steep fresh needles in boiled water.'
    }
  ];

  readonly filteredItems = computed(() => {
    const s = this.selectedSeason();
    return this.foragingDatabase.filter(item => item.season === s);
  });

  getSeasonIcon(season: string): string {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '☀️';
      case 'Autumn': return '🍂';
      case 'Winter': return '❄️';
      default: return '🌿';
    }
  }
}
