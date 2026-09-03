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
  selector: 'app-crispr-3d-unwinder',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #canvasContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl flex flex-col justify-between">
      
      <!-- Ambient Radial Holographic Grid -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/25 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Floating Telemetry & Controls HUD -->
      <div class="absolute top-3 inset-x-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        <!-- CRISPR R-Loop Readout Badge -->
        <div class="pointer-events-auto px-3 py-1.5 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-teal-500/40 text-xs font-mono shadow-lg flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full"
                  [class.bg-emerald-400]="isProofreadingPassed()"
                  [class.bg-rose-400]="!isProofreadingPassed()"
                  [class.animate-pulse]="isProofreadingPassed()"></span>
            <span class="text-teal-300 font-bold">3D Cas9 R-Loop Engine</span>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[11px] text-zinc-300">
            <span>Net ΔG: <strong class="text-teal-200">{{ netDeltaG() }} kcal/mol</strong></span>
            <span>•</span>
            <span>Seed: <strong [class.text-emerald-300]="isSeedMatched()" [class.text-rose-400]="!isSeedMatched()">{{ isSeedMatched() ? 'MATCHED (1-8)' : 'MISMATCH' }}</strong></span>
            <span>•</span>
            <span>Cleavage: <strong [class.text-emerald-300]="cleavageProbabilityPct() >= 80" [class.text-amber-300]="cleavageProbabilityPct() < 80">{{ cleavageProbabilityPct() }}%</strong></span>
            <span>•</span>
            <span>State: <strong [class.text-emerald-300]="isProofreadingPassed()" [class.text-rose-400]="!isProofreadingPassed()">{{ isProofreadingPassed() ? 'CATALYTICALLY ACTIVE' : 'INCOMPLETE R-LOOP' }}</strong></span>
          </div>
        </div>

        <!-- Camera, Cleave & Auto-Spin Controls -->
        <div class="pointer-events-auto flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1 rounded-xl border border-zinc-800 text-xs font-mono shadow-lg">
          <button (click)="triggerCleavageSpark()"
                  class="px-2.5 py-1 rounded-lg font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30 transition flex items-center gap-1 hover:bg-rose-900 cursor-pointer">
            <span>✂️</span>
            <span>Cleave DSB</span>
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
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Guide RNA (gRNA)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Target DNA Strand</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span>Displaced Non-Target Loop</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Cas9 Bilobed RNP</span>
          </div>
        </div>
        
        <div class="pointer-events-auto px-2.5 py-1 bg-zinc-950/85 backdrop-blur-md rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span>HNH / RuvC Catalysis • Seed Superhelical Torque σ = {{ superhelicalSigma() }}</span>
        </div>
      </div>

    </div>
  `
})
export class Crispr3dUnwinderComponent implements AfterViewInit, OnDestroy {
  readonly guideRna = model<string>('GACUUGACAGUCUACGAUCG');
  readonly targetDna = model<string>('GACTTGACAGTCTACGATCG');
  readonly superhelicalSigma = model<number>(-0.06);

  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly isAutoSpinning = signal<boolean>(true);

  // Energetic & Kinetic Proofreading Computations
  readonly isSeedMatched = computed(() => {
    const g = this.guideRna().toUpperCase().replace(/U/g, 'T');
    const t = this.targetDna().toUpperCase();
    for (let i = 0; i < Math.min(8, g.length, t.length); i++) {
      if (g[i] !== t[i]) return false;
    }
    return true;
  });

  readonly netDeltaG = computed(() => {
    const g = this.guideRna().toUpperCase().replace(/U/g, 'T');
    const t = this.targetDna().toUpperCase();
    let dG = -4.5 + (this.superhelicalSigma() * 15.0); // Superhelical baseline assistance
    const len = Math.min(g.length, t.length, 20);

    for (let i = 0; i < len; i++) {
      const isMatch = g[i] === t[i];
      const isSeed = i < 8;
      if (isMatch) {
        dG -= isSeed ? 1.45 : 0.85;
      } else {
        dG += isSeed ? 4.2 : 2.1;
      }
    }
    return Number(dG.toFixed(1));
  });

  readonly isProofreadingPassed = computed(() => {
    return this.netDeltaG() <= -12.0 && this.isSeedMatched();
  });

  readonly cleavageProbabilityPct = computed(() => {
    if (!this.isProofreadingPassed()) {
      return this.isSeedMatched() ? 12 : 1;
    }
    const dG = this.netDeltaG();
    const p = 1.0 / (1.0 + Math.exp((dG + 11.5) / 2.2));
    return Math.min(99, Math.max(1, Math.round(p * 100)));
  });

  // Three.js State
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId?: number;

  private cas9Lobe1Mesh!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>;
  private cas9Lobe2Mesh!: THREE.Mesh<THREE.IcosahedronGeometry, THREE.MeshPhysicalMaterial>;
  private guideRnaMesh!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
  private targetDnaMesh!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
  private displacedLoopMesh!: THREE.Mesh<THREE.TubeGeometry, THREE.MeshStandardMaterial>;
  private cleavageSparkGroup = new THREE.Group();
  private sparkLife = 0;

  constructor() {
    effect(() => {
      const g = this.guideRna();
      const t = this.targetDna();
      const s = this.superhelicalSigma();
      this.updatePhysics(g, t, s);
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

  triggerCleavageSpark(): void {
    this.sparkLife = 1.0;
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 2.2, 5.5);
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
    this.camera.position.set(0, 2.2, 5.5);

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
    this.controls.autoRotateSpeed = 0.9;
    this.controls.maxDistance = 12;
    this.controls.minDistance = 2.5;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 3.5); // Cyan light
    dirLight1.position.set(4, 6, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 2.5); // Rose light
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    const coreLight = new THREE.PointLight(0x10b981, 4.0, 8); // Emerald core glow
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    // 5. Cas9 Bilobed Clam-Shell Envelope
    // REC Lobe (Recognition Lobe - Cyan/Indigo)
    const recGeom = new THREE.IcosahedronGeometry(1.25, 4);
    const recMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e7490,
      emissive: 0x083344,
      roughness: 0.3,
      metalness: 0.15,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85
    });
    this.cas9Lobe1Mesh = new THREE.Mesh(recGeom, recMat);
    this.cas9Lobe1Mesh.position.set(-0.8, 0.2, 0);
    this.cas9Lobe1Mesh.scale.set(1.1, 0.9, 0.8);
    this.scene.add(this.cas9Lobe1Mesh);

    // NUC Lobe (Nuclease Lobe - Teal/Crimson Catalytic HNH/RuvC)
    const nucGeom = new THREE.IcosahedronGeometry(1.1, 4);
    const nucMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f766e,
      emissive: 0x042f2e,
      roughness: 0.25,
      metalness: 0.15,
      transmission: 0.65,
      transparent: true,
      opacity: 0.85
    });
    this.cas9Lobe2Mesh = new THREE.Mesh(nucGeom, nucMat);
    this.cas9Lobe2Mesh.position.set(0.8, -0.2, 0);
    this.cas9Lobe2Mesh.scale.set(1.0, 0.85, 0.8);
    this.scene.add(this.cas9Lobe2Mesh);

    // 6. Cleavage Sparks Group
    this.buildCleavageSparks();
    this.scene.add(this.cleavageSparkGroup);

    // 7. Dynamic Spline Strands
    this.buildNucleicStrands();

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private buildCleavageSparks(): void {
    this.cleavageSparkGroup.clear();
    const count = 30;
    const sparkGeom = new THREE.SphereGeometry(0.03, 8, 8);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    for (let i = 0; i < count; i++) {
      const s = new THREE.Mesh(sparkGeom, sparkMat);
      s.position.set(0.6, 0, 0);
      (s as any).vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08,
        (Math.random() - 0.5) * 0.08
      );
      this.cleavageSparkGroup.add(s);
    }
  }

  private buildNucleicStrands(): void {
    if (this.guideRnaMesh) {
      this.scene.remove(this.guideRnaMesh);
      this.guideRnaMesh.geometry.dispose();
    }
    if (this.targetDnaMesh) {
      this.scene.remove(this.targetDnaMesh);
      this.targetDnaMesh.geometry.dispose();
    }
    if (this.displacedLoopMesh) {
      this.scene.remove(this.displacedLoopMesh);
      this.displacedLoopMesh.geometry.dispose();
    }

    const proofreading = this.isProofreadingPassed();
    const seedMatch = this.isSeedMatched();

    // 1. Guide RNA (Cyan/Emerald)
    const gPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = -2.2 + (i / 20) * 4.4;
      const angle = (i / 20) * Math.PI * 3.5;
      const y = Math.sin(angle) * 0.28;
      const z = Math.cos(angle) * 0.28;
      gPoints.push(new THREE.Vector3(x, y, z));
    }
    const gCurve = new THREE.CatmullRomCurve3(gPoints);
    const gGeom = new THREE.TubeGeometry(gCurve, 40, 0.045, 8, false);
    const gMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      roughness: 0.2,
      metalness: 0.3
    });
    this.guideRnaMesh = new THREE.Mesh(gGeom, gMat);
    this.scene.add(this.guideRnaMesh);

    // 2. Target DNA Strand (Amber/Gold)
    const tPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = -2.2 + (i / 20) * 4.4;
      const angle = (i / 20) * Math.PI * 3.5 + Math.PI; // Counter-phase
      const y = Math.sin(angle) * 0.28;
      const z = Math.cos(angle) * 0.28;
      tPoints.push(new THREE.Vector3(x, y, z));
    }
    const tCurve = new THREE.CatmullRomCurve3(tPoints);
    const tGeom = new THREE.TubeGeometry(tCurve, 40, 0.045, 8, false);
    const tMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      roughness: 0.2,
      metalness: 0.3
    });
    this.targetDnaMesh = new THREE.Mesh(tGeom, tMat);
    this.scene.add(this.targetDnaMesh);

    // 3. Displaced Non-Target DNA Strand (R-Loop Bubble - Rose/Red)
    const loopPoints: THREE.Vector3[] = [];
    const bubbleBulge = seedMatch ? (proofreading ? 1.05 : 0.65) : 0.25;

    for (let i = 0; i <= 20; i++) {
      const x = -2.2 + (i / 20) * 4.4;
      const progress = i / 20;
      // Parabolic bulge in middle
      const bulge = Math.sin(progress * Math.PI) * bubbleBulge;
      const y = bulge * 0.85;
      const z = bulge * 0.75 + 0.3;
      loopPoints.push(new THREE.Vector3(x, y, z));
    }
    const loopCurve = new THREE.CatmullRomCurve3(loopPoints);
    const loopGeom = new THREE.TubeGeometry(loopCurve, 40, 0.04, 8, false);
    const loopMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0x881337,
      roughness: 0.3,
      metalness: 0.2
    });
    this.displacedLoopMesh = new THREE.Mesh(loopGeom, loopMat);
    this.scene.add(this.displacedLoopMesh);
  }

  private updatePhysics(g: string, t: string, s: number): void {
    if (!this.cas9Lobe1Mesh || !this.cas9Lobe2Mesh) return;

    const proofreading = this.isProofreadingPassed();

    // NUC Lobe Conformational Rotation during Catalysis
    if (proofreading) {
      this.cas9Lobe2Mesh.material.color.setHex(0x10b981); // Active catalytic emerald
      this.cas9Lobe2Mesh.material.emissive.setHex(0x064e3b);
      this.cas9Lobe2Mesh.rotation.z = 0.25;
    } else {
      this.cas9Lobe2Mesh.material.color.setHex(0x0f766e); // Quiescent teal
      this.cas9Lobe2Mesh.material.emissive.setHex(0x042f2e);
      this.cas9Lobe2Mesh.rotation.z = 0;
    }

    this.buildNucleicStrands();
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

    const time = Date.now() * 0.003;

    // Breath / subtle allosteric breathing oscillation of Cas9 lobes
    if (this.cas9Lobe1Mesh && this.cas9Lobe2Mesh) {
      const breath = Math.sin(time) * 0.015;
      this.cas9Lobe1Mesh.position.x = -0.8 - breath;
      this.cas9Lobe2Mesh.position.x = 0.8 + breath;
    }

    // Animate Cleavage Sparks
    if (this.sparkLife > 0) {
      this.sparkLife -= 0.025;
      this.cleavageSparkGroup.children.forEach((c) => {
        const s = c as THREE.Mesh;
        const vel = (s as any).vel as THREE.Vector3;
        if (vel) {
          s.position.add(vel);
        }
      });

      if (this.sparkLife <= 0) {
        // Reset sparks to cleavage center
        this.cleavageSparkGroup.children.forEach((c) => {
          c.position.set(0.6, 0, 0);
        });
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
