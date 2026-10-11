import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  YaleAddictionProtocolService,
  COWS_QUESTIONNAIRE_ITEMS,
  ICowsAssessmentResult,
  CowsSeverityTier
} from '../../services/yale-addiction-protocol.service';
import { IEhrWritebackBatchResult } from '../../services/fhir/ehr-writeback.service';
import { NavigationShellService } from '../../services/navigation-shell.service';

type ActiveViewTab = 'ASSESSMENT' | 'DECISION_SUPPORT' | 'RESTORATIVE_PLAN';

@Component({
  selector: 'app-cows-assessment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-mono text-zinc-100 select-none"
         role="dialog"
         aria-modal="true"
         aria-labelledby="cows-modal-title">
      <div class="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

        <!-- HEADER -->
        <div class="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-teal-950/80 border border-teal-500/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🌿
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 id="cows-modal-title" class="text-sm sm:text-base font-bold uppercase tracking-wider text-teal-300">
                  Yale Clinical Opiate Withdrawal Suite &amp; Restorative Induction
                </h2>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border uppercase"
                      [class.bg-zinc-800]="currentSeverity() === 'NONE'"
                      [class.border-zinc-700]="currentSeverity() === 'NONE'"
                      [class.text-zinc-300]="currentSeverity() === 'NONE'"
                      [class.bg-amber-950/80]="currentSeverity() === 'MILD'"
                      [class.border-amber-500/50]="currentSeverity() === 'MILD'"
                      [class.text-amber-300]="currentSeverity() === 'MILD'"
                      [class.bg-orange-950/80]="currentSeverity() === 'MODERATE'"
                      [class.border-orange-500/50]="currentSeverity() === 'MODERATE'"
                      [class.text-orange-300]="currentSeverity() === 'MODERATE'"
                      [class.bg-rose-950/80]="currentSeverity() === 'MODERATELY_SEVERE' || currentSeverity() === 'SEVERE'"
                      [class.border-rose-500/60]="currentSeverity() === 'MODERATELY_SEVERE' || currentSeverity() === 'SEVERE'"
                      [class.text-rose-200]="currentSeverity() === 'MODERATELY_SEVERE' || currentSeverity() === 'SEVERE'">
                  COWS {{ totalScore() }}/48 • {{ currentSeverity() }} WITHDRAWAL
                </span>
              </div>
              <span class="text-[11px] text-zinc-400 font-sans block pt-0.5">
                Yale School of Medicine Protocol (D'Onofrio &amp; Fiellin, JAMA 2015) • LOINC 72514-3 • Trauma-Informed Restorative Care
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              id="btn-close-cows-modal"
              (click)="closeModal()"
              class="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 flex items-center justify-center text-sm font-bold border border-zinc-700 transition cursor-pointer"
              aria-label="Close COWS Suite">
              ✕
            </button>
          </div>
        </div>

        <!-- SUBHEADER / PRESET & FILTER STRIP -->
        <div class="px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <!-- Preset buttons -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mr-1">PRESETS:</span>
            <button type="button"
                    (click)="loadPreset('mild')"
                    class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-[11px] border border-amber-500/30 transition cursor-pointer">
              ⚠️ Mild (Score 6 - Blocked)
            </button>
            <button type="button"
                    (click)="loadPreset('moderate')"
                    class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-300 text-[11px] border border-orange-500/30 transition cursor-pointer">
              🔥 Moderate (Score 16 - Rapid Induction)
            </button>
            <button type="button"
                    (click)="loadPreset('fentanyl')"
                    class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-[11px] border border-cyan-500/30 transition cursor-pointer">
              🧪 Fentanyl LDI (Micro-Dose)
            </button>
            <button type="button"
                    (click)="resetScoring()"
                    class="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[11px] border border-zinc-800 transition cursor-pointer">
              ↺ Reset
            </button>
          </div>

          <!-- Fentanyl Toggle & Tabs -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300 select-none">
              <input type="checkbox"
                     [ngModel]="fentanylSuspected()"
                     (ngModelChange)="toggleFentanyl($event)"
                     class="rounded border-zinc-700 bg-zinc-900 text-teal-500 focus:ring-teal-500/50">
              <span class="font-bold text-cyan-300">Fentanyl Exposure Suspected</span>
            </label>

            <!-- Navigation Tabs -->
            <div class="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              <button type="button"
                      (click)="activeTab.set('ASSESSMENT')"
                      [class.bg-zinc-800]="activeTab() === 'ASSESSMENT'"
                      [class.text-teal-300]="activeTab() === 'ASSESSMENT'"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition text-zinc-400 hover:text-zinc-200 cursor-pointer">
                1. COWS (11)
              </button>
              <button type="button"
                      (click)="activeTab.set('DECISION_SUPPORT')"
                      [class.bg-zinc-800]="activeTab() === 'DECISION_SUPPORT'"
                      [class.text-teal-300]="activeTab() === 'DECISION_SUPPORT'"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition text-zinc-400 hover:text-zinc-200 cursor-pointer">
                2. Yale Decision &amp; Orders
              </button>
              <button type="button"
                      (click)="activeTab.set('RESTORATIVE_PLAN')"
                      [class.bg-zinc-800]="activeTab() === 'RESTORATIVE_PLAN'"
                      [class.text-teal-300]="activeTab() === 'RESTORATIVE_PLAN'"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition text-zinc-400 hover:text-zinc-200 cursor-pointer">
                3. 4-Phase Restoration
              </button>
            </div>
          </div>
        </div>

        <!-- MODAL BODY -->
        <div class="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          <!-- TAB 1: 11-ITEM COWS ASSESSMENT -->
          @if (activeTab() === 'ASSESSMENT') {
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (item of questionnaireItems; track item.id; let idx = $index) {
                  <div class="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <span class="text-teal-400 font-bold text-xs">
                          {{ idx + 1 }}. {{ item.name }}
                        </span>
                        <p class="text-[10px] text-zinc-400 font-sans pt-0.5">{{ item.prompt }}</p>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-zinc-950 border border-zinc-800 text-teal-300 shrink-0">
                        +{{ answers()[item.id] || 0 }} pts
                      </span>
                    </div>

                    <div class="space-y-1 pt-1">
                      @for (opt of item.options; track opt.score) {
                        <label class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-[11px]"
                               [class.bg-teal-950/40]="answers()[item.id] === opt.score"
                               [class.border]="answers()[item.id] === opt.score"
                               [class.border-teal-500/50]="answers()[item.id] === opt.score"
                               [class.text-teal-200]="answers()[item.id] === opt.score"
                               [class.bg-zinc-950/50]="answers()[item.id] !== opt.score"
                               [class.hover:bg-zinc-800/60]="answers()[item.id] !== opt.score"
                               [class.text-zinc-300]="answers()[item.id] !== opt.score">
                          <div class="flex items-center gap-2">
                            <input type="radio"
                                   [name]="item.id"
                                   [value]="opt.score"
                                   [checked]="answers()[item.id] === opt.score"
                                   (change)="selectScore(item.id, opt.score)"
                                   class="text-teal-500 focus:ring-teal-500/40">
                            <span>{{ opt.label }}</span>
                          </div>
                          <span class="text-[9px] text-zinc-500 font-mono">+{{ opt.score }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 2: YALE DECISION SUPPORT & ORDERS -->
          @if (activeTab() === 'DECISION_SUPPORT') {
            @if (assessmentResult(); as res) {
              <div class="space-y-4">
                <!-- Primary Protocol Recommendation Banner -->
                <div class="p-4 rounded-2xl border space-y-2"
                     [class.bg-amber-950/30]="res.decisionSupport.protocolType === 'NON_OPIOID_COMFORT_MEASURES'"
                     [class.border-amber-500/50]="res.decisionSupport.protocolType === 'NON_OPIOID_COMFORT_MEASURES'"
                     [class.bg-teal-950/30]="res.decisionSupport.protocolType === 'YALE_STANDARD_RAPID_INDUCTION'"
                     [class.border-teal-500/50]="res.decisionSupport.protocolType === 'YALE_STANDARD_RAPID_INDUCTION'"
                     [class.bg-cyan-950/30]="res.decisionSupport.protocolType === 'LOW_DOSE_MICRO_INDUCTION_LDI'"
                     [class.border-cyan-500/50]="res.decisionSupport.protocolType === 'LOW_DOSE_MICRO_INDUCTION_LDI'">
                  <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">
                        {{ res.decisionSupport.protocolType === 'YALE_STANDARD_RAPID_INDUCTION' ? '⚡' : res.decisionSupport.protocolType === 'LOW_DOSE_MICRO_INDUCTION_LDI' ? '🧪' : '🛑' }}
                      </span>
                      <strong class="text-sm uppercase tracking-wider font-mono"
                              [class.text-amber-300]="res.decisionSupport.protocolType === 'NON_OPIOID_COMFORT_MEASURES'"
                              [class.text-teal-300]="res.decisionSupport.protocolType === 'YALE_STANDARD_RAPID_INDUCTION'"
                              [class.text-cyan-300]="res.decisionSupport.protocolType === 'LOW_DOSE_MICRO_INDUCTION_LDI'">
                        {{ res.decisionSupport.protocolType.replace(/_/g, ' ') }}
                      </strong>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Precipitated Withdrawal Risk: <strong [class.text-rose-400]="res.decisionSupport.precipitatedWithdrawalRisk === 'CRITICAL_HIGH'" [class.text-emerald-400]="res.decisionSupport.precipitatedWithdrawalRisk === 'LOW_SAFE'">{{ res.decisionSupport.precipitatedWithdrawalRisk }}</strong>
                      </span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Reassess at: <strong>{{ res.decisionSupport.reassessmentIntervalMinutes }} min</strong>
                      </span>
                    </div>
                  </div>

                  <p class="text-xs text-zinc-200 font-sans leading-relaxed pt-1">
                    {{ res.decisionSupport.primaryRecommendation }}
                  </p>

                  <p class="text-[11px] text-zinc-400 font-sans border-t border-zinc-800/80 pt-2">
                    <strong>Clinical Rationale:</strong> {{ res.decisionSupport.clinicalRationale }}
                  </p>
                </div>

                <!-- Structured Clinical Medication Orders Set -->
                <div class="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-teal-300 uppercase tracking-wider font-mono">
                      📋 Generated Medication Orders Set
                    </span>
                    <span class="text-[10px] text-zinc-400 font-mono">
                      {{ res.decisionSupport.medicationOrders.length }} Order(s) Formulated
                    </span>
                  </div>

                  <div class="space-y-2">
                    @for (order of res.decisionSupport.medicationOrders; track order.drugName) {
                      <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                        <div class="flex items-center justify-between">
                          <strong class="text-teal-300 font-mono text-xs">{{ order.drugName }}</strong>
                          <span class="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-emerald-400 border border-zinc-700 font-bold">
                            {{ order.dose }} • {{ order.route }}
                          </span>
                        </div>
                        <div class="text-[11px] text-zinc-300 font-sans">
                          <strong>Frequency:</strong> {{ order.frequency }}
                        </div>
                        <div class="text-[10px] text-zinc-400 font-sans">
                          <strong>Indication:</strong> {{ order.indication }}
                        </div>
                        @if (order.safetyWarning) {
                          <div class="text-[10px] text-amber-300 font-sans pt-0.5">
                            ⚠️ <strong>Safety Directive:</strong> {{ order.safetyWarning }}
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>

                <!-- Take-Home Naloxone Mandate Notice -->
                <div class="p-3.5 bg-rose-950/30 border border-rose-600/40 rounded-xl flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🛡️</span>
                    <div>
                      <strong class="text-rose-200 text-xs font-mono block">Universal Harm Reduction Mandate (Yale Standard)</strong>
                      <span class="text-[10px] text-zinc-400 font-sans">Co-dispense 4mg Intranasal Naloxone (Narcan) Take-Home Kit to every patient prior to discharge.</span>
                    </div>
                  </div>
                  <span class="px-2 py-1 rounded bg-rose-900/60 text-rose-200 border border-rose-500/50 text-[10px] font-bold uppercase shrink-0">
                    MANDATORY
                  </span>
                </div>
              </div>
            }
          }

          <!-- TAB 3: 4-PHASE WHOLE-PERSON RESTORATION -->
          @if (activeTab() === 'RESTORATIVE_PLAN') {
            @if (assessmentResult(); as res) {
              <div class="space-y-4">

                <!-- Interactive Patient Recovery Cross-Link Banner -->
                <div class="p-3.5 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-zinc-900 rounded-2xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🌱</span>
                    <div>
                      <strong class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 block">
                        Patient Recovery Companion &amp; Longitudinal Telemetry
                      </strong>
                      <span class="text-[11px] text-zinc-300 font-sans">
                        Phase 2/3 patient daily log tracking Craving VAS (0–10), Wearable Deep Sleep/HR Dip, Bristol Stool (OIBD), and FDA Buprenorphine Dental Defense.
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-wrap">
                    @if (navShell) {
                      <button
                        type="button"
                        id="btn-open-recovery-companion"
                        (click)="launchRecoveryCompanion()"
                        class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 shadow-sm">
                        <span>🌱</span> <span>Launch Daily Recovery Log</span>
                      </button>
                    }
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <!-- Phase 1: Acute Stabilization -->
                  <div class="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-teal-900/60 text-teal-300 flex items-center justify-center font-bold text-xs">1</span>
                      <strong class="text-xs uppercase tracking-wider text-teal-300 font-mono">Phase 1: Acute Stabilization (Days 0–7)</strong>
                    </div>
                    <ul class="space-y-1.5 text-[11px] text-zinc-300 list-disc list-inside font-sans">
                      @for (item of res.fourPhaseRestorativePlan.phase1Acute; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>

                  <!-- Phase 2: Neuroplastic Sleep -->
                  <div class="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs">2</span>
                      <strong class="text-xs uppercase tracking-wider text-cyan-300 font-mono">Phase 2: Neuroplastic &amp; Sleep Recovery (Weeks 2–12)</strong>
                    </div>
                    <ul class="space-y-1.5 text-[11px] text-zinc-300 list-disc list-inside font-sans">
                      @for (item of res.fourPhaseRestorativePlan.phase2NeuroplasticSleep; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>

                  <!-- Phase 3: Enteric & Biomechanics -->
                  <div class="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-bold text-xs">3</span>
                      <strong class="text-xs uppercase tracking-wider text-emerald-300 font-mono">Phase 3: Enteric &amp; Biomechanical Resilience (Months 3–6)</strong>
                    </div>
                    <ul class="space-y-1.5 text-[11px] text-zinc-300 list-disc list-inside font-sans">
                      @for (item of res.fourPhaseRestorativePlan.phase3EntericBiomechanics; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>

                  <!-- Phase 4: Social Coherence & Flourishing -->
                  <div class="p-4 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-lg bg-violet-900/60 text-violet-300 flex items-center justify-center font-bold text-xs">4</span>
                      <strong class="text-xs uppercase tracking-wider text-violet-300 font-mono">Phase 4: Social Coherence &amp; Flourishing (Year 1+)</strong>
                    </div>
                    <ul class="space-y-1.5 text-[11px] text-zinc-300 list-disc list-inside font-sans">
                      @for (item of res.fourPhaseRestorativePlan.phase4SocialFlourishing; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  </div>

                </div>
              </div>
            }
          }

        </div>

        <!-- FOOTER & EHR WRITEBACK CONTROLS -->
        <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
            <span>LOINC: 72514-3</span>
            <span>•</span>
            <span>Part 11 Seal: {{ assessmentResult()?.integrityDigest?.slice(0, 16) }}...</span>
          </div>

          <div class="flex items-center gap-2">
            @if (writebackReceipt()) {
              <div class="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <span>✓ Filed to EHR ({{ writebackReceipt()?.ehrVendor }})</span>
              </div>
            } @else {
              <button
                type="button"
                id="btn-cows-ehr-writeback"
                (click)="fileToEhr()"
                [disabled]="isWritingBack() || !assessmentResult()"
                class="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                @if (isWritingBack()) {
                  <span class="animate-spin">⏳</span> <span>Writing Back to EHR...</span>
                } @else {
                  <span>🏥 File to EHR (RFC 7523)</span>
                }
              </button>
            }

            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold font-mono transition cursor-pointer">
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class CowsAssessmentModalComponent implements OnInit {
  protocolService = inject(YaleAddictionProtocolService);
  readonly navShell = inject(NavigationShellService, { optional: true });

  close = output<void>();

  readonly questionnaireItems = COWS_QUESTIONNAIRE_ITEMS;
  readonly activeTab = signal<ActiveViewTab>('ASSESSMENT');
  readonly answers = signal<Record<string, number>>({});
  readonly fentanylSuspected = signal<boolean>(false);
  readonly isWritingBack = signal<boolean>(false);
  readonly writebackReceipt = signal<IEhrWritebackBatchResult | null>(null);

  readonly assessmentResult = signal<ICowsAssessmentResult | null>(null);

  readonly totalScore = computed(() => {
    const res = this.assessmentResult();
    return res ? res.totalScore : 0;
  });

  readonly currentSeverity = computed<CowsSeverityTier>(() => {
    const res = this.assessmentResult();
    return res ? res.severity : 'NONE';
  });

  async ngOnInit(): Promise<void> {
    await this.recalculate();
  }

  async selectScore(itemId: string, score: number): Promise<void> {
    const current = { ...this.answers() };
    current[itemId] = score;
    this.answers.set(current);
    await this.recalculate();
  }

  async toggleFentanyl(val: boolean): Promise<void> {
    this.fentanylSuspected.set(val);
    await this.recalculate();
  }

  async resetScoring(): Promise<void> {
    this.answers.set({});
    this.fentanylSuspected.set(false);
    this.writebackReceipt.set(null);
    await this.recalculate();
  }

  async loadPreset(preset: 'mild' | 'moderate' | 'fentanyl'): Promise<void> {
    if (preset === 'mild') {
      this.fentanylSuspected.set(false);
      this.answers.set({
        resting_pulse: 1, // 81-100 (+1)
        sweating: 1,      // chills (+1)
        restlessness: 1,  // diff sitting (+1)
        pupil_size: 1,    // larger (+1)
        bone_joint_aches: 1, // mild discomfort (+1)
        yawning: 1        // 1-2 yawns (+1)
      });
    } else if (preset === 'moderate') {
      this.fentanylSuspected.set(false);
      this.answers.set({
        resting_pulse: 2,   // 101-120 (+2)
        sweating: 2,        // beads of sweat (+2)
        restlessness: 3,    // shifting (+3)
        pupil_size: 2,      // dilated (+2)
        bone_joint_aches: 2,// severe aching (+2)
        runny_nose_tearing: 2, // running (+2)
        tremor: 2,          // visible tremor (+2)
        yawning: 1          // (+1)
      });
    } else if (preset === 'fentanyl') {
      this.fentanylSuspected.set(true);
      this.answers.set({
        resting_pulse: 1,
        sweating: 2,
        pupil_size: 1,
        bone_joint_aches: 2,
        anxiety_irritability: 1
      });
    }
    await this.recalculate();
    this.activeTab.set('DECISION_SUPPORT');
  }

  async recalculate(): Promise<void> {
    const res = await this.protocolService.calculateCows(this.answers(), {
      fentanylSuspected: this.fentanylSuspected()
    });
    this.assessmentResult.set(res);
  }

  async fileToEhr(): Promise<void> {
    const res = this.assessmentResult();
    if (!res) return;

    this.isWritingBack.set(true);
    try {
      const receipt = await this.protocolService.writeBackToEhr(res);
      this.writebackReceipt.set(receipt);
    } finally {
      this.isWritingBack.set(false);
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  launchRecoveryCompanion(): void {
    this.navShell?.openRecoveryModal();
  }
}
