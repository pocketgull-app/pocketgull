import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createCyp3a4HemeMaterial,
  updateCyp3a4HemeUniforms,
  computeCatalyticThermodynamics,
  CatalyticStage,
  InhibitorBindingMode
} from '../../shaders/cyp3a4-heme-active-site.shader';

export interface IHemeTelemetry {
  catalyticStage: CatalyticStage;
  stageName: string;
  inhibitorMode: InhibitorBindingMode;
  inhibitorName: string;
  soretPeakNm: number;
  ironState: string;
  coordinationNumber: 5 | 6;
  freeEnergyKcalMol: number;
  spectroscopicSignature: string;
  clinicalImpact: string;
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
              Protoporphyrin IX Heme-b &bull; Proximal Cys442 Thiolate Push &bull; Compound I Ferryl-Oxo &bull; Smooth ER Bilayer Anchor
            </p>
          </div>
        </div>

        <!-- Telemetry Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': activeStage() === 'compound_i_ferryl',
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': activeInhibitor() === 'competitive_azole',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': activeInhibitor() === 'suicide_inactivation',
                  'bg-zinc-900 border-zinc-700 text-zinc-300': activeInhibitor() === 'none' && activeStage() !== 'compound_i_ferryl'
                }">
            Soret: {{ telemetry().soretPeakNm }} nm
          </span>

          <span class="px-3 py-1 rounded-xl text-xs font-bold border border-zinc-700 bg-zinc-900 text-zinc-300">
            Coord: {{ telemetry().coordinationNumber }}-Coord &bull; {{ telemetry().ironState.split(' ')[0] }}
          </span>
        </div>
      </div>

      <!-- Stage & Inhibitor Preset Buttons -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-800 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Catalytic Cycle:</span>
        <button type="button" (click)="setStage('resting_ferric')"
                [class.bg-rose-950]="activeStage() === 'resting_ferric'"
                [class.text-rose-300]="activeStage() === 'resting_ferric'"
                [class.border-rose-700]="activeStage() === 'resting_ferric'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          1. Resting [Fe³⁺-H₂O]
        </button>
        <button type="button" (click)="setStage('substrate_bound')"
                [class.bg-rose-950]="activeStage() === 'substrate_bound'"
                [class.text-rose-300]="activeStage() === 'substrate_bound'"
                [class.border-rose-700]="activeStage() === 'substrate_bound'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          2. Substrate [Fe³⁺-RH]
        </button>
        <button type="button" (click)="setStage('ferrous_dioxy')"
                [class.bg-rose-950]="activeStage() === 'ferrous_dioxy'"
                [class.text-rose-300]="activeStage() === 'ferrous_dioxy'"
                [class.border-rose-700]="activeStage() === 'ferrous_dioxy'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          3. Ferrous Oxy [Fe²⁺-O₂]
        </button>
        <button type="button" (click)="setStage('compound_i_ferryl')"
                [class.bg-rose-600]="activeStage() === 'compound_i_ferryl'"
                [class.text-white]="activeStage() === 'compound_i_ferryl'"
                [class.border-rose-400]="activeStage() === 'compound_i_ferryl'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-rose-700 min-h-[32px] cursor-pointer shadow-lg shadow-rose-900/50">
          ⚡ 4. Compound I [Fe⁴⁺=O]
        </button>
        <button type="button" (click)="setStage('product_rebound')"
                [class.bg-rose-950]="activeStage() === 'product_rebound'"
                [class.text-rose-300]="activeStage() === 'product_rebound'"
                [class.border-rose-700]="activeStage() === 'product_rebound'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          5. Rebound [R-OH]
        </button>

        <div class="h-4 w-px bg-zinc-700 mx-1"></div>
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Inhibitors:</span>
        <button type="button" (click)="setInhibitor('none')"
                [class.bg-zinc-800]="activeInhibitor() === 'none'"
                [class.text-white]="activeInhibitor() === 'none'"
                class="px-2 py-1 rounded-lg border border-zinc-800 font-semibold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          None (Turnover)
        </button>
        <button type="button" (click)="setInhibitor('competitive_azole')"
                [class.bg-emerald-700]="activeInhibitor() === 'competitive_azole'"
                [class.text-white]="activeInhibitor() === 'competitive_azole'"
                class="px-2 py-1 rounded-lg border border-zinc-800 font-semibold transition hover:bg-emerald-800 min-h-[32px] cursor-pointer">
          Ketoconazole (Azole)
        </button>
        <button type="button" (click)="setInhibitor('suicide_inactivation')"
                [class.bg-amber-600]="activeInhibitor() === 'suicide_inactivation'"
                [class.text-white]="activeInhibitor() === 'suicide_inactivation'"
                class="px-2 py-1 rounded-lg border border-zinc-800 font-semibold transition hover:bg-amber-700 min-h-[32px] cursor-pointer">
          Clarithromycin (MBI)
        </button>
      </div>

      <!-- Main 3D Viewport & Control Layout -->
      <div class="relative w-full h-[420px] sm:h-[480px] bg-black">
        <canvas #webglCanvas class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>

        <!-- Dynamic Overlay HUD Card -->
        <div class="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-zinc-950/85 backdrop-blur-md p-4 rounded-2xl border border-zinc-800/80 shadow-2xl z-10">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-black text-rose-400 uppercase tracking-widest">{{ telemetry().stageName }}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-bold">
              &Delta;G&deg;: {{ telemetry().freeEnergyKcalMol }} kcal/mol
            </span>
          </div>

          <p class="text-xs text-zinc-300 font-sans leading-relaxed mb-2">
            {{ telemetry().spectroscopicSignature }}
          </p>

          <div class="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] font-sans">
            <span class="font-bold text-amber-400">Clinical Impact: </span>
            <span class="text-zinc-300">{{ telemetry().clinicalImpact }}</span>
          </div>
        </div>

        <!-- 3D Navigation Watermark -->
        <div class="absolute top-4 right-4 text-[10px] text-zinc-500 font-mono bg-zinc-900/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-zinc-800/50 pointer-events-none hidden sm:block">
          Left Drag: Rotate &bull; Scroll: Zoom &bull; Right Drag: Pan
        </div>
      </div>

      <!-- Bottom Interactive Parameter Sliders -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-zinc-900/40 border-t border-zinc-800 text-xs">
        <!-- Substrate Saturation -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div class="flex justify-between items-center text-zinc-400">
            <span class="font-bold uppercase text-[10px]">Substrate Saturation [S]/Km</span>
            <span class="text-rose-400 font-mono font-bold">{{ (substrateRatio() * 100).toFixed(0) }}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.05"
                 [value]="substrateRatio()"
                 (input)="onSubstrateChange($event)"
                 class="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
          <span class="text-[9px] text-zinc-500">Hydrophobic cavity occupancy (Simvastatin/Midazolam)</span>
        </div>

        <!-- Cys442 Thiolate Push -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div class="flex justify-between items-center text-zinc-400">
            <span class="font-bold uppercase text-[10px]">Cys442 Thiolate Push</span>
            <span class="text-amber-400 font-mono font-bold">{{ thiolatePush().toFixed(2) }}x</span>
          </div>
          <input type="range" min="0.8" max="1.5" step="0.05"
                 [value]="thiolatePush()"
                 (input)="onThiolateChange($event)"
                 class="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
          <span class="text-[9px] text-zinc-500">Axial RS⁻ &pi; electron-donation promoting O-O cleavage</span>
        </div>

        <!-- ER Membrane Fluidity -->
        <div class="flex flex-col gap-1.5 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div class="flex justify-between items-center text-zinc-400">
            <span class="font-bold uppercase text-[10px]">ER Bilayer Fluidity</span>
            <span class="text-cyan-400 font-mono font-bold">{{ membraneFluidity().toFixed(1) }}x</span>
          </div>
          <input type="range" min="0.5" max="2.0" step="0.1"
                 [value]="membraneFluidity()"
                 (input)="onFluidityChange($event)"
                 class="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg">
          <span class="text-[9px] text-zinc-500">Smooth endoplasmic reticulum lipid bilayer oscillation</span>
        </div>
      </div>
    </div>
  `
})
export class Cyp3a4Heme3dLensComponent implements AfterViewInit, OnDestroy {
  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('webglCanvas');

  // Interactive Signals
  readonly activeStage = signal<CatalyticStage>('compound_i_ferryl');
  readonly activeInhibitor = signal<InhibitorBindingMode>('none');
  readonly substrateRatio = signal<number>(0.85);
  readonly thiolatePush = signal<number>(1.2);
  readonly membraneFluidity = signal<number>(1.0);

  // Derived Telemetry
  readonly telemetry = computed<IHemeTelemetry>(() => {
    const stage = this.activeStage();
    const inhibitor = this.activeInhibitor();
    const thermo = computeCatalyticThermodynamics(stage, inhibitor);

    let stageName = 'Compound I [Fe⁴⁺=O] Ferryl Intermediate';
    if (inhibitor === 'competitive_azole') {
      stageName = 'Inhibited: Ketoconazole Azole Trap';
    } else if (inhibitor === 'suicide_inactivation') {
      stageName = 'Inactivated: Clarithromycin Suicide MBI Adduct';
    } else {
      switch (stage) {
        case 'resting_ferric': stageName = 'Stage 1: Resting Ferric [Fe³⁺-H₂O]'; break;
        case 'substrate_bound': stageName = 'Stage 2: Substrate-Bound [Fe³⁺-RH] High-Spin'; break;
        case 'ferrous_dioxy': stageName = 'Stage 3: Ferrous Oxy [Fe²⁺-O₂] Intermediate'; break;
        case 'compound_i_ferryl': stageName = 'Stage 4: High-Valent Compound I Ferryl-Oxo'; break;
        case 'product_rebound': stageName = 'Stage 5: Oxygen Rebound & Product Hydroxylation'; break;
      }
    }

    let clinicalImpact = 'Crucial active species responsible for aliphatic/aromatic drug hydroxylation.';
    if (inhibitor === 'competitive_azole') {
      clinicalImpact = 'Competitive reversible blockade: 10x-15x increase in simvastatin AUC -> Acute rhabdomyolysis hazard.';
    } else if (inhibitor === 'suicide_inactivation') {
      clinicalImpact = 'Irreversible covalent destruction: De novo enzyme synthesis required (t1/2 ~36 hours for CYP3A4 recovery).';
    } else if (stage === 'compound_i_ferryl') {
      clinicalImpact = 'Potent ferryl-oxo oxidant [Fe4+=O] capable of abstracting unactivated C-H bonds with bond energies up to 100 kcal/mol.';
    }

    return {
      catalyticStage: stage,
      stageName,
      inhibitorMode: inhibitor,
      inhibitorName: inhibitor === 'competitive_azole' ? 'Ketoconazole' : (inhibitor === 'suicide_inactivation' ? 'Clarithromycin' : 'None'),
      soretPeakNm: thermo.soretPeakNm,
      ironState: thermo.ironOxidationState,
      coordinationNumber: thermo.coordinationNumber,
      freeEnergyKcalMol: thermo.freeEnergyKcalMol,
      spectroscopicSignature: thermo.spectroscopicSignature,
      clinicalImpact
    };
  });

  // Three.js State
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;
  private hemeMaterial: THREE.ShaderMaterial | null = null;
  private ironMesh: THREE.Mesh | null = null;
  private oxygenMesh: THREE.Mesh | null = null;
  private sulfurMesh: THREE.Mesh | null = null;
  private animFrameId: number | null = null;
  private startTime = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    try {
      this.initThree(canvas);
      this.buildScene();
      this.startTime = performance.now();
      this.animate();
    } catch (e) {
      console.warn('[Cyp3a4Heme3dLens] Three.js initialization skipped or headless:', e);
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
  }

  setStage(stage: CatalyticStage): void {
    this.activeStage.set(stage);
    this.activeInhibitor.set('none');
    this.updateSceneState();
  }

  setInhibitor(mode: InhibitorBindingMode): void {
    this.activeInhibitor.set(mode);
    this.updateSceneState();
  }

  onSubstrateChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.substrateRatio.set(val);
    this.updateSceneState();
  }

  onThiolateChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.thiolatePush.set(val);
    this.updateSceneState();
  }

  onFluidityChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.membraneFluidity.set(val);
    this.updateSceneState();
  }

  private initThree(canvas: HTMLCanvasElement): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050508);

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 450;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.5, 6.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 15;
    this.controls.minDistance = 2;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 8, 5);
    this.scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xf43f5e, 2.0, 10);
    rimLight.position.set(-4, -2, -3);
    this.scene.add(rimLight);
  }

  private buildScene(): void {
    if (!this.scene) return;

    // 1. Protoporphyrin IX Tetrapyrrole Ring
    // Torus / disc geometry representing the planar conjugated porphyrin ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.28, 24, 64);
    this.hemeMaterial = createCyp3a4HemeMaterial({
      catalyticStage: this.activeStage(),
      inhibitorMode: this.activeInhibitor(),
      substrateBindingRatio: this.substrateRatio(),
      thiolatePushIntensity: this.thiolatePush(),
      membraneFluidity: this.membraneFluidity()
    });

    const ringMesh = new THREE.Mesh(ringGeo, this.hemeMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    this.scene.add(ringMesh);

    // 4 Pyrrole Ring Nodes
    const pyrroleGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 5);
    const pyrroleMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.4,
      metalness: 0.2
    });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const pMesh = new THREE.Mesh(pyrroleGeo, pyrroleMat);
      pMesh.position.set(Math.cos(angle) * 1.6, 0, Math.sin(angle) * 1.6);
      this.scene.add(pMesh);
    }

    // 2. Central Coordinating Iron Atom (Fe)
    const ironGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x881337,
      emissiveIntensity: 0.6
    });
    this.ironMesh = new THREE.Mesh(ironGeo, ironMat);
    this.scene.add(this.ironMesh);

    // 3. Distal Oxygen / Ferryl-Oxo Atom (Above Heme Plane, y > 0)
    const oxygenGeo = new THREE.SphereGeometry(0.28, 24, 24);
    const oxygenMat = new THREE.MeshStandardMaterial({
      color: 0xff2a55,
      emissive: 0xff0033,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.2
    });
    this.oxygenMesh = new THREE.Mesh(oxygenGeo, oxygenMat);
    this.oxygenMesh.position.set(0, 0.85, 0);
    this.scene.add(this.oxygenMesh);

    // Coordination bond Fe = O
    const bondDistalGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 12);
    const bondDistalMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const bondDistalMesh = new THREE.Mesh(bondDistalGeo, bondDistalMat);
    bondDistalMesh.position.set(0, 0.42, 0);
    this.scene.add(bondDistalMesh);

    // 4. Proximal Axial Ligand: Cys442 Thiolate Anion (RS⁻) (Below Heme Plane, y < 0)
    const sulfurGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const sulfurMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Bright sulfur yellow
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0xca8a04,
      emissiveIntensity: 0.4
    });
    this.sulfurMesh = new THREE.Mesh(sulfurGeo, sulfurMat);
    this.sulfurMesh.position.set(0, -0.95, 0);
    this.scene.add(this.sulfurMesh);

    // Fe - S coordination bond
    const bondProxGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.95, 12);
    const bondProxMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const bondProxMesh = new THREE.Mesh(bondProxGeo, bondProxMat);
    bondProxMesh.position.set(0, -0.47, 0);
    this.scene.add(bondProxMesh);

    // 5. Smooth ER Lipid Bilayer Floor
    const erPlaneGeo = new THREE.PlaneGeometry(12, 12, 32, 32);
    const erPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x082f49,
      roughness: 0.6,
      metalness: 0.1,
      wireframe: true
    });
    const erPlaneMesh = new THREE.Mesh(erPlaneGeo, erPlaneMat);
    erPlaneMesh.rotation.x = -Math.PI / 2;
    erPlaneMesh.position.y = -2.2;
    this.scene.add(erPlaneMesh);
  }

  private updateSceneState(): void {
    if (!this.hemeMaterial) return;

    updateCyp3a4HemeUniforms(this.hemeMaterial, (performance.now() - this.startTime) / 1000, {
      catalyticStage: this.activeStage(),
      inhibitorMode: this.activeInhibitor(),
      substrateBindingRatio: this.substrateRatio(),
      thiolatePushIntensity: this.thiolatePush(),
      membraneFluidity: this.membraneFluidity()
    });

    // Update Iron and Oxygen meshes visual styling
    if (this.ironMesh && this.oxygenMesh) {
      const stage = this.activeStage();
      const inhibitor = this.activeInhibitor();

      const ironMat = this.ironMesh.material as THREE.MeshStandardMaterial;
      const oxygenMat = this.oxygenMesh.material as THREE.MeshStandardMaterial;

      if (inhibitor === 'competitive_azole') {
        ironMat.color.setHex(0x10b981); // Emerald
        ironMat.emissive.setHex(0x047857);
        this.oxygenMesh.visible = false;
      } else if (inhibitor === 'suicide_inactivation') {
        ironMat.color.setHex(0xf59e0b); // Amber
        ironMat.emissive.setHex(0xb45309);
        this.oxygenMesh.visible = true;
        oxygenMat.color.setHex(0xd97706);
      } else {
        this.oxygenMesh.visible = true;
        switch (stage) {
          case 'resting_ferric':
            ironMat.color.setHex(0xe11d48);
            ironMat.emissive.setHex(0x881337);
            oxygenMat.color.setHex(0x38bdf8); // H2O water ligand
            break;
          case 'substrate_bound':
            ironMat.color.setHex(0xf43f5e);
            ironMat.emissive.setHex(0x9f1239);
            this.oxygenMesh.visible = false; // Displaced water
            break;
          case 'ferrous_dioxy':
            ironMat.color.setHex(0xfb7185);
            ironMat.emissive.setHex(0xe11d48);
            oxygenMat.color.setHex(0xff0044); // O2
            break;
          case 'compound_i_ferryl':
            ironMat.color.setHex(0xffffff); // Luminous ferryl core
            ironMat.emissive.setHex(0xf43f5e);
            ironMat.emissiveIntensity = 1.2;
            oxygenMat.color.setHex(0xffedd5); // Oxo radical
            oxygenMat.emissiveIntensity = 1.5;
            break;
          case 'product_rebound':
            ironMat.color.setHex(0xe11d48);
            ironMat.emissive.setHex(0x881337);
            oxygenMat.color.setHex(0xa855f7); // Hydroxylated product
            break;
        }
      }
    }
  }

  private animate(): void {
    this.animFrameId = requestAnimationFrame(() => this.animate());

    const elapsed = (performance.now() - this.startTime) / 1000;

    if (this.controls) {
      this.controls.update();
    }

    if (this.hemeMaterial) {
      this.hemeMaterial.uniforms['uTime'].value = elapsed;
    }

    // Dynamic rotation of heme active site
    if (this.scene) {
      this.scene.rotation.y = elapsed * 0.08;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
