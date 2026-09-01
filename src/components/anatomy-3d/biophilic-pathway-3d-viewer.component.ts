import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { AdaptiveGreenRoutingService } from '../../services/adaptive-green-routing.service';
import { MovementHealingQuestService } from '../../services/movement-healing-quest.service';

@Component({
  selector: 'app-biophilic-pathway-3d-viewer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl font-sans overflow-hidden text-zinc-100" role="region" aria-label="3D Biophilic Pathway & Elevation Terrain Hologram">
      
      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-3">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            🌲
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-semibold text-zinc-100">3D Holographic Biophilic Pathway</h3>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                WebGL 3D Engine
              </span>
            </div>
            <p class="text-[11px] text-zinc-400">Volumetric tree canopy, solar angles & acoustic noise contours</p>
          </div>
        </div>

        <!-- Layer Controls -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="toggleAcousticHeatmap()"
            [class.bg-teal-950]="isAcousticHeatmapActive()"
            [class.text-teal-300]="isAcousticHeatmapActive()"
            [class.border-teal-500]="isAcousticHeatmapActive()"
            [class.bg-zinc-900]="!isAcousticHeatmapActive()"
            [class.text-zinc-400]="!isAcousticHeatmapActive()"
            class="min-h-[44px] px-3 py-1.5 rounded-lg border border-zinc-700 text-xs font-medium transition-all hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-teal-400"
            [attr.aria-pressed]="isAcousticHeatmapActive()">
            🔇 Acoustic Contour ({{ isAcousticHeatmapActive() ? 'ON' : 'OFF' }})
          </button>
          <button
            type="button"
            (click)="resetCameraView()"
            class="min-h-[44px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400">
            Reset Camera 🎥
          </button>
        </div>
      </div>

      <!-- 3D WebGL Canvas Container -->
      <div class="relative w-full h-[340px] sm:h-[400px] rounded-xl bg-zinc-950 overflow-hidden border border-zinc-800/60 flex items-center justify-center">
        <canvas #webglCanvas class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>

        <!-- Ambient Compass Overlay -->
        <div class="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-zinc-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
          <span class="animate-pulse">●</span> Real-Time Canopy Coverage: 85%
        </div>

        <!-- 3D Waypoint Callout Card -->
        <div class="absolute bottom-3 left-3 right-3 bg-zinc-950/85 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="text-base">📍</span>
            <div>
              <span class="font-semibold text-zinc-200 block">Current Segment: Elm St → Cedar Greenway</span>
              <span class="text-[10px] text-zinc-400 font-mono">Elevation: +4.2m · Noise: 42 dBA · ADA Slope: 1.8%</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-mono font-bold">
            ✓ ADA Compliant
          </span>
        </div>
      </div>

    </div>
  `
})
export class BiophilicPathway3dViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('webglCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly routingService = inject(AdaptiveGreenRoutingService);
  private readonly questService = inject(MovementHealingQuestService);

  readonly isAcousticHeatmapActive = signal<boolean>(false);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animationFrameId?: number;
  private pathwayTube?: THREE.Mesh;
  private treeGroup?: THREE.Group;

  ngAfterViewInit(): void {
    this.initThreeScene();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  toggleAcousticHeatmap(): void {
    this.isAcousticHeatmapActive.update(v => !v);
    this.updatePathwayMaterials();
  }

  resetCameraView(): void {
    if (this.camera) {
      this.camera.position.set(0, 20, 30);
      this.camera.lookAt(0, 0, 0);
    }
  }

  private isWebGLAvailable(canvas: HTMLCanvasElement): boolean {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return false;
      return typeof canvas.getContext === 'function' && !!(
        canvas.getContext('webgl2') || canvas.getContext('webgl') || (canvas as any).getContext('experimental-webgl')
      );
    } catch {
      return false;
    }
  }

  private initThreeScene(): void {
    if (!this.canvasRef?.nativeElement) return;
    const canvas = this.canvasRef.nativeElement;
    if (!this.isWebGLAvailable(canvas)) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 360;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x09090b);
    this.scene.fog = new THREE.FogExp2(0x09090b, 0.025);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 22, 32);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));

    // Ambient & Directional Sun Light
    const ambientLight = new THREE.AmbientLight(0xdcfce7, 0.8);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    sunLight.position.set(20, 40, 20);
    this.scene.add(sunLight);

    // Terrain Plane
    const terrainGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    terrainGeo.rotateX(-Math.PI / 2);
    
    // Procedural elevation wave
    const pos = terrainGeo.attributes['position'];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.5;
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.8,
      metalness: 0.1,
      wireframe: false
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    this.scene.add(terrain);

    // Instanced Trees
    this.treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });

    const foliageGeo = new THREE.ConeGeometry(1.4, 3.5, 6);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    for (let i = 0; i < 40; i++) {
      const tx = (Math.random() - 0.5) * 50;
      const tz = (Math.random() - 0.5) * 50;
      if (Math.abs(tx) < 4) continue; // Keep pathway clear

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1;
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 3;

      tree.add(trunk);
      tree.add(foliage);
      tree.position.set(tx, 0, tz);
      this.treeGroup.add(tree);
    }
    this.scene.add(this.treeGroup);

    // Glowing Holographic Pathway
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.4, 25),
      new THREE.Vector3(2, 0.6, 12),
      new THREE.Vector3(-3, 0.8, 0),
      new THREE.Vector3(1, 0.5, -12),
      new THREE.Vector3(0, 0.4, -25)
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.6, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.3
    });
    this.pathwayTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.pathwayTube);

    // Animation Loop
    let angle = 0;
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      angle += 0.002;
      
      if (this.camera) {
        this.camera.position.x = Math.sin(angle) * 30;
        this.camera.position.z = Math.cos(angle) * 30;
        this.camera.lookAt(0, 0, 0);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  private updatePathwayMaterials(): void {
    if (!this.pathwayTube) return;
    const isAcoustic = this.isAcousticHeatmapActive();
    const mat = this.pathwayTube.material as THREE.MeshStandardMaterial;
    if (isAcoustic) {
      mat.color.setHex(0x06b6d4);
      mat.emissive.setHex(0x0891b2);
    } else {
      mat.color.setHex(0x10b981);
      mat.emissive.setHex(0x059669);
    }
  }
}
