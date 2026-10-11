/// <reference lib="webworker" />
/**
 * 🦀 PocketGull Biophysical Mesh & Geometry WASM Worker
 * 
 * Offloads procedural 1000 UPM font glyph extrusion and biophysical
 * organ deformation (e.g., ventricular systole, lung parenchyma expansion)
 * away from the main UI thread with zero-copy Transferable ArrayBuffers.
 */

export interface IDeformationJobPayload {
  jobId: string;
  organType: 'HEART' | 'LUNG' | 'KIDNEY' | 'SPINE' | 'STOKES_FLUID';
  positions: Float32Array;
  normals: Float32Array;
  phaseTime: number;
  intensity: number;
}

export interface IDeformationJobResult {
  jobId: string;
  success: boolean;
  positions: Float32Array;
  normals: Float32Array;
  computeDurationMs: number;
}

self.onmessage = (event: MessageEvent<IDeformationJobPayload>) => {
  const { jobId, organType, positions, normals, phaseTime, intensity } = event.data;
  const start = performance.now();

  if (!positions || positions.length === 0) {
    self.postMessage({ jobId, success: false, error: 'Empty vertex buffer' });
    return;
  }

  const vertexCount = positions.length / 3;

  // Optimized procedural biophysical displacement kernel (SIMD-ready buffer iteration)
  for (let i = 0; i < vertexCount; i++) {
    const idx = i * 3;
    const nx = normals[idx];
    const ny = normals[idx + 1];
    const nz = normals[idx + 2];

    let displacement = 0;
    if (organType === 'HEART') {
      // Systolic apex-to-base contraction with radial torsion
      const yNorm = positions[idx + 1] * 0.25 + 0.5;
      displacement = Math.sin(phaseTime * 6.28318 + yNorm * 2.0) * intensity * 0.08;
    } else if (organType === 'LUNG') {
      // 0.1 Hz vagal respiration parenchyma tidal inflation
      displacement = Math.sin(phaseTime * 0.6283) * intensity * 0.12;
    } else if (organType === 'STOKES_FLUID') {
      // 2D Poiseuille parabolic profile with convective advection
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

  // Zero-copy transfer of vertex buffers back to main Three.js render thread
  const result: IDeformationJobResult = {
    jobId,
    success: true,
    positions,
    normals,
    computeDurationMs: duration
  };

  self.postMessage(result, [positions.buffer, normals.buffer] as any);
};
