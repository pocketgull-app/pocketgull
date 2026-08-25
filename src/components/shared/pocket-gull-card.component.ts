import { Component, ChangeDetectionStrategy, input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'pocket-gull-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 3D Perspective Card Container -->
    <div class="relative h-full flex flex-col perspective-1000 group cursor-pointer"
         (dblclick)="toggleFlip()"
         [title]="flippable() ? (isFlipped() ? 'Double-click to flip back to clinical telemetry view' : 'Double-click to flip over for plain-language reasoning') : ''">

      <div [class.rotate-y-180]="isFlipped()"
           class="relative h-full flex flex-col transition-transform duration-500 transform-style-3d w-full">

        <!-- FRONT FACE: Detailed Clinical Telemetry -->
        <div [class]="neoTactile() 
          ? 'bg-[#FFFDF5] dark:bg-zinc-950 rounded-2xl border-2 border-[#1C1C1C] dark:border-white/30 shadow-[4px_6px_0px_0px_rgba(28,28,28,0.85)] dark:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.9)] relative h-full flex flex-col transition-all duration-300 hover:translate-y-[-2px] pocket-gull-card backface-hidden'
          : 'bg-white/70 dark:bg-zinc-900 backdrop-blur-[12px] rounded-xl border border-white/20 dark:border-zinc-800 shadow-lg relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:border-gray-200 dark:hover:border-zinc-700 pocket-gull-card backface-hidden'">
          
          <!-- Glow Effect (Clipped to card bounds) -->
          <div class="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div class="px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-zinc-800/80 shrink-0 relative z-10 min-w-0">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              @if (icon()) {
                <div class="w-8 h-8 rounded-lg bg-primary-10 flex items-center justify-center text-[#689F38]">
                  <div [innerHTML]="iconHtml()"></div>
                </div>
              }
              <h3 class="text-base sm:text-lg font-black uppercase tracking-wider text-[#111827] dark:text-zinc-100 flex items-center gap-2">
                <span>{{ title() }}</span>
                @if (personaBadge()) {
                  <span class="text-xs px-2.5 py-0.5 rounded-full bg-[#F6B12B] text-[#1C1C1C] font-mono font-extrabold uppercase border border-[#1C1C1C] shadow-[1px_1px_0px_0px_rgba(28,28,28,0.9)] shrink-0">
                    {{ personaBadge() }}
                  </span>
                }
              </h3>
            </div>
            
            <div class="flex items-center gap-2">
              @if (flippable()) {
                <span (click)="toggleFlip(); $event.stopPropagation()"
                      class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition cursor-pointer select-none">
                  dblclick 🔄 flip
                </span>
              }
              <ng-content select="[right-action]"></ng-content>
            </div>
          </div>

          <div class="flex-grow min-w-0" [class.p-4]="!noPadding()" [class.sm:p-6]="!noPadding()">
            <ng-content></ng-content>
          </div>
          
          @if (footer()) {
            <div class="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-gray-600 dark:text-zinc-300 bg-black/5 dark:bg-zinc-800/50">
              <ng-content select="[card-footer]"></ng-content>
            </div>
          }
        </div>

        <!-- BACK FACE: Simplified Plain-Language Rationale / Clinical Reason -->
        @if (flippable()) {
          <div [class]="neoTactile()
            ? 'bg-[#F0FDF4] dark:bg-zinc-950 rounded-2xl border-2 border-emerald-600 dark:border-emerald-500/50 shadow-2xl h-full flex flex-col absolute inset-0 rotate-y-180 backface-hidden'
            : 'bg-emerald-950/90 text-white rounded-xl border border-emerald-500/40 shadow-2xl h-full flex flex-col absolute inset-0 rotate-y-180 backface-hidden backdrop-blur-xl'">
            
            <!-- Header -->
            <div class="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-emerald-800/60 font-mono text-xs">
              <div class="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                <span>💡</span>
                <span>Plain-Language Clinical Rationale</span>
              </div>
              <button type="button" (click)="toggleFlip(); $event.stopPropagation()"
                      class="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold uppercase transition">
                ✕ Flip Back
              </button>
            </div>

            <!-- Content Area -->
            <div class="p-4 sm:p-6 flex-1 flex flex-col justify-between font-sans leading-relaxed text-xs sm:text-sm">
              <div class="space-y-3">
                @if (plainText()) {
                  <p class="text-zinc-800 dark:text-zinc-200 font-medium">
                    {{ plainText() }}
                  </p>
                }
                <ng-content select="[card-back]"></ng-content>
              </div>

              <div class="pt-3 border-t border-emerald-800/40 font-mono text-[10px] text-emerald-400 flex items-center justify-between">
                <span>Cognitive Load Shield Active</span>
                <span>Double-click anytime to return</span>
              </div>
            </div>

          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .bg-primary-10 {
      background: rgba(104, 159, 56, 0.1);
    }
    .perspective-1000 {
      perspective: 1000px;
    }
    .transform-style-3d {
      transform-style: preserve-3d;
    }
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PocketGullCardComponent {
  private sanitizer = inject(DomSanitizer);

  title = input<string>();
  icon = input<string>('');
  personaBadge = input<string>('');
  neoTactile = input<boolean>(false);
  footer = input<boolean>(false);
  noPadding = input<boolean>(false);
  flippable = input<boolean>(false);
  plainText = input<string>('');

  readonly isFlipped = signal<boolean>(false);

  private lastFlipTime = 0;

  toggleFlip(event?: MouseEvent) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastFlipTime < 200) return;
    this.lastFlipTime = now;
    if (this.flippable()) {
      this.isFlipped.update(v => !v);
    }
  }

  iconHtml = computed(() => {
    const raw = this.icon();
    if (!raw) return '';
    let html: string;
    if (raw.includes('<')) {
      html = raw;
    } else {
      html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="${raw}"></path></svg>`;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });
}

