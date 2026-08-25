import { Component, ChangeDetectionStrategy, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleWearablesService } from '../services/ble-wearables.service';

@Component({
  selector: 'app-ble-wearables-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-cyan-500/30 shadow-2xl font-mono text-zinc-100 relative overflow-hidden my-6">
      <!-- Glow ambient backdrop -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header & Device Status Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full" [ngClass]="{
              'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse': bleService.isConnected(),
              'bg-zinc-600': !bleService.isConnected()
            }"></span>
            <h3 class="text-base font-black text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <span>🫀</span> BLE Wearable Waveform Sensor Fusion HUD
            </h3>
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
              Dual PPG + 1-Lead ECG Oscilloscope
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Real-time Web Bluetooth GATT telemetry stream processing (50 Hz PPG optical pulse & 125 Hz ECG P-QRS-T complex).
          </p>
        </div>

        <!-- Connection Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          @if (!bleService.isConnected()) {
            <button (click)="connectBleDevice()" type="button"
                    class="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
              <span>📶</span> Pair BLE Device
            </button>
            <button (click)="startSyntheticStream()" type="button"
                    class="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
              <span>⚡</span> Synthetic Stream
            </button>
          } @else {
            <button (click)="disconnectBleDevice()" type="button"
                    class="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
              <span>🛑</span> Disconnect
            </button>
          }
        </div>
      </div>

      <!-- Real-time Live Telemetry Data Chips -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 relative z-10 font-mono">
        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] text-zinc-400 uppercase tracking-wider">Heart Rate</span>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-2xl font-black text-cyan-400">{{ bleService.heartRate() || '--' }}</span>
            <span class="text-[10px] text-zinc-500">bpm</span>
          </div>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] text-zinc-400 uppercase tracking-wider">SpO2 Saturation</span>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-2xl font-black text-emerald-400">{{ bleService.spO2() ? bleService.spO2() + '%' : '--' }}</span>
            <span class="text-[10px] text-zinc-500">O2</span>
          </div>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] text-zinc-400 uppercase tracking-wider">HRV RMSSD</span>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-2xl font-black text-amber-400">{{ bleService.hrvRmssd() }}</span>
            <span class="text-[10px] text-zinc-500">ms</span>
          </div>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <span class="text-[10px] text-zinc-400 uppercase tracking-wider">Temperature</span>
          <div class="flex items-baseline gap-1.5 mt-1">
            <span class="text-2xl font-black text-rose-400">{{ bleService.temperature() ? bleService.temperature() : '98.6°F' }}</span>
          </div>
        </div>

        <div class="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span class="text-[10px] text-zinc-400 uppercase tracking-wider">Autonomic Tone</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xs font-black uppercase text-emerald-300">
              {{ bleService.hrvRmssd() >= 40 ? 'Parasympathetic' : 'Sympathetic' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 60 FPS Dual-Trace Canvas Oscilloscope -->
      <div class="relative w-full h-64 bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-inner mb-4">
        <!-- Oscilloscope Grid Lines -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none"></div>

        <!-- Trace Labels Overlay -->
        <div class="absolute top-3 left-4 flex items-center gap-4 text-[10px] font-mono font-bold z-10">
          <span class="text-emerald-400 flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Trace A: PPG Optical Pulse (50Hz)
          </span>
          <span class="text-cyan-400 flex items-center gap-1.5 bg-zinc-900/80 px-2 py-1 rounded border border-cyan-500/30">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span> Trace B: Lead-I ECG P-QRS-T (125Hz)
          </span>
        </div>

        <canvas #oscilloscopeCanvas class="w-full h-full block relative z-0"></canvas>
      </div>

      <!-- Device Status Footer Banner -->
      <div class="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80 pt-3">
        <span class="truncate">
          <strong>Device:</strong> {{ bleService.deviceName() || 'No active BLE device' }}
        </span>
        <span class="text-[11px] text-zinc-500 truncate">
          {{ bleService.statusMessage() }}
        </span>
      </div>
    </div>
  `
})
export class BleWearablesHudComponent implements AfterViewInit, OnDestroy {
  bleService = inject(BleWearablesService);

  @ViewChild('oscilloscopeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animFrameId: number | null = null;

  constructor() {
    effect(() => {
      // Re-trigger render loop when waveforms update
      const ppg = this.bleService.ppgWaveform();
      const ecg = this.bleService.ecgWaveform();
    });
  }

  ngAfterViewInit(): void {
    this.startOscilloscopeLoop();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.bleService.isSimulationActive()) {
      this.bleService.stopSyntheticStream();
    }
  }

  connectBleDevice() {
    this.bleService.connectMultiVitalsSensor();
  }

  startSyntheticStream() {
    this.bleService.startSyntheticStream();
  }

  disconnectBleDevice() {
    this.bleService.disconnect();
    if (this.bleService.isSimulationActive()) {
      this.bleService.stopSyntheticStream();
    }
  }

  private startOscilloscopeLoop(): void {
    const render = () => {
      this.drawCanvasOscilloscope();
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private drawCanvasOscilloscope(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    ctx.clearRect(0, 0, width, height);

    const ppgData = this.bleService.ppgWaveform();
    const ecgData = this.bleService.ecgWaveform();

    // 1. Draw PPG Trace (Top Half - Green)
    if (ppgData.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#10b981'; // Emerald Green
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(16,185,129,0.5)';
      ctx.shadowBlur = 8;

      const ppgYCenter = height * 0.3;
      const stepX = width / Math.max(ppgData.length, 100);

      for (let i = 0; i < ppgData.length; i++) {
        const x = i * stepX;
        const y = ppgYCenter - ppgData[i].amplitude * 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 2. Draw ECG Trace (Bottom Half - Cyan)
    if (ecgData.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(6,182,212,0.5)';
      ctx.shadowBlur = 8;

      const ecgYCenter = height * 0.75;
      const stepX = width / Math.max(ecgData.length, 100);

      for (let i = 0; i < ecgData.length; i++) {
        const x = i * stepX;
        const y = ecgYCenter - (ecgData[i].uV / 1200) * 45;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}
