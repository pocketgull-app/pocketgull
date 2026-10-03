import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import {
  createPancreaticIsletMaterial,
  updatePancreaticIsletUniforms,
  computeStimulusSecretionCoupling
} from '../../shaders/pancreatic-islet-beta-cell.shader';

export type PancreaticIsletPreset =
  | 'healthy_gsis'
  | 'postprandial_spike'
  | 'sulfonylurea_sur1'
  | 'glucolipotoxic_er_stress'
  | 'iapp_amyloidosis'
  | 'type_1_insulitis';

export interface IIsletTelemetry {
  glucoseMm: number;
  glucoseMgDl: number;
  atpAdpRatio: number;
  membranePotentialMv: number;
  calciumInfluxUm: number;
  exocytosisRateHz: number;
  firstPhaseRrpReserve: number;
  secondPhaseRpFlux: number;
  activePhenotype: string;
  clinicalNote: string;
}

@Component({
  selector: 'app-pancreatic-islet-3d-lens',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🔬</span>
              <span>3D Pancreatic Islet &amp; &beta;-Cell Granule Exocytosis Lens (Visual Model V9)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Electrophysiological Stimulus-Secretion Coupling: GLUT1/2 &rarr; ATP/ADP &rarr; K_ATP &rarr; Ca2+ Influx &rarr; Granule Fusion
            </p>
          </div>
        </div>

        <!-- Master Phenotype Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-emerald-950/80 border-emerald-600/60 text-emerald-300': currentPreset() === 'healthy_gsis' || currentPreset() === 'postprandial_spike',
                  'bg-amber-950/80 border-amber-600/60 text-amber-300': currentPreset() === 'sulfonylurea_sur1',
                  'bg-purple-950/80 border-purple-600/60 text-purple-300': currentPreset() === 'iapp_amyloidosis',
                  'bg-rose-950/80 border-rose-600/60 text-rose-300 animate-pulse': currentPreset() === 'glucolipotoxic_er_stress' || currentPreset() === 'type_1_insulitis'
                }">
            {{ telemetry().activePhenotype }}
          </span>
        </div>
      </div>

      <!-- Presets Toolbar -->
      <div class="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Pathophysiology:</span>
        <button type="button" (click)="setPreset('healthy_gsis')"
                [class.bg-emerald-500]="currentPreset() === 'healthy_gsis'"
                [class.text-zinc-950]="currentPreset() === 'healthy_gsis'"
                [class.text-emerald-400]="currentPreset() !== 'healthy_gsis'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Fasting Homeostasis (5.5 mM)
        </button>
        <button type="button" (click)="setPreset('postprandial_spike')"
                [class.bg-teal-500]="currentPreset() === 'postprandial_spike'"
                [class.text-zinc-950]="currentPreset() === 'postprandial_spike'"
                [class.text-teal-400]="currentPreset() !== 'postprandial_spike'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          GSIS Postprandial Spike (15 mM)
        </button>
        <button type="button" (click)="setPreset('sulfonylurea_sur1')"
                [class.bg-amber-500]="currentPreset() === 'sulfonylurea_sur1'"
                [class.text-zinc-950]="currentPreset() === 'sulfonylurea_sur1'"
                [class.text-amber-400]="currentPreset() !== 'sulfonylurea_sur1'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Sulfonylurea SUR1 Agonism
        </button>
        <button type="button" (click)="setPreset('glucolipotoxic_er_stress')"
                [class.bg-rose-500]="currentPreset() === 'glucolipotoxic_er_stress'"
                [class.text-zinc-950]="currentPreset() === 'glucolipotoxic_er_stress'"
                [class.text-rose-400]="currentPreset() !== 'glucolipotoxic_er_stress'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          Glucolipotoxicity &amp; ER Stress
        </button>
        <button type="button" (click)="setPreset('iapp_amyloidosis')"
                [class.bg-purple-500]="currentPreset() === 'iapp_amyloidosis'"
                [class.text-zinc-950]="currentPreset() === 'iapp_amyloidosis'"
                [class.text-purple-400]="currentPreset() !== 'iapp_amyloidosis'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          IAPP Amyloid Fibrils (T2D)
        </button>
        <button type="button" (click)="setPreset('type_1_insulitis')"
                [class.bg-red-700]="currentPreset() === 'type_1_insulitis'"
                [class.text-white]="currentPreset() === 'type_1_insulitis'"
                [class.text-red-400]="currentPreset() !== 'type_1_insulitis'"
                class="px-2.5 py-1 rounded-lg border border-zinc-800 font-bold transition hover:bg-zinc-800 min-h-[32px] cursor-pointer">
          T1D Autoimmune Insulitis
        </button>
      </div>

      <!-- Main Three.js Viewport & Overlay HUD -->
      <div class="relative w-full h-[440px] bg-zinc-950 overflow-hidden">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Telemetry HUD Overlay Panel -->
        <div class="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md p-3.5 rounded-2xl bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-xs shadow-2xl flex flex-col gap-2 z-10 pointer-events-none">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span class="text-[10px] uppercase font-bold text-zinc-400">Microvascular &amp; Secretory Telemetry</span>
            <span class="text-[10px] text-emerald-400 font-mono">Three.js Procedural PBR</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span class="text-zinc-500 block text-[10px]">Extracellular Glucose</span>
              <strong class="tabular-nums text-zinc-100">{{ telemetry().glucoseMm }} mmol/L</strong>
              <span class="text-zinc-500 text-[10px] ml-1">({{ telemetry().glucoseMgDl }} mg/dL)</span>
            </div>
            <div>
              <span class="text-zinc-500 block text-[10px]">ATP / ADP Energy Ratio</span>
              <strong class="tabular-nums text-cyan-400">{{ telemetry().atpAdpRatio }}</strong>
              <span class="text-zinc-500 text-[10px] ml-1">(Normal: 2.5 - 7.5)</span>
            </div>
            <div>
              <span class="text-zinc-500 block text-[10px]">Membrane Potential (V_m)</span>
              <strong class="tabular-nums" [ngClass]="telemetry().membranePotentialMv > -45 ? 'text-amber-400' : 'text-emerald-400'">
                {{ telemetry().membranePotentialMv }} mV
              </strong>
            </div>
            <div>
              <span class="text-zinc-500 block text-[10px]">Cytosolic [Ca2+] Influx</span>
              <strong class="tabular-nums text-purple-400">{{ telemetry().calciumInfluxUm }} &mu;M</strong>
            </div>
          </div>

          <div class="border-t border-zinc-850 pt-2 flex items-center justify-between text-[11px]">
            <div>
              <span class="text-zinc-500 text-[10px] block">Granule Exocytosis Rate</span>
              <strong class="tabular-nums text-emerald-400 text-sm">{{ telemetry().exocytosisRateHz }} Hz</strong>
            </div>
            <div class="text-right">
              <span class="text-zinc-500 text-[10px] block">RRP Reserve / RP Flux</span>
              <span class="tabular-nums text-zinc-300">{{ telemetry().firstPhaseRrpReserve }}% / {{ telemetry().secondPhaseRpFlux }}%</span>
            </div>
          </div>

          <p class="text-[10px] text-zinc-400 font-sans leading-tight mt-1">
            {{ telemetry().clinicalNote }}
          </p>
        </div>

        <!-- 3D Spatial Legend (Top Right) -->
        <div class="absolute top-3 right-3 p-2.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] font-sans flex flex-col gap-1 z-10 pointer-events-none">
          <span class="font-bold text-zinc-300 font-mono uppercase text-[9px]">Islet Cytoarchitecture:</span>
          <div class="flex items-center gap-1.5 text-zinc-300">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>&beta;-Cells Core (Insulin ~70%)</span>
          </div>
          <div class="flex items-center gap-1.5 text-zinc-300">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>&alpha;-Cells Mantle (Glucagon ~20%)</span>
          </div>
          <div class="flex items-center gap-1.5 text-zinc-300">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>&delta;-Cells (Somatostatin ~10%)</span>
          </div>
          <div class="flex items-center gap-1.5 text-zinc-400">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Fenestrated Capillaries</span>
          </div>
        </div>

      </div>

    </div>
  `
})
export class PancreaticIslet3dLensComponent implements AfterViewInit, OnDestroy {
  readonly state = inject(PatientStateService);
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly currentPreset = signal<PancreaticIsletPreset>('healthy_gsis');

  readonly telemetry = computed<IIsletTelemetry>(() => {
    const preset = this.currentPreset();
    let glucose = 5.5;
    let sur1 = 0.0;
    let iapp = 0.0;
    let erStress = 0.0;
    let label = 'Fasting Homeostasis';
    let note = 'Resting beta-cells: K_ATP channels open, membrane hyperpolarized (-65 mV), low basal exocytosis (0.8 Hz).';

    switch (preset) {
      case 'healthy_gsis':
        glucose = 5.5;
        label = 'Fasting Homeostasis (5.5 mM)';
        note = 'Euglycemic basal state. Glucokinase inactive, minimal Ca2+ entry, insulin synthesis in equilibrium.';
        break;
      case 'postprandial_spike':
        glucose = 15.0;
        label = 'GSIS Postprandial Spike (15 mM)';
        note = 'Glucokinase flux increases ATP/ADP to >6.0, closing K_ATP channels, driving rapid Ca2+ entry and biphasic granule exocytosis.';
        break;
      case 'sulfonylurea_sur1':
        glucose = 4.2;
        sur1 = 0.85;
        label = 'Sulfonylurea SUR1 Agonism';
        note = 'Direct SUR1 closure overrides low glucose, forcing continuous depolarization and insulin dumping; severe hypoglycemia hazard.';
        break;
      case 'glucolipotoxic_er_stress':
        glucose = 20.0;
        erStress = 0.85;
        label = 'Glucolipotoxicity & ER Stress';
        note = 'Chronic hyperglycemia and saturated free fatty acids induce Unfolded Protein Response (UPR), PERK/eIF2a phosphorylation, and apoptosis.';
        break;
      case 'iapp_amyloidosis':
        glucose = 14.0;
        iapp = 0.80;
        label = 'IAPP Amyloid Oligomer Fibrils';
        note = 'Islet Amyloid Polypeptide (amylin) aggregates into cytotoxic oligomers, shearing cell membranes and impairing exocytotic SNARE fusion.';
        break;
      case 'type_1_insulitis':
        glucose = 18.0;
        erStress = 0.95;
        label = 'T1D Autoimmune Insulitis';
        note = 'Autoreactive CD8+ T-lymphocyte infiltration with Fas/FasL-mediated apoptosis, destroying >90% of functional core beta-cell mass.';
        break;
    }

    const coupling = computeStimulusSecretionCoupling(glucose, sur1, iapp);

    return {
      glucoseMm: glucose,
      glucoseMgDl: Math.round(glucose * 18.018),
      atpAdpRatio: coupling.atpAdpRatio,
      membranePotentialMv: coupling.membranePotentialMv,
      calciumInfluxUm: coupling.calciumInfluxUm,
      exocytosisRateHz: coupling.exocytosisRateHz,
      firstPhaseRrpReserve: coupling.firstPhaseRrpReserve,
      secondPhaseRpFlux: coupling.secondPhaseRpFlux,
      activePhenotype: label,
      clinicalNote: note
    };
  });

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private isletMesh!: THREE.Mesh;
  private isletMaterial!: THREE.ShaderMaterial;
  private granuleParticles!: THREE.Points;
  private capillaryLine!: THREE.Line;
  private animId: number = 0;
  private lastTimeMs: number = 0;
  private totalElapsedSec: number = 0;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.initThree();
    }
  }

  ngOnDestroy(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    window.removeEventListener('resize', this.onResize);
    this.controls?.dispose();
    this.renderer?.dispose();
  }

  setPreset(preset: PancreaticIsletPreset): void {
    this.currentPreset.set(preset);
  }

  private initThree(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 440;

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.2, 4.8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 10;
    this.controls.minDistance = 2;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x34d399, 1.2);
    dirLight1.position.set(5, 8, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x22d3ee, 0.8);
    dirLight2.position.set(-5, -3, -4);
    this.scene.add(dirLight2);

    // Procedural Islet Geometry: Deformed Icosahedron
    const isletGeom = new THREE.IcosahedronGeometry(1.4, 6);
    this.isletMaterial = createPancreaticIsletMaterial();
    this.isletMesh = new THREE.Mesh(isletGeom, this.isletMaterial);
    this.scene.add(this.isletMesh);

    // Granule Particle System (Insulin secretory granules bursting outward)
    const particleCount = 280;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 1.3 + Math.random() * 0.4;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      velocities[i * 3] = positions[i * 3] * 0.4;
      velocities[i * 3 + 1] = positions[i * 3 + 1] * 0.4;
      velocities[i * 3 + 2] = positions[i * 3 + 2] * 0.4;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.granuleParticles = new THREE.Points(particleGeom, particleMat);
    this.scene.add(this.granuleParticles);

    // Capillary Loop Torus/Helix representation
    const curvePoints: THREE.Vector3[] = [];
    for (let t = 0; t <= Math.PI * 4; t += 0.2) {
      const r = 1.45 + Math.sin(t * 3.0) * 0.1;
      curvePoints.push(new THREE.Vector3(
        r * Math.cos(t),
        Math.sin(t * 2.0) * 0.7,
        r * Math.sin(t)
      ));
    }
    const capillaryGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const capillaryMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2, transparent: true, opacity: 0.65 });
    this.capillaryLine = new THREE.Line(capillaryGeom, capillaryMat);
    this.scene.add(this.capillaryLine);

    window.addEventListener('resize', this.onResize);
    this.lastTimeMs = performance.now();
    this.animate();
  }

  private onResize = (): void => {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || !this.renderer || !this.camera) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = (): void => {
    this.animId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min((now - this.lastTimeMs) / 1000, 0.1);
    this.lastTimeMs = now;
    this.totalElapsedSec += dt;

    const telem = this.telemetry();
    const glucose = telem.glucoseMm;
    const sur1 = this.currentPreset() === 'sulfonylurea_sur1' ? 0.85 : 0.0;
    const iapp = this.currentPreset() === 'iapp_amyloidosis' ? 0.80 : 0.0;
    const erStress = this.currentPreset() === 'glucolipotoxic_er_stress' ? 0.85 : (this.currentPreset() === 'type_1_insulitis' ? 0.95 : 0.0);

    // Update GLSL shader uniforms
    if (this.isletMaterial) {
      updatePancreaticIsletUniforms(this.isletMaterial, this.totalElapsedSec, glucose, sur1, iapp, erStress);
    }

    // Slow rotation
    if (this.isletMesh) {
      this.isletMesh.rotation.y += dt * 0.2;
      this.isletMesh.rotation.x = Math.sin(this.totalElapsedSec * 0.3) * 0.1;
    }

    if (this.capillaryLine) {
      this.capillaryLine.rotation.y += dt * 0.2;
    }

    // Animate secretory granule explosion based on exocytosis rate
    if (this.granuleParticles) {
      this.granuleParticles.rotation.y += dt * 0.2;
      const posAttr = this.granuleParticles.geometry.attributes['position'] as THREE.BufferAttribute;
      const velAttr = this.granuleParticles.geometry.attributes['velocity'] as THREE.BufferAttribute;
      const rate = telem.exocytosisRateHz;

      for (let i = 0; i < posAttr.count; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);

        const vx = velAttr.getX(i);
        const vy = velAttr.getY(i);
        const vz = velAttr.getZ(i);

        // Move outward proportional to rate
        x += vx * (rate * 0.12) * dt;
        y += vy * (rate * 0.12) * dt;
        z += vz * (rate * 0.12) * dt;

        // Reset to core if too far
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > 2.8) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const r = 1.35;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }

        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
