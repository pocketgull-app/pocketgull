import * as THREE from 'three';

export interface ICyp3a4HemeUniforms {
  uTime: { value: number };
  uCatalyticCyclePhase: { value: number }; // 0: Resting Fe(III), 1: Substrate Bound, 2: Fe(II) Reduced, 3: Oxy-complex, 4: Compound I Ferryl-Oxo, 5: Radical Rebound, 6: Product Release
  uSubstrateMode: { value: number }; // 0: Normal Hydroxylation (Simvastatin), 1: Competitive Azole (Ketoconazole), 2: Suicide MBI (Clarithromycin)
  uFerrylOxoIntensity: { value: number }; // [Fe4+=O] radical cation luminescence (0.0 - 2.0)
  uActiveSiteVolumeA3: { value: number }; // Active site cavity volume (1100 - 1800 A^3)
  uCys442ThiolateTension: { value: number }; // Axial Fe-S(Cys) bond distance/vibration (0.0 - 1.0)
  uErLipidBilayerFlow: { value: number }; // ER membrane fluidity displacement
  uSuicideAdductProgress: { value: number }; // Covalent heme destruction in MBI (0.0 - 1.0)
  uSoretAbsorbanceNm: { value: number }; // Soret peak wavelength (450 nm active, 420 nm inactivated)
}

/**
 * Computes P450 catalytic cycle thermodynamics & spectroscopic intermediates
 */
export function computeCypCatalyticState(
  cyclePhase: number,
  substrateMode: number = 0,
  inhibitorConcUm: number = 1.0
): {
  ferrylOxoGlow: number;
  ironValence: string;
  spinState: string;
  soretPeakNm: number;
  hemeIntegrity: number;
  reactionDescription: string;
} {
  // If Suicide Inactivator (MBI), covalent destruction shifts Soret from 450nm to inactive 420nm
  if (substrateMode === 2) {
    const adductFraction = Math.min(1.0, inhibitorConcUm * 0.45);
    return {
      ferrylOxoGlow: 0.1,
      ironValence: 'Fe(II)-Nitrosoalkene / Covalent Adduct',
      spinState: 'Inactivated Low-Spin (Loss of Catalytic Activity)',
      soretPeakNm: 450 - adductFraction * 30.0, // 450 nm down to 420 nm P420
      hemeIntegrity: 1.0 - adductFraction * 0.85,
      reactionDescription: 'Mechanism-Based Inactivation (MBI): Reactive nitrosoalkene or furan radical forms an irreversible covalent adduct with the pyrrole nitrogen, extinguishing P450 monooxygenase activity.'
    };
  }

  // If Competitive Azole Inhibitor
  if (substrateMode === 1) {
    return {
      ferrylOxoGlow: 0.05,
      ironValence: 'Fe(III)-Azole Nitrogen Hexacoordinate',
      spinState: 'Steric Low-Spin (S = 1/2)',
      soretPeakNm: 432, // Type II spectral shift ~430-435 nm
      hemeIntegrity: 1.0,
      reactionDescription: 'Competitive Reversible Inhibition: Nitrogen lone pair of azole pharmacophore coordinates directly to the distal sixth coordination site of heme Fe(III), blocking oxygen access.'
    };
  }

  // Normal Catalytic Hydroxylation Cycle (Phases 0 - 6)
  const normPhase = Math.floor(cyclePhase) % 7;
  switch (normPhase) {
    case 0:
      return {
        ferrylOxoGlow: 0.15,
        ironValence: 'Fe(III) Resting State (Aqua-ligated)',
        spinState: 'Low-Spin Hexacoordinate (S = 1/2)',
        soretPeakNm: 418,
        hemeIntegrity: 1.0,
        reactionDescription: 'Resting State: Hexacoordinate ferric heme with proximal Cys442 thiolate and distal H2O molecule.'
      };
    case 1:
      return {
        ferrylOxoGlow: 0.4,
        ironValence: 'Fe(III) Substrate-Bound',
        spinState: 'High-Spin Pentacoordinate (S = 5/2)',
        soretPeakNm: 390, // Type I spectral shift ~390 nm
        hemeIntegrity: 1.0,
        reactionDescription: 'Substrate Enters Pocket: Water expelled from active site, shifting redox potential from -300 mV to -225 mV.'
      };
    case 2:
      return {
        ferrylOxoGlow: 0.6,
        ironValence: 'Fe(II) Reduced Ferrous',
        spinState: 'High-Spin Pentacoordinate (S = 2)',
        soretPeakNm: 408,
        hemeIntegrity: 1.0,
        reactionDescription: 'First Electron Transfer: Cytochrome P450 Reductase (CPR) transfers 1 e- from NADPH to reduce Fe(III) to Fe(II).'
      };
    case 3:
      return {
        ferrylOxoGlow: 1.1,
        ironValence: 'Fe(III)-O2•- Ferrous Dioxy',
        spinState: 'Oxy-P450 Complex',
        soretPeakNm: 418,
        hemeIntegrity: 1.0,
        reactionDescription: 'Oxygen Binding: Molecular O2 rapidly binds open axial position of ferrous heme.'
      };
    case 4:
      return {
        ferrylOxoGlow: 2.0, // Peak Ferryl-Oxo luminescence
        ironValence: '[Fe(IV)=O]•+ Compound I (Ferryl-Oxo Radical Cation)',
        spinState: 'Ultrareactive Electrophilic Radical',
        soretPeakNm: 450, // Canonical P450 peak
        hemeIntegrity: 1.0,
        reactionDescription: 'Compound I Generation: Heterolytic O-O bond cleavage yields high-valent ferryl-oxo radical cation ([Fe4+=O]•+), capable of cleaving unactivated C-H bonds (>95 kcal/mol).'
      };
    case 5:
      return {
        ferrylOxoGlow: 1.2,
        ironValence: 'Fe(IV)-OH Substrate Radical (Compound II)',
        spinState: 'Radical Rebound Intermediate',
        soretPeakNm: 440,
        hemeIntegrity: 1.0,
        reactionDescription: 'Hydrogen Atom Abstraction & Radical Rebound: Ferryl oxygen abstracts hydrogen from substrate C-H bond, followed by sub-picosecond hydroxyl radical rebound.'
      };
    case 6:
    default:
      return {
        ferrylOxoGlow: 0.3,
        ironValence: 'Fe(III) Product Dissociation',
        spinState: 'Transitioning to Resting',
        soretPeakNm: 418,
        hemeIntegrity: 1.0,
        reactionDescription: 'Product Release: Hydroxylated metabolite exits via egress channel; water re-enters distal site to restore resting state.'
      };
  }
}

