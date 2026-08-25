import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-chronobiology-matrix',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-orange-500/20 shadow-2xl mb-8 font-mono text-zinc-100 relative overflow-hidden">
      <!-- Glow effect -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse"></span>
            <h3 class="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
              <span>⏰</span> Chronobiology & Circadian Rhythm Matrix
            </h3>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
              BMAL1 / PER2 Gene Telemetry
            </span>
          </div>
          <p class="text-xs text-zinc-400 mt-1 font-sans">
            Real-time evaluation of central suprachiasmatic nucleus (SCN) pacemaking, cortisol diurnal slope, and restorative sleep architecture.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-amber-300">
            Phase: {{ circadianPhaseName() }}
          </span>
        </div>
      </div>

      <!-- Main Telemetry Grid with 3D Double-Click Flip State Machines -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 relative z-10 font-sans">
        
        <!-- 1. Circadian Disruption Index Card -->
        @let isCdiFlipped = isCardFlipped('cdi');
        <div (dblclick)="toggleCardFlip('cdi'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer select-none h-60"
             title="Double-click or click badge to flip over for Light Exposure & SCN Clock Protocol">
          
          <div [class.rotate-y-180]="isCdiFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-1.5 font-mono">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Circadian Disruption</span>
                    <button type="button" (click)="toggleCardFlip('cdi'); $event.stopPropagation()"
                            class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer transition">
                      dblclick 🔄
                    </button>
                  </div>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    CDI Score
                  </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3">
                  <span class="text-3xl font-black text-amber-400 font-mono">{{ disruptionIndex() }}</span>
                  <span class="text-xs text-zinc-500">/ 100 Disruption Index</span>
                </div>

                <div class="space-y-1 text-xs">
                  <div class="flex justify-between items-center text-zinc-400 font-mono text-[11px]">
                    <span>Melatonin Amplitude:</span>
                    <span class="font-bold text-amber-300">{{ disruptionIndex() > 50 ? 'Suppressed' : 'Robust' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-zinc-400 font-mono text-[11px]">
                    <span>SCN Sync Status:</span>
                    <span class="font-bold text-amber-400 truncate">{{ disruptionIndex() > 40 ? 'Desynchronized' : 'Synchronized' }}</span>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-zinc-400 leading-relaxed">
                Suprachiasmatic nucleus (SCN) master clock alignment with peripheral organ clocks.
              </p>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-amber-950 text-white border border-amber-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-amber-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-amber-300 font-bold uppercase flex items-center gap-1">
                    <span>☀️</span> SCN Sunlight Protocol
                  </span>
                  <button type="button" (click)="toggleCardFlip('cdi'); $event.stopPropagation()"
                          class="text-amber-400 hover:text-amber-200 text-[10px] font-mono cursor-pointer">
                    dblclick 🔄 flip
                  </button>
                </div>
                <div class="space-y-1.5 text-amber-100">
                  <p><strong>Action Tip:</strong> Get 10–15 mins of outdoor sunlight within 30 mins of waking to anchor SCN PER1/PER2 gene expression.</p>
                  <p><strong>Night Tip:</strong> Wear amber blue-blocking glasses after 08:30 PM to preserve pineal melatonin synthesis.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-amber-900 font-mono text-[9px] text-amber-400 flex justify-between">
                <span>Chrono-Habit Active</span>
                <button type="button" (click)="toggleCardFlip('cdi'); $event.stopPropagation()" class="hover:underline cursor-pointer">Double-click or click to return ↩️</button>
              </div>
            </div>

          </div>
        </div>

        <!-- 2. Cortisol Diurnal Slope Card -->
        @let isCortFlipped = isCardFlipped('cortisol');
        <div (dblclick)="toggleCardFlip('cortisol'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer select-none h-60"
             title="Double-click or click badge to flip over for Cortisol Diurnal Curve Rationale">
          
          <div [class.rotate-y-180]="isCortFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cortisol Diurnal Slope</span>
                    <button type="button" (click)="toggleCardFlip('cortisol'); $event.stopPropagation()"
                            class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer transition">
                      dblclick 🔄
                    </button>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    CAR Awakening
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-1.5 mb-2 font-mono text-center">
                  <div class="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span class="text-[9px] text-zinc-500 block uppercase">Waking</span>
                    <span class="text-xs font-bold text-rose-400">{{ cortisol().awakening }}</span>
                  </div>
                  <div class="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span class="text-[9px] text-zinc-500 block uppercase">Midday</span>
                    <span class="text-xs font-bold text-amber-300">{{ cortisol().afternoon }}</span>
                  </div>
                  <div class="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span class="text-[9px] text-zinc-500 block uppercase">Night</span>
                    <span class="text-xs font-bold text-amber-200">{{ cortisol().evening }}</span>
                  </div>
                </div>
              </div>

              <div class="text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                <span>Slope Profile:</span>
                <span class="font-bold text-amber-300 text-[10px]">{{ cortisol().slope }}</span>
              </div>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-rose-950 text-white border border-rose-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-rose-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-rose-300 font-bold uppercase flex items-center gap-1">
                    <span>🧘</span> HPA-Axis Reset Protocol
                  </span>
                  <button type="button" (click)="toggleCardFlip('cortisol'); $event.stopPropagation()"
                          class="text-rose-400 hover:text-rose-200 font-mono text-[10px] cursor-pointer">
                    dblclick 🔄 flip
                  </button>
                </div>
                <div class="space-y-1.5 text-rose-100">
                  <p><strong>Everyday Meaning:</strong> Cortisol should spike 30 mins after waking (CAR) then steadily decline by bedtime.</p>
                  <p><strong>Action Tip:</strong> Avoid caffeine past 01:00 PM and practice 5-min 0.1 Hz breathing to lower evening cortisol nadir.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-rose-900 font-mono text-[9px] text-rose-400 flex justify-between">
                <span>HPA-Axis Shield Active</span>
                <button type="button" (click)="toggleCardFlip('cortisol'); $event.stopPropagation()" class="hover:underline cursor-pointer">Double-click or click to return ↩️</button>
              </div>
            </div>

          </div>
        </div>

        <!-- 3. REM & Deep Sleep Architecture Card -->
        @let isSleepFlipped = isCardFlipped('sleep');
        <div (dblclick)="toggleCardFlip('sleep'); $event.stopPropagation()"
             class="relative perspective-1000 group cursor-pointer select-none h-60"
             title="Double-click or click badge to flip over for Glymphatic & Deep Sleep Protocol">
          
          <div [class.rotate-y-180]="isSleepFlipped"
               class="relative w-full h-full transition-transform duration-500 transform-style-3d">

            <!-- FRONT FACE -->
            <div class="p-5 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
              <div>
                <div class="flex justify-between items-start mb-3 font-mono">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sleep Architecture</span>
                    <button type="button" (click)="toggleCardFlip('sleep'); $event.stopPropagation()"
                            class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer transition">
                      dblclick 🔄
                    </button>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    EEG Delta
                  </span>
                </div>

                <div class="space-y-1.5 mb-2 font-mono text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">REM Ratio:</span>
                    <span class="font-bold text-indigo-400">{{ sleepArchitecture().remPct }}%</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">Slow-Wave (N3):</span>
                    <span class="font-bold text-indigo-300">{{ sleepArchitecture().deepPct }}%</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-400">Delta Power:</span>
                    <span class="font-bold text-indigo-200">{{ sleepArchitecture().deltaPowerUv2 }} µV²</span>
                  </div>
                </div>
              </div>

              <p class="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider truncate">
                Rating: {{ sleepArchitecture().qualityRating }}
              </p>
            </div>

            <!-- BACK FACE -->
            <div class="p-5 bg-indigo-950 text-white border border-indigo-500/40 rounded-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden shadow-2xl text-xs">
              <div>
                <div class="flex items-center justify-between border-b border-indigo-800 pb-1.5 mb-2 font-mono text-xs">
                  <span class="text-indigo-300 font-bold uppercase flex items-center gap-1">
                    <span>🧠</span> Glymphatic Clearance Protocol
                  </span>
                  <button type="button" (click)="toggleCardFlip('sleep'); $event.stopPropagation()"
                          class="text-indigo-400 hover:text-indigo-200 font-mono text-[10px] cursor-pointer">
                    dblclick 🔄 flip
                  </button>
                </div>
                <div class="space-y-1.5 text-indigo-100">
                  <p><strong>Glymphatic Clearance:</strong> During N3 deep sleep, brain CSF flow expands 60% to clear amyloid-beta and tau proteins.</p>
                  <p><strong>Action Tip:</strong> Keep bedroom at 65°F (18°C) and stop eating 3 hours before bed to maximize slow-wave delta power.</p>
                </div>
              </div>
              <div class="pt-1.5 border-t border-indigo-900 font-mono text-[9px] text-indigo-400 flex justify-between">
                <span>Glymphatic Shield Active</span>
                <button type="button" (click)="toggleCardFlip('sleep'); $event.stopPropagation()" class="hover:underline cursor-pointer">Double-click or click to return ↩️</button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Interactive Circadian Shift Simulator -->
      <div class="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 relative z-10 font-mono">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">
            🎛️ Circadian Phase Shift Simulator (Target Wake Time):
          </span>
          <span class="text-xs font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            Target Wake: {{ targetWakeTime() }}
          </span>
        </div>

        <input type="range" min="4.0" max="11.0" step="0.5"
               [value]="simulatedWakeHour()"
               (input)="updateSimulatedWake($event)"
               class="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-zinc-800" />
        
        <div class="flex justify-between text-[9px] text-zinc-500 mt-1">
          <span>04:00 AM (Early Bird)</span>
          <span>07:00 AM (Circadian Baseline)</span>
          <span>11:00 AM (Night Owl Shift)</span>
        </div>
      </div>
    </div>
  `
})
export class ChronobiologyMatrixComponent {
  private patientState = inject(PatientStateService);

  readonly disruptionIndex = this.patientState.circadianDisruptionIndex;
  readonly cortisol = this.patientState.cortisolDiurnalSlope;
  readonly sleepArchitecture = this.patientState.remSleepArchitectureScore;

  readonly flippedCards = signal<Set<string>>(new Set());

  private lastFlipTimeMap = new Map<string, number>();

  toggleCardFlip(id: string, event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    const last = this.lastFlipTimeMap.get(id) || 0;
    if (now - last < 200) return;
    this.lastFlipTimeMap.set(id, now);
    const current = new Set(this.flippedCards());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.flippedCards.set(current);
  }

  isCardFlipped(id: string): boolean {
    return this.flippedCards().has(id);
  }

  readonly simulatedWakeHour = signal<number>(7.0);

  updateSimulatedWake(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.simulatedWakeHour.set(val);
  }

  readonly targetWakeTime = computed(() => {
    const hour = this.simulatedWakeHour();
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} AM`;
  });

  readonly circadianPhaseName = computed(() => {
    const wake = this.simulatedWakeHour();
    if (wake < 6.0) return 'Larks Phase (Early Peak Melatonin Clearance)';
    if (wake <= 8.0) return 'Optimal Circadian Entrainment';
    return 'Delayed Sleep-Phase Shift (DSPS Risk)';
  });
}
