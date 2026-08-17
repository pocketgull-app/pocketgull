import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BigQueryAnalyticsService, ITrajectoryResponse } from '../services/bigquery-analytics.service';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';

@Component({
  selector: 'app-bigquery-trajectory-forecaster',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-slate-100 space-y-6 shadow-2xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
            📈
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black tracking-tight text-white uppercase">
                BigQuery ML Clinical Trajectory & Cohort Engine
              </h2>
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold">
                BQML ARIMA_PLUS
              </span>
            </div>
            <p class="text-xs text-slate-400 font-medium">
              Time-series forecasting, 95% confidence intervals, and QALY longevity simulations powered by Google Cloud BigQuery.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
          Dataset: <span class="text-indigo-400 font-bold">pocketgull_analytics</span>
        </div>
      </div>

      <!-- Metric & Scenario Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Metric Selector -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clinical Metric</label>
          <select
            [(ngModel)]="selectedMetric"
            (change)="runForecast()"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
          >
            <option value="glucose_cgm">Continuous Glucose (CGM mg/dL)</option>
            <option value="blood_pressure_sbp">Systolic BP (SBP mmHg)</option>
            <option value="heart_rate_variability">HRV RMSSD (ms)</option>
            <option value="sibi_inflammation">Inflammatory SIBI Score</option>
          </select>
        </div>

        <!-- Intervention Scenario -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Intervention Scenario</label>
          <select
            [(ngModel)]="selectedScenario"
            (change)="runForecast()"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
          >
            <option value="baseline">Natural Baseline Drift</option>
            <option value="optimized_nutrition">🥗 Optimized Nutrition (+1.8 QALY)</option>
            <option value="targeted_pharmacotherapy">💊 Targeted Pharmacotherapy (+2.4 QALY)</option>
            <option value="sedentary_drift">📉 Sedentary Drift (-1.4 QALY)</option>
          </select>
        </div>

        <!-- Time Horizon -->
        <div class="space-y-1">
          <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Horizon</label>
          <select
            [(ngModel)]="selectedHorizon"
            (change)="runForecast()"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500 min-h-[48px]"
          >
            <option [value]="30">30 Days Forward</option>
            <option [value]="60">60 Days Forward</option>
            <option [value]="90">90 Days Forward (Quarterly)</option>
            <option [value]="180">180 Days Forward (Semi-Annual)</option>
          </select>
        </div>

        <!-- Re-compute Action -->
        <div class="flex items-end">
          <button
            type="button"
            (click)="runForecast()"
            [disabled]="isLoading()"
            class="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 min-h-[48px]"
          >
            @if (isLoading()) {
              <span>⚙️ Forecasting...</span>
            } @else {
              <span>⚡ Execute BQML Model</span>
            }
          </button>
        </div>
      </div>

      <!-- Trajectory Metric Summary Tiles -->
      @if (trajectoryData(); as data) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <span class="text-slate-500 font-bold uppercase block text-[10px]">Baseline</span>
            <span class="text-lg font-black text-white">{{ data.baselineValue }}</span>
          </div>

          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <span class="text-slate-500 font-bold uppercase block text-[10px]">Projected Horizon</span>
            <span class="text-lg font-black text-indigo-400">
              {{ data.points[data.points.length - 1]?.predictedValue }}
            </span>
          </div>

          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <span class="text-slate-500 font-bold uppercase block text-[10px]">Expected Delta (Δ)</span>
            <span class="text-lg font-black" [class.text-emerald-400]="data.projectedDelta <= 0" [class.text-amber-400]="data.projectedDelta > 0">
              {{ data.projectedDelta > 0 ? '+' : '' }}{{ data.projectedDelta }}
            </span>
          </div>

          <div class="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <span class="text-slate-500 font-bold uppercase block text-[10px]">QALY Impact</span>
            <span class="text-lg font-black text-purple-400">
              {{ data.qalyLongevityImpactYears > 0 ? '+' : '' }}{{ data.qalyLongevityImpactYears }} yrs
            </span>
          </div>
        </div>

        <!-- SVG Time-Series Chart with 95% Confidence Interval Ribbon -->
        <div class="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-300">Biophysical Trajectory Curve (95% CI Ribbon)</span>
            <span class="text-slate-500 font-mono text-[10px]">Source: {{ data.source }}</span>
          </div>

          <div class="w-full h-48 relative flex items-center justify-center">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ciRibbonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05" />
                </linearGradient>
              </defs>

              <!-- 95% Confidence Interval Ribbon Polygon -->
              <polygon [attr.points]="ciPolygonPoints()" fill="url(#ciRibbonGradient)" />

              <!-- Baseline Reference Line -->
              <line x1="0" [attr.y1]="chartBaselineY()" x2="600" [attr.y2]="chartBaselineY()" stroke="#475569" stroke-dasharray="4 4" stroke-width="1" />

              <!-- Main Predicted Curve -->
              <polyline [attr.points]="chartPolylinePoints()" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" />

              <!-- Anomaly Detection Dots -->
              @for (pt of anomalyPoints(); track pt.day) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#f43f5e" stroke="#fff" stroke-width="1.5">
                  <title>Anomaly: Day {{ pt.day }} - Value: {{ pt.value }}</title>
                </circle>
              }
            </svg>
          </div>

          <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
            <span>Day 0 (Baseline)</span>
            <span>Day {{ selectedHorizon() / 2 }}</span>
            <span>Day {{ selectedHorizon() }} Forecast</span>
          </div>
        </div>

        <!-- BigQuery ML SQL DDL Tab -->
        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300">BigQuery ML Studio DDL Template</span>
            <button
              type="button"
              (click)="copySql(data.bqmlSqlDdl)"
              class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 min-h-[48px]"
            >
              <span>{{ copyStatus() }}</span>
            </button>
          </div>
          <pre class="text-[11px] font-mono text-indigo-300 bg-slate-900/90 p-3 rounded-xl overflow-x-auto max-h-36 border border-slate-800/80">{{ data.bqmlSqlDdl }}</pre>
        </div>
      }
    </div>
  `
})
export class BigQueryTrajectoryForecasterComponent implements OnInit {
  private analyticsService = inject(BigQueryAnalyticsService);
  private patientState = inject(PatientStateService);
  private patientManagement = inject(PatientManagementService);

  selectedMetric = signal<'glucose_cgm' | 'blood_pressure_sbp' | 'heart_rate_variability' | 'sibi_inflammation'>('glucose_cgm');
  selectedScenario = signal<'baseline' | 'optimized_nutrition' | 'sedentary_drift' | 'targeted_pharmacotherapy'>('optimized_nutrition');
  selectedHorizon = signal<number>(90);
  isLoading = signal<boolean>(false);
  trajectoryData = signal<ITrajectoryResponse | null>(null);
  copyStatus = signal<string>('📋 Copy SQL');

  ngOnInit(): void {
    this.runForecast();
  }

  runForecast(): void {
    this.isLoading.set(true);
    const vitals = this.patientState.vitals();
    let baseVal = 115;
    if (this.selectedMetric() === 'glucose_cgm') {
      baseVal = parseFloat(vitals?.cgmGlucoseMgDl || '115');
    } else if (this.selectedMetric() === 'blood_pressure_sbp') {
      baseVal = parseFloat(vitals?.bp?.split('/')[0] || '128');
    } else if (this.selectedMetric() === 'heart_rate_variability') {
      baseVal = 48;
    } else {
      baseVal = 2.4;
    }

    this.analyticsService.getTrajectory$({
      patientId: this.patientManagement.selectedPatientId() || 'p001',
      metric: this.selectedMetric(),
      baselineValue: baseVal,
      timeHorizonDays: this.selectedHorizon(),
      interventionScenario: this.selectedScenario()
    }).subscribe({
      next: (res) => {
        this.trajectoryData.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        const local = this.analyticsService.computeLocalTrajectory({
          patientId: 'p001',
          metric: this.selectedMetric(),
          baselineValue: baseVal,
          timeHorizonDays: this.selectedHorizon(),
          interventionScenario: this.selectedScenario()
        });
        this.trajectoryData.set(local);
        this.isLoading.set(false);
      }
    });
  }

  chartBaselineY = computed(() => 90);

  chartPolylinePoints = computed(() => {
    const data = this.trajectoryData();
    if (!data || !data.points.length) return '';
    const n = data.points.length;
    const minVal = Math.min(...data.points.map(p => p.lowerConfidenceBound)) - 5;
    const maxVal = Math.max(...data.points.map(p => p.upperConfidenceBound)) + 5;
    const range = maxVal - minVal || 1;

    return data.points.map((p, i) => {
      const x = (i / (n - 1)) * 600;
      const y = 170 - ((p.predictedValue - minVal) / range) * 150;
      return `${Math.round(x)},${Math.round(y)}`;
    }).join(' ');
  });

  ciPolygonPoints = computed(() => {
    const data = this.trajectoryData();
    if (!data || !data.points.length) return '';
    const n = data.points.length;
    const minVal = Math.min(...data.points.map(p => p.lowerConfidenceBound)) - 5;
    const maxVal = Math.max(...data.points.map(p => p.upperConfidenceBound)) + 5;
    const range = maxVal - minVal || 1;

    const topPoints = data.points.map((p, i) => {
      const x = (i / (n - 1)) * 600;
      const y = 170 - ((p.upperConfidenceBound - minVal) / range) * 150;
      return `${Math.round(x)},${Math.round(y)}`;
    });

    const bottomPoints = data.points.slice().reverse().map((p, i) => {
      const x = ((n - 1 - i) / (n - 1)) * 600;
      const y = 170 - ((p.lowerConfidenceBound - minVal) / range) * 150;
      return `${Math.round(x)},${Math.round(y)}`;
    });

    return [...topPoints, ...bottomPoints].join(' ');
  });

  anomalyPoints = computed(() => {
    const data = this.trajectoryData();
    if (!data || !data.points.length) return [];
    const n = data.points.length;
    const minVal = Math.min(...data.points.map(p => p.lowerConfidenceBound)) - 5;
    const maxVal = Math.max(...data.points.map(p => p.upperConfidenceBound)) + 5;
    const range = maxVal - minVal || 1;

    return data.points
      .filter(p => p.anomalyDetected)
      .map(p => ({
        day: p.day,
        value: p.predictedValue,
        x: Math.round(((p.day - 1) / (n - 1)) * 600),
        y: Math.round(170 - ((p.predictedValue - minVal) / range) * 150)
      }));
  });

  copySql(sql: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sql);
      this.copyStatus.set('✓ Copied!');
      setTimeout(() => this.copyStatus.set('📋 Copy SQL'), 3000);
    }
  }
}
