import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureStorageService } from '../services/secure-storage.service';
import { YbocsService } from '../services/ybocs/ybocs.service';
import { symptomCategories, symptomItems, severityQuestions } from '../services/ybocs/data';
import { SymptomItem } from '../services/ybocs/types';

@Component({
  selector: 'app-ybocs-screener',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-300">
      <!-- Top Overview Summary Header Card -->
      <div class="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Clinical Protocol</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-850">
              Y-BOCs Diagnostic Suite
            </span>
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Yale-Brown Obsessive-Compulsive Scale</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
            The gold standard clinical instrument for assessing the presence, type, and severity of obsessive-compulsive symptoms.
          </p>
        </div>

        <div class="flex flex-col items-center shrink-0 p-4 bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-2xl w-full md:w-56 text-center shadow-inner">
          <span class="text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">{{ ybocs.totalScore() }}<span class="text-sm font-normal text-zinc-400">/40</span></span>
          <div class="mt-2 w-full">
            <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300 w-full justify-center" [class]="ybocs.severityDetails().color">
              {{ ybocs.severityDetails().name }}
            </span>
          </div>
          <div class="mt-3 flex gap-4 text-[10px] text-zinc-400 font-mono">
            <div>OBS: <span class="font-bold text-zinc-600 dark:text-zinc-300">{{ ybocs.obsessionSubtotal() }}/20</span></div>
            <div class="w-px h-3 bg-zinc-200 dark:bg-zinc-800"></div>
            <div>COMP: <span class="font-bold text-zinc-600 dark:text-zinc-300">{{ ybocs.compulsiveSubtotal() }}/20</span></div>
          </div>
        </div>
      </div>

      <!-- Action Control Row -->
      <div class="flex flex-wrap gap-3">
        <button (click)="saveAssessmentToTimeline()"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>💾 Commit Assessment to FHIR Timeline</span>
        </button>

        <button (click)="triggerMindfulMacawVoiceInterview()"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>🎙️ Voice-First Interview</span>
        </button>
        
        <button (click)="openSomaticGroundingMode()"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>🧘 Somatic Grounding Loop</span>
        </button>

        <button (click)="ybocs.resetAssessment()"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs transition active:scale-95 cursor-pointer">
          <span>🗑️ Reset Form</span>
        </button>
      </div>

      @if (saveSuccessMessage()) {
        <div class="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>✅ {{ saveSuccessMessage() }}</span>
          <button (click)="saveSuccessMessage.set(null)" class="text-xs text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      }

      <!-- Main Columns: Checklist vs Severity -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Checklist Lenses (8 cols) -->
        <div class="lg:col-span-7 flex flex-col gap-5">
          <div class="flex border-b border-zinc-250 dark:border-zinc-850">
            <button (click)="activeChecklistTab.set('obsessions')"
              [class.border-b-2]="activeChecklistTab() === 'obsessions'"
              [class.border-violet-600]="activeChecklistTab() === 'obsessions'"
              [class.text-violet-600]="activeChecklistTab() === 'obsessions'"
              [class.text-zinc-400]="activeChecklistTab() !== 'obsessions'"
              class="pb-2.5 px-4 font-bold uppercase tracking-widest text-[11px] outline-none">
              Obsessions Checklist
            </button>
            <button (click)="activeChecklistTab.set('compulsions')"
              [class.border-b-2]="activeChecklistTab() === 'compulsions'"
              [class.border-violet-600]="activeChecklistTab() === 'compulsions'"
              [class.text-violet-600]="activeChecklistTab() === 'compulsions'"
              [class.text-zinc-400]="activeChecklistTab() !== 'compulsions'"
              class="pb-2.5 px-4 font-bold uppercase tracking-widest text-[11px] outline-none">
              Compulsions Checklist
            </button>
          </div>

          <div class="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
            @for (cat of activeCategories(); track cat.id) {
              <div class="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs">
                <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">
                  {{ cat.name }}
                </h3>

                <div class="flex flex-col gap-2">
                  @for (item of getItemsByCategory(cat.id); track item.id) {
                    <div class="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                      <div class="flex-1 min-w-0 pr-4">
                        <p class="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate-2-lines">{{ item.text }}</p>
                        @if (item.examples) {
                          <p class="text-[10px] text-zinc-400 dark:text-zinc-550 leading-normal mt-0.5 italic">{{ item.examples }}</p>
                        }
                      </div>

                      <div class="flex items-center gap-2 shrink-0 font-sans">
                        <!-- Past Checkbox -->
                        <button (click)="ybocs.toggleChecklist(item.id, 'past')"
                          [class.bg-zinc-850]="hasAnswer(item.id, 'past')"
                          [class.dark:bg-zinc-100]="hasAnswer(item.id, 'past')"
                          [class.text-white]="hasAnswer(item.id, 'past')"
                          [class.dark:text-zinc-950]="hasAnswer(item.id, 'past')"
                          [class.border-zinc-300]="!hasAnswer(item.id, 'past')"
                          [class.dark:border-zinc-700]="!hasAnswer(item.id, 'past')"
                          class="px-2 py-1 text-[9px] uppercase tracking-wider font-extrabold border rounded-md transition active:scale-95">
                          Past
                        </button>
                        
                        <!-- Current Checkbox -->
                        <button (click)="ybocs.toggleChecklist(item.id, 'current')"
                          [class.bg-violet-600]="hasAnswer(item.id, 'current')"
                          [class.text-white]="hasAnswer(item.id, 'current')"
                          [class.border-zinc-300]="!hasAnswer(item.id, 'current')"
                          [class.dark:border-zinc-700]="!hasAnswer(item.id, 'current')"
                          class="px-2 py-1 text-[9px] uppercase tracking-wider font-extrabold border rounded-md transition active:scale-95">
                          Current
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: Severity Questions (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          <div class="pb-2.5 border-b border-zinc-250 dark:border-zinc-850">
            <h3 class="font-bold uppercase tracking-widest text-[11px] text-zinc-800 dark:text-zinc-200">Severity Rating Scale</h3>
          </div>

          <div class="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
            @for (q of questions; track q.id) {
              <div [attr.data-question-id]="q.id" class="p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs flex flex-col gap-3">
                <div>
                  <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans">{{ q.title }}</h4>
                  <p class="text-[10px] text-zinc-400 dark:text-zinc-550 leading-relaxed mt-0.5">{{ q.subtitle }}</p>
                </div>

                <!-- 0-4 options cards -->
                <div class="flex flex-col gap-1.5 font-sans">
                  @for (opt of q.options; track opt.score) {
                    <button (click)="ybocs.setSeverityScore(q.id, opt.score)"
                      [class.bg-violet-50\/40]="getSelectedScore(q.id) === opt.score"
                      [class.border-violet-400]="getSelectedScore(q.id) === opt.score"
                      [class.dark:bg-violet-950\/15]="getSelectedScore(q.id) === opt.score"
                      [class.dark:border-violet-850]="getSelectedScore(q.id) === opt.score"
                      [class.border-zinc-200]="getSelectedScore(q.id) !== opt.score"
                      [class.dark:border-zinc-850]="getSelectedScore(q.id) !== opt.score"
                      class="flex items-start text-left p-2 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition text-xs">
                      
                      <!-- Radio dot indicator -->
                      <span class="w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 mr-2.5 mt-0.5"
                        [class.border-violet-600]="getSelectedScore(q.id) === opt.score"
                        [class.border-zinc-300]="getSelectedScore(q.id) !== opt.score"
                        [class.dark:border-zinc-700]="getSelectedScore(q.id) !== opt.score">
                        @if (getSelectedScore(q.id) === opt.score) {
                          <span class="w-1.5 h-1.5 rounded-sm bg-violet-600"></span>
                        }
                      </span>

                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                          <span class="font-bold text-zinc-800 dark:text-zinc-200 leading-none">{{ opt.label }}</span>
                          <span class="text-[10px] font-mono text-zinc-400 leading-none">Score: {{ opt.score }}</span>
                        </div>
                        <p class="text-[9.5px] text-zinc-400 dark:text-zinc-550 leading-normal mt-1">{{ opt.desc }}</p>
                      </div>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .truncate-2-lines {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class YbocsScreenerComponent {
  readonly ybocs = inject(YbocsService);
  private secureStorage = inject(SecureStorageService);

  readonly activeChecklistTab = signal<'obsessions' | 'compulsions'>('obsessions');
  readonly saveSuccessMessage = signal<string | null>(null);

  readonly categories = symptomCategories;
  readonly items = symptomItems;
  readonly questions = severityQuestions;

  saveAssessmentToTimeline() {
    this.ybocs.saveCurrentAssessment();
    const score = this.ybocs.totalScore();
    const severity = this.ybocs.severityDetails().name;
    this.saveSuccessMessage.set(`Y-BOCs Assessment (Score: ${score}/40 — ${severity}) committed to Patient FHIR Timeline & LocalStorage.`);
    setTimeout(() => {
      this.saveSuccessMessage.set(null);
    }, 6000);
  }

  readonly activeCategories = computed(() => {
    const isObs = this.activeChecklistTab() === 'obsessions';
    return this.categories.filter(c => c.isObsession === isObs);
  });

  getItemsByCategory(categoryId: string): SymptomItem[] {
    return this.items.filter(item => item.category === categoryId);
  }

  hasAnswer(itemId: number, type: 'past' | 'current'): boolean {
    const ans = this.ybocs.checklistAnswers();
    return !!ans[itemId]?.[type];
  }

  getSelectedScore(questionId: number): number | undefined {
    return this.ybocs.severityAnswers()[questionId];
  }

  triggerMindfulMacawVoiceInterview() {
    // We will broadcast an event or interact with the VoiceAssistantComponent to activate "Mindful Macaw"
    const btn = document.querySelector('button[aria-label="Toggle Live Agent"]') as HTMLButtonElement;
    if (btn) {
      // If voice panel is not open, open it
      btn.click();
    }
    // Set a flag in session state or storage that redirects voice assistant to Y-BOCs screener mode
    this.secureStorage.setItem('voice_assistant_mode', 'ybocs');
    // Dispatch a custom event to notify VoiceAssistantComponent instantly
    window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'ybocs' }));
  }

  openSomaticGroundingMode() {
    // Dispatch event to activate Somatic Grounding Mode in the 3D Skelly viewer
    window.dispatchEvent(new CustomEvent('somatic-grounding-activate'));
  }
}
