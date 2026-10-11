import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';

export type NutrigenomicLigand = 'sulforaphane' | 'butyrate' | 'resveratrol' | 'omega3_dha' | 'methyl_5mthf';

export interface INutrigenomicTelemetry {
  ligandName: string;
  foodSource: string;
  molecularTarget: string;
  epigeneticMechanism: string;
  nrf2NuclearRatio: number;        // e.g. 1.0 (baseline) to 5.2
  histoneAcetylationPct: number;   // 0 - 100%
  mitochondrialBiogenesisPct: number; // 0 - 100%
  dnaMethylationStabilityPct: number; // 0 - 100%
  phase2EnzymeOutputPct: number;   // 0 - 400%
  chromatinState: 'heterochromatin_dense' | 'euchromatin_permissive' | 'balanced';
  clinicalTakeaway: string;
}

@Component({
  selector: 'app-nutrigenomics-3d-lens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-emerald-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🧬</span>
              <span>3D Nutrigenomics &amp; Chromatin Epigenetic Lens (Model V11)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Keap1-Nrf2-ARE &bull; Histone Acetylation / Butyrate HDACi &bull; PGC-1&alpha; Mitochondrial Biogenesis &bull; One-Carbon DNA Methylation
            </p>
          </div>
        </div>

        <!-- Master Mechanism Badge -->
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-md"
                [ngClass]="{
                  'bg-amber-950/80 border-amber-500/60 text-amber-300': activeLigand() === 'sulforaphane',
                  'bg-emerald-950/80 border-emerald-500/60 text-emerald-300': activeLigand() === 'butyrate',
                  'bg-rose-950/80 border-rose-500/60 text-rose-300': activeLigand() === 'resveratrol',
                  'bg-cyan-950/80 border-cyan-500/60 text-cyan-300': activeLigand() === 'omega3_dha',
                  'bg-purple-950/80 border-purple-500/60 text-purple-300': activeLigand() === 'methyl_5mthf'
                }">
            {{ telemetry().molecularTarget }}
          </span>
        </div>
      </div>

      <!-- Bioactive Ligand Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-3 bg-zinc-900/60 border-b border-zinc-850 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-[10px] font-bold text-zinc-400 uppercase mr-1">Bioactive Ligand:</span>
          
          <button type="button" (click)="setLigand('sulforaphane')"
                  [class.bg-amber-500]="activeLigand() === 'sulforaphane'"
                  [class.text-zinc-950]="activeLigand() === 'sulforaphane'"
                  [class.font-black]="activeLigand() === 'sulforaphane'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-amber-950 hover:text-amber-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🥦</span>
            <span>Sulforaphane (Nrf2 &bull; ARE)</span>
          </button>

          <button type="button" (click)="setLigand('butyrate')"
                  [class.bg-emerald-500]="activeLigand() === 'butyrate'"
                  [class.text-zinc-950]="activeLigand() === 'butyrate'"
                  [class.font-black]="activeLigand() === 'butyrate'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-emerald-950 hover:text-emerald-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🌾</span>
            <span>Butyrate (HDACi &bull; SCFA)</span>
          </button>

          <button type="button" (click)="setLigand('resveratrol')"
                  [class.bg-rose-500]="activeLigand() === 'resveratrol'"
                  [class.text-zinc-950]="activeLigand() === 'resveratrol'"
                  [class.font-black]="activeLigand() === 'resveratrol'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-rose-950 hover:text-rose-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🍇</span>
            <span>Resveratrol (SIRT1 &bull; PGC-1&alpha;)</span>
          </button>

          <button type="button" (click)="setLigand('omega3_dha')"
                  [class.bg-cyan-500]="activeLigand() === 'omega3_dha'"
                  [class.text-zinc-950]="activeLigand() === 'omega3_dha'"
                  [class.font-black]="activeLigand() === 'omega3_dha'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-cyan-950 hover:text-cyan-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🐟</span>
            <span>Omega-3 DHA (Resolvins &bull; NF-&kappa;B)</span>
          </button>

          <button type="button" (click)="setLigand('methyl_5mthf')"
                  [class.bg-purple-500]="activeLigand() === 'methyl_5mthf'"
                  [class.text-zinc-950]="activeLigand() === 'methyl_5mthf'"
                  [class.font-black]="activeLigand() === 'methyl_5mthf'"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-purple-950 hover:text-purple-300 transition text-[11px] border border-zinc-700 cursor-pointer flex items-center gap-1">
            <span>🧬</span>
            <span>5-MTHF (SAMe &bull; Methylation)</span>
          </button>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
            <input type="checkbox" [(ngModel)]="autoRotate" class="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0">
            <span>Orbit Spin</span>
          </label>
          <label class="flex items-center gap-1.5 text-[11px] text-zinc-300 cursor-pointer select-none">
            <input type="checkbox" [(ngModel)]="showMrnaWaves" class="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0">
            <span>mRNA Waves</span>
          </label>
        </div>
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div class="relative w-full h-[480px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Telemetry HUD Overlay -->
        <div class="absolute top-3 left-3 z-10 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-3 text-[11px] space-y-1.5 shadow-xl max-w-xs pointer-events-none">
          <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-1 flex justify-between">
            <span>Epigenetic Flux</span>
            <span class="text-emerald-400 font-mono">Real-Time</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Target Molecule:</span>
            <span class="text-emerald-300 font-bold text-right">{{ telemetry().ligandName }}</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Dietary Source:</span>
            <span class="text-amber-300 font-mono text-right">{{ telemetry().foodSource }}</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Nrf2 Nuclear Ratio:</span>
            <span class="text-amber-400 font-mono font-bold">{{ telemetry().nrf2NuclearRatio.toFixed(1) }} : 1</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Histone Acetylation:</span>
            <span class="text-emerald-400 font-mono font-bold">{{ telemetry().histoneAcetylationPct }}%</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Mito Biogenesis:</span>
            <span class="text-rose-400 font-mono font-bold">+{{ telemetry().mitochondrialBiogenesisPct }}%</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">DNA Methylation:</span>
            <span class="text-purple-400 font-mono font-bold">{{ telemetry().dnaMethylationStabilityPct }}%</span>
          </div>

          <div class="flex justify-between items-center gap-4">
            <span class="text-zinc-400">Phase II Enzymes:</span>
            <span class="text-cyan-400 font-mono font-bold">+{{ telemetry().phase2EnzymeOutputPct }}%</span>
          </div>

          <div class="pt-1.5 border-t border-zinc-800/80">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-zinc-400">Chromatin Structure:</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                    [ngClass]="{
                      'bg-emerald-950 text-emerald-300 border border-emerald-600': telemetry().chromatinState === 'euchromatin_permissive',
                      'bg-indigo-950 text-indigo-300 border border-indigo-600': telemetry().chromatinState === 'balanced',
                      'bg-zinc-800 text-zinc-400 border border-zinc-700': telemetry().chromatinState === 'heterochromatin_dense'
                    }">
                {{ telemetry().chromatinState.replace('_', ' ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3D Spatial Legend (Bottom Right) -->
        <div class="absolute bottom-3 right-3 z-10 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-xl p-2.5 text-[10px] space-y-1 shadow-lg pointer-events-none">
          <div class="font-bold text-zinc-300 pb-0.5 border-b border-zinc-800 text-[9px] uppercase tracking-wider">Spatial 3D Anatomy</div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span><span>Double Helix DNA Core</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>Histone Octamer Nucleosomes</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span><span>Emerald Acetyl Tags (-COCH3)</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span><span>Violet Methyl Tags (-CH3)</span></div>
          <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span>Mitochondrial Cristae (PGC-1&alpha;)</span></div>
        </div>
      </div>

      <!-- Bottom Clinical Explanation Card -->
      <div class="p-4 bg-zinc-900/90 border-t border-zinc-800 text-xs">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800">
          <div class="flex items-center gap-2">
            <span class="text-emerald-400 text-sm">💡</span>
            <span class="font-bold text-zinc-200 uppercase tracking-wide text-[11px]">Nutrigenomic Mechanism &amp; Epigenetic Cascade:</span>
          </div>
          <span class="text-zinc-400 text-[10px]">PocketGull Three Acts of Clinical Reality</span>
        </div>
        <p class="text-zinc-300 font-sans leading-relaxed text-[12px]">
          {{ telemetry().clinicalTakeaway }}
        </p>
      </div>

    </div>
  `
})
export class Nutrigenomics3dLensComponent implements AfterViewInit, OnDestroy {
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly state = inject(PatientStateService);

  readonly activeLigand = signal<NutrigenomicLigand>('sulforaphane');
  autoRotate = true;
  showMrnaWaves = true;

  // Three.js Core
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animationFrameId?: number;

  // Scene Object Groups
  private rootGroup?: THREE.Group;
  private dnaHelixGroup?: THREE.Group;
  private nucleosomeGroup?: THREE.Group;
  private organelleGroup?: THREE.Group;
  private ligandStreamGroup?: THREE.Group;
  private mrnaWaveGroup?: THREE.Group;
  private acetylTagMeshes: THREE.Mesh[] = [];
  private methylTagMeshes: THREE.Mesh[] = [];

  readonly telemetry = computed<INutrigenomicTelemetry>(() => {
    const ligand = this.activeLigand();
    switch (ligand) {
      case 'sulforaphane':
        return {
          ligandName: 'Sulforaphane (1-Isothiocyanato-4-methylsulfinylbutane)',
          foodSource: 'Cruciferous Brassicas (Broccoli Sprouts, Arugula)',
          molecularTarget: 'Keap1 Oxidation ➔ Nrf2 ➔ ARE Nuclear Binding',
          epigeneticMechanism: 'Covalent modification of Keap1 Cys151 sensors, liberating Nrf2 transcription factor to induce Phase II antioxidant enzymes.',
          nrf2NuclearRatio: 5.2,
          histoneAcetylationPct: 45,
          mitochondrialBiogenesisPct: 22,
          dnaMethylationStabilityPct: 92,
          phase2EnzymeOutputPct: 340,
          chromatinState: 'euchromatin_permissive',
          clinicalTakeaway: 'Sulforaphane acts as an electrophilic xenohormetic signal. Rather than direct radical scavenging, it triggers the Keap1-Nrf2-ARE axis, yielding sustained de novo synthesis of endogenous glutathione (GSH), heme oxygenase-1 (HO-1), and catalase across hepatic, pulmonary, and neurological parenchyma.'
        };
      case 'butyrate':
        return {
          ligandName: 'Butyrate / Short-Chain Fatty Acid (C4H8O2)',
          foodSource: 'Microbial fermentation of Inulin, Resistant Starch & Oats',
          molecularTarget: 'Histone Deacetylase (HDAC Class I/II) Inhibition',
          epigeneticMechanism: 'HDAC inhibition induces histone lysine hyperacetylation, relaxing chromatin architecture to transcribe ZO-1, Occludin, and FoxP3+ T-regs.',
          nrf2NuclearRatio: 2.1,
          histoneAcetylationPct: 88,
          mitochondrialBiogenesisPct: 35,
          dnaMethylationStabilityPct: 89,
          phase2EnzymeOutputPct: 180,
          chromatinState: 'euchromatin_permissive',
          clinicalTakeaway: 'Microbial-derived butyrate acts as an endogenous HDAC inhibitor in colonocytes. Uncoiling dense heterochromatin into open euchromatin facilitates transcription of intestinal epithelial tight-junction proteins (ZO-1, Claudin-1) and differentiates immunosuppressive FoxP3+ regulatory T-cells to quench systemic endotoxemia.'
        };
      case 'resveratrol':
        return {
          ligandName: 'Trans-Resveratrol & Polyphenols',
          foodSource: 'Polygonum cuspidatum, Red Grape Skins, Wild Berries',
          molecularTarget: 'AMPK & SIRT1 Deacetylase ➔ PGC-1α Activation',
          epigeneticMechanism: 'Allosteric activation of NAD+-dependent SIRT1 promotes deacetylation of PGC-1α, driving mitochondrial fission/fusion and mitophagic renewal.',
          nrf2NuclearRatio: 3.4,
          histoneAcetylationPct: 38,
          mitochondrialBiogenesisPct: 82,
          dnaMethylationStabilityPct: 94,
          phase2EnzymeOutputPct: 210,
          chromatinState: 'balanced',
          clinicalTakeaway: 'Resveratrol mimics caloric restriction signaling by stimulating SIRT1 and AMPK. Deacetylation of PGC-1α orchestrates nuclear-encoded mitochondrial transcription factors (NRF-1/2, TFAM), driving mitochondrial biogenesis, fatty acid β-oxidation, and clearing senescent mitochondrial fragments.'
        };
      case 'omega3_dha':
        return {
          ligandName: 'Docosahexaenoic Acid (DHA) & Eicosapentaenoic Acid (EPA)',
          foodSource: 'Wild Cold-Water Marine Lipids (Salmon, Mackerel, Algal Oil)',
          molecularTarget: 'PPAR-γ / GPR120 Activation ➔ NF-κB Nuclear Block',
          epigeneticMechanism: 'Substrate for Specialized Pro-Resolving Mediators (Resolvins, Protectins, Maresins) that actively terminate microvascular leukocyte rolling.',
          nrf2NuclearRatio: 2.8,
          histoneAcetylationPct: 52,
          mitochondrialBiogenesisPct: 40,
          dnaMethylationStabilityPct: 91,
          phase2EnzymeOutputPct: 160,
          chromatinState: 'balanced',
          clinicalTakeaway: 'Marine Omega-3 PUFAs incorporate directly into phospholipid bilayers and membrane lipid rafts. Enzymatically converted by 15-LOX into Resolvin D1/E1 and Protectin D1, they actively halt neutrophil extravasation and block nuclear translocation of NF-κB p65, resolving chronic low-grade vascular inflammation.'
        };
      case 'methyl_5mthf':
        return {
          ligandName: 'L-5-Methyltetrahydrofolate (5-MTHF) & Methylcobalamin',
          foodSource: 'Dark Leafy Brassicas (Spinach, Kale, Wild Nettles)',
          molecularTarget: 'One-Carbon Cycle ➔ SAMe Synthesis ➔ DNMT CpG Methylation',
          epigeneticMechanism: 'Methionine synthase remethylates homocysteine to methionine, synthesizing S-adenosylmethionine (SAMe) for targeted DNA/histone methylation.',
          nrf2NuclearRatio: 1.8,
          histoneAcetylationPct: 30,
          mitochondrialBiogenesisPct: 20,
          dnaMethylationStabilityPct: 98,
          phase2EnzymeOutputPct: 120,
          chromatinState: 'heterochromatin_dense',
          clinicalTakeaway: '5-MTHF powers the one-carbon folate-methionine transfer cycle. By generating SAMe, it provides the requisite methyl donor pool for DNA methyltransferases (DNMT1/3a) to place protective methyl tags (-CH3) onto CpG islands of pro-inflammatory cytokines and oncogenes, maintaining genomic stability.'
        };
    }
  });

  constructor() {
    const external = this.state.selectedNutrigenomicLigand();
    if (external && external !== 'all') {
      this.activeLigand.set(external as NutrigenomicLigand);
    }
  }

  setLigand(ligand: NutrigenomicLigand) {
    this.activeLigand.set(ligand);
    this.state.selectedNutrigenomicLigand.set(ligand);
    this.updateLigandVisualEffects();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initThreeScene();
    this.buildNutrigenomicArchitecture();
    this.startRenderLoop();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeScene() {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);
    this.scene.fog = new THREE.FogExp2(0x09090b, 0.04);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 10;
    this.controls.minDistance = 1.5;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    keyLight.position.set(3, 4, 3);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.4);
    rimLight.position.set(-3, -2, -2);
    this.scene.add(rimLight);
  }

  private buildNutrigenomicArchitecture() {
    if (!this.scene) return;

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // 1. Semi-translucent Cell Plasma Membrane & Cytoskeleton
    const membraneGeo = new THREE.IcosahedronGeometry(2.4, 3);
    const membraneMat = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      roughness: 0.2,
      transmission: 0.85,
      thickness: 0.6,
      opacity: 0.25,
      transparent: true,
      wireframe: true
    });
    const membraneMesh = new THREE.Mesh(membraneGeo, membraneMat);
    this.rootGroup.add(membraneMesh);

    // 2. Nuclear Envelope Sphere
    const nucleusGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x312e81,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.45,
      roughness: 0.5
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    this.rootGroup.add(nucleusMesh);

    // 3. DNA Double Helix in Nuclear Center
    this.dnaHelixGroup = new THREE.Group();
    this.rootGroup.add(this.dnaHelixGroup);

    const helixHeight = 1.8;
    const helixRadius = 0.35;
    const turns = 2.5;
    const strandSteps = 50;

    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    for (let i = 0; i <= strandSteps; i++) {
      const t = i / strandSteps;
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixHeight;
      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      strand1Points.push(new THREE.Vector3(x1, y, z1));
      strand2Points.push(new THREE.Vector3(x2, y, z2));

      // Base pair rungs between strands every other step
      if (i % 2 === 0) {
        const rungGeo = new THREE.CylinderGeometry(0.012, 0.012, helixRadius * 2, 6);
        const rungMat = new THREE.MeshStandardMaterial({
          color: (i % 4 === 0) ? 0x06b6d4 : 0xec4899,
          emissive: (i % 4 === 0) ? 0x0891b2 : 0xbe185d,
          emissiveIntensity: 0.6
        });
        const rungMesh = new THREE.Mesh(rungGeo, rungMat);
        rungMesh.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        rungMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1 - x2, 0, z1 - z2).normalize());
        this.dnaHelixGroup.add(rungMesh);
      }
    }

    const strand1Curve = new THREE.CatmullRomCurve3(strand1Points);
    const strand2Curve = new THREE.CatmullRomCurve3(strand2Points);

    const tubeGeo1 = new THREE.TubeGeometry(strand1Curve, 64, 0.024, 8, false);
    const tubeGeo2 = new THREE.TubeGeometry(strand2Curve, 64, 0.024, 8, false);

    const strandMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });

    this.dnaHelixGroup.add(new THREE.Mesh(tubeGeo1, strandMat));
    this.dnaHelixGroup.add(new THREE.Mesh(tubeGeo2, strandMat));

    // 4. Nucleosome Histone Octamers & Epigenetic Tags
    this.nucleosomeGroup = new THREE.Group();
    this.rootGroup.add(this.nucleosomeGroup);

    const octamerPositions = [
      new THREE.Vector3(0.55, 0.35, 0.2),
      new THREE.Vector3(-0.55, -0.25, 0.25),
      new THREE.Vector3(0.2, -0.55, -0.3),
      new THREE.Vector3(-0.35, 0.55, -0.25)
    ];

    octamerPositions.forEach(pos => {
      const octamerGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.16, 16);
      const octamerMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
        roughness: 0.4
      });
      const octamerMesh = new THREE.Mesh(octamerGeo, octamerMat);
      octamerMesh.position.copy(pos);
      this.nucleosomeGroup?.add(octamerMesh);

      // Attach Acetyl tag (-COCH3, emerald sphere)
      const acetylGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const acetylMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.8
      });
      const acetylMesh = new THREE.Mesh(acetylGeo, acetylMat);
      acetylMesh.position.set(pos.x + 0.12, pos.y + 0.10, pos.z + 0.08);
      this.acetylTagMeshes.push(acetylMesh);
      this.nucleosomeGroup?.add(acetylMesh);

      // Attach Methyl tag (-CH3, violet sphere)
      const methylGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const methylMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.8
      });
      const methylMesh = new THREE.Mesh(methylGeo, methylMat);
      methylMesh.position.set(pos.x - 0.10, pos.y - 0.12, pos.z - 0.08);
      this.methylTagMeshes.push(methylMesh);
      this.nucleosomeGroup?.add(methylMesh);
    });

    // 5. Cytoplasmic Organelles: Mitochondria & Keap1 Sensors
    this.organelleGroup = new THREE.Group();
    this.rootGroup.add(this.organelleGroup);

    // Mitochondrion 1 & 2
    const mitoPositions = [
      new THREE.Vector3(1.6, 0.8, -0.4),
      new THREE.Vector3(-1.5, -0.9, 0.5)
    ];

    mitoPositions.forEach(mPos => {
      const mitoGroup = new THREE.Group();
      mitoGroup.position.copy(mPos);

      const capsuleGeo = new THREE.CapsuleGeometry(0.18, 0.45, 12, 16);
      const capsuleMat = new THREE.MeshStandardMaterial({
        color: 0xbe123c,
        emissive: 0x9f1239,
        emissiveIntensity: 0.5,
        roughness: 0.4,
        transparent: true,
        opacity: 0.85
      });
      const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat);
      capsuleMesh.rotation.z = Math.PI / 4;
      mitoGroup.add(capsuleMesh);

      this.organelleGroup?.add(mitoGroup);
    });

    // 6. Bioactive Ligand Particle Flow Streams
    this.ligandStreamGroup = new THREE.Group();
    this.rootGroup.add(this.ligandStreamGroup);

    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Shell distribution transitioning into nucleus
      const radius = 0.5 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      // Default amber gold
      particleColors[i * 3] = 0.96;
      particleColors[i * 3 + 1] = 0.62;
      particleColors[i * 3 + 2] = 0.04;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    this.ligandStreamGroup.add(particles);

    // 7. Concentric mRNA Transcription Waves
    this.mrnaWaveGroup = new THREE.Group();
    this.rootGroup.add(this.mrnaWaveGroup);

    for (let w = 0; w < 4; w++) {
      const ringGeo = new THREE.RingGeometry(0.6 + w * 0.35, 0.64 + w * 0.35, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.4 - w * 0.08,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      this.mrnaWaveGroup.add(ringMesh);
    }

    this.updateLigandVisualEffects();
  }

  private updateLigandVisualEffects() {
    const ligand = this.activeLigand();
    if (!this.ligandStreamGroup) return;

    const points = this.ligandStreamGroup.children[0] as THREE.Points;
    if (!points || !points.geometry) return;

    const colors = points.geometry.getAttribute('color') as THREE.BufferAttribute;
    if (!colors) return;

    let r = 0.96, g = 0.62, b = 0.04; // sulforaphane amber

    if (ligand === 'butyrate') {
      r = 0.06; g = 0.72; b = 0.50; // emerald
    } else if (ligand === 'resveratrol') {
      r = 0.88; g = 0.12; b = 0.28; // ruby rose
    } else if (ligand === 'omega3_dha') {
      r = 0.02; g = 0.71; b = 0.83; // cyan
    } else if (ligand === 'methyl_5mthf') {
      r = 0.65; g = 0.33; b = 0.96; // purple
    }

    for (let i = 0; i < colors.count; i++) {
      colors.setXYZ(i, r, g, b);
    }
    colors.needsUpdate = true;

    // Acetyl & Methyl Tag highlighting based on mechanism
    this.acetylTagMeshes.forEach(mesh => {
      const s = ligand === 'butyrate' ? 1.6 : 1.0;
      mesh.scale.set(s, s, s);
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = ligand === 'butyrate' ? 1.4 : 0.5;
      }
    });

    this.methylTagMeshes.forEach(mesh => {
      const s = ligand === 'methyl_5mthf' ? 1.6 : 1.0;
      mesh.scale.set(s, s, s);
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = ligand === 'methyl_5mthf' ? 1.4 : 0.5;
      }
    });
  }

  private startRenderLoop() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      const time = performance.now() * 0.001;

      if (this.controls) {
        this.controls.update();
      }

      if (this.autoRotate && this.rootGroup) {
        this.rootGroup.rotation.y += 0.004;
      }

      if (this.dnaHelixGroup) {
        this.dnaHelixGroup.rotation.y = time * 0.35;
      }

      // Pulse mRNA waves
      if (this.mrnaWaveGroup) {
        this.mrnaWaveGroup.visible = this.showMrnaWaves;
        if (this.showMrnaWaves) {
          this.mrnaWaveGroup.children.forEach((child, idx) => {
            const waveScale = 1.0 + ((time * 0.8 + idx * 0.4) % 1.5);
            child.scale.set(waveScale, waveScale, waveScale);
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = Math.max(0, 0.45 * (1.0 - (waveScale - 1.0) / 1.5));
            }
          });
        }
      }

      // Swarm ligand particles inwards to nucleus
      if (this.ligandStreamGroup) {
        const points = this.ligandStreamGroup.children[0] as THREE.Points;
        if (points && points.geometry) {
          const positions = points.geometry.getAttribute('position') as THREE.BufferAttribute;
          for (let i = 0; i < positions.count; i++) {
            let x = positions.getX(i);
            let y = positions.getY(i);
            let z = positions.getZ(i);

            // Centripetal inward convection
            x -= x * 0.005;
            y -= y * 0.005;
            z -= z * 0.005;

            // Reset when entering nucleus core
            const dist = Math.sqrt(x * x + y * y + z * z);
            if (dist < 0.4) {
              const radius = 2.0 + Math.random() * 0.3;
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.acos(2 * Math.random() - 1);
              x = radius * Math.sin(phi) * Math.cos(theta);
              y = radius * Math.sin(phi) * Math.sin(theta);
              z = radius * Math.cos(phi);
            }

            positions.setXYZ(i, x, y, z);
          }
          positions.needsUpdate = true;
        }
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }
}
