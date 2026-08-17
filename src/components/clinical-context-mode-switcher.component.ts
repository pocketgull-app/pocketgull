import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalContextModeService, ClinicalPersonaMode } from '../services/clinical-context-mode.service';

@Component({
  selector: 'app-clinical-context-mode-switcher',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      
      <!-- Current Active Mode Indicator -->
      <div class="flex items-center gap-2.5">
        <span class="text-2xl p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          {{ modeService.currentConfig().icon }}
        </span>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
              {{ modeService.currentConfig().label }}
            </span>
            <span class="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 uppercase">
              {{ modeService.currentConfig().badge }}
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-tight mt-0.5">
            {{ modeService.currentConfig().tagline }}
          </p>
        </div>
      </div>

      <!-- Mode Selector Pills -->
      <div class="flex flex-wrap items-center gap-1.5 self-start sm:self-auto font-mono text-xs">
        <button (click)="selectMode('patient_family')"
          [class.bg-teal-600]="modeService.activeMode() === 'patient_family'"
          [class.text-white]="modeService.activeMode() === 'patient_family'"
          [class.bg-zinc-100]="modeService.activeMode() !== 'patient_family'"
          [class.dark:bg-zinc-800]="modeService.activeMode() !== 'patient_family'"
          [class.text-zinc-700]="modeService.activeMode() !== 'patient_family'"
          [class.dark:text-zinc-300]="modeService.activeMode() !== 'patient_family'"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 transition cursor-pointer flex items-center gap-1 shadow-2xs font-semibold">
          <span>🌿</span>
          <span class="hidden md:inline">Family</span>
        </button>

        <button (click)="selectMode('school_safety')"
          [class.bg-amber-600]="modeService.activeMode() === 'school_safety'"
          [class.text-white]="modeService.activeMode() === 'school_safety'"
          [class.bg-zinc-100]="modeService.activeMode() !== 'school_safety'"
          [class.dark:bg-zinc-800]="modeService.activeMode() !== 'school_safety'"
          [class.text-zinc-700]="modeService.activeMode() !== 'school_safety'"
          [class.dark:text-zinc-300]="modeService.activeMode() !== 'school_safety'"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 transition cursor-pointer flex items-center gap-1 shadow-2xs font-semibold">
          <span>🎒</span>
          <span class="hidden md:inline">School 504</span>
        </button>

        <button (click)="selectMode('clinical_specialist')"
          [class.bg-blue-600]="modeService.activeMode() === 'clinical_specialist'"
          [class.text-white]="modeService.activeMode() === 'clinical_specialist'"
          [class.bg-zinc-100]="modeService.activeMode() !== 'clinical_specialist'"
          [class.dark:bg-zinc-800]="modeService.activeMode() !== 'clinical_specialist'"
          [class.text-zinc-700]="modeService.activeMode() !== 'clinical_specialist'"
          [class.dark:text-zinc-300]="modeService.activeMode() !== 'clinical_specialist'"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 transition cursor-pointer flex items-center gap-1 shadow-2xs font-semibold">
          <span>🩺</span>
          <span class="hidden md:inline">Clinician</span>
        </button>

        <button (click)="selectMode('executive_governance')"
          [class.bg-purple-600]="modeService.activeMode() === 'executive_governance'"
          [class.text-white]="modeService.activeMode() === 'executive_governance'"
          [class.bg-zinc-100]="modeService.activeMode() !== 'executive_governance'"
          [class.dark:bg-zinc-800]="modeService.activeMode() !== 'executive_governance'"
          [class.text-zinc-700]="modeService.activeMode() !== 'executive_governance'"
          [class.dark:text-zinc-300]="modeService.activeMode() !== 'executive_governance'"
          class="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 transition cursor-pointer flex items-center gap-1 shadow-2xs font-semibold">
          <span>🏛️</span>
          <span class="hidden md:inline">Governance</span>
        </button>
      </div>

    </div>
  `
})
export class ClinicalContextModeSwitcherComponent {
  modeService = inject(ClinicalContextModeService);

  selectMode(mode: ClinicalPersonaMode): void {
    this.modeService.setMode(mode);
  }
}
