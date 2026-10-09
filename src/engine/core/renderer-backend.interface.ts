/**
 * PocketGull "GullRender" In-House Browser Rendering Engine
 * Hardware Abstraction Layer (HAL) Contract
 * 
 * Defines the unified interface implemented across:
 * - Tier 1: WebGPU (Direct3D 12 / Metal / Vulkan via WGSL)
 * - Tier 2: WebGL 2.0 (OpenGL ES 3.0 fallback)
 * - Tier 3: 2.5D Canvas/SVG (Fail-safe for restricted institutional kiosks)
 */

export type RendererBackendType = 'webgpu' | 'webgl2' | 'canvas2d';

export interface IRawGpuMesh {
  vertexData: Float32Array; // Interleaved [pos(3), norm(3), uv(2)] - 32 bytes per vertex
  indexData: Uint16Array;
  indexCount: number;
  partId?: number; // Optional 32-bit uint part identifier for O(1) GPU picking
}

export interface IUniformPayload {
  viewProjMatrix: Float32Array; // 16 floats
  modelMatrix: Float32Array;    // 16 floats
  cameraPos: [number, number, number];
  timeSec: number;
  heartRateBpm: number;
  conductionVelocity: number;
  qtcIntervalMs: number;
  eadInstability: number;
  meshPartId: number;
  customFloats?: number[];      // Optional extra bio-parameters
}

export interface IRendererBackend {
  readonly backendType: RendererBackendType;
  readonly isInitialized: boolean;

  /**
   * Initializes the graphics context on the provided canvas.
   * Returns true if context was successfully created, false if unsupported.
   */
  init(canvas: HTMLCanvasElement): Promise<boolean>;

  /**
   * Uploads raw interleaved geometry to GPU buffers.
   * Returns a numerical handle identifying the uploaded mesh.
   */
  uploadMesh(mesh: IRawGpuMesh): number;

  /**
   * Clears and deallocates all uploaded meshes.
   */
  clearMeshes(): void;

  /**
   * Updates per-frame uniform state.
   */
  updateUniforms(payload: IUniformPayload): void;

  /**
   * Renders the current frame.
   */
  renderFrame(): void;

  /**
   * Performs O(1) GPU Color-ID picking at canvas pixel coordinates (x, y).
   * Returns the 32-bit uint part ID at the cursor (0 = background/none).
   */
  pickPartAt(x: number, y: number): Promise<number>;

  /**
   * Resizes viewport swapchains and depth/picking buffers.
   */
  resize(width: number, height: number): void;

  /**
   * Releases all GPU buffers, pipelines, textures, and device contexts.
   */
  destroy(): void;
}
