import { describe, it, expect } from 'vitest';
import { CymaticsRenderer } from '../src/cymatics-renderer';

describe('CymaticsRenderer Mathematical Functions', () => {
  // Mock canvas for headless test environment
  function createMockCanvas(w = 600, h = 400): HTMLCanvasElement {
    return {
      width: w,
      height: h,
      getContext: () => ({
        fillStyle: '',
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        moveTo: () => {},
        lineTo: () => {},
        quadraticCurveTo: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        fillText: () => {}
      })
    } as unknown as HTMLCanvasElement;
  }

  it('calculates Chladni plate vibration equations correctly', () => {
    const canvas = createMockCanvas();
    const renderer = new CymaticsRenderer(canvas);

    // At (u=0, v=0), sin(0) = 0, so vibration must be exactly 0 (center nodal point)
    const centerVib = renderer.calculateChladniVibration(0, 0, 4, 3);
    expect(centerVib).toBeCloseTo(0, 5);

    // At symmetric values u=v with n=m, term1 = term2, so difference is 0
    const symVib = renderer.calculateChladniVibration(0.5, 0.5, 3, 3);
    expect(symVib).toBeCloseTo(0, 5);
  });

  it('computes 0.1 Hz Rachel Nabors parasympathetic breathing cycle accurately', () => {
    const canvas = createMockCanvas();
    const renderer = new CymaticsRenderer(canvas);

    const initialBreath = renderer.getBreathingState();
    expect(initialBreath.totalCycleSeconds).toBe(10.0);
    expect(initialBreath.phase).toBe('inhale');
    expect(initialBreath.instructions).toContain('Inhale');
  });

  it('allows switching visualizer modes and nodal integers', () => {
    const canvas = createMockCanvas();
    const renderer = new CymaticsRenderer(canvas);

    renderer.setMode('sacred_mandala');
    renderer.setPlateNodalModes(6, 5);

    // Verify method execution completes without throwing
    expect(() => renderer.renderFrame()).not.toThrow();
  });
});
