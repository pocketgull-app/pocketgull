import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import {
  createAlveolarCapillaryMaterial,
  updateAlveolarCapillaryUniforms,
  computeFicksDiffusionRate,
  computeHpvResponse,
  computePeepRecruitment
} from '../../shaders/alveolar-capillary-gas-exchange.shader';

export type AlveolarRegimeMode =
  | 'healthy_homeostasis'
  | 'hypoxic_euler_liljestrand'
  | 'early_ards_exudative'
  | 'severe_ards_alveolar_flooding';

export interface IAlveolarTelemetry {
  diffusionFluxMlMin: number;
  membraneThicknessUm: number;
  shuntFractionPercent: number;
  vqRatio: number;
  hpvConstrictionPercent: number;
  alveolarRecruitmentPercent: number;
  staticComplianceMlCmH2O: number;
  peepCmH2O: number;
  isOverdistended: boolean;
  clinicalStatus:
    | 'Pristine Gas Exchange'
    | 'Compensated Euler-Liljestrand Shunt'
    | 'Moderate ARDS Microvascular Leak'
    | 'Severe Consolidation & Refractory Shunt';
}

@Component({
  selector: 'app-alveolar-capillary-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🫁</span>
              <span>3D Alveolar-Capillary Gas Exchange & Blood-Air Barrier (Visual Model V7)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Fick's Diffusion (0.2 - 0.5 um) • Euler-Liljestrand HPV V/Q Shunt • ARDS Alveolar Flooding • PEEP Recruitment Hysteresis
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-xs">
          <button type="button" (click)="setRegime('healthy_homeostasis')"
                  [class]="regime() === 'healthy_homeostasis' ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'"
                  class="min-h-[44px] px-3.5 py-2 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5 touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            <span>🟢</span>
            <span>Healthy (0.35 um)</span>
          </button>
          <button type="button" (click)="setRegime('hypoxic_euler_liljestrand')"
                  [class]="regime() === 'hypoxic_euler_liljestrand' ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-950/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'"
                  class="min-h-[44px] px-3.5 py-2 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5 touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            <span>⚡</span>
            <span>Euler-Liljestrand HPV</span>
          </button>
          <button type="button" (click)="setRegime('early_ards_exudative')"
                  [class]="regime() === 'early_ards_exudative' ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'"
                  class="min-h-[44px] px-3.5 py-2 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5 touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            <span>⚠️</span>
            <span>Early ARDS (1.2 um)</span>
          </button>
          <button type="button" (click)="setRegime('severe_ards_alveolar_flooding')"
                  [class]="regime() === 'severe_ards_alveolar_flooding' ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-950/50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'"
                  class="min-h-[44px] px-3.5 py-2 rounded-xl transition cursor-pointer text-xs flex items-center justify-center gap-1.5 touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none">
            <span>🚨</span>
            <span>Severe Flooding & Shunt</span>
          </button>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Playback & View Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 text-xs shadow-xl">
          <button (click)="togglePlay()" type="button"
                  aria-label="Toggle 3D simulation animation playback"
                  class="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold hover:bg-cyan-500/30 transition cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none flex items-center justify-center gap-1.5">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="toggleSpeed()" type="button"
                  aria-label="Toggle simulation flow speed multiplier"
                  class="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none flex items-center justify-center gap-1">
            <span class="tabular-nums">{{ flowSpeed() }}</span>x Speed
          </button>
          <button (click)="resetCamera()" type="button"
                  aria-label="Reset 3D camera to default viewpoint"
                  class="min-h-[44px] px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none flex items-center justify-center gap-1.5">
            🎯 Reset Camera
          </button>
        </div>

        <!-- Floating Alveolar Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-cyan-400">Diffusion & Shunt Telemetry</span>
            <span class="text-[10px] font-mono tabular-nums text-zinc-400">PEEP: {{ telemetry().peepCmH2O }} cmH2O</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <!-- Diffusion Flux -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">O2 Diffusion Flux</span>
              <span class="text-sm font-black font-mono tabular-nums"
                    [ngClass]="telemetry().diffusionFluxMlMin < 150 ? 'text-red-400' : (telemetry().diffusionFluxMlMin < 220 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().diffusionFluxMlMin }} mL/min
              </span>
            </div>

            <!-- Membrane Thickness -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Membrane (T)</span>
              <span class="text-sm font-black font-mono tabular-nums"
                    [ngClass]="telemetry().membraneThicknessUm > 1.0 ? 'text-red-400' : (telemetry().membraneThicknessUm > 0.5 ? 'text-amber-400' : 'text-cyan-400')">
                {{ telemetry().membraneThicknessUm }} um
              </span>
            </div>

            <!-- Shunt Fraction -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Shunt (Qs/Qt)</span>
              <span class="text-sm font-black font-mono tabular-nums"
                    [ngClass]="telemetry().shuntFractionPercent > 20 ? 'text-red-400' : (telemetry().shuntFractionPercent > 10 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().shuntFractionPercent }}%
              </span>
            </div>

            <!-- V/Q Ratio -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">V/Q Ratio</span>
              <span class="text-sm font-black font-mono tabular-nums"
                    [ngClass]="telemetry().vqRatio < 0.5 ? 'text-red-400' : (telemetry().vqRatio < 0.7 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().vqRatio }}
              </span>
            </div>
          </div>

          <!-- Static Compliance & Recruitment -->
          <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60 flex items-center justify-between text-[10px]">
            <div>
              <span class="text-zinc-400 block">Recruitment:</span>
              <strong class="text-cyan-300 font-bold font-mono tabular-nums">{{ telemetry().alveolarRecruitmentPercent }}% Open</strong>
            </div>
            <div class="text-right">
              <span class="text-zinc-400 block">Compliance:</span>
              <strong class="text-zinc-200 font-bold font-mono tabular-nums">{{ telemetry().staticComplianceMlCmH2O }} mL/cmH2O</strong>
            </div>
          </div>

          <!-- Clinical Diagnostic Status -->
          <div class="p-2 rounded-lg text-[10px] font-bold border"
               [ngClass]="{
                 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40': telemetry().clinicalStatus === 'Pristine Gas Exchange',
                 'bg-sky-950/40 text-sky-300 border-sky-800/40': telemetry().clinicalStatus === 'Compensated Euler-Liljestrand Shunt',
                 'bg-amber-950/40 text-amber-300 border-amber-800/40': telemetry().clinicalStatus === 'Moderate ARDS Microvascular Leak',
                 'bg-rose-950/40 text-rose-300 border-rose-800/40': telemetry().clinicalStatus === 'Severe Consolidation & Refractory Shunt'
               }">
            {{ telemetry().clinicalStatus }}
          </div>
        </div>

        <!-- 3D Spatial Anatomical Legend (Bottom Left) -->
        <div class="absolute bottom-3 left-3 z-30 hidden sm:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span class="text-zinc-300">Alveolar Gas Space</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span class="text-zinc-300">0.35 um Basement Membrane</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span class="text-zinc-300">Capillary RBC Transit</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span class="text-zinc-300">Hyaline Exudate</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Interactive Parameter Sliders Deck -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <!-- PaO2 Slider -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[11px]">
            <label for="alveolar-pao2-slider" class="text-zinc-400 font-bold uppercase cursor-pointer">Alveolar P_A_O2</label>
            <span class="text-cyan-400 font-mono tabular-nums font-bold">{{ paO2() }} mmHg</span>
          </div>
          <div class="min-h-[44px] flex items-center">
            <input id="alveolar-pao2-slider" type="range" min="30" max="140" step="1" [value]="paO2()" (input)="onPaO2Change($event)"
                   aria-label="Alveolar PAO2 partial pressure in millimeters of mercury"
                   class="w-full accent-cyan-400 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none" />
          </div>
        </div>

        <!-- Membrane Thickness Slider -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[11px]">
            <label for="alveolar-thickness-slider" class="text-zinc-400 font-bold uppercase cursor-pointer">Membrane Thickness (T)</label>
            <span class="text-cyan-400 font-mono tabular-nums font-bold">{{ thickness() }} um</span>
          </div>
          <div class="min-h-[44px] flex items-center">
            <input id="alveolar-thickness-slider" type="range" min="0.2" max="2.8" step="0.05" [value]="thickness()" (input)="onThicknessChange($event)"
                   aria-label="Blood-air basement membrane thickness in micrometers"
                   class="w-full accent-cyan-400 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none" />
          </div>
        </div>

        <!-- PEEP Slider -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[11px]">
            <label for="alveolar-peep-slider" class="text-zinc-400 font-bold uppercase cursor-pointer">PEEP Recruitment</label>
            <span class="text-cyan-400 font-mono tabular-nums font-bold">{{ peep() }} cmH2O</span>
          </div>
          <div class="min-h-[44px] flex items-center">
            <input id="alveolar-peep-slider" type="range" min="0" max="24" step="1" [value]="peep()" (input)="onPeepChange($event)"
                   aria-label="Positive end-expiratory pressure recruitment in centimeters of water"
                   class="w-full accent-cyan-400 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none" />
          </div>
        </div>

        <!-- Alveolar Flooding Slider -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-[11px]">
            <label for="alveolar-flooding-slider" class="text-zinc-400 font-bold uppercase cursor-pointer">ARDS Alveolar Flooding</label>
            <span class="text-cyan-400 font-mono tabular-nums font-bold">{{ Math.round(flooding() * 100) }}%</span>
          </div>
          <div class="min-h-[44px] flex items-center">
            <input id="alveolar-flooding-slider" type="range" min="0.0" max="1.0" step="0.05" [value]="flooding()" (input)="onFloodingChange($event)"
                   aria-label="ARDS alveolar exudative flooding fraction"
                   class="w-full accent-cyan-400 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none" />
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlveolarCapillary3dLensComponent implements AfterViewInit, OnDestroy {
  private patientState = inject(PatientStateService);
  protected readonly Math = Math;

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  // Interactive Signals
  readonly regime = signal<AlveolarRegimeMode>('healthy_homeostasis');
  readonly isPlaying = signal<boolean>(true);
  readonly flowSpeed = signal<number>(1.0);

  readonly paO2 = signal<number>(100);
  readonly pvO2 = signal<number>(40);
  readonly thickness = signal<number>(0.35);
  readonly hpvConstriction = signal<number>(0.0);
  readonly surfactantDepletion = signal<number>(0.0);
  readonly flooding = signal<number>(0.0);
  readonly peep = signal<number>(5);
  readonly respiratoryRate = signal<number>(14);

  // Three.js Runtime References
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private alveolarMesh?: THREE.Mesh;
  private capillaryRing?: THREE.Mesh;
  private alveolarMaterial?: THREE.ShaderMaterial;
  private animFrameId?: number;
  private startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  private getElapsedTime(): number {
    return ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - this.startTime) / 1000;
  }

  // Telemetry Computed Engine
  readonly telemetry = computed<IAlveolarTelemetry>(() => {
    const pa = this.paO2();
    const pv = this.pvO2();
    const t = this.thickness();
    const peepVal = this.peep();
    const surf = this.surfactantDepletion();
    const flood = this.flooding();

    const flux = computeFicksDiffusionRate(pa, pv, t);
    const hpv = computeHpvResponse(pa);
    const recruitment = computePeepRecruitment(peepVal, surf, flood);

    // In ARDS, flooded non-ventilated alveoli create true pathological right-to-left shunt
    const pathologicalShunt = Math.min(0.60, hpv.shuntFraction + flood * 0.40);

    let clinicalStatus: IAlveolarTelemetry['clinicalStatus'] = 'Pristine Gas Exchange';
    if (flood > 0.6 || t > 1.8) {
      clinicalStatus = 'Severe Consolidation & Refractory Shunt';
    } else if (flood > 0.2 || t > 0.8) {
      clinicalStatus = 'Moderate ARDS Microvascular Leak';
    } else if (pa < 65 || hpv.constrictionRatio > 0.4) {
      clinicalStatus = 'Compensated Euler-Liljestrand Shunt';
    }

    return {
      diffusionFluxMlMin: flux,
      membraneThicknessUm: t,
      shuntFractionPercent: Math.round(pathologicalShunt * 100),
      vqRatio: hpv.vqRatio,
      hpvConstrictionPercent: Math.round(hpv.constrictionRatio * 100),
      alveolarRecruitmentPercent: recruitment.openAlveoliPercent,
      staticComplianceMlCmH2O: recruitment.complianceMlCmH2O,
      peepCmH2O: peepVal,
      isOverdistended: recruitment.overdistended,
      clinicalStatus
    };
  });

  ngAfterViewInit(): void {
    this.initThreeScene();
    this.setRegime('healthy_homeostasis');
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  public setRegime(mode: AlveolarRegimeMode): void {
    this.regime.set(mode);

    switch (mode) {
      case 'healthy_homeostasis':
        this.paO2.set(100);
        this.pvO2.set(40);
        this.thickness.set(0.35);
        this.hpvConstriction.set(0.0);
        this.surfactantDepletion.set(0.0);
        this.flooding.set(0.0);
        this.peep.set(5);
        this.respiratoryRate.set(14);
        break;

      case 'hypoxic_euler_liljestrand':
        this.paO2.set(48);
        this.pvO2.set(36);
        this.thickness.set(0.40);
        this.hpvConstriction.set(0.68);
        this.surfactantDepletion.set(0.15);
        this.flooding.set(0.05);
        this.peep.set(6);
        this.respiratoryRate.set(20);
        break;

      case 'early_ards_exudative':
        this.paO2.set(65);
        this.pvO2.set(35);
        this.thickness.set(1.20);
        this.hpvConstriction.set(0.30);
        this.surfactantDepletion.set(0.55);
        this.flooding.set(0.35);
        this.peep.set(8);
        this.respiratoryRate.set(24);
        break;

      case 'severe_ards_alveolar_flooding':
        this.paO2.set(45);
        this.pvO2.set(30);
        this.thickness.set(2.40);
        this.hpvConstriction.set(0.80);
        this.surfactantDepletion.set(0.90);
        this.flooding.set(0.85);
        this.peep.set(14);
        this.respiratoryRate.set(28);
        break;
    }

    this.syncUniforms();
  }

  public togglePlay(): void {
    this.isPlaying.update(p => !p);
  }

  public toggleSpeed(): void {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(this.flowSpeed()) + 1) % speeds.length;
    this.flowSpeed.set(speeds[nextIdx]);
  }

  public resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.5, 4.8);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  public onPaO2Change(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.paO2.set(val);
    const hpv = computeHpvResponse(val);
    this.hpvConstriction.set(hpv.constrictionRatio);
    this.syncUniforms();
  }

  public onThicknessChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.thickness.set(val);
    this.syncUniforms();
  }

  public onPeepChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.peep.set(val);
    this.syncUniforms();
  }

  public onFloodingChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.flooding.set(val);
    this.syncUniforms();
  }

  private syncUniforms(): void {
    if (this.alveolarMaterial) {
      updateAlveolarCapillaryUniforms(this.alveolarMaterial, {
        alveolarPaO2: this.paO2(),
        venousPvO2: this.pvO2(),
        membraneThicknessUm: this.thickness(),
        hpvVasoconstriction: this.hpvConstriction(),
        surfactantDepletion: this.surfactantDepletion(),
        alveolarFloodingRatio: this.flooding(),
        peepCmH2O: this.peep(),
        respiratoryRateBpm: this.respiratoryRate(),
        flowVelocity: this.flowSpeed()
      }, this.getElapsedTime());
    }
  }

  private initThreeScene(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 450;
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 2.5, 4.8);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xa5f3fc, 1.2);
      dirLight.position.set(3, 5, 4);
      this.scene.add(dirLight);

      // Procedural Alveolar Sac Geometry
      const alveolarGeo = new THREE.SphereGeometry(1.6, 64, 48);
      this.alveolarMaterial = createAlveolarCapillaryMaterial({
        alveolarPaO2: this.paO2(),
        venousPvO2: this.pvO2(),
        membraneThicknessUm: this.thickness(),
        hpvVasoconstriction: this.hpvConstriction(),
        surfactantDepletion: this.surfactantDepletion(),
        alveolarFloodingRatio: this.flooding(),
        peepCmH2O: this.peep(),
        respiratoryRateBpm: this.respiratoryRate(),
        flowVelocity: this.flowSpeed()
      });

      this.alveolarMesh = new THREE.Mesh(alveolarGeo, this.alveolarMaterial);
      this.scene.add(this.alveolarMesh);

      // Microvascular Capillary Loop Ring encircling the alveolar dome
      const capillaryGeo = new THREE.TorusGeometry(1.65, 0.15, 24, 64);
      capillaryGeo.rotateX(Math.PI / 2);
      const capillaryMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      this.capillaryRing = new THREE.Mesh(capillaryGeo, capillaryMat);
      this.scene.add(this.capillaryRing);

      this.animate();
    } catch (e) {
      console.warn('[AlveolarCapillary3dLens] Three.js WebGL context fallback:', e);
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.isPlaying()) {
      const elapsed = this.getElapsedTime();
      if (this.alveolarMaterial) {
        updateAlveolarCapillaryUniforms(this.alveolarMaterial, {
          flowVelocity: this.flowSpeed(),
          respiratoryRateBpm: this.respiratoryRate()
        }, elapsed);
      }

      if (this.alveolarMesh) {
        this.alveolarMesh.rotation.y = elapsed * 0.08 * this.flowSpeed();
      }
      if (this.capillaryRing) {
        this.capillaryRing.rotation.z = elapsed * 0.05 * this.flowSpeed();
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
