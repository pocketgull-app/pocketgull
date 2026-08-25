import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BioSymphonyEngineService, DastgahScaleName, BinauralEntrainmentMode } from '../services/bio-symphony-engine.service';

@Component({
  selector: 'app-bio-symphony-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Top Header HUD -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono text-lg font-bold shadow-inner">
            🧠
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                The "Bio-Symphony" • Generative Vital Signs Suite
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider"
                [ngClass]="symphony.autonomicState().bg + ' ' + symphony.autonomicState().color">
                {{ symphony.autonomicState().label }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Live Biometric-to-Sound Synthesizer • 432Hz Pythagorean Tuning &amp; Persian Dastgāh Polyphony
            </p>
          </div>
        </div>

        <!-- Master Play / Pause Sound Button -->
        <button 
          (click)="symphony.togglePlay()"
          [class.bg-emerald-500]="!symphony.isPlaying()"
          [class.text-zinc-950]="!symphony.isPlaying()"
          [class.bg-rose-500]="symphony.isPlaying()"
          [class.text-white]="symphony.isPlaying()"
          class="px-4 py-2 font-mono font-bold text-xs rounded-xl transition shadow-lg flex items-center gap-2 min-h-[44px] touch-manipulation cursor-pointer">
          <span>{{ symphony.isPlaying() ? '⏸ Pause Bio-Symphony' : '▶ Start Bio-Symphony' }}</span>
          <span [class.animate-pulse]="symphony.isPlaying()">🎶</span>
        </button>
      </div>

      <!-- Main Visualizer Grid (Canvas Visualizer Left 8 Cols, Controls Right 4 Cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left: Real-Time Lissajous & Biometric Harmonic Canvas -->
        <div class="lg:col-span-8 relative min-h-[360px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center">
          <canvas #visualizerCanvas class="w-full h-full min-h-[360px]"></canvas>

          <!-- Floating Biometric Telemetry Overlay -->
          <div class="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono bg-zinc-950/80 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-zinc-400">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500" [class.animate-ping]="symphony.isPlaying()"></span>
              <span class="text-zinc-200">Heart Rhythm: {{ symphony.heartRateBpm() }} BPM</span>
            </div>
            <span>Breathing Pace: <span class="text-teal-300">{{ symphony.respiratoryRateBpm() }} Br/min</span></span>
            <span>Harmonic Mode: <span class="text-purple-300">{{ symphony.selectedDastgah() }} (432Hz)</span></span>
            <span>Entrainment: <span class="text-amber-300">{{ symphony.binauralMode() }}</span></span>
          </div>

          <!-- Resonance Breathing Pacer Halo in Center -->
          @if (symphony.isPlaying()) {
            <div class="absolute pointer-events-none flex flex-col items-center justify-center">
              <div class="w-24 h-24 rounded-full border-2 border-teal-400/40 bg-teal-500/10 animate-ping opacity-30"></div>
              <span class="text-[10px] font-mono text-teal-300 uppercase tracking-widest mt-2 bg-zinc-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                Resonance 0.1Hz Vagal Breath
              </span>
            </div>
          }
        </div>

        <!-- Right Side: Biometric Sliders & Modal Synthesizer HUD -->
        <div class="lg:col-span-4 flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono">
          
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span class="font-semibold text-zinc-200">Biometric Drivers</span>
            <span class="text-[10px] text-teal-400">Real-Time Modulation</span>
          </div>

          <!-- Heart Rate Slider -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-zinc-300">
              <span>Heart Rate (Pulse Tempo):</span>
              <span class="text-rose-400 font-bold tabular-nums">{{ symphony.heartRateBpm() }} BPM</span>
            </div>
            <input 
              type="range" 
              min="45" 
              max="150" 
              [ngModel]="symphony.heartRateBpm()" 
              (ngModelChange)="symphony.setHeartRate($event)"
              class="w-full accent-rose-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <!-- Stress Score Slider -->
          <div class="space-y-1.5 pt-1">
            <div class="flex justify-between text-zinc-300">
              <span>Stress Index (Sympathetic Tone):</span>
              <span class="text-amber-400 font-bold tabular-nums">{{ symphony.stressScore() }} / 100</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              [ngModel]="symphony.stressScore()" 
              (ngModelChange)="symphony.setStressScore($event)"
              class="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <!-- Persian Dastgah Scale Selection -->
          <div class="space-y-1.5 pt-2 border-t border-zinc-800">
            <span class="text-zinc-400 block">Dastgāh Harmonic Mode:</span>
            <div class="grid grid-cols-2 gap-1.5">
              @for (mode of dastgahList; track mode) {
                <button 
                  (click)="symphony.setDastgah(mode)"
                  [class.bg-purple-600]="symphony.selectedDastgah() === mode"
                  [class.text-white]="symphony.selectedDastgah() === mode"
                  [class.bg-zinc-950]="symphony.selectedDastgah() !== mode"
                  [class.text-zinc-400]="symphony.selectedDastgah() !== mode"
                  class="p-2 rounded-lg border border-zinc-800 font-bold text-[11px] transition text-left min-h-[38px] touch-manipulation">
                  {{ mode }}
                </button>
              }
            </div>
          </div>

          <!-- Binaural Wave Frequency -->
          <div class="space-y-1.5 pt-2 border-t border-zinc-800">
            <span class="text-zinc-400 block">Binaural Entrainment:</span>
            <select 
              [ngModel]="symphony.binauralMode()" 
              (ngModelChange)="symphony.setBinauralMode($event)"
              class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-zinc-200 text-xs focus:outline-none focus:border-teal-500 min-h-[38px]">
              <option value="Theta (6Hz Calm)">Theta (6Hz Deep Meditation &amp; Calm)</option>
              <option value="Alpha (10Hz Focus)">Alpha (10Hz Flow State &amp; Focus)</option>
              <option value="Gamma (40Hz Insight)">Gamma (40Hz Peak Cognitive Clarity)</option>
              <option value="Off">Binaural Channel Disabled</option>
            </select>
          </div>

          <!-- Scale Description Footer -->
          <div class="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 mt-1 text-[11px] text-zinc-400 leading-snug">
            <span class="text-purple-300 font-bold block">{{ symphony.dastgahScales[symphony.selectedDastgah()].persianName }}</span>
            {{ symphony.dastgahScales[symphony.selectedDastgah()].description }}
          </div>

        </div>

      </div>

    </div>
  `
})
export class BioSymphonyVisualizerComponent implements AfterViewInit, OnDestroy {
  readonly visualizerCanvas = viewChild<ElementRef<HTMLCanvasElement>>('visualizerCanvas');
  readonly symphony = inject(BioSymphonyEngineService);

  readonly dastgahList: DastgahScaleName[] = ['Shur', 'Homayoun', 'Segah', 'Chahargah'];

  private animFrameId: number | null = null;
  private phase = 0;

  ngAfterViewInit(): void {
    this.startCanvasRenderLoop();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private startCanvasRenderLoop(): void {
    const canvas = this.visualizerCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      this.animFrameId = requestAnimationFrame(render);

      // Handle high-DPI canvas sizing
      const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 360);

      ctx.fillStyle = '#05080c';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      this.phase += this.symphony.isPlaying() ? 0.025 : 0.005;

      const bpm = this.symphony.heartRateBpm();
      const pulseScale = 1.0 + Math.sin(this.phase * (bpm / 30)) * 0.08;

      // Draw Multi-Layered Lissajous Harmonic Knot
      const numPoints = 360;
      const radiusX = (width / 3.2) * pulseScale;
      const radiusY = (height / 3.0) * pulseScale;

      const a = this.symphony.selectedDastgah() === 'Shur' ? 3 : (this.symphony.selectedDastgah() === 'Homayoun' ? 4 : 5);
      const b = 2;
      const delta = this.phase;

      // Outer Harmonic Glow
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.symphony.stressScore() > 60 ? '#f59e0b' : (this.symphony.stressScore() < 30 ? '#10b981' : '#14b8a6');
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.strokeStyle;

      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const x = centerX + Math.sin(a * theta + delta) * radiusX;
        const y = centerY + Math.sin(b * theta) * radiusY;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Inner Secondary Harmonizer Ring
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#a855f7';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#a855f7';

      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const x = centerX + Math.sin((a + 1) * theta - delta * 0.7) * (radiusX * 0.65);
        const y = centerY + Math.sin(b * theta + delta) * (radiusY * 0.65);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
    };

    render();
  }
}
