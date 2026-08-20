import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { WacomCryptoInkService, IWacomInkPoint } from './wacom-crypto-ink.service';

describe('WacomCryptoInkService Suite', () => {
  let service: WacomCryptoInkService;

  beforeEach(() => {
    service = new WacomCryptoInkService();
  });

  it('1. Initializes cleanly with default telemetry signals', () => {
    expect(service.activeDigitizer()).toBe('mouse');
    expect(service.currentPressure()).toBe(0);
    expect(service.currentTilt()).toEqual({ x: 0, y: 0 });
    expect(service.strokeHistory().length).toBe(0);
    expect(service.hasStylusHardware()).toBe(false);
  });

  it('2. Extracts ink points conforming to WILL 3.0 from stylus PointerEvents', () => {
    const mockPointerEvent = {
      clientX: 120,
      clientY: 180,
      pressure: 0.74,
      tiltX: 18,
      tiltY: -12,
      twist: 45,
      pointerType: 'pen',
      timeStamp: 1000
    } as unknown as PointerEvent;

    const mockRect = { left: 20, top: 30 } as DOMRect;
    const point = service.extractInkPoint(mockPointerEvent, mockRect);

    expect(point.x).toBe(100);
    expect(point.y).toBe(150);
    expect(point.pressure).toBe(0.74);
    expect(point.tiltX).toBe(18);
    expect(point.tiltY).toBe(-12);
    expect(point.twist).toBe(45);
    expect(service.activeDigitizer()).toBe('wacom-pen');
    expect(service.hasStylusHardware()).toBe(true);
    expect(service.currentPressure()).toBe(0.74);
  });

  it('3. Finalizes stroke and computes kinematics bounding box and mean pressure', () => {
    const points: IWacomInkPoint[] = [
      { x: 10, y: 20, pressure: 0.4, tiltX: 0, tiltY: 0, timestamp: 100, pointerType: 'pen' },
      { x: 50, y: 80, pressure: 0.8, tiltX: 10, tiltY: -5, timestamp: 150, pointerType: 'pen' },
      { x: 100, y: 120, pressure: 0.6, tiltX: 15, tiltY: -10, timestamp: 200, pointerType: 'pen' }
    ];

    const stroke = service.finalizeStroke(points);
    expect(stroke).not.toBeNull();
    expect(stroke?.points.length).toBe(3);
    expect(stroke?.boundingBox).toEqual({ minX: 10, minY: 20, maxX: 100, maxY: 120 });
    expect(stroke?.durationMs).toBe(100);
    expect(stroke?.meanPressure).toBe(0.6);
    expect(service.strokeHistory().length).toBe(1);
  });

  it('4. Generates Zero-Knowledge Kinetic Proof (ZKP) with IEEE-754 mantissa entropy harvesting', async () => {
    const points: IWacomInkPoint[] = [
      { x: 10, y: 20, pressure: 0.5, tiltX: 5, tiltY: -2, timestamp: 100, pointerType: 'pen' },
      { x: 20, y: 30, pressure: 0.7, tiltX: 8, tiltY: -4, timestamp: 120, pointerType: 'pen' }
    ];
    const stroke = service.finalizeStroke(points)!;

    const proof = await service.generateKineticEntropyProof([stroke], 'dr.smith@pocketgull.app');
    expect(proof.proofId).toContain('PROOF-WILL3-');
    expect(proof.userIdentifier).toBe('dr.smith@pocketgull.app');
    expect(proof.totalPoints).toBe(2);
    expect(proof.zkpKineticHash).toBeDefined();
    expect(proof.zkpKineticHash.length).toBe(64);
    expect(proof.deaEpcsCompliant).toBe(true);
    expect(proof.fdaPart11Compliant).toBe(true);
  });

  it('5. Exports stroke history to Wacom Universal Ink Model (UIM JSON)', () => {
    const points: IWacomInkPoint[] = [
      { x: 15, y: 25, pressure: 0.65, tiltX: 12, tiltY: -6, timestamp: 300, pointerType: 'pen' }
    ];
    const stroke = service.finalizeStroke(points)!;

    const uim = service.exportToUniversalInkModel([stroke]);
    expect(uim['version']).toBe('3.0.0');
    expect(uim['dataFormat']).toBe('WILL-UIM-JSON');
    expect((uim['inkModel'] as any).strokes.length).toBe(1);
    expect((uim['inkModel'] as any).strokes[0].sensorData.pressure[0]).toBe(0.65);
  });

  it('6. Resets telemetry state cleanly', () => {
    const points: IWacomInkPoint[] = [
      { x: 15, y: 25, pressure: 0.65, tiltX: 12, tiltY: -6, timestamp: 300, pointerType: 'pen' }
    ];
    service.finalizeStroke(points);
    expect(service.strokeHistory().length).toBe(1);

    service.reset();
    expect(service.strokeHistory().length).toBe(0);
    expect(service.currentPressure()).toBe(0);
    expect(service.currentTilt()).toEqual({ x: 0, y: 0 });
    expect(service.isStylusActive()).toBe(false);
  });

  it('7. Computes motor dexterity metrics, dynamic range, and playful agility title', () => {
    const points: IWacomInkPoint[] = [
      { x: 10, y: 10, pressure: 0.2, tiltX: 0, tiltY: 0, timestamp: 100, pointerType: 'pen' },
      { x: 40, y: 30, pressure: 0.8, tiltX: 10, tiltY: 5, timestamp: 140, pointerType: 'pen' },
      { x: 80, y: 60, pressure: 0.5, tiltX: 15, tiltY: 10, timestamp: 180, pointerType: 'pen' },
      { x: 120, y: 100, pressure: 0.9, tiltX: 12, tiltY: 8, timestamp: 220, pointerType: 'pen' }
    ];
    const stroke = service.finalizeStroke(points)!;
    const metrics = service.calculateDexterity(stroke);

    expect(metrics.score).toBeGreaterThanOrEqual(50);
    expect(metrics.dynamicRange).toBeGreaterThan(0);
    expect(metrics.smoothness).toBeGreaterThan(0);
    expect(metrics.rankTitle).toBeDefined();
    expect(['S+', 'A', 'B', 'C']).toContain(metrics.rankGrade);
  });

  it('8. Supports switching active brush modes (Sumi, Rainbow, Sparkle Sand, Ocean Wave)', () => {
    expect(service.activeBrushMode()).toBe('sumi-calligraphy');
    service.activeBrushMode.set('prismatic-rainbow');
    expect(service.activeBrushMode()).toBe('prismatic-rainbow');
    service.activeBrushMode.set('sparkle-sand');
    expect(service.activeBrushMode()).toBe('sparkle-sand');
    service.activeBrushMode.set('ocean-wave');
    expect(service.activeBrushMode()).toBe('ocean-wave');
  });
});
