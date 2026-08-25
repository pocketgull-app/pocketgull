import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmergencyNutritionalBypassComponent } from '../emergency-nutritional-bypass.component';
import { DietaryAllergyShieldComponent } from '../dietary-allergy-shield.component';
import { PocketGullCardComponent } from '../shared/pocket-gull-card.component';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';

@Component({
  selector: 'app-nutritional-bypass-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    EmergencyNutritionalBypassComponent,
    DietaryAllergyShieldComponent,
    PocketGullCardComponent,
    PocketGullBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Nutritional Bypass & Allergy Shield Header -->
      <pocket-gull-card>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🥗</span>
            <div>
              <h3 class="font-extrabold text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Nutritional Bypass & Immunological Allergy Shield
              </h3>
              <p class="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                Real-time screening of dietary protocols, histamine triggers, IgG4 sensitivities, and emergency bypass nutrition.
              </p>
            </div>
          </div>
          <pocket-gull-badge label="Nutritional Safety Active" severity="success"></pocket-gull-badge>
        </div>
      </pocket-gull-card>

      <!-- Emergency Bypass Component -->
      <app-emergency-nutritional-bypass></app-emergency-nutritional-bypass>

      <!-- Allergy & Histamine Shield -->
      <app-dietary-allergy-shield></app-dietary-allergy-shield>
    </div>
  `
})
export class NutritionalBypassLensTabComponent {
  readonly patient = input<any>(null);
}
