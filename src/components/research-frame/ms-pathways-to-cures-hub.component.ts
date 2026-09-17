import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';
import { ClinicalSpecialtyRiskSuiteService, IMsLifespanEvaluation, IPivotPulseCarePlanSuggestion } from '../../services/clinical-specialty-risk-suite.service';

@Component({
  selector: 'app-ms-pathways-to-cures-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto font-pocketgull-inter">
      
      <!-- Top Banner with Clinical Telemetry Badges -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🧠</span>
            <span>NMSS Pathways to Cures (Stop • Restore • End)</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            MS Lifespan Demarcation &amp; Dynamic Pivot &amp; Pulse Engine
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Precision phenotyping across Pediatric POMS, Adult RRMS, and Late-Onset LOMS/PPMS with real-time Smoldering PIRA tracking and agile care plan steering.
          </p>
        </div>

        <!-- Telemetric Indicators -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right shrink-0">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-teal-400">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span class="font-bold">Smoldering PIRA: {{ (lifespan().smolderingPiraScore * 100).toFixed(0) }}%</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Uhthoff Thermal Reserve: <span class="text-amber-400 font-bold">+{{ lifespan().uhthoffThermalReserveC }}°C</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-500">
            Active Cohort: <span class="text-zinc-300 font-semibold">{{ activePatientName() }}</span>
          </div>
        </div>
      </div>

      <!-- 1. Lifespan Phenotype Demarcation Strip -->
      <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-lg">🧬</span>
            <span class="text-xs font-bold uppercase tracking-wider text-zinc-300">Lifespan Phenotype:</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                  [ngClass]="{
                    'bg-purple-950 text-purple-300 border border-purple-700': lifespan().phenotype === 'PEDIATRIC_POMS',
                    'bg-teal-950 text-teal-300 border border-teal-700': lifespan().phenotype === 'ADULT_RRMS',
                    'bg-amber-950 text-amber-300 border border-amber-700': lifespan().phenotype === 'LATE_ONSET_LOMS_PPMS',
                    'bg-zinc-800 text-zinc-300 border border-zinc-700': lifespan().phenotype === 'GENERAL_PHYSIOLOGIC'
                  }">
              {{ formatPhenotype(lifespan().phenotype) }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Onset Age: <strong class="text-zinc-200">{{ lifespan().ageAtOnset }}y</strong></span>
            <span>•</span>
            <span>Relapse Velocity: <strong class="text-teal-300">{{ lifespan().relapseVelocityAnnualized }}/yr</strong></span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <div class="text-[10px] font-mono text-zinc-400 uppercase">PIRA Predominance</div>
            <div class="font-bold text-zinc-200 mt-0.5">{{ formatPira(lifespan().piraPredominance) }}</div>
          </div>
          <div class="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <div class="text-[10px] font-mono text-zinc-400 uppercase">Therapeutic Class</div>
            <div class="font-bold text-teal-300 mt-0.5">{{ lifespan().therapeuticClassIndication }}</div>
          </div>
          <div class="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60">
            <div class="text-[10px] font-mono text-zinc-400 uppercase">Immunosenescence Risk</div>
            <div class="font-bold mt-0.5"
                 [ngClass]="lifespan().immunosenescenceRisk === 'HIGH' ? 'text-amber-400' : 'text-emerald-400'">
              {{ lifespan().immunosenescenceRisk }} (DISCOMS Vigilance)
            </div>
          </div>
        </div>

        <!-- Clinical Pearls -->
        <div class="space-y-1 pt-1">
          @for (pearl of lifespan().clinicalPearls; track $index) {
            <div class="text-[11px] text-zinc-400 flex items-start gap-1.5">
              <span class="text-teal-400">▪</span>
              <span>{{ pearl }}</span>
            </div>
          }
        </div>
      </div>

      <!-- 2. Non-MS Differential Safety Guardrail -->
      <div class="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-1.5">
        <div class="flex items-center gap-2 text-xs font-bold text-zinc-300">
          <span>🛡️</span>
          <span>Differential Demyelinating Safety Screen (MOGAD, NMOSD, Leukodystrophies):</span>
        </div>
        @for (alert of lifespan().differentialAlerts; track $index) {
          <div class="text-xs text-zinc-400 font-mono pl-5">
            {{ alert }}
          </div>
        }
      </div>

      <!-- 3. Dynamic 3-Act Care Trajectory (Where You've Been, Where You Stand, Where You're Going) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🎭</span>
            <span>Quiet Workshop 3-Act Clinical Trajectory</span>
          </h3>
          <span class="text-[11px] font-mono text-teal-400">Patient-Centered Supportive Care</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Act 1: Where You've Been -->
          <div class="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-zinc-400 border-b border-zinc-800 pb-1.5">
              <span>Act 1: Past Baseline</span>
              <span>📜</span>
            </div>
            <p class="text-xs text-zinc-300 leading-relaxed">
              {{ carePlan().act1WhereYouveBeen }}
            </p>
          </div>

          <!-- Act 2: Where You Stand Today -->
          <div class="p-4 bg-zinc-950 border border-teal-500/30 rounded-2xl space-y-2 shadow-inner">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-teal-400 border-b border-teal-500/30 pb-1.5">
              <span>Act 2: Active Biometrics</span>
              <span>📍</span>
            </div>
            <p class="text-xs text-zinc-300 leading-relaxed">
              {{ carePlan().act2WhereYouStandToday }}
            </p>
          </div>

          <!-- Act 3: Where You're Going -->
          <div class="p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl space-y-2">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-b border-zinc-800 pb-1.5">
              <span>Act 3: Vitality Roadmap</span>
              <span>🚀</span>
            </div>
            <p class="text-xs text-zinc-300 leading-relaxed">
              {{ carePlan().act3WhereYoureGoing }}
            </p>
          </div>
        </div>
      </div>

      <!-- 4. Continuous "Pulse" Checklist & Agile "Pivot" Triggers -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Continuous Pulse Checklist -->
        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">💓</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">Continuous Pulse Telemetry</h4>
            </div>
            <span class="text-[10px] font-mono text-zinc-500">Biometric Surveillance</span>
          </div>

          <div class="space-y-2">
            @for (pulse of carePlan().continuousPulseChecklist; track pulse.metric) {
              <div class="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-zinc-200">{{ pulse.metric }}</div>
                  <div class="text-[10px] font-mono text-zinc-400">Target: <strong class="text-teal-400">{{ pulse.target }}</strong> • {{ pulse.frequency }}</div>
                </div>
                <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {{ pulse.currentValue }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Agile Pivot Triggers -->
        <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <h4 class="text-xs font-bold text-white uppercase tracking-wider">Agile Pivot Branch Rules</h4>
            </div>
            <span class="text-[10px] font-mono text-zinc-500">Evidence Grounded</span>
          </div>

          <div class="space-y-2">
            @for (pivot of carePlan().agilePivotTriggers; track pivot.triggerCondition) {
              <div class="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2 text-xs">
                <div class="font-mono text-amber-300 font-bold text-[11px]">
                  ⚠️ {{ pivot.triggerCondition }}
                </div>
                <div class="text-zinc-300 leading-relaxed text-[11.5px]">
                  👉 {{ pivot.clinicalAction }}
                </div>
                <div class="pt-1 flex justify-end">
                  <button (click)="steerLiterature(pivot.evidenceKeywords)"
                          class="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer">
                    <span>🎯</span> Steer Evidence
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- 5. Precision Nutrients & Orthomolecular Rescue -->
      <div class="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">💊</span>
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">Mitochondrial &amp; Remyelination Precision Nutrients</h4>
          </div>
          <span class="text-[10px] font-mono text-zinc-400">Targeted Biochemical Shield</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          @for (nutrient of carePlan().precisionNutrients; track nutrient.compound) {
            <div class="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
              <div class="font-bold text-teal-300">{{ nutrient.compound }}</div>
              <div class="text-[11px] font-mono text-zinc-200">Dose: {{ nutrient.dose }}</div>
              <div class="text-[10px] font-mono text-zinc-400">Pathway: {{ nutrient.pathway }}</div>
            </div>
          }
        </div>
      </div>

      <!-- 6. Bottom Primary Action Bar: 1-Click Care Plan Adoption -->
      <div class="p-4 bg-gradient-to-r from-teal-950/40 via-zinc-950 to-zinc-950 border border-teal-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-zinc-400 font-mono">
          <span class="text-teal-400 font-bold">1-Click Synchronization:</span> Adopts 3-Act plan, Pulse metrics, and Pivot rules directly into Care Plan Studio &amp; FHIR R4 Bundle.
        </div>
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button (click)="adoptCarePlan()"
                  class="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <span>{{ isAdopted() ? '✅' : '📋' }}</span>
            <span>{{ isAdopted() ? 'Care Plan Adopted & Synchronized!' : 'Adopt into Live Care Plan' }}</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class MsPathwaysToCuresHubComponent {
  private readonly patientState = inject(PatientStateService);
  private readonly patientManagement = inject(PatientManagementService);
  private readonly riskSuite = inject(ClinicalSpecialtyRiskSuiteService);

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly isAdopted = signal<boolean>(false);

  readonly activePatient = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return null;
    return this.patientManagement.patients().find(p => p.id === pId) || null;
  });

  readonly activePatientName = computed(() => {
    return this.activePatient()?.name || 'Mara Santos';
  });

  readonly lifespan = computed<IMsLifespanEvaluation>(() => {
    const patient = this.activePatient();
    return this.riskSuite.evaluateMsLifespanPhenotype(patient);
  });

  readonly carePlan = computed<IPivotPulseCarePlanSuggestion>(() => {
    const patient = this.activePatient();
    return this.riskSuite.generateDynamicPivotPulseCarePlan(patient);
  });

  formatPhenotype(p: string): string {
    switch (p) {
      case 'PEDIATRIC_POMS': return 'Pediatric-Onset MS (POMS, <18y)';
      case 'ADULT_RRMS': return 'Adult Relapsing-Remitting MS (RRMS)';
      case 'LATE_ONSET_LOMS_PPMS': return 'Late-Onset Primary Progressive MS (LOMS/PPMS)';
      default: return 'General Physiologic Baseline';
    }
  }

  formatPira(pira: string): string {
    switch (pira) {
      case 'FOCAL_INFLAMMATORY': return 'Focal Relapse Driven (High OPC Plasticity)';
      case 'COMPARTMENTALIZED_SMOLDERING': return 'Compartmentalized Smoldering PIRA';
      case 'SPINAL_CORD_PROGRESSIVE': return 'Spinal Cord Progressive Axonopathy';
      default: return 'Baseline Physiological Maintenance';
    }
  }

  adoptCarePlan(): void {
    const plan = this.carePlan();
    const summary = `### Adopted NMSS Care Trajectory — ${plan.patientName}\n\n**Act 1 (Baseline)**: ${plan.act1WhereYouveBeen}\n\n**Act 2 (Today)**: ${plan.act2WhereYouStandToday}\n\n**Act 3 (Roadmap)**: ${plan.act3WhereYoureGoing}`;
    const protocols = `### Continuous Pulse Telemetry\n${plan.continuousPulseChecklist.map(p => `- **${p.metric}**: Target ${p.target} (${p.frequency}) [Current: ${p.currentValue}]`).join('\n')}\n\n### Agile Pivot Triggers\n${plan.agilePivotTriggers.map(p => `- **${p.triggerCondition}**: ${p.clinicalAction}`).join('\n')}`;
    const nutrition = `### Mitochondrial & Remyelination Nutrients\n${plan.precisionNutrients.map(n => `- **${n.compound}**: ${n.dose} (${n.pathway})`).join('\n')}`;

    this.patientState.adoptCarePlanSuggestion({
      summary,
      protocols,
      nutrition
    });

    this.isAdopted.set(true);
    setTimeout(() => this.isAdopted.set(false), 3500);
  }

  steerLiterature(keywords: string): void {
    this.selectQuery.emit({
      query: keywords,
      engine: 'pubmed'
    });
  }
}
