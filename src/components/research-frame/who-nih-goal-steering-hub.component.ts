import { Component, signal, computed, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ClinicalMoERouterService } from '../../services/clinical-moe-router.service';
import { UniversalPivotPulseSynthesizerService } from '../../services/universal-pivot-pulse-synthesizer.service';
import { OllamaProvider } from '../../services/ai/ollama.provider';

export interface IGlobalHealthGoal {
  id: string;
  framework: 'WHO_SDG' | 'WHO_HEARTS' | 'NIH_HEALTHY_PEOPLE_2030' | 'NIH_CTSA_ITHRIV' | 'NMSS_CURES';
  title: string;
  targetCode: string;
  description: string;
  currentPatientMetric: string;
  targetBenchmark: string;
  progressPct: number;
  status: 'ON_TRACK' | 'ATTENTION_REQUIRED' | 'CRITICAL_GAP';
  evidenceKeywords: string;
  institutionPartner: string;
}

@Component({
  selector: 'app-who-nih-goal-steering-hub',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-100 shadow-2xl space-y-6 max-w-5xl mx-auto">
      
      <!-- Top Banner -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🌐</span>
            <span>WHO, NIH &amp; NMSS Strategic Goal Alignment Hub</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Evidence-Steered Global Health &amp; Clinical Translational Trajectories
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Harmonizes patient telemetry with WHO SDG 3.4, WHO HEARTS protocol, NIH Healthy People 2030, and NMSS Pathways to Cures to steer evidence discovery toward positive clinical outcomes.
          </p>
        </div>

        <!-- Global Framework Indicator -->
        <div class="bg-zinc-950 px-4 py-3 rounded-2xl border border-zinc-800 space-y-1 text-right">
          <div class="flex items-center justify-end gap-2 text-[10px] font-mono text-emerald-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-bold">SDG 3.4, NIH CTSA &amp; NMSS Active</span>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            Partner: <span class="text-zinc-200 font-semibold">UVA Health / iTHRIV / NMSS</span>
          </div>
        </div>
      </div>

      <!-- 🌟 Universal Precision Care Synthesizer Banner -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-zinc-950 to-blue-950/70 border border-emerald-500/40 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xl">✨</span>
              <h3 class="text-base font-bold text-white tracking-tight">
                Universal Precision Care Synthesizer (6-Pillars &amp; 3D Anatomy)
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {{ isOllamaConnected() ? '⚡ Ollama Gemma 4 (Local Edge)' : '🛡️ Deterministic CDS (Offline)' }}
              </span>
            </div>
            <p class="text-xs text-zinc-300">
              Synthesizes an individualized 6-Pillar Care Plan (Act 1 Baseline, Act 2 Grounded Today, Act 3 Roadmap, Continuous Pulse, Agile Pivot Triggers, Precision Nutrients) and illuminates 3D anatomical lesion beacons with Solfeggio acoustic pinning.
            </p>
          </div>

          <button (click)="triggerUniversalSynthesis()"
                  [disabled]="isSynthesizing()"
                  class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer shrink-0">
            @if (isSynthesizing()) {
              <span class="animate-spin text-sm">⏳</span>
              <span>Synthesizing Care Plan...</span>
            } @else {
              <span>✨</span>
              <span>Synthesize Precision Plan</span>
            }
          </button>
        </div>

        @if (lastPlan(); as plan) {
          <div class="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-xs space-y-3 animate-in fade-in duration-300">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div class="font-bold text-emerald-400 font-mono">
                📋 Active Synthesized Plan: {{ plan.patientName }} ({{ plan.patientId }})
              </div>
              <span class="text-[10px] font-mono text-zinc-400">
                Adopted into Care Plan Studio &amp; 3D Anatomy Pins Active
              </span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-zinc-300">
              <div class="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
                <div class="text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Act 1 (Baseline)</div>
                <p class="text-[11px] leading-relaxed line-clamp-3">{{ plan.act1WhereYouveBeen }}</p>
              </div>
              <div class="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
                <div class="text-[10px] uppercase font-mono font-bold text-zinc-400 mb-1">Act 2 (Grounded Today)</div>
                <p class="text-[11px] leading-relaxed line-clamp-3">{{ plan.act2WhereYouStandToday }}</p>
              </div>
              <div class="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800">
                <div class="text-[10px] uppercase font-mono font-bold text-emerald-400 mb-1">Act 3 (30/60/90-Day Roadmap)</div>
                <p class="text-[11px] leading-relaxed line-clamp-3">{{ plan.act3WhereYoureGoing }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Framework Filter Tabs -->
      <div class="flex flex-wrap items-center gap-2 pb-1">
        @for (f of frameworks; track f.key) {
          <button (click)="activeFramework.set(f.key)"
                  [class.bg-blue-600]="activeFramework() === f.key"
                  [class.text-white]="activeFramework() === f.key"
                  [class.bg-zinc-800]="activeFramework() !== f.key"
                  [class.text-zinc-400]="activeFramework() !== f.key"
                  class="px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all hover:text-white cursor-pointer border border-zinc-700/50 flex items-center gap-1.5">
            <span>{{ f.icon }}</span>
            <span>{{ f.label }}</span>
          </button>
        }
      </div>

      <!-- Goal Alignment Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (goal of filteredGoals(); track goal.id) {
          <div class="p-5 bg-zinc-950 border border-zinc-800/90 rounded-2xl space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between">
            
            <div class="space-y-2">
              <!-- Framework & Status Header -->
              <div class="flex items-center justify-between gap-2">
                <span class="px-2.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-blue-300 text-[10px] font-mono font-bold">
                  {{ goal.targetCode }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      [class.bg-emerald-950]="goal.status === 'ON_TRACK'"
                      [class.text-emerald-300]="goal.status === 'ON_TRACK'"
                      [class.bg-amber-950]="goal.status === 'ATTENTION_REQUIRED'"
                      [class.text-amber-300]="goal.status === 'ATTENTION_REQUIRED'"
                      [class.bg-rose-950]="goal.status === 'CRITICAL_GAP'"
                      [class.text-rose-300]="goal.status === 'CRITICAL_GAP'">
                  {{ goal.status.replace('_', ' ') }}
                </span>
              </div>

              <!-- Title & Description -->
              <h3 class="text-sm font-bold text-zinc-100 leading-snug">
                {{ goal.title }}
              </h3>
              <p class="text-xs text-zinc-400 leading-relaxed">
                {{ goal.description }}
              </p>

              <!-- Progress Bar -->
              <div class="space-y-1 pt-1">
                <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Patient: <strong class="text-zinc-200">{{ goal.currentPatientMetric }}</strong></span>
                  <span>Target: <strong class="text-blue-300">{{ goal.targetBenchmark }}</strong></span>
                </div>
                <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                       [style.width.%]="goal.progressPct"></div>
                </div>
              </div>
            </div>

            <!-- Action & Evidence Steering -->
            <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
              <span class="text-[10px] font-mono text-zinc-500">
                🏛️ {{ goal.institutionPartner }}
              </span>
              <div class="flex items-center gap-1.5">
                <button (click)="adoptGoalToCarePlan(goal)"
                        class="px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer shadow-sm">
                  <span>{{ adoptedGoalId() === goal.id ? '✅' : '📋' }}</span>
                  <span>{{ adoptedGoalId() === goal.id ? 'Adopted!' : 'Adopt Plan' }}</span>
                </button>
                <button (click)="steerResearch(goal)"
                        class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md">
                  <span>🎯</span> Steer Evidence
                </button>
              </div>
            </div>

          </div>
        }
      </div>

      <!-- Footer Clinical Alignment Banner -->
      <div class="p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
        <div class="flex items-center gap-2">
          <span class="text-base">🔬</span>
          <span>Aligned with WHO Global Noncommunicable Diseases Action Plan &amp; NIH CTSA Collaborative Networks.</span>
        </div>
        <div class="text-[10px] text-zinc-500">
          Last Synced: {{ syncTimestamp }}
        </div>
      </div>

    </div>
  `
})
export class WhoNihGoalSteeringHubComponent {
  private readonly patientState = inject(PatientStateService);
  private readonly moeRouter = inject(ClinicalMoERouterService, { optional: true });
  protected readonly synthesizer = inject(UniversalPivotPulseSynthesizerService);
  protected readonly ollama = inject(OllamaProvider, { optional: true });

  readonly isSynthesizing = computed(() => this.synthesizer.isSynthesizing());
  readonly lastPlan = computed(() => this.synthesizer.lastSynthesizedPlan());
  readonly isOllamaConnected = computed(() => !!this.ollama?.isConnected());

  readonly selectQuery = output<{ query: string; engine: 'pubmed' | 'gse' | 'google' }>();

  readonly syncTimestamp = new Date().toISOString().split('T')[0];
  readonly activeFramework = signal<'ALL' | 'WHO_SDG' | 'WHO_HEARTS' | 'NIH_HEALTHY_PEOPLE_2030' | 'NIH_CTSA_ITHRIV' | 'NMSS_CURES'>('ALL');
  readonly adoptedGoalId = signal<string | null>(null);

  async triggerUniversalSynthesis(): Promise<void> {
    const patientId = this.patientState.loadedPatientId() || undefined;
    await this.synthesizer.synthesizePrecisionPlan(patientId);
  }

  readonly frameworks = [
    { key: 'ALL' as const, label: 'All Frameworks', icon: '🌐' },
    { key: 'NMSS_CURES' as const, label: 'NMSS Pathways to Cures', icon: '🧠' },
    { key: 'WHO_SDG' as const, label: 'WHO SDG 3.4', icon: '🎯' },
    { key: 'WHO_HEARTS' as const, label: 'WHO HEARTS CVD', icon: '🫀' },
    { key: 'NIH_HEALTHY_PEOPLE_2030' as const, label: 'NIH Healthy People 2030', icon: '🇺🇸' },
    { key: 'NIH_CTSA_ITHRIV' as const, label: 'NIH CTSA (UVA iTHRIV)', icon: '🏛️' }
  ];

  readonly goals = computed<IGlobalHealthGoal[]>(() => {
    const vitals = this.patientState.vitals();
    const bp = vitals?.bp || '120/80';
    const hr = parseFloat(vitals?.hr || '72');
    const glucose = parseFloat(vitals?.cgmGlucoseMgDl || '110');

    return [
      {
        id: 'nmss-cures-stop',
        framework: 'NMSS_CURES',
        title: 'NMSS Pathways to Cures: STOP (Halt Disease Activity & Smoldering PIRA)',
        targetCode: 'NMSS STOP-01',
        description: 'Eliminate both focal relapses and insidious neuro-axonal destruction by maintaining sNfL < 10 pg/mL and suppressing compartmentalized microglial inflammation.',
        currentPatientMetric: 'sNfL ~ 18.2 pg/mL (Subclinical PIRA Active)',
        targetBenchmark: 'sNfL < 10.0 pg/mL, 0 Gad+ Lesions, 0 PIRA',
        progressPct: 50,
        status: 'ATTENTION_REQUIRED',
        evidenceKeywords: 'NMSS Pathways to Cures STOP Smoldering Multiple Sclerosis sNfL Microglia Trial',
        institutionPartner: 'National Multiple Sclerosis Society (NMSS)'
      },
      {
        id: 'nmss-cures-restore',
        framework: 'NMSS_CURES',
        title: 'NMSS Pathways to Cures: RESTORE (Remyelination & Mitochondrial Rescue)',
        targetCode: 'NMSS RESTORE-02',
        description: 'Promote oligodendrocyte precursor cell (OPC) differentiation and axonal ATP rescue via Clemastine/Metformin remyelination protocols and CoQ10.',
        currentPatientMetric: 'Axonal ATP Depletion / Spasticity',
        targetBenchmark: 'T25FW < 5.0 s, Active Myelin Repair',
        progressPct: 40,
        status: 'ATTENTION_REQUIRED',
        evidenceKeywords: 'Oligodendrocyte Precursor Cells Clemastine Remyelination Trial Multiple Sclerosis',
        institutionPartner: 'NMSS / Pathways to Cures Consortium'
      },
      {
        id: 'nmss-cures-end',
        framework: 'NMSS_CURES',
        title: 'NMSS Pathways to Cures: END (Environmental Risk Eradication & Prevention)',
        targetCode: 'NMSS END-03',
        description: 'Eradicate modifiable environmental triggers via aggressive Vitamin D repletion (60–80 ng/mL), Epstein-Barr Virus (EBV) surveillance, and microbiome regulation.',
        currentPatientMetric: 'Serum 25(OH)D ~ 18 ng/mL (Deficient)',
        targetBenchmark: '25(OH)D 60–80 ng/mL, EBNA-1 Vigilance',
        progressPct: 30,
        status: 'CRITICAL_GAP',
        evidenceKeywords: 'Vitamin D3 Multiple Sclerosis Epstein Barr Virus EBNA1 Prevention Trial',
        institutionPartner: 'National MS Society & ECTRIMS'
      },
      {
        id: 'sdg-3-4-cvd',
        framework: 'WHO_SDG',
        title: 'WHO SDG 3.4: 1/3 Reduction in Premature CVD & NCD Mortality',
        targetCode: 'WHO SDG 3.4',
        description: 'Reduce 10-year fatal/non-fatal cardiovascular risk through team-based non-pharmacological interventions and guideline-directed medical therapy.',
        currentPatientMetric: `BP: ${bp} mmHg, HR: ${hr} bpm`,
        targetBenchmark: 'BP < 130/80 mmHg, HR 60–80 bpm',
        progressPct: hr > 90 ? 45 : 82,
        status: hr > 90 ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
        evidenceKeywords: 'WHO SDG 3.4 Cardiovascular Disease Prevention Clinical Guidelines Randomized Controlled Trial',
        institutionPartner: 'World Health Organization (WHO)'
      },
      {
        id: 'who-hearts-htn',
        framework: 'WHO_HEARTS',
        title: 'WHO HEARTS Protocol: Standardized Hypertension & Risk Stratification',
        targetCode: 'WHO HEARTS-H',
        description: 'Standardized evidence-based treatment algorithms for blood pressure control, essential medication access, and lipid optimization.',
        currentPatientMetric: `Mean Arterial Pressure ~ ${Math.round(80 + (hr > 80 ? 15 : 5))} mmHg`,
        targetBenchmark: 'MAP 70–93 mmHg (Target < 130/80)',
        progressPct: 70,
        status: 'ON_TRACK',
        evidenceKeywords: 'WHO HEARTS Technical Package Hypertension Control Protocol Primary Care Evidence',
        institutionPartner: 'Pan American Health Organization / WHO'
      },
      {
        id: 'nih-hp2030-aoc',
        framework: 'NIH_HEALTHY_PEOPLE_2030',
        title: 'NIH Healthy People 2030: Musculoskeletal & Osteoarthritis Mitigation',
        targetCode: 'NIH HP2030 AOC-01',
        description: 'Prevent chronic mobility limitations and structural osteoarthritis progression following ligamentous and articular joint trauma.',
        currentPatientMetric: 'Active Joint Recovery Phase',
        targetBenchmark: 'KOOS Pain Score > 85, Cartilage Preservation',
        progressPct: 60,
        status: 'ATTENTION_REQUIRED',
        evidenceKeywords: 'Anterior Cruciate Ligament Cartilage Degradation Visium Spatial Transcriptomics Osteoarthritis',
        institutionPartner: 'NIH NIAMS / Healthy People 2030'
      },
      {
        id: 'nih-ctsa-ithriv',
        framework: 'NIH_CTSA_ITHRIV',
        title: 'NIH CTSA iTHRIV: Precision Spatial Genomics & Multi-Omics Translation',
        targetCode: 'NIH CTSA UL1TR003015',
        description: 'Integrates patient spatial transcriptomics (GSE131900) and Hi-C chromatin architecture into bedside clinical decision support.',
        currentPatientMetric: '3D Physical Genomics Multi-Lens Ingested',
        targetBenchmark: 'TAD Insulation Score > 0.85, ECM Stiff < 6 kPa',
        progressPct: 90,
        status: 'ON_TRACK',
        evidenceKeywords: 'GSE131900 Spatial Transcriptomics Cartilage Matrix University of Virginia iTHRIV',
        institutionPartner: 'University of Virginia (UVA Health / iTHRIV)'
      },
      {
        id: 'nih-hp2030-diabetes',
        framework: 'NIH_HEALTHY_PEOPLE_2030',
        title: 'NIH Healthy People 2030: Glycemic Time-in-Range & Microvascular Protection',
        targetCode: 'NIH HP2030 D-01',
        description: 'Maintain continuous glucose monitoring (CGM) time-in-range (70–180 mg/dL) > 70% to eliminate diabetic microvascular nephropathy risks.',
        currentPatientMetric: `CGM Glucose: ${glucose} mg/dL`,
        targetBenchmark: 'Time in Range > 70%, Fasting < 100 mg/dL',
        progressPct: glucose > 125 ? 50 : 85,
        status: glucose > 125 ? 'ATTENTION_REQUIRED' : 'ON_TRACK',
        evidenceKeywords: 'Continuous Glucose Monitoring Time in Range Microvascular Protection RCT',
        institutionPartner: 'NIH NIDDK'
      }
    ];
  });

  readonly filteredGoals = computed(() => {
    const fw = this.activeFramework();
    const all = this.goals();
    if (fw === 'ALL') return all;
    return all.filter(g => g.framework === fw);
  });

  steerResearch(goal: IGlobalHealthGoal): void {
    const isGse = goal.framework === 'NIH_CTSA_ITHRIV' || goal.evidenceKeywords.includes('GSE');
    this.selectQuery.emit({
      query: goal.evidenceKeywords,
      engine: isGse ? 'gse' : 'pubmed'
    });
  }

  adoptGoalToCarePlan(goal: IGlobalHealthGoal): void {
    this.patientState.adoptCarePlanSuggestion({
      summary: `### Strategic Framework Goal Adopted: ${goal.title}\nTarget Benchmark: ${goal.targetBenchmark}\nInstitution: ${goal.institutionPartner}`,
      protocols: `Guideline Protocol (${goal.targetCode}): Focused on reaching ${goal.targetBenchmark}. Monitored via PocketGull Research Frame.`,
      nutrition: `Evidence-grounded lifestyle interventions aligned with ${goal.framework} standards.`
    });
    this.adoptedGoalId.set(goal.id);
    setTimeout(() => this.adoptedGoalId.set(null), 3000);
  }
}
