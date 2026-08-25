import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChronobiologyMatrixComponent } from '../chronobiology-matrix.component';
import { ChronoClockDecisionRailComponent } from '../chrono-clock-decision-rail.component';
import { ChronoWeeklyMealPlannerComponent } from '../chrono-weekly-meal-planner.component';
import { ClinicalSleepTwinDashboardComponent } from '../clinical-sleep-twin-dashboard.component';
import { FunctionalCircadianSynergyBridgeComponent } from './functional-circadian-synergy-bridge.component';

@Component({
  selector: 'app-chronobiology-matrix-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    ChronobiologyMatrixComponent,
    ChronoClockDecisionRailComponent,
    ChronoWeeklyMealPlannerComponent,
    ClinicalSleepTwinDashboardComponent,
    FunctionalCircadianSynergyBridgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Cross-Lens Functional-Circadian Synergy Engine -->
      <app-functional-circadian-synergy-bridge></app-functional-circadian-synergy-bridge>

      <!-- Chrono-Clock Decision Rail -->
      <app-chrono-clock-decision-rail></app-chrono-clock-decision-rail>

      <!-- Chronobiology Matrix -->
      <app-chronobiology-matrix></app-chronobiology-matrix>

      <!-- Sleep Twin Dashboard -->
      <app-clinical-sleep-twin-dashboard></app-clinical-sleep-twin-dashboard>

      <!-- Chrono Weekly Meal Planner -->
      <app-chrono-weekly-meal-planner></app-chrono-weekly-meal-planner>
    </div>
  `
})
export class ChronobiologyMatrixLensTabComponent {}

