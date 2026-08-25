import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type KaizenViewTab = 'ishikawa' | 'pareto' | 'spc';

export interface IFishboneBranch {
  title: string;
  icon: string;
  causes: string[];
  colorClass: string;
}

export interface IParetoAction {
  rank: number;
  title: string;
  category: string;
  impactScore: number; // 0-100
  cumulativeImpact: number; // 0-100%
  leverageGroup: 'high_leverage_20' | 'secondary_80';
}

@Component({
  selector: 'app-kaizen-quality-suite',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg flex flex-col gap-6 font-sans">
      
      <!-- Suite Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 font-mono">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs uppercase font-extrabold tracking-widest text-emerald-500 dark:text-emerald-400">Lean Healthcare & Quality Optimization</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Kaizen Clinical Instrumentation
            </span>
          </div>
          <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Continuous Outcome Optimization Suite</h3>
        </div>

        <!-- View Tabs Switcher -->
        <div class="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button (click)="activeTab.set('ishikawa')"
            [class.bg-white]="activeTab() === 'ishikawa'"
            [class.dark:bg-zinc-800]="activeTab() === 'ishikawa'"
            [class.text-emerald-600]="activeTab() === 'ishikawa'"
            [class.dark:text-emerald-400]="activeTab() === 'ishikawa'"
            [class.shadow-xs]="activeTab() === 'ishikawa'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            🐟 Ishikawa Fishbone
          </button>
          <button (click)="activeTab.set('pareto')"
            [class.bg-white]="activeTab() === 'pareto'"
            [class.dark:bg-zinc-800]="activeTab() === 'pareto'"
            [class.text-emerald-600]="activeTab() === 'pareto'"
            [class.dark:text-emerald-400]="activeTab() === 'pareto'"
            [class.shadow-xs]="activeTab() === 'pareto'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            📊 Pareto 80/20 Analysis
          </button>
          <button (click)="activeTab.set('spc')"
            [class.bg-white]="activeTab() === 'spc'"
            [class.dark:bg-zinc-800]="activeTab() === 'spc'"
            [class.text-emerald-600]="activeTab() === 'spc'"
            [class.dark:text-emerald-400]="activeTab() === 'spc'"
            [class.shadow-xs]="activeTab() === 'spc'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer">
            📈 SPC Control Chart
          </button>
        </div>
      </div>

      <!-- VIEW 1: ISHIKAWA (FISHBONE) DIAGRAM -->
      @if (activeTab() === 'ishikawa') {
        <div class="flex flex-col gap-4 animate-in fade-in duration-300">
          
          <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-xs uppercase font-extrabold text-emerald-400 font-mono block">Root Cause Problem Statement:</span>
              <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                Chronic Systemic Fatigue & Accelerating Biological Aging Index
              </h4>
            </div>
            <span class="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/40">
              6-Branch Kaizen Matrix
            </span>
          </div>

          <!-- Fishbone Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (branch of fishboneBranches; track branch.title) {
              <div class="p-4 rounded-2xl border transition-all" [class]="branch.colorClass">
                <div class="flex items-center gap-2 font-mono border-b border-zinc-200/60 dark:border-zinc-800 pb-2 mb-2.5">
                  <span class="text-lg">{{ branch.icon }}</span>
                  <span class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{{ branch.title }}</span>
                </div>
                <ul class="space-y-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-sans">
                  @for (cause of branch.causes; track cause) {
                    <li class="flex items-start gap-1.5">
                      <span class="text-emerald-500 font-mono text-xs">➔</span>
                      <span>{{ cause }}</span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      }

      <!-- VIEW 2: PARETO 80/20 ANALYSIS CHART -->
      @if (activeTab() === 'pareto') {
        <div class="flex flex-col gap-4 animate-in fade-in duration-300">
          
          <div class="p-4 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex justify-between items-center font-mono">
            <div>
              <span class="text-xs uppercase font-extrabold text-sky-400 block">Kaizen 80/20 Principle:</span>
              <p class="text-xs text-zinc-300 font-sans mt-0.5">
                Targeting the top 20% of high-leverage interventions produces 80% of total biological recovery.
              </p>
            </div>
            <span class="text-xs font-bold px-3 py-1 rounded-xl bg-sky-950 text-sky-300 border border-sky-500/40 shrink-0">
              Top 3 High-Leverage Actions
            </span>
          </div>

          <!-- Pareto Actions List -->
          <div class="space-y-3">
            @for (action of paretoActions; track action.title) {
              <div class="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                [class.bg-sky-500\/10]="action.leverageGroup === 'high_leverage_20'"
                [class.border-sky-500\/40]="action.leverageGroup === 'high_leverage_20'"
                [class.bg-zinc-50]="action.leverageGroup !== 'high_leverage_20'"
                [class.dark:bg-zinc-950]="action.leverageGroup !== 'high_leverage_20'"
                [class.border-zinc-200]="action.leverageGroup !== 'high_leverage_20'"
                [class.dark:border-zinc-800]="action.leverageGroup !== 'high_leverage_20'">
                
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs"
                    [class.bg-sky-500]="action.leverageGroup === 'high_leverage_20'"
                    [class.text-white]="action.leverageGroup === 'high_leverage_20'"
                    [class.bg-zinc-200]="action.leverageGroup !== 'high_leverage_20'"
                    [class.dark:bg-zinc-800]="action.leverageGroup !== 'high_leverage_20'">
                    #{{ action.rank }}
                  </span>
                  <div>
                    <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-mono">
                      <span>{{ action.title }}</span>
                      @if (action.leverageGroup === 'high_leverage_20') {
                        <span class="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ⚡ Top 20% Leverage
                        </span>
                      }
                    </h4>
                    <span class="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans block mt-0.5">Category: {{ action.category }}</span>
                  </div>
                </div>

                <!-- Impact Bar -->
                <div class="w-full sm:w-48 shrink-0 font-mono text-[11px]">
                  <div class="flex justify-between mb-1 text-zinc-400">
                    <span>Impact: {{ action.impactScore }} pts</span>
                    <span>Cumul: {{ action.cumulativeImpact }}%</span>
                  </div>
                  <div class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-sky-500 rounded-full" [style.width.%]="action.cumulativeImpact"></div>
                  </div>
                </div>

              </div>
            }
          </div>

        </div>
      }

      <!-- VIEW 3: SHEWHART SPC CONTROL CHART -->
      @if (activeTab() === 'spc') {
        <div class="flex flex-col gap-4 animate-in fade-in duration-300">
          
          <div class="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex justify-between items-center font-mono">
            <div>
              <span class="text-xs uppercase font-extrabold text-purple-400 block">Shewhart Statistical Process Control (SPC):</span>
              <h4 class="text-xs text-zinc-200 mt-0.5">Biometric Stream: HRV Vagal Resonance (ms) with ±3σ Control Limits</h4>
            </div>
            <div class="flex items-center gap-2 text-xs font-bold">
              <span class="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">UCL: 85ms</span>
              <span class="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Mean: 58ms</span>
              <span class="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">LCL: 32ms</span>
            </div>
          </div>

          <!-- Visual SPC Line Chart Simulation -->
          <div class="p-5 bg-zinc-950 rounded-2xl border border-zinc-800 font-mono relative overflow-hidden">
            <div class="flex justify-between text-[11px] text-zinc-400 border-b border-zinc-800 pb-2 mb-4">
              <span>Telemetry History (Last 14 Days)</span>
              <span class="text-emerald-400 font-bold">● Process Status: In Control (Common Cause Variations Only)</span>
            </div>

            <!-- Simulated SPC Data Points Bar/Line -->
            <div class="space-y-3">
              @for (point of spcPoints; track point.day) {
                <div class="flex items-center gap-3 text-xs">
                  <span class="w-16 text-zinc-400 text-[11px] shrink-0 font-mono">{{ point.day }}</span>
                  
                  <div class="flex-1 h-3 bg-zinc-900 rounded-full relative overflow-hidden border border-zinc-800">
                    <!-- Target Mean Line -->
                    <div class="absolute left-[58%] top-0 bottom-0 w-0.5 bg-emerald-500/60 z-10"></div>
                    
                    <!-- Data Bar -->
                    <div class="h-full rounded-full transition-all"
                      [class.bg-emerald-500]="point.val >= 45 && point.val <= 75"
                      [class.bg-amber-400]="point.val < 45 || point.val > 75"
                      [style.width.%]="point.val">
                    </div>
                  </div>

                  <span class="w-12 text-right font-mono font-bold"
                    [class.text-emerald-400]="point.val >= 45 && point.val <= 75"
                    [class.text-amber-400]="point.val < 45 || point.val > 75">
                    {{ point.val }}ms
                  </span>
                </div>
              }
            </div>

            <div class="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>Shewhart Western Electric Rules Active</span>
              <span>0 Out-of-Control Special Cause Shifts Detected</span>
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class KaizenQualitySuiteComponent {
  activeTab = signal<KaizenViewTab>('ishikawa');

  fishboneBranches: IFishboneBranch[] = [
    {
      title: 'Genomics & Epigenetics',
      icon: '🧬',
      colorClass: 'bg-purple-500/10 border-purple-500/30 dark:bg-purple-950/30',
      causes: ['Horvath Methylation Acceleration (+4.2 yrs)', 'MTHFR C677T Heterozygous Polymorphism', 'Telomere Shortening Rate High']
    },
    {
      title: 'Biochemistry & Vitals',
      icon: '🧪',
      colorClass: 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-950/30',
      causes: ['hs-CRP High (3.4 mg/L)', 'Fasting Insulin 14.2 µIU/mL', 'Serum Homocysteine 13.8 µmol/L']
    },
    {
      title: 'Environment & SDOH',
      icon: '🌍',
      colorClass: 'bg-teal-500/10 border-teal-500/30 dark:bg-teal-950/30',
      causes: ['Airborne PM2.5 Exposure High', 'Artificial Blue Light post-21:00', 'Occupational Noise Pollution (>75 dB)']
    },
    {
      title: 'Circadian & Sleep',
      icon: '⏰',
      colorClass: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/30',
      causes: ['REM Sleep Efficiency <14%', 'Melatonin Onset Delayed 90 mins', 'HRV Nocturnal Dip Suppressed']
    },
    {
      title: 'Lifestyle & Nutrition',
      icon: '🥗',
      colorClass: 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/30',
      causes: ['Omega-3 Index Low (3.8%)', 'Dietary Ultra-Processed Ratio >35%', 'Zone 2 Cardio <60 mins/week']
    },
    {
      title: 'Pharmacology & Interventions',
      icon: '💊',
      colorClass: 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/30',
      causes: ['Micronutrient Depletion from Antacids', 'Sub-therapeutic CoQ10 Cofactor', 'Irregular Supplement Timing']
    }
  ];

  paretoActions: IParetoAction[] = [
    { rank: 1, title: '0.1 Hz Vagal Coherence & Diaphragmatic Breathing', category: 'Autonomic Nervous System', impactScore: 35, cumulativeImpact: 35, leverageGroup: 'high_leverage_20' },
    { rank: 2, title: 'Morning Solar Light Alignment (10,000 Lux @ 07:00)', category: 'Circadian Biology', impactScore: 28, cumulativeImpact: 63, leverageGroup: 'high_leverage_20' },
    { rank: 3, title: 'Eliminate Seed-Oil Oxidation & Ultra-Processed Food', category: 'Nutrition & Endothelium', impactScore: 18, cumulativeImpact: 81, leverageGroup: 'high_leverage_20' },
    { rank: 4, title: 'Magnesium L-Threonate & Apigenin Sleep Protocol', category: 'Neuro-Nutritional', impactScore: 10, cumulativeImpact: 91, leverageGroup: 'secondary_80' },
    { rank: 5, title: 'Zone 2 Aerobic Base Training (150 mins/week)', category: 'Mitochondrial Biogenesis', impactScore: 9, cumulativeImpact: 100, leverageGroup: 'secondary_80' }
  ];

  spcPoints = [
    { day: 'Day 1', val: 52 },
    { day: 'Day 3', val: 58 },
    { day: 'Day 5', val: 64 },
    { day: 'Day 7', val: 48 },
    { day: 'Day 9', val: 62 },
    { day: 'Day 11', val: 71 },
    { day: 'Day 14', val: 67 }
  ];
}
