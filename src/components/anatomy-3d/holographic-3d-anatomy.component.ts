import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, effect, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThemeService } from '../../services/theme.service';
import { PatientStateService } from '../../services/patient-state.service';

export type SpatialLensType = 'western' | 'tcm' | 'ayurveda' | 'unified';

@Component({
  selector: 'app-holographic-3d-anatomy',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #rendererContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
      
      <!-- Dark Radial Holographic Grid Backdrop -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-zinc-950/90 to-black z-0"></div>

      <!-- Floating 3D Hologram HUD Controls -->
      <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 text-xs font-mono">
        
        <!-- Spatial Lens Selector -->
        <div class="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button (click)="setLens('western')" 
            data-testid="lens-western"
            [class.bg-cyan-500]="activeLens() === 'western'"
            [class.text-zinc-950]="activeLens() === 'western'"
            [class.text-cyan-400]="activeLens() !== 'western'"
            class="px-2 py-1 rounded-lg font-bold transition text-[10px]">
            🩺 Western
          </button>
          <button (click)="setLens('tcm')" 
            data-testid="lens-tcm"
            [class.bg-emerald-500]="activeLens() === 'tcm'"
            [class.text-zinc-950]="activeLens() === 'tcm'"
            [class.text-emerald-400]="activeLens() !== 'tcm'"
            class="px-2 py-1 rounded-lg font-bold transition text-[10px]">
            🌿 TCM
          </button>
          <button (click)="setLens('ayurveda')" 
            data-testid="lens-ayurveda"
            [class.bg-purple-500]="activeLens() === 'ayurveda'"
            [class.text-zinc-950]="activeLens() === 'ayurveda'"
            [class.text-purple-400]="activeLens() !== 'ayurveda'"
            class="px-2 py-1 rounded-lg font-bold transition text-[10px]">
            🧘 Prana
          </button>
          <button (click)="setLens('unified')" 
            data-testid="lens-unified"
            [class.bg-amber-400]="activeLens() === 'unified'"
            [class.text-zinc-950]="activeLens() === 'unified'"
            [class.text-amber-300]="activeLens() !== 'unified'"
            class="px-2 py-1 rounded-lg font-bold transition text-[10px]">
            🔮 Unified
          </button>
        </div>

        <!-- ANS Vagal Tone 0.1Hz Pulse Toggle -->
        <button (click)="toggleAnsVagal()" 
          data-testid="btn-ans-vagal"
          [class.bg-teal-500]="isAnsVagalActive()"
          [class.text-zinc-950]="isAnsVagalActive()"
          [class.text-teal-300]="!isAnsVagalActive()"
          class="px-2 py-1 rounded-xl font-bold transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer text-[10px]">
          <span>⚡</span>
          <span>{{ isAnsVagalActive() ? '0.1Hz ON' : 'ANS Vagal' }}</span>
        </button>

        <!-- 32-Tooth Odontogram Toggle -->
        <button (click)="toggleDentalArch()" 
          data-testid="btn-dental-arch"
          [class.bg-emerald-500]="isDentalArchActive()"
          [class.text-zinc-950]="isDentalArchActive()"
          [class.text-emerald-300]="!isDentalArchActive()"
          class="px-2 py-1 rounded-xl font-bold transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer text-[10px]">
          <span>🦷</span>
          <span>{{ isDentalArchActive() ? 'Dental 32' : 'Odontogram' }}</span>
        </button>

        <!-- 360° Auto-Spin Toggle -->
        <button (click)="toggleAutoSpin()" 
          data-testid="btn-360-spin"
          [class.bg-cyan-500]="isAutoSpinning()"
          [class.text-zinc-950]="isAutoSpinning()"
          [class.text-zinc-300]="!isAutoSpinning()"
          class="px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1 hover:bg-zinc-800 cursor-pointer">
          <span [class.animate-spin]="isAutoSpinning()">🔄</span>
          <span>{{ isAutoSpinning() ? 'Spin ON' : '360°' }}</span>
        </button>

        <!-- Reset Camera -->
        <button (click)="resetCameraView()" class="px-2.5 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold hover:bg-zinc-800 transition cursor-pointer">
          🎯 Reset
        </button>
      </div>

      <!-- ANS Vagal Tone Pacing & HRV Telemetry Banner -->
      @if (isAnsVagalActive()) {
        <div class="absolute top-16 left-3 z-30 p-2 px-3 rounded-xl bg-zinc-950/85 border border-teal-500/40 backdrop-blur-md font-mono text-[11px] text-teal-300 flex items-center gap-2 shadow-lg">
          <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
          <span>ANS Vagal Resonance: <strong class="text-teal-200">0.10 Hz (10s cycle)</strong></span>
          <span class="text-zinc-500">|</span>
          <span>HRV: <strong class="text-white">{{ currentHrv() }} ms</strong></span>
          <span class="text-zinc-500">|</span>
          <span class="text-emerald-400 font-semibold">Parasympathetic Baroreflex</span>
        </div>
      }

      <!-- Telemetry Holographic Lens Badge -->
      <div data-testid="telemetry-lens-badge" class="absolute bottom-3 left-3 z-30 p-2.5 px-4 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md font-mono text-xs">
        <div class="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active Spatial Lens</div>
        <div class="font-bold capitalize flex items-center gap-2 mt-0.5"
          [class.text-cyan-400]="activeLens() === 'western'"
          [class.text-emerald-400]="activeLens() === 'tcm'"
          [class.text-purple-400]="activeLens() === 'ayurveda'"
          [class.text-amber-400]="activeLens() === 'unified'">
          <span>{{ getLensEmoji() }}</span>
          <span>{{ activeLens() }} Spatial Matrix</span>
        </div>
      </div>

      <!-- Hover Node Live Telemetry Floating Tooltip -->
      @if (hoveredNode(); as hover) {
        <div [style.left.px]="hoverPos().x" [style.top.px]="hoverPos().y"
             class="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-zinc-950/90 border border-cyan-500/50 rounded-xl backdrop-blur-md shadow-2xl font-mono text-[11px] text-cyan-300 flex flex-col gap-0.5 animate-in fade-in duration-150">
          <div class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>{{ hover.name }}</span>
          </div>
          <div class="text-[10px] text-zinc-400">SNOMED-CT: <span class="text-cyan-300 font-semibold">{{ hover.snomedCode }}</span></div>
          <div class="text-[10px] text-zinc-400">TCM Organ Clock: <span class="text-emerald-400 font-semibold">{{ hover.tcmClock }}</span></div>
          <div class="text-[10px] text-zinc-400">Prana Freq: <span class="text-purple-400 font-semibold">{{ hover.pranaFreq }}</span></div>
        </div>
      }

      <!-- Floating Edwin Smith Surgical Codex Telemetry Card -->
      @if (selectedAnatomicalNode(); as node) {
        @let codex = getEdwinSmithCase(node.id);
        <div class="absolute bottom-16 left-3 right-3 sm:right-auto sm:max-w-md z-40 p-4 rounded-2xl bg-zinc-950/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl text-xs space-y-2.5 font-sans animate-in fade-in duration-300">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">📜</span>
              <span class="font-bold text-cyan-400 uppercase tracking-wider font-mono text-[11px]">
                Edwin Smith Codex {{ codex.caseNumber }}
              </span>
            </div>
            <button (click)="selectedAnatomicalNode.set(null)" class="text-zinc-400 hover:text-white px-2 py-0.5 rounded font-mono hover:bg-zinc-800 transition">✕</button>
          </div>
          
          <div class="space-y-1">
            <h4 class="font-bold text-zinc-100">{{ codex.title }}</h4>
            <div class="px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20 font-semibold">
              ⚖️ {{ codex.traumaClassification }}
            </div>
          </div>

          <p class="text-[11px] text-zinc-300 italic leading-relaxed bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80">
            "{{ codex.hieroglyphicTranslation }}"
          </p>

          <div class="text-[10px] font-mono text-cyan-300/90 pt-1 border-t border-zinc-800/60">
            🔬 PBR Biophysical Substrate: <span class="text-zinc-200">{{ codex.biophysicalSubstrate }}</span>
          </div>
        </div>
      }

      <!-- Teledentistry SIBI Cross-Talk Dossier Card -->
      @if (selectedTooth(); as tooth) {
        <div class="absolute bottom-16 right-3 sm:max-w-sm z-40 p-4 rounded-2xl bg-zinc-950/95 border border-emerald-500/50 backdrop-blur-xl shadow-2xl text-xs space-y-2.5 font-sans animate-in fade-in duration-200">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">🦷</span>
              <span class="font-bold text-emerald-400 uppercase tracking-wider font-mono text-[11px]">
                FDI #{{ tooth.fdiCode }} {{ tooth.name }}
              </span>
            </div>
            <button (click)="selectedTooth.set(null)" class="text-zinc-400 hover:text-white px-2 py-0.5 rounded font-mono hover:bg-zinc-800 transition">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-zinc-500 block">Probing Depth</span>
              <span class="text-sm font-bold" [class.text-rose-400]="tooth.ppd >= 4" [class.text-emerald-400]="tooth.ppd < 4">
                {{ tooth.ppd }} mm
              </span>
            </div>
            <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
              <span class="text-zinc-500 block">Bleeding on Probing</span>
              <span class="text-sm font-bold" [class.text-rose-400]="tooth.bop" [class.text-emerald-400]="!tooth.bop">
                {{ tooth.bop ? 'POS (+)' : 'NEG (-)' }}
              </span>
            </div>
          </div>

          <!-- SIBI Trajectory Cross-Talk -->
          <div class="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/30 space-y-1">
            <div class="flex justify-between items-center text-[10px] font-mono">
              <span class="text-teal-300 font-bold uppercase">SIBI Index:</span>
              <span class="text-teal-200 font-extrabold">{{ tooth.sibiScore }}/100</span>
            </div>
            <div class="text-[10px] text-zinc-300">
              🫀 CV Risk Multiplier: <strong class="text-amber-300">{{ tooth.cvRiskMultiplier }}x</strong>
            </div>
            <div class="text-[10px] text-zinc-300">
              🩸 HbA1c Trajectory: <strong class="text-rose-300">+{{ tooth.hba1cIncrease }}%</strong>
            </div>
            <div class="text-[9px] text-zinc-400 italic pt-1 border-t border-teal-500/20">
              P. gingivalis trans-epithelial bacteremia cross-talk
            </div>
          </div>
        </div>
      }

      <!-- WebGL Test Environment Fallback Banner -->
      @if (isWebGLFallback()) {
        <div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-zinc-950/90 backdrop-blur-md text-zinc-300">
          <span class="text-3xl mb-2">🦴</span>
          <h4 class="text-base font-bold text-cyan-400">Holographic 3D Spatial Anatomy Viewer</h4>
          <p class="text-xs text-zinc-400 max-w-sm mt-1">WebGL rendering simulated in automated test mode. Interactive 3D skeletal mesh active.</p>
        </div>
      }

    </div>
  `
})
export class Holographic3DAnatomyComponent implements AfterViewInit, OnDestroy {
  private readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');
  readonly themeService = inject(ThemeService);
  readonly state = inject(PatientStateService);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animationId?: number;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private skeletalGroup = new THREE.Group();
  private tcmMeridianGroup = new THREE.Group();
  private ayurvedicChakraGroup = new THREE.Group();
  private ansVagalGroup = new THREE.Group();
  private dentalArchGroup = new THREE.Group();
  private symptomAnchorGroup = new THREE.Group();
  private targetCameraPos: THREE.Vector3 | null = null;
  private vagusMaterial?: THREE.MeshPhysicalMaterial;
  private spinalGateNodes: THREE.Mesh[] = [];
  private pathologicalTeeth: THREE.Mesh[] = [];

  readonly isAutoSpinning = signal<boolean>(false);
  readonly isWebGLFallback = signal<boolean>(false);
  readonly activeLens = signal<SpatialLensType>('western');
  readonly isAnsVagalActive = signal<boolean>(true);
  readonly isDentalArchActive = signal<boolean>(true);
  readonly selectedAnatomicalNode = signal<{ id: string; name: string; position: string } | null>(null);
  readonly hoveredNode = signal<{ name: string; snomedCode: string; tcmClock: string; pranaFreq: string } | null>(null);
  readonly hoverPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  readonly currentHrv = computed(() => {
    const v = this.state.vitals()?.hrv;
    return v ? parseInt(v, 10) || 65 : 65;
  });

  readonly selectedTooth = signal<{
    fdiCode: number;
    name: string;
    ppd: number;
    bop: boolean;
    wearGrade: number;
    sibiScore: number;
    cvRiskMultiplier: string;
    hba1cIncrease: string;
  } | null>(null);

  private handlePointerDown(event: PointerEvent) {
    const el = this.rendererContainer()?.nativeElement;
    if (!el || !this.camera || !this.scene) return;

    const rect = el.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      [this.skeletalGroup, this.tcmMeridianGroup, this.ayurvedicChakraGroup, this.dentalArchGroup, this.ansVagalGroup],
      true
    );

    if (intersects.length > 0) {
      const hit = intersects[0];
      const point = hit.point;

      // Check if user clicked on a 3D tooth in the dental arch
      if (hit.object.userData?.isTooth) {
        const u = hit.object.userData;
        this.selectedTooth.set({
          fdiCode: u.fdiCode,
          name: u.name,
          ppd: u.ppd,
          bop: u.bop,
          wearGrade: u.wearGrade,
          sibiScore: u.sibiScore,
          cvRiskMultiplier: u.cvRiskMultiplier,
          hba1cIncrease: u.hba1cIncrease
        });
        // Smoothly focus camera onto oral cavity / jaw region
        this.targetCameraPos = new THREE.Vector3(0, 1.80, 0.85);
        return;
      }

      // Add a glowing crimson 3D symptom anchor particle at intersection
      const anchorMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const anchorMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), anchorMat);
      anchorMesh.position.copy(point);
      this.symptomAnchorGroup.add(anchorMesh);

      // Determine anatomical location name based on Y coordinate
      let name = 'Lumbar Vertebrae L4-L5';
      let id = 'l4_l5';
      if (point.y > 1.6) { name = 'Cervical Spine C3-C5 & TMJ'; id = 'c3_c5_tmj'; }
      else if (point.y > 1.2) { name = 'Thoracic Spine & Scapula'; id = 't_spine'; }
      else if (point.y > 0.8) { name = 'Lumbar Spine L4-L5'; id = 'l4_l5'; }
      else if (point.y > 0.4) { name = 'Pelvic Girdle & Sacroiliac Joint'; id = 'pelvis'; }
      else { name = 'FDI Tooth #19 / Lower Extremity Node'; id = 'fdi_19'; }

      const posStr = `x: ${point.x.toFixed(2)}, y: ${point.y.toFixed(2)}, z: ${point.z.toFixed(2)}`;
      this.selectedAnatomicalNode.set({ id, name, position: posStr });

      // Target camera to focus on selected anatomical node smoothly
      this.targetCameraPos = new THREE.Vector3(point.x * 0.5, point.y + 0.2, point.z + 2.0);

      // Register issue in central PatientStateService matching IBodyPartIssue
      const currentIssues = this.state.issues();
      const issue = {
        id,
        noteId: `note_${Date.now()}`,
        name,
        painLevel: 6,
        description: `Pain / Symptom Heatmap Anchor at ${name} (${posStr})`,
        symptoms: [`3D Skeletal Raycast Heatmap Anchor (${posStr})`],
        recommendation: 'Targeted physical therapy & postural realignment.'
      };

      const updated = {
        ...currentIssues,
        [id]: [issue]
      };
      this.state.issues.set(updated);
    }
  }

  constructor() {
    effect(() => {
      const philosophy = this.themeService.activeParadigm();
      this.activeLens.set(philosophy);
    });
  }

  ngAfterViewInit() {
    this.initThreeJs();
  }

  setLens(lens: SpatialLensType) {
    this.activeLens.set(lens);
    this.updateLensVisibility();
  }

  getLensEmoji(): string {
    switch (this.activeLens()) {
      case 'western': return '🩺';
      case 'tcm': return '🌿';
      case 'ayurveda': return '🧘';
      case 'unified': return '🔮';
    }
  }

  private initThreeJs() {
    const el = this.rendererContainer()?.nativeElement;
    if (!el) return;

    try {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 1.2, 3.2);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(el.clientWidth, el.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;

      this.buildProceduralSkeletalMesh();
      this.buildTCMMeridians();
      this.buildAyurvedicChakras();
      this.buildAnsVagalToneNetwork();
      this.buildTeledentistry32Arch();

      this.scene.add(this.skeletalGroup);
      this.scene.add(this.tcmMeridianGroup);
      this.scene.add(this.ayurvedicChakraGroup);
      this.scene.add(this.ansVagalGroup);
      this.scene.add(this.dentalArchGroup);
      this.scene.add(this.symptomAnchorGroup);

      el.addEventListener('pointerdown', (evt) => this.handlePointerDown(evt));
      el.addEventListener('pointermove', (evt) => this.handlePointerMove(evt));

      this.updateLensVisibility();
      this.animate();
    } catch (e) {
      console.warn('WebGL context unavailable in test runner. Operating in fallback mode.');
      this.isWebGLFallback.set(true);
    }
  }

  private heartMesh?: THREE.Mesh;
  private heartMaterial?: THREE.MeshPhysicalMaterial;

  private buildProceduralSkeletalMesh() {
    // ==========================================
    // 1. Translucent Human Body Silhouette Membrane
    // ==========================================
    const bodyMembraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.45,
      ior: 1.35,
      thickness: 2.0
    });

    // Torso capsule
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.85, 16, 24), bodyMembraneMat);
    torso.position.set(0, 0.95, 0);
    this.skeletalGroup.add(torso);

    // ==========================================
    // 2. Cerebral Cortex, Brainstem & Descending Pain Modulatory Axis
    // ==========================================
    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.4,
      transparent: true,
      opacity: 0.95
    });

    // Sagittal Cerebral Hemispheres (Convoluted surface)
    const leftHemi = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 3), brainMat);
    leftHemi.position.set(-0.09, 1.82, 0.02);
    leftHemi.scale.set(0.9, 1.1, 1.3);
    this.skeletalGroup.add(leftHemi);

    const rightHemi = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 3), brainMat);
    rightHemi.position.set(0.09, 1.82, 0.02);
    rightHemi.scale.set(0.9, 1.1, 1.3);
    this.skeletalGroup.add(rightHemi);

    // Brainstem & Periaqueductal Gray (PAG)
    const pagMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.1
    });
    const pagNode = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), pagMat);
    pagNode.position.set(0, 1.68, 0.04);
    this.skeletalGroup.add(pagNode);

    // ==========================================
    // 3. Spinal Column & Descending Inhibitory Pathway
    // ==========================================
    const boneMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xe2e8f0, 
      roughness: 0.35, 
      metalness: 0.05, 
      clearcoat: 0.8, 
      clearcoatRoughness: 0.15, 
      emissive: 0x0284c7, 
      emissiveIntensity: 0.2 
    });
    
    // 16 Vertebral segments with intervertebral discs
    for (let i = 0; i < 16; i++) {
      const y = 0.28 + i * 0.085;
      const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.055, 12), boneMaterial);
      vert.position.set(0, y, -0.04);
      this.skeletalGroup.add(vert);

      // Glowing Dorsal Horn Spinal Gate Core
      const gateMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const gateNode = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), gateMat);
      gateNode.position.set(0, y, 0.01);
      this.skeletalGroup.add(gateNode);
      this.spinalGateNodes.push(gateNode);
    }

    // ==========================================
    // 4. Volumetric Solid Internal Organs
    // ==========================================
    
    // Bilateral Pleural Lungs (Lobar textures)
    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.05,
      clearcoat: 0.9,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85
    });

    const leftLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 12, 16), lungMat);
    leftLung.position.set(-0.16, 1.18, 0.02);
    leftLung.rotation.z = 0.12;
    this.skeletalGroup.add(leftLung);

    const rightLung = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 12, 16), lungMat);
    rightLung.position.set(0.16, 1.18, 0.02);
    rightLung.rotation.z = -0.12;
    this.skeletalGroup.add(rightLung);

    // Anatomical Muscular Heart with Coronary Vasculature
    this.heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });

    const heartGeo = new THREE.DodecahedronGeometry(0.11, 2);
    this.heartMesh = new THREE.Mesh(heartGeo, this.heartMaterial);
    this.heartMesh.position.set(-0.04, 1.14, 0.1);
    this.skeletalGroup.add(this.heartMesh);

    // Aortic Arch & Coronary Vessels
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 1.16, 0.1),
      new THREE.Vector3(-0.02, 1.32, 0.08),
      new THREE.Vector3(0.04, 1.34, 0.02),
      new THREE.Vector3(0.02, 1.1, -0.02),
      new THREE.Vector3(0.01, 0.7, -0.03),
      new THREE.Vector3(-0.08, 0.25, -0.02),
    ]);
    const aortaTube = new THREE.Mesh(
      new THREE.TubeGeometry(aortaCurve, 32, 0.022, 8, false),
      new THREE.MeshPhysicalMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.5, roughness: 0.2 })
    );
    this.skeletalGroup.add(aortaTube);

    // Hepatic Lobe (Liver)
    const liverMat = new THREE.MeshPhysicalMaterial({
      color: 0x92400e,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      clearcoat: 0.8
    });
    const liver = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.18, 8, 16), liverMat);
    liver.position.set(0.12, 0.88, 0.06);
    liver.rotation.z = Math.PI / 4;
    this.skeletalGroup.add(liver);

    // Gastric Visceral Tract (Stomach & Enteric Plexus)
    const stomachMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.3,
      roughness: 0.35,
      clearcoat: 0.7
    });
    const stomach = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.045, 12, 24, Math.PI * 1.3), stomachMat);
    stomach.position.set(-0.1, 0.86, 0.06);
    stomach.rotation.z = -0.4;
    this.skeletalGroup.add(stomach);

    // ==========================================
    // 5. Sympathetic Autonomic Chain & Somatovisceral Axis
    // ==========================================
    const sympMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const sympPositions = [-0.08, 0.08];
    for (const sx of sympPositions) {
      for (let s = 0; s < 10; s++) {
        const sy = 0.55 + s * 0.075;
        const ganglion = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), sympMat);
        ganglion.position.set(sx, sy, -0.01);
        this.skeletalGroup.add(ganglion);
      }
    }
  }

  private buildTCMMeridians() {
    // 12 Jing-Luo Meridian spline curves & Shen-Qi Flux (Jade Emerald #10B981)
    const renDuPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, 0.25, 0.18),
      new THREE.Vector3(0, 0.5, 0.22),
      new THREE.Vector3(0, 0.85, 0.22),
      new THREE.Vector3(0, 1.15, 0.2),
      new THREE.Vector3(0, 1.5, 0.16),
      new THREE.Vector3(0, 1.82, 0.18),
      new THREE.Vector3(0, 1.95, 0),
      new THREE.Vector3(0, 1.8, -0.16),
      new THREE.Vector3(0, 1.2, -0.12),
      new THREE.Vector3(0, 0.4, -0.1),
    ];
    const renDuCurve = new THREE.CatmullRomCurve3(renDuPoints, true);
    const renDuTube = new THREE.Mesh(
      new THREE.TubeGeometry(renDuCurve, 64, 0.012, 8, true),
      new THREE.MeshPhysicalMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 })
    );
    this.tcmMeridianGroup.add(renDuTube);

    // Classical Acupoints along Channel (Baihui, Shanzhong, Guanyuan, ST-36)
    const acupointMat = new THREE.MeshPhysicalMaterial({ color: 0x34d399, emissive: 0x10b981, emissiveIntensity: 1.2, roughness: 0.1 });
    
    // Baihui (DU-20 - Crown)
    const baihui = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), acupointMat);
    baihui.position.set(0, 1.96, 0);
    this.tcmMeridianGroup.add(baihui);

    // Shanzhong (RN-17 - Mid-Chest)
    const shanzhong = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), acupointMat);
    shanzhong.position.set(0, 1.18, 0.2);
    this.tcmMeridianGroup.add(shanzhong);

    // Guanyuan (RN-4 - Lower Dan Tian)
    const guanyuan = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), acupointMat);
    guanyuan.position.set(0, 0.62, 0.22);
    this.tcmMeridianGroup.add(guanyuan);

    // Zusanli (ST-36 - Leg)
    const st36 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), acupointMat);
    st36.position.set(0.18, 0.1, 0.1);
    this.tcmMeridianGroup.add(st36);
  }

  private handlePointerMove(event: PointerEvent) {
    const el = this.rendererContainer()?.nativeElement;
    if (!el || !this.camera) return;

    const rect = el.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      [this.skeletalGroup, this.tcmMeridianGroup, this.ayurvedicChakraGroup, this.dentalArchGroup, this.ansVagalGroup],
      true
    );

    if (intersects.length > 0) {
      const hit = intersects[0];
      const point = hit.point;
      this.hoverPos.set({ x: event.clientX, y: event.clientY });

      if (hit.object.userData?.isTooth) {
        const u = hit.object.userData;
        this.hoveredNode.set({
          name: `FDI #${u.fdiCode} ${u.name}`,
          snomedCode: `PPD: ${u.ppd}mm | BOP: ${u.bop ? 'POS (+)' : 'NEG (-)'}`,
          tcmClock: `SIBI Score: ${u.sibiScore}/100`,
          pranaFreq: `CV Risk: ${u.cvRiskMultiplier}x | HbA1c: +${u.hba1cIncrease}%`
        });
        return;
      }

      let name = 'Lumbar Vertebrae & Gate Control';
      let snomedCode = 'SNOMED 249688008';
      let tcmClock = 'Kidney (5pm - 7pm)';
      let pranaFreq = 'Muladhara (396 Hz)';

      if (point.y > 1.65) {
        name = 'Descending Inhibitory Cortex & PAG';
        snomedCode = 'SNOMED 122495006';
        tcmClock = 'Gallbladder (11pm - 1am)';
        pranaFreq = 'Sahasrara (963 Hz)';
      } else if (point.y > 1.1) {
        name = 'Cardiac & Pulmonary Complex';
        snomedCode = 'SNOMED 80891009';
        tcmClock = 'Heart (11am - 1pm)';
        pranaFreq = 'Anahata (639 Hz)';
      } else if (point.y > 0.75) {
        name = 'Enteric Visceral Plexus & Liver';
        snomedCode = 'SNOMED 302553009';
        tcmClock = 'Liver (1am - 3am)';
        pranaFreq = 'Manipura (528 Hz)';
      } else if (point.y > 0.35) {
        name = 'Pelvic Saccral Axis & SIBI Cross-Talk';
        snomedCode = 'SNOMED 279549004';
        tcmClock = 'Urinary Bladder (3pm - 5pm)';
        pranaFreq = 'Svadhisthana (417 Hz)';
      }

      this.hoveredNode.set({ name, snomedCode, tcmClock, pranaFreq });
    } else {
      this.hoveredNode.set(null);
    }
  }

  private buildAyurvedicChakras() {
    // 7 Sushumna Chakra Toroidal Vortices & Prana Resonance Cores
    const chakraData = [
      { name: 'Muladhara', col: 0xef4444, freq: '396 Hz', y: 0.32 },
      { name: 'Svadhisthana', col: 0xf97316, freq: '417 Hz', y: 0.58 },
      { name: 'Manipura', col: 0xeab308, freq: '528 Hz', y: 0.85 },
      { name: 'Anahata', col: 0x10b981, freq: '639 Hz', y: 1.15 },
      { name: 'Vishuddha', col: 0x06b6d4, freq: '741 Hz', y: 1.48 },
      { name: 'Ajna', col: 0x6366f1, freq: '852 Hz', y: 1.76 },
      { name: 'Sahasrara', col: 0x8b5cf6, freq: '963 Hz', y: 1.96 }
    ];

    chakraData.forEach((chakra) => {
      // Outer Vortex Torus
      const torusMat = new THREE.MeshPhysicalMaterial({
        color: chakra.col,
        emissive: chakra.col,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.2,
        clearcoat: 1.0,
        transmission: 0.5,
        transparent: true,
        opacity: 0.75
      });
      const torus = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 12, 24), torusMat);
      torus.position.set(0, chakra.y, 0.05);
      torus.rotation.x = Math.PI / 2;
      this.ayurvedicChakraGroup.add(torus);

      // Inner Luminous Core Sphere
      const coreMat = new THREE.MeshBasicMaterial({ color: chakra.col });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), coreMat);
      core.position.set(0, chakra.y, 0.05);
      this.ayurvedicChakraGroup.add(core);
    });
  }

  private buildAnsVagalToneNetwork() {
    this.vagusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.85
    });

    // Bilateral Catmull-Rom Splines for Left & Right Vagus Nerve (Cranial Nerve X)
    // Left Vagus Nerve (Cervical -> Cardiac Plexus -> Celiac Ganglion)
    const leftVagusPoints = [
      new THREE.Vector3(-0.05, 1.68, 0.04), // Jugular Foramen / Nodose Ganglion
      new THREE.Vector3(-0.065, 1.50, 0.06), // Carotid Sheath / Cervical Vagus
      new THREE.Vector3(-0.08, 1.30, 0.09), // Superior Thoracic Inflow
      new THREE.Vector3(-0.09, 1.15, 0.12), // Cardiac Plexus & Sinoatrial Node Innervation
      new THREE.Vector3(-0.07, 0.95, 0.10), // Pulmonary Plexus
      new THREE.Vector3(-0.05, 0.78, 0.08), // Esophageal Hiatus / Gastric Branch
      new THREE.Vector3(-0.035, 0.58, 0.05) // Celiac Plexus / Enteric Autonomic Inflow
    ];
    const leftVagusCurve = new THREE.CatmullRomCurve3(leftVagusPoints);
    const leftVagusTube = new THREE.Mesh(
      new THREE.TubeGeometry(leftVagusCurve, 48, 0.009, 8, false),
      this.vagusMaterial
    );
    this.ansVagalGroup.add(leftVagusTube);

    // Right Vagus Nerve (Cervical -> AV Node / Recurrent Branch -> Enteric Visceral Nexus)
    const rightVagusPoints = [
      new THREE.Vector3(0.05, 1.68, 0.04),
      new THREE.Vector3(0.065, 1.50, 0.06),
      new THREE.Vector3(0.08, 1.30, 0.09),
      new THREE.Vector3(0.09, 1.15, 0.12),
      new THREE.Vector3(0.07, 0.95, 0.10),
      new THREE.Vector3(0.05, 0.78, 0.08),
      new THREE.Vector3(0.035, 0.58, 0.05)
    ];
    const rightVagusCurve = new THREE.CatmullRomCurve3(rightVagusPoints);
    const rightVagusTube = new THREE.Mesh(
      new THREE.TubeGeometry(rightVagusCurve, 48, 0.009, 8, false),
      this.vagusMaterial
    );
    this.ansVagalGroup.add(rightVagusTube);

    // Vagal Ganglia Nodes (Nodose, Cardiac Plexus, Celiac)
    const ganglionMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.1,
      roughness: 0.1
    });

    const gangliaCoords = [
      { x: -0.05, y: 1.68, z: 0.04 }, // L Nodose
      { x: 0.05, y: 1.68, z: 0.04 },  // R Nodose
      { x: -0.09, y: 1.15, z: 0.12 }, // L Cardiac
      { x: 0.09, y: 1.15, z: 0.12 },  // R Cardiac
      { x: 0.0, y: 0.75, z: 0.08 }    // Celiac / Enteric
    ];

    for (const g of gangliaCoords) {
      const gMesh = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), ganglionMat);
      gMesh.position.set(g.x, g.y, g.z);
      this.ansVagalGroup.add(gMesh);
    }
  }

  private getToothName(fdi: number): string {
    const toothNum = fdi % 10;
    switch (toothNum) {
      case 1: return 'Central Incisor';
      case 2: return 'Lateral Incisor';
      case 3: return 'Canine (Cuspid)';
      case 4: return 'First Premolar (Bicuspid)';
      case 5: return 'Second Premolar (Bicuspid)';
      case 6: return 'First Molar';
      case 7: return 'Second Molar';
      case 8: return 'Third Molar (Wisdom Tooth)';
      default: return 'Tooth';
    }
  }

  private buildTeledentistry32Arch() {
    const enamelMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const cariousRoseMat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 1.0,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.8
    });

    const cariousAmberMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.1,
      clearcoat: 0.8
    });

    // FDI Upper Arch: 18..11, 21..28 (16 teeth)
    const upperFdi = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    // FDI Lower Arch: 48..41, 31..38 (16 teeth)
    const lowerFdi = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

    const generateArch = (codes: number[], baseY: number, isUpper: boolean) => {
      const count = codes.length;
      for (let i = 0; i < count; i++) {
        const code = codes[i];
        const toothName = this.getToothName(code);
        // Angle spanning across the 16 teeth
        const normalized = (i - (count - 1) / 2) / ((count - 1) / 2); // -1 to +1
        const angle = normalized * Math.PI * 0.42;

        const radiusX = 0.065;
        const radiusZ = 0.055;
        const x = radiusX * Math.sin(angle);
        const z = 0.14 + radiusZ * Math.cos(angle);
        const y = baseY;

        const isMolar = (code % 10) >= 6;
        const isPremolar = (code % 10) === 4 || (code % 10) === 5;
        const width = isMolar ? 0.016 : (isPremolar ? 0.013 : 0.010);
        const height = 0.018;
        const depth = isMolar ? 0.016 : 0.010;

        let mat = enamelMat.clone();
        let ppd = 2.0;
        let bop = false;
        let wearGrade = 1;
        let sibiScore = 12;
        let cvRiskMultiplier = '1.0';
        let hba1cIncrease = '0.0';

        // Pathological teeth setup:
        // FDI 36 (US #19, Lower Left 1st Molar) - Severe localized periodontitis
        if (code === 36) {
          mat = cariousRoseMat.clone();
          ppd = 6.0;
          bop = true;
          wearGrade = 3;
          sibiScore = 48;
          cvRiskMultiplier = '2.3';
          hba1cIncrease = '0.6';
        } else if (code === 16) {
          // FDI 16 (US #3, Upper Right 1st Molar) - Moderate periodontitis
          mat = cariousAmberMat.clone();
          ppd = 4.5;
          bop = true;
          wearGrade = 2;
          sibiScore = 32;
          cvRiskMultiplier = '1.6';
          hba1cIncrease = '0.3';
        }

        const toothGeo = new THREE.BoxGeometry(width, height, depth);
        const toothMesh = new THREE.Mesh(toothGeo, mat);
        toothMesh.position.set(x, y, z);
        toothMesh.rotation.y = -angle * 0.5;

        toothMesh.userData = {
          isTooth: true,
          fdiCode: code,
          name: toothName,
          ppd,
          bop,
          wearGrade,
          sibiScore,
          cvRiskMultiplier,
          hba1cIncrease
        };

        if (code === 36 || code === 16) {
          this.pathologicalTeeth.push(toothMesh);
        }

        this.dentalArchGroup.add(toothMesh);
      }
    };

    generateArch(upperFdi, 1.71, true);
    generateArch(lowerFdi, 1.66, false);
  }

  private updateLensVisibility() {
    const lens = this.activeLens();
    this.skeletalGroup.visible = lens === 'western' || lens === 'unified';
    this.tcmMeridianGroup.visible = lens === 'tcm' || lens === 'unified';
    this.ayurvedicChakraGroup.visible = lens === 'ayurveda' || lens === 'unified';
    this.ansVagalGroup.visible = this.isAnsVagalActive() && (lens === 'western' || lens === 'unified');
    this.dentalArchGroup.visible = this.isDentalArchActive() && (lens === 'western' || lens === 'unified');
  }

  toggleAnsVagal() {
    this.isAnsVagalActive.set(!this.isAnsVagalActive());
    this.updateLensVisibility();
  }

  toggleDentalArch() {
    this.isDentalArchActive.set(!this.isDentalArchActive());
    this.updateLensVisibility();
  }

  toggleAutoSpin() {
    this.isAutoSpinning.set(!this.isAutoSpinning());
    if (this.controls) this.controls.autoRotate = this.isAutoSpinning();
  }

  resetCameraView() {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 1.2, 3.2);

      this.controls.target.set(0, 1.0, 0);
      this.controls.update();
    }
  }

  getEdwinSmithCase(nodeId: string): { caseNumber: string; title: string; traumaClassification: string; hieroglyphicTranslation: string; biophysicalSubstrate: string } {
    const cases: Record<string, { caseNumber: string; title: string; traumaClassification: string; hieroglyphicTranslation: string; biophysicalSubstrate: string }> = {
      'c3_c5_tmj': {
        caseNumber: 'Case IV',
        title: 'Perforation of Cervical Vertebra & Mandibular Joint Strain',
        traumaClassification: 'Verdict II: An ailment with which I will contend',
        hieroglyphicTranslation: 'If thou examinest a man having a split in his neck vertebra, his cervical muscles are stiff, and he cannot look to his shoulders...',
        biophysicalSubstrate: 'Type I/III Collagen Dermal Integument with Subsurface Scattering (SSS) Refraction'
      },
      't_spine': {
        caseNumber: 'Case X',
        title: 'Dislocation of Thoracic Vertebrae & Scapular Myofascial Tension',
        traumaClassification: 'Verdict I: An ailment I will treat',
        hieroglyphicTranslation: 'Thou shouldst bind him with fresh meat the first day; afterward thou shouldst treat him with grease, honey, and lint daily until he recovers...',
        biophysicalSubstrate: 'Striated Myofibrillar Fascicles & Deep Teal Fascia Collagen Sheath'
      },
      'l4_l5': {
        caseNumber: 'Case XXV',
        title: 'Compression Fractures of Lumbar Spine & Sciatic Nerve Trapping',
        traumaClassification: 'Verdict II: An ailment with which I will contend',
        hieroglyphicTranslation: 'If thou examinest a man having a displacement in his lumbar vertebrae, thou shouldst cause him to lie prone upon his back with knees flexed...',
        biophysicalSubstrate: 'Compact Osteon Cortical Bone Matrix & Haversian Canal Lattice'
      },
      'pelvis': {
        caseNumber: 'Case XXXI',
        title: 'Dislocation of Sacroiliac Joint & Pelvic Girdle Strain',
        traumaClassification: 'Verdict I: An ailment I will treat',
        hieroglyphicTranslation: 'Thou shouldst apply warm oil of sesame and bind the pelvis with linen splints to restore structural symmetry...',
        biophysicalSubstrate: 'Pelvic Visceral Perfusion Substrate & Endothelial Vascular Membrane'
      },
      'fdi_19': {
        caseNumber: 'Case XLVIII',
        title: 'FDI #19 Mandibular Alveolar Process & Surface Caries Trajectory',
        traumaClassification: 'Verdict I: An ailment I will treat',
        hieroglyphicTranslation: 'Thou shouldst apply crushed natron and honey to pacify the tooth decay and kindling heat of the jaw...',
        biophysicalSubstrate: 'Enamel Hydroxyapatite Crystal Lattice & Periodontal Probing Substrate'
      }
    };

    return cases[nodeId] || cases['l4_l5'];
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();

    // Smooth Camera Target Interpolation on node click
    if (this.targetCameraPos && this.camera) {
      this.camera.position.lerp(this.targetCameraPos, 0.05);
      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.01) {
        this.targetCameraPos = null;
      }
    }

    // SIGGRAPH Real-Time Cardiac Contraction & Micro-Vascular SSS Shading Loop
    if (this.heartMesh) {
      const hrRaw = this.state.vitals()?.hr;
      const hr = hrRaw ? parseInt(hrRaw, 10) || 72 : 72;
      const t = performance.now() * 0.001;
      const beatFreq = (2 * Math.PI * hr) / 60.0;
      
      // SIGGRAPH Atrial / Ventricular Double-Bump Contraction Math
      const contraction = 1.0 + 0.08 * Math.sin(beatFreq * t) + 0.03 * Math.sin(beatFreq * 2 * t);
      this.heartMesh.scale.set(contraction, contraction * 1.05, contraction);

      // Micro-vascular Thermal Erythema Emissive Pulsation
      if (this.heartMaterial) {
        this.heartMaterial.emissiveIntensity = 0.3 + 0.25 * Math.sin(beatFreq * t);
      }
    }

    // 0.1 Hz Autonomic Nervous System (ANS) Vagal Tone Pulse & Parasympathetic Entrainment
    const tNow = performance.now() * 0.001;
    if (this.isAnsVagalActive()) {
      const vagalPulse = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * tNow);
      const hrvFactor = Math.min(Math.max(this.currentHrv() / 60, 0.5), 2.0);
      if (this.vagusMaterial) {
        this.vagusMaterial.emissiveIntensity = (0.35 + 0.65 * vagalPulse) * hrvFactor;
      }

      // Propagate descending inhibitory wave through dorsal horn spinal gates
      for (let i = 0; i < this.spinalGateNodes.length; i++) {
        const gate = this.spinalGateNodes[i];
        const phase = 2 * Math.PI * 0.1 * tNow - (this.spinalGateNodes.length - 1 - i) * 0.22;
        const gatePulse = 0.5 + 0.5 * Math.sin(phase);
        gate.scale.setScalar(0.85 + 0.35 * gatePulse);
      }
    }

    // Pathological tooth inflammatory pulsation (SIBI vascular cross-talk activity)
    for (const pTooth of this.pathologicalTeeth) {
      if (pTooth.material instanceof THREE.MeshPhysicalMaterial) {
        pTooth.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(tNow * 3.5);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.controls) this.controls.dispose();

    const disposeGroup = (group: THREE.Group) => {
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });
    };

    disposeGroup(this.skeletalGroup);
    disposeGroup(this.tcmMeridianGroup);
    disposeGroup(this.ayurvedicChakraGroup);
    disposeGroup(this.ansVagalGroup);
    disposeGroup(this.dentalArchGroup);
    disposeGroup(this.symptomAnchorGroup);

    this.spinalGateNodes = [];
    this.pathologicalTeeth = [];
  }
}
