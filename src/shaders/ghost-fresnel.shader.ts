/**
 * PocketGull Fresnel Ghost Envelope & Localized Cutaway Shader
 * 
 * Implements ethereal translucent silhouette rendering with localized spherical
 * cutaway aperture lenses for patient-facing anatomical education.
 * 
 * Features:
 * 1. Fresnel Silhouette Rim: High grazing-angle opacity (0.88) with near-transparent
 *    direct view angle (0.08) to eliminate "murky plastic" visual clutter.
 * 2. Bio-Rhythmic Respiratory Coupling: Rim intensity gently breathes with the
 *    0.1 Hz Rachel Nabors parasympathetic vagal cycle.
 * 3. Localized Spherical Cutaway Aperture: Smoothly carves an optical window into
 *    deep bones and nerves while keeping the rest of the body as a serene ghost.
 */

import * as THREE from 'three';

export interface IGhostFresnelOptions {
  rimColor?: number;          // Hex, e.g. 0x14b8a6 (GearTeal) or 0x38bdf8 (Cyan)
  obsidianColor?: number;     // Hex, e.g. 0x09090b (Dark Obsidian Base)
  rimPower?: number;          // Power curve exponent (2.0 to 4.0)
  innerAlpha?: number;        // Face-on transparency (0.02 to 0.15)
  rimAlpha?: number;          // Silhouette edge opacity (0.75 to 0.95)
  breatheScale?: number;      // 0.1 Hz vagal resonant respiratory scale
  cutawayCenter?: THREE.Vector3; // World space coordinates of the localized cutaway lens
  cutawayRadius?: number;     // Radius of cutaway aperture (in meters / world units)
  cutawayFalloff?: number;    // Soft transition boundary
  cutawayActive?: boolean;    // Toggle localized lens vs whole-body ghost
}

/**
 * Universal WGSL Source for the Ghost Fresnel Envelope.
 * Compiles cleanly to D3D12 (HLSL), Vulkan (SPIR-V), and Metal (MSL).
 */
export const WGSL_GHOST_FRESNEL_SOURCE = /* wgsl */ `
struct GhostUniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
    modelMatrix: mat4x4<f32>,
    cameraPosition: vec3<f32>,
    rimColor: vec4<f32>,
    obsidianColor: vec4<f32>,
    cutawayCenter: vec3<f32>,
    rimPower: f32,
    innerAlpha: f32,
    rimAlpha: f32,
    breatheScale: f32,
    cutawayRadius: f32,
    cutawayFalloff: f32,
    cutawayActive: f32,
};

@group(0) @binding(0) var<uniform> u: GhostUniforms;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
};

struct VertexOutput {
    @builtin(position) clipPosition: vec4<f32>,
    @location(0) worldNormal: vec3<f32>,
    @location(1) worldPosition: vec3<f32>,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    let worldPos4 = u.modelMatrix * vec4<f32>(in.position, 1.0);
    out.worldPosition = worldPos4.xyz;
    out.clipPosition = u.modelViewProjectionMatrix * vec4<f32>(in.position, 1.0);
    out.worldNormal = normalize((u.modelMatrix * vec4<f32>(in.normal, 0.0)).xyz);
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let viewDir = normalize(u.cameraPosition - in.worldPosition);
    let NdotV = max(dot(in.worldNormal, viewDir), 0.0);
    let fresnel = pow(1.0 - NdotV, u.rimPower);

    var alpha = mix(u.innerAlpha, u.rimAlpha, fresnel) * (0.9 + 0.1 * u.breatheScale);

    // Localized Spherical Cutaway Aperture Check
    if (u.cutawayActive > 0.5) {
        let dist = distance(in.worldPosition, u.cutawayCenter);
        let cutawayMask = smoothstep(u.cutawayRadius - u.cutawayFalloff, u.cutawayRadius, dist);
        alpha = alpha * cutawayMask;
    }

    let color = mix(u.obsidianColor.rgb, u.rimColor.rgb, fresnel);
    return vec4<f32>(color, alpha);
}
`;

/**
 * Three.js GLSL Material Generator for the Fresnel Ghost Envelope.
 */
export function createGhostFresnelMaterial(options: IGhostFresnelOptions = {}): THREE.ShaderMaterial {
  const rimColorHex = options.rimColor ?? 0x14b8a6;
  const obsidianHex = options.obsidianColor ?? 0x09090b;
  const rimPower = options.rimPower ?? 2.8;
  const innerAlpha = options.innerAlpha ?? 0.08;
  const rimAlpha = options.rimAlpha ?? 0.88;
  const breatheScale = options.breatheScale ?? 1.0;
  const cutawayCenter = options.cutawayCenter ?? new THREE.Vector3(0, 0.82, -0.1); // Default L4-L5 lumbar locus
  const cutawayRadius = options.cutawayRadius ?? 0.32;
  const cutawayFalloff = options.cutawayFalloff ?? 0.08;
  const cutawayActive = options.cutawayActive ?? false;

  const uniforms = {
    uRimColor: { value: new THREE.Color(rimColorHex) },
    uObsidianColor: { value: new THREE.Color(obsidianHex) },
    uRimPower: { value: rimPower },
    uInnerAlpha: { value: innerAlpha },
    uRimAlpha: { value: rimAlpha },
    uBreatheScale: { value: breatheScale },
    uCutawayCenter: { value: cutawayCenter },
    uCutawayRadius: { value: cutawayRadius },
    uCutawayFalloff: { value: cutawayFalloff },
    uCutawayActive: { value: cutawayActive ? 1.0 : 0.0 }
  };

  const vertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;

    uniform vec3 uRimColor;
    uniform vec3 uObsidianColor;
    uniform float uRimPower;
    uniform float uInnerAlpha;
    uniform float uRimAlpha;
    uniform float uBreatheScale;
    uniform vec3 uCutawayCenter;
    uniform float uCutawayRadius;
    uniform float uCutawayFalloff;
    uniform float uCutawayActive;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      float NdotV = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - NdotV, uRimPower);

      // Modulate base alpha with scotopic rim falloff and 0.1 Hz respiratory scale
      float alpha = mix(uInnerAlpha, uRimAlpha, fresnel) * (0.90 + 0.10 * uBreatheScale);

      // Localized Spherical Cutaway Aperture Lens
      if (uCutawayActive > 0.5) {
        float dist = distance(vWorldPosition, uCutawayCenter);
        float cutawayMask = smoothstep(uCutawayRadius - uCutawayFalloff, uCutawayRadius, dist);
        alpha *= cutawayMask;
      }

      vec3 finalColor = mix(uObsidianColor, uRimColor, fresnel);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending
  });
}
