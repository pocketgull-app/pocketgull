import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Glp1IncretinMatrixComponent } from './glp1-incretin-matrix.component';
import { ScfaMicrobiomeVagalComponent } from './scfa-microbiome-vagal.component';

@Component({
  selector: 'app-aaas-breakthroughs-suite',
  standalone: true,
  imports: [
    CommonModule,
    Glp1IncretinMatrixComponent,
    ScfaMicrobiomeVagalComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔬</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-teal-200">
              AAAS Science Breakthroughs & Innovation Suite
            </h2>
          </div>
          <p class="text-xs text-teal-300/80 mt-1 max-w-2xl">
            Integrating AAAS Award-winning breakthroughs in Incretin GLP-1/GIP receptor signaling, metagenomic SCFA gut-brain vagal pathways, and spatial transcriptomics into PocketGull's clinical engine.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-teal-900/60 border border-teal-500/50 text-teal-200 shrink-0">
          AAAS Science Layer
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[420px]">
          <app-glp1-incretin-matrix />
        </div>
        <div class="h-[420px]">
          <app-scfa-microbiome-vagal />
        </div>
      </div>
    </div>
  `
})
export class AaasBreakthroughsSuiteComponent {}
