/**
 * PocketGull Glomerular Filtration Barrier & Podocyte Slit Diaphragm Mesh Shader (Visual Model V5)
 * 
 * Biophysical Foundations:
 * 1. Tri-Layer Glomerular Filtration Barrier (GFB):
 *    - Endothelium: Fenestrated pores (70 - 100 nm diameter) filtering cellular elements while allowing plasma solute ingress.
 *    - Glomerular Basement Membrane (GBM): 300 - 350 nm thick Type IV collagen (alpha3/4/5) and agrin heparan sulfate proteoglycan
 *      meshwork conferring a robust polyanionic negative charge barrier.
 *    - Visceral Podocyte Layer: Interdigitating foot processes (pedicels) forming 30 - 45 nm filtration slits spanned by
 *      nephrin/podocin slit diaphragms with 4 - 10 nm molecular pores.
 * 2. Starling Glomerular Ultrafiltration Dynamics:
 *    - P_UF = (P_GC - P_BS) - (Pi_GC - Pi_BS) = Delta_P - Delta_Pi
 *    - Physiological Delta_P: 35 - 40 mmHg
 *    - Intraglomerular hypertension: Delta_P > 50 mmHg triggers podocyte detachment and mechanical shear failure.
 * 3. Foot Process Effacement & Albuminuria Pathomechanics:
 *    - Under high pressure or immunologic injury, discrete pedicels retract, widen, and fuse into a continuous cytoplasmic sheet.
 *    - Disruption of nephrin-podocin complexes and loss of GBM negative charge allows albumin (3.6 nm Stokes radius, -19 net charge)
 *      to cross into Bowman's space, manifesting as clinical microalbuminuria or overt nephrotic-range proteinuria (>3.5 g/24h).
 */

import * as THREE from 'three';

export interface IGlomerularPodocyteOptions {
  intraglomerularPressureMmHg?: number; // Delta_P in mmHg (20 - 70, normal 36)
  effacementRatio?: number;             // 0.0 (discrete pedicels) to 1.0 (fully effaced sheet)
  gbmChargeIntegrity?: number;          // 0.0 (charge abolished) to 1.0 (100% polyanionic charge)
  slitDiaphragmWidthNm?: number;        // Nanometers (4 - 45 nm)
  albuminuriaLeakRate?: number;         // 0.0 (zero leak) to 1.0 (massive nephrotic proteinuria)
  flowVelocity?: number;                // Relative capillary plasma transit velocity (0.1 - 3.0)
}

export const GLSL_GLOMERULAR_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vPulsation;

uniform float uTime;
uniform float uFlowVelocity;
uniform float uIntraglomerularPressure;
uniform float uEffacementRatio;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Intraglomerular capillary pressure pulsation (Starling hydrostatic distention)
    float pressureNorm = clamp((uIntraglomerularPressure - 30.0) / 40.0, 0.0, 1.0);
    float pulse = sin(uTime * 3.0 * uFlowVelocity + position.z * 1.5) * (0.015 + pressureNorm * 0.025);
    
    // Podocyte pedicel height displacement: healthy pedicels have tall ridged relief (interdigitation);
    // when effaced, the relief flattens out into an amorphous smooth sheet
    float pedicelRidge = cos(uv.x * 62.83) * (1.0 - uEffacementRatio) * 0.035;
    
    vec3 displaced = position + normal * (pulse + pedicelRidge);

    vPulsation = pulse;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_GLOMERULAR_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vPulsation;

uniform float uTime;
uniform float uIntraglomerularPressure;
uniform float uEffacementRatio;
uniform float uGbmChargeIntegrity;
uniform float uSlitDiaphragmWidthNm;
uniform float uAlbuminuriaLeakRate;
uniform float uFlowVelocity;

// Curated Clinical Palette
const vec3 COLOR_GBM_BASE = vec3(0.04, 0.05, 0.08);          // Deep obsidian lamina densa
const vec3 COLOR_CHARGE_GLOW = vec3(0.20, 0.55, 0.95);       // Polyanionic heparan sulfate negative potential
const vec3 COLOR_PODOCYTE_TEAL = vec3(0.12, 0.82, 0.65);     // Healthy podocyte pedicels & nephrin zipper
const vec3 COLOR_EFFACED_AMBER = vec3(0.92, 0.55, 0.18);     // Pathological podocyte effacement & cytoskeletal collapse
const vec3 COLOR_ALBUMIN_GREEN = vec3(0.25, 0.98, 0.45);     // Fluorescent albumin leak into Bowman urinary space
const vec3 COLOR_FENESTRATION_PURPLE = vec3(0.48, 0.28, 0.85);// Endothelial capillary fenestrae (70-100 nm)

