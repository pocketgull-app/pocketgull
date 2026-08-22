import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ILongitudinalDataPoint {
  date: string;
  value: number;
  note?: string;
}

export type ClinicalParadigm = 'western' | 'tcm' | 'ayurveda' | 'osteopathic';

@Component({
  selector: 'app-longitudinal-trend-sparkline',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl border p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg"
         [ngClass]="getParadigmCardBorderClass()">
      
      <!-- Metric Header & Badge -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="text-base">{{ getParadigmIcon() }}</span>
          <div>
            <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {{ metricTitle() }}
            </h4>
            <span class="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              {{ paradigm() }} • {{ dataPoints().length }} Observations
            </span>
          </div>
        </div>

        <!-- Trend Pill -->
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border"
              [ngClass]="getTrendPillClass()">
          {{ trendLabel() }}
        </span>
      </div>

      <!-- Current Value Display -->
      <div class="flex items-baseline gap-1.5 my-2">
        <span class="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50">
          {{ latestValueFormatted() }}
        </span>
        <span class="text-xs font-bold text-zinc-500 dark:text-zinc-400">
          {{ unit() }}
        </span>
        <span class="text-[11px] font-mono ml-auto" [ngClass]="getDeltaColorClass()">
          {{ deltaFormatted() }}
        </span>
      </div>

      <!-- SVG Sparkline Area & Path -->
      <div class="relative w-full h-16 my-1">
        <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
          <defs>
            <linearGradient [id]="gradientId()" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" [attr.stop-color]="getStrokeColor()" stop-opacity="0.35" />
              <stop offset="100%" [attr.stop-color]="getStrokeColor()" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Target Healthy Range Band (if provided) -->
          @if (targetBandCoords(); as band) {
            <rect x="0" [attr.y]="band.y" width="100" [attr.height]="band.height" 
                  class="fill-emerald-500/10 dark:fill-emerald-500/15" />
          }

          <!-- Filled Area Under Curve -->
          @if (sparklineFillPath()) {
            <path [attr.d]="sparklineFillPath()" [attr.fill]="'url(#' + gradientId() + ')'" />
          }

          <!-- Trend Stroke Path -->
          @if (sparklineStrokePath()) {
            <path [attr.d]="sparklineStrokePath()" 
                  fill="none" 
                  [attr.stroke]="getStrokeColor()" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" />
          }

          <!-- Data Points Markers -->
          @for (pt of svgPoints(); track $index) {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2" 
                    [attr.fill]="getStrokeColor()" 
                    class="transition-all hover:r-3 cursor-pointer" />
          }
        </svg>
      </div>

      <!-- Date Range Baseline Footer -->
      <div class="flex items-center justify-between text-[9.5px] font-mono text-zinc-400 mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
        <span>{{ earliestDate() }}</span>
        <span>Target: {{ targetRangeLabel() }}</span>
        <span>{{ latestDate() }}</span>
      </div>

    </div>
  `
})
export class LongitudinalTrendSparklineComponent {
  metricTitle = input<string>('Vitals Trajectory');
  paradigm = input<ClinicalParadigm>('western');
  unit = input<string>('');
  dataPoints = input<ILongitudinalDataPoint[]>([]);
  targetRange = input<{ min: number; max: number } | null>(null);

  readonly gradientId = computed(() => `sparkline-grad-${this.metricTitle().replace(/[^a-zA-Z0-9]/g, '-')}`);

  readonly latestValue = computed<number | null>(() => {
    const pts = this.dataPoints();
    return pts.length > 0 ? pts[pts.length - 1].value : null;
  });

  readonly latestValueFormatted = computed(() => {
    const val = this.latestValue();
    return val !== null ? val.toFixed(1) : '—';
  });

  readonly earliestDate = computed(() => {
    const pts = this.dataPoints();
    return pts.length > 0 ? pts[0].date : 'Baseline';
  });

  readonly latestDate = computed(() => {
    const pts = this.dataPoints();
    return pts.length > 0 ? pts[pts.length - 1].date : 'Current';
  });

  readonly targetRangeLabel = computed(() => {
    const r = this.targetRange();
    return r ? `${r.min}–${r.max} ${this.unit()}` : 'Normative';
  });

  readonly delta = computed<number>(() => {
    const pts = this.dataPoints();
    if (pts.length < 2) return 0;
    return pts[pts.length - 1].value - pts[0].value;
  });

  readonly deltaFormatted = computed(() => {
    const d = this.delta();
    const sign = d > 0 ? '+' : '';
    return `${sign}${d.toFixed(1)} ${this.unit()}`;
  });

  readonly trendDirection = computed<'improving' | 'declining' | 'stable'>(() => {
    const d = this.delta();
    if (Math.abs(d) < 0.1) return 'stable';
    return d > 0 ? 'improving' : 'declining';
  });

  readonly trendLabel = computed(() => {
    const dir = this.trendDirection();
    if (dir === 'stable') return '➡️ Stable';
    return dir === 'improving' ? '📈 Improving' : '📉 Shifting';
  });

  readonly svgPoints = computed<Array<{ x: number; y: number }>>(() => {
    const pts = this.dataPoints();
    if (pts.length === 0) return [];
    if (pts.length === 1) return [{ x: 50, y: 20 }];

    const values = pts.map(p => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    return pts.map((p, idx) => {
      const x = (idx / (pts.length - 1)) * 96 + 2; // Keep padding
      const normalizedY = (p.value - minVal) / range;
      const y = 36 - normalizedY * 30; // Inverted SVG coordinate
      return { x, y };
    });
  });

  readonly sparklineStrokePath = computed<string>(() => {
    const coords = this.svgPoints();
    if (coords.length < 2) return '';
    return coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
  });

  readonly sparklineFillPath = computed<string>(() => {
    const coords = this.svgPoints();
    if (coords.length < 2) return '';
    const stroke = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
    const last = coords[coords.length - 1];
    const first = coords[0];
    return `${stroke} L ${last.x.toFixed(1)},40 L ${first.x.toFixed(1)},40 Z`;
  });

  readonly targetBandCoords = computed<{ y: number; height: number } | null>(() => {
    const r = this.targetRange();
    const pts = this.dataPoints();
    if (!r || pts.length < 2) return null;

    const values = pts.map(p => p.value);
    const minVal = Math.min(...values, r.min);
    const maxVal = Math.max(...values, r.max);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const yTop = 36 - ((r.max - minVal) / range) * 30;
    const yBottom = 36 - ((r.min - minVal) / range) * 30;
    return { y: Math.max(0, yTop), height: Math.max(2, yBottom - yTop) };
  });

  getParadigmIcon(): string {
    switch (this.paradigm()) {
      case 'western': return '🩺';
      case 'tcm': return '🌿';
      case 'ayurveda': return '🪷';
      case 'osteopathic': return '🦴';
    }
  }

  getStrokeColor(): string {
    switch (this.paradigm()) {
      case 'western': return '#0284c7'; // Sky-600
      case 'tcm': return '#059669'; // Emerald-600
      case 'ayurveda': return '#d97706'; // Amber-600
      case 'osteopathic': return '#7c3aed'; // Violet-600
    }
  }

  getParadigmCardBorderClass(): string {
    switch (this.paradigm()) {
      case 'western': return 'border-sky-200/80 dark:border-sky-800/40';
      case 'tcm': return 'border-emerald-200/80 dark:border-emerald-800/40';
      case 'ayurveda': return 'border-amber-200/80 dark:border-amber-800/40';
      case 'osteopathic': return 'border-purple-200/80 dark:border-purple-800/40';
    }
  }

  getTrendPillClass(): string {
    const dir = this.trendDirection();
    if (dir === 'improving') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (dir === 'declining') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  }

  getDeltaColorClass(): string {
    const d = this.delta();
    if (d > 0) return 'text-emerald-600 dark:text-emerald-400 font-bold';
    if (d < 0) return 'text-amber-600 dark:text-amber-400 font-bold';
    return 'text-zinc-500 font-normal';
  }
}
