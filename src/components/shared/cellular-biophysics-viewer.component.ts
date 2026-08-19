import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  inject, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { CellularBiophysicsService, IOrganelleCytology } from '../../services/cellular-biophysics.service';

@Component({
  selector: 'app-cellular-biophysics-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-950/95 border border-slate-800 rounded-3xl space-y-6 text-zinc-100 shadow-2xl backdrop-blur-2xl">
      
      <!-- Top Title & Navigation Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-500 to-amber-400 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
            🧬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Cellular Biophysics &amp; Sub-Cellular Cytology Lab
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold uppercase">
                3D WebGL Cytology
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Multi-scale organelle simulation translating mitochondrial ATP kinetics, ion gating, and mechanotransduction across 4 healing paradigms.
            </p>
          </div>
        </div>

        <!-- View Filter Mode Buttons -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono">
          <button
            (click)="focusTab.set('3d-scene')"
            [class.bg-cyan-500]="focusTab() === '3d-scene'"
            [class.text-zinc-950]="focusTab() === '3d-scene'"
            [class.text-zinc-400]="focusTab() !== '3d-scene'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🔬 3D Organelle Space
          </button>
          <button
            (click)="focusTab.set('quad-matrix')"
            [class.bg-cyan-500]="focusTab() === 'quad-matrix'"
            [class.text-zinc-950]="focusTab() === 'quad-matrix'"
            [class.text-zinc-400]="focusTab() !== 'quad-matrix'"
            class="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
          >
            🏛️ 4-Way Cytology Matrix
          </button>
        </div>
      </div>

      <!-- Real-Time Cytological Telemetry HUD -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">ATP Synthase Rate</div>
          <div class="text-lg font-black text-amber-400 flex items-baseline gap-1">
            <span class="kinetic-systolic-pulse">{{ service.cellularTelemetry().atpProductionRate }}</span>
            <span class="text-[10px] text-zinc-400">µmol/g/min</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Membrane Potential</div>
          <div class="text-lg font-black text-cyan-400">
            {{ service.cellularTelemetry().membranePotentialDeltaPsi }} <span class="text-[10px] text-zinc-400">mV (ΔΨm)</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Oxidative Stress (ROS)</div>
          <div class="text-lg font-black text-rose-400">
            {{ service.cellularTelemetry().rosLevelPercent }}%
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">GSH / GSSG Redox</div>
          <div class="text-lg font-black text-emerald-400">
            {{ service.cellularTelemetry().glutathioneGshRatio }} <span class="text-[10px] text-zinc-400">ratio</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Intracellular Ca²⁺</div>
          <div class="text-lg font-black text-indigo-400">
            {{ service.cellularTelemetry().intracellularCalciumNanomolar }} <span class="text-[10px] text-zinc-400">nM</span>
          </div>
        </div>

        <div class="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
          <div class="text-[10px] text-zinc-400 uppercase font-bold">Tensegrity Tension</div>
          <div class="text-lg font-black text-teal-400">
            {{ service.cellularTelemetry().mechanotensionPicoNewtons }} <span class="text-[10px] text-zinc-400">pN/adhesion</span>
          </div>
        </div>
      </div>

      <!-- Organelle Selector Bar -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span class="font-bold uppercase tracking-wider">Select Sub-Cellular Organelle Focus:</span>
          <span class="text-cyan-400 font-bold">{{ service.activeOrganelle().name }}</span>
        </div>

        <div class="flex flex-wrap gap-2">
          @for (organelle of service.organelleCatalog; track organelle.id) {
            <button
              (click)="selectOrganelle(organelle)"
              [class.bg-cyan-500/20]="service.activeOrganelle().id === organelle.id"
              [class.border-cyan-400]="service.activeOrganelle().id === organelle.id"
              [class.text-cyan-300]="service.activeOrganelle().id === organelle.id"
              [class.bg-slate-900]="service.activeOrganelle().id !== organelle.id"
              [class.border-slate-800]="service.activeOrganelle().id !== organelle.id"
              [class.text-zinc-400]="service.activeOrganelle().id !== organelle.id"
              class="px-3.5 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition hover:border-slate-700 cursor-pointer shadow-sm"
            >
              <span class="text-base">{{ organelle.icon }}</span>
              <span>{{ organelle.name }}</span>
            </button>
          }
        </div>
      </div>

      <!-- VIEW 1: 3D WebGL Organelle Canvas -->
      @if (focusTab() === '3d-scene') {
        <div class="space-y-4 animate-in fade-in duration-300">
          
          <!-- 3D Controls Toolbar -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs font-mono">
            <div class="flex items-center gap-2 text-zinc-300">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>3D Eukaryotic Cell: <strong class="text-cyan-300">{{ service.activeOrganelle().name }}</strong></span>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="toggleAutoRotate()"
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-zinc-300 transition cursor-pointer"
              >
                {{ autoRotate() ? '⏸ Pause Orbit' : '▶ Auto-Orbit' }}
              </button>
              <button
                (click)="resetCamera()"
                class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-zinc-300 transition cursor-pointer"
              >
                ↺ Reset View
              </button>
            </div>
          </div>

          <!-- WebGL Canvas Container -->
          <div class="relative w-full h-[460px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas #cellCanvas class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>

            <!-- Floating 3D Zero-Tofu Hologram Label Overlay -->
            <div class="absolute top-4 left-4 p-3.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] space-y-1 pointer-events-none max-w-sm">
              <div class="text-cyan-400 font-bold flex items-center gap-1.5">
                <span>{{ service.activeOrganelle().icon }}</span>
                <span>{{ service.activeOrganelle().name }}</span>
              </div>
              <div class="text-zinc-300 text-[10px]">
                {{ service.activeOrganelle().subTitle }}
              </div>
              <div class="text-amber-300/90 text-[10px] pt-1 border-t border-slate-800">
                Allopathic: {{ service.activeOrganelle().allopathic.biochemicalPathway }}
              </div>
            </div>
          </div>

          <!-- Interactive Biophysical Parameter Sliders -->
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>Mitochondrial Efficiency:</span>
                <span class="text-amber-400 font-bold">{{ service.mitochondrialEfficiency() }}%</span>
              </div>
              <input 
                type="range" min="40" max="95" step="1" 
                [value]="service.mitochondrialEfficiency()" 
                (input)="updateMitochondrialEfficiency($event)"
                class="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>Metabolic Demand:</span>
                <span class="text-cyan-400 font-bold">{{ service.metabolicDemand() }}%</span>
              </div>
              <input 
                type="range" min="10" max="100" step="5" 
                [value]="service.metabolicDemand()" 
                (input)="updateMetabolicDemand($event)"
                class="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>Oxidative Stress (ROS):</span>
                <span class="text-rose-400 font-bold">{{ service.oxidativeStressFactor() }}%</span>
              </div>
              <input 
                type="range" min="0" max="100" step="5" 
                [value]="service.oxidativeStressFactor()" 
                (input)="updateOxidativeStress($event)"
                class="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-zinc-400 text-[11px]">
                <span>Shear Stress (Mechanotension):</span>
                <span class="text-teal-400 font-bold">{{ service.mechanicalShearStress() }} dyn/cm²</span>
              </div>
              <input 
                type="range" min="0" max="60" step="2" 
                [value]="service.mechanicalShearStress()" 
                (input)="updateShearStress($event)"
                class="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>
      }

      <!-- VIEW 2: QUAD-PHILOSOPHY CYTOLOGY MATRIX -->
      @if (focusTab() === 'quad-matrix' || focusTab() === '3d-scene') {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
          
          <!-- ALLOPATHIC CYTOLOGY -->
          <div class="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <span class="font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🩺</span> 1. Allopathic
              </span>
              <span class="text-[10px] text-rose-400">Biochemistry</span>
            </div>
            <div class="font-bold text-rose-200 text-sm font-pocketgull-sans">
              {{ service.activeOrganelle().allopathic.title }}
            </div>
            <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div class="text-[10px] text-zinc-400 uppercase">Chemical Equation:</div>
              <div class="text-[11px] text-rose-300 font-bold">{{ service.activeOrganelle().allopathic.equation }}</div>
            </div>
            <div class="text-[11px] text-zinc-300">
              <strong class="text-zinc-400">Proteins:</strong> {{ service.activeOrganelle().allopathic.keyProteins.join(', ') }}
            </div>
          </div>

          <!-- AYURVEDIC CYTOLOGY -->
          <div class="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <span class="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🪷</span> 2. Ayurvedic
              </span>
              <span class="text-[10px] text-amber-400">Sanskrit</span>
            </div>
            <div class="font-bold text-amber-200 text-base font-pocketgull-notofu">
              {{ service.activeOrganelle().ayurvedic.sanskritTitle }}
            </div>
            <div class="text-[11px] text-amber-400">
              {{ service.activeOrganelle().ayurvedic.transliteration }}
            </div>
            <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div class="text-[10px] text-zinc-400 uppercase">Dhatu &amp; Bhuta Agni:</div>
              <div class="text-[11px] text-amber-200">{{ service.activeOrganelle().ayurvedic.dhatuLayer }}</div>
            </div>
            <div class="text-[11px] text-zinc-300">
              <strong class="text-zinc-400">Rasayana:</strong> {{ service.activeOrganelle().ayurvedic.herbalModality }}
            </div>
          </div>

          <!-- TCM CYTOLOGY -->
          <div class="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span class="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🌿</span> 3. TCM
              </span>
              <span class="text-[10px] text-emerald-400">Zheng Qi</span>
            </div>
            <div class="font-bold text-emerald-200 text-base font-pocketgull-notofu">
              {{ service.activeOrganelle().tcm.hanziTitle }}
            </div>
            <div class="text-[11px] text-emerald-400">
              {{ service.activeOrganelle().tcm.pinyinTitle }}
            </div>
            <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div class="text-[10px] text-zinc-400 uppercase">Yin-Yang Transformation:</div>
              <div class="text-[11px] text-emerald-200">{{ service.activeOrganelle().tcm.yinYangAspect }}</div>
            </div>
            <div class="text-[11px] text-zinc-300">
              <strong class="text-zinc-400">Acupuncture:</strong> {{ service.activeOrganelle().tcm.acupuncturePrinciple }}
            </div>
          </div>

          <!-- OSTEOPATHIC CYTOLOGY -->
          <div class="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span class="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🦴</span> 4. Osteopathic
              </span>
              <span class="text-[10px] text-cyan-400">Tensegrity</span>
            </div>
            <div class="font-bold text-cyan-200 text-sm font-pocketgull-sans">
              {{ service.activeOrganelle().osteopathic.title }}
            </div>
            <div class="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div class="text-[10px] text-zinc-400 uppercase">Mechanotransduction Path:</div>
              <div class="text-[11px] text-cyan-200">{{ service.activeOrganelle().osteopathic.mechanotransductionPath }}</div>
            </div>
            <div class="text-[11px] text-zinc-300">
              <strong class="text-zinc-400">OMT Link:</strong> {{ service.activeOrganelle().osteopathic.omtImpact }}
            </div>
          </div>

        </div>
      }

    </div>
  `
})
export class CellularBiophysicsViewerComponent implements AfterViewInit, OnDestroy {
  readonly service = inject(CellularBiophysicsService);

  @ViewChild('cellCanvas') cellCanvasRef?: ElementRef<HTMLCanvasElement>;

  focusTab = signal<'3d-scene' | 'quad-matrix'>('3d-scene');
  autoRotate = signal<boolean>(true);

  // Three.js Scene Variables
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private animationFrameId?: number;
  private cellGroup?: THREE.Group;
  private mitochondriaGroup?: THREE.Group;
  private dnaGroup?: THREE.Group;
  private atpParticles?: THREE.Points;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && this.cellCanvasRef) {
      this.initThreeJsCell();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJsCell(): void {
    const canvas = this.cellCanvasRef?.nativeElement;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 460;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // obsidian slate-950

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 4.5);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.cellGroup = new THREE.Group();
    this.scene.add(this.cellGroup);

    this.buildOuterLipidMembrane();
    this.buildMitochondria();
    this.buildDnaHelix();
    this.buildCytoskeletalTensegrity();

    this.animate();
  }

  private buildOuterLipidMembrane(): void {
    if (!this.cellGroup) return;

    // Glowing translucent sphere for cell lipid bilayer
    const membraneGeom = new THREE.SphereGeometry(1.8, 32, 32);
    const membraneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const membraneMesh = new THREE.Mesh(membraneGeom, membraneMat);
    this.cellGroup.add(membraneMesh);
  }

  private buildMitochondria(): void {
    if (!this.cellGroup) return;

    this.mitochondriaGroup = new THREE.Group();
    this.mitochondriaGroup.position.set(0.8, 0.5, 0.3);

    // Mitochondrial Outer Bean Shell
    const mitoGeom = new THREE.CapsuleGeometry(0.35, 0.8, 16, 16);
    const mitoMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, opacity: 0.6, transparent: true });
    const mitoMesh = new THREE.Mesh(mitoGeom, mitoMat);
    mitoMesh.rotation.z = Math.PI / 4;
    this.mitochondriaGroup.add(mitoMesh);

    // Inner Cristae Folds (Orange lines)
    for (let c = -3; c <= 3; c++) {
      const cristaGeom = new THREE.TorusGeometry(0.22, 0.02, 8, 24, Math.PI);
      const cristaMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const cristaMesh = new THREE.Mesh(cristaGeom, cristaMat);
      cristaMesh.position.set(c * 0.08, 0, 0);
      cristaMesh.rotation.y = Math.PI / 2;
      this.mitochondriaGroup.add(cristaMesh);
    }

    // ATP Synthase Particle System (Rotating spark points)
    const atpGeom = new THREE.BufferGeometry();
    const count = 60;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 0.7;
      positions[i + 1] = (Math.random() - 0.5) * 0.7;
      positions[i + 2] = (Math.random() - 0.5) * 0.7;
    }
    atpGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const atpMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.04, blending: THREE.AdditiveBlending });
    this.atpParticles = new THREE.Points(atpGeom, atpMat);
    this.mitochondriaGroup.add(this.atpParticles);

    this.cellGroup.add(this.mitochondriaGroup);
  }

  private buildDnaHelix(): void {
    if (!this.cellGroup) return;

    this.dnaGroup = new THREE.Group();
    this.dnaGroup.position.set(-0.6, -0.4, 0);

    // Double Helix Strand 1 & Strand 2
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    for (let t = 0; t < 40; t++) {
      const angle = t * 0.35;
      const y = (t - 20) * 0.04;
      points1.push(new THREE.Vector3(Math.cos(angle) * 0.25, y, Math.sin(angle) * 0.25));
      points2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * 0.25, y, Math.sin(angle + Math.PI) * 0.25));
    }

    const geom1 = new THREE.BufferGeometry().setFromPoints(points1);
    const geom2 = new THREE.BufferGeometry().setFromPoints(points2);
    const mat1 = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const mat2 = new THREE.LineBasicMaterial({ color: 0xa855f7 });

    this.dnaGroup.add(new THREE.Line(geom1, mat1));
    this.dnaGroup.add(new THREE.Line(geom2, mat2));

    this.cellGroup.add(this.dnaGroup);
  }

  private buildCytoskeletalTensegrity(): void {
    if (!this.cellGroup) return;

    // Tensegrity struts connecting center to membrane (Microtubules & Actin)
    for (let s = 0; s < 12; s++) {
      const angle = (s / 12) * Math.PI * 2;
      const strutGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 1.7, Math.sin(angle) * 1.7, (Math.random() - 0.5) * 0.8)
      ]);
      const strutMat = new THREE.LineBasicMaterial({ color: s % 2 === 0 ? 0x10b981 : 0x06b6d4, transparent: true, opacity: 0.4 });
      this.cellGroup.add(new THREE.Line(strutGeom, strutMat));
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.cellGroup && this.autoRotate()) {
      this.cellGroup.rotation.y += 0.006;
      this.cellGroup.rotation.x += 0.002;
    }

    if (this.dnaGroup) {
      this.dnaGroup.rotation.y += 0.015;
    }

    if (this.atpParticles) {
      this.atpParticles.rotation.y += 0.03;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  selectOrganelle(organelle: IOrganelleCytology): void {
    this.service.selectOrganelle(organelle);
  }

  toggleAutoRotate(): void {
    this.autoRotate.update(r => !r);
  }

  resetCamera(): void {
    if (this.camera) {
      this.camera.position.set(0, 0, 4.5);
    }
    if (this.cellGroup) {
      this.cellGroup.rotation.set(0, 0, 0);
    }
  }

  updateMitochondrialEfficiency(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.mitochondrialEfficiency.set(Number(input.value));
  }

  updateMetabolicDemand(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.metabolicDemand.set(Number(input.value));
  }

  updateOxidativeStress(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.oxidativeStressFactor.set(Number(input.value));
  }

  updateShearStress(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.service.mechanicalShearStress.set(Number(input.value));
  }
}
