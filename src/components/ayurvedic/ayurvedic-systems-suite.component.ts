import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VataPittaKaphaMatrixComponent } from './vata-pitta-kapha-matrix.component';
import { DhatuTissueChakraMatrixComponent } from './dhatu-tissue-chakra-matrix.component';
import { MedhaSaktiMatrixComponent } from './medha-sakti-matrix.component';

@Component({
  selector: 'app-ayurvedic-systems-suite',
  standalone: true,
  imports: [
    CommonModule,
    VataPittaKaphaMatrixComponent,
    DhatuTissueChakraMatrixComponent,
    MedhaSaktiMatrixComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 font-sans">
      <!-- Suite Banner -->
      <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-800/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🪷</span>
            <h2 class="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-200">
              Ayurvedic Classical Medicine & Tridosha Suite
            </h2>
          </div>
          <p class="text-xs text-amber-300/80 mt-1 max-w-2xl">
            Vata, Pitta, and Kapha Prakriti/Vikriti ratios, Agni metabolic fire, Medha Śakti Tri-Fold Intellect (Grahana, Dhāraṇā, Smaraṇa), and 7 Saptadhatu tissue transformation.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-900/60 border border-amber-500/50 text-amber-200 shrink-0">
          Ayurvedic Engine
        </span>
      </div>

      <!-- Suite Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="h-[420px]">
          <app-vata-pitta-kapha-matrix />
        </div>
        <div class="h-[420px]">
          <app-dhatu-tissue-chakra-matrix />
        </div>
      </div>

      <!-- Medha Śakti Tri-Fold Cognitive Intellect Matrix -->
      <div class="w-full">
        <app-medha-sakti-matrix />
      </div>
    </div>
  `
})
export class AyurvedicSystemsSuiteComponent {}
