import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntimacyRelationshipVitalityService, ICardiacSafetyAssessment, IAdaptivePositioningGuide, IEnergyPacingPlan } from '../services/intimacy-relationship-vitality.service';
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
                Princeton III & AHA Guidelines
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Evidence-based cardiovascular risk stratification, nitrate-PDE5 contraindication checks, couples energy pacing, and adaptive ergonomics.
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

    </div>
  `
})
export class IntimacyRelationshipVitalityComponent {
  private vitalityService = inject(IntimacyRelationshipVitalityService);
  private patientState = inject(PatientStateService, { optional: true });

  activeSubTab = signal<'cardiac' | 'pacing' | 'ergonomics'>('cardiac');

  canClimbStairs = true;
  hasRecentEvent = false;
  hasUnstableAngina = false;
  medsInput = 'Atorvastatin 20mg, Lisinopril 10mg';

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
}
