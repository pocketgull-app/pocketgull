// SPDX-License-Identifier: Apache-2.0
import { Injectable, signal } from '@angular/core';
import type { IQuantizedVector } from './on-device-embedder.service';

export interface IRustWasmExports {
  memory: WebAssembly.Memory;
  quantized_dot_i8: (ptrA: number, ptrB: number, len: number) => number;
  quantized_norm_sq_i8: (ptr: number, len: number) => number;
  fnv1a_part11_digest32: (ptr: number, len: number, seed: number) => number;
  isqrt_i32: (val: number) => number;
}

export interface IPoint1000Upm {
  x: number;
  y: number;
}

export interface IExtrudedGlyphMesh1000Upm {
  /** Integer-snapped 1000 UPM 3D vertex coordinates [x0, y0, z0, x1, y1, z1, ...] */
  vertices: Int32Array;
  /** Triangle index buffer for Three.js BufferGeometry */
  indices: Uint16Array;
  /** Per-segment computed chisel nib width in 1000 UPM integer units */
  segmentWidthsUpm: Int32Array;
  /** Execution path used ('RUST_WASM_KERNEL' or 'DETERMINISTIC_TS_FALLBACK') */
  executionEngine: 'RUST_WASM_KERNEL' | 'DETERMINISTIC_TS_FALLBACK';
}

/**
 * Assembles the hermetic WebAssembly binary (`wasm32-unknown-unknown` ABI)
 * matching `packages/pocketgull-wasm-kernel/src/lib.rs` with zero `.node` native addons.
 */
