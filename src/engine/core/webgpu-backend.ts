/**
 * Tier 1 WebGPU Backend for GullRender
 * 
 * Direct execution against the W3C WebGPU specification:
 * - Native WGSL pipeline compilation
 * - Zero-allocation uniform buffer streaming
 * - O(1) GPU Color-ID offscreen picking buffer (r32uint)
 * - Depth-stencil test with 24-bit depth buffer
 */

import { IRendererBackend, IRawGpuMesh, IUniformPayload, RendererBackendType } from './renderer-backend.interface';
import { CARDIAC_ELECTROPHYSIOLOGY_WGSL } from '../../shaders/cardiac-electrophysiology.wgsl';

interface IGpuMeshHandle {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  indexCount: number;
  partId: number;
}

export class WebGpuBackend implements IRendererBackend {
  readonly backendType: RendererBackendType = 'webgpu';
  isInitialized = false;

  private canvas!: HTMLCanvasElement;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;

  private pipeline!: GPURenderPipeline;
  private uniformBuffer!: GPUBuffer;
  private bindGroup!: GPUBindGroup;

  private depthTexture!: GPUTexture;
  private depthTextureView!: GPUTextureView;

  private pickTexture!: GPUTexture;
  private pickTextureView!: GPUTextureView;
  private pickStagingBuffer!: GPUBuffer;

