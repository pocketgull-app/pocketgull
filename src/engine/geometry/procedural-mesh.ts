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

/**
 * Generates an orthopedic surgical cortical bone screw with countersunk drive head,
 * threaded shank with helical ridges, and tapered self-tapping apical tip.
 */
export function createOrthopedicBoneScrew(
  shankRadius: number,
  headRadius: number,
  length: number,
  pitch = shankRadius * 1.25,
  radialSegments = 16,
  heightSegments = 32,
  partId = 301
): IRawGpuMesh {
  const headHeight = headRadius * 0.75;
  const tipLength = shankRadius * 2.0;
  const shankLength = Math.max(0.001, length - tipLength);

  // Height slices:
  // 0: top flat center of head
  // 1..4: head cap and countersink bevel down to y = 0
  // 5..(heightSegments - 4): threaded shank with helical thread crests
  // (heightSegments - 3)..heightSegments: self-tapping tapered apex
  const totalRings = heightSegments + 1;
  const vertexCount = (radialSegments + 1) * totalRings + 2; // +2 for top and bottom apex poles
  const vertexData = new Float32Array(vertexCount * 8);
  const indexData = new Uint16Array(radialSegments * (totalRings - 1) * 6 + radialSegments * 6);

  let vOffset = 0;
  const topPoleIndex = 0;
  // Top pole: center of screw drive head
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = headHeight;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = 1.0;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = 0.5;
  vertexData[vOffset++] = 0.5;

  for (let ring = 0; ring < totalRings; ring++) {
    const v = ring / (totalRings - 1);
    let py = 0;
    let radius = shankRadius;

    if (v < 0.2) {
      // Countersunk head: from y = headHeight down to y = 0
      const headFrac = v / 0.2; // 0 to 1
      py = headHeight * (1.0 - headFrac);
      radius = headRadius * (1.0 - headFrac * 0.4) + shankRadius * (headFrac * 0.4);
    } else if (v < 0.85) {
      // Threaded shank with helical ridges
      const shankFrac = (v - 0.2) / 0.65; // 0 to 1
      py = -shankFrac * shankLength;
      radius = shankRadius;
    } else {
      // Tapered self-tapping tip
      const tipFrac = (v - 0.85) / 0.15; // 0 to 1
      py = -shankLength - tipFrac * tipLength;
      radius = shankRadius * (1.0 - tipFrac * 0.88);
    }

    for (let seg = 0; seg <= radialSegments; seg++) {
      const u = seg / radialSegments;
      const theta = u * 2.0 * Math.PI;

      // Helical thread modulation on shank
      let currentRadius = radius;
      if (v >= 0.2 && v < 0.85) {
        const helicalPhase = (-py / pitch) * 2.0 * Math.PI + theta;
        const threadFlute = Math.sin(helicalPhase);
        currentRadius = shankRadius * (0.86 + 0.14 * Math.max(-0.5, threadFlute));
      }

      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const px = currentRadius * cosTheta;
      const pz = currentRadius * sinTheta;

      // Normal vector approximation
      let nx = cosTheta;
      let ny = 0.0;
      let nz = sinTheta;
      if (v < 0.2) {
        ny = 0.35;
      } else if (v >= 0.85) {
        ny = -0.5;
      }
      const normLen = Math.hypot(nx, ny, nz) || 1.0;

      vertexData[vOffset++] = px;
      vertexData[vOffset++] = py;
      vertexData[vOffset++] = pz;
      vertexData[vOffset++] = nx / normLen;
      vertexData[vOffset++] = ny / normLen;
      vertexData[vOffset++] = nz / normLen;
      vertexData[vOffset++] = u;
      vertexData[vOffset++] = v;
    }
  }

  // Bottom pole: apex tip of the self-tapping screw
  const bottomPoleIndex = 1 + (radialSegments + 1) * totalRings;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = -length;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = -1.0;
  vertexData[vOffset++] = 0.0;
  vertexData[vOffset++] = 0.5;
  vertexData[vOffset++] = 1.0;

  // Generate Triangles
  let iOffset = 0;
  // Top fan
  const firstRingStart = 1;
  for (let seg = 0; seg < radialSegments; seg++) {
    indexData[iOffset++] = topPoleIndex;
    indexData[iOffset++] = firstRingStart + seg;
    indexData[iOffset++] = firstRingStart + seg + 1;
  }

  // Body quads between rings
  for (let ring = 0; ring < totalRings - 1; ring++) {
    const r1 = 1 + ring * (radialSegments + 1);
    const r2 = 1 + (ring + 1) * (radialSegments + 1);
    for (let seg = 0; seg < radialSegments; seg++) {
      const a = r1 + seg;
      const b = r2 + seg;
      const c = r1 + seg + 1;
      const d = r2 + seg + 1;

      indexData[iOffset++] = a;
      indexData[iOffset++] = b;
      indexData[iOffset++] = c;

      indexData[iOffset++] = b;
      indexData[iOffset++] = d;
      indexData[iOffset++] = c;
    }
  }

  // Bottom fan
  const lastRingStart = 1 + (totalRings - 1) * (radialSegments + 1);
  for (let seg = 0; seg < radialSegments; seg++) {
    indexData[iOffset++] = lastRingStart + seg;
    indexData[iOffset++] = bottomPoleIndex;
    indexData[iOffset++] = lastRingStart + seg + 1;
  }

  return {
    vertexData,
    indexData,
    indexCount: iOffset,
    partId
  };
}

