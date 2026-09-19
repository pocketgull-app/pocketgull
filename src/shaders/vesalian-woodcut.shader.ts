/**
 * PocketGull Vesalian-Calcar 1543 Woodcut Cross-Hatching Shader
 * 
 * Implements non-photorealistic procedural woodcut carving styles inspired by
 * Jan Stephen van Calcar & Andreas Vesalius (De Humani Corporis Fabrica, 1543),
 * augmented with the 5 tactile relief cut styles from Atelier Xylem (Lots of Wood Studies):
 * 1. V-Ribbed (V-Parting Chisel): Knife-bevel facets, crisp tendon lines, sharp dynamic stroke depth.
 * 2. Fluted (U-Gouge Trough): Concave hollows capturing velvety chiaroscuro in contractile muscle meat.
 * 3. Reeded (Convex Parallel Ridge): Proud rounded ridges catching highlights along pennate fiber paths.
 * 4. Slatted (Architectural Louver): Stepped rhythmic dado cuts for skeletal vertebrae and ribs.
 * 5. Burl (Swirling Growth Knot): Organic concentric knot whorls for joint capsules and cartilage.
 * 6. Camaïeu Auto (Multi-Block Master Plate): Tissue-adaptive routing blending all carving profiles.
 */

import * as THREE from 'three';

export type WoodCutType = 'v_ribbed' | 'fluted' | 'reeded' | 'slatted' | 'burl' | 'camaieu_auto';

export interface IVesalianWoodcutOptions {
  hatchScale?: number;        // Frequency of hatching lines (e.g. 26.0)
  pennationAngleDeg?: number; // Muscle fiber pull angle (0 to 180 deg)
  inkColor?: number;          // Hex, e.g. 0xf59e0b (Copper) or 0x18181b (Charcoal)
  paperColor?: number;        // Hex, e.g. 0x09090b (Obsidian) or 0xfaf8f0 (Washi)
  muscleTension?: number;     // 0.0 (relaxed) to 1.0 (fully contracted)
  scotopicMode?: boolean;     // Dark obsidian background mode
  woodCutType?: WoodCutType;  // Carving profile from Lots-of-Wood-Studies
  grainStrength?: number;     // Pearwood cellulose grain perturbation (0.0 to 1.0)
  reliefDepth?: number;       // Physical surface normal bump depth (0.0 to 4.0, default 1.8)
}

/**
 * Universal WGSL Source for Vesalian Woodcut Rendering with 5 Relief Profiles.
 * Compiles cleanly to D3D12/HLSL, Vulkan/SPIR-V, and Metal/MSL.
 */