  private meshes: Map<number, IGpuMeshHandle> = new Map();
  private nextMeshId = 1;
  private lastCircadianTone = 0.0;

  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.gpu) {
      return false;
    }

    try {
      this.canvas = canvas;
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (!adapter) return false;

      this.device = await adapter.requestDevice();
      this.context = canvas.getContext('webgpu') as unknown as GPUCanvasContext;
      if (!this.context) return false;

      this.format = navigator.gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: this.format,
        alphaMode: 'premultiplied'
      });

      // 1. Compile WGSL Shader
      const shaderModule = this.device.createShaderModule({
        label: 'GullRender_Cardiac_WGSL',
        code: CARDIAC_ELECTROPHYSIOLOGY_WGSL
      });

      // 2. Uniform Buffer (64 floats = 256 bytes)
      this.uniformBuffer = this.device.createBuffer({
        label: 'GullRender_FrameUniforms',
        size: 256,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });

      // 3. Render Pipeline with MRT (Color + Picking)
      this.pipeline = this.device.createRenderPipeline({
        label: 'GullRender_Pipeline',
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
          buffers: [
            {
              arrayStride: 32, // [pos: 12B, norm: 12B, uv: 8B]
              attributes: [
                { format: 'float32x3', offset: 0, shaderLocation: 0 },
                { format: 'float32x3', offset: 12, shaderLocation: 1 },
                { format: 'float32x2', offset: 24, shaderLocation: 2 }
              ]
            }
          ]
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [
            { format: this.format },
            { format: 'r32uint' }
          ]
        },
        primitive: {
          topology: 'triangle-list',
          cullMode: 'back'
        },
        depthStencil: {
          format: 'depth24plus',
          depthWriteEnabled: true,
          depthCompare: 'less'
        }
      });

      this.bindGroup = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }]
      });

      // 4. Staging Buffer for 1x1 Pixel Readback (aligned to 256 bytes)
      this.pickStagingBuffer = this.device.createBuffer({
        label: 'GullRender_PickStaging',
        size: 256,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });

      this.resize(canvas.width || 640, canvas.height || 480);
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[GullRender] WebGPU backend init failed, falling back:', err);
      return false;
    }
  }

  uploadMesh(mesh: IRawGpuMesh): number {
    const handleId = this.nextMeshId++;
    const vBuf = this.device.createBuffer({
      size: Math.ceil(mesh.vertexData.byteLength / 4) * 4,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Float32Array(vBuf.getMappedRange()).set(mesh.vertexData);
    vBuf.unmap();

    const iBuf = this.device.createBuffer({
      size: Math.ceil(mesh.indexData.byteLength / 4) * 4,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Uint16Array(iBuf.getMappedRange()).set(mesh.indexData);
    iBuf.unmap();

    this.meshes.set(handleId, {
      vertexBuffer: vBuf,
      indexBuffer: iBuf,
      indexCount: mesh.indexCount,
      partId: mesh.partId ?? 1
    });

    return handleId;
  }

  clearMeshes(): void {
    for (const mesh of this.meshes.values()) {
      mesh.vertexBuffer.destroy();
      mesh.indexBuffer.destroy();
    }
    this.meshes.clear();
  }

  updateUniforms(payload: IUniformPayload): void {
    if (!this.isInitialized) return;

    // Pack into a fixed 64-float buffer (256 bytes)
    const buf = new Float32Array(64);
    buf.set(payload.viewProjMatrix, 0); // 0-15
    buf.set(payload.modelMatrix, 16);    // 16-31
    buf[32] = payload.cameraPos[0];      // 32
    buf[33] = payload.cameraPos[1];      // 33
    buf[34] = payload.cameraPos[2];      // 34
    buf[35] = payload.timeSec;           // 35
    buf[36] = payload.heartRateBpm;      // 36
    buf[37] = payload.conductionVelocity;// 37
    buf[38] = payload.qtcIntervalMs;     // 38
    buf[39] = payload.eadInstability;    // 39

    const uView = new Uint32Array(buf.buffer);
    uView[40] = payload.meshPartId;      // 40: 32-bit uint part ID
    buf[41] = payload.circadianTone ?? 0.0;   // 41: Circadian tone in [0, 1]
    buf[42] = payload.vagalResonance ?? 1.0;  // 42: 0.1 Hz vagal pulse strength
    buf[43] = 0.0; // padding to 16-byte boundary

    this.lastCircadianTone = payload.circadianTone ?? 0.0;
    this.device.queue.writeBuffer(this.uniformBuffer, 0, buf);
  }

  renderFrame(): void {
    if (!this.isInitialized || this.meshes.size === 0) return;

    const currentTex = this.context.getCurrentTexture();
    const colorView = currentTex.createView();

    const tone = this.lastCircadianTone;
    // Circadian substrate: shifts from peat obsidian to warm candlelight obsidian
    const clearR = 0.035 + tone * 0.016;
    const clearG = 0.035;
    const clearB = Math.max(0.012, 0.043 - tone * 0.028);

    const encoder = this.device.createCommandEncoder({ label: 'GullRender_Encoder' });
    const pass = encoder.beginRenderPass({
      label: 'GullRender_Pass',
      colorAttachments: [
        {
          view: colorView,
          clearValue: { r: clearR, g: clearG, b: clearB, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store'
        },
        {
          view: this.pickTextureView,
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          loadOp: 'clear',
          storeOp: 'store'
        }
      ],
      depthStencilAttachment: {
        view: this.depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'discard'
      }
    });

    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);

    for (const mesh of this.meshes.values()) {
      pass.setVertexBuffer(0, mesh.vertexBuffer);
      pass.setIndexBuffer(mesh.indexBuffer, 'uint16');
      pass.drawIndexed(mesh.indexCount);
    }

    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  async pickPartAt(x: number, y: number): Promise<number> {
    if (!this.isInitialized || !this.pickTexture) return 0;

    const clampedX = Math.max(0, Math.min(this.pickTexture.width - 1, Math.floor(x)));
    const clampedY = Math.max(0, Math.min(this.pickTexture.height - 1, Math.floor(y)));

    const encoder = this.device.createCommandEncoder({ label: 'GullRender_PickEncoder' });
    encoder.copyTextureToBuffer(
      {
        texture: this.pickTexture,
        origin: [clampedX, clampedY, 0]
      },
      {
        buffer: this.pickStagingBuffer,
        bytesPerRow: 256 // Minimum 256-byte alignment required by WebGPU spec
      },
      [1, 1]
    );

    this.device.queue.submit([encoder.finish()]);

    await this.pickStagingBuffer.mapAsync(GPUMapMode.READ);
    const mapped = new Uint32Array(this.pickStagingBuffer.getMappedRange(0, 4));
    const pickedId = mapped[0];
    this.pickStagingBuffer.unmap();

    return pickedId;
  }

  resize(width: number, height: number): void {
    if (!this.device || width <= 0 || height <= 0) return;

    this.depthTexture?.destroy();
    this.depthTexture = this.device.createTexture({
      size: [width, height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT
    });
    this.depthTextureView = this.depthTexture.createView();

    this.pickTexture?.destroy();
    this.pickTexture = this.device.createTexture({
      size: [width, height],
      format: 'r32uint',
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
    });
    this.pickTextureView = this.pickTexture.createView();
  }

  destroy(): void {
    this.depthTexture?.destroy();
    this.pickTexture?.destroy();
    this.pickStagingBuffer?.destroy();
    this.uniformBuffer?.destroy();
    for (const mesh of this.meshes.values()) {
      mesh.vertexBuffer.destroy();
      mesh.indexBuffer.destroy();
    }
    this.meshes.clear();
    this.device?.destroy();
    this.isInitialized = false;
  }
}
