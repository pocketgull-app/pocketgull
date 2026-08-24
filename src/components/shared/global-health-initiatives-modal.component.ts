import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalHealthInitiativesService, IWhoCvdRiskResult, IWhoIcd11TmMapping, INihHealthspanAssessment, IArpahTriageResult, IWhoIcopeAssessment, INihRecoverAssessment } from '../../services/global-health-initiatives.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IPatient, IPatientVitals } from '../../services/patient.types';

@Component({
  selector: 'app-global-health-initiatives-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        
        <div class="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans animate-in zoom-in-95 duration-200">
          
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl font-bold border border-sky-500/20 shadow-xs">
                🌐
              </div>
              <div>
                <h3 class="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  Global Health Strategic Agency Suite
                  <span class="px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-500/30">
                    WHO • NIH • NSF • ARPA-H
                  </span>
                </h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Cardiometabolic NCD Shields, WHO ICOPE Intrinsic Capacity, NIH RECOVER Long-COVID &amp; Vagal Pacing
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button type="button" (click)="close()"
                    class="w-8 h-8 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                    title="Close Modal">
              ✕
            </button>
          </div>

          <!-- Agency Tab Switcher Ribbon -->
          <div class="flex items-center gap-2 px-6 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 text-xs font-bold font-mono">
            <button type="button" (click)="activeAgencyTab.set('who')"
                    [class.bg-sky-600]="activeAgencyTab() === 'who'"
                    [class.text-white]="activeAgencyTab() === 'who'"
                    [class.text-zinc-600]="activeAgencyTab() !== 'who'"
                    [class.dark:text-zinc-400]="activeAgencyTab() !== 'who'"
                    class="px-3.5 py-1.5 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
              <span>🌍</span> WHO HEARTS &amp; ICOPE
            </button>

            <button type="button" (click)="activeAgencyTab.set('nih')"
                    [class.bg-indigo-600]="activeAgencyTab() === 'nih'"
                    [class.text-white]="activeAgencyTab() === 'nih'"
                    [class.text-zinc-600]="activeAgencyTab() !== 'nih'"
                    [class.dark:text-zinc-400]="activeAgencyTab() !== 'nih'"
                    class="px-3.5 py-1.5 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
              <span>🧬</span> NIH RECOVER &amp; Geroscience
            </button>

            <button type="button" (click)="activeAgencyTab.set('arpah')"
                    [class.bg-amber-600]="activeAgencyTab() === 'arpah'"
                    [class.text-white]="activeAgencyTab() === 'arpah'"
                    [class.text-zinc-600]="activeAgencyTab() !== 'arpah'"
                    [class.dark:text-zinc-400]="activeAgencyTab() !== 'arpah'"
                    class="px-3.5 py-1.5 rounded-xl border border-transparent transition cursor-pointer flex items-center gap-1.5">
              <span>🛡️</span> ARPA-H Resilient Triage
            </button>
          </div>

          <!-- Tab Content Scrollable Container -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">

            <!-- TAB 1: WHO Global Health -->
            @if (activeAgencyTab() === 'who') {
              <div class="space-y-6">
                <!-- 10-Year CVD Risk Gauge Card -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-[10.5px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
                        WHO HEARTS Package • UN SDG 3.4
                      </span>
                      <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        10-Year Cardiovascular &amp; Non-Communicable Disease (NCD) Risk
                      </h4>
                    </div>
                    <div class="text-right">
                      <span class="text-2xl font-black font-mono" [ngClass]="whoCvdRisk().color">
                        {{ whoCvdRisk().riskScorePercent }}%
                      </span>
                      <span class="block text-[10px] font-bold font-mono text-zinc-500">
                        {{ whoCvdRisk().riskTier }}
                      </span>
                    </div>
                  </div>

                  <!-- Visual Progress Bar -->
                  <div class="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                         [style.width.%]="whoCvdRisk().riskScorePercent"></div>
                  </div>

                  <p class="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                    {{ whoCvdRisk().sdg34TargetAssessment }}
                  </p>

                  <!-- WHO HEARTS Protocol Directives -->
                  <div class="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">WHO HEARTS Protocol Directives:</span>
                    @for (rec of whoCvdRisk().whoHeartsRecommendations; track $index) {
                      <div class="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span class="text-sky-500 font-bold">✓</span>
                        <span>{{ rec }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- WHO ICOPE (Integrated Care for Older People) Intrinsic Capacity Card -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-[10.5px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">
                        WHO Guidelines on Community-Level Interventions (ICOPE)
                      </span>
                      <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        WHO ICOPE Intrinsic Capacity Scorecard
                      </h4>
                    </div>
                    <div class="text-right">
                      <span class="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                        {{ whoIcope().intrinsicCapacityScore }}/6
                      </span>
                      <span class="block text-[10px] font-bold font-mono text-zinc-500">
                        {{ whoIcope().intrinsicCapacityPercent }}% Capacity
                      </span>
                    </div>
                  </div>

                  <div class="px-3 py-1.5 rounded-xl text-xs font-semibold"
                       [class.bg-emerald-500/10]="whoIcope().statusTier === 'OPTIMAL_CAPACITY'"
                       [class.text-emerald-700]="whoIcope().statusTier === 'OPTIMAL_CAPACITY'"
                       [class.dark:text-emerald-300]="whoIcope().statusTier === 'OPTIMAL_CAPACITY'"
                       [class.bg-amber-500/10]="whoIcope().statusTier === 'MILD_DECLINE' || whoIcope().statusTier === 'MODERATE_DECLINE'"
                       [class.text-amber-700]="whoIcope().statusTier === 'MILD_DECLINE' || whoIcope().statusTier === 'MODERATE_DECLINE'"
                       [class.dark:text-amber-300]="whoIcope().statusTier === 'MILD_DECLINE' || whoIcope().statusTier === 'MODERATE_DECLINE'"
                       [class.bg-rose-500/10]="whoIcope().statusTier === 'SIGNIFICANT_IMPAIRMENT'"
                       [class.text-rose-700]="whoIcope().statusTier === 'SIGNIFICANT_IMPAIRMENT'"
                       [class.dark:text-rose-300]="whoIcope().statusTier === 'SIGNIFICANT_IMPAIRMENT'">
                    {{ whoIcope().statusLabel }}
                  </div>

                  <!-- 6 Domains Grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    @for (dom of whoIcope().domains; track dom.domain) {
                      <div class="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-1 text-xs">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ dom.domain }}</span>
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                                [class.bg-emerald-500/10]="dom.status === 'Intact'"
                                [class.text-emerald-700]="dom.status === 'Intact'"
                                [class.dark:text-emerald-300]="dom.status === 'Intact'"
                                [class.bg-rose-500/10]="dom.status === 'Decline Flagged'"
                                [class.text-rose-700]="dom.status === 'Decline Flagged'"
                                [class.dark:text-rose-300]="dom.status === 'Decline Flagged'">
                            {{ dom.status }}
                          </span>
                        </div>
                        <p class="text-[11px] text-zinc-500 dark:text-zinc-400">{{ dom.assessmentDetails }}</p>
                      </div>
                    }
                  </div>

                  <!-- ICOPE Action Directives -->
                  <div class="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">WHO ICOPE Priority Clinical Directives:</span>
                    @for (dir of whoIcope().clinicalDirectives; track $index) {
                      <div class="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span class="text-teal-500 font-bold">✓</span>
                        <span>{{ dir }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- WHO ICD-11 Chapter 26 Traditional Medicine Dual-Coding Table -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                        WHO TCIM Global Strategy (2025–2034)
                      </span>
                      <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        WHO ICD-11 Chapter 26 (TM1) Dual-Coding Harmonization
                      </h4>
                    </div>
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10.5px] font-bold border border-emerald-500/30">
                      Standardized Crosswalk
                    </span>
                  </div>

                  <div class="space-y-3">
                    @for (map of whoIcd11Mappings(); track $index) {
                      <div class="p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-zinc-900 dark:text-zinc-100">{{ map.syndromeName }}</span>
                          <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            {{ map.icd11Tm1Code }}
                          </span>
                        </div>
                        <div class="text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap gap-2">
                          <span>Biomedical: {{ map.biomedicalCorrelates.join(', ') }}</span>
                        </div>
                        <div class="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                          🌿 Evidence-Based Phytotherapy: {{ map.recommendedPhytotherapy }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- TAB 2: NIH Precision Geroscience & RECOVER Long-COVID -->
            @if (activeAgencyTab() === 'nih') {
              <div class="space-y-6">
                <!-- NIH RECOVER 12-Symptom Long-COVID Assessment Card -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-[10.5px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
                        NIH RECOVER Initiative • JAMA Research Consensus
                      </span>
                      <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        NIH RECOVER Long-COVID / PASC 12-Symptom Phenotype Engine
                      </h4>
                    </div>
                    <div class="text-right">
                      <span class="text-2xl font-black font-mono"
                            [class.text-rose-600]="nihRecover().thresholdMet"
                            [class.text-amber-500]="!nihRecover().thresholdMet && nihRecover().pascScore >= 6"
                            [class.text-emerald-500]="nihRecover().pascScore < 6">
                        {{ nihRecover().pascScore }} / 27
                      </span>
                      <span class="block text-[10px] font-bold font-mono text-zinc-500">
                        PASC Threshold $\ge 12$
                      </span>
                    </div>
                  </div>

                  <div class="px-3 py-1.5 rounded-xl text-xs font-semibold"
                       [class.bg-rose-500/10]="nihRecover().thresholdMet"
                       [class.text-rose-700]="nihRecover().thresholdMet"
                       [class.dark:text-rose-300]="nihRecover().thresholdMet"
                       [class.bg-amber-500/10]="!nihRecover().thresholdMet && nihRecover().pascScore >= 6"
                       [class.text-amber-700]="!nihRecover().thresholdMet && nihRecover().pascScore >= 6"
                       [class.dark:text-amber-300]="!nihRecover().thresholdMet && nihRecover().pascScore >= 6"
                       [class.bg-emerald-500/10]="nihRecover().pascScore < 6"
                       [class.text-emerald-700]="nihRecover().pascScore < 6"
                       [class.dark:text-emerald-300]="nihRecover().pascScore < 6">
                    {{ nihRecover().pascClassification }}
                  </div>

                  <!-- Evaluated Symptoms Pill Cloud -->
                  <div class="flex flex-wrap gap-2 pt-1">
                    @for (sym of nihRecover().symptoms; track sym.name) {
                      <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono border"
                            [class.bg-rose-500/15]="sym.present"
                            [class.text-rose-700]="sym.present"
                            [class.dark:text-rose-300]="sym.present"
                            [class.border-rose-500/30]="sym.present"
                            [class.font-bold]="sym.present"
                            [class.bg-zinc-100]="!sym.present"
                            [class.dark:bg-zinc-900]="!sym.present"
                            [class.text-zinc-400]="!sym.present"
                            [class.border-zinc-200]="!sym.present"
                            [class.dark:border-zinc-800]="!sym.present">
                        {{ sym.name }} (+{{ sym.weight }}) {{ sym.present ? '●' : '○' }}
                      </span>
                    }
                  </div>

                  <!-- RECOVER Pacing & Recovery Directives -->
                  <div class="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">NIH RECOVER Energy Envelope &amp; Autonomic Directives:</span>
                    @for (rec of nihRecover().pacingAndRecoveryDirectives; track $index) {
                      <div class="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <span class="text-rose-500 font-bold">✓</span>
                        <span>{{ rec }}</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Biological Age Card -->
                  <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span class="text-[10.5px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                      NIH NIA Geroscience Clock
                    </span>
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl font-black font-mono text-zinc-900 dark:text-zinc-50">
                        {{ nihAssessment().estimatedBiologicalAge }}
                      </span>
                      <span class="text-xs text-zinc-400">Biological Age (Years)</span>
                    </div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">
                      Chronological: {{ nihAssessment().chronologicalAge }} yrs (Delta: {{ nihAssessment().biologicalAgeDelta > 0 ? '+' : '' }}{{ nihAssessment().biologicalAgeDelta }} yrs)
                    </p>
                  </div>

                  <!-- Vagal Tone Index -->
                  <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span class="text-[10.5px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">
                      NIH BRAIN Vagal Tone Score
                    </span>
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
                        {{ nihAssessment().vagalToneScore }}
                      </span>
                      <span class="text-xs text-zinc-400">/ 100</span>
                    </div>
                    <p class="text-xs text-teal-700 dark:text-teal-300 font-semibold">
                      {{ nihAssessment().autonomicState }}
                    </p>
                  </div>
                </div>

                <!-- Animated 0.1 Hz RSA Resonance Breathing Pacer -->
                <div class="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col items-center justify-center text-center space-y-4">
                  <span class="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    0.1 Hz Vagal Baroreflex Resonance Pacer (6 Breaths / Min)
                  </span>
                  
                  <div class="relative w-28 h-28 flex items-center justify-center">
                    <div class="w-24 h-24 rounded-full bg-indigo-500/20 border-2 border-indigo-500 animate-ping opacity-60"></div>
                    <div class="absolute w-20 h-20 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-lg">
                      Breathe
                    </div>
                  </div>

                  <p class="text-xs text-zinc-600 dark:text-zinc-300 max-w-md">
                    {{ nihAssessment().recommended01HzPacingRate }}
                  </p>
                </div>
              </div>
            }

            <!-- TAB 3: ARPA-H & NSF Resilient Triage -->
            @if (activeAgencyTab() === 'arpah') {
              <div class="space-y-6">
                <!-- Triage Category Banner -->
                <div class="p-5 rounded-2xl border space-y-3" [ngClass]="arpahTriage().triageColor">
                  <div class="flex items-center justify-between">
                    <span class="text-[10.5px] font-bold uppercase tracking-wider font-mono">
                      ARPA-H Point-of-Care Disaster Protocol (START/SALT)
                    </span>
                    <span class="px-3 py-1 rounded-xl text-xs font-black font-mono uppercase bg-white/60 dark:bg-zinc-900/80 border">
                      {{ arpahTriage().triageCategory }}
                    </span>
                  </div>

                  <div class="space-y-1 text-xs">
                    <span class="font-bold block">Priority Action Directives:</span>
                    @for (dir of arpahTriage().actionableDirectives; track $index) {
                      <div class="flex items-start gap-2">
                        <span>🚨</span>
                        <span>{{ dir }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Mesh Handoff Payload -->
                <div class="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                      NSF Zero-Egress Offline Peer Mesh Payload
                    </span>
                    <button type="button" (click)="copyPayload()" class="px-2.5 py-1 rounded-md text-[10.5px] font-bold font-mono bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer">
                      {{ copied() ? '✓ Copied' : '📋 Copy JSON' }}
                    </button>
                  </div>

                  <pre class="p-3 bg-zinc-900 text-zinc-200 rounded-xl text-[10.5px] font-mono overflow-x-auto max-h-36">{{ arpahTriage().meshHandoffQrCodePayload }}</pre>
                </div>
              </div>
            }

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
            <span>Conforming to WHO ICOPE, ICD-11 TM1, NIH RECOVER &amp; NSF SCH Standards</span>
            <button type="button" (click)="close()"
                    class="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition cursor-pointer">
              Done
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class GlobalHealthInitiativesModalComponent {
  private service = inject(GlobalHealthInitiativesService);
  private patientState = inject(PatientStateService);

  isOpen = signal<boolean>(false);
  activeAgencyTab = signal<'who' | 'nih' | 'arpah'>('who');
  copied = signal<boolean>(false);

  readonly currentPatient = computed<IPatient>(() => {
    const history = this.patientState.patientHistory ? this.patientState.patientHistory() : [];
    const rawVitals = this.patientState.vitals ? this.patientState.vitals() : null;
    const vitals: IPatientVitals = {
      bp: rawVitals?.bp || '120/80',
      hr: rawVitals?.hr || '72',
      spO2: rawVitals?.spO2 || '98',
      temp: rawVitals?.temp || '37.0',
      weight: rawVitals?.weight || '70',
      height: rawVitals?.height || '170',
      ...rawVitals
    };
    const issues = this.patientState.issues ? this.patientState.issues() : {};
    const goals = this.patientState.patientGoals ? this.patientState.patientGoals() : '';

    return {
      id: 'active-patient',
      name: 'Active Patient',
      age: 48,
      gender: 'Female',
      vitals,
      preexistingConditions: history.map(h => h.summary || ''),
      history,
      bookmarks: [],
      issues,
      patientGoals: goals,
      lastVisit: new Date().toISOString().split('T')[0]
    };
  });

  readonly whoCvdRisk = computed<IWhoCvdRiskResult>(() => {
    return this.service.calculateWhoCvdRisk(this.currentPatient());
  });

  readonly whoIcope = computed<IWhoIcopeAssessment>(() => {
    return this.service.assessWhoIcope(this.currentPatient());
  });

  readonly whoIcd11Mappings = computed<IWhoIcd11TmMapping[]>(() => {
    const history = this.patientState.patientHistory ? this.patientState.patientHistory().map(h => h.summary || '') : [];
    const issues = this.patientState.issues ? this.patientState.issues() : {};
    const issueNames = Object.values(issues).flat().map(i => i.description || '');
    return this.service.mapToWhoIcd11Chapter26([...history, ...issueNames]);
  });

  readonly nihAssessment = computed<INihHealthspanAssessment>(() => {
    return this.service.assessNihGeroscienceAndVagalTone(this.currentPatient());
  });

  readonly nihRecover = computed<INihRecoverAssessment>(() => {
    return this.service.assessNihRecover(this.currentPatient());
  });

  readonly arpahTriage = computed<IArpahTriageResult>(() => {
    return this.service.assessArpahEmergencyTriage(this.currentPatient());
  });

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  copyPayload(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.arpahTriage().meshHandoffQrCodePayload);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }
  }
}

