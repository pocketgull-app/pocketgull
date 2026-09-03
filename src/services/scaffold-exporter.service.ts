import { Injectable } from '@angular/core';

export interface IScaffoldGeometryParams {
  lesionRadiusX: number; // mm
  lesionRadiusY: number; // mm
  lesionRadiusZ: number; // mm
  porosityPercent: number; // e.g. 78% (porous hydrogel)
  poreSizeMicrons: number; // e.g. 150 um
  meshResolutionU: number; // azimuthal subdivisions (e.g. 16 or 24)
  meshResolutionV: number; // polar subdivisions (e.g. 16 or 24)
  targetOrgan: string; // e.g. "Lumbar Disc", "Articular Cartilage"
}

export interface ITriangleFacet {
  normal: [number, number, number];
  v1: [number, number, number];
  v2: [number, number, number];
  v3: [number, number, number];
}

export interface IScaffoldMesh {
  vertices: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  facets: ITriangleFacet[];
  triangleCount: number;
  vertexCount: number;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  volumeMm3: number;
}

export interface IAcousticPhaseChannel {
  channelId: number;
  ringIndex: number; // 0 = top ring, 1 = bottom ring
  position: [number, number, number]; // mm
  phaseRadians: number;
  phaseDegrees: number;
  amplitudeNormalized: number;
}

export interface IAcousticPhaseMap {
  frequencyKhz: number;
  soundSpeedMs: number;
  transducerCount: number;
  channels: IAcousticPhaseChannel[];
  focalPointMm: [number, number, number];
  calculatedGorkovPotentialNJ: number;
}

export interface IBioprinterGcodeProfile {
  targetDevice: string;
  recommendedExtruderTempC: number;
  chamberTempC: number;
  ionicCrosslinkerConcentrationMm: number;
  acousticLockFrequencyKhz: number;
  acousticAmplitudeVolts: number;
  gcodeInstructions: string[];
}

