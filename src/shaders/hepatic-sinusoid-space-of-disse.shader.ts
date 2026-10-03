/**
 * PocketGull 3D Hepatic Sinusoid & Space of Disse Microarchitecture Shader (Visual Model V8)
 * 
 * Biophysical Foundations:
 * 1. Liver Sinusoidal Endothelial Cells (LSECs):
 *    - Unique discontinuous endothelium lacking a true basement membrane in health.
 *    - Fenestrations arranged in sieve plates (100 - 150 nm diameter) acting as a dynamic macromolecular filter.
 *    - Facilitates unhindered bidirectional plasma exchange with the space of Disse.
 * 
 * 2. Space of Disse Micro-Compartment:
 *    - Perisinusoidal subendothelial space (0.5 - 1.0 um) between LSECs and hepatocyte microvilli.
 *    - Quiescent Hepatic Stellate Cells (HSCs) store 80% of total body Vitamin A (retinoids) in lipid droplets.
 * 
 * 3. Capillarization & Fibrogenesis:
 *    - Chronic liver injury triggers HSC transdifferentiation into alpha-SMA+ contractile myofibroblasts.
 *    - Secretion of dense fibrillar Type I/III collagen in the space of Disse.
 *    - Loss of fenestrae ("defenestration") and formation of a continuous basement membrane ("capillarization").
 *    - Starvation of hepatocyte microvilli, impairing hepatic metabolic clearance and albumin synthesis.
 * 
 * 4. Hepatic Venous Pressure Gradient (HVPG):
 *    - HVPG = WHVP - FHVP (normal 1 - 5 mmHg).
 *    - Clinically Significant Portal Hypertension (CSPH) at HVPG >= 10 mmHg.
 *    - Variceal hemorrhage risk increases sharply at HVPG >= 12 mmHg.
 */

import * as THREE from 'three';

export interface IHepaticSinusoidOptions {
  fibrosisStage?: number;            // METAVIR F0 - F4 (0 to 4)
  fenestrationPorosity?: number;     // 0.0 (defenestrated/capillarized) to 1.0 (normal 100-150nm sieve plates)
  collagenDensity?: number;          // 0.0 (healthy low reticulin) to 1.0 (dense scarred Type I/III collagen)
  stellateActivationRatio?: number;  // 0.0 (quiescent retinoid storage) to 1.0 (contractile myofibroblast)
  hvpgMmHg?: number;                 // Hepatic venous pressure gradient (1 - 24 mmHg, normal 3)
  sinusoidalFlowVelocity?: number;   // Sinusoidal plasma transit speed (0.2 - 2.5)
}

export const GLSL_HEPATIC_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNodularDistortion;

uniform float uTime;
uniform float uFibrosisStage;
uniform float uStellateActivation;
uniform float uHvpgMmHg;
uniform float uFlowVelocity;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Cirrhotic regenerative nodular surface distortion
    // Higher fibrosis stage (F3 - F4) produces irregular regenerative nodules
    float noduleNoise = sin(position.x * 6.0 + position.y * 5.0) * cos(position.z * 6.0) * (uFibrosisStage / 4.0) * 0.045;

    // Portal hypertension pulsation wave along the sinusoidal lumen
    float hvpgDistention = clamp(uHvpgMmHg / 20.0, 0.0, 1.0) * 0.025;
    float pulse = sin(uTime * 2.5 * uFlowVelocity + position.x * 3.0) * (0.012 + hvpgDistention);

    // Stellate cell myofibroblast contractility narrows sinusoidal caliber
    float stellateConstriction = uStellateActivation * 0.025 * cos(position.y * 10.0);

    vec3 displaced = position + normal * (noduleNoise + pulse - stellateConstriction);

    vNodularDistortion = noduleNoise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_HEPATIC_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vNodularDistortion;

uniform float uTime;
uniform float uFibrosisStage;
uniform float uFenestrationPorosity;
uniform float uCollagenDensity;
uniform float uStellateActivation;
uniform float uHvpgMmHg;
uniform float uFlowVelocity;

