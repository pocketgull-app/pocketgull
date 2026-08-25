import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IMeridianStatus {
  name: string;
  element: string;
  organPair: string;
  qiLevel: number; // 0 - 100
  stasisStatus: 'Optimal' | 'Qi Deficiency' | 'Blood Stasis' | 'Damp-Heat';
}

@Component({
  selector: 'app-tcm-meridian-stasis-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-emerald-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-emerald-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌿</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-emerald-300">
              12 Jing-Luo Meridian & Zang-Fu Matrix
            </h3>
            <p class="text-[10px] text-emerald-400/80">
              Traditional Chinese Medicine (TCM) Qi & Blood Dynamics
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-950 border border-emerald-700/60 text-emerald-300">
          Zang-Fu Balance
        </span>
      </div>

      <!-- Meridians List -->
      <div class="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        @for (m of meridians; track m.name) {
          <div class="p-2.5 bg-emerald-950/30 border border-emerald-800/30 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div class="text-[11px] font-bold text-emerald-200 flex items-center gap-2">
                <span>{{ m.name }}</span>
                <span class="text-[9px] px-1.5 py-0.5 bg-emerald-900/60 border border-emerald-700/40 rounded text-emerald-300">{{ m.element }}</span>
              </div>
              <p class="text-[10px] text-zinc-400 font-sans mt-0.5">Organ Pair: {{ m.organPair }}</p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-[10px] font-bold block"
                    [class.text-emerald-400]="m.stasisStatus === 'Optimal'"
                    [class.text-amber-400]="m.stasisStatus === 'Qi Deficiency'"
                    [class.text-rose-400]="m.stasisStatus === 'Blood Stasis'"
                    [class.text-cyan-400]="m.stasisStatus === 'Damp-Heat'">
                {{ m.stasisStatus }}
              </span>
              <span class="text-[9px] text-zinc-500 font-mono">Qi: {{ m.qiLevel }}%</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-emerald-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Classical Yellow Emperor's Inner Canon (Huangdi Neijing)</span>
        <span>Acupoint Resonance</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class TcmMeridianStasisMatrixComponent {
  readonly meridians: IMeridianStatus[] = [
    { name: 'Fei (Lung) & Da Chang', element: 'Metal ⚪', organPair: 'LU / LI', qiLevel: 82, stasisStatus: 'Optimal' },
    { name: 'Xin (Heart) & Xiao Chang', element: 'Fire 🔥', organPair: 'HT / SI', qiLevel: 64, stasisStatus: 'Qi Deficiency' },
    { name: 'Pi (Spleen) & Wei (Stomach)', element: 'Earth 🟡', organPair: 'SP / ST', qiLevel: 45, stasisStatus: 'Damp-Heat' },
    { name: 'Gan (Liver) & Dan (Gallbladder)', element: 'Wood 🌿', organPair: 'LR / GB', qiLevel: 38, stasisStatus: 'Blood Stasis' },
    { name: 'Shen (Kidney) & Pang Guang', element: 'Water 🌊', organPair: 'KI / BL', qiLevel: 76, stasisStatus: 'Optimal' }
  ];
}
