import * as THREE from 'three';

export interface IPancreaticIsletUniforms {
  uTime: { value: number };
  uGlucoseMm: { value: number }; // Extracellular glucose (mmol/L), 3.0 - 25.0
  uAtpAdpRatio: { value: number }; // Intracellular ATP/ADP ratio, 1.0 - 8.0
  uMembranePotentialMv: { value: number }; // Membrane potential (mV), -70.0 to -20.0
  uIntracellularCaUm: { value: number }; // Intracellular [Ca2+] (μM), 0.1 to 2.5
  uExocytosisRateHz: { value: number }; // Granule fusion events/sec, 0.0 - 15.0
  uAmyloidDensity: { value: number }; // IAPP amyloid fibril deposition, 0.0 - 1.0
  uErStressIndex: { value: number }; // Unfolded protein response / ER stress, 0.0 - 1.0
  uSur1BindingRatio: { value: number }; // Sulfonylurea binding ratio, 0.0 - 1.0
  uCoreMantleSeparation: { value: number }; // 0.0 to 1.0
  uIsletCellMix: { value: THREE.Vector3 }; // x: beta (0.70), y: alpha (0.20), z: delta (0.10)
}

/**
 * Computes electrophysiological stimulus-secretion coupling parameters
 * given extracellular glucose in mmol/L and sulfonylurea binding ratio.
 */
export function computeStimulusSecretionCoupling(
  glucoseMm: number,
  sur1Binding: number = 0.0,
  iappDensity: number = 0.0
): {
  atpAdpRatio: number;
  membranePotentialMv: number;
  calciumInfluxUm: number;
  exocytosisRateHz: number;
  firstPhaseRrpReserve: number;
  secondPhaseRpFlux: number;
} {
  // Sigmoidal Hill equation for Glucokinase-mediated ATP production (K_0.5 ~ 7.5 mM)
  const hillCoeff = 1.7;
  const k05 = 7.5;
  const gNorm = Math.pow(glucoseMm, hillCoeff) / (Math.pow(k05, hillCoeff) + Math.pow(glucoseMm, hillCoeff));
  const atpAdp = 1.2 + gNorm * 6.5; // 1.2 to 7.7

  // K_ATP channel open probability: held open at resting glucose (<6.5 mM, atpAdp < 4.0),
  // then sharply closes above glucose threshold (~7.5 mM) or directly by Sulfonylurea (SUR1)
  const kAtpOpenProb = Math.max(0.02, 1.0 / (1.0 + Math.pow(atpAdp / 4.8, 4.0)) * (1.0 - sur1Binding * 0.9));

  // Membrane depolarization from resting -70 mV to -35 mV
  const vRest = -70.0;
  const vThreshold = -45.0;
  const vPeak = -25.0;
  const depolarization = (1.0 - kAtpOpenProb);
  const vMembrane = vRest + depolarization * (vPeak - vRest);

  // L-type Voltage-Gated Ca2+ Channel (VGCC) activation (Boltzman sigmoid)
  const vMid = -35.0;
  const slope = 6.0;
  const vgccActivation = 1.0 / (1.0 + Math.exp(-(vMembrane - vMid) / slope));
  const caInflux = 0.12 + vgccActivation * 2.2; // 0.12 to 2.32 μM

  // Exocytosis rate of insulin granules (depends on [Ca2+]^3 cooperative synaptotagmin-7 binding)
  // IAPP amyloid toxicity impairs granule docking and membrane fusion
  const amyloidSuppression = Math.max(0.1, 1.0 - iappDensity * 0.75);
  const cooperativeFusion = Math.pow(Math.min(2.5, caInflux) / 0.8, 2.8);
  const exocytosisRate = Math.min(18.0, 0.2 + cooperativeFusion * 2.6 * amyloidSuppression);

  // Biphasic pools: RRP (Readily Releasable Pool, ~50 granules) vs RP (Reserve Pool, ~10000 granules)
  const rrpReserve = Math.max(0, 100 - exocytosisRate * 4.5);
  const rpFlux = Math.min(100, exocytosisRate * 6.2);

  return {
    atpAdpRatio: Math.round(atpAdp * 100) / 100,
    membranePotentialMv: Math.round(vMembrane * 10) / 10,
    calciumInfluxUm: Math.round(caInflux * 100) / 100,
    exocytosisRateHz: Math.round(exocytosisRate * 10) / 10,
    firstPhaseRrpReserve: Math.round(rrpReserve),
    secondPhaseRpFlux: Math.round(rpFlux)
  };
}

