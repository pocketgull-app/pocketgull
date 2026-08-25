import { Component, ChangeDetectionStrategy, inject, computed, signal, viewChild, ElementRef, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PocketGullCardComponent } from './shared/pocket-gull-card.component';
import { ExportService } from '../services/export.service';

interface ISirPoint {
  day: number;
  s: number; // Susceptible fraction (0..1)
  i: number; // Infected fraction (0..1)
  r: number; // Recovered fraction (0..1)
}

@Component({
  selector: 'app-sentinel-telemetry-plotter',
  standalone: true,
  imports: [CommonModule, PocketGullCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pocket-gull-card 
      title="📡 Sentinel Epidemiological SIR ODE & Biometric Telemetry Plotter" 
      [noPadding]="false"
      class="block w-full">
      
      <div right-action class="flex items-center gap-2 font-mono">
        <span class="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
          R₀: {{ basicReproductionNumber().toFixed(2) }}
        </span>
        <span class="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
          Rₑ: {{ effectiveReproductionNumber().toFixed(2) }}
        </span>
      </div>

      <!-- Controls & Dataset Selection -->
      <div class="mb-5 p-4 rounded-xl bg-zinc-900 border border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs text-zinc-300">
        
        <div>
          <label class="block text-[11px] text-zinc-400 font-bold mb-1">Transmission Rate (β): {{ beta().toFixed(2) }}</label>
          <input type="range" min="0.05" max="0.80" step="0.01" [value]="beta()" (input)="onBetaChange($event)"
            class="w-full accent-amber-500 cursor-pointer" />
        </div>

        <div>
          <label class="block text-[11px] text-zinc-400 font-bold mb-1">Recovery Rate (γ): {{ gamma().toFixed(2) }}</label>
          <input type="range" min="0.02" max="0.30" step="0.01" [value]="gamma()" (input)="onGammaChange($event)"
            class="w-full accent-emerald-500 cursor-pointer" />
        </div>

        <div>
          <label class="block text-[11px] text-zinc-400 font-bold mb-1">Quarantine Efficacy: {{ quarantineEfficacy() }}%</label>
          <input type="range" min="0" max="90" step="5" [value]="quarantineEfficacy()" (input)="onQuarantineChange($event)"
            class="w-full accent-blue-500 cursor-pointer" />
        </div>

        <div>
          <label class="block text-[11px] text-zinc-400 font-bold mb-1">Ring Vaccination: {{ vaccinationCoverage() }}%</label>
          <input type="range" min="0" max="80" step="5" [value]="vaccinationCoverage()" (input)="onVaccinationChange($event)"
            class="w-full accent-purple-500 cursor-pointer" />
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: SIR ODE Differential Curves Canvas -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <div class="relative w-full aspect-[16/9] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 p-3 flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-mono text-zinc-400 z-10">
              <span class="flex items-center gap-1 font-bold text-amber-400">
                <span class="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                Infected I(t)
              </span>
              <span class="flex items-center gap-1 font-bold text-blue-400">
                <span class="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                Susceptible S(t)
              </span>
              <span class="flex items-center gap-1 font-bold text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                Recovered R(t)
              </span>
            </div>

            <!-- Canvas Element for SIR Curves -->
            <canvas #sirCanvas class="w-full h-full absolute inset-0"></canvas>
          </div>

          <!-- SIR Metrics & Peak Telemetry -->
          <div class="grid grid-cols-3 gap-3 font-mono text-center">
            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div class="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Peak Infection Day</div>
              <div class="text-lg font-extrabold text-amber-400 mt-0.5">Day {{ peakDay() }}</div>
            </div>
            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div class="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Max Infected Burden</div>
              <div class="text-lg font-extrabold text-red-400 mt-0.5">{{ (maxInfected() * 100).toFixed(1) }}%</div>
            </div>
            <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div class="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Total Herd Immune</div>
              <div class="text-lg font-extrabold text-emerald-400 mt-0.5">{{ (finalRecovered() * 100).toFixed(1) }}%</div>
            </div>
          </div>
        </div>

        <!-- Right: Multi-Lead Patient Telemetry & Waveforms -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          
          <!-- Dataset Selector -->
          <div class="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2 font-mono">
            <div class="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <span>🩺</span>
              <span>Active Sentinel Patient Dataset:</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5 text-[11px]">
              <button (click)="selectedDataset.set('p004')"
                [class.bg-sky-600]="selectedDataset() === 'p004'"
                [class.text-white]="selectedDataset() === 'p004'"
                [class.text-zinc-400]="selectedDataset() !== 'p004'"
                class="px-2 py-1.5 font-bold rounded-lg border border-sky-500/30 transition text-left truncate cursor-pointer">
                p004 Global Sentinel
              </button>
              <button (click)="selectedDataset.set('p005')"
                [class.bg-sky-600]="selectedDataset() === 'p005'"
                [class.text-white]="selectedDataset() === 'p005'"
                [class.text-zinc-400]="selectedDataset() !== 'p005'"
                class="px-2 py-1.5 font-bold rounded-lg border border-sky-500/30 transition text-left truncate cursor-pointer">
                p005 Pediatric
              </button>
              <button (click)="selectedDataset.set('p006')"
                [class.bg-sky-600]="selectedDataset() === 'p006'"
                [class.text-white]="selectedDataset() === 'p006'"
                [class.text-zinc-400]="selectedDataset() !== 'p006'"
                class="px-2 py-1.5 font-bold rounded-lg border border-sky-500/30 transition text-left truncate cursor-pointer">
                p006 Occupational
              </button>
              <button (click)="selectedDataset.set('p007')"
                [class.bg-sky-600]="selectedDataset() === 'p007'"
                [class.text-white]="selectedDataset() === 'p007'"
                [class.text-zinc-400]="selectedDataset() !== 'p007'"
                class="px-2 py-1.5 font-bold rounded-lg border border-sky-500/30 transition text-left truncate cursor-pointer">
                p007 Asymptomatic
              </button>
            </div>
          </div>

          <!-- Real-Time Telemetry ECG Waveform Display -->
          <div class="relative w-full aspect-[16/9] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 p-3 flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs font-mono text-zinc-400 z-10">
              <span class="font-bold text-emerald-400 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                Lead II ECG Telemetry
              </span>
              <span class="text-[10px] text-zinc-500">500 Hz BLE Stream</span>
            </div>
            <canvas #ecgCanvas class="w-full h-full absolute inset-0"></canvas>
          </div>

          <!-- Export Actions -->
          <div class="p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between font-mono text-xs">
            <span class="text-zinc-400">FHIR R4 Macro-Sentinel Protocol:</span>
            <button (click)="exportFhirBundle()" 
              class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-400/30 transition flex items-center gap-1.5 cursor-pointer">
              <span>📥</span>
              <span>Export FHIR R4 Bundle</span>
            </button>
          </div>

        </div>

      </div>

    </pocket-gull-card>
  `
})
export class SentinelTelemetryPlotterComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly exportService = inject(ExportService);
  private readonly patientState = inject(PatientStateService);

  readonly sirCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('sirCanvas');
  readonly ecgCanvasRef = viewChild<ElementRef<HTMLCanvasElement>>('ecgCanvas');

  // ODE Parameters
  readonly beta = signal<number>(0.35);
  readonly gamma = signal<number>(0.10);
  readonly quarantineEfficacy = signal<number>(20);
  readonly vaccinationCoverage = signal<number>(10);
  readonly selectedDataset = signal<'p004' | 'p005' | 'p006' | 'p007'>('p004');

  // Animation frame handles
  private animationFrameId: number | null = null;
  private ecgOffset = 0;

  // Computed Reproduction R0 & Re
  readonly basicReproductionNumber = computed(() => {
    return this.beta() / Math.max(0.01, this.gamma());
  });

  readonly effectiveReproductionNumber = computed(() => {
    const effBeta = this.beta() * (1 - this.quarantineEfficacy() / 100);
    const initialS = 1 - (this.vaccinationCoverage() / 100);
    return (effBeta / Math.max(0.01, this.gamma())) * initialS;
  });

  // Computed SIR Simulation Data Points
  readonly sirDataPoints = computed<ISirPoint[]>(() => {
    const days = 100;
    const dt = 0.5; // step size
    const effBeta = this.beta() * (1 - this.quarantineEfficacy() / 100);
    const g = this.gamma();

    let s = 1 - (this.vaccinationCoverage() / 100) - 0.01;
    let i = 0.01;
    let r = this.vaccinationCoverage() / 100;

    const points: ISirPoint[] = [{ day: 0, s, i, r }];

    for (let day = 1; day <= days; day++) {
      // Euler numerical integration for ODE: dS/dt = -beta*S*I, dI/dt = beta*S*I - gamma*I, dR/dt = gamma*I
      const dS = -effBeta * s * i;
      const dI = effBeta * s * i - g * i;
      const dR = g * i;

      s = Math.max(0, Math.min(1, s + dS * dt));
      i = Math.max(0, Math.min(1, i + dI * dt));
      r = Math.max(0, Math.min(1, r + dR * dt));

      points.push({ day, s, i, r });
    }

    return points;
  });

  readonly peakDay = computed(() => {
    const points = this.sirDataPoints();
    let maxI = -1;
    let dayOfMax = 0;
    points.forEach(p => {
      if (p.i > maxI) {
        maxI = p.i;
        dayOfMax = p.day;
      }
    });
    return dayOfMax;
  });

  readonly maxInfected = computed(() => {
    const points = this.sirDataPoints();
    return Math.max(...points.map(p => p.i));
  });

  readonly finalRecovered = computed(() => {
    const points = this.sirDataPoints();
    return points[points.length - 1]?.r || 0;
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAnimationLoop();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  onBetaChange(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.beta.set(val);
  }

  onGammaChange(event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.gamma.set(val);
  }

  onQuarantineChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.quarantineEfficacy.set(val);
  }

  onVaccinationChange(event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    this.vaccinationCoverage.set(val);
  }

  exportFhirBundle() {
    const bundleJson = JSON.stringify({
      resourceType: 'Bundle',
      id: `sentinel-sir-telemetry-${Date.now()}`,
      type: 'collection',
      meta: {
        profile: ['http://pocketgull.app/fhir/StructureDefinition/macro-sentinel']
      },
      entry: [
        {
          resource: {
            resourceType: 'Observation',
            status: 'final',
            code: { text: 'Basic Reproduction Number R0' },
            valueQuantity: { value: this.basicReproductionNumber(), unit: 'R0' }
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            status: 'final',
            code: { text: 'Effective Reproduction Number Re' },
            valueQuantity: { value: this.effectiveReproductionNumber(), unit: 'Re' }
          }
        }
      ]
    }, null, 2);

    const blob = new Blob([bundleJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_R4_Sentinel_Telemetry_${this.selectedDataset()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private startAnimationLoop() {
    const render = () => {
      this.drawSirCanvas();
      this.drawEcgCanvas();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private drawSirCanvas() {
    const canvas = this.sirCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += w / 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += h / 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const points = this.sirDataPoints();
    if (points.length === 0) return;

    const padLeft = 40;
    const padBottom = 25;
    const plotW = w - padLeft - 20;
    const plotH = h - padBottom - 20;

    // Draw Susceptible S(t) (Blue)
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const px = padLeft + (idx / (points.length - 1)) * plotW;
      const py = h - padBottom - p.s * plotH;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw Recovered R(t) (Emerald)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const px = padLeft + (idx / (points.length - 1)) * plotW;
      const py = h - padBottom - p.r * plotH;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Draw Infected I(t) (Amber/Red Glow)
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((p, idx) => {
      const px = padLeft + (idx / (points.length - 1)) * plotW;
      const py = h - padBottom - p.i * plotH;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  private drawEcgCanvas() {
    const canvas = this.ecgCanvasRef()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#059669';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;

    this.ecgOffset += 2;
    if (this.ecgOffset > w) this.ecgOffset = 0;

    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = (x + this.ecgOffset) % 100;
      let y = h / 2;

      // Synthetic ECG QRS wave synthesis
      if (t > 40 && t < 45) y -= 12; // P wave
      else if (t >= 45 && t < 47) y += 8; // Q wave
      else if (t >= 47 && t < 53) y -= 45; // R peak
      else if (t >= 53 && t < 56) y += 22; // S wave
      else if (t >= 65 && t < 75) y -= 18; // T wave

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
