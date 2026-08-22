import { Component, Input, signal, computed, ElementRef, viewChild, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ILongitudinal3dConfig, ILongitudinalOrganStage } from '../../services/wordpress-articles.service';

@Component({
  selector: 'app-longitudinal-organ-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-5 bg-zinc-950/80 rounded-3xl border border-zinc-800/80 shadow-2xl space-y-5 font-sans">
      
      <!-- Top Title & Mode Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
            🧬
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-bold text-white tracking-wide font-sans">
                3D Anatomical Organ & Longitudinal Consequence Viewer
              </h4>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {{ activeConfig()?.targetOrgan | uppercase }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              {{ activeConfig()?.organTitle }}
            </p>
          </div>
        </div>

        <!-- Intervention vs Unmitigated Disease Toggle -->
        <div class="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-800 font-mono text-xs">
          <button (click)="comparisonMode.set('intervention')"
                  [class.bg-emerald-600]="comparisonMode() === 'intervention'"
                  [class.text-white]="comparisonMode() === 'intervention'"
                  [class.text-zinc-400]="comparisonMode() !== 'intervention'"
                  class="px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
            <span>🛡️</span>
            <span>With Prevention</span>
          </button>
          <button (click)="comparisonMode.set('unmitigated')"
                  [class.bg-rose-600]="comparisonMode() === 'unmitigated'"
                  [class.text-white]="comparisonMode() === 'unmitigated'"
                  [class.text-zinc-400]="comparisonMode() !== 'unmitigated'"
                  class="px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1">
            <span>⚠️</span>
            <span>Unmitigated Path</span>
          </button>
        </div>
      </div>

      <!-- Main Visual Grid: 3D Viewport on Left, Stage Details & Trajectory on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- 3D Canvas / Organ Render Viewport -->
        <div class="lg:col-span-5 relative rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden flex flex-col justify-between min-h-[280px]">
          <!-- Top Overlay Indicators -->
          <div class="p-3 z-10 flex items-center justify-between text-[11px] font-mono">
            <span class="px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800">
              WebGL 3D Organ Shading
            </span>
            <span class="px-2 py-0.5 rounded font-bold"
                  [style.background-color]="activeColor() + '25'"
                  [style.color]="activeColor()"
                  [style.border]="'1px solid ' + activeColor() + '60'">
              {{ activeStage()?.tissueHealthPercent }}% Tissue Reserve
            </span>
          </div>

          <!-- WebGL Three.js Container -->
          <div #threeCanvasContainer class="w-full flex-1 relative flex items-center justify-center min-h-[190px]">
            <!-- Fallback SVG Organ Hologram if WebGL not ready -->
            <svg *ngIf="!webglActive()" class="w-36 h-36 drop-shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" [attr.stroke]="activeColor()" stroke-width="3" stroke-dasharray="4 4" opacity="0.6"/>
              <path d="M50 20 C30 20 20 40 20 55 C20 75 35 85 50 85 C65 85 80 75 80 55 C80 40 70 20 50 20 Z" 
                    [attr.fill]="activeColor()" fill-opacity="0.25" [attr.stroke]="activeColor()" stroke-width="2"/>
              <circle cx="50" cy="50" r="12" [attr.fill]="activeColor()" fill-opacity="0.8"/>
            </svg>
          </div>

          <!-- Bottom Stage Title Bar -->
          <div class="p-3 z-10 bg-zinc-950/90 border-t border-zinc-800/80 text-xs font-mono flex items-center justify-between">
            <span class="text-zinc-400">{{ activeStage()?.timepointLabel }}</span>
            <span class="font-bold text-white">{{ activeStage()?.biomarkerMetric }}</span>
          </div>
        </div>

        <!-- Right Side: Interactive Time Slider & Stage Description -->
        <div class="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          <!-- Interactive Time-Slider -->
          <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-zinc-400 font-bold uppercase tracking-wider">⏱️ Timeline Slider</span>
              <span class="text-cyan-400 font-bold">{{ activeStage()?.timepointLabel }}</span>
            </div>

            <!-- Range Slider -->
            <input type="range" 
                   min="0" 
                   [max]="stages().length - 1" 
                   [ngModel]="activeStageIndex()"
                   (ngModelChange)="setStageIndex(+$event)"
                   class="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg" />

            <!-- Milestone Step Buttons -->
            <div class="grid grid-cols-4 gap-1.5 pt-1">
              @for (stg of stages(); track stg.stepIndex; let idx = $index) {
                <button (click)="setStageIndex(idx)"
                        [class.bg-zinc-800]="activeStageIndex() === idx"
                        [class.border-cyan-500]="activeStageIndex() === idx"
                        [class.text-white]="activeStageIndex() === idx"
                        [class.bg-zinc-950]="activeStageIndex() !== idx"
                        [class.border-zinc-800]="activeStageIndex() !== idx"
                        [class.text-zinc-400]="activeStageIndex() !== idx"
                        class="p-2 rounded-xl border text-[10px] font-mono font-bold transition hover:border-zinc-700 cursor-pointer text-center">
                  {{ stg.timepointLabel.split(' ')[0] }}
                </button>
              }
            </div>
          </div>

          <!-- Dynamic Physiological Status Card -->
          <div class="p-4 rounded-2xl border transition-all duration-300 space-y-2 flex-1"
               [class.bg-emerald-950\/20]="comparisonMode() === 'intervention'"
               [class.border-emerald-500\/40]="comparisonMode() === 'intervention'"
               [class.bg-rose-950\/20]="comparisonMode() === 'unmitigated'"
               [class.border-rose-500\/40]="comparisonMode() === 'unmitigated'">
            
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ comparisonMode() === 'intervention' ? '🛡️' : '⚠️' }}</span>
                <span class="text-xs font-bold uppercase tracking-wider font-mono"
                      [class.text-emerald-300]="comparisonMode() === 'intervention'"
                      [class.text-rose-300]="comparisonMode() === 'unmitigated'">
                  {{ comparisonMode() === 'intervention' ? 'Protected Tissue Status' : 'Disease Progression Status' }}
                </span>
              </div>
              <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                Pathology Score: {{ comparisonMode() === 'intervention' ? activeStage()?.pathologyScore : (100 - (activeStage()?.pathologyScore || 0)) }} / 100
              </span>
            </div>

            <h5 class="text-xs sm:text-sm font-bold text-white font-sans">
              {{ activeStage()?.organState }}
            </h5>

            <p class="text-xs text-zinc-300 leading-relaxed font-sans">
              {{ comparisonMode() === 'intervention' ? activeStage()?.interventionSummary : activeStage()?.unmitigatedSummary }}
            </p>
          </div>

          <!-- Sparkline Trajectory Bar -->
          <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span class="text-zinc-400">Biological Biomarker Target:</span>
            <span class="font-bold text-emerald-400">{{ activeStage()?.biomarkerMetric }}</span>
          </div>

        </div>

      </div>

    </div>
  `
})
export class LongitudinalOrganSliderComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  @Input() set config(val: ILongitudinal3dConfig | undefined) {
    this._config.set(val);
  }
  get config(): ILongitudinal3dConfig | undefined {
    return this._config();
  }
  readonly _config = signal<ILongitudinal3dConfig | undefined>(undefined);
  readonly activeConfig = computed(() => this._config());

  readonly activeStageIndex = signal<number>(0);
  readonly comparisonMode = signal<'intervention' | 'unmitigated'>('intervention');
  readonly webglActive = signal<boolean>(false);

  private threeCanvasContainer = viewChild<ElementRef<HTMLDivElement>>('threeCanvasContainer');
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private mesh?: THREE.Mesh;
  private animationFrameId?: number;

  readonly stages = computed<ILongitudinalOrganStage[]>(() => {
    return this.activeConfig()?.stages || [];
  });

  readonly activeStage = computed<ILongitudinalOrganStage | null>(() => {
    const stgs = this.stages();
    if (!stgs || stgs.length === 0) return null;
    return stgs[this.activeStageIndex()] || stgs[0];
  });

  readonly activeColor = computed<string>(() => {
    const stg = this.activeStage();
    if (!stg) return '#10b981';
    return this.comparisonMode() === 'intervention' ? stg.interventionGlowColor : stg.unmitigatedGlowColor;
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
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

  setStageIndex(index: number): void {
    this.activeStageIndex.set(index);
    this.updateOrganMeshColor();
  }

  private initThreeJs(): void {
    const container = this.threeCanvasContainer()?.nativeElement;
    if (!container) return;

    try {
      const width = container.clientWidth || 240;
      const height = container.clientHeight || 190;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 0, 3.2);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(2, 4, 3);
      this.scene.add(dirLight);

      // Create Organ Mesh Geometry based on Target Organ
      let geometry: THREE.BufferGeometry;
      const organ = this.activeConfig()?.targetOrgan || 'heart';

      if (organ === 'kidneys') {
        geometry = new THREE.TorusKnotGeometry(0.7, 0.25, 64, 16, 2, 3);
      } else if (organ === 'brain') {
        geometry = new THREE.IcosahedronGeometry(0.85, 3);
      } else if (organ === 'liver') {
        geometry = new THREE.ConeGeometry(0.8, 1.4, 32);
      } else {
        geometry = new THREE.SphereGeometry(0.85, 32, 32);
      }

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(this.activeColor()),
        emissive: new THREE.Color(this.activeColor()),
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.2,
        wireframe: false
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);

      this.webglActive.set(true);
      this.animate();
    } catch {
      this.webglActive.set(false);
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    if (this.mesh) {
      this.mesh.rotation.y += 0.008;
      this.mesh.rotation.x += 0.004;
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private updateOrganMeshColor(): void {
    if (this.mesh && this.mesh.material instanceof THREE.MeshStandardMaterial) {
      const targetColor = new THREE.Color(this.activeColor());
      this.mesh.material.color = targetColor;
      this.mesh.material.emissive = targetColor;
      this.mesh.material.emissiveIntensity = this.comparisonMode() === 'intervention' ? 0.45 : 0.75;
    }
  }
}
