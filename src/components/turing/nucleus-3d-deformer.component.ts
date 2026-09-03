import {
  Component,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  input,
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
  selector: 'app-nucleus-3d-deformer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #canvasContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between">
      
      <!-- Ambient Radial Holographic Grid -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/25 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Floating Telemetry & Controls HUD -->
      <div class="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        <!-- Mechanobiology Readout Badge -->
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-teal-500/40 text-xs font-mono shadow-lg flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span class="text-teal-300 font-bold">3D Deformable Nucleus</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            <span>Pore: <strong class="text-teal-200">{{ poreDiameterNm() }} nm</strong></span>
            <span>•</span>
            <span>LINC Force: <strong class="text-amber-300">{{ lincForcePn() }} pN</strong></span>
            <span>•</span>
            <span>YAP/TAZ: <strong class="text-emerald-300">{{ yapTazRatio() }}x</strong></span>
          </div>
        </div>

        <!-- Camera & Auto-Spin Controls -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 text-xs font-mono shadow-lg">
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
            <span>Nuclear Envelope</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>LINC Tension Cables</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>YAP/TAZ Translocators</span>
          </div>
        </div>
        
        <div class="pointer-events-auto px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>WebGL 2.0 • 60 FPS • Real-Time Strain Tensor</span>
        </div>
      </div>

    </div>
  `
})
export class Nucleus3dDeformerComponent implements AfterViewInit, OnDestroy {
  readonly ecmStiffness = model<number>(8.5);
  readonly actinTension = model<number>(2.4);

  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly isAutoSpinning = signal<boolean>(true);

  // Derived Telemetry Computations
  readonly lincForcePn = computed(() => {
    const ecm = this.ecmStiffness();
    const actin = this.actinTension();
    return Number((2.5 + (ecm * 0.45) + (actin * 1.8)).toFixed(1));
  });

  readonly poreDiameterNm = computed(() => {
    const force = this.lincForcePn();
    return Number((9.2 + Math.min(6.5, force * 0.22)).toFixed(1));
  });

  readonly yapTazRatio = computed(() => {
    const force = this.lincForcePn();
    return Number((0.45 + (force / 6.8)).toFixed(2));
  });

  // Three.js State
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId?: number;

  private nucleusMesh!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>;
  private originalPositions!: Float32Array;
  private tensionLinesGroup = new THREE.Group();
  private yapParticlesGroup = new THREE.Group();
  private npcRingGroup = new THREE.Group();

  constructor() {
    effect(() => {
      // Trigger deformation update when inputs change
      const ecm = this.ecmStiffness();
      const actin = this.actinTension();
      this.updateDeformation(ecm, actin);
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

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.2, 5.2);
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
    this.camera.position.set(0, 2.2, 5.2);

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
    this.controls.autoRotateSpeed = 1.2;
    this.controls.maxDistance = 12;
    this.controls.minDistance = 2.5;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x2dd4bf, 3.5); // Teal light
    dirLight1.position.set(4, 6, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 2.0); // Amber back light
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 4.0, 8); // Emerald internal core glow
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    // 5. Deformable Nuclear Membrane Mesh
    const geom = new THREE.IcosahedronGeometry(1.6, 5);
    this.originalPositions = new Float32Array(geom.attributes['position'].array);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0d9488,
      emissive: 0x042f2e,
      roughness: 0.25,
      metalness: 0.15,
      transmission: 0.65,
      ior: 1.35,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });

    this.nucleusMesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.nucleusMesh);

    // Wireframe overlay for biophysical visual clarity
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const wireMesh = new THREE.Mesh(geom, wireMat);
    this.nucleusMesh.add(wireMesh);

    // 6. SUN-Nesprin Tension Fiber Cables (LINC complex)
    this.buildTensionCables();
    this.scene.add(this.tensionLinesGroup);

    // 7. Nuclear Pore Complex Rings
    this.buildNpcRings();
    this.scene.add(this.npcRingGroup);

    // 8. Fluorescent YAP/TAZ Translocating Particles
    this.buildYapParticles();
    this.scene.add(this.yapParticlesGroup);

    // Initial deformation pass
    this.updateDeformation(this.ecmStiffness(), this.actinTension());

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private buildTensionCables(): void {
    this.tensionLinesGroup.clear();
    const cableCount = 10;
    const outerRadius = 3.6;

    for (let i = 0; i < cableCount; i++) {
      const angle = (i / cableCount) * Math.PI * 2;
      const yOuter = (Math.sin(i * 1.5) * 0.8);
      const outerPoint = new THREE.Vector3(Math.cos(angle) * outerRadius, yOuter, Math.sin(angle) * outerRadius);
      const innerPoint = new THREE.Vector3(Math.cos(angle) * 1.6, yOuter * 0.5, Math.sin(angle) * 1.6);

      const points = [outerPoint, innerPoint];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        linewidth: 2,
        transparent: true,
        opacity: 0.75
      });
      const line = new THREE.Line(lineGeom, lineMat);
      this.tensionLinesGroup.add(line);
    }
  }

  private buildNpcRings(): void {
    this.npcRingGroup.clear();
    const ringCount = 20;
    const ringGeom = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, wireframe: true });

    for (let i = 0; i < ringCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / ringCount);
      const theta = Math.sqrt(ringCount * Math.PI) * phi;
      const ring = new THREE.Mesh(ringGeom, ringMat);
      
      const x = Math.sin(phi) * Math.cos(theta) * 1.62;
      const y = Math.cos(phi) * 1.62;
      const z = Math.sin(phi) * Math.sin(theta) * 1.62;
      
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0);
      this.npcRingGroup.add(ring);
    }
  }

  private buildYapParticles(): void {
    this.yapParticlesGroup.clear();
    const particleCount = 60;
    const sphereGeom = new THREE.SphereGeometry(0.04, 8, 8);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });

    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(sphereGeom, sphereMat);
      // Scatter initially in outer cytoplasm
      const r = 2.0 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      p.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
      (p as any).origRadius = r;
      (p as any).speed = 0.005 + Math.random() * 0.01;
      this.yapParticlesGroup.add(p);
    }
  }

  private updateDeformation(ecm: number, actin: number): void {
    if (!this.nucleusMesh || !this.originalPositions) return;

    // Strain magnitude normalized [0.0, 0.75]
    const strain = Math.min(0.75, (ecm * 0.012 + actin * 0.06));
    const geom = this.nucleusMesh.geometry;
    const pos = geom.attributes['position'];
    const array = pos.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const ox = this.originalPositions[i];
      const oy = this.originalPositions[i + 1];
      const oz = this.originalPositions[i + 2];

      // Vertical flattening (y-axis compression)
      const dy = oy * (1.0 - strain * 0.55);
      // Lateral bulging (x & z expansion)
      const dx = ox * (1.0 + strain * 0.38);
      const dz = oz * (1.0 + strain * 0.38);

      array[i] = dx;
      array[i + 1] = dy;
      array[i + 2] = dz;
    }

    pos.needsUpdate = true;
    geom.computeVertexNormals();

    // Color shift based on strain
    if (this.nucleusMesh.material) {
      if (ecm >= 20.0) {
        this.nucleusMesh.material.color.setHex(0x991b1b); // Red/amber high strain
        this.nucleusMesh.material.emissive.setHex(0x450a0a);
      } else if (ecm >= 10.0) {
        this.nucleusMesh.material.color.setHex(0xd97706); // Amber moderate strain
        this.nucleusMesh.material.emissive.setHex(0x78350f);
      } else {
        this.nucleusMesh.material.color.setHex(0x0d9488); // Teal homeostatic
        this.nucleusMesh.material.emissive.setHex(0x042f2e);
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

    // Animate YAP/TAZ particle migration through nuclear membrane
    const yapTranslocationActive = this.ecmStiffness() >= 10.0;
    this.yapParticlesGroup.children.forEach((child, idx) => {
      const p = child as THREE.Mesh;
      const speed = (p as any).speed || 0.008;

      if (yapTranslocationActive) {
        // Move towards center (nuclear translocation)
        p.position.multiplyScalar(1.0 - speed * 0.8);
        if (p.position.length() < 0.3) {
          // Reset to outer envelope
          const r = 3.2;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          p.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
          );
        }
      } else {
        // Quiescent Brownian oscillation in cytoplasm
        p.position.x += Math.sin(Date.now() * 0.002 + idx) * 0.002;
        p.position.y += Math.cos(Date.now() * 0.002 + idx) * 0.002;
      }
    });

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
