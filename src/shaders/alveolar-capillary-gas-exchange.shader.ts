/**
 * PocketGull 3D Alveolar-Capillary Gas Exchange & Blood-Air Barrier Shader (Visual Model V7)
 * 
 * Biophysical Foundations:
 * 1. Blood-Air Barrier (Alveolocapillary Membrane Architecture):
 *    - Type I Alveolar Epithelium (0.1 - 0.2 um) + Fused Extracellular Basement Membrane + Capillary Endothelium.
 *    - Normal harmonic diffusion distance T: 0.2 - 0.5 um (mean ~0.35 um).
 *    - Pulmonary surfactant monolayer (dipalmitoylphosphatidylcholine DPPC + surfactant proteins SP-B/SP-C)
 *      reduces surface tension from 70 mN/m to < 5 mN/m, preventing alveolar collapse at end-expiration (Laplace: P = 2*gamma/r).
 * 
 * 2. Fick's Law of Pulmonary Gas Diffusion:
 *    - V_dot_gas = [ A * D * (P1 - P2) ] / T
 *    - Oxygen gradient: Alveolar P_A_O2 (~100 mmHg) -> Mixed venous P_v_O2 (~40 mmHg), Delta_P = 60 mmHg.
 *    - Carbon Dioxide gradient: P_v_CO2 (~45 mmHg) -> P_A_CO2 (~40 mmHg), Delta_P = 5 mmHg.
 *    - CO2 solubility is ~24x greater than O2; hence CO2 diffuses ~20x faster despite the 12-fold lower partial pressure gradient.
 * 
 * 3. Euler-Liljestrand Mechanism (Hypoxic Pulmonary Vasoconstriction - HPV):
 *    - Local alveolar hypoxia (P_A_O2 < 60 mmHg) triggers redox-dependent inhibition of voltage-gated potassium (Kv)
 *      channels in pulmonary arterial smooth muscle cells, causing membrane depolarization, Ca2+ influx, and arteriolar constriction.
 *    - Physiologically diverts perfusion (Q_dot) away from poorly ventilated alveoli toward well-ventilated regions,
 *      optimizing ventilation-perfusion matching (normal V_dot/Q_dot ~ 0.8) and minimizing physiological intrapulmonary shunt (Qs/Qt).
 * 
 * 4. ARDS Alveolar Flooding & PEEP Hysteresis Recruitment:
 *    - Inflammatory microvascular leak + surfactant depletion causes protein-rich hyaline membrane exudate flooding the alveolar lumen.
 *    - Membrane thickness expands from 0.35 um to > 2.0 um, causing severe diffusion block and refractory shunt (Qs/Qt > 30%).
 *    - Positive End-Expiratory Pressure (PEEP) re-recruits collapsed/flooded alveoli along the sigmoidal pressure-volume curve.
 */

import * as THREE from 'three';

export interface IAlveolarCapillaryOptions {
  alveolarPaO2?: number;          // Alveolar oxygen tension (mmHg, 20 - 150, normal 100)
  venousPvO2?: number;            // Mixed venous oxygen tension (mmHg, 20 - 60, normal 40)
  alveolarPaCO2?: number;         // Alveolar CO2 tension (mmHg, 20 - 60, normal 40)
  venousPvCO2?: number;           // Mixed venous CO2 tension (mmHg, 30 - 80, normal 45)
  membraneThicknessUm?: number;   // Blood-air barrier thickness in micrometers (0.2 - 3.0, normal 0.35)
  hpvVasoconstriction?: number;   // Euler-Liljestrand constriction factor (0.0 dilated to 1.0 maximally constricted)
  surfactantDepletion?: number;   // Surfactant inactivation (0.0 healthy to 1.0 depleted/atelectatic)
  alveolarFloodingRatio?: number; // ARDS proteinaceous exudate flooding (0.0 clear air to 1.0 consolidated)
  peepCmH2O?: number;             // PEEP in cmH2O (0 - 24, physiological 5)
  respiratoryRateBpm?: number;    // Respiratory frequency (8 - 35 bpm, normal 14)
  flowVelocity?: number;          // Capillary RBC transit speed (0.2 - 2.5)
}

