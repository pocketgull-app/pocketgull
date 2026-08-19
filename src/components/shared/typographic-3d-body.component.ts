import { 
  Component, 
  ChangeDetectionStrategy, 
  signal, 
  computed, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

export type T3dAnatomyLens = 'skeleton' | 'vascular' | 'neural' | 'ascii';

@Component({
  selector: 'app-typographic-3d-body',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-slate-900/90 dark:bg-zinc-950/90 border border-slate-700/60 dark:border-zinc-800 rounded-3xl space-y-6 text-zinc-100 font-sans shadow-2xl backdrop-blur-xl">
      
      <!-- Top Title & Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 dark:border-zinc-800 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-zinc-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            🫀
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black uppercase tracking-tight text-zinc-100">
                Typographic 3D Anatomy &amp; Experimental Shaders
              </h2>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                WebGL 3D Calligramme
              </span>
            </div>
            <p class="text-xs text-zinc-400 font-medium">
              Real-time Three.js spatial body viewer rendered via typographic splines, vascular particle flows, and medical halftone shaders.
            </p>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <button
            (click)="activeView.set('3d-body')"
            [class.bg-emerald-500]="activeView() === '3d-body'"
            [class.text-zinc-950]="activeView() === '3d-body'"
            [class.text-zinc-400]="activeView() !== '3d-body'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🫀 3D Body Canvas
          </button>
          <button
            (click)="activeView.set('drawing')"
            [class.bg-emerald-500]="activeView() === 'drawing'"
            [class.text-zinc-950]="activeView() === 'drawing'"
            [class.text-zinc-400]="activeView() !== 'drawing'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            ✍️ Vector Drawing
          </button>
          <button
            (click)="activeView.set('halftone')"
            [class.bg-emerald-500]="activeView() === 'halftone'"
            [class.text-zinc-950]="activeView() === 'halftone'"
            [class.text-zinc-400]="activeView() !== 'halftone'"
            class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
          >
            🏁 Halftone &amp; X-Ray
          </button>
        </div>
      </div>

      <!-- VIEW 1: 3D Typographic Body Canvas (Three.js) -->
      @if (activeView() === '3d-body') {
        <div class="space-y-4 animate-in fade-in duration-300">
          
          <!-- Lens Controls & Auto Rotate Toggle -->
          <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="text-zinc-400 font-bold uppercase">Spatial Lens:</span>
              <button
                (click)="switchLens('skeleton')"
                [class.bg-cyan-500/20]="activeLens() === 'skeleton'"
                [class.text-cyan-300]="activeLens() === 'skeleton'"
                [class.border-cyan-500]="activeLens() === 'skeleton'"
                [class.border-slate-800]="activeLens() !== 'skeleton'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                🦴 Skeleton
              </button>
              <button
                (click)="switchLens('vascular')"
                [class.bg-rose-500/20]="activeLens() === 'vascular'"
                [class.text-rose-300]="activeLens() === 'vascular'"
                [class.border-rose-500]="activeLens() === 'vascular'"
                [class.border-slate-800]="activeLens() !== 'vascular'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                🫀 Vascular Flow
              </button>
              <button
                (click)="switchLens('neural')"
                [class.bg-amber-500/20]="activeLens() === 'neural'"
                [class.text-amber-300]="activeLens() === 'neural'"
                [class.border-amber-500]="activeLens() === 'neural'"
                [class.border-slate-800]="activeLens() !== 'neural'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                ⚡ Neural Action
              </button>
              <button
                (click)="switchLens('ascii')"
                [class.bg-emerald-500/20]="activeLens() === 'ascii'"
                [class.text-emerald-300]="activeLens() === 'ascii'"
                [class.border-emerald-500]="activeLens() === 'ascii'"
                [class.border-slate-800]="activeLens() !== 'ascii'"
                class="px-2.5 py-1 rounded-lg border transition cursor-pointer"
              >
                📟 ASCII Cloud
              </button>
            </div>

            <div class="flex items-center gap-3">
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

          <!-- WebGL Three.js Container -->
          <div class="relative w-full h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            <canvas #threeCanvas class="w-full h-full cursor-grab active:cursor-grabbing"></canvas>

            <!-- Real-Time HUD Overlay -->
            <div class="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] space-y-1 pointer-events-none">
              <div class="text-emerald-400 font-bold flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WebGL 3D Calligramme Active</span>
              </div>
              <div class="text-zinc-400">FPS: 60 • Voxels: {{ voxelCount() }}</div>
              <div class="text-cyan-400">Lens: {{ activeLens().toUpperCase() }}</div>
            </div>

            <!-- Floating Spatial Telemetry -->
            <div class="absolute bottom-4 right-4 p-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl font-mono text-[11px] text-right space-y-0.5 pointer-events-none">
              <div class="text-zinc-400 uppercase text-[9px]">Cardiac Rhythm Sync</div>
              <div class="text-rose-400 font-bold text-sm">72.4 bpm (1.20 Hz)</div>
              <div class="text-zinc-500 text-[10px]">Hemodynamic Spline Flow: 125 mL/s</div>
            </div>
          </div>
        </div>
      }

      <!-- VIEW 2: Kinetic Vector Drawing (Laser/Felt Draw Animation) -->
      @if (activeView() === 'drawing') {
        <div class="space-y-4 animate-in fade-in duration-300">
          <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
                Real-Time Vector Prescription Drawing Engine
              </span>
              <button
                (click)="replayDrawing()"
                class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold hover:bg-emerald-500/30 transition cursor-pointer"
              >
                ↺ Replay Vector Animation
              </button>
            </div>

            <!-- Animated SVG Vector Path Canvas -->
            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center space-y-6 overflow-hidden min-h-[260px]">
              @if (isDrawing()) {
                <svg 
                  [attr.data-draw-key]="drawKey()"
                  viewBox="0 0 800 160" 
                  class="w-full max-w-2xl h-auto"
                >
                  <defs>
                    <linearGradient id="vectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#ef4444" />
                      <stop offset="35%" stop-color="#f59e0b" />
                      <stop offset="70%" stop-color="#06b6d4" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                  </defs>

                  <!-- Outlined Glowing Text Path -->
                  <text 
                    x="400" 
                    y="100" 
                    text-anchor="middle" 
                    class="font-pocketgull-sans font-black text-6xl tracking-widest fill-transparent"
                    stroke="url(#vectorGradient)"
                    stroke-width="2.5"
                    stroke-dasharray="1000"
                    stroke-dashoffset="1000"
                    style="animation: drawStrokeAnimation 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;"
                  >
                    POCKETGULL VF
                  </text>
                </svg>

                <!-- Secondary Medical Prescription Drawing -->
                <svg 
                  [attr.data-draw-key]="drawKey() + 1"
                  viewBox="0 0 800 80" 
                  class="w-full max-w-xl h-auto"
                >
                  <text 
                    x="400" 
                    y="50" 
                    text-anchor="middle" 
                    class="font-pocketgull font-bold text-2xl tracking-wider fill-transparent"
                    stroke="#38bdf8"
                    stroke-width="1.5"
                    stroke-dasharray="800"
                    stroke-dashoffset="800"
                    style="animation: drawStrokeAnimation 2.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;"
                  >
                    Rx: Levothyroxine 50 µg • KCl 20 mEq / 1000 mL
                  </text>
                </svg>
              }
            </div>
          </div>
        </div>
      }

      <!-- VIEW 3: Halftone Risograph & X-Ray Wireframe -->
      @if (activeView() === 'halftone') {
        <div class="space-y-6 animate-in fade-in duration-300">
          
          <!-- Halftone Controls -->
          <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="font-bold uppercase text-emerald-400 tracking-wider">
                Ben-Day Halftone Dot Screen &amp; Risograph Controls
              </span>
              <span class="text-zinc-400">Dot Pitch: {{ halftonePitch() }}px • Ink: {{ halftoneInk() }}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div class="space-y-1">
                <div class="flex justify-between text-zinc-300 text-[11px]">
                  <span>Dot Pitch (Screen Grid)</span>
                  <span class="text-emerald-400 font-bold">{{ halftonePitch() }}px</span>
                </div>
                <input 
                  type="range" 
                  min="3" 
                  max="16" 
                  step="1" 
                  [value]="halftonePitch()" 
                  (input)="updateHalftonePitch($event)"
                  class="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div class="flex items-center gap-2">
                <span class="text-zinc-300 text-[11px]">Risograph Channel:</span>
                <button 
                  (click)="halftoneInk.set('cyan')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-cyan-500/20]="halftoneInk() === 'cyan'"
                  [class.border-cyan-500]="halftoneInk() === 'cyan'"
                >
                  Bio-Cyan
                </button>
                <button 
                  (click)="halftoneInk.set('crimson')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-rose-500/20]="halftoneInk() === 'crimson'"
                  [class.border-rose-500]="halftoneInk() === 'crimson'"
                >
                  Arterial Red
                </button>
                <button 
                  (click)="halftoneInk.set('amber')" 
                  class="px-2.5 py-1 rounded-lg border text-xs cursor-pointer"
                  [class.bg-amber-500/20]="halftoneInk() === 'amber'"
                  [class.border-amber-500]="halftoneInk() === 'amber'"
                >
                  Dieter Amber
                </button>
              </div>
            </div>

            <!-- Halftone Specimen Output -->
            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
              <div 
                class="text-5xl sm:text-7xl font-black uppercase tracking-tight font-pocketgull-sans"
                [style.background-image]="computedHalftonePattern()"
                style="background-color: #09090b; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: contrast(160%);"
              >
                CARDIOLOGY
              </div>
              <p class="text-xs text-zinc-400 font-mono">
                Procedural Ben-Day raster screen simulating vintage medical lithography and physiological risograph printing.
              </p>
            </div>
          </div>

          <!-- X-Ray Wireframe Outlines -->
          <div class="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
            <span class="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              X-Ray Fluoroscopy Bone-Density Wireframe Outline
            </span>

            <div class="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
              <div class="text-4xl sm:text-6xl font-black uppercase tracking-widest font-pocketgull-sans text-transparent"
                   style="-webkit-text-stroke: 1.5px #38bdf8; text-shadow: 0 0 15px rgba(56, 189, 248, 0.7), 0 0 35px rgba(56, 189, 248, 0.3);">
                ANATOMY 3D
              </div>
              <p class="text-xs text-zinc-400 font-mono">
                Luminous bone-cortex wireframe with sub-pixel chromatic offset and deep X-ray transparency.
              </p>
            </div>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes drawStrokeAnimation {
      0% {
        stroke-dashoffset: 1000;
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      100% {
        stroke-dashoffset: 0;
        opacity: 1;
      }
    }
  `]
})
export class Typographic3dBodyComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') threeCanvasRef?: ElementRef<HTMLCanvasElement>;

  activeView = signal<'3d-body' | 'drawing' | 'halftone'>('3d-body');
  activeLens = signal<T3dAnatomyLens>('skeleton');
  autoRotate = signal<boolean>(true);
  voxelCount = signal<number>(1420);
  drawKey = signal<number>(0);
  isDrawing = signal<boolean>(true);

  halftonePitch = signal<number>(6);
  halftoneInk = signal<'cyan' | 'crimson' | 'amber'>('cyan');

  computedHalftonePattern = computed(() => {
    const pitch = this.halftonePitch();
    const half = Math.round(pitch / 2);
    let color1 = '#ffffff';
    let color2 = '#06b6d4';

    if (this.halftoneInk() === 'crimson') {
      color2 = '#ef4444';
    } else if (this.halftoneInk() === 'amber') {
      color2 = '#f59e0b';
    }

    return `radial-gradient(${color1} 22%, transparent 26%), radial-gradient(${color2} 18%, transparent 22%)`;
  });

  // Three.js instances
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private animationFrameId?: number;
  private bodyGroup?: THREE.Group;
  private splineParticles?: THREE.Points;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && this.threeCanvasRef) {
      this.initThreeJs();
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

  private initThreeJs(): void {
    const canvas = this.threeCanvasRef?.nativeElement;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 480;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // slate-950

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 1.2, 3.8);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.bodyGroup = new THREE.Group();
    this.scene.add(this.bodyGroup);

    this.buildTypographicSkeleton();
    this.buildVascularSplines();

    this.animate();
  }

  private buildTypographicSkeleton(): void {
    if (!this.bodyGroup) return;

    // Build stylized anatomical geometry representing typographic bones
    // Cranium
    const headGeom = new THREE.IcosahedronGeometry(0.35, 2);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    const headMesh = new THREE.Mesh(headGeom, wireMat);
    headMesh.position.y = 1.9;
    this.bodyGroup.add(headMesh);

    // Spine
    for (let i = 0; i < 12; i++) {
      const vertGeom = new THREE.BoxGeometry(0.16, 0.04, 0.12);
      const vertMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
      const vertMesh = new THREE.Mesh(vertGeom, vertMat);
      vertMesh.position.set(0, 1.5 - i * 0.08, 0);
      this.bodyGroup.add(vertMesh);
    }

    // Ribcage arcs
    for (let r = 0; r < 7; r++) {
      const ribCurve = new THREE.EllipseCurve(0, 1.35 - r * 0.08, 0.45 - r * 0.02, 0.28, 0, Math.PI * 2, false, 0);
      const points = ribCurve.getPoints(32);
      const ribGeom = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, 0)));
      const ribMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
      const ribLine = new THREE.Line(ribGeom, ribMat);
      this.bodyGroup.add(ribLine);
    }
  }

  private buildVascularSplines(): void {
    if (!this.bodyGroup) return;

    // Catmull-Rom spline representing vascular tree (Aorta to Femoral)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.3, 0.05),
      new THREE.Vector3(0.08, 1.1, 0.08),
      new THREE.Vector3(0, 0.8, 0.05),
      new THREE.Vector3(-0.15, 0.2, 0),
      new THREE.Vector3(-0.2, -0.6, 0),
    ]);

    const splinePoints = aortaCurve.getPoints(80);
    const splineGeom = new THREE.BufferGeometry().setFromPoints(splinePoints);
    const splineMat = new THREE.PointsMaterial({
      color: 0xef4444,
      size: 0.03,
      blending: THREE.AdditiveBlending
    });

    this.splineParticles = new THREE.Points(splineGeom, splineMat);
    this.bodyGroup.add(this.splineParticles);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.bodyGroup && this.autoRotate()) {
      this.bodyGroup.rotation.y += 0.008;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  switchLens(lens: T3dAnatomyLens): void {
    this.activeLens.set(lens);
    if (!this.bodyGroup) return;

    // Change colors or materials based on lens
    if (lens === 'vascular' && this.splineParticles) {
      (this.splineParticles.material as THREE.PointsMaterial).color.setHex(0xef4444);
    } else if (lens === 'neural' && this.splineParticles) {
      (this.splineParticles.material as THREE.PointsMaterial).color.setHex(0xf59e0b);
    } else if (lens === 'ascii' && this.splineParticles) {
      (this.splineParticles.material as THREE.PointsMaterial).color.setHex(0x10b981);
    }
  }

  toggleAutoRotate(): void {
    this.autoRotate.update(v => !v);
  }

  resetCamera(): void {
    if (this.camera) {
      this.camera.position.set(0, 1.2, 3.8);
      this.camera.lookAt(0, 1.0, 0);
    }
    if (this.bodyGroup) {
      this.bodyGroup.rotation.set(0, 0, 0);
    }
  }

  replayDrawing(): void {
    this.isDrawing.set(false);
    this.drawKey.update(k => k + 2);
    setTimeout(() => this.isDrawing.set(true), 20);
  }

  updateHalftonePitch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.halftonePitch.set(Number(input.value));
  }
}
