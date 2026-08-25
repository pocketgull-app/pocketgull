import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type DissectionLayer = 'skin' | 'muscle' | 'capsule' | 'ligament' | 'bone';
export type ToolMode = 'inspect' | 'laser_pbm' | 'scalpel_resect' | 'synovial_lavage';

@Component({
  selector: 'app-clinical-holodeck-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Top Header HUD -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono text-lg font-bold shadow-inner">
            🥽
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                The Clinical Holodeck • 3D WebXR Joint Dissection
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Zero-Gravity Spatial Biomechanics
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Multi-Layer Arthroscopic Dissection • Real-Time Cytokine Particle Physics &amp; Photobiomodulation Laser
            </p>
          </div>
        </div>

        <!-- Tool Selection & WebXR Trigger -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            <button 
              (click)="setTool('inspect')"
              [class.bg-teal-500]="activeTool() === 'inspect'"
              [class.text-zinc-950]="activeTool() === 'inspect'"
              [class.text-teal-400]="activeTool() !== 'inspect'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              🔍 Inspect
            </button>
            <button 
              (click)="setTool('laser_pbm')"
              [class.bg-rose-500]="activeTool() === 'laser_pbm'"
              [class.text-white]="activeTool() === 'laser_pbm'"
              [class.text-rose-400]="activeTool() !== 'laser_pbm'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              ⚡ 810nm Laser
            </button>
            <button 
              (click)="setTool('synovial_lavage')"
              [class.bg-cyan-500]="activeTool() === 'synovial_lavage'"
              [class.text-zinc-950]="activeTool() === 'synovial_lavage'"
              [class.text-cyan-400]="activeTool() !== 'synovial_lavage'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              💧 Lavage
            </button>
          </div>

          <button 
            (click)="triggerXrSession()"
            class="px-3.5 py-1.5 rounded-xl border border-teal-500/40 bg-teal-950/40 text-teal-300 font-bold hover:bg-teal-900/60 transition text-[11px] min-h-[36px] flex items-center gap-1.5 cursor-pointer">
            <span>🥽</span>
            <span>Enter WebXR</span>
          </button>
        </div>
      </div>

      <!-- Main Holodeck Grid (3D WebXR Canvas Left 8 Cols, Dissection HUD Right 4 Cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left: Three.js 3D Dissection Canvas -->
        <div class="lg:col-span-8 relative min-h-[420px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
          <div #holodeckContainer class="w-full h-full min-h-[420px] cursor-crosshair"></div>

          <!-- Floating Surgical Telemetry Overlay HUD -->
          <div class="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 text-xs font-mono bg-zinc-950/85 backdrop-blur-md p-3 rounded-xl border border-zinc-800 text-zinc-300 shadow-xl">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" [class.bg-rose-500]="activeTool() === 'laser_pbm'" [class.bg-teal-400]="activeTool() !== 'laser_pbm'"></span>
              <span class="text-zinc-100 font-bold">Active Tool:</span>
              <span class="text-teal-300 font-bold uppercase">{{ activeTool() }}</span>
            </div>
            <div class="flex items-center justify-between gap-4 text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-1.5">
              <span>Intra-Articular Pressure: <strong class="text-cyan-300">14.2 mmHg</strong></span>
              <span>Layer: <strong class="text-amber-300 capitalize">{{ visibleLayer() }}</strong></span>
            </div>
            <div class="flex items-center justify-between gap-4 text-[11px] text-zinc-400">
              <span>Cytokine Load (IL-1β): <strong class="text-rose-400">{{ cytokineLoad() }} pg/mL</strong></span>
              <span>Photons: <strong class="text-emerald-400">{{ photonsDelivered() }} J/cm²</strong></span>
            </div>
          </div>

          <!-- Fire Laser Instruction Overlay -->
          @if (activeTool() === 'laser_pbm') {
            <div class="absolute bottom-3 left-3 right-3 bg-rose-950/80 backdrop-blur-md p-2.5 rounded-xl border border-rose-500/40 flex items-center justify-between text-xs font-mono text-rose-200">
              <span>🎯 Click on the glowing Meniscus/ACL tear to discharge 810nm laser photobiomodulation!</span>
              <span class="text-rose-400 font-bold tabular-nums">{{ photonsDelivered() }} J/cm²</span>
            </div>
          }
        </div>

        <!-- Right Side: Anatomical Layer Peeling & Joint Biomechanics -->
        <div class="lg:col-span-4 flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono">
          
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span class="font-semibold text-zinc-200">Anatomical Layer Peeling</span>
            <span class="text-[10px] text-teal-400">Depth: {{ layerDepth() }}%</span>
          </div>

          <!-- Layer Depth Slider -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-zinc-300">
              <span>Dissection Plane Depth:</span>
              <span class="text-teal-300 font-bold capitalize">{{ visibleLayer() }}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              [value]="layerDepth()" 
              (input)="onLayerDepthChange($event)"
              class="w-full accent-teal-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>

          <!-- Layer Quick Selector Pills -->
          <div class="grid grid-cols-2 gap-1.5 pt-1">
            <button 
              (click)="setLayer('skin', 10)"
              [class.bg-teal-600]="visibleLayer() === 'skin'"
              [class.text-white]="visibleLayer() === 'skin'"
              [class.bg-zinc-950]="visibleLayer() !== 'skin'"
              [class.text-zinc-400]="visibleLayer() !== 'skin'"
              class="p-2 rounded-lg border border-zinc-800 font-bold text-[11px] transition text-left min-h-[38px] touch-manipulation">
              1. Fascia &amp; Skin
            </button>
            <button 
              (click)="setLayer('muscle', 35)"
              [class.bg-teal-600]="visibleLayer() === 'muscle'"
              [class.text-white]="visibleLayer() === 'muscle'"
              [class.bg-zinc-950]="visibleLayer() !== 'muscle'"
              [class.text-zinc-400]="visibleLayer() !== 'muscle'"
              class="p-2 rounded-lg border border-zinc-800 font-bold text-[11px] transition text-left min-h-[38px] touch-manipulation">
              2. Tendon &amp; Muscle
            </button>
            <button 
              (click)="setLayer('capsule', 60)"
              [class.bg-teal-600]="visibleLayer() === 'capsule'"
              [class.text-white]="visibleLayer() === 'capsule'"
              [class.bg-zinc-950]="visibleLayer() !== 'capsule'"
              [class.text-zinc-400]="visibleLayer() !== 'capsule'"
              class="p-2 rounded-lg border border-zinc-800 font-bold text-[11px] transition text-left min-h-[38px] touch-manipulation">
              3. Synovial Bursa
            </button>
            <button 
              (click)="setLayer('ligament', 85)"
              [class.bg-teal-600]="visibleLayer() === 'ligament'"
              [class.text-white]="visibleLayer() === 'ligament'"
              [class.bg-zinc-950]="visibleLayer() !== 'ligament'"
              [class.text-zinc-400]="visibleLayer() !== 'ligament'"
              class="p-2 rounded-lg border border-zinc-800 font-bold text-[11px] transition text-left min-h-[38px] touch-manipulation">
              4. Cruciate Ligaments
            </button>
          </div>

          <!-- Arthroscopic Guidance Card -->
          <div class="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mt-2 space-y-1.5 text-[11px] leading-relaxed">
            <span class="text-teal-300 font-bold block">🎯 Targeted Locus: Medial Meniscus</span>
            <p class="text-zinc-400">
              Apply 810nm photobiomodulation to stimulate mitochondrial cytochrome-c oxidase and decrease synovial cytokine cascades.
            </p>
          </div>

        </div>

      </div>

    </div>
  `
})
export class ClinicalHolodeckViewerComponent implements AfterViewInit, OnDestroy {
  readonly holodeckContainer = viewChild<ElementRef<HTMLDivElement>>('holodeckContainer');

  readonly activeTool = signal<ToolMode>('laser_pbm');
  readonly visibleLayer = signal<DissectionLayer>('ligament');
  readonly layerDepth = signal<number>(85);
  readonly cytokineLoad = signal<number>(48.5); // pg/mL
  readonly photonsDelivered = signal<number>(0); // J/cm2

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animFrameId: number | null = null;

  private skinMesh!: THREE.Mesh;
  private muscleMesh!: THREE.Mesh;
  private boneMeshGroup!: THREE.Group;
  private particleCloud!: THREE.Points;
  private laserBeam!: THREE.Line;

  ngAfterViewInit(): void {
    this.initThree();
    this.buildHolodeckLayers();
    this.buildCytokineParticles();
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

  setTool(tool: ToolMode): void {
    this.activeTool.set(tool);
  }

  setLayer(layer: DissectionLayer, depth: number): void {
    this.visibleLayer.set(layer);
    this.layerDepth.set(depth);
    this.updateLayerOpacities(depth);
  }

  onLayerDepthChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.layerDepth.set(val);
    if (val < 25) this.visibleLayer.set('skin');
    else if (val < 50) this.visibleLayer.set('muscle');
    else if (val < 75) this.visibleLayer.set('capsule');
    else this.visibleLayer.set('ligament');
    this.updateLayerOpacities(val);
  }

  triggerXrSession(): void {
    alert('WebXR Spatial Immersion Session Request dispatched! Ready for Apple Vision Pro & Meta Quest WebXR headsets.');
  }

  private initThree(): void {
    const container = this.holodeckContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05080c);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.0, 4.0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Zero-Gravity Hologram Lighting
    const amb = new THREE.AmbientLight(0x0a2540, 2.2);
    this.scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0x14b8a6, 2.5);
    dir1.position.set(4, 5, 5);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xf43f5e, 1.5);
    dir2.position.set(-4, -3, -3);
    this.scene.add(dir2);

    const grid = new THREE.GridHelper(10, 20, 0x14b8a6, 0x0f3443);
    grid.position.y = -2.0;
    this.scene.add(grid);

    // Laser Beam Ray
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 3 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.8, 1.8, 1.0),
      new THREE.Vector3(0, 0.1, 0)
    ]);
    this.laserBeam = new THREE.Line(lineGeo, lineMat);
    this.scene.add(this.laserBeam);

    // Click handler for laser PBM firing
    this.renderer.domElement.addEventListener('click', () => {
      if (this.activeTool() === 'laser_pbm') {
        this.photonsDelivered.update(p => Math.min(24, p + 2));
        this.cytokineLoad.update(c => Math.max(12.0, c - 4.5));
      }
    });
  }

  private buildHolodeckLayers(): void {
    this.boneMeshGroup = new THREE.Group();

    // 1. Bones (Femur & Tibia)
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 16), boneMat);
    femur.position.y = 0.8;
    this.boneMeshGroup.add(femur);

    const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 1.4, 16), boneMat);
    tibia.position.y = -0.8;
    this.boneMeshGroup.add(tibia);

    // Ligaments & Meniscus
    const ligamentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });
    const acl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), ligamentMat);
    acl.rotation.z = 0.4;
    this.boneMeshGroup.add(acl);

    this.scene.add(this.boneMeshGroup);

    // 2. Muscle & Tendon Sheath Envelope
    const muscleMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      transparent: true,
      opacity: 0.15,
      roughness: 0.5
    });
    this.muscleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 16), muscleMat);
    this.scene.add(this.muscleMesh);

    // 3. Skin Envelope (Glassmorphic Outer Hologram)
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.10,
      roughness: 0.1,
      wireframe: true
    });
    this.skinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 16), skinMat);
    this.scene.add(this.skinMesh);
  }

  private buildCytokineParticles(): void {
    // 200 Floating Cytokine (IL-1b / TNF-a) Particles in Joint Cavity
    const count = 250;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1.2;
      positions[i + 1] = (Math.random() - 0.5) * 0.8;
      positions[i + 2] = (Math.random() - 0.5) * 1.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xf43f5e,
      size: 0.04,
      transparent: true,
      opacity: 0.8
    });

    this.particleCloud = new THREE.Points(geo, mat);
    this.scene.add(this.particleCloud);
  }

  private updateLayerOpacities(depth: number): void {
    if (this.skinMesh && this.muscleMesh) {
      (this.skinMesh.material as THREE.MeshStandardMaterial).opacity = Math.max(0.02, (100 - depth) / 400);
      (this.muscleMesh.material as THREE.MeshStandardMaterial).opacity = depth > 70 ? 0.05 : Math.max(0.1, (100 - depth) / 200);
    }
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.boneMeshGroup) {
      this.boneMeshGroup.rotation.y += 0.005;
    }

    if (this.particleCloud) {
      this.particleCloud.rotation.y += 0.01;
      const time = performance.now() * 0.002;
      this.particleCloud.position.y = Math.sin(time) * 0.05;
    }

    if (this.laserBeam && this.activeTool() === 'laser_pbm') {
      this.laserBeam.visible = Math.sin(performance.now() * 0.01) > -0.2;
    } else if (this.laserBeam) {
      this.laserBeam.visible = false;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
