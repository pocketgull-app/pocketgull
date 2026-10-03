import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StewartHamiltonPacService, PacPresetMode } from '../../services/stewart-hamilton-pac.service';

@Component({
  selector: 'app-stewart-hamilton-pac-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-sky-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🫀</span>
              <span>Stewart-Hamilton Thermodilution &amp; Hemodynamic Profiler (Clinical Model P13)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Pulmonary Artery Catheter (Swan-Ganz) • Forrester Quadrant Subsets • Transpulmonary Gradient &amp; Resuscitation CDS
            </p>
          </div>
        </div>

        <!-- Master Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.hemodynamicOutput().shockClassification.includes('No Shock'),
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.hemodynamicOutput().shockClassification.includes('Distributive Shock'),
                  'bg-purple-950/80 border-purple-600/60 text-purple-300': service.hemodynamicOutput().shockClassification.includes('Obstructive Shock'),
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': service.hemodynamicOutput().shockClassification.includes('Cardiogenic Shock') || service.hemodynamicOutput().shockClassification.includes('Hypovolemic Shock')
                }">
            {{ service.hemodynamicOutput().shockClassification }}
          </span>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300">
            {{ service.hemodynamicOutput().forresterSubset.split(':')[0] }}
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Clinical Presets:</span>
        <button type="button" (click)="applyPreset('euvolemic_healthy')"
                [class.bg-emerald-600]="service.activePreset() === 'euvolemic_healthy'"
                [class.text-white]="service.activePreset() === 'euvolemic_healthy'"
                [class.text-emerald-400]="service.activePreset() !== 'euvolemic_healthy'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Euvolemic Normal (Subset I)
        </button>
        <button type="button" (click)="applyPreset('cardiogenic_shock_forrester_iv')"
                [class.bg-rose-600]="service.activePreset() === 'cardiogenic_shock_forrester_iv'"
                [class.text-white]="service.activePreset() === 'cardiogenic_shock_forrester_iv'"
                [class.text-rose-400]="service.activePreset() !== 'cardiogenic_shock_forrester_iv'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Cardiogenic Shock (Forrester IV)
        </button>
        <button type="button" (click)="applyPreset('hyperdynamic_septic_shock')"
                [class.bg-amber-600]="service.activePreset() === 'hyperdynamic_septic_shock'"
                [class.text-white]="service.activePreset() === 'hyperdynamic_septic_shock'"
                [class.text-amber-400]="service.activePreset() !== 'hyperdynamic_septic_shock'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Septic Vasoplegia (Low SVR)
        </button>
        <button type="button" (click)="applyPreset('hypovolemic_hemorrhagic_shock')"
                [class.bg-blue-600]="service.activePreset() === 'hypovolemic_hemorrhagic_shock'"
                [class.text-white]="service.activePreset() === 'hypovolemic_hemorrhagic_shock'"
                [class.text-blue-400]="service.activePreset() !== 'hypovolemic_hemorrhagic_shock'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Hypovolemic Shock (Low Filling)
        </button>
        <button type="button" (click)="applyPreset('massive_pulmonary_embolism')"
                [class.bg-purple-600]="service.activePreset() === 'massive_pulmonary_embolism'"
                [class.text-white]="service.activePreset() === 'massive_pulmonary_embolism'"
                [class.text-purple-400]="service.activePreset() !== 'massive_pulmonary_embolism'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Massive PE (High TPG &amp; PVR)
        </button>
        <button type="button" (click)="applyPreset('cardiac_tamponade_equalization')"
                [class.bg-rose-700]="service.activePreset() === 'cardiac_tamponade_equalization'"
                [class.text-white]="service.activePreset() === 'cardiac_tamponade_equalization'"
                [class.text-rose-300]="service.activePreset() !== 'cardiac_tamponade_equalization'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Cardiac Tamponade (CVP &approx; PCWP)
        </button>
      </div>

      <!-- Core Telemetry Grid -->
      <div class="p-4 sm:p-6 space-y-6">
        
        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <!-- Cardiac Index -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">Cardiac Index (CI)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.hemodynamicOutput().cardiacIndexLminM2 < 2.2 ? 'text-rose-400' : 'text-emerald-400'">
                {{ service.hemodynamicOutput().cardiacIndexLminM2 }}
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">L/min/m&sup2;</span>
            </div>
            <span class="text-[9px] text-zinc-500">Target: 2.5 - 4.0</span>
          </div>

          <!-- PCWP -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">Wedge (PCWP)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.vitals().pulmonaryCapillaryWedgePressurePcwp > 18 ? 'text-rose-400' : (service.vitals().pulmonaryCapillaryWedgePressurePcwp < 8 ? 'text-amber-400' : 'text-cyan-400')">
                {{ service.vitals().pulmonaryCapillaryWedgePressurePcwp }}
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">mmHg</span>
            </div>
            <span class="text-[9px] text-zinc-500">Congestion &gt; 18</span>
          </div>

          <!-- SVR -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">Afterload (SVR)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.hemodynamicOutput().systemicVascularResistanceDyns < 700 ? 'text-amber-400' : (service.hemodynamicOutput().systemicVascularResistanceDyns > 1400 ? 'text-rose-400' : 'text-emerald-400')">
                {{ service.hemodynamicOutput().systemicVascularResistanceDyns }}
              </span>
              <span class="text-[9px] text-zinc-500 font-sans">dyn&middot;s/cm<sup>5</sup></span>
            </div>
            <span class="text-[9px] text-zinc-500">Normal: 800 - 1200</span>
          </div>

          <!-- PVR & TPG -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">Pulmonary Res. (PVR)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.hemodynamicOutput().pulmonaryVascularResistanceDyns > 250 ? 'text-rose-400' : 'text-cyan-400'">
                {{ service.hemodynamicOutput().pulmonaryVascularResistanceDyns }}
              </span>
              <span class="text-[9px] text-zinc-500 font-sans">dyn&middot;s/cm<sup>5</sup></span>
            </div>
            <span class="text-[9px] text-zinc-500">TPG: {{ service.hemodynamicOutput().transpulmonaryGradientMmhg }} mmHg</span>
          </div>

          <!-- Oxygen Delivery DO2 -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">O2 Delivery (DO2)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.hemodynamicOutput().oxygenDeliveryDo2Mlmin < 600 ? 'text-rose-400' : 'text-emerald-400'">
                {{ service.hemodynamicOutput().oxygenDeliveryDo2Mlmin }}
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">mL/min</span>
            </div>
            <span class="text-[9px] text-zinc-500">Target &gt; 900</span>
          </div>

          <!-- SvO2 -->
          <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase">Mixed Venous (SvO2)</span>
            <div class="my-1 flex items-baseline gap-1.5">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.vitals().mixedVenousOxygenSatSvO2Pct < 60 ? 'text-rose-400' : (service.vitals().mixedVenousOxygenSatSvO2Pct > 80 ? 'text-amber-400' : 'text-emerald-400')">
                {{ service.vitals().mixedVenousOxygenSatSvO2Pct }}%
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">O2ER: {{ service.hemodynamicOutput().oxygenExtractionRatioPct }}%</span>
            </div>
            <span class="text-[9px] text-zinc-500">Normal: 65% - 75%</span>
          </div>
        </div>

        <!-- Dual Physiological Canvas Curves -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Stewart-Hamilton Thermodilution Washout Curve -->
          <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-2">
                <span>🌡️</span>
                <span>Thermodilution Washout Curve (&Delta;Tb vs Time)</span>
              </h4>
              <span class="text-[10px] text-cyan-400 font-mono">
                AUC: {{ service.vitals().areaUnderThermodilutionCurveDegSec }} &deg;C&middot;s &bull; CO: {{ service.hemodynamicOutput().cardiacOutputLmin }} L/min
              </span>
            </div>
            <canvas #thermoCanvas class="w-full h-40 rounded-xl bg-zinc-950 border border-zinc-900 block"></canvas>
            <div class="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1 px-1">
              <span>0s (Injectate)</span>
              <span>10s (Peak Washout)</span>
              <span>20s</span>
              <span>30s (Thermal Equilibrium)</span>
            </div>
          </div>

          <!-- Forrester Hemodynamic Quadrants Matrix -->
          <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 relative flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold text-zinc-300 uppercase flex items-center gap-2">
                <span>📊</span>
                <span>Forrester Hemodynamic Quadrants (CI vs PCWP)</span>
              </h4>
              <span class="text-[10px] text-amber-400 font-mono">
                PCWP 18 | CI 2.2 Thresholds
              </span>
            </div>
            <canvas #forresterCanvas class="w-full h-40 rounded-xl bg-zinc-950 border border-zinc-900 block"></canvas>
            <div class="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1 px-1">
              <span>Subset III: Cold/Dry</span>
              <span>Subset I: Warm/Dry</span>
              <span>Subset IV: Cold/Wet</span>
              <span>Subset II: Warm/Wet</span>
            </div>
          </div>

        </div>

        <!-- Interactive Sliders -->
        <div class="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <!-- MAP Slider -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Mean Arterial Pressure (MAP):</span>
              <span class="text-emerald-400 font-bold tabular-nums">{{ service.vitals().meanArterialPressureMap }} mmHg</span>
            </div>
            <input type="range" min="40" max="130" step="1"
                   [ngModel]="service.vitals().meanArterialPressureMap"
                   (ngModelChange)="updateMap($event)"
                   class="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Perfusion target &ge; 65 mmHg</span>
          </div>

          <!-- CVP Slider -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Central Venous Pressure (CVP):</span>
              <span class="text-sky-400 font-bold tabular-nums">{{ service.vitals().centralVenousPressureCvp }} mmHg</span>
            </div>
            <input type="range" min="0" max="25" step="1"
                   [ngModel]="service.vitals().centralVenousPressureCvp"
                   (ngModelChange)="updateCvp($event)"
                   class="w-full accent-sky-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Right atrial filling pressure</span>
          </div>

          <!-- PCWP Slider -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Wedge Pressure (PCWP):</span>
              <span class="text-cyan-400 font-bold tabular-nums">{{ service.vitals().pulmonaryCapillaryWedgePressurePcwp }} mmHg</span>
            </div>
            <input type="range" min="2" max="35" step="1"
                   [ngModel]="service.vitals().pulmonaryCapillaryWedgePressurePcwp"
                   (ngModelChange)="updatePcwp($event)"
                   class="w-full accent-cyan-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Left atrial hydrostatic pressure</span>
          </div>

          <!-- Thermodilution AUC Slider -->
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="text-zinc-400">Thermodilution Area (AUC):</span>
              <span class="text-amber-400 font-bold tabular-nums">{{ service.vitals().areaUnderThermodilutionCurveDegSec }} &deg;C&middot;s</span>
            </div>
            <input type="range" min="1.5" max="15.0" step="0.1"
                   [ngModel]="service.vitals().areaUnderThermodilutionCurveDegSec"
                   (ngModelChange)="updateAuc($event)"
                   class="w-full accent-amber-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer">
            <span class="text-[10px] text-zinc-500">Inversely proportional to Cardiac Output</span>
          </div>
        </div>

        <!-- Clinical Decision Guidance & Step-Up Interventions -->
        <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col md:flex-row gap-6">
          <div class="flex-1 space-y-2">
            <span class="text-xs font-bold text-zinc-400 uppercase">🛡️ Clinical Pathophysiology Assessment</span>
            <p class="text-xs text-zinc-200 leading-relaxed font-sans">
              {{ service.hemodynamicOutput().clinicalGuidance }}
            </p>
          </div>

          <div class="flex-1 space-y-2">
            <span class="text-xs font-bold text-zinc-400 uppercase">📋 Prioritized Hemodynamic Interventions</span>
            <ul class="space-y-1.5 text-xs text-zinc-300 font-sans">
              @for (step of service.hemodynamicOutput().recommendedInterventions; track step) {
                <li class="flex items-start gap-2">
                  <span class="text-sky-400 font-bold">&bull;</span>
                  <span>{{ step }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

      </div>

    </div>
  `
})
export class StewartHamiltonPacCardComponent implements AfterViewInit {
  readonly service = inject(StewartHamiltonPacService);
  private readonly thermoCanvas = viewChild<ElementRef<HTMLCanvasElement>>('thermoCanvas');
  private readonly forresterCanvas = viewChild<ElementRef<HTMLCanvasElement>>('forresterCanvas');

  constructor() {
    effect(() => {
      // Re-render curves whenever vitals or hemodynamics change
      const vitals = this.service.vitals();
      const output = this.service.hemodynamicOutput();
      this.renderThermodilutionCurve(vitals.areaUnderThermodilutionCurveDegSec, output.cardiacOutputLmin);
      this.renderForresterMatrix(output.cardiacIndexLminM2, vitals.pulmonaryCapillaryWedgePressurePcwp);
    });
  }

  ngAfterViewInit(): void {
    const vitals = this.service.vitals();
    const output = this.service.hemodynamicOutput();
    this.renderThermodilutionCurve(vitals.areaUnderThermodilutionCurveDegSec, output.cardiacOutputLmin);
    this.renderForresterMatrix(output.cardiacIndexLminM2, vitals.pulmonaryCapillaryWedgePressurePcwp);
  }

  applyPreset(preset: PacPresetMode): void {
    this.service.applyPreset(preset);
  }

  updateMap(val: number): void {
    const v = this.service.vitals();
    this.service.vitals.set({ ...v, meanArterialPressureMap: Number(val) });
  }

  updateCvp(val: number): void {
    const v = this.service.vitals();
    this.service.vitals.set({ ...v, centralVenousPressureCvp: Number(val) });
  }

  updatePcwp(val: number): void {
    const v = this.service.vitals();
    this.service.vitals.set({ ...v, pulmonaryCapillaryWedgePressurePcwp: Number(val) });
  }

  updateAuc(val: number): void {
    const v = this.service.vitals();
    this.service.vitals.set({ ...v, areaUnderThermodilutionCurveDegSec: Number(val) });
  }

  private renderThermodilutionCurve(auc: number, co: number): void {
    const canvas = this.thermoCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let x = 35; x < w - 10; x += (w - 45) / 6) {
      ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, h - 20); ctx.stroke();
    }
    for (let y = 15; y < h - 20; y += (h - 35) / 3) {
      ctx.beginPath(); ctx.moveTo(35, y); ctx.lineTo(w - 10, y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 10);
    ctx.lineTo(35, h - 20);
    ctx.lineTo(w - 10, h - 20);
    ctx.stroke();

    // Gamma variate thermodilution curve: Delta Tb(t) = K * t^alpha * exp(-beta * t)
    // Fast washout (high CO / low AUC): sharp early peak and rapid decay
    // Slow washout (low CO / high AUC): delayed broad peak with prolonged tail
    const alpha = 2.5;
    const beta = Math.max(0.2, 2.5 / (auc * 0.35));
    const peakHeight = Math.min(1.8, 0.4 + 1.2 / Math.sqrt(auc));

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 100;
    const plotW = w - 45;
    const plotH = h - 35;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 30; // 0 to 30 sec
      // Normalize gamma shape
      const val = (Math.pow(t, alpha) * Math.exp(-beta * t));
      const normVal = Math.min(2.0, val * 0.15 * peakHeight);
      const x = 35 + (i / steps) * plotW;
      const y = h - 20 - (normVal / 1.5) * plotH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(35 + plotW, h - 20);
    ctx.lineTo(35, h - 20);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();

    // Axis labels
    ctx.fillStyle = '#71717a';
    ctx.font = '9px monospace';
    ctx.fillText('0s', 35, h - 8);
    ctx.fillText('15s', 35 + plotW / 2, h - 8);
    ctx.fillText('30s', 35 + plotW - 15, h - 8);
  }

  private renderForresterMatrix(ci: number, pcwp: number): void {
    const canvas = this.forresterCanvas()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    const marginL = 40;
    const marginB = 25;
    const plotW = w - marginL - 15;
    const plotH = h - marginB - 15;

    // Threshold lines: PCWP = 18 mmHg (X axis range 0 - 36), CI = 2.2 (Y axis range 0 - 5.0)
    const thresholdX = marginL + (18.0 / 36.0) * plotW;
    const thresholdY = h - marginB - (2.2 / 5.0) * plotH;

    // Quadrant backgrounds
    // Subset I: Warm/Dry (CI >= 2.2, PCWP <= 18) -> Top-Left
    ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';
    ctx.fillRect(marginL, 15, thresholdX - marginL, thresholdY - 15);

    // Subset II: Warm/Wet (CI >= 2.2, PCWP > 18) -> Top-Right
    ctx.fillStyle = 'rgba(6, 182, 212, 0.10)';
    ctx.fillRect(thresholdX, 15, marginL + plotW - thresholdX, thresholdY - 15);

    // Subset III: Cold/Dry (CI < 2.2, PCWP <= 18) -> Bottom-Left
    ctx.fillStyle = 'rgba(245, 158, 11, 0.10)';
    ctx.fillRect(marginL, thresholdY, thresholdX - marginL, h - marginB - thresholdY);

    // Subset IV: Cold/Wet (CI < 2.2, PCWP > 18) -> Bottom-Right (Cardiogenic shock)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(thresholdX, thresholdY, marginL + plotW - thresholdX, h - marginB - thresholdY);

    // Quadrant dividers
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(thresholdX, 15);
    ctx.lineTo(thresholdX, h - marginB);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(marginL, thresholdY);
    ctx.lineTo(marginL + plotW, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginL, 15);
    ctx.lineTo(marginL, h - marginB);
    ctx.lineTo(marginL + plotW, h - marginB);
    ctx.stroke();

    // Patient Point
    const ptX = marginL + Math.min(1.0, Math.max(0, pcwp / 36.0)) * plotW;
    const ptY = h - marginB - Math.min(1.0, Math.max(0, ci / 5.0)) * plotH;

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(ptX, ptY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ptX, ptY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '8px monospace';
    ctx.fillText('PCWP 18', thresholdX - 16, h - 8);
    ctx.fillText('CI 2.2', 8, thresholdY + 3);
  }
}
