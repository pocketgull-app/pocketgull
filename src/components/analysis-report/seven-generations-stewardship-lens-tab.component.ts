import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AndroscogginForagingPhytoncideComponent } from '../androscoggin-foraging-phytoncide.component';

@Component({
  selector: 'app-seven-generations-stewardship-lens-tab',
  standalone: true,
  imports: [
    CommonModule,
    AndroscogginForagingPhytoncideComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <div class="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌲</span>
            <div>
              <h3 class="text-lg font-bold text-zinc-100">Seven Generations Environmental Stewardship</h3>
              <p class="text-xs text-zinc-400">Multi-generational epigenetic lineage protection, micro-climate exposure reduction, and forest phytoncide therapy.</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Lineage Health Target: 7+ Generations
          </span>
        </div>
      </div>

      <!-- Androscoggin Wild Foraging & Forest Bathing Phytoncide Telemetry -->
      <app-androscoggin-foraging-phytoncide></app-androscoggin-foraging-phytoncide>
    </div>
  `
})
export class SevenGenerationsStewardshipLensTabComponent {}
