// SPDX-License-Identifier: Apache-2.0
import {
  RustWasmComputeService,
  buildPocketGullWasmKernelBytes
} from './rust-wasm-compute.service';

describe('RustWasmComputeService (pocketgull-wasm-kernel)', () => {
  let service: RustWasmComputeService;

  beforeEach(() => {
    service = new RustWasmComputeService();
  });

  it('1. Validates and instantiates the embedded wasm32 binary module with zero .node dependencies', () => {
    const bytes = buildPocketGullWasmKernelBytes();
    expect(bytes.byteLength).toBeGreaterThan(64);
    expect(WebAssembly.validate(bytes as BufferSource)).toBe(true);
    expect(service.isWasmActive()).toBe(true);
    expect(service.activeEngine()).toBe('RUST_WASM_KERNEL');
  });

  it('2. Computes exact Int8 dot product and squared L2 norm in Wasm linear memory', () => {
    const a = new Int8Array([10, -20, 30, 40, -50]);
    const b = new Int8Array([2, -3, 4, 0, -1]);
    // 10*2 + (-20)*(-3) + 30*4 + 40*0 + (-50)*(-1) = 20 + 60 + 120 + 0 + 50 = 250
    expect(service.quantizedDotI8(a, b)).toBe(250);

    // 100 + 400 + 900 + 1600 + 2500 = 5500
    expect(service.quantizedNormSqI8(a)).toBe(5500);
  });

  it('3. Computes Int8 quantized cosine similarity via Wasm with high fidelity', () => {
    const qA = { data: new Int8Array([60, 80, 0]), scale: 1.0, dim: 3 };
    const qB = { data: new Int8Array([60, 80, 0]), scale: 1.0, dim: 3 };
    const qC = { data: new Int8Array([0, 0, 100]), scale: 1.0, dim: 3 };

    expect(service.quantizedCosineSimilarity(qA, qB)).toBeCloseTo(1.0, 5);
    expect(service.quantizedCosineSimilarity(qA, qC)).toBeCloseTo(0.0, 5);
  });

  it('4. Computes deterministic FDA 21 CFR Part 11 FNV-1a 32-bit digest in Wasm linear memory', () => {
    const payload = 'LENS_01_ALLOPATHIC_TRIAGE::49563-0::22298006';
    const digestA = service.fnv1aPart11Digest32(payload);
    const digestB = service.fnv1aPart11Digest32(payload);
    const digestModified = service.fnv1aPart11Digest32(payload + ':tampered');

    expect(digestA).toBeGreaterThan(0);
    expect(digestA).toBe(digestB);
    expect(digestA).not.toBe(digestModified);
  });

  it('5. Evaluates 1000 UPM integer square root and PocketGull-Chiseltip nib width equation', () => {
    expect(service.isqrtI32(1000000)).toBe(1000);
    expect(service.isqrtI32(0)).toBe(0);
    expect(service.isqrtI32(-25)).toBe(0);

    // At strokeAngle == nibAngle (45 deg), cos(0) = 1, sin(0) = 0 -> width == majorWidthUpm (140)
    const maxNibWidth = service.chiselNibWidth1000Upm(Math.PI / 4, Math.PI / 4, 140, 38);
    expect(maxNibWidth).toBe(140);

    // At strokeAngle perpendicular to nibAngle (+90 deg), cos(pi/2) = 0, sin(pi/2) = 1 -> width == minorWidthUpm (38)
    const minNibWidth = service.chiselNibWidth1000Upm((3 * Math.PI) / 4, Math.PI / 4, 140, 38);
    expect(minNibWidth).toBe(38);
  });

  it('6. Extrudes 1000 UPM centerline strokes into integer-coordinate 3D Three.js mesh buffers', () => {
    const centerline = [
      { x: 100, y: 100 },
      { x: 500, y: 500 },
      { x: 900, y: 500 }
    ];

    const mesh = service.extrudeChiselStroke1000Upm(centerline, 120);
    expect(mesh.executionEngine).toBe('RUST_WASM_KERNEL');
    expect(mesh.vertices.length).toBe(3 * 4 * 3); // 3 points * 4 vertices/pt * 3 coords
    expect(mesh.indices.length).toBe(2 * 12); // 2 segments * 12 indices/segment
    expect(mesh.segmentWidthsUpm.length).toBe(2);
    expect(mesh.segmentWidthsUpm[0]).toBe(140); // 45-degree stroke matches chisel nib major axis
  });
});
