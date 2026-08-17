import { Component, ChangeDetectionStrategy, inject, signal, computed, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtTherapyService, IArtTherapyPrompt } from '../services/art-therapy.service';
import { BioHapticFeedbackService, SolfeggioTone } from '../services/hardware/bio-haptic-feedback.service';

@Component({
  selector: 'app-art-therapy-canvas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-purple-500/40 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-extrabold text-lg">
            🎨
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Expressive Art Therapy & Chromesthesia Canvas
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Interactive Kintsugi fracture repair, HRV bio-resonance mandalas, and 528 Hz color-sound sonification.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold font-mono">
            Expressive Somatic Art
          </span>
        </div>
      </div>

      <!-- Modality Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <button *ngFor="let prompt of prompts"
                (click)="selectPrompt(prompt)"
                [class.bg-purple-600]="selectedPrompt()?.id === prompt.id"
                [class.text-white]="selectedPrompt()?.id === prompt.id"
                [class.bg-purple-500\/5]="selectedPrompt()?.id !== prompt.id"
                [class.text-gray-800]="selectedPrompt()?.id !== prompt.id"
                [class.dark:text-zinc-200]="selectedPrompt()?.id !== prompt.id"
                class="p-3.5 border border-purple-500/30 rounded-xl text-left transition cursor-pointer space-y-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
          <div class="font-black text-sm">{{ prompt.title }}</div>
          <span class="inline-block px-2 py-0.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded font-mono text-[10px] uppercase font-bold">
            {{ prompt.targetEmotion }}
          </span>
          <p class="text-[11px] opacity-90 leading-tight">
            {{ prompt.description }}
          </p>
        </button>
      </div>

      <!-- Active Interactive Canvas Workbench -->
      <div *ngIf="selectedPrompt() as prompt" class="p-4 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-zinc-700 pb-3">
          <div>
            <h4 class="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              {{ prompt.title }} — Interactive Workbench
            </h4>
            <span class="text-xs text-purple-600 dark:text-purple-400 font-mono">
              Target Focus: {{ prompt.targetEmotion }}
            </span>
          </div>

          <!-- Color Palette Picker & Brush Size -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-gray-500 dark:text-zinc-400 mr-1">Palette:</span>
              <button *ngFor="let color of prompt.recommendedPalette"
                      (click)="pickColor(color)"
                      [style.background-color]="color"
                      [class.ring-2]="selectedColor() === color"
                      [class.ring-purple-500]="selectedColor() === color"
                      class="w-6 h-6 rounded-full border border-white/20 transition cursor-pointer shadow-sm">
              </button>
            </div>

            <div class="flex items-center gap-1">
              <span class="text-xs font-bold text-gray-500 dark:text-zinc-400">Brush:</span>
              <button (click)="brushSize.set(4)" [class.bg-purple-600]="brushSize() === 4" [class.text-white]="brushSize() === 4" class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-xs font-bold">Small</button>
              <button (click)="brushSize.set(10)" [class.bg-purple-600]="brushSize() === 10" [class.text-white]="brushSize() === 10" class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-xs font-bold">Med</button>
              <button (click)="brushSize.set(20)" [class.bg-purple-600]="brushSize() === 20" [class.text-white]="brushSize() === 20" class="px-2 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 text-xs font-bold">Gold Seam</button>
            </div>

            <button (click)="clearCanvas()" class="px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-500/20 transition cursor-pointer">
              🗑️ Clear Canvas
            </button>
          </div>
        </div>

        <!-- 🎨 Real HTML5 Interactive Drawing Canvas -->
        <div class="relative w-full h-72 bg-zinc-950 rounded-xl border border-purple-500/30 overflow-hidden shadow-inner touch-none">
          <canvas #canvasElement
                  (mousedown)="startDrawing($event)"
                  (mousemove)="draw($event)"
                  (mouseup)="stopDrawing()"
                  (mouseleave)="stopDrawing()"
                  (touchstart)="startDrawing($event)"
                  (touchmove)="draw($event)"
                  (touchend)="stopDrawing()"
                  class="w-full h-full cursor-crosshair block">
          </canvas>

          <!-- Instruction Badge Overlay -->
          <div *ngIf="!hasDrawn()" class="absolute inset-0 flex items-center justify-center pointer-events-none p-4 text-center">
            <div class="px-4 py-2 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg animate-pulse">
              ✏️ Click & Drag or Touch & Slide to Draw Freehand {{ prompt.modality === 'kintsugi' ? '24K Gold Repair Seams' : 'Chromesthesia Waves' }}
            </div>
          </div>
        </div>

        <!-- Bio-Haptic Feedback Bar -->
        <div class="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span class="font-bold text-purple-900 dark:text-purple-300">
            🎨 Color Tone Frequency: {{ activeFrequency() }} Hz
          </span>
          <div class="flex items-center gap-2">
            <button (click)="bioHaptic.playNasaSaturnSkrTone(3500)" class="px-2.5 py-1 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40 rounded font-bold hover:bg-indigo-500/30 transition cursor-pointer">
              🪐 NASA Saturn SKR Plasma Tone
            </button>
            <button (click)="clearCanvas()" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition cursor-pointer">
              ✨ Reset Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ArtTherapyCanvasComponent implements AfterViewInit {
  private artTherapy = inject(ArtTherapyService);
  protected bioHaptic = inject(BioHapticFeedbackService);

  readonly canvasElement = viewChild<ElementRef<HTMLCanvasElement>>('canvasElement');

  readonly prompts = this.artTherapy.artTherapyPrompts;
  readonly selectedPrompt = signal<IArtTherapyPrompt>(this.prompts[0]);
  readonly selectedColor = signal<string>(this.prompts[0].recommendedPalette[0]);
  readonly brushSize = signal<number>(8);
  readonly hasDrawn = signal<boolean>(false);

  private isDrawing = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastX = 0;
  private lastY = 0;

  readonly activeFrequency = computed(() => {
    return this.artTherapy.getColorToFrequencyHz(this.selectedColor());
  });

  ngAfterViewInit() {
    this.initCanvas();
  }

  private initCanvas() {
    const el = this.canvasElement()?.nativeElement;
    if (!el) return;
    
    // Set actual canvas resolution to match container dimensions
    el.width = el.offsetWidth || 800;
    el.height = el.offsetHeight || 300;

    this.ctx = el.getContext('2d');
    if (this.ctx) {
      this.ctx.fillStyle = '#09090b';
      this.ctx.fillRect(0, 0, el.width, el.height);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  selectPrompt(prompt: IArtTherapyPrompt): void {
    this.selectedPrompt.set(prompt);
    this.selectedColor.set(prompt.recommendedPalette[0]);
    this.clearCanvas();
  }

  pickColor(color: string): void {
    this.selectedColor.set(color);
    const freq = this.artTherapy.getColorToFrequencyHz(color) as SolfeggioTone;
    this.bioHaptic.playSolfeggioTone(freq, 1500);
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    this.hasDrawn.set(true);
    const coords = this.getCoords(event);
    this.lastX = coords.x;
    this.lastY = coords.y;

    const freq = this.activeFrequency() as SolfeggioTone;
    this.bioHaptic.playSolfeggioTone(freq, 1000);
    this.bioHaptic.triggerHapticPulse('inhale');
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing || !this.ctx) return;
    event.preventDefault();

    const coords = this.getCoords(event);
    const color = this.selectedColor();
    const isKintsugi = this.selectedPrompt()?.modality === 'kintsugi';

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.brushSize();

    if (isKintsugi) {
      this.ctx.shadowColor = '#fbbf24'; // 24K Gold glow
      this.ctx.shadowBlur = 12;
    } else {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 8;
    }

    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    this.lastX = coords.x;
    this.lastY = coords.y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    const el = this.canvasElement()?.nativeElement;
    if (!el || !this.ctx) return;
    this.ctx.fillStyle = '#09090b';
    this.ctx.fillRect(0, 0, el.width, el.height);
    this.hasDrawn.set(false);
  }

  paintStroke(): void {
    const freq = this.activeFrequency() as SolfeggioTone;
    this.bioHaptic.playSolfeggioTone(freq, 2000);
    this.bioHaptic.triggerHapticPulse('inhale');
    this.hasDrawn.set(true);
  }

  private getCoords(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const el = this.canvasElement()?.nativeElement;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('clientX' in event) {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * (el.width / rect.width),
      y: (clientY - rect.top) * (el.height / rect.height)
    };
  }
}
