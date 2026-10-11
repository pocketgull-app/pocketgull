import { describe, it, expect } from 'vitest';
import { Mat4Math } from './mat4';

describe('Mat4Math (Zero-Allocation Linear Algebra)', () => {
  it('should initialize a 4x4 identity matrix', () => {
    const m = Mat4Math.create();
    expect(m.length).toBe(16);
    expect(m[0]).toBe(1);
    expect(m[5]).toBe(1);
    expect(m[10]).toBe(1);
    expect(m[15]).toBe(1);
    expect(m[1]).toBe(0);
    expect(m[4]).toBe(0);
  });

  it('should reset an existing matrix to identity', () => {
    const m = Mat4Math.create();
    m[0] = 5;
    m[3] = 9;
    Mat4Math.identity(m);
    expect(m[0]).toBe(1);
    expect(m[3]).toBe(0);
    expect(m[15]).toBe(1);
  });

  it('should multiply an identity matrix with another matrix without alteration', () => {
    const a = Mat4Math.create();
    const b = Mat4Math.create();
    b[0] = 2; b[5] = 3; b[10] = 4;
    const out = Mat4Math.create();

    Mat4Math.multiply(out, a, b);
    expect(out[0]).toBe(2);
    expect(out[5]).toBe(3);
    expect(out[10]).toBe(4);
    expect(out[15]).toBe(1);
  });

  it('should generate a valid WebGPU perspective matrix with depth [0, 1]', () => {
    const p = Mat4Math.create();
    const fov = (45.0 * Math.PI) / 180.0;
    const aspect = 16.0 / 9.0;
    const near = 0.1;
    const far = 100.0;

    Mat4Math.perspective(p, fov, aspect, near, far);

    // Diagonal elements should be non-zero
    expect(p[0]).toBeGreaterThan(0);
    expect(p[5]).toBeGreaterThan(0);
    expect(p[11]).toBe(-1.0);
    expect(p[10]).toBeCloseTo(far / (near - far), 4);
    expect(p[14]).toBeCloseTo((near * far) / (near - far), 4);
  });

  it('should generate a valid lookAt view matrix looking down negative Z', () => {
    const v = Mat4Math.create();
    Mat4Math.lookAt(v, [0, 0, 5], [0, 0, 0], [0, 1, 0]);

    // Looking from (0,0,5) to (0,0,0) with up (0,1,0) should position camera at z = -5
    expect(v[0]).toBeCloseTo(1, 4);
    expect(v[5]).toBeCloseTo(1, 4);
    expect(v[10]).toBeCloseTo(1, 4);
    expect(v[14]).toBeCloseTo(-5, 4);
    expect(v[15]).toBeCloseTo(1, 4);
  });

  it('should rotate around the Y axis by 90 degrees', () => {
    const m = Mat4Math.create();
    const out = Mat4Math.create();
    Mat4Math.rotateY(out, m, Math.PI / 2.0);

    expect(out[0]).toBeCloseTo(0, 4);
    expect(out[2]).toBeCloseTo(-1, 4);
    expect(out[8]).toBeCloseTo(1, 4);
    expect(out[10]).toBeCloseTo(0, 4);
  });
});
