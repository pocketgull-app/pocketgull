import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OhsumiAutophagyChronometerComponent } from './ohsumi-autophagy-chronometer.component';
import { HallChronotherapyMatrixComponent } from './hall-chronotherapy-matrix.component';
import { PaaboPaleoGenomicComponent } from './paabo-paleo-genomic.component';

@Component({
  selector: 'app-nobel-laureates-suite',
  standalone: true,
  imports: [
    CommonModule,
    OhsumiAutophagyChronometerComponent,
    HallChronotherapyMatrixComponent,
    PaaboPaleoGenomicComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-200">
              Nobel Laureates Evidence & Diagnostic Suite
            </h2>
          </div>
          <p class="text-xs text-amber-300/80 mt-1 max-w-2xl">
            Integrating Nobel Prize-winning breakthroughs in Autophagy (Ohsumi 2016), Circadian Clock Genes (Hall/Rosbash/Young 2017), and Archaic Paleo-Genomics (Pääbo 2022) into actionable patient intelligence.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-900/60 border border-amber-500/50 text-amber-200 shrink-0">
          Nobel Intelligence Layer
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="h-[420px]">
          <app-ohsumi-autophagy-chronometer />
        </div>
        <div class="h-[420px]">
          <app-hall-chronotherapy-matrix />
        </div>
        <div class="h-[420px]">
          <app-paabo-paleo-genomic />
        </div>
      </div>
    </div>
  `
})
export class NobelLaureatesSuiteComponent {}
