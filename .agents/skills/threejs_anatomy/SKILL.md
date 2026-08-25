---
name: threejs_anatomy
description: Generate and manage Three.js procedural skeletal models, tri-paradigm spatial lenses, and live telemetry HUDs in Angular Standalone Components.
---

# Three.js Anatomy & Tri-Paradigm Spatial Modeling

Use this skill when implementing 3D visualization, procedural skeletal models, or multi-paradigm spatial anatomy lensed viewports in the Pocket-Gull Angular application using Three.js.

## Core Rules for Three.js in Angular

1. **Standalone Components**: Always encapsulate Three.js logic within an Angular Standalone Component (`standalone: true`).
2. **WebGL Context Management**:
   - Initialize the `WebGLRenderer` in `ngAfterViewInit()` using a native element reference (`viewChild` / `ViewChild`).
   - **CRITICAL**: To prevent memory leaks, you MUST fully dispose of the scene, renderer, geometries, materials, textures, and post-processing composers in `ngOnDestroy()`. 
3. **Tri-Paradigm Spatial Lensing (`ThemeService` & `PatientStateService`)**:
   - Use Angular Signals (`computed`, `effect`) to map `ThemeService.activeParadigm()` and `PatientStateService` properties to 3D visual transformations:
     - **🩺 Western Allopathic**: Highlights anatomical organ meshes, bone structures, and dermatomes using Cyan `#00E5FF` wireframe/surface glows.
     - **🌿 Eastern TCM**: Renders 12 Jing-Luo Meridian spline curves and 3D Acupoint spheres (e.g. GV-20, ST-36) glowing with Jade Emerald `#10B981`.
     - **🧘 Ayurvedic Prana**: Renders 7 Sushumna Chakra vortex spheres and Marma point nodes in Violet `#8B5CF6` and Saffron Gold `#F59E0B`.
     - **🔮 Unified Rosetta Stone**: Cross-projects all three spatial layers simultaneously with interactive Raycasting.
4. **Dark Spatial Canvas Aesthetic**:
   - **CRITICAL**: Never hardcode pure white (`bg-white`) inside 3D viewport canvas containers. Use dark radial gradient backdrops (`bg-zinc-950/95` with cyan/emerald grid ambient shaders) to ensure seamless integration with Pocket-Gull's glassmorphic themes.
5. **Interactive Floating HUD Toolbar**:
   - Viewports MUST include floating 3D HUD controls:
     - 🔄 **360° Auto-Spin Toggle**: Toggles `controls.autoRotate = true` with a pulsing spin state indicator.
     - 🎯 **Reset Camera**: Instantly resets camera position (`(0, 1.2, 3.2)`).
     - 💡 **Hover & Select Telemetry**: Renders a dark glassmorphic tooltip with SNOMED/LOINC codes, TCM Jing-Luo organ clock, and Ayurvedic Chakra frequency.
6. **Animation Loop**:
   - Use `requestAnimationFrame` for continuous rendering or TWEEN.js for camera interpolation when focusing on specific body regions.
   - Cancel the animation frame ID in `ngOnDestroy()`.

## Component Blueprint

```typescript
import { Component, ElementRef, viewChild, AfterViewInit, OnDestroy, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { PatientStateService } from '../../services/patient-state.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-holographic-3d-anatomy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #rendererContainer class="w-full h-full min-h-[420px] bg-zinc-950/95 relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
      <!-- Dark Radial Holographic Grid Backdrop -->
      <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-zinc-950/90 to-black z-0"></div>

      <!-- Floating 3D Hologram HUD Controls -->
      <div class="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-800 text-xs font-mono">
        <button (click)="toggleAutoSpin()" 
          [class.bg-cyan-500]="isAutoSpinning()"
          [class.text-zinc-950]="isAutoSpinning()"
          class="px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1">
          <span [class.animate-spin]="isAutoSpinning()">🔄</span>
          <span>{{ isAutoSpinning() ? 'Spin ON' : '360°' }}</span>
        </button>
        <button (click)="resetCameraView()" class="px-2.5 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 font-bold hover:bg-zinc-800">
          🎯 Reset
        </button>
      </div>
    </div>
  `
})
export class Holographic3DAnatomyComponent implements AfterViewInit, OnDestroy {
  private readonly rendererContainer = viewChild<ElementRef<HTMLDivElement>>('rendererContainer');
  private readonly patientState = inject(PatientStateService);
  private readonly themeService = inject(ThemeService);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private animationId?: number;

  readonly isAutoSpinning = signal<boolean>(false);

  constructor() {
    // Paradigm Reactivity Effect
    effect(() => {
      const paradigm = this.themeService.activeParadigm();
      this.updateSpatialLensMaterials(paradigm);
    });
  }

  ngAfterViewInit() {
    this.initThreeJs();
    this.animate();
  }

  private initThreeJs() {
    const el = this.rendererContainer()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 1.2, 3.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Post-Processing Holographic UnrealBloomPass
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 0.8, 0.4, 0.85);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  private updateSpatialLensMaterials(paradigm: string) {
    // Custom material updates per Western (Cyan), TCM (Jade), Ayurveda (Saffron)
  }

  toggleAutoSpin() {
    this.isAutoSpinning.set(!this.isAutoSpinning());
    if (this.controls) this.controls.autoRotate = this.isAutoSpinning();
  }

  resetCameraView() {
    if (this.camera && this.controls) {
      this.camera.position.set(0, 1.2, 3.2);
      this.controls.target.set(0, 1.0, 0);
      this.controls.update();
    }
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.composer) this.composer.render();
  };

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.controls) this.controls.dispose();
    
    // Dispose Geometries and Materials
    this.scene.traverse((obj) => {
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
```

