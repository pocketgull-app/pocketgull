import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PatientStateService } from '../../services/patient-state.service';

export interface IBurnRegion {
  id: string;
  name: string;
  tbsaPercent: number;
  isBurned: boolean;
  depth: 'partial_2nd' | 'full_3rd';
  mesh?: THREE.Mesh;
}

export interface ITraumaWound {
  id: string;
  locationName: string;
  woundType: 'arterial_laceration' | 'blast_shrapnel' | 'tension_pneumothorax' | 'crush_fracture';
  position: [number, number, number];
  tourniquetPlaced: boolean;
  tourniquetPosition?: [number, number, number];
  tourniquetTime?: string;
  hemostasisAchieved: boolean;
}

@Component({
  selector: 'app-trauma-burn-3d-lens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full w-full bg-zinc-950 font-mono text-zinc-100 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl relative">
      
      <!-- Top HUD Control Bar -->
      <div class="flex flex-wrap items-center justify-between p-3.5 bg-zinc-900/90 border-b border-zinc-800 gap-3 z-20 shrink-0">
        <div class="flex items-center gap-3">
          <span class="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse"></span>
          <div>
            <h3 class="text-xs sm:text-sm font-black uppercase text-zinc-100 flex items-center gap-2">
              <span>🩻</span>
              <span>3D Procedural Trauma & Burn Anatomy Lens</span>
            </h3>
            <p class="text-[11px] text-zinc-400 font-sans">
              Wallace Rule of Nines • Parkland Fluid Resuscitation • Tactile Tourniquet Placement
            </p>
          </div>
        </div>

        <!-- Mode Switcher: Burn vs Trauma -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <div class="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button type="button" (click)="activeMode.set('burn')"
                    [class]="activeMode() === 'burn' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
              🔥 Wallace Rule of 9s
            </button>
            <button type="button" (click)="activeMode.set('trauma')"
                    [class]="activeMode() === 'trauma' ? 'bg-rose-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'"
                    class="px-2.5 py-1 rounded-lg transition cursor-pointer text-xs">
              🩸 Trauma & Tourniquet
            </button>
          </div>

          <button type="button" (click)="resetCameraView()"
                  class="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition text-xs">
            🎯 Reset 3D
          </button>
        </div>
      </div>

      <!-- Main Split Canvas / Telemetry Layout -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        <!-- Left 3D WebGL Canvas Viewport -->
        <div #rendererContainer class="flex-1 min-h-[360px] lg:min-h-0 bg-zinc-950 relative overflow-hidden">
          <!-- Ambient Radial Background -->
          <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950/90 to-black z-0"></div>

          <!-- On-Canvas 3D Floating Legend / Tips -->
          <div class="absolute bottom-3 left-3 z-10 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10.5px] font-mono text-zinc-400 pointer-events-none">
            @if (activeMode() === 'burn') {
              <span>Click body regions to toggle TBSA % burns • Drag to rotate 3D mesh</span>
            } @else {
              <span>Visualizing arterial vascular injury & proximal high-and-tight occlusion</span>
            }
          </div>

          <!-- Tourniquet Status Overlay HUD (in Trauma mode) -->
          @if (activeMode() === 'trauma') {
            <div class="absolute top-3 left-3 z-10 bg-zinc-950/90 backdrop-blur-md p-3 rounded-2xl border border-rose-900/60 text-xs font-mono space-y-2 max-w-xs shadow-xl">
              <div class="flex items-center justify-between text-rose-400 font-bold">
                <span>CAS-102 HEMORRHAGE</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">ARTERIAL</span>
              </div>
              <div class="text-[11px] text-zinc-300 font-sans leading-snug">
                Right Femoral Laceration • Pulsatile Hemorrhage • Radial Pulse Weak
              </div>
              <div class="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span class="text-[10px] text-zinc-400">CoTCCC Tourniquet:</span>
                <button type="button" (click)="toggleTourniquet()"
                        [class]="tourniquetApplied() ? 'bg-emerald-600 text-zinc-950 font-bold' : 'bg-rose-600 text-white font-bold animate-bounce'"
                        class="px-2.5 py-1 rounded-lg text-[10.5px] uppercase transition cursor-pointer">
                  {{ tourniquetApplied() ? '✅ TK High & Tight' : '⚠️ Apply Tourniquet' }}
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Right Clinical Calculation & Controls Sidebar -->
        <div class="w-full lg:w-96 bg-zinc-900/90 border-t lg:border-t-0 lg:border-l border-zinc-800 p-4 overflow-y-auto space-y-4 shrink-0 font-sans text-xs">
          
          @if (activeMode() === 'burn') {
            <!-- BURN CALCULATOR SIDEBAR -->
            <div class="space-y-4 font-mono">
              
              <!-- TBSA Meter Card -->
              <div class="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/40 space-y-2 shadow-lg">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-zinc-400 font-bold">TOTAL BURN AREA (TBSA)</span>
                  <span class="text-base font-black text-amber-400">{{ totalTbsa() }}%</span>
                </div>
                <div class="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-300"
                       [style.width.%]="totalTbsa()"></div>
                </div>
                <div class="text-[10.5px] text-zinc-400 font-sans flex justify-between">
                  <span>{{ totalTbsa() >= 20 ? '🚨 Severe Burn (Systemic Shock)' : 'Minor to Moderate' }}</span>
                  <button type="button" (click)="clearAllBurns()" class="text-zinc-400 hover:text-white underline cursor-pointer">Reset</button>
                </div>
              </div>

              <!-- Parkland Resuscitation Formula Box -->
              <div class="p-3.5 rounded-2xl bg-zinc-950 border border-teal-800/60 space-y-3 font-sans">
                <div class="flex items-center justify-between font-mono text-xs text-teal-300 font-bold border-b border-zinc-800 pb-1.5">
                  <span>PARKLAND RESUSCITATION</span>
                  <span class="text-[10px] text-zinc-400">4 mL × kg × %TBSA</span>
                </div>

                <div class="flex items-center justify-between text-xs font-mono">
                  <label class="text-zinc-400">Patient Weight:</label>
                  <div class="flex items-center gap-1.5">
                    <input type="number" min="30" max="180" [ngModel]="patientWeightKg()" (ngModelChange)="patientWeightKg.set($event)"
                           class="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-center font-bold text-zinc-100">
                    <span class="text-zinc-400">kg</span>
                  </div>
                </div>

                <div class="space-y-1.5 pt-1 text-xs">
                  <div class="flex justify-between font-mono">
                    <span class="text-zinc-400">Total 24h Lactated Ringer's:</span>
                    <span class="font-bold text-teal-300">{{ parklandTotal24h() | number:'1.0-0' }} mL</span>
                  </div>
                  <div class="flex justify-between font-mono">
                    <span class="text-zinc-400">First 8 Hours (50%):</span>
                    <span class="font-bold text-amber-300">{{ parklandFirst8h() | number:'1.0-0' }} mL ({{ parklandFirst8hRate() | number:'1.0-0' }} mL/h)</span>
                  </div>
                  <div class="flex justify-between font-mono">
                    <span class="text-zinc-400">Next 16 Hours (50%):</span>
                    <span class="font-bold text-zinc-300">{{ parklandNext16h() | number:'1.0-0' }} mL ({{ parklandNext16hRate() | number:'1.0-0' }} mL/h)</span>
                  </div>
                  <div class="flex justify-between font-mono text-[11px] pt-1 text-teal-400 border-t border-zinc-850">
                    <span>Target Urine Output:</span>
                    <span>{{ urineOutputTarget() }} mL/h</span>
                  </div>
                </div>
              </div>

              <!-- Quick Region Selector Buttons -->
              <div class="space-y-1.5">
                <div class="text-[11px] font-bold text-zinc-400 uppercase font-mono">Wallace 9s Fast Toggles</div>
                <div class="grid grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                  @for (r of burnRegions(); track r.id) {
                    <button type="button" (click)="toggleBurnRegion(r.id)"
                            [class]="r.isBurned ? 'bg-amber-600/30 border-amber-500 text-amber-200' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'"
                            class="p-2 rounded-xl border text-left flex items-center justify-between transition cursor-pointer">
                      <span>{{ r.name }}</span>
                      <span class="font-bold">{{ r.tbsaPercent }}%</span>
                    </button>
                  }
                </div>
              </div>

            </div>
          } @else {
            <!-- TRAUMA & TOURNIQUET SIDEBAR -->
            <div class="space-y-4 font-mono">
              
              <!-- Wound Assessment Card -->
              <div class="p-3.5 rounded-2xl bg-zinc-950 border border-rose-800/60 space-y-3 font-sans">
                <div class="flex items-center justify-between font-mono text-xs text-rose-400 font-bold border-b border-zinc-800 pb-1.5">
                  <span>ACTIVE WOUND MAPPING</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800">STAT</span>
                </div>

                <div class="space-y-1 text-xs">
                  <div class="font-bold text-zinc-200">Right Femoral Triangle (Groin / Upper Thigh)</div>
                  <p class="text-[11px] text-zinc-400 leading-snug">
                    Deep penetrating laceration with transected superficial femoral branch. High-velocity blood loss.
                  </p>
                </div>

                <!-- Tourniquet Protocol Guide -->
                <div class="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 text-[11px] font-sans">
                  <div class="font-bold text-amber-400 font-mono text-xs">CoTCCC High-and-Tight Protocol:</div>
                  <ul class="list-disc list-inside space-y-0.5 text-zinc-300 text-[10.5px]">
                    <li>Place 2–3 inches above injury (not over a joint).</li>
                    <li>Tighten windlass until arterial bleeding ceases.</li>
                    <li>Verify distal pedal pulse is completely abolished.</li>
                    <li>Mark time of application on forehead/limb: <span class="text-amber-300 font-mono font-bold">{{ tourniquetTime() }}</span></li>
                  </ul>
                </div>
              </div>

              <!-- Hemostasis & Distal Pulse Telemetry -->
              <div class="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5 font-sans">
                <div class="text-xs font-mono font-bold text-zinc-300 uppercase">Distal Perfusion Status</div>
                <div class="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800 space-y-0.5">
                    <span class="text-zinc-500 text-[10px] block">BLEEDING STATUS</span>
                    <span [class]="tourniquetApplied() ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold animate-pulse'">
                      {{ tourniquetApplied() ? 'Hemostasis OK' : 'Active Hemorrhage' }}
                    </span>
                  </div>
                  <div class="p-2 rounded-xl bg-zinc-900 border border-zinc-800 space-y-0.5">
                    <span class="text-zinc-500 text-[10px] block">DISTAL PEDAL PULSE</span>
                    <span [class]="tourniquetApplied() ? 'text-zinc-400' : 'text-amber-400 font-bold'">
                      {{ tourniquetApplied() ? 'Occluded (0/4)' : 'Palpable (2/4)' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Record & Attach Button -->
              <button type="button" (click)="attachToClinicalRecord()"
                      class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2">
                <span>📋</span>
                <span>Attach 3D Trauma Record to Chart</span>
              </button>

            </div>
          }

        </div>

      </div>

    </div>
  `
})
export class TraumaBurn3dLensComponent implements AfterViewInit, OnDestroy {
  readonly state = inject(PatientStateService);
  private readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');

  activeMode = signal<'burn' | 'trauma'>('burn');
  patientWeightKg = signal<number>(70);
  tourniquetApplied = signal<boolean>(false);
  tourniquetTime = signal<string>('08:14 UTC');

  // Three.js instances
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private animationId?: number;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // 3D Meshes
  private bodyMeshGroup = new THREE.Group();
  private woundMesh?: THREE.Mesh;
  private tourniquetMesh?: THREE.Mesh;

  // Wallace Rule of Nines anatomical regions
  burnRegions = signal<IBurnRegion[]>([
    { id: 'head_neck', name: 'Head & Neck', tbsaPercent: 9, isBurned: false, depth: 'partial_2nd' },
    { id: 'ant_torso', name: 'Anterior Chest/Abd', tbsaPercent: 18, isBurned: true, depth: 'partial_2nd' },
    { id: 'post_torso', name: 'Posterior Back', tbsaPercent: 18, isBurned: false, depth: 'partial_2nd' },
    { id: 'right_arm', name: 'Right Arm', tbsaPercent: 9, isBurned: true, depth: 'full_3rd' },
    { id: 'left_arm', name: 'Left Arm', tbsaPercent: 9, isBurned: false, depth: 'partial_2nd' },
    { id: 'right_leg', name: 'Right Leg', tbsaPercent: 18, isBurned: false, depth: 'partial_2nd' },
    { id: 'left_leg', name: 'Left Leg', tbsaPercent: 18, isBurned: false, depth: 'partial_2nd' },
    { id: 'perineum', name: 'Perineum', tbsaPercent: 1, isBurned: false, depth: 'partial_2nd' }
  ]);

  // Computed Total TBSA
  totalTbsa = computed(() => {
    return this.burnRegions()
      .filter(r => r.isBurned)
      .reduce((sum, r) => sum + r.tbsaPercent, 0);
  });

  // Parkland Formula: 4 mL * kg * %TBSA
  parklandTotal24h = computed(() => {
    return 4 * this.patientWeightKg() * this.totalTbsa();
  });

  parklandFirst8h = computed(() => this.parklandTotal24h() * 0.5);
  parklandFirst8hRate = computed(() => this.parklandFirst8h() / 8);
  parklandNext16h = computed(() => this.parklandTotal24h() * 0.5);
  parklandNext16hRate = computed(() => this.parklandNext16h() / 16);
  urineOutputTarget = computed(() => {
    const min = Math.round(0.5 * this.patientWeightKg());
    const max = Math.round(1.0 * this.patientWeightKg());
    return `${min}–${max}`;
  });

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.animate();
  }

  private initThreeJs(): void {
    const el = this.rendererContainer()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, el.clientWidth / (el.clientHeight || 400), 0.1, 100);
    this.camera.position.set(0, 1.0, 3.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight || 400);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.8, 0);

    // Add ambient and key lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xf43f5e, 0.8);
    backLight.position.set(-5, -5, -5);
    this.scene.add(backLight);

    // Construct Procedural Anatomical Model
    this.constructProceduralAnatomy();

    // Listen to click events on canvas for raycasting
    el.addEventListener('click', this.onCanvasClick);
  }

  private constructProceduralAnatomy(): void {
    if (!this.scene) return;
    this.bodyMeshGroup = new THREE.Group();

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.2,
      wireframe: false
    });

    const burnedMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.7,
      wireframe: false
    });

    // 1. Head & Neck
    const headGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, baseMaterial.clone());
    headMesh.position.set(0, 1.7, 0);
    headMesh.userData = { regionId: 'head_neck' };
    this.bodyMeshGroup.add(headMesh);

    // 2. Torso (Cylinder/Capsule)
    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.75, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, burnedMaterial.clone());
    torsoMesh.position.set(0, 1.15, 0);
    torsoMesh.userData = { regionId: 'ant_torso' };
    this.bodyMeshGroup.add(torsoMesh);

    // 3. Right Arm
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.65, 16);
    const rightArm = new THREE.Mesh(armGeo, burnedMaterial.clone());
    rightArm.position.set(0.42, 1.15, 0);
    rightArm.rotation.z = -0.15;
    rightArm.userData = { regionId: 'right_arm' };
    this.bodyMeshGroup.add(rightArm);

    // 4. Left Arm
    const leftArm = new THREE.Mesh(armGeo, baseMaterial.clone());
    leftArm.position.set(-0.42, 1.15, 0);
    leftArm.rotation.z = 0.15;
    leftArm.userData = { regionId: 'left_arm' };
    this.bodyMeshGroup.add(leftArm);

    // 5. Right Leg (Upper & Lower)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.85, 20);
    const rightLeg = new THREE.Mesh(legGeo, baseMaterial.clone());
    rightLeg.position.set(0.18, 0.42, 0);
    rightLeg.userData = { regionId: 'right_leg' };
    this.bodyMeshGroup.add(rightLeg);

    // 6. Left Leg
    const leftLeg = new THREE.Mesh(legGeo, baseMaterial.clone());
    leftLeg.position.set(-0.18, 0.42, 0);
    leftLeg.userData = { regionId: 'left_leg' };
    this.bodyMeshGroup.add(leftLeg);

    // Add trauma wound & tourniquet objects (Right Femoral Upper Leg)
    const woundGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const woundMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    this.woundMesh = new THREE.Mesh(woundGeo, woundMat);
    this.woundMesh.position.set(0.18, 0.55, 0.1);
    this.bodyMeshGroup.add(this.woundMesh);

    // Tourniquet Torus / Strap (placed 2.5 inches proximal to wound)
    const tkGeo = new THREE.TorusGeometry(0.15, 0.03, 16, 32);
    const tkMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xb45309,
      emissiveIntensity: 0.8
    });
    this.tourniquetMesh = new THREE.Mesh(tkGeo, tkMat);
    this.tourniquetMesh.rotation.x = Math.PI / 2;
    this.tourniquetMesh.position.set(0.18, 0.68, 0);
    this.tourniquetMesh.visible = false;
    this.bodyMeshGroup.add(this.tourniquetMesh);

    this.scene.add(this.bodyMeshGroup);
  }

  private onCanvasClick = (event: MouseEvent) => {
    const el = this.rendererContainer()?.nativeElement;
    if (!el || !this.camera) return;

    const rect = el.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.bodyMeshGroup.children);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const regionId = hit.userData['regionId'];
      if (regionId && this.activeMode() === 'burn') {
        this.toggleBurnRegion(regionId);
      }
    }
  };

  toggleBurnRegion(id: string): void {
    this.burnRegions.update(list => list.map(r => {
      if (r.id === id) {
        return { ...r, isBurned: !r.isBurned };
      }
      return r;
    }));
    this.updateMeshVisuals();
  }

  clearAllBurns(): void {
    this.burnRegions.update(list => list.map(r => ({ ...r, isBurned: false })));
    this.updateMeshVisuals();
  }

  private updateMeshVisuals(): void {
    const regions = this.burnRegions();
    this.bodyMeshGroup.children.forEach(obj => {
      if (obj instanceof THREE.Mesh && obj.userData['regionId']) {
        const region = regions.find(r => r.id === obj.userData['regionId']);
        if (region) {
          const mat = obj.material as THREE.MeshStandardMaterial;
          if (region.isBurned) {
            mat.color.setHex(0xf59e0b);
            mat.emissive.setHex(0xd97706);
            mat.emissiveIntensity = 0.6;
          } else {
            mat.color.setHex(0x1e293b);
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      }
    });
  }

  toggleTourniquet(): void {
    this.tourniquetApplied.set(!this.tourniquetApplied());
    if (this.tourniquetMesh) {
      this.tourniquetMesh.visible = this.tourniquetApplied();
    }
  }

  resetCameraView(): void {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 1.0, 3.2);
      this.controls.target.set(0, 0.8, 0);
      this.controls.update();
    }
  }

  attachToClinicalRecord(): void {
    const note = `[3D TRAUMA & BURN SPATIAL ANATOMY RECORD]\n` +
      `Mode: ${this.activeMode().toUpperCase()}\n` +
      `Wallace Rule of 9s TBSA: ${this.totalTbsa()}%\n` +
      `Parkland 24h Fluid Requirement: ${Math.round(this.parklandTotal24h())} mL (First 8h: ${Math.round(this.parklandFirst8hRate())} mL/h)\n` +
      `Trauma Tourniquet: ${this.tourniquetApplied() ? 'Applied High & Tight (' + this.tourniquetTime() + ')' : 'Not Applied'}\n` +
      `Distal Perfusion: ${this.tourniquetApplied() ? 'Hemostasis Achieved, Pedal Pulse Abolished' : 'Active Hemorrhage'}`;

    this.state.addClinicalNote?.({
      id: `note_3d_trauma_${Date.now()}`,
      text: note,
      sourceLens: 'telemetry',
      date: new Date().toISOString()
    });

    if (typeof alert === 'function') {
      alert('3D Trauma & Burn calculation successfully attached to patient chart!');
    }
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();

    // Subtle pulsatile animation on wound in trauma mode
    if (this.woundMesh && this.activeMode() === 'trauma') {
      const scale = 1 + Math.sin(Date.now() * 0.008) * 0.2;
      this.woundMesh.scale.set(scale, scale, scale);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const el = this.rendererContainer()?.nativeElement;
    if (el) el.removeEventListener('click', this.onCanvasClick);

    if (this.controls) this.controls.dispose();
    if (this.renderer) this.renderer.dispose();

    if (this.scene) {
      this.scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        }
      });
    }
  }
}
