import { Component, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NeuroBionicReaderService, ReaderAvsMode } from '../services/neuro-bionic-reader.service';

@Component({
  selector: 'app-neuro-bionic-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded-2xl border border-amber-500/25 bg-zinc-950/90 p-5 space-y-5 backdrop-blur-md shadow-2xl">
      <!-- 1. Header Toolbar: Book Selector, AVS Mode, Bionic Toggle -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">{{ currentBook()?.coverEmoji || '📖' }}</span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-black uppercase tracking-widest text-amber-400">
                Neuro-Bionic RSVP Speed Reader
              </h3>
              <span class="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gutenberg Codex
              </span>
            </div>
            <p class="text-[10px] text-zinc-400 font-medium">
              {{ currentBook()?.title }} · {{ currentBook()?.author }}
            </p>
          </div>
        </div>

        <!-- Book Selector Dropdown & Custom Ingest Button -->
        <div class="flex items-center gap-2">
          <select [ngModel]="reader.selectedBookId()"
                  (ngModelChange)="reader.selectBook($event)"
                  class="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500">
            @for (b of reader.books; track b.id) {
              <option [value]="b.id">{{ b.coverEmoji }} {{ b.title }} ({{ b.wordCount }}w)</option>
            }
            <option value="custom">✏️ Custom Ingested Text...</option>
          </select>

          <button (click)="isCustomModalOpen.set(true)"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold tracking-wider transition-all border border-zinc-700 cursor-pointer">
            Paste Book
          </button>
        </div>
      </div>

      <!-- 2. Master Foveal Reticle HUD (Center Fixation Point) -->
      <div class="relative w-full h-44 rounded-xl bg-black/95 border-2 border-amber-500/30 overflow-hidden flex flex-col items-center justify-center shadow-inner">
        <!-- Vertical Foveal Optimal Recognition Point (ORP) Crosshair Alignment Guides -->
        <div class="absolute top-0 w-0.5 h-3.5 bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
        <div class="absolute bottom-0 w-0.5 h-3.5 bg-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>

        <!-- Subtle Foveal Target Grid Lines -->
        <div class="absolute inset-x-0 h-px bg-amber-500/10"></div>
        <div class="absolute inset-y-0 w-px bg-amber-500/10"></div>

        <!-- Live Word Projection with Foveal ORP Anchor -->
        <div class="relative z-10 flex items-baseline font-mono text-3xl sm:text-4xl select-none">
          <!-- Prefix (Bionic-Bolded Leading Characters) -->
          <span class="text-right inline-block text-white font-extrabold tracking-normal">
            {{ currentToken().prefix }}
          </span>

          <!-- ORP Anchor Character (Illuminated Golden Amber Center) -->
          <span class="text-amber-400 font-black scale-110 inline-block drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] underline decoration-amber-500/50 underline-offset-4">
            {{ currentToken().orpChar }}
          </span>

          <!-- Suffix (Trailing Autocomplete Characters) -->
          <span class="text-left inline-block text-zinc-400 font-normal tracking-normal">
            {{ currentToken().suffix }}
          </span>
        </div>

        <!-- Dynamic Cadence HUD Badge -->
        <div class="absolute bottom-2 left-3 flex items-center gap-2 text-[9px] font-mono text-zinc-500">
          <span>Word {{ reader.currentWordIndex() + 1 }} / {{ reader.tokens().length }}</span>
          <span>·</span>
          <span>{{ reader.estimatedMinutesRemaining() }}m left</span>
        </div>

        <div class="absolute bottom-2 right-3 flex items-center gap-1 text-[9px] font-mono text-amber-400/80">
          <span class="w-1.5 h-1.5 rounded-full" [class.bg-amber-400]="reader.isPlaying()" [class.bg-zinc-600]="!reader.isPlaying()"></span>
          <span>AVS {{ avsModeLabel(reader.avsMode()) }}</span>
        </div>
      </div>

      <!-- 3. Speed Slider & Quick Preset Pills -->
      <div class="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-zinc-300">Reading Velocity:</span>
            <span class="text-base font-mono font-black text-amber-400">{{ reader.wpm() }} WPM</span>
            <span class="text-[10px] text-zinc-500">({{ msPerWord() }} ms / word)</span>
          </div>

          <!-- Quick Speed Presets -->
          <div class="flex items-center gap-1">
            @for (speed of [250, 400, 600, 800, 1000]; track speed) {
              <button (click)="reader.setWpm(speed)"
                      [class.bg-amber-500]="reader.wpm() === speed"
                      [class.text-black]="reader.wpm() === speed"
                      [class.bg-zinc-800]="reader.wpm() !== speed"
                      [class.text-zinc-300]="reader.wpm() !== speed"
                      class="px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer">
                {{ speed }}
              </button>
            }
          </div>
        </div>

        <input type="range"
               [min]="150"
               [max]="1200"
               [step]="25"
               [ngModel]="reader.wpm()"
               (ngModelChange)="reader.setWpm($event)"
               class="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
      </div>

      <!-- 4. Playback Controls & Progress Scrubber -->
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3">
          <!-- Rewind 15 words -->
          <button (click)="reader.rewind(15)"
                  class="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-zinc-800 cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"/></svg>
            -15w
          </button>

          <!-- Primary Play/Pause Button -->
          <button (click)="reader.togglePlay()"
                  [class.bg-amber-500]="!reader.isPlaying()"
                  [class.text-black]="!reader.isPlaying()"
                  [class.bg-red-500]="reader.isPlaying()"
                  [class.text-white]="reader.isPlaying()"
                  class="flex-1 py-3 rounded-xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer">
            @if (reader.isPlaying()) {
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
              <span>Pause Reader (Space)</span>
            } @else {
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <span>Engage RSVP Stream ({{ reader.wpm() }} WPM)</span>
            }
          </button>

          <!-- Forward 15 words -->
          <button (click)="reader.stepForward(15)"
                  class="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-zinc-800 cursor-pointer">
            +15w
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/></svg>
          </button>
        </div>

        <!-- Progress Scrubber -->
        <div class="flex items-center gap-2 pt-1">
          <input type="range"
                 [min]="0"
                 [max]="reader.tokens().length - 1"
                 [ngModel]="reader.currentWordIndex()"
                 (ngModelChange)="reader.seekToIndex($event)"
                 class="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
          <span class="text-[10px] font-mono text-zinc-400 w-10 text-right">
            {{ reader.progressPercentage() }}%
          </span>
        </div>
      </div>

      <!-- 5. AVS Brainwave Entrainment & Sensory Coupling -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">AVS Sub-Carrier:</span>
          @for (m of avsModes; track m.id) {
            <button (click)="reader.setAvsMode(m.id)"
                    [class.bg-amber-500/20]="reader.avsMode() === m.id"
                    [class.text-amber-300]="reader.avsMode() === m.id"
                    [class.border-amber-500/40]="reader.avsMode() === m.id"
                    [class.bg-zinc-900]="reader.avsMode() !== m.id"
                    [class.text-zinc-400]="reader.avsMode() !== m.id"
                    [class.border-zinc-800]="reader.avsMode() !== m.id"
                    class="px-2 py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer">
              {{ m.label }}
            </button>
          }
        </div>

        <button (click)="showContextDrawer.set(!showContextDrawer())"
                class="text-[10px] font-bold text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer">
          <span>{{ showContextDrawer() ? 'Hide Full Text' : 'View Full Bionic Prose' }}</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
      </div>

      <!-- 6. Synchronized Full Bionic Prose Drawer -->
      @if (showContextDrawer()) {
        <div class="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs leading-relaxed text-zinc-300 space-y-2 max-h-60 overflow-y-auto font-sans">
          <div class="text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-zinc-800 pb-1">
            Synchronized Bionic Context View
          </div>
          <p class="whitespace-pre-line select-text" [innerHTML]="formattedBionicParagraph()"></p>
        </div>
      }

      <!-- Custom Ingest Modal -->
      @if (isCustomModalOpen()) {
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-zinc-900 border border-amber-500/30 rounded-2xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
            <h4 class="text-sm font-black uppercase text-amber-400 tracking-wider">
              Ingest Custom Gutenberg / EPUB / Article Text
            </h4>
            <textarea [(ngModel)]="customTextInput"
                      rows="7"
                      placeholder="Paste any book excerpt, PubMed abstract, or clinical guide here..."
                      class="w-full bg-black/60 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-sans"></textarea>
            <div class="flex justify-end gap-2">
              <button (click)="isCustomModalOpen.set(false)"
                      class="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
              <button (click)="applyCustomText()"
                      class="px-4 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-black tracking-wider uppercase cursor-pointer">
                Load & Speed Read
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class NeuroBionicReaderComponent {
  readonly reader = inject(NeuroBionicReaderService);

  readonly showContextDrawer = signal<boolean>(false);
  readonly isCustomModalOpen = signal<boolean>(false);
  customTextInput = '';

  readonly avsModes: { id: ReaderAvsMode; label: string }[] = [
    { id: 'gamma40', label: '⚡ 40 Hz Gamma' },
    { id: 'beta18', label: '🎯 18 Hz Beta' },
    { id: 'smr14', label: '🧘 14 Hz SMR' },
    { id: 'silent', label: '🤫 Silent' }
  ];

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.code === 'Space' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
      event.preventDefault();
      this.reader.togglePlay();
    } else if (event.code === 'ArrowLeft') {
      event.preventDefault();
      this.reader.rewind(15);
    } else if (event.code === 'ArrowRight') {
      event.preventDefault();
      this.reader.stepForward(15);
    }
  }

  currentBook() {
    return this.reader.books.find(b => b.id === this.reader.selectedBookId());
  }

  currentToken() {
    return this.reader.currentToken();
  }

  msPerWord(): number {
    return Math.round((60 / this.reader.wpm()) * 1000);
  }

  avsModeLabel(mode: ReaderAvsMode): string {
    switch (mode) {
      case 'gamma40': return '40 Hz Gamma Binding';
      case 'beta18': return '18 Hz Beta Focus';
      case 'smr14': return '14 Hz SMR Sensorimotor';
      case 'theta5': return '5.5 Hz Theta Flow';
      case 'silent': return 'Acoustic Off';
    }
  }

  formattedBionicParagraph(): string {
    const book = this.currentBook();
    const text = book ? book.text : this.reader.customText();
    if (!text) return '';

    // Convert raw prose into bionic formatted HTML
    return text.replace(/\b([a-zA-Z0-9]+)\b/g, (word) => {
      const boldLen = Math.max(1, Math.ceil(word.length * 0.45));
      const bold = word.slice(0, boldLen);
      const rest = word.slice(boldLen);
      return `<strong class="text-amber-400 font-extrabold">${bold}</strong>${rest}`;
    });
  }

  applyCustomText(): void {
    if (this.customTextInput.trim()) {
      this.reader.loadCustomText(this.customTextInput.trim());
      this.isCustomModalOpen.set(false);
      this.customTextInput = '';
    }
  }
}