/**
 * Generates an orthopedic Dynamic Compression Plate (DCP) with counterbored screw holes,
 * contoured beveled edges, and surgical Grade 5 Titanium geometry.
 */
export function createOrthopedicFixationPlate(
  length: number,
  width: number,
  thickness: number,
  holeCount = 4,
  radialSegments = 16,
  partId = 302
): IRawGpuMesh {
  // A contoured plate generated with 6 outer perimeter faces and internal countersunk screw hole wells
  const halfLen = length / 2.0;
  const halfW = width / 2.0;
  const halfT = thickness / 2.0;

  // Box vertices (8 corners) + hole rings
  // Top face (+Z), Bottom face (-Z), Sides (+X, -X), Ends (+Y, -Y)
  const vertices: number[] = [];
  const indices: number[] = [];

  function addQuad(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    p4: [number, number, number],
    normal: [number, number, number]
  ) {
    const base = vertices.length / 8;
    // p1
    vertices.push(p1[0], p1[1], p1[2], normal[0], normal[1], normal[2], 0, 0);
    // p2
    vertices.push(p2[0], p2[1], p2[2], normal[0], normal[1], normal[2], 1, 0);
    // p3
    vertices.push(p3[0], p3[1], p3[2], normal[0], normal[1], normal[2], 1, 1);
    // p4
    vertices.push(p4[0], p4[1], p4[2], normal[0], normal[1], normal[2], 0, 1);

    indices.push(base, base + 1, base + 2);
    indices.push(base, base + 2, base + 3);
  }

  // Main body box
  // Bottom face (-Z)
  addQuad([-halfW, -halfLen, -halfT], [halfW, -halfLen, -halfT], [halfW, halfLen, -halfT], [-halfW, halfLen, -halfT], [0, 0, -1]);
  // Right side (+X)
  addQuad([halfW, -halfLen, -halfT], [halfW, -halfLen, halfT], [halfW, halfLen, halfT], [halfW, halfLen, -halfT], [1, 0, 0]);
  // Left side (-X)
  addQuad([-halfW, halfLen, -halfT], [-halfW, halfLen, halfT], [-halfW, -halfLen, halfT], [-halfW, -halfLen, -halfT], [-1, 0, 0]);
  // Top end (+Y)
  addQuad([-halfW, halfLen, -halfT], [halfW, halfLen, -halfT], [halfW, halfLen, halfT], [-halfW, halfLen, halfT], [0, 1, 0]);
  // Bottom end (-Y)
  addQuad([-halfW, -halfLen, halfT], [halfW, -halfLen, halfT], [halfW, -halfLen, -halfT], [-halfW, -halfLen, -halfT], [0, -1, 0]);

  // Top surface with counterbored screw holes along centerline
  // Generate segmented top surface strip
  const holeRadius = width * 0.22;
  const segments = Math.max(1, holeCount);
  const segHeight = length / segments;

  for (let k = 0; k < segments; k++) {
    const y0 = -halfLen + k * segHeight;
    const y1 = y0 + segHeight;
    const cy = (y0 + y1) / 2.0;

    // Top surface segment borders around hole center
    addQuad([-halfW, y0, halfT], [-holeRadius, y0, halfT], [-holeRadius, y1, halfT], [-halfW, y1, halfT], [0, 0, 1]);
    addQuad([holeRadius, y0, halfT], [halfW, y0, halfT], [halfW, y1, halfT], [holeRadius, y1, halfT], [0, 0, 1]);
    addQuad([-holeRadius, y0, halfT], [holeRadius, y0, halfT], [holeRadius, cy - holeRadius, halfT], [-holeRadius, cy - holeRadius, halfT], [0, 0, 1]);
    addQuad([-holeRadius, cy + holeRadius, halfT], [holeRadius, cy + holeRadius, halfT], [holeRadius, y1, halfT], [-holeRadius, y1, halfT], [0, 0, 1]);

    // Countersunk bevel well into plate
    const baseIdx = vertices.length / 8;
    for (let s = 0; s <= radialSegments; s++) {
      const theta = (s / radialSegments) * Math.PI * 2.0;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const rimX = cosT * holeRadius;
      const rimY = cy + sinT * holeRadius;
      const innerX = cosT * (holeRadius * 0.65);
      const innerY = cy + sinT * (holeRadius * 0.65);

      // Outer rim vertex
      vertices.push(rimX, rimY, halfT, -cosT * 0.4, -sinT * 0.4, 0.8, s / radialSegments, 0);
      // Inner bevel vertex (counterbore floor)
      vertices.push(innerX, innerY, halfT - thickness * 0.5, -cosT * 0.7, -sinT * 0.7, 0.3, s / radialSegments, 1);
    }

    for (let s = 0; s < radialSegments; s++) {
      const a = baseIdx + s * 2;
      const b = baseIdx + s * 2 + 1;
      const c = baseIdx + (s + 1) * 2;
      const d = baseIdx + (s + 1) * 2 + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  return {
    vertexData: new Float32Array(vertices),
    indexData: new Uint16Array(indices),
    indexCount: indices.length,
    partId
  };
}

/**
 * Generates a porous bioactive glass / silica osteoconductive scaffold (Bioglass 45S5)
 * with an interconnected open-cell 3D trabecular strut network.
 */
export function createBioactiveSilicaScaffold(
  size: number,
  poreSize = 0.28,
  porosity = 0.68,
  partId = 303
): IRawGpuMesh {
  // Modeled as a cubic trabecular cell lattice with interconnected cylindrical struts and nodal spheres
  const halfS = size / 2.0;
  const strutRadius = Math.max(0.004, size * (1.0 - porosity) * 0.16);
  const vertices: number[] = [];
  const indices: number[] = [];

  // Generate 8 corner nodes and 1 center core node
  const nodes: [number, number, number][] = [
    [-halfS, -halfS, -halfS],
    [ halfS, -halfS, -halfS],
    [ halfS,  halfS, -halfS],
    [-halfS,  halfS, -halfS],
    [-halfS, -halfS,  halfS],
    [ halfS, -halfS,  halfS],
    [ halfS,  halfS,  halfS],
    [-halfS,  halfS,  halfS],
    [0.0, 0.0, 0.0], // central trabecular node
  ];

  // Node spheres (12 segments)
  for (const node of nodes) {
    const latBands = 6;
    const lonBands = 8;
    const base = vertices.length / 8;
    const nodeR = strutRadius * 1.35;

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2.0 * Math.PI) / lonBands;
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);

        const nx = cosP * sinT;
        const ny = cosT;
        const nz = sinP * sinT;

        vertices.push(
          node[0] + nx * nodeR,
          node[1] + ny * nodeR,
          node[2] + nz * nodeR,
          nx, ny, nz,
          lon / lonBands,
          lat / latBands
        );
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = base + lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;

        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
  }

  // Interconnected strut cylinders connecting nodes
  const strutPairs: [number, number][] = [
    // Bottom square
    [0, 1], [1, 2], [2, 3], [3, 0],
    // Top square
    [4, 5], [5, 6], [6, 7], [7, 4],
    // Vertical pillars
    [0, 4], [1, 5], [2, 6], [3, 7],
    // Center diagonals to central trabecular core
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]
  ];

  const radialSegments = 6;
  for (const [n1, n2] of strutPairs) {
    const p1 = nodes[n1];
    const p2 = nodes[n2];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dz = p2[2] - p1[2];
    const len = Math.hypot(dx, dy, dz);
    if (len < 0.0001) continue;

    const dirX = dx / len;
    const dirY = dy / len;
    const dirZ = dz / len;

    // Up vector orthogonal to direction
    let upX = 0, upY = 1, upZ = 0;
    if (Math.abs(dirY) > 0.9) {
      upX = 1; upY = 0; upZ = 0;
    }
    // Perpendicular axes
    const rightX = dirY * upZ - dirZ * upY;
    const rightY = dirZ * upX - dirX * upZ;
    const rightZ = dirX * upY - dirY * upX;
    const rLen = Math.hypot(rightX, rightY, rightZ) || 1.0;
    const rx = rightX / rLen;
    const ry = rightY / rLen;
    const rz = rightZ / rLen;

    const normalX = ry * dirZ - rz * dirY;
    const normalY = rz * dirX - rx * dirZ;
    const normalZ = rx * dirY - ry * dirX;

    const base = vertices.length / 8;
    for (let i = 0; i <= 1; i++) {
      const t = i;
      const cx = p1[0] + dx * t;
      const cy = p1[1] + dy * t;
      const cz = p1[2] + dz * t;

      for (let s = 0; s <= radialSegments; s++) {
        const theta = (s / radialSegments) * Math.PI * 2.0;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        const nx = rx * cosT + normalX * sinT;
        const ny = ry * cosT + normalY * sinT;
        const nz = rz * cosT + normalZ * sinT;

        vertices.push(
          cx + nx * strutRadius,
          cy + ny * strutRadius,
          cz + nz * strutRadius,
          nx, ny, nz,
          s / radialSegments,
          t
        );
      }
    }

    for (let s = 0; s < radialSegments; s++) {
      const a = base + s;
      const b = base + (radialSegments + 1) + s;
      const c = base + s + 1;
      const d = base + (radialSegments + 1) + s + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  return {
    vertexData: new Float32Array(vertices),
    indexData: new Uint16Array(indices),
    indexCount: indices.length,
    partId
  };
}

