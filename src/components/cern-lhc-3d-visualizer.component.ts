import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { kachinkaAudio } from '../utils/kachinka-audio.service';

export interface IParticleTrack {
  id: string;
  name: string;
  type: 'electron' | 'positron' | 'muon' | 'photon' | 'hadron_jet' | 'neutrino';
  charge: number; // +1, -1, 0
  momentumGeV: number;
  theta: number; // polar angle rad
  phi: number; // azimuthal angle rad
  energyGeV: number;
  points: THREE.Vector3[];
  color: number;
}

export interface ICollisionEvent {
  eventId: number;
  name: string;
  sqrtSGeV: number;
  timestamp: string;
  tracks: IParticleTrack[];
  invariantMassGeV?: number;
}

@Component({
  selector: 'app-cern-lhc-3d-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-[780px] bg-zinc-950 text-zinc-100 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col font-sans select-none">
      
      <!-- Top Telemetry & Control Header -->
      <header class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-lg shadow-inner">
            ⚛️
          </div>
          <div>
            <h2 class="text-base font-semibold tracking-wide text-zinc-100 flex items-center gap-2">
              CERN LHC 3D Particle Visualizer
              <span class="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RUN 3 LIVE
              </span>
            </h2>
            <p class="text-xs text-zinc-400 font-mono">
              27 km Ring • {{ sqrtS() }} TeV Collision Energy • B = {{ bField() }} Tesla
            </p>
          </div>
        </div>

        <!-- Telemetry Stat Pill Badges -->
        <div class="flex items-center gap-3">
          <div class="px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-right">
            <div class="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Recorded Events</div>
            <div class="text-sm font-bold font-mono text-cyan-400">{{ eventCount() }}</div>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-right">
            <div class="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Decay Invariant Mass</div>
            <div class="text-sm font-bold font-mono text-purple-300">
              @if (lastEvent()?.invariantMassGeV) {
                {{ lastEvent()?.invariantMassGeV?.toFixed(2) }} GeV/c²
              } @else {
                --
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Main 3D Canvas Container & HUD Overlays -->
      <div class="relative flex-1 w-full bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 overflow-hidden">
        
        <!-- WebGL Canvas Element -->
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Interactive Control Dock (Left Side) -->
        <div class="absolute top-4 left-4 z-20 flex flex-col gap-3 max-w-xs">
          <div class="p-4 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 shadow-lg space-y-4">
            
            <!-- Event Generator Selection -->
            <div>
              <label class="block text-xs font-mono uppercase text-zinc-400 mb-1.5">Select Physics Event</label>
              <select 
                [value]="selectedEventType()" 
                (change)="onEventTypeChange($event)"
                class="w-full h-11 px-3 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500">
                <option value="higgs">Higgs Boson (H → ZZ* → 4ℓ)</option>
                <option value="top_quark">Top Quark Pair (t t̄ → b b̄ W+ W-)</option>
                <option value="heavy_ion">Pb-Pb Heavy Ion (Quark-Gluon Plasma)</option>
              </select>
            </div>

            <!-- Beam Energy Slider -->
            <div>
              <div class="flex justify-between items-center text-xs font-mono mb-1">
                <span class="text-zinc-400">Beam Energy (√s):</span>
                <span class="text-purple-400 font-bold">{{ sqrtS() }} TeV</span>
              </div>
              <input 
                type="range" 
                min="0.9" 
                max="14.0" 
                step="0.1" 
                [value]="sqrtS()"
                (input)="onSqrtSChange($event)"
                class="w-full accent-purple-500 bg-zinc-950 rounded-lg cursor-pointer h-2"
                aria-label="Beam Energy Slider"
              />
            </div>

            <!-- Magnetic Field Toggle -->
            <div class="flex items-center justify-between py-1 border-t border-zinc-800/80 pt-3">
              <span class="text-xs font-mono text-zinc-300">Solenoid Magnet (B-Field)</span>
              <button 
                type="button"
                (click)="toggleBField()"
                [class]="bField() > 0 ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-800 border-zinc-700 text-zinc-400'"
                class="min-h-[44px] min-w-[70px] px-3 text-xs font-mono rounded-lg border transition-all hover:scale-105 active:scale-95">
                {{ bField() > 0 ? '3.8 Tesla' : '0 Tesla' }}
              </button>
            </div>

            <!-- Action Trigger Buttons -->
            <div class="flex gap-2 pt-1">
              <button 
                type="button"
                (click)="triggerCollision()"
                class="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-mono text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2">
                <span>💥</span> Fire Beam
              </button>
              <button 
                type="button"
                (click)="toggleAutoStream()"
                [class]="isAutoStream() ? 'bg-amber-600 border-amber-500' : 'bg-zinc-800 border-zinc-700'"
                class="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border text-white font-mono text-xs font-semibold transition-all hover:scale-105 flex items-center justify-center"
                title="Toggle Continuous Stream">
                {{ isAutoStream() ? '⏸' : '▶' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Physics Legend HUD (Right Side) -->
        <div class="absolute top-4 right-4 z-20 p-4 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 shadow-lg text-xs font-mono space-y-2.5 w-64">
          <div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-1.5 flex justify-between items-center">
            <span>Detector Subsystems</span>
            <span class="text-[10px] text-zinc-500">CMS/ATLAS Spec</span>
          </div>

          <div class="space-y-2 text-zinc-300">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-sm bg-cyan-400 border border-cyan-300 shadow-sm shadow-cyan-500/50"></span>
              <span>Silicon Inner Tracker (1.2m)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400 shadow-sm shadow-emerald-500/50"></span>
              <span>ECAL Crystal Calorimeter (1.8m)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-sm bg-amber-600 border border-amber-500 shadow-sm shadow-amber-600/50"></span>
              <span>HCAL Hadronic Absorber (2.9m)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-sm bg-blue-500 border border-blue-400 shadow-sm shadow-blue-500/50"></span>
              <span>Superconducting Magnet (3.8T)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-sm bg-rose-600 border border-rose-500 shadow-sm shadow-rose-600/50"></span>
              <span>Muon Drift Chambers (4.5m)</span>
            </div>
          </div>

          <div class="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pt-2 pb-1.5">
            Particle Trajectory Keys
          </div>
          <div class="space-y-1.5 text-[11px] text-zinc-300">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-blue-400">
                <span class="w-2 h-2 rounded-full bg-blue-400"></span> Electron (e⁻)
              </span>
              <span class="text-zinc-500">Tight CW Helix</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-red-400">
                <span class="w-2 h-2 rounded-full bg-red-400"></span> Positron (e⁺)
              </span>
              <span class="text-zinc-500">Tight CCW Helix</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-purple-400">
                <span class="w-2 h-2 rounded-full bg-purple-400"></span> Muon (μ⁻/μ⁺)
              </span>
              <span class="text-zinc-500">Outer Penetrating</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-amber-400">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span> Hadron Jets (q/g)
              </span>
              <span class="text-zinc-500">Multi-track Cone</span>
            </div>
          </div>
        </div>

        <!-- Bottom Telemetry Banner Overlay -->
        <div class="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300">
          <div class="flex items-center gap-4">
            <span class="text-purple-400 font-semibold">Active Detector Status:</span>
            <span>CMS Solenoid: <strong class="text-zinc-100">{{ bField() }}T</strong></span>
            <span>Ring Circumference: <strong class="text-zinc-100">26,659m</strong></span>
            <span>Collision Rate: <strong class="text-zinc-100">40 MHz (25 ns)</strong></span>
          </div>
          <div class="text-zinc-400">
            Click & drag to rotate 3D geometry • Scroll to zoom
          </div>
        </div>

      </div>

    </div>
  `
})
export class CernLhc3dVisualizerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef<HTMLDivElement>;

  // Angular Signals for state management
  sqrtS = signal<number>(13.6);
  bField = signal<number>(3.8);
  selectedEventType = signal<'higgs' | 'top_quark' | 'heavy_ion'>('higgs');
  eventCount = signal<number>(0);
  isAutoStream = signal<boolean>(false);
  lastEvent = signal<ICollisionEvent | null>(null);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animationFrameId: number | null = null;
  private autoStreamTimer: any = null;
  private isBrowser: boolean;

  // 3D Scene Elements
  private tracksGroup = new THREE.Group();
  private detectorGroup = new THREE.Group();
  private particleMeshGroup = new THREE.Group();

  // Mouse orbit controls properties
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // React to auto-stream toggle
    effect(() => {
      if (this.isAutoStream()) {
        this.startAutoStream();
      } else {
        this.stopAutoStream();
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initThreeScene();
    this.buildLhcDetectorGeometry();
    this.triggerCollision();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.stopAutoStream();
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // --- Three.js Initialization & Geometry ---
  private initThreeScene(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(12, 10, 18);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(this.renderer.domElement);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x9333ea, 1.2);
    dirLight1.position.set(15, 20, 15);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.8);
    dirLight2.position.set(-15, -10, -15);
    this.scene.add(dirLight2);

    this.scene.add(this.detectorGroup);
    this.scene.add(this.tracksGroup);
    this.scene.add(this.particleMeshGroup);

    // Add Orbit Drag Event Listeners
    container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.detectorGroup.rotation.y += deltaX * 0.005;
      this.tracksGroup.rotation.y += deltaX * 0.005;
      this.detectorGroup.rotation.x += deltaY * 0.005;
      this.tracksGroup.rotation.x += deltaY * 0.005;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('resize', () => {
      if (!this.canvasContainer) return;
      const w = this.canvasContainer.nativeElement.clientWidth;
      const h = this.canvasContainer.nativeElement.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private buildLhcDetectorGeometry(): void {
    // 1. Silicon Inner Tracker (Radius: 1.5 units)
    const trackerGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 32, 1, true);
    const trackerMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const trackerMesh = new THREE.Mesh(trackerGeo, trackerMat);
    trackerMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(trackerMesh);

    // 2. Electromagnetic Calorimeter (ECAL - Radius: 3.0 units)
    const ecalGeo = new THREE.CylinderGeometry(3.0, 3.0, 7.5, 32, 1, true);
    const ecalMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const ecalMesh = new THREE.Mesh(ecalGeo, ecalMat);
    ecalMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(ecalMesh);

    // 3. Hadronic Calorimeter (HCAL - Radius: 4.5 units)
    const hcalGeo = new THREE.CylinderGeometry(4.5, 4.5, 9, 32, 1, true);
    const hcalMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const hcalMesh = new THREE.Mesh(hcalGeo, hcalMat);
    hcalMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(hcalMesh);

    // 4. Superconducting Solenoid Magnet Coil (Radius: 6.0 units)
    const magnetGeo = new THREE.CylinderGeometry(6.0, 6.0, 10.5, 32, 1, true);
    const magnetMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const magnetMesh = new THREE.Mesh(magnetGeo, magnetMat);
    magnetMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(magnetMesh);

    // 5. Outer Muon Chambers (Radius: 8.0 units)
    const muonGeo = new THREE.CylinderGeometry(8.0, 8.0, 12, 24, 1, true);
    const muonMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const muonMesh = new THREE.Mesh(muonGeo, muonMat);
    muonMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(muonMesh);

    // Beam Line Vacuum Pipe (Center Axis)
    const pipeGeo = new THREE.CylinderGeometry(0.15, 0.15, 20, 16);
    const pipeMat = new THREE.MeshBasicMaterial({ color: 0x71717a, transparent: true, opacity: 0.6 });
    const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
    pipeMesh.rotation.z = Math.PI / 2;
    this.detectorGroup.add(pipeMesh);
  }

  // --- Lorentz Physics & Event Generation Engine ---
  public triggerCollision(): void {
    this.eventCount.update((count) => count + 1);
    kachinkaAudio.playKaChink();

    // Clear previous particle lines
    while (this.tracksGroup.children.length > 0) {
      const child = this.tracksGroup.children[0];
      this.tracksGroup.remove(child);
    }

    const eventType = this.selectedEventType();
    const tracks: IParticleTrack[] = [];
    let invariantMass: number | undefined;

    if (eventType === 'higgs') {
      // Golden channel: H -> ZZ* -> 4 leptons (e.g. 2 electrons + 2 muons)
      invariantMass = 124.98 + (Math.random() - 0.5) * 0.4;
      tracks.push(
        this.generateLorentzTrack('electron', -1, 45, Math.PI / 3, Math.PI / 4, 0x60a5fa),
        this.generateLorentzTrack('positron', 1, 42, Math.PI - Math.PI / 3, Math.PI + Math.PI / 4, 0xf87171),
        this.generateLorentzTrack('muon', -1, 65, Math.PI / 2.5, Math.PI * 1.2, 0xc084fc),
        this.generateLorentzTrack('muon', 1, 62, Math.PI - Math.PI / 2.5, Math.PI * 0.2, 0xe879f9)
      );
    } else if (eventType === 'top_quark') {
      // Top Quark Pair Decays -> Hadronic Jets + Leptons
      invariantMass = 172.5 + (Math.random() - 0.5) * 2.0;
      tracks.push(
        this.generateLorentzTrack('muon', -1, 75, Math.PI / 4, Math.PI / 6, 0xc084fc),
        this.generateLorentzTrack('hadron_jet', 0, 30, Math.PI / 3, Math.PI * 1.1, 0xf59e0b),
        this.generateLorentzTrack('hadron_jet', 0, 35, Math.PI / 3 + 0.2, Math.PI * 1.15, 0xf59e0b),
        this.generateLorentzTrack('hadron_jet', 0, 40, Math.PI / 3 - 0.15, Math.PI * 1.05, 0xf59e0b),
        this.generateLorentzTrack('electron', 1, 55, Math.PI * 0.75, Math.PI * 1.8, 0xf87171)
      );
    } else {
      // Pb-Pb Heavy Ion High Multiplicity Burst
      for (let i = 0; i < 24; i++) {
        const theta = Math.random() * Math.PI;
        const phi = Math.random() * Math.PI * 2;
        const charge = Math.random() > 0.5 ? 1 : -1;
        const type = Math.random() > 0.7 ? 'hadron_jet' : charge > 0 ? 'positron' : 'electron';
        const color = type === 'hadron_jet' ? 0xf59e0b : charge > 0 ? 0xf87171 : 0x60a5fa;
        tracks.push(this.generateLorentzTrack(type, charge, 15 + Math.random() * 40, theta, phi, color));
      }
    }

    // Store collision event record
    this.lastEvent.set({
      eventId: this.eventCount(),
      name: eventType.toUpperCase(),
      sqrtSGeV: this.sqrtS() * 1000,
      timestamp: new Date().toLocaleTimeString(),
      tracks,
      invariantMassGeV: invariantMass
    });

    // Render 3D Trajectories into Three.js Scene
    tracks.forEach((track) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(track.points);
      const material = new THREE.LineBasicMaterial({
        color: track.color,
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      this.tracksGroup.add(line);
    });
  }

  private generateLorentzTrack(
    type: 'electron' | 'positron' | 'muon' | 'photon' | 'hadron_jet' | 'neutrino',
    charge: number,
    ptGeV: number,
    theta: number,
    phi: number,
    hexColor: number
  ): IParticleTrack {
    const points: THREE.Vector3[] = [];
    const maxRadius = type === 'muon' ? 8.5 : type === 'hadron_jet' ? 4.5 : 3.2;
    const steps = 80;
    const b = this.bField();

    let pos = new THREE.Vector3(0, 0, 0);
    points.push(pos.clone());

    const dirX = Math.sin(theta) * Math.cos(phi);
    const dirY = Math.sin(theta) * Math.sin(phi);
    const dirZ = Math.cos(theta);
    let vel = new THREE.Vector3(dirX, dirY, dirZ).normalize();

    // Lorentz Curvature Factor (q * B / p_T)
    const curvature = (charge * b * 0.08) / Math.max(ptGeV, 5.0);

    for (let i = 0; i < steps; i++) {
      const dt = 0.12;
      pos.addScaledVector(vel, dt);

      // B-Field along X/Z axis bends particle in transverse plane
      if (b > 0 && charge !== 0) {
        const perpX = -vel.y * curvature;
        const perpY = vel.x * curvature;
        vel.x += perpX * dt;
        vel.y += perpY * dt;
        vel.normalize();
      }

      points.push(pos.clone());
      if (pos.length() > maxRadius) break;
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      name: `${type.toUpperCase()} (${ptGeV.toFixed(1)} GeV)`,
      type,
      charge,
      momentumGeV: ptGeV,
      theta,
      phi,
      energyGeV: ptGeV * 1.1,
      points,
      color: hexColor
    };
  }

  // --- Animation Loop ---
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.detectorGroup) {
      this.detectorGroup.rotation.y += 0.0015;
      this.tracksGroup.rotation.y += 0.0015;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  // --- Interactive UI Handlers ---
  public onEventTypeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as any;
    this.selectedEventType.set(val);
    this.triggerCollision();
  }

  public onSqrtSChange(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.sqrtS.set(val);
    kachinkaAudio.playGearTick();
  }

  public toggleBField(): void {
    this.bField.update((b) => (b > 0 ? 0 : 3.8));
    kachinkaAudio.playKaChink();
    this.triggerCollision();
  }

  public toggleAutoStream(): void {
    this.isAutoStream.update((val) => !val);
  }

  private startAutoStream(): void {
    this.stopAutoStream();
    this.autoStreamTimer = setInterval(() => {
      this.triggerCollision();
    }, 1800);
  }

  private stopAutoStream(): void {
    if (this.autoStreamTimer) {
      clearInterval(this.autoStreamTimer);
      this.autoStreamTimer = null;
    }
  }
}
