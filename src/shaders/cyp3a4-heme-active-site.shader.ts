/**
 * PocketGull 3D Hepatic Cytochrome P450 (CYP3A4 / Heme) Active-Site Slicer Shader (Visual Model V10)
 * 
 * Biophysical & Enzymatic Foundations:
 * 1. Protoporphyrin IX (Heme-b):
 *    - Planar tetrapyrrole macrocycle coordinating central Iron (Fe).
 *    - 4 equatorial pyrrole nitrogen bonds.
 *    - Proximal (5th) axial coordination to Cys442 thiolate anion (RS-), generating the
 *      canonical "thiolate push" that labilizes the distal O-O bond.
 * 
 * 2. Catalytic P450 Reaction Cycle:
 *    - Stage 0: Low-spin resting ferric hexacoordinate [Fe3+ - H2O]. Soret peak at 417 nm.
 *    - Stage 1: Substrate enters hydrophobic pocket, displaces distal water, inducing
 *      spin-state shift to high-spin pentacoordinate [Fe3+], shifting redox potential +100 mV.
 *    - Stage 2: First electron transfer from CPR (NADPH-Cytochrome P450 Reductase) -> Ferrous [Fe2+].
 *      Rapid O2 binding -> Ferrous dioxy intermediate [Fe2+ - O2 <-> Fe3+ - O2.-].
 *    - Stage 3: Second electron & protonation -> Hydroperoxo [Fe3+ - OOH] (Compound 0).
 *      Heterolytic O-O cleavage -> Oxyferryl porphyrin pi-cation radical [Fe4+=O, Por.+] (Compound I).
 *    - Stage 4: Hydrogen atom abstraction & oxygen rebound -> Substrate hydroxylation [R-OH]
 *      and recovery of resting ferric state.
 * 
 * 3. Mechanisms of Inhibition:
 *    - Competitive Inhibition: Direct coordinate bond between azole nitrogen (e.g. Ketoconazole)
 *      and ferric heme iron (6th coordination position), producing a hyper-stable Type II spectrum.
 *    - Mechanism-Based Inactivation (MBI / Suicide Inhibition): Metabolic activation of macrolide
 *      (Clarithromycin) or furanocoumarin (Grapefruit bergamottin) generating a nitrosoalkene or
 *      reactive carbene that irreversibly alkylates the heme pyrrole ring or apoprotein Cys442,
 *      permanently destroying the monooxygenase.
 * 
 * 4. Endoplasmic Reticulum (ER) Anchor:
 *    - N-terminal hydrophobic transmembrane helix embedded in the smooth ER bilayer membrane.
 */

import * as THREE from 'three';

export type CatalyticStage = 
  | 'resting_ferric'         // Stage 0: [Fe3+-H2O] Soret 417nm
  | 'substrate_bound'        // Stage 1: [Fe3+-RH] High spin, Soret 390nm
  | 'ferrous_dioxy'          // Stage 2: [Fe2+-O2]
  | 'compound_i_ferryl'      // Stage 3: [Fe4+=O(Por.+)] High-valent reactive intermediate
  | 'product_rebound';       // Stage 4: [Fe3+-ROH] Hydroxylated product dissociation

export type InhibitorBindingMode =
  | 'none'                   // Normal catalytic turnover
  | 'competitive_azole'      // Ketoconazole: N-coordination to Fe (Type II spectrum, Soret 424nm)
  | 'suicide_inactivation';  // Clarithromycin / Bergamottin: Irreversible quasi-irreversible MBI adduct

export interface ICyp3a4HemeOptions {
  catalyticStage?: CatalyticStage;
  inhibitorMode?: InhibitorBindingMode;
  substrateBindingRatio?: number;      // 0.0 to 1.0 (Km saturation)
  membraneFluidity?: number;           // 0.5 to 2.0 (ER lipid bilayer dynamic oscillation)
  thiolatePushIntensity?: number;      // 0.8 to 1.5 (Cys442 S- electron donation strength)
}

export const GLSL_CYP3A4_HEME_VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vCatalyticExcitation;

