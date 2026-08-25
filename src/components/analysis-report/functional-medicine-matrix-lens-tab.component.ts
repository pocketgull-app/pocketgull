import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FunctionalMedicineMatrixComponent } from '../functional-medicine-matrix.component';
import { BiomarkerMatrixComponent } from '../biomarker-matrix.component';
import { ClinicalSleepTwinDashboardComponent } from '../clinical-sleep-twin-dashboard.component';
import { FunctionalCircadianSynergyBridgeComponent } from './functional-circadian-synergy-bridge.component';

@Component({
  selector: 'app-functional-medicine-matrix-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    FunctionalMedicineMatrixComponent,
    FunctionalCircadianSynergyBridgeComponent,
    BiomarkerMatrixComponent,
    ClinicalSleepTwinDashboardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <!-- Cross-Lens Functional-Circadian Synergy Engine -->
      <app-functional-circadian-synergy-bridge></app-functional-circadian-synergy-bridge>

      <!-- Functional Medicine 7-Node Matrix -->
      <app-functional-medicine-matrix></app-functional-medicine-matrix>

      <!-- Biomarker Matrix -->
      <app-biomarker-matrix></app-biomarker-matrix>

      <!-- Clinical Sleep Twin Simulator -->
      <app-clinical-sleep-twin-dashboard></app-clinical-sleep-twin-dashboard>
    </div>
  `
})
export class FunctionalMedicineMatrixLensTabComponent {}