export const WGSL_VESALIAN_WOODCUT_SOURCE = /* wgsl */ `
struct WoodcutUniforms {
    modelViewProjectionMatrix: mat4x4<f32>,
    lightDirection: vec3<f32>,
    hatchScale: f32,
    pennationAngleRad: f32,
    muscleTension: f32,
    woodCutType: f32,
    grainStrength: f32,
    reliefDepth: f32,
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
    @location(2) worldPos: vec3<f32>,
    @location(3) lightIntensity: f32,
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.clipPosition = u.modelViewProjectionMatrix * vec4<f32>(in.position, 1.0);
    out.normal = in.normal;
    out.uv = in.uv;
    out.worldPos = in.position;
    out.lightIntensity = max(dot(normalize(in.normal), normalize(u.lightDirection)), 0.0);
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let cosTheta = cos(u.pennationAngleRad);
    let sinTheta = sin(u.pennationAngleRad);
    let rawRotUv = vec2<f32>(
        in.uv.x * cosTheta - in.uv.y * sinTheta,
        in.uv.x * sinTheta + in.uv.y * cosTheta
    ) * u.hatchScale;

    // Pearwood cellulose grain perturbation
    let fiberWaver = sin(rawRotUv.x * 0.22 + sin(rawRotUv.y * 1.4) * 2.2) * 0.038 * u.grainStrength;
    let timberUv = rawRotUv + vec2<f32>(fiberWaver, -fiberWaver * 0.5);

    // Variable knife cutting depth (swells in deep shadow & high muscle tension)
    let strokeW = mix(0.12, 0.80, (1.0 - in.lightIntensity) * (1.0 + u.muscleTension * 0.35));
    let bleed = 0.035;

    var pattern: f32 = 1.0;
    let cutMode = u.woodCutType;

    // 0: V-Ribbed, 1: Fluted, 2: Reeded, 3: Slatted, 4: Burl, 5: Camaïeu Auto
    if (cutMode < 0.5 || cutMode > 4.5) {
        // V-Ribbed: Crisp parting tool incisions with knife-bevel facets
        let h1 = smoothstep(0.5 - strokeW * 0.5 - bleed, 0.5 - strokeW * 0.5 + bleed, fract(timberUv.x + timberUv.y));
        let h2 = smoothstep(0.5 - strokeW * 0.4 - bleed, 0.5 - strokeW * 0.4 + bleed, fract(timberUv.x - timberUv.y));
        if (in.lightIntensity < 0.80) { pattern = pattern * h1; }
        if (in.lightIntensity < 0.45) { pattern = pattern * h2; }
    } else if (cutMode < 1.5) {
        // Fluted: Semicircular U-gouge troughs cradling velvety shadow
        let fluteWave = sin((timberUv.x - timberUv.y) * 3.14159);
        let fluteShade = smoothstep(-0.6, 0.85, fluteWave * (1.0 - in.lightIntensity));
        let fluteHatch = smoothstep(0.4 - strokeW * 0.3, 0.6 + strokeW * 0.3, fract(timberUv.x * 0.8));
        pattern = mix(fluteShade, fluteHatch, 0.5);
    } else if (cutMode < 2.5) {
        // Reeded: Proud convex rounded ridges catching highlights along pennate fiber paths
        let reedRidge = abs(fract(timberUv.x * 1.3) - 0.5) * 2.0;
        pattern = smoothstep(0.35, 0.75, reedRidge + (1.0 - in.lightIntensity) * 0.55);
    } else if (cutMode < 3.5) {
        // Slatted: Stepped architectural parallel louvers for skeletal structure
        let slatBar = step(0.32, fract(timberUv.y * 1.6));
        pattern = mix(slatBar, 1.0, in.lightIntensity * 0.70);
    } else {
        // Burl: Concentric growth knot whorls across joint capsules
        let knotDist = length(fract(timberUv * 0.35) - vec2<f32>(0.5, 0.5));
        let burlWhorl = sin(knotDist * 22.0 + sin(timberUv.x * 1.8) * 3.0);
        pattern = smoothstep(0.40 - strokeW * 0.3, 0.60 + strokeW * 0.3, fract(burlWhorl * 0.5 + timberUv.x));
    }

    let baseColor = mix(u.inkColor, u.paperColor, pattern);
    let finalColor = mix(baseColor, u.activeLusterColor, u.muscleTension * (1.0 - in.lightIntensity * 0.45));
    return finalColor;
}
`;

/**
 * Maps wood cut type string to numeric uniform code.
 */
export function getWoodCutTypeCode(type: WoodCutType): number {
  switch (type) {
    case 'v_ribbed': return 0.0;
    case 'fluted': return 1.0;
    case 'reeded': return 2.0;
    case 'slatted': return 3.0;
    case 'burl': return 4.0;
    case 'camaieu_auto':
    default:
      return 5.0;
  }
}

/**
 * Three.js GLSL Material Generator for Vesalian Woodcut Hatching with 5 Relief Profiles
 * and Physically-Based Surface Normal Perturbation.
 */
