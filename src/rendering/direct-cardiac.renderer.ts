/**
 * 🫀 Direct WebGL2 / WebGPU Cardiac Electrophysiology Pipeline
 * 
 * Compiles and renders the 5-phase ventricular action potential model
 * using raw WebGL2/WebGPU with ZERO Three.js dependencies.
 */

import { CARDIAC_ELECTROPHYSIOLOGY_GLSL_VS, CARDIAC_ELECTROPHYSIOLOGY_GLSL_FS } from '../shaders/cardiac-electrophysiology.glsl';
import { GullRenderEngine } from './gull-render.engine';

export interface ICardiacRenderUniforms {
  timeSec: number;
  heartRateBpm: number;
  conductionVelocity: number;
  qtcIntervalMs: number;
  eadInstability: number;
  vagalResonance: number;
  circadianTone: number;
}

export class DirectCardiacRenderer {
  private engine: GullRenderEngine;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexCount = 0;

  // Uniform locations
  private uViewProjLoc: WebGLUniformLocation | null = null;
  private uModelLoc: WebGLUniformLocation | null = null;
  private uTimeSecLoc: WebGLUniformLocation | null = null;
  private uHeartRateLoc: WebGLUniformLocation | null = null;
  private uConductionVelocityLoc: WebGLUniformLocation | null = null;
  private uQtcIntervalLoc: WebGLUniformLocation | null = null;
  private uEadInstabilityLoc: WebGLUniformLocation | null = null;
  private uVagalResonanceLoc: WebGLUniformLocation | null = null;
  private uCircadianToneLoc: WebGLUniformLocation | null = null;

  constructor(engine: GullRenderEngine) {
    this.engine = engine;
    this.gl = engine.getGL();
  }

  public init(): void {
    if (!this.gl) return;
    const gl = this.gl;

    // 1. Compile Shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, CARDIAC_ELECTROPHYSIOLOGY_GLSL_VS);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, CARDIAC_ELECTROPHYSIOLOGY_GLSL_FS);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Cardiac shader program link failed: ${info}`);
    }

    this.program = program;

    // Cache Uniform Locations
    this.uViewProjLoc = gl.getUniformLocation(program, 'uViewProjMatrix');
    this.uModelLoc = gl.getUniformLocation(program, 'uModelMatrix');
    this.uTimeSecLoc = gl.getUniformLocation(program, 'uTimeSec');
    this.uHeartRateLoc = gl.getUniformLocation(program, 'uHeartRateBpm');
    this.uConductionVelocityLoc = gl.getUniformLocation(program, 'uConductionVelocity');
    this.uQtcIntervalLoc = gl.getUniformLocation(program, 'uQtcIntervalMs');
    this.uEadInstabilityLoc = gl.getUniformLocation(program, 'uEadInstability');
    this.uVagalResonanceLoc = gl.getUniformLocation(program, 'uVagalResonance');
    this.uCircadianToneLoc = gl.getUniformLocation(program, 'uCircadianTone');

    // 2. Generate Parametric Toroid / Ellipsoid Ventricular Geometry
    this.initGeometry();
  }

  private initGeometry(): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    // Generate an ellipsoid myocardium mesh (40 rings x 40 segments)
    const rings = 40;
    const segments = 40;
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let r = 0; r <= rings; r++) {
      const theta = (r * Math.PI) / rings;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let s = 0; s <= segments; s++) {
        const phi = (s * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // Ellipsoidal tapering at cardiac apex (bottom)
        const x = cosPhi * sinTheta * 0.9;
        const y = cosTheta * 1.3;
        const z = sinPhi * sinTheta * 0.9;

        positions.push(x, y, z);
        normals.push(x, y, z);
        uvs.push(s / segments, r / rings);
      }
    }

    for (let r = 0; r < rings; r++) {
      for (let s = 0; s < segments; s++) {
        const first = r * (segments + 1) + s;
        const second = first + segments + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }

    this.vertexCount = indices.length;

    // Setup VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Positions (Location 0)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // Normals (Location 1)
    const normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    // UVs (Location 2)
    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

    // Element Indices
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
  }

  public render(params: ICardiacRenderUniforms): void {
    if (!this.gl || !this.program || !this.vao) return;
    const gl = this.gl;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.04, 0.04, 0.05, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);

    // Pass Camera Matrices
    gl.uniformMatrix4fv(this.uViewProjLoc, false, this.engine.viewProjMatrix);
    const identityModel = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
    gl.uniformMatrix4fv(this.uModelLoc, false, identityModel);

    // Pass Electrophysiology Simulation Uniforms
    gl.uniform1f(this.uTimeSecLoc, params.timeSec);
    gl.uniform1f(this.uHeartRateLoc, params.heartRateBpm);
    gl.uniform1f(this.uConductionVelocityLoc, params.conductionVelocity);
    gl.uniform1f(this.uQtcIntervalLoc, params.qtcIntervalMs);
    gl.uniform1f(this.uEadInstabilityLoc, params.eadInstability);
    gl.uniform1f(this.uVagalResonanceLoc, params.vagalResonance);
    gl.uniform1f(this.uCircadianToneLoc, params.circadianTone);

    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  private compileShader(type: number, source: string): WebGLShader {
    if (!this.gl) throw new Error('GL context lost');
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${info}`);
    }
    return shader;
  }
}