export function createPancreaticIsletMaterial(): THREE.ShaderMaterial {
  const uniforms: IPancreaticIsletUniforms = {
    uTime: { value: 0.0 },
    uGlucoseMm: { value: 5.5 }, // Normal fasting ~5.5 mM
    uAtpAdpRatio: { value: 2.8 },
    uMembranePotentialMv: { value: -65.0 },
    uIntracellularCaUm: { value: 0.18 },
    uExocytosisRateHz: { value: 1.2 },
    uAmyloidDensity: { value: 0.0 },
    uErStressIndex: { value: 0.0 },
    uSur1BindingRatio: { value: 0.0 },
    uCoreMantleSeparation: { value: 0.75 },
    uIsletCellMix: { value: new THREE.Vector3(0.70, 0.20, 0.10) }
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vCellZone; // 0: beta (core), 1: alpha (mantle), 2: delta

    uniform float uTime;
    uniform float uExocytosisRateHz;
    uniform float uErStressIndex;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      vPosition = position;

      // Radial zoning: core (beta) vs mantle (alpha/delta)
      float radius = length(position);
      float cellNoise = sin(position.x * 12.0) * cos(position.y * 12.0) * sin(position.z * 12.0);
      
      if (radius < 1.1 + cellNoise * 0.15) {
        vCellZone = 0.0; // Core Beta-cell
      } else if (cellNoise > 0.3) {
        vCellZone = 2.0; // Delta-cell
      } else {
        vCellZone = 1.0; // Mantle Alpha-cell
      }

      // Exocytosis granule fusion surface blebbing
      float blebFreq = 18.0;
      float blebPulse = sin(uTime * 4.0 + position.y * blebFreq) * cos(uTime * 3.5 + position.x * blebFreq);
      float blebDisplacement = blebPulse * (uExocytosisRateHz * 0.008);

      // ER stress cellular swelling and membrane ruffled roughness
      float stressRuffle = sin(position.z * 30.0 + uTime * 2.0) * (uErStressIndex * 0.035);

      vec3 displacedPos = position + normal * (blebDisplacement + stressRuffle);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPos, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying float vCellZone;

    uniform float uTime;
    uniform float uGlucoseMm;
    uniform float uAtpAdpRatio;
    uniform float uIntracellularCaUm;
    uniform float uExocytosisRateHz;
    uniform float uAmyloidDensity;
    uniform float uErStressIndex;

    void main() {
      vec3 norm = normalize(vNormal);
      vec3 lightDir = normalize(vec3(0.6, 0.8, 1.0));
      float diff = max(dot(norm, lightDir), 0.15);

      // Fresnel rim lighting for biological transparency
      vec3 viewDir = normalize(-vPosition);
      float fresnel = pow(1.0 - max(dot(viewDir, norm), 0.0), 2.5);

      // Distinct cellular hues:
      // Beta-cell: Emerald/Cyan (#10b981 / #06b6d4) with secretory granules
      // Alpha-cell: Amber/Gold (#f59e0b)
      // Delta-cell: Royal Violet (#8b5cf6)
      vec3 cellColor;
      if (vCellZone < 0.5) {
        // Beta-cell core: metabolic flash proportional to [Ca2+] and exocytosis
        float caSpark = sin(uTime * 8.0 + vPosition.x * 25.0) * cos(uTime * 6.0 + vPosition.y * 25.0);
        float fusionSparkle = step(0.65, caSpark) * (uIntracellularCaUm * 0.4);
        cellColor = mix(vec3(0.06, 0.72, 0.51), vec3(0.13, 0.83, 0.93), fusionSparkle);
      } else if (vCellZone < 1.5) {
        // Alpha-cell mantle: Amber
        cellColor = vec3(0.96, 0.62, 0.04);
      } else {
        // Delta-cell: Violet
        cellColor = vec3(0.55, 0.36, 0.96);
      }

      // IAPP Amyloid fibril deposits (greyish-white Congo Red birefringence sheen)
      if (uAmyloidDensity > 0.05) {
        float fibrilPattern = step(0.7, sin(vPosition.x * 40.0 + vPosition.y * 35.0));
        vec3 amyloidColor = vec3(0.85, 0.88, 0.92);
        cellColor = mix(cellColor, amyloidColor, fibrilPattern * uAmyloidDensity * 0.85);
      }

      // ER stress apoptotic pallor / oxidative darkening
      if (uErStressIndex > 0.1) {
        vec3 stressPallor = vec3(0.75, 0.20, 0.25);
        cellColor = mix(cellColor, stressPallor, uErStressIndex * 0.55);
      }

      vec3 finalColor = cellColor * (diff * 0.85 + 0.15) + vec3(0.4, 0.9, 0.8) * fresnel * 0.6;
      gl_FragColor = vec4(finalColor, 0.94);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  });
}

export function updatePancreaticIsletUniforms(
  material: THREE.ShaderMaterial,
  timeSec: number,
  glucoseMm: number,
  sur1Binding: number = 0.0,
  amyloidDensity: number = 0.0,
  erStress: number = 0.0
): void {
  const coupling = computeStimulusSecretionCoupling(glucoseMm, sur1Binding, amyloidDensity);
  const u = material.uniforms as unknown as IPancreaticIsletUniforms;

  u.uTime.value = timeSec;
  u.uGlucoseMm.value = glucoseMm;
  u.uAtpAdpRatio.value = coupling.atpAdpRatio;
  u.uMembranePotentialMv.value = coupling.membranePotentialMv;
  u.uIntracellularCaUm.value = coupling.calciumInfluxUm;
  u.uExocytosisRateHz.value = coupling.exocytosisRateHz;
  u.uAmyloidDensity.value = amyloidDensity;
  u.uErStressIndex.value = erStress;
  u.uSur1BindingRatio.value = sur1Binding;
}
