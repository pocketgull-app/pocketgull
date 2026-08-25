import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glp1-incretin-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-teal-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-teal-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🧪</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-teal-300">
              GLP-1 / GIP Incretin & Satiety Matrix (AAAS Science Breakthrough)
            </h3>
            <p class="text-[10px] text-teal-400/80">
              AAAS Breakthrough of the Year — Cardiometabolic & Hypothalamic Axis
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-teal-950 border border-teal-700/60 text-teal-300">
          GLP-1: Active
        </span>
      </div>

      <!-- Satiety Slider -->
      <div class="space-y-1 mb-4">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-zinc-400 font-bold uppercase">Incretin Agonist Dose Level:</span>
          <span class="text-teal-300 font-bold font-mono">{{ doseLevel() }} mg/wk</span>
        </div>
        <input type="range" min="0.25" max="15.0" step="0.25" [value]="doseLevel()" (input)="onDoseChange($event)"
               class="w-full accent-teal-500 cursor-pointer" />
      </div>

      <!-- Incretin Multi-System Metrics -->
      <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div class="p-2.5 bg-teal-950/30 border border-teal-800/30 rounded-xl">
          <span class="text-[10px] text-zinc-400 font-bold uppercase block">Gastric Emptying Delay</span>
          <strong class="text-teal-300 text-sm font-bold mt-1 block">{{ gastricDelay() }}h</strong>
          <span class="text-[9px] text-zinc-500">Postprandial Glucose Stability</span>
        </div>
        <div class="p-2.5 bg-teal-950/30 border border-teal-800/30 rounded-xl">
          <span class="text-[10px] text-zinc-400 font-bold uppercase block">Hypothalamic Satiety Signal</span>
          <strong class="text-teal-300 text-sm font-bold mt-1 block">+{{ satietyScore() }}% POMC activation</strong>
          <span class="text-[9px] text-zinc-500">Arcuate Nucleus entrainment</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-auto pt-2 border-t border-teal-900/30 flex items-center justify-between text-[10px] text-zinc-500">
        <span>AAAS Breakthrough of the Year Award</span>
        <span>Dual GIP / GLP-1 Receptor Agonism</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class Glp1IncretinMatrixComponent {
  readonly doseLevel = signal<number>(2.4);

  readonly gastricDelay = computed(() => (1.5 + (this.doseLevel() / 15) * 3.5).toFixed(1));
  readonly satietyScore = computed(() => Math.round(20 + (this.doseLevel() / 15) * 75));

  onDoseChange(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.doseLevel.set(val);
  }
}
