import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import { createMicrovascularShearMaterial, updateMicrovascularUniforms } from '../../shaders/microvascular-shear.shader';

export type FlowRegimeMode = 'laminar_atheroprotective' | 'turbulent_atheroprone' | 'diabetic_shedding' | 'septic_endotoxemia';

export interface IMicrovascularTelemetry {
  shearStressDyn: number;       // dyn/cm^2
  glycocalyxThicknessUm: number; // micrometers
  sheddingRatio: number;         // 0.0 - 1.0
  noProductionPercent: number;   // 0 - 100%
  endothelialStatus: 'Quiescent & Atheroprotective' | 'Activated & Inflamed' | 'Permeable & Denuded';
  vesselDiameterUm: number;
}

@Component({
  selector: 'app-microvascular-shear-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-teal-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🩸</span>
              <span>3D Microvascular Shear Stress & Glycocalyx Lens (Visual Model V4)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Poiseuille Wall Shear Stress (τw) • Endothelial Glycocalyx Hydrogel Erosion • eNOS Nitric Oxide (NO) Diffusion
            </p>
          </div>
        </div>

        <!-- Presets Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button type="button" (click)="setRegime('laminar_atheroprotective')"
                  [class]="flowRegime() === 'laminar_atheroprotective' ? 'bg-teal-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🌊</span>
            <span>Laminar High-Shear</span>
          </button>
          <button type="button" (click)="setRegime('turbulent_atheroprone')"
                  [class]="flowRegime() === 'turbulent_atheroprone' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🌪️</span>
            <span>Turbulent Low-Shear</span>
          </button>
          <button type="button" (click)="setRegime('diabetic_shedding')"
                  [class]="flowRegime() === 'diabetic_shedding' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🍯</span>
            <span>Diabetic Shedding</span>
          </button>
          <button type="button" (click)="setRegime('septic_endotoxemia')"
                  [class]="flowRegime() === 'septic_endotoxemia' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1">
            <span>🚨</span>
            <span>Septic Denudation</span>
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

        <!-- Floating Hemodynamic Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-cyan-400">Microvascular Hemodynamics</span>
            <span class="text-[10px] font-mono text-zinc-400">Ø {{ telemetry().vesselDiameterUm }} μm arteriole</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <!-- Wall Shear Stress -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">Wall Shear (τw):</span>
              <span class="font-bold text-sm font-sans"
                    [class.text-teal-400]="telemetry().shearStressDyn >= 15"
                    [class.text-amber-400]="telemetry().shearStressDyn >= 5 && telemetry().shearStressDyn < 15"
                    [class.text-red-400]="telemetry().shearStressDyn < 5">
                {{ telemetry().shearStressDyn }} dyn/cm²
              </span>
            </div>

            <!-- Glycocalyx Thickness -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">Glycocalyx (EGL):</span>
              <span class="font-bold text-sm font-sans"
                    [class.text-emerald-400]="telemetry().glycocalyxThicknessUm >= 1.8"
                    [class.text-amber-400]="telemetry().glycocalyxThicknessUm >= 0.8 && telemetry().glycocalyxThicknessUm < 1.8"
                    [class.text-red-400]="telemetry().glycocalyxThicknessUm < 0.8">
                {{ telemetry().glycocalyxThicknessUm }} μm
              </span>
            </div>

            <!-- eNOS Nitric Oxide Flux -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">eNOS NO Flux:</span>
              <span class="font-bold text-cyan-300">
                {{ telemetry().noProductionPercent }}% Max
              </span>
            </div>

            <!-- Glycocalyx Shedding Ratio -->
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">EGL Shedding:</span>
              <span class="font-bold text-rose-300">
                {{ (telemetry().sheddingRatio * 100).toFixed(0) }}% Erode
              </span>
            </div>
          </div>

          <!-- Endothelial Status Badge -->
          <div class="pt-1.5 border-t border-zinc-800/60 space-y-1">
            <div class="flex justify-between text-[10px]">
              <span class="text-zinc-400">Endothelial Phenotype:</span>
            </div>
            <span class="text-[10px] font-bold block uppercase px-2 py-1 rounded"
                  [ngClass]="{
                    'bg-teal-500/20 text-teal-300 border border-teal-500/40': telemetry().endothelialStatus === 'Quiescent & Atheroprotective',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/40': telemetry().endothelialStatus === 'Activated & Inflamed',
                    'bg-red-500/20 text-red-300 border border-red-500/40': telemetry().endothelialStatus === 'Permeable & Denuded'
                  }">
              {{ telemetry().endothelialStatus }}
            </span>
          </div>
        </div>

        <!-- Pathology Explanation Card (Bottom Left) -->
        <div class="absolute bottom-3 left-3 right-3 sm:right-auto z-30 bg-zinc-900/90 backdrop-blur-md p-3.5 rounded-xl border border-zinc-800 text-[11px] max-w-md shadow-2xl">
          <div class="flex items-center gap-1.5 mb-1 font-bold text-cyan-400 uppercase text-[10px]">
            <span>🔬</span>
            <span>{{ regimeTitle() }}</span>
          </div>
          <p class="text-zinc-300 font-sans text-xs leading-relaxed">
            {{ regimeExplanation() }}
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class MicrovascularShear3dLensComponent implements AfterViewInit, OnDestroy {
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  readonly patientState = inject(PatientStateService);

  readonly flowRegime = signal<FlowRegimeMode>('laminar_atheroprotective');
  readonly isPlaying = signal<boolean>(true);
  readonly flowSpeed = signal<number>(1.0);

  // Three.js References
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private animFrameId?: number;

  private vesselMesh?: THREE.Mesh;
  private rbcGroup?: THREE.Group;
  private noParticleSystem?: THREE.Points;
  private glycocalyxFringeMesh?: THREE.Points;
  private shearMaterial?: THREE.ShaderMaterial;

  readonly telemetry = computed<IMicrovascularTelemetry>(() => {
    switch (this.flowRegime()) {
      case 'laminar_atheroprotective':
        return {
          shearStressDyn: 24.5,
          glycocalyxThicknessUm: 2.4,
          sheddingRatio: 0.1,
          noProductionPercent: 92,
          endothelialStatus: 'Quiescent & Atheroprotective',
          vesselDiameterUm: 28
        };
      case 'turbulent_atheroprone':
        return {
          shearStressDyn: 3.2,
          glycocalyxThicknessUm: 1.4,
          sheddingRatio: 0.45,
          noProductionPercent: 28,
          endothelialStatus: 'Activated & Inflamed',
          vesselDiameterUm: 32
        };
      case 'diabetic_shedding':
        return {
          shearStressDyn: 12.0,
          glycocalyxThicknessUm: 0.5,
          sheddingRatio: 0.8,
          noProductionPercent: 35,
          endothelialStatus: 'Permeable & Denuded',
          vesselDiameterUm: 24
        };
      case 'septic_endotoxemia':
        return {
          shearStressDyn: 4.8,
          glycocalyxThicknessUm: 0.25,
          sheddingRatio: 0.92,
          noProductionPercent: 15,
          endothelialStatus: 'Permeable & Denuded',
          vesselDiameterUm: 35
        };
    }
  });

  readonly regimeTitle = computed(() => {
    switch (this.flowRegime()) {
      case 'laminar_atheroprotective': return 'Physiological Laminar Flow & Intact Glycocalyx';
      case 'turbulent_atheroprone': return 'Oscillatory Low-Shear Stress & Endothelial Activation';
      case 'diabetic_shedding': return 'Hyperglycemic Glycocalyx Shedding & Microvascular Leak';
      case 'septic_endotoxemia': return 'Acute Endotoxemic Glycocalyx Degradation';
    }
  });

  readonly regimeExplanation = computed(() => {
    switch (this.flowRegime()) {
      case 'laminar_atheroprotective':
        return 'Laminar shear stress >= 15 dyn/cm² stimulates endothelial nitric oxide synthase (eNOS) via mechanotransduction phosphorylation at Ser1177. The thick (2.4 μm) syndecan-1/heparan sulfate glycocalyx hydrogel prevents direct platelet/leukocyte adhesion to adhesion molecules (VCAM-1/ICAM-1).';
      case 'turbulent_atheroprone':
        return 'Low or oscillatory shear (< 4 dyn/cm²) occurs near arterial bifurcations and downstream of stenoses. Disturbed flow fails to maintain eNOS transcription, activates NF-κB, increases reactive oxygen species (ROS), and primes the vessel wall for monocyte rolling and atherogenesis.';
      case 'diabetic_shedding':
        return 'Elevated plasma glucose (> 180 mg/dL) activates matrix metalloproteinases and hyaluronidases, shearing off heparan sulfate side chains. The collapsed glycocalyx permits macromolecular albumin extravasation, inducing diabetic microalbuminuria and capillary rarefaction.';
      case 'septic_endotoxemia':
        return 'Bacterial lipopolysaccharide (LPS) and inflammatory cytokines (TNF-α, IL-1β) cause massive shedding of Syndecan-1 into plasma. The denuded endothelial barrier causes profound capillary leak syndrome, tissue edema, and loss of microvascular autoregulation.';
    }
  });

  ngAfterViewInit() {
    this.initThreeJs();
  }

  ngOnDestroy() {
    this.cleanupThreeJs();
  }

  setRegime(regime: FlowRegimeMode) {
    this.flowRegime.set(regime);
    this.updateSceneState();
  }

  togglePlay() {
    this.isPlaying.update(p => !p);
  }

  toggleSpeed() {
    const cur = this.flowSpeed();
    if (cur === 0.5) this.flowSpeed.set(1.0);
    else if (cur === 1.0) this.flowSpeed.set(1.5);
    else this.flowSpeed.set(0.5);
  }

  resetCamera() {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 1.2, 3.2);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  private initThreeJs() {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || typeof window === 'undefined') return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 1.2, 3.2);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0, 0);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambient);

      const tealDir = new THREE.DirectionalLight(0x14b8a6, 1.8);
      tealDir.position.set(3, 4, 3);
      this.scene.add(tealDir);

      const cyanDir = new THREE.DirectionalLight(0x06b6d4, 1.2);
      cyanDir.position.set(-3, -2, -3);
      this.scene.add(cyanDir);

      // 1. Tubular Microvessel with Longitudinal Cutaway
      const t = this.telemetry();
      this.shearMaterial = createMicrovascularShearMaterial({
        shearStressDyn: t.shearStressDyn,
        glycocalyxThicknessUm: t.glycocalyxThicknessUm,
        sheddingRatio: t.sheddingRatio,
        isTurbulent: this.flowRegime() === 'turbulent_atheroprone',
        nitricOxideProduction: t.noProductionPercent / 100
      });

      // Half-cylinder geometry to expose interior lumen
      const vesselGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.0, 32, 16, true, 0, Math.PI * 1.5);
      this.vesselMesh = new THREE.Mesh(vesselGeo, this.shearMaterial);
      this.vesselMesh.rotation.z = Math.PI / 2; // Lie horizontally along X axis
      this.scene.add(this.vesselMesh);

      // 2. Flowing Red Blood Cells (Biconcave disc particles)
      this.buildRbcStream();

      // 3. Glycocalyx Hydrogel Fringe Layer (Dense Golden Particles)
      this.buildGlycocalyxFringe();

      // 4. Nitric Oxide (NO) Radial Diffusion Particles
      this.buildNitricOxideParticles();

      // Start animation loop
      this.animate();
    } catch (e) {
      console.warn('WebGL initialization skipped in headless/test environment:', e);
    }
  }

  private buildRbcStream() {
    if (!this.scene) return;
    this.rbcGroup = new THREE.Group();
    this.scene.add(this.rbcGroup);

    const rbcMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.1
    });

    // Create 35 RBC biconcave disks flowing through central core
    const rbcGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 16);
    for (let i = 0; i < 35; i++) {
      const mesh = new THREE.Mesh(rbcGeo, rbcMat);
      // Place within parabolic laminar core (radius < 0.5)
      const r = Math.sqrt(Math.random()) * 0.45;
      const theta = Math.random() * Math.PI * 2;
      mesh.position.set(
        (Math.random() - 0.5) * 3.8, // X axis along vessel
        r * Math.sin(theta),
        r * Math.cos(theta)
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.rbcGroup.add(mesh);
    }
  }

  private buildGlycocalyxFringe() {
    if (!this.scene) return;
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 3.6;
      const angle = Math.random() * Math.PI * 1.5;
      const radius = 0.76; // Just inside endothelial wall

      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.cos(angle) * radius;

      // Golden amber tint
      colors[i * 3] = 0.96;
      colors[i * 3 + 1] = 0.75;
      colors[i * 3 + 2] = 0.20;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.glycocalyxFringeMesh = new THREE.Points(geo, mat);
    this.scene.add(this.glycocalyxFringeMesh);
  }

  private buildNitricOxideParticles() {
    if (!this.scene) return;
    const count = 200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 3.6;
      const angle = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.4; // Diffusing outward past vessel wall

      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = Math.cos(angle) * r;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7
    });

    this.noParticleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.noParticleSystem);
  }

  private updateSceneState() {
    if (!this.shearMaterial) return;
    const t = this.telemetry();
    updateMicrovascularUniforms(this.shearMaterial, 0, {
      shearStressDyn: t.shearStressDyn,
      glycocalyxThicknessUm: t.glycocalyxThicknessUm,
      sheddingRatio: t.sheddingRatio,
      isTurbulent: this.flowRegime() === 'turbulent_atheroprone',
      nitricOxideProduction: t.noProductionPercent / 100
    });

    // Update Glycocalyx points opacity/size based on thickness
    if (this.glycocalyxFringeMesh) {
      const mat = this.glycocalyxFringeMesh.material as THREE.PointsMaterial;
      mat.size = 0.02 + (t.glycocalyxThicknessUm / 3.0) * 0.03;
      mat.opacity = 0.1 + (1.0 - t.sheddingRatio) * 0.8;
    }

    // Update NO particles opacity based on eNOS production
    if (this.noParticleSystem) {
      const mat = this.noParticleSystem.material as THREE.PointsMaterial;
      mat.opacity = (t.noProductionPercent / 100) * 0.85;
    }
  }

  private animate = () => {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.isPlaying()) {
      const delta = 0.016 * this.flowSpeed();

      // 1. Update shader uniform time
      if (this.shearMaterial) {
        updateMicrovascularUniforms(this.shearMaterial, delta);
      }

      // 2. Animate Red Blood Cells flowing downstream along X axis
      if (this.rbcGroup) {
        this.rbcGroup.children.forEach(rbc => {
          // Poiseuille parabolic velocity: higher at center (y/z close to 0)
          const rSq = rbc.position.y * rbc.position.y + rbc.position.z * rbc.position.z;
          const velocity = Math.max(0.2, (1.0 - rSq / 0.35)) * 1.8 * this.flowSpeed();

          rbc.position.x += velocity * delta;
          rbc.rotation.x += 0.02;
          rbc.rotation.y += 0.03;

          // Wrap around along vessel length
          if (rbc.position.x > 1.9) {
            rbc.position.x = -1.9;
          }
        });
      }

      // 3. Gently pulse NO diffusion particles
      if (this.noParticleSystem) {
        this.noParticleSystem.rotation.x += 0.003;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private cleanupThreeJs() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = undefined;
    }

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.vesselMesh) {
      this.vesselMesh.geometry.dispose();
      if (this.shearMaterial) {
        this.shearMaterial.dispose();
      }
    }

    if (this.rbcGroup && this.scene) {
      this.rbcGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      this.scene.remove(this.rbcGroup);
    }

    if (this.glycocalyxFringeMesh) {
      this.glycocalyxFringeMesh.geometry.dispose();
      (this.glycocalyxFringeMesh.material as THREE.Material).dispose();
    }

    if (this.noParticleSystem) {
      this.noParticleSystem.geometry.dispose();
      (this.noParticleSystem.material as THREE.Material).dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
