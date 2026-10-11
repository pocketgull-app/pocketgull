/**
 * WebGPU TypeScript Ambient Type Definitions for GullRender
 * 
 * Provides sound type safety for W3C WebGPU interfaces across environments
 * where @webgpu/types is not globally registered.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare interface Navigator {
  readonly gpu?: GPU;
}

declare interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}

declare interface GPU {
  requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

declare interface GPURequestAdapterOptions {
  powerPreference?: 'low-power' | 'high-performance';
  forceFallbackAdapter?: boolean;
}

declare interface GPUAdapter {
  requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  readonly limits: Record<string, number>;
}

declare interface GPUDeviceDescriptor {
  label?: string;
  requiredFeatures?: string[];
  requiredLimits?: Record<string, number>;
}

declare interface GPUDevice {
  readonly queue: GPUQueue;
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder;
  destroy(): void;
}

declare interface GPUQueue {
  writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: number,
    data: BufferSource | SharedArrayBuffer,
    dataOffset?: number,
    size?: number
  ): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

declare interface GPUBufferDescriptor {
  label?: string;
  size: number;
  usage: number;
  mappedAtCreation?: boolean;
}

declare interface GPUBuffer {
  readonly size: number;
  readonly usage: number;
  getMappedRange(offset?: number, size?: number): ArrayBuffer;
  unmap(): void;
  mapAsync(mode: number, offset?: number, size?: number): Promise<void>;
  destroy(): void;
}

declare interface GPUTextureDescriptor {
  label?: string;
  size: [number, number] | [number, number, number];
  format: GPUTextureFormat;
  usage: number;
  sampleCount?: number;
}

declare interface GPUTexture {
  readonly width: number;
  readonly height: number;
  readonly format: GPUTextureFormat;
  createView(descriptor?: any): GPUTextureView;
  destroy(): void;
}

declare interface GPUTextureView {
  readonly label?: string;
}

declare interface GPUShaderModuleDescriptor {
  label?: string;
  code: string;
}

declare interface GPUShaderModule {
  readonly label?: string;
}

declare interface GPURenderPipelineDescriptor {
  label?: string;
  layout: 'auto' | any;
  vertex: {
    module: GPUShaderModule;
    entryPoint: string;
    buffers?: GPUVertexBufferLayout[];
  };
  fragment?: {
    module: GPUShaderModule;
    entryPoint: string;
    targets: GPUColorTargetState[];
  };
  primitive?: {
    topology?: 'point-list' | 'line-list' | 'line-strip' | 'triangle-list' | 'triangle-strip';
    cullMode?: 'none' | 'front' | 'back';
    frontFace?: 'ccw' | 'cw';
  };
  depthStencil?: {
    format: GPUTextureFormat;
    depthWriteEnabled?: boolean;
    depthCompare?: 'never' | 'less' | 'equal' | 'less-equal' | 'greater' | 'not-equal' | 'greater-equal' | 'always';
  };
  multisample?: {
    count?: number;
  };
}

declare interface GPUVertexBufferLayout {
  arrayStride: number;
  stepMode?: 'vertex' | 'instance';
  attributes: GPUVertexAttribute[];
}

declare interface GPUVertexAttribute {
  format: 'float32' | 'float32x2' | 'float32x3' | 'float32x4' | 'uint32' | 'sint32';
  offset: number;
  shaderLocation: number;
}

declare interface GPUColorTargetState {
  format: GPUTextureFormat;
  blend?: any;
  writeMask?: number;
}

declare interface GPURenderPipeline {
  readonly label?: string;
  getBindGroupLayout(index: number): any;
}

declare interface GPUBindGroupDescriptor {
  label?: string;
  layout: any;
  entries: GPUBindGroupEntry[];
}

declare interface GPUBindGroupEntry {
  binding: number;
  resource: { buffer: GPUBuffer } | any;
}

declare interface GPUBindGroup {
  readonly label?: string;
}

declare interface GPUCommandEncoderDescriptor {
  label?: string;
}

declare interface GPUCommandEncoder {
  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
  copyTextureToBuffer(
    source: { texture: GPUTexture; origin?: [number, number, number] },
    destination: { buffer: GPUBuffer; bytesPerRow: number },
    copySize: [number, number] | [number, number, number]
  ): void;
  finish(): GPUCommandBuffer;
}

declare interface GPURenderPassDescriptor {
  label?: string;
  colorAttachments: GPURenderPassColorAttachment[];
  depthStencilAttachment?: GPURenderPassDepthStencilAttachment;
}

declare interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  clearValue?: { r: number; g: number; b: number; a: number };
  loadOp: 'load' | 'clear';
  storeOp: 'store' | 'discard';
}

declare interface GPURenderPassDepthStencilAttachment {
  view: GPUTextureView;
  depthClearValue?: number;
  depthLoadOp: 'load' | 'clear';
  depthStoreOp: 'store' | 'discard';
}

declare interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer, offset?: number, size?: number): void;
  setIndexBuffer(buffer: GPUBuffer, indexFormat: 'uint16' | 'uint32', offset?: number, size?: number): void;
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
  end(): void;
}

declare interface GPUCommandBuffer {
  readonly label?: string;
}

declare interface GPUCanvasContext {
  configure(configuration: {
    device: GPUDevice;
    format: GPUTextureFormat;
    usage?: number;
    alphaMode?: 'opaque' | 'premultiplied';
  }): void;
  getCurrentTexture(): GPUTexture;
}

declare type GPUTextureFormat =
  | 'bgra8unorm'
  | 'rgba8unorm'
  | 'rgba8unorm-srgb'
  | 'r32uint'
  | 'rgba32uint'
  | 'depth24plus'
  | 'depth32float'
  | string;

declare namespace GPUBufferUsage {
  const MAP_READ: number;
  const MAP_WRITE: number;
  const COPY_SRC: number;
  const COPY_DST: number;
  const INDEX: number;
  const VERTEX: number;
  const UNIFORM: number;
  const STORAGE: number;
  const INDIRECT: number;
  const QUERY_RESOLVE: number;
}

declare namespace GPUTextureUsage {
  const COPY_SRC: number;
  const COPY_DST: number;
  const TEXTURE_BINDING: number;
  const STORAGE_BINDING: number;
  const RENDER_ATTACHMENT: number;
}

declare namespace GPUMapMode {
  const READ: number;
  const WRITE: number;
}
