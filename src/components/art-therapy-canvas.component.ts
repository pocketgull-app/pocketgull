import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtTherapyService, IArtTherapyPrompt } from '../services/art-therapy.service';
import { BioHapticFeedbackService, SolfeggioTone } from '../services/bio-haptic-feedback.service';

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

          <!-- Color Palette Picker -->
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
        </div>

        <!-- Simulated Interactive Painting Canvas Area -->
        <div (click)="paintStroke()" class="h-48 bg-zinc-950 rounded-xl border border-purple-500/30 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition hover:border-purple-400 relative overflow-hidden group">
          <!-- Decorative Canvas Glow -->
          <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-teal-500/10 to-amber-500/10 opacity-50 group-hover:opacity-80 transition"></div>

          <div class="relative z-10 space-y-2">
            <div class="text-3xl">✨</div>
            <div class="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Tap Anywhere to Apply {{ prompt.modality === 'kintsugi' ? '24K Gold Seam' : 'Chromesthesia Color Stroke' }}
            </div>
            <p class="text-[11px] text-zinc-400 max-w-sm">
              Triggers Web Audio Solfeggio Tone & Web Haptic Vibration Feedback with every brushstroke.
            </p>
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
            <button (click)="paintStroke()" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold transition cursor-pointer">
              ✨ Apply Expressive Stroke
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class ArtTherapyCanvasComponent {
  private artTherapy = inject(ArtTherapyService);
  protected bioHaptic = inject(BioHapticFeedbackService);

  readonly prompts = this.artTherapy.artTherapyPrompts;
  readonly selectedPrompt = signal<IArtTherapyPrompt>(this.prompts[0]);
  readonly selectedColor = signal<string>(this.prompts[0].recommendedPalette[0]);

  readonly activeFrequency = computed(() => {
    return this.artTherapy.getColorToFrequencyHz(this.selectedColor());
  });

  selectPrompt(prompt: IArtTherapyPrompt): void {
    this.selectedPrompt.set(prompt);
    this.selectedColor.set(prompt.recommendedPalette[0]);
  }

  pickColor(color: string): void {
    this.selectedColor.set(color);
    const freq = this.artTherapy.getColorToFrequencyHz(color) as SolfeggioTone;
    this.bioHaptic.playSolfeggioTone(freq, 1500);
  }

  paintStroke(): void {
    const freq = this.activeFrequency() as SolfeggioTone;
    this.bioHaptic.playSolfeggioTone(freq, 2000);
    this.bioHaptic.triggerHapticPulse('inhale');
  }
}