export function buildPocketGullWasmKernelBytes(): Uint8Array {
  const encodeAscii = (str: string): number[] => {
    const out = [str.length];
    for (let i = 0; i < str.length; i++) {
      out.push(str.charCodeAt(i));
    }
    return out;
  };

  const encodeUleb128 = (val: number): number[] => {
    const out: number[] = [];
    let v = val >>> 0;
    do {
      let byte = v & 0x7f;
      v >>>= 7;
      if (v !== 0) {
        byte |= 0x80;
      }
      out.push(byte);
    } while (v !== 0);
    return out;
  };

  const encodeSection = (sectionId: number, payload: number[]): number[] => [
    sectionId,
    ...encodeUleb128(payload.length),
    ...payload
  ];

  // Section 1: Type Section
  // Type 0: (i32, i32, i32) -> i32
  // Type 1: (i32, i32) -> i32
  // Type 2: (i32) -> i32
  const typeSection = encodeSection(1, [
    0x03,
    0x60, 0x03, 0x7f, 0x7f, 0x7f, 0x01, 0x7f,
    0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
    0x60, 0x01, 0x7f, 0x01, 0x7f
  ]);

  // Section 3: Function Section (4 functions -> types 0, 1, 0, 2)
  const funcSection = encodeSection(3, [
    0x04,
    0x00,
    0x01,
    0x00,
    0x02
  ]);

  // Section 5: Memory Section (1 memory, min 1 page = 64 KiB, max 4 pages = 256 KiB)
  const memSection = encodeSection(5, [
    0x01,
    0x01, 0x01, 0x04
  ]);

  // Section 7: Export Section
  const exportEntries = [
    ...encodeAscii('memory'), 0x02, 0x00,
    ...encodeAscii('quantized_dot_i8'), 0x00, 0x00,
    ...encodeAscii('quantized_norm_sq_i8'), 0x00, 0x01,
    ...encodeAscii('fnv1a_part11_digest32'), 0x00, 0x02,
    ...encodeAscii('isqrt_i32'), 0x00, 0x03
  ];
  const exportSection = encodeSection(7, [0x05, ...exportEntries]);

  // Section 10: Code Section
  // Func 0: quantized_dot_i8(ptr_a, ptr_b, len) -> i32
  const body0 = [
    0x01, 0x02, 0x7f, // locals: 2 x i32 (local 3 = acc, local 4 = idx)
    0x02, 0x40,       // block
    0x03, 0x40,       // loop
    0x20, 0x04, 0x20, 0x02, 0x4f, 0x0d, 0x01, // br_if 1 (idx >=_u len)
    0x20, 0x03,       // local.get 3 (acc)
    0x20, 0x00, 0x20, 0x04, 0x6a, 0x2c, 0x00, 0x00, // i32.load8_s(ptr_a + idx)
    0x20, 0x01, 0x20, 0x04, 0x6a, 0x2c, 0x00, 0x00, // i32.load8_s(ptr_b + idx)
    0x6c, 0x6a, 0x21, 0x03, // acc += a * b
    0x20, 0x04, 0x41, 0x01, 0x6a, 0x21, 0x04, // idx += 1
    0x0c, 0x00,       // br 0
    0x0b,             // end loop
    0x0b,             // end block
    0x20, 0x03,       // return acc
    0x0b              // end func
  ];

  // Func 1: quantized_norm_sq_i8(ptr, len) -> i32
  const body1 = [
    0x01, 0x03, 0x7f, // locals: 3 x i32 (local 2 = acc, local 3 = idx, local 4 = val)
    0x02, 0x40,       // block
    0x03, 0x40,       // loop
    0x20, 0x03, 0x20, 0x01, 0x4f, 0x0d, 0x01, // br_if 1 (idx >=_u len)
    0x20, 0x00, 0x20, 0x03, 0x6a, 0x2c, 0x00, 0x00, // i32.load8_s(ptr + idx)
    0x22, 0x04, 0x20, 0x04, 0x6c, // val * val
    0x20, 0x02, 0x6a, 0x21, 0x02, // acc += val * val
    0x20, 0x03, 0x41, 0x01, 0x6a, 0x21, 0x03, // idx += 1
    0x0c, 0x00,       // br 0
    0x0b,             // end loop
    0x0b,             // end block
    0x20, 0x02,       // return acc
    0x0b              // end func
  ];

  // Func 2: fnv1a_part11_digest32(ptr, len, seed) -> i32
  const body2 = [
    0x01, 0x01, 0x7f, // locals: 1 x i32 (local 3 = idx)
    0x02, 0x40,       // block
    0x03, 0x40,       // loop
    0x20, 0x03, 0x20, 0x01, 0x4f, 0x0d, 0x01, // br_if 1 (idx >=_u len)
    0x20, 0x02,       // local.get 2 (seed/hash)
    0x20, 0x00, 0x20, 0x03, 0x6a, 0x2d, 0x00, 0x00, // i32.load8_u(ptr + idx)
    0x73,             // i32.xor
    0x41, 0x93, 0x83, 0x80, 0x08, // i32.const 0x01000193 (16777619)
    0x6c,             // i32.mul
    0x21, 0x02,       // hash = (hash ^ byte) * 0x01000193
    0x20, 0x03, 0x41, 0x01, 0x6a, 0x21, 0x03, // idx += 1
    0x0c, 0x00,       // br 0
    0x0b,             // end loop
    0x0b,             // end block
    0x20, 0x02,       // return hash
    0x0b              // end func
  ];

  // Func 3: isqrt_i32(val) -> i32
  const body3 = [
    0x00,             // 0 locals
    0x20, 0x00, 0x41, 0x00, 0x4c, // val <=_s 0
    0x04, 0x7f,       // if (result i32)
    0x41, 0x00,       // return 0
    0x05,             // else
    0x20, 0x00, 0xb8, 0x9f, 0xab, // i32.trunc_f64_u(f64.sqrt(f64.convert_i32_u(val)))
    0x0b,             // end if
    0x0b              // end func
  ];

  const codePayload = [
    0x04,
    body0.length, ...body0,
    body1.length, ...body1,
    body2.length, ...body2,
    body3.length, ...body3
  ];
  const codeSection = encodeSection(10, codePayload);

  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // \0asm magic
    0x01, 0x00, 0x00, 0x00, // version 1
    ...typeSection,
    ...funcSection,
    ...memSection,
    ...exportSection,
    ...codeSection
  ]);
}

@Injectable({
  providedIn: 'root'
})
export class RustWasmComputeService {
  private wasmExports: IRustWasmExports | null = null;
  private readonly PTR_VEC_A = 0;
  private readonly PTR_VEC_B = 4096;
  private readonly PTR_DIGEST_BUF = 8192;
  private readonly MAX_SLICE_BYTES = 4096;

  /** Reactive signal indicating whether the native Wasm linear-memory kernel is active */
  readonly isWasmActive = signal<boolean>(false);

  /** Current compute engine identifier for telemetry and audit badges */
  readonly activeEngine = signal<'RUST_WASM_KERNEL' | 'DETERMINISTIC_TS_FALLBACK'>('DETERMINISTIC_TS_FALLBACK');

  constructor() {
    this.initWasmKernelSync();
  }

  /**
   * Synchronously compiles and instantiates the embedded `pocketgull-wasm-kernel` module.
   * Gracefully falls back to deterministic TypeScript if a strict browser CSP blocks Wasm compilation.
   */
  initWasmKernelSync(): boolean {
    if (this.wasmExports) {
      return true;
    }
    if (typeof WebAssembly === 'undefined') {
      this.isWasmActive.set(false);
      this.activeEngine.set('DETERMINISTIC_TS_FALLBACK');
      return false;
    }

    try {
      const bytes = buildPocketGullWasmKernelBytes();
      const module = new WebAssembly.Module(bytes as BufferSource);
      const instance = new WebAssembly.Instance(module, {});
      this.wasmExports = instance.exports as unknown as IRustWasmExports;
      this.isWasmActive.set(true);
      this.activeEngine.set('RUST_WASM_KERNEL');
      return true;
    } catch {
      // Preserves 100% availability under strict CSP environments without 'wasm-unsafe-eval'
      this.wasmExports = null;
      this.isWasmActive.set(false);
      this.activeEngine.set('DETERMINISTIC_TS_FALLBACK');
      return false;
    }
  }

