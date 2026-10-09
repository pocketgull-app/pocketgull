/**
 * Procedural Anatomical Mesh Generators for GullRender
 * 
 * Generates direct interleaved Float32Array buffers [px, py, pz, nx, ny, nz, u, v]
 * and Uint16Array index buffers for immediate GPU upload with zero scene-graph overhead.
 */

import { IRawGpuMesh } from '../core/renderer-backend.interface';

/**
 * Generates an anatomical ellipsoid / ventricle geometry with apex tapering.
 */
export function createAnatomicalEllipsoid(
  rx: number,
  ry: number,
  rz: number,
  latBands = 32,
  lonBands = 32,
  apexTaper = 0.35,
  partId = 1
): IRawGpuMesh {
  const vertexCount = (latBands + 1) * (lonBands + 1);
  const vertexData = new Float32Array(vertexCount * 8);
  const indexData = new Uint16Array(latBands * lonBands * 6);

  let vOffset = 0;
  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2.0 * Math.PI) / lonBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const nx = cosPhi * sinTheta;
      const ny = cosTheta;
      const nz = sinPhi * sinTheta;

      // Apply tapering towards ventricular apex at y < 0
      const taper = ny < 0 ? 1.0 - Math.abs(ny) * apexTaper : 1.0;
      const px = nx * rx * taper;
      const py = ny * ry;
      const pz = nz * rz * taper;

      const u = 1.0 - lon / lonBands;
      const v = 1.0 - lat / latBands;

      vertexData[vOffset++] = px;
      vertexData[vOffset++] = py;
      vertexData[vOffset++] = pz;
      vertexData[vOffset++] = nx;
      vertexData[vOffset++] = ny;
      vertexData[vOffset++] = nz;
      vertexData[vOffset++] = u;
      vertexData[vOffset++] = v;
    }
  }

  let iOffset = 0;
  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * (lonBands + 1) + lon;
      const second = first + lonBands + 1;

      indexData[iOffset++] = first;
      indexData[iOffset++] = second;
      indexData[iOffset++] = first + 1;

      indexData[iOffset++] = second;
      indexData[iOffset++] = second + 1;
      indexData[iOffset++] = first + 1;
    }
  }

  return {
    vertexData,
    indexData,
    indexCount: indexData.length,
    partId
  };
}

/**
 * Generates a procedural cylinder/capsule for long bones, limbs, or vessels.
 */
export function createProceduralCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments = 24,
  heightSegments = 1,
  partId = 2
): IRawGpuMesh {
  const vertexCount = (radialSegments + 1) * (heightSegments + 1);
  const vertexData = new Float32Array(vertexCount * 8);
  const indexData = new Uint16Array(radialSegments * heightSegments * 6);

  let vOffset = 0;
  const halfHeight = height / 2.0;

  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const radius = v * (radiusBottom - radiusTop) + radiusTop;
    const py = (1.0 - v) * height - halfHeight;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const theta = u * 2.0 * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      const px = radius * sinTheta;
      const pz = radius * cosTheta;

      vertexData[vOffset++] = px;
      vertexData[vOffset++] = py;
      vertexData[vOffset++] = pz;
      vertexData[vOffset++] = sinTheta;
      vertexData[vOffset++] = 0.0;
      vertexData[vOffset++] = cosTheta;
      vertexData[vOffset++] = u;
      vertexData[vOffset++] = v;
    }
  }

  let iOffset = 0;
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = (y + 1) * (radialSegments + 1) + x;

      indexData[iOffset++] = a;
      indexData[iOffset++] = b;
      indexData[iOffset++] = a + 1;

      indexData[iOffset++] = b;
      indexData[iOffset++] = b + 1;
      indexData[iOffset++] = a + 1;
    }
  }

  return {
    vertexData,
    indexData,
    indexCount: indexData.length,
    partId
  };
}

/**
 * Full-screen quad for analytical SDF / raymarching shaders.
 */
export function createFullScreenQuad(partId = 0): IRawGpuMesh {
  // 4 vertices, 8 floats each: [px, py, pz, nx, ny, nz, u, v]
  const vertexData = new Float32Array([
    -1.0, -1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 0.0,
     1.0, -1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0,
     1.0,  1.0, 0.0,  0.0, 0.0, 1.0,  1.0, 1.0,
    -1.0,  1.0, 0.0,  0.0, 0.0, 1.0,  0.0, 1.0,
  ]);

  const indexData = new Uint16Array([
    0, 1, 2,
    0, 2, 3
  ]);

  return {
    vertexData,
    indexData,
    indexCount: 6,
    partId
  };
}
