import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarrowsClinicalInquiryService, IBarrowsHypothesis, ILivingProblemList, IClinicianHandoffBrief } from '../services/barrows-clinical-inquiry.service';

@Component({
  selector: 'app-barrows-clinical-inquiry-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-zinc-950 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Header: Objective Workbench Banner -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              CLINICAL REASONING WORKBENCH
            </span>
            <span class="text-xs font-mono text-zinc-400">
              Dr. Howard Barrows PBL Model
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-zinc-100 mt-1 tracking-tight">
            Physiological Problem-Based Inquiry
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-0.5">
            An open, objective tool to explore bodily mechanisms, test hypotheses against your daily timeline, and prepare focused questions for your real-world care team.
          </p>
        </div>

        <!-- Privacy & Session Slate Controls -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            (click)="purgeSessionSlate()"
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400"
            title="Wipe transient working memory from this session"
            aria-label="Wipe active memory slate">
            <span>🧹</span>
            <span>Clear Slate</span>
          </button>
          <span class="text-[10px] font-mono px-2 py-1 bg-zinc-900/80 rounded border border-zinc-800 text-emerald-400 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Zero Egress (Local)
          </span>
        </div>
      </header>

      <!-- Workbench Navigation Tabs -->
      <nav class="flex border-b border-zinc-800 gap-2 sm:gap-4 text-sm font-medium" aria-label="Inquiry Navigation">
        <button
          type="button"
          (click)="activeTab.set('hypotheses')"
          [class]="activeTab() === 'hypotheses'
            ? 'pb-2.5 border-b-2 border-emerald-400 text-emerald-300 font-semibold flex items-center gap-1.5'
            : 'pb-2.5 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5'">
          <span>🔬</span>
          <span>1. Working Hypotheses</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('problem_list')"
          [class]="activeTab() === 'problem_list'
            ? 'pb-2.5 border-b-2 border-emerald-400 text-emerald-300 font-semibold flex items-center gap-1.5'
            : 'pb-2.5 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5'">
          <span>🗂️</span>
          <span>2. Adaptive Problem Board</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('doctor_brief')"
          [class]="activeTab() === 'doctor_brief'
            ? 'pb-2.5 border-b-2 border-emerald-400 text-emerald-300 font-semibold flex items-center gap-1.5'
            : 'pb-2.5 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5'">
          <span>🤝</span>
          <span>3. Doctor Consultation Brief</span>
        </button>
      </nav>

      <!-- TAB 1: Working Hypotheses & Falsification Workbench -->
      @if (activeTab() === 'hypotheses') {
        <section class="space-y-4" aria-labelledby="hypotheses-heading">
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
            <h3 id="hypotheses-heading" class="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span>💡</span>
              <span>How We Explore Bodily Mechanisms</span>
            </h3>
            <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
              Instead of guessing a single scary disease, clinical reasoning evaluates several plausible mechanisms simultaneously. We ask <strong class="text-zinc-300">falsification questions</strong> to see which theories are supported by your real-life observations.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4">
            @for (hypo of hypotheses(); track hypo.id) {
              <article class="p-4 sm:p-5 rounded-xl border bg-zinc-900/40 transition-all hover:bg-zinc-900/70"
                [ngClass]="{
                  'border-emerald-700/60 bg-emerald-950/10': hypo.falsificationStatus === 'SUPPORTED',
                  'border-zinc-700/60 bg-zinc-900/30': hypo.falsificationStatus === 'UNTESTED',
                  'border-rose-900/40 bg-rose-950/5 opacity-75': hypo.falsificationStatus === 'REFUTED'
                }">
                
                <!-- Hypothesis Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono px-2 py-0.5 rounded border"
                      [ngClass]="{
                        'bg-sky-950 text-sky-300 border-sky-800': hypo.domain === 'AUTONOMIC_STRESS',
                        'bg-amber-950 text-amber-300 border-amber-800': hypo.domain === 'METABOLIC',
                        'bg-purple-950 text-purple-300 border-purple-800': hypo.domain === 'MECHANISTIC'
                      }">
                      {{ hypo.domain }}
                    </span>
                    <h4 class="text-base font-semibold text-zinc-100">{{ hypo.title }}</h4>
                  </div>

                  <!-- Likelihood Badge -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono text-zinc-400">Plausibility:</span>
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 tabular-nums">
                      {{ (hypo.likelihoodScore * 100).toFixed(0) }}%
                    </span>
                  </div>
                </div>

                <p class="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {{ hypo.description }}
                </p>

                <!-- Clues Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                  <div>
                    <h5 class="text-[11px] font-mono text-emerald-400 font-medium">✓ Supporting Observations</h5>
                    <ul class="mt-1 space-y-1 text-zinc-400 list-disc list-inside">
                      @for (clue of hypo.supportingClues; track clue) {
                        <li>{{ clue }}</li>
                      }
                    </ul>
                  </div>
                  <div>
                    <h5 class="text-[11px] font-mono text-sky-400 font-medium">🛡️ Red Flags Ruled Out</h5>
                    <ul class="mt-1 space-y-1 text-zinc-400 list-disc list-inside">
                      @for (redFlag of hypo.falsificationClues; track redFlag) {
                        <li>{{ redFlag }}</li>
                      }
                    </ul>
                  </div>
                </div>

                <!-- Interactive Falsification Question -->
                <div class="mt-4 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="space-y-0.5">
                    <div class="text-[10px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                      <span>❓</span>
                      <span>EMPIRICAL FALSIFICATION TEST:</span>
                    </div>
                    <p class="text-xs text-zinc-200">{{ hypo.falsificationQuestion }}</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-1.5 shrink-0" role="group" aria-label="Falsification Test Response">
                    <button
                      type="button"
                      (click)="answerQuestion(hypo.id, 'YES')"
                      [class]="hypo.falsificationStatus === 'SUPPORTED'
                        ? 'px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 text-white'
                        : 'px-2.5 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'">
                      Yes
                    </button>
                    <button
                      type="button"
                      (click)="answerQuestion(hypo.id, 'NO')"
                      [class]="hypo.falsificationStatus === 'REFUTED'
                        ? 'px-2.5 py-1 rounded text-xs font-semibold bg-rose-600 text-white'
                        : 'px-2.5 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'">
                      No
                    </button>
                    <button
                      type="button"
                      (click)="answerQuestion(hypo.id, 'UNSURE')"
                      class="px-2.5 py-1 rounded text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800">
                      Unsure
                    </button>
                  </div>
                </div>

              </article>
            }
          </div>
        </section>
      }

      <!-- TAB 2: 3-Tier Adaptive Problem Board -->
      @if (activeTab() === 'problem_list') {
        <section class="space-y-6" aria-labelledby="problem-board-heading">
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
            <h3 id="problem-board-heading" class="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span>🌿</span>
              <span>The Whole Human: Drivers, Compensations & Strengths</span>
            </h3>
            <p class="text-xs text-zinc-400 mt-1 leading-relaxed">
              Your body is not a machine breaking down; it is actively adapting. This board categorizes what is driving your symptoms, how your autonomic system is compensating, and what physiological strengths you possess.
            </p>
          </div>

          <!-- Tier 1: Active Core Drivers -->
          <div class="space-y-2">
            <h4 class="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <span>⚡</span>
              <span>Tier 1: Active Core Drivers (Actionable Levers)</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (driver of livingProblemList().activeDrivers; track driver.id) {
                <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-amber-900/40 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-zinc-200">{{ driver.title }}</span>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                      {{ driver.priority }} PRIORITY
                    </span>
                  </div>
                  <p class="text-xs text-zinc-400">{{ driver.evidence }}</p>
                  <div class="text-xs text-emerald-300/90 pt-1 font-medium flex items-center gap-1">
                    <span>🌱 Lever:</span>
                    <span>{{ driver.actionableLever }}</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Tier 2: Compensatory Autonomic Responses -->
          <div class="space-y-2">
            <h4 class="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
              <span>🔄</span>
              <span>Tier 2: Compensatory Bodily Adaptations</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (comp of livingProblemList().compensatoryResponses; track comp.id) {
                <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-sky-900/40 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-zinc-200">{{ comp.title }}</span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">
                      {{ comp.autonomicState }}
                    </span>
                  </div>
                  <p class="text-xs text-zinc-400 leading-relaxed">{{ comp.mechanism }}</p>
                  <p class="text-[11px] text-zinc-400 italic">Observed: {{ comp.observation }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Tier 3: Protective Strengths & Reserves -->
          <div class="space-y-2">
            <h4 class="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Tier 3: Inherent Physiological Strengths & Reserves</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              @for (strength of livingProblemList().protectiveStrengths; track strength.id) {
                <div class="p-3.5 rounded-xl bg-zinc-900/60 border border-emerald-900/40 space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-zinc-200">{{ strength.title }}</span>
                    <span class="text-xs font-mono font-bold text-emerald-400">
                      {{ strength.vagalResilienceScore }}/100
                    </span>
                  </div>
                  <p class="text-xs text-zinc-300">{{ strength.reserveCapacity }}</p>
                  <p class="text-xs text-emerald-400 font-mono">{{ strength.metric }}</p>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <!-- TAB 3: 60-Second Doctor Consultation Brief -->
      @if (activeTab() === 'doctor_brief') {
        <section class="space-y-4" aria-labelledby="doctor-brief-heading">
          <div class="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 id="doctor-brief-heading" class="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <span>📋</span>
                <span>Your 60-Second Doctor Consultation Brief</span>
              </h3>
              <p class="text-xs text-zinc-400 mt-0.5">
                Take this to your next 15-minute appointment. It is written in standard medical language so your doctor can scan it in 15 seconds.
              </p>
            </div>

            <button
              type="button"
              (click)="copyBriefToClipboard()"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-400">
              <span>{{ copyStatus() }}</span>
            </button>
          </div>

          <!-- The Brief Card Container -->
          <div class="p-5 rounded-xl bg-zinc-900 border border-zinc-700 font-sans space-y-4 text-xs">
            
            <!-- Patient Context & Digest -->
            <div class="pb-3 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p class="text-zinc-300 font-medium">{{ clinicianBrief().patientContext }}</p>
              <span class="text-[10px] font-mono text-zinc-400">{{ clinicianBrief().integrityHash }}</span>
            </div>

            <!-- 1. Primary Hypothesis -->
            <div class="space-y-1">
              <h4 class="text-[11px] font-mono uppercase text-emerald-400 font-bold">1. Primary Working Hypothesis:</h4>
              <p class="text-zinc-200 pl-2 border-l-2 border-emerald-500/60 leading-relaxed">
                {{ clinicianBrief().primaryHypothesisSummary }}
              </p>
            </div>

            <!-- 2. Top Questions to Ask -->
            <div class="space-y-1.5">
              <h4 class="text-[11px] font-mono uppercase text-amber-400 font-bold">2. Top 3 Questions for the Physician:</h4>
              <ol class="space-y-1.5 pl-2 list-decimal list-inside text-zinc-200">
                @for (question of clinicianBrief().topQuestionsForPhysician; track question) {
                  <li class="leading-relaxed"><strong class="text-zinc-100">"</strong>{{ question }}<strong class="text-zinc-100">"</strong></li>
                }
              </ol>
            </div>

            <!-- 3. 14-Day Objective Telemetry -->
            <div class="space-y-1.5">
              <h4 class="text-[11px] font-mono uppercase text-sky-400 font-bold">3. 14-Day Telemetric Observations:</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                @for (trend of clinicianBrief().fourteenDayTrends; track trend.metric) {
                  <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                    <span class="text-[11px] font-medium text-zinc-300">{{ trend.metric }}</span>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-sm font-bold font-mono text-zinc-100">{{ trend.current }}</span>
                      <span class="text-[11px] font-mono text-amber-400">({{ trend.delta }})</span>
                    </div>
                    <p class="text-[10px] text-zinc-400 leading-tight">{{ trend.clinicalSignificance }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- 4. Red Flags Ruled Out -->
            <div class="space-y-1 pt-2 border-t border-zinc-800">
              <h4 class="text-[11px] font-mono uppercase text-zinc-400 font-bold">4. Red Flags Ruled Out:</h4>
              <ul class="space-y-1 pl-2 text-zinc-300">
                @for (flag of clinicianBrief().redFlagsRuledOut; track flag) {
                  <li class="flex items-center gap-1.5">
                    <span class="text-emerald-400">✓</span>
                    <span>{{ flag }}</span>
                  </li>
                }
              </ul>
            </div>

            <!-- 5. Suggested Workup -->
            <div class="space-y-1 pt-2 border-t border-zinc-800">
              <h4 class="text-[11px] font-mono uppercase text-purple-400 font-bold">5. Workup & Panels to Inquire About:</h4>
              <div class="flex flex-wrap gap-1.5">
                @for (panel of clinicianBrief().recommendedLabPanels; track panel) {
                  <span class="px-2 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-200 text-[11px]">
                    {{ panel }}
                  </span>
                }
              </div>
            </div>

          </div>
        </section>
      }

    </div>
  `
})
export class BarrowsClinicalInquiryHubComponent {
  private readonly inquiryService = inject(BarrowsClinicalInquiryService);

  readonly activeTab = signal<'hypotheses' | 'problem_list' | 'doctor_brief'>('hypotheses');
  readonly copyStatus = signal<string>('📋 Copy Brief for Doctor');

  readonly hypotheses = this.inquiryService.hypotheses;
  readonly livingProblemList = this.inquiryService.livingProblemList;
  readonly clinicianBrief = this.inquiryService.clinicianBrief;

  answerQuestion(hypothesisId: string, answer: 'YES' | 'NO' | 'UNSURE'): void {
    this.inquiryService.testFalsificationQuestion(hypothesisId, answer);
  }

  purgeSessionSlate(): void {
    this.inquiryService.selectedCase.set('Standard Health Exploration');
    this.inquiryService.testFalsificationQuestion('hypo-1', 'UNSURE');
    this.inquiryService.testFalsificationQuestion('hypo-2', 'UNSURE');
    this.inquiryService.testFalsificationQuestion('hypo-3', 'UNSURE');
    this.activeTab.set('hypotheses');
  }

  async copyBriefToClipboard(): Promise<void> {
    const text = this.inquiryService.exportDoctorBriefAsText();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        this.copyStatus.set('✓ Copied to Clipboard!');
        setTimeout(() => this.copyStatus.set('📋 Copy Brief for Doctor'), 2500);
      }
    } catch (_) {
      this.copyStatus.set('✓ Ready in Text');
    }
  }
}
