import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PocketGullBadgeComponent } from '../shared/pocket-gull-badge.component';

@Component({
  selector: 'app-epigenetic-longevity-lens-tab',
  standalone: true,
  imports: [CommonModule, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-zinc-950 border border-purple-500/30 rounded-2xl shadow-xl space-y-4 font-mono text-zinc-100 backdrop-blur-md">
      <!-- Section Header -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">⏳</span>
          <div>
            <h3 class="text-sm font-extrabold text-purple-300 uppercase tracking-wide">
              Epigenetic Longevity & Transgenerational Epigenetics
            </h3>
            <p class="text-xs text-zinc-400">
              Histone methylation, telomere length decay rates, and mitochondrial healthspan telemetry.
            </p>
          </div>
        </div>
        <pocket-gull-badge label="7-GENERATIONS STEWARDSHIP" severity="success"></pocket-gull-badge>
      </div>

      <!-- Telemetry Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span class="text-zinc-500 block text-[10px] uppercase font-bold">DNA Methylation Pace</span>
          <span class="text-purple-400 font-extrabold text-base">0.84 / yr</span>
          <span class="text-[10px] text-emerald-400 block mt-1">↓ 16% decelerated aging</span>
        </div>
        <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span class="text-zinc-500 block text-[10px] uppercase font-bold">Telomere Buffer</span>
          <span class="text-purple-300 font-extrabold text-base">7.4 kb</span>
          <span class="text-[10px] text-purple-400 block mt-1">Optimal lengthspan</span>
        </div>
        <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span class="text-zinc-500 block text-[10px] uppercase font-bold">Mitochondrial Coupling</span>
          <span class="text-emerald-400 font-extrabold text-base">98.2%</span>
          <span class="text-[10px] text-zinc-400 block mt-1">High ATP efficiency</span>
        </div>
      </div>

      <!-- Content Slot -->
      <div class="prose dark:prose-invert max-w-none text-xs text-zinc-300">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EpigeneticLongevityLensTabComponent {
  readonly state = inject(PatientStateService);
  reportText = input<string>('');
}
