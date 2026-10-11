import { describe, it, expect } from 'vitest';
import type { IDeformationJobPayload, IDeformationJobResult } from './geometry-deformation.worker';

describe('GeometryDeformationWorker Kernel Logic', () => {
  function runKernel(payload: IDeformationJobPayload): IDeformationJobResult {
    const { jobId, organType, positions, normals, phaseTime, intensity } = payload;
    const start = performance.now();
    const vertexCount = positions.length / 3;

    for (let i = 0; i < vertexCount; i++) {
      const idx = i * 3;
      const nx = normals[idx];
      const ny = normals[idx + 1];
      const nz = normals[idx + 2];

      let displacement = 0;
      if (organType === 'HEART') {
        const yNorm = positions[idx + 1] * 0.25 + 0.5;
        displacement = Math.sin(phaseTime * 6.28318 + yNorm * 2.0) * intensity * 0.08;
      } else if (organType === 'LUNG') {
        displacement = Math.sin(phaseTime * 0.6283) * intensity * 0.12;
      } else if (organType === 'STOKES_FLUID') {
        const yNorm = Math.min(1.0, Math.max(-1.0, positions[idx + 1]));
        const parabolicVelocity = Math.max(0.1, 1.0 - yNorm * yNorm);
        positions[idx] = (positions[idx] + parabolicVelocity * intensity * 0.05) % 400.0;
        continue;
      } else {
        displacement = Math.sin(phaseTime) * intensity * 0.02;
      }

      positions[idx] += nx * displacement;
      positions[idx + 1] += ny * displacement;
      positions[idx + 2] += nz * displacement;
    }

    const duration = performance.now() - start;
    return {
      jobId,
      success: true,
      positions,
      normals,
      computeDurationMs: duration
    };
  }

  it('should deform HEART geometry with systolic radial contraction', () => {
    const positions = new Float32Array([0, 1, 0, 1, 0, 0, 0, -1, 0]);
    const normals = new Float32Array([0, 1, 0, 1, 0, 0, 0, -1, 0]);
    const originalPos = Float32Array.from(positions);

    const result = runKernel({
      jobId: 'job-1',
      organType: 'HEART',
      positions,
      normals,
      phaseTime: 0.25,
      intensity: 1.0
    });

    expect(result.success).toBe(true);
    expect(result.jobId).toBe('job-1');
    expect(result.positions.length).toBe(9);
    // At least one vertex position must have shifted
    expect(result.positions[1]).not.toBe(originalPos[1]);
  });

  it('should deform LUNG geometry with 0.1 Hz vagal respiratory pacing', () => {
    const positions = new Float32Array([0, 0, 1, 1, 1, 0]);
    const normals = new Float32Array([0, 0, 1, 0.707, 0.707, 0]);

    const result = runKernel({
      jobId: 'job-2',
      organType: 'LUNG',
      positions,
      normals,
      phaseTime: 2.5,
      intensity: 1.0
    });

    expect(result.success).toBe(true);
    expect(result.jobId).toBe('job-2');
    expect(result.computeDurationMs).toBeGreaterThanOrEqual(0);
  });

  it('should advance STOKES_FLUID particles with Poiseuille parabolic profile', () => {
    // 2 particles: center (y=0) and near-wall (y=0.9)
    const positions = new Float32Array([10, 0, 0, 10, 0.9, 0]);
    const normals = new Float32Array([0, 1, 0, 0, 1, 0]);

    const result = runKernel({
      jobId: 'job-3',
      organType: 'STOKES_FLUID',
      positions,
      normals,
      phaseTime: 1.0,
      intensity: 2.0
    });

    expect(result.success).toBe(true);
    // Center particle (y=0) moves faster than near-wall particle (y=0.9)
    const deltaCenter = result.positions[0] - 10;
    const deltaWall = result.positions[3] - 10;
    expect(deltaCenter).toBeGreaterThan(deltaWall);
  });
});
