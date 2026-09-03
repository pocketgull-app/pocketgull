import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import {
  WhispySwarmBioreactorService,
  BioreactorPhase
} from '../../services/whispy-swarm-bioreactor.service';
import { ScaffoldExporterService } from '../../services/scaffold-exporter.service';

@Component({
  selector: 'app-whispy-swarm-bioreactor-3d',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-950 via-zinc-950 to-emerald-950/40 border border-emerald-800/40 shadow-2xl flex flex-col gap-4 font-sans">
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
        <div class="flex items-center gap-3">
          <span class="text-2xl p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 shadow-inner">
            🧪
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black uppercase tracking-wider text-emerald-300">
                Acoustic Containment Bioreactor Tank
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-900/60 border border-emerald-400/50 text-emerald-200">
                PATENT PENDING
              </span>
            </div>
            <p class="text-xs text-emerald-200/70 mt-0.5">
              Closed-loop volumetric ultrasound bio-fabrication. Sculpting supramolecular healing mists directly from patient DICOM scans.
            </p>
          </div>
        </div>

        <!-- Current Phase Indicator Badge -->
        <div class="flex items-center gap-2">
          <div class="flex flex-col items-end">
            <span class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Current Phase</span>
            <span class="text-xs font-mono font-black text-emerald-100 bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-1 rounded-lg shadow-sm">
              {{ formatPhaseLabel(service.currentPhase()) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Visualizer and Control Deck Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- 3D WebGL Containment Chamber Canvas (8 Cols) -->
        <div class="lg:col-span-8 relative rounded-xl overflow-hidden bg-black/80 border border-emerald-900/50 min-h-[420px] h-[460px] flex items-center justify-center">
          <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

          <!-- Chamber Overlay Top Telemetry Bar -->
          <div class="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-md bg-black/75 border border-emerald-500/30 text-[10.5px] font-mono text-emerald-300 backdrop-blur-md">
                Pressure: <strong class="text-emerald-100 font-bold">{{ service.chamberTelemetry().chamberPressureKpa }} kPa</strong>
              </span>
              <span class="px-2 py-1 rounded-md bg-black/75 border border-emerald-500/30 text-[10.5px] font-mono text-cyan-300 backdrop-blur-md">
                Gor'kov Trap: <strong class="text-cyan-100 font-bold">{{ service.chamberTelemetry().gorkovPotentialStrength }} nJ</strong>
              </span>
            </div>

            <span class="px-2 py-1 rounded-md bg-black/75 border border-emerald-500/30 text-[10.5px] font-mono text-amber-300 backdrop-blur-md">
              Gelation: <strong class="text-amber-100 font-bold">{{ (service.chamberTelemetry().gelationFraction * 100).toFixed(0) }}%</strong>
            </span>
          </div>

          <!-- Bottom Visual Legend -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-emerald-400/80 bg-black/80 px-3 py-1.5 rounded-lg border border-emerald-900/60 pointer-events-none backdrop-blur-md">
            <span>● 250 kHz Ultrasound Phased Rings</span>
            <span>● 532 nm Tyndall Optical Tracking</span>
            <span>● 80 mV/mm Bioelectric Grid</span>
          </div>
        </div>

        <!-- NetLogo-Style Interactive Parameter & Phase Console (4 Cols) -->
        <div class="lg:col-span-4 flex flex-col justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-emerald-900/40 text-xs">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1 mb-2">
              <span>⚙️</span> Chamber Phase Sequencer
            </span>

            <!-- Phase Stepping Actions -->
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button (click)="advancePhase()"
                      class="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <span>⏩</span> Next Phase
              </button>
              <button (click)="resetChamber()"
                      class="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-emerald-700/40 text-emerald-200 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                <span>🔄</span> Reset Tank
              </button>
            </div>

            <!-- Auto-Advance Sequence Toggle -->
            <button (click)="toggleAutoSequence()"
                    [class.bg-cyan-950]="isAutoRunning()"
                    [class.border-cyan-400]="isAutoRunning()"
                    class="w-full py-1.5 mb-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-emerald-300 text-[11px] font-bold transition flex items-center justify-center gap-2 cursor-pointer">
              <span>{{ isAutoRunning() ? '⏸ Pause Auto-Sequence' : '▶ Play Full Manufacturing Sequence' }}</span>
            </button>

            <!-- Physical Control Sliders (Gor'kov Potential, Ultrasound, Bioelectricity) -->
            <div class="space-y-2.5 pt-2 border-t border-slate-800">
              <!-- Acoustic Pressure Slider -->
              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Acoustic Pressure:</span>
                  <span class="font-mono text-emerald-400 font-bold">{{ service.controls().acousticPressureMpa }} MPa</span>
                </div>
                <input type="range" min="0.2" max="2.5" step="0.1"
                       [value]="service.controls().acousticPressureMpa"
                       (input)="onPressureChange($event)"
                       class="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg" />
              </div>

              <!-- Transducer Frequency Slider -->
              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Ultrasound Frequency:</span>
                  <span class="font-mono text-cyan-400 font-bold">{{ service.controls().transducerFrequencyKhz }} kHz</span>
                </div>
                <input type="range" min="40" max="400" step="10"
                       [value]="service.controls().transducerFrequencyKhz"
                       (input)="onFrequencyChange($event)"
                       class="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg" />
              </div>

              <!-- Bioelectric Field Slider -->
              <div>
                <div class="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Bioelectric Bias:</span>
                  <span class="font-mono text-amber-400 font-bold">{{ service.controls().bioelectricFieldMvMm }} mV/mm</span>
                </div>
                <input type="range" min="0" max="100" step="5"
                       [value]="service.controls().bioelectricFieldMvMm"
                       (input)="onBioelectricChange($event)"
                       class="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg" />
              </div>
            </div>
          </div>

          <!-- Bottom Telemetry Summary -->
          <div class="p-2.5 rounded-lg bg-black/50 border border-emerald-950 text-[10.5px] font-mono space-y-1">
            <div class="flex justify-between text-slate-400">
              <span>Patient Scan Target:</span>
              <span class="text-emerald-300">{{ service.patientScanId() }}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Target Voxel Density:</span>
              <span class="text-emerald-200">{{ service.targetVoxelCount() }} voxels</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Structural Fidelity:</span>
              <span class="text-emerald-400 font-bold">{{ service.chamberTelemetry().structuralFidelityPercent }}%</span>
            </div>
          </div>

          <!-- Physical Bioprinter CAD Export Actions -->
          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              (click)="exportStl()"
              class="flex-1 py-1.5 px-2 rounded-lg border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer">
              <span>📐</span> Export STL (CAD)
            </button>
            <button
              type="button"
              (click)="exportGltf()"
              class="flex-1 py-1.5 px-2 rounded-lg border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-mono text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer">
              <span>📦</span> Export glTF 2.0
            </button>
          </div>
          @if (exportNotice()) {
            <div class="text-[10px] font-mono text-center text-teal-400 bg-teal-950/40 py-1 px-2 rounded border border-teal-800/40">
              {{ exportNotice() }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class WhispySwarmBioreactor3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true })
  private readonly canvasContainer!: ElementRef<HTMLDivElement>;

  readonly service = inject(WhispySwarmBioreactorService);
  private readonly scaffoldExporter = inject(ScaffoldExporterService);

  readonly isAutoRunning = signal<boolean>(false);
  readonly exportNotice = signal<string | null>(null);
  private autoIntervalId: number | null = null;

  // Three.js Engine References
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;

  private readonly platformId = inject(PLATFORM_ID);

  // 3D Visual Objects
  private tankCylinder?: THREE.Mesh;
  private upperTransducerRing?: THREE.Mesh;
  private lowerTransducerRing?: THREE.Mesh;
  private wireframeAnatomy?: THREE.LineSegments;
  private mistParticles?: THREE.Points;
  private particlePositions?: Float32Array;
  private originalVoxelPositions?: Float32Array;
  private particleCount = 2000;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initThreeJs();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.autoIntervalId !== null) {
      clearInterval(this.autoIntervalId);
    }
    this.renderer?.dispose();
  }

  formatPhaseLabel(phase: BioreactorPhase): string {
    switch (phase) {
      case 'SCAN_INGESTION':
        return '1. Scan Ingestion';
      case 'MIST_INOCULATION':
        return '2. Mist Inoculation';
      case 'ACOUSTIC_SCULPTING':
        return '3. Acoustic Sculpting';
      case 'SOL_GEL_CROSSLINK':
        return '4. Sol-Gel Crosslinking';
      case 'BIOELECTRIC_POLARIZATION':
        return '5. Bioelectric Polarization';
      case 'HARVEST_READY':
        return '6. Ready for Egress';
    }
  }

  advancePhase(): void {
    this.service.advancePhase();
  }

  resetChamber(): void {
    this.service.resetChamber();
    if (this.isAutoRunning()) {
      this.toggleAutoSequence();
    }
  }

  toggleAutoSequence(): void {
    if (this.isAutoRunning()) {
      this.isAutoRunning.set(false);
      if (this.autoIntervalId !== null) {
        clearInterval(this.autoIntervalId);
        this.autoIntervalId = null;
      }
    } else {
      this.isAutoRunning.set(true);
      this.autoIntervalId = window.setInterval(() => {
        this.service.advancePhase();
      }, 3500);
    }
  }

  onPressureChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.service.updateControls({ acousticPressureMpa: val });
  }

  onFrequencyChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.service.updateControls({ transducerFrequencyKhz: val });
  }

  onBioelectricChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.service.updateControls({ bioelectricFieldMvMm: val });
  }

  exportStl(): void {
    const bundle = this.scaffoldExporter.exportScaffoldBundle({
      targetOrgan: this.service.patientScanId(),
      lesionRadiusX: 12.0,
      porosityPercent: 78.0
    });
    this.downloadFile(bundle.asciiStl, `pocketgull_scaffold_${Date.now()}.stl`, 'text/plain');
    this.showNotice(`✓ STL CAD exported (${bundle.meshMetadata.triangleCount} triangles)`);
  }

  exportGltf(): void {
    const bundle = this.scaffoldExporter.exportScaffoldBundle({
      targetOrgan: this.service.patientScanId(),
      lesionRadiusX: 12.0,
      porosityPercent: 78.0
    });
    this.downloadFile(bundle.gltfJson, `pocketgull_scaffold_${Date.now()}.gltf`, 'model/gltf+json');
    this.showNotice(`✓ glTF 2.0 exported (${(bundle.gltfJson.length / 1024).toFixed(1)} KB)`);
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    if (typeof document === 'undefined') return;
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('[Bioreactor3D] Download failed in current environment:', e);
    }
  }

  private showNotice(msg: string): void {
    this.exportNotice.set(msg);
    setTimeout(() => this.exportNotice.set(null), 3000);
  }

  private initThreeJs(): void {
    try {
      const container = this.canvasContainer?.nativeElement;
      if (!container) return;

      const width = container.clientWidth || 600;
      const height = container.clientHeight || 460;

      // 1. Scene & Camera
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x020617);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 3.5, 9);
      this.camera.lookAt(0, 0, 0);

      // 2. Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // 3. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x10b981, 1.2);
      dirLight1.position.set(5, 8, 5);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.8);
      dirLight2.position.set(-5, -6, -5);
      this.scene.add(dirLight2);

      // 4. Chamber Glass Cylinder
      const cylGeo = new THREE.CylinderGeometry(2.4, 2.4, 6.0, 32, 1, true);
      const cylMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.18,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5,
        side: THREE.DoubleSide
      });
      this.tankCylinder = new THREE.Mesh(cylGeo, cylMat);
      this.scene.add(this.tankCylinder);

      // 5. Upper and Lower Metallic Transducer Mounts
      const ringGeo = new THREE.TorusGeometry(2.4, 0.18, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25
      });

      this.upperTransducerRing = new THREE.Mesh(ringGeo, ringMat);
      this.upperTransducerRing.rotation.x = Math.PI / 2;
      this.upperTransducerRing.position.y = 3.0;
      this.scene.add(this.upperTransducerRing);

      this.lowerTransducerRing = new THREE.Mesh(ringGeo, ringMat);
      this.lowerTransducerRing.rotation.x = Math.PI / 2;
      this.lowerTransducerRing.position.y = -3.0;
      this.scene.add(this.lowerTransducerRing);

      // 6. Wireframe Anatomy (Target Voxel Scaffold)
      const boxGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 64, 16);
      const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.25
      });
      this.wireframeAnatomy = new THREE.LineSegments(wireframeGeo, wireMat);
      this.scene.add(this.wireframeAnatomy);

      // 7. Volumetric Mist Particles (Supramolecular Coacervate Swarm)
      const particleGeo = new THREE.BufferGeometry();
      this.particlePositions = new Float32Array(this.particleCount * 3);
      this.originalVoxelPositions = new Float32Array(this.particleCount * 3);

      // Sample positions on the target torus knot surface
      for (let i = 0; i < this.particleCount; i++) {
        const u = Math.random() * Math.PI * 4;
        const r = 1.1 + Math.sin(u * 3) * 0.3;
        const tx = r * Math.cos(u);
        const ty = Math.sin(u * 2) * 0.9;
        const tz = r * Math.sin(u);

        this.originalVoxelPositions[i * 3] = tx;
        this.originalVoxelPositions[i * 3 + 1] = ty;
        this.originalVoxelPositions[i * 3 + 2] = tz;

        // Start scattered randomly in chamber
        this.particlePositions[i * 3] = (Math.random() - 0.5) * 4.0;
        this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
        this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
      }

      particleGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(this.particlePositions, 3)
      );

      const particleMat = new THREE.PointsMaterial({
        color: 0x5eead4,
        size: 0.08,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });

      this.mistParticles = new THREE.Points(particleGeo, particleMat);
      this.scene.add(this.mistParticles);

      // 8. Start Animation Loop
      this.animate();
    } catch (err) {
      console.warn('[Bioreactor3D] WebGL context unavailable in current environment:', err);
    }
  }

  private animate = (): void => {
    if (!this.renderer || !this.scene || !this.camera || !this.mistParticles || !this.tankCylinder || !this.wireframeAnatomy || !this.originalVoxelPositions) {
      return;
    }
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;
    const phase = this.service.currentPhase();

    // Rotate chamber slightly for spatial depth
    this.tankCylinder.rotation.y = time * 0.08;
    this.wireframeAnatomy.rotation.y = time * 0.15;
    this.wireframeAnatomy.rotation.x = Math.sin(time * 0.1) * 0.1;

    // Morph particle positions depending on current manufacturing phase
    const positions = this.mistParticles.geometry.attributes['position'].array as Float32Array;
    const lerpSpeed = 0.035;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      if (phase === 'SCAN_INGESTION') {
        // Particles quiescent near chamber bottom / dispersed
        positions[idx + 1] += ((-2.2 + Math.sin(time + i) * 0.2) - positions[idx + 1]) * 0.02;
      } else if (phase === 'MIST_INOCULATION') {
        // Particles swirling dynamically throughout the volume
        positions[idx] += Math.sin(time * 2 + i) * 0.02;
        positions[idx + 1] += Math.cos(time * 1.5 + i) * 0.02;
        positions[idx + 2] += Math.sin(time * 1.8 + i) * 0.02;
      } else {
        // Acoustic Sculpting, Sol-Gel, Bioelectric, Harvest: Pull to target anatomy
        const targetX = this.originalVoxelPositions[idx];
        const targetY = this.originalVoxelPositions[idx + 1];
        const targetZ = this.originalVoxelPositions[idx + 2];

        // Add subtle harmonic acoustic vibration
        const vibration = phase === 'ACOUSTIC_SCULPTING' ? Math.sin(time * 30 + i) * 0.02 : 0;

        positions[idx] += (targetX + vibration - positions[idx]) * lerpSpeed;
        positions[idx + 1] += (targetY + vibration - positions[idx + 1]) * lerpSpeed;
        positions[idx + 2] += (targetZ + vibration - positions[idx + 2]) * lerpSpeed;
      }
    }

    this.mistParticles.geometry.attributes['position'].needsUpdate = true;
    this.mistParticles.rotation.y = time * 0.15;

    this.renderer.render(this.scene, this.camera);
  };
}