uniform float uTime;
uniform float uStageIndex;           // 0.0 to 4.0
uniform float uSubstrateRatio;       // 0.0 to 1.0
uniform float uInhibitorMode;        // 0.0 = none, 1.0 = azole, 2.0 = MBI
uniform float uMembraneFluidity;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Substrate docking conformational breathing in the hydrophobic active site pocket
    float pocketBreathing = sin(uTime * 3.0 + position.y * 4.0) * 0.015 * (1.0 + uSubstrateRatio);

    // High-energy ferryl-oxo Compound I pulsation (Stage 3)
    float isCompoundI = smoothstep(2.5, 3.0, uStageIndex) * (1.0 - smoothstep(3.2, 3.8, uStageIndex));
    float radicalPulsation = isCompoundI * sin(uTime * 12.0) * 0.035;

    // Suicide MBI alkylation distortion (adduct strains the porphyrin macrocycle)
    float mbiDistortion = (uInhibitorMode >= 1.5) ? (sin(position.x * 10.0) * cos(position.z * 10.0) * 0.04) : 0.0;

    // Smooth ER lipid bilayer undulation (fluid mosaic lipid oscillations)
    float lipidWave = sin(uTime * 1.5 * uMembraneFluidity + position.x * 2.0 + position.z * 2.0) * 0.02;

    vec3 displaced = position + normal * (pocketBreathing + radicalPulsation + mbiDistortion + lipidWave);
    vCatalyticExcitation = isCompoundI + (uSubstrateRatio * 0.5);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const GLSL_CYP3A4_HEME_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vCatalyticExcitation;

uniform float uTime;
uniform float uStageIndex;           // 0.0 (Resting), 1.0 (Substrate), 2.0 (Oxy), 3.0 (Cmpd I), 4.0 (Rebound)
uniform float uSubstrateRatio;       // 0.0 to 1.0
uniform float uInhibitorMode;        // 0.0 = none, 1.0 = azole, 2.0 = MBI
uniform float uThiolatePush;         // 0.8 to 1.5
uniform vec3 uColorRestingHeme;     // Deep porphyric crimson #881337
uniform vec3 uColorCompoundI;        // Luminous oxo-ferryl radical #f43f5e
uniform vec3 uColorAzoleInhibited;   // Coordinate azole emerald #10b981
uniform vec3 uColorMbiInactivated;   // Alkylated necrotic amber #f59e0b

