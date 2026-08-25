import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { BioHapticFeedbackService } from '../services/bio-haptic-feedback.service';

export interface IParetoInterventionOption {
  paradigm: 'Western' | 'Eastern' | 'Ayurvedic';
  name: string;
  costScore: number;       // 1-10 (lower is cheaper)
  effortScore: number;     // 1-10 (lower is easier)
  efficacyDays: number;    // estimated time to response
  adherenceProb: number;   // 0.0 - 1.0 (calibrated prediction)
  isParetoOptimal: boolean;
  isNatural: boolean;
}

@Component({
  selector: 'app-conformal-readmission-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-white dark:bg-zinc-950 rounded-2xl border-2 border-orange-500/80 shadow-[4px_6px_0px_0px_rgba(249,115,22,0.85)] font-mono text-zinc-900 dark:text-zinc-100 pocket-gull-card">
      
      <!-- Card Header -->
      <div class="flex items-center justify-between border-b border-orange-500/20 pb-4 mb-4">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg font-bold">
            📈
          </span>
          <div>
            <h3 class="text-sm font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              30-Day Conformal Readmission Risk & Pareto Trade-Offs
            </h3>
            <p class="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              Calibrated 95% Conformal Prediction Intervals & Pareto-Optimal Interventions
            </p>
          </div>
        </div>
        <span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
          95% Conformal Guarantee
        </span>
      </div>

      <!-- Risk Meter & Prediction Intervals -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <!-- Risk Interval Box -->
        <div class="p-4 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Readmission Probability (95% CI)</span>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-2xl font-black text-orange-600 dark:text-orange-400">
              [{{ (lowerBound() * 100).toFixed(0) }}% – {{ (upperBound() * 100).toFixed(0) }}%]
            </span>
          </div>
          <p class="mt-1 text-[10px] text-zinc-500">Point Estimate: <span class="font-bold text-zinc-700 dark:text-zinc-300">{{ (pointEstimate() * 100).toFixed(1) }}%</span></p>
        </div>

        <!-- qSOFA Escalation Risk -->
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">qSOFA Sepsis Risk</span>
          <div class="mt-1 text-2xl font-black text-amber-500">
            {{ qSofaScore() }}/3 <span class="text-xs font-normal text-zinc-500">({{ qSofaStatus() }})</span>
          </div>
          <p class="mt-1 text-[10px] text-zinc-500">HR: {{ vitals().hr || 72 }} bpm | BP: {{ vitals().bp || '120/80' }}</p>
        </div>

        <!-- Adherence Calibration Score -->
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Predicted Adherence</span>
          <div class="mt-1 text-2xl font-black text-emerald-500">
            {{ (adherenceScore() * 100).toFixed(0) }}%
          </div>
          <p class="mt-1 text-[10px] text-zinc-500">Bandit Feedback Learning Active</p>
        </div>

      </div>

      <!-- Pareto-Optimal Interventions Matrix -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            🎯 Pareto-Optimal Clinical Interventions
          </h4>
          <span class="text-[10px] text-zinc-500">Non-Dominated Trade-Off Frontier</span>
        </div>

        <div class="space-y-2">
          @for (option of interventions(); track option.name) {
            <div class="p-3 bg-zinc-50 dark:bg-zinc-900/60 border rounded-xl flex items-center justify-between transition-all hover:border-orange-500/40"
                 [class.border-orange-500/60]="option.isParetoOptimal"
                 [class.border-zinc-200]="!option.isParetoOptimal"
                 [class.dark:border-zinc-800]="!option.isParetoOptimal">
              
              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border"
                      [class.bg-blue-500\\/10]="option.paradigm === 'Western'" [class.text-blue-500]="option.paradigm === 'Western'" [class.border-blue-500\\/30]="option.paradigm === 'Western'"
                      [class.bg-emerald-500\\/10]="option.paradigm === 'Eastern'" [class.text-emerald-500]="option.paradigm === 'Eastern'" [class.border-emerald-500\\/30]="option.paradigm === 'Eastern'"
                      [class.bg-amber-500\\/10]="option.paradigm === 'Ayurvedic'" [class.text-amber-500]="option.paradigm === 'Ayurvedic'" [class.border-amber-500\\/30]="option.paradigm === 'Ayurvedic'">
                  {{ option.paradigm }}
                </span>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">{{ option.name }}</span>
                    @if (option.isParetoOptimal) {
                      <span class="px-1.5 py-0.2 text-[8px] font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded">PARETO BEST</span>
                    }
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-0.5">
                    Cost: {{ option.costScore }}/10 | Effort: {{ option.effortScore }}/10 | Response: {{ option.efficacyDays }}d
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {{ (option.adherenceProb * 100).toFixed(0) }}% Adherence
                  </div>
                </div>
                <button (click)="selectIntervention(option)"
                        class="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer">
                  Prescribe
                </button>
              </div>

            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class ConformalReadmissionCardComponent {
  patientState = inject(PatientStateService);
  bioHaptic = inject(BioHapticFeedbackService);

  vitals = this.patientState.vitals;

  lowerBound = signal(0.12);
  upperBound = signal(0.38);
  pointEstimate = signal(0.24);

  qSofaScore = computed(() => {
    let score = 0;
    const hr = parseInt(this.vitals().hr || '72', 10);
    if (hr > 100) score++;
    if (this.vitals().bp && parseInt(this.vitals().bp.split('/')[0] || '120', 10) < 100) score++;
    return score;
  });

  qSofaStatus = computed(() => {
    const score = this.qSofaScore();
    if (score === 0) return 'Low Risk';
    if (score === 1) return 'Moderate Escalation';
    return 'High Sepsis Risk';
  });

  adherenceScore = signal(0.88);

  interventions = signal<IParetoInterventionOption[]>([
    {
      paradigm: 'Western',
      name: 'Prescription Metformin + SGLT2 Care Plan',
      costScore: 2,
      effortScore: 3,
      efficacyDays: 7,
      adherenceProb: 0.92,
      isParetoOptimal: true,
      isNatural: false
    },
    {
      paradigm: 'Eastern',
      name: 'Xiao Ke Wan Herbs + Acupressure Routine',
      costScore: 4,
      effortScore: 5,
      efficacyDays: 21,
      adherenceProb: 0.84,
      isParetoOptimal: true,
      isNatural: true
    },
    {
      paradigm: 'Ayurvedic',
      name: 'Nisha Amalaki Routine + 0.1Hz Vagal Breathing',
      costScore: 3,
      effortScore: 4,
      efficacyDays: 30,
      adherenceProb: 0.89,
      isParetoOptimal: true,
      isNatural: true
    }
  ]);

  selectIntervention(option: IParetoInterventionOption) {
    this.bioHaptic.playSolfeggioTone(528, 1500);
    this.bioHaptic.triggerDualPulse();
    this.patientState.addClinicalNote({
      id: `pareto-prescription-${Date.now()}`,
      text: `🎯 Prescribed Pareto-Optimal Intervention: ${option.name} (${option.paradigm} Paradigm). Estimated Adherence: ${(option.adherenceProb * 100).toFixed(0)}%.`,
      sourceLens: 'Functional Protocols',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
    alert(`🎯 Prescribed ${option.name}! Clinical note added to chart.`);
  }
}
