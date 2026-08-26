import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MolecularDockingService, IProteinTarget, ILigandMolecule } from '../services/molecular-docking.service';

@Component({
  selector: 'app-molecular-docking-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Top Header HUD -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-lg font-bold shadow-inner">
            🧬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                3D AlphaFold Molecular Dynamics &amp; Drug Docking
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WebGL Ribbon &amp; PBR Ligand
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Target: <span class="text-teal-300 font-mono">{{ dockingService.selectedTarget().name }} ({{ dockingService.selectedTarget().pdbId }})</span> • 
              AlphaFold Confidence: <span class="text-emerald-400 font-mono">{{ dockingService.selectedTarget().alphaFoldConfidenceScore }}% pLDDT</span>
            </p>
          </div>
        </div>

        <!-- Simulation Trigger -->
        <button 
          (click)="dockingService.runDockingSimulation()"
          [disabled]="dockingService.isSimulating()"
          class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold font-mono text-xs rounded-xl transition shadow-lg shadow-teal-900/30 flex items-center gap-2 min-h-[44px] touch-manipulation cursor-pointer disabled:opacity-50">
          <span>{{ dockingService.isSimulating() ? 'Computing Docking Physics...' : '⚡ Re-Compute Binding Pocket' }}</span>
        </button>
      </div>

      <!-- Main Visualizer Grid (Canvas Left 8 Cols, Telemetry & Selectors Right 4 Cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left: Three.js 3D WebGL Molecular Viewport -->
        <div class="lg:col-span-8 relative min-h-[400px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
          <div #canvasContainer class="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing"></div>

          <!-- Floating Thermodynamic Overlay HUD -->
          <div class="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 text-xs font-mono bg-zinc-950/85 backdrop-blur-md p-3 rounded-xl border border-zinc-800 text-zinc-300 shadow-xl">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-zinc-100 font-bold">Binding Affinity (ΔG):</span>
              <span class="text-emerald-300 font-bold tabular-nums text-sm">
                {{ dockingService.dockingResult().deltaGKcalPerMol }} kcal/mol
              </span>
            </div>
            <div class="flex items-center justify-between gap-4 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-1.5">
              <span>Inhibition Const (Ki): <strong class="text-teal-300">{{ dockingService.dockingResult().inhibitionConstantKiMicroMolar }} µM</strong></span>
              <span>RMSD: <strong class="text-cyan-300">{{ dockingService.dockingResult().rmsdAngstrom }} Å</strong></span>
            </div>
            <div class="flex items-center justify-between gap-4 text-[11px] text-zinc-400">
              <span>H-Bonds: <strong class="text-amber-300">{{ dockingService.dockingResult().hydrogenBondsCount }} active</strong></span>
              <span>Status: <strong class="text-emerald-400">{{ dockingService.dockingResult().status }}</strong></span>
            </div>
          </div>

          <!-- Simulation Progress Bar (Overlay) -->
          @if (dockingService.isSimulating()) {
            <div class="absolute bottom-3 left-3 right-3 bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 flex flex-col gap-1.5 font-mono text-xs">
              <div class="flex justify-between text-cyan-300">
                <span>Electrostatic Energy Minimization...</span>
                <span>{{ dockingService.simulationProgress() }}%</span>
              </div>
              <div class="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-100" [style.width.%]="dockingService.simulationProgress()"></div>
              </div>
            </div>
          }
        </div>

        <!-- Right Side: Protein Targets & Therapeutic Ligand Selector -->
        <div class="lg:col-span-4 flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono">
          
          <!-- Protein Target Selector -->
          <div class="space-y-1.5">
            <span class="text-zinc-400 font-semibold block border-b border-zinc-800 pb-1">1. Select AlphaFold Target:</span>
            <div class="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              @for (target of dockingService.proteinTargets; track target.id) {
                <button 
                  (click)="dockingService.setTarget(target)"
                  [class.border-cyan-500]="dockingService.selectedTarget().id === target.id"
                  [class.bg-cyan-950-30]="dockingService.selectedTarget().id === target.id"
                  class="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 transition text-left min-h-[38px] touch-manipulation">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-zinc-200 truncate">{{ target.name }}</span>
                    <span class="text-[10px] text-cyan-400">{{ target.pdbId }}</span>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Ligand Selector -->
          <div class="space-y-1.5 pt-2 border-t border-zinc-800">
            <span class="text-zinc-400 font-semibold block border-b border-zinc-800 pb-1">2. Select Therapeutic Ligand:</span>
            <div class="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              @for (ligand of dockingService.ligandMolecules; track ligand.id) {
                <button 
                  (click)="dockingService.setLigand(ligand)"
                  [class.border-teal-500]="dockingService.selectedLigand().id === ligand.id"
                  [class.bg-teal-950-30]="dockingService.selectedLigand().id === ligand.id"
                  class="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-teal-500/50 transition text-left min-h-[38px] touch-manipulation">
                  <div class="flex justify-between items-center">
                    <span class="font-bold text-zinc-200 truncate">{{ ligand.name }}</span>
                    <span class="text-[10px] text-teal-400">{{ ligand.baseBindingAffinityKcal }} kcal</span>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Mechanism Card -->
          <div class="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 leading-snug">
            <span class="text-teal-300 font-bold block mb-0.5">Biophysical Mechanism:</span>
            {{ dockingService.selectedLigand().mechanismOfAction }}
          </div>

        </div>

      </div>

    </div>
  `
})
export class MolecularDockingViewerComponent implements AfterViewInit, OnDestroy {
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  readonly dockingService = inject(MolecularDockingService);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animFrameId: number | null = null;

  private proteinGroup!: THREE.Group;
  private ligandMesh!: THREE.Group;
  private hBondLines: THREE.Line[] = [];

  ngAfterViewInit(): void {
    this.initThree();
    this.buildProteinRibbon();
    this.buildLigandMolecule();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05080c);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.5, 5.0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Molecular Studio Lighting
    const ambLight = new THREE.AmbientLight(0x0a2540, 2.0);
    this.scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0x14b8a6, 2.5);
    dirLight1.position.set(4, 5, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
    dirLight2.position.set(-4, -3, -4);
    this.scene.add(dirLight2);

    const grid = new THREE.GridHelper(10, 20, 0x14b8a6, 0x0f3443);
    grid.position.y = -2.0;
    this.scene.add(grid);
  }

  private buildProteinRibbon(): void {
    this.proteinGroup = new THREE.Group();

    // Procedural Alpha-Helix Ribbon Spiral (Torus Knot / Tube curve)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.5, -0.8, -0.5),
      new THREE.Vector3(-1.0, 0.5, 0.2),
      new THREE.Vector3(-0.2, 1.2, -0.3),
      new THREE.Vector3(0.8, 0.8, 0.4),
      new THREE.Vector3(1.4, -0.2, -0.2),
      new THREE.Vector3(0.6, -1.2, 0.3),
      new THREE.Vector3(-0.4, -0.9, -0.4)
    ], true);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, true);
    const helixMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.2,
      metalness: 0.3,
      wireframe: false
    });
    const helixMesh = new THREE.Mesh(tubeGeo, helixMat);
    this.proteinGroup.add(helixMesh);

    // Active Site Binding Pocket Cavity (Porous glowing sphere)
    const pocketGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const pocketMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.1
    });
    const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
    pocketMesh.position.set(0, 0.1, 0);
    this.proteinGroup.add(pocketMesh);

    this.scene.add(this.proteinGroup);
  }

  private buildLigandMolecule(): void {
    this.ligandMesh = new THREE.Group();

    // CPK Atomic Ball-and-Stick Model
    const atomMatCarbon = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 });
    const atomMatOxygen = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2 });
    const atomMatNitrogen = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.2 });

    const atomGeo = new THREE.SphereGeometry(0.08, 12, 12);

    const atomPositions = [
      { pos: [0, 0, 0], mat: atomMatCarbon },
      { pos: [0.15, 0.12, 0], mat: atomMatCarbon },
      { pos: [-0.15, 0.12, 0], mat: atomMatCarbon },
      { pos: [0, -0.15, 0.05], mat: atomMatOxygen },
      { pos: [0.25, -0.1, -0.05], mat: atomMatNitrogen }
    ];

    for (const a of atomPositions) {
      const mesh = new THREE.Mesh(atomGeo, a.mat);
      mesh.position.set(a.pos[0], a.pos[1], a.pos[2]);
      this.ligandMesh.add(mesh);
    }

    this.ligandMesh.position.set(0, 0.1, 0);
    this.scene.add(this.ligandMesh);

    // Glowing Green Hydrogen Bond Lines
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x10b981,
      dashSize: 0.05,
      gapSize: 0.03,
      linewidth: 2
    });

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.15, 0.05),
      new THREE.Vector3(0.2, -0.4, 0.3)
    ]);

    const hBond = new THREE.Line(lineGeo, lineMat);
    hBond.computeLineDistances();
    this.scene.add(hBond);
    this.hBondLines.push(hBond);
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.proteinGroup) {
      this.proteinGroup.rotation.y += 0.005;
      this.proteinGroup.rotation.x += 0.002;
    }

    if (this.ligandMesh) {
      const time = performance.now() * 0.002;
      this.ligandMesh.position.y = 0.1 + Math.sin(time) * 0.05;
      this.ligandMesh.rotation.z = Math.cos(time * 0.5) * 0.15;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