export const GLSL_ALVEOLAR_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vVentilationExpansion;
varying float vMembraneDisplacement;

uniform float uTime;
uniform float uRespiratoryRate;
uniform float uPeepCmH2O;
uniform float uSurfactantDepletion;
uniform float uAlveolarFlooding;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Cyclic tidal respiratory ventilation frequency: omega = 2 * pi * (RR / 60)
    float omega = 6.283185 * (uRespiratoryRate / 60.0);
    float tidalCycle = sin(uTime * omega);

    // Compliance factor: surfactant depletion and alveolar flooding stiffen alveolar wall, dampening tidal excursion
    float complianceDampening = 1.0 - clamp(uSurfactantDepletion * 0.55 + uAlveolarFlooding * 0.40, 0.0, 0.85);

    // Baseline PEEP distention (prevents end-expiratory collapse)
    float baselinePeepDistention = clamp(uPeepCmH2O / 24.0, 0.0, 1.0) * 0.045;

    // Net cyclic wall displacement
    float tidalDisplacement = (tidalCycle * 0.5 + 0.5) * 0.065 * complianceDampening;
    float netExpansion = baselinePeepDistention + tidalDisplacement;

    // Surface wave texture along the microvascular capillary loops
    float capillaryRipple = sin(position.x * 12.0 + uTime * 2.0) * cos(position.y * 12.0) * 0.008;

    vec3 displaced = position + normal * (netExpansion + capillaryRipple);

    vVentilationExpansion = netExpansion;
    vMembraneDisplacement = tidalDisplacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_ALVEOLAR_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vVentilationExpansion;
varying float vMembraneDisplacement;

uniform float uTime;
uniform float uAlveolarPaO2;
uniform float uVenousPvO2;
uniform float uAlveolarPaCO2;
uniform float uVenousPvCO2;
uniform float uMembraneThicknessUm;
uniform float uHpvVasoconstriction;
uniform float uSurfactantDepletion;
uniform float uAlveolarFlooding;
uniform float uFlowVelocity;

