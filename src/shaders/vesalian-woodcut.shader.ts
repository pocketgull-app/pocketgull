/**
 * PocketGull Vesalian-Calcar 1543 Woodcut Cross-Hatching Shader
 * 
 * Implements non-photorealistic procedural woodcut cross-hatching inspired by
 * Jan Stephen van Calcar & Andreas Vesalius (De Humani Corporis Fabrica, 1543).
 * 
 * Features:
 * 1. Directional Pennation Force Vector: Hatch lines orient along muscle fiber angles.
 * 2. Multi-tier Chiaroscuro: Highlight (single hatch), Midtone (cross-hatch), Shadow (dense).
 * 3. Isochoric Contraction Luster: Active muscle bellies glow with warm etched copper (#f59e0b).
 * 4. Dual Obsidian (#09090b) and Washi (#FAF8F0) tonal palette support.
 */

import * as THREE from 'three';

export interface IVesalianWoodcutOptions {
  hatchScale?: number;        // Frequency of hatching lines (e.g. 24.0)
  pennationAngleDeg?: number; // Muscle fiber pull angle (0 to 180 deg)
  inkColor?: number;          // Hex, e.g. 0xf59e0b (Copper) or 0x18181b (Charcoal)
  paperColor?: number;        // Hex, e.g. 0x09090b (Obsidian) or 0xfaf8f0 (Washi)
  muscleTension?: number;     // 0.0 (relaxed) to 1.0 (fully contracted)
  scotopicMode?: boolean;     // Dark obsidian background mode
}

/**
 * Universal WGSL Source for Vesalian Woodcut Rendering.
 * Compiles cleanly to D3D12/HLSL, Vulkan/SPIR-V, and Metal/MSL.
 */
export const WGSL_VESALIAN_WOODCUT_SOURCE = /* wgsl */ `
struct WoodcutUniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
    lightDirection: vec3<f32>,
    hatchScale: f32,
    pennationAngleRad: f32,
    muscleTension: f32,
    inkColor: vec4<f32>,
    paperColor: vec4<f32>,
    activeLusterColor: vec4<f32>,
};

@group(0) @binding(0) var<uniform> u: WoodcutUniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) uv: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) clipPosition: vec4<f32>,
    @location(0) normal: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) lightIntensity: f32,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.clipPosition = u.modelViewProjectionMatrix * vec4<f32>(in.position, 1.0);
    out.normal = in.normal;
    out.uv = in.uv;
    out.lightIntensity = max(dot(normalize(in.normal), normalize(u.lightDirection)), 0.0);
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let cosTheta = cos(u.pennationAngleRad);
    let sinTheta = sin(u.pennationAngleRad);
    let rotatedUv = vec2<f32>(
        in.uv.x * cosTheta - in.uv.y * sinTheta,
        in.uv.x * sinTheta + in.uv.y * cosTheta
    ) * u.hatchScale;

    // Primary pennate woodcut line (45 deg relative to rotated UV)
    let hatch1 = step(0.5, fract(rotatedUv.x + rotatedUv.y));
    // Opposing 90 deg cross-hatch for shadow density
    let hatch2 = step(0.5, fract(rotatedUv.x - rotatedUv.y));

    var inkDensity: f32 = 1.0;
    if (in.lightIntensity < 0.75) {
        inkDensity = inkDensity * hatch1;
    }
    if (in.lightIntensity < 0.40) {
        inkDensity = inkDensity * hatch2;
    }

    let baseColor = mix(u.inkColor, u.paperColor, inkDensity);
    let finalColor = mix(baseColor, u.activeLusterColor, u.muscleTension * (1.0 - in.lightIntensity * 0.5));
    return finalColor;
}
`;

/**
 * Three.js GLSL Material Generator for Vesalian Woodcut Hatching.
 */
export function createVesalianWoodcutMaterial(options: IVesalianWoodcutOptions = {}): THREE.ShaderMaterial {
  const hatchScale = options.hatchScale ?? 24.0;
  const pennationDeg = options.pennationAngleDeg ?? 45.0;
  const pennationRad = (pennationDeg * Math.PI) / 180.0;
  const muscleTension = options.muscleTension ?? 0.0;
  const isScotopic = options.scotopicMode ?? true;

  const inkColorHex = options.inkColor ?? (isScotopic ? 0xf59e0b : 0x1c1917);
  const paperColorHex = options.paperColor ?? (isScotopic ? 0x09090b : 0xfaf8f0);
  const lusterColorHex = isScotopic ? 0x14b8a6 : 0xd97706;

  const uniforms = {
    uLightDir: { value: new THREE.Vector3(1.0, 1.5, 2.0).normalize() },
    uHatchScale: { value: hatchScale },
    uPennationAngleRad: { value: pennationRad },
    uMuscleTension: { value: muscleTension },
    uInkColor: { value: new THREE.Color(inkColorHex) },
    uPaperColor: { value: new THREE.Color(paperColorHex) },
    uLusterColor: { value: new THREE.Color(lusterColorHex) },
    uScotopicMode: { value: isScotopic ? 1.0 : 0.0 }
  };

  const vertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying float vLightIntensity;
    uniform vec3 uLightDir;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      vLightIntensity = max(dot(vNormal, normalize(uLightDir)), 0.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vLightIntensity;

    uniform float uHatchScale;
    uniform float uPennationAngleRad;
    uniform float uMuscleTension;
    uniform vec3 uInkColor;
    uniform vec3 uPaperColor;
    uniform vec3 uLusterColor;
    uniform float uScotopicMode;

    void main() {
      float c = cos(uPennationAngleRad);
      float s = sin(uPennationAngleRad);
      vec2 rotUv = vec2(
        vUv.x * c - vUv.y * s,
        vUv.x * s + vUv.y * c
      ) * uHatchScale;

      // Chiaroscuro procedural woodcut strokes
      float hatch1 = step(0.48, fract(rotUv.x + rotUv.y));
      float hatch2 = step(0.48, fract(rotUv.x - rotUv.y));
      float hatch3 = step(0.52, fract(rotUv.y * 2.0));

      float pattern = 1.0;
      if (vLightIntensity < 0.85) {
        pattern *= hatch1;
      }
      if (vLightIntensity < 0.50) {
        pattern *= hatch2;
      }
      if (vLightIntensity < 0.22) {
        pattern *= hatch3;
      }

      // In scotopic mode: ink lines glow against obsidian dark background
      vec3 finalBase;
      if (uScotopicMode > 0.5) {
        finalBase = mix(uInkColor, uPaperColor, pattern);
      } else {
        finalBase = mix(uPaperColor, uInkColor, 1.0 - pattern);
      }

      // Muscle contraction luster (active motor units glow with warm copper/amber)
      vec3 outputColor = mix(finalBase, uLusterColor, uMuscleTension * 0.75);

      gl_FragColor = vec4(outputColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: false,
    side: THREE.DoubleSide
  });
}
