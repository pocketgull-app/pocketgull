import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';

@Component({
  selector: 'app-tri-paradigm-integrative-lens-tab',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in duration-300">
      
      <!-- Lens Header Banner -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/80 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xl">☯️ 🌿 🔬</span>
            <h2 class="text-lg font-bold">Tri-Paradigm Integrative Medicine Lens</h2>
            <pocket-gull-badge label="TCM • AYURVEDA • ALLOPATHIC" severity="info"></pocket-gull-badge>
          </div>
          <p class="text-xs text-slate-300 font-mono">Unified Epistemological Harmony: 12 Jing-Luo Meridians • Tridosha & Agni • CYP450 Molecular Pharmacology</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="selectView('all')" [class.bg-cyan-600]="activeParadigmView() === 'all'" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition flex items-center gap-1">
            <span>🏛️</span> Unified Tri-View
          </button>
          <button (click)="selectView('tcm')" [class.bg-emerald-600]="activeParadigmView() === 'tcm'" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition flex items-center gap-1">
            <span>☯️</span> TCM 3D
          </button>
          <button (click)="selectView('ayurveda')" [class.bg-amber-600]="activeParadigmView() === 'ayurveda'" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition flex items-center gap-1">
            <span>🌿</span> Ayurveda 3D
          </button>
          <button (click)="selectView('allopathic')" [class.bg-indigo-600]="activeParadigmView() === 'allopathic'" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition flex items-center gap-1">
            <span>🔬</span> Molecular Bridge
          </button>
        </div>
      </div>


      <!-- 3-Column Paradigm Cockpit -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- PARADIGM 1: TCM JING-LUO & WU-XING (WOOD, FIRE, EARTH, METAL, WATER) -->
        <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <span class="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>☯️</span> TCM Zang-Fu & Wu-Xing
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                LIVER-SPLEEN AXIS
              </span>
            </div>

            <!-- Wu Xing 5-Element Horizontal Energy Gauges -->
            <div class="space-y-2.5 text-xs font-mono mb-4">
              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-emerald-600 dark:text-emerald-400 font-bold">🌳 Wood (Liver / Gallbladder)</span>
                  <span class="font-bold">{{ tcmMetrics().wood }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full" [style.width.%]="tcmMetrics().wood"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-amber-600 dark:text-amber-400 font-bold">⛰️ Earth (Spleen / Stomach)</span>
                  <span class="font-bold">{{ tcmMetrics().earth }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full rounded-full" [style.width.%]="tcmMetrics().earth"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-rose-600 dark:text-rose-400 font-bold">🔥 Fire (Heart / Small Intestine)</span>
                  <span class="font-bold">{{ tcmMetrics().fire }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div class="bg-rose-500 h-full rounded-full" [style.width.%]="tcmMetrics().fire"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-[11px] mb-1">
                  <span class="text-cyan-600 dark:text-cyan-400 font-bold">💧 Water (Kidney / Bladder)</span>
                  <span class="font-bold">{{ tcmMetrics().water }}%</span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div class="bg-cyan-500 h-full rounded-full" [style.width.%]="tcmMetrics().water"></div>
                </div>
              </div>
            </div>

            <!-- Pattern Synthesis -->
            <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs space-y-1.5 mb-4">
              <p class="font-bold text-emerald-900 dark:text-emerald-200">Gan Yu Pi Xu (Liver Qi Stagnating Spleen)</p>
              <p class="text-emerald-800 dark:text-emerald-300 text-[11px]">Emotional stress constrains Liver Qi, impairing Spleen transportation and causing postprandial heaviness.</p>
            </div>

            <!-- Primary Acupoints -->
            <div class="space-y-1.5 text-[11px]">
              <span class="font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">Acupoint Prescription:</span>
              <div class="flex flex-wrap gap-1.5">
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-emerald-700 dark:text-emerald-300 font-bold">LV-3 (Taichong)</span>
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-amber-700 dark:text-amber-300 font-bold">ST-36 (Zusanli)</span>
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-cyan-700 dark:text-cyan-300 font-bold">SP-6 (Sanyinjiao)</span>
                <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-rose-700 dark:text-rose-300 font-bold">PC-6 (Neiguan)</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-500">
            Formula: Xiao Yao San (Free & Easy Wanderer)
          </div>
        </div>

        <!-- PARADIGM 2: AYURVEDIC TRIDOSHA & AGNI/AMA (VATA, PITTA, KAPHA) -->
        <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <span class="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>🌿</span> Ayurvedic Tridosha & Agni
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                VATA-PITTA DUAL
              </span>
            </div>

            <!-- Dosha Distribution -->
            <div class="grid grid-cols-3 gap-2 text-center font-mono mb-4">
              <div class="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                <span class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">Vata (Air)</span>
                <p class="text-xl font-bold text-purple-900 dark:text-purple-200">{{ ayurvedaMetrics().vata }}%</p>
                <span class="text-[9px] text-purple-600 dark:text-purple-400">Kinetic / Dry</span>
              </div>
              <div class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                <span class="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Pitta (Fire)</span>
                <p class="text-xl font-bold text-rose-900 dark:text-rose-200">{{ ayurvedaMetrics().pitta }}%</p>
                <span class="text-[9px] text-rose-600 dark:text-rose-400">Metabolic</span>
              </div>
              <div class="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
                <span class="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">Kapha (Earth)</span>
                <p class="text-xl font-bold text-teal-900 dark:text-teal-200">{{ ayurvedaMetrics().kapha }}%</p>
                <span class="text-[9px] text-teal-600 dark:text-teal-400">Structural</span>
              </div>
            </div>

            <!-- Agni & Ama Gauges -->
            <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs space-y-2 mb-4">
              <div class="flex justify-between items-center">
                <span class="font-bold text-amber-900 dark:text-amber-200">Metabolic Agni Fire:</span>
                <span class="font-mono text-amber-800 dark:text-amber-300 font-bold">Vishama (Erratic)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-amber-900 dark:text-amber-200">Ama (Endotoxin Sludge):</span>
                <span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">Low-Moderate (28/100)</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-bold text-amber-900 dark:text-amber-200">Ojas Vitality Reserve:</span>
                <span class="font-mono font-bold text-amber-600 dark:text-amber-400">74 / 100</span>
              </div>
            </div>

            <!-- Rasayana Recommendation -->
            <div class="text-[11px] text-slate-700 dark:text-zinc-300 space-y-1">
              <p><strong>Prescribed Rasayana:</strong> Ashwagandha + Shatavari</p>
              <p class="text-[10px] text-slate-500">Grounds fluctuating Vata and nourishes Majja (nervous) and Ojas vitality pools.</p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-500">
            Dinacharya: Warm sesame oil Abhyanga massage
          </div>
        </div>

        <!-- PARADIGM 3: ALLOPATHIC PHARMACOGENOMICS & MOLECULAR BRIDGE -->
        <div class="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4">
              <span class="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>🔬</span> Allopathic Molecular Bridge
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold">
                CYP3A4 / AMPK DECONFLICTED
              </span>
            </div>

            <!-- Enzyme & Synergy Callout -->
            <div class="space-y-2 text-xs mb-4">
              <div class="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl space-y-1">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <span class="font-bold text-indigo-700 dark:text-indigo-300">Metformin + Huang Lian (Berberine)</span>
                  <span class="text-emerald-600 font-bold">✓ Dual AMPK</span>
                </div>
                <p class="text-[10.5px] text-slate-600 dark:text-zinc-400">Beneficial glycemic synergy. Space by 2 hours to avoid competitive intestinal absorption.</p>
              </div>

              <div class="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 rounded-xl space-y-1">
                <div class="flex items-center justify-between font-mono text-[11px]">
                  <span class="font-bold text-indigo-700 dark:text-indigo-300">Amlodipine + Ashwagandha</span>
                  <span class="text-emerald-600 font-bold">✓ Vagal Synergy</span>
                </div>
                <p class="text-[10.5px] text-slate-600 dark:text-zinc-400">Supports peripheral arterial relaxation without negative inotropic interference.</p>
              </div>
            </div>

            <!-- 24-Hour Dosing Timeline -->
            <div class="space-y-1 text-[11px] font-mono">
              <span class="font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">Hour-by-Hour Timing:</span>
              <div class="p-2 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] space-y-1 text-slate-700 dark:text-zinc-300">
                <div class="flex justify-between"><span>08:30 Breakfast:</span> <span class="font-bold">Metformin + Food</span></div>
                <div class="flex justify-between"><span>11:30 Mid-Day:</span> <span class="font-bold text-emerald-600">Berberine + Ashwagandha</span></div>
                <div class="flex justify-between"><span>18:30 Dinner:</span> <span class="font-bold">Amlodipine + Curcumin</span></div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-500">
            Safety Level: SAFE WITH 2-HOUR BOTANICAL SPACING
          </div>
        </div>

      </div>

    </div>
  `
})
export class TriParadigmIntegrativeLensTabComponent {
  private state = inject(PatientStateService);

  readonly activeParadigmView = signal<'all' | 'tcm' | 'ayurveda' | 'allopathic'>('all');

  readonly tcmMetrics = signal({
    wood: 75,
    earth: 68,
    fire: 45,
    water: 38
  });

  readonly ayurvedaMetrics = signal({
    vata: 46.5,
    pitta: 32.5,
    kapha: 21.0
  });

  selectView(view: 'all' | 'tcm' | 'ayurveda' | 'allopathic'): void {
    this.activeParadigmView.set(view);
    if (view === 'tcm') {
      this.state.bodyViewerMode.set('3d');
      this.state.selectPhilosophy('eastern');
    } else if (view === 'ayurveda') {
      this.state.bodyViewerMode.set('3d');
      this.state.selectPhilosophy('ayurvedic');
    } else if (view === 'allopathic') {
      this.state.bodyViewerMode.set('3d');
      this.state.selectPhilosophy('western');
    } else if (view === 'all') {
      this.state.bodyViewerMode.set('quad');
    }
  }
}