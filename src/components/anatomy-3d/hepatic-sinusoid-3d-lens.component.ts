import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import {
  createHepaticSinusoidMaterial,
  updateHepaticSinusoidUniforms,
  computeSinusoidalResistance,
  computeMetabolicClearanceEfficiency
} from '../../shaders/hepatic-sinusoid-space-of-disse.shader';

export type HepaticFibrosisPreset =
  | 'f0_healthy'
  | 'f1_portal_expansion'
  | 'f2_periportal_fibrosis'
  | 'f3_bridging_fibrosis'
  | 'f4_cirrhosis_varices';

export interface IHepaticTelemetry {
  fibrosisStage: number;
  stageLabel: string;
  hvpgMmHg: number;
  csphPresent: boolean;
  varicealBleedRiskPercent: number;
  fenestrationPorosityPercent: number;
  collagenDensityPercent: number;
  metabolicClearancePercent: number;
  albuminReservePercent: number;
  stellatePhenotype: 'Quiescent Retinoid Storage' | 'Intermediate Transdifferentiation' | 'Activated alpha-SMA+ Myofibroblast';
  clinicalStatus:
    | 'Pristine Sinusoidal Permeability'
    | 'Early Perisinusoidal Matrix Expansion'
    | 'Clinically Significant Portal Hypertension (CSPH)'
    | 'Decompensated Cirrhosis & Variceal Hazard';
}