export function createVesalianWoodcutMaterial(options: IVesalianWoodcutOptions = {}): THREE.ShaderMaterial {
  const hatchScale = options.hatchScale ?? 26.0;
  const pennationDeg = options.pennationAngleDeg ?? 35.0;
  const pennationRad = (pennationDeg * Math.PI) / 180.0;
  const muscleTension = options.muscleTension ?? 0.0;
  const isScotopic = options.scotopicMode ?? true;
  const woodCutType = options.woodCutType ?? 'camaieu_auto';
  const grainStrength = options.grainStrength ?? 0.85;
  const reliefDepth = options.reliefDepth ?? 1.8;

  const inkColorHex = options.inkColor ?? (isScotopic ? 0xf59e0b : 0x1c1917);
  const paperColorHex = options.paperColor ?? (isScotopic ? 0x09090b : 0xfaf8f0);
  const lusterColorHex = isScotopic ? 0x14b8a6 : 0xd97706;

  const uniforms = {
    uLightDir: { value: new THREE.Vector3(1.2, 1.8, 2.2).normalize() },
    uHatchScale: { value: hatchScale },
    uPennationAngleRad: { value: pennationRad },
    uMuscleTension: { value: muscleTension },
    uWoodCutType: { value: getWoodCutTypeCode(woodCutType) },
    uGrainStrength: { value: grainStrength },
    uReliefDepth: { value: reliefDepth },
    uInkColor: { value: new THREE.Color(inkColorHex) },
    uPaperColor: { value: new THREE.Color(paperColorHex) },
    uLusterColor: { value: new THREE.Color(lusterColorHex) },
    uScotopicMode: { value: isScotopic ? 1.0 : 0.0 }
  };

  const vertexShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vPosition = mvPos.xyz;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * mvPos;
    }
  `;

  const fragmentShader = /* glsl */ `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    uniform vec3 uLightDir;
    uniform float uHatchScale;
    uniform float uPennationAngleRad;
    uniform float uMuscleTension;
    uniform float uWoodCutType;
    uniform float uGrainStrength;
    uniform float uReliefDepth;
    uniform vec3 uInkColor;
    uniform vec3 uPaperColor;
    uniform vec3 uLusterColor;
    uniform float uScotopicMode;

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(-vPosition);
      vec3 L = normalize(uLightDir);

      float c = cos(uPennationAngleRad);
      float s = sin(uPennationAngleRad);
      vec2 rawRotUv = vec2(
        vUv.x * c - vUv.y * s,
        vUv.x * s + vUv.y * c
      ) * uHatchScale;

      // 🪵 Pearwood cellulose micro-grain fiber perturbation (from Atelier Xylem)
      float fiberWaver = sin(rawRotUv.x * 0.22 + sin(rawRotUv.y * 1.4) * 2.2) * 0.038 * uGrainStrength;
      vec2 timberUv = rawRotUv + vec2(fiberWaver, -fiberWaver * 0.5);

      // Base unperturbed grazing light
      float rawLight = max(dot(N, L), 0.0);

      // 🗡️ Variable-depth knife cut: strokes swell in deep chiaroscuro and active muscle contraction
      float strokeW = mix(0.10, 0.82, (1.0 - rawLight) * (1.0 + uMuscleTension * 0.35));
      // 📜 Washi / Rag Paper capillary ink bleed
      float bleed = 0.035 + (sin(rawRotUv.y * 30.0) * 0.008);

      float pattern = 1.0;

      // Type 0: V-Ribbed (Sharp V-Parting Chisel cuts on bone & tendon)
      float vHatch1 = smoothstep(0.5 - strokeW * 0.5 - bleed, 0.5 - strokeW * 0.5 + bleed, fract(timberUv.x + timberUv.y));
      float vHatch2 = smoothstep(0.5 - strokeW * 0.4 - bleed, 0.5 - strokeW * 0.4 + bleed, fract(timberUv.x - timberUv.y));
      float vPattern = 1.0;
      if (rawLight < 0.82) { vPattern *= vHatch1; }
      if (rawLight < 0.45) { vPattern *= vHatch2; }

      // Type 1: Fluted (Concave U-Gouge hollows capturing velvety chiaroscuro in muscle meat)
      float fluteWave = sin((timberUv.x - timberUv.y) * 3.14159);
      float fluteShade = smoothstep(-0.6, 0.85, fluteWave * (1.0 - rawLight));
      float fluteHatch = smoothstep(0.4 - strokeW * 0.3, 0.6 + strokeW * 0.3, fract(timberUv.x * 0.85));
      float fPattern = mix(fluteShade, fluteHatch, 0.5);

      // Type 2: Reeded (Proud convex rounded ridges catching specular highlights on muscle fibers)
      float reedRidge = abs(fract(timberUv.x * 1.35) - 0.5) * 2.0;
      float rPattern = smoothstep(0.32, 0.72, reedRidge + (1.0 - rawLight) * 0.55);

      // Type 3: Slatted (Stepped architectural parallel louvers for skeletal vertebrae and ribs)
      float slatBar = step(0.32, fract(timberUv.y * 1.65));
      float sPattern = mix(slatBar, 1.0, rawLight * 0.72);

      // Type 4: Burl (Wild organic growth knot whorls for joint capsules and cartilage)
      float knotDist = length(fract(timberUv * 0.35) - vec2(0.5, 0.5));
      float burlWhorl = sin(knotDist * 22.0 + sin(timberUv.x * 1.8) * 3.0);
      float bPattern = smoothstep(0.40 - strokeW * 0.3, 0.60 + strokeW * 0.3, fract(burlWhorl * 0.5 + timberUv.x));

      // Cut Selection Logic
      if (uWoodCutType < 0.5) {
        pattern = vPattern;
      } else if (uWoodCutType < 1.5) {
        pattern = fPattern;
      } else if (uWoodCutType < 2.5) {
        pattern = rPattern;
      } else if (uWoodCutType < 3.5) {
        pattern = sPattern;
      } else if (uWoodCutType < 4.5) {
        pattern = bPattern;
      } else {
        // Type 5: Camaïeu Auto (Tissue-adaptive Renaissance master plate)
        float normalCurvature = abs(N.z);
        float verticalAlign = abs(N.y);
        if (verticalAlign > 0.65) {
          pattern = sPattern;
        } else if (normalCurvature > 0.60) {
          pattern = mix(fPattern, rPattern, uMuscleTension);
        } else if (rawLight < 0.35) {
          pattern = mix(vPattern, bPattern, 0.5);
        } else {
          pattern = vPattern;
        }
      }

      // 🗿 Physical Relief Bump: Surface normal perturbation derived from knife cut pattern
      vec3 dPosDx = dFdx(vPosition);
      vec3 dPosDy = dFdy(vPosition);
      float dPdx = dFdx(pattern);
      float dPdy = dFdy(pattern);
      vec3 surfGrad = cross(dPosDx, dPosDy);
      vec3 gradN = cross(dPosDy, N) * dPdx + cross(N, dPosDx) * dPdy;
      vec3 bumpNormal = normalize(N - (gradN / (length(surfGrad) + 0.0001)) * (uReliefDepth * 0.05));

      // Physically-Grounded Lighting
      float directLight = max(dot(bumpNormal, L), 0.0);
      float ambientLight = max(dot(N, vec3(-L.x, 0.6, -L.z)), 0.0) * 0.25 + 0.12;
      float totalLight = directLight + ambientLight;

      // Specular Glint on Proud Chisel Ridges (Wood oil sheen)
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(bumpNormal, H), 0.0), 28.0) * pattern * 0.42;

      // Final Tonal Synthesis
      vec3 finalBase;
      if (uScotopicMode > 0.5) {
        // Obsidian mode: Inked ridges catch warm light; troughs sink into velvety dark
        vec3 litInk = uInkColor * (0.65 + 0.35 * totalLight) + uLusterColor * spec;
        vec3 darkTrough = uPaperColor * (0.85 + 0.15 * ambientLight);
        finalBase = mix(litInk, darkTrough, pattern);
      } else {
        // Renaissance Rag Paper mode: Crisp lampblack ink with paper fiber sheen
        vec3 darkInk = uInkColor * (0.35 + 0.65 * (1.0 - directLight));
        vec3 creamPaper = uPaperColor * (0.75 + 0.25 * directLight) + vec3(1.0, 0.95, 0.85) * spec;
        finalBase = mix(creamPaper, darkInk, 1.0 - pattern);
      }

      // Biomechanical Muscle Contraction Luster
      vec3 outputColor = mix(finalBase, uLusterColor, uMuscleTension * 0.76 * (1.0 - directLight * 0.45));

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
