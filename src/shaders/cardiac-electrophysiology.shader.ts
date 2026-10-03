/**
 * PocketGull 3D Cardiac Electrophysiology & Action Potential Conduction Shader (Visual Model V6)
 * 
 * Biophysical Foundations:
 * 1. 5-Phase Ventricular Action Potential (Courtemanche / ten Tusscher-Panfilov Formulation):
 *    - Phase 0: Rapid I_Na inward depolarization (-90 mV to +25 mV, dV/dt > 250 V/s)
 *    - Phase 1: Transient outward I_to potassium notch
 *    - Phase 2: L-type I_Ca,L calcium plateau balancing delayed rectifier I_Kr / I_Ks (~250-350 ms)
 *    - Phase 3: Rapid repolarization mediated by delayed rectifier I_Kr (hERG/KCNH2) and I_Ks
 *    - Phase 4: Stable electrical diastole resting potential (-90 mV) maintained by I_K1 inward rectifier
 * 
 * 2. Drug-Induced Long QTc & Arrhythmogenesis:
 *    - Pharmacological hERG (I_Kr) blockade prolongs Phase 2/3 repolarization (QTc > 500 ms).
 *    - Transmural Dispersion of Repolarization (TDR) between Endocardium, M-cells, and Epicardium.
 *    - Early Afterdepolarizations (EADs): L-type Ca2+ channel reactivation during prolonged plateau
 *      triggers voltage oscillation spikes precipitating Polymorphic Ventricular Tachycardia (Torsades de Pointes).
 */

import * as THREE from 'three';

export interface ICardiacElectrophysiologyOptions {
  heartRateBpm?: number;          // Heart rate (40 - 180 bpm)
  qtcIntervalMs?: number;         // QTc interval in ms (360 - 600 ms, normal < 440m/460f)
  conductionVelocity?: number;    // Wavefront propagation speed (0.5 - 2.0 m/s)
  eadInstability?: number;        // 0.0 (quiescent) to 1.0 (chaotic EAD oscillation / TdP)
  transmuralDispersion?: number;  // Endocardial-Epicardial heterogeneity (0.0 - 1.0)
  isLongQtcActive?: boolean;      // Toggle drug-induced repolarization prolongation
}

export const GLSL_CARDIAC_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vActionPotential;

uniform float uTime;
uniform float uHeartRateBpm;
uniform float uConductionVelocity;
uniform float uQtcIntervalMs;
uniform float uEadInstability;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Cardiac cycle frequency in Hz (BPM / 60)
    float cycleFreq = uHeartRateBpm / 60.0;
    float cycleTime = fract(uTime * cycleFreq);

    // Conduction wave propagation along longitudinal ventricle axis (Z or Y)
    float waveDist = position.y * 0.25 + 0.5;
    float wavePhase = fract(cycleTime - waveDist * (1.0 / max(0.2, uConductionVelocity)));

    // Ventricular Action Potential Waveform Curve:
    // Phase 0 Upstroke: rapid steep rise at wavePhase ~ 0.0 to 0.05
    float upstroke = smoothstep(0.0, 0.04, wavePhase) * (1.0 - smoothstep(0.04, 0.08, wavePhase));
    
    // Phase 2 Plateau: prolonged plateau proportional to QTc
    float plateauDuration = mix(0.25, 0.45, (uQtcIntervalMs - 380.0) / 220.0);
    float plateau = smoothstep(0.04, 0.08, wavePhase) * (1.0 - smoothstep(plateauDuration, plateauDuration + 0.15, wavePhase));

    // Early Afterdepolarization (EAD) voltage flutter in Phase 2/3
    float eadFlutter = 0.0;
    if (uEadInstability > 0.05) {
        float inPlateau = step(0.15, wavePhase) * (1.0 - step(plateauDuration + 0.1, wavePhase));
        eadFlutter = sin(uTime * 45.0 + position.y * 12.0) * uEadInstability * inPlateau * 0.15;
    }

    float vm = upstroke * 1.2 + plateau * 0.85 + eadFlutter;
    vActionPotential = clamp(vm, 0.0, 1.2);

    // Electromechanical Systolic Contraction (Coupled to calcium plateau)
    float contraction = plateau * 0.06;
    vec3 displaced = position - normal * contraction;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_CARDIAC_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vActionPotential;

uniform float uTime;
uniform float uQtcIntervalMs;
uniform float uEadInstability;
uniform float uTransmuralDispersion;
uniform float uIsLongQtc;

// Action Potential Voltage Palette
const vec3 COLOR_REST_DIASTOLE = vec3(0.03, 0.04, 0.07);      // -90 mV Resting electrical silence
const vec3 COLOR_PHASE0_DEPOL = vec3(0.15, 0.95, 1.0);        // +25 mV Rapid I_Na sodium upstroke (Electric Cyan)
const vec3 COLOR_PHASE2_PLATEAU = vec3(0.98, 0.68, 0.15);     // 0 mV I_Ca,L calcium plateau (Amber Gold)
const vec3 COLOR_PHASE3_REPOL = vec3(0.65, 0.20, 0.90);       // I_Kr repolarization wave (Deep Violet)
const vec3 COLOR_EAD_ARRHYTHMIA = vec3(0.98, 0.15, 0.25);     // Pathological EAD trigger / Torsades hazard (Ruby Red)

