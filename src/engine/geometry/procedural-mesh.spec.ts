import { describe, it, expect } from 'vitest';
import {
  createAnatomicalEllipsoid,
  createProceduralCylinder,
  createFullScreenQuad,
  createOrthopedicBoneScrew,
  createOrthopedicFixationPlate,
  createBioactiveSilicaScaffold
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

  it('should generate an orthopedic bone screw with countersunk head and helical threads', () => {
    const shankR = 0.02;
    const headR = 0.04;
    const length = 0.25;
    const screw = createOrthopedicBoneScrew(shankR, headR, length, 0.03, 16, 24, 301);

    expect(screw.partId).toBe(301);
    expect(screw.vertexData.length % 8).toBe(0);
    expect(screw.indexCount).toBeGreaterThan(0);
    expect(screw.indexCount % 3).toBe(0); // Valid triangles
    expect(screw.indexData.length).toBe(screw.indexCount);

    // Top pole vertex should be at headHeight
    expect(screw.vertexData[1]).toBeCloseTo(headR * 0.75, 4);
    // Normal at top should point up (y = 1)
    expect(screw.vertexData[4]).toBe(1.0);
  });

  it('should generate an orthopedic fixation plate (DCP) with counterbored screw holes', () => {
    const plate = createOrthopedicFixationPlate(0.30, 0.06, 0.015, 4, 12, 302);

    expect(plate.partId).toBe(302);
    expect(plate.vertexData.length % 8).toBe(0);
    expect(plate.indexCount).toBeGreaterThan(0);
    expect(plate.indexCount % 3).toBe(0);
    expect(plate.indexData.length).toBe(plate.indexCount);
  });

  it('should generate an interconnected porous bioactive silica scaffold (Bioglass 45S5)', () => {
    const scaffold = createBioactiveSilicaScaffold(0.10, 0.25, 0.65, 303);

    expect(scaffold.partId).toBe(303);
    expect(scaffold.vertexData.length % 8).toBe(0);
    expect(scaffold.indexCount).toBeGreaterThan(0);
    expect(scaffold.indexCount % 3).toBe(0);
    expect(scaffold.indexData.length).toBe(scaffold.indexCount);
  });
});