export const cyp3a4HemeVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDisplacement;

  uniform float uTime;
  uniform float uErLipidBilayerFlow;
  uniform float uCys442ThiolateTension;
  uniform float uSuicideAdductProgress;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 displacedPosition = position;

    // Simulate lipid bilayer fluid ripple and substrate cavity respiratory expansion
    float lipidWave = sin(position.x * 2.5 + uTime * 1.5) * cos(position.z * 2.5 + uTime * 1.2) * 0.08 * uErLipidBilayerFlow;
    
    // Axial Fe-Cys442 bond vibration along Y axis
    float axialVibration = sin(uTime * 8.0) * 0.03 * uCys442ThiolateTension;
    if (position.y < -0.2) {
      displacedPosition.y += axialVibration;
    }

    // Suicide adduct distortion: warps the planar porphyrin geometry
    float porphyrinDistortion = sin(position.x * 6.0) * cos(position.z * 6.0) * 0.15 * uSuicideAdductProgress;
    displacedPosition += normal * (lipidWave + porphyrinDistortion);

    vDisplacement = lipidWave + porphyrinDistortion;
    vec4 worldPos = modelMatrix * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const cyp3a4HemeFragmentShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vDisplacement;

  uniform float uTime;
  uniform float uCatalyticCyclePhase;
  uniform float uSubstrateMode;
  uniform float uFerrylOxoIntensity;
  uniform float uActiveSiteVolumeA3;
  uniform float uSuicideAdductProgress;
  uniform float uSoretAbsorbanceNm;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Fresnel rim glow
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

    // Radial distance from central Fe porphyrin core
    vec2 centerUv = vUv - vec2(0.5);
    float distFromFe = length(centerUv);

    // Heme-b protoporphyrin IX base color (Deep oxidized arterial ruby / porphyrin purple)
    vec3 hemeColor = vec3(0.55, 0.08, 0.12);
    
    // Nitrogen pyrrole ring quadrants (golden resonance coordinates)
    float pyrroleSymmetry = cos(atan(centerUv.y, centerUv.x) * 4.0);
    hemeColor += vec3(0.18, 0.12, 0.04) * smoothstep(0.3, 0.8, pyrroleSymmetry) * (1.0 - smoothstep(0.15, 0.45, distFromFe));

    // Central Iron Atom: Fe(III) ruby -> Fe(II) orange -> [Fe4+=O] electrifying cyan/white core
    if (distFromFe < 0.16) {
      if (uSubstrateMode > 1.5) {
        // MBI Inactivated Heme (P420 green/brown biliverdin decay)
        hemeColor = mix(vec3(0.2, 0.25, 0.1), vec3(0.35, 0.2, 0.1), uSuicideAdductProgress);
      } else if (uCatalyticCyclePhase >= 3.5 && uCatalyticCyclePhase <= 4.5) {
        // Compound I Ferryl-Oxo [Fe4+=O] active state
        vec3 ferrylCore = vec3(0.9, 0.95, 1.0);
        vec3 oxoRadical = vec3(0.2, 0.8, 1.0);
        hemeColor = mix(oxoRadical, ferrylCore, (1.0 - distFromFe / 0.16) * uFerrylOxoIntensity);
      } else if (uCatalyticCyclePhase >= 1.5 && uCatalyticCyclePhase < 3.5) {
        // Reduced Fe(II) ferrous amber
        hemeColor = vec3(0.95, 0.45, 0.05);
      } else {
        // Resting Fe(III) deep ruby ferric
        hemeColor = vec3(0.85, 0.12, 0.18);
      }
    }

    // Outer protein active site cavity (hydrophobic Phe pocket & ER membrane anchoring)
    if (distFromFe >= 0.40) {
      // ER lipid bilayer phospho-head teal / obsidian
      vec3 erMembrane = vec3(0.04, 0.15, 0.18);
      float lipidPores = sin(vWorldPosition.x * 8.0 + uTime) * cos(vWorldPosition.z * 8.0);
      hemeColor = mix(hemeColor, erMembrane + vec3(0.02 * lipidPores), smoothstep(0.40, 0.70, distFromFe));
    }

    // Ferryl-Oxo high-energy radical aura
    float ferrylAura = exp(-distFromFe * 9.0) * uFerrylOxoIntensity;
    vec3 auraColor = vec3(0.15, 0.75, 1.0);
    hemeColor += auraColor * ferrylAura;

    // Specular lighting
    vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);
    vec3 specularColor = vec3(1.0, 0.9, 0.8) * spec * 0.45;

    // Soret 450nm photonic resonance glow along rim
    vec3 soretGlow = vec3(0.2, 0.4, 0.95) * (uSoretAbsorbanceNm / 450.0) * fresnel * 0.6;

    vec3 finalRgb = hemeColor + specularColor + soretGlow;
    gl_FragColor = vec4(finalRgb, 0.95);
  }
