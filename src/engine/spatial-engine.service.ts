/**
 * Spatial Engine Service for GullRender
 * 
 * Orchestrates multi-tier rendering backend instantiation (WebGPU -> WebGL2 -> Canvas2D),
 * uniform buffer updates, and Angular Signal bindings for real-time clinical telemetry.
 */

import { Injectable, signal, NgZone, inject } from '@angular/core';
import { IRendererBackend, IRawGpuMesh, IUniformPayload, RendererBackendType } from './core/renderer-backend.interface';
import { WebGpuBackend } from './core/webgpu-backend';
import { WebGl2Backend } from './core/webgl2-backend';
import { Canvas2dBackend } from './core/canvas2d-backend';

@Injectable({
  providedIn: 'root'
})
export class SpatialEngineService {
  private ngZone = inject(NgZone);

  private backend: IRendererBackend | null = null;
  private animFrameId: number | null = null;
  private isLoopRunning = false;

  readonly activeBackend = signal<RendererBackendType | null>(null);
  readonly isInitialized = signal<boolean>(false);
  readonly frameCount = signal<number>(0);

  /**
   * Initializes the graphics engine using the 3-Tier Graceful Degradation Strategy:
   * Tier 1: WebGPU (Modern Chromium, Safari 18, Edge)
   * Tier 2: WebGL 2.0 (Citrix thin-clients, older iPads, Firefox)
   * Tier 3: 2.5D Canvas (Strict institutional kiosks with GPU disabled)
   */
  async initialize(canvas: HTMLCanvasElement): Promise<RendererBackendType> {
    this.destroy();

    // 1. Try Tier 1: WebGPU
    const webgpu = new WebGpuBackend();
    if (await webgpu.init(canvas)) {
      this.backend = webgpu;
      this.activeBackend.set('webgpu');
      this.isInitialized.set(true);
      return 'webgpu';
    }

    // 2. Try Tier 2: WebGL 2.0 Fallback
    const webgl2 = new WebGl2Backend();
    if (await webgl2.init(canvas)) {
      this.backend = webgl2;
      this.activeBackend.set('webgl2');
      this.isInitialized.set(true);
      return 'webgl2';
    }

    // 3. Fall back to Tier 3: 2.5D Canvas Fail-safe
    const canvas2d = new Canvas2dBackend();
    await canvas2d.init(canvas);
    this.backend = canvas2d;
    this.activeBackend.set('canvas2d');
    this.isInitialized.set(true);
    return 'canvas2d';
  }

  uploadMesh(mesh: IRawGpuMesh): number {
    if (!this.backend) return 0;
    return this.backend.uploadMesh(mesh);
  }

  clearMeshes(): void {
    if (!this.backend) return;
    this.backend.clearMeshes();
  }

  updateUniforms(payload: IUniformPayload): void {
    if (!this.backend) return;
    this.backend.updateUniforms(payload);
  }

  renderFrame(): void {
    if (!this.backend) return;
    this.backend.renderFrame();
    this.frameCount.update(c => c + 1);
  }

  async pickPartAt(x: number, y: number): Promise<number> {
    if (!this.backend) return 0;
    return await this.backend.pickPartAt(x, y);
  }

  resize(width: number, height: number): void {
    if (this.backend) {
      this.backend.resize(width, height);
    }
  }

  destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.isLoopRunning = false;
    if (this.backend) {
      this.backend.destroy();
      this.backend = null;
    }
    this.activeBackend.set(null);
    this.isInitialized.set(false);
  }
}
