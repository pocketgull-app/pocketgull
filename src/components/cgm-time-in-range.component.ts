import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CgmTimeInRangeService } from '../services/cgm-time-in-range.service';

@Component({
  selector: 'app-cgm-time-in-range',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
            🩸
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Continuous Glucose Monitoring (CGM) Time-in-Range & Glycemic Engine
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              International Consensus 24-Hour CGM Time-in-Range (70-180 mg/dL) & Glucose Management Indicator (GMI).
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
            LOINC 9001-3
          </span>
        </div>
      </div>

      <!-- Key Clinical Metrics Banner -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3.5 bg-emerald-500/5 border border-emerald-500/30 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
            Time in Range (70-180)
          </span>
          <span class="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {{ analysis().timeInRangePercent }}%
          </span>
          <span class="block text-[10px] text-gray-400 font-medium">Target: &gt; 70%</span>
        </div>

        <div class="p-3.5 bg-teal-500/5 border border-teal-500/30 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
            Tight Range (70-140)
          </span>
          <span class="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
            {{ analysis().timeTightRangePercent }}%
          </span>
          <span class="block text-[10px] text-gray-400 font-medium">Target: &gt; 50%</span>
        </div>

        <div class="p-3.5 bg-indigo-500/5 border border-indigo-500/30 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
            Glycemic Variability (%CV)
          </span>
          <span class="text-2xl font-black font-mono" [class.text-emerald-600]="analysis().coefficientOfVariationPercent <= 36" [class.text-amber-600]="analysis().coefficientOfVariationPercent > 36">
            {{ analysis().coefficientOfVariationPercent }}%
          </span>
          <span class="block text-[10px] text-gray-400 font-medium">Target: &le; 36.0%</span>
        </div>

        <div class="p-3.5 bg-purple-500/5 border border-purple-500/30 rounded-xl space-y-1">
          <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
            Estimated HbA1c (GMI)
          </span>
          <span class="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {{ analysis().gmiEstimatedA1c }}%
          </span>
          <span class="block text-[10px] text-gray-400 font-medium">Mean: {{ analysis().meanGlucoseMgDl }} mg/dL</span>
        </div>
      </div>

      <!-- 24-Hour CGM Trend Chart Simulation -->
      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-zinc-300">
          <span>24-Hour Continuous Glucose Sensor Profile (mg/dL)</span>
          <span class="font-mono text-emerald-600 dark:text-emerald-400">Status: {{ analysis().clinicalAssessment }}</span>
        </div>

        <div class="h-32 bg-gray-900 rounded-xl p-3 flex items-end justify-between gap-1 relative overflow-hidden border border-emerald-500/20">
          <!-- Target 70-180 Band Overlay -->
          <div class="absolute left-0 right-0 top-[25%] bottom-[30%] bg-emerald-500/10 border-y border-emerald-500/30 pointer-events-none"></div>

          <div *ngFor="let g of readings(); let i = index" class="flex-1 rounded-t transition-all duration-200" [style.height.%]="getGraphHeight(g)" [class.bg-emerald-500]="g >= 70 && g <= 180" [class.bg-amber-500]="g > 180" [class.bg-purple-500]="g < 70" [title]="'Hour ' + i + ': ' + g + ' mg/dL'"></div>
        </div>
        <div class="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>00:00</span>
          <span>06:00 (Fasting)</span>
          <span>12:00 (Postprandial)</span>
          <span>18:00 (Dinner)</span>
          <span>24:00</span>
        </div>
      </div>

      <!-- Simulation Actions -->
      <div class="space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          Glycemic Challenge Simulations:
        </h4>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <button (click)="simulatePostprandialSpike()" class="p-2.5 border border-amber-500/30 rounded-xl font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition cursor-pointer text-left">
            🍞 Postprandial Carb Spike
            <span class="block text-[10px] font-normal opacity-80">+60 mg/dL glucose surge</span>
          </button>

          <button (click)="simulateAerobicExercise()" class="p-2.5 border border-emerald-500/30 rounded-xl font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer text-left">
            🏃 Aerobic Exercise
            <span class="block text-[10px] font-normal opacity-80">-35 mg/dL insulin sensitivity</span>
          </button>

          <button (click)="simulateHypoDrop()" class="p-2.5 border border-purple-500/30 rounded-xl font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition cursor-pointer text-left">
            📉 Hypo Drop (< 70)
            <span class="block text-[10px] font-normal opacity-80">Triggers orange juice alert</span>
          </button>

          <button (click)="resetReadings()" class="p-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 transition cursor-pointer text-left">
            🔄 Reset Normal CGM
            <span class="block text-[10px] font-normal opacity-80">Baseline euglycemia</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class CgmTimeInRangeComponent {
  private cgmService = inject(CgmTimeInRangeService);

  readonly readings = this.cgmService.glucoseReadingsMgDl;
  readonly analysis = this.cgmService.cgmAnalysis;

  getGraphHeight(mgDl: number): number {
    return Math.min(100, Math.max(15, Math.round((mgDl / 250) * 100)));
  }

  simulatePostprandialSpike(): void {
    this.readings.update(curr => curr.map(g => Math.min(260, g + 45)));
  }

  simulateAerobicExercise(): void {
    this.readings.update(curr => curr.map(g => Math.max(75, g - 30)));
  }

  simulateHypoDrop(): void {
    this.readings.update(curr => [65, 62, 58, 60, 68, 75, 82, 90, 100, 105, 110, 115, 120, 118, 112, 108, 104, 100, 95, 92, 88, 85, 82, 80]);
  }

  resetReadings(): void {
    this.readings.set([115, 122, 108, 95, 134, 142, 168, 175, 182, 130, 105, 88, 76, 68, 92, 110, 125, 138, 145, 120, 112, 104, 98, 102]);
  }
}
