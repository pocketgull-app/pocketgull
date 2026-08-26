import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { ChronoWeeklyMealPlannerComponent } from '../chrono-weekly-meal-planner.component';
import { PantryLazySusanComponent } from '../pantry-lazy-susan.component';
import { HealthyHobbiesLifestyleComponent } from '../healthy-hobbies-lifestyle.component';
import { FamilyHealthQuestComponent } from '../family/family-health-quest.component';
import { PermaFlourishingSuiteComponent } from '../perma-flourishing-suite.component';
import { OrigamiPapercraftDecorationsComponent } from '../origami-papercraft-decorations.component';
import { PatientUnderTreeComponent } from '../patient-under-tree.component';

@Component({
  selector: 'app-nutrition-suite',
  standalone: true,
  imports: [
    CommonModule, 
    ChronoWeeklyMealPlannerComponent, 
    PantryLazySusanComponent,
    HealthyHobbiesLifestyleComponent,
    FamilyHealthQuestComponent,
    PermaFlourishingSuiteComponent,
    OrigamiPapercraftDecorationsComponent,
    PatientUnderTreeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xl font-bold">🥗</span>
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Nutritional & Metabolic Suite</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold uppercase">Circadian Nutrition</span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Thermal food classification matrix, seasonal meal planning, interactive pantry inventory, and human flourishing quests.</p>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="space-y-6">
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">Circadian Weekly Meal Planner & Thermal Matrix</h4>
          <app-chrono-weekly-meal-planner />
        </div>

        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">Interactive Pantry & Sourcing Lazy Susan</h4>
          <app-pantry-lazy-susan />
        </div>

        <!-- Universal Health Hero Quest & 4 Companion Modes -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <app-family-health-quest />
        </div>

        <!-- Healthy Hobbies & Lifestyle Medicine Matrix -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <app-healthy-hobbies-lifestyle />
        </div>

        <!-- PERMA-V Human Flourishing & Micro-Joys Suite -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <app-perma-flourishing-suite />
        </div>

        <!-- Origami Papercraft Decorations -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <app-origami-decorations />
        </div>

        <!-- Seated Under the Apple Tree & Horizon Family Tree -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <app-patient-under-tree />
        </div>
      </div>
    </div>
  `
})
export class NutritionSuiteComponent {
  private patientState = inject(PatientStateService);
}
