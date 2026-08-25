import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { BiomarkerMatrixComponent } from './biomarker-matrix.component';
import { OccupationalHazardCardComponent } from './occupational-hazard-card.component';
import { FoodSafetyGuardrailCardComponent } from './food-safety-guardrail-card.component';
import { YbocsScreenerComponent } from './ybocs-screener.component';
import { ActuarialQalyCalculatorComponent } from './actuarial-qaly-calculator.component';
import { AndroscogginForagingPhytoncideComponent } from './androscoggin-foraging-phytoncide.component';
import { VagalBiofeedbackDockComponent } from './vagal-biofeedback-dock.component';
import { KaggleChallengeCardComponent } from './kaggle-challenge-card.component';
import { ProviderTreatmentNetworkComponent } from './provider-treatment-network.component';

export type DrilldownTarget = 'biomarkers' | 'occupational' | 'food_safety' | 'ybocs' | 'qaly' | 'foraging' | 'vagal' | 'kaggle' | 'network' | null;
export type DrilldownLens = 'evidence' | 'biophysics' | 'epigenetic';

@Component({
  selector: 'app-component-drilldown-unit',
  standalone: true,
  imports: [
    CommonModule,
    BiomarkerMatrixComponent,
    OccupationalHazardCardComponent,
    FoodSafetyGuardrailCardComponent,
    YbocsScreenerComponent,
    ActuarialQalyCalculatorComponent,
    AndroscogginForagingPhytoncideComponent,
    VagalBiofeedbackDockComponent,
    KaggleChallengeCardComponent,
    ProviderTreatmentNetworkComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (targetComponent()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        (click)="close()">
        
        <div 
          class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 flex flex-col gap-4 font-sans"
          (click)="$event.stopPropagation()">
          
          <!-- Header Bar with Tri-Lens Selector -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-3 font-mono">
            <div class="flex items-center gap-3">
              <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-lg">🔍</span>
              <div>
                <span class="text-[10px] uppercase font-bold text-zinc-400 tracking-widest block">Interactive Component Drill-Down Unit</span>
                <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>{{ title() }}</span>
                  <span class="text-xs font-normal text-zinc-500">({{ patientName() }})</span>
                </h3>
              </div>
            </div>

            <!-- Tri-Lens Multi-Paradigm Toggle -->
            <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <button 
                (click)="activeLens.set('evidence')"
                [class.bg-emerald-600]="activeLens() === 'evidence'"
                [class.text-white]="activeLens() === 'evidence'"
                [class.text-zinc-500]="activeLens() !== 'evidence'"
                class="px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all">
                🩺 Clinical Evidence
              </button>
              <button 
                (click)="activeLens.set('biophysics')"
                [class.bg-indigo-600]="activeLens() === 'biophysics'"
                [class.text-white]="activeLens() === 'biophysics'"
                [class.text-zinc-500]="activeLens() !== 'biophysics'"
                class="px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all">
                🌌 Biophysics
              </button>
              <button 
                (click)="activeLens.set('epigenetic')"
                [class.bg-teal-600]="activeLens() === 'epigenetic'"
                [class.text-white]="activeLens() === 'epigenetic'"
                [class.text-zinc-500]="activeLens() !== 'epigenetic'"
                class="px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all">
                🌲 7-Generations
              </button>
            </div>

            <button 
              (click)="close()"
              aria-label="Close drill-down view"
              class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center text-sm font-bold transition">
              ✕
            </button>
          </div>

          <!-- Paradigm Lens Summary Banner -->
          <div class="px-4 py-2.5 rounded-xl border text-xs font-mono flex items-center justify-between"
            [class.bg-emerald-500\/10]="activeLens() === 'evidence'"
            [class.border-emerald-500\/20]="activeLens() === 'evidence'"
            [class.text-emerald-400]="activeLens() === 'evidence'"
            [class.bg-indigo-500\/10]="activeLens() === 'biophysics'"
            [class.border-indigo-500\/20]="activeLens() === 'biophysics'"
            [class.text-indigo-300]="activeLens() === 'biophysics'"
            [class.bg-teal-500\/10]="activeLens() === 'epigenetic'"
            [class.border-teal-500\/20]="activeLens() === 'epigenetic'"
            [class.text-teal-300]="activeLens() === 'epigenetic'">
            
            <span>Lens Active: {{ lensDescription() }}</span>
            <span class="font-bold">LOINC / FHIR R4 Compliant</span>
          </div>

          <!-- Dynamic Component View -->
          <div class="py-2">
            @switch (targetComponent()) {
              @case ('biomarkers') {
                <app-biomarker-matrix></app-biomarker-matrix>
              }
              @case ('occupational') {
                <app-occupational-hazard-card></app-occupational-hazard-card>
              }
              @case ('food_safety') {
                <app-food-safety-guardrail-card></app-food-safety-guardrail-card>
              }
              @case ('ybocs') {
                <app-ybocs-screener></app-ybocs-screener>
              }
              @case ('qaly') {
                <app-actuarial-qaly-calculator></app-actuarial-qaly-calculator>
              }
              @case ('foraging') {
                <app-androscoggin-foraging-phytoncide></app-androscoggin-foraging-phytoncide>
              }
              @case ('vagal') {
                <app-vagal-biofeedback-dock></app-vagal-biofeedback-dock>
              }
              @case ('kaggle') {
                <app-kaggle-challenge-card></app-kaggle-challenge-card>
              }
              @case ('network') {
                <app-provider-treatment-network></app-provider-treatment-network>
              }
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ComponentDrilldownUnitComponent {
  readonly targetComponent = signal<DrilldownTarget>(null);
  readonly activeLens = signal<DrilldownLens>('evidence');

  constructor(private patientState: PatientStateService = {} as any) {}

  readonly patientName = computed(() => this.patientState.patientName() || 'Patient');

  readonly title = computed(() => {
    switch (this.targetComponent()) {
      case 'biomarkers': return 'Biomarker & Metabolic Diagnostic Matrix';
      case 'occupational': return 'Occupational Hazard & Environmental Risk Shield';
      case 'food_safety': return 'Food Safety & Additive Toxicology Guardrails';
      case 'ybocs': return 'Y-BOCS Obsessive-Compulsive Triage Screener';
      case 'qaly': return 'Actuarial QALY & Healthspan Longevity Calculator';
      case 'foraging': return 'Androscoggin Phytochemical Foraging Matrix';
      case 'vagal': return 'Vagal RSA Biofeedback & Entrainment Dock';
      case 'kaggle': return 'Kaggle & PhysioNet 2026 Submission Suite';
      case 'network': return 'Clinician Peer Matchmaker & Treatment Locator';
      default: return 'Component Drill-Down';
    }
  });

  readonly lensDescription = computed(() => {
    switch (this.activeLens()) {
      case 'evidence': return 'Clinical Evidence (LOINC, Cochrane RoB 2, 95% Confidence Intervals)';
      case 'biophysics': return 'Biophysics (Friston Free Energy Negentropy, Penrose 40Hz Quantum Gamma)';
      case 'epigenetic': return '7-Generations Epigenetics (150-Year Trajectory, Histone Methylation)';
    }
  });

  open(target: DrilldownTarget): void {
    this.targetComponent.set(target);
  }

  close(): void {
    this.targetComponent.set(null);
  }
}
