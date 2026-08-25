import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';

export type LifeStageKey = 'pediatric' | 'young_adult' | 'perinatal' | 'midlife' | 'geriatric';

export interface ILifeStagePeril {
  id: LifeStageKey;
  stageName: string;
  ageRange: string;
  icon: string;
  westernPerils: string[];
  easternPerils: string[];
  ayurvedicPerils: string[];
  preventiveFocus: string[];
}

@Component({
  selector: 'app-life-perils-paradigm-matrix',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl font-sans relative overflow-hidden pocket-gull-card mb-8">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3.5">
          <span class="text-3xl p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">⏳</span>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">Actuarial Longevity & Risk Engine</span>
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#3B82F6] text-white font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)]">
                Sentinel 🔦 Risk Mitigation
              </span>
              <pocket-gull-badge label="Multi-Paradigm Life Perils" severity="warning"></pocket-gull-badge>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 uppercase">Life-Stage Perils & Vulnerability Matrix</h3>
          </div>
        </div>

        <!-- Paradigm Indicator -->
        <span class="px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg border flex items-center gap-1.5 self-start sm:self-auto"
              [class.bg-sky-500\/20]="state.activePhilosophy() === 'western'"
              [class.text-sky-300]="state.activePhilosophy() === 'western'"
              [class.border-sky-500\/40]="state.activePhilosophy() === 'western'"
              [class.bg-emerald-500\/20]="state.activePhilosophy() === 'eastern'"
              [class.text-emerald-300]="state.activePhilosophy() === 'eastern'"
              [class.border-emerald-500\/40]="state.activePhilosophy() === 'eastern'"
              [class.bg-amber-500\/20]="state.activePhilosophy() === 'ayurvedic'"
              [class.text-amber-300]="state.activePhilosophy() === 'ayurvedic'"
              [class.border-amber-500\/40]="state.activePhilosophy() === 'ayurvedic'">
          <span>{{ state.activePhilosophy() === 'western' ? '🔵 Western Allopathic Lens' : (state.activePhilosophy() === 'eastern' ? '🟢 Eastern TCM Lens' : '🟡 Ayurvedic Vedic Lens') }}</span>
        </span>
      </div>

      <!-- Life-Stage Selector Tabs (Min 44px WCAG Touch Targets) -->
      <div class="flex overflow-x-auto gap-2 pb-2 hide-scrollbar snap-x">
        @for (stage of lifeStages; track stage.id) {
          <button (click)="selectedStageId.set(stage.id)"
            [class]="selectedStageId() === stage.id ? 'bg-amber-500 text-slate-950 font-extrabold shadow-lg scale-[1.02]' : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700/80 font-semibold'"
            class="snap-start py-2.5 px-3.5 min-h-[44px] rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer">
            <span>{{ stage.icon }}</span>
            <span>{{ stage.stageName }}</span>
            <span class="text-[10px] opacity-75 font-mono">({{ stage.ageRange }})</span>
          </button>
        }
      </div>

      <!-- Active Stage Detailed View -->
      @if (activeStage(); as stage) {
        <div class="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 animate-in fade-in duration-300">
          <div class="flex items-center justify-between gap-2 mb-3">
            <h4 class="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>{{ stage.icon }}</span> {{ stage.stageName }} Peril Risk Profile
            </h4>
            <span class="text-xs font-mono text-slate-400 font-medium">Preventive Horizon: {{ stage.preventiveFocus.join(', ') }}</span>
          </div>

          <!-- Paradigm Comparison Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            
            <!-- Western Allopathic -->
            <div class="p-3.5 rounded-xl border transition-all"
                 [class.border-sky-500\/50]="state.activePhilosophy() === 'western'"
                 [class.bg-sky-950\/30]="state.activePhilosophy() === 'western'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'western'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'western'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-sky-400">
                <span>🔬</span> Western Allopathic Perils
              </div>
              <ul class="space-y-1.5 text-xs text-slate-300">
                @for (peril of stage.westernPerils; track peril) {
                  <li class="flex items-start gap-1.5">
                    <span class="text-sky-400">•</span>
                    <span>{{ peril }}</span>
                  </li>
                }
              </ul>
            </div>

            <!-- Eastern TCM -->
            <div class="p-3.5 rounded-xl border transition-all"
                 [class.border-emerald-500\/50]="state.activePhilosophy() === 'eastern'"
                 [class.bg-emerald-950\/30]="state.activePhilosophy() === 'eastern'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'eastern'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'eastern'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-emerald-400">
                <span>☯️</span> Eastern TCM Perils
              </div>
              <ul class="space-y-1.5 text-xs text-slate-300">
                @for (peril of stage.easternPerils; track peril) {
                  <li class="flex items-start gap-1.5">
                    <span class="text-emerald-400">•</span>
                    <span>{{ peril }}</span>
                  </li>
                }
              </ul>
            </div>

            <!-- Ayurvedic Vedic -->
            <div class="p-3.5 rounded-xl border transition-all"
                 [class.border-amber-500\/50]="state.activePhilosophy() === 'ayurvedic'"
                 [class.bg-amber-950\/30]="state.activePhilosophy() === 'ayurvedic'"
                 [class.border-slate-800]="state.activePhilosophy() !== 'ayurvedic'"
                 [class.bg-slate-900\/50]="state.activePhilosophy() !== 'ayurvedic'">
              <div class="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase text-amber-400">
                <span>🕉️</span> Ayurvedic Vedic Perils
              </div>
              <ul class="space-y-1.5 text-xs text-slate-300">
                @for (peril of stage.ayurvedicPerils; track peril) {
                  <li class="flex items-start gap-1.5">
                    <span class="text-amber-400">•</span>
                    <span>{{ peril }}</span>
                  </li>
                }
              </ul>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class LifePerilsParadigmMatrixComponent {
  state = inject(PatientStateService);

  readonly selectedStageId = signal<LifeStageKey>('midlife');

  readonly lifeStages: ILifeStagePeril[] = [
    {
      id: 'pediatric',
      stageName: 'Pediatric & Infancy',
      ageRange: '0 - 12 yrs',
      icon: '👶',
      westernPerils: ['Infectious pathogens & fever spikes', 'Allergy & asthma sensitization', 'Growth & skeletal development lag'],
      easternPerils: ['Spleen-Stomach immature digestive Qi', 'Wind-Cold invasion weakening Wei Qi', 'Frequent Phlegm-Heat retention'],
      ayurvedicPerils: ['Kapha dominant growth vulnerability', 'Agni (digestive fire) instability', 'Bala (immunity) formation phase'],
      preventiveFocus: ['Nutritional foundation', 'Immune priming', 'Ergonomic play']
    },
    {
      id: 'young_adult',
      stageName: 'Young Adult & Career',
      ageRange: '13 - 35 yrs',
      icon: '🏃',
      westernPerils: ['Circadian disruption & sleep debt', 'Metabolic syndrome onset', 'Reproductive & hormonal fluctuations'],
      easternPerils: ['Liver Qi Stagnation from mental stress', 'Heart-Shen agitation from burnout', 'Damp-Heat accumulation from diet'],
      ayurvedicPerils: ['Pitta dominance & inflammatory excess', 'Rakta (blood) overheating', 'Mental Rajasic overwhelm'],
      preventiveFocus: ['Circadian alignment', 'Stress resilience', 'Hormonal balance']
    },
    {
      id: 'perinatal',
      stageName: 'Perinatal & Maternal',
      ageRange: 'Reproductive',
      icon: '🤰',
      westernPerils: ['Gestational hypertension & preeclampsia', 'Postpartum thyroiditis & anemia', 'Pelvic floor & core instability'],
      easternPerils: ['Chong & Ren meridian Blood depletion', 'Postpartum Qi-Blood vacuum', 'Kidney Jing consumption during labor'],
      ayurvedicPerils: ['Vata surge during labor & postpartum', 'Ojas (vital essence) temporary depletion', 'Agni weakening'],
      preventiveFocus: ['Blood & Jing nourishment', 'Pelvic core recovery', 'Vagal autonomic co-regulation']
    },
    {
      id: 'midlife',
      stageName: 'Mid-Life Renewal',
      ageRange: '36 - 60 yrs',
      icon: '⚖️',
      westernPerils: ['Atherosclerosis & vascular stiffness', 'Insulin resistance & ectopic lipid deposition', 'Epigenetic methylation decay'],
      easternPerils: ['Kidney Yin/Yang Essence (Jing) decline', 'Liver-Kidney disharmony in menopause', 'Blood Stasis in micro-channels'],
      ayurvedicPerils: ['Pitta to Vata transition boundary', 'Dhatu (tissue) structural wear', 'Ama (toxic byproduct) bio-accumulation'],
      preventiveFocus: ['Vascular elasticity', 'Autophagy & mitochondrial health', 'Joint & spine resilience']
    },
    {
      id: 'geriatric',
      stageName: 'Geriatric Longevity',
      ageRange: '61+ yrs',
      icon: '🧓',
      westernPerils: ['Sarcopenia & frailty syndrome', 'Neurodegenerative cognitive decline', 'Osteoporosis & fall risks'],
      easternPerils: ['Kidney Jing exhaustion & bone marrow dryness', 'Heart Qi & Yang deficiency', 'Zang-Fu organ collapse'],
      ayurvedicPerils: ['Vata dominance causing dryness & tremors', 'Ojas dissipation', 'Degenerative Dhatu decay'],
      preventiveFocus: ['Sarcopenia prevention', 'Cognitive protection', 'Autonomic stability']
    }
  ];

  readonly activeStage = computed(() => {
    return this.lifeStages.find(s => s.id === this.selectedStageId()) || this.lifeStages[3];
  });
}
