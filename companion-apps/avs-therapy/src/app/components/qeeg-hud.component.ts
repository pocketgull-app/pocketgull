import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QeegEntrainmentService, QeegProtocol } from '../services/qeeg-entrainment.service';

@Component({
  selector: 'app-qeeg-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-5 space-y-4 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-cyan-500/15 pb-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <h3 class="text-xs font-black uppercase tracking-widest text-cyan-300">
            Closed-Loop qEEG & SMR Adaptive Entrainment
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="connectBci()"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                  [class.bg-cyan-500]="qeeg.isBciConnected()"
                  [class.text-cyan-950]="qeeg.isBciConnected()"
                  [class.bg-zinc-800]="!qeeg.isBciConnected()"
                  [class.text-zinc-300]="!qeeg.isBciConnected()">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {{ qeeg.isBciConnected() ? 'BCI Active (' + qeeg.overallSignalQuality() + '%)' : 'Pair BLE BCI' }}
          </button>
        </div>
      </div>

      <!-- Protocols Selector -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button (click)="selectProtocol('iapf-nudge')"
                class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-cyan-400]="qeeg.activeProtocol() === 'iapf-nudge'"
                [class.bg-cyan-500/15]="qeeg.activeProtocol() === 'iapf-nudge'"
                [class.border-zinc-800]="qeeg.activeProtocol() !== 'iapf-nudge'"
                [class.bg-zinc-900/40]="qeeg.activeProtocol() !== 'iapf-nudge'">
          <div class="text-[10px] font-extrabold text-cyan-300">iAPF Resonant Pull</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">+0.5 Hz Alpha Guide</div>
        </button>

        <button (click)="selectProtocol('faa-davidson')"
                class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-cyan-400]="qeeg.activeProtocol() === 'faa-davidson'"
                [class.bg-cyan-500/15]="qeeg.activeProtocol() === 'faa-davidson'"
                [class.border-zinc-800]="qeeg.activeProtocol() !== 'faa-davidson'"
                [class.bg-zinc-900/40]="qeeg.activeProtocol() !== 'faa-davidson'">
          <div class="text-[10px] font-extrabold text-cyan-300">Davidson Mood (FAA)</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">L 14Hz / R 10Hz Split</div>
        </button>

        <button (click)="selectProtocol('tbr-fatigue-damping')"
                class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-cyan-400]="qeeg.activeProtocol() === 'tbr-fatigue-damping'"
                [class.bg-cyan-500/15]="qeeg.activeProtocol() === 'tbr-fatigue-damping'"
                [class.border-zinc-800]="qeeg.activeProtocol() !== 'tbr-fatigue-damping'"
                [class.bg-zinc-900/40]="qeeg.activeProtocol() !== 'tbr-fatigue-damping'">
          <div class="text-[10px] font-extrabold text-cyan-300">TBR Fatigue Damping</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Auto SMR Elevation</div>
        </button>

        <button (click)="selectProtocol('standard')"
                class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                [class.border-cyan-400]="qeeg.activeProtocol() === 'standard'"
                [class.bg-cyan-500/15]="qeeg.activeProtocol() === 'standard'"
                [class.border-zinc-800]="qeeg.activeProtocol() !== 'standard'"
                [class.bg-zinc-900/40]="qeeg.activeProtocol() !== 'standard'">
          <div class="text-[10px] font-extrabold text-cyan-300">Static Manual</div>
          <div class="text-[9px] text-zinc-400 mt-0.5">Direct Frequency</div>
        </button>
      </div>

      <!-- Real-Time Biomarker Telemetry Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-cyan-500/10">
        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Measured iAPF</span>
          <div class="text-lg font-black text-cyan-300 font-mono">{{ qeeg.measuredIapfHz() }} Hz</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Adaptive Pull Target</span>
          <div class="text-lg font-black text-emerald-400 font-mono">{{ qeeg.targetFrequencyHz() }} Hz</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Frontal Asymmetry (FAA)</span>
          <div class="text-lg font-black font-mono"
               [class.text-amber-400]="qeeg.frontalAlphaAsymmetry() < 0"
               [class.text-green-400]="qeeg.frontalAlphaAsymmetry() >= 0">
            {{ qeeg.frontalAlphaAsymmetry() }}
          </div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Theta/Beta Ratio (TBR)</span>
          <div class="text-lg font-black font-mono"
               [class.text-red-400]="qeeg.thetaBetaRatio() > 3.0"
               [class.text-cyan-400]="qeeg.thetaBetaRatio() <= 3.0">
            {{ qeeg.thetaBetaRatio() }}
          </div>
        </div>
      </div>

      <!-- Lateralized Ear Entrainment Details if FAA Active -->
      @if (qeeg.activeProtocol() === 'faa-davidson') {
        <div class="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 font-bold">🎧 Dichotic Spatial Split:</span>
            <span class="text-zinc-300">Left Ear: <strong class="text-indigo-300">14.0 Hz (SMR)</strong> · Right Ear: <strong class="text-indigo-300">10.0 Hz (Alpha)</strong></span>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">Davidson Active</span>
        </div>
      }
    </div>
  `
})
export class QeegHudComponent {
  readonly qeeg = inject(QeegEntrainmentService);

  selectProtocol(protocol: QeegProtocol): void {
    this.qeeg.setProtocol(protocol);
  }

  connectBci(): void {
    this.qeeg.connectWebBluetoothBci();
  }
}