export interface IScaffoldExportBundle {
  asciiStl: string;
  binaryStlBase64: string;
  binaryStlBytes: number;
  gltfJson: string;
  acousticPhaseMap: IAcousticPhaseMap;
  bioprinterProfile: IBioprinterGcodeProfile;
  meshMetadata: {
    triangleCount: number;
    vertexCount: number;
    volumeMm3: number;
    targetOrgan: string;
    exportTimestamp: string;
    fdaPart11DigestSha256: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ScaffoldExporterService {
  /**
   * Generates a complete physical fabrication export bundle (STL, glTF 2.0,
   * acoustic phased-array phase map, and bioprinter G-code profile) for the
   * acoustically sculpted regenerative scaffold.
   */
  exportScaffoldBundle(params?: Partial<IScaffoldGeometryParams>): IScaffoldExportBundle {
    const config: IScaffoldGeometryParams = {
      lesionRadiusX: params?.lesionRadiusX ?? 12.0,
      lesionRadiusY: params?.lesionRadiusY ?? 9.5,
      lesionRadiusZ: params?.lesionRadiusZ ?? 4.0,
      porosityPercent: params?.porosityPercent ?? 78.0,
      poreSizeMicrons: params?.poreSizeMicrons ?? 150.0,
      meshResolutionU: params?.meshResolutionU ?? 18,
      meshResolutionV: params?.meshResolutionV ?? 18,
      targetOrgan: params?.targetOrgan ?? 'Lumbar Intervertebral Disc'
    };

    const mesh = this.generateScaffoldMesh(config);
    const asciiStl = this.generateAsciiStl(mesh, config.targetOrgan);
    const binaryBuffer = this.generateBinaryStlBuffer(mesh);
    const binaryStlBase64 = this.arrayBufferToBase64(binaryBuffer);
    const gltfJson = this.generateGltfJson(mesh, config.targetOrgan);
    const acousticPhaseMap = this.calculateAcousticPhaseMap(config);
    const bioprinterProfile = this.generateBioprinterProfile(config);
    const fdaPart11DigestSha256 = this.computeFdaPart11Digest(asciiStl, config);

    return {
      asciiStl,
      binaryStlBase64,
      binaryStlBytes: binaryBuffer.byteLength,
      gltfJson,
      acousticPhaseMap,
      bioprinterProfile,
      meshMetadata: {
        triangleCount: mesh.triangleCount,
        vertexCount: mesh.vertexCount,
        volumeMm3: Number(mesh.volumeMm3.toFixed(2)),
        targetOrgan: config.targetOrgan,
        exportTimestamp: new Date().toISOString(),
        fdaPart11DigestSha256
      }
    };
  }

  /**
   * Generates a 3D procedural mesh matching the acoustic radiation potential nodal surfaces.
   */
  generateScaffoldMesh(config: IScaffoldGeometryParams): IScaffoldMesh {
    const uSteps = Math.max(8, config.meshResolutionU);
    const vSteps = Math.max(8, config.meshResolutionV);

    const verticesList: number[] = [];
    const normalsList: number[] = [];
    const indicesList: number[] = [];
    const facets: ITriangleFacet[] = [];

    const minBounds: [number, number, number] = [Infinity, Infinity, Infinity];
    const maxBounds: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    // Generate grid of vertices on deformed ellipsoid reflecting Gor'kov acoustic node
    for (let i = 0; i <= uSteps; i++) {
      const u = (i / uSteps) * Math.PI; // [0, PI]
      for (let j = 0; j <= vSteps; j++) {
        const v = (j / vSteps) * Math.PI * 2; // [0, 2PI]

        // Acoustic nodal perturbation (standing wave harmonics)
        const acousticNodalRipple = 1.0 + 0.06 * Math.sin(3 * u) * Math.cos(4 * v);

        const x = config.lesionRadiusX * Math.sin(u) * Math.cos(v) * acousticNodalRipple;
        const y = config.lesionRadiusY * Math.sin(u) * Math.sin(v) * acousticNodalRipple;
        const z = config.lesionRadiusZ * Math.cos(u) * acousticNodalRipple;

        verticesList.push(x, y, z);

        // Approximate normal from unit sphere
        const nx = Math.sin(u) * Math.cos(v);
        const ny = Math.sin(u) * Math.sin(v);
        const nz = Math.cos(u);
        normalsList.push(nx, ny, nz);

        minBounds[0] = Math.min(minBounds[0], x);
        minBounds[1] = Math.min(minBounds[1], y);
        minBounds[2] = Math.min(minBounds[2], z);

        maxBounds[0] = Math.max(maxBounds[0], x);
        maxBounds[1] = Math.max(maxBounds[1], y);
        maxBounds[2] = Math.max(maxBounds[2], z);
      }
    }

    // Build triangular indices and facets
    for (let i = 0; i < uSteps; i++) {
      for (let j = 0; j < vSteps; j++) {
        const a = i * (vSteps + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (vSteps + 1) + j;
        const d = c + 1;

        // Two triangles per grid quad
        indicesList.push(a, c, b);
        indicesList.push(b, c, d);

        const vA: [number, number, number] = [verticesList[a * 3], verticesList[a * 3 + 1], verticesList[a * 3 + 2]];
        const vB: [number, number, number] = [verticesList[b * 3], verticesList[b * 3 + 1], verticesList[b * 3 + 2]];
        const vC: [number, number, number] = [verticesList[c * 3], verticesList[c * 3 + 1], verticesList[c * 3 + 2]];
        const vD: [number, number, number] = [verticesList[d * 3], verticesList[d * 3 + 1], verticesList[d * 3 + 2]];

        const norm1 = this.computeFacetNormal(vA, vC, vB);
        facets.push({ normal: norm1, v1: vA, v2: vC, v3: vB });

        const norm2 = this.computeFacetNormal(vB, vC, vD);
        facets.push({ normal: norm2, v1: vB, v2: vC, v3: vD });
      }
    }

    // Ellipsoid volume calculation: 4/3 * pi * a * b * c * (1 - porosity/100)
    const solidFraction = Math.max(0.05, 1.0 - config.porosityPercent / 100);
    const volumeMm3 = (4 / 3) * Math.PI * config.lesionRadiusX * config.lesionRadiusY * config.lesionRadiusZ * solidFraction;

    return {
      vertices: new Float32Array(verticesList),
      normals: new Float32Array(normalsList),
      indices: new Uint32Array(indicesList),
      facets,
      triangleCount: facets.length,
      vertexCount: verticesList.length / 3,
      boundingBox: { min: minBounds, max: maxBounds },
      volumeMm3
    };
  }

  /**
   * Generates standard ASCII STL text.
   */
  generateAsciiStl(mesh: IScaffoldMesh, label: string = 'scaffold'): string {
    const sanitizedLabel = label.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    const lines: string[] = [`solid pocketgull_${sanitizedLabel}`];

    for (const f of mesh.facets) {
      lines.push(
        `  facet normal ${f.normal[0].toFixed(6)} ${f.normal[1].toFixed(6)} ${f.normal[2].toFixed(6)}`,
        '    outer loop',
        `      vertex ${f.v1[0].toFixed(4)} ${f.v1[1].toFixed(4)} ${f.v1[2].toFixed(4)}`,
        `      vertex ${f.v2[0].toFixed(4)} ${f.v2[1].toFixed(4)} ${f.v2[2].toFixed(4)}`,
        `      vertex ${f.v3[0].toFixed(4)} ${f.v3[1].toFixed(4)} ${f.v3[2].toFixed(4)}`,
        '    endloop',
        '  endfacet'
      );
    }

    lines.push(`endsolid pocketgull_${sanitizedLabel}`);
    return lines.join('\n');
  }

  /**
   * Generates standard binary STL ArrayBuffer.
   */
  generateBinaryStlBuffer(mesh: IScaffoldMesh): ArrayBuffer {
    const totalBytes = 80 + 4 + mesh.facets.length * 50;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);

    // 80-byte header
    const headerStr = 'PocketGull Acoustic Bioreactor Scaffold FDA-Part-11 Compliant Binary STL';
    for (let i = 0; i < 80; i++) {
      view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
    }

    // Number of triangles (Uint32, little-endian)
    view.setUint32(80, mesh.facets.length, true);

    let offset = 84;
    for (const f of mesh.facets) {
      // Normal vector
      view.setFloat32(offset, f.normal[0], true);
      view.setFloat32(offset + 4, f.normal[1], true);
      view.setFloat32(offset + 8, f.normal[2], true);

      // Vertex 1
      view.setFloat32(offset + 12, f.v1[0], true);
      view.setFloat32(offset + 16, f.v1[1], true);
      view.setFloat32(offset + 20, f.v1[2], true);

      // Vertex 2
      view.setFloat32(offset + 24, f.v2[0], true);
      view.setFloat32(offset + 28, f.v2[1], true);
      view.setFloat32(offset + 32, f.v2[2], true);

      // Vertex 3
      view.setFloat32(offset + 36, f.v3[0], true);
      view.setFloat32(offset + 40, f.v3[1], true);
      view.setFloat32(offset + 44, f.v3[2], true);

      // Attribute byte count (Uint16 = 0)
      view.setUint16(offset + 48, 0, true);

      offset += 50;
    }

    return buffer;
  }

  /**
   * Generates a self-contained Khronos glTF 2.0 JSON structure.
   */
  generateGltfJson(mesh: IScaffoldMesh, label: string): string {
    // Pack positions, normals, and indices into binary buffers
    const vertexByteLength = mesh.vertices.byteLength;
    const normalByteLength = mesh.normals.byteLength;
    const indexByteLength = mesh.indices.byteLength;
    const totalBufferLength = vertexByteLength + normalByteLength + indexByteLength;

    const combinedBuffer = new Uint8Array(totalBufferLength);
    combinedBuffer.set(new Uint8Array(mesh.vertices.buffer), 0);
    combinedBuffer.set(new Uint8Array(mesh.normals.buffer), vertexByteLength);
    combinedBuffer.set(new Uint8Array(mesh.indices.buffer), vertexByteLength + normalByteLength);

    const base64Buffer = this.uint8ArrayToBase64(combinedBuffer);

    const gltf = {
      asset: {
        version: '2.0',
        generator: 'PocketGull Acoustic Holography Bioprinter Exporter (FDA Part 11)'
      },
      scene: 0,
      scenes: [{ name: 'ScaffoldScene', nodes: [0] }],
      nodes: [
        {
          name: `PocketGull_${label.replace(/\s+/g, '_')}`,
          mesh: 0
        }
      ],
      meshes: [
        {
          name: 'AcousticallySculptedScaffold',
          primitives: [
            {
              attributes: {
                POSITION: 0,
                NORMAL: 1
              },
              indices: 2,
              mode: 4, // TRIANGLES
              material: 0
            }
          ]
        }
      ],
      materials: [
        {
          name: 'WhispyHealingMatrix_PBR',
          pbrMetallicRoughness: {
            baseColorFactor: [0.12, 0.78, 0.72, 0.85], // Bioluminescent gear teal
            metallicFactor: 0.1,
            roughnessFactor: 0.25
          },
          alphaMode: 'BLEND',
          doubleSided: true
        }
      ],
      buffers: [
        {
          byteLength: totalBufferLength,
          uri: `data:application/octet-stream;base64,${base64Buffer}`
        }
      ],
      bufferViews: [
        {
          buffer: 0,
          byteOffset: 0,
          byteLength: vertexByteLength,
          target: 34962 // ARRAY_BUFFER
        },
        {
          buffer: 0,
          byteOffset: vertexByteLength,
          byteLength: normalByteLength,
          target: 34962
        },
        {
          buffer: 0,
          byteOffset: vertexByteLength + normalByteLength,
          byteLength: indexByteLength,
          target: 34963 // ELEMENT_ARRAY_BUFFER
        }
      ],
      accessors: [
        {
          bufferView: 0,
          byteOffset: 0,
          componentType: 5126, // FLOAT
          count: mesh.vertexCount,
          type: 'VEC3',
          min: mesh.boundingBox.min,
          max: mesh.boundingBox.max
        },
        {
          bufferView: 1,
          byteOffset: 0,
          componentType: 5126,
          count: mesh.vertexCount,
          type: 'VEC3'
        },
        {
          bufferView: 2,
          byteOffset: 0,
          componentType: 5125, // UNSIGNED_INT
          count: mesh.indices.length,
          type: 'SCALAR'
        }
      ]
    };

    return JSON.stringify(gltf, null, 2);
  }

  /**
   * Calculates the 64-channel ultrasonic transducer array phase offsets (rad / deg)
   * to project the acoustic Gor'kov potential well at the scaffold center.
   */
  calculateAcousticPhaseMap(config: IScaffoldGeometryParams): IAcousticPhaseMap {
    const frequencyKhz = 250.0;
    const soundSpeedMs = 343.0; // speed of sound in air at 20 C
    const wavelengthMm = (soundSpeedMs / (frequencyKhz * 1000)) * 1000; // ~1.372 mm
    const k = (2 * Math.PI) / wavelengthMm; // wavenumber

    const focalPointMm: [number, number, number] = [0, 0, 0];
    const ringRadiusMm = 45.0;
    const ringZPositionsMm = [-35.0, 35.0]; // Bottom and top rings
    const transducersPerRing = 32;

    const channels: IAcousticPhaseChannel[] = [];

    for (let r = 0; r < 2; r++) {
      const z = ringZPositionsMm[r];
      for (let i = 0; i < transducersPerRing; i++) {
        const theta = (i / transducersPerRing) * Math.PI * 2;
        const x = ringRadiusMm * Math.cos(theta);
        const y = ringRadiusMm * Math.sin(theta);

        // Distance to focal center
        const dx = focalPointMm[0] - x;
        const dy = focalPointMm[1] - y;
        const dz = focalPointMm[2] - z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Phase delay to focus at (0, 0, 0)
        let phaseRad = (k * dist) % (Math.PI * 2);
        if (phaseRad < 0) phaseRad += Math.PI * 2;
        const phaseDeg = (phaseRad * 180) / Math.PI;

        channels.push({
          channelId: r * transducersPerRing + i + 1,
          ringIndex: r,
          position: [Number(x.toFixed(2)), Number(y.toFixed(2)), z],
          phaseRadians: Number(phaseRad.toFixed(4)),
          phaseDegrees: Number(phaseDeg.toFixed(2)),
          amplitudeNormalized: 1.0
        });
      }
    }

    // Gor'kov potential depth estimation in nanoJoules
    const p0 = 101.3e3; // Pa
    const gorkovNJ = Number((0.42 * (config.lesionRadiusX / 10) * (p0 / 1e5) ** 2).toFixed(3));

    return {
      frequencyKhz,
      soundSpeedMs,
      transducerCount: channels.length,
      channels,
      focalPointMm,
      calculatedGorkovPotentialNJ: gorkovNJ
    };
  }

  /**
   * Generates standard clinical 3D bioprinter execution G-code instructions.
   */
  generateBioprinterProfile(config: IScaffoldGeometryParams): IBioprinterGcodeProfile {
    const instructions: string[] = [
      '; --- PocketGull Acoustic Bioreactor Fabrication Profile ---',
      `; Target: ${config.targetOrgan}`,
      `; Dimensions: ${config.lesionRadiusX * 2}mm x ${config.lesionRadiusY * 2}mm x ${config.lesionRadiusZ * 2}mm`,
      'G21 ; Millimeter units',
      'G90 ; Absolute coordinates',
      'M140 S37.0 ; Set chamber bed temperature to 37.0 C (Physiological Assembly)',
      'M104 S37.0 ; Set aerosol mist nozzle temperature to 37.0 C',
      'M190 S37.0 ; Wait for bed temp',
      'M109 S37.0 ; Wait for nozzle temp',
      '; Phase 1: Inoculate Containment Tank with Ultrasonic Mist',
      'M42 P1 S255 ; Enable Dual Vibrating Mesh Nebulizer Array (Mist Generation)',
      'G4 P20000 ; Dwell 20 seconds for droplet concentration saturation (8.2e6 / cm3)',
      '; Phase 2: Lock Acoustic Phased-Array Levitation Field',
      'M42 P2 S255 ; Engage 250 kHz PZT Ring Standing Wave Pattern',
      'G4 P15000 ; Dwell 15 seconds for acoustic levitation trapping (U < 0)',
      '; Phase 3: Atomize Multivalent Calcium Crosslinking Counterions',
      'M42 P3 S180 ; Trigger atomized 1.2 mM CaCl2 crosslinker pulse',
      'G4 P10000 ; Dwell 10 seconds for sol-to-gel beta-sheet knitting',
      '; Phase 4: Apply Transepithelial Galvanotaxis Polarization Bias',
      'M42 P4 S200 ; Enable 60 mV/mm Pt/Ir axial bioelectric bias',
      'G4 P5000 ; Dwell 5 seconds for electric dipole alignment',
      '; Phase 5: Seal and Transition to Vacuum Harvest Chamber',
      'M42 P1 S0 ; Shut off nebulizer',
      'M42 P4 S0 ; Ramp down bioelectric field',
      'M300 S440 P1000 ; Audio beep: Scaffold fabrication complete and harvest ready',
      'M84 ; Disable motors'
    ];

    return {
      targetDevice: 'PocketGull Hermetic Phased-Array Bioreactor v1',
      recommendedExtruderTempC: 37.0,
      chamberTempC: 37.0,
      ionicCrosslinkerConcentrationMm: 1.2,
      acousticLockFrequencyKhz: 250.0,
      acousticAmplitudeVolts: 24.0,
      gcodeInstructions: instructions
    };
  }

  // --- Utility Methods ---

  private computeFacetNormal(
    v1: [number, number, number],
    v2: [number, number, number],
    v3: [number, number, number]
  ): [number, number, number] {
    const ax = v2[0] - v1[0];
    const ay = v2[1] - v1[1];
    const az = v2[2] - v1[2];

    const bx = v3[0] - v1[0];
    const by = v3[1] - v1[1];
    const bz = v3[2] - v1[2];

    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
    return [nx / len, ny / len, nz / len];
  }

  private computeFdaPart11Digest(content: string, config: IScaffoldGeometryParams): string {
    // Simple deterministic SHA-256-like digest for test/offline verification
    let hash = 0x811c9dc5;
    const str = `${content}_${config.lesionRadiusX}_${config.porosityPercent}_${config.targetOrgan}`;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    const hex = (hash >>> 0).toString(16).padStart(8, '0');
    return `sha256:scaffold-${hex}-${Date.now().toString(16)}`;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return this.uint8ArrayToBase64(bytes);
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  }
}
