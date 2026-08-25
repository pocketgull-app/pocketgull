import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalPlanningEngineService, IFhirClinicalGoal } from '../services/goal-planning-engine.service';

@Component({
  selector: 'app-goal-planning-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section 
      class="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 text-zinc-100 shadow-xl backdrop-blur-md"
      aria-label="Clinical SMART Goal Planning and Milestone Quests"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <span class="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xl" aria-hidden="true">
            🎯
          </span>
          <div>
            <h2 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
              Clinical SMART Goals & Quests
              <span class="text-xs px-2 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800/50 font-mono">
                FHIR R4 Goal
              </span>
            </h2>
            <p class="text-xs text-zinc-400">
              Personalized therapeutic objectives with AI clinical agent decomposition
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-400">Active Goals:</span>
          <span class="text-xs font-mono font-semibold px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-teal-400 tabular-nums">
            {{ goalService.activeCount() }}
          </span>
        </div>
      </div>

      <!-- Goals List -->
      <div class="space-y-4">
        @for (goal of goalService.goals(); track goal.id) {
          <div 
            class="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200"
          >
            <!-- Top row -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-2.5">
                <span class="text-lg" aria-hidden="true">{{ goal.emojiBadge }}</span>
                <div>
                  <h3 class="text-sm font-semibold text-zinc-200">
                    {{ goal.title }}
                  </h3>
                  <p class="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                    <span>Mentor: {{ goal.assignedPersona }}</span>
                  </p>
                </div>
              </div>

              <!-- Status Badge -->
              <span 
                class="text-xs px-2.5 py-1 rounded-full font-medium border"
                [ngClass]="{
                  'bg-teal-500/10 text-teal-400 border-teal-500/30': goal.achievementStatus === 'achieved',
                  'bg-amber-500/10 text-amber-400 border-amber-500/30': goal.achievementStatus === 'in-progress',
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/30': goal.achievementStatus === 'sustaining'
                }"
              >
                {{ goal.achievementStatus | uppercase }}
              </span>
            </div>

            <!-- Progress Bar & Metrics -->
            <div class="mt-3 bg-zinc-950/80 rounded-lg p-3 border border-zinc-800/50">
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-zinc-400 font-mono">
                  {{ goal.targetMetricName }}: 
                  <strong class="text-zinc-200 font-mono tabular-nums">{{ goal.currentValue }} {{ goal.unit }}</strong> 
                  / <span class="text-zinc-400 font-mono tabular-nums">{{ goal.targetValue }} {{ goal.unit }}</span>
                </span>
                <span class="font-mono text-teal-400 font-semibold tabular-nums">
                  {{ goalService.calculateProgress(goal) }}%
                </span>
              </div>

              <!-- Bar -->
              <div class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  [style.width.%]="goalService.calculateProgress(goal)"
                ></div>
              </div>

              <!-- Quest Counter & Actions -->
              <div class="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40 text-xs">
                <span class="text-zinc-400 font-mono">
                  Quests: <strong class="text-zinc-200 tabular-nums">{{ goal.completedQuestsCount }}/{{ goal.milestoneQuestsCount }}</strong> completed
                </span>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700/60 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400"
                    [disabled]="goal.completedQuestsCount >= goal.milestoneQuestsCount"
                    (click)="onAdvanceQuest(goal.id)"
                    aria-label="Advance completed quest count"
                  >
                    + Complete Quest
                  </button>

                  <button
                    type="button"
                    class="px-2.5 py-1 rounded bg-teal-950/80 hover:bg-teal-900 active:bg-teal-800 text-teal-300 text-xs font-medium transition-colors border border-teal-800/60 focus-visible:ring-2 focus-visible:ring-teal-400"
                    (click)="onExportFhirGoal(goal)"
                    aria-label="Export FHIR R4 Goal JSON payload"
                  >
                    Export FHIR
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Export Notification Toast -->
      @if (exportedJsonPayload()) {
        <div class="mt-4 p-3 bg-teal-950/40 border border-teal-500/40 rounded-xl text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-semibold text-teal-300">✅ FHIR R4 Goal Resource Exported</span>
            <button 
              type="button" 
              class="text-zinc-400 hover:text-zinc-200"
              (click)="exportedJsonPayload.set(null)"
            >
              ✕
            </button>
          </div>
          <pre class="bg-zinc-950 p-2.5 rounded text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-32">{{ exportedJsonPayload() }}</pre>
        </div>
      }
    </section>
  `
})
export class GoalPlanningCardComponent {
  readonly goalService = inject(GoalPlanningEngineService);
  readonly exportedJsonPayload = signal<string | null>(null);

  onAdvanceQuest(goalId: string): void {
    this.goalService.completeQuest(goalId);
  }

  onExportFhirGoal(goal: IFhirClinicalGoal): void {
    const fhirResource = this.goalService.exportToFhirGoal(goal);
    this.exportedJsonPayload.set(JSON.stringify(fhirResource, null, 2));
  }
}
