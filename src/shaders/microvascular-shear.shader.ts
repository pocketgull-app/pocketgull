/**
 * PocketGull Microvascular Endothelial Wall Shear Stress & Glycocalyx Shader
 * 
 * Biophysical Foundations:
 * 1. Poiseuille Laminar Hemodynamics & Wall Shear Stress:
 *    - tau_w = (4 * mu * Q) / (pi * R^3)
 *    - Physiological Atheroprotective: 15 - 40 dyn/cm^2 (activates eNOS Ser1177, KLF2 expression)
 *    - Atheroprone Low/Oscillatory Shear: < 4 dyn/cm^2 (promotes VCAM-1, NF-kB, endothelial activation)
 * 2. Endothelial Glycocalyx Layer (EGL) Hydrogel:
 *    - Dense macromolecular meshwork of Syndecan-1, Glypican-1, Heparan Sulfate, and Hyaluronan
 *    - Healthy physiological thickness: 1.5 - 3.0 um
 *    - Pathological degradation/shedding: < 0.4 um under hyperglycemia (>180 mg/dL), endotoxemia, or turbulent shear
 * 3. Nitric Oxide (NO) Shear-Coupled Diffusion:
 *    - Shear-induced mechanotransduction triggers Ca2+/calmodulin eNOS phosphorylation, releasing NO
 *      diffusing radially across the internal elastic lamina into vascular smooth muscle.
 */

import * as THREE from 'three';

export interface IMicrovascularShearOptions {
  shearStressDyn?: number;       // Wall shear stress in dyn/cm^2 (0 - 50)
  glycocalyxThicknessUm?: number; // Glycocalyx thickness in micrometers (0.2 - 3.0)
  sheddingRatio?: number;         // 0.0 (pristine) to 1.0 (fully denuded)
  flowVelocity?: number;          // Relative blood flow velocity (0.1 - 3.0)
  isTurbulent?: boolean;          // Laminar vs disturbed turbulent flow
  nitricOxideProduction?: number; // eNOS NO flux rate (0.0 to 1.0)
  lumenRadiusMm?: number;         // Microvessel radius in mm (e.g. 0.015 mm = 15 um)
}

export const GLSL_MICROVASCULAR_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vShearStress;

uniform float uTime;
uniform float uFlowVelocity;
uniform float uShearStress;
uniform float uIsTurbulent;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Small pulsatile wall distention with cardiac cycle
    float pulse = sin(uTime * 3.0 + position.z * 2.0) * 0.015 * (1.0 - uIsTurbulent * 0.5);
    vec3 displaced = position + normal * pulse;

    vShearStress = uShearStress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_MICROVASCULAR_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vShearStress;

uniform float uTime;
uniform float uShearStress;
uniform float uGlycocalyxThickness;
uniform float uSheddingRatio;
uniform float uFlowVelocity;
uniform float uIsTurbulent;
uniform float uNitricOxideProduction;

// Color palette
const vec3 COLOR_PHYSIO_TEAL = vec3(0.08, 0.72, 0.65); // Atheroprotective high shear
const vec3 COLOR_TURBULENT_RED = vec3(0.95, 0.25, 0.25); // Atheroprone low/turbulent shear
const vec3 COLOR_GLYCOCALYX_GOLD = vec3(0.96, 0.75, 0.20); // Pristine glycosaminoglycan mesh
const vec3 COLOR_LUMEN_DARK = vec3(0.04, 0.04, 0.06);   // Endothelial basement obsidian

