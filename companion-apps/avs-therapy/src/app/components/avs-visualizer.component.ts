import { Component, Input, ViewChild, ElementRef, PLATFORM_ID, Inject, effect, untracked, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ColorTemperature } from './avs.constants';

@Component({
  selector: 'app-avs-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-44 rounded-xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-900 flex flex-col items-center justify-center overflow-hidden">
      <!-- Ambient Canvas Visualizer -->
      <canvas #avsCanvas class="absolute inset-0 w-full h-full pointer-events-none opacity-85" *ngIf="isActive"></canvas>

      <!-- Gradient background ripples -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_70%)] pointer-events-none"></div>

      <!-- Sync Pulsing Core -->
      <div [class.paused]="!isActive"
           [style.animationDuration.ms]="pulseIntervalMs"
           class="avs-pulsing-glow relative w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center shadow-lg transition-transform duration-500 z-10">

        <div class="absolute inset-0 rounded-full bg-orange-400/20 animate-ping" [style.animationDuration.ms]="pulseIntervalMs * 2" *ngIf="isActive"></div>

        <span class="text-white font-extrabold text-xs tracking-wider uppercase select-none">
          @if (isActive) {
            {{ currentWaveFrequencyName }}
          } @else {
            STANDBY
          }
        </span>
      </div>

      <!-- Active Metrics Status Bar -->
      <div class="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider z-10 pointer-events-none">
        <span>Dynamic: {{ currentBaseFrequency }} Hz Carrier</span>
        <span>Delta/Diff: {{ targetBrainwaveFrequencyHz }} Hz ({{ currentWaveFrequencyName }})</span>
      </div>
    </div>
  `,
  styles: [`
    .avs-pulsing-glow {
      animation: pulse-glow infinite ease-in-out;
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.25);
    }
    .avs-pulsing-glow.paused {
      animation-play-state: paused !important;
      transform: scale(1) !important;
      box-shadow: 0 0 10px rgba(249, 115, 22, 0.1) !important;
    }
    @keyframes pulse-glow {
      0%, 100% {
        transform: scale(0.96);
        filter: brightness(0.9);
        box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
      }
      50% {
        transform: scale(1.05);
        filter: brightness(1.1);
        box-shadow: 0 0 35px rgba(249, 115, 22, 0.45);
      }
    }
  `]
})
export class AvsVisualizerComponent implements OnDestroy {
  @Input() isActive = false;
  @Input() pulseIntervalMs = 10000;
  @Input() currentWaveFrequencyName = 'THETA';
  @Input() currentBaseFrequency = 200;
  @Input() targetBrainwaveFrequencyHz = 6.0;
  @Input() colorTemp: ColorTemperature = 'indigo';

  @ViewChild('avsCanvas') avsCanvasRef!: ElementRef<HTMLCanvasElement>;
  private canvasRafId: number | null = null;
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      effect(() => {
        // Re-trigger loop when these change
        const active = this.isActive;
        const freq = this.targetBrainwaveFrequencyHz;
        const temp = this.colorTemp;

        untracked(() => {
          if (active) {
            setTimeout(() => this.startCanvasLoop(), 100);
          } else {
            this.stopCanvasLoop();
          }
        });
      });
    }
  }

  private startCanvasLoop() {
    if (!this.isBrowser) return;
    this.stopCanvasLoop();

    const canvas = this.avsCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 400;
        canvas.height = canvas.parentElement.clientHeight || 176;
      }
    };
    resize();

    window.addEventListener('resize', resize);

    let angle = 0;
    const tick = () => {
      if (!this.isActive || !canvas || !ctx) {
        window.removeEventListener('resize', resize);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Get color temperature colors
      const preset = this.colorTemp;
      let colorGlow = 'rgba(67, 56, 202, 0.15)'; // Indigo
      let colorLine = 'rgba(14, 165, 233, 0.4)';

      if (preset === 'emerald') {
        colorGlow = 'rgba(5, 150, 105, 0.15)';
        colorLine = 'rgba(52, 211, 153, 0.4)';
      } else if (preset === 'violet') {
        colorGlow = 'rgba(124, 58, 237, 0.15)';
        colorLine = 'rgba(192, 132, 252, 0.4)';
      } else if (preset === 'rose-earth') {
        colorGlow = 'rgba(225, 29, 72, 0.15)';
        colorLine = 'rgba(251, 146, 60, 0.4)';
      }

      // Draw background glow using color temp
      const radGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 2);
      radGrad.addColorStop(0, colorGlow);
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw sine wave pattern corresponding to light modulation frequency
      const freqHz = this.targetBrainwaveFrequencyHz;
      const speed = (freqHz * 2 * Math.PI) / 1000;
      angle += speed;

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colorLine;

      for (let x = 0; x < width; x += 3) {
        const y = height / 2 +
                  Math.sin(x * 0.015 + angle) * 35 * Math.sin(angle * 0.1) +
                  Math.cos(x * 0.008 - angle * 0.3) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      this.canvasRafId = requestAnimationFrame(tick);
    };

    this.canvasRafId = requestAnimationFrame(tick);
  }

  private stopCanvasLoop() {
    if (this.canvasRafId !== null) {
      cancelAnimationFrame(this.canvasRafId);
      this.canvasRafId = null;
    }
  }

  ngOnDestroy() {
    this.stopCanvasLoop();
  }
}