void main() {
    vec3 N = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    float diff = max(dot(N, lightDir), 0.0);
    
    // Fresnel edge highlighting (active site optical rim)
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(N, viewDir), 0.0), 3.0);

    // Procedural Porphyrin IX Tetrapyrrole Ring Pattern
    // 4 symmetric pyrrole lobes centered around the coordinating iron atom
    float distFromCenter = length(vPosition.xz);
    float angle = atan(vPosition.z, vPosition.x);
    float pyrroleSymmetry = cos(angle * 4.0); // 4-fold pyrrole symmetry
    float ringPattern = smoothstep(0.15, 0.25, distFromCenter) * (1.0 - smoothstep(0.85, 1.05, distFromCenter));
    float ironCore = 1.0 - smoothstep(0.0, 0.18, distFromCenter);

    // Color Interpolation based on Catalytic Reaction Stage
    vec3 baseColor = uColorRestingHeme;

    // Stage 1 -> 2: Substrate binding & Oxy-ferrous formation
    if (uStageIndex > 0.5 && uStageIndex <= 2.5) {
        float t = (uStageIndex - 0.5) / 2.0;
        baseColor = mix(uColorRestingHeme, vec3(0.7, 0.1, 0.2), t);
    }
    // Stage 3: Compound I High-Valent Ferryl-Oxo [Fe4+=O] Radical Cation
    else if (uStageIndex > 2.5 && uStageIndex <= 3.5) {
        float t = (uStageIndex - 2.5);
        vec3 ferrylOxo = mix(vec3(0.7, 0.1, 0.2), uColorCompoundI, t);
        // Add pulsating electric glow to the oxo radical bond
        float radicalGlow = sin(uTime * 15.0) * 0.2 + 0.8;
        baseColor = ferrylOxo * radicalGlow;
    }
    // Stage 4: Substrate Hydroxylation & Rebound
    else if (uStageIndex > 3.5) {
        float t = (uStageIndex - 3.5) / 0.5;
        baseColor = mix(uColorCompoundI, uColorRestingHeme, t);
    }

    // Overlay Inhibitor Alterations
    if (uInhibitorMode > 0.5 && uInhibitorMode < 1.5) {
        // Competitive Azole (Ketoconazole) coordinates directly to Fe core -> Type II Soret Shift
        baseColor = mix(baseColor, uColorAzoleInhibited, 0.7);
    } else if (uInhibitorMode >= 1.5) {
        // Suicide Inactivator (Clarithromycin MBI) -> Heme destruction & alkylation adduct
        baseColor = mix(baseColor, uColorMbiInactivated, 0.85);
    }

    // Iron Core Visual Luster (Iron center is bright & metallic)
    if (ironCore > 0.01) {
        vec3 ironTone = (uStageIndex > 2.5 && uStageIndex <= 3.5) 
            ? vec3(1.0, 0.9, 0.3) // Incandescent yellow-gold ferryl oxygen
            : vec3(0.85, 0.75, 0.7); // Ferric iron
        baseColor = mix(baseColor, ironTone, ironCore);
    }

    // Proximal Cys442 Thiolate Push modulation (subtle sulfur yellow luminescent flux)
    float thiolateGlow = smoothstep(0.6, 1.0, uThiolatePush) * 0.15 * sin(uTime * 4.0);
    baseColor += vec3(0.12, 0.10, 0.0) * thiolateGlow;

    // Final Lighting Composition
    vec3 ambient = baseColor * 0.35;
    vec3 diffuse = baseColor * diff * 0.75;
    vec3 specular = vec3(1.0) * pow(max(dot(reflect(-lightDir, N), viewDir), 0.0), 16.0) * 0.3;
    vec3 rimGlow = baseColor * fresnel * 0.6;

    gl_FragColor = vec4(ambient + diffuse + specular + rimGlow, 0.92);
}
`;

/**
 * Creates the specialized CYP3A4 Heme Active Site ShaderMaterial
 */
export function createCyp3a4HemeMaterial(options: ICyp3a4HemeOptions = {}): THREE.ShaderMaterial {
  const stageMap: Record<CatalyticStage, number> = {
    resting_ferric: 0.0,
    substrate_bound: 1.0,
    ferrous_dioxy: 2.0,
    compound_i_ferryl: 3.0,
    product_rebound: 4.0
  };

  const inhibitorMap: Record<InhibitorBindingMode, number> = {
    none: 0.0,
    competitive_azole: 1.0,
    suicide_inactivation: 2.0
  };

  const stageIndex = stageMap[options.catalyticStage ?? 'resting_ferric'];
  const inhibitorMode = inhibitorMap[options.inhibitorMode ?? 'none'];

  return new THREE.ShaderMaterial({
    vertexShader: GLSL_CYP3A4_HEME_VERTEX,
    fragmentShader: GLSL_CYP3A4_HEME_FRAGMENT,
    uniforms: {
      uTime: { value: 0.0 },
      uStageIndex: { value: stageIndex },
      uSubstrateRatio: { value: options.substrateBindingRatio ?? 0.8 },
      uInhibitorMode: { value: inhibitorMode },
      uThiolatePush: { value: options.thiolatePushIntensity ?? 1.15 },
      uMembraneFluidity: { value: options.membraneFluidity ?? 1.0 },
      uColorRestingHeme: { value: new THREE.Color(0x881337) },      // Carmine 900
      uColorCompoundI: { value: new THREE.Color(0xf43f5e) },        // Rose 500 radical
      uColorAzoleInhibited: { value: new THREE.Color(0x10b981) },   // Emerald 500
      uColorMbiInactivated: { value: new THREE.Color(0xf59e0b) }    // Amber 500
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true
  });
}

/**
 * Updates uniforms on an existing CYP3A4 Heme ShaderMaterial
 */
export function updateCyp3a4HemeUniforms(
  material: THREE.ShaderMaterial,
  timeSec: number,
  options: ICyp3a4HemeOptions
): void {
  if (!material.uniforms) return;

  material.uniforms['uTime'].value = timeSec;

  if (options.catalyticStage !== undefined) {
    const stageMap: Record<CatalyticStage, number> = {
      resting_ferric: 0.0,
      substrate_bound: 1.0,
      ferrous_dioxy: 2.0,
      compound_i_ferryl: 3.0,
      product_rebound: 4.0
    };
    material.uniforms['uStageIndex'].value = stageMap[options.catalyticStage];
  }

  if (options.inhibitorMode !== undefined) {
    const inhibitorMap: Record<InhibitorBindingMode, number> = {
      none: 0.0,
      competitive_azole: 1.0,
      suicide_inactivation: 2.0
    };
    material.uniforms['uInhibitorMode'].value = inhibitorMap[options.inhibitorMode];
  }

  if (options.substrateBindingRatio !== undefined) {
    material.uniforms['uSubstrateRatio'].value = options.substrateBindingRatio;
  }
  if (options.membraneFluidity !== undefined) {
    material.uniforms['uMembraneFluidity'].value = options.membraneFluidity;
  }
  if (options.thiolatePushIntensity !== undefined) {
    material.uniforms['uThiolatePush'].value = options.thiolatePushIntensity;
  }
}

/**
 * Computes catalytic intermediate thermodynamics & spectroscopic Soret absorption
 */
export function computeCatalyticThermodynamics(stage: CatalyticStage, inhibitor: InhibitorBindingMode): {
  soretPeakNm: number;
  ironOxidationState: string;
  coordinationNumber: 5 | 6;
  freeEnergyKcalMol: number;
  spectroscopicSignature: string;
} {
  if (inhibitor === 'competitive_azole') {
    return {
      soretPeakNm: 424,
      ironOxidationState: 'Fe3+ (Low Spin, Azole N-coordinated)',
      coordinationNumber: 6,
      freeEnergyKcalMol: -12.4, // High-affinity coordinate trap
      spectroscopicSignature: 'Type II Optical Difference Spectrum (Peak 424–430 nm, Trough 390 nm)'
    };
  }

  if (inhibitor === 'suicide_inactivation') {
    return {
      soretPeakNm: 446,
      ironOxidationState: 'Fe2+-MI (Metabolite-Intermediate Complex) / Alkylated Heme',
      coordinationNumber: 6,
      freeEnergyKcalMol: -28.6, // Irreversible suicide covalent bound
      spectroscopicSignature: 'Metabolite-Intermediate Complex (MIC Peak 446–455 nm, Total Loss of Function)'
    };
  }

  switch (stage) {
    case 'resting_ferric':
      return {
        soretPeakNm: 417,
        ironOxidationState: 'Fe3+ (Low Spin, Hexacoordinate [Fe3+-H2O])',
        coordinationNumber: 6,
        freeEnergyKcalMol: 0.0,
        spectroscopicSignature: 'Resting Hexacoordinate Ferric Heme (Soret 417 nm)'
      };
    case 'substrate_bound':
      return {
        soretPeakNm: 390,
        ironOxidationState: 'Fe3+ (High Spin, Pentacoordinate [Fe3+-RH])',
        coordinationNumber: 5,
        freeEnergyKcalMol: -4.8,
        spectroscopicSignature: 'Type I Substrate Binding Shift (Soret Blue-Shift 390 nm, +100 mV Redox Shift)'
      };
    case 'ferrous_dioxy':
      return {
        soretPeakNm: 418,
        ironOxidationState: 'Fe2+-O2 <-> Fe3+-O2.- (Ferrous Dioxy Superoxide)',
        coordinationNumber: 6,
        freeEnergyKcalMol: -14.2,
        spectroscopicSignature: 'Ternary Oxy-P450 Complex (Soret 418 nm)'
      };
    case 'compound_i_ferryl':
      return {
        soretPeakNm: 365,
        ironOxidationState: 'Fe4+=O (Por.+) Radical Cation (Compound I)',
        coordinationNumber: 6,
        freeEnergyKcalMol: -31.5,
        spectroscopicSignature: 'High-Valent Oxyferryl Radical Cation (Near-UV Soret 365 nm, EPR g=2.0)'
      };
    case 'product_rebound':
      return {
        soretPeakNm: 417,
        ironOxidationState: 'Fe3+-ROH -> Dissociation & Rehydration',
        coordinationNumber: 6,
        freeEnergyKcalMol: -45.0,
        spectroscopicSignature: 'Product Hydroxylation & Ferric Regeneration (Soret 417 nm)'
      };
  }
}