void main() {
    // 1. Wall Shear Stress Gradient
    // High shear (> 15 dyn/cm2) -> Teal; Low/turbulent (< 5 dyn/cm2) -> Red/Amber
    float shearFactor = clamp((uShearStress - 4.0) / 25.0, 0.0, 1.0);
    vec3 shearColor = mix(COLOR_TURBULENT_RED, COLOR_PHYSIO_TEAL, shearFactor);

    // 2. Streamline Flow Dynamics along longitudinal vessel axis (U or V)
    float streamTime = uTime * uFlowVelocity * 4.0;
    float streamline = sin(vUv.x * 40.0 - streamTime) * 0.5 + 0.5;

    // In turbulent mode, add high-frequency vorticity noise
    if (uIsTurbulent > 0.5) {
        float eddy = sin(vUv.x * 25.0 + vUv.y * 35.0 - uTime * 6.0) * cos(vUv.x * 15.0 - vUv.y * 20.0);
        streamline = mix(streamline, abs(eddy), 0.7);
    }

    // 3. Glycocalyx Layer Density
    // Healthy glycocalyx forms a dense fibrous hydrogel fringe
    float glycocalDensity = (1.0 - uSheddingRatio) * (uGlycocalyxThickness / 3.0);
    float fibrousHatch = sin(vUv.y * 120.0 + sin(vUv.x * 80.0)) * 0.5 + 0.5;
    vec3 surfaceColor = mix(COLOR_LUMEN_DARK, shearColor, 0.45);
    surfaceColor = mix(surfaceColor, COLOR_GLYCOCALYX_GOLD, glycocalDensity * fibrousHatch * 0.6);

    // Streamline highlights
    surfaceColor += shearColor * streamline * 0.35;

    // 4. Nitric Oxide (NO) Glow
    // When eNOS is active under high shear, lumen glows with cyan fluorescence
    float noGlow = uNitricOxideProduction * shearFactor * 0.3;
    surfaceColor += vec3(0.1, 0.6, 0.8) * noGlow;

    // Fresnel edge opacity for tubular vessel
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
    float alpha = clamp(0.75 + fresnel * 0.25, 0.0, 1.0);

    gl_FragColor = vec4(surfaceColor, alpha);
}
`;

/**
 * Creates an animated Three.js ShaderMaterial for microvascular shear stress & glycocalyx visualization.
 */
export function createMicrovascularShearMaterial(options: IMicrovascularShearOptions = {}): THREE.ShaderMaterial {
  const shearStress = options.shearStressDyn ?? 22.0; // 22 dyn/cm^2 normal physiological
  const glycocalThickness = options.glycocalyxThicknessUm ?? 2.2; // 2.2 um normal
  const sheddingRatio = options.sheddingRatio ?? 0.15;
  const flowVelocity = options.flowVelocity ?? 1.0;
  const isTurbulent = options.isTurbulent ?? false;
  const nitricOxide = options.nitricOxideProduction ?? (shearStress >= 15.0 ? 0.85 : 0.2);

  const uniforms = {
    uTime: { value: 0.0 },
    uShearStress: { value: shearStress },
    uGlycocalyxThickness: { value: glycocalThickness },
    uSheddingRatio: { value: sheddingRatio },
    uFlowVelocity: { value: flowVelocity },
    uIsTurbulent: { value: isTurbulent ? 1.0 : 0.0 },
    uNitricOxideProduction: { value: nitricOxide }
  };

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_MICROVASCULAR_VERTEX,
    fragmentShader: GLSL_MICROVASCULAR_FRAGMENT,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide
  });
}

/**
 * Updates shader uniforms dynamically each animation frame.
 */
export function updateMicrovascularUniforms(
  material: THREE.ShaderMaterial,
  deltaSec: number,
  params?: Partial<IMicrovascularShearOptions>
) {
  if (!material.uniforms) return;

  material.uniforms['uTime'].value += deltaSec;

  if (params) {
    if (params.shearStressDyn !== undefined) {
      material.uniforms['uShearStress'].value = params.shearStressDyn;
    }
    if (params.glycocalyxThicknessUm !== undefined) {
      material.uniforms['uGlycocalyxThickness'].value = params.glycocalyxThicknessUm;
    }
    if (params.sheddingRatio !== undefined) {
      material.uniforms['uSheddingRatio'].value = params.sheddingRatio;
    }
    if (params.flowVelocity !== undefined) {
      material.uniforms['uFlowVelocity'].value = params.flowVelocity;
    }
    if (params.isTurbulent !== undefined) {
      material.uniforms['uIsTurbulent'].value = params.isTurbulent ? 1.0 : 0.0;
    }
    if (params.nitricOxideProduction !== undefined) {
      material.uniforms['uNitricOxideProduction'].value = params.nitricOxideProduction;
    }
  }
}
