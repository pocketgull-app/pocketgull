import { Component, ChangeDetectionStrategy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocDrillService, DocDrillPersona } from '../../services/doc-drill.service';
import { NavigationShellService } from '../../services/navigation-shell.service';

@Component({
  selector: 'app-doc-drill-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (docDrill.isOpen()) {
      <aside 
        class="fixed bottom-4 right-4 z-[99999] w-[460px] max-w-[calc(100vw-2rem)] max-h-[82vh] flex flex-col rounded-3xl bg-zinc-950/95 backdrop-blur-2xl border border-teal-500/30 shadow-2xl shadow-black/90 overflow-hidden text-zinc-100 transition-all duration-350 ease-[cubic-bezier(0.05,0.7,0.1,1.0)] animate-in slide-in-from-bottom-6 zoom-in-95"
        [class.parasympathetic-breathing]="docDrill.persona() === 'patient'"
        role="region"
        aria-label="Doc Drill Evidence Focus Drawer"
        aria-live="polite">
        
        <!-- M3 Side Sheet Header (Surface Container High) -->
        <header class="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 text-sm shrink-0 font-bold shadow-inner">
              🔬
            </div>
            <div class="min-w-0">
              <span class="block text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 truncate">Doc Drill • M3 Clinical Sheet</span>
              <h3 class="text-xs font-bold text-zinc-100 truncate">{{ docDrill.currentTitle() }}</h3>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Category Badge (M3 Assist Chip Style) -->
            <span class="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30">
              {{ docDrill.currentCategory() }}
            </span>
            <!-- Close Button with Fitts's Law 44px Accessible Touch Target -->
            <button 
              type="button" 
              (click)="docDrill.close()"
              aria-label="Close Evidence Focus Drawer"
              class="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none transition cursor-pointer text-base">
              ✕
            </button>
          </div>
        </header>

        <!-- M3 Segmented Button & Citation Bar -->
        <div class="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/60 text-[11px] shrink-0 gap-2">
          <!-- M3 Segmented Button -->
          <div class="inline-flex p-0.5 rounded-xl bg-zinc-900 border border-zinc-700/60 text-[11px] font-bold shrink-0">
            <button 
              type="button"
              (click)="docDrill.setPersona('clinician')"
              [class.bg-teal-400]="docDrill.persona() === 'clinician'"
              [class.text-[#003731]]="docDrill.persona() === 'clinician'"
              [class.shadow-sm]="docDrill.persona() === 'clinician'"
              [class.text-zinc-400]="docDrill.persona() !== 'clinician'"
              class="min-h-[36px] px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none">
              <span>👨‍⚕️</span> Clinician
            </button>
            <button 
              type="button"
              (click)="docDrill.setPersona('patient')"
              [class.bg-teal-400]="docDrill.persona() === 'patient'"
              [class.text-[#003731]]="docDrill.persona() === 'patient'"
              [class.shadow-sm]="docDrill.persona() === 'patient'"
              [class.text-zinc-400]="docDrill.persona() !== 'patient'"
              class="min-h-[36px] px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none">
              <span>🌱</span> Patient
            </button>
          </div>

          <!-- Formula / Standard Indicator (M3 Tonal Label) -->
          <div class="text-[10px] font-mono text-amber-400/95 truncate max-w-[210px] text-right" [title]="docDrill.activeTopic()?.formulaOrStandard || docDrill.currentCitation()">
            {{ docDrill.activeTopic()?.formulaOrStandard || docDrill.currentCitation() }}
          </div>
        </div>

        <!-- Main Body Content Area (M3 Surface Container) -->
        <div class="flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-zinc-200 space-y-3 custom-scrollbar">
          <!-- Foundational Topic Synthesis (M3 Elevated Card) -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm" [innerHTML]="docDrill.currentBrief()"></div>

          <!-- M3 Clinical Decision Support & Care Plan Conversion Bridge -->
          <div class="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-zinc-900/80 to-zinc-900/90 border border-teal-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div class="min-w-0">
              @if (docDrill.persona() === 'clinician') {
                <div class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  PocketGull Pro • Clinical Co-Pilot
                </div>
                <div class="text-[11px] text-zinc-300 mt-0.5">Stream Gemini Live audio consult & cross-check patient vitals</div>
              } @else {
                <div class="text-[10.5px] font-mono font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  Personalized Care Plan
                </div>
                <div class="text-[11px] text-zinc-300 mt-0.5">Discuss this biomarker with a verified functional clinician</div>
              }
            </div>
            <button
              type="button"
              (click)="onConsultCta()"
              class="min-h-[38px] px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-teal-400 text-[#003731] hover:bg-teal-300 active:scale-95 transition cursor-pointer shrink-0 shadow-md flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none">
              @if (docDrill.persona() === 'clinician') {
                <span>🎙️</span> Launch Consult
              } @else {
                <span>📅</span> Book Review
              }
            </button>
          </div>

          <!-- Q&A Conversation Stream -->
          @for (msg of docDrill.messages(); track msg.id) {
            @if (msg.sender === 'user') {
              <div class="flex justify-end">
                <div class="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-xs bg-teal-400 text-[#003731] font-semibold text-xs shadow-sm">
                  {{ msg.content }}
                </div>
              </div>
            } @else {
              <div class="flex justify-start">
                <div class="max-w-[95%] p-3.5 rounded-2xl rounded-tl-xs bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs shadow-sm" [innerHTML]="msg.content">
                </div>
              </div>
            }
          }

          <!-- Thinking Spinner -->
          @if (docDrill.isThinking()) {
            <div class="flex items-center gap-1.5 py-2 justify-center text-teal-400 text-xs font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
              <span class="ml-1 text-[10px] uppercase tracking-wider text-zinc-400">Socratic Synthesis...</span>
            </div>
          }
        </div>

        <!-- M3 Assistive Suggestion Chips -->
        @if (docDrill.currentChips().length > 0) {
          <div class="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/60 border-t border-zinc-800/70 overflow-x-auto no-scrollbar shrink-0">
            @for (chip of docDrill.currentChips(); track chip) {
              <button 
                type="button"
                (click)="onChipClick(chip)"
                class="min-h-[32px] px-3 py-1 rounded-lg text-[10.5px] font-mono text-teal-300 bg-zinc-900/90 border border-zinc-700/60 hover:border-teal-400/80 hover:bg-teal-500/15 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none transition whitespace-nowrap cursor-pointer shrink-0">
                {{ chip }}
              </button>
            }
          </div>
        }

        <!-- Interactive Question Input Bar with 44px Touch Targets -->
        <footer class="p-3 bg-zinc-900/90 border-t border-zinc-800 shrink-0">
          <form (submit)="onSubmitQuestion($event)" class="flex items-center gap-2">
            <input 
              type="text"
              name="drillInput"
              [(ngModel)]="questionText"
              placeholder="Ask a clinical, mathematical, or health question..."
              class="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400 transition"
              aria-label="Follow-up Socratic query input" />
            <button 
              type="submit"
              [disabled]="!questionText.trim()"
              aria-label="Send query"
              class="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-teal-400 text-[#003731] flex items-center justify-center font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none transition cursor-pointer shrink-0">
              ➔
            </button>
          </form>
        </footer>
      </aside>
    }
  `,
  styles: [`
    /* Rachel Nabors Ethical Motion: 0.1 Hz Parasympathetic Calming Breathing Glow (10-second cycle) */
    @keyframes parasympatheticBreathing {
      0%, 100% {
        box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.25), 0 20px 50px rgba(0, 0, 0, 0.7);
      }
      40% {
        box-shadow: 0 0 0 2.5px rgba(20, 184, 166, 0.6), 0 20px 60px rgba(20, 184, 166, 0.15);
      }
    }

    .parasympathetic-breathing {
      animation: parasympatheticBreathing 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .parasympathetic-breathing {
        animation: none !important;
      }
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  `]
})
export class DocDrillDrawerComponent {
  readonly docDrill = inject(DocDrillService);
  private readonly navShell = inject(NavigationShellService);
  questionText: string = '';

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.docDrill.isOpen()) {
      this.docDrill.close();
    }
  }

  onChipClick(chip: string): void {
    this.docDrill.askQuestion(chip);
  }

  onSubmitQuestion(event: Event): void {
    event.preventDefault();
    if (!this.questionText.trim()) return;

    const query = this.questionText;
    this.questionText = '';
    this.docDrill.askQuestion(query);
  }

  onConsultCta(): void {
    if (this.docDrill.persona() === 'clinician') {
      this.navShell.selectTab('analysis');
      this.docDrill.close();
    } else {
      this.navShell.selectTab('chart');
      this.docDrill.close();
    }
  }
}
