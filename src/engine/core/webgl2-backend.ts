/**
 * Tier 2 WebGL 2.0 Fallback Backend for GullRender
 * 
 * Provides universal compatibility across enterprise Citrix virtual desktops,
 * older iPad exam room mounts, and browsers where WebGPU is unavailable.
 * Features:
 * - GLSL ES 3.00 shader pipeline
 * - VAO/VBO/EBO interleaved buffer management
 * - R32UI offscreen framebuffer for O(1) integer part picking via gl.readPixels
 */

import { IRendererBackend, IRawGpuMesh, IUniformPayload, RendererBackendType } from './renderer-backend.interface';
import { CARDIAC_ELECTROPHYSIOLOGY_GLSL_VS, CARDIAC_ELECTROPHYSIOLOGY_GLSL_FS } from '../../shaders/cardiac-electrophysiology.glsl';

interface IGlMeshHandle {
  vao: WebGLVertexArrayObject;
  vbo: WebGLBuffer;
  ebo: WebGLBuffer;
  indexCount: number;
  partId: number;
}

export class WebGl2Backend implements IRendererBackend {
  readonly backendType: RendererBackendType = 'webgl2';
  isInitialized = false;

  private canvas!: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;

  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private meshes: Map<number, IGlMeshHandle> = new Map();
  private nextMeshId = 1;

  // Offscreen Framebuffer for Picking
  private pickFbo: WebGLFramebuffer | null = null;
  private pickTexture: WebGLTexture | null = null;
  private pickDepthRbo: WebGLRenderbuffer | null = null;

  async init(canvas: HTMLCanvasElement): Promise<boolean> {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    if (!gl) return false;

    this.canvas = canvas;
    this.gl = gl;

    // 1. Compile Shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, CARDIAC_ELECTROPHYSIOLOGY_GLSL_VS);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, CARDIAC_ELECTROPHYSIOLOGY_GLSL_FS);
    if (!vs || !fs) return false;

    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[GullRender] WebGL2 program link failed:', gl.getProgramInfoLog(prog));
      return false;
    }
    this.program = prog;

    // 2. Cache Uniform Locations
    const uniformNames = [
      'uViewProjMatrix', 'uModelMatrix', 'uCameraPos', 'uTimeSec',
      'uHeartRateBpm', 'uConductionVelocity', 'uQtcIntervalMs',
      'uEadInstability', 'uMeshPartId'
    ];
    for (const name of uniformNames) {
      this.uniformLocations[name] = gl.getUniformLocation(prog, name);
    }

    // 3. Setup Offscreen Picking Framebuffer
    this.setupPickFramebuffer(canvas.width || 640, canvas.height || 480);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.isInitialized = true;
    return true;
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('[GullRender] WebGL2 shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  uploadMesh(mesh: IRawGpuMesh): number {
    const gl = this.gl;
    const handleId = this.nextMeshId++;

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    const ebo = gl.createBuffer();

    if (!vao || !vbo || !ebo) return 0;

    gl.bindVertexArray(vao);

    // Upload interleaved [pos(3), norm(3), uv(2)] (stride = 32 bytes)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertexData, gl.STATIC_DRAW);

    // Attribute 0: Position (vec3, offset 0)
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);

