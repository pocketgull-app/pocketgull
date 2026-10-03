import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutonomicBaroreflexEngineService } from '../../services/autonomic-baroreflex-engine.service';

@Component({
  selector: 'app-autonomic-baroreflex-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🧠</span>
              <span>Neurovascular Autonomic & Baroreflex Sensitivity Engine (Clinical Model P10)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              HRV Spectral Decomposition (LF/HF) • Baroreflex Sensitivity (BRS ms/mmHg) • Consensus Orthostatic Hemodynamics
            </p>
          </div>
        </div>

        <!-- Master Phenotype Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.orthostaticReport().phenotype === 'Hemodynamically Stable Orthostasis',
                  'bg-red-950/80 border-red-600/60 text-red-300 animate-pulse': service.orthostaticReport().phenotype === 'Neurogenic Orthostatic Hypotension (nOH)',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.orthostaticReport().phenotype.includes('Non-Neurogenic'),
                  'bg-purple-950/80 border-purple-600/60 text-purple-300': service.orthostaticReport().phenotype.includes('POTS'),
                  'bg-sky-950/80 border-sky-600/60 text-sky-300': service.orthostaticReport().phenotype.includes('Vasovagal')
                }">
            {{ service.orthostaticReport().phenotype }}
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Presets:</span>
        <button type="button" (click)="applyPreset('homeostasis')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🟢 Healthy Baseline
        </button>
        <button type="button" (click)="applyPreset('neurogenic_oh')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          ⚠️ Neurogenic OH (nOH)
        </button>
        <button type="button" (click)="applyPreset('pots_syndrome')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          ⚡ POTS Syndrome
        </button>
        <button type="button" (click)="applyPreset('diabetic_autonomic_neuropathy')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🧪 Diabetic CAN
        </button>
        <button type="button" (click)="applyPreset('vagal_hypertonia')"
                class="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition cursor-pointer">
          🧘 Vagal Hypertonia
        </button>
      </div>

      <!-- 4-Pillar Clinical Grid -->
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <!-- Pillar 1: HRV Spectral Decomposition -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-purple-400">1. HRV Spectral Analysis</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-bold">
                LF/HF: {{ service.hrvReport().lfHfRatio }}
              </span>
            </div>
            
            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">HF Power (0.15-0.4Hz):</span>
                <span class="text-base font-black text-purple-300 font-sans">{{ service.hrvReport().hfPowerMs2 }} <span class="text-[10px] font-mono text-zinc-500">ms²</span></span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">LF Power (0.04-0.15Hz):</span>
                <span class="text-zinc-300 font-mono">{{ service.hrvReport().lfPowerMs2 }} ms²</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Normalized HF:</span>
                <span class="text-zinc-300 font-mono">{{ service.hrvReport().normalizedHfNu }} nu</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400">
            <span>State: </span><strong class="text-zinc-300">{{ service.hrvReport().autonomicState }}</strong>
          </div>
        </div>

        <!-- Pillar 2: Baroreflex Sensitivity (BRS) -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-cyan-400">2. Baroreflex Gain</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    [ngClass]="service.brsReport().classification.includes('Depressed') ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'">
                {{ service.brsReport().classification.includes('Depressed') ? 'BRS Failure' : 'Intact Gain' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">BRS Transfer Gain:</span>
                <span class="text-base font-black font-sans"
                      [ngClass]="service.brsReport().brsGainMsMmHg < 6.0 ? 'text-red-400' : (service.brsReport().brsGainMsMmHg < 10.0 ? 'text-amber-400' : 'text-emerald-400')">
                  {{ service.brsReport().brsGainMsMmHg }} <span class="text-[10px] font-mono text-zinc-500">ms/mmHg</span>
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Risk Stratum:</span>
                <span class="text-zinc-300 font-mono">{{ service.brsReport().cardiovascularRiskStratum }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Resonance Pacing:</span>
                <span class="text-zinc-300 font-mono">6.0 bpm (0.1 Hz)</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 truncate">
            <span>{{ service.brsReport().classification }}</span>
          </div>
        </div>

        <!-- Pillar 3: Orthostatic Postural Challenge -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-amber-400">3. Orthostatic Challenge</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    [ngClass]="service.orthostaticReport().orthostaticHypotensionPresent ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'">
                {{ service.orthostaticReport().orthostaticHypotensionPresent ? 'OH Present' : 'Normal BP' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">Δ SBP / Δ DBP:</span>
                <span class="text-base font-black font-sans"
                      [ngClass]="service.orthostaticReport().deltaSbpMmhg <= -20 ? 'text-red-400' : 'text-zinc-100'">
                  {{ service.orthostaticReport().deltaSbpMmhg > 0 ? '+' : '' }}{{ service.orthostaticReport().deltaSbpMmhg }} / {{ service.orthostaticReport().deltaDbpMmhg > 0 ? '+' : '' }}{{ service.orthostaticReport().deltaDbpMmhg }} <span class="text-[10px] font-mono text-zinc-500">mmHg</span>
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Δ Heart Rate:</span>
                <span class="text-zinc-300 font-mono">+{{ service.orthostaticReport().deltaHrBpm }} bpm</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">ΔHR / |ΔSBP| Ratio:</span>
                <span class="text-zinc-300 font-mono">{{ service.orthostaticReport().hrToSbpRatio }} bpm/mmHg</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 line-clamp-1">
            <span>{{ service.orthostaticReport().clinicalActionDirective }}</span>
          </div>
        </div>

        <!-- Pillar 4: Parasympathetic Vagal Index -->
        <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span class="text-[10px] uppercase font-bold text-teal-400">4. Vagal Tone Composite</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                RMSSD: {{ service.hrvReport().rmssdMs }} ms
              </span>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-baseline">
                <span class="text-zinc-400">Vagal Tone Index:</span>
                <span class="text-xl font-black font-sans text-teal-300">
                  {{ service.compositeReport().vagalToneScore }} <span class="text-[10px] font-mono text-zinc-500">/ 100</span>
                </span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">SDNN (Circadian):</span>
                <span class="text-zinc-300 font-mono">{{ service.hrvReport().sdnnMs }} ms</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span class="text-zinc-500">Resting Supine HR:</span>
                <span class="text-zinc-300 font-mono">{{ service.supineHrBpm() }} bpm</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-300 truncate">
            <span>{{ service.compositeReport().clinicalSummary }}</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Interactive Sliders -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <!-- Standing SBP Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Standing SBP (3 min)</span>
            <span class="text-purple-400 font-mono font-bold">{{ service.standingSbpMmhg() }} mmHg</span>
          </div>
          <input type="range" min="80" max="160" step="1" [value]="service.standingSbpMmhg()"
                 (input)="onStandSbpChange($event)" class="w-full accent-purple-400 cursor-pointer" />
        </div>

        <!-- Standing HR Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Standing Heart Rate</span>
            <span class="text-purple-400 font-mono font-bold">{{ service.standingHrBpm() }} bpm</span>
          </div>
          <input type="range" min="45" max="140" step="1" [value]="service.standingHrBpm()"
                 (input)="onStandHrChange($event)" class="w-full accent-purple-400 cursor-pointer" />
        </div>

        <!-- BRS Gain Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Baroreflex Gain</span>
            <span class="text-purple-400 font-mono font-bold">{{ service.brsGainMsMmHg() }} ms/mmHg</span>
          </div>
          <input type="range" min="1.0" max="30.0" step="0.5" [value]="service.brsGainMsMmHg()"
                 (input)="onBrsChange($event)" class="w-full accent-purple-400 cursor-pointer" />
        </div>

        <!-- RMSSD Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">RMSSD (Vagal Tone)</span>
            <span class="text-purple-400 font-mono font-bold">{{ service.rmssdMs() }} ms</span>
          </div>
          <input type="range" min="5" max="100" step="1" [value]="service.rmssdMs()"
                 (input)="onRmssdChange($event)" class="w-full accent-purple-400 cursor-pointer" />
        </div>
      </div>
    </div>
  `
})
export class AutonomicBaroreflexCardComponent {
  service = inject(AutonomicBaroreflexEngineService);

  public applyPreset(preset: 'homeostasis' | 'neurogenic_oh' | 'pots_syndrome' | 'diabetic_autonomic_neuropathy' | 'vagal_hypertonia'): void {
    this.service.applyPreset(preset);
  }

  public onStandSbpChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.service.standingSbpMmhg.set(val);
  }

  public onStandHrChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.service.standingHrBpm.set(val);
  }

  public onBrsChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.service.brsGainMsMmHg.set(val);
  }

  public onRmssdChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.service.rmssdMs.set(val);
  }
}
