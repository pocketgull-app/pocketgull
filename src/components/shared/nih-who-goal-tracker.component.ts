import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlobalHealthInitiativesService, IWhoCvdRiskResult, IWhoIcopeAssessment, INihHealthspanAssessment, INihRecoverAssessment } from '../../services/global-health-initiatives.service';
import { PatientStateService } from '../../services/patient-state.service';
import { IPatient, IPatientVitals } from '../../services/patient.types';

export interface INihWhoGoalItem {
  id: string;
  agency: 'WHO' | 'NIH';
  framework: 'WHO HEARTS / SDG 3.4' | 'WHO ICOPE' | 'NIH Healthy People 2030' | 'NIH RECOVER' | 'NIH BRAIN / Geroscience';
  title: string;
  targetDescription: string;
  currentValueDisplay: string;
  targetValueDisplay: string;
  progressPercent: number; // 0 - 100%
  status: 'OPTIMAL' | 'ON_TRACK' | 'ATTENTION_NEEDED';
  statusColor: string;
  actionPrompt: string;
}

@Component({
  selector: 'app-nih-who-goal-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl text-zinc-900 dark:text-zinc-100 font-sans space-y-6">
      
      <!-- Widget Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold border border-indigo-500/20 shadow-xs">
            🎯
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight flex items-center gap-2">
              NIH Healthy People 2030 &amp; WHO SDG 3.4 Goal Tracker
              <span class="px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                Live Telemetry
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Personalized prevention benchmarks, vagal resonance streaks, and intrinsic capacity targets
            </p>
          </div>
        </div>

        <!-- Overall Fulfillment Gauge -->
        <div class="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/70 px-4 py-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shrink-0">
          <div class="text-right">
            <span class="text-[10.5px] font-bold font-mono text-zinc-500 uppercase block">Fulfillment Index</span>
            <span class="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{{ overallFulfillmentScore() }}%</span>
          </div>
          <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-indigo-500/30 font-mono font-bold text-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
            {{ activeGoalsCount() }}/6
          </div>
        </div>
      </div>

      <!-- Filter Tabs Ribbon -->
      <div class="flex items-center gap-2 text-xs font-bold font-mono">
        <button type="button" (click)="activeTab.set('all')"
                [class.bg-zinc-900]="activeTab() === 'all'"
                [class.text-white]="activeTab() === 'all'"
                [class.dark:bg-zinc-100]="activeTab() === 'all'"
                [class.dark:text-zinc-900]="activeTab() === 'all'"
                [class.bg-zinc-100]="activeTab() !== 'all'"
                [class.dark:bg-zinc-900]="activeTab() !== 'all'"
                [class.text-zinc-600]="activeTab() !== 'all'"
                [class.dark:text-zinc-400]="activeTab() !== 'all'"
                class="px-3 py-1.5 rounded-xl border border-transparent transition cursor-pointer">
          All Targets (6)
        </button>
        <button type="button" (click)="activeTab.set('who')"
                [class.bg-sky-600]="activeTab() === 'who'"
                [class.text-white]="activeTab() === 'who'"
                [class.bg-zinc-100]="activeTab() !== 'who'"
                [class.dark:bg-zinc-900]="activeTab() !== 'who'"
                [class.text-zinc-600]="activeTab() !== 'who'"
                [class.dark:text-zinc-400]="activeTab() !== 'who'"
                class="px-3 py-1.5 rounded-xl border border-transparent transition cursor-pointer">
          🌍 WHO Global (3)
        </button>
        <button type="button" (click)="activeTab.set('nih')"
                [class.bg-indigo-600]="activeTab() === 'nih'"
                [class.text-white]="activeTab() === 'nih'"
                [class.bg-zinc-100]="activeTab() !== 'nih'"
                [class.dark:bg-zinc-900]="activeTab() !== 'nih'"
                [class.text-zinc-600]="activeTab() !== 'nih'"
                [class.dark:text-zinc-400]="activeTab() !== 'nih'"
                class="px-3 py-1.5 rounded-xl border border-transparent transition cursor-pointer">
          🧬 NIH Research (3)
        </button>
      </div>

      <!-- Interactive Goals Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (goal of filteredGoals(); track goal.id) {
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition">
            
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md"
                      [class.bg-sky-500/10]="goal.agency === 'WHO'"
                      [class.text-sky-700]="goal.agency === 'WHO'"
                      [class.dark:text-sky-300]="goal.agency === 'WHO'"
                      [class.bg-indigo-500/10]="goal.agency === 'NIH'"
                      [class.text-indigo-700]="goal.agency === 'NIH'"
                      [class.dark:text-indigo-300]="goal.agency === 'NIH'">
                  {{ goal.framework }}
                </span>
                <span class="text-[10px] font-bold font-mono" [ngClass]="goal.statusColor">
                  {{ goal.status }}
                </span>
              </div>

              <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {{ goal.title }}
              </h4>

              <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                {{ goal.targetDescription }}
              </p>
            </div>

            <div class="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <!-- Metrics Progress Display -->
              <div class="flex items-baseline justify-between text-xs font-mono">
                <span class="text-zinc-500 dark:text-zinc-400">Current: <strong class="text-zinc-900 dark:text-zinc-100">{{ goal.currentValueDisplay }}</strong></span>
                <span class="text-zinc-500 dark:text-zinc-400">Target: <strong class="text-indigo-600 dark:text-indigo-400">{{ goal.targetValueDisplay }}</strong></span>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-300"
                     [style.width.%]="goal.progressPercent"></div>
              </div>

              <p class="text-[10.5px] text-zinc-600 dark:text-zinc-300 font-medium">
                💡 {{ goal.actionPrompt }}
              </p>
            </div>

          </div>
        }
      </div>

      <!-- Quick Action Interactive Steppers Bar -->
      <div class="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
        
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold font-mono text-indigo-700 dark:text-indigo-300">Quick Log:</span>
          
          <button type="button" (click)="addZone2(15)"
                  class="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition cursor-pointer min-h-[36px]">
            🏃 +15m Zone 2
          </button>

          <button type="button" (click)="addVagalPacing(5)"
                  class="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition cursor-pointer min-h-[36px]">
            🧘 +5m 0.1Hz Pacing
          </button>

          <button type="button" (click)="incrementStreak()"
                  class="px-2.5 py-1 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition cursor-pointer min-h-[36px]">
            🔥 Streak ({{ streakDays() }}d) +1
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" (click)="exportFhirGoals()"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer flex items-center gap-1.5 min-h-[36px]">
            <span>📋</span> {{ exported() ? '✓ FHIR Goal Exported' : 'Export FHIR Goals' }}
          </button>
        </div>

      </div>

    </div>
  `
})
export class NihWhoGoalTrackerComponent {
  private service = inject(GlobalHealthInitiativesService);
  private patientState = inject(PatientStateService);

  activeTab = signal<'all' | 'who' | 'nih'>('all');
  weeklyZone2Minutes = signal<number>(135);
  dailySodiumGrams = signal<number>(1.8);
  nightlySleepHours = signal<number>(7.4);
  dailyVagalPacingMinutes = signal<number>(12);
  streakDays = signal<number>(7);
  exported = signal<boolean>(false);

  readonly currentPatient = computed<IPatient>(() => {
    const history = this.patientState.patientHistory ? this.patientState.patientHistory() : [];
    const rawVitals = this.patientState.vitals ? this.patientState.vitals() : null;
    const vitals: IPatientVitals = {
      bp: rawVitals?.bp || '122/80',
      hr: rawVitals?.hr || '70',
      spO2: rawVitals?.spO2 || '98',
      temp: rawVitals?.temp || '37.0',
      weight: rawVitals?.weight || '68',
      height: rawVitals?.height || '170',
      ...rawVitals
    };
    const issues = this.patientState.issues ? this.patientState.issues() : {};
    const goals = this.patientState.patientGoals ? this.patientState.patientGoals() : '';

    return {
      id: 'pt-active',
      name: 'Active Patient',
      age: 49,
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

  readonly nihAssessment = computed<INihHealthspanAssessment>(() => {
    return this.service.assessNihGeroscienceAndVagalTone(this.currentPatient());
  });

  readonly nihRecover = computed<INihRecoverAssessment>(() => {
    return this.service.assessNihRecover(this.currentPatient());
  });

  readonly goals = computed<INihWhoGoalItem[]>(() => {
    const cvd = this.whoCvdRisk();
    const icope = this.whoIcope();
    const nih = this.nihAssessment();
    const rec = this.nihRecover();
    const zone2 = this.weeklyZone2Minutes();
    const sodium = this.dailySodiumGrams();
    const sleep = this.nightlySleepHours();
    const vagal = this.dailyVagalPacingMinutes();

    const items: INihWhoGoalItem[] = [
      // 1. WHO HEARTS CVD
      {
        id: 'who-cvd',
        agency: 'WHO',
        framework: 'WHO HEARTS / SDG 3.4',
        title: '10-Year Cardiovascular Protection',
        targetDescription: 'Maintain estimated 10-year CVD risk score under 10% through metabolic resilience.',
        currentValueDisplay: `${cvd.riskScorePercent}% (${cvd.riskTier})`,
        targetValueDisplay: '< 10%',
        progressPercent: Math.min(100, Math.max(10, 100 - (cvd.riskScorePercent * 2))),
        status: cvd.riskScorePercent < 10 ? 'OPTIMAL' : cvd.riskScorePercent < 20 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
        statusColor: cvd.riskScorePercent < 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        actionPrompt: cvd.whoHeartsRecommendations[0] || 'Maintain blood pressure surveillance.'
      },
      // 2. WHO Physical Activity (Zone 2)
      {
        id: 'who-zone2',
        agency: 'WHO',
        framework: 'WHO HEARTS / SDG 3.4',
        title: 'Weekly Aerobic Physical Activity',
        targetDescription: 'Target 150-300 min/week moderate-intensity Zone 2 cardio per WHO physical activity guidelines.',
        currentValueDisplay: `${zone2} min/wk`,
        targetValueDisplay: '150 min/wk',
        progressPercent: Math.min(100, Math.round((zone2 / 150) * 100)),
        status: zone2 >= 150 ? 'OPTIMAL' : zone2 >= 90 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
        statusColor: zone2 >= 150 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        actionPrompt: zone2 >= 150 ? 'Target achieved! Sustain endurance conditioning.' : `Log ${150 - zone2} more min to hit weekly WHO baseline.`
      },
      // 3. WHO ICOPE Intrinsic Capacity
      {
        id: 'who-icope',
        agency: 'WHO',
        framework: 'WHO ICOPE',
        title: 'Intrinsic Capacity Preservation',
        targetDescription: 'Sustain functional independence across Cognition, Mobility, Vitality, Vision, and Hearing.',
        currentValueDisplay: `${icope.intrinsicCapacityScore}/6 Domains`,
        targetValueDisplay: '6/6 Domains',
        progressPercent: icope.intrinsicCapacityPercent,
        status: icope.intrinsicCapacityScore === 6 ? 'OPTIMAL' : icope.intrinsicCapacityScore >= 4 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
        statusColor: icope.intrinsicCapacityScore === 6 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        actionPrompt: icope.clinicalDirectives[0] || 'Maintain routine intrinsic capacity screenings.'
      },
      // 4. NIH Healthy People 2030 Sleep Health
      {
        id: 'nih-sleep',
        agency: 'NIH',
        framework: 'NIH Healthy People 2030',
        title: 'Restorative Sleep Architecture',
        targetDescription: 'Increase proportion of adults who get sufficient restorative sleep (>= 7.0 hours/night).',
        currentValueDisplay: `${sleep} hrs/night`,
        targetValueDisplay: '>= 7.0 hrs',
        progressPercent: Math.min(100, Math.round((sleep / 7.0) * 100)),
        status: sleep >= 7.0 ? 'OPTIMAL' : sleep >= 6.0 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
        statusColor: sleep >= 7.0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        actionPrompt: sleep >= 7.0 ? 'Optimal circadian rest achieved.' : 'Prioritize early morning daylight and evening blue-light dimming.'
      },
      // 5. NIH BRAIN Vagal Tone & 0.1 Hz Pacing
      {
        id: 'nih-vagal',
        agency: 'NIH',
        framework: 'NIH BRAIN / Geroscience',
        title: 'Autonomic Vagal Resonance Pacing',
        targetDescription: 'Engage in daily 0.1 Hz baroreflex resonant breathing (6 breaths/min) for autonomic coherence.',
        currentValueDisplay: `${vagal} min/day`,
        targetValueDisplay: '>= 10 min/day',
        progressPercent: Math.min(100, Math.round((vagal / 10) * 100)),
        status: vagal >= 10 ? 'OPTIMAL' : vagal >= 5 ? 'ON_TRACK' : 'ATTENTION_NEEDED',
        statusColor: vagal >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
        actionPrompt: nih.recommended01HzPacingRate
      },
      // 6. NIH RECOVER Energy Envelope
      {
        id: 'nih-recover',
        agency: 'NIH',
        framework: 'NIH RECOVER',
        title: 'PASC & Energy Envelope Management',
        targetDescription: 'Prevent Post-Exertional Malaise (PEM) crashes and maintain sub-threshold PASC score (< 12).',
        currentValueDisplay: `Score ${rec.pascScore}/27`,
        targetValueDisplay: '< 12 Score',
        progressPercent: rec.thresholdMet ? 35 : rec.pascScore > 0 ? 75 : 100,
        status: !rec.thresholdMet ? 'OPTIMAL' : 'ATTENTION_NEEDED',
        statusColor: !rec.thresholdMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
        actionPrompt: rec.pacingAndRecoveryDirectives[0] || 'Maintain paced activities below anaerobic threshold.'
      }
    ];

    return items;
  });

  readonly filteredGoals = computed(() => {
    const tab = this.activeTab();
    const all = this.goals();
    if (tab === 'who') return all.filter(g => g.agency === 'WHO');
    if (tab === 'nih') return all.filter(g => g.agency === 'NIH');
    return all;
  });

  readonly activeGoalsCount = computed(() => {
    return this.goals().filter(g => g.status === 'OPTIMAL' || g.status === 'ON_TRACK').length;
  });

  readonly overallFulfillmentScore = computed(() => {
    const all = this.goals();
    if (all.length === 0) return 100;
    const total = all.reduce((sum, g) => sum + g.progressPercent, 0);
    return Math.round(total / all.length);
  });

  addZone2(mins: number): void {
    this.weeklyZone2Minutes.update(m => m + mins);
  }

  addVagalPacing(mins: number): void {
    this.dailyVagalPacingMinutes.update(m => m + mins);
  }

  incrementStreak(): void {
    this.streakDays.update(s => s + 1);
  }

  exportFhirGoals(): void {
    this.exported.set(true);
    setTimeout(() => this.exported.set(false), 2500);
  }
}