void main() {
    // Spatial Architecture along UV y-axis:
    // vUv.y < 0.35: Sinusoidal Blood Lumen (RBCs, plasma, Kupffer macrophages)
    // 0.35 <= vUv.y <= 0.48: LSEC Endothelial Barrier & Sieve Plate Fenestrae (100 - 150 nm)
    // 0.48 < vUv.y <= 0.65: Space of Disse (Perisinusoidal matrix, Stellate cells, Collagen scar)
    // vUv.y > 0.65: Hepatocyte Trabeculae / Cord & Bile Canaliculi

    vec3 color = vec3(0.0);

    if (vUv.y < 0.35) {
        // 1. Sinusoidal Lumen
        // Blood plasma base
        vec3 plasmaColor = vec3(0.25, 0.06, 0.08);

        // Flowing RBC stream
        float rbcFlow = sin(vUv.x * 30.0 - uTime * 4.0 * uFlowVelocity) * cos(vUv.y * 35.0);
        float rbcPattern = smoothstep(0.2, 0.7, rbcFlow);
        vec3 rbcColor = vec3(0.85, 0.15, 0.18);

        // Kupffer cell macrophages anchored along the luminal wall (vUv.y ~ 0.30 - 0.35)
        float kupfferSpot = sin(vUv.x * 12.0) * cos(vUv.y * 20.0);
        float isKupffer = smoothstep(0.7, 0.85, kupfferSpot) * step(0.28, vUv.y);
        vec3 kupfferColor = vec3(0.15, 0.45, 0.40); // Phagocytic green-cyan hue

        color = mix(plasmaColor, rbcColor, rbcPattern * 0.75);
        color = mix(color, kupfferColor, isKupffer * 0.80);

        // High portal pressure congestion darkening
        if (uHvpgMmHg >= 10.0) {
            color *= 0.85; // Congestive stasis
        }
    } 
    else if (vUv.y <= 0.48) {
        // 2. LSEC Endothelial Layer with Sieve Plate Fenestrations (100 - 150 nm)
        vec3 endothelialCellColor = vec3(0.68, 0.32, 0.40);

        // Sieve plate pore matrix pattern (circular fenestrations)
        vec2 sieveGrid = fract(vUv * vec2(45.0, 30.0)) - 0.5;
        float poreRadius = 0.30 * uFenestrationPorosity; // Normal porosity ~ 100-150 nm; closes to 0 in capillarization
        float inFenestra = 1.0 - smoothstep(poreRadius - 0.05, poreRadius + 0.05, length(sieveGrid));

        // In healthy state (inFenestra > 0), plasma passes directly into Disse;
        // In defenestration/capillarization, dense fibrotic basement membrane blocks the pore
        vec3 poreGleam = mix(vec3(0.35, 0.15, 0.20), vec3(0.75, 0.60, 0.25), uCollagenDensity);

        color = mix(endothelialCellColor, poreGleam, inFenestra);

        // Continuous basement membrane deposition line during capillarization (F2 - F4)
        float bmDeposition = uCollagenDensity * 0.7;
        color = mix(color, vec3(0.55, 0.45, 0.20), bmDeposition * 0.5);
    } 
    else if (vUv.y <= 0.65) {
        // 3. Space of Disse (Perisinusoidal Micro-Compartment)
        float disseNorm = (vUv.y - 0.48) / 0.17;

        // Healthy Space of Disse: Clear low-density fluid cushion vec3(0.12, 0.35, 0.32)
        vec3 healthyDisseColor = vec3(0.12, 0.32, 0.30);

        // Fibrotic Scarring: Dense cross-linked Type I/III collagen fibrils (golden-amber cords)
        float collagenFibrilPattern = sin(vUv.x * 60.0 + vUv.y * 30.0) * cos(vUv.x * 25.0 - vUv.y * 40.0);
        float fibrilHighlight = smoothstep(0.1, 0.8, collagenFibrilPattern) * uCollagenDensity;
        vec3 collagenScarColor = vec3(0.82, 0.62, 0.18); // Gold/amber dense collagen bundles

        // Hepatic Stellate Cells:
        // Quiescent: Vitamin A blue-cyan lipid droplets vec3(0.20, 0.75, 0.85)
        // Activated: alpha-SMA+ contractile myofibroblast spindle vec3(0.85, 0.25, 0.30)
        float stellateSpot = sin(vUv.x * 18.0) * cos(disseNorm * 15.0);
        float isStellate = smoothstep(0.65, 0.85, stellateSpot);
        vec3 quiescentHsc = vec3(0.20, 0.75, 0.85); // Retinoid droplet
        vec3 activatedHsc = vec3(0.88, 0.20, 0.25); // Myofibroblast
        vec3 hscColor = mix(quiescentHsc, activatedHsc, uStellateActivation);

        vec3 disseBase = mix(healthyDisseColor, collagenScarColor, uCollagenDensity * 0.85);
        color = mix(disseBase, collagenScarColor, fibrilHighlight * 0.60);
        color = mix(color, hscColor, isStellate * 0.75);
    } 
    else {
        // 4. Hepatocyte Trabeculae & Microvilli
        vec3 hepatocyteBaseColor = vec3(0.48, 0.28, 0.18); // Deep rich liver parenchyma brown

        // Basolateral microvilli bordering the space of Disse (vUv.y ~ 0.65 - 0.70)
        float microvilliRidge = sin(vUv.x * 80.0) * 0.5 + 0.5;
        float isMicrovilli = smoothstep(0.65, 0.72, vUv.y) * (1.0 - smoothstep(0.72, 0.78, vUv.y));

        // When space of Disse is choked with collagen, hepatocyte microvilli undergo blunting/atrophy
        float microvilliPreserved = 1.0 - uCollagenDensity * 0.75;
        vec3 microvilliColor = vec3(0.65, 0.40, 0.25);

        color = mix(hepatocyteBaseColor, microvilliColor, isMicrovilli * microvilliRidge * microvilliPreserved);

        // Bile canaliculi channels running between adjacent hepatocytes (vUv.y > 0.85)
        float canaliculus = smoothstep(0.88, 0.92, vUv.y) * sin(vUv.x * 20.0);
        vec3 bileGold = vec3(0.75, 0.70, 0.10); // Golden bilirubin-rich bile fluid
        color = mix(color, bileGold, clamp(canaliculus * 0.5, 0.0, 1.0));
    }

    // Directional shading and Fresnel rim highlighting
    vec3 lightDir = normalize(vec3(0.6, 0.9, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 ambient = color * 0.42;
    vec3 diffuse = color * diff * 0.65;

    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    vec3 rim = vec3(0.35, 0.65, 0.75) * fresnel * 0.28;

    gl_FragColor = vec4(ambient + diffuse + rim, 1.0);
}
`;

/**
 * Calculates Hepatic Venous Pressure Gradient (HVPG) and variceal risk from fibrosis stage and collagen density.
 * 
 * @param fibrosisStage METAVIR F0 - F4 (0 to 4)
 * @param collagenDensity 0.0 (healthy) to 1.0 (dense scarred)
 * @returns { hvpgMmHg, csphPresent, varicealBleedRiskPercent }
 */
export function computeSinusoidalResistance(
  fibrosisStage: number,
  collagenDensity: number
): {
  hvpgMmHg: number;
  csphPresent: boolean;
  varicealBleedRiskPercent: number;
} {
  // Baseline normal HVPG = 3 mmHg (1 - 5 mmHg).
  // Progressive fibrosis increases intrahepatic sinusoidal resistance:
  // F0: 3 mmHg
  // F1: 4.5 mmHg
  // F2: 7 mmHg
  // F3: 11 mmHg (CSPH threshold >= 10 mmHg crossed)
  // F4 (Cirrhosis): 16 - 22 mmHg (high variceal hemorrhage risk >= 12 mmHg)
  const baseHvpg = 3.0;
  const stageContribution = Math.pow(fibrosisStage, 1.65) * 1.0 + (fibrosisStage === 4 ? 2.5 : 0.0);
  const collagenFactor = collagenDensity * 3.5;
  const hvpg = Number((baseHvpg + stageContribution + collagenFactor).toFixed(1));

  const csphPresent = hvpg >= 10.0;

  // Variceal bleeding hazard: increases exponentially once HVPG >= 12 mmHg
  let bleedRisk = 2; // Baseline 2%
  if (hvpg >= 16.0) {
    bleedRisk = Math.min(65, Math.round(35 + (hvpg - 16.0) * 5.0));
  } else if (hvpg >= 12.0) {
    bleedRisk = Math.round(15 + (hvpg - 12.0) * 5.0);
  } else if (csphPresent) {
    bleedRisk = 8;
  }

  return {
    hvpgMmHg: hvpg,
    csphPresent,
    varicealBleedRiskPercent: bleedRisk
  };
}

/**
 * Calculates hepatocyte metabolic clearance efficiency based on endothelial fenestration porosity and collagen barrier thickness.
 * 
 * @param porosity 0.0 (defenestrated/capillarized) to 1.0 (normal 15% sieve plates)
 * @param collagenDensity 0.0 (healthy) to 1.0 (dense scarred)
 * @returns { clearanceRatePercent, albuminSecretoryReservePercent }
 */
export function computeMetabolicClearanceEfficiency(
  porosity: number,
  collagenDensity: number
): {
  clearanceRatePercent: number;
  albuminSecretoryReservePercent: number;
} {
  // Normal fenestrations allow unhindered macromolecular transport
  // Capillarization & Space of Disse collagen deposition act as a physical diffusion barrier
  const transportFactor = Math.max(0.08, porosity * (1.0 - collagenDensity * 0.70));
  const clearanceRatePercent = Math.min(100, Math.round(transportFactor * 100));

  // Albumin secretory reserve depends on intact hepatocyte microvillar perfusion
  const albuminReserve = Math.max(12, Math.round(100 - (collagenDensity * 55 + (1.0 - porosity) * 30)));

  return {
    clearanceRatePercent,
    albuminSecretoryReservePercent: albuminReserve
  };
}

/**
 * Creates a Three.js ShaderMaterial for the 3D Hepatic Sinusoid & Space of Disse visualizer.
 */
export function createHepaticSinusoidMaterial(options: IHepaticSinusoidOptions = {}): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0 },
    uFibrosisStage: { value: options.fibrosisStage ?? 0 },
    uFenestrationPorosity: { value: options.fenestrationPorosity ?? 1.0 },
    uCollagenDensity: { value: options.collagenDensity ?? 0.0 },
    uStellateActivation: { value: options.stellateActivationRatio ?? 0.0 },
    uHvpgMmHg: { value: options.hvpgMmHg ?? 3.0 },
    uFlowVelocity: { value: options.sinusoidalFlowVelocity ?? 1.0 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_HEPATIC_VERTEX,
    fragmentShader: GLSL_HEPATIC_FRAGMENT,
    uniforms,
    side: THREE.DoubleSide
  });
}

/**
 * Dynamically updates shader uniforms during real-time animation loops.
 */
export function updateHepaticSinusoidUniforms(
  material: THREE.ShaderMaterial,
  options: Partial<IHepaticSinusoidOptions>,
  timeSeconds: number
): void {
  const u = material.uniforms;
  if (!u) return;

  u.uTime.value = timeSeconds;

  if (options.fibrosisStage !== undefined) u.uFibrosisStage.value = options.fibrosisStage;
  if (options.fenestrationPorosity !== undefined) u.uFenestrationPorosity.value = options.fenestrationPorosity;
  if (options.collagenDensity !== undefined) u.uCollagenDensity.value = options.collagenDensity;
  if (options.stellateActivationRatio !== undefined) u.uStellateActivation.value = options.stellateActivationRatio;
  if (options.hvpgMmHg !== undefined) u.uHvpgMmHg.value = options.hvpgMmHg;
  if (options.sinusoidalFlowVelocity !== undefined) u.uFlowVelocity.value = options.sinusoidalFlowVelocity;
}
