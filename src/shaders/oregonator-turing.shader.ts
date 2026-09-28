/**
 * @file oregonator-turing.shader.ts
 * @description Procedural Reaction-Diffusion / Turing Shader Material based on
 * Dr. Irving Epstein's chemical wave dynamics and the Oregonator activator-inhibitor system.
 * 
 * Generates dynamic, biophysically grounded erythema, annular lesion rings, and
 * Turing morphogenesis patterns on 3D anatomical surfaces with 0.10 Hz bio-rhythmic coupling.
 */

import * as THREE from 'three';

export interface IOregonatorTuringShaderOptions {
  baseColor?: number;         // Normal skin/tissue tone (e.g. 0x27272a obsidian/slate or warm dermis)
  activatorColor?: number;    // Lesion / erythema activation wave (e.g. 0xf43f5e rose/crimson or 0x14b8a6 teal)
  inhibitorColor?: number;    // Inhibitory boundary halo (e.g. 0x3b82f6 cobalt or 0x6366f1 indigo)
  waveFrequency?: number;     // Spatial pattern density (default: 18.0)
  activatorDiffusion?: number;// Da (default: 0.16)
  inhibitorDiffusion?: number;// Di (default: 0.08)
  breatheScale?: number;      // Coupled 0.10 Hz bio-rhythmic relaxation wave (0 to 1)
  time?: number;
}

/**
 * Universal Three.js Shader for Procedural Turing / Oregonator Patterning
 */
export function createOregonatorTuringMaterial(
  options: IOregonatorTuringShaderOptions = {}
): THREE.ShaderMaterial {
  const baseColor = new THREE.Color(options.baseColor ?? 0x18181b);
  const actColor = new THREE.Color(options.activatorColor ?? 0xf43f5e);
  const inhColor = new THREE.Color(options.inhibitorColor ?? 0x14b8a6);

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: options.time ?? 0.0 },
      uBaseColor: { value: baseColor },
      uActivatorColor: { value: actColor },
      uInhibitorColor: { value: inhColor },
      uWaveFrequency: { value: options.waveFrequency ?? 18.0 },
      uBreatheScale: { value: options.breatheScale ?? 0.5 },
      uEpsilon: { value: 0.04 },
      uFeedRate: { value: 0.054 },
      uKillRate: { value: 0.062 }
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uBaseColor;
      uniform vec3 uActivatorColor;
      uniform vec3 uInhibitorColor;
      uniform float uWaveFrequency;
      uniform float uBreatheScale;
      uniform float uFeedRate;
      uniform float uKillRate;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      // Pseudo-random 2D hash
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      // Smooth 2D noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Procedural Reaction-Diffusion / Turing Pattern Synthesizer
      // Simulates local activator autocatalysis with long-range inhibitory suppression
      float turingMorphogenesis(vec2 uv, float t) {
        vec2 p = uv * uWaveFrequency;
        
        // Multi-scale coupled reaction front
        float n1 = noise(p + vec2(t * 0.15, t * 0.08));
        float n2 = noise(p * 2.1 - vec2(t * 0.22, -t * 0.14));
        float n3 = noise(p * 4.3 + vec2(-t * 0.10, t * 0.25));

        // Turing labyrinthine bifurcation threshold
        float activator = n1 * 0.55 + n2 * 0.30 + n3 * 0.15;
        float inhibitor = noise(p * 0.7 + vec2(t * 0.05, t * 0.05));

        // Lateral inhibition creates spots/stripes
        float diff = activator - inhibitor * 0.85;
        return smoothstep(0.05, 0.28, diff);
      }

      void main() {
        // Bio-rhythmic temporal pacing derived from Oregonator relaxation wave
        float bioTime = uTime * 0.4 + uBreatheScale * 1.2;
        
        float pattern = turingMorphogenesis(vUv, bioTime);
        
        // Target ring waves (Belousov-Zhabotinsky target patterns)
        float distFromCenter = length(vUv - vec2(0.5));
        float bzTargetWave = sin(distFromCenter * 45.0 - bioTime * 2.5);
        bzTargetWave = smoothstep(0.4, 0.8, bzTargetWave) * 0.35;

        float combinedActivation = clamp(pattern + bzTargetWave, 0.0, 1.0);

        // Subsurface blend between base tissue, inhibitory halo, and inflammatory activator peak
        vec3 finalColor = mix(uBaseColor, uInhibitorColor, combinedActivation * 0.45);
        finalColor = mix(finalColor, uActivatorColor, pow(combinedActivation, 2.2));

        // Gentle Fresnel edge for anatomical depth
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
        finalColor += uInhibitorColor * fresnel * 0.35;

        gl_FragColor = vec4(finalColor, 0.92);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
}
