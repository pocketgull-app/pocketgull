import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationExportService, IClinicalSlideDeck } from '../services/presentation-export.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-presentation-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-zinc-950/95 text-zinc-100 border border-cyan-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Top Action Ribbon -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-xs">
            📽️
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              Grand Rounds & CARE Presentation Cockpit
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                1-Click PowerPoint / Google Docs Export
              </span>
            </h3>
            <p class="text-xs text-zinc-400">
              Transform clinical cases into academic slide decks, Google Docs case reports, and high-res vector figures.
            </p>
          </div>
        </div>

        <!-- Export Buttons -->
        <div class="flex items-center gap-2 flex-wrap">
          <button (click)="copyCareMarkdown()"
                  class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
            <span>{{ isCopiedMarkdown() ? '✓ Copied Markdown' : '📋 Copy Google Docs Report' }}</span>
          </button>
          <button (click)="downloadHtmlSlides()"
                  class="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm">
            <span>💾 Download HTML Slides</span>
          </button>
        </div>
      </div>

      <!-- Slide Carousel / Preview Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-mono uppercase font-bold text-zinc-400">
            Slide {{ activeSlideIndex() + 1 }} of {{ deck().slides.length }}: <span class="text-cyan-400">{{ activeSlide().category }}</span>
          </h4>
          <div class="flex items-center gap-2">
            <button (click)="prevSlide()" [disabled]="activeSlideIndex() === 0"
                    class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-xs font-mono font-bold transition cursor-pointer">
              ← Prev
            </button>
            <button (click)="nextSlide()" [disabled]="activeSlideIndex() === deck().slides.length - 1"
                    class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-xs font-mono font-bold transition cursor-pointer">
              Next →
            </button>
          </div>
        </div>

        <!-- Active Slide Viewer -->
        <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 min-h-[280px] flex flex-col justify-between shadow-lg">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400">
                SLIDE 0{{ activeSlide().slideNumber }} • {{ activeSlide().category.toUpperCase() }}
              </span>
              @if (activeSlide().keyMetricBadge; as badge) {
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" [class]="badge.colorClass">
                  {{ badge.label }}: {{ badge.value }}
                </span>
              }
            </div>
            
            <h3 class="text-lg font-black text-white mt-1">{{ activeSlide().title }}</h3>
            <div class="text-xs text-zinc-400 font-sans mb-3">{{ activeSlide().subtitle }}</div>

            <ul class="space-y-2 text-xs text-zinc-200">
              @for (bullet of activeSlide().bulletPoints; track bullet) {
                <li class="flex items-start gap-2">
                  <span class="text-cyan-400 font-bold">&bull;</span>
                  <span>{{ bullet }}</span>
                </li>
              }
            </ul>
          </div>

          <div class="pt-3 border-t border-zinc-800 text-[11px] font-mono text-cyan-300 italic">
            <strong>Socratic Grand Rounds Inquiry:</strong> {{ activeSlide().clinicalDiscussionPrompt }}
          </div>
        </div>

        <!-- Thumbnail Navigation Bar -->
        <div class="grid grid-cols-7 gap-2">
          @for (s of deck().slides; track s.slideNumber; let idx = $index) {
            <button (click)="activeSlideIndex.set(idx)"
                    [class.border-cyan-500]="activeSlideIndex() === idx"
                    [class.bg-cyan-950/40]="activeSlideIndex() === idx"
                    [class.border-zinc-800]="activeSlideIndex() !== idx"
                    [class.bg-zinc-900]="activeSlideIndex() !== idx"
                    class="p-2 rounded-xl border text-center transition cursor-pointer hover:border-cyan-500/60">
              <span class="text-[10px] font-mono font-bold block text-zinc-400">0{{ s.slideNumber }}</span>
              <span class="text-[9px] font-mono font-black truncate block text-zinc-300">{{ s.category }}</span>
            </button>
          }
        </div>
      </div>

    </div>
  `
})
export class PresentationModalComponent {
  private exportService = inject(PresentationExportService);
  private patientState = inject(PatientStateService, { optional: true });

  activeSlideIndex = signal<number>(0);
  isCopiedMarkdown = signal<boolean>(false);

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/92', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  deck = computed<IClinicalSlideDeck>(() => {
    return this.exportService.generateGrandRoundsDeck(this.currentPatient());
  });

  activeSlide = computed(() => {
    const slides = this.deck().slides;
    const idx = Math.min(Math.max(0, this.activeSlideIndex()), slides.length - 1);
    return slides[idx];
  });

  nextSlide(): void {
    if (this.activeSlideIndex() < this.deck().slides.length - 1) {
      this.activeSlideIndex.update(i => i + 1);
    }
  }

  prevSlide(): void {
    if (this.activeSlideIndex() > 0) {
      this.activeSlideIndex.update(i => i - 1);
    }
  }

  copyCareMarkdown(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.deck().careCaseReportMarkdown);
      this.isCopiedMarkdown.set(true);
      setTimeout(() => this.isCopiedMarkdown.set(false), 3000);
    }
  }

  downloadHtmlSlides(): void {
    if (typeof window === 'undefined') return;
    const blob = new Blob([this.deck().rawHtmlPresentation], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grand_Rounds_${this.currentPatient().id || 'p001'}_Presentation.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
