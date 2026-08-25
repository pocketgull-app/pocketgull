import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { VagalBiofeedbackDockComponent } from '../vagal-biofeedback-dock.component';
import { ChronoClockDecisionRailComponent } from '../chrono-clock-decision-rail.component';
import { HolisticSleepToolkitComponent } from '../holistic-sleep-toolkit.component';

@Component({
  selector: 'app-recovery-suite',
  standalone: true,
  imports: [CommonModule, VagalBiofeedbackDockComponent, ChronoClockDecisionRailComponent, HolisticSleepToolkitComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xl font-bold">⚡</span>
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Kinetic & Athletic Recovery Suite</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-bold uppercase">120 BPM Entrainment</span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Autonomic vagal tone biofeedback, Sleep Twin 95% Conformal Uncertainty HUD, and 120 BPM AVS audio entrainment.</p>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Autonomic Vagal Biofeedback & Resonant Breathing</h4>
          <app-vagal-biofeedback-dock />
        </div>

        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Circadian Timing & Tactical Decision Rail</h4>
          <app-chrono-clock-decision-rail />
        </div>

        <!-- Sleep Twin & Conformal Uncertainty Bounds Engine -->
        <div class="space-y-4 col-span-1 lg:col-span-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-2">
            <span>🌙</span> Sleep Twin, Conformal Uncertainty (95% Coverage) & Ambient Sanctuary
          </h4>
          <app-holistic-sleep-toolkit />
        </div>
      </div>
    </div>
  `
})
export class RecoverySuiteComponent {
  private patientState = inject(PatientStateService);
}
