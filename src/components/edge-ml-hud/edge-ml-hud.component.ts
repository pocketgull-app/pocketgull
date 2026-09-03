import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnnxWebGpuEngineService, IOnnxRiskScoreResult } from '../../services/onnx-webgpu-engine.service';
import { PatientStateService } from '../../services/patient-state.service';

@Component({
  selector: 'app-edge-ml-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 text-white shadow-xl flex flex-col gap-4 font-sans">
      <!-- Header with Hardware Acceleration Badge -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>Edge AI &amp; ONNX WebGPU Engine</span>
              <span class="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                OOF ROC-AUC {{ metadata().oofRocAuc }}
              </span>
            </h3>
            <p class="text-xs text-zinc-400">Zero-egress local browser neural inference calibrated on Parquet datasets</p>
          </div>
        </div>

        <!-- Hardware Backend Badge -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-teal-400 flex items-center gap-1.5 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            {{ metadata().backend }}
          </span>
          <button
            type="button"
            (click)="runBatchBenchmark()"
            [disabled]="isBenchmarking()"
            class="px-2.5 py-1 rounded-md bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 text-xs font-mono font-semibold transition cursor-pointer disabled:opacity-50">
            {{ isBenchmarking() ? 'Benchmarking...' : '⚡ Run Batch Test' }}
          </button>
        </div>
      </div>

      <!-- Telemetry Grid -->
      @if (latestResult(); as result) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Risk Score & Acuity -->
          <div class="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
            <span class="text-xs text-zinc-400 font-medium">30-Day Decompensation Risk</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-zinc-100">{{ (result.riskScore * 100).toFixed(1) }}%</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-xs font-semibold"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': result.acuityLevel === 'ROUTINE',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30': result.acuityLevel === 'URGENT',
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30': result.acuityLevel === 'STAT_EMERGENCY'
                }">
                {{ result.acuityLevel }}
              </span>
            </div>
            <!-- Conformal Bounds -->
            <div class="mt-2 text-[11px] font-mono text-zinc-400 flex justify-between border-t border-zinc-800/60 pt-1.5">
              <span>95% Conformal Interval:</span>
              <span class="text-teal-300">[{{ (result.conformalLowerBound * 100).toFixed(1) }}%, {{ (result.conformalUpperBound * 100).toFixed(1) }}%]</span>
            </div>
          </div>

          <!-- Recovery Trajectory -->
          <div class="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
            <span class="text-xs text-zinc-400 font-medium">Predicted Recovery Trajectory</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-teal-400">{{ result.predictedRecoveryWeeks }}</span>
              <span class="text-xs text-zinc-400">weeks</span>
            </div>
            <div class="mt-2 text-[11px] font-mono text-zinc-400 flex justify-between border-t border-zinc-800/60 pt-1.5">
              <span>Model Confidence:</span>
              <span class="text-zinc-200">{{ (result.confidence * 100).toFixed(0) }}%</span>
            </div>
          </div>

          <!-- Inference Latency & SHA-256 Seal -->
          <div class="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
            <span class="text-xs text-zinc-400 font-medium">Local Edge Inference Speed</span>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-2xl font-bold font-mono text-emerald-400">{{ result.latencyMs }}</span>
              <span class="text-xs text-zinc-400">ms</span>
            </div>
            <div class="mt-2 text-[11px] font-mono text-zinc-500 flex justify-between border-t border-zinc-800/60 pt-1.5 truncate">
              <span>Digest:</span>
              <span class="font-mono text-zinc-400">{{ result.integrityDigest }}</span>
            </div>
          </div>
        </div>

        <!-- Top Biophysical Risk Drivers -->
        <div class="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3 flex flex-col gap-2">
          <span class="text-xs font-semibold text-zinc-300">Top Neural Feature Attributions:</span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            @for (driver of result.topDrivers; track driver.feature) {
              <div class="bg-zinc-900/80 border border-zinc-800 px-2.5 py-1.5 rounded-md flex items-center justify-between text-xs">
                <span class="text-zinc-400 truncate">{{ driver.feature }}</span>
                <span class="font-mono font-bold text-teal-400 shrink-0 ml-2">+{{ (driver.impact * 100).toFixed(0) }}%</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Batch Benchmark Results (if executed) -->
      @if (batchResult(); as bResult) {
        <div class="bg-teal-950/30 border border-teal-800/50 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-teal-200">
            <span>🚀 50-Patient Batch Complete:</span>
            <span class="font-bold text-teal-400">{{ bResult.totalLatencyMs }} ms total</span>
          </div>
          <div class="text-teal-300 font-bold">
            ⚡ {{ bResult.throughputSamplesPerSec.toLocaleString() }} samples/sec
          </div>
        </div>
      }
    </div>
  `
})
export class EdgeMlHudComponent implements OnInit {
  private readonly onnx = inject(OnnxWebGpuEngineService);
  private readonly state = inject(PatientStateService);

  readonly metadata = this.onnx.modelMetadata;
  readonly isBenchmarking = signal<boolean>(false);
  readonly batchResult = signal<{ totalLatencyMs: number; throughputSamplesPerSec: number } | null>(null);

  readonly latestResult = computed(() => {
    return this.onnx.lastInference();
  });

  async ngOnInit() {
    await this.onnx.initializeEngine();
    await this.evaluateCurrentPatient();
  }

  async evaluateCurrentPatient() {
    const rawVitals = this.state.vitals();
    const bpParts = (rawVitals?.bp || '120/80').split('/');
    const sbp = parseInt(bpParts[0] || '120', 10) || 120;
    const dbp = parseInt(bpParts[1] || '80', 10) || 80;

    const vitals = {
      heartRate: parseInt(String(rawVitals?.hr || '72'), 10) || 72,
      hrv: parseFloat(String(rawVitals?.hrv || '42')) || 42,
      spo2: parseFloat(String(rawVitals?.spO2 || '98')) || 98,
      systolic: sbp,
      diastolic: dbp,
      vitality: 76
    };

    const radiomics = {
      duralCompressionPercent: 45,
      ariaDangerScore: 32
    };

    const features = this.onnx.extractFeaturesFromPatientState(vitals, radiomics);
    await this.onnx.scorePatient('CURRENT_ACTIVE_PATIENT', features);
  }

  async runBatchBenchmark() {
    this.isBenchmarking.set(true);
    try {
      const mockBatch = Array.from({ length: 50 }, (_, i) => ({
        patientId: `BENCH_PAT_${String(i).padStart(3, '0')}`,
        features: Array.from({ length: 32 }, () => Math.random())
      }));

      const res = await this.onnx.scoreBatch(mockBatch);
      this.batchResult.set({
        totalLatencyMs: res.totalLatencyMs,
        throughputSamplesPerSec: res.throughputSamplesPerSec
      });
    } finally {
      this.isBenchmarking.set(false);
    }
  }
}
