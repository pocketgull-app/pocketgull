import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDhatuTissue {
  name: string;
  sanskrit: string;
  function: string;
  status: 'Nourished' | 'Depleted' | 'Stagnant';
}

@Component({
  selector: 'app-dhatu-tissue-chakra-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-orange-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-orange-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🕉️</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-orange-300">
              7 Saptadhatus & Chakra Flow Matrix
            </h3>
            <p class="text-[10px] text-orange-400/80">
              Sequential Tissue Transformation (Ahara Rasa $\rightarrow$ Ojas)
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-orange-950 border border-orange-700/60 text-orange-300">
          Ojas Flow
        </span>
      </div>

      <!-- Dhatus Flow Grid -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (d of dhatus; track d.name) {
          <div class="p-2.5 bg-orange-950/30 border border-orange-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-orange-200 flex items-center gap-2">
                <span>{{ d.name }}</span>
                <span class="text-[9px] text-orange-400">({{ d.sanskrit }})</span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">{{ d.function }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-bold block"
                    [class.text-emerald-400]="d.status === 'Nourished'"
                    [class.text-amber-400]="d.status === 'Depleted'"
                    [class.text-rose-400]="d.status === 'Stagnant'">
                {{ d.status }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-orange-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Charaka Samhita & Sushruta Samhita</span>
        <span>Prana & Marma Vital Energy</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class DhatuTissueChakraMatrixComponent {
  readonly dhatus: IDhatuTissue[] = [
    { name: 'Plasma & Lymph', sanskrit: 'Rasa Dhatu', function: 'Nourishment & Immunity Fluid', status: 'Nourished' },
    { name: 'Blood Cells', sanskrit: 'Rakta Dhatu', function: 'Oxygenation & Vitality', status: 'Nourished' },
    { name: 'Muscle Tissue', sanskrit: 'Mamsa Dhatu', function: 'Structural Support & Movement', status: 'Depleted' },
    { name: 'Adipose Tissue', sanskrit: 'Meda Dhatu', function: 'Lubrication & Insulation', status: 'Stagnant' },
    { name: 'Bone & Joints', sanskrit: 'Asthi Dhatu', function: 'Skeletal Framework', status: 'Nourished' }
  ];
}
