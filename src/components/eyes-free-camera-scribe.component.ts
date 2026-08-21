import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EyesFreeCameraScribeService, VisionScribeMode } from '../services/eyes-free-camera-scribe.service';

@Component({
  selector: 'app-eyes-free-camera-scribe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="glass-card-dark rounded-3xl p-6 sm:p-8 border-2 border-violet-500/40 shadow-2xl relative overflow-hidden space-y-6"
      role="region"
      aria-label="Eyes-Free Smartphone Camera Vision Scribe"
    >
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-mono font-bold">
            <span>👁️ Phone-As-Your-Eyes • Multimodal Vision Scribe</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
            Eyes-Free Camera Vision Scribe
          </h2>
          <p class="text-xs sm:text-sm text-stone-300">
            Real-time multimodal optical AI that sees your surroundings, reads pill bottles, detects obstacles, and speaks what is in front of you.
          </p>
        </div>

        <!-- Camera Power Toggle -->
        <button 
          (click)="toggleCamera()"
          class="px-5 py-3 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider transition border-2 cursor-pointer flex items-center gap-2 shadow-xl"
          [ngClass]="{
            'bg-rose-500 text-white border-rose-300 shadow-rose-500/30': service.isCameraStreaming(),
            'bg-violet-600 text-white border-violet-400 hover:bg-violet-500': !service.isCameraStreaming()
          }"
          [attr.aria-pressed]="service.isCameraStreaming()"
          aria-label="Toggle smartphone camera stream"
        >
          <span class="text-lg">{{ service.isCameraStreaming() ? '⏹️' : '📷' }}</span>
          <span>{{ service.isCameraStreaming() ? 'Stop Camera' : 'Start Camera Vision' }}</span>
        </button>
      </div>

      <!-- 4 Vision Mode Selector Buttons -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
        <button 
          (click)="selectMode('MEDICATION_IDENTIFIER')"
          class="p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5"
          [ngClass]="{
            'bg-violet-950/80 border-violet-400 text-white shadow-lg': service.activeMode() === 'MEDICATION_IDENTIFIER',
            'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-white': service.activeMode() !== 'MEDICATION_IDENTIFIER'
          }"
          aria-label="Select Medication Identifier Mode"
        >
          <span class="text-2xl">💊</span>
          <div>
            <div class="font-bold text-xs">Pill Bottles &amp; Rx</div>
            <div class="text-[10px] opacity-70">Read labels &amp; pills</div>
          </div>
        </button>

        <button 
          (click)="selectMode('ROOM_NAVIGATION')"
          class="p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5"
          [ngClass]="{
            'bg-violet-950/80 border-violet-400 text-white shadow-lg': service.activeMode() === 'ROOM_NAVIGATION',
            'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-white': service.activeMode() !== 'ROOM_NAVIGATION'
          }"
          aria-label="Select Room Navigation Mode"
        >
          <span class="text-2xl">🚶</span>
          <div>
            <div class="font-bold text-xs">Obstacle &amp; Doors</div>
            <div class="text-[10px] opacity-70">Spatial radar</div>
          </div>
        </button>

        <button 
          (click)="selectMode('DOCUMENT_READER')"
          class="p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5"
          [ngClass]="{
            'bg-violet-950/80 border-violet-400 text-white shadow-lg': service.activeMode() === 'DOCUMENT_READER',
            'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-white': service.activeMode() !== 'DOCUMENT_READER'
          }"
          aria-label="Select Document Reader Mode"
        >
          <span class="text-2xl">📄</span>
          <div>
            <div class="font-bold text-xs">Document OCR</div>
            <div class="text-[10px] opacity-70">Read discharge notes</div>
          </div>
        </button>

        <button 
          (click)="selectMode('LIGHT_AND_COLOR')"
          class="p-3 rounded-2xl border transition text-left cursor-pointer flex items-center gap-2.5"
          [ngClass]="{
            'bg-violet-950/80 border-violet-400 text-white shadow-lg': service.activeMode() === 'LIGHT_AND_COLOR',
            'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-white': service.activeMode() !== 'LIGHT_AND_COLOR'
          }"
          aria-label="Select Light and Color Inspector Mode"
        >
          <span class="text-2xl">💡</span>
          <div>
            <div class="font-bold text-xs">Lighting &amp; Colors</div>
            <div class="text-[10px] opacity-70">Room lights &amp; clothes</div>
          </div>
        </button>
      </div>

      <!-- Live Optical Viewport / AI Narration Card -->
      @if (service.lastInspection(); as result) {
        <div class="p-6 rounded-3xl bg-stone-900/90 border-2 border-violet-500/40 space-y-4 shadow-xl">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 font-mono text-xs">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Confidence {{ (result.confidenceScore * 100).toFixed(0) }}%
              </span>
              <strong class="text-white text-sm">{{ result.headline }}</strong>
            </div>
            <div class="text-amber-300 font-bold">
              {{ result.spatialFramingCue }}
            </div>
          </div>

          <!-- Spoken Audio Description -->
          <div class="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-violet-300 flex items-center gap-2">
                <span>🗣️ Spoken Auditory Narration:</span>
              </span>
              <button 
                (click)="service.speakNarration(result.detailedNarration)"
                class="px-3 py-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                aria-label="Replay spoken narration"
              >
                <span>🔊 Replay Audio</span>
              </button>
            </div>
            <p class="text-sm sm:text-base text-stone-100 font-sans leading-relaxed">
              "{{ result.detailedNarration }}"
            </p>
          </div>

          <!-- Structured Key Details Badges -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
            @for (detail of result.keyDetails; track detail.label) {
              <div class="p-3 rounded-xl bg-stone-950/80 border border-white/5 space-y-1">
                <div class="text-[10px] font-mono text-stone-400 uppercase tracking-wider">{{ detail.label }}</div>
                <div class="text-xs font-bold text-white truncate">{{ detail.value }}</div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Bottom Audio Guidance Note -->
      <div class="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-violet-200">
        <div class="flex items-center gap-2">
          <span>🛡️ Edge Privacy Guarantee: Optical frames are analyzed in-memory and never stored or uploaded.</span>
        </div>
        <button 
          (click)="rescan()" 
          class="px-3.5 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-white font-bold cursor-pointer"
        >
          Rescan Frame 🔄
        </button>
      </div>
    </div>
  `,
})
export class EyesFreeCameraScribeComponent {
  public service = inject(EyesFreeCameraScribeService);

  toggleCamera(): void {
    if (this.service.isCameraStreaming()) {
      this.service.stopCamera();
    } else {
      this.service.startCamera();
    }
  }

  selectMode(mode: VisionScribeMode): void {
    this.service.setMode(mode);
  }

  rescan(): void {
    this.service.analyzeCurrentFrame();
  }
}
