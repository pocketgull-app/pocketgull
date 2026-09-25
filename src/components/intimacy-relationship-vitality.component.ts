import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntimacyRelationshipVitalityService, ICardiacSafetyAssessment, IAdaptivePositioningGuide, IEnergyPacingPlan } from '../services/intimacy-relationship-vitality.service';
import { CouplesDecisionStudioService, IValuesDimension, DecisionCategory, IPreMortemAnalysis, IFairPlayOwnership } from '../services/couples-decision-studio.service';
import { SleepVagalFlourishingService } from '../services/sleep-vagal-flourishing.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-intimacy-relationship-vitality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl shadow-xs">
            ❤️
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white">
                Cardiovascular Intimacy Safety & Couples Vitality Studio
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                Princeton III & Deliberation Architecture
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Evidence-based cardiovascular risk stratification, nitrate-PDE5 checks, couples energy pacing, adaptive ergonomics, and joint decision co-regulation.
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-bold font-mono">
        <button (click)="activeSubTab.set('cardiac')"
                [class.bg-rose-500]="activeSubTab() === 'cardiac'"
                [class.text-zinc-950]="activeSubTab() === 'cardiac'"
                [class.text-zinc-300]="activeSubTab() !== 'cardiac'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🫀 1. Cardiovascular Safety & Nitrates/PDE-5</span>
        </button>
        <button (click)="activeSubTab.set('pacing')"
                [class.bg-amber-500]="activeSubTab() === 'pacing'"
                [class.text-zinc-950]="activeSubTab() === 'pacing'"
                [class.text-zinc-300]="activeSubTab() !== 'pacing'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🕯️ 2. Couples Energy Pacing & PEM Budget</span>
        </button>
        <button (click)="activeSubTab.set('ergonomics')"
                [class.bg-emerald-500]="activeSubTab() === 'ergonomics'"
                [class.text-zinc-950]="activeSubTab() === 'ergonomics'"
                [class.text-zinc-300]="activeSubTab() !== 'ergonomics'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>🛋️ 3. Adaptive Positioning (Stroke/Joints)</span>
        </button>
        <button (click)="activeSubTab.set('decisions')"
                [class.bg-indigo-500]="activeSubTab() === 'decisions'"
                [class.text-zinc-950]="activeSubTab() === 'decisions'"
                [class.text-zinc-300]="activeSubTab() !== 'decisions'"
                class="px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5">
          <span>⚖️ 4. Couples Joint Decisions & Co-Regulation</span>
        </button>
      </div>

      <!-- SUBTAB 1: Cardiovascular Safety & Nitrates / PDE-5 -->
      @if (activeSubTab() === 'cardiac') {
        <div class="space-y-4 animate-fadeIn">
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <h4 class="text-xs font-mono font-black uppercase text-rose-400 flex items-center gap-2">
              <span>🫀 Princeton Consensus III Risk Evaluator</span>
            </h4>

            <!-- Interactive Risk Questionnaire -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h5 class="text-xs font-bold text-zinc-200">Exertion & Physical Tolerance</h5>
                <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="canClimbStairs" class="rounded text-rose-500">
                  <span>Can walk up 2 flights of stairs (~4 METs) without chest pain or severe breathlessness?</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="hasRecentEvent" class="rounded text-rose-500">
                  <span>Recent Heart Attack (MI), stent placement, or cardiac surgery within last 6 weeks?</span>
                </label>
                <label class="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="hasUnstableAngina" class="rounded text-rose-500">
                  <span>Active Unstable Angina or severe aortic stenosis?</span>
                </label>
              </div>

              <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h5 class="text-xs font-bold text-zinc-200">Medication & Substance Screening</h5>
                <div>
                  <label class="text-[11px] font-mono text-zinc-400">Current Medications (comma separated):</label>
                  <input type="text" [(ngModel)]="medsInput" placeholder="e.g. Nitroglycerin sublingual, Tadalafil 10mg, Atorvastatin"
                         class="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white">
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono text-zinc-400">Quick Test Presets:</span>
                  <button (click)="medsInput = 'Nitroglycerin spray, Sildenafil 50mg'"
                          class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono cursor-pointer">
                    🚨 Nitrate + Viagra
                  </button>
                  <button (click)="medsInput = 'Atorvastatin 20mg, Lisinopril 10mg'"
                          class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono cursor-pointer">
                    ✅ Safe Statin/ACEi
                  </button>
                </div>
              </div>
            </div>

            <!-- Live Safety Assessment Result Banner -->
            @let assessment = cardiacAssessment();
            <div class="p-4 rounded-2xl border space-y-3"
                 [class.bg-emerald-950/20]="assessment.riskTier === 'LOW_RISK'"
                 [class.border-emerald-500/40]="assessment.riskTier === 'LOW_RISK'"
                 [class.bg-amber-950/20]="assessment.riskTier === 'INTERMEDIATE_RISK'"
                 [class.border-amber-500/40]="assessment.riskTier === 'INTERMEDIATE_RISK'"
                 [class.bg-red-950/30]="assessment.riskTier === 'HIGH_RISK_CONTRAINDICATED'"
                 [class.border-red-500/50]="assessment.riskTier === 'HIGH_RISK_CONTRAINDICATED'">
              
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">
                    {{ assessment.riskTier === 'LOW_RISK' ? '✅' : (assessment.riskTier === 'INTERMEDIATE_RISK' ? '⚠️' : '🚨') }}
                  </span>
                  <span class="text-sm font-black tracking-wider uppercase font-mono"
                        [class.text-emerald-300]="assessment.riskTier === 'LOW_RISK'"
                        [class.text-amber-300]="assessment.riskTier === 'INTERMEDIATE_RISK'"
                        [class.text-red-300]="assessment.riskTier === 'HIGH_RISK_CONTRAINDICATED'">
                    {{ assessment.riskTier.replace('_', ' ') }}
                  </span>
                </div>
                <span class="text-xs font-mono text-zinc-300">
                  Estimated MET Capacity: <strong>{{ assessment.metCapacity }} METs</strong>
                </span>
              </div>

              <!-- Nitrate + PDE-5 Alert -->
              @if (assessment.nitratePde5Status.isContraindicated) {
                <div class="p-3 rounded-xl bg-red-900/60 border border-red-500 text-red-100 text-xs font-bold space-y-1">
                  <div>🚨 CRITICAL DRUG CONTRAINDICATION DETECTED!</div>
                  <div class="font-normal font-sans">{{ assessment.nitratePde5Status.clinicalWarning }}</div>
                  <div class="text-[11px] font-mono text-yellow-300">
                    Mandatory Washout Interval: {{ assessment.nitratePde5Status.requiredWashoutHours }} hours separation required.
                  </div>
                </div>
              }

              <!-- Clinical Recommendations List -->
              <ul class="space-y-1 text-xs text-zinc-200 list-disc list-inside">
                @for (rec of assessment.recommendations; track rec) {
                  <li>{{ rec }}</li>
                }
              </ul>

              <div class="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
                Reference: {{ assessment.evidenceReference }}
              </div>
            </div>
          </div>
        </div>
      }

      <!-- SUBTAB 2: Couples Energy Pacing & PEM Budget -->
      @if (activeSubTab() === 'pacing') {
        <div class="space-y-4 animate-fadeIn">
          @for (plan of energyPlans(); track plan.planTitle) {
            <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div class="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div>
                  <h4 class="text-sm font-black text-white flex items-center gap-2">
                    <span>🕯️ {{ plan.planTitle }}</span>
                  </h4>
                  <span class="text-xs font-semibold text-amber-400">{{ plan.targetCondition }}</span>
                </div>
                <span class="text-xs font-mono px-3 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Spoon Theory Pacing
                </span>
              </div>

              <!-- 3-Phase Spoon Budget Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-amber-500/20 space-y-1">
                  <div class="text-xs font-bold text-amber-300 font-mono">Phase 1: Rest Prep</div>
                  <p class="text-[11px] text-zinc-300">{{ plan.spoonAllocation.prepPhase }}</p>
                </div>
                <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-rose-500/20 space-y-1">
                  <div class="text-xs font-bold text-rose-300 font-mono">Phase 2: Connection</div>
                  <p class="text-[11px] text-zinc-300">{{ plan.spoonAllocation.connectionPhase }}</p>
                </div>
                <div class="p-3.5 rounded-xl bg-zinc-950/80 border border-emerald-500/20 space-y-1">
                  <div class="text-xs font-bold text-emerald-300 font-mono">Phase 3: Restorative Sleep</div>
                  <p class="text-[11px] text-zinc-300">{{ plan.spoonAllocation.postRestPhase }}</p>
                </div>
              </div>

              <!-- Environmental & Digestive Timing Guidelines -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div class="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <div class="font-bold text-zinc-200">💡 Sensory & Environmental Pacing:</div>
                  <ul class="space-y-1 text-zinc-300 list-disc list-inside">
                    @for (tip of plan.environmentalPacingTips; track tip) {
                      <li>{{ tip }}</li>
                    }
                  </ul>
                </div>

                <div class="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                  <div class="font-bold text-zinc-200">🍽️ Digestive Circulatory Timing:</div>
                  <p class="text-zinc-300 leading-relaxed">{{ plan.nutritionDigestiveTiming }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- SUBTAB 3: Adaptive Positioning & Occupational Ergonomics -->
      @if (activeSubTab() === 'ergonomics') {
        <div class="space-y-4 animate-fadeIn">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (guide of adaptiveGuides(); track guide.injuryOrCondition) {
              <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <h4 class="text-xs font-black text-white">{{ guide.injuryOrCondition }}</h4>
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    SNOMED {{ guide.snomedCode }} / {{ guide.icd10Code }}
                  </span>
                </div>

                <div class="p-2.5 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-200">
                  <strong>⚠️ Risk to Avoid:</strong> {{ guide.primaryRiskToAvoid }}
                </div>

                <div class="space-y-1 text-xs">
                  <div class="font-bold text-emerald-400 text-[11px]">🛠️ Recommended Assistive Supports:</div>
                  <ul class="text-zinc-300 list-disc list-inside text-[11px] space-y-0.5">
                    @for (sup of guide.recommendedSupports; track sup) {
                      <li>{{ sup }}</li>
                    }
                  </ul>
                </div>

                <div class="space-y-1 text-xs">
                  <div class="font-bold text-cyan-400 text-[11px]">📐 Ergonomic Positioning Techniques:</div>
                  <ul class="text-zinc-300 list-disc list-inside text-[11px] space-y-0.5">
                    @for (tech of guide.ergonomicTechniques; track tech) {
                      <li>{{ tech }}</li>
                    }
                  </ul>
                </div>

                <div class="text-[10px] font-mono text-zinc-400 italic pt-1 border-t border-zinc-800">
                  Biomechanical Note: {{ guide.anatomicalIllustrationNote }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- SUBTAB 4: Couples Joint Decisions & Co-Regulation -->
      @if (activeSubTab() === 'decisions') {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Co-Regulation & HALT Guard Card -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🧘</span>
                <div>
                  <h4 class="text-sm font-black text-indigo-300">Phase 0: Autonomic Co-Regulation & HALT Pre-Flight</h4>
                  <p class="text-[11px] text-zinc-400">Never deliberate high-stakes life choices in sympathetic fight-or-flight or somatic exhaustion.</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border"
                      [class.bg-emerald-500/20]="reversibilityGate().haltRuleCheckPassed"
                      [class.text-emerald-300]="reversibilityGate().haltRuleCheckPassed"
                      [class.border-emerald-500/40]="reversibilityGate().haltRuleCheckPassed"
                      [class.bg-rose-500/20]="!reversibilityGate().haltRuleCheckPassed"
                      [class.text-rose-300]="!reversibilityGate().haltRuleCheckPassed"
                      [class.border-rose-500/40]="!reversibilityGate().haltRuleCheckPassed">
                  {{ reversibilityGate().autonomicReadiness }}
                </span>
              </div>
            </div>

            <!-- HALT Toggles & Vagal Pacer -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">🥗 Somatic State (HALT)</span>
                <label class="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="isPartnerHungryOrTired" class="rounded text-indigo-500">
                  <span>Either partner hungry, tired, or depleted?</span>
                </label>
                <label class="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="isHeartRateElevated" class="rounded text-indigo-500">
                  <span>Heart rate elevated (>85 bpm) or defensive tension?</span>
                </label>
              </div>

              <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span class="text-xs font-bold text-zinc-200">🚪 Reversibility Type (Bezos/Kahneman)</span>
                <label class="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="isEasilyReversible" class="rounded text-indigo-500">
                  <span>Is this easily reversible within 60-90 days? (Type 2)</span>
                </label>
                <label class="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer">
                  <input type="checkbox" [(ngModel)]="financialThresholdExceeded" class="rounded text-indigo-500">
                  <span>Financial commitment exceeds 20% of net savings?</span>
                </label>
              </div>

              <div class="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-indigo-200">💨 0.10 Hz Mayer Resonance</span>
                    <span class="text-[10px] font-mono text-indigo-400">6.0 bpm</span>
                  </div>
                  <p class="text-[10px] text-zinc-400 mt-1">
                    Breathe together for 3 minutes (4s Inhale / 6s Exhale) to maximize baroreceptor coherence and drop defensiveness.
                  </p>
                </div>
                <div class="mt-2 text-[11px] font-mono font-bold text-indigo-300">
                  Co-Regulation Mode: Active
                </div>
              </div>
            </div>

            <!-- Experiment Suggestion -->
            <div class="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-start gap-2.5">
              <span class="text-sm">🧪</span>
              <div class="text-[11px] text-zinc-300">
                <span class="font-bold text-indigo-300">Safe-to-Test 60-Day Low-Stakes Experiment:</span>
                <span class="ml-1 text-zinc-200">{{ reversibilityGate().safeToTestExperiment }}</span>
                @if (reversibilityGate().coolingOffPeriodHours > 0) {
                  <span class="ml-2 font-mono text-amber-400 font-bold">
                    ⏱️ {{ reversibilityGate().coolingOffPeriodHours }}h Cooling-Off Buffer Mandated
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Section 1: Shared Values Venn & Alignment Grid -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <h4 class="text-xs font-mono font-black uppercase text-indigo-400 flex items-center gap-2">
                <span>🎯 Core Values Alignment & Tension Radar</span>
              </h4>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold"
                      [class.text-emerald-400]="valuesAlignment().divergenceLevel === 'HARMONIOUS'"
                      [class.text-amber-400]="valuesAlignment().divergenceLevel === 'MODERATE_DIVERGENCE'"
                      [class.text-rose-400]="valuesAlignment().divergenceLevel === 'HIGH_FRICTION_RISK'">
                  Overall Alignment: {{ valuesAlignment().overallAlignmentPercentage }}%
                </span>
                <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase border border-zinc-700 bg-zinc-800 text-zinc-300">
                  {{ valuesAlignment().divergenceLevel }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (dim of valuesDimensions; track dim.id) {
                <div class="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-200">{{ dim.name }}</span>
                    <span class="text-[10px] font-mono text-zinc-500">Weight: {{ dim.weight }}x</span>
                  </div>
                  <p class="text-[10px] text-zinc-400 line-clamp-1">{{ dim.description }}</p>

                  <div class="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div class="flex justify-between text-[10px] font-mono text-cyan-400">
                        <span>Partner A</span>
                        <span class="font-bold">{{ dim.scorePartnerA }}/10</span>
                      </div>
                      <input type="range" min="1" max="10" [(ngModel)]="dim.scorePartnerA" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-cyan-500">
                    </div>
                    <div>
                      <div class="flex justify-between text-[10px] font-mono text-rose-400">
                        <span>Partner B</span>
                        <span class="font-bold">{{ dim.scorePartnerB }}/10</span>
                      </div>
                      <input type="range" min="1" max="10" [(ngModel)]="dim.scorePartnerB" class="w-full h-1 bg-zinc-800 rounded-lg cursor-pointer accent-rose-500">
                    </div>
                  </div>
                </div>
              }
            </div>

            @if (valuesAlignment().recommendations.length > 0) {
              <div class="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                <div class="font-bold text-indigo-300 text-[11px]">🧭 Facilitation Directives:</div>
                <ul class="list-disc list-inside text-zinc-300 text-[11px] space-y-0.5">
                  @for (rec of valuesAlignment().recommendations; track rec) {
                    <li>{{ rec }}</li>
                  }
                </ul>
              </div>
            }
          </div>

          <!-- Section 2: Gary Klein Couples Pre-Mortem Simulator -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-amber-400 flex items-center gap-2">
                  <span>🔮 Gary Klein Couples Pre-Mortem Generator</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Project 2 years into the future. Assume the decision failed completely. What broke first?</p>
              </div>

              <!-- Topic Selector -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-zinc-400">Decision:</span>
                <select [(ngModel)]="selectedCategory" (ngModelChange)="updatePreMortem()" class="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white">
                  <option value="RELOCATION_HOUSING">🏡 Relocation / Housing</option>
                  <option value="CAREER_PIVOT_EDUCATION">🚀 Career Pivot / Venture</option>
                  <option value="FINANCIAL_ALLOCATION">💰 Financial Investment / Purchase</option>
                  <option value="FAMILY_PLANNING_FERTILITY">🍼 Family Planning / Fertility</option>
                  <option value="ELDER_CARE_SUPPORT">👵 Elder Caregiving Support</option>
                  <option value="HEALTH_TREATMENT_CHOICE">🩺 Medical Treatment Choice</option>
                </select>
              </div>
            </div>

            @let pm = preMortem();
            <div class="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div class="flex items-start gap-2.5">
                <span class="text-lg">⚠️</span>
                <div>
                  <div class="text-xs font-bold text-amber-200">Simulated Future Breakdown Scenario (Year +{{ pm.projectedFutureYears }}):</div>
                  <p class="text-xs text-zinc-200 mt-1 italic leading-relaxed">"{{ pm.projectedFailureScenario }}"</p>
                </div>
              </div>

              <div class="space-y-2 pt-2 border-t border-amber-500/20">
                <div class="text-[11px] font-bold text-amber-300">Identified Vulnerabilities & Proactive Safeguards:</div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  @for (rc of pm.rootCauses; track rc.factor) {
                    <div class="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                      <div class="flex items-center justify-between text-[10px] font-mono">
                        <span class="text-zinc-300 font-bold">{{ rc.factor }}</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px]"
                              [class.bg-rose-500/20]="rc.likelihood === 'HIGH'"
                              [class.text-rose-300]="rc.likelihood === 'HIGH'"
                              [class.bg-amber-500/20]="rc.likelihood === 'MEDIUM'"
                              [class.text-amber-300]="rc.likelihood === 'MEDIUM'">
                          {{ rc.likelihood }}
                        </span>
                      </div>
                      <div class="text-[10px] text-zinc-400">
                        <span class="text-emerald-400 font-semibold">Mitigation:</span> {{ rc.mitigationStrategy }}
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Circuit Breaker -->
              <div class="p-3 rounded-lg bg-zinc-950 border border-rose-500/30 flex items-start gap-2">
                <span class="text-sm">🛑</span>
                <div class="text-[11px] space-y-0.5">
                  <span class="font-bold text-rose-300">Pre-Agreed Circuit Breaker & Exit Condition:</span>
                  <p class="text-zinc-300">{{ pm.circuitBreakerCondition }}</p>
                  <p class="text-[10px] font-mono text-zinc-400">Trigger: {{ pm.contingencyTrigger }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Eve Rodsky "Fair Play" Invisible Cognitive Load Distribution -->
          <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div>
                <h4 class="text-xs font-mono font-black uppercase text-emerald-400 flex items-center gap-2">
                  <span>🃏 Eve Rodsky "Fair Play" Cognitive Load & Invisible Labor Audit</span>
                </h4>
                <p class="text-[11px] text-zinc-400 mt-0.5">Separate full ownership into Conception (C), Planning (P), and Execution (E) to eliminate unspoken resentment.</p>
              </div>
              <span class="text-[10px] font-mono text-zinc-400">Full Card Ownership = Zero Nagging</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              @for (task of fairPlayTasks; track task.id) {
                <div class="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-zinc-100">{{ task.domainName }}</span>
                    <span class="text-[10px] font-mono text-zinc-400">C-P-E Breakdown</span>
                  </div>

                  <div class="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <div class="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                      <div class="text-zinc-500">Conception</div>
                      <select [(ngModel)]="task.conceptionOwner" class="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-xs text-white">
                        <option value="PARTNER_A">Partner A</option>
                        <option value="PARTNER_B">Partner B</option>
                        <option value="SHARED">Shared</option>
                      </select>
                    </div>
                    <div class="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                      <div class="text-zinc-500">Planning</div>
                      <select [(ngModel)]="task.planningOwner" class="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-xs text-white">
                        <option value="PARTNER_A">Partner A</option>
                        <option value="PARTNER_B">Partner B</option>
                        <option value="SHARED">Shared</option>
                      </select>
                    </div>
                    <div class="p-2 rounded bg-zinc-900 border border-zinc-800 text-center">
                      <div class="text-zinc-500">Execution</div>
                      <select [(ngModel)]="task.executionOwner" class="mt-1 w-full bg-zinc-950 border border-zinc-700 rounded px-1 py-0.5 text-xs text-white">
                        <option value="PARTNER_A">Partner A</option>
                        <option value="PARTNER_B">Partner B</option>
                        <option value="SHARED">Shared</option>
                      </select>
                    </div>
                  </div>

                  <p class="text-[10px] text-zinc-400 italic">"{{ task.frictionNotes }}"</p>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class IntimacyRelationshipVitalityComponent {
  private vitalityService = inject(IntimacyRelationshipVitalityService);
  private decisionStudioService = inject(CouplesDecisionStudioService);
  private vagalService = inject(SleepVagalFlourishingService, { optional: true });
  private patientState = inject(PatientStateService, { optional: true });

  activeSubTab = signal<'cardiac' | 'pacing' | 'ergonomics' | 'decisions'>('cardiac');

  // Subtab 1 State
  canClimbStairs = true;
  hasRecentEvent = false;
  hasUnstableAngina = false;
  medsInput = 'Atorvastatin 20mg, Lisinopril 10mg';

  // Subtab 4 Decisions State
  isPartnerHungryOrTired = false;
  isHeartRateElevated = false;
  isEasilyReversible = false;
  financialThresholdExceeded = true;
  selectedCategory: DecisionCategory = 'RELOCATION_HOUSING';

  valuesDimensions: IValuesDimension[] = this.decisionStudioService.getDefaultValuesDimensions();
  fairPlayTasks: IFairPlayOwnership[] = this.decisionStudioService.getDefaultFairPlayTasks();

  readonly adaptiveGuides = computed<IAdaptivePositioningGuide[]>(() => this.vitalityService.getAdaptiveGuides());
  readonly energyPlans = computed<IEnergyPacingPlan[]>(() => this.vitalityService.getEnergyPlans());

  readonly cardiacAssessment = computed<ICardiacSafetyAssessment>(() => {
    const meds = this.medsInput.split(',').map(m => m.trim()).filter(Boolean);
    return this.vitalityService.evaluateCardiacSafety({
      canClimbTwoFlightsStairs: this.canClimbStairs,
      hasRecentMI: this.hasRecentEvent,
      hasUnstableAngina: this.hasUnstableAngina,
      medications: meds
    });
  });

  readonly valuesAlignment = computed(() => {
    return this.decisionStudioService.evaluateValuesAlignment(this.valuesDimensions);
  });

  readonly reversibilityGate = computed(() => {
    return this.decisionStudioService.evaluateReversibilityGate({
      category: this.selectedCategory,
      isEasilyReversible: this.isEasilyReversible,
      financialCostThresholdExceeded: this.financialThresholdExceeded,
      isPartnerHungryOrTired: this.isPartnerHungryOrTired,
      isHeartRateElevatedOrSympathetic: this.isHeartRateElevated
    });
  });

  readonly preMortem = signal<IPreMortemAnalysis>(
    this.decisionStudioService.generatePreMortem('Primary Life Decision', 'RELOCATION_HOUSING', 2)
  );

  updatePreMortem(): void {
    const title = this.selectedCategory === 'RELOCATION_HOUSING' ? 'Relocation & Housing Transition'
      : this.selectedCategory === 'CAREER_PIVOT_EDUCATION' ? 'Career Pivot / New Venture'
      : this.selectedCategory === 'FINANCIAL_ALLOCATION' ? 'Major Asset / Capital Allocation'
      : this.selectedCategory === 'FAMILY_PLANNING_FERTILITY' ? 'Family Expansion & Child Care'
      : this.selectedCategory === 'ELDER_CARE_SUPPORT' ? 'Elder Caregiving Transitions'
      : 'Clinical Treatment Choice';

    this.preMortem.set(
      this.decisionStudioService.generatePreMortem(title, this.selectedCategory, 2)
    );
  }
}

