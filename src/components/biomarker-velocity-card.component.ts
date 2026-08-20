import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BiomarkerVelocityService, IBioTrajectoryReport } from '../services/biomarker-velocity.service';
import { PatientStateService } from '../services/patient-state.service';
import { IPatient } from '../services/patient.types';

@Component({
  selector: 'app-biomarker-velocity-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
      
      <!-- Header HUD -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-xs">
            📈
          </div>
          <div>
            <h3 class="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              BioTrajectory: Biomarker Velocity & Stealth Decay Radar
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
                Gompertz-Makeham
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Detects accelerated organ reserve decline (dV/dt) months before standard lab reference ranges breach cutoffs.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Biological Reserve</span>
            <span class="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400">
              {{ report().organResilienceScore }} / 100
            </span>
          </div>
          <div class="text-right border-l border-zinc-200 dark:border-zinc-700 pl-3">
            <span class="text-[10px] uppercase font-mono font-bold text-zinc-400 block">Hazard Multiplier</span>
            <span class="text-sm font-mono font-black text-amber-500">
              {{ report().gompertzHazardMultiplier }}x
            </span>
          </div>
        </div>
      </div>

      <!-- Stealth Decay Warning Banner if active -->
      @if (report().stealthAlertCount > 0) {
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div class="space-y-0.5">
            <h4 class="font-bold text-xs uppercase tracking-wider">Stealth Organ Reserve Decay Alert Detected</h4>
            <p class="text-xs">
              {{ report().stealthAlertCount }} biomarker(s) are declining at accelerated rates (&ge;15%/year) despite currently residing within conventional "normal" laboratory boundaries.
            </p>
          </div>
        </div>
      }

      <!-- Biomarker Velocity Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (metric of report().metrics; track metric.code) {
          <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
            
            <div class="flex items-center justify-between">
              <div>
                <h5 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{{ metric.name }}</h5>
                <span class="text-[10px] font-mono text-zinc-400">LOINC: {{ metric.code }} &bull; Ref: {{ metric.standardReferenceRange }}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border"
                    [ngClass]="{
                      'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300': metric.trajectoryStatus === 'OPTIMAL',
                      'bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-300': metric.trajectoryStatus === 'STABLE',
                      'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300': metric.trajectoryStatus === 'ACCELERATED_DECLINE',
                      'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300': metric.trajectoryStatus === 'RAPID_CRITICAL_DECAY'
                    }">
                {{ metric.trajectoryStatus }}
              </span>
            </div>

            <!-- Value Comparison HUD -->
            <div class="grid grid-cols-3 gap-2 text-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
              <div>
                <span class="text-[10px] text-zinc-400 block font-mono">Baseline (1y Ago)</span>
                <strong class="text-xs font-mono text-zinc-600 dark:text-zinc-300">{{ metric.baselineValue }} {{ metric.unit }}</strong>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-mono">Current Reading</span>
                <strong class="text-sm font-mono font-black text-zinc-900 dark:text-zinc-100">{{ metric.currentValue }} {{ metric.unit }}</strong>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-mono">5-Yr Extrapolation</span>
                <strong class="text-xs font-mono" [class.text-rose-500]="metric.fiveYearProjection < 40 || metric.fiveYearProjection > 120">{{ metric.fiveYearProjection }} {{ metric.unit }}</strong>
              </div>
            </div>

            <!-- Velocity Meter & Action -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-500">Rate of Change (dV/dt):</span>
                <span class="font-bold" [class.text-rose-500]="metric.velocityPerYear < 0 && metric.name.includes('eGFR')">
                  {{ metric.velocityPerYear > 0 ? '+' : '' }}{{ metric.velocityPerYear }} {{ metric.unit }}/yr ({{ metric.velocityPercentPerYear }}%/yr)
                </span>
              </div>
              <p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40">
                <strong class="text-emerald-600 dark:text-emerald-400">Action:</strong> {{ metric.clinicalAction }}
              </p>
            </div>

          </div>
        }
      </div>

    </div>
  `
})
export class BiomarkerVelocityCardComponent {
  private velocityService = inject(BiomarkerVelocityService);
  private patientState = inject(PatientStateService, { optional: true });

  currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot() || {
      id: 'p001',
      name: 'Homo Sapiens (Male, Metabolic Syndrome, 58y)',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-08-19',
      preexistingConditions: ['Essential Hypertension', 'Type 2 Diabetes'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: '',
      medications: [],
      dietarySupplements: [],
      vitals: { bp: '148/94', hr: '76', spO2: '98%', temp: '36.6', weight: '82', height: '175' }
    };
  });

  report = computed<IBioTrajectoryReport>(() => {
    return this.velocityService.evaluatePatientTrajectory(this.currentPatient());
  });
}