@Component({
  selector: 'app-hepatic-sinusoid-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🔬</span>
              <span>3D Hepatic Sinusoid & Space of Disse Microarchitecture (Visual Model V8)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              LSEC Fenestrae (100 - 150 nm) • Stellate Cell Myofibrogenesis • Space of Disse Collagen • HVPG Portal Gradient
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button type="button" (click)="setPreset('f0_healthy')"
                  [class]="preset() === 'f0_healthy' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🟢</span>
            <span>F0 Normal</span>
          </button>
          <button type="button" (click)="setPreset('f1_portal_expansion')"
                  [class]="preset() === 'f1_portal_expansion' ? 'bg-sky-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🔵</span>
            <span>F1 Portal</span>
          </button>
          <button type="button" (click)="setPreset('f2_periportal_fibrosis')"
                  [class]="preset() === 'f2_periportal_fibrosis' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🟡</span>
            <span>F2 Periportal</span>
          </button>
          <button type="button" (click)="setPreset('f3_bridging_fibrosis')"
                  [class]="preset() === 'f3_bridging_fibrosis' ? 'bg-orange-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🟠</span>
            <span>F3 Bridging (CSPH)</span>
          </button>
          <button type="button" (click)="setPreset('f4_cirrhosis_varices')"
                  [class]="preset() === 'f4_cirrhosis_varices' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🚨</span>
            <span>F4 Cirrhosis (Varices)</span>
          </button>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Playback & View Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition cursor-pointer">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="toggleSpeed()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            {{ flowSpeed() }}x Speed
          </button>
          <button (click)="resetCamera()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            🎯 Reset Camera
          </button>
        </div>

        <!-- Floating Hepatic Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-amber-400">Sinusoidal Hemodynamics</span>
            <span class="text-[10px] font-mono text-zinc-400">METAVIR: {{ telemetry().stageLabel }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <!-- HVPG -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">HVPG Gradient</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().hvpgMmHg >= 12.0 ? 'text-red-400' : (telemetry().hvpgMmHg >= 10.0 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().hvpgMmHg }} mmHg
              </span>
            </div>

            <!-- Bleed Risk -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Variceal Bleed Hazard</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().varicealBleedRiskPercent > 30 ? 'text-red-400' : (telemetry().varicealBleedRiskPercent > 10 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().varicealBleedRiskPercent }}%
              </span>
            </div>

            <!-- Porosity -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Sieve Porosity</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().fenestrationPorosityPercent < 30 ? 'text-red-400' : (telemetry().fenestrationPorosityPercent < 70 ? 'text-amber-400' : 'text-cyan-400')">
                {{ telemetry().fenestrationPorosityPercent }}%
              </span>
            </div>

            <!-- Metabolic Clearance -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Metabolic Clearance</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().metabolicClearancePercent < 40 ? 'text-red-400' : 'text-emerald-400'">
                {{ telemetry().metabolicClearancePercent }}%
              </span>
            </div>
          </div>

          <!-- Stellate & Albumin Reserve Row -->
          <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60 flex items-center justify-between text-[10px]">
            <div>
              <span class="text-zinc-400 block">Albumin Reserve:</span>
              <strong class="text-amber-300 font-bold">{{ telemetry().albuminReservePercent }}%</strong>
            </div>
            <div class="text-right">
              <span class="text-zinc-400 block">Portal Status:</span>
              <strong class="text-zinc-200 font-bold">{{ telemetry().csphPresent ? 'CSPH Active' : 'Normal Gradient' }}</strong>
            </div>
          </div>

          <!-- Diagnostic Clinical Status -->
          <div class="p-2 rounded-lg text-[10px] font-bold border"
               [ngClass]="{
                 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40': telemetry().clinicalStatus === 'Pristine Sinusoidal Permeability',
                 'bg-sky-950/40 text-sky-300 border-sky-800/40': telemetry().clinicalStatus === 'Early Perisinusoidal Matrix Expansion',
                 'bg-amber-950/40 text-amber-300 border-amber-800/40': telemetry().clinicalStatus === 'Clinically Significant Portal Hypertension (CSPH)',
                 'bg-rose-950/40 text-rose-300 border-rose-800/40': telemetry().clinicalStatus === 'Decompensated Cirrhosis & Variceal Hazard'
               }">
            {{ telemetry().clinicalStatus }}
          </div>
        </div>

        <!-- 3D Spatial Anatomical Legend (Bottom Left) -->
        <div class="absolute bottom-3 left-3 z-30 hidden sm:flex items-center gap-3 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px]">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span class="text-zinc-300">Sinusoidal RBC Stream</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span class="text-zinc-300">Kupffer Macrophage</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span class="text-zinc-300">Space of Disse Fibrillar Collagen</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
            <span class="text-zinc-300">Hepatocyte Cord</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Interactive Parameter Sliders Deck -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <!-- Fibrosis Stage Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">METAVIR Fibrosis Stage</span>
            <span class="text-amber-400 font-mono font-bold">Stage F{{ fibrosisStage() }}</span>
          </div>
          <input type="range" min="0" max="4" step="1" [value]="fibrosisStage()" (input)="onFibrosisChange($event)"
                 class="w-full accent-amber-400 cursor-pointer" />
        </div>

        <!-- Collagen Density Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Disse Collagen Scarring</span>
            <span class="text-amber-400 font-mono font-bold">{{ Math.round(collagenDensity() * 100) }}%</span>
          </div>
          <input type="range" min="0.0" max="1.0" step="0.05" [value]="collagenDensity()" (input)="onCollagenChange($event)"
                 class="w-full accent-amber-400 cursor-pointer" />
        </div>

        <!-- Sieve Porosity Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">LSEC Sieve Plate Porosity</span>
            <span class="text-amber-400 font-mono font-bold">{{ Math.round(fenestrationPorosity() * 100) }}%</span>
          </div>
          <input type="range" min="0.05" max="1.0" step="0.05" [value]="fenestrationPorosity()" (input)="onPorosityChange($event)"
                 class="w-full accent-amber-400 cursor-pointer" />
        </div>

        <!-- Stellate Cell Activation Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px]">
            <span class="text-zinc-400 font-bold uppercase">Stellate Myofibroblast Tone</span>
            <span class="text-amber-400 font-mono font-bold">{{ Math.round(stellateActivation() * 100) }}%</span>
          </div>
          <input type="range" min="0.0" max="1.0" step="0.05" [value]="stellateActivation()" (input)="onStellateChange($event)"
                 class="w-full accent-amber-400 cursor-pointer" />
        </div>
      </div>
    </div>
  `
})
export class HepaticSinusoid3dLensComponent implements AfterViewInit, OnDestroy {
  private patientState = inject(PatientStateService);
  protected readonly Math = Math;

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  // Interactive Signals
  readonly preset = signal<HepaticFibrosisPreset>('f0_healthy');
  readonly isPlaying = signal<boolean>(true);
  readonly flowSpeed = signal<number>(1.0);

  readonly fibrosisStage = signal<number>(0);
  readonly fenestrationPorosity = signal<number>(1.0);
  readonly collagenDensity = signal<number>(0.0);
  readonly stellateActivation = signal<number>(0.0);
  readonly hvpgMmHg = signal<number>(3.0);

  // Three.js Runtime References
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private sinusoidMesh?: THREE.Mesh;
  private outerCordMesh?: THREE.Mesh;
  private hepaticMaterial?: THREE.ShaderMaterial;
  private animFrameId?: number;
  private startTime = typeof performance !== 'undefined' ? performance.now() : 0;
  private getElapsedTime(): number {
    return ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - this.startTime) / 1000;
  }

  // Telemetry Computed Engine
  readonly telemetry = computed<IHepaticTelemetry>(() => {
    const stage = this.fibrosisStage();
    const collagen = this.collagenDensity();
    const porosity = this.fenestrationPorosity();
    const stellate = this.stellateActivation();

    const resistance = computeSinusoidalResistance(stage, collagen);
    const clearance = computeMetabolicClearanceEfficiency(porosity, collagen);

    let stageLabel = `F${stage}`;
    if (stage === 0) stageLabel = 'F0 (No Fibrosis)';
    else if (stage === 1) stageLabel = 'F1 (Portal Expansion)';
    else if (stage === 2) stageLabel = 'F2 (Periportal Bridging)';
    else if (stage === 3) stageLabel = 'F3 (Septal Bridging)';
    else if (stage === 4) stageLabel = 'F4 (Cirrhosis)';

    let stellatePhenotype: IHepaticTelemetry['stellatePhenotype'] = 'Quiescent Retinoid Storage';
    if (stellate > 0.65) stellatePhenotype = 'Activated alpha-SMA+ Myofibroblast';
    else if (stellate > 0.25) stellatePhenotype = 'Intermediate Transdifferentiation';

    let clinicalStatus: IHepaticTelemetry['clinicalStatus'] = 'Pristine Sinusoidal Permeability';
    if (resistance.hvpgMmHg >= 12.0 || stage === 4) {
      clinicalStatus = 'Decompensated Cirrhosis & Variceal Hazard';
    } else if (resistance.csphPresent || stage === 3) {
      clinicalStatus = 'Clinically Significant Portal Hypertension (CSPH)';
    } else if (stage >= 1 || collagen > 0.15) {
      clinicalStatus = 'Early Perisinusoidal Matrix Expansion';
    }

    return {
      fibrosisStage: stage,
      stageLabel,
      hvpgMmHg: resistance.hvpgMmHg,
      csphPresent: resistance.csphPresent,
      varicealBleedRiskPercent: resistance.varicealBleedRiskPercent,
      fenestrationPorosityPercent: Math.round(porosity * 100),
      collagenDensityPercent: Math.round(collagen * 100),
      metabolicClearancePercent: clearance.clearanceRatePercent,
      albuminReservePercent: clearance.albuminSecretoryReservePercent,
      stellatePhenotype,
      clinicalStatus
    };
  });

  ngAfterViewInit(): void {
    this.initThreeScene();
    this.setPreset('f0_healthy');
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

  public setPreset(preset: HepaticFibrosisPreset): void {
    this.preset.set(preset);

    switch (preset) {
      case 'f0_healthy':
        this.fibrosisStage.set(0);
        this.fenestrationPorosity.set(1.0);
        this.collagenDensity.set(0.0);
        this.stellateActivation.set(0.0);
        this.hvpgMmHg.set(3.0);
        break;

      case 'f1_portal_expansion':
        this.fibrosisStage.set(1);
        this.fenestrationPorosity.set(0.85);
        this.collagenDensity.set(0.15);
        this.stellateActivation.set(0.20);
        this.hvpgMmHg.set(4.5);
        break;

      case 'f2_periportal_fibrosis':
        this.fibrosisStage.set(2);
        this.fenestrationPorosity.set(0.60);
        this.collagenDensity.set(0.35);
        this.stellateActivation.set(0.50);
        this.hvpgMmHg.set(7.2);
        break;

      case 'f3_bridging_fibrosis':
        this.fibrosisStage.set(3);
        this.fenestrationPorosity.set(0.35);
        this.collagenDensity.set(0.50);
        this.stellateActivation.set(0.80);
        this.hvpgMmHg.set(10.9);
        break;

      case 'f4_cirrhosis_varices':
        this.fibrosisStage.set(4);
        this.fenestrationPorosity.set(0.10);
        this.collagenDensity.set(0.90);
        this.stellateActivation.set(1.0);
        this.hvpgMmHg.set(18.5);
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
      this.camera.position.set(0, 2.4, 4.6);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  public onFibrosisChange(e: Event): void {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    this.fibrosisStage.set(val);
    const res = computeSinusoidalResistance(val, this.collagenDensity());
    this.hvpgMmHg.set(res.hvpgMmHg);
    this.syncUniforms();
  }

  public onCollagenChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.collagenDensity.set(val);
    const res = computeSinusoidalResistance(this.fibrosisStage(), val);
    this.hvpgMmHg.set(res.hvpgMmHg);
    this.syncUniforms();
  }

  public onPorosityChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.fenestrationPorosity.set(val);
    this.syncUniforms();
  }

  public onStellateChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.stellateActivation.set(val);
    this.syncUniforms();
  }

  private syncUniforms(): void {
    if (this.hepaticMaterial) {
      updateHepaticSinusoidUniforms(this.hepaticMaterial, {
        fibrosisStage: this.fibrosisStage(),
        fenestrationPorosity: this.fenestrationPorosity(),
        collagenDensity: this.collagenDensity(),
        stellateActivationRatio: this.stellateActivation(),
        hvpgMmHg: this.hvpgMmHg(),
        sinusoidalFlowVelocity: this.flowSpeed()
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
      this.camera.position.set(0, 2.4, 4.6);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.75);
      this.scene.add(ambient);

      const dir = new THREE.DirectionalLight(0xfef08a, 1.2);
      dir.position.set(3, 4, 5);
      this.scene.add(dir);

      // Sinusoid Cylinder Geometry
      const sinusoidGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 48, 32, true);
      this.hepaticMaterial = createHepaticSinusoidMaterial({
        fibrosisStage: this.fibrosisStage(),
        fenestrationPorosity: this.fenestrationPorosity(),
        collagenDensity: this.collagenDensity(),
        stellateActivationRatio: this.stellateActivation(),
        hvpgMmHg: this.hvpgMmHg(),
        sinusoidalFlowVelocity: this.flowSpeed()
      });

      this.sinusoidMesh = new THREE.Mesh(sinusoidGeo, this.hepaticMaterial);
      this.scene.add(this.sinusoidMesh);

      // Outer Hepatocyte Plate Support Rings
      const ringGeo = new THREE.TorusGeometry(1.45, 0.08, 16, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.6,
        metalness: 0.1
      });
      this.outerCordMesh = new THREE.Mesh(ringGeo, ringMat);
      this.scene.add(this.outerCordMesh);

      this.animate();
    } catch (e) {
      console.warn('[HepaticSinusoid3dLens] Three.js WebGL context fallback:', e);
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.isPlaying()) {
      const elapsed = this.getElapsedTime();
      if (this.hepaticMaterial) {
        updateHepaticSinusoidUniforms(this.hepaticMaterial, {
          sinusoidalFlowVelocity: this.flowSpeed()
        }, elapsed);
      }

      if (this.sinusoidMesh) {
        this.sinusoidMesh.rotation.y = elapsed * 0.10 * this.flowSpeed();
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
