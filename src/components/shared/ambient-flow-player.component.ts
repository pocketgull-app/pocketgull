import { Component, inject, signal, viewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmbientFlowSoundscapeService, SOUNDSCAPE_PRESETS, SoundscapeType } from '../../services/ambient-flow-soundscape.service';

@Component({
  selector: 'app-ambient-flow-player',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="rounded-3xl border border-teal-500/30 bg-zinc-950/95 backdrop-blur-2xl text-zinc-100 shadow-2xl p-5 space-y-4 transition-all"
      [class.max-w-md]="isExpanded()"
      [class.w-full]="isExpanded()"
    >
      <!-- Player Header -->
      <div class="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-3">
          <button 
            type="button"
            (click)="soundscapeService.togglePlay()"
            [class.bg-teal-500]="soundscapeService.isPlaying()"
            [class.text-zinc-950]="soundscapeService.isPlaying()"
            [class.bg-zinc-800]="!soundscapeService.isPlaying()"
            [class.text-teal-400]="!soundscapeService.isPlaying()"
            class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black transition-all hover:scale-105 shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer shrink-0"
            [title]="soundscapeService.isPlaying() ? 'Pause Ambient Flow' : 'Play Ambient Flow'"
            aria-label="Toggle Ambient Flow Music"
          >
            {{ soundscapeService.isPlaying() ? '⏸' : '▶' }}
          </button>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-zinc-100 font-pocketgull-inter flex items-center gap-1.5">
                <span>{{ soundscapeService.activePreset().icon }}</span>
                <span>{{ soundscapeService.activePreset().title }}</span>
              </span>
              @if (soundscapeService.isPlaying()) {
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse">
                  FLOW ACTIVE
                </span>
              }
            </div>
            <span class="text-[11px] text-zinc-400 font-mono block">
              {{ soundscapeService.activePreset().brainwaveBand }} &bull; Zero Cloud Egress
            </span>
          </div>
        </div>

        <!-- Controls: Expand/Collapse & Close/Mute -->
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="soundscapeService.toggleMute()"
            [class.text-amber-400]="soundscapeService.isMuted()"
            [class.text-zinc-400]="!soundscapeService.isMuted()"
            class="p-2 rounded-xl hover:bg-zinc-800/60 transition cursor-pointer text-sm"
            [title]="soundscapeService.isMuted() ? 'Unmute' : 'Mute'"
          >
            {{ soundscapeService.isMuted() ? '🔇' : '🔊' }}
          </button>
          
          <button
            type="button"
            (click)="isExpanded.set(!isExpanded())"
            class="p-2 rounded-xl hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition cursor-pointer text-xs font-mono"
            [title]="isExpanded() ? 'Compact Player' : 'Expand Player'"
          >
            {{ isExpanded() ? '▲' : '▼' }}
          </button>
        </div>
      </div>

      <!-- Real-Time Audio Visualizer Canvas -->
      <div class="relative h-12 w-full bg-zinc-900/90 rounded-2xl overflow-hidden border border-zinc-800/80 flex items-center justify-center">
        <canvas #visualizerCanvas class="w-full h-full block"></canvas>
        @if (!soundscapeService.isPlaying()) {
          <div class="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-[1px] text-xs font-mono text-zinc-500">
            Click ▶ to start ambient flow
          </div>
        }
      </div>

      <!-- Expanded Settings -->
      @if (isExpanded()) {
        <div class="space-y-4 pt-1 animate-in fade-in duration-200">
          
          <!-- Soundscape Preset Switcher -->
          <div class="space-y-2">
            <label class="text-[11px] font-bold text-teal-400 uppercase tracking-wider block font-mono">
              Select Ambient Soundscape
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (preset of presets; track preset.id) {
                <button
                  type="button"
                  (click)="soundscapeService.setSoundscape(preset.id)"
                  [class.bg-teal-500/20]="soundscapeService.activeSoundscape() === preset.id"
                  [class.text-teal-200]="soundscapeService.activeSoundscape() === preset.id"
                  [class.border-teal-500/60]="soundscapeService.activeSoundscape() === preset.id"
                  [class.bg-zinc-900/60]="soundscapeService.activeSoundscape() !== preset.id"
                  [class.text-zinc-300]="soundscapeService.activeSoundscape() !== preset.id"
                  class="p-2.5 rounded-2xl border border-zinc-800 text-left transition hover:border-zinc-700 active:scale-[0.98] cursor-pointer flex flex-col justify-between"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs flex items-center gap-1.5">
                      <span>{{ preset.icon }}</span>
                      <span>{{ preset.title }}</span>
                    </span>
                    @if (soundscapeService.activeSoundscape() === preset.id) {
                      <span class="text-teal-400 text-xs">✓</span>
                    }
                  </div>
                  <span class="text-[10px] text-zinc-400 font-mono mt-1">
                    {{ preset.brainwaveBand }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- Volume & Focus Timer Bar -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
            
            <!-- Volume Slider -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="text-zinc-400">Master Volume:</span>
                <span class="text-teal-300 font-bold">{{ Math.round(soundscapeService.volume() * 100) }}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                [value]="soundscapeService.volume()"
                (input)="onVolumeChange($event)"
                class="w-full h-2 bg-zinc-800 rounded-lg accent-teal-400 cursor-pointer"
              />
            </div>

            <!-- Timer Selector -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="text-zinc-400">Focus Timer:</span>
                <span class="text-amber-300 font-bold">
                  {{ soundscapeService.timerMinutesRemaining() ? soundscapeService.timerMinutesRemaining() + 'm left' : 'Endless' }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  (click)="soundscapeService.setTimer(15)"
                  [class.bg-teal-500/30]="soundscapeService.timerMinutesRemaining() === 15"
                  class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-300 transition cursor-pointer flex-1"
                >
                  15m
                </button>
                <button
                  type="button"
                  (click)="soundscapeService.setTimer(30)"
                  [class.bg-teal-500/30]="soundscapeService.timerMinutesRemaining() === 30"
                  class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-300 transition cursor-pointer flex-1"
                >
                  30m
                </button>
                <button
                  type="button"
                  (click)="soundscapeService.setTimer(60)"
                  [class.bg-teal-500/30]="soundscapeService.timerMinutesRemaining() === 60"
                  class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-300 transition cursor-pointer flex-1"
                >
                  60m
                </button>
                <button
                  type="button"
                  (click)="soundscapeService.setTimer(null)"
                  [class.bg-teal-500/30]="soundscapeService.timerMinutesRemaining() === null"
                  class="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] font-mono font-bold text-zinc-300 transition cursor-pointer flex-1"
                >
                  &infin;
                </button>
              </div>
            </div>

          </div>

          <!-- Description Footer -->
          <p class="text-[11px] text-zinc-400 leading-relaxed font-sans bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/60">
            {{ soundscapeService.activePreset().description }}
          </p>

        </div>
      }
    </div>
  `
})
export class AmbientFlowPlayerComponent implements AfterViewInit, OnDestroy {
  soundscapeService = inject(AmbientFlowSoundscapeService);

  visualizerCanvas = viewChild<ElementRef<HTMLCanvasElement>>('visualizerCanvas');
  isExpanded = signal<boolean>(false);
  presets = SOUNDSCAPE_PRESETS;
  Math = Math;

  private animationFrameId: number | null = null;

  ngAfterViewInit(): void {
    this.startVisualizerLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  onVolumeChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.soundscapeService.setVolume(val);
  }

  private dataArray: Uint8Array | null = null;

  private startVisualizerLoop(): void {
    const canvas = this.visualizerCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 320;
    canvas.height = 48;

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const analyser = this.soundscapeService.getAnalyser();
      if (!analyser || !this.soundscapeService.isPlaying()) {
        // Draw resting subtle baseline
        ctx.strokeStyle = '#14b8a622';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      if (!this.dataArray || this.dataArray.length !== bufferLength) {
        this.dataArray = new Uint8Array(bufferLength);
      }
      analyser.getByteFrequencyData(this.dataArray);

      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (this.dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient color from teal to emerald
        const hue = 160 + (i / bufferLength) * 40;
        ctx.fillStyle = `hsl(${hue}, 85%, 55%)`;

        const y = canvas.height - barHeight;
        ctx.fillRect(x, y, barWidth - 1.5, barHeight);

        x += barWidth;
      }
    };

    render();
  }
}
