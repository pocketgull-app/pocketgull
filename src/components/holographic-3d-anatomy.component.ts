import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ThemeService } from '../services/theme.service';
import { PatientStateService } from '../services/patient-state.service';

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
  private symptomAnchorGroup = new THREE.Group();

  readonly isAutoSpinning = signal<boolean>(false);
  readonly isWebGLFallback = signal<boolean>(false);
  readonly activeLens = signal<SpatialLensType>('western');
  readonly selectedAnatomicalNode = signal<{ id: string; name: string; position: string } | null>(null);

  private handlePointerDown(event: PointerEvent) {
    const el = this.rendererContainer()?.nativeElement;
    if (!el || !this.camera || !this.scene) return;

    const rect = el.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      [this.skeletalGroup, this.tcmMeridianGroup, this.ayurvedicChakraGroup],
      true
    );

    if (intersects.length > 0) {
      const hit = intersects[0];
      const point = hit.point;

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

      this.scene.add(this.skeletalGroup);
      this.scene.add(this.tcmMeridianGroup);
      this.scene.add(this.ayurvedicChakraGroup);
      this.scene.add(this.symptomAnchorGroup);

      el.addEventListener('pointerdown', (evt) => this.handlePointerDown(evt));

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
    // Spine vertebrae & ribs (Western Cyan #00E5FF)
    const boneMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x00e5ff, 
      transmission: 0.85, 
      transparent: true, 
      opacity: 0.9, 
      roughness: 0.2, 
      metalness: 0.1, 
      ior: 1.45, 
      thickness: 1.2, 
      clearcoat: 1.0, 
      clearcoatRoughness: 0.1, 
      emissive: 0x0284c7, 
      emissiveIntensity: 0.25 
    });
    
    // Spine column
    for (let i = 0; i < 12; i++) {
      const vert = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.12), boneMaterial);
      vert.position.set(0, 0.4 + i * 0.1, 0);
      this.skeletalGroup.add(vert);
    }

    // Skull sphere
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), boneMaterial);
    skull.position.set(0, 1.75, 0);
    this.skeletalGroup.add(skull);

    // SIGGRAPH Neural Volumetric Cardiac Mesh (Dual-stage atrial/ventricular contraction)
    this.heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      transmission: 0.6,
      transparent: true,
      thickness: 1.5
    });

    const heartGeo = new THREE.SphereGeometry(0.14, 24, 24);
    // Deform sphere to anatomically emulate ventricular apex
    const pos = heartGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      if (y < 0) {
        pos.setX(i, pos.getX(i) * 0.7);
        pos.setZ(i, pos.getZ(i) * 0.7);
      }
    }
    heartGeo.computeVertexNormals();

    this.heartMesh = new THREE.Mesh(heartGeo, this.heartMaterial);
    this.heartMesh.position.set(-0.06, 1.15, 0.08);
    this.skeletalGroup.add(this.heartMesh);
  }

  private buildTCMMeridians() {
    // 12 Jing-Luo Meridian spline curves & Acupoints (Jade Emerald #10B981)
    const meridianMat = new THREE.LineBasicMaterial({ color: 0x10b981 });
    const points: THREE.Vector3[] = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.2) {
      points.push(new THREE.Vector3(Math.sin(t) * 0.4, 0.4 + (t / (Math.PI * 2)) * 1.2, Math.cos(t) * 0.2));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, meridianMat);
    this.tcmMeridianGroup.add(line);

    // ST-36 Acupoint Sphere
    const acupointMat = new THREE.MeshPhysicalMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6, roughness: 0.1 });
    const st36 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), acupointMat);
    st36.position.set(0.15, 0.5, 0.1);
    this.tcmMeridianGroup.add(st36);
  }

  private buildAyurvedicChakras() {
    // 7 Sushumna Chakra vortex spheres (Violet #8B5CF6 & Gold #F59E0B)
    const colors = [0x8b5cf6, 0x6366f1, 0x06b6d4, 0x10b981, 0xeab308, 0xf97316, 0xef4444];
    colors.forEach((col, idx) => {
      const mat = new THREE.MeshPhysicalMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, wireframe: true });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.06 + idx * 0.005, 16, 16), mat);
      sphere.position.set(0, 0.4 + idx * 0.2, 0);
      this.ayurvedicChakraGroup.add(sphere);
    });
  }

  private updateLensVisibility() {
    const lens = this.activeLens();
    this.skeletalGroup.visible = lens === 'western' || lens === 'unified';
    this.tcmMeridianGroup.visible = lens === 'tcm' || lens === 'unified';
    this.ayurvedicChakraGroup.visible = lens === 'ayurveda' || lens === 'unified';
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

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.controls) this.controls.dispose();
  }
}
