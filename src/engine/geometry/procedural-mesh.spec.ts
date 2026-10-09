import { describe, it, expect } from 'vitest';
import {
  createAnatomicalEllipsoid,
  createProceduralCylinder,
  createFullScreenQuad
} from './procedural-mesh';

describe('Procedural Anatomical Geometry Generators', () => {
  it('should generate an anatomical ellipsoid with valid vertex stride and index count', () => {
    const latBands = 16;
    const lonBands = 16;
    const partId = 101;
    const mesh = createAnatomicalEllipsoid(1.0, 1.5, 1.0, latBands, lonBands, 0.35, partId);

    const expectedVertexCount = (latBands + 1) * (lonBands + 1);
    expect(mesh.vertexData.length).toBe(expectedVertexCount * 8); // 8 floats per vertex

    const expectedIndexCount = latBands * lonBands * 6;
    expect(mesh.indexData.length).toBe(expectedIndexCount);
    expect(mesh.indexCount).toBe(expectedIndexCount);
    expect(mesh.partId).toBe(101);

    // Verify normals are normalized
    for (let i = 0; i < expectedVertexCount; i += 10) {
      const nx = mesh.vertexData[i * 8 + 3];
      const ny = mesh.vertexData[i * 8 + 4];
      const nz = mesh.vertexData[i * 8 + 5];
      const normLen = Math.hypot(nx, ny, nz);
      expect(normLen).toBeCloseTo(1.0, 2);
    }

    // Verify UV coordinates are within [0, 1]
    for (let i = 0; i < expectedVertexCount; i += 10) {
      const u = mesh.vertexData[i * 8 + 6];
      const v = mesh.vertexData[i * 8 + 7];
      expect(u).toBeGreaterThanOrEqual(0.0);
      expect(u).toBeLessThanOrEqual(1.0);
      expect(v).toBeGreaterThanOrEqual(0.0);
      expect(v).toBeLessThanOrEqual(1.0);
    }
  });

  it('should generate a procedural cylinder with valid heights and normals', () => {
    const segments = 12;
    const mesh = createProceduralCylinder(0.5, 0.5, 2.0, segments, 1, 42);

    expect(mesh.vertexData.length).toBe((segments + 1) * 2 * 8);
    expect(mesh.indexCount).toBe(segments * 6);
    expect(mesh.partId).toBe(42);
  });

  it('should generate a full-screen quad with exactly 4 vertices and 6 indices', () => {
    const quad = createFullScreenQuad(99);

    expect(quad.vertexData.length).toBe(4 * 8); // 4 vertices * 8 floats
    expect(quad.indexCount).toBe(6); // 2 triangles = 6 indices
    expect(quad.partId).toBe(99);

    // Check corners
    expect(quad.vertexData[0]).toBe(-1.0); // x0
    expect(quad.vertexData[1]).toBe(-1.0); // y0
    expect(quad.vertexData[16]).toBe(1.0); // x2
    expect(quad.vertexData[17]).toBe(1.0); // y2
  });
});
