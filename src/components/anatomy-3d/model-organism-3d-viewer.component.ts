import { Component, ChangeDetectionStrategy, ElementRef, OnDestroy, AfterViewInit, input, viewChild, signal, inject, PLATFORM_ID, NgZone, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-model-organism-3d-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full rounded-2xl bg-zinc-950 border border-cyan-500/30 overflow-hidden shadow-2xl p-4 font-mono text-zinc-100 flex flex-col gap-4">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-sm">
            {{ organismType() === 'drosophila' ? '🪰' : organismType() === 'celegans' ? '🪱' : '🐟' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-cyan-300">
                {{ organismTitle() }}
              </span>
              <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                NIH MOSC Phase II
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans">
              {{ organismSubtitle() }}
            </p>
          </div>
        </div>

        <!-- State Toggles (Wild-type vs Mutant vs Pharmacological Rescue) -->
        <div class="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button (click)="setMode('wild_type')"
                  type="button"
                  [class.bg-emerald-500]="activeMode() === 'wild_type'"
                  [class.text-zinc-950]="activeMode() === 'wild_type'"
                  [class.font-bold]="activeMode() === 'wild_type'"
                  [class.text-zinc-400]="activeMode() !== 'wild_type'"
                  class="px-2.5 py-1 rounded-lg text-[10px] uppercase transition cursor-pointer"
                  aria-label="Wild Type Normal State">
            Wild-Type
          </button>
          <button (click)="setMode('mutant')"
                  type="button"
                  [class.bg-rose-500]="activeMode() === 'mutant'"
                  [class.text-white]="activeMode() === 'mutant'"
                  [class.font-bold]="activeMode() === 'mutant'"
                  [class.text-zinc-400]="activeMode() !== 'mutant'"
                  class="px-2.5 py-1 rounded-lg text-[10px] uppercase transition cursor-pointer"
                  aria-label="Mutant Phenotype Defect">
            Mutant (VUS)
          </button>
          <button (click)="setMode('rescued')"
                  type="button"
                  [class.bg-cyan-500]="activeMode() === 'rescued'"
                  [class.text-zinc-950]="activeMode() === 'rescued'"
                  [class.font-bold]="activeMode() === 'rescued'"
                  [class.text-zinc-400]="activeMode() !== 'rescued'"
                  class="px-2.5 py-1 rounded-lg text-[10px] uppercase transition cursor-pointer"
                  aria-label="Pharmacological Rescue">
            Drug Rescued
          </button>
        </div>
      </div>

      <!-- 3D WebGL Canvas Container -->
      <div #canvasContainer 
           class="w-full h-72 sm:h-80 rounded-xl relative overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-inner cursor-grab active:cursor-grabbing">
        
        @if (!webglSupported()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-900 rounded-xl">
            <span class="text-xs text-zinc-400">WebGL 3D visualizer initializing...</span>
          </div>
        }

        <!-- Interactive Telemetry Overlay Badges -->
        <div class="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          <div class="px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800 text-[10px] backdrop-blur-sm flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="activeMode() === 'wild_type'" [class.bg-rose-400]="activeMode() === 'mutant'" [class.bg-cyan-400]="activeMode() === 'rescued'"></span>
            <span>Mode: <strong>{{ activeMode().toUpperCase() }}</strong></span>
          </div>
          <div class="px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800 text-[10px] backdrop-blur-sm">
            Rescue Index: <strong class="text-cyan-300">{{ activeMode() === 'rescued' ? '92%' : activeMode() === 'wild_type' ? '100%' : '18%' }}</strong>
          </div>
        </div>

        <div class="absolute bottom-3 right-3 text-[10px] text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800 pointer-events-none">
          Click & Drag to Orbit • Scroll to Zoom
        </div>
      </div>

      <!-- Phenotypic Readout Summary Footer -->
      <div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2 font-sans">
        <div class="flex items-center gap-2">
          <span class="text-amber-400 font-bold">Quantitative Readout:</span>
          <span class="text-zinc-200">
            @if (activeMode() === 'rescued') {
              ✓ Pharmacological compound restored motility & cellular viability (p &lt; 0.001).
            } @else if (activeMode() === 'mutant') {
              ⚠️ Severe phenotypic disruption observed in orthologous human locus.
            } @else {
              ✓ Baseline physiological locomotion and cellular homeostasis.
            }
          </span>
        </div>
        <span class="text-[10px] font-mono text-cyan-400">FPS: ~60 (Composited)</span>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    canvas { outline: none; }
  `]
})
export class ModelOrganism3DViewerComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  organismType = input<'drosophila' | 'celegans' | 'danio_rerio'>('drosophila');
  activeMode = signal<'wild_type' | 'mutant' | 'rescued'>('rescued');
  webglSupported = signal<boolean>(true);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private modelGroup?: THREE.Group;
  private animationFrameId?: number;
  private isDestroyed = false;
  private isVisible = true;
  private clock = new THREE.Clock();

  readonly organismTitle = () => {
    switch (this.organismType()) {
      case 'drosophila': return 'Drosophila melanogaster (Fruit Fly)';
      case 'celegans': return 'Caenorhabditis elegans (Nematode)';
      case 'danio_rerio': return 'Danio rerio (Zebrafish)';
    }
  };

  readonly organismSubtitle = () => {
    switch (this.organismType()) {
      case 'drosophila': return 'Negative Geotaxis Climbing Velocity & Mitochondrial ATP Bioassay';
      case 'celegans': return 'U12 Minor Spliceosome Intron Excision Fluorescence Reporter';
      case 'danio_rerio': return 'Branchial Arch Cartilage Symmetry & Wnt Signaling Reporter';
    }
  };

  constructor() {
    effect(() => {
      const type = this.organismType();
      const mode = this.activeMode();
      if (this.scene) {
        this.buildOrganismModel(type, mode);
      }
    });
  }

  setMode(mode: 'wild_type' | 'mutant' | 'rescued'): void {
    this.activeMode.set(mode);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initThreeJs();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJs(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    this.ngZone.runOutsideAngular(() => {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 300;

      // 1. Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 2, 7);

      // 3. Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(this.renderer.domElement);

      // 4. Controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxDistance = 15;
      this.controls.minDistance = 2;

      // 5. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
      dirLight.position.set(5, 10, 7);
      this.scene.add(dirLight);

      const pointLight = new THREE.PointLight(0x10b981, 2, 10);
      pointLight.position.set(-3, -2, 2);
      this.scene.add(pointLight);

      // 6. Build Initial Organism Model
      this.buildOrganismModel(this.organismType(), this.activeMode());

      // 7. Resize Observer
      const resizeObserver = new ResizeObserver(entries => {
        if (!entries[0] || this.isDestroyed || !this.camera || !this.renderer) return;
        const newW = entries[0].contentRect.width;
        const newH = entries[0].contentRect.height;
        if (newW > 0 && newH > 0) {
          this.camera.aspect = newW / newH;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(newW, newH);
        }
      });
      resizeObserver.observe(container);

      // 8. Intersection Observer to pause when not visible
      const intersectionObserver = new IntersectionObserver(entries => {
        this.isVisible = entries[0]?.isIntersecting ?? true;
      });
      intersectionObserver.observe(container);

      // 9. Animation Loop
      const animate = () => {
        if (this.isDestroyed) return;
        this.animationFrameId = requestAnimationFrame(animate);

        if (!this.isVisible) return;

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        if (this.modelGroup) {
          const type = this.organismType();
          const mode = this.activeMode();
          const speedMultiplier = mode === 'mutant' ? 0.25 : mode === 'rescued' ? 1.0 : 1.2;

          if (type === 'drosophila') {
            // Flap wings & climb motion
            this.modelGroup.position.y = Math.sin(time * 2 * speedMultiplier) * 0.4;
            const leftWing = this.modelGroup.getObjectByName('leftWing');
            const rightWing = this.modelGroup.getObjectByName('rightWing');
            if (leftWing && rightWing) {
              leftWing.rotation.z = Math.sin(time * 30 * speedMultiplier) * 0.3;
              rightWing.rotation.z = -Math.sin(time * 30 * speedMultiplier) * 0.3;
            }
          } else if (type === 'celegans') {
            // Sinusoidal thrashing body wave
            this.modelGroup.children.forEach((seg, idx) => {
              const phaseOffset = idx * 0.35;
              seg.position.x = Math.sin(time * 4 * speedMultiplier + phaseOffset) * (0.15 * idx);
            });
          } else if (type === 'danio_rerio') {
            // Swimming body undulation & tail flutter
            const tail = this.modelGroup.getObjectByName('tail');
            if (tail) {
              tail.rotation.y = Math.sin(time * 6 * speedMultiplier) * 0.4;
            }
            this.modelGroup.position.x = Math.sin(time * 1.5 * speedMultiplier) * 0.3;
          }

          this.modelGroup.rotation.y += 0.005;
        }

        if (this.controls) this.controls.update();
        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }
      };

      animate();
    });
  }

  private buildOrganismModel(type: 'drosophila' | 'celegans' | 'danio_rerio', mode: 'wild_type' | 'mutant' | 'rescued'): void {
    if (!this.scene) return;

    if (this.modelGroup) {
      this.scene.remove(this.modelGroup);
      this.modelGroup.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.modelGroup = new THREE.Group();

    const mainColor = mode === 'mutant' ? 0xf43f5e : mode === 'rescued' ? 0x06b6d4 : 0x10b981;
    const secondaryColor = mode === 'mutant' ? 0x881337 : 0x0e7490;

    if (type === 'drosophila') {
      // Thorax & Abdomen
      const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.4, metalness: 0.2 });
      const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), bodyMat);
      thorax.scale.set(1, 1.2, 1.4);
      this.modelGroup.add(thorax);

      const headMat = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 0.3 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), headMat);
      head.position.set(0, 0.4, 1.1);
      this.modelGroup.add(head);

      // Glowing Compound Eyes (Red in wild-type, white/mutant in defect)
      const eyeMat = new THREE.MeshStandardMaterial({
        color: mode === 'mutant' ? 0xffffff : 0xef4444,
        emissive: mode === 'mutant' ? 0x666666 : 0xd97706,
        roughness: 0.2
      });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), eyeMat);
      eyeL.position.set(0.35, 0.5, 1.2);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), eyeMat);
      eyeR.position.set(-0.35, 0.5, 1.2);
      this.modelGroup.add(eyeL, eyeR);

      // Wings (Translucent)
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const wingGeom = new THREE.PlaneGeometry(1.2, 2.2);
      
      const leftWing = new THREE.Mesh(wingGeom, wingMat);
      leftWing.name = 'leftWing';
      leftWing.position.set(0.7, 0.8, -0.4);
      leftWing.rotation.set(-Math.PI / 3, 0, Math.PI / 6);

      const rightWing = new THREE.Mesh(wingGeom, wingMat);
      rightWing.name = 'rightWing';
      rightWing.position.set(-0.7, 0.8, -0.4);
      rightWing.rotation.set(-Math.PI / 3, 0, -Math.PI / 6);

      this.modelGroup.add(leftWing, rightWing);

      // 6 Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x27272a });
      for (let i = -1; i <= 1; i++) {
        const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 1.2), legMat);
        legL.position.set(0.9, -0.4, i * 0.5);
        legL.rotation.z = -Math.PI / 3;

        const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 1.2), legMat);
        legR.position.set(-0.9, -0.4, i * 0.5);
        legR.rotation.z = Math.PI / 3;

        this.modelGroup.add(legL, legR);
      }

    } else if (type === 'celegans') {
      // Nematode segmented body spine
      const segmentCount = 14;
      for (let i = 0; i < segmentCount; i++) {
        const radius = Math.sin((i / (segmentCount - 1)) * Math.PI) * 0.4 + 0.08;
        const segMat = new THREE.MeshStandardMaterial({
          color: mainColor,
          emissive: mode === 'rescued' ? 0x059669 : 0x000000,
          emissiveIntensity: mode === 'rescued' ? 0.6 : 0.0,
          roughness: 0.3
        });
        const seg = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), segMat);
        seg.position.set(0, 0, (i - segmentCount / 2) * 0.4);
        this.modelGroup.add(seg);
      }

    } else if (type === 'danio_rerio') {
      // Zebrafish Hydrodynamic Body
      const bodyMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.3, metalness: 0.3 });
      const fishBody = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), bodyMat);
      fishBody.scale.set(0.6, 0.9, 2.2);
      this.modelGroup.add(fishBody);

      // Tail
      const tailGroup = new THREE.Group();
      tailGroup.name = 'tail';
      tailGroup.position.set(0, 0, -2.0);

      const finMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const caudalFin = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), finMat);
      caudalFin.rotation.y = Math.PI / 2;
      tailGroup.add(caudalFin);
      this.modelGroup.add(tailGroup);

      // Branchial Arch Cartilage Highlight (Turquoise Glow)
      const archMat = new THREE.MeshStandardMaterial({
        color: mode === 'mutant' ? 0xf43f5e : 0x2dd4bf,
        emissive: mode === 'mutant' ? 0x881337 : 0x0f766e,
        emissiveIntensity: 0.8
      });
      const archL = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI), archMat);
      archL.position.set(0.4, -0.2, 0.8);
      archL.rotation.y = Math.PI / 2;

      const archR = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 16, Math.PI), archMat);
      archR.position.set(-0.4, -0.2, 0.8);
      archR.rotation.y = -Math.PI / 2;

      this.modelGroup.add(archL, archR);
    }

    this.scene.add(this.modelGroup);
  }
}
