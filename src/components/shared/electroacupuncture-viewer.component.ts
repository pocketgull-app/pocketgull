import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectroacupunctureService, TElectroWaveform, IElectroacupunctureProtocol } from '../../services/electroacupuncture.service';

@Component({
  selector: 'app-electroacupuncture-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-slate-800 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl font-sans">
      
      <!-- Top Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-cyan-500 to-indigo-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
            ⚡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Electroacupuncture &amp; Neuro-Meridian Frequency Suite
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                Han's Law Opioid &amp; Vagal Modulation
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Frequency-Specific $\\beta$-Endorphin vs. Dynorphin Release • $\\alpha 7$-nAChR Vagal Cytokine Suppression • Dense-Disperse Modulation
            </p>
          </div>
        </div>

        <!-- Master Power / Stimulator Toggle Button -->
        <div class="flex items-center gap-3">
          <button (click)="toggleStimulation()"
                  class="px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg border"
                  [class.bg-gradient-to-r]="ea.isRunning()"
                  [class.from-cyan-500]="ea.isRunning()"
                  [class.to-emerald-500]="ea.isRunning()"
                  [class.text-zinc-950]="ea.isRunning()"
                  [class.border-cyan-400]="ea.isRunning()"
                  [class.bg-slate-900]="!ea.isRunning()"
                  [class.text-zinc-400]="!ea.isRunning()"
                  [class.border-slate-700]="!ea.isRunning()">
            <span class="w-2.5 h-2.5 rounded-full" [class.bg-emerald-400]="ea.isRunning()" [class.animate-ping]="ea.isRunning()" [class.bg-zinc-600]="!ea.isRunning()"></span>
            <span>{{ ea.isRunning() ? 'Stimulation Active' : 'Start Stimulation' }}</span>
          </button>
          
          <button (click)="ea.resetSession()"
                  class="px-3 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-zinc-400 border border-slate-800 text-xs font-mono transition cursor-pointer">
            ↺ Reset
          </button>
        </div>
      </div>

      <!-- Main 2-Column Workstation Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left Column: Oscilloscope & Acupoint Lead Pairing (7 Cols) -->
        <div class="lg:col-span-7 space-y-6">

          <!-- 1. Real-Time Oscilloscope Waveform Visualizer -->
          <div class="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden shadow-inner">
            <div class="flex items-center justify-between font-mono text-xs">
              <div class="flex items-center gap-2">
                <span class="text-cyan-400 font-bold uppercase">⚡ Live Frequency Oscilloscope</span>
                <span class="text-zinc-500">•</span>
                <span class="text-amber-400 font-bold">{{ ea.frequencyHz() }} Hz</span>
                <span class="text-zinc-500">•</span>
                <span class="text-emerald-400 font-bold">{{ ea.intensityMa() }} mA</span>
              </div>
              <span class="text-[10px] text-zinc-400 font-mono">
                Duration: {{ formatTime(ea.sessionElapsedTimeSeconds()) }}
              </span>
            </div>

            <!-- Waveform Canvas Box -->
            <div class="h-32 bg-slate-950 rounded-xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center">
              <!-- Oscilloscope Grid Lines -->
              <div class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 pointer-events-none"></div>

              <!-- Animated Kinetic Waveform Path -->
              <svg class="w-full h-full relative z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
                @if (ea.waveform() === 'continuous_2hz') {
                  <path d="M 0 50 L 50 50 L 50 20 L 70 20 L 70 80 L 90 80 L 90 50 L 150 50 L 150 20 L 170 20 L 170 80 L 190 80 L 190 50 L 250 50 L 250 20 L 270 20 L 270 80 L 290 80 L 290 50 L 350 50 L 350 20 L 370 20 L 370 80 L 390 80 L 400 50" 
                        fill="none" 
                        stroke="#22d3ee" 
                        stroke-width="2.5"
                        [class.animate-pulse]="ea.isRunning()" />
                } @else if (ea.waveform() === 'high_100hz') {
                  <path d="M 0 50 Q 10 15, 20 50 T 40 50 T 60 50 T 80 50 T 100 50 T 120 50 T 140 50 T 160 50 T 180 50 T 200 50 T 220 50 T 240 50 T 260 50 T 280 50 T 300 50 T 320 50 T 340 50 T 360 50 T 380 50 T 400 50" 
                        fill="none" 
                        stroke="#f59e0b" 
                        stroke-width="2"
                        [class.animate-pulse]="ea.isRunning()" />
                } @else if (ea.waveform() === 'dense_disperse') {
                  <path d="M 0 50 L 20 50 L 20 15 L 30 15 L 30 85 L 40 85 L 40 50 L 60 50 Q 65 20, 70 50 T 80 50 T 90 50 T 100 50 T 110 50 T 120 50 L 150 50 L 150 15 L 160 15 L 160 85 L 170 85 L 170 50 L 190 50 Q 195 20, 200 50 T 210 50 T 220 50 T 230 50 T 240 50 T 250 50 L 280 50 L 280 15 L 290 15 L 290 85 L 300 85 L 300 50 L 320 50 Q 325 20, 330 50 T 340 50 T 350 50 T 360 50 T 370 50 T 380 50 L 400 50" 
                        fill="none" 
                        stroke="#10b981" 
                        stroke-width="2.5"
                        [class.animate-pulse]="ea.isRunning()" />
                } @else {
                  <path d="M 0 50 Q 100 10, 200 50 T 400 50" 
                        fill="none" 
                        stroke="#a855f7" 
                        stroke-width="3"
                        [class.animate-pulse]="ea.isRunning()" />
                }
              </svg>

              <!-- Central Zero-Cross Indicator -->
              <div class="absolute w-full h-[1px] bg-slate-800 pointer-events-none"></div>
            </div>

            <!-- Waveform Type Selector Bar -->
            <div class="flex items-center gap-1.5 flex-wrap pt-1 font-mono text-[11px]">
              <button (click)="ea.waveform.set('continuous_2hz'); ea.frequencyHz.set(2)" 
                      [class.bg-cyan-500]="ea.waveform() === 'continuous_2hz'"
                      [class.text-zinc-950]="ea.waveform() === 'continuous_2hz'"
                      [class.bg-slate-950]="ea.waveform() !== 'continuous_2hz'"
                      [class.text-zinc-400]="ea.waveform() !== 'continuous_2hz'"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 font-bold transition cursor-pointer">
                Continuous (2 Hz)
              </button>
              <button (click)="ea.waveform.set('high_100hz'); ea.frequencyHz.set(100)" 
                      [class.bg-amber-500]="ea.waveform() === 'high_100hz'"
                      [class.text-zinc-950]="ea.waveform() === 'high_100hz'"
                      [class.bg-slate-950]="ea.waveform() !== 'high_100hz'"
                      [class.text-zinc-400]="ea.waveform() !== 'high_100hz'"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 font-bold transition cursor-pointer">
                High-Frequency (100 Hz)
              </button>
              <button (click)="ea.waveform.set('dense_disperse'); ea.frequencyHz.set(2)" 
                      [class.bg-emerald-500]="ea.waveform() === 'dense_disperse'"
                      [class.text-zinc-950]="ea.waveform() === 'dense_disperse'"
                      [class.bg-slate-950]="ea.waveform() !== 'dense_disperse'"
                      [class.text-zinc-400]="ea.waveform() !== 'dense_disperse'"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 font-bold transition cursor-pointer">
                Dense-Disperse (2/100 Hz)
              </button>
              <button (click)="ea.waveform.set('microcurrent_0_1hz'); ea.frequencyHz.set(0.1); ea.intensityMa.set(0.2)" 
                      [class.bg-purple-500]="ea.waveform() === 'microcurrent_0_1hz'"
                      [class.text-zinc-950]="ea.waveform() === 'microcurrent_0_1hz'"
                      [class.bg-slate-950]="ea.waveform() !== 'microcurrent_0_1hz'"
                      [class.text-zinc-400]="ea.waveform() !== 'microcurrent_0_1hz'"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-800 font-bold transition cursor-pointer">
                Microcurrent (0.1 Hz)
              </button>
            </div>
          </div>

          <!-- 2. Acupoint Lead Pairing & Depth HUD -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
            <div class="flex items-center justify-between font-mono">
              <h3 class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <span>📍</span> Active Meridian Channel &amp; Acupoint Leads
              </h3>
              <span class="text-[10px] text-cyan-400 font-bold">{{ ea.activeProtocol().leadPair[0].code }} ⟷ {{ ea.activeProtocol().leadPair[1].code }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              <!-- Lead A -->
              <div class="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-1">
                <div class="flex justify-between items-center">
                  <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">LEAD A (Anode +)</span>
                  <span class="text-zinc-400 text-[11px] font-pocketgull-notofu">{{ ea.activeProtocol().leadPair[0].pinyin }}</span>
                </div>
                <div class="text-sm font-bold text-zinc-100">{{ ea.activeProtocol().leadPair[0].code }} • {{ ea.activeProtocol().leadPair[0].name }}</div>
                <div class="text-[10px] text-zinc-400">{{ ea.activeProtocol().leadPair[0].anatomicalLocation }}</div>
                <div class="text-[10px] text-cyan-400 font-bold">Target Needle Depth: {{ ea.activeProtocol().leadPair[0].depthMm }} mm</div>
              </div>

              <!-- Lead B -->
              <div class="p-3 bg-slate-950 rounded-xl border border-amber-500/30 space-y-1">
                <div class="flex justify-between items-center">
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">LEAD B (Cathode -)</span>
                  <span class="text-zinc-400 text-[11px] font-pocketgull-notofu">{{ ea.activeProtocol().leadPair[1].pinyin }}</span>
                </div>
                <div class="text-sm font-bold text-zinc-100">{{ ea.activeProtocol().leadPair[1].code }} • {{ ea.activeProtocol().leadPair[1].name }}</div>
                <div class="text-[10px] text-zinc-400">{{ ea.activeProtocol().leadPair[1].anatomicalLocation }}</div>
                <div class="text-[10px] text-amber-400 font-bold">Target Needle Depth: {{ ea.activeProtocol().leadPair[1].depthMm }} mm</div>
              </div>
            </div>

            <!-- Intensity & Frequency Sliders -->
            <div class="grid grid-cols-2 gap-4 font-mono text-xs pt-1">
              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-zinc-400">Current Intensity:</span>
                  <span class="text-emerald-400 font-bold">{{ ea.intensityMa() }} mA</span>
                </div>
                <input type="range" min="0.1" max="5.0" step="0.1" 
                       [value]="ea.intensityMa()" 
                       (input)="onIntensityChange($event)"
                       class="w-full accent-emerald-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer" />
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-zinc-400">Pulse Frequency:</span>
                  <span class="text-cyan-400 font-bold">{{ ea.frequencyHz() }} Hz</span>
                </div>
                <input type="range" min="0.1" max="100" step="1" 
                       [value]="ea.frequencyHz()" 
                       (input)="onFrequencyChange($event)"
                       class="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer" />
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Protocol Catalog & Neuro-Chemical Telemetry (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">

          <!-- 3. Pre-Configured Clinical Protocols -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <h3 class="text-xs font-bold text-zinc-300 font-mono uppercase flex items-center gap-1.5">
              <span>📋</span> Evidence-Based Clinical Protocols
            </h3>

            <div class="space-y-2">
              @for (proto of ea.protocols; track proto.id) {
                <div (click)="ea.selectProtocol(proto)"
                     class="p-3 rounded-xl border transition cursor-pointer font-mono"
                     [class.border-cyan-500]="ea.activeProtocol().id === proto.id"
                     [class.bg-cyan-500/10]="ea.activeProtocol().id === proto.id"
                     [class.border-slate-800]="ea.activeProtocol().id !== proto.id"
                     [class.bg-slate-950]="ea.activeProtocol().id !== proto.id">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-zinc-100">{{ proto.name }}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                      {{ proto.frequencyHz }} Hz • {{ proto.durationMinutes }}m
                    </span>
                  </div>
                  <p class="text-[10px] text-zinc-400 font-sans line-clamp-2">
                    {{ proto.clinicalRationale }}
                  </p>
                </div>
              }
            </div>
          </div>

          <!-- 4. Neuro-Chemical & Vagal Telemetry HUD -->
          <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
            <h3 class="text-xs font-bold text-zinc-300 font-mono uppercase flex items-center gap-1.5">
              <span>🧪</span> Neuro-Chemical &amp; Vagal Telemetry
            </h3>

            <!-- Opioid Peptide Bars -->
            <div class="space-y-2.5 font-mono text-xs">
              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-cyan-300 font-bold">&mu;/&delta; &beta;-Endorphin Release (PAG):</span>
                  <span class="text-cyan-400 font-bold">{{ ea.neuroChemicalTelemetry().betaEndorphinScore }}%</span>
                </div>
                <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-cyan-400 transition-all duration-500" [style.width.%]="ea.neuroChemicalTelemetry().betaEndorphinScore"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-amber-300 font-bold">&kappa; Dynorphin Release (Spinal Dorsal Horn):</span>
                  <span class="text-amber-400 font-bold">{{ ea.neuroChemicalTelemetry().dynorphinScore }}%</span>
                </div>
                <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400 transition-all duration-500" [style.width.%]="ea.neuroChemicalTelemetry().dynorphinScore"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-[10px]">
                  <span class="text-emerald-300 font-bold">&alpha;7-nAChR Cytokine Storm Suppression:</span>
                  <span class="text-emerald-400 font-bold">{{ ea.neuroChemicalTelemetry().cytokineSuppressionPercentage }}%</span>
                </div>
                <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-400 transition-all duration-500" [style.width.%]="ea.neuroChemicalTelemetry().cytokineSuppressionPercentage"></div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 font-mono text-[10px] text-center pt-2">
              <div class="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div class="text-zinc-400">Vagal Tone Multiplier</div>
                <div class="text-sm font-black text-emerald-400 mt-0.5">{{ ea.neuroChemicalTelemetry().vagalToneMultiplier }}&times;</div>
              </div>
              <div class="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <div class="text-zinc-400">Total Bio-Energy Delivered</div>
                <div class="text-sm font-black text-cyan-400 mt-0.5">{{ ea.neuroChemicalTelemetry().totalEnergyJoules }} J</div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  `
})
export class ElectroacupunctureViewerComponent implements OnDestroy {
  ea = inject(ElectroacupunctureService);
  private timerInterval: any = null;

  constructor() {
    effect(() => {
      if (this.ea.isRunning()) {
        if (!this.timerInterval) {
          this.timerInterval = setInterval(() => {
            this.ea.tickSecond();
          }, 1000);
        }
      } else {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }
    });
  }

  toggleStimulation(): void {
    this.ea.toggleSession();
  }

  onIntensityChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.ea.intensityMa.set(val);
  }

  onFrequencyChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.ea.frequencyHz.set(val);
  }

  formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
