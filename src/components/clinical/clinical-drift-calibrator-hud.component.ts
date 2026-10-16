import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalDriftCalibratorService } from '../../services/interpretability/clinical-drift-calibrator.service';
import { NavigationShellService } from '../../services/navigation-shell.service';
import { OllamaProvider } from '../../services/ai/ollama.provider';

interface ISunburstWedgeRender {
  axisIndex: number;
  label: string;
  shortLabel: string;
  value: number;
  isDrift: boolean;
  color: string;
  fillOpacity: string;
  pathD: string;
  strokeWidth: string;
  isParasympatheticCue: boolean;
  labelX: number;
  labelY: number;
  textAnchor: string;
  textOpacity: string;
}

interface IDriftPointRender {
  turnIndex: number;
  x: number;
  y: number;
  driftValue: number;
  isCurrent: boolean;
  isHazard: boolean;
  labelOffsetX: number;
}

@Component({
  selector: 'app-clinical-drift-calibrator-hud',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes parasympatheticPulse {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.25)); opacity: 0.90; }
      50% { filter: drop-shadow(0 0 11px rgba(244, 63, 94, 0.72)); opacity: 1; }
    }
    .parasympathetic-cue {
      animation: parasympatheticPulse 10s ease-in-out infinite;
    }
  `],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drift-calibrator-title">

      <div class="w-full max-w-6xl max-h-[92vh] bg-[#0c0e12] border border-zinc-800/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">

        <!-- HEADER -->
        <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shadow-inner">
              J++
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 id="drift-calibrator-title" class="text-base md:text-lg font-bold tracking-tight text-zinc-100">
                  J++ Workspace Lens &amp; Clinical Behavioral Drift Calibrator
                </h2>
                <span class="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{{ ollama.selectedModelId() }}</span>
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Mechanistic fMRI Readout: Difference-in-Means Cosine Activation Vectors • Early-Layer Jacobian++ Projections • 0.1 Hz Parasympathetic Cues
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            @if (calibrator.currentTurn().isDriftHazard) {
              <button
                type="button"
                (click)="calibrator.applySteeringCalibration()"
                class="px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 transition-colors cursor-pointer min-h-[40px]">
                ⚡ Apply Activation Steering Vector
              </button>
            }
            <button
              type="button"
              (click)="navShell.closeDriftCalibrator()"
              class="px-3 py-2 rounded-lg text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer min-h-[40px]"
              aria-label="Close Clinical Drift Calibrator">
              ✕ Close
            </button>
          </div>
        </header>

        <!-- BODY -->
        <div class="p-5 overflow-y-auto space-y-5 flex-1">

          <!-- Milestone 1: Turn Presets & Live Utterance Probe -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3.5">
            <div class="lg:col-span-7 flex flex-wrap items-center gap-2">
              @for (turn of calibrator.turns(); track turn.turnIndex) {
                <button
                  type="button"
                  (click)="calibrator.activeTurnIndex.set(turn.turnIndex)"
                  [class.border-emerald-500]="calibrator.activeTurnIndex() === turn.turnIndex && !turn.isDriftHazard"
                  [class.bg-emerald-500/15]="calibrator.activeTurnIndex() === turn.turnIndex && !turn.isDriftHazard"
                  [class.border-rose-500]="calibrator.activeTurnIndex() === turn.turnIndex && turn.isDriftHazard"
                  [class.bg-rose-500/15]="calibrator.activeTurnIndex() === turn.turnIndex && turn.isDriftHazard"
                  [class.border-zinc-800]="calibrator.activeTurnIndex() !== turn.turnIndex"
                  [class.bg-zinc-950]="calibrator.activeTurnIndex() !== turn.turnIndex"
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer">
                  {{ turn.title }}
                </button>
              }
            </div>

            <!-- Live Custom Utterance Input -->
            <form (ngSubmit)="submitCustomProbe()" class="lg:col-span-5 flex items-center gap-2">
              <input
                type="text"
                [(ngModel)]="customUtterance"
                name="customUtterance"
                placeholder="Probe custom clinical utterance via Lemonade..."
                class="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500" />
              <button
                type="submit"
                [disabled]="calibrator.isComputingLiveVector() || !customUtterance().trim()"
                class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white cursor-pointer shrink-0">
                {{ calibrator.isComputingLiveVector() ? 'Scoring...' : 'Score Turn' }}
              </button>
            </form>
          </div>

          <!-- Milestone 2: Greatest Behavioral Swing Banner -->
          <div
            [class.border-rose-500/50]="calibrator.currentTurn().isDriftHazard"
            [class.bg-rose-950/20]="calibrator.currentTurn().isDriftHazard"
            [class.border-zinc-800]="!calibrator.currentTurn().isDriftHazard"
            [class.bg-zinc-900/40]="!calibrator.currentTurn().isDriftHazard"
            class="border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div class="flex items-center gap-3">
              <span
                [class.bg-rose-500]="calibrator.currentTurn().isDriftHazard"
                [class.parasympathetic-cue]="calibrator.currentTurn().isDriftHazard"
                [class.bg-emerald-500]="!calibrator.currentTurn().isDriftHazard"
                class="w-3 h-3 rounded-full shrink-0"></span>
              <div>
                <span class="text-xs font-mono uppercase tracking-wider text-zinc-400">Greatest Behavioral Swing:</span>
                <span class="text-xs sm:text-sm font-bold ml-2 text-zinc-100">{{ calibrator.currentTurn().greatestSwingLabel }}</span>
              </div>
            </div>
            <div class="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span>cos(θ, v_drift) = <strong class="text-zinc-200">{{ calibrator.currentTurn().cosineToDriftCentroid }}</strong></span>
              @if (calibrator.currentTurn().steeringVectorApplied; as steer) {
                <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">{{ steer }}</span>
              }
            </div>
          </div>

          <!-- Milestone 3: 3-Column Mechanistic HUD -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

            <!-- Column 1: 12-Pole Radial Sunburst (5 cols) -->
            <div class="lg:col-span-5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-sm font-bold text-zinc-100">1. Radial Sunburst Behavioral Silhouette</h3>
                  <span class="text-xs font-mono text-zinc-400">6 Axes / 12 Poles</span>
                </div>
                <p class="text-xs text-zinc-400 mb-3">
                  Eliminates top-position linear bias. Click any radial wedge to inspect its multi-turn trajectory.
                </p>
              </div>

              <div class="flex items-center justify-center my-1">
                <svg viewBox="-165 -165 330 330" class="w-full max-w-[300px] h-auto overflow-visible select-none">
                  @for (r of [40, 75, 110]; track r) {
                    <circle cx="0" cy="0" [attr.r]="r" fill="none" stroke="currentColor" stroke-opacity="0.14" stroke-dasharray="2,2" />
                  }

                  @for (w of sunburstWedges(); track $index) {
                    <path
                      [attr.d]="w.pathD"
                      [attr.fill]="w.color"
                      [attr.fill-opacity]="w.fillOpacity"
                      [attr.stroke]="w.color"
                      [attr.stroke-width]="w.strokeWidth"
                      [class.parasympathetic-cue]="w.isParasympatheticCue"
                      class="cursor-pointer transition-opacity hover:opacity-100"
                      (click)="calibrator.trackedAxisIndex.set(w.axisIndex)" />
                    <text
                      [attr.x]="w.labelX"
                      [attr.y]="w.labelY"
                      [attr.text-anchor]="w.textAnchor"
                      dominant-baseline="middle"
                      fill="currentColor"
                      font-size="10"
                      [attr.opacity]="w.textOpacity">
                      {{ w.shortLabel }}
                    </text>
                  }

                  <circle
                    cx="0"
                    cy="0"
                    r="24"
                    [attr.fill]="calibrator.currentTurn().isDriftHazard ? '#881337' : '#064e3b'" />
                  <text
                    x="0"
                    y="1"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="#ffffff"
                    font-size="11"
                    font-weight="bold"
                    font-family="monospace">
                    T{{ calibrator.currentTurn().turnIndex + 1 }}
                  </text>
                </svg>
              </div>

              <div class="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
                  <span class="text-zinc-400">Salutogenic Pole</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span>
                  <span class="text-zinc-400">Drift Hazard Pole</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block"></span>
                  <span class="text-zinc-400">Structural Tone</span>
                </div>
              </div>
            </div>

            <!-- Column 2: Multi-Turn Drift Trajectory Panel (4 cols) -->
            <div class="lg:col-span-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1">
                  <h3 class="text-sm font-bold text-zinc-100">2. Multi-Turn Drift Panel</h3>
                  <select
                    [ngModel]="calibrator.trackedAxisIndex()"
                    (ngModelChange)="calibrator.trackedAxisIndex.set(+$event)"
                    aria-label="Select behavioral axis to track"
                    class="bg-zinc-950 text-zinc-200 text-xs font-mono border border-zinc-800 rounded-md px-2 py-1">
                    @for (axis of calibrator.axes(); track axis.id; let i = $index) {
                      <option [value]="i">{{ axis.healthyPole }} vs. {{ axis.driftPole }}</option>
                    }
                  </select>
                </div>
                <p class="text-xs text-zinc-400 mb-3">
                  {{ calibrator.trackedAxis().description }}
                </p>
              </div>

              <div class="flex-1 flex items-center justify-center">
                <svg viewBox="0 0 280 230" class="w-full h-auto overflow-visible select-none">
                  <!-- Midline threshold (0.50) -->
                  <line x1="140" y1="22" x2="140" y2="205" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="4,4" />

                  <!-- Trajectory polyline -->
                  <polyline
                    [attr.points]="driftPolylinePoints()"
                    fill="none"
                    stroke="#38bdf8"
                    stroke-width="2.5" />

                  @for (pt of driftPoints(); track pt.turnIndex) {
                    <line x1="36" [attr.y1]="pt.y" x2="244" [attr.y2]="pt.y" stroke="currentColor" stroke-opacity="0.08" />
                    <text
                      x="6"
                      [attr.y]="pt.y + 3"
                      fill="currentColor"
                      font-size="10"
                      font-family="monospace"
                      [attr.opacity]="pt.isCurrent ? '1' : '0.5'">
                      T{{ pt.turnIndex + 1 }}
                    </text>
                    <circle
                      [attr.cx]="pt.x"
                      [attr.cy]="pt.y"
                      [attr.r]="pt.isCurrent ? 7 : 4.5"
                      [attr.fill]="pt.isHazard ? '#f43f5e' : '#10b981'"
                      stroke="#ffffff"
                      [attr.stroke-width]="pt.isCurrent ? 2 : 1"
                      class="cursor-pointer"
                      (click)="calibrator.activeTurnIndex.set(pt.turnIndex)" />
                    <text
                      [attr.x]="pt.x + pt.labelOffsetX"
                      [attr.y]="pt.y + 3"
                      fill="currentColor"
                      font-size="10"
                      font-family="monospace">
                      {{ pt.driftValue.toFixed(2) }}
                    </text>
                  }
                </svg>
              </div>

              <div class="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>← {{ calibrator.trackedAxis().healthyPole }} (0.0)</span>
                <span>{{ calibrator.trackedAxis().driftPole }} (1.0) →</span>
              </div>
            </div>

            <!-- Column 3: J++ Early-Layer Workspace Readout (3 cols) -->
            <div class="lg:col-span-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <h3 class="text-sm font-bold text-zinc-100">3. J++ Layer Readout</h3>
                  <span class="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-300">L4 → L15</span>
                </div>
                <p class="text-xs text-zinc-400 mb-3">
                  Contrasts noisy standard J-Lens against J++ faithful clinical latent concepts.
                </p>

                <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 mb-3">
                  <div class="text-xs font-mono text-zinc-400 mb-1">Utterance Context ({{ calibrator.currentTurn().timestamp }}):</div>
                  <div class="text-xs italic text-zinc-200 leading-relaxed">
                    "{{ calibrator.currentTurn().utterance }}"
                  </div>
                </div>

                <div class="space-y-2.5">
                  @for (layer of calibrator.currentTurn().jppLayers; track layer.layer) {
                    <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/90 space-y-1.5">
                      <div class="flex items-center justify-between text-xs font-mono">
                        <span class="font-bold text-zinc-200">{{ layer.layer }}</span>
                        <span class="text-emerald-400">+{{ (layer.fidelityDelta * 100).toFixed(0) }}% Fidelity</span>
                      </div>
                      <div class="text-xs flex items-start gap-1.5">
                        <span class="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono shrink-0">J-Lens</span>
                        <span class="text-zinc-400 font-mono truncate">{{ layer.standardJLensTokens }}</span>
                      </div>
                      <div class="text-xs flex items-start gap-1.5">
                        <span class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono shrink-0">J++</span>
                        <span class="text-zinc-100 font-mono font-semibold">{{ layer.jppClinicalTokens }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <span class="text-zinc-400">Jev Score:</span>
                <span
                  [class.text-rose-400]="calibrator.currentTurn().isDriftHazard"
                  [class.text-emerald-400]="!calibrator.currentTurn().isDriftHazard"
                  class="font-bold">
                  {{ calibrator.currentTurn().jevInterpretabilityScore.toFixed(2) }}
                </span>
              </div>
            </div>

          </div>

          <!-- Footer Status -->
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
            <span>Engine: {{ calibrator.liveEngineStatus() }}</span>
            <span>MIT Media Lab Drift Calibrator + Ayonrinde &amp; Lindsey J++ Lens</span>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ClinicalDriftCalibratorHudComponent {
  readonly calibrator = inject(ClinicalDriftCalibratorService);
  readonly navShell = inject(NavigationShellService);
  readonly ollama = inject(OllamaProvider);

  readonly customUtterance = signal<string>('');

  private polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number): { x: number; y: number } {
    const rad = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  private createWedgePath(cx: number, cy: number, rInner: number, rOuter: number, startAngle: number, endAngle: number): string {
    const p1 = this.polarToCartesian(cx, cy, rOuter, endAngle);
    const p2 = this.polarToCartesian(cx, cy, rOuter, startAngle);
    const p3 = this.polarToCartesian(cx, cy, rInner, startAngle);
    const p4 = this.polarToCartesian(cx, cy, rInner, endAngle);
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', p1.x.toFixed(2), p1.y.toFixed(2),
      'A', rOuter.toFixed(2), rOuter.toFixed(2), '0', largeArc, '0', p2.x.toFixed(2), p2.y.toFixed(2),
      'L', p3.x.toFixed(2), p3.y.toFixed(2),
      'A', rInner.toFixed(2), rInner.toFixed(2), '0', largeArc, '1', p4.x.toFixed(2), p4.y.toFixed(2),
      'Z'
    ].join(' ');
  }

  readonly sunburstWedges = computed<ISunburstWedgeRender[]>(() => {
    const turn = this.calibrator.currentTurn();
    const axes = this.calibrator.axes();
    const rInner = 28;
    const maxOuter = 112;
    const wedges: ISunburstWedgeRender[] = [];

    turn.axisScores.forEach((pair, axisIdx) => {
      const meta = axes[axisIdx];
      const poles = [
        { label: meta.healthyPole, val: pair[0], isDrift: false, color: meta.category === 'neutral' ? '#38bdf8' : '#10b981' },
        { label: meta.driftPole, val: pair[1], isDrift: true, color: '#f43f5e' }
      ];

      poles.forEach((pole, subIdx) => {
        const sliceIndex = axisIdx * 2 + subIdx;
        const startAngle = sliceIndex * 30 + 2;
        const endAngle = (sliceIndex + 1) * 30 - 2;
        const rOuter = rInner + pole.val * (maxOuter - rInner);
        const midAngle = (startAngle + endAngle) / 2;
        const labelPos = this.polarToCartesian(0, 0, maxOuter + 22, midAngle);

        const isCue =
          axisIdx === turn.greatestSwingAxisIndex &&
          ((turn.isDriftHazard && pole.isDrift) || (!turn.isDriftHazard && !pole.isDrift));

        wedges.push({
          axisIndex: axisIdx,
          label: pole.label,
          shortLabel: pole.label.split(' ')[0],
          value: pole.val,
          isDrift: pole.isDrift,
          color: pole.color,
          fillOpacity: (0.35 + pole.val * 0.55).toFixed(2),
          pathD: this.createWedgePath(0, 0, rInner, rOuter, startAngle, endAngle),
          strokeWidth: axisIdx === this.calibrator.trackedAxisIndex() ? '2' : '1',
          isParasympatheticCue: isCue,
          labelX: Number(labelPos.x.toFixed(1)),
          labelY: Number(labelPos.y.toFixed(1)),
          textAnchor: labelPos.x > 10 ? 'start' : labelPos.x < -10 ? 'end' : 'middle',
          textOpacity: pole.val > 0.45 ? '0.95' : '0.55'
        });
      });
    });

    return wedges;
  });

  readonly driftPoints = computed<IDriftPointRender[]>(() => {
    const allTurns = this.calibrator.turns();
    const axisIdx = this.calibrator.trackedAxisIndex();
    const currentIdx = this.calibrator.activeTurnIndex();
    const padX = 36;
    const padY = 25;
    const w = 280 - padX * 2;
    const h = 230 - padY * 2;
    const denom = Math.max(1, allTurns.length - 1);

    return allTurns.map((t, idx) => {
      const driftVal = t.axisScores[axisIdx]?.[1] ?? 0.15;
      const x = Number((padX + driftVal * w).toFixed(1));
      const y = Number((padY + (idx / denom) * h).toFixed(1));
      return {
        turnIndex: idx,
        x,
        y,
        driftValue: driftVal,
        isCurrent: idx === currentIdx,
        isHazard: driftVal >= 0.55,
        labelOffsetX: driftVal > 0.7 ? -28 : 10
      };
    });
  });

  readonly driftPolylinePoints = computed<string>(() => {
    return this.driftPoints()
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  });

  async submitCustomProbe(): Promise<void> {
    const text = this.customUtterance().trim();
    if (!text) return;
    await this.calibrator.evaluateCustomUtterance(text);
    this.customUtterance.set('');
  }
}
