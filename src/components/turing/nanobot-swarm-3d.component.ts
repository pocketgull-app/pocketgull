import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  NanobotSwarmPhysicsService,
  SwarmOperationalMode,
  ISwarmAcousticVector
} from '../../services/nanobot-swarm-physics.service';

@Component({
  selector: 'app-nanobot-swarm-3d',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-slate-950 text-zinc-100 rounded-2xl border border-teal-900/50 p-4 shadow-2xl font-mono relative overflow-hidden">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-teal-900/40 pb-2.5">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">🤖</span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-teal-300 flex items-center gap-2">
              Nanobot Swarm Biomechanics & Telescope-Inspired Physics Engine
              <span class="text-[9px] px-2 py-0.5 rounded-full bg-teal-950 border border-teal-500/40 text-teal-300">
                Low-Re {{ meanReynolds() }}
              </span>
            </h3>
            <p class="text-[10px] text-teal-400/80">
              Purcell Helical Corkscrews, Distributed JWST Phase-Locking, Roman Coronagraphic Glare Nulling & Durotactic Lensing
            </p>
          </div>
        </div>

        <!-- Coherence & Mode Status Badges -->
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/80 border border-teal-500/40 text-xs">
            <span class="w-2 h-2 rounded-full" [class.bg-teal-400]="coherence() >= 0.7" [class.bg-amber-400]="coherence() < 0.7 && coherence() >= 0.4" [class.bg-rose-500]="coherence() < 0.4" class="animate-pulse"></span>
            <span class="text-zinc-300 text-[11px]">Kuramoto Φ:</span>
            <strong class="text-teal-200">{{ coherence() }}</strong>
          </div>
          <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-cyan-950 border border-cyan-700/60 text-cyan-300">
            {{ activeMode() }}
          </span>
        </div>
      </div>

      <!-- Mode & Target Pill Selector Bar -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-teal-900/30 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          <button (click)="setMode('ACOUSTIC_DRILL')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-teal-600]="activeMode() === 'ACOUSTIC_DRILL'" [class.text-white]="activeMode() === 'ACOUSTIC_DRILL'" [class.border-teal-400]="activeMode() === 'ACOUSTIC_DRILL'"
                  [class.bg-zinc-900]="activeMode() !== 'ACOUSTIC_DRILL'" [class.text-zinc-400]="activeMode() !== 'ACOUSTIC_DRILL'" [class.border-zinc-800]="activeMode() !== 'ACOUSTIC_DRILL'">
            🌀 Acoustic Drill
          </button>
          <button (click)="setMode('CORONAGRAPHIC_TRACKING')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-purple-600]="activeMode() === 'CORONAGRAPHIC_TRACKING'" [class.text-white]="activeMode() === 'CORONAGRAPHIC_TRACKING'" [class.border-purple-400]="activeMode() === 'CORONAGRAPHIC_TRACKING'"
                  [class.bg-zinc-900]="activeMode() !== 'CORONAGRAPHIC_TRACKING'" [class.text-zinc-400]="activeMode() !== 'CORONAGRAPHIC_TRACKING'" [class.border-zinc-800]="activeMode() !== 'CORONAGRAPHIC_TRACKING'">
            🔭 Coronagraphic Nulling
          </button>
          <button (click)="setMode('DUROTACTIC_HOMING')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-amber-600]="activeMode() === 'DUROTACTIC_HOMING'" [class.text-white]="activeMode() === 'DUROTACTIC_HOMING'" [class.border-amber-400]="activeMode() === 'DUROTACTIC_HOMING'"
                  [class.bg-zinc-900]="activeMode() !== 'DUROTACTIC_HOMING'" [class.text-zinc-400]="activeMode() !== 'DUROTACTIC_HOMING'" [class.border-zinc-800]="activeMode() !== 'DUROTACTIC_HOMING'">
            📐 Durotactic Microlensing
          </button>
          <button (click)="setMode('SERS_ACIDOSIS')"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer border"
                  [class.bg-rose-600]="activeMode() === 'SERS_ACIDOSIS'" [class.text-white]="activeMode() === 'SERS_ACIDOSIS'" [class.border-rose-400]="activeMode() === 'SERS_ACIDOSIS'"
                  [class.bg-zinc-900]="activeMode() !== 'SERS_ACIDOSIS'" [class.text-zinc-400]="activeMode() !== 'SERS_ACIDOSIS'" [class.border-zinc-800]="activeMode() !== 'SERS_ACIDOSIS'">
            🩸 Warburg SERS Acidosis
          </button>
        </div>

        <div class="flex items-center gap-2 text-[10px] text-zinc-400">
          <span>Target: <strong class="text-amber-300">{{ targetSite().name }}</strong></span>
        </div>
      </div>

      <!-- Main 3D Canvas Viewport Container -->
      <div class="relative w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden border border-teal-950 bg-black shadow-inner">
        <div #canvasContainer class="w-full h-full"></div>

        <!-- Floating Telemetry HUD Overlay (Top-Left) -->
        <div class="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-md p-2.5 rounded-xl border border-teal-500/30 text-[11px] shadow-xl space-y-1.5 pointer-events-none">
          <div class="flex items-center justify-between gap-4">
            <span class="text-zinc-400">Collective Thrust:</span>
            <span class="text-teal-300 font-bold tabular-nums">{{ collectiveThrust() }} nN</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-zinc-400">Coronagraphic Gain:</span>
            <span class="text-purple-300 font-bold tabular-nums">+{{ coronagraphicTelemetry().coronagraphicSnrGainDb }} dB</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-zinc-400">Capture Rate:</span>
            <span class="text-emerald-300 font-bold tabular-nums">{{ targetCaptureRate() }}%</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span class="text-zinc-400">Target Core Stiffness:</span>
            <span class="text-amber-300 font-bold tabular-nums">{{ targetSite().stiffnessKpa }} kPa</span>
          </div>
          <div class="flex items-center justify-between gap-4 border-t border-zinc-800 pt-1">
            <span class="text-zinc-400">Poisson Logic Lock:</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase" [class.bg-emerald-950]="unlockedCount() > 0" [class.text-emerald-300]="unlockedCount() > 0" [class.bg-zinc-800]="unlockedCount() === 0" [class.text-zinc-400]="unlockedCount() === 0">
              {{ unlockedCount() > 0 ? unlockedCount() + ' BOTS UNLOCKED' : 'SEALED (<1e-7)' }}
            </span>
          </div>
        </div>

        <!-- Floating Steering Controls HUD Overlay (Bottom-Right) -->
        <div class="absolute bottom-3 right-3 bg-zinc-950/90 backdrop-blur-md p-3 rounded-xl border border-teal-500/30 text-[10px] shadow-xl space-y-2 pointer-events-auto w-64">
          <div class="text-teal-300 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Acoustic Steering Vector</span>
            <span class="text-[9px] text-zinc-400">{{ steering().driveFrequencyKhz }} kHz</span>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300">
              <span>Pitch Angle:</span>
              <span class="tabular-nums font-bold text-teal-200">{{ steering().pitchDeg }}°</span>
            </div>
            <input type="range" min="-90" max="90" [value]="steering().pitchDeg"
                   (input)="onPitchChange($event)"
                   class="w-full accent-teal-400 h-1 bg-zinc-800 rounded-lg cursor-pointer">
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300">
              <span>Yaw Angle:</span>
              <span class="tabular-nums font-bold text-teal-200">{{ steering().yawDeg }}°</span>
            </div>
            <input type="range" min="0" max="360" [value]="steering().yawDeg"
                   (input)="onYawChange($event)"
                   class="w-full accent-teal-400 h-1 bg-zinc-800 rounded-lg cursor-pointer">
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-zinc-300">
              <span>Acoustic Pressure:</span>
              <span class="tabular-nums font-bold text-teal-200">{{ steering().acousticPressureMpa }} MPa</span>
            </div>
            <input type="range" min="0.1" max="2.5" step="0.1" [value]="steering().acousticPressureMpa"
                   (input)="onPressureChange($event)"
                   class="w-full accent-teal-400 h-1 bg-zinc-800 rounded-lg cursor-pointer">
          </div>
        </div>
      </div>

      <!-- Informational Explanatory Strip -->
      <div class="mt-3 p-3 bg-teal-950/20 border border-teal-900/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-lg">💡</span>
          <span class="text-zinc-300">
            <strong>Space-Telescope Translation:</strong>
            @if (activeMode() === 'ACOUSTIC_DRILL') {
              JWST phase retrieval algorithms lock 350+ autonomous bots into a single high-thrust corkscrew drill.
            } @else if (activeMode() === 'CORONAGRAPHIC_TRACKING') {
              Roman Space Telescope coronagraphic nulling suppresses 99.85% of tissue specular scatter to reveal sub-micron gold cores.
            } @else if (activeMode() === 'DUROTACTIC_HOMING') {
              Gravitational microlensing strain-tensor equations compute the mechanical gravity well of the 35 kPa target core.
            } @else {
              Multi-spectral SERS grism spectroscopy flags micro-acidosis (pH &lt; 6.5) and Warburg metabolic shifts.
            }
          </span>
        </div>
      </div>

    </div>
  `
})
export class NanobotSwarm3dComponent implements AfterViewInit, OnDestroy {
  private physics = inject(NanobotSwarmPhysicsService);
  private platformId = inject(PLATFORM_ID);

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  readonly activeMode = computed(() => this.physics.operationalMode());
  readonly steering = computed(() => this.physics.acousticSteering());
  readonly targetSite = computed(() => this.physics.targetSite());
  readonly coherence = computed(() => this.physics.kuramotoCoherence());
  readonly collectiveThrust = computed(() => this.physics.collectiveThrustNn());
  readonly coronagraphicTelemetry = computed(() => this.physics.coronagraphicTelemetry());
  readonly targetCaptureRate = computed(() => this.physics.targetCaptureRatePercent());
  readonly meanReynolds = signal('~1.2e-5');

  readonly unlockedCount = computed(() => {
    return this.physics.agents().filter(b => b.isPayloadUnlocked).length;
  });

  // Three.js instances
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private instancedBots?: THREE.InstancedMesh;
  private targetMesh?: THREE.Mesh;
  private vesselMesh?: THREE.Mesh;
  private strainGrid?: THREE.GridHelper;
  private animationFrameId?: number;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer?.dispose();
  }

  private initThreeJs(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // Slate 950

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 3.5, 9.5);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // 3. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 2;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x2dd4bf, 1.8);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const backLight = new THREE.PointLight(0xa855f7, 2.0, 20);
    backLight.position.set(-5, -2, -5);
    this.scene.add(backLight);

    // 5. Vascular Tube Branching Geometry (Endothelial Vessel Wall)
    const vesselCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-2, 0, 0),
      new THREE.Vector3(1.5, 0.5, -0.5),
      new THREE.Vector3(5, 0.8, -1.2)
    ]);
    const vesselGeo = new THREE.TubeGeometry(vesselCurve, 64, 2.2, 16, false);
    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.6,
      metalness: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    this.vesselMesh = new THREE.Mesh(vesselGeo, vesselMat);
    this.scene.add(this.vesselMesh);

    // 6. Target Occlusion Mesh (Thrombus / Tumor Core)
    const target = this.targetSite();
    const targetGeo = new THREE.SphereGeometry(target.radius, 32, 32);
    const targetMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber Gold
      roughness: 0.4,
      metalness: 0.8,
      emissive: 0xb45309,
      emissiveIntensity: 0.4
    });
    this.targetMesh = new THREE.Mesh(targetGeo, targetMat);
    this.targetMesh.position.set(target.x, target.y, target.z);
    this.scene.add(this.targetMesh);

    // 7. Extracellular Matrix Strain Grid (Gravitational Microlensing Inversion)
    this.strainGrid = new THREE.GridHelper(16, 32, 0x0d9488, 0x1e293b);
    this.strainGrid.position.set(0, -2.4, 0);
    this.scene.add(this.strainGrid);

    // 8. Nanobot Swarm InstancedMesh
    const bots = this.physics.agents();
    const botGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8);
    botGeo.rotateZ(Math.PI / 2); // Align with velocity vector
    const botMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      roughness: 0.2,
      metalness: 0.9
    });
    this.instancedBots = new THREE.InstancedMesh(botGeo, botMat, bots.length);
    this.instancedBots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.instancedBots);

    // Resize listener
    window.addEventListener('resize', this.onWindowResize);

    // Start render loop
    this.animate();
  }

  private onWindowResize = (): void => {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || !this.camera || !this.renderer) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Step physics simulation
    this.physics.stepSimulation(0.016);

    // Update Three.js visuals
    this.updateSwarmTransforms();

    this.controls?.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private updateSwarmTransforms(): void {
    if (!this.instancedBots) return;

    const bots = this.physics.agents();
    const mode = this.activeMode();
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < bots.length; i++) {
      const b = bots[i];
      dummy.position.set(b.x, b.y, b.z);

      // Orientation aligned with velocity
      dummy.lookAt(b.x + b.vx, b.y + b.vy, b.z + b.vz);
      dummy.updateMatrix();
      this.instancedBots.setMatrixAt(i, dummy.matrix);

      // Color encoding based on mode
      if (mode === 'SERS_ACIDOSIS') {
        // Red = Acidic (6.2), Yellow = Intermediate (6.8), Green = Physiological (7.4)
        if (b.localPh < 6.5) {
          color.setHex(0xf43f5e); // Rose red
        } else if (b.localPh < 7.0) {
          color.setHex(0xfbbf24); // Amber
        } else {
          color.setHex(0x10b981); // Emerald
        }
      } else if (mode === 'CORONAGRAPHIC_TRACKING') {
        // High gold plasmonic glow
        color.setHex(0xfacc15);
      } else if (mode === 'DUROTACTIC_HOMING') {
        // Stiffness mapped from deep cyan to orange
        const ratio = Math.min(1.0, (b.localStiffnessKpa - 1.2) / 30.0);
        color.lerpColors(new THREE.Color(0x06b6d4), new THREE.Color(0xf97316), ratio);
      } else {
        // Acoustic Drill: Turquoise with unlocked bots pulsing magenta
        if (b.isPayloadUnlocked) {
          color.setHex(0xd946ef); // Magenta payload release
        } else {
          color.setHex(0x14b8a6); // Teal
        }
      }

      this.instancedBots.setColorAt(i, color);
    }

    this.instancedBots.instanceMatrix.needsUpdate = true;
    if (this.instancedBots.instanceColor) {
      this.instancedBots.instanceColor.needsUpdate = true;
    }
  }

  setMode(mode: SwarmOperationalMode): void {
    this.physics.setOperationalMode(mode);
  }

  onPitchChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.physics.updateAcousticSteering(val, this.steering().yawDeg);
  }

  onYawChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.physics.updateAcousticSteering(this.steering().pitchDeg, val);
  }

  onPressureChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.physics.updateAcousticSteering(this.steering().pitchDeg, this.steering().yawDeg, val);
  }
}
