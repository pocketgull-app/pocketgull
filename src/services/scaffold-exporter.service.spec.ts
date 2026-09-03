import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ScaffoldExporterService } from './scaffold-exporter.service';

describe('ScaffoldExporterService Physical Bioprinter Exporter Suite', () => {
  let service: ScaffoldExporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScaffoldExporterService]
    });
    service = TestBed.inject(ScaffoldExporterService);
  });

  it('1. Initializes cleanly and exports complete physical fabrication bundle', () => {
    const bundle = service.exportScaffoldBundle({
      lesionRadiusX: 10.0,
      lesionRadiusY: 8.0,
      lesionRadiusZ: 3.5,
      porosityPercent: 75.0,
      targetOrgan: 'Articular Cartilage Defect'
    });

    expect(bundle).toBeDefined();
    expect(bundle.asciiStl).toBeDefined();
    expect(bundle.binaryStlBase64).toBeDefined();
    expect(bundle.gltfJson).toBeDefined();
    expect(bundle.acousticPhaseMap).toBeDefined();
    expect(bundle.bioprinterProfile).toBeDefined();
    expect(bundle.meshMetadata.targetOrgan).toBe('Articular Cartilage Defect');
    expect(bundle.meshMetadata.triangleCount).toBeGreaterThan(100);
    expect(bundle.meshMetadata.volumeMm3).toBeGreaterThan(0);
    expect(bundle.meshMetadata.fdaPart11DigestSha256).toContain('sha256:scaffold-');
  });

  it('2. Formats ASCII STL with standard solid tags, face normals, and vertices', () => {
    const bundle = service.exportScaffoldBundle();
    const stl = bundle.asciiStl;

    expect(stl.startsWith('solid pocketgull_')).toBe(true);
    expect(stl).toContain('facet normal');
    expect(stl).toContain('outer loop');
    expect(stl).toContain('vertex');
    expect(stl).toContain('endloop');
    expect(stl).toContain('endfacet');
    expect(stl.trim().endsWith('endsolid pocketgull_lumbar_intervertebral_disc')).toBe(true);
  });

  it('3. Generates binary STL buffer conforming to 80-byte header and 50-byte facet format', () => {
    const config = {
      lesionRadiusX: 12.0,
      lesionRadiusY: 9.0,
      lesionRadiusZ: 4.0,
      porosityPercent: 78.0,
      poreSizeMicrons: 150.0,
      meshResolutionU: 10,
      meshResolutionV: 10,
      targetOrgan: 'Lumbar Disc'
    };

    const mesh = service.generateScaffoldMesh(config);
    const buffer = service.generateBinaryStlBuffer(mesh);

    expect(buffer.byteLength).toBe(80 + 4 + mesh.triangleCount * 50);

    const view = new DataView(buffer);
    const triangleCountInHeader = view.getUint32(80, true);
    expect(triangleCountInHeader).toBe(mesh.triangleCount);

    // Verify 80-byte header starts with ASCII string
    const headerBytes = new Uint8Array(buffer, 0, 10);
    const headerPrefix = String.fromCharCode(...headerBytes);
    expect(headerPrefix).toBe('PocketGull');
  });

  it('4. Generates valid Khronos glTF 2.0 specification JSON with embedded base64 buffers', () => {
    const bundle = service.exportScaffoldBundle();
    const gltf = JSON.parse(bundle.gltfJson);

    expect(gltf.asset.version).toBe('2.0');
    expect(gltf.asset.generator).toContain('PocketGull Acoustic Holography');
    expect(gltf.scene).toBe(0);
    expect(gltf.scenes.length).toBe(1);
    expect(gltf.nodes.length).toBe(1);
    expect(gltf.meshes.length).toBe(1);
    expect(gltf.meshes[0].primitives[0].mode).toBe(4); // TRIANGLES
    expect(gltf.materials.length).toBe(1);
    expect(gltf.materials[0].name).toBe('WhispyHealingMatrix_PBR');
    expect(gltf.buffers[0].uri).toContain('data:application/octet-stream;base64,');
    expect(gltf.accessors.length).toBe(3); // POSITION, NORMAL, indices
  });

  it('5. Computes 64-channel ultrasonic transducer array phase offsets across dual rings', () => {
    const phaseMap = service.calculateAcousticPhaseMap({
      lesionRadiusX: 12.0,
      lesionRadiusY: 9.5,
      lesionRadiusZ: 4.0,
      porosityPercent: 78.0,
      poreSizeMicrons: 150.0,
      meshResolutionU: 12,
      meshResolutionV: 12,
      targetOrgan: 'Lumbar Spine'
    });

    expect(phaseMap.transducerCount).toBe(64);
    expect(phaseMap.channels.length).toBe(64);
    expect(phaseMap.frequencyKhz).toBe(250.0);
    expect(phaseMap.focalPointMm).toEqual([0, 0, 0]);
    expect(phaseMap.calculatedGorkovPotentialNJ).toBeGreaterThan(0);

    // Verify ring division
    const topRing = phaseMap.channels.filter(c => c.ringIndex === 1);
    const bottomRing = phaseMap.channels.filter(c => c.ringIndex === 0);
    expect(topRing.length).toBe(32);
    expect(bottomRing.length).toBe(32);

    for (const ch of phaseMap.channels) {
      expect(ch.phaseRadians).toBeGreaterThanOrEqual(0);
      expect(ch.phaseRadians).toBeLessThanOrEqual(Math.PI * 2);
      expect(ch.phaseDegrees).toBeGreaterThanOrEqual(0);
      expect(ch.phaseDegrees).toBeLessThanOrEqual(360);
      expect(ch.amplitudeNormalized).toBe(1.0);
    }
  });

  it('6. Generates valid clinical bioprinter G-code instructions with 37C physiological dwell', () => {
    const bundle = service.exportScaffoldBundle();
    const gcode = bundle.bioprinterProfile;

    expect(gcode.targetDevice).toContain('PocketGull');
    expect(gcode.chamberTempC).toBe(37.0);
    expect(gcode.ionicCrosslinkerConcentrationMm).toBe(1.2);
    expect(gcode.acousticLockFrequencyKhz).toBe(250.0);
    expect(gcode.gcodeInstructions.length).toBeGreaterThan(15);

    const fullGcode = gcode.gcodeInstructions.join('\n');
    expect(fullGcode).toContain('M140 S37.0'); // Bed temp
    expect(fullGcode).toContain('M42 P1 S255'); // Nebulizer
    expect(fullGcode).toContain('M42 P2 S255'); // Acoustic levitation
    expect(fullGcode).toContain('M42 P3 S180'); // CaCl2 crosslinker
    expect(fullGcode).toContain('M42 P4 S200'); // Bioelectric polarization
  });
});