    // Attribute 1: Normal (vec3, offset 12)
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);

    // Attribute 2: UV (vec2, offset 24)
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);

    // Upload index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indexData, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    this.meshes.set(handleId, {
      vao,
      vbo,
      ebo,
      indexCount: mesh.indexCount,
      partId: mesh.partId ?? 1
    });

    return handleId;
  }

  clearMeshes(): void {
    const gl = this.gl;
    if (gl) {
      for (const mesh of this.meshes.values()) {
        gl.deleteVertexArray(mesh.vao);
        gl.deleteBuffer(mesh.vbo);
        gl.deleteBuffer(mesh.ebo);
      }
    }
    this.meshes.clear();
  }

  updateUniforms(payload: IUniformPayload): void {
    if (!this.isInitialized) return;
    const gl = this.gl;
    gl.useProgram(this.program);

    if (this.uniformLocations['uViewProjMatrix']) {
      gl.uniformMatrix4fv(this.uniformLocations['uViewProjMatrix'], false, payload.viewProjMatrix);
    }
    if (this.uniformLocations['uModelMatrix']) {
      gl.uniformMatrix4fv(this.uniformLocations['uModelMatrix'], false, payload.modelMatrix);
    }
    if (this.uniformLocations['uCameraPos']) {
      gl.uniform3f(this.uniformLocations['uCameraPos'], payload.cameraPos[0], payload.cameraPos[1], payload.cameraPos[2]);
    }
    if (this.uniformLocations['uTimeSec']) {
      gl.uniform1f(this.uniformLocations['uTimeSec'], payload.timeSec);
    }
    if (this.uniformLocations['uHeartRateBpm']) {
      gl.uniform1f(this.uniformLocations['uHeartRateBpm'], payload.heartRateBpm);
    }
    if (this.uniformLocations['uConductionVelocity']) {
      gl.uniform1f(this.uniformLocations['uConductionVelocity'], payload.conductionVelocity);
    }
    if (this.uniformLocations['uQtcIntervalMs']) {
      gl.uniform1f(this.uniformLocations['uQtcIntervalMs'], payload.qtcIntervalMs);
    }
    if (this.uniformLocations['uEadInstability']) {
      gl.uniform1f(this.uniformLocations['uEadInstability'], payload.eadInstability);
    }
    if (this.uniformLocations['uMeshPartId']) {
      gl.uniform1ui(this.uniformLocations['uMeshPartId'], payload.meshPartId);
    }
  }

  renderFrame(): void {
    if (!this.isInitialized || this.meshes.size === 0) return;
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render to Screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.035, 0.035, 0.043, 1.0); // Dark obsidian base
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);
    for (const mesh of this.meshes.values()) {
      if (this.uniformLocations['uMeshPartId']) {
        gl.uniform1ui(this.uniformLocations['uMeshPartId'], mesh.partId);
      }
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    // 2. Render to Offscreen Picking Framebuffer
    if (this.pickFbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickFbo);
      gl.clearBufferuiv(gl.COLOR, 0, new Uint32Array([0, 0, 0, 0]));
      gl.clear(gl.DEPTH_BUFFER_BIT);

      for (const mesh of this.meshes.values()) {
        if (this.uniformLocations['uMeshPartId']) {
          gl.uniform1ui(this.uniformLocations['uMeshPartId'], mesh.partId);
        }
        gl.bindVertexArray(mesh.vao);
        gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
  }

  async pickPartAt(x: number, y: number): Promise<number> {
    if (!this.isInitialized || !this.pickFbo) return 0;
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickFbo);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);

    const pixelBuf = new Uint32Array(4);
    // WebGL coordinate space starts from bottom-left
    const glY = Math.max(0, Math.min(this.canvas.height - 1, this.canvas.height - Math.floor(y) - 1));
    const glX = Math.max(0, Math.min(this.canvas.width - 1, Math.floor(x)));

    gl.readPixels(glX, glY, 1, 1, gl.RGBA_INTEGER, gl.UNSIGNED_INT, pixelBuf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return pixelBuf[0];
  }

  private setupPickFramebuffer(width: number, height: number): void {
    const gl = this.gl;
    if (this.pickFbo) gl.deleteFramebuffer(this.pickFbo);
    if (this.pickTexture) gl.deleteTexture(this.pickTexture);
    if (this.pickDepthRbo) gl.deleteRenderbuffer(this.pickDepthRbo);

    this.pickFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickFbo);

    this.pickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32UI, width, height, 0, gl.RGBA_INTEGER, gl.UNSIGNED_INT, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickTexture, 0);

    this.pickDepthRbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickDepthRbo);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickDepthRbo);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resize(width: number, height: number): void {
    if (this.isInitialized && width > 0 && height > 0) {
      this.setupPickFramebuffer(width, height);
    }
  }

  destroy(): void {
    const gl = this.gl;
    if (!gl) return;
    for (const mesh of this.meshes.values()) {
      gl.deleteVertexArray(mesh.vao);
      gl.deleteBuffer(mesh.vbo);
      gl.deleteBuffer(mesh.ebo);
    }
    this.meshes.clear();
    if (this.pickFbo) gl.deleteFramebuffer(this.pickFbo);
    if (this.pickTexture) gl.deleteTexture(this.pickTexture);
    if (this.pickDepthRbo) gl.deleteRenderbuffer(this.pickDepthRbo);
    if (this.program) gl.deleteProgram(this.program);
    this.isInitialized = false;
  }
}
