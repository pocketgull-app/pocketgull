import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  input,
  output,
  viewChild,
  effect,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IClinicalMenuItem } from './clinical-menu.component';

@Component({
  selector: 'app-pantry-lazy-susan',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-2xl relative overflow-hidden font-mono text-zinc-100">
      <!-- Top Bar / Braun Industrial Design Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span>
            <h3 class="text-xs font-black uppercase tracking-widest text-zinc-100">
              🌿 Outdoor Dining Table & Mechanical Dish Carousel
            </h3>
          </div>
          <p class="text-[11px] text-zinc-400 mt-1 font-mono">
            Rotary presentation carousel • Automatic silver cloche mechanical arm
          </p>
        </div>

        <!-- Controls: Spin Carousel Left / Right -->
        <div class="flex items-center gap-2 font-mono">
          <button (click)="rotateTurntable(-90)"
            class="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold uppercase transition active:scale-95 cursor-pointer border border-orange-400/50">
            ◀ Rotate Left
          </button>
          <button (click)="rotateTurntable(90)"
            class="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold uppercase transition active:scale-95 cursor-pointer border border-orange-400/50">
            Rotate Right ▶
          </button>
        </div>
      </div>

      <!-- 3D WebGL Canvas Container -->
      <div #canvasContainer class="w-full h-96 sm:h-[420px] relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-grab active:cursor-grabbing">
        @if (!webglSupported()) {
          <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-400">
            <span>3D Outdoor Dining Scene Unavailable</span>
          </div>
        }

        <!-- Interactive Overlay Badge -->
        @if (selectedItem(); as item) {
          <div class="absolute top-4 left-4 z-10 p-4 bg-zinc-950/90 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl text-xs max-w-sm pointer-events-none font-mono">
            <div class="flex items-center justify-between gap-3 mb-1">
              <div class="flex items-center gap-2 font-bold text-zinc-100">
                <span class="text-xl">{{ item.emoji }}</span>
                <span class="text-xs font-bold font-sans tracking-tight">{{ item.name }}</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-zinc-900 text-orange-400 border border-zinc-800 font-bold text-[10px]">
                GI {{ item.glycemicIndex }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-400 font-mono leading-tight mb-2">
              Silver Cloche Open • {{ item.category }} Presentation
            </p>
            <div class="flex flex-wrap items-center gap-1 text-[10px]">
              @for (c of item.activeCompounds; track c.name) {
                <span class="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {{ c.name }}: {{ c.dose }}
                </span>
              }
            </div>
          </div>
        }

        <!-- Environment Telemetry Overlay -->
        <div class="absolute bottom-4 right-4 z-10 px-3.5 py-2 bg-zinc-950/90 backdrop-blur-md rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400 flex items-center gap-3">
          <span>🍃 Gentle Outdoor Breeze: <strong class="text-emerald-400">Active</strong></span>
          <span>Carousel Angle: <strong class="text-orange-400">{{ currentAngle().toFixed(0) }}°</strong></span>
        </div>
      </div>

      <!-- Quick Item Selector Bar -->
      <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5 font-mono">
        @for (menuOpt of items(); track menuOpt.id; let idx = $index) {
          <button (click)="selectItemByAngle(idx, menuOpt)"
            [class]="selectedItem()?.id === menuOpt.id
              ? 'px-4 py-2 rounded-xl border border-orange-400/50 bg-orange-500 text-zinc-950 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md'
              : 'px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono font-bold transition-all hover:border-zinc-700 hover:text-zinc-200 cursor-pointer flex items-center gap-2'">
            <span class="text-sm">{{ menuOpt.emoji }}</span>
            <span>{{ menuOpt.name.split(' ')[0] }}</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
    canvas { outline: none; }
  `]
})
export class PantryLazySusanComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');

  items = input<IClinicalMenuItem[]>([]);
  selectedItem = input<IClinicalMenuItem | null>(null);
  itemSelect = output<IClinicalMenuItem>();

  readonly webglSupported = signal<boolean>(true);
  readonly currentAngle = signal<number>(0);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private carouselGroup!: THREE.Group;
  private clocheDomes: THREE.Mesh[] = [];
  private plateGroups: THREE.Group[] = [];
  private breezeParticles!: THREE.Points;

  private animationFrameId?: number;
  private targetRotationY = 0;

  constructor() {
    effect(() => {
      const selected = this.selectedItem();
      const allItems = this.items();
      if (selected && allItems.length > 0) {
        const idx = allItems.findIndex(i => i.id === selected.id);
        if (idx !== -1) {
          this.targetRotationY = -(idx * (Math.PI / 2));
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.initThreeJS();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  rotateTurntable(degrees: number): void {
    this.targetRotationY += (degrees * Math.PI) / 180;
    const allItems = this.items();
    if (allItems.length === 0) return;
    let norm = (-this.targetRotationY / (Math.PI / 2)) % allItems.length;
    if (norm < 0) norm += allItems.length;
    const closestIdx = Math.round(norm) % allItems.length;
    this.itemSelect.emit(allItems[closestIdx]);
  }

  selectItemByAngle(idx: number, item: IClinicalMenuItem): void {
    this.targetRotationY = -(idx * (Math.PI / 2));
    this.itemSelect.emit(item);
  }

  private initThreeJS(): void {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 420;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep outdoor twilight/sky tint
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.04);

    // 2. Camera setup — Seated at the head of the table looking down length
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.set(0, 2.3, 5.8);

    // 3. Renderer setup
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(this.renderer.domElement);
    } catch (e) {
      this.webglSupported.set(false);
      return;
    }

    // 4. OrbitControls setup
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.9, 0);
    this.controls.maxPolarAngle = Math.PI / 2.05; // Stay above ground
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 10;

    // 5. Lighting setup — Warm outdoor sunlight + sky ambient
    const ambientLight = new THREE.AmbientLight(0xfffaed, 0.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    sunLight.position.set(6, 12, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    this.scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.6);
    skyFill.position.set(-6, 8, -6);
    this.scene.add(skyFill);

    // 6. Build Scene Objects: Outdoor Environment, Plaid Table, Silver Carousel
    this.buildOutdoorEnvironment();
    this.buildPlaidTable();
    this.buildSilverMechanicalCarousel();

    // 7. Window resize handler
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // 8. Animation loop
    const startTime = performance.now();
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth interpolation for Carousel rotation Y
      if (this.carouselGroup) {
        this.carouselGroup.rotation.y += (this.targetRotationY - this.carouselGroup.rotation.y) * 0.08;
        const currentDeg = (this.carouselGroup.rotation.y * 180 / Math.PI) % 360;
        this.currentAngle.set(currentDeg < 0 ? currentDeg + 360 : currentDeg);

        // Cloche Dome Lift Mechanics:
        // Calculate which of the 4 dish positions is closest to the front viewer position (local angle near 0)
        this.clocheDomes.forEach((cloche, idx) => {
          const dishAngle = (idx * (Math.PI / 2)) + this.carouselGroup.rotation.y;
          // Normalize angle around 0
          let norm = Math.atan2(Math.sin(dishAngle), Math.cos(dishAngle));
          const isFront = Math.abs(norm) < 0.35; // Front-facing dish position

          const targetLiftY = isFront ? 0.75 : 0.0; // Lift cloche up by 0.75 units when front-facing
          cloche.position.y += (targetLiftY - cloche.position.y) * 0.1;
        });

        // Gentle floating plates wobble
        this.plateGroups.forEach(pg => {
          pg.rotation.y += 0.003;
        });
      }

      // Gentle breeze particle drift
      if (this.breezeParticles) {
        const positions = this.breezeParticles.geometry.attributes['position'].array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(elapsedTime + i) * 0.002;
          positions[i + 1] += Math.cos(elapsedTime * 0.5 + i) * 0.001;
          if (positions[i + 1] < 0) positions[i + 1] = 6;
        }
        this.breezeParticles.geometry.attributes['position'].needsUpdate = true;
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private buildOutdoorEnvironment(): void {
    // Distant Rolling Green Lawn / Garden Ground
    const lawnGeo = new THREE.PlaneGeometry(100, 100);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -1.2;
    lawn.receiveShadow = true;
    this.scene.add(lawn);

    // Drifting Outdoor Breeze Particles (Dandelion seed / light dust effect)
    const particleCount = 150;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 15;
      pos[i + 1] = Math.random() * 6;
      pos[i + 2] = (Math.random() - 0.5) * 15;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    this.breezeParticles = new THREE.Points(geo, mat);
    this.scene.add(this.breezeParticles);
  }

  private buildPlaidTable(): void {
    // Generate Procedural Red & White Plaid Cloth Texture via Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // White Base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);

      // Red Plaid Stripes
      ctx.fillStyle = 'rgba(225, 29, 72, 0.7)'; // Rose red
      for (let x = 0; x < 256; x += 32) {
        ctx.fillRect(x, 0, 12, 256);
        ctx.fillRect(0, x, 256, 12);
      }

      ctx.fillStyle = 'rgba(159, 18, 57, 0.4)'; // Darker accent thread
      for (let x = 16; x < 256; x += 32) {
        ctx.fillRect(x, 0, 4, 256);
        ctx.fillRect(0, x, 256, 4);
      }
    }

    const plaidTexture = new THREE.CanvasTexture(canvas);
    plaidTexture.wrapS = THREE.RepeatWrapping;
    plaidTexture.wrapT = THREE.RepeatWrapping;
    plaidTexture.repeat.set(4, 8);

    // Dining Table Geometry (Long outdoor wooden table covered by plaid cloth)
    const tableGeo = new THREE.BoxGeometry(4.5, 0.15, 8);
    const tableMat = new THREE.MeshStandardMaterial({
      map: plaidTexture,
      roughness: 0.7,
      metalness: 0.05,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, 0, 0);
    tableMesh.receiveShadow = true;
    this.scene.add(tableMesh);
  }

  private buildSilverMechanicalCarousel(): void {
    this.carouselGroup = new THREE.Group();
    this.carouselGroup.position.set(0, 0.08, -1.2); // Positioned down the table length
    this.scene.add(this.carouselGroup);

    // 1. Central Mechanical Polished Chrome Column
    const columnGeo = new THREE.CylinderGeometry(0.3, 0.4, 2.0, 32);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1,
    });
    const columnMesh = new THREE.Mesh(columnGeo, chromeMat);
    columnMesh.position.y = 1.0;
    columnMesh.castShadow = true;
    this.carouselGroup.add(columnMesh);

    // Chrome Top Cap Knob
    const capGeo = new THREE.SphereGeometry(0.35, 32, 16);
    const capMesh = new THREE.Mesh(capGeo, chromeMat);
    capMesh.position.y = 2.0;
    this.carouselGroup.add(capMesh);

    // 2. Extending Mechanical Carousel Arms & 4 Dishes
    const radius = 2.1;
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const menuData = this.items();

    angles.forEach((angle, idx) => {
      const armGroup = new THREE.Group();

      // Curved Metallic Arm extending from center column
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, radius, 16);
      const armMesh = new THREE.Mesh(armGeo, chromeMat);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.position.x = (radius / 2) * Math.sin(angle);
      armMesh.position.z = (radius / 2) * Math.cos(angle);
      armMesh.rotation.y = angle;
      armMesh.position.y = 1.2;
      armMesh.castShadow = true;
      armGroup.add(armMesh);

      // Vertical Suspension Rod holding plate pedestal
      const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 16);
      const rodMesh = new THREE.Mesh(rodGeo, chromeMat);
      rodMesh.position.x = radius * Math.sin(angle);
      rodMesh.position.z = radius * Math.cos(angle);
      rodMesh.position.y = 0.8;
      armGroup.add(rodMesh);

      // Dish Pedestal Platform
      const dishContainer = new THREE.Group();
      dishContainer.position.x = radius * Math.sin(angle);
      dishContainer.position.z = radius * Math.cos(angle);
      dishContainer.position.y = 0.35;

      const item = menuData[idx % menuData.length];
      const proceduralDish = this.createProceduralDish(item ? item.id : `menu-${idx + 1}`);
      dishContainer.add(proceduralDish);

      // Polished Silver Cloche Dome
      const clocheGeo = new THREE.SphereGeometry(0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const clocheMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.95,
        roughness: 0.08,
        side: THREE.DoubleSide,
      });
      const clocheMesh = new THREE.Mesh(clocheGeo, clocheMat);
      clocheMesh.position.y = 0.0;
      clocheMesh.castShadow = true;

      // Silver Handle Ring on top of Cloche Dome
      const handleGeo = new THREE.TorusGeometry(0.12, 0.03, 16, 32);
      const handleMesh = new THREE.Mesh(handleGeo, chromeMat);
      handleMesh.rotation.x = Math.PI / 2;
      handleMesh.position.y = 0.92;
      clocheMesh.add(handleMesh);

      dishContainer.add(clocheMesh);
      this.clocheDomes.push(clocheMesh);

      this.plateGroups.push(dishContainer);
      this.carouselGroup.add(armGroup);
      this.carouselGroup.add(dishContainer);
    });
  }

  private createProceduralDish(itemId: string): THREE.Group {
    const dishGroup = new THREE.Group();

    // Base Fine Porcelain / Slate Serving Platter
    const plateGeo = new THREE.CylinderGeometry(0.88, 0.65, 0.08, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: itemId === 'menu-2' ? 0x18181b : 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.castShadow = true;
    plateMesh.receiveShadow = true;
    dishGroup.add(plateMesh);

    // Procedural Food Geometry according to dish ID
    if (itemId === 'menu-1') {
      // 🥑 Avocado Carpaccio: Emerald fan slices + golden oil drops
      const avoMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
      for (let i = 0; i < 5; i++) {
        const sliceGeo = new THREE.BoxGeometry(0.4, 0.04, 0.15);
        const slice = new THREE.Mesh(sliceGeo, avoMat);
        slice.position.set(-0.2 + i * 0.08, 0.06, (i % 2 === 0 ? 0.05 : -0.05));
        slice.rotation.y = (i * 0.2);
        slice.castShadow = true;
        dishGroup.add(slice);
      }
      // Golden Oil Drops
      const oilMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.0, metalness: 0.9 });
      for (let j = 0; j < 6; j++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), oilMat);
        drop.position.set((Math.random() - 0.5) * 0.6, 0.08, (Math.random() - 0.5) * 0.6);
        dishGroup.add(drop);
      }
    } else if (itemId === 'menu-2') {
      // 🍣 Wild Salmon: Seared salmon fillet + green bok choy
      const salmonGeo = new THREE.BoxGeometry(0.5, 0.15, 0.3);
      const salmonMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
      const salmon = new THREE.Mesh(salmonGeo, salmonMat);
      salmon.position.y = 0.11;
      salmon.castShadow = true;
      dishGroup.add(salmon);

      // Bok Choy Leaves
      const choyMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
      for (let k = 0; k < 3; k++) {
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.03, 16), choyMat);
        leaf.position.set(-0.3 + k * 0.15, 0.06, -0.2);
        dishGroup.add(leaf);
      }
    } else if (itemId === 'menu-3') {
      // 🫖 Gingerol Decoction: Glass cup + amber liquid + lemongrass stalk
      const cupGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.4, 32, 1, true);
      const cupMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        transmission: 0.9,
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.y = 0.22;
      dishGroup.add(cup);

      // Amber Liquid
      const liquidGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.3, 32);
      const liquidMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.1 });
      const liquid = new THREE.Mesh(liquidGeo, liquidMat);
      liquid.position.y = 0.18;
      dishGroup.add(liquid);

      // Lemongrass stick
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x84cc16 }));
      stick.position.set(0.1, 0.3, 0);
      stick.rotation.z = -0.4;
      dishGroup.add(stick);
    } else {
      // 🫐 Blueberry Tonic: Ceramic bowl + indigo blueberry clusters
      const bowlGeo = new THREE.CylinderGeometry(0.45, 0.2, 0.25, 32);
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.2 });
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.15;
      dishGroup.add(bowl);

      // Blueberry Clusters
      const berryMat = new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.2 });
      for (let b = 0; b < 10; b++) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), berryMat);
        berry.position.set((Math.random() - 0.5) * 0.4, 0.24, (Math.random() - 0.5) * 0.4);
        dishGroup.add(berry);
      }
    }

    return dishGroup;
  }
}
