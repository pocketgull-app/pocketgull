import { Component, ChangeDetectionStrategy, signal, effect, OnDestroy, ElementRef, viewChild, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zamecznik-canvas',
  standalone: true,
  host: {
    'ngSkipHydration': 'true'
  },
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md animate-in fade-in duration-300 select-none">
        <!-- Zamecznik Canvas drawing area -->
        <canvas #canvasRef class="absolute inset-0 w-full h-full cursor-crosshair z-0"></canvas>

        <!-- Box Breathing HUD -->
        <div class="relative z-10 flex flex-col items-center justify-center p-6 max-w-md text-center pointer-events-auto">
          <div class="mb-4">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-3 py-1 rounded-full">
              Zamecznik Calibrator
            </span>
          </div>

          <h2 class="text-2xl font-black text-white tracking-wide uppercase font-sans">Somatic Grounding</h2>
          <p class="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
            Slowly trace the oscillating curves with your finger or mouse. Synchronize your breathing.
          </p>

          <!-- Antigravity Physics Controls -->
          <div class="flex items-center gap-2 mt-3 mb-2">
            <button id="antigravity-toggle-btn"
                    (click)="toggleAntiGravity()"
                    [class.bg-indigo-600]="antiGravityMode()"
                    [class.border-indigo-400]="antiGravityMode()"
                    [class.bg-zinc-900]="!antiGravityMode()"
                    class="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer">
              <span>{{ antiGravityMode() ? '✨ Anti-Gravity: ON' : '🌌 Anti-Gravity: OFF' }}</span>
            </button>

            <div class="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-1 gap-1">
              <button id="scale-05-btn" (click)="setGravityScale(0.5)" [class.text-emerald-400]="gravityScale() === 0.5" class="px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white transition cursor-pointer">0.5x</button>
              <button id="scale-10-btn" (click)="setGravityScale(1.0)" [class.text-emerald-400]="gravityScale() === 1.0" class="px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white transition cursor-pointer">1.0x</button>
              <button id="scale-20-btn" (click)="setGravityScale(2.0)" [class.text-emerald-400]="gravityScale() === 2.0" class="px-2 py-0.5 text-[10px] font-mono text-zinc-400 hover:text-white transition cursor-pointer">2.0x</button>
            </div>
          </div>

          <!-- Pulse Circle and Countdown -->
          <div class="mt-4 relative w-48 h-48 flex items-center justify-center">
            <!-- Pulsing outer ring -->
            <div class="absolute inset-0 rounded-full border border-emerald-500/10 transition-all duration-1000 scale-[1.1] animate-ping"></div>
            
            <!-- Breathing Phase Circle -->
            <div [class]="circleClasses()"
                 class="rounded-full flex flex-col items-center justify-center text-white border transition-all duration-[4000ms] shadow-2xl">
              <span class="text-2xl font-black uppercase tracking-widest animate-pulse font-sans">{{ currentPhase() }}</span>
              <span class="text-3xl font-mono font-black mt-2">{{ secondsLeft() }}s</span>
            </div>
          </div>

          <!-- Phase Guide Dots -->
          <div class="mt-6 flex gap-3">
            <span [class.bg-emerald-500]="currentPhase() === 'Inhale'" [class.bg-zinc-800]="currentPhase() !== 'Inhale'" class="w-2.5 h-2.5 rounded-full transition-colors duration-300"></span>
            <span [class.bg-amber-500]="currentPhase() === 'Hold (In)'" [class.bg-zinc-800]="currentPhase() !== 'Hold (In)'" class="w-2.5 h-2.5 rounded-full transition-colors duration-300"></span>
            <span [class.bg-teal-500]="currentPhase() === 'Exhale'" [class.bg-zinc-800]="currentPhase() !== 'Exhale'" class="w-2.5 h-2.5 rounded-full transition-colors duration-300"></span>
            <span [class.bg-blue-500]="currentPhase() === 'Hold (Out)'" [class.bg-zinc-800]="currentPhase() !== 'Hold (Out)'" class="w-2.5 h-2.5 rounded-full transition-colors duration-300"></span>
          </div>
        </div>

        <!-- Exit Control -->
        <button id="zamecznik-close-btn"
          (click)="close()"
          class="absolute top-6 right-6 z-20 p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-full transition pointer-events-auto active:scale-95 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    canvas {
      touch-action: none;
    }
  `]
})
export class ZamecznikCanvasComponent implements OnDestroy {
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  readonly isActive = signal(false);

  // --- Antigravity Physics State ---
  readonly antiGravityMode = signal<boolean>(false);
  readonly gravityScale = signal<number>(1.0);

  toggleAntiGravity(): void {
    this.antiGravityMode.update(v => !v);
    this.cdr.markForCheck();
  }

  setGravityScale(scale: number): void {
    this.gravityScale.set(scale);
    this.cdr.markForCheck();
  }

  // --- Box Breathing State ---
  readonly currentPhase = signal<'Inhale' | 'Hold (In)' | 'Exhale' | 'Hold (Out)'>('Inhale');
  readonly secondsLeft = signal<number>(4);

  readonly circleClasses = signal<string>('w-36 h-36 bg-emerald-950/20 border-emerald-500/40 text-emerald-350 scale-100');

  private animationFrameId: number | null = null;
  private breathingIntervalId: any = null;
  private canvasElement = viewChild<ElementRef<HTMLCanvasElement>>('canvasRef');

  // --- Interaction particles ---
  private mousePoints: { x: number; y: number; vy: number; age: number }[] = [];
  private currentMouse = { x: -1, y: -1, active: false };

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).__openZamecznikCanvas = () => {
        this.ngZone.run(() => this.open());
      };
      window.addEventListener('somatic-grounding-activate', () => {
        this.ngZone.run(() => this.open());
      });
    }

    // Effect to handle canvas canvas setup and drawing loop when active
    effect(() => {
      const active = this.isActive();
      const canvasEl = this.canvasElement();
      if (active && canvasEl) {
        setTimeout(() => this.initDrawingLoop(), 50);
      } else {
        this.stopDrawingLoop();
      }
    });
  }

  open() {
    this.isActive.set(true);
    this.cdr.markForCheck();
    this.startBreathingTimer();
  }

  close() {
    this.isActive.set(false);
    this.cdr.markForCheck();
    this.stopBreathingTimer();
  }

  ngOnDestroy() {
    this.stopDrawingLoop();
    this.stopBreathingTimer();
  }

  private startBreathingTimer() {
    this.stopBreathingTimer();
    this.currentPhase.set('Inhale');
    this.secondsLeft.set(4);
    this.updateCircleClasses();

    this.breathingIntervalId = setInterval(() => {
      const left = this.secondsLeft() - 1;
      if (left > 0) {
        this.secondsLeft.set(left);
      } else {
        // Switch phase
        const cur = this.currentPhase();
        if (cur === 'Inhale') {
          this.currentPhase.set('Hold (In)');
          this.secondsLeft.set(4);
        } else if (cur === 'Hold (In)') {
          this.currentPhase.set('Exhale');
          this.secondsLeft.set(4);
        } else if (cur === 'Exhale') {
          this.currentPhase.set('Hold (Out)');
          this.secondsLeft.set(4);
        } else {
          this.currentPhase.set('Inhale');
          this.secondsLeft.set(4);
        }
        this.updateCircleClasses();
      }
    }, 1000);
  }

  private stopBreathingTimer() {
    if (this.breathingIntervalId) {
      clearInterval(this.breathingIntervalId);
      this.breathingIntervalId = null;
    }
  }

  private updateCircleClasses() {
    const phase = this.currentPhase();
    if (phase === 'Inhale') {
      this.circleClasses.set('w-44 h-44 bg-emerald-500/10 border-emerald-400 text-emerald-350 scale-110');
    } else if (phase === 'Hold (In)') {
      this.circleClasses.set('w-44 h-44 bg-amber-500/10 border-amber-400 text-amber-350 scale-110');
    } else if (phase === 'Exhale') {
      this.circleClasses.set('w-36 h-36 bg-teal-500/10 border-teal-400 text-teal-350 scale-95');
    } else {
      this.circleClasses.set('w-36 h-36 bg-blue-500/10 border-blue-400 text-blue-350 scale-95');
    }
  }

  private initDrawingLoop() {
    const canvas = this.canvasElement()?.nativeElement;
    if (!canvas) return;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event listeners
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      this.currentMouse = { x: clientX, y: clientY, active: true };
      this.mousePoints.push({ x: clientX, y: clientY, vy: 0, age: 0 });
      if (this.mousePoints.length > 100) this.mousePoints.shift();
    };

    canvas.addEventListener('mousemove', handleMove, { passive: true });
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    canvas.addEventListener('touchstart', handleMove, { passive: true });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    this.ngZone.runOutsideAngular(() => {
      const draw = () => {
        if (!this.isActive()) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.015;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Calculate Box Breathing Progress Scale (4s Inhale, 4s Hold In, 4s Exhale, 4s Hold Out)
      const phase = this.currentPhase();
      const secondsLeft = this.secondsLeft();
      let boxScale = 1.0;
      let boxGlow = 0.5;
      let themeColor = 'rgba(62, 188, 158, 0.4)'; // Brand Teal for Inhale

      if (phase === 'Inhale') {
        const progress = Math.max(0, Math.min(1, (4 - secondsLeft) / 4));
        boxScale = 1.0 + progress * 0.22; // 1.0 -> 1.22
        boxGlow = 0.4 + progress * 0.6;
        themeColor = 'rgba(62, 188, 158, 0.45)'; // Teal
      } else if (phase === 'Hold (In)') {
        boxScale = 1.22;
        boxGlow = 1.0;
        themeColor = 'rgba(250, 166, 59, 0.45)'; // Amber
      } else if (phase === 'Exhale') {
        const progress = Math.max(0, Math.min(1, (4 - secondsLeft) / 4));
        boxScale = 1.22 - progress * 0.22; // 1.22 -> 1.0
        boxGlow = 1.0 - progress * 0.6;
        themeColor = 'rgba(239, 102, 88, 0.45)'; // Coral
      } else { // Hold (Out)
        boxScale = 1.0;
        boxGlow = 0.4;
        themeColor = 'rgba(99, 102, 241, 0.45)'; // Indigo/Blue
      }

      // Apply Anti-Gravity Physics Scaling & Buoyancy
      const gScale = this.gravityScale();
      const isAntiG = this.antiGravityMode();
      const gravityFactor = isAntiG ? -1 * gScale : gScale;

      // Draw Zamecznik Oscillating Kinetic Loops modulated by Box Breathing & Anti-Gravity
      ctx.lineWidth = 1.5 * boxScale * (isAntiG ? 1.3 : 1.0);
      ctx.strokeStyle = themeColor;

      // Render 5 nested spiraling loops scaled by Box Breathing and perturbed by gravity physics
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        const baseRadius = (60 + j * 45) * boxScale;
        const amplitude = (15 + j * 5) * boxScale * (isAntiG ? 1.4 : 1.0);
        const yOffset = Math.sin(time * 2 + j) * 8 * (isAntiG ? -1 : 1) * gScale;

        for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
          const oscillation = Math.sin(angle * (5 + j) + time * (2 + j) * (isAntiG ? -1 : 1)) * amplitude;
          const radius = baseRadius + oscillation;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + yOffset + Math.sin(angle) * radius;

          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw client trace path breathing in Box Breathing style with Anti-Gravity float vectors
      if (this.mousePoints.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.mousePoints[0].x, this.mousePoints[0].y);
        for (let i = 1; i < this.mousePoints.length; i++) {
          ctx.lineTo(this.mousePoints[i].x, this.mousePoints[i].y);
        }
        ctx.strokeStyle = themeColor.replace('0.45', '0.85').replace('0.4', '0.75'); // High visibility box breathing stroke
        ctx.lineWidth = 4.5 * boxScale;
        ctx.shadowBlur = (isAntiG ? 22 : 14) * boxGlow;
        ctx.shadowColor = isAntiG ? 'rgba(99, 102, 241, 0.9)' : themeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      }

      // Update ages and float particle positions according to gravity physics
      this.mousePoints.forEach(p => {
        p.age++;
        // Apply vertical particle drift based on gravity direction
        p.y -= 1.5 * (isAntiG ? 1 : -0.2) * gScale;
      });
      this.mousePoints = this.mousePoints.filter(p => p.age < 30);

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    });
  }

  private stopDrawingLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
