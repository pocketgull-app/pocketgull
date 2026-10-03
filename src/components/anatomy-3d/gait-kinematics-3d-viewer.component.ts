import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';
import { KinesiologyBiomechanicsService } from '../../services/kinesiology-biomechanics.service';

export type GaitPathologyMode = 'normal' | 'antalgic_right' | 'trendelenburg' | 'spastic';

export interface IJointTelemetry {
  hipAngleDeg: number;
  kneeAngleDeg: number;
  ankleAngleDeg: number;
  pelvicTiltDeg: number;
  grfMultiplier: number;
  gaitPhase: string;
}

@Component({
  selector: 'app-gait-kinematics-3d-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-teal-500/30 overflow-hidden shadow-2xl relative mb-6">
      
      <!-- Top HUD Control Bar -->
      <div class="flex flex-wrap items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.9)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🏃‍♂️</span>
              <span>3D Biomechanical Gait & Joint Kinematics (Visual Model V3)</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Real-time WebGL skeletal kinematics, joint flexion/extension angles, and antalgic compensation analysis.
            </p>
          </div>
        </div>

        <!-- Gait Pathology Mode Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button type="button" (click)="setGaitMode('normal')"
                  [class]="gaitMode() === 'normal' ? 'bg-teal-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
            Normal Gait
          </button>
          <button type="button" (click)="setGaitMode('antalgic_right')"
                  [class]="gaitMode() === 'antalgic_right' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
            ⚠️ Antalgic Limp (Knee Pain)
          </button>
          <button type="button" (click)="setGaitMode('trendelenburg')"
                  [class]="gaitMode() === 'trendelenburg' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
            Trendelenburg (Hip Drop)
          </button>
          <button type="button" (click)="setGaitMode('spastic')"
                  [class]="gaitMode() === 'spastic' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                  class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
            Spastic Hemiparetic
          </button>
        </div>
      </div>

      <!-- Main Canvas & Overlay Viewport Container -->
      <div class="relative w-full h-[450px] bg-zinc-950 overflow-hidden">
        <!-- 3D Canvas Mounting Node -->
        <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

        <!-- Floating Playback & Camera Controls (Top Right) -->
        <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 text-xs">
          <button (click)="togglePlay()" type="button"
                  class="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 font-bold hover:bg-teal-500/30 transition cursor-pointer">
            {{ isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
          <button (click)="toggleSpeed()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            {{ speedMultiplier() }}x
          </button>
          <button (click)="resetCamera()" type="button"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition cursor-pointer">
            🎯 Reset Camera
          </button>
        </div>

        <!-- Floating Kinematics Real-Time Telemetry HUD (Top Left) -->
        <div class="absolute top-3 left-3 z-30 bg-zinc-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800/80 text-xs space-y-2 max-w-xs shadow-xl pointer-events-none sm:pointer-events-auto">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-teal-400">Live Kinematic Telemetry</span>
            <span class="text-[10px] font-mono text-zinc-400">{{ activeTelemetry().gaitPhase }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">R Hip Angle:</span>
              <span class="font-bold text-teal-300">{{ activeTelemetry().hipAngleDeg }}°</span>
            </div>
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">R Knee Angle:</span>
              <span class="font-bold" [class.text-amber-400]="gaitMode() === 'antalgic_right'" [class.text-teal-300]="gaitMode() !== 'antalgic_right'">
                {{ activeTelemetry().kneeAngleDeg }}°
              </span>
            </div>
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">R Ankle Pitch:</span>
              <span class="font-bold text-teal-300">{{ activeTelemetry().ankleAngleDeg }}°</span>
            </div>
            <div class="p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/60">
              <span class="text-zinc-500 block text-[9px] uppercase">Ground Force:</span>
              <span class="font-bold text-cyan-400">{{ activeTelemetry().grfMultiplier }}x BW</span>
            </div>
          </div>

          <!-- Stance Phase Asymmetry Gauge -->
          <div class="pt-1.5 border-t border-zinc-800/60 space-y-1">
            <div class="flex justify-between text-[10px]">
              <span class="text-zinc-400">Stance Asymmetry (L:R):</span>
              <span class="font-bold" [class.text-rose-400]="gaitMode() !== 'normal'" [class.text-emerald-400]="gaitMode() === 'normal'">
                {{ asymmetryRatio() }}
              </span>
            </div>
            <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-300"
                   [class.bg-emerald-400]="gaitMode() === 'normal'"
                   [class.bg-amber-400]="gaitMode() === 'antalgic_right'"
                   [class.bg-rose-400]="gaitMode() === 'trendelenburg' || gaitMode() === 'spastic'"
                   [style.width.%]="asymmetryPercent()"></div>
            </div>
          </div>
        </div>

        <!-- Pathology Explanation Card (Bottom Left) -->
        <div class="absolute bottom-3 left-3 right-3 sm:right-auto z-30 bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border border-zinc-800 text-[11px] max-w-md shadow-2xl">
          <div class="flex items-center gap-1.5 mb-1 font-bold text-teal-400 uppercase text-[10px]">
            <span>🩺</span>
            <span>{{ pathologyTitle() }}</span>
          </div>
          <p class="text-zinc-300 font-sans text-xs leading-relaxed">
            {{ pathologyExplanation() }}
          </p>
        </div>
      </div>

    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class GaitKinematics3dViewerComponent implements AfterViewInit, OnDestroy {
  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  readonly patientState = inject(PatientStateService);
  readonly biomechanics = inject(KinesiologyBiomechanicsService);

  readonly gaitMode = signal<GaitPathologyMode>('normal');
  readonly isPlaying = signal<boolean>(true);
  readonly speedMultiplier = signal<number>(1.0);
  readonly gaitProgress = signal<number>(0.0);

  // 3D Scene Properties
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private controls?: OrbitControls;
  private animFrameId?: number;

  // Skeletal Mesh References
  private skeletonGroup?: THREE.Group;
  private pelvisMesh?: THREE.Mesh;
  private spineMesh?: THREE.Mesh;
  private skullMesh?: THREE.Mesh;
  private rightFemurMesh?: THREE.Mesh;
  private rightTibiaMesh?: THREE.Mesh;
  private leftFemurMesh?: THREE.Mesh;
  private leftTibiaMesh?: THREE.Mesh;
  private rightHumerusMesh?: THREE.Mesh;
  private leftHumerusMesh?: THREE.Mesh;

  // Reactive Computed Telemetry
  readonly activeTelemetry = computed<IJointTelemetry>(() => {
    const t = this.gaitProgress();
    const mode = this.gaitMode();
    const pi = Math.PI;

    // Normal baseline angles
    let hipAngle = Math.round(24 * Math.sin(2 * pi * t + 0.4) + 4);
    let kneeAngle = t < 0.6 ? Math.round(18 * Math.sin(pi * (t / 0.6))) : Math.round(60 * Math.sin(pi * ((t - 0.6) / 0.4)));
    let ankleAngle = Math.round(14 * Math.sin(2 * pi * t - 0.7));
    let pelvicTilt = Math.round(4 * Math.sin(2 * pi * t));
    let grf = t < 0.6 ? Number((1.0 + 0.22 * Math.sin(2 * pi * (t / 0.6))).toFixed(2)) : 0.0;

    // Apply pathology modifiers
    if (mode === 'antalgic_right') {
      // Shortened right stance (35% instead of 60%), reduced knee flexion to protect inflamed joint
      kneeAngle = Math.round(kneeAngle * 0.55); // Guaded knee extension
      hipAngle = Math.round(hipAngle * 0.75);
      grf = t < 0.35 ? Number((0.75 + 0.1 * Math.sin(pi * (t / 0.35))).toFixed(2)) : 0.0;
    } else if (mode === 'trendelenburg') {
      // Contralateral pelvic drop during single-leg stance
      pelvicTilt = Math.round(15 * Math.sin(2 * pi * t));
    } else if (mode === 'spastic') {
      // Reduced knee flexion, circumduction
      kneeAngle = Math.round(kneeAngle * 0.3);
      hipAngle = Math.round(hipAngle * 0.6);
    }

    let gaitPhase = 'Midstance';
    if (t < 0.15) gaitPhase = 'Heel Strike (Initial Contact)';
    else if (t < 0.35) gaitPhase = 'Loading Response';
    else if (t < 0.60) gaitPhase = 'Midstance Support';
    else if (t < 0.75) gaitPhase = 'Initial Swing';
    else gaitPhase = 'Terminal Swing';

    return {
      hipAngleDeg: hipAngle,
      kneeAngleDeg: kneeAngle,
      ankleAngleDeg: ankleAngle,
      pelvicTiltDeg: pelvicTilt,
      grfMultiplier: grf,
      gaitPhase
    };
  });

  readonly asymmetryRatio = computed(() => {
    switch (this.gaitMode()) {
      case 'antalgic_right': return '1.71 : 1.00 (Severe Left Stance Preference)';
      case 'trendelenburg': return '1.45 : 1.00 (Right Abductor Insufficiency)';
      case 'spastic': return '1.82 : 1.00 (Hemiparetic Circumduction)';
      default: return '1.02 : 1.00 (Symmetric Normal Range)';
    }
  });

  readonly asymmetryPercent = computed(() => {
    switch (this.gaitMode()) {
      case 'antalgic_right': return 75;
      case 'trendelenburg': return 65;
      case 'spastic': return 85;
      default: return 50;
    }
  });

  readonly pathologyTitle = computed(() => {
    switch (this.gaitMode()) {
      case 'antalgic_right': return 'Right Lower Limb Antalgic Limp (Pain Evasion)';
      case 'trendelenburg': return 'Trendelenburg Gait (Gluteus Medius Weakness)';
      case 'spastic': return 'Spastic Hemiparetic Gait (UMN Circumduction)';
      default: return 'Physiological Symmetrical Gait Cycle (Stanford OpenSim)';
    }
  });

  readonly pathologyExplanation = computed(() => {
    switch (this.gaitMode()) {
      case 'antalgic_right':
        return 'Patient shortens the right stance phase from 60% down to 35% of the gait cycle to minimize joint loading on the painful right limb. The torso leans laterally toward the affected side to shift the center of mass over the right hip joint, reducing hip abductor muscular force and reducing compressive joint reaction force.';
      case 'trendelenburg':
        return 'Weakness of the right gluteus medius abductor muscle prevents stabilization of the pelvis during right single-leg stance, causing the contralateral (left) unsupported pelvis to drop downward. Patient exhibits compensatory trunk lurch to maintain equilibrium.';
      case 'spastic':
        return 'Upper motor neuron hypertonia creates sustained knee extension and ankle plantarflexion (equinovarus), requiring outward lateral swinging (circumduction) of the right leg to achieve ground clearance during the swing phase.';
      default:
        return 'Normal alternating bipedal locomotion characterized by symmetric 60/40 stance-to-swing ratio, sinusoidal vertical pelvic excursion (~4cm), and bimodal ground reaction force curves damping initial impact shocks.';
    }
  });

  ngAfterViewInit() {
    this.initThreeJs();
  }

  ngOnDestroy() {
    this.cleanupThreeJs();
  }

  setGaitMode(mode: GaitPathologyMode) {
    this.gaitMode.set(mode);
  }

  togglePlay() {
    this.isPlaying.update(p => !p);
  }

  toggleSpeed() {
    const cur = this.speedMultiplier();
    if (cur === 0.5) this.speedMultiplier.set(1.0);
    else if (cur === 1.0) this.speedMultiplier.set(1.5);
    else this.speedMultiplier.set(0.5);
  }

  resetCamera() {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 1.2, 3.5);
      this.controls.target.set(0, 0.9, 0);
      this.controls.update();
    }
  }

  private initThreeJs() {
    const container = this.canvasContainer()?.nativeElement;
    if (!container || typeof window === 'undefined') return;

    // Check for canvas context in test/headless environments
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    try {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x09090b);

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      this.camera.position.set(0, 1.2, 3.5);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 0.9, 0);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x2dd4bf, 1.5);
      dirLight.position.set(2, 4, 3);
      this.scene.add(dirLight);

      const backLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
      backLight.position.set(-2, 2, -3);
      this.scene.add(backLight);

      // Ground Grid Plane
      const gridHelper = new THREE.GridHelper(6, 20, 0x14b8a6, 0x27272a);
      gridHelper.position.y = 0;
      this.scene.add(gridHelper);

      // Build 3D Skeletal Rig
      this.buildSkeleton();

      // Start Animation Loop
      this.animate();
    } catch (e) {
      // Graceful fallback for non-WebGL/headless test environments
      console.warn('WebGL initialization skipped in headless/test environment:', e);
    }
  }

  private buildSkeleton() {
    if (!this.scene) return;

    this.skeletonGroup = new THREE.Group();
    this.scene.add(this.skeletonGroup);

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.5
    });

    // Pelvis Hub
    const pelvisGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.1, 16);
    this.pelvisMesh = new THREE.Mesh(pelvisGeo, jointMat);
    this.pelvisMesh.position.y = 1.0;
    this.skeletonGroup.add(this.pelvisMesh);

    // Spine Column
    const spineGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.45, 12);
    this.spineMesh = new THREE.Mesh(spineGeo, boneMat);
    this.spineMesh.position.y = 1.25;
    this.skeletonGroup.add(this.spineMesh);

    // Skull Head
    const skullGeo = new THREE.SphereGeometry(0.12, 16, 16);
    this.skullMesh = new THREE.Mesh(skullGeo, boneMat);
    this.skullMesh.position.y = 1.6;
    this.skeletonGroup.add(this.skullMesh);

    // Right Femur (Thigh)
    const femurGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.45, 12);
    this.rightFemurMesh = new THREE.Mesh(femurGeo, boneMat);
    this.rightFemurMesh.position.set(0.12, 0.75, 0);
    this.skeletonGroup.add(this.rightFemurMesh);

    // Right Tibia (Shin)
    const tibiaGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.45, 12);
    this.rightTibiaMesh = new THREE.Mesh(tibiaGeo, boneMat);
    this.rightTibiaMesh.position.set(0.12, 0.28, 0);
    this.skeletonGroup.add(this.rightTibiaMesh);

    // Left Femur (Thigh)
    this.leftFemurMesh = new THREE.Mesh(femurGeo, boneMat);
    this.leftFemurMesh.position.set(-0.12, 0.75, 0);
    this.skeletonGroup.add(this.leftFemurMesh);

    // Left Tibia (Shin)
    this.leftTibiaMesh = new THREE.Mesh(tibiaGeo, boneMat);
    this.leftTibiaMesh.position.set(-0.12, 0.28, 0);
    this.skeletonGroup.add(this.leftTibiaMesh);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.35, 12);
    this.rightHumerusMesh = new THREE.Mesh(armGeo, boneMat);
    this.rightHumerusMesh.position.set(0.24, 1.25, 0);
    this.skeletonGroup.add(this.rightHumerusMesh);

    this.leftHumerusMesh = new THREE.Mesh(armGeo, boneMat);
    this.leftHumerusMesh.position.set(-0.24, 1.25, 0);
    this.skeletonGroup.add(this.leftHumerusMesh);
  }

  private animate = () => {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.isPlaying()) {
      // Step gait cycle progress
      const delta = 0.008 * this.speedMultiplier();
      const nextProgress = (this.gaitProgress() + delta) % 1.0;
      this.gaitProgress.set(nextProgress);

      this.updateKinematicPose(nextProgress);
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateKinematicPose(t: number) {
    if (!this.rightFemurMesh || !this.rightTibiaMesh || !this.leftFemurMesh || !this.leftTibiaMesh || !this.pelvisMesh) {
      return;
    }

    const pi = Math.PI;
    const mode = this.gaitMode();

    // Baseline right leg angles
    let rHipAngle = (24 * Math.sin(2 * pi * t + 0.4) + 4) * (pi / 180);
    let rKneeAngle = t < 0.6 ? (18 * Math.sin(pi * (t / 0.6))) * (pi / 180) : (60 * Math.sin(pi * ((t - 0.6) / 0.4))) * (pi / 180);

    // Contralateral left leg
    const tLeft = (t + 0.5) % 1.0;
    let lHipAngle = (24 * Math.sin(2 * pi * tLeft + 0.4) + 4) * (pi / 180);
    let lKneeAngle = tLeft < 0.6 ? (18 * Math.sin(pi * (tLeft / 0.6))) * (pi / 180) : (60 * Math.sin(pi * ((tLeft - 0.6) / 0.4))) * (pi / 180);

    // Lateral trunk lean and pelvic tilt
    let pelvicRoll = 0;
    let spineRoll = 0;

    if (mode === 'antalgic_right') {
      // Right limb guarded: reduced knee flexion, right trunk lean
      rKneeAngle *= 0.55;
      rHipAngle *= 0.75;
      spineRoll = t < 0.35 ? -0.15 : 0.05; // Lean toward painful right side during stance
    } else if (mode === 'trendelenburg') {
      // Pelvic tilt drop when standing on right leg
      pelvicRoll = Math.sin(2 * pi * t) * 0.2;
    } else if (mode === 'spastic') {
      rKneeAngle *= 0.3;
      rHipAngle *= 0.6;
    }

    // Apply rotations
    this.rightFemurMesh.rotation.x = rHipAngle;
    this.rightTibiaMesh.rotation.x = rHipAngle - rKneeAngle;

    this.leftFemurMesh.rotation.x = lHipAngle;
    this.leftTibiaMesh.rotation.x = lHipAngle - lKneeAngle;

    this.pelvisMesh.rotation.z = pelvicRoll;
    if (this.spineMesh) {
      this.spineMesh.rotation.z = spineRoll;
    }

    // Arm counter-swing
    if (this.rightHumerusMesh && this.leftHumerusMesh) {
      this.rightHumerusMesh.rotation.x = -rHipAngle * 0.8;
      this.leftHumerusMesh.rotation.x = -lHipAngle * 0.8;
    }
  }

  private cleanupThreeJs() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = undefined;
    }

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.skeletonGroup && this.scene) {
      this.skeletonGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.scene.remove(this.skeletonGroup);
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
