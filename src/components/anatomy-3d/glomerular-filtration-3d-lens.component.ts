import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import { createGlomerularPodocyteMaterial, updateGlomerularUniforms } from '../../shaders/glomerular-podocyte.shader';

export type GlomerularRegimeMode = 'healthy_homeostasis' | 'diabetic_hyperfiltration' | 'nephrotic_effacement' | 'membranous_immune_complex';

export interface IGlomerularTelemetry {
  intraglomerularPressureMmHg: number; // mmHg
  effacementRatioPercent: number;      // 0 - 100%
  gbmChargeIntegrityPercent: number;   // 0 - 100%
  slitDiaphragmWidthNm: number;        // nm
  albuminuriaMgPerDay: number;         // mg/24h
  filtrationBarrierStatus: 'Intact & Selective' | 'Microalbuminuria Permeable' | 'Nephrotic Barrier Collapse';
  podocytePedicelMorphology: 'Crisp Interdigitating' | 'Partial Widening' | 'Fused Continuous Sheet';
}

@Component({
  selector: 'app-glomerular-filtration-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-teal-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🔬</span>
              <span>3D Glomerular Filtration & Podocyte Slit Diaphragm Lens (Visual Model V5)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Fenestrated Endothelium (70-100nm) • GBM Heparan Sulfate Polyanionic Shield • Podocyte Effacement & Slit Diaphragm (Nephrin/Podocin)
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button type="button" (click)="setRegime('healthy_homeostasis')"
                  [class]="regime() === 'healthy_homeostasis' ? 'bg-teal-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🛡️</span>
            <span>Homeostasis</span>
          </button>
          <button type="button" (click)="setRegime('diabetic_hyperfiltration')"
                  [class]="regime() === 'diabetic_hyperfiltration' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>⚡</span>
            <span>Hyperfiltration</span>
          </button>
          <button type="button" (click)="setRegime('nephrotic_effacement')"
                  [class]="regime() === 'nephrotic_effacement' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🚨</span>
            <span>Nephrotic Effacement</span>
          </button>
          <button type="button" (click)="setRegime('membranous_immune_complex')"
                  [class]="regime() === 'membranous_immune_complex' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🧪</span>
            <span>Membranous</span>
          </button>
        </div>
      </div>

      <!-- Main Canvas Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Playback & View Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 font-bold hover:bg-teal-500/30 transition cursor-pointer">
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

        <!-- Floating Glomerular Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-teal-400">Glomerular Filtration HUD</span>
            <span class="text-[10px] font-mono text-zinc-400">ΔP: {{ telemetry().intraglomerularPressureMmHg }} mmHg</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <!-- Podocyte Effacement -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Effacement</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().effacementRatioPercent > 50 ? 'text-red-400' : (telemetry().effacementRatioPercent > 10 ? 'text-amber-400' : 'text-teal-400')">
                {{ telemetry().effacementRatioPercent }}%
              </span>
            </div>

            <!-- GBM Negative Charge Integrity -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">GBM Charge Shield</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().gbmChargeIntegrityPercent < 50 ? 'text-red-400' : 'text-cyan-400'">
                {{ telemetry().gbmChargeIntegrityPercent }}%
              </span>
            </div>

            <!-- Slit Diaphragm Width -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Slit Width</span>
              <span class="text-sm font-black font-sans text-zinc-200">
                {{ telemetry().slitDiaphragmWidthNm }} nm
              </span>
            </div>

            <!-- Albuminuria Leak Rate -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-[9px] uppercase font-bold text-zinc-400 block">Albumin Leak</span>
              <span class="text-sm font-black font-sans"
                    [ngClass]="telemetry().albuminuriaMgPerDay > 300 ? 'text-red-400' : (telemetry().albuminuriaMgPerDay >= 30 ? 'text-amber-400' : 'text-emerald-400')">
                {{ telemetry().albuminuriaMgPerDay }} mg/d
              </span>
            </div>
          </div>

          <!-- Barrier Status Tag -->
          <div class="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
            <span class="text-zinc-400">Pedicel State:</span>
            <span class="font-bold text-zinc-200">{{ telemetry().podocytePedicelMorphology }}</span>
          </div>
          <div class="flex items-center justify-between text-[10px]">
            <span class="text-zinc-400">Barrier Integrity:</span>
            <span class="font-bold"
                  [ngClass]="telemetry().filtrationBarrierStatus === 'Nephrotic Barrier Collapse' ? 'text-red-400' : (telemetry().filtrationBarrierStatus === 'Microalbuminuria Permeable' ? 'text-amber-400' : 'text-teal-400')">
              {{ telemetry().filtrationBarrierStatus }}
            </span>
          </div>
        </div>

        <!-- Interactive Legend (Bottom Center) -->
        <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-800 text-[10px] shadow-lg pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1fb8a4]"></span>
            <span class="text-zinc-300">Podocyte Pedicels</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#338cee]"></span>
            <span class="text-zinc-300">GBM Polyanionic Shield</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#7a47d9]"></span>
            <span class="text-zinc-300">Capillary Fenestrae (70-100nm)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#40fa73] animate-pulse"></span>
            <span class="text-zinc-300">Albumin Leakage</span>
          </div>
        </div>
      </div>

      <!-- Bottom Clinical & Biophysical Explainer -->
      <div class="p-4 bg-zinc-900 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans text-zinc-300">
        
        <!-- Fenestrations & Capillary Hydraulics -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-purple-400 font-bold text-sm">01</span>
            <h4 class="font-bold text-zinc-100 text-xs">Fenestrated Capillary Core</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Endothelial fenestrations (70–100 nm) permit rapid hydraulic flux of water and electrolytes under hydrostatic pressure (ΔP), retaining red blood cells and platelets within the capillary lumen.
          </p>
        </div>

        <!-- GBM Charge Selectivity -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 font-bold text-sm">02</span>
            <h4 class="font-bold text-zinc-100 text-xs">GBM Electrostatic Barrier</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Agrin-rich heparan sulfate proteoglycans impart a high net negative charge across the 300–350 nm lamina densa, electrostatically repelling polyanionic serum albumin (3.6 nm radius, -19 charge).
          </p>
        </div>

        <!-- Podocyte Slit Diaphragm -->
        <div class="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-teal-400 font-bold text-sm">03</span>
            <h4 class="font-bold text-zinc-100 text-xs">Podocyte Slit Diaphragms</h4>
          </div>
          <p class="text-[11px] text-zinc-400 leading-relaxed">
            Nephrin and podocin molecular zippers span 30–45 nm filtration slits. In nephrotic syndrome and diabetic hyperfiltration, pedicels flatten into continuous sheets, causing massive protein leakage.
          </p>
        </div>

      </div>

    </div>
  `
})
export class GlomerularFiltration3dLensComponent implements AfterViewInit, OnDestroy {
  private readonly patientState = inject(PatientStateService, { optional: true });

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  // Simulation Controls & Reactive Signals
  readonly regime = signal<GlomerularRegimeMode>('healthy_homeostasis');
  readonly isPlaying = signal<boolean>(true);
  readonly flowSpeed = signal<number>(1.0);

  // Three.js Runtime References
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animFrameId?: number;
  private glomerularMaterial?: THREE.ShaderMaterial;
  private capillaryMesh?: THREE.Mesh;
  private albuminParticles?: THREE.Points;
  private lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
  private getDelta(): number {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;
    return delta;
  }

  // Active Biophysical Parameters
  readonly currentPressure = signal<number>(36.0); // mmHg
  readonly currentEffacement = signal<number>(0.0); // 0.0 - 1.0
  readonly currentGbmCharge = signal<number>(1.0); // 0.0 - 1.0
  readonly currentSlitWidth = signal<number>(35.0); // nm
  readonly currentAlbuminLeak = signal<number>(0.0); // 0.0 - 1.0

  readonly telemetry = computed<IGlomerularTelemetry>(() => {
    const p = this.currentPressure();
    const eff = this.currentEffacement();
    const charge = this.currentGbmCharge();
    const slit = this.currentSlitWidth();
    const leak = this.currentAlbuminLeak();

    let albuminuriaMgPerDay = Math.round(leak * 3800);
    if (eff === 0 && charge === 1.0) albuminuriaMgPerDay = 15; // Normal physiological trace

    let filtrationBarrierStatus: IGlomerularTelemetry['filtrationBarrierStatus'] = 'Intact & Selective';
    if (albuminuriaMgPerDay > 300) {
      filtrationBarrierStatus = 'Nephrotic Barrier Collapse';
    } else if (albuminuriaMgPerDay >= 30) {
      filtrationBarrierStatus = 'Microalbuminuria Permeable';
    }

    let podocytePedicelMorphology: IGlomerularTelemetry['podocytePedicelMorphology'] = 'Crisp Interdigitating';
    if (eff >= 0.7) {
      podocytePedicelMorphology = 'Fused Continuous Sheet';
    } else if (eff >= 0.2) {
      podocytePedicelMorphology = 'Partial Widening';
    }

    return {
      intraglomerularPressureMmHg: Math.round(p * 10) / 10,
      effacementRatioPercent: Math.round(eff * 100),
      gbmChargeIntegrityPercent: Math.round(charge * 100),
      slitDiaphragmWidthNm: Math.round(slit * 10) / 10,
      albuminuriaMgPerDay,
      filtrationBarrierStatus,
      podocytePedicelMorphology
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

  public setRegime(mode: GlomerularRegimeMode): void {
    this.regime.set(mode);

    switch (mode) {
      case 'healthy_homeostasis':
        this.currentPressure.set(36.0);
        this.currentEffacement.set(0.0);
        this.currentGbmCharge.set(1.0);
        this.currentSlitWidth.set(35.0);
        this.currentAlbuminLeak.set(0.0);
        break;

      case 'diabetic_hyperfiltration':
        this.currentPressure.set(52.0);
        this.currentEffacement.set(0.25);
        this.currentGbmCharge.set(0.7);
        this.currentSlitWidth.set(28.0);
        this.currentAlbuminLeak.set(0.04);
        break;

      case 'nephrotic_effacement':
        this.currentPressure.set(42.0);
        this.currentEffacement.set(0.85);
        this.currentGbmCharge.set(0.15);
        this.currentSlitWidth.set(8.0);
        this.currentAlbuminLeak.set(0.95);
        break;

      case 'membranous_immune_complex':
        this.currentPressure.set(40.0);
        this.currentEffacement.set(0.60);
        this.currentGbmCharge.set(0.35);
        this.currentSlitWidth.set(16.0);
        this.currentAlbuminLeak.set(0.65);
        break;
    }

    if (this.glomerularMaterial) {
      updateGlomerularUniforms(this.glomerularMaterial, 0, {
        intraglomerularPressureMmHg: this.currentPressure(),
        effacementRatio: this.currentEffacement(),
        gbmChargeIntegrity: this.currentGbmCharge(),
        slitDiaphragmWidthNm: this.currentSlitWidth(),
        albuminuriaLeakRate: this.currentAlbuminLeak()
      });
    }
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
      this.camera.position.set(0, 3.2, 5.8);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  private initThreeScene(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    try {
      // 1. Scene & Camera Setup
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 450;
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 3.2, 5.8);

      // 2. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(this.renderer.domElement);

      // 3. OrbitControls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 15;
      this.controls.minDistance = 2;

      // 4. Procedural Capillary Loop Geometry
      // Glomerular capillary loops form tortuous invaginated cylinders
      const capillaryGeo = new THREE.CylinderGeometry(1.6, 1.6, 6.0, 64, 64, true);
      this.glomerularMaterial = createGlomerularPodocyteMaterial({
        intraglomerularPressureMmHg: this.currentPressure(),
        effacementRatio: this.currentEffacement(),
        gbmChargeIntegrity: this.currentGbmCharge(),
        slitDiaphragmWidthNm: this.currentSlitWidth(),
        albuminuriaLeakRate: this.currentAlbuminLeak()
      });

      this.capillaryMesh = new THREE.Mesh(capillaryGeo, this.glomerularMaterial);
      this.capillaryMesh.rotation.z = Math.PI / 2;
      this.scene.add(this.capillaryMesh);

      // 5. Escaping Albumin Macromolecule Particles (Point cloud for trans-barrier leakage)
      const particleCount = 180;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        // Distributed radially just outside capillary wall
        const theta = Math.random() * Math.PI * 2;
        const radius = 1.65 + Math.random() * 0.8;
        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
        positions[i * 3 + 2] = Math.sin(theta) * radius;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0x40fa73,
        size: 0.08,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });

      this.albuminParticles = new THREE.Points(particleGeo, particleMat);
      this.scene.add(this.albuminParticles);

      // 6. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x14b8a6, 0.8);
      dirLight.position.set(3, 5, 4);
      this.scene.add(dirLight);

      // 7. Animation Loop
      this.animate();

    } catch (err) {
      // Graceful degradation when running in headless or WebGL-unsupported environments
      console.warn('WebGL initialization skipped in headless context:', err);
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = this.getDelta();

    if (this.isPlaying()) {
      const effectiveDelta = delta * this.flowSpeed();

      if (this.glomerularMaterial) {
        updateGlomerularUniforms(this.glomerularMaterial, effectiveDelta, {
          flowVelocity: this.flowSpeed()
        });
      }

      // Animate albumin particles escaping radially into Bowman space
      if (this.albuminParticles) {
        const leakRate = this.currentAlbuminLeak();
        this.albuminParticles.visible = leakRate > 0.05;

        if (this.albuminParticles.visible) {
          const pos = this.albuminParticles.geometry.attributes['position'];
          const arr = pos.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] += effectiveDelta * 0.8; // Drift longitudinally
            if (arr[i + 1] > 2.5) arr[i + 1] = -2.5;
          }
          pos.needsUpdate = true;
        }
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
