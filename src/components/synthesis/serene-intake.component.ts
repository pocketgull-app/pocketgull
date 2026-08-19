import { Component, ChangeDetectionStrategy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdaptiveIntakeService, IIntakeAnalysisResult, ISocraticQuestion, IDoctorConsultQuestion } from '../../services/adaptive-intake.service';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';
import { DictationService } from '../../services/dictation.service';

interface IIntakePreset {
  title: string;
  icon: string;
  category: string;
  narrative: string;
}

@Component({
  selector: 'app-serene-intake',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-4 sm:p-6 my-4">
      <!-- Glow ambient backdrop -->
      <div class="absolute -top-20 -left-20 w-72 h-72 bg-sky-500/10 dark:bg-sky-500/5 blur-3xl rounded-full pointer-events-none"></div>
      <div class="absolute -bottom-20 -right-20 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div class="w-full relative z-10 space-y-6">
        <!-- Header & Philosophy Banner -->
        <div class="text-center space-y-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest">
            <span>✨ Socratic Patient Intake & Voice Ingestion</span>
            <span class="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">Calgary-Cambridge FIFE</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            What is on your mind today?
          </h2>
          <p class="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Speak freely or paste your symptoms, daily routines, or concerns. Pocket-Gull distills root causes, identifies ergonomic strains, and prepares empowering questions for your doctor.
          </p>
        </div>

        <!-- Audience Mode & Fast Presets Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <!-- Preset Starter Chips -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mr-1">Quick Scenarios:</span>
            @for (preset of presets; track preset.title) {
              <button
                type="button"
                (click)="applyPreset(preset)"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1 active:scale-95">
                <span>{{ preset.icon }}</span>
                <span>{{ preset.title }}</span>
              </button>
            }
          </div>

          <!-- Audience View Switcher -->
          <button
            type="button"
            (click)="themeService.setAnalogyLensMode(isPlainLanguage() ? 'clinical' : 'coach')"
            class="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border shadow-xs flex items-center gap-1.5 ml-auto"
            [class]="isPlainLanguage() ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'">
            <span>{{ isPlainLanguage() ? '🏡 Patient & Family View' : '🩺 Clinician Deep-Dive' }}</span>
            <span class="text-[9px] opacity-80">(Switch)</span>
          </button>
        </div>

        <!-- Main Narrative Input Box -->
        <div class="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-700/60 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-emerald-500/50">
          <textarea
            [(ngModel)]="inputText"
            (ngModelChange)="onTextChange($event)"
            rows="5"
            class="w-full p-6 sm:p-7 bg-transparent text-base sm:text-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 border-none outline-hidden resize-y font-normal leading-relaxed"
            placeholder="Type or dictate your story (e.g. 'Coding 10 hours a day for 3 weeks, intense neck stiffness, dry eyes from monitors, afternoon brain fog, and waking up unrefreshed...')"></textarea>

          <!-- Input Action Toolbar -->
          <div class="flex flex-wrap items-center justify-between px-6 py-3.5 bg-zinc-50/80 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 gap-3">
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="toggleVoiceInput()"
                class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs"
                [class]="isListening() ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>{{ isListening() ? 'Listening... (Stop)' : 'Voice Dictate' }}</span>
              </button>

              @if (inputText()) {
                <button
                  type="button"
                  (click)="clearInput()"
                  class="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium cursor-pointer">
                  Clear
                </button>
              }
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="!inputText()"
                (click)="synthesizeNow()"
                class="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-wider text-xs transition-all hover:scale-102 active:scale-98 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shadow-md">
                <span>Distill Clinical Signal</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ══ ANALYSIS RESULTS DASHBOARD ═══════════════════════════════════════ -->
        @if (analysisResult(); as analysis) {
          @if (analysis.narrative) {
            <div class="space-y-6 animate-in fade-in zoom-in-95 duration-400">
              
              <!-- Red Flag Alert Banner -->
              @if (analysis.redFlagAlerts.length > 0) {
                <div class="p-4 rounded-2xl bg-rose-600/10 border-2 border-rose-500/40 text-rose-800 dark:text-rose-200 space-y-2">
                  <div class="flex items-center gap-2 font-extrabold text-sm uppercase tracking-wider">
                    <span>⚠️ Urgent Clinical Notice</span>
                  </div>
                  <ul class="list-disc list-inside text-xs space-y-1 font-medium">
                    @for (alert of analysis.redFlagAlerts; track alert) {
                      <li>{{ alert }}</li>
                    }
                  </ul>
                </div>
              }

              <!-- Clinical Entities & Extracted SNOMED Terminology Strip -->
              <div class="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-2">
                  <div>
                    <span class="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      Chief Concern & Timeline:
                    </span>
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {{ analysis.chiefConcern }} <span class="text-xs font-normal text-zinc-500 dark:text-zinc-400 font-mono">({{ analysis.duration }})</span>
                    </h3>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                      USCDI v4 & FHIR R4 Ready
                    </span>
                  </div>
                </div>

                <!-- Extracted Entities Badges -->
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Entities Detected:</span>
                  @for (entity of analysis.extractedEntities; track entity.text) {
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                      [class]="entity.category === 'ergonomic' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                               entity.category === 'tcm_pattern' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                               entity.category === 'ayurvedic_dosha' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' :
                               entity.category === 'sdoh_barrier' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                               'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30'">
                      <span>{{ entity.text }}</span>
                      @if (entity.snomedCode) {
                        <span class="text-[9px] font-mono opacity-80 font-bold bg-white/50 dark:bg-black/30 px-1 rounded">
                          {{ entity.icd10Code || entity.snomedCode }}
                        </span>
                      }
                    </div>
                  }
                </div>

                <!-- Recommended Clinical Questionnaires -->
                <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <span class="font-bold text-zinc-500 dark:text-zinc-400">Recommended Assessments:</span>
                  @for (inst of analysis.recommendedAssessments; track inst) {
                    <span class="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-medium border border-zinc-200 dark:border-zinc-700">
                      📋 {{ inst }}
                    </span>
                  }
                </div>
              </div>

              <!-- 2-Column Grid: Socratic Inquiries & Doctor Questions -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <!-- Column 1: Socratic Clarifying Questions (Calgary-Cambridge FIFE) -->
                <div class="p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-md space-y-4">
                  <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">🎯</span>
                      <div>
                        <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                          Socratic Follow-Up Inquiries
                        </h4>
                        <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {{ isPlainLanguage() ? 'Tap an answer to deepen your care plan' : 'Calgary-Cambridge FIFE & Ergonomic Clarification' }}
                        </p>
                      </div>
                    </div>
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                      {{ analysis.socraticQuestions.length }} Inquiries
                    </span>
                  </div>

                  <div class="space-y-4">
                    @for (q of analysis.socraticQuestions; track q.id; let idx = $index) {
                      <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-2.5 transition-all hover:border-emerald-500/40">
                        <div class="flex items-start justify-between gap-2">
                          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
                            [class]="q.importance === 'critical' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300' :
                                     q.importance === 'high' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                                     'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'">
                            #{{ idx + 1 }} {{ q.category.replace('FIFE_', 'FIFE: ').replace('_', ' ') }}
                          </span>
                          <span class="text-[10px] text-zinc-400 font-mono">{{ q.rationale }}</span>
                        </div>

                        <p class="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                          {{ isPlainLanguage() ? q.questionPatient : q.questionClinician }}
                        </p>

                        <!-- Quick Option Pills -->
                        @if (q.quickOptions && q.quickOptions.length > 0) {
                          <div class="flex flex-wrap gap-1.5 pt-1">
                            @for (opt of q.quickOptions; track opt) {
                              <button
                                type="button"
                                (click)="selectQuickAnswer(q, opt)"
                                class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border"
                                [class]="q.answeredValue === opt ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'">
                                {{ opt }}
                              </button>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Column 2: Questions for Your Doctor (Patient Empowerment) -->
                <div class="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-zinc-900 border border-indigo-200/70 dark:border-indigo-800/60 shadow-md space-y-4">
                  <div class="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                    <div class="flex items-center gap-2">
                      <span class="text-lg">🩺</span>
                      <div>
                        <h4 class="text-sm font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider">
                          Questions to Ask Your Doctor
                        </h4>
                        <p class="text-[11px] text-indigo-700/80 dark:text-indigo-400">
                          Empowering your next consultation with root-cause focus
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="copyDoctorQuestions(analysis.doctorQuestions)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-xs">
                      {{ isCopied() ? '✓ Copied!' : '📋 Copy All' }}
                    </button>
                  </div>

                  <div class="space-y-3.5">
                    @for (docQ of analysis.doctorQuestions; track docQ.id; let idx = $index) {
                      <div class="p-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-1.5">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Question {{ idx + 1 }}
                          </span>
                          <span class="text-[10px] text-zinc-400 italic">{{ docQ.recommendedAction }}</span>
                        </div>
                        <p class="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                          "{{ docQ.question }}"
                        </p>
                        <p class="text-[11px] text-zinc-600 dark:text-zinc-400">
                          💡 <span class="font-medium text-zinc-700 dark:text-zinc-300">Why ask this:</span> {{ docQ.contextWhy }}
                        </p>
                      </div>
                    }
                  </div>

                  <!-- Save to Care Plan Button -->
                  <div class="pt-2">
                    <button
                      type="button"
                      (click)="applyToCarePlan(analysis)"
                      class="w-full py-3 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                      [class]="isApplied() ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-98'">
                      <span>{{ isApplied() ? '✓ Care Plan Updated with Socratic Intake' : '💾 Apply Intake & Questions to Patient Care Plan' }}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class SereneIntakeComponent {
  inputText = signal<string>('');
  isListening = signal<boolean>(false);
  isCopied = signal<boolean>(false);
  isApplied = signal<boolean>(false);

  private adaptiveIntakeService = inject(AdaptiveIntakeService);
  public themeService = inject(ThemeService);
  private patientState = inject(PatientStateService, { optional: true });
  private dictationService = inject(DictationService, { optional: true });

  isPlainLanguage = computed(() => this.themeService.isPlainLanguageMode());

  // Active analysis result
  analysisResult = signal<IIntakeAnalysisResult | null>(null);

  readonly presets: IIntakePreset[] = [
    {
      title: 'Tech Executive & Ergonomic Strain',
      icon: '🛡️',
      category: 'Ergonomic',
      narrative: 'I have been coding 10 hours a day for 3 weeks. Intense stiff neck and trapezius tightness, right wrist numbness from typing, dry eye strain from dual monitors, and afternoon mental burnout.'
    },
    {
      title: 'Executive Burnout & Sleep Debt',
      icon: '⚡',
      category: 'Autonomic',
      narrative: 'Severe deadline stress, waking up at 3 AM with racing thoughts, feeling exhausted every morning, and relying on 4 cups of coffee to start the day.'
    },
    {
      title: 'Metabolic & Post-Prandial Fog',
      icon: '🍵',
      category: 'Metabolic',
      narrative: 'Intense abdominal bloating and brain fog within 45 minutes after lunch, craving sugar mid-afternoon, accompanied by cold hands and sluggish digestion.'
    },
    {
      title: 'Patellofemoral & Joint Discomfort',
      icon: '🏃',
      category: 'Musculoskeletal',
      narrative: 'Right knee aching and stiffness when climbing stairs or sitting for over an hour, worse on cold mornings, wanting non-surgical rehabilitation exercises.'
    }
  ];

  constructor() {
    // Initial analysis if there is starter text
    effect(() => {
      const text = this.inputText();
      if (text.trim().length > 10) {
        this.runAnalysis(text);
      }
    });
  }

  applyPreset(preset: IIntakePreset) {
    this.inputText.set(preset.narrative);
    this.isApplied.set(false);
    this.runAnalysis(preset.narrative);
  }

  onTextChange(text: string) {
    this.isApplied.set(false);
    if (text.trim().length > 10) {
      this.runAnalysis(text);
    }
  }

  synthesizeNow() {
    this.runAnalysis(this.inputText());
  }

  clearInput() {
    this.inputText.set('');
    this.analysisResult.set(null);
    this.isApplied.set(false);
  }

  toggleVoiceInput() {
    if (this.dictationService) {
      if (this.isListening()) {
        this.isListening.set(false);
      } else {
        this.isListening.set(true);
        // Fallback simulation or dictation listener
        setTimeout(() => {
          if (this.isListening()) {
            this.isListening.set(false);
            if (!this.inputText()) {
              this.applyPreset(this.presets[0]);
            }
          }
        }, 3000);
      }
    } else {
      this.isListening.update(v => !v);
    }
  }

  selectQuickAnswer(question: ISocraticQuestion, answer: string) {
    question.answeredValue = answer;
    // Append answer to current narrative for deeper context
    const current = this.inputText();
    const updated = `${current}\n[${question.category} Answer]: ${answer}`;
    this.inputText.set(updated);
    this.runAnalysis(updated);
  }

  copyDoctorQuestions(questions: IDoctorConsultQuestion[]) {
    const text = questions
      .map((q, i) => `${i + 1}. ${q.question}\n   - Why ask: ${q.contextWhy}\n   - Action: ${q.recommendedAction}`)
      .join('\n\n');

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    }
  }

  applyToCarePlan(analysis: IIntakeAnalysisResult) {
    this.adaptiveIntakeService.applyIntakeToPatientState(analysis);
    this.isApplied.set(true);
  }

  private runAnalysis(story: string) {
    const currentPhil = this.patientState?.activePhilosophy() || 'western';
    const age = this.patientState?.patientAge() || 34;
    const occ = this.patientState?.occupation() || 'Software Architect';

    const result = this.adaptiveIntakeService.parseNarrative(story, {
      patientAge: age,
      occupation: occ,
      activePhilosophy: currentPhil as any
    });

    this.analysisResult.set(result);
  }
}
