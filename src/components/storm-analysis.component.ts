import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';

export type StormTypeKey = 'cytokine' | 'sympathetic' | 'thyroid' | 'barometric';

export interface IStormProfile {
  id: StormTypeKey;
  name: string;
  icon: string;
  severityScore: number; // 1-10
  westernPerspective: string;
  easternPerspective: string;
  ayurvedicPerspective: string;
  calmingActions: string[];
}

@Component({
  selector: 'app-storm-analysis',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full mb-8 p-6 sm:p-8 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl text-zinc-900 dark:text-zinc-100 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl font-sans overflow-hidden">
      
      <!-- Subtle Ambient Glow -->
      <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header -->
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🌩️
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400">Acute Multi-System Telemetry</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono font-bold tracking-wider uppercase border border-indigo-500/30">
                Gulliver 🔭 Dispatch
              </span>
              <pocket-gull-badge label="Physiological Storm Analysis" severity="warning"></pocket-gull-badge>
            </div>
            <h3 class="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1 uppercase font-mono">Physiological &amp; Environmental Storm Shield</h3>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider border shadow-xs"
                [class.bg-emerald-500/10]="overallStormIndex() <= 3"
                [class.text-emerald-700]="overallStormIndex() <= 3"
                [class.dark:text-emerald-300]="overallStormIndex() <= 3"
                [class.border-emerald-500/30]="overallStormIndex() <= 3"
                [class.bg-amber-500/10]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.text-amber-700]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.dark:text-amber-300]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.border-amber-500/30]="overallStormIndex() >= 4 && overallStormIndex() <= 6"
                [class.bg-rose-500/10]="overallStormIndex() >= 7"
                [class.text-rose-700]="overallStormIndex() >= 7"
                [class.dark:text-rose-300]="overallStormIndex() >= 7"
                [class.border-rose-500/30]="overallStormIndex() >= 7">
            Storm Risk Index: {{ overallStormIndex() }}/10 — {{ stormStatusText() }}
          </span>
        </div>
      </div>

      <!-- Storm Type Selectors (Min 44px Touch Targets) -->
      <div class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
        @for (storm of stormProfiles; track storm.id) {
          <button (click)="selectedStormId.set(storm.id)"
            [class]="selectedStormId() === storm.id ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 font-black border border-amber-500/50 shadow-xs' : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 hover:border-amber-500/40 font-bold shadow-xs'"
            class="py-3 px-3.5 min-h-[44px] rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ storm.icon }}</span>
              <span class="truncate">{{ storm.name }}</span>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-200/80 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-black">
              {{ storm.severityScore }}/10
            </span>
          </button>
        }
      </div>

      <!-- Active Storm Lens Detail -->
      @if (activeStorm(); as storm) {
        <div class="relative z-10 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 shadow-sm animate-in fade-in duration-300">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-5 font-mono">
            <h4 class="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span class="text-xl">{{ storm.icon }}</span> {{ storm.name }} Paradigm Evaluation
            </h4>
            <span class="text-xs font-mono font-extrabold text-zinc-500 dark:text-zinc-400">Active Paradigm Lens: {{ state.activePhilosophy() | uppercase }}</span>
          </div>

          <!-- 3-Lens Comparison Matrix -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            <!-- Western -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-sky-500/50]="state.activePhilosophy() === 'western'"
                 [class.bg-sky-500/10]="state.activePhilosophy() === 'western'"
                 [class.border-zinc-200]="state.activePhilosophy() !== 'western'"
                 [class.dark:border-zinc-800]="state.activePhilosophy() !== 'western'"
                 [class.bg-white]="state.activePhilosophy() !== 'western'"
                 [class.dark:bg-zinc-900/60]="state.activePhilosophy() !== 'western'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-black uppercase text-sky-700 dark:text-sky-400 font-mono">
                <span>🔬</span> Western Allopathic
              </div>
              <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{{ storm.westernPerspective }}</p>
            </div>

            <!-- Eastern -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-emerald-500/50]="state.activePhilosophy() === 'eastern'"
                 [class.bg-emerald-500/10]="state.activePhilosophy() === 'eastern'"
                 [class.border-zinc-200]="state.activePhilosophy() !== 'eastern'"
                 [class.dark:border-zinc-800]="state.activePhilosophy() !== 'eastern'"
                 [class.bg-white]="state.activePhilosophy() !== 'eastern'"
                 [class.dark:bg-zinc-900/60]="state.activePhilosophy() !== 'eastern'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 font-mono">
                <span>☯️</span> Eastern TCM
              </div>
              <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{{ storm.easternPerspective }}</p>
            </div>

            <!-- Ayurvedic -->
            <div class="p-4 rounded-xl border transition-all"
                 [class.border-amber-500/50]="state.activePhilosophy() === 'ayurvedic'"
                 [class.bg-amber-500/10]="state.activePhilosophy() === 'ayurvedic'"
                 [class.border-zinc-200]="state.activePhilosophy() !== 'ayurvedic'"
                 [class.dark:border-zinc-800]="state.activePhilosophy() !== 'ayurvedic'"
                 [class.bg-white]="state.activePhilosophy() !== 'ayurvedic'"
                 [class.dark:bg-zinc-900/60]="state.activePhilosophy() !== 'ayurvedic'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-black uppercase text-amber-700 dark:text-amber-400 font-mono">
                <span>🕉️</span> Ayurvedic Vedic
              </div>
              <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{{ storm.ayurvedicPerspective }}</p>
            </div>

          </div>

          <!-- Storm De-escalation Shield Actions -->
          <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div class="text-xs font-mono font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <span>🛡️</span> Prescribed Storm De-escalation &amp; Calming Protocol
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              @for (action of storm.calmingActions; track action) {
                <div class="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-zinc-800 dark:text-zinc-200 flex items-start gap-2">
                  <span class="text-emerald-600 dark:text-emerald-400 font-black mt-0.5">✓</span>
                  <span class="font-sans text-xs font-semibold">{{ action }}</span>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class StormAnalysisComponent {
  state = inject(PatientStateService);

  readonly selectedStormId = signal<StormTypeKey>('cytokine');

  readonly stormProfiles: IStormProfile[] = [
    {
      id: 'cytokine',
      name: 'Cytokine Inflammatory',
      icon: '🔥',
      severityScore: 3,
      westernPerspective: 'Sub-acute pro-inflammatory cytokine activity (hsCRP 1.8 mg/L, IL-6 3.2 pg/mL). Low systemic vascular leakage risk.',
      easternPerspective: 'Internal Heat accumulation in the Blood (Xue Heat) with mild Damp-Heat disturbance in the Triple Burner (San Jiao).',
      ayurvedicPerspective: 'Pitta Dosha aggravation spreading through Rakta Dhatu (blood tissue), kindling metabolic internal heat.',
      calmingActions: [
        'High-dose Curcumin & Boswellia phytotherapy',
        'Vagal resonant 0.1 Hz slow deep breathing',
        'Cold-water facial immersion & anti-inflammatory diet'
      ]
    },
    {
      id: 'sympathetic',
      name: 'Sympathetic Adrenergic',
      icon: '⚡',
      severityScore: 4,
      westernPerspective: 'Adrenergic sympathetic dominance (HRV RMSSD 24ms, LF/HF ratio 3.2). Elevated baseline cortisol & norepinephrine.',
      easternPerspective: 'Heart-Shen agitation and Liver Qi Stagnation transforming into Fire, disturbing sleep and autonomic composure.',
      ayurvedicPerspective: 'Vata Prana high-velocity imbalance agitating the Manovaha Srotas (mental channels).',
      calmingActions: [
        'Magnesium L-Threonate & Ashwagandha supplementation',
        '10-min weighted eye pillow relaxation',
        'Acoustic 432 Hz vagal tone singalong session'
      ]
    },
    {
      id: 'thyroid',
      name: 'Hyper-Metabolic Heat',
      icon: '🌡️',
      severityScore: 2,
      westernPerspective: 'Transient free T3/T4 metabolic elevation without hyperthyroid storm crisis. Normal resting heart rate.',
      easternPerspective: 'Yin Deficiency with Flaring Fire (Yin Xu Huo Wang) consuming Kidney and Heart Essence.',
      ayurvedicPerspective: 'Pitta and Tejas excess in the Thyroid Gland (Galaganda region), creating tissue dryness.',
      calmingActions: [
        'Cooling Brahmi & Shankhpushpi herbal infusion',
        'Avoidance of stimulant caffeine & nightshade crops',
        'Evening restorative Yin yoga & moonlit walks'
      ]
    },
    {
      id: 'barometric',
      name: 'Barometric Pressure',
      icon: '🌧️',
      severityScore: 3,
      westernPerspective: 'Autonomic vestibular & dural membrane sensitivity to rapid barometric pressure drops (1013 to 998 hPa).',
      easternPerspective: 'External Wind-Dampness invasion affecting joints and Sinew meridians during weather fronts.',
      ayurvedicPerspective: 'Vata movement triggered by atmospheric pressure changes, causing joint stiffness and headaches.',
      calmingActions: [
        'Warm sesame oil Abhyanga self-massage',
        'Hydration with ionic trace mineral electrolytes',
        'Ambient warm lighting (1800K) & compression garments'
      ]
    }
  ];

  readonly activeStorm = computed(() => {
    return this.stormProfiles.find(s => s.id === this.selectedStormId()) || this.stormProfiles[0];
  });

  readonly overallStormIndex = computed(() => {
    const scores = this.stormProfiles.map(s => s.severityScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  });

  readonly stormStatusText = computed(() => {
    const idx = this.overallStormIndex();
    if (idx <= 3) return 'Stable Physiological Baseline';
    if (idx <= 6) return 'Moderate Autonomic Turbulence';
    return 'Acute De-escalation Protocol Recommended';
  });
}
