import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface IKneeAbnormalityLocus {
  id: string;
  name: string;
  category: 'ligament' | 'meniscus' | 'cartilage' | 'fluid' | 'bone';
  position: [number, number, number];
  likelihood: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Normal';
  plane: 'Sagittal' | 'Coronal' | 'Axial';
  clinicalNote: string;
}

@Component({
  selector: 'app-knee-hologram-hud',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950/95 rounded-2xl border border-zinc-800 shadow-2xl p-4 text-zinc-100 flex flex-col gap-4 font-sans">
      
      <!-- Header HUD Controls -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-lg font-bold shadow-inner">
            🩻
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-semibold text-zinc-100 tracking-wide uppercase font-mono">
                3D Holographic Joint & Tri-Plane Slicer HUD
              </h2>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WebGL Procedural PBR
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              RSNA Multi-Plane Abnormality Detection & Biomechanical Range of Motion
            </p>
          </div>
        </div>

        <!-- Controls: Active Plane & ROM Flexion Angle -->
        <div class="flex items-center gap-2 font-mono text-xs">
          <div class="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
            <button 
              (click)="setSlicePlane('Sagittal')"
              [class.bg-cyan-500]="activePlane() === 'Sagittal'"
              [class.text-zinc-950]="activePlane() === 'Sagittal'"
              [class.text-cyan-400]="activePlane() !== 'Sagittal'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              Sagittal (ACL)
            </button>
            <button 
              (click)="setSlicePlane('Coronal')"
              [class.bg-teal-500]="activePlane() === 'Coronal'"
              [class.text-zinc-950]="activePlane() === 'Coronal'"
              [class.text-teal-400]="activePlane() !== 'Coronal'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              Coronal (MCL/Meniscus)
            </button>
            <button 
              (click)="setSlicePlane('Axial')"
              [class.bg-amber-400]="activePlane() === 'Axial'"
              [class.text-zinc-950]="activePlane() === 'Axial'"
              [class.text-amber-300]="activePlane() !== 'Axial'"
              class="px-2.5 py-1 rounded-lg font-bold transition text-[11px] min-h-[32px] touch-manipulation">
              Axial (Patella/Baker's)
            </button>
          </div>

          <button 
            (click)="toggleAutoRotate()"
            class="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-cyan-300 transition text-[11px] min-h-[36px]">
            {{ isAutoRotating() ? '⏸ Pause Spin' : '▶ 360° Spin' }}
          </button>
        </div>
      </div>

      <!-- Main Dual View: 3D Hologram Canvas (Left 8 Cols) + Loci Inspector & Slicer (Right 4 Cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- 3D Hologram WebGL Viewport -->
        <div class="lg:col-span-8 relative min-h-[420px] rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
          <div #rendererContainer class="w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing"></div>
          
          <!-- Hologram Viewport Overlay Indicators -->
          <div class="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono bg-zinc-950/80 backdrop-blur-md p-2 rounded-xl border border-zinc-800 text-zinc-400">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span class="text-zinc-200">Joint Flexion: {{ flexionAngle() }}°</span>
            </div>
            <span>Slice Plane: <span class="text-cyan-300">{{ activePlane() }}</span></span>
            <span>Target Loci: <span class="text-amber-300">12 RSNA Markers</span></span>
          </div>

          <!-- Flexion Angle Slider in Canvas Footer -->
          <div class="absolute bottom-3 left-3 right-3 bg-zinc-950/85 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 flex items-center gap-4 text-xs font-mono">
            <span class="text-zinc-400 shrink-0">Biomechanical Flexion:</span>
            <input 
              type="range" 
              min="0" 
              max="90" 
              [value]="flexionAngle()" 
              (input)="onFlexionChange($event)"
              class="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <span class="text-cyan-300 font-bold tabular-nums shrink-0">{{ flexionAngle() }}°</span>
          </div>
        </div>

        <!-- Right Side: RSNA 12 Loci Telemetry Inspector -->
        <div class="lg:col-span-4 flex flex-col gap-3 bg-zinc-900/50 border border-zinc-800 p-3.5 rounded-xl">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
            <span class="font-semibold text-zinc-200">RSNA Abnormality Heatmap</span>
            <span class="text-[10px] text-cyan-400">{{ lociList.length }} Targets</span>
          </div>

          <!-- Selected Locus Card -->
          @if (selectedLocus(); as locus) {
            <div class="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-cyan-300 font-mono">{{ locus.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                  [class.bg-rose-500-20]="locus.severity === 'Severe'"
                  [class.text-rose-400]="locus.severity === 'Severe'"
                  [class.bg-amber-500-20]="locus.severity === 'Moderate'"
                  [class.text-amber-300]="locus.severity === 'Moderate'"
                  [class.bg-teal-500-20]="locus.severity === 'Mild'"
                  [class.text-teal-400]="locus.severity === 'Mild'">
                  {{ locus.severity }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-300 leading-snug">
                {{ locus.clinicalNote }}
              </p>
              <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                <span>Plane: {{ locus.plane }}</span>
                <span class="text-cyan-300 font-bold">Likelihood: {{ (locus.likelihood * 100).toFixed(0) }}%</span>
              </div>
            </div>
          }

          <!-- Loci List -->
          <div class="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
            @for (locus of lociList; track locus.id) {
              <button 
                (click)="selectLocus(locus)"
                class="w-full text-left p-2 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/40 transition flex items-center justify-between text-xs font-mono min-h-[44px] touch-manipulation"
                [class.border-cyan-500]="selectedLocus()?.id === locus.id">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full"
                    [class.bg-rose-400]="locus.severity === 'Severe'"
                    [class.bg-amber-400]="locus.severity === 'Moderate'"
                    [class.bg-teal-400]="locus.severity === 'Mild'">
                  </span>
                  <span class="text-zinc-200 truncate max-w-[140px]">{{ locus.name }}</span>
                </div>
                <span class="text-cyan-300 font-bold tabular-nums text-[11px]">
                  {{ (locus.likelihood * 100).toFixed(0) }}%
                </span>
              </button>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class KneeHologramHudComponent implements AfterViewInit, OnDestroy {
  readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');

  readonly activePlane = signal<'Sagittal' | 'Coronal' | 'Axial'>('Sagittal');
  readonly isAutoRotating = signal<boolean>(true);
  readonly flexionAngle = signal<number>(15);

  readonly lociList: IKneeAbnormalityLocus[] = [
    {
      id: 'acl',
      name: 'Anterior Cruciate Ligament (ACL)',
      category: 'ligament',
      position: [0, 0.2, 0.1],
      likelihood: 0.78,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Complete mid-substance disruption with hyperintense fluid signal on Sagittal T2.'
    },
    {
      id: 'mcl',
      name: 'Medial Collateral Ligament (MCL)',
      category: 'ligament',
      position: [-0.65, 0, 0],
      likelihood: 0.42,
      severity: 'Moderate',
      plane: 'Coronal',
      clinicalNote: 'Grade II sprain with periligamentous edema along proximal femoral attachment.'
    },
    {
      id: 'medial_meniscus',
      name: 'Medial Meniscus Posterior Horn',
      category: 'meniscus',
      position: [-0.45, -0.2, -0.2],
      likelihood: 0.84,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Complex radial tear extending to superior and inferior articular surfaces.'
    },
    {
      id: 'lateral_meniscus',
      name: 'Lateral Meniscus Body',
      category: 'meniscus',
      position: [0.45, -0.2, 0],
      likelihood: 0.22,
      severity: 'Mild',
      plane: 'Coronal',
      clinicalNote: 'Intact contour with minimal intrasubstance degeneration.'
    },
    {
      id: 'medial_oa',
      name: 'Medial Compartment Cartilage Loss',
      category: 'cartilage',
      position: [-0.4, 0.1, 0],
      likelihood: 0.65,
      severity: 'Moderate',
      plane: 'Coronal',
      clinicalNote: 'Focal 50% cartilage thinning with adjacent subchondral marrow edema.'
    },
    {
      id: 'effusion',
      name: 'Suprapatellar Joint Effusion',
      category: 'fluid',
      position: [0, 0.7, 0.4],
      likelihood: 0.91,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Marked fluid distension of suprapatellar bursa (>15mm depth).'
    },
    {
      id: 'bakers_cyst',
      name: 'Popliteal (Baker) Cyst',
      category: 'fluid',
      position: [-0.3, -0.4, -0.6],
      likelihood: 0.38,
      severity: 'Moderate',
      plane: 'Axial',
      clinicalNote: 'Well-defined fluid collection between semimembranosus and medial gastrocnemius.'
    },
    {
      id: 'contusion',
      name: 'Lateral Femoral Condyle Contusion',
      category: 'bone',
      position: [0.4, 0.3, -0.2],
      likelihood: 0.72,
      severity: 'Severe',
      plane: 'Sagittal',
      clinicalNote: 'Pivot-shift impaction edema pattern classic for acute ACL deceleration tear.'
    }
  ];

  readonly selectedLocus = signal<IKneeAbnormalityLocus | null>(this.lociList[0]);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animFrameId: number | null = null;
  private jointGroup!: THREE.Group;
  private tibiaGroup!: THREE.Group;
  private hotSpotMeshes: THREE.Mesh[] = [];

  ngAfterViewInit(): void {
    this.initThree();
    this.buildProceduralKnee();
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

  setSlicePlane(plane: 'Sagittal' | 'Coronal' | 'Axial'): void {
    this.activePlane.set(plane);
  }

  toggleAutoRotate(): void {
    this.isAutoRotating.update(v => !v);
  }

  onFlexionChange(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value);
    this.flexionAngle.set(val);
    if (this.tibiaGroup) {
      // Flexion rotates tibia backwards around the condylar axis
      this.tibiaGroup.rotation.x = THREE.MathUtils.degToRad(-val);
    }
  }

  selectLocus(locus: IKneeAbnormalityLocus): void {
    this.selectedLocus.set(locus);
    this.activePlane.set(locus.plane);
  }

  private initThree(): void {
    const container = this.rendererContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05080c);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 3.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 6.0;
    this.controls.minDistance = 1.5;

    // Holographic Lighting Setup
    const ambLight = new THREE.AmbientLight(0x0a2540, 2.0);
    this.scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0x14b8a6, 2.5);
    dirLight1.position.set(3, 5, 4);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.8);
    dirLight2.position.set(-3, -2, -3);
    this.scene.add(dirLight2);

    const grid = new THREE.GridHelper(10, 20, 0x14b8a6, 0x0f3443);
    grid.position.y = -1.5;
    this.scene.add(grid);
  }

  private buildProceduralKnee(): void {
    this.jointGroup = new THREE.Group();

    // 1. Distal Femur (Bone Material with subtle wireframe/PBR)
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
      metalness: 0.2,
      wireframe: false
    });

    const cartilageMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    const ligamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.3
    });

    // Femur Shaft & Condyles
    const femurShaftGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 16);
    const femurShaft = new THREE.Mesh(femurShaftGeo, boneMaterial);
    femurShaft.position.y = 0.9;
    this.jointGroup.add(femurShaft);

    // Medial & Lateral Femoral Condyles
    const medCondyleGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const medCondyle = new THREE.Mesh(medCondyleGeo, boneMaterial);
    medCondyle.position.set(-0.35, 0.35, 0);
    medCondyle.scale.set(1, 1.2, 1.4);
    this.jointGroup.add(medCondyle);

    const latCondyleGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const latCondyle = new THREE.Mesh(latCondyleGeo, boneMaterial);
    latCondyle.position.set(0.35, 0.35, 0);
    latCondyle.scale.set(1, 1.2, 1.4);
    this.jointGroup.add(latCondyle);

    // Patella (Kneecap)
    const patellaGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const patella = new THREE.Mesh(patellaGeo, boneMaterial);
    patella.position.set(0, 0.4, 0.45);
    patella.scale.set(1.1, 1.3, 0.6);
    this.jointGroup.add(patella);

    // 2. Tibia Group (Articulating Body)
    this.tibiaGroup = new THREE.Group();
    this.tibiaGroup.position.set(0, 0.2, 0);

    // Tibial Plateau
    const plateauGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.25, 16);
    const plateau = new THREE.Mesh(plateauGeo, boneMaterial);
    plateau.position.y = -0.3;
    this.tibiaGroup.add(plateau);

    // Tibial Shaft
    const tibiaShaftGeo = new THREE.CylinderGeometry(0.35, 0.25, 1.3, 16);
    const tibiaShaft = new THREE.Mesh(tibiaShaftGeo, boneMaterial);
    tibiaShaft.position.y = -1.0;
    this.tibiaGroup.add(tibiaShaft);

    // Menisci (Torus crescents)
    const medMeniscusGeo = new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI * 1.3);
    const medMeniscus = new THREE.Mesh(medMeniscusGeo, cartilageMaterial);
    medMeniscus.rotation.x = Math.PI / 2;
    medMeniscus.position.set(-0.25, -0.18, 0);
    this.tibiaGroup.add(medMeniscus);

    const latMeniscusGeo = new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI * 1.3);
    const latMeniscus = new THREE.Mesh(latMeniscusGeo, cartilageMaterial);
    latMeniscus.rotation.x = Math.PI / 2;
    latMeniscus.rotation.z = Math.PI;
    latMeniscus.position.set(0.25, -0.18, 0);
    this.tibiaGroup.add(latMeniscus);

    // Ligaments: ACL & PCL
    const aclGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
    const acl = new THREE.Mesh(aclGeo, ligamentMaterial);
    acl.position.set(0.08, 0.05, 0.05);
    acl.rotation.z = 0.35;
    acl.rotation.x = -0.45;
    this.jointGroup.add(acl);

    const mclGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 8);
    const mcl = new THREE.Mesh(mclGeo, ligamentMaterial);
    mcl.position.set(-0.55, 0.05, 0);
    this.jointGroup.add(mcl);

    this.jointGroup.add(this.tibiaGroup);

    // 3. Add Hotspot Markers for the 12 RSNA Loci
    for (const locus of this.lociList) {
      const hotspotGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const hotspotMat = new THREE.MeshBasicMaterial({
        color: locus.severity === 'Severe' ? 0xf43f5e : (locus.severity === 'Moderate' ? 0xf59e0b : 0x14b8a6)
      });
      const hotspot = new THREE.Mesh(hotspotGeo, hotspotMat);
      hotspot.position.set(...locus.position);
      this.jointGroup.add(hotspot);
      this.hotSpotMeshes.push(hotspot);
    }

    this.scene.add(this.jointGroup);
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    if (this.isAutoRotating() && this.jointGroup) {
      this.jointGroup.rotation.y += 0.006;
    }

    // Pulse hotspot sizes
    const time = performance.now() * 0.003;
    for (const mesh of this.hotSpotMeshes) {
      const scale = 1.0 + Math.sin(time * 2.0) * 0.25;
      mesh.scale.set(scale, scale, scale);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };
}