void main() {
    float vm = vActionPotential;

    // Transmural gradient (Endocardium vs M-cells vs Epicardium across UV)
    float transmuralNoise = sin(vUv.x * 25.0 + vUv.y * 15.0) * 0.08 * uTransmuralDispersion;
    vm = clamp(vm + transmuralNoise, 0.0, 1.2);

    // Color gradient across Action Potential
    vec3 baseColor = COLOR_REST_DIASTOLE;

    if (vm > 0.8) {
        // Phase 0 Sodium depolarization peak
        float factor = (vm - 0.8) / 0.4;
        baseColor = mix(COLOR_PHASE2_PLATEAU, COLOR_PHASE0_DEPOL, factor);
    } else if (vm > 0.3) {
        // Phase 2 Calcium plateau
        float factor = (vm - 0.3) / 0.5;
        baseColor = mix(COLOR_PHASE3_REPOL, COLOR_PHASE2_PLATEAU, factor);
    } else if (vm > 0.02) {
        // Phase 3 Potassium repolarization tail
        float factor = vm / 0.3;
        baseColor = mix(COLOR_REST_DIASTOLE, COLOR_PHASE3_REPOL, factor);
    }

    // Overlay EAD Arrhythmia hazard glow when instability is high
    if (uEadInstability > 0.3 && vm > 0.4) {
        float arrhythmiaPulse = sin(uTime * 30.0 + vUv.x * 40.0) * 0.5 + 0.5;
        baseColor = mix(baseColor, COLOR_EAD_ARRHYTHMIA, arrhythmiaPulse * uEadInstability * 0.7);
    }

    // Long QTc prolongation marker: widen amber-violet border
    if (uIsLongQtc > 0.5 && vm > 0.25 && vm < 0.75) {
        baseColor += vec3(0.2, 0.05, 0.25);
    }

    // Cellular striated myofibril texture
    float myofibril = sin(vUv.y * 180.0) * 0.06;
    baseColor += vec3(myofibril);

    // Rim lighting (Fresnel)
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.5);
    baseColor += mix(COLOR_PHASE3_REPOL, COLOR_PHASE0_DEPOL, vm) * fresnel * 0.4;

    gl_FragColor = vec4(baseColor, 1.0);
}
`;

/**
 * Factory for creating the Cardiac Electrophysiology ShaderMaterial
 */
export function createCardiacElectrophysiologyMaterial(
  options: ICardiacElectrophysiologyOptions = {}
): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0.0 },
    uHeartRateBpm: { value: options.heartRateBpm ?? 72.0 },
    uQtcIntervalMs: { value: options.qtcIntervalMs ?? 410.0 },
    uConductionVelocity: { value: options.conductionVelocity ?? 1.0 },
    uEadInstability: { value: options.eadInstability ?? 0.0 },
    uTransmuralDispersion: { value: options.transmuralDispersion ?? 0.2 },
    uIsLongQtc: { value: options.isLongQtcActive ? 1.0 : 0.0 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_CARDIAC_VERTEX,
    fragmentShader: GLSL_CARDIAC_FRAGMENT,
    uniforms,
    side: THREE.DoubleSide,
    transparent: false
  });
}

/**
 * Updates uniforms safely on an existing CardiacElectrophysiology ShaderMaterial
 */
export function updateCardiacUniforms(
  material: THREE.ShaderMaterial,
  deltaSec: number,
  options?: Partial<ICardiacElectrophysiologyOptions>
): void {
  if (!material.uniforms) return;

  if (material.uniforms['uTime']) {
    material.uniforms['uTime'].value += deltaSec;
  }

  if (options) {
    if (options.heartRateBpm !== undefined && material.uniforms['uHeartRateBpm']) {
      material.uniforms['uHeartRateBpm'].value = options.heartRateBpm;
    }
    if (options.qtcIntervalMs !== undefined && material.uniforms['uQtcIntervalMs']) {
      material.uniforms['uQtcIntervalMs'].value = options.qtcIntervalMs;
    }
    if (options.conductionVelocity !== undefined && material.uniforms['uConductionVelocity']) {
      material.uniforms['uConductionVelocity'].value = options.conductionVelocity;
    }
    if (options.eadInstability !== undefined && material.uniforms['uEadInstability']) {
      material.uniforms['uEadInstability'].value = options.eadInstability;
    }
    if (options.transmuralDispersion !== undefined && material.uniforms['uTransmuralDispersion']) {
      material.uniforms['uTransmuralDispersion'].value = options.transmuralDispersion;
    }
    if (options.isLongQtcActive !== undefined && material.uniforms['uIsLongQtc']) {
      material.uniforms['uIsLongQtc'].value = options.isLongQtcActive ? 1.0 : 0.0;
    }
  }
}
