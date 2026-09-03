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
import { HistoneEpigeneticState } from '../../services/physical-genomics.service';

@Component({
  selector: 'app-nucleosome-3d-puller',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #canvasContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between">
      
      <!-- Ambient Radial Holographic Grid -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/25 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Floating Telemetry & Controls HUD -->
      <div class="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        <!-- Force Spectroscopy Readout Badge -->
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-amber-500/40 text-xs font-mono shadow-lg flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="text-amber-300 font-bold">3D Optical Tweezer Trap</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            <span>Trap Force: <strong class="text-amber-200">{{ pullingForce() }} pN</strong></span>
            <span>•</span>
            <span>Extension: <strong class="text-teal-300">{{ dnaExtensionNm() }} nm</strong></span>
            <span>•</span>
            <span>Outer Turn: <strong [class.text-emerald-400]="isOuterTurnUnwrapped()" [class.text-zinc-400]="!isOuterTurnUnwrapped()">{{ isOuterTurnUnwrapped() ? 'UNWRAPPED' : 'BOUND' }}</strong></span>
            <span>•</span>
            <span>Inner Core: <strong [class.text-rose-400]="isInnerCoreUnwrapped()" [class.text-zinc-400]="!isInnerCoreUnwrapped()">{{ isInnerCoreUnwrapped() ? 'RUPTURED' : 'WRAPPED' }}</strong></span>
          </div>
        </div>

        <!-- Camera, Ramp & Auto-Spin Controls -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 text-xs font-mono shadow-lg">
          <button (click)="toggleForceRamp()"
                  [class.bg-amber-500]="isRamping()"
                  [class.text-zinc-950]="isRamping()"
                  [class.text-zinc-300]="!isRamping()"
                  class="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer">
            <span>⚡</span>
            <span>{{ isRamping() ? 'Ramping...' : 'Ramp Force' }}</span>
          </button>
          <button (click)="toggleAutoSpin()"
                  [class.bg-amber-500]="isAutoSpinning()"
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

      <!-- Bottom Interactive Force Controller Bar -->
      <div class="absolute bottom-3 inset-x-3 z-30 pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 text-xs font-mono shadow-xl">
        <div class="flex items-center gap-3 flex-1 max-w-md">
          <span class="text-zinc-400 whitespace-nowrap">Applied Force (pN):</span>
          <input type="range" min="0" max="30" step="0.5"
                 [value]="pullingForce()"
                 (input)="onForceChange($event)"
                 class="accent-amber-400 cursor-pointer w-full">
          <span class="text-amber-300 font-bold w-12 text-right">{{ pullingForce() }} pN</span>
        </div>

        <div class="flex items-center gap-3 text-[11px] text-zinc-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Laser Trap (1064nm)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>DNA Extension</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Histone Octamer</span>
          </div>
        </div>
      </div>

    </div>
  `
})
export class Nucleosome3dPullerComponent implements AfterViewInit, OnDestroy {
  readonly epigeneticState = model<HistoneEpigeneticState>('HYPERACETYLATED_H3K27AC');
  readonly ionicStrength = model<number>(150);
  readonly pullingForce = model<number>(5.0);

  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly isAutoSpinning = signal<boolean>(true);
  readonly isRamping = signal<boolean>(false);

  // Biophysical Rupture Thresholds
  readonly outerRuptureForcePn = computed(() => {
    const epi = this.epigeneticState();
    const ionic = this.ionicStrength();
    const ionicFactor = Math.sqrt(ionic / 150.0);
    switch (epi) {
      case 'HYPERACETYLATED_H3K27AC':
        return Number((3.2 * ionicFactor).toFixed(1));
      case 'POLYCOMB_H3K27ME3':
        return Number((5.8 * ionicFactor).toFixed(1));
      case 'HETEROCHROMATIN_H3K9ME3':
        return Number((8.4 * ionicFactor).toFixed(1));
      case 'UNMODIFIED_CANONICAL':
      default:
        return Number((4.5 * ionicFactor).toFixed(1));
    }
  });

  readonly innerRuptureForcePn = computed(() => {
    const outer = this.outerRuptureForcePn();
    return Number((outer * 3.2).toFixed(1));
  });

  readonly isOuterTurnUnwrapped = computed(() => {
    return this.pullingForce() >= this.outerRuptureForcePn();
  });

  readonly isInnerCoreUnwrapped = computed(() => {
    return this.pullingForce() >= this.innerRuptureForcePn();
  });

  readonly dnaExtensionNm = computed(() => {
    const f = this.pullingForce();
    const outerF = this.outerRuptureForcePn();
    const innerF = this.innerRuptureForcePn();

    if (f < outerF) {
      return Number((f * 1.8).toFixed(1)); // Elastic stretching of entry linker
    } else if (f < innerF) {
      const excess = f - outerF;
      return Number((24.5 + excess * 1.2).toFixed(1)); // Outer turn released (+24.5 nm)
    } else {
      const excess = f - innerF;
      return Number((49.0 + excess * 0.4).toFixed(1)); // Complete nucleosome unpeeling (+49.0 nm)
    }
  });

  // Three.js State
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId?: number;
  private rampIntervalId?: any;

  private histoneMesh!: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhysicalMaterial>;
  private dnaLineMesh!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
  private trapBeadMesh!: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  private laserCone1!: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;
  private laserCone2!: THREE.Mesh<THREE.ConeGeometry, THREE.MeshBasicMaterial>;

  constructor() {
    effect(() => {
      const force = this.pullingForce();
      const epi = this.epigeneticState();
      this.updatePhysics(force, epi);
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.rampIntervalId) {
      clearInterval(this.rampIntervalId);
    }
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

  toggleForceRamp(): void {
    if (this.isRamping()) {
      clearInterval(this.rampIntervalId);
      this.isRamping.set(false);
      return;
    }

    this.isRamping.set(true);
    this.pullingForce.set(0);
    this.rampIntervalId = setInterval(() => {
      const cur = this.pullingForce();
      if (cur >= 30) {
        clearInterval(this.rampIntervalId);
        this.isRamping.set(false);
      } else {
        this.pullingForce.set(Number((cur + 0.5).toFixed(1)));
      }
    }, 80);
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.5, 6.2);
      this.controls.target.set(0.8, 0, 0);
      this.controls.update();
    }
  }

  onForceChange(e: Event): void {
    const val = parseFloat((e.target as HTMLInputElement).value);
    this.pullingForce.set(val);
  }

  private initThreeJs(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.5, 6.2);

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
    this.controls.autoRotateSpeed = 0.8;
    this.controls.target.set(0.8, 0, 0);
    this.controls.maxDistance = 14;
    this.controls.minDistance = 2.5;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 3.5); // Amber light
    dirLight1.position.set(4, 6, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x2dd4bf, 2.5); // Teal back light
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    // 5. Histone Octamer Core Mesh (Centered at x = -1.2)
    const octamerGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.7, 32);
    const octamerMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488,
      emissive: 0x042f2e,
      roughness: 0.25,
      metalness: 0.15,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9
    });
    this.histoneMesh = new THREE.Mesh(octamerGeom, octamerMat);
    this.histoneMesh.position.set(-1.2, 0, 0);
    this.histoneMesh.rotation.x = Math.PI / 2;
    this.scene.add(this.histoneMesh);

    // 6. Polystyrene Micro-Bead trapped at Laser Waist
    const beadGeom = new THREE.SphereGeometry(0.45, 32, 32);
    const beadMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0e7ff,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      ior: 1.59, // Polystyrene IOR
      transparent: true,
      opacity: 0.85
    });
    this.trapBeadMesh = new THREE.Mesh(beadGeom, beadMat);
    this.trapBeadMesh.position.set(2.8, 0, 0);
    this.scene.add(this.trapBeadMesh);

    // 7. Counter-Propagating Laser Trap Beams (1064nm IR Cones)
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    
    // Top Cone
    const coneGeom1 = new THREE.ConeGeometry(0.8, 2.2, 16, 1, true);
    this.laserCone1 = new THREE.Mesh(coneGeom1, laserMat);
    this.laserCone1.position.set(2.8, 1.3, 0);
    this.laserCone1.rotation.x = Math.PI;
    this.scene.add(this.laserCone1);

    // Bottom Cone
    const coneGeom2 = new THREE.ConeGeometry(0.8, 2.2, 16, 1, true);
    this.laserCone2 = new THREE.Mesh(coneGeom2, laserMat);
    this.laserCone2.position.set(2.8, -1.3, 0);
    this.scene.add(this.laserCone2);

    // 8. Dynamic DNA Spline Strand
    this.buildDnaStrand(this.pullingForce());

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private buildDnaStrand(force: number): void {
    if (this.dnaLineMesh) {
      this.scene.remove(this.dnaLineMesh);
      this.dnaLineMesh.geometry.dispose();
    }

    const outerRupture = this.isOuterTurnUnwrapped();
    const innerRupture = this.isInnerCoreUnwrapped();

    const points: THREE.Vector3[] = [];
    const octX = -1.2;
    const beadX = 2.8 + (force * 0.02);

    if (innerRupture) {
      // Completely unpeeled straight strand
      points.push(new THREE.Vector3(octX - 0.5, 0, 0));
      points.push(new THREE.Vector3(octX, 0.1, 0));
      points.push(new THREE.Vector3(0.5, 0.05, 0));
      points.push(new THREE.Vector3(1.8, 0, 0));
      points.push(new THREE.Vector3(beadX - 0.45, 0, 0));
    } else if (outerRupture) {
      // 1 Inner turn remaining around histone core
      points.push(new THREE.Vector3(octX - 0.9, -0.2, 0));
      points.push(new THREE.Vector3(octX, -0.9, 0.2));
      points.push(new THREE.Vector3(octX + 0.9, 0, 0.3));
      points.push(new THREE.Vector3(octX, 0.9, 0.1));
      points.push(new THREE.Vector3(0.2, 0.6, 0.05));
      points.push(new THREE.Vector3(1.4, 0.2, 0));
      points.push(new THREE.Vector3(beadX - 0.45, 0, 0));
    } else {
      // 2 Full wrapped turns (147 bp)
      points.push(new THREE.Vector3(octX - 0.95, -0.3, -0.3));
      points.push(new THREE.Vector3(octX, -0.95, 0));
      points.push(new THREE.Vector3(octX + 0.95, 0, 0.4));
      points.push(new THREE.Vector3(octX, 0.95, 0.2));
      points.push(new THREE.Vector3(octX - 0.95, 0, -0.1));
      points.push(new THREE.Vector3(octX, -0.95, -0.3));
      points.push(new THREE.Vector3(octX + 0.95, -0.2, 0.1));
      points.push(new THREE.Vector3(0.5, 0.3, 0));
      points.push(new THREE.Vector3(beadX - 0.45, 0, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.045, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      roughness: 0.3,
      metalness: 0.2
    });

    this.dnaLineMesh = new THREE.Mesh(tubeGeom, tubeMat);
    this.scene.add(this.dnaLineMesh);

    // Update bead position
    if (this.trapBeadMesh && this.laserCone1 && this.laserCone2) {
      this.trapBeadMesh.position.set(beadX, 0, 0);
      this.laserCone1.position.set(beadX, 1.3, 0);
      this.laserCone2.position.set(beadX, -1.3, 0);
    }
  }

  private updatePhysics(force: number, epi: HistoneEpigeneticState): void {
    if (!this.histoneMesh) return;

    // Epigenetic Color Code on Octamer
    switch (epi) {
      case 'HYPERACETYLATED_H3K27AC':
        this.histoneMesh.material.color.setHex(0x10b981); // Emerald active
        this.histoneMesh.material.emissive.setHex(0x064e3b);
        break;
      case 'POLYCOMB_H3K27ME3':
        this.histoneMesh.material.color.setHex(0x8b5cf6); // Violet polycomb
        this.histoneMesh.material.emissive.setHex(0x4c1d95);
        break;
      case 'HETEROCHROMATIN_H3K9ME3':
        this.histoneMesh.material.color.setHex(0xef4444); // Red heterochromatin
        this.histoneMesh.material.emissive.setHex(0x7f1d1d);
        break;
      case 'UNMODIFIED_CANONICAL':
      default:
        this.histoneMesh.material.color.setHex(0x0d9488); // Teal baseline
        this.histoneMesh.material.emissive.setHex(0x042f2e);
        break;
    }

    this.buildDnaStrand(force);
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

    // Thermal Brownian jitter of micro-bead in optical trap
    if (this.trapBeadMesh) {
      const jitterX = (Math.random() - 0.5) * 0.008;
      const jitterY = (Math.random() - 0.5) * 0.008;
      this.trapBeadMesh.position.y = jitterY;
      this.trapBeadMesh.position.z = jitterX;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
