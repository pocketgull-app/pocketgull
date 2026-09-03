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
  selector: 'app-chromatin-3d-fiber',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #canvasContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between">
      
      <!-- Ambient Radial Holographic Grid -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/25 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Floating Telemetry & Controls HUD -->
      <div class="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        <!-- Extrusion Telemetry Readout Badge -->
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-teal-500/40 text-xs font-mono shadow-lg flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span class="text-teal-300 font-bold">3D Cohesin Extruder</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            <span>TAD Insulation: <strong class="text-teal-200">{{ tadInsulationScore() }}</strong></span>
            <span>•</span>
            <span>Fractal γ: <strong class="text-emerald-300">{{ fractalGamma() }}</strong></span>
            <span>•</span>
            <span>Middle CTCF: <strong [class.text-emerald-300]="!hasCtcfMutation()" [class.text-rose-400]="hasCtcfMutation()">{{ hasCtcfMutation() ? 'DELETED / FUSED TAD' : 'INTACT' }}</strong></span>
            <span>•</span>
            <span>Loop Span: <strong class="text-amber-300">{{ currentLoopSpanKb() }} kb</strong></span>
          </div>
        </div>

        <!-- Camera, Extrusion Pulse & Auto-Spin Controls -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 text-xs font-mono shadow-lg">
          <button (click)="toggleCtcfMutation()"
                  [class.bg-rose-950]="hasCtcfMutation()"
                  [class.text-rose-300]="hasCtcfMutation()"
                  [class.border-rose-500]="hasCtcfMutation()"
                  [class.bg-zinc-900]="!hasCtcfMutation()"
                  [class.text-zinc-300]="!hasCtcfMutation()"
                  class="px-2.5 py-1 rounded-lg font-bold border border-zinc-700 transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer">
            <span>🧬</span>
            <span>{{ hasCtcfMutation() ? 'Restore CTCF' : 'Delete CTCF' }}</span>
          </button>
          <button (click)="toggleAutoSpin()"
                  [class.bg-teal-500]="isAutoSpinning()"
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
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Chromatin Polymer Fiber</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Cohesin Motor Ring</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Convergent CTCF Anchors</span>
          </div>
        </div>
        
        <div class="pointer-events-auto px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>Bead-Spring Polymer Model • Langevin Dynamics • Cohesin v = {{ cohesinSpeed() }} kb/s</span>
        </div>
      </div>

    </div>
  `
})
export class Chromatin3dFiberComponent implements AfterViewInit, OnDestroy {
  readonly cohesinSpeed = model<number>(1.0);
  readonly ctcfPermeability = model<number>(0.20);
  readonly hasCtcfMutation = model<boolean>(false);

  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly isAutoSpinning = signal<boolean>(true);

  // Derived Polymer & TAD Insulation Telemetry
  readonly tadInsulationScore = computed(() => {
    if (this.hasCtcfMutation()) {
      return 0.38; // Fused TAD insulation collapse
    }
    const speed = this.cohesinSpeed();
    const perm = this.ctcfPermeability();
    return Number((0.82 - (perm * 0.35) + (speed * 0.05)).toFixed(2));
  });

  readonly fractalGamma = computed(() => {
    return this.hasCtcfMutation() ? 0.88 : 1.02;
  });

  readonly currentLoopSpanKb = computed(() => {
    return this.hasCtcfMutation() ? 1000 : 500;
  });

  // Three.js State
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId?: number;

  private fiberMesh!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
  private cohesinRingMesh!: THREE.Mesh<THREE.TorusGeometry, THREE.MeshPhysicalMaterial>;
  private ctcfAnchor1Mesh!: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>;
  private ctcfAnchor2Mesh!: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>;
  private ctcfAnchor3Mesh!: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshStandardMaterial>;
  private loopExtrusionProgress = 0;

  constructor() {
    effect(() => {
      const speed = this.cohesinSpeed();
      const mutation = this.hasCtcfMutation();
      this.updatePhysics(speed, mutation);
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    if (this.renderer && this.scene && this.camera) {
      this.animate();
    }
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

  toggleCtcfMutation(): void {
    this.hasCtcfMutation.update(v => !v);
  }

  toggleAutoSpin(): void {
    this.isAutoSpinning.update(v => !v);
    if (this.controls) {
      this.controls.autoRotate = this.isAutoSpinning();
    }
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.5, 6.2);
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
    this.controls.maxDistance = 14;
    this.controls.minDistance = 2.5;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x2dd4bf, 3.5); // Teal light
    dirLight1.position.set(4, 6, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.5); // Amber light
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x10b981, 3.5, 8); // Emerald core glow
    coreLight.position.set(0, 1.2, 0);
    this.scene.add(coreLight);

    // 5. Cohesin Ring Motor Torus
    const ringGeom = new THREE.TorusGeometry(0.38, 0.08, 16, 32);
    const ringMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      roughness: 0.2,
      metalness: 0.6,
      transmission: 0.3
    });
    this.cohesinRingMesh = new THREE.Mesh(ringGeom, ringMat);
    this.cohesinRingMesh.position.set(0, 0, 0);
    this.cohesinRingMesh.rotation.x = Math.PI / 2;
    this.scene.add(this.cohesinRingMesh);

    // 6. CTCF Anchors (Octahedron Diamond Meshes)
    const ctcfGeom = new THREE.OctahedronGeometry(0.22);
    
    // Anchor 1 (Left 500 kb)
    const ctcfMat1 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    this.ctcfAnchor1Mesh = new THREE.Mesh(ctcfGeom, ctcfMat1);
    this.ctcfAnchor1Mesh.position.set(-2.0, 0, 0);
    this.scene.add(this.ctcfAnchor1Mesh);

    // Anchor 2 (Middle 1000 kb)
    const ctcfMat2 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    this.ctcfAnchor2Mesh = new THREE.Mesh(ctcfGeom, ctcfMat2);
    this.ctcfAnchor2Mesh.position.set(0, 0, 0);
    this.scene.add(this.ctcfAnchor2Mesh);

    // Anchor 3 (Right 1500 kb)
    const ctcfMat3 = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    this.ctcfAnchor3Mesh = new THREE.Mesh(ctcfGeom, ctcfMat3);
    this.ctcfAnchor3Mesh.position.set(2.0, 0, 0);
    this.scene.add(this.ctcfAnchor3Mesh);

    // 7. Initial Fiber Construction
    this.buildFiber(0);

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private buildFiber(apexHeight: number): void {
    if (!this.scene) return;
    if (this.fiberMesh) {
      this.scene.remove(this.fiberMesh);
      this.fiberMesh.geometry.dispose();
    }

    const mutation = this.hasCtcfMutation();
    const points: THREE.Vector3[] = [];

    // Base entry strand
    points.push(new THREE.Vector3(-3.2, 0, 0));
    points.push(new THREE.Vector3(-2.0, 0, 0));

    if (mutation) {
      // Mega-TAD Extrusion (skips middle CTCF, extends from -2.0 to +2.0)
      const h = Math.max(1.2, 1.8 + apexHeight);
      points.push(new THREE.Vector3(-1.4, h * 0.5, 0.4));
      points.push(new THREE.Vector3(0, h, 0));
      points.push(new THREE.Vector3(1.4, h * 0.5, -0.4));
      points.push(new THREE.Vector3(2.0, 0, 0));
      points.push(new THREE.Vector3(3.2, 0, 0));
    } else {
      // Classical Canonical TAD Extrusion (TAD 1: -2.0 to 0.0, TAD 2: 0.0 to 2.0)
      const h1 = Math.max(0.8, 1.3 + apexHeight);
      const h2 = Math.max(0.7, 1.1 + Math.sin(Date.now() * 0.002) * 0.2);

      // Loop 1
      points.push(new THREE.Vector3(-1.5, h1 * 0.6, 0.3));
      points.push(new THREE.Vector3(-1.0, h1, 0));
      points.push(new THREE.Vector3(-0.5, h1 * 0.6, -0.3));
      points.push(new THREE.Vector3(0, 0, 0));

      // Loop 2
      points.push(new THREE.Vector3(0.5, h2 * 0.6, 0.3));
      points.push(new THREE.Vector3(1.0, h2, 0));
      points.push(new THREE.Vector3(1.5, h2 * 0.6, -0.3));
      points.push(new THREE.Vector3(2.0, 0, 0));
      points.push(new THREE.Vector3(3.2, 0, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.05, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      emissive: 0x042f2e,
      roughness: 0.25,
      metalness: 0.2
    });

    this.fiberMesh = new THREE.Mesh(tubeGeom, tubeMat);
    this.scene.add(this.fiberMesh);
  }

  private updatePhysics(speed: number, mutation: boolean): void {
    if (!this.ctcfAnchor2Mesh) return;

    if (mutation) {
      // Middle CTCF is deleted/mutated: red broken wireframe
      this.ctcfAnchor2Mesh.material.color.setHex(0xef4444);
      this.ctcfAnchor2Mesh.material.wireframe = true;
      this.cohesinRingMesh.position.set(0, 0, 0);
    } else {
      // Intact middle CTCF: amber solid
      this.ctcfAnchor2Mesh.material.color.setHex(0xf59e0b);
      this.ctcfAnchor2Mesh.material.wireframe = false;
      this.cohesinRingMesh.position.set(-1.0, 0.3, 0);
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
    if (!this.renderer || !this.scene || !this.camera) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    const time = Date.now() * 0.002;
    const speed = this.cohesinSpeed();
    this.loopExtrusionProgress += 0.015 * speed;

    // Extrusion breathing oscillation of loop height
    const apexHeight = Math.sin(this.loopExtrusionProgress) * 0.3;
    this.buildFiber(apexHeight);

    // Cohesin Motor Torus rotation
    if (this.cohesinRingMesh) {
      this.cohesinRingMesh.rotation.z += 0.02 * speed;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
