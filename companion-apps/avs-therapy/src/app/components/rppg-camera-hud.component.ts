import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ContactlessRppgService } from '../services/contactless-rppg.service';

@Component({
  selector: 'app-rppg-camera-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 space-y-4 backdrop-blur-sm">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-emerald-500/15 pb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-emerald-300">
            Contactless Optical rPPG Vagal Biofeedback
          </h3>
        </div>

        <div class="flex items-center gap-2">
          @if (!rppg.isCameraActive()) {
            <button (click)="startCamera()"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Engage Optical Camera
            </button>
          } @else {
            <button (click)="rppg.calibrateBaroreflexResonance()"
                    class="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer">
              Auto-Tune Baroreflex ({{ rppg.baroreflexResonanceBpm() }} BPM)
            </button>
            <button (click)="stopCamera()"
                    class="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer">
              Disengage
            </button>
          }
        </div>
      </div>

      <!-- Real-Time Optical Pulse Waveform Canvas -->
      <div class="relative w-full h-24 rounded-lg bg-zinc-950/80 border border-emerald-500/20 overflow-hidden flex items-center justify-center">
        <canvas #pulseCanvas class="w-full h-full"></canvas>

        <div class="absolute top-2 left-3 flex items-center gap-2 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Sub-Capillary Optical Volumetric Pulse (PPG)
        </div>

        <div class="absolute bottom-2 right-3 text-[9px] font-mono text-zinc-500">
          Confidence: {{ rppg.trackingConfidencePct() }}% · Green-Band Micro-Absorbance
        </div>
      </div>

      <!-- Live Vagal HRV Telemetry Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-emerald-500/10">
        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Optical Heart Rate</span>
          <div class="text-lg font-black text-emerald-400 font-mono">{{ rppg.liveHeartRateBpm() }} BPM</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">HRV RMSSD (Vagal Tone)</span>
          <div class="text-lg font-black text-cyan-300 font-mono">{{ rppg.hrvRmssdMs() }} ms</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Resonant Breath Cadence</span>
          <div class="text-lg font-black text-amber-300 font-mono">{{ rppg.baroreflexResonanceBpm() }} BPM</div>
        </div>

        <div>
          <span class="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Autonomic Balance</span>
          <div class="text-lg font-black text-emerald-300 font-mono">{{ rppg.autonomicBalanceScore() }}%</div>
        </div>
      </div>
    </div>
  `
})
export class RppgCameraHudComponent implements AfterViewInit, OnDestroy {
  readonly rppg = inject(ContactlessRppgService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('pulseCanvas') pulseCanvasRef!: ElementRef<HTMLCanvasElement>;
  private renderRafId: number | null = null;

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.startWaveformRenderLoop();
    }
  }

  startCamera(): void {
    this.rppg.startCameraRppg();
  }

  stopCamera(): void {
    this.rppg.stopCameraRppg();
  }

  private startWaveformRenderLoop(): void {
    const canvas = this.pulseCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = canvas.parentElement.clientHeight || 96;
      }
    };
    resize();

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const buffer = this.rppg.opticalPulseBuffer();
      if (buffer.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = '#10b981';

        const stepX = width / (buffer.length - 1);
        for (let i = 0; i < buffer.length; i++) {
          const val = buffer[i];
          const x = i * stepX;
          const y = (height / 2) - (val * 24);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Ambient glow line
        ctx.lineWidth = 6.0;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.stroke();
      }

      this.renderRafId = requestAnimationFrame(draw);
    };

    this.renderRafId = requestAnimationFrame(draw);
  }

  ngOnDestroy(): void {
    if (this.renderRafId) {
      cancelAnimationFrame(this.renderRafId);
      this.renderRafId = null;
    }
  }
}