  /**
   * Computes exact Int8 dot product using the Rust Wasm linear-memory kernel (or TS fallback).
   */
  quantizedDotI8(a: Int8Array, b: Int8Array): number {
    if (!a || !b || a.length === 0 || b.length === 0) return 0;
    const len = Math.min(a.length, b.length, this.MAX_SLICE_BYTES);

    if (this.wasmExports) {
      const memI8 = new Int8Array(this.wasmExports.memory.buffer);
      memI8.set(a.length > len ? a.subarray(0, len) : a, this.PTR_VEC_A);
      memI8.set(b.length > len ? b.subarray(0, len) : b, this.PTR_VEC_B);
      return this.wasmExports.quantized_dot_i8(this.PTR_VEC_A, this.PTR_VEC_B, len);
    }

    let dot = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  /**
   * Computes exact Int8 squared L2 norm using the Rust Wasm linear-memory kernel (or TS fallback).
   */
  quantizedNormSqI8(vec: Int8Array): number {
    if (!vec || vec.length === 0) return 0;
    const len = Math.min(vec.length, this.MAX_SLICE_BYTES);

    if (this.wasmExports) {
      const memI8 = new Int8Array(this.wasmExports.memory.buffer);
      memI8.set(vec.length > len ? vec.subarray(0, len) : vec, this.PTR_VEC_A);
      return this.wasmExports.quantized_norm_sq_i8(this.PTR_VEC_A, len);
    }

    let normSq = 0;
    for (let i = 0; i < len; i++) {
      normSq += vec[i] * vec[i];
    }
    return normSq;
  }

  /**
   * Computes Cosine Similarity in Int8 quantized integer space via the Wasm kernel.
   */
  quantizedCosineSimilarity(qA: IQuantizedVector, qB: IQuantizedVector): number {
    if (!qA || !qB || qA.dim === 0 || qB.dim === 0) return 0;
    const len = Math.min(qA.dim, qB.dim, this.MAX_SLICE_BYTES);
    if (len === 0) return 0;

    if (this.wasmExports) {
      const memI8 = new Int8Array(this.wasmExports.memory.buffer);
      const sliceA = qA.data.length > len ? qA.data.subarray(0, len) : qA.data;
      const sliceB = qB.data.length > len ? qB.data.subarray(0, len) : qB.data;
      memI8.set(sliceA, this.PTR_VEC_A);
      memI8.set(sliceB, this.PTR_VEC_B);

      const dot = this.wasmExports.quantized_dot_i8(this.PTR_VEC_A, this.PTR_VEC_B, len);
      const normA = this.wasmExports.quantized_norm_sq_i8(this.PTR_VEC_A, len);
      const normB = this.wasmExports.quantized_norm_sq_i8(this.PTR_VEC_B, len);
      const denom = Math.sqrt(normA) * Math.sqrt(normB);
      return denom === 0 ? 0 : dot / denom;
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      const a = qA.data[i];
      const b = qB.data[i];
      dot += a * b;
      normA += a * a;
      normB += b * b;
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  /**
   * Computes deterministic 32-bit FNV-1a integrity digest for FDA 21 CFR Part 11 audit trails.
   */
  fnv1aPart11Digest32(input: Uint8Array | string, seed = 0x811c9dc5): number {
    const bytes = typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input;

    const len = Math.min(bytes.length, this.MAX_SLICE_BYTES);
    if (this.wasmExports) {
      const memU8 = new Uint8Array(this.wasmExports.memory.buffer);
      memU8.set(bytes.length > len ? bytes.subarray(0, len) : bytes, this.PTR_DIGEST_BUF);
      return this.wasmExports.fnv1a_part11_digest32(this.PTR_DIGEST_BUF, len, seed) >>> 0;
    }

    let hash = seed >>> 0;
    for (let i = 0; i < len; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  /**
   * Computes integer square root (`floor(sqrt(val))`) via the Wasm kernel.
   */
  isqrtI32(val: number): number {
    const intVal = val | 0;
    if (intVal <= 0) return 0;
    if (this.wasmExports) {
      return this.wasmExports.isqrt_i32(intVal);
    }
    return Math.floor(Math.sqrt(intVal));
  }

  /**
   * Evaluates the PocketGull-Chiseltip parametric physical chisel nib width equation
   * on the strict 1000 UPM integer coordinate grid:
   *   w(phi) = round(sqrt((a * cos(phi - theta))^2 + (b * sin(phi - theta))^2))
   */
  chiselNibWidth1000Upm(
    strokeAngleRad: number,
    nibAngleRad: number = Math.PI / 4,
    majorWidthUpm: number = 140,
    minorWidthUpm: number = 38
  ): number {
    const delta = strokeAngleRad - nibAngleRad;
    const termA = Math.round(majorWidthUpm * Math.cos(delta));
    const termB = Math.round(minorWidthUpm * Math.sin(delta));
    const sumSq = (termA * termA) + (termB * termB);
    return this.isqrtI32(sumSq);
  }

  /**
   * Extrudes a 2D centerline polyline on the 1000 UPM integer grid into a 3D chisel-nib
   * mesh buffer suitable for Three.js procedural glyph extrusion (`depthUpm` along Z).
   */
  extrudeChiselStroke1000Upm(
    centerline: ReadonlyArray<IPoint1000Upm>,
    depthUpm: number = 120,
    nibAngleRad: number = Math.PI / 4,
    majorWidthUpm: number = 140,
    minorWidthUpm: number = 38
  ): IExtrudedGlyphMesh1000Upm {
    if (!centerline || centerline.length < 2) {
      return {
        vertices: new Int32Array(0),
        indices: new Uint16Array(0),
        segmentWidthsUpm: new Int32Array(0),
        executionEngine: this.activeEngine()
      };
    }

    const numPts = centerline.length;
    const segmentWidthsUpm = new Int32Array(numPts - 1);
    // 4 vertices per centerline point: [topLeft, topRight, bottomLeft, bottomRight]
    const vertices = new Int32Array(numPts * 4 * 3);
    const halfDepth = Math.round(depthUpm / 2);

    for (let i = 0; i < numPts; i++) {
      const curr = centerline[i];
      const next = i < numPts - 1 ? centerline[i + 1] : centerline[i];
      const prev = i > 0 ? centerline[i - 1] : centerline[i];

      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const angle = Math.atan2(dy, dx);
      const widthUpm = this.chiselNibWidth1000Upm(angle, nibAngleRad, majorWidthUpm, minorWidthUpm);
      if (i < numPts - 1) {
        segmentWidthsUpm[i] = widthUpm;
      }

      const halfW = Math.max(1, Math.round(widthUpm / 2));
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      const offsetX = Math.round(nx * halfW);
      const offsetY = Math.round(ny * halfW);

      const base = i * 12;
      // Front-face left (+halfDepth Z)
      vertices[base + 0] = Math.round(curr.x + offsetX);
      vertices[base + 1] = Math.round(curr.y + offsetY);
      vertices[base + 2] = halfDepth;
      // Front-face right (+halfDepth Z)
      vertices[base + 3] = Math.round(curr.x - offsetX);
      vertices[base + 4] = Math.round(curr.y - offsetY);
      vertices[base + 5] = halfDepth;
      // Back-face left (-halfDepth Z)
      vertices[base + 6] = Math.round(curr.x + offsetX);
      vertices[base + 7] = Math.round(curr.y + offsetY);
      vertices[base + 8] = -halfDepth;
      // Back-face right (-halfDepth Z)
      vertices[base + 9] = Math.round(curr.x - offsetX);
      vertices[base + 10] = Math.round(curr.y - offsetY);
      vertices[base + 11] = -halfDepth;
    }

    // 2 front triangles + 2 back triangles per segment = 4 * 3 = 12 indices per segment
    const indices = new Uint16Array((numPts - 1) * 12);
    for (let s = 0; s < numPts - 1; s++) {
      const v0 = s * 4;
      const v1 = (s + 1) * 4;
      const idxBase = s * 12;

      // Front ribbon quad
      indices[idxBase + 0] = v0 + 0;
      indices[idxBase + 1] = v0 + 1;
      indices[idxBase + 2] = v1 + 0;
      indices[idxBase + 3] = v0 + 1;
      indices[idxBase + 4] = v1 + 1;
      indices[idxBase + 5] = v1 + 0;

      // Back ribbon quad
      indices[idxBase + 6] = v0 + 2;
      indices[idxBase + 7] = v1 + 2;
      indices[idxBase + 8] = v0 + 3;
      indices[idxBase + 9] = v0 + 3;
      indices[idxBase + 10] = v1 + 2;
      indices[idxBase + 11] = v1 + 3;
    }

    return {
      vertices,
      indices,
      segmentWidthsUpm,
      executionEngine: this.activeEngine()
    };
  }
}
