import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GaugeType = 'complexity' | 'stability' | 'certainty' | 'survival' | 'longevity';
export type GaugeDisplayMode = 'full' | 'spark';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-clinical-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (mode() === 'full') {
      <div class="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all duration-300 ease-out animate-pg-fade-in hover:scale-[1.008] focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
           tabindex="0"
           role="progressbar"
           [attr.aria-valuenow]="value()"
           aria-valuemin="0"
           aria-valuemax="10"
           [attr.aria-label]="accessibilityLabel()">
        
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-400 font-mono">{{ label() }}</span>
            <span [class]="statusBadgeClasses()" class="text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono">
              {{ statusText() }}
            </span>
          </div>
          <span class="text-xl font-black text-gray-900 dark:text-zinc-100 font-mono tracking-tight">
            {{ displayValue() }}
            @if (type() !== 'survival' && type() !== 'longevity') {
              <span class="text-xs font-normal text-gray-400 dark:text-zinc-500">/10</span>
            }
          </span>
        </div>

        <!-- Accessible Track -->
        <div class="w-full h-3 bg-gray-100 dark:bg-zinc-800/80 rounded-full overflow-hidden relative shadow-inner">
          <div class="h-full rounded-full transition-all duration-700 ease-out relative"
               [style.width.%]="fillPercentage()"
               [style.background]="barColor()">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        <!-- Micro Survival Curve Trajectory Sparkline for Survival/Longevity Gauges -->
        @if (survivalCurvePoints() && survivalCurvePoints()!.length > 0) {
          <div class="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/60 flex items-center justify-between gap-3 text-[10px] font-mono">
            <span class="text-gray-400 dark:text-zinc-500 font-bold uppercase">Gompertz-Makeham Trajectory:</span>
            <div class="flex items-center gap-1">
              @for (pt of survivalCurvePoints()!.slice(0, 6); track pt.age) {
                <span class="px-1 py-0.5 rounded bg-zinc-800/40 text-cyan-300 text-[9px] border border-cyan-500/20">
                  {{ pt.age }}y: {{ (pt.personalizedSurvival * 100).toFixed(0) }}%
                </span>
              }
            </div>
          </div>
        }

        @if (description()) {
          <p class="mt-2.5 text-xs text-gray-600 dark:text-zinc-400 leading-relaxed font-sans font-medium">
            {{ description() }}
          </p>
        }
      </div>
    } @else {
      <!-- Spark / Compact Mode -->
      <div class="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl bg-zinc-900/90 dark:bg-zinc-950/90 border border-zinc-800/90 shadow-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
           tabindex="0"
           role="progressbar"
           [attr.aria-valuenow]="value()"
           aria-valuemin="0"
           aria-valuemax="10"
           [attr.aria-label]="accessibilityLabel()">
        
        <!-- Spark Micro Ring Gauge -->
        <div class="relative w-7 h-7 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <path class="text-zinc-800" stroke-width="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            <path [style.stroke]="ringColor()" stroke-width="4" stroke-linecap="round" fill="none"
                  [attr.stroke-dasharray]="dashArray()"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
          </svg>
          <span class="absolute text-[10px] font-extrabold text-zinc-100">{{ displayValue() }}</span>
        </div>

        <!-- Spark Label & Status -->
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{{ label() }}</span>
          <span class="text-[11px] font-black text-zinc-100">{{ statusText() }}</span>
        </div>
      </div>
    }
  `
})
export class ClinicalGaugeComponent {
  readonly label = input<string>('');
  readonly value = input<any>(0);
  readonly description = input<string>('');
  readonly type = input<GaugeType>('certainty');
  readonly mode = input<GaugeDisplayMode>('full');
  readonly survivalProbability = input<number | undefined>(undefined);
  readonly survivalCurvePoints = input<Array<{ age: number; personalizedSurvival: number }> | undefined>(undefined);

  readonly numericValue = computed(() => {
    const raw = this.value();
    if (raw === null || raw === undefined || raw === 'undefined' || raw === 'NaN') {
      const t = this.type();
      if (t === 'stability') return 7;
      if (t === 'certainty') return 8;
      return 5;
    }
    const num = Number(raw);
    if (Number.isNaN(num)) {
      const t = this.type();
      if (t === 'stability') return 7;
      if (t === 'certainty') return 8;
      return 5;
    }
    return Math.min(10, Math.max(0, num));
  });

  readonly fillPercentage = computed(() => {
    if (this.survivalProbability() !== undefined && this.survivalProbability() !== null && !Number.isNaN(Number(this.survivalProbability()))) {
      return Math.min(100, Math.max(0, Number(this.survivalProbability()) * 100));
    }
    return Math.min(100, Math.max(0, this.numericValue() * 10));
  });

  readonly displayValue = computed(() => {
    if (this.survivalProbability() !== undefined && this.survivalProbability() !== null && !Number.isNaN(Number(this.survivalProbability()))) {
      return `${(Number(this.survivalProbability()) * 100).toFixed(1)}%`;
    }
    return `${this.numericValue()}`;
  });

  readonly accessibilityLabel = computed(() => {
    const desc = this.description() ? `. ${this.description()}` : '';
    const valStr = (this.type() === 'survival' || this.type() === 'longevity')
      ? this.displayValue()
      : `${this.numericValue()} out of 10`;
    const labelPrefix = this.label() ? `${this.label()}: ` : '';
    return `${labelPrefix}${valStr}, Status: ${this.statusText()}${desc}`;
  });

  readonly statusText = computed(() => {
    const val = this.numericValue();
    const t = this.type();
    const prob = this.survivalProbability();

    if (t === 'survival' || t === 'longevity') {
      const p = (prob !== undefined && prob !== null && !Number.isNaN(Number(prob))) ? Number(prob) * 100 : val * 10;
      if (p >= 90) return 'High Survival Reserve';
      if (p >= 75) return 'Compensated Longevity';
      return 'Elevated Actuarial Risk';
    }

    if (t === 'stability') {
      if (val >= 8) return 'Optimal Stability';
      if (val >= 5) return 'Moderate Compensated';
      return 'Critical Unstable';
    }

    if (t === 'complexity') {
      if (val >= 8) return 'High Comorbidity';
      if (val >= 5) return 'Moderate Complexity';
      return 'Low Complexity';
    }

    // Certainty
    if (val >= 8) return 'High Evidence';
    if (val >= 5) return 'Moderate Evidence';
    return 'Low Certainty';
  });

  readonly statusBadgeClasses = computed(() => {
    const val = this.numericValue();
    const t = this.type();
    const prob = this.survivalProbability();

    if (t === 'survival' || t === 'longevity') {
      const p = (prob !== undefined && prob !== null && !Number.isNaN(Number(prob))) ? Number(prob) * 100 : val * 10;
      if (p >= 90) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      if (p >= 75) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    if (t === 'stability') {
      if (val >= 8) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      if (val >= 5) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse';
    }

    if (t === 'complexity') {
      if (val >= 8) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      if (val >= 5) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
    }

    // Certainty
    if (val >= 8) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    if (val >= 5) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
  });

  readonly barColor = computed(() => {
    const val = this.numericValue();
    const t = this.type();
    const prob = this.survivalProbability();

    if (t === 'survival' || t === 'longevity') {
      const p = (prob !== undefined && prob !== null && !Number.isNaN(Number(prob))) ? Number(prob) * 100 : val * 10;
      if (p >= 90) return 'linear-gradient(90deg, #10b981, #059669)';
      if (p >= 75) return 'linear-gradient(90deg, #06b6d4, #0891b2)';
      return 'linear-gradient(90deg, #f59e0b, #d97706)';
    }

    if (t === 'stability') {
      if (val >= 8) return 'linear-gradient(90deg, #10b981, #059669)';
      if (val >= 5) return 'linear-gradient(90deg, #f59e0b, #d97706)';
      return 'linear-gradient(90deg, #ef4444, #dc2626)';
    }

    if (t === 'complexity') {
      if (val >= 8) return 'linear-gradient(90deg, #a855f7, #7e22ce)';
      if (val >= 5) return 'linear-gradient(90deg, #6366f1, #4338ca)';
      return 'linear-gradient(90deg, #14b8a6, #0d9488)';
    }

    if (val >= 8) return 'linear-gradient(90deg, #06b6d4, #0891b2)';
    if (val >= 5) return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
    return 'linear-gradient(90deg, #6b7280, #4b5563)';
  });

  readonly ringColor = computed(() => {
    const val = this.numericValue();
    const t = this.type();
    const prob = this.survivalProbability();

    if (t === 'survival' || t === 'longevity') {
      const p = (prob !== undefined && prob !== null && !Number.isNaN(Number(prob))) ? Number(prob) * 100 : val * 10;
      if (p >= 90) return '#10b981';
      if (p >= 75) return '#06b6d4';
      return '#f59e0b';
    }

    if (t === 'stability') {
      if (val >= 8) return '#10b981';
      if (val >= 5) return '#f59e0b';
      return '#ef4444';
    }

    if (t === 'complexity') {
      if (val >= 8) return '#a855f7';
      if (val >= 5) return '#6366f1';
      return '#14b8a6';
    }

    if (val >= 8) return '#06b6d4';
    if (val >= 5) return '#3b82f6';
    return '#6b7280';
  });

  readonly dashArray = computed(() => {
    const pct = this.fillPercentage();
    return `${pct}, 100`;
  });
}

