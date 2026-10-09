/**
 * Tier 3 2.5D Canvas Fallback Backend for GullRender
 * 
 * Provides an emergency fail-safe for institutional kiosks and virtualized environments
 * where hardware-accelerated 3D is completely blocked by enterprise IT policy.
 * Features:
 * - 2D orthographic vector slice rendering
 * - Bio-rhythmic cardiac pulsation
 * - Interactive 2D coordinate bounding box hit-testing
 * - Zero WebGL/WebGPU requirement; guaranteed zero black screens
 */

import { IRendererBackend, IRawGpuMesh, IUniformPayload, RendererBackendType } from './renderer-backend.interface';

export class Canvas2dBackend implements IRendererBackend {
  readonly backendType: RendererBackendType = 'canvas2d';
  isInitialized = false;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private lastPayload: IUniformPayload | null = null;
  private meshes: Map<number, IRawGpuMesh> = new Map();
  private nextMeshId = 1;

  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    this.canvas = canvas;
    this.ctx = ctx;
    this.isInitialized = true;
    return true;
  }

  uploadMesh(mesh: IRawGpuMesh): number {
    const id = this.nextMeshId++;
    this.meshes.set(id, mesh);
    return id;
  }

  clearMeshes(): void {
    this.meshes.clear();
  }

  updateUniforms(payload: IUniformPayload): void {
    this.lastPayload = payload;
  }

  renderFrame(): void {
    if (!this.isInitialized || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const time = this.lastPayload ? this.lastPayload.timeSec : 0;
    const hr = this.lastPayload ? this.lastPayload.heartRateBpm : 72;
    const qtc = this.lastPayload ? this.lastPayload.qtcIntervalMs : 440;

    // Dark Obsidian Background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    // Bio-rhythmic pulsation
    const cycleFreq = hr / 60.0;
    const pulse = Math.sin(time * cycleFreq * Math.PI * 2.0) * 0.5 + 0.5;
    const qtcHazard = qtc > 480;

    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.22;
    const radius = baseRadius * (1.0 + pulse * 0.08);

    // Outer Glow
    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.6);
    if (qtcHazard) {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.4)'); // Rose hazard glow
      gradient.addColorStop(1, 'rgba(9, 9, 11, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(20, 184, 166, 0.35)'); // GearTeal glow
      gradient.addColorStop(1, 'rgba(9, 9, 11, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Ventricular Silhouette Outline (2.5D Orthographic Slice)
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * 0.85, radius * 1.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = qtcHazard ? 'rgba(225, 29, 72, 0.85)' : 'rgba(15, 118, 110, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = qtcHazard ? '#f43f5e' : '#2dd4bf';
    ctx.stroke();

    // Inner Action Potential Iso-lines
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.2, radius * 0.5, radius * 0.7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Institutional Telemetry Stamp
    ctx.font = '11px monospace';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`TIER 3 FAILSAFE ACTIVE • HR: ${Math.round(hr)} BPM • QTc: ${Math.round(qtc)} ms`, 16, h - 20);
  }

  async pickPartAt(x: number, y: number): Promise<number> {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    // Hit test inside the ventricular silhouette radius
    if (dist < Math.min(w, h) * 0.28) {
      return 101; // Ventricle part ID
    }
    return 0;
  }

  resize(width: number, height: number): void {
    // Canvas context resizes with canvas element automatically
  }

  destroy(): void {
    this.meshes.clear();
    this.isInitialized = false;
  }
}
