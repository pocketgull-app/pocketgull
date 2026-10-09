import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';

export type GlymphaticSleepState = 'awake' | 'light_nrem' | 'deep_sws' | 'sleep_fragmentation';

export interface IGlymphaticTelemetry {
  interstitialSpaceExpansionPct: number; // 0% (awake) to +60% (deep SWS)
  aqp4PolarizationIndexPct: number;      // 0 - 100%
  convectiveFluxVelocityUmS: number;     // 0.8 - 5.0 um/s
  amyloidClearanceRatePctHr: number;     // % per hour
  deepCervicalLymphFlowMlDay: number;    // mL/day (normal ~150-250)
  activeStateLabel: string;
  clinicalTakeaway: string;
}

@Component({
  selector: 'app-glymphatic-brain-3d-lens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🧠</span>
              <span>3D Glymphatic Flow &amp; Periarterial AQP4 Convection Lens (Model V10)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Astrocytic Aquaporin-4 (AQP4) Water Channels &bull; Virchow-Robin Periarterial CSF Influx &bull; Slow-Wave Sleep Amyloid-&beta; Flush
            </p>
          </div>
        </div>

        <!-- Master Sleep State Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-cyan-950/80 border-cyan-500/60 text-cyan-300': sleepState() === 'deep_sws',
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': sleepState() === 'light_nrem',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': sleepState() === 'awake',
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': sleepState() === 'sleep_fragmentation'
                }">
            {{ telemetry().activeStateLabel }}
          </span>
        </div>
      </div>

      <!-- Presets & Sleep Architecture Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Sleep Architecture:</span>
          
          <button type="button" (click)="setSleepState('deep_sws')"
                  [class.bg-cyan-500]="sleepState() === 'deep_sws'"
                  [class.text-zinc-950]="sleepState() === 'deep_sws'"
                  [class.font-black]="sleepState() === 'deep_sws'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-cyan-950 hover:text-cyan-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🌙</span>
            <span>Deep Slow-Wave Sleep (N3)</span>
          </button>

          <button type="button" (click)="setSleepState('light_nrem')"
                  [class.bg-emerald-500]="sleepState() === 'light_nrem'"
                  [class.text-zinc-950]="sleepState() === 'light_nrem'"
                  [class.font-black]="sleepState() === 'light_nrem'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-emerald-950 hover:text-emerald-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🌖</span>
            <span>Light NREM (Stage N1/N2)</span>
          </button>

          <button type="button" (click)="setSleepState('awake')"
                  [class.bg-amber-500]="sleepState() === 'awake'"
                  [class.text-zinc-950]="sleepState() === 'awake'"
                  [class.font-black]="sleepState() === 'awake'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-amber-950 hover:text-amber-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>☀️</span>
            <span>Awake State (Base)</span>
          </button>

          <button type="button" (click)="setSleepState('sleep_fragmentation')"
                  [class.bg-rose-600]="sleepState() === 'sleep_fragmentation'"
                  [class.text-white]="sleepState() === 'sleep_fragmentation'"
                  [class.font-black]="sleepState() === 'sleep_fragmentation'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-rose-950 hover:text-rose-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>⚡</span>
            <span>Fragmented Sleep / OSA</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
            <input type="checkbox" [checked]="showDebrisParticles()" (change)="toggleDebris()" class="accent-amber-500">
            <span>Show A&beta; / Tau Aggregates</span>
          </label>
        </div>
      </div>

      <!-- Main 3D WebGL Canvas Viewport -->
      <div class="relative w-full h-[460px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
        <canvas #canvasRef class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>

        <!-- Dynamic Floating Telemetry Overlay (Top Right) -->
        <div class="absolute top-3 right-3 p-3 bg-zinc-950/85 backdrop-blur-md rounded-2xl border border-zinc-800 text-xs space-y-2 pointer-events-none shadow-xl max-w-[240px]">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Interstitial Expansion:</span>
            <span class="font-extrabold text-cyan-300">+{{ telemetry().interstitialSpaceExpansionPct }}%</span>
          </div>
          <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div class="bg-cyan-400 h-full transition-all duration-700"
                 [style.width.%]="(telemetry().interstitialSpaceExpansionPct / 60) * 100">
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">AQP4 Water Polarization:</span>
            <span class="font-extrabold text-emerald-400">{{ telemetry().aqp4PolarizationIndexPct }}%</span>
          </div>

          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">Convective Flush Flux:</span>
            <span class="font-extrabold text-cyan-300">{{ telemetry().convectiveFluxVelocityUmS }} &mu;m/s</span>
          </div>

          <div class="flex items-center justify-between text-[11px]">
            <span class="text-zinc-400">A&beta; Clearance Rate:</span>
            <span class="font-extrabold text-amber-300">{{ telemetry().amyloidClearanceRatePctHr }}%/hr</span>
          </div>
        </div>

        <!-- 3D Legend (Bottom Left) -->
        <div class="absolute bottom-3 left-3 p-2.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[10.5px] space-y-1 pointer-events-none shadow-lg">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>
            <span class="text-zinc-300">Penetrating Cortical Arteries (Pulsatile Influx)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
            <span class="text-zinc-300">Virchow-Robin Periarterial Space (CSF Flow)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
            <span class="text-zinc-300">Astrocytic End-Feet &amp; AQP4 Water Channels</span>
          </div>
          @if (showDebrisParticles()) {
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></span>
              <span class="text-zinc-300">Amyloid-&beta; &amp; Phospho-Tau Oligomers (Waste Flush)</span>
            </div>
          }
        </div>
      </div>

      <!-- Telemetry Dials & Biophysical Metrics (4-Column Grid) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-950 border-t border-zinc-800">
        
        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Convective Velocity</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-cyan-300">{{ telemetry().convectiveFluxVelocityUmS }}</span>
            <span class="text-[10px] text-zinc-400">&mu;m/s</span>
          </div>
          <span class="text-[10.5px] font-bold text-cyan-400">
            {{ telemetry().convectiveFluxVelocityUmS >= 4.0 ? 'Peak Convective Flush' : (telemetry().convectiveFluxVelocityUmS >= 2.0 ? 'Moderate Convection' : 'Basal Diffusion') }}
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AQP4 Polarization</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-emerald-400">{{ telemetry().aqp4PolarizationIndexPct }}</span>
            <span class="text-[10px] text-zinc-400">%</span>
          </div>
          <span class="text-[10.5px] text-zinc-400">
            Astrocytic Water Pore Gating
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">A&beta; Elimination</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-amber-300">{{ telemetry().amyloidClearanceRatePctHr }}</span>
            <span class="text-[10px] text-zinc-400">%/hr</span>
          </div>
          <span class="text-[10.5px] text-amber-400">
            {{ telemetry().amyloidClearanceRatePctHr >= 15 ? 'Rapid Neurotoxin Washout' : 'Stagnant Aggregation' }}
          </span>
        </div>

        <div class="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Cervical Lymph Flow</span>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-xl font-black text-indigo-300">{{ telemetry().deepCervicalLymphFlowMlDay }}</span>
            <span class="text-[10px] text-zinc-400">mL/day</span>
          </div>
          <span class="text-[10.5px] text-zinc-400">
            Deep Cervical Node Ingress
          </span>
        </div>

      </div>

      <!-- Clinical Takeaway Box -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 text-xs leading-relaxed space-y-1">
        <h4 class="text-[10.5px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <span>💡</span>
          <span>Neuro-Ergonomic &amp; Chronobiology Insights</span>
        </h4>
        <p class="text-zinc-200 font-sans leading-relaxed">
          {{ telemetry().clinicalTakeaway }}
        </p>
      </div>

    </div>
  `
})
export class GlymphaticBrain3dLensComponent implements AfterViewInit, OnDestroy {
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvasRef');
  private readonly platformId = inject(PLATFORM_ID);
  readonly patientState = inject(PatientStateService);

  readonly sleepState = signal<GlymphaticSleepState>('deep_sws');
  readonly showDebrisParticles = signal<boolean>(true);

  // 3D Scene Properties
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animationFrameId: number | null = null;

  // 3D Objects
  private brainGroup: THREE.Group | null = null;
  private csfFlowParticles: THREE.Points | null = null;
  private debrisParticles: THREE.Points | null = null;
  private aqp4RingMeshes: THREE.Mesh[] = [];
  private arteryMeshes: THREE.Mesh[] = [];

  readonly telemetry = computed<IGlymphaticTelemetry>(() => {
    const state = this.sleepState();
    switch (state) {
      case 'deep_sws':
        return {
          interstitialSpaceExpansionPct: 60,
          aqp4PolarizationIndexPct: 96,
          convectiveFluxVelocityUmS: 4.8,
          amyloidClearanceRatePctHr: 18.5,
          deepCervicalLymphFlowMlDay: 240,
          activeStateLabel: '🌙 Deep Slow-Wave Sleep (Stage N3)',
          clinicalTakeaway: 'During Stage N3 slow-wave sleep, interstitial space volume expands by +60% via astrocytic shrinkage. Aquaporin-4 (AQP4) water channels drive convective bulk CSF flow across the brain parenchyma, purging amyloid-β and phosphorylated tau oligomers 4–5× faster than wakefulness.'
        };

      case 'light_nrem':
        return {
          interstitialSpaceExpansionPct: 25,
          aqp4PolarizationIndexPct: 65,
          convectiveFluxVelocityUmS: 2.3,
          amyloidClearanceRatePctHr: 8.2,
          deepCervicalLymphFlowMlDay: 165,
          activeStateLabel: '🌖 Light NREM (Stage N1/N2)',
          clinicalTakeaway: 'Light NREM establishes moderate glymphatic clearance. Interstitial channels dilate moderately (+25%), and periarterial CSF pulsations begin mobilizing parenchymal solutes toward perivenous pathways.'
        };

      case 'awake':
        return {
          interstitialSpaceExpansionPct: 0,
          aqp4PolarizationIndexPct: 25,
          convectiveFluxVelocityUmS: 0.8,
          amyloidClearanceRatePctHr: 2.1,
          deepCervicalLymphFlowMlDay: 85,
          activeStateLabel: '☀️ Awake / Active Mental State',
          clinicalTakeaway: 'During wakefulness, high locus coeruleus noradrenergic tone keeps astrocytic end-feet swollen and extracellular space tortuous. Convective flow is minimal; clearance relies primarily on slow diffusion, allowing metabolic waste to accumulate.'
        };

      case 'sleep_fragmentation':
        return {
          interstitialSpaceExpansionPct: 10,
          aqp4PolarizationIndexPct: 35,
          convectiveFluxVelocityUmS: 1.1,
          amyloidClearanceRatePctHr: 3.4,
          deepCervicalLymphFlowMlDay: 95,
          activeStateLabel: '⚡ Fragmented Sleep / OSA Disruption',
          clinicalTakeaway: 'Recurrent micro-arousals (as in obstructive sleep apnea or nocturnal shift work) trigger transient noradrenergic surges that repeatedly abort slow-wave glymphatic cycles. Correlated with accelerated amyloid-β plaque deposition and long-term neurocognitive risk.'
        };
    }
  });

  setSleepState(state: GlymphaticSleepState): void {
    this.sleepState.set(state);
    this.update3DMaterialsForState(state);
  }

  toggleDebris(): void {
    this.showDebrisParticles.update(v => !v);
    if (this.debrisParticles) {
      this.debrisParticles.visible = this.showDebrisParticles();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.init3DScene();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private init3DScene(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 460;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.8, 3.8);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 8;
    this.controls.minDistance = 1.2;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(3, 4, 3);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.8);
    rimLight.position.set(-3, -2, -2);
    this.scene.add(rimLight);

    // Build Procedural Glymphatic Brain Scene
    this.buildGlymphaticBrain();

    // Start Animation Loop
    this.animate();
  }

  private buildGlymphaticBrain(): void {
    if (!this.scene) return;

    this.brainGroup = new THREE.Group();
    this.scene.add(this.brainGroup);

    // 1. Semi-Translucent Cerebral Cortex Hemisphere Geometry
    const cortexGeo = new THREE.SphereGeometry(1.0, 32, 24);
    // Deform into brain shape (longer anteroposteriorly, sulcal indentations)
    const posAttr = cortexGeo.attributes['position'];
    for (let i = 0; i < posAttr.count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      // Elongate Z and slightly flatten bottom Y
      z *= 1.25;
      if (y < 0) y *= 0.75;

      // Add gentle procedural sulcal wrinkles
      const sulcus = Math.sin(x * 6) * Math.cos(z * 6) * 0.04;
      x += sulcus;
      y += sulcus;

      posAttr.setXYZ(i, x, y, z);
    }
    cortexGeo.computeVertexNormals();

    const cortexMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.32,
      wireframe: false,
      depthWrite: false
    });
    const cortexMesh = new THREE.Mesh(cortexGeo, cortexMat);
    this.brainGroup.add(cortexMesh);

    // 2. Ventricular System Core (Lateral & 3rd Ventricles)
    const ventCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.25, -0.3),
      new THREE.Vector3(0.25, 0.35, -0.05),
      new THREE.Vector3(0.35, 0.15, 0.25),
      new THREE.Vector3(0.15, -0.1, 0.1)
    ]);
    const ventGeoL = new THREE.TubeGeometry(ventCurveL, 24, 0.06, 8, false);

    const ventCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.05, 0.25, -0.3),
      new THREE.Vector3(-0.25, 0.35, -0.05),
      new THREE.Vector3(-0.35, 0.15, 0.25),
      new THREE.Vector3(-0.15, -0.1, 0.1)
    ]);
    const ventGeoR = new THREE.TubeGeometry(ventCurveR, 24, 0.06, 8, false);

    const ventMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.75
    });
    this.brainGroup.add(new THREE.Mesh(ventGeoL, ventMat));
    this.brainGroup.add(new THREE.Mesh(ventGeoR, ventMat));

    // 3. Penetrating Cortical Arteries & Virchow-Robin Sheaths
    this.aqp4RingMeshes = [];
    this.arteryMeshes = [];

    const arterySeeds = [
      { start: [0.15, 0.85, 0.2], end: [0.10, 0.25, 0.1] },
      { start: [-0.15, 0.85, 0.2], end: [-0.10, 0.25, 0.1] },
      { start: [0.55, 0.65, -0.1], end: [0.20, 0.20, -0.05] },
      { start: [-0.55, 0.65, -0.1], end: [-0.20, 0.20, -0.05] },
      { start: [0.35, 0.75, 0.45], end: [0.15, 0.15, 0.2] },
      { start: [-0.35, 0.75, 0.45], end: [-0.15, 0.15, 0.2] },
      { start: [0.65, 0.35, 0.3], end: [0.25, 0.05, 0.15] },
      { start: [-0.65, 0.35, 0.3], end: [-0.25, 0.05, 0.15] }
    ];

    arterySeeds.forEach(seed => {
      const p1 = new THREE.Vector3(...(seed.start as [number, number, number]));
      const p2 = new THREE.Vector3(...(seed.end as [number, number, number]));
      const path = new THREE.LineCurve3(p1, p2);

      // Arterial Core (Crimson)
      const arteryGeo = new THREE.TubeGeometry(path, 12, 0.022, 8, false);
      const arteryMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const arteryMesh = new THREE.Mesh(arteryGeo, arteryMat);
      this.brainGroup!.add(arteryMesh);
      this.arteryMeshes.push(arteryMesh);

      // Virchow-Robin Periarterial Annulus (Cyan CSF Sheath)
      const vrGeo = new THREE.TubeGeometry(path, 12, 0.045, 8, false);
      const vrMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.45,
        depthWrite: false
      });
      const vrMesh = new THREE.Mesh(vrGeo, vrMat);
      this.brainGroup!.add(vrMesh);

      // Astrocytic End-Foot Rings (AQP4 Channel Collars - Emerald)
      for (let t = 0.2; t <= 0.8; t += 0.2) {
        const ringGeo = new THREE.TorusGeometry(0.052, 0.009, 8, 16);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.9,
          roughness: 0.2
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        const ringPos = path.getPoint(t);
        ringMesh.position.copy(ringPos);
        ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), p2.clone().sub(p1).normalize());
        this.brainGroup!.add(ringMesh);
        this.aqp4RingMeshes.push(ringMesh);
      }
    });

    // 4. Convective Bulk Flow Particles (CSF Flush)
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside cerebral envelope
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.85;

      const sinPhi = Math.sin(phi);
      particlePositions[i * 3] = r * sinPhi * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.cos(phi) * 0.8;
      particlePositions[i * 3 + 2] = r * sinPhi * Math.sin(theta) * 1.1;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.022,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.csfFlowParticles = new THREE.Points(particleGeo, particleMat);
    this.brainGroup.add(this.csfFlowParticles);

    // 5. Amyloid-Beta & Phosphorylated Tau Aggregates (Debris Particles)
    const debrisCount = 450;
    const debrisPositions = new Float32Array(debrisCount * 3);
    for (let i = 0; i < debrisCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.75;

      const sinPhi = Math.sin(phi);
      debrisPositions[i * 3] = r * sinPhi * Math.cos(theta);
      debrisPositions[i * 3 + 1] = r * Math.cos(phi) * 0.75;
      debrisPositions[i * 3 + 2] = r * sinPhi * Math.sin(theta) * 1.0;
    }

    const debrisGeo = new THREE.BufferGeometry();
    debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));

    const debrisMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.032,
      transparent: true,
      opacity: 0.80,
      blending: THREE.NormalBlending
    });
    this.debrisParticles = new THREE.Points(debrisGeo, debrisMat);
    this.brainGroup.add(this.debrisParticles);
  }

  private update3DMaterialsForState(state: GlymphaticSleepState): void {
    const isSws = state === 'deep_sws';
    const isFrag = state === 'sleep_fragmentation';

    // Update AQP4 ring luminescence
    this.aqp4RingMeshes.forEach(mesh => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (isSws) {
        mat.emissiveIntensity = 1.4;
        mat.color.setHex(0x34d399); // Brilliant emerald
      } else if (isFrag) {
        mat.emissiveIntensity = 0.3;
        mat.color.setHex(0xf43f5e); // Stress red
      } else {
        mat.emissiveIntensity = 0.7;
        mat.color.setHex(0x10b981);
      }
    });

    if (this.csfFlowParticles) {
      const pMat = this.csfFlowParticles.material as THREE.PointsMaterial;
      pMat.size = isSws ? 0.030 : 0.020;
      pMat.color.setHex(isSws ? 0x67e8f9 : 0x0284c7);
    }
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) this.controls.update();

    const time = performance.now() * 0.001;
    const state = this.sleepState();

    // Pulse speed multiplier based on sleep state
    const speedMult = state === 'deep_sws' ? 3.5 : (state === 'light_nrem' ? 1.8 : 0.6);

    // Rotate brain slowly
    if (this.brainGroup) {
      this.brainGroup.rotation.y = time * 0.12;
    }

    // Arterial Systolic Pulsing
    const pulse = 1.0 + Math.sin(time * 5.0) * 0.08;
    this.arteryMeshes.forEach(mesh => {
      mesh.scale.set(pulse, 1.0, pulse);
    });

    // Animate CSF Convective Particles (drifting inward and swirling toward deep drainage)
    if (this.csfFlowParticles) {
      const posAttr = this.csfFlowParticles.geometry.attributes['position'];
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i);
        let x = posAttr.getX(i);
        let z = posAttr.getZ(i);

        // Drift toward brainstem / basal cisterns (negative Y)
        y -= 0.003 * speedMult;
        if (y < -0.8) {
          y = 0.85; // Recirculate to pial surface
          x = (Math.random() - 0.5) * 1.5;
          z = (Math.random() - 0.5) * 1.5;
        }

        // Swirl around Y axis
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x) + 0.004 * speedMult;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }

    // Animate Amyloid/Tau Debris Elimination (in SWS, flushed out rapidly)
    if (this.debrisParticles && this.debrisParticles.visible) {
      const dPosAttr = this.debrisParticles.geometry.attributes['position'];
      for (let i = 0; i < dPosAttr.count; i++) {
        let y = dPosAttr.getY(i);
        y -= 0.002 * speedMult;
        if (y < -0.85) {
          y = 0.75;
        }
        dPosAttr.setY(i, y);
      }
      dPosAttr.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };
}
