import {
  Component,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  model,
  computed,
  signal,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-condensate-3d-droplet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #canvasContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between">
      
      <!-- Ambient Radial Holographic Grid -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/25 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Floating Telemetry & Controls HUD -->
      <div class="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        <!-- Phase Separation Readout Badge -->
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-blue-500/40 text-xs font-mono shadow-lg flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full"
                  [class.bg-emerald-400]="isPhaseSeparated()"
                  [class.bg-zinc-500]="!isPhaseSeparated()"
                  [class.animate-pulse]="isPhaseSeparated()"></span>
            <span class="text-blue-300 font-bold">3D LLPS Condensate</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            <span>Phase: <strong [class.text-emerald-300]="isPhaseSeparated()" [class.text-zinc-400]="!isPhaseSeparated()">{{ isPhaseSeparated() ? 'COACERVATE' : 'DIFFUSE GAS' }}</strong></span>
            <span>•</span>
            <span>Radius: <strong class="text-teal-200">{{ dropletRadiusNm() }} nm</strong></span>
            <span>•</span>
            <span>Pol II: <strong class="text-emerald-300">{{ polIiEnrichmentFold() }}x</strong></span>
            <span>•</span>
            <span>Bursts: <strong class="text-amber-300">{{ burstFrequencyPerHour() }}/hr</strong></span>
          </div>
        </div>

        <!-- Camera, Burst & Auto-Spin Controls -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 text-xs font-mono shadow-lg">
          <button (click)="triggerBurstPulse()"
                  class="px-2.5 py-1 rounded-lg font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1 hover:bg-emerald-900 cursor-pointer">
            <span>✨</span>
            <span>Burst Pulse</span>
          </button>
          <button (click)="toggleAutoSpin()"
                  [class.bg-blue-500]="isAutoSpinning()"
                  [class.text-zinc-950]="isAutoSpinning()"
                  [class.text-zinc-300]="!isAutoSpinning()"
                  class="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer">
            <span [class.animate-spin]="isAutoSpinning()">🔄</span>
            <span>{{ isAutoSpinning() ? 'Spin ON' : '360°' }}</span>
          </button>
          <button (click)="resetCamera()"
                  class="px-2.5 py-1 bg-zinc-900 text-zinc-300 font-bold rounded-lg hover:bg-zinc-800 transition cursor-pointer">
            🎯 Reset
          </button>
        </div>
      </div>

      <!-- Bottom Biomechanical Legend -->
      <div class="absolute bottom-3 inset-x-3 z-30 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
            <span>MED1 IDRs</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>BRD4 Co-Factors</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>RNA Pol II Condensate</span>
          </div>
        </div>
        
        <div class="pointer-events-auto px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>Flory-Huggins Free Energy χ = 1.45 • Capillary Waves</span>
        </div>
      </div>

    </div>
  `
})
export class Condensate3dDropletComponent implements AfterViewInit, OnDestroy {
  readonly med1Conc = model<number>(4.5);
  readonly brd4Conc = model<number>(3.2);
  readonly polIiConc = model<number>(1.8);

  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly isAutoSpinning = signal<boolean>(true);

  // Derived Flory-Huggins Phase Separation Telemetry
  readonly isPhaseSeparated = computed(() => {
    return (this.med1Conc() + this.brd4Conc()) >= 3.0;
  });

  readonly dropletRadiusNm = computed(() => {
    if (!this.isPhaseSeparated()) return 0;
    const effective = (this.med1Conc() * 1.5) + (this.brd4Conc() * 1.2) + (this.polIiConc() * 0.8);
    return Number((35.0 + Math.min(180.0, effective * 14.5)).toFixed(1));
  });

  readonly polIiEnrichmentFold = computed(() => {
    if (!this.isPhaseSeparated()) return 1.0;
    const base = (this.med1Conc() * 3.8) + (this.brd4Conc() * 2.5);
    return Number(Math.max(1.0, Math.min(85.0, base)).toFixed(1));
  });

  readonly burstFrequencyPerHour = computed(() => {
    if (!this.isPhaseSeparated()) return 0.2;
    const enrich = this.polIiEnrichmentFold();
    return Number((0.8 + (enrich * 0.24)).toFixed(1));
  });

  // Three.js State
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId?: number;

  private dropletMesh!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>;
  private originalPositions!: Float32Array;
  private med1Group = new THREE.Group();
  private brd4Group = new THREE.Group();
  private polIiGroup = new THREE.Group();
  private burstPulseMesh!: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  private burstScale = 0;

  constructor() {
    effect(() => {
      const med1 = this.med1Conc();
      const brd4 = this.brd4Conc();
      const pol2 = this.polIiConc();
      this.updatePhysics(med1, brd4, pol2);
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }

  toggleAutoSpin(): void {
    this.isAutoSpinning.update(v => !v);
    if (this.controls) {
      this.controls.autoRotate = this.isAutoSpinning();
    }
  }

  triggerBurstPulse(): void {
    this.burstScale = 0.2;
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.0, 5.0);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  private initThreeJs(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.0, 5.0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // 3. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.isAutoSpinning();
    this.controls.autoRotateSpeed = 1.0;
    this.controls.maxDistance = 12;
    this.controls.minDistance = 2.5;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 3.5); // Sky Blue light
    dirLight1.position.set(4, 6, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.5); // Amber light
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x10b981, 4.0, 8); // Emerald internal core glow
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    // 5. Phase-Separated Droplet Coacervate Mesh
    const geom = new THREE.IcosahedronGeometry(1.5, 5);
    this.originalPositions = new Float32Array(geom.attributes['position'].array);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x082f49,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.34, // Liquid coacervate refractive index
      transparent: true,
      opacity: 0.82
    });

    this.dropletMesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.dropletMesh);

    // 6. Transcriptional Burst Pulse Wave Mesh
    const pulseGeom = new THREE.SphereGeometry(1.0, 32, 32);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    this.burstPulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
    this.scene.add(this.burstPulseMesh);

    // 7. Molecule Particle Groups
    this.buildMolecules();
    this.scene.add(this.med1Group);
    this.scene.add(this.brd4Group);
    this.scene.add(this.polIiGroup);

    // Initial physics update
    this.updatePhysics(this.med1Conc(), this.brd4Conc(), this.polIiConc());

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private buildMolecules(): void {
    // 1. MED1 IDRs (Sapphire Blue)
    this.med1Group.clear();
    const med1Geom = new THREE.SphereGeometry(0.04, 8, 8);
    const med1Mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    for (let i = 0; i < 45; i++) {
      const p = new THREE.Mesh(med1Geom, med1Mat);
      this.scatterInSphere(p, 1.3);
      this.med1Group.add(p);
    }

    // 2. BRD4 Co-Factors (Amber Gold)
    this.brd4Group.clear();
    const brd4Geom = new THREE.SphereGeometry(0.045, 8, 8);
    const brd4Mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    for (let i = 0; i < 35; i++) {
      const p = new THREE.Mesh(brd4Geom, brd4Mat);
      this.scatterInSphere(p, 1.4);
      this.brd4Group.add(p);
    }

    // 3. RNA Pol II Clusters (Emerald Green)
    this.polIiGroup.clear();
    const polGeom = new THREE.SphereGeometry(0.06, 8, 8);
    const polMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x064e3b, roughness: 0.2 });
    for (let i = 0; i < 30; i++) {
      const p = new THREE.Mesh(polGeom, polMat);
      this.scatterInSphere(p, 1.1);
      this.polIiGroup.add(p);
    }
  }

  private scatterInSphere(mesh: THREE.Mesh, maxRadius: number): void {
    const r = Math.cbrt(Math.random()) * maxRadius;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  private updatePhysics(med1: number, brd4: number, pol2: number): void {
    if (!this.dropletMesh || !this.originalPositions) return;

    const separated = (med1 + brd4) >= 3.0;
    const radiusScale = separated ? Math.min(1.6, 0.7 + (med1 + brd4 + pol2) * 0.08) : 0.4;

    this.dropletMesh.scale.set(radiusScale, radiusScale, radiusScale);

    if (this.dropletMesh.material) {
      if (separated) {
        this.dropletMesh.material.opacity = 0.82;
        this.dropletMesh.material.transmission = 0.75;
        this.dropletMesh.material.color.setHex(0x0284c7); // Deep azure
      } else {
        // Diffuse gas phase
        this.dropletMesh.material.opacity = 0.15;
        this.dropletMesh.material.transmission = 0.95;
        this.dropletMesh.material.color.setHex(0x64748b); // Muted diffuse grey
      }
    }
  }

  private onWindowResize = () => {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || !this.renderer || !this.camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    const time = Date.now() * 0.002;

    // 1. Procedural Capillary Wave Wobble on Droplet Surface
    if (this.dropletMesh && this.originalPositions && this.isPhaseSeparated()) {
      const pos = this.dropletMesh.geometry.attributes['position'];
      const array = pos.array as Float32Array;

      for (let i = 0; i < array.length; i += 3) {
        const ox = this.originalPositions[i];
        const oy = this.originalPositions[i + 1];
        const oz = this.originalPositions[i + 2];

        // Harmonic surface oscillation
        const wave = Math.sin(ox * 2.5 + time) * Math.cos(oy * 2.5 + time * 1.2) * 0.06;
        array[i] = ox + ox * wave;
        array[i + 1] = oy + oy * wave;
        array[i + 2] = oz + oz * wave;
      }

      pos.needsUpdate = true;
    }

    // 2. Animate Brownian Motion of IDRs inside Condensate
    const jitter = (group: THREE.Group, scale: number) => {
      group.children.forEach((child, idx) => {
        child.position.x += Math.sin(time * 1.5 + idx) * scale;
        child.position.y += Math.cos(time * 1.5 + idx * 1.3) * scale;
        child.position.z += Math.sin(time * 1.5 + idx * 2.1) * scale;
      });
    };

    jitter(this.med1Group, 0.003);
    jitter(this.brd4Group, 0.003);
    jitter(this.polIiGroup, 0.004);

    // 3. Transcriptional Burst Pulse Expansion
    if (this.burstScale > 0) {
      this.burstScale += 0.035;
      const s = this.burstScale * 3.2;
      this.burstPulseMesh.scale.set(s, s, s);
      const mat = this.burstPulseMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1.0 - this.burstScale);

      if (this.burstScale >= 1.0) {
        this.burstScale = 0;
        mat.opacity = 0;
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
