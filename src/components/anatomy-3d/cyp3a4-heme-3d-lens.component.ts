import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createCyp3a4HemeMaterial,
  updateCyp3a4HemeUniforms,
  computeCypCatalyticState
} from '../../shaders/cyp3a4-heme-active-site.shader';

export type CypHemePreset =
  | 'resting_fe3'
  | 'substrate_bound'
  | 'compound_1_ferryl_oxo'
  | 'radical_rebound'
  | 'competitive_azole'
  | 'suicide_clarithromycin';

export interface IHemeTelemetry {
  ironValence: string;
  spinState: string;
  soretPeakNm: number;
  ferrylOxoGlow: number;
  hemeIntegrity: number;
  activePhenotype: string;
  reactionDescription: string;
}

@Component({
  selector: 'app-cyp3a4-heme-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-rose-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🧬</span>
              <span>3D Hepatic Cytochrome P450 (CYP3A4 / Heme) Active-Site Slicer (Visual Model V10)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Protoporphyrin IX Heme-b Core • Axial Cys442 Thiolate • Ferryl-Oxo [Fe4+=O] Compound I • ER Membrane Micro-Anchor
            </p>
          </div>
        </div>

        <!-- Master Phenotype Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': currentPreset() === 'resting_fe3' || currentPreset() === 'substrate_bound',
                  'bg-cyan-950/80 border-cyan-600/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse': currentPreset() === 'compound_1_ferryl_oxo',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': currentPreset() === 'radical_rebound' || currentPreset() === 'competitive_azole',
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': currentPreset() === 'suicide_clarithromycin'
                }">
            {{ telemetry().activePhenotype }}
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Catalytic Intermediates:</span>
        <button type="button" (click)="setPreset('resting_fe3')"
                [class.bg-rose-600]="currentPreset() === 'resting_fe3'"
                [class.text-white]="currentPreset() === 'resting_fe3'"
                [class.text-rose-400]="currentPreset() !== 'resting_fe3'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Resting Fe(III) (Aqua)
        </button>
        <button type="button" (click)="setPreset('substrate_bound')"
                [class.bg-amber-600]="currentPreset() === 'substrate_bound'"
                [class.text-white]="currentPreset() === 'substrate_bound'"
                [class.text-amber-400]="currentPreset() !== 'substrate_bound'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Substrate Enters (Type I Shift)
        </button>
        <button type="button" (click)="setPreset('compound_1_ferryl_oxo')"
                [class.bg-cyan-600]="currentPreset() === 'compound_1_ferryl_oxo'"
                [class.text-white]="currentPreset() === 'compound_1_ferryl_oxo'"
                [class.text-cyan-400]="currentPreset() !== 'compound_1_ferryl_oxo'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Compound I [Fe4+=O] Radical
        </button>
        <button type="button" (click)="setPreset('radical_rebound')"
                [class.bg-purple-600]="currentPreset() === 'radical_rebound'"
                [class.text-white]="currentPreset() === 'radical_rebound'"
                [class.text-purple-400]="currentPreset() !== 'radical_rebound'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Radical Rebound &amp; C-H Cleave
        </button>
        <button type="button" (click)="setPreset('competitive_azole')"
                [class.bg-yellow-600]="currentPreset() === 'competitive_azole'"
                [class.text-white]="currentPreset() === 'competitive_azole'"
                [class.text-yellow-400]="currentPreset() !== 'competitive_azole'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Competitive Azole (Type II)
        </button>
        <button type="button" (click)="setPreset('suicide_clarithromycin')"
                [class.bg-rose-700]="currentPreset() === 'suicide_clarithromycin'"
                [class.text-white]="currentPreset() === 'suicide_clarithromycin'"
                [class.text-rose-300]="currentPreset() !== 'suicide_clarithromycin'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Suicide MBI (P420 Degradation)
        </button>
      </div>

      <!-- 3D Canvas Viewport -->
      <div class="relative w-full h-[400px] sm:h-[480px] bg-black cursor-grab active:cursor-grabbing overflow-hidden">
        <div #canvasContainer class="w-full h-full"></div>

        <!-- Floating Live HUD Overlay -->
        <div class="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10 text-xs">
          <div class="px-3 py-2 rounded-xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-md flex flex-col gap-1 shadow-lg">
            <span class="text-[10px] text-zinc-400 uppercase font-bold">Heme Valence &amp; Spin State</span>
            <span class="text-sm font-black text-rose-300">{{ telemetry().ironValence }}</span>
            <span class="text-[11px] text-zinc-400">{{ telemetry().spinState }}</span>
          </div>

          <div class="px-3 py-2 rounded-xl bg-zinc-950/85 border border-zinc-800 backdrop-blur-md flex items-center gap-3 shadow-lg">
            <div>
              <span class="text-[10px] text-zinc-400 uppercase font-bold block">Soret Band</span>
              <span class="text-sm font-black"
                    [class.text-cyan-400]="telemetry().soretPeakNm >= 445"
                    [class.text-amber-400]="telemetry().soretPeakNm < 445 && telemetry().soretPeakNm >= 430"
                    [class.text-rose-400]="telemetry().soretPeakNm < 430">
                {{ telemetry().soretPeakNm.toFixed(0) }} nm
              </span>
            </div>
            <div class="h-6 w-px bg-zinc-800"></div>
            <div>
              <span class="text-[10px] text-zinc-400 uppercase font-bold block">Heme Integrity</span>
              <span class="text-sm font-black"
                    [class.text-emerald-400]="telemetry().hemeIntegrity >= 0.9"
                    [class.text-rose-400]="telemetry().hemeIntegrity < 0.9">
                {{ (telemetry().hemeIntegrity * 100).toFixed(0) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 3D Viewport Controls Hint -->
        <div class="absolute bottom-3 right-3 text-[10px] text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded-md border border-zinc-800 pointer-events-none font-sans">
          Left Drag: Rotate • Right Drag: Pan • Scroll: Zoom
        </div>
      </div>

      <!-- Telemetry Narrative Strip -->
      <div class="p-4 bg-zinc-900/70 border-t border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-bold text-zinc-400">Enzyme Mechanism Dynamics:</span>
          <p class="text-zinc-200 font-sans leading-relaxed">
            {{ telemetry().reactionDescription }}
          </p>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <button type="button" (click)="resetCamera()"
                  class="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 font-bold transition cursor-pointer min-h-[36px]">
            Reset Slices
          </button>
        </div>
      </div>

    </div>
  `
})
export class Cyp3a4Heme3dLensComponent implements AfterViewInit, OnDestroy {
  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  currentPreset = signal<CypHemePreset>('resting_fe3');
  private cyclePhase = signal<number>(0);
  private substrateMode = signal<number>(0);
  private inhibitorConc = signal<number>(1.0);

  telemetry = computed<IHemeTelemetry>(() => {
    const preset = this.currentPreset();
    const phase = this.cyclePhase();
    const mode = this.substrateMode();
    const conc = this.inhibitorConc();

    const state = computeCypCatalyticState(phase, mode, conc);

    let activePhenotype = 'Resting Fe(III)';
    switch (preset) {
      case 'resting_fe3':
        activePhenotype = 'Resting Hexacoordinate Fe(III)';
        break;
      case 'substrate_bound':
        activePhenotype = 'Type I Substrate Bound';
        break;
      case 'compound_1_ferryl_oxo':
        activePhenotype = 'Compound I [Fe4+=O] Radical';
        break;
      case 'radical_rebound':
        activePhenotype = 'Radical Rebound Intermediate';
        break;
      case 'competitive_azole':
        activePhenotype = 'Azole Competitive Block (Type II)';
        break;
      case 'suicide_clarithromycin':
        activePhenotype = 'Suicide MBI (P420 Inactivated)';
        break;
    }

    return {
      ironValence: state.ironValence,
      spinState: state.spinState,
      soretPeakNm: state.soretPeakNm,
      ferrylOxoGlow: state.ferrylOxoGlow,
      hemeIntegrity: state.hemeIntegrity,
      activePhenotype,
      reactionDescription: state.reactionDescription
    };
  });

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private startTimeMs: number = (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // Mesh refs
  private hemeMesh!: THREE.Mesh;
  private hemeMaterial!: THREE.ShaderMaterial;
  private ironAtomMesh!: THREE.Mesh;
  private ferrylOxoAtomMesh!: THREE.Mesh;
  private ferrylBondMesh!: THREE.Mesh;
  private cysThiolMesh!: THREE.Mesh;
  private cysBondMesh!: THREE.Mesh;
  private substrateGroup!: THREE.Group;
  private erBilayerGroup!: THREE.Group;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      try {
        this.initThree();
        if (this.scene) {
          this.buildScene();
          this.animate();
        }
      } catch (err) {
        // Fallback for headless environments without WebGL context
      }
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  setPreset(preset: CypHemePreset): void {
    this.currentPreset.set(preset);

    switch (preset) {
      case 'resting_fe3':
        this.cyclePhase.set(0);
        this.substrateMode.set(0);
        this.inhibitorConc.set(0);
        break;
      case 'substrate_bound':
        this.cyclePhase.set(1);
        this.substrateMode.set(0);
        this.inhibitorConc.set(0);
        break;
      case 'compound_1_ferryl_oxo':
        this.cyclePhase.set(4);
        this.substrateMode.set(0);
        this.inhibitorConc.set(0);
        break;
      case 'radical_rebound':
        this.cyclePhase.set(5);
        this.substrateMode.set(0);
        this.inhibitorConc.set(0);
        break;
      case 'competitive_azole':
        this.cyclePhase.set(4);
        this.substrateMode.set(1); // Azole mode
        this.inhibitorConc.set(2.5);
        break;
      case 'suicide_clarithromycin':
        this.cyclePhase.set(4);
        this.substrateMode.set(2); // Suicide MBI mode
        this.inhibitorConc.set(2.4);
        break;
    }
  }

  resetCamera(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 4.5, 6.5);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  private initThree(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 6.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Ambient & Directional Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 1.5, 15);
    cyanPoint.position.set(0, 1.5, 0);
    this.scene.add(cyanPoint);

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || !this.renderer || !this.camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private buildScene(): void {
    // 1. Planar Porphyrin IX Heme Ring (Plane with Custom Shader)
    const hemeGeo = new THREE.PlaneGeometry(3.6, 3.6, 32, 32);
    hemeGeo.rotateX(-Math.PI / 2); // Lay flat on XZ plane
    this.hemeMaterial = createCyp3a4HemeMaterial();
    this.hemeMesh = new THREE.Mesh(hemeGeo, this.hemeMaterial);
    this.scene.add(this.hemeMesh);

    // 2. Central Iron Atom
    const ironGeo = new THREE.SphereGeometry(0.32, 32, 32);
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Ferric Ruby
      roughness: 0.2,
      metalness: 0.8
    });
    this.ironAtomMesh = new THREE.Mesh(ironGeo, ironMat);
    this.ironAtomMesh.position.set(0, 0, 0);
    this.scene.add(this.ironAtomMesh);

    // 3. Distal Ferryl-Oxo Oxygen Atom & Double Bond
    const oxoGeo = new THREE.SphereGeometry(0.22, 24, 24);
    const oxoMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    this.ferrylOxoAtomMesh = new THREE.Mesh(oxoGeo, oxoMat);
    this.ferrylOxoAtomMesh.position.set(0, 0.95, 0);
    this.scene.add(this.ferrylOxoAtomMesh);

    const bondGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 12);
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5 });
    this.ferrylBondMesh = new THREE.Mesh(bondGeo, bondMat);
    this.ferrylBondMesh.position.set(0, 0.48, 0);
    this.scene.add(this.ferrylBondMesh);

    // 4. Proximal Axial Ligand: Cys442 Thiolate Sulfur
    const cysGeo = new THREE.SphereGeometry(0.26, 24, 24);
    const cysMat = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Sulfur Yellow
      roughness: 0.3,
      metalness: 0.4
    });
    this.cysThiolMesh = new THREE.Mesh(cysGeo, cysMat);
    this.cysThiolMesh.position.set(0, -0.95, 0);
    this.scene.add(this.cysThiolMesh);

    const cysBondGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.65, 12);
    const cysBondMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.5 });
    this.cysBondMesh = new THREE.Mesh(cysBondGeo, cysBondMat);
    this.cysBondMesh.position.set(0, -0.48, 0);
    this.scene.add(this.cysBondMesh);

    // 5. Substrate Molecule Cluster (Simvastatin / Azole / Suicide)
    this.substrateGroup = new THREE.Group();
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.3
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = 0.45;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), substrateMat);
      sphere.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      this.substrateGroup.add(sphere);
    }
    this.substrateGroup.position.set(1.4, 0.9, 0);
    this.scene.add(this.substrateGroup);

    // 6. ER Microsomal Lipid Bilayer (Grid of Phospholipid Polar Heads)
    this.erBilayerGroup = new THREE.Group();
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.6,
      transparent: true,
      opacity: 0.75
    });
    const headGeo = new THREE.SphereGeometry(0.09, 12, 12);
    for (let x = -3.5; x <= 3.5; x += 0.5) {
      for (let z = -3.5; z <= 3.5; z += 0.5) {
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(x, -2.0, z);
        this.erBilayerGroup.add(head);
      }
    }
    this.scene.add(this.erBilayerGroup);

    // 7. Surrounding CYP3A4 Protein Cavity Torus Wireframe (Hydrophobic Pocket)
    const torusGeo = new THREE.TorusGeometry(2.3, 0.4, 16, 48);
    torusGeo.rotateX(Math.PI / 2);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(0, 0.2, 0);
    this.scene.add(torusMesh);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = (performance.now() - this.startTimeMs) * 0.001;
    const phase = this.cyclePhase();
    const mode = this.substrateMode();
    const conc = this.inhibitorConc();

    // Update custom shader uniforms
    if (this.hemeMaterial) {
      updateCyp3a4HemeUniforms(this.hemeMaterial, time, phase, mode, conc);
    }

    // Dynamic Central Iron and Ferryl-Oxo Rendering
    if (this.ironAtomMesh && this.ferrylOxoAtomMesh && this.ferrylBondMesh) {
      const ironMat = this.ironAtomMesh.material as THREE.MeshStandardMaterial;
      const oxoMat = this.ferrylOxoAtomMesh.material as THREE.MeshStandardMaterial;

      if (mode === 2) {
        // MBI Inactivated
        ironMat.color.setHex(0x3f3f46); // Dead gray/zinc
        oxoMat.visible = false;
        this.ferrylBondMesh.visible = false;
      } else if (phase === 4) {
        // Compound I Ferryl-Oxo active
        ironMat.color.setHex(0x06b6d4); // Cyan Radical
        oxoMat.visible = true;
        this.ferrylBondMesh.visible = true;
        oxoMat.emissiveIntensity = 1.0 + Math.sin(time * 6.0) * 0.4;
      } else if (mode === 1) {
        // Azole bound
        ironMat.color.setHex(0xa855f7); // Purple Azole Complex
        oxoMat.visible = false;
        this.ferrylBondMesh.visible = false;
      } else {
        // Resting or reduced
        ironMat.color.setHex(phase >= 2 ? 0xf97316 : 0x991b1b);
        oxoMat.visible = phase === 3;
        this.ferrylBondMesh.visible = phase === 3;
      }
    }

    // Animate Substrate Group Docking / Rotation
    if (this.substrateGroup) {
      if (mode === 1) {
        // Azole locks tightly into distal axial position
        this.substrateGroup.position.lerp(new THREE.Vector3(0, 0.85, 0), 0.08);
      } else if (mode === 2) {
        // Suicide inactivator forms covalent adduct at the pyrrole margin
        this.substrateGroup.position.lerp(new THREE.Vector3(0.8, 0.15, 0.5), 0.08);
      } else if (phase === 0) {
        // Distant substrate
        this.substrateGroup.position.lerp(new THREE.Vector3(2.5, 1.8, 1.2), 0.05);
      } else {
        // Docked in active cavity
        this.substrateGroup.position.lerp(new THREE.Vector3(0.6, 0.95, 0.4), 0.08);
      }
      this.substrateGroup.rotation.y += 0.015;
    }

    // Animate ER Lipid Bilayer Fluid Ripples
    if (this.erBilayerGroup) {
      this.erBilayerGroup.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const wave = Math.sin(mesh.position.x * 2.0 + time * 1.5) * Math.cos(mesh.position.z * 2.0 + time);
        mesh.position.y = -2.0 + wave * 0.08;
      });
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
