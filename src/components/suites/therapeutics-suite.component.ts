import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { AndroscogginForagingPhytoncideComponent } from '../androscoggin-foraging-phytoncide.component';
import { DietaryAllergyShieldComponent } from '../dietary-allergy-shield.component';

@Component({
  selector: 'app-therapeutics-suite',
  standalone: true,
  imports: [CommonModule, AndroscogginForagingPhytoncideComponent, DietaryAllergyShieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div class="flex items-center gap-3">
          <span class="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xl font-bold">🌿</span>
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Therapeutics & Botanical Suite</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase">Botanical & Nutrients</span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Precision nutrient formulas, TCM herbal decoctions, Ayurvedic Rasayanas, and local wild phytoncides.</p>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Local Wild Botanical & Phytoncide Foraging</h4>
          <app-androscoggin-foraging-phytoncide />
        </div>

        <div class="space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Therapeutic Allergy & Safety Shield</h4>
          <app-dietary-allergy-shield />
        </div>
      </div>
    </div>
  `
})
export class TherapeuticsSuiteComponent {
  private patientState = inject(PatientStateService);
}
