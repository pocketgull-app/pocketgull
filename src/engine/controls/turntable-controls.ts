/**
 * Zero-Dependency Turntable / Arcball Camera Controls for GullRender
 * 
 * Provides smooth pointer, touch, and scroll wheel rotation/zoom with
 * inertial damping and zero garbage collection per frame.
 */

export class TurntableControls {
  azimuth = 0;
  elevation = 0.2;
  distance = 3.2;

  private targetAzimuth = 0;
  private targetElevation = 0.2;
  private targetDistance = 3.2;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  private cleanupFns: Array<() => void> = [];

  constructor(private element: HTMLElement) {
    this.attach();
  }

  private attach(): void {
    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      try {
        this.element.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.targetAzimuth -= dx * 0.008;
      this.targetElevation = Math.max(-1.45, Math.min(1.45, this.targetElevation - dy * 0.008));
    };

    const onPointerUp = (e: PointerEvent) => {
      this.isDragging = false;
      try {
        this.element.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetDistance = Math.max(1.2, Math.min(10.0, this.targetDistance + e.deltaY * 0.003));
    };

    this.element.addEventListener('pointerdown', onPointerDown);
    this.element.addEventListener('pointermove', onPointerMove);
    this.element.addEventListener('pointerup', onPointerUp);
    this.element.addEventListener('pointercancel', onPointerUp);
    this.element.addEventListener('wheel', onWheel, { passive: false });

    this.cleanupFns.push(() => {
      this.element.removeEventListener('pointerdown', onPointerDown);
      this.element.removeEventListener('pointermove', onPointerMove);
      this.element.removeEventListener('pointerup', onPointerUp);
      this.element.removeEventListener('pointercancel', onPointerUp);
      this.element.removeEventListener('wheel', onWheel);
    });
  }

  /**
   * Updates camera position using smooth lerp damping and returns [x, y, z].
   */
  updateEye(out: [number, number, number] = [0, 0, 0]): [number, number, number] {
    this.azimuth += (this.targetAzimuth - this.azimuth) * 0.15;
    this.elevation += (this.targetElevation - this.elevation) * 0.15;
    this.distance += (this.targetDistance - this.distance) * 0.15;

    const cosElev = Math.cos(this.elevation);
    out[0] = this.distance * Math.sin(this.azimuth) * cosElev;
    out[1] = this.distance * Math.sin(this.elevation);
    out[2] = this.distance * Math.cos(this.azimuth) * cosElev;
    return out;
  }

  reset(distance = 3.2, elevation = 0.2, azimuth = 0): void {
    this.targetDistance = distance;
    this.targetElevation = elevation;
    this.targetAzimuth = azimuth;
  }

  destroy(): void {
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
  }
}
