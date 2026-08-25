import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MrnaLipidNanoparticleMatrixComponent } from './mrna-lipid-nanoparticle-matrix.component';
import { PiezoMechanoreceptorMatrixComponent } from './piezo-mechanoreceptor-matrix.component';

@Component({
  selector: 'app-lasker-breakthrough-suite',
  standalone: true,
  imports: [
    CommonModule,
    MrnaLipidNanoparticleMatrixComponent,
    PiezoMechanoreceptorMatrixComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 border border-indigo-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🏛️</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-indigo-200">
              Lasker & Breakthrough Prize Clinical Suite
            </h2>
          </div>
          <p class="text-xs text-indigo-300/80 mt-1 max-w-2xl">
            Integrating Lasker Award and Breakthrough Prize discoveries in mRNA Lipid Nanoparticles (Karikó 2021) and PIEZO1/2 Mechanoreceptors (Julius/Patapoutian 2021) into PocketGull's multi-paradigm architecture.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-indigo-900/60 border border-indigo-500/50 text-indigo-200 shrink-0">
          Lasker & Breakthrough Layer
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[420px]">
          <app-mrna-lipid-nanoparticle-matrix />
        </div>
        <div class="h-[420px]">
          <app-piezo-mechanoreceptor-matrix />
        </div>
      </div>
    </div>
  `
})
export class LaskerBreakthroughSuiteComponent {}