`;

export function createCyp3a4HemeMaterial(): THREE.ShaderMaterial {
  const uniforms: ICyp3a4HemeUniforms = {
    uTime: { value: 0 },
    uCatalyticCyclePhase: { value: 0 },
    uSubstrateMode: { value: 0 },
    uFerrylOxoIntensity: { value: 0.2 },
    uActiveSiteVolumeA3: { value: 1385.0 },
    uCys442ThiolateTension: { value: 0.5 },
    uErLipidBilayerFlow: { value: 1.0 },
    uSuicideAdductProgress: { value: 0.0 },
    uSoretAbsorbanceNm: { value: 450.0 }
  };

  return new THREE.ShaderMaterial({
    vertexShader: cyp3a4HemeVertexShader,
    fragmentShader: cyp3a4HemeFragmentShader,
    uniforms: uniforms as unknown as { [uniform: string]: THREE.IUniform },
    transparent: true,
    side: THREE.DoubleSide
  });
}

export function updateCyp3a4HemeUniforms(
  material: THREE.ShaderMaterial,
  time: number,
  cyclePhase: number,
  substrateMode: number = 0,
  inhibitorConcUm: number = 1.0
): void {
  const state = computeCypCatalyticState(cyclePhase, substrateMode, inhibitorConcUm);

  material.uniforms['uTime'].value = time;
  material.uniforms['uCatalyticCyclePhase'].value = cyclePhase;
  material.uniforms['uSubstrateMode'].value = substrateMode;
  material.uniforms['uFerrylOxoIntensity'].value = state.ferrylOxoGlow;
  material.uniforms['uSoretAbsorbanceNm'].value = state.soretPeakNm;

  if (substrateMode === 2) {
    material.uniforms['uSuicideAdductProgress'].value = 1.0 - state.hemeIntegrity;
  } else {
    material.uniforms['uSuicideAdductProgress'].value = 0.0;
  }
}

