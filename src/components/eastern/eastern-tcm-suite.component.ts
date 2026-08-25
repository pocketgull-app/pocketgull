import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TcmMeridianStasisMatrixComponent } from './tcm-meridian-stasis-matrix.component';
import { PulseTonguePatternDiagnosisComponent } from './pulse-tongue-pattern-diagnosis.component';

@Component({
  selector: 'app-eastern-tcm-suite',
  standalone: true,
  imports: [
    CommonModule,
    TcmMeridianStasisMatrixComponent,
    PulseTonguePatternDiagnosisComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🌿</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-emerald-200">
              Eastern Medicine & TCM Jing-Luo Suite
            </h2>
          </div>
          <p class="text-xs text-emerald-300/80 mt-1 max-w-2xl">
            12 Primary Jing-Luo Meridian channels, Zang-Fu organ pair harmony, 28 Radial Mai pulse qualities, and Four Examination (Si-Zhen) pattern differentials.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 shrink-0">
          TCM Jing-Luo Engine
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[420px]">
          <app-tcm-meridian-stasis-matrix />
        </div>
        <div class="h-[420px]">
          <app-pulse-tongue-pattern-diagnosis />
        </div>
      </div>
    </div>
  `
})
export class EasternTcmSuiteComponent {}