void main() {
    // 1. Capillary Endothelial Fenestrations Pattern (Hexagonal array of 70-100nm pores)
    vec2 fenUv = fract(vUv * vec2(40.0, 20.0)) - 0.5;
    float fenDist = length(fenUv);
    float fenestrationMask = smoothstep(0.25, 0.22, fenDist);

    // 2. Podocyte Interdigitating Foot Processes (Pedicels)
    // When healthy (effacement = 0.0), sharp alternating interdigitating fingers (slits 30-45 nm).
    // Under effacement (effacement -> 1.0), fingers merge into a continuous, uniform sheet.
    float pedicelWave = sin(vUv.x * 62.83 + sin(vUv.y * 31.41) * 0.4);
    float slitThreshold = mix(0.15, 0.01, uEffacementRatio);
    float slitMask = smoothstep(slitThreshold, slitThreshold + 0.08, abs(pedicelWave));

    // Slit Diaphragm Nephrin Zipper Bridge
    float zipperBands = sin(vUv.y * 125.66) * 0.5 + 0.5;
    float nephrinBridge = slitMask * zipperBands * (1.0 - uEffacementRatio);

    // 3. GBM Polyanionic Charge Shield (Heparan Sulfate Electrostatic Field)
    // Pristine charge repels negatively charged proteins; lost in proteinuria
    float chargeField = uGbmChargeIntegrity * (sin(vUv.x * 15.0 + vUv.y * 15.0 - uTime * 2.0) * 0.2 + 0.8);

    // Base surface color: blend between healthy podocyte teal and effaced amber
    vec3 podocyteColor = mix(COLOR_PODOCYTE_TEAL, COLOR_EFFACED_AMBER, uEffacementRatio);
    vec3 surfaceColor = mix(COLOR_GBM_BASE, podocyteColor, 0.65);

    // Overlay polyanionic electrostatic charge glow
    surfaceColor += COLOR_CHARGE_GLOW * chargeField * 0.35;

    // Overlay capillary fenestrations in deeper vascular layer
    surfaceColor = mix(surfaceColor, COLOR_FENESTRATION_PURPLE, fenestrationMask * 0.3);

    // Overlay nephrin slit diaphragm bridges
    surfaceColor += COLOR_PODOCYTE_TEAL * nephrinBridge * 0.5;

    // 4. Albuminuria Protein Leakage Visualization
    // When both podocyte effacement and charge breakdown occur, albumin escapes into Bowman's space
    if (uAlbuminuriaLeakRate > 0.02) {
        float albuminFlowTime = uTime * uFlowVelocity * 4.0;
        // Macromolecule clumps escaping through porous defects
        float albuminPore = sin(vUv.x * 50.0 + sin(vUv.y * 30.0) - albuminFlowTime);
        float albuminNoise = fract(sin(dot(floor(vUv * 60.0), vec2(12.9898, 78.233))) * 43758.5453);
        float leakTrigger = smoothstep(0.4, 0.8, albuminPore) * (1.0 - slitMask * 0.6) * albuminNoise;
        
        vec3 leakFlash = COLOR_ALBUMIN_GREEN * leakTrigger * uAlbuminuriaLeakRate * 1.5;
        surfaceColor += leakFlash;
    }

    // 5. Fresnel Rim Lighting for 3D Membrane Curvature Depth
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.0);
    surfaceColor += mix(COLOR_CHARGE_GLOW, COLOR_PODOCYTE_TEAL, 1.0 - uEffacementRatio) * fresnel * 0.5;

    // Specular highlight for moist biophysical endothelial glycocalyx
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(0.0, dot(vNormal, halfVector)), 32.0);
    surfaceColor += vec3(0.9, 0.95, 1.0) * spec * 0.25;

    gl_FragColor = vec4(surfaceColor, 1.0);
}
`;

/**
 * Factory for creating the Glomerular Filtration & Podocyte Three.js ShaderMaterial
 */
export function createGlomerularPodocyteMaterial(options: IGlomerularPodocyteOptions = {}): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0.0 },
    uIntraglomerularPressure: { value: options.intraglomerularPressureMmHg ?? 36.0 },
    uEffacementRatio: { value: options.effacementRatio ?? 0.0 },
    uGbmChargeIntegrity: { value: options.gbmChargeIntegrity ?? 1.0 },
    uSlitDiaphragmWidthNm: { value: options.slitDiaphragmWidthNm ?? 35.0 },
    uAlbuminuriaLeakRate: { value: options.albuminuriaLeakRate ?? 0.0 },
    uFlowVelocity: { value: options.flowVelocity ?? 1.0 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_GLOMERULAR_VERTEX,
    fragmentShader: GLSL_GLOMERULAR_FRAGMENT,
    uniforms,
    side: THREE.DoubleSide,
    transparent: false
  });
}

/**
 * Updates uniforms safely on an existing GlomerularPodocyte ShaderMaterial
 */
export function updateGlomerularUniforms(
  material: THREE.ShaderMaterial,
  deltaSec: number,
  options?: Partial<IGlomerularPodocyteOptions>
): void {
  if (!material.uniforms) return;

  if (material.uniforms['uTime']) {
    material.uniforms['uTime'].value += deltaSec;
  }

  if (options) {
    if (options.intraglomerularPressureMmHg !== undefined && material.uniforms['uIntraglomerularPressure']) {
      material.uniforms['uIntraglomerularPressure'].value = options.intraglomerularPressureMmHg;
    }
    if (options.effacementRatio !== undefined && material.uniforms['uEffacementRatio']) {
      material.uniforms['uEffacementRatio'].value = options.effacementRatio;
    }
    if (options.gbmChargeIntegrity !== undefined && material.uniforms['uGbmChargeIntegrity']) {
      material.uniforms['uGbmChargeIntegrity'].value = options.gbmChargeIntegrity;
    }
    if (options.slitDiaphragmWidthNm !== undefined && material.uniforms['uSlitDiaphragmWidthNm']) {
      material.uniforms['uSlitDiaphragmWidthNm'].value = options.slitDiaphragmWidthNm;
    }
    if (options.albuminuriaLeakRate !== undefined && material.uniforms['uAlbuminuriaLeakRate']) {
      material.uniforms['uAlbuminuriaLeakRate'].value = options.albuminuriaLeakRate;
    }
    if (options.flowVelocity !== undefined && material.uniforms['uFlowVelocity']) {
      material.uniforms['uFlowVelocity'].value = options.flowVelocity;
    }
  }
}