void main() {
    // Spatial layout:
    // vUv.y > 0.55: Alveolar Air Space & Surfactant Monolayer
    // 0.40 <= vUv.y <= 0.55: Blood-Air Barrier (Type I Epithelium, Fused Basement Membrane, Endothelium)
    // vUv.y < 0.40: Pulmonary Capillary Lumen with RBC Hemoglobin Oxygenation Transition

    vec3 color = vec3(0.0);

    // 1. Oxygenation Gradient Calculation along Capillary Transit (vUv.x represents 0% to 100% capillary transit)
    float transitProgress = clamp(vUv.x, 0.0, 1.0);

    // Fick's Law of Diffusion factor: thinner membrane -> faster saturation
    // Normal thickness 0.35 um reaches equilibrium at 1/3 of capillary transit time (0.25s of 0.75s)
    // Thickened membrane (ARDS > 1.5 um) severely delays or prevents full saturation
    float diffusionRate = 1.0 / max(uMembraneThicknessUm / 0.35, 0.2);
    float oxygenSaturationCurve = 1.0 - exp(-transitProgress * 4.5 * diffusionRate);

    // Local capillary PO2 progressing from PvO2 (40 mmHg) to PaO2 (up to PaO2 level, e.g. 100 mmHg)
    float capillaryPO2 = mix(uVenousPvO2, uAlveolarPaO2, oxygenSaturationCurve);

    // Color tones for RBC hemoglobin:
    // Deoxygenated venous blood (PvO2 = 40): Deep plum / cyanotic burgundy vec3(0.38, 0.08, 0.22)
    // Oxygenated arterial blood (PaO2 >= 95): Radiant scarlet / vibrant oxygenated red vec3(0.92, 0.12, 0.14)
    vec3 venousColor = vec3(0.38, 0.08, 0.22);
    vec3 arterialColor = vec3(0.92, 0.12, 0.14);
    vec3 rbcStreamColor = mix(venousColor, arterialColor, oxygenSaturationCurve);

    // Euler-Liljestrand Hypoxic Pulmonary Vasoconstriction (HPV) modulation:
    // When HPV is high, precapillary constriction narrows the functional capillary width and slows plasma flux
    float capillaryCaliber = 1.0 - uHpvVasoconstriction * 0.65;

    // Moving RBC corpuscle dots
    float rbcFlow = sin((vUv.x * 35.0 - uTime * 3.5 * uFlowVelocity) + sin(vUv.y * 40.0));
    float rbcPattern = smoothstep(0.3, 0.8, rbcFlow);

    if (vUv.y < 0.40) {
        // Capillary Lumen
        float lumenPosition = vUv.y / 0.40;
        // Capillary endothelial wall boundary
        float wallProximity = smoothstep(0.85, 1.0, lumenPosition);
        
        // Capillary plasma background
        vec3 plasmaColor = vec3(0.20, 0.05, 0.08);
        vec3 bloodColor = mix(plasmaColor, rbcStreamColor, rbcPattern * capillaryCaliber);

        // Endothelial border highlight
        vec3 endotheliumColor = vec3(0.70, 0.30, 0.35);
        color = mix(bloodColor, endotheliumColor, wallProximity * 0.4);

        // Darken lumen if HPV constriction is severe
        color *= (1.0 - uHpvVasoconstriction * 0.45);
    } 
    else if (vUv.y <= 0.55) {
        // Blood-Air Barrier (Basement Membrane & Type I Epithelium)
        float barrierNorm = (vUv.y - 0.40) / 0.15;
        
        // Healthy basement membrane is an ultra-thin glistening collagen IV sheet: vec3(0.22, 0.50, 0.58)
        vec3 healthyBarrierColor = vec3(0.18, 0.42, 0.48);

        // Pathological thickening & hyaline membrane exudate (fibrin + cell debris): amber/turbid vec3(0.72, 0.52, 0.20)
        float thickeningFactor = clamp((uMembraneThicknessUm - 0.35) / 2.0, 0.0, 1.0);
        vec3 hyalineExudateColor = vec3(0.72, 0.52, 0.20);
        vec3 barrierColor = mix(healthyBarrierColor, hyalineExudateColor, thickeningFactor);

        // Diffusion flux shimmer (oxygen molecules migrating across the gradient)
        float fluxShimmer = sin(vUv.x * 50.0 + uTime * 6.0) * (uAlveolarPaO2 - uVenousPvO2) / 100.0;
        barrierColor += vec3(0.10, 0.25, 0.35) * max(fluxShimmer * (1.0 - thickeningFactor), 0.0);

        color = barrierColor;
    } 
    else {
        // Alveolar Air Space
        float airSpaceNorm = (vUv.y - 0.55) / 0.45;

        // Healthy alveolar gas cavity: luminous dark cyan/sky atmosphere vec3(0.04, 0.12, 0.18)
        vec3 airGasColor = vec3(0.04, 0.12, 0.18) * (uAlveolarPaO2 / 100.0);

        // Surfactant monolayer lining the inner surface (vUv.y close to 0.55)
        float surfactantProximity = 1.0 - smoothstep(0.0, 0.15, airSpaceNorm);
        vec3 surfactantGleam = vec3(0.40, 0.85, 0.90) * (1.0 - uSurfactantDepletion);

        // ARDS Alveolar Flooding: protein-rich exudate fills the alveolar air space from bottom up
        float floodHeight = uAlveolarFlooding;
        float isFlooded = step(airSpaceNorm, floodHeight);
        vec3 floodExudateColor = vec3(0.35, 0.42, 0.15) * 0.8; // Turbid inflammatory alveolar edema

        vec3 dryAlveolus = mix(airGasColor, surfactantGleam, surfactantProximity * 0.65);
        color = mix(dryAlveolus, floodExudateColor, isFlooded * 0.85);
    }

    // Specular lighting based on normal vector and respiratory displacement
    vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 ambient = color * 0.4;
    vec3 diffuse = color * diff * 0.7;

    // Rim lighting (Fresnel)
    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    vec3 rim = vec3(0.3, 0.6, 0.7) * fresnel * 0.3;

    gl_FragColor = vec4(ambient + diffuse + rim, 1.0);
}
`;

/**
 * Calculates Fick's Law diffusion rate for oxygen.
 * V_dot_O2 = [ A * D_O2 * (P_A_O2 - P_v_O2) ] / T
 * 
 * @param paO2 Alveolar PO2 in mmHg (normal ~100)
 * @param pvO2 Mixed venous PO2 in mmHg (normal ~40)
 * @param thicknessUm Blood-air barrier thickness in um (normal ~0.35)
 * @param areaM2 Alveolar functional surface area in m^2 (default 100 m^2)
 * @returns Oxygen diffusion flux rate in mL/min (normal ~250 mL/min at rest)
 */
export function computeFicksDiffusionRate(
  paO2: number,
  pvO2: number,
  thicknessUm: number,
  areaM2: number = 100
): number {
  const deltaP = Math.max(0, paO2 - pvO2);
  const thickness = Math.max(0.1, thicknessUm);
  // Empirical Krogh diffusion constant for O2 in lung tissue ~ 0.0145 mL O2 / (min * mmHg * m^2 / um)
  const dKroghO2 = 0.01458;
  const rate = (areaM2 * dKroghO2 * deltaP) / thickness;
  return Math.round(rate);
}

/**
 * Computes Euler-Liljestrand Hypoxic Pulmonary Vasoconstriction (HPV) response.
 * Local alveolar hypoxia (PaO2 < 60 mmHg) triggers sigmoidal arteriolar vasoconstriction,
 * shunting perfusion away from poorly ventilated alveoli to preserve V/Q ratio.
 * 
 * @param paO2 Alveolar PO2 in mmHg
 * @returns { constrictionRatio, shuntFraction, vqRatio }
 */
export function computeHpvResponse(paO2: number): {
  constrictionRatio: number;
  shuntFraction: number;
  vqRatio: number;
} {
  // Sigmoidal vasoconstriction curve centered at PaO2 = 50 mmHg
  // At PaO2 >= 100 mmHg: constriction = 0.0
  // At PaO2 <= 30 mmHg: constriction -> 0.85
  const constrictionRatio = Number((1.0 / (1.0 + Math.exp((paO2 - 50.0) / 8.0))).toFixed(3));

  // Shunt fraction (Qs/Qt): normal is 3 - 5% (0.04).
  // Without HPV, severe hypoxia causes Qs/Qt to soar to 40%.
  // HPV blunts the shunt by constricting the non-ventilated capillary.
  const baselineShunt = 0.04;
  const hypoxicDrive = Math.max(0, (60.0 - paO2) / 60.0);
  // HPV reduces the potential shunt fraction by up to 60%
  const bluntedShunt = baselineShunt + (hypoxicDrive * 0.35) * (1.0 - constrictionRatio * 0.6);
  const shuntFraction = Number(Math.min(0.50, bluntedShunt).toFixed(3));

  // Ventilation/Perfusion (V/Q) ratio: normal ~ 0.80
  const vRatio = Math.max(0.05, paO2 / 100.0);
  const qRatio = Math.max(0.15, 1.0 - constrictionRatio * 0.70);
  const vqRatio = Number((vRatio / qRatio).toFixed(2));

  return {
    constrictionRatio,
    shuntFraction,
    vqRatio
  };
}

/**
 * Computes PEEP recruitment mechanics along the lung pressure-volume hysteresis curve.
 * 
 * @param peepCmH2O Positive End-Expiratory Pressure (0 - 24 cmH2O)
 * @param surfactantDepletion Surfactant loss ratio (0.0 - 1.0)
 * @param floodingRatio Alveolar edema ratio (0.0 - 1.0)
 * @returns { openAlveoliPercent, complianceMlCmH2O, overdistended }
 */
export function computePeepRecruitment(
  peepCmH2O: number,
  surfactantDepletion: number,
  floodingRatio: number
): {
  openAlveoliPercent: number;
  complianceMlCmH2O: number;
  overdistended: boolean;
} {
  // Lower Inflection Point (LIP: opening pressure): healthy is ~5 cmH2O, ARDS/surfactant loss increases to 8 - 12 cmH2O
  const openingPressure = 5 + surfactantDepletion * 4 + floodingRatio * 3;
  // Upper Inflection Point (UIP: overdistention risk): typically > 18 - 20 cmH2O
  const overdistended = peepCmH2O > 18;

  // Sigmoidal recruitment percentage with steep inflection
  const x = (peepCmH2O - openingPressure) / 2.0;
  const rawRecruitment = 1.0 / (1.0 + Math.exp(-x));
  const openAlveoliPercent = Math.min(100, Math.max(10, Math.round(rawRecruitment * 95 + 5)));

  // Static Compliance (C_stat): normal healthy ~ 60 - 80 mL/cmH2O; ARDS drops to 15 - 30 mL/cmH2O
  const maxCompliance = 65;
  const lungStiffnessMultiplier = 1.0 - (surfactantDepletion * 0.45 + floodingRatio * 0.40);
  const overdistentionPenalty = overdistended ? (peepCmH2O - 18) * 2.5 : 0;
  const complianceMlCmH2O = Math.max(12, Math.round(maxCompliance * lungStiffnessMultiplier * (openAlveoliPercent / 100) - overdistentionPenalty));

  return {
    openAlveoliPercent,
    complianceMlCmH2O,
    overdistended
  };
}

/**
 * Creates a Three.js ShaderMaterial for the Alveolar-Capillary Gas Exchange visualizer.
 */
export function createAlveolarCapillaryMaterial(options: IAlveolarCapillaryOptions = {}): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0 },
    uAlveolarPaO2: { value: options.alveolarPaO2 ?? 100 },
    uVenousPvO2: { value: options.venousPvO2 ?? 40 },
    uAlveolarPaCO2: { value: options.alveolarPaCO2 ?? 40 },
    uVenousPvCO2: { value: options.venousPvCO2 ?? 45 },
    uMembraneThicknessUm: { value: options.membraneThicknessUm ?? 0.35 },
    uHpvVasoconstriction: { value: options.hpvVasoconstriction ?? 0.0 },
    uSurfactantDepletion: { value: options.surfactantDepletion ?? 0.0 },
    uAlveolarFlooding: { value: options.alveolarFloodingRatio ?? 0.0 },
    uPeepCmH2O: { value: options.peepCmH2O ?? 5 },
    uRespiratoryRate: { value: options.respiratoryRateBpm ?? 14 },
    uFlowVelocity: { value: options.flowVelocity ?? 1.0 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_ALVEOLAR_VERTEX,
    fragmentShader: GLSL_ALVEOLAR_FRAGMENT,
    uniforms,
    side: THREE.DoubleSide
  });
}

/**
 * Dynamically updates shader uniforms during real-time animation loops.
 */
export function updateAlveolarCapillaryUniforms(
  material: THREE.ShaderMaterial,
  options: Partial<IAlveolarCapillaryOptions>,
  timeSeconds: number
): void {
  const u = material.uniforms;
  if (!u) return;

  u.uTime.value = timeSeconds;

  if (options.alveolarPaO2 !== undefined) u.uAlveolarPaO2.value = options.alveolarPaO2;
  if (options.venousPvO2 !== undefined) u.uVenousPvO2.value = options.venousPvO2;
  if (options.alveolarPaCO2 !== undefined) u.uAlveolarPaCO2.value = options.alveolarPaCO2;
  if (options.venousPvCO2 !== undefined) u.uVenousPvCO2.value = options.venousPvCO2;
  if (options.membraneThicknessUm !== undefined) u.uMembraneThicknessUm.value = options.membraneThicknessUm;
  if (options.hpvVasoconstriction !== undefined) u.uHpvVasoconstriction.value = options.hpvVasoconstriction;
  if (options.surfactantDepletion !== undefined) u.uSurfactantDepletion.value = options.surfactantDepletion;
  if (options.alveolarFloodingRatio !== undefined) u.uAlveolarFlooding.value = options.alveolarFloodingRatio;
  if (options.peepCmH2O !== undefined) u.uPeepCmH2O.value = options.peepCmH2O;
  if (options.respiratoryRateBpm !== undefined) u.uRespiratoryRate.value = options.respiratoryRateBpm;
  if (options.flowVelocity !== undefined) u.uFlowVelocity.value = options.flowVelocity;
}
