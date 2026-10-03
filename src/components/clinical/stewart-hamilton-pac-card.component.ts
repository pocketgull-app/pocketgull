import { Component, ChangeDetectionStrategy, inject, viewChild, ElementRef, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StewartHamiltonPacService, ShockEtiology, ForresterQuadrant } from '../../services/stewart-hamilton-pac.service';

@Component({
  selector: 'app-stewart-hamilton-pac-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-purple-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🫀</span>
              <span>Stewart-Hamilton Thermodilution &amp; Swan-Ganz PAC Profiler (Clinical Model P13)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Continuous Pulmonary Artery Catheterization &bull; Forrester Hemodynamic Matrix &bull; DO₂/VO₂ Oxygen Delivery Transport
            </p>
          </div>
        </div>

        <!-- Telemetry Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': service.hemodynamicOutput().shockSeverity === 'Critical STAT',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.hemodynamicOutput().shockSeverity === 'High Alert',
                  'bg-cyan-950/80 border-cyan-600/60 text-cyan-300': service.hemodynamicOutput().shockSeverity === 'Emergent',
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.hemodynamicOutput().shockSeverity === 'Normal'
                }">
            {{ service.hemodynamicOutput().shockSeverity }}: {{ service.hemodynamicOutput().shockTitle }}
          </span>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300">
            Forrester: {{ service.hemodynamicOutput().forresterLabel.split(':')[0] }}
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">ICU Scenarios:</span>
        <button type="button" (click)="applyPreset('normal')"
                [class.bg-emerald-700]="service.activePreset() === 'normal'"
                [class.text-white]="service.activePreset() === 'normal'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Normal Baseline
        </button>
        <button type="button" (click)="applyPreset('septic_distributive')"
                [class.bg-amber-600]="service.activePreset() === 'septic_distributive'"
                [class.text-white]="service.activePreset() === 'septic_distributive'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-amber-700 min-h-[32px] cursor-pointer">
          Septic Shock (High CO / Low SVR)
        </button>
        <button type="button" (click)="applyPreset('cardiogenic_pump_failure')"
                [class.bg-rose-600]="service.activePreset() === 'cardiogenic_pump_failure'"
                [class.text-white]="service.activePreset() === 'cardiogenic_pump_failure'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-rose-700 min-h-[32px] cursor-pointer">
          Cardiogenic Shock (Forrester IV)
        </button>
        <button type="button" (click)="applyPreset('hypovolemic')"
                [class.bg-cyan-700]="service.activePreset() === 'hypovolemic'"
                [class.text-white]="service.activePreset() === 'hypovolemic'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-cyan-800 min-h-[32px] cursor-pointer">
          Hypovolemic Shock (Low Preload)
        </button>
        <button type="button" (click)="applyPreset('obstructive_tamponade')"
                [class.bg-purple-700]="service.activePreset() === 'obstructive_tamponade'"
                [class.text-white]="service.activePreset() === 'obstructive_tamponade'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-purple-800 min-h-[32px] cursor-pointer">
          Cardiac Tamponade (CVP &approx; PCWP)
        </button>
        <button type="button" (click)="applyPreset('obstructive_pulmonary_embolism')"
                [class.bg-red-700]="service.activePreset() === 'obstructive_pulmonary_embolism'"
                [class.text-white]="service.activePreset() === 'obstructive_pulmonary_embolism'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-red-800 min-h-[32px] cursor-pointer">
          Massive PE (High TPG / PVR)
        </button>
      </div>

      <!-- Main Grid Body -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        
        <!-- Column 1: Catheter Pressures & Patient Inputs (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-3">
          <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">PAC Intracardiac Pressures</span>

            <!-- MAP -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Mean Arterial (MAP)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().meanArterialPressureMmhg }} mmHg</span>
              </div>
              <input type="range" min="40" max="140"
                     [value]="service.inputs().meanArterialPressureMmhg"
                     (input)="onInputChange('meanArterialPressureMmhg', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>

            <!-- CVP / RAP -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Central Venous (CVP / RAP)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().centralVenousPressureMmhg }} mmHg</span>
              </div>
              <input type="range" min="0" max="25"
                     [value]="service.inputs().centralVenousPressureMmhg"
                     (input)="onInputChange('centralVenousPressureMmhg', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>

            <!-- MPAP -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Mean PA Pressure (MPAP)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().meanPaPressureMmhg }} mmHg</span>
              </div>
              <input type="range" min="10" max="60"
                     [value]="service.inputs().meanPaPressureMmhg"
                     (input)="onInputChange('meanPaPressureMmhg', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>

            <!-- PCWP -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Pulmonary Wedge (PCWP)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().pulmonaryCapillaryWedgePressureMmhg }} mmHg</span>
              </div>
              <input type="range" min="2" max="35"
                     [value]="service.inputs().pulmonaryCapillaryWedgePressureMmhg"
                     (input)="onInputChange('pulmonaryCapillaryWedgePressureMmhg', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>

            <!-- Heart Rate -->
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Heart Rate (HR)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().heartRateBpm }} bpm</span>
              </div>
              <input type="range" min="40" max="160"
                     [value]="service.inputs().heartRateBpm"
                     (input)="onInputChange('heartRateBpm', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>
          </div>

          <!-- Thermodilution & Gas Exchange Parameters -->
          <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Thermodilution &amp; O₂ Transport</span>

            <!-- Thermodilution AUC -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Thermodilution Area (AUC)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().thermodilutionAucDegSec.toFixed(2) }} &deg;C&middot;s</span>
              </div>
              <input type="range" min="1.5" max="12.0" step="0.1"
                     [value]="service.inputs().thermodilutionAucDegSec"
                     (input)="onInputChange('thermodilutionAucDegSec', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
              <span class="text-[9px] text-zinc-500">Low AUC = Rapid Washout (High CO) | High AUC = Low CO</span>
            </div>

            <!-- SvO2 -->
            <div class="flex flex-col gap-1 mb-2.5">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Mixed Venous Sat (SvO₂)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().mixedVenousOxygenSatPercent }}%</span>
              </div>
              <input type="range" min="40" max="90"
                     [value]="service.inputs().mixedVenousOxygenSatPercent"
                     (input)="onInputChange('mixedVenousOxygenSatPercent', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>

            <!-- Hemoglobin -->
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center text-xs">
                <span class="text-zinc-400">Hemoglobin (Hb)</span>
                <span class="text-purple-400 font-bold tabular-nums">{{ service.inputs().hemoglobinGdl.toFixed(1) }} g/dL</span>
              </div>
              <input type="range" min="7.0" max="18.0" step="0.5"
                     [value]="service.inputs().hemoglobinGdl"
                     (input)="onInputChange('hemoglobinGdl', $event)"
                     class="w-full accent-purple-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
            </div>
          </div>
        </div>

        <!-- Column 2: Dual Canvas Viewports (Washout Curve + Forrester Matrix) (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-3">
          
          <!-- Canvas 1: Stewart-Hamilton Washout Curve -->
          <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Thermodilution Washout &Delta;Tb(t)</span>
              <span class="text-xs font-black text-purple-400 font-mono">
                CO: {{ service.hemodynamicOutput().cardiacOutputLmin }} L/min
              </span>
            </div>
            <div class="w-full h-[160px] bg-black rounded-xl border border-zinc-800 overflow-hidden relative">
              <canvas #thermoCanvas class="w-full h-full block"></canvas>
            </div>
          </div>

          <!-- Canvas 2: Forrester Matrix -->
          <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Forrester Hemodynamic Matrix</span>
              <span class="text-xs font-black text-emerald-400 font-mono">
                CI: {{ service.hemodynamicOutput().cardiacIndexLminM2 }} &bull; PCWP: {{ service.inputs().pulmonaryCapillaryWedgePressureMmhg }}
              </span>
            </div>
            <div class="w-full h-[180px] bg-black rounded-xl border border-zinc-800 overflow-hidden relative">
              <canvas #forresterCanvas class="w-full h-full block"></canvas>
            </div>
          </div>
        </div>

        <!-- Column 3: Derived Metrics & Clinical CDS Guidance (3 cols) -->
        <div class="lg:col-span-3 flex flex-col gap-3">
          
          <!-- Key Metrics Grid -->
          <div class="grid grid-cols-2 gap-2">
            <!-- CO / CI -->
            <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <span class="text-[10px] font-bold text-zinc-400 uppercase">Cardiac Index</span>
              <div class="my-1 flex items-baseline gap-1.5">
                <span class="text-2xl font-black tabular-nums"
                      [ngClass]="service.hemodynamicOutput().cardiacIndexLminM2 < 2.2 ? 'text-rose-400' : 'text-purple-400'">
                  {{ service.hemodynamicOutput().cardiacIndexLminM2 }}
                </span>
                <span class="text-[9px] text-zinc-500 font-sans">L/min/m²</span>
              </div>
              <span class="text-[9px] text-zinc-500">CO: {{ service.hemodynamicOutput().cardiacOutputLmin }} L/min</span>
            </div>

            <!-- SVR -->
            <div class="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
              <span class="text-[10px] font-bold text-zinc-400 uppercase">Systemic Res. (SVR)</span>
              <div class="my-1 flex items-baseline gap-1.5">
                <span class="text-2xl font-black tabular-nums"
                      [ngClass]="service.hemodynamicOutput().systemicVascularResistanceDyns < 800 ? 'text-amber-400' : 'text-cyan-400'">
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
              <span class="text-[9px] text-zinc-500">O2ER: {{ service.hemodynamicOutput().oxygenExtractionRatioPercent }}%</span>
            </div>
          </div>

          <!-- Clinical Etiology CDS Card -->
          <div class="p-3.5 rounded-2xl border flex flex-col gap-2"
               [ngClass]="{
                 'bg-rose-950/40 border-rose-600/50 text-rose-200': service.hemodynamicOutput().shockSeverity === 'Critical STAT',
                 'bg-amber-950/40 border-amber-600/50 text-amber-200': service.hemodynamicOutput().shockSeverity === 'High Alert',
                 'bg-cyan-950/40 border-cyan-600/50 text-cyan-200': service.hemodynamicOutput().shockSeverity === 'Emergent',
                 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200': service.hemodynamicOutput().shockSeverity === 'Normal'
               }">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider">{{ service.hemodynamicOutput().shockTitle }}</span>
              <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                {{ service.hemodynamicOutput().shockSeverity }}
              </span>
            </div>

            <p class="text-[11px] leading-relaxed font-sans text-zinc-300">
              {{ service.hemodynamicOutput().clinicalGuidance }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StewartHamiltonPacCardComponent implements AfterViewInit {
  readonly service = inject(StewartHamiltonPacService);

  readonly thermoCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('thermoCanvas');
  readonly forresterCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('forresterCanvas');

  constructor() {
    effect(() => {
      // Re-render canvases when output or inputs change
      const out = this.service.hemodynamicOutput();
      const inp = this.service.inputs();
      this.drawThermodilutionCurve(out.cardiacOutputLmin, inp.thermodilutionAucDegSec);
      this.drawForresterMatrix(out.cardiacIndexLminM2, inp.pulmonaryCapillaryWedgePressureMmhg);
    });
  }

  ngAfterViewInit(): void {
    const out = this.service.hemodynamicOutput();
    const inp = this.service.inputs();
    this.drawThermodilutionCurve(out.cardiacOutputLmin, inp.thermodilutionAucDegSec);
    this.drawForresterMatrix(out.cardiacIndexLminM2, inp.pulmonaryCapillaryWedgePressureMmhg);
  }

  applyPreset(preset: ShockEtiology): void {
    this.service.applyPreset(preset);
  }

  onInputChange(field: keyof ReturnType<typeof this.service.inputs>, event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.service.updateInput(field as any, val);
  }

  private drawThermodilutionCurve(co: number, targetAuc: number): void {
    const canvas = this.thermoCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = canvas.clientWidth || 320;
    const h = canvas.clientHeight || 160;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 35, padR = 15, padT = 15, padB = 25;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Grid lines & axes
    ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // Axis numbers
    ctx.fillStyle = '#71717a';
    ctx.font = '8px monospace';
    ctx.fillText('0s', padL, padT + plotH + 12);
    ctx.fillText('15s', padL + plotW * 0.5, padT + plotH + 12);
    ctx.fillText('30s', padL + plotW - 12, padT + plotH + 12);

    ctx.fillText('-1°C', 5, padT + 8);
    ctx.fillText('0°C', 5, padT + plotH);

    // Indicator dilution washout model (gamma distribution)
    const t0 = 2.0;
    const totalDuration = 30.0;
    const beta = Math.max(1.0, targetAuc / 2.2);
    const alpha = 2.0;

    let maxVal = 0;
    for (let t = 0; t <= totalDuration; t += 0.25) {
      if (t > t0) {
        const dt = t - t0;
        const v = Math.pow(dt, alpha) * Math.exp(-dt / beta);
        if (v > maxVal) maxVal = v;
      }
    }

    const peakDrop = Math.min(1.2, targetAuc / (beta * 2.5));

    // Fill path
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);

    const points: { x: number; y: number }[] = [];
    for (let t = 0; t <= totalDuration; t += 0.25) {
      let tempDrop = 0;
      if (t > t0) {
        const dt = t - t0;
        const raw = Math.pow(dt, alpha) * Math.exp(-dt / beta);
        tempDrop = (raw / (maxVal || 1)) * peakDrop;
      }
      const x = padL + (t / totalDuration) * plotW;
      const y = padT + plotH - (tempDrop / 1.2) * plotH;
      points.push({ x, y });
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    grad.addColorStop(1, 'rgba(168, 85, 247, 0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`AUC: ${targetAuc.toFixed(2)} °C·s | CO: ${co.toFixed(2)} L/min`, padL + 8, padT + 14);

    ctx.restore();
  }

  private drawForresterMatrix(ci: number, pcwp: number): void {
    const canvas = this.forresterCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = canvas.clientWidth || 320;
    const h = canvas.clientHeight || 180;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padL = 35, padR = 15, padT = 15, padB = 25;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    const pcwpMin = 0, pcwpMax = 36;
    const ciMin = 0.5, ciMax = 5.0;

    const threshX = padL + ((18 - pcwpMin) / (pcwpMax - pcwpMin)) * plotW;
    const threshY = padT + plotH - ((2.2 - ciMin) / (ciMax - ciMin)) * plotH;

    // Tint quadrants
    // Q1: Warm & Dry (Top Left)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(padL, padT, threshX - padL, threshY - padT);

    // Q2: Warm & Wet (Top Right)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.fillRect(threshX, padT, padL + plotW - threshX, threshY - padT);

    // Q3: Cold & Dry (Bottom Left)
    ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.fillRect(padL, threshY, threshX - padL, padT + plotH - threshY);

    // Q4: Cold & Wet (Bottom Right)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.fillRect(threshX, threshY, padL + plotW - threshX, padT + plotH - threshY);

    // Dividers
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(threshX, padT);
    ctx.lineTo(threshX, padT + plotH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padL, threshY);
    ctx.lineTo(padL + plotW, threshY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Quadrant Labels
    ctx.font = 'bold 8px -apple-system, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('Q I: WARM & DRY', padL + 4, padT + 10);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('Q II: WARM & WET', threshX + 4, padT + 10);

    ctx.fillStyle = '#06b6d4';
    ctx.fillText('Q III: COLD & DRY', padL + 4, threshY + 10);

    ctx.fillStyle = '#f43f5e';
    ctx.fillText('Q IV: COLD & WET', threshX + 4, threshY + 10);

    // Axis markings
    ctx.fillStyle = '#71717a';
    ctx.font = '8px monospace';
    ctx.fillText('0', padL, padT + plotH + 12);
    ctx.fillText('18', threshX - 5, padT + plotH + 12);
    ctx.fillText('35', padL + plotW - 12, padT + plotH + 12);

    ctx.fillText('5.0', padL - 22, padT + 8);
    ctx.fillText('2.2', padL - 22, threshY + 3);
    ctx.fillText('0.5', padL - 22, padT + plotH);

    // Patient Point
    const clampedPcwp = Math.max(pcwpMin, Math.min(pcwpMax, pcwp));
    const clampedCi = Math.max(ciMin, Math.min(ciMax, ci));

    const ptX = padL + ((clampedPcwp - pcwpMin) / (pcwpMax - pcwpMin)) * plotW;
    const ptY = padT + plotH - ((clampedCi - ciMin) / (ciMax - ciMin)) * plotH;

    // Glowing halo
    const glow = ctx.createRadialGradient(ptX, ptY, 1, ptX, ptY, 10);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.5, 'rgba(192, 132, 252, 0.6)');
    glow.addColorStop(1, 'rgba(192, 132, 252, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ptX, ptY, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ptX, ptY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`(${clampedPcwp}, ${clampedCi.toFixed(2)})`, ptX + 6, ptY - 4);

    ctx.restore();
  }
}
