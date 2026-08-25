import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maternal-postpartum-lens-tab',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full space-y-6">
      <div class="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/40 border border-purple-500/30 shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🤰</span>
            <div>
              <h3 class="text-lg font-bold text-zinc-100">Maternal & Postpartum Telemetry Suite</h3>
              <p class="text-xs text-zinc-400">Perinatal wellness, lactation safety index, and Edinburgh Postnatal Depression Scale (EPDS) tracking.</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Perinatal Stage: 3rd Trimester / Postpartum
          </span>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Lactation Safety Index</span>
            <div class="text-xl font-bold text-emerald-400">L1 — Safe</div>
            <span class="text-[11px] text-zinc-400">LactMed verified compatibility for prescribed therapies</span>
          </div>

          <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">EPDS Mood Screener</span>
            <div class="text-xl font-bold text-amber-400">4 / 30</div>
            <span class="text-[11px] text-zinc-400">Low risk for perinatal mood & anxiety disorders</span>
          </div>

          <div class="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
            <span class="text-zinc-500 uppercase tracking-wider text-[10px] font-bold">Nutritional Demands</span>
            <div class="text-xl font-bold text-purple-300">+450 kcal / day</div>
            <span class="text-[11px] text-zinc-400">Choline (550mg), Folate (600mcg), DHA (300mg)</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MaternalPostpartumLensTabComponent {}
