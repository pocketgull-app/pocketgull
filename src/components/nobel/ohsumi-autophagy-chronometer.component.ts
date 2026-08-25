import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ohsumi-autophagy-chronometer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-emerald-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      <!-- Header Bar -->
      <div class="flex items-center justify-between gap-3 mb-3 border-b border-emerald-900/40 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🏆</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-emerald-300">
              Autophagy & Lysosomal Recycling (Ohsumi Model)
            </h3>
            <p class="text-[10px] text-emerald-400/80">
              2016 Nobel Prize — Yoshinori Ohsumi Autophagosome Clearance
            </p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-emerald-950 border border-emerald-700/60 text-emerald-300">
          Fasting: {{ fastingHours() }}h
        </span>
      </div>

      <!-- Fasting Duration Slider -->
      <div class="space-y-1 mb-4">
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-zinc-400 font-bold uppercase">Intermittent Fasting Duration:</span>
          <span class="text-emerald-300 font-bold font-mono">{{ fastingHours() }} Hours</span>
        </div>
        <input type="range" min="0" max="48" step="1" [value]="fastingHours()" (input)="onFastingChange($event)"
               class="w-full accent-emerald-500 cursor-pointer" />
      </div>

      <!-- Autophagy Stages Gauge -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="p-2.5 rounded-xl border flex flex-col justify-between"
             [class.bg-emerald-950]="fastingHours() < 12" [class.border-emerald-700]="fastingHours() < 12"
             [class.bg-zinc-900]="fastingHours() >= 12" [class.border-zinc-800]="fastingHours() >= 12">
          <span class="text-[10px] text-zinc-400 font-bold uppercase">Phase 1: Glycogen</span>
          <span class="text-xs font-bold text-emerald-300 mt-1">0 - 12h</span>
          <span class="text-[9px] text-zinc-500">mTOR Active</span>
        </div>

        <div class="p-2.5 rounded-xl border flex flex-col justify-between"
             [class.bg-emerald-950]="fastingHours() >= 12 && fastingHours() < 24" [class.border-emerald-700]="fastingHours() >= 12 && fastingHours() < 24"
             [class.bg-zinc-900]="fastingHours() < 12 || fastingHours() >= 24" [class.border-zinc-800]="fastingHours() < 12 || fastingHours() >= 24">
          <span class="text-[10px] text-zinc-400 font-bold uppercase">Phase 2: Autophagy Peak</span>
          <span class="text-xs font-bold text-emerald-300 mt-1">12 - 24h</span>
          <span class="text-[9px] text-zinc-500">AMPK Activated</span>
        </div>

        <div class="p-2.5 rounded-xl border flex flex-col justify-between"
             [class.bg-emerald-950]="fastingHours() >= 24" [class.border-emerald-700]="fastingHours() >= 24"
             [class.bg-zinc-900]="fastingHours() < 24" [class.border-zinc-800]="fastingHours() < 24">
          <span class="text-[10px] text-zinc-400 font-bold uppercase">Phase 3: Stem Renewal</span>
          <span class="text-xs font-bold text-emerald-300 mt-1">24h+</span>
          <span class="text-[9px] text-zinc-500">Immune Rejuvenation</span>
        </div>
      </div>

      <!-- Lysosomal Metrics Progress -->
      <div class="space-y-2 mt-auto">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-400">Autophagosome Clearance Flux:</span>
          <strong class="text-emerald-300">{{ fluxPercentage() }}%</strong>
        </div>
        <div class="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-emerald-950">
          <div class="bg-gradient-to-r from-emerald-600 to-cyan-400 h-full transition-all duration-300" [style.width.%]="fluxPercentage()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
  `]
})
export class OhsumiAutophagyChronometerComponent {
  readonly fastingHours = signal<number>(18);

  readonly fluxPercentage = computed(() => {
    const h = this.fastingHours();
    if (h < 12) return Math.round((h / 12) * 35);
    if (h < 24) return Math.round(35 + ((h - 12) / 12) * 55);
    return Math.min(100, Math.round(90 + ((h - 24) / 24) * 10));
  });

  onFastingChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.fastingHours.set(val);
  }
}
