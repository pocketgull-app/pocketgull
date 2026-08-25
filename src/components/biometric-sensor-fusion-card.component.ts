import { Component, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiometricSensorFusionService } from '../services/biometric-sensor-fusion.service';

@Component({
  selector: 'app-biometric-sensor-fusion-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full p-5 rounded-3xl bg-zinc-950/90 border border-sky-500/30 text-zinc-100 shadow-xl font-mono backdrop-blur-xl">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🛰️</span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-sky-400">
              Continuous Biometric Sensor Fusion Telemetry
            </h3>
            <p class="text-[11px] text-zinc-400">
              Sub-Second PPG HRV, CGM Glucose, & Respiratory Waveform Fusion
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          @if (fusion.isStreaming()) {
            <span class="text-xs px-2.5 py-1 rounded-full font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Live Telemetry Streaming
            </span>
          }

          <button (click)="toggleStream()"
            class="px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-md cursor-pointer"
            [ngClass]="fusion.isStreaming() ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'">
            {{ fusion.isStreaming() ? '⏸ Pause Stream' : '▶ Start Live Stream' }}
          </button>
        </div>
      </div>

      @if (fusion.currentFrame(); as frame) {
        <!-- Telemetry Gauges Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
          <!-- PPG HRV -->
          <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span class="text-[10px] text-zinc-500 font-bold uppercase block">PPG HRV (RMSSD)</span>
            <span class="text-lg font-extrabold text-sky-300 font-mono">{{ frame.ppgHrvMs }} ms</span>
            <span class="text-[10px] text-zinc-400 block font-bold" [ngClass]="frame.ppgHrvMs < 35 ? 'text-amber-400' : 'text-emerald-400'">
              {{ frame.ppgHrvMs < 35 ? 'Low Vagal Tone' : 'Optimal Autonomic Balance' }}
            </span>
          </div>

          <!-- CGM Glucose -->
          <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span class="text-[10px] text-zinc-500 font-bold uppercase block">CGM Glucose</span>
            <span class="text-lg font-extrabold text-purple-300 font-mono">{{ frame.cgmGlucoseMgDl }} mg/dL</span>
            <span class="text-[10px] text-zinc-400 block font-bold" [ngClass]="frame.cgmGlucoseMgDl > 140 ? 'text-amber-400' : 'text-emerald-400'">
              {{ frame.cgmGlucoseMgDl > 140 ? 'Postprandial Peak' : 'In-Range (70-140)' }}
            </span>
          </div>

          <!-- Respiration Rate -->
          <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span class="text-[10px] text-zinc-500 font-bold uppercase block">Respiration Rate</span>
            <span class="text-lg font-extrabold text-emerald-300 font-mono">{{ frame.respiratoryRateBpm }} bpm</span>
            <span class="text-[10px] text-emerald-400 block font-bold">Eupnea Pattern</span>
          </div>

          <!-- Signal Quality -->
          <div class="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <span class="text-[10px] text-zinc-500 font-bold uppercase block">Fusion Quality</span>
            <span class="text-lg font-extrabold text-amber-300 font-mono">{{ frame.fusionQualityIndex }}%</span>
            <span class="text-[10px] text-amber-400 block font-bold">BLE Multi-Node Link</span>
          </div>
        </div>

        <!-- Fusion Alerts -->
        @if (fusion.activeAlerts().length > 0) {
          <div class="space-y-2.5 text-xs">
            @for (alert of fusion.activeAlerts(); track alert.id) {
              <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm">⚠️</span>
                  <div>
                    <strong class="font-extrabold text-amber-300 uppercase text-[11px]">{{ alert.parameter }} Alert: {{ alert.value }}</strong>
                    <span class="text-[11px] text-zinc-300 block font-sans font-medium">{{ alert.recommendation }}</span>
                  </div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {{ alert.threshold }}
                </span>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class BiometricSensorFusionCardComponent implements OnDestroy {
  readonly fusion = inject(BiometricSensorFusionService);

  toggleStream(): void {
    if (this.fusion.isStreaming()) {
      this.fusion.stopSensorStream();
    } else {
      this.fusion.startSensorStream();
    }
  }

  ngOnDestroy(): void {
    this.fusion.stopSensorStream();
  }
}
