import { Component, ChangeDetectionStrategy, inject, signal, viewChild, ElementRef, effect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlycemicMinimalModelService, GlycemicPresetMode } from '../../services/glycemic-minimal-model.service';

@Component({
  selector: 'app-glycemic-minimal-model-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🥞</span>
              <span>Glycemic Minimal Model &amp; Ambulatory Glucose Profiler (Clinical Model P11)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Bergman Minimal Model Kinetics (S_I &amp; DI) • ATTD Consensus AGP Metrics (TIR, TBR, %CV) • Dawn vs Somogyi Discriminator
            </p>
          </div>
        </div>

        <!-- Master Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': service.cgmMetrics().clinicalAttdCompliance === 'Meets Consensus Targets',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': service.cgmMetrics().clinicalAttdCompliance === 'Suboptimal TIR',
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': service.cgmMetrics().clinicalAttdCompliance === 'Critical Hypoglycemia Alert'
                }">
            {{ service.cgmMetrics().clinicalAttdCompliance }}
          </span>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300">
            GMI: {{ service.cgmMetrics().glucoseManagementIndicatorGmiPercent }}% (Est. HbA1c)
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Clinical Presets:</span>
        <button type="button" (click)="applyPreset('healthy_athlete')"
                [class.bg-emerald-500]="service.activePreset() === 'healthy_athlete'"
                [class.text-zinc-950]="service.activePreset() === 'healthy_athlete'"
                [class.text-emerald-400]="service.activePreset() !== 'healthy_athlete'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Healthy Athlete (S_I: 8.4)
        </button>
        <button type="button" (click)="applyPreset('metabolic_syndrome_ir')"
                [class.bg-amber-500]="service.activePreset() === 'metabolic_syndrome_ir'"
                [class.text-zinc-950]="service.activePreset() === 'metabolic_syndrome_ir'"
                [class.text-amber-400]="service.activePreset() !== 'metabolic_syndrome_ir'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Metabolic Syndrome / IR
        </button>
        <button type="button" (click)="applyPreset('type_1_brittle_dawn')"
                [class.bg-purple-500]="service.activePreset() === 'type_1_brittle_dawn'"
                [class.text-zinc-950]="service.activePreset() === 'type_1_brittle_dawn'"
                [class.text-purple-400]="service.activePreset() !== 'type_1_brittle_dawn'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          T1D Brittle (Dawn Surge)
        </button>
        <button type="button" (click)="applyPreset('somogyi_rebound')"
                [class.bg-rose-500]="service.activePreset() === 'somogyi_rebound'"
                [class.text-zinc-950]="service.activePreset() === 'somogyi_rebound'"
                [class.text-rose-400]="service.activePreset() !== 'somogyi_rebound'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Somogyi Rebound (3am Hypo)
        </button>
        <button type="button" (click)="applyPreset('type_2_decompensated')"
                [class.bg-red-600]="service.activePreset() === 'type_2_decompensated'"
                [class.text-white]="service.activePreset() === 'type_2_decompensated'"
                [class.text-red-400]="service.activePreset() !== 'type_2_decompensated'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          T2D Decompensated (Exhaustion)
        </button>
      </div>

      <!-- Core Telemetry Grid -->
      <div class="p-4 sm:p-6 space-y-6">
        
        <!-- KPI Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <!-- TIR -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">Time in Range (70-180)</span>
            <div class="my-1.5 flex items-baseline gap-2">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.cgmMetrics().timeInRangeTirPercent >= 70 ? 'text-emerald-400' : 'text-amber-400'">
                {{ service.cgmMetrics().timeInRangeTirPercent }}%
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">Target &ge; 70%</span>
            </div>
            <!-- Range Distribution Bar -->
            <div class="w-full h-2 rounded-full overflow-hidden flex bg-zinc-800">
              <div class="bg-rose-500 h-full" [style.width.%]="service.cgmMetrics().timeBelowRangeTbrLevel2Percent + service.cgmMetrics().timeBelowRangeTbrLevel1Percent"></div>
              <div class="bg-emerald-400 h-full" [style.width.%]="service.cgmMetrics().timeInRangeTirPercent"></div>
              <div class="bg-amber-400 h-full" [style.width.%]="service.cgmMetrics().timeAboveRangeTarLevel1Percent"></div>
              <div class="bg-orange-600 h-full" [style.width.%]="service.cgmMetrics().timeAboveRangeTarLevel2Percent"></div>
            </div>
          </div>

          <!-- Glycemic Variability %CV -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">Glycemic Variability (%CV)</span>
            <div class="my-1.5 flex items-baseline gap-2">
              <span class="text-2xl font-black tabular-nums"
                    [ngClass]="service.cgmMetrics().coefficientOfVariationPercent <= 36 ? 'text-emerald-400' : 'text-rose-400'">
                {{ service.cgmMetrics().coefficientOfVariationPercent }}%
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">Target &le; 36%</span>
            </div>
            <span class="text-[10px] font-bold"
                  [ngClass]="service.cgmMetrics().coefficientOfVariationPercent <= 36 ? 'text-emerald-400' : 'text-rose-400'">
              {{ service.cgmMetrics().coefficientOfVariationPercent <= 36 ? '✓ Stable Glycemia' : '⚠ High Volatility' }}
            </span>
          </div>

          <!-- Insulin Sensitivity Index S_I -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">Insulin Sensitivity (S_I)</span>
            <div class="my-1.5 flex items-baseline gap-2">
              <span class="text-2xl font-black text-cyan-400 tabular-nums">
                {{ service.bergmanKinetics().insulinSensitivityIndexSi }}
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">10⁻⁴ min⁻¹/(μU/mL)</span>
            </div>
            <span class="text-[10px] text-zinc-400 truncate">
              DI: {{ service.bergmanKinetics().dispositionIndexDi }}
            </span>
          </div>

          <!-- Beta-Cell Compensation Tier -->
          <div class="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between">
            <span class="text-[11px] font-bold text-zinc-400 uppercase">&beta;-Cell Secretion Tier</span>
            <div class="my-1.5">
              <span class="text-xs font-black leading-tight block"
                    [ngClass]="{
                      'text-emerald-400': service.bergmanKinetics().betaCellCompensationTier.includes('Robust'),
                      'text-cyan-400': service.bergmanKinetics().betaCellCompensationTier.includes('Compensated'),
                      'text-amber-400': service.bergmanKinetics().betaCellCompensationTier.includes('Impaired'),
                      'text-rose-400': service.bergmanKinetics().betaCellCompensationTier.includes('Severe')
                    }">
                {{ service.bergmanKinetics().betaCellCompensationTier }}
              </span>
            </div>
            <span class="text-[10px] text-zinc-500 font-sans">
              Glucose Clear: {{ service.bergmanKinetics().glucoseDisappearanceVelocityPercentPerHour }}%/h
            </span>
          </div>

        </div>

        <!-- Dual Physiological Canvas Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <!-- AGP 24-Hour Ambulatory Glucose Strip Canvas -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                24-Hour Ambulatory Glucose Profile (AGP Strip)
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">Target 70-180 mg/dL Shaded Green</span>
            </div>
            <canvas #agpCanvas class="w-full h-44 rounded-xl bg-zinc-950 border border-zinc-850"></canvas>
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-sans px-1">
              <span>00:00 (Night)</span>
              <span>03:00 (Nadir)</span>
              <span>07:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>18:00 (Dinner)</span>
              <span>23:59</span>
            </div>
          </div>

          <!-- Bergman Minimal Model IVGTT Curve Canvas -->
          <div class="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                Bergman Minimal Model Forward Kinetics: G(t) &amp; X(t)
              </span>
              <span class="text-[10px] text-zinc-500 font-sans">Euler Integration (0-180 min)</span>
            </div>
            <canvas #bergmanCanvas class="w-full h-44 rounded-xl bg-zinc-950 border border-zinc-850"></canvas>
            <div class="flex items-center justify-between text-[10px] text-zinc-400 font-sans px-1">
              <span>0 min (Pulse)</span>
              <span>30 min</span>
              <span>60 min</span>
              <span>90 min</span>
              <span>120 min</span>
              <span>180 min (Basal)</span>
            </div>
          </div>

        </div>

        <!-- Nocturnal Discriminator HUD: Dawn Phenomenon vs Somogyi Effect -->
        <div class="p-4 sm:p-5 rounded-2xl border transition-colors"
             [ngClass]="{
               'bg-emerald-950/20 border-emerald-500/40': service.nocturnalReport().phenotype === 'Physiological Nocturnal Stability',
               'bg-purple-950/20 border-purple-500/40': service.nocturnalReport().phenotype === 'Dawn Phenomenon',
               'bg-rose-950/30 border-rose-500/50': service.nocturnalReport().phenotype === 'Somogyi Rebound Effect',
               'bg-amber-950/20 border-amber-500/40': service.nocturnalReport().phenotype === 'Persistent Nocturnal Hyperglycemia'
             }">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🌙</span>
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Nocturnal Trajectory Classifier</span>
                <h4 class="text-sm sm:text-base font-black uppercase text-zinc-100 flex items-center gap-2">
                  <span>{{ service.nocturnalReport().phenotype }}</span>
                </h4>
              </div>
            </div>

            <div class="flex items-center gap-3 text-xs font-mono">
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                03:00 Nadir: <strong class="tabular-nums" [ngClass]="service.nocturnalReport().nadir0300MgDl < 70 ? 'text-rose-400' : 'text-emerald-400'">{{ service.nocturnalReport().nadir0300MgDl }}</strong> mg/dL
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                07:00 Fasting: <strong class="tabular-nums" [ngClass]="service.nocturnalReport().morning0700MgDl >= 140 ? 'text-amber-400' : 'text-emerald-400'">{{ service.nocturnalReport().morning0700MgDl }}</strong> mg/dL
              </span>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400">
                &Delta;: <strong class="tabular-nums text-zinc-200">+{{ service.nocturnalReport().deltaDawnMgDl }}</strong> mg/dL
              </span>
            </div>
          </div>

          <div class="mt-3 text-xs text-zinc-300 font-sans leading-relaxed">
            <strong class="text-zinc-100 font-mono text-[11px] block mb-1">Recommended Clinical Action Plan:</strong>
            {{ service.nocturnalReport().clinicalAction }}
          </div>
        </div>

      </div>

    </div>
  `
})
export class GlycemicMinimalModelCardComponent implements AfterViewInit {
  readonly service = inject(GlycemicMinimalModelService);

  readonly agpCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('agpCanvas');
  readonly bergmanCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('bergmanCanvas');

  constructor() {
    effect(() => {
      // Trigger canvas re-rendering upon changes to inputs or kinetics
      this.service.cgmInputs();
      this.service.bergmanKinetics();
      if (typeof window !== 'undefined') {
        setTimeout(() => this.drawCanvases(), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawCanvases();
  }

  applyPreset(preset: GlycemicPresetMode): void {
    this.service.applyPreset(preset);
  }

  private drawCanvases(): void {
    this.drawAgpCanvas();
    this.drawBergmanCanvas();
  }

  private drawAgpCanvas(): void {
    const canvas = this.agpCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 400;
    const height = canvas.height = canvas.parentElement?.clientHeight || 176;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Target range: 70 - 180 mg/dL mapped to height
    const maxG = 350;
    const minG = 40;
    const toY = (g: number) => height - ((g - minG) / (maxG - minG)) * height;

    // Green zone (70 to 180)
    const y180 = toY(180);
    const y70 = toY(70);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(0, y180, width, y70 - y180);

    // Hypo zone (< 70)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.fillRect(0, y70, width, height - y70);

    // Grid lines for 70 and 180
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y180);
    ctx.lineTo(width, y180);
    ctx.moveTo(0, y70);
    ctx.lineTo(width, y70);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw CGM sensor trajectory
    const readings = this.service.cgmInputs().sensorReadingsMgDl;
    if (readings.length > 1) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < readings.length; i++) {
        const x = (i / (readings.length - 1)) * width;
        const y = toY(readings[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw sensor points
      for (let i = 0; i < readings.length; i++) {
        const x = (i / (readings.length - 1)) * width;
        const y = toY(readings[i]);
        ctx.fillStyle = readings[i] < 70 ? '#f43f5e' : (readings[i] > 180 ? '#fbbf24' : '#10b981');
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawBergmanCanvas(): void {
    const canvas = this.bergmanCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement?.clientWidth || 400;
    const height = canvas.height = canvas.parentElement?.clientHeight || 176;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    const traj = this.service.bergmanKinetics().trajectory;
    if (!traj || traj.length === 0) return;

    const maxG = 250;
    const minG = 60;
    const toY = (g: number) => height - ((g - minG) / (maxG - minG)) * height;

    // Basal line
    const basalG = this.service.bergmanParams().basalGlucoseMgDl;
    const yBasal = toY(basalG);
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, yBasal);
    ctx.lineTo(width, yBasal);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve G(t)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < traj.length; i++) {
      const x = (i / (traj.length - 1)) * width;
      const y = toY(traj[i].glucoseMgDl);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Secondary curve: Remote insulin action X(t) in magenta
    const maxX = 0.05;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < traj.length; i++) {
      const x = (i / (traj.length - 1)) * width;
      const y = height - (traj[i].remoteInsulinActionX / maxX) * (height * 0.7);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
