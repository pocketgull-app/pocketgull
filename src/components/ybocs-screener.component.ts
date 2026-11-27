// SPDX-License-Identifier: Apache-2.0
import { Component, ChangeDetectionStrategy, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecureStorageService } from '../services/secure-storage.service';
import { PatientStateService } from '../services/patient-state.service';
import { YbocsService } from '../services/ybocs/ybocs.service';
import { symptomCategories, symptomItems, severityQuestions } from '../services/ybocs/data';
import { Assessment, SymptomItem, YbocsActionIntent } from '../services/ybocs/types';

@Component({
  selector: 'app-ybocs-screener',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 animate-in fade-in duration-300 max-w-full box-border">
      <!-- Top Overview Summary Header Card -->
      <div class="p-5 sm:p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="text-xs uppercase font-extrabold tracking-widest text-zinc-500 dark:text-zinc-400">Clinical Protocol</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Y-BOCS Screening Suite
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              Exploratory • Non-Diagnostic
            </span>
          </div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Yale-Brown Obsessive-Compulsive Scale</h2>
          <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
            A calm, structured way to put words around intrusive thoughts and repetitive loops—helping you see what you are carrying and share it clearly with a clinician.
          </p>
        </div>

        <div class="flex flex-col items-center shrink-0 p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl w-full md:w-60 text-center shadow-inner">
          <span class="text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
            {{ ybocs.totalScore() }}<span class="text-sm font-normal text-zinc-500 dark:text-zinc-400">/40</span>
          </span>
          <div class="mt-2 w-full">
            <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300 w-full justify-center" [class]="ybocs.severityDetails().color">
              {{ ybocs.severityDetails().name }}
            </span>
          </div>
          <div class="mt-3 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <div>OBS: <span class="font-bold text-zinc-800 dark:text-zinc-200">{{ ybocs.obsessionSubtotal() }}/20</span></div>
            <div class="w-px h-3 bg-zinc-200 dark:bg-zinc-800"></div>
            <div>COMP: <span class="font-bold text-zinc-800 dark:text-zinc-200">{{ ybocs.compulsiveSubtotal() }}/20</span></div>
          </div>
          <div class="mt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            Rated: {{ ybocs.answeredCoreCount() }}/10 core items
            @if (ybocs.insightScore() !== null) {
              <span> · Insight Q11: {{ ybocs.insightScore() }}/4</span>
            }
          </div>
          @if (ybocs.scoreDelta() !== null && ybocs.previousRecordedScore(); as prev) {
            <div class="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
              [class]="(ybocs.scoreDelta() ?? 0) < 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : (ybocs.scoreDelta() ?? 0) > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'">
              @if ((ybocs.scoreDelta() ?? 0) < 0) {
                ↓ {{ absDelta() }} pts since {{ prev.date }}
              } @else if ((ybocs.scoreDelta() ?? 0) > 0) {
                ↑ {{ absDelta() }} pts since {{ prev.date }}
              } @else {
                Steady vs. {{ prev.date }}
              }
            </div>
          }
        </div>
      </div>

      <!-- Outcome-Driven Patient Validation Card (Quiet Workshop Voice + Seligman 3 Ps) -->
      @if (ybocs.outcomeValidation(); as outcome) {
        <section
          aria-live="polite"
          data-testid="ybocs-outcome-validation"
          class="p-5 sm:p-6 rounded-2xl border transition-colors duration-300 flex flex-col gap-4"
          [class]="outcome.cardBorder">
          <div class="flex flex-col gap-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                What This Outcome Means For You
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border" [class]="outcome.badgeColor">
                {{ outcome.severityName }}
              </span>
            </div>
            <h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
              {{ outcome.headline }}
            </h3>
            <p class="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
              {{ outcome.validationMessage }}
            </p>
            <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {{ outcome.meaningInDailyLife }}
            </p>
          </div>

          @if (outcome.patternNote) {
            <div class="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span class="font-bold text-zinc-900 dark:text-zinc-100">Pattern Insight:</span> {{ outcome.patternNote }}
            </div>
          }

          @if (outcome.insightNote) {
            <div class="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {{ outcome.insightNote }}
            </div>
          }

          <!-- Ego-Dystonic Intrusive Thoughts Reassurance Banner -->
          @if (outcome.egoDystonicReassurance) {
            <div data-testid="ybocs-egodystonic-banner" class="p-3.5 rounded-xl bg-violet-50/90 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs text-violet-950 dark:text-violet-100 leading-relaxed flex flex-col gap-1">
              <span class="font-bold uppercase tracking-wider text-[10px] text-violet-700 dark:text-violet-300">
                Important Reassurance on Intrusive Thoughts
              </span>
              <p>{{ outcome.egoDystonicReassurance }}</p>
            </div>
          }

          <!-- Warm Non-Alarmist Support Banner for Severe/Extreme Scores or Active Harm Distress -->
          @if (outcome.showWarmSupportCard) {
            <div data-testid="ybocs-warm-support" class="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-rose-300/80 dark:border-rose-800/80 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed flex flex-col gap-1.5">
              <span class="font-bold text-rose-700 dark:text-rose-300">
                Warm Human Support Is Available — Without Judgment
              </span>
              <p>
                Intrusive OCD fears are different from wanting to act on harm. Still, carrying severe distress is exhausting—if you ever feel overwhelmed or unsafe right now, free, confidential human support is open 24/7:
                <strong class="font-mono">US/CA: Call or Text 988</strong> ·
                <strong class="font-mono">UK: 111</strong> ·
                <strong class="font-mono">AU: 13 11 14</strong> ·
                <strong class="font-mono">NZ: 1737</strong>.
              </p>
            </div>
          }

          <!-- 3 Outcome-Specific Next-Step Actions (Oakley 4-Slot Ceiling) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            @for (step of outcome.nextSteps; track step.label) {
              <button
                type="button"
                (click)="executeOutcomeAction(step.intent)"
                class="min-h-[44px] text-left p-3.5 rounded-xl bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 transition shadow-xs hover:shadow cursor-pointer flex flex-col justify-between gap-1 active:scale-[0.99]">
                <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ step.label }} →</span>
                <span class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">{{ step.detail }}</span>
              </button>
            }
          </div>
        </section>
      }

      <!-- Action Control Row (44px+ Ataxia-Friendly Hit Targets) -->
      <div class="flex flex-wrap gap-3 items-center">
        <button type="button" (click)="saveAssessmentToTimeline()"
          data-testid="ybocs-save-btn"
          class="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>💾 Save to FHIR Timeline</span>
        </button>

        <button type="button" (click)="copyVisitPrepBrief()"
          data-testid="ybocs-visit-brief-btn"
          class="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>📋 Copy Visit Prep Brief</span>
        </button>

        <button type="button" (click)="triggerMindfulMacawVoiceInterview()"
          data-testid="ybocs-voice-btn"
          class="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>🎙️ Voice-First Interview</span>
        </button>
        
        <button type="button" (click)="openSomaticGroundingMode()"
          data-testid="ybocs-grounding-btn"
          class="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs transition shadow hover:shadow-md active:scale-95 cursor-pointer">
          <span>🧘 Somatic Grounding Loop</span>
        </button>

        @if (!pendingResetConfirm()) {
          <button type="button" (click)="requestReset()"
            data-testid="ybocs-reset-btn"
            class="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-xs transition active:scale-95 cursor-pointer">
            <span>↺ Reset Form</span>
          </button>
        } @else {
          <div class="flex items-center gap-2 p-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40">
            <button type="button" (click)="confirmReset()"
              data-testid="ybocs-confirm-reset-btn"
              class="min-h-[40px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer">
              Confirm Clear Form
            </button>
            <button type="button" (click)="pendingResetConfirm.set(false)"
              class="min-h-[40px] px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-bold text-xs cursor-pointer">
              Cancel
            </button>
          </div>
        }
      </div>

      <!-- Status / Save / Undo Feedback Banners -->
      @if (saveSuccessMessage()) {
        <div role="status" aria-live="polite" class="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <span>✅ {{ saveSuccessMessage() }}</span>
          <button type="button" (click)="saveSuccessMessage.set(null)" aria-label="Dismiss notice" class="min-h-[36px] min-w-[36px] text-xs text-emerald-600 dark:text-emerald-300 hover:opacity-75 cursor-pointer">✕</button>
        </div>
      }

      @if (undoResetSnapshot()) {
        <div role="status" aria-live="polite" data-testid="ybocs-undo-banner" class="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <span>Form cleared (your prior saved timeline entries were kept safe).</span>
          <div class="flex items-center gap-2">
            <button type="button" (click)="undoReset()"
              data-testid="ybocs-undo-reset-btn"
              class="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer">
              Undo Reset
            </button>
            <button type="button" (click)="undoResetSnapshot.set(null)" aria-label="Dismiss undo" class="min-h-[36px] px-2 text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        </div>
      }

      @if (visitBriefPreview()) {
        <div data-testid="ybocs-visit-brief-preview" class="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-indigo-200 dark:border-indigo-900 shadow-xs flex flex-col gap-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              30-Second Clinician Visit Prep Brief (Safe Harbor — Zero Raw PHI)
            </span>
            <button type="button" (click)="visitBriefPreview.set(null)" aria-label="Close visit brief preview" class="min-h-[36px] px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">✕</button>
          </div>
          <pre class="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-64 overflow-y-auto">{{ visitBriefPreview() }}</pre>
        </div>
      }

      <!-- Main Columns: Checklist vs Severity -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Checklist Lenses (7 cols) -->
        <div class="lg:col-span-7 flex flex-col gap-5 min-w-0">
          <div class="flex border-b border-zinc-200 dark:border-zinc-800" role="tablist" aria-label="Y-BOCS Symptom Checklists">
            <button type="button" role="tab" [attr.aria-selected]="activeChecklistTab() === 'obsessions'"
              (click)="activeChecklistTab.set('obsessions')"
              [class.border-b-2]="activeChecklistTab() === 'obsessions'"
              [class.border-violet-600]="activeChecklistTab() === 'obsessions'"
              [class.text-violet-700]="activeChecklistTab() === 'obsessions'"
              [class.dark:text-violet-300]="activeChecklistTab() === 'obsessions'"
              [class.text-zinc-500]="activeChecklistTab() !== 'obsessions'"
              class="min-h-[44px] pb-2.5 px-4 font-bold uppercase tracking-widest text-xs outline-none cursor-pointer">
              Obsessions Checklist ({{ ybocs.currentSymptomSummary().obsessions.length }} current)
            </button>
            <button type="button" role="tab" [attr.aria-selected]="activeChecklistTab() === 'compulsions'"
              (click)="activeChecklistTab.set('compulsions')"
              [class.border-b-2]="activeChecklistTab() === 'compulsions'"
              [class.border-violet-600]="activeChecklistTab() === 'compulsions'"
              [class.text-violet-700]="activeChecklistTab() === 'compulsions'"
              [class.dark:text-violet-300]="activeChecklistTab() === 'compulsions'"
              [class.text-zinc-500]="activeChecklistTab() !== 'compulsions'"
              class="min-h-[44px] pb-2.5 px-4 font-bold uppercase tracking-widest text-xs outline-none cursor-pointer">
              Compulsions Checklist ({{ ybocs.currentSymptomSummary().compulsions.length }} current)
            </button>
          </div>

          <div class="flex flex-col gap-4 max-h-[640px] overflow-y-auto pr-1">
            @for (cat of activeCategories(); track cat.id) {
              <div class="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs">
                <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900 pb-2 mb-3">
                  {{ cat.name }}
                </h3>

                <div class="flex flex-col gap-2">
                  @for (item of getItemsByCategory(cat.id); track item.id) {
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition border border-transparent"
                      [class.border-violet-200]="isFocusItem(item)"
                      [class.dark:border-violet-800]="isFocusItem(item)"
                      [class.bg-violet-50/30]="isFocusItem(item)"
                      [class.dark:bg-violet-950/20]="isFocusItem(item)">
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-zinc-900 dark:text-zinc-100 break-words">{{ item.text }}</p>
                        @if (item.examples) {
                          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5 italic break-words">{{ item.examples }}</p>
                        }
                      </div>

                      <div class="flex items-center gap-2 shrink-0 font-sans">
                        <!-- Past Toggle (Valid Tailwind bg-zinc-800 in light mode -> high contrast!) -->
                        <button type="button"
                          (click)="ybocs.toggleChecklist(item.id, 'past')"
                          [attr.aria-pressed]="hasAnswer(item.id, 'past')"
                          [attr.aria-label]="'Past: ' + item.text"
                          [class.bg-zinc-800]="hasAnswer(item.id, 'past')"
                          [class.dark:bg-zinc-100]="hasAnswer(item.id, 'past')"
                          [class.text-white]="hasAnswer(item.id, 'past')"
                          [class.dark:text-zinc-950]="hasAnswer(item.id, 'past')"
                          [class.border-zinc-800]="hasAnswer(item.id, 'past')"
                          [class.dark:border-zinc-100]="hasAnswer(item.id, 'past')"
                          [class.text-zinc-700]="!hasAnswer(item.id, 'past')"
                          [class.dark:text-zinc-300]="!hasAnswer(item.id, 'past')"
                          [class.border-zinc-300]="!hasAnswer(item.id, 'past')"
                          [class.dark:border-zinc-700]="!hasAnswer(item.id, 'past')"
                          class="min-h-[44px] min-w-[54px] px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold border rounded-lg transition active:scale-95 cursor-pointer">
                          Past
                        </button>
                        
                        <!-- Current Toggle -->
                        <button type="button"
                          (click)="ybocs.toggleChecklist(item.id, 'current')"
                          [attr.aria-pressed]="hasAnswer(item.id, 'current')"
                          [attr.aria-label]="'Current: ' + item.text"
                          [class.bg-violet-600]="hasAnswer(item.id, 'current')"
                          [class.text-white]="hasAnswer(item.id, 'current')"
                          [class.border-violet-600]="hasAnswer(item.id, 'current')"
                          [class.text-zinc-700]="!hasAnswer(item.id, 'current')"
                          [class.dark:text-zinc-300]="!hasAnswer(item.id, 'current')"
                          [class.border-zinc-300]="!hasAnswer(item.id, 'current')"
                          [class.dark:border-zinc-700]="!hasAnswer(item.id, 'current')"
                          class="min-h-[44px] min-w-[68px] px-3 py-1.5 text-[11px] uppercase tracking-wider font-bold border rounded-lg transition active:scale-95 cursor-pointer">
                          Current
                        </button>

                        <!-- Primary Focus Star (Wires upsettingObsessionId / upsettingCompulsionId for Visit Prep Brief) -->
                        @if (hasAnswer(item.id, 'current') || isFocusItem(item)) {
                          <button type="button"
                            (click)="toggleFocusItem(item)"
                            [attr.aria-pressed]="isFocusItem(item)"
                            [attr.aria-label]="'Mark as primary focus: ' + item.text"
                            [title]="isFocusItem(item) ? 'Primary focus item for Visit Brief' : 'Star as top focus for clinician Visit Brief'"
                            [class.bg-amber-500]="isFocusItem(item)"
                            [class.text-white]="isFocusItem(item)"
                            [class.border-amber-500]="isFocusItem(item)"
                            [class.text-zinc-600]="!isFocusItem(item)"
                            [class.dark:text-zinc-300]="!isFocusItem(item)"
                            [class.border-zinc-300]="!isFocusItem(item)"
                            [class.dark:border-zinc-700]="!isFocusItem(item)"
                            class="min-h-[44px] px-2.5 py-1.5 text-xs font-bold border rounded-lg transition active:scale-95 cursor-pointer">
                            {{ isFocusItem(item) ? '★ Focus' : '☆' }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: Severity Questions (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-4 min-w-0">
          <div class="pb-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <h3 class="font-bold uppercase tracking-widest text-xs text-zinc-800 dark:text-zinc-200">Severity Rating Scale</h3>
            <span class="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Q1–Q10 = /40 · Q11 = Specifier</span>
          </div>

          <div class="flex flex-col gap-4 max-h-[640px] overflow-y-auto pr-1">
            @for (q of questions; track q.id) {
              <div [attr.data-question-id]="q.id" class="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs flex flex-col gap-3">
                <div>
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans">{{ q.title }}</h4>
                    @if (q.id === 11) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        Separate Specifier (Not Added to /40)
                      </span>
                    }
                  </div>
                  <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">{{ q.subtitle }}</p>
                </div>

                <!-- 0-4 options cards with proper radiogroup ARIA -->
                <div class="flex flex-col gap-1.5 font-sans" role="radiogroup" [attr.aria-label]="q.title">
                  @for (opt of q.options; track opt.score) {
                    <button type="button"
                      role="radio"
                      [attr.aria-checked]="getSelectedScore(q.id) === opt.score"
                      (click)="ybocs.setSeverityScore(q.id, opt.score)"
                      [class.bg-violet-50]="getSelectedScore(q.id) === opt.score"
                      [class.border-violet-500]="getSelectedScore(q.id) === opt.score"
                      [class.dark:bg-violet-950/30]="getSelectedScore(q.id) === opt.score"
                      [class.dark:border-violet-700]="getSelectedScore(q.id) === opt.score"
                      [class.border-zinc-200]="getSelectedScore(q.id) !== opt.score"
                      [class.dark:border-zinc-800]="getSelectedScore(q.id) !== opt.score"
                      class="min-h-[44px] flex items-start text-left p-2.5 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition text-xs cursor-pointer">
                      
                      <!-- Radio dot indicator -->
                      <span class="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mr-2.5 mt-0.5"
                        [class.border-violet-600]="getSelectedScore(q.id) === opt.score"
                        [class.border-zinc-400]="getSelectedScore(q.id) !== opt.score"
                        [class.dark:border-zinc-600]="getSelectedScore(q.id) !== opt.score">
                        @if (getSelectedScore(q.id) === opt.score) {
                          <span class="w-2 h-2 rounded-full bg-violet-600"></span>
                        }
                      </span>

                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline gap-2">
                          <span class="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{{ opt.label }}</span>
                          <span class="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 leading-none shrink-0">Score: {{ opt.score }}</span>
                        </div>
                        <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal mt-0.5 break-words">{{ opt.desc }}</p>
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
    :host {
      display: block;
      max-width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class YbocsScreenerComponent implements OnDestroy {
  readonly ybocs = inject(YbocsService);
  private secureStorage = inject(SecureStorageService);
  private patientState = inject(PatientStateService, { optional: true });

  readonly activeChecklistTab = signal<'obsessions' | 'compulsions'>('obsessions');
  readonly saveSuccessMessage = signal<string | null>(null);
  readonly pendingResetConfirm = signal<boolean>(false);
  readonly undoResetSnapshot = signal<Assessment | null>(null);
  readonly visitBriefPreview = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private undoTimer: ReturnType<typeof setTimeout> | null = null;

  readonly categories = symptomCategories;
  readonly items = symptomItems;
  readonly questions = severityQuestions;

  readonly absDelta = computed(() => Math.abs(this.ybocs.scoreDelta() ?? 0));

  readonly activeCategories = computed(() => {
    const isObs = this.activeChecklistTab() === 'obsessions';
    return this.categories.filter((c) => c.isObsession === isObs);
  });

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.undoTimer) clearTimeout(this.undoTimer);
  }

  private showBanner(message: string): void {
    this.saveSuccessMessage.set(message);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.saveSuccessMessage.set(null);
    }, 6000);
  }

  saveAssessmentToTimeline(): void {
    const result = this.ybocs.saveCurrentAssessment();
    if (result.persistedTo === 'patient_timeline') {
      this.showBanner(
        `Y-BOCS Assessment (${result.totalScore}/40 — ${result.severityName}) saved to Patient FHIR Timeline & local cache.`
      );
    } else {
      this.showBanner(
        `Y-BOCS Assessment (${result.totalScore}/40 — ${result.severityName}) saved privately in local Guest storage. Select a patient profile to attach it to a FHIR Timeline.`
      );
    }
  }

  async copyVisitPrepBrief(): Promise<void> {
    const brief = this.ybocs.buildClinicianVisitBrief();
    this.visitBriefPreview.set(brief);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(brief);
        this.showBanner('30-second Clinician Visit Prep Brief copied to clipboard and previewed below.');
        return;
      }
    } catch {
      // Clipboard API may be blocked in insecure/sandboxed contexts; preview remains visible
    }
    this.showBanner('30-second Clinician Visit Prep Brief generated below — ready to share.');
  }

  executeOutcomeAction(intent: YbocsActionIntent): void {
    switch (intent) {
      case 'grounding':
        this.openSomaticGroundingMode();
        break;
      case 'visit_brief':
        void this.copyVisitPrepBrief();
        break;
      case 'voice':
        this.triggerMindfulMacawVoiceInterview();
        break;
      case 'save':
        this.saveAssessmentToTimeline();
        break;
    }
  }

  requestReset(): void {
    this.pendingResetConfirm.set(true);
  }

  confirmReset(): void {
    this.pendingResetConfirm.set(false);
    const snapshot = this.ybocs.resetAssessment(false);
    this.undoResetSnapshot.set(snapshot);
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => {
      this.undoResetSnapshot.set(null);
    }, 10000);
  }

  undoReset(): void {
    const snapshot = this.undoResetSnapshot();
    if (snapshot) {
      this.ybocs.restoreAssessment(snapshot);
      this.undoResetSnapshot.set(null);
      if (this.undoTimer) clearTimeout(this.undoTimer);
      this.showBanner('Previous Y-BOCS answers restored.');
    }
  }

  getItemsByCategory(categoryId: string): SymptomItem[] {
    return this.items.filter((item) => item.category === categoryId);
  }

  hasAnswer(itemId: number, type: 'past' | 'current'): boolean {
    const ans = this.ybocs.checklistAnswers();
    return !!ans[itemId]?.[type];
  }

  isFocusItem(item: SymptomItem): boolean {
    return item.isObsession
      ? this.ybocs.upsettingObsessionId() === item.id
      : this.ybocs.upsettingCompulsionId() === item.id;
  }

  toggleFocusItem(item: SymptomItem): void {
    if (item.isObsession) {
      this.ybocs.setUpsettingObsession(item.id);
    } else {
      this.ybocs.setUpsettingCompulsion(item.id);
    }
  }

  getSelectedScore(questionId: number): number | undefined {
    return this.ybocs.severityAnswers()[questionId];
  }

  triggerMindfulMacawVoiceInterview(): void {
    // Store mode before opening so freshly mounted VoiceAssistantComponent hydrates immediately
    this.secureStorage.setItem('voice_assistant_mode', 'ybocs');
    // Activate Live Agent directly via Angular Signal instead of brittle DOM query
    this.patientState?.toggleLiveAgent(true);
    this.patientState?.setLiveAgentWindowMode('compact');
    // Also notify an already-mounted VoiceAssistantComponent instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voice-mode-change', { detail: 'ybocs' }));
    }
  }

  openSomaticGroundingMode(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('somatic-grounding-activate'));
    }
  }
}
