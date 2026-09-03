import { Component, ChangeDetectionStrategy, input, output, signal, computed, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BionicReadingService, IClinicalBionicToken } from '../../services/bionic-reading.service';

@Component({
  selector: 'app-foveal-reticle-rsvp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-origami-unfurl font-sans" role="dialog" aria-modal="true" aria-labelledby="foveal-title">
        <!-- Rachel Nabors 10s Parasympathetic Respiration Ambient Glow -->
        <div class="absolute w-[500px] h-[500px] rounded-full bg-teal-500/15 pointer-events-none animate-vagal-glow"></div>

        <div class="relative w-full max-w-2xl bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 z-10 overflow-hidden">
          
          <!-- Top Bar: Title & Close -->
          <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-xl sm:text-2xl">⚡</span>
              <div>
                <h3 id="foveal-title" class="text-sm sm:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2 font-pocketgull-inter">
                  FOVEA™ Clinical Speed Reader
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800/50">
                    600–900 WPM
                  </span>
                </h3>
                <p class="text-[11px] text-zinc-400 font-pocketgull-inter">
                  Zero Saccadic Drift • Optimal Recognition Point (ORP) Centering • ISMP LASA Safeguard
                </p>
              </div>
            </div>

            <button
              (click)="closeReader()"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition cursor-pointer"
              title="Close Speed Reader (Esc)"
              aria-label="Close Speed Reader">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Active Clinical Category Badge -->
          <div class="h-6 flex items-center justify-between text-[11px] font-mono">
            @if (currentToken()?.category === 'medication-tallman') {
              <span class="inline-flex items-center gap-1 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 animate-pulse">
                <span>💊</span> ISMP Tall Man LASA: <strong class="text-amber-300 font-black">{{ currentToken()?.tallManWord }}</strong>
              </span>
            } @else if (currentToken()?.category === 'medical-morpheme') {
              <span class="inline-flex items-center gap-1 text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/60">
                <span>🧬</span> Morpheme Root Anchor: <strong class="text-teal-300 font-bold">{{ currentToken()?.fixation }}-</strong>
              </span>
            } @else if (currentToken()?.category === 'vital') {
              <span class="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                <span>📊</span> Vitals / Telemetry Index
              </span>
            } @else {
              <span class="text-zinc-500 font-mono">
                Word {{ currentIndex() + 1 }} / {{ tokens().length }}
              </span>
            }

            <span class="text-zinc-400 font-mono text-[10px]">
              {{ progressPercent() }}% complete
            </span>
          </div>

          <!-- Main Center-Locked Foveal Reticle Screen -->
          <div class="relative h-28 sm:h-32 w-full bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden select-none font-mono shadow-inner">
            <!-- Center Vertical Crosshair Laser Line -->
            <div class="absolute top-0 bottom-0 left-1/2 w-[1px] bg-teal-500/25 pointer-events-none"></div>

            <!-- Optical Alignment Reticle Pips (Upper & Lower) -->
            <div class="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>

            <!-- Balanced Left/Center/Right Layout: Mathematically Locks ORP at 50% -->
            @if (currentToken(); as token) {
              <div class="flex items-baseline text-2xl sm:text-3xl md:text-4xl tracking-tight leading-none">
                <!-- Left of ORP: Right-aligned so it terminates precisely at the crosshair -->
                <span class="w-[160px] sm:w-[220px] text-right text-zinc-300 font-semibold truncate pr-0.5">
                  {{ token.leadingPunct }}{{ token.leftOfOrp }}
                </span>

                <!-- Physical ORP Character: Locked at exact Center -->
                <span class="text-amber-400 font-black text-3xl sm:text-4xl md:text-5xl px-0.5 underline decoration-amber-400 decoration-2 underline-offset-4 font-mono">
                  {{ token.orpChar }}
                </span>

                <!-- Right of ORP: Left-aligned so it begins precisely after the crosshair -->
                <span class="w-[160px] sm:w-[220px] text-left text-zinc-400 font-normal truncate pl-0.5">
                  {{ token.rightOfOrp }}{{ token.trailingPunct }}
                </span>
              </div>
            } @else {
              <span class="text-xs font-mono text-zinc-600 uppercase tracking-widest">Ready to Stream</span>
            }
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
            <div class="bg-gradient-to-r from-teal-500 to-amber-400 h-1.5 rounded-full transition-all duration-75"
                 [style.width.%]="progressPercent()"></div>
          </div>

          <!-- Playback & Velocity Controls -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <!-- Left Action Buttons -->
            <div class="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <button
                (click)="togglePlay()"
                class="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                [class.bg-teal-500]="!isPlaying()"
                [class.text-zinc-950]="!isPlaying()"
                [class.hover:bg-teal-400]="!isPlaying()"
                [class.bg-amber-500]="isPlaying()"
                [class.text-zinc-950]="isPlaying()"
                [class.hover:bg-amber-400]="isPlaying()">
                <span>{{ isPlaying() ? '⏸️ Pause (Space)' : '▶️ Stream (Space)' }}</span>
              </button>

              <button
                (click)="stepRelative(-10)"
                class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition cursor-pointer border border-zinc-800"
                title="Rewind 10 words">
                ⏪ -10
              </button>

              <button
                (click)="stepRelative(10)"
                class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition cursor-pointer border border-zinc-800"
                title="Skip forward 10 words">
                +10 ⏩
              </button>

              <button
                (click)="reset()"
                class="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition cursor-pointer border border-zinc-800"
                title="Restart Stream">
                🔄
              </button>
            </div>

            <!-- Right Velocity Controls & Presets -->
            <div class="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <!-- Velocity Preset Buttons -->
              <div class="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-[11px] font-mono">
                @for (preset of [450, 600, 750, 900]; track preset) {
                  <button
                    (click)="setWpm(preset)"
                    [class.bg-teal-600]="wpm() === preset"
                    [class.text-white]="wpm() === preset"
                    [class.text-zinc-400]="wpm() !== preset"
                    class="px-2 py-1 rounded transition cursor-pointer hover:text-zinc-100">
                    {{ preset }}
                  </button>
                }
              </div>

              <!-- Velocity Slider -->
              <div class="flex items-center gap-1.5 font-mono text-xs text-teal-400">
                <input
                  type="range"
                  min="300"
                  max="1000"
                  step="50"
                  [ngModel]="wpm()"
                  (ngModelChange)="setWpm($event)"
                  class="w-24 accent-teal-400 cursor-pointer" />
                <span class="w-14 font-bold text-right">{{ wpm() }} WPM</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class FovealReticleRsvpComponent implements OnDestroy {
  private readonly bionic = inject(BionicReadingService);

  /** Plain text or clinical summary to tokenize and stream */
  readonly text = input<string>('');

  /** Visibility of the modal stream */
  readonly isOpen = input<boolean>(false);

  /** Event emitted when closing the reader modal */
  readonly close = output<void>();

  /** Playback velocity in Words Per Minute */
  readonly wpm = signal<number>(this.bionic.rsvpSpeedWpm());

  /** Active stream playback state */
  readonly isPlaying = signal<boolean>(false);

  /** Current word index in token stream */
  readonly currentIndex = signal<number>(0);

  /** Tokenized clinical word stream */
  readonly tokens = computed<IClinicalBionicToken[]>(() => {
    const raw = this.text();
    if (!raw) return [];
    return this.bionic.tokenizeForRsvp(raw);
  });

  /** Active token centered on foveal crosshair */
  readonly currentToken = computed<IClinicalBionicToken | null>(() => {
    const list = this.tokens();
    const idx = this.currentIndex();
    if (!list.length || idx < 0 || idx >= list.length) return null;
    return list[idx];
  });

  /** Stream completion percentage (0-100) */
  readonly progressPercent = computed<number>(() => {
    const total = this.tokens().length;
    if (total <= 1) return 0;
    return Math.min(100, Math.round(((this.currentIndex() + 1) / total) * 100));
  });

  private timerId: ReturnType<typeof setTimeout> | null = null;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    if (event.code === 'Space') {
      event.preventDefault();
      this.togglePlay();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeReader();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.stepRelative(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.stepRelative(1);
    }
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  play(): void {
    const total = this.tokens().length;
    if (total === 0) return;

    if (this.currentIndex() >= total - 1) {
      this.currentIndex.set(0);
    }

    this.isPlaying.set(true);
    this.scheduleNextWord();
  }

  pause(): void {
    this.isPlaying.set(false);
    this.stopTimer();
  }

  reset(): void {
    this.pause();
    this.currentIndex.set(0);
  }

  setWpm(speed: number): void {
    this.wpm.set(speed);
    this.bionic.rsvpSpeedWpm.set(speed);
    if (this.isPlaying()) {
      this.stopTimer();
      this.scheduleNextWord();
    }
  }

  stepRelative(delta: number): void {
    const total = this.tokens().length;
    if (!total) return;
    const next = Math.max(0, Math.min(total - 1, this.currentIndex() + delta));
    this.currentIndex.set(next);
  }

  closeReader(): void {
    this.pause();
    this.close.emit();
  }

  private scheduleNextWord(): void {
    this.stopTimer();
    if (!this.isPlaying()) return;

    const token = this.currentToken();
    const baseDuration = (60 * 1000) / Math.max(100, this.wpm());
    const multiplier = token?.holdMultiplier || 1.0;
    const finalDuration = Math.round(baseDuration * multiplier);

    this.timerId = setTimeout(() => {
      const nextIndex = this.currentIndex() + 1;
      if (nextIndex < this.tokens().length) {
        this.currentIndex.set(nextIndex);
        this.scheduleNextWord();
      } else {
        this.pause();
      }
    }, finalDuration);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
