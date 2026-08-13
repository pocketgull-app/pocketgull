import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, effect, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import { WebGpuEdgeAiService } from '../../services/webgpu-edge-ai.service';
import { TeledentistryService } from '../../services/teledentistry.service';

export type BiophysicalTissueSubstrate = 'bone' | 'vascular' | 'dental' | 'skin';

@Component({
  selector: 'app-genesis-biophysical-substrate',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full h-full min-h-[460px] bg-zinc-950/95 relative overflow-hidden rounded-3xl border border-amber-500/30 shadow-2xl font-mono text-zinc-100 flex flex-col justify-between">
      
      <!-- Background Radial Ambient Glow -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-zinc-950/90 to-black z-0"></div>

      <!-- Top Header HUD -->
      <div class="relative z-20 p-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
            🧬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-black uppercase tracking-wider text-amber-200">Genesis Biophysical Substrate Lens</h3>
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">
                Edwin Smith PBR Codex
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-sans">
              WebGL 3D Procedural Tissue Texture Simulation & Microgravity Resorption HUD
            </p>
          </div>
        </div>

        <!-- Substrate Selector Tabs -->
        <div class="flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800">
          <button 
            type="button"
            (click)="setSubstrate('bone')"
            [class.bg-amber-500]="activeSubstrate() === 'bone'"
            [class.text-zinc-950]="activeSubstrate() === 'bone'"
            [class.text-amber-400]="activeSubstrate() !== 'bone'"
            class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer">
            🦴 Bone
          </button>
          <button 
            type="button"
            (click)="setSubstrate('vascular')"
            [class.bg-rose-500]="activeSubstrate() === 'vascular'"
            [class.text-zinc-950]="activeSubstrate() === 'vascular'"
            [class.text-rose-400]="activeSubstrate() !== 'vascular'"
            class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer">
            🫀 Vascular
          </button>
          <button 
            type="button"
            (click)="setSubstrate('dental')"
            [class.bg-cyan-500]="activeSubstrate() === 'dental'"
            [class.text-zinc-950]="activeSubstrate() === 'dental'"
            [class.text-cyan-300]="activeSubstrate() !== 'dental'"
            class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer">
            🦷 Dental
          </button>
          <button 
            type="button"
            (click)="setSubstrate('skin')"
            [class.bg-emerald-500]="activeSubstrate() === 'skin'"
            [class.text-zinc-950]="activeSubstrate() === 'skin'"
            [class.text-emerald-400]="activeSubstrate() !== 'skin'"
            class="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-xl transition cursor-pointer">
            🧫 Skin
          </button>
        </div>
      </div>

      <!-- 3D Canvas Canvas Container -->
      <div #canvasContainer class="w-full flex-1 relative min-h-[300px] cursor-grab active:cursor-grabbing">
        
        <!-- Live Parameter HUD Overlay -->
        <div class="absolute bottom-4 left-4 z-20 bg-zinc-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-zinc-800/90 shadow-xl max-w-xs space-y-2">
          <div class="text-[10px] font-black uppercase text-amber-400 tracking-wider">
            Substrate Physical Matrix
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <span class="text-zinc-400">Roughness:</span>
            <span class="text-zinc-200 font-bold text-right">{{ currentParams().roughness }}</span>
            
            <span class="text-zinc-400">Metalness:</span>
            <span class="text-zinc-200 font-bold text-right">{{ currentParams().metalness }}</span>

            <span class="text-zinc-400">Microgravity $\Delta$BMD:</span>
            <span class="text-amber-300 font-bold text-right">-{{ bmdResorptionRate() }}% / mo</span>

            <span class="text-zinc-400">SIBI Inflammatory:</span>
            <span class="text-rose-400 font-bold text-right">{{ sibiScore() }} / 10</span>
          </div>
        </div>

        <!-- WebGPU Execution Telemetry Badge -->
        <div class="absolute top-4 left-4 z-20 bg-zinc-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-sky-500/30 shadow-xl space-y-1 text-[10px]">
          <div class="flex items-center gap-1.5 text-sky-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>WebGPU Edge Telemetry</span>
          </div>
          <div class="text-zinc-300 font-mono">
            Backend: <span class="text-emerald-400 font-bold">{{ edgeAi.telemetry().computeBackend }}</span>
          </div>
          <div class="text-zinc-300 font-mono">
            Latency: <span class="text-amber-300 font-bold">{{ edgeAi.telemetry().inferenceLatencyMs }}ms</span> | {{ edgeAi.telemetry().tokensPerSecond }} t/s
          </div>
        </div>
      </div>

      <!-- Bottom Interactive Controls Bar -->
      <div class="relative z-20 p-4 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- Microgravity Resorption Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px] font-bold">
            <span class="text-amber-300">Spaceflight Bone Resorption ($\Delta$BMD)</span>
            <span class="text-amber-400 font-mono">-{{ bmdResorptionRate() }}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="3.0" 
            step="0.1" 
            [value]="bmdResorptionRate()" 
            (input)="updateBmdRate($event)"
            class="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
        </div>

        <!-- Oral-Systemic SIBI Burden Slider -->
        <div class="space-y-1">
          <div class="flex justify-between text-[11px] font-bold">
            <span class="text-rose-300">Systemic Burden Index (SIBI)</span>
            <span class="text-rose-400 font-mono">{{ sibiScore() }} pts</span>
          </div>
          <input 
            type="range" 
            min="1.0" 
            max="10.0" 
            step="0.5" 
            [value]="sibiScore()" 
            (input)="updateSibiScore($event)"
            class="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500" />
        </div>

        <!-- Trigger Edge AI Assessment Button -->
        <button 
          type="button"
          (click)="runOfflineEdgeAssessment()"
          class="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-2xl font-extrabold text-xs tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
          <span>⚡ Run WebGPU Edge Assessment</span>
        </button>
      </div>
    </div>
  `
})
export class GenesisBiophysicalSubstrateComponent implements AfterViewInit, OnDestroy {
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  private readonly patientState = inject(PatientStateService, { optional: true });
  private readonly injectedEdgeAi = inject(WebGpuEdgeAiService, { optional: true });
  readonly edgeAi = this.injectedEdgeAi || new WebGpuEdgeAiService();
  private readonly teledentistry = inject(TeledentistryService, { optional: true });

  readonly activeSubstrate = signal<BiophysicalTissueSubstrate>('bone');
  readonly bmdResorptionRate = signal<number>(1.5);
  readonly sibiScore = signal<number>(6.2);

  readonly currentParams = computed(() => {
    switch (this.activeSubstrate()) {
      case 'bone': return { roughness: 0.65, metalness: 0.05, color: 0xe6dfd5 };
      case 'vascular': return { roughness: 0.25, metalness: 0.15, color: 0x991b1b };
      case 'dental': return { roughness: 0.15, metalness: 0.0, color: 0xf8fafc };
      case 'skin': return { roughness: 0.45, metalness: 0.0, color: 0xd97706 };
    }
  });

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private mesh!: THREE.Mesh;
  private animationFrameId?: number;

  constructor() {
    effect(() => {
      const params = this.currentParams();
      if (this.mesh && this.mesh.material) {
        const mat = this.mesh.material as THREE.MeshStandardMaterial;
        mat.roughness = params.roughness;
        mat.metalness = params.metalness;
        mat.color.setHex(params.color);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
  }

  setSubstrate(sub: BiophysicalTissueSubstrate): void {
    this.activeSubstrate.set(sub);
  }

  updateBmdRate(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.bmdResorptionRate.set(val);
  }

  updateSibiScore(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.sibiScore.set(val);
  }

  async runOfflineEdgeAssessment(): Promise<void> {
    const context = `Biophysical Substrate ${this.activeSubstrate()}, BMD Resorption Rate: ${this.bmdResorptionRate()}%, SIBI Burden Score: ${this.sibiScore()}`;
    await this.edgeAi.generateStructuredOfflineAssessment(context);
  }

  private initThreeJs(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || typeof window === 'undefined') return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 1.5);
    dirLight1.position.set(5, 5, 5);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-5, -5, -2);
    this.scene.add(dirLight2);

    // Procedural Mesh (Icosahedron Geometry with PBR Standard Material)
    const geom = new THREE.IcosahedronGeometry(1.2, 4);
    const params = this.currentParams();
    const mat = new THREE.MeshStandardMaterial({
      color: params.color,
      roughness: params.roughness,
      metalness: params.metalness,
      wireframe: false
    });

    this.mesh = new THREE.Mesh(geom, mat);
    this.scene.add(this.mesh);

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      this.mesh.rotation.y += 0.005;
      this.mesh.rotation.x += 0.002;
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
