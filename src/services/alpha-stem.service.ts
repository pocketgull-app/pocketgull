import { Injectable, signal, computed } from '@angular/core';

export interface IStemCellLineageProbability {
  neurogenic: number; // 0.1 - 1 kPa
  myogenic: number;   // 8 - 17 kPa
  osteogenic: number; // 25 - 40 kPa
  dominantLineage: 'Neurogenic (Neurons/Glia)' | 'Myogenic (Skeletal/Cardiomyocyte)' | 'Osteogenic (Cortical Bone/Osteoblast)';
}

export interface IExosomeProfile {
  vesicleCountPerMicroLiter: number;
  mirna21ConcentrationNm: number;
  vegfPicogramsPerMl: number;
  tgfBetaSuppressionRatio: number;
  antiFibroticScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlphaStemService {
  // 1. Epigenetic Rejuvenation & Yamanaka Factor Signals
  readonly biologicalAgeYears = signal<number>(54);
  readonly chronologicalAgeYears = signal<number>(54);
  readonly dnaMethylationPercentage = signal<number>(68.5); // % of CpG islands methylated
  readonly yamanakaFactorsActive = signal<boolean>(false);
  readonly oct4Sox2Klf4ExpressionLevel = signal<number>(15); // 0 - 100%

  // 2. Mesenchymal Stem Cell (MSC) & Exosome Paracrine Signals
  readonly mscColonyDensityMillionPerMl = signal<number>(2.4);
  readonly exosomeSecretionActive = signal<boolean>(true);
  readonly targetTissueRepair = signal<'myocardium' | 'cartilage' | 'neural' | 'dermal'>('cartilage');

  // 3. Mechanotransduction Substrate Stiffness (in kiloPascals kPa)
  readonly substrateStiffnessKpa = signal<number>(12); // Default to Muscle/Myogenic stiffness

  // 4. Quad-Paradigm Regenerative Reservoir Signals
  readonly telomereLengthKilobases = signal<number>(7.2); // Normal adult: 5-10 kb
  readonly ayurvedicShukraDhatuOjas = signal<number>(72); // 0 - 100%
  readonly tcmPreHeavenYuanJing = signal<number>(68);      // 0 - 100%
  readonly osteopathicPiezoElectricChargeMicrovolts = signal<number>(14.5); // Piezoelectric collagen charge

  // Computed Lineage Differentiation based on Substrate Stiffness (Engler et al. Cell Mechanobiology)
  readonly lineageProbability = computed<IStemCellLineageProbability>(() => {
    const kpa = this.substrateStiffnessKpa();
    
    // Soft matrix (0.1 - 2 kPa) promotes neural lineage
    const neurogenic = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-Math.pow(kpa - 0.8, 2) / 4))));
    
    // Medium matrix (8 - 18 kPa) promotes muscle lineage
    const myogenic = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-Math.pow(kpa - 12, 2) / 36))));
    
    // Stiff matrix (25 - 40 kPa) promotes bone osteoblast lineage
    const osteogenic = Math.max(0, Math.min(100, Math.round(100 * (1 / (1 + Math.exp(-(kpa - 24) / 4))))));

    let dominant: 'Neurogenic (Neurons/Glia)' | 'Myogenic (Skeletal/Cardiomyocyte)' | 'Osteogenic (Cortical Bone/Osteoblast)';
    if (neurogenic >= myogenic && neurogenic >= osteogenic) {
      dominant = 'Neurogenic (Neurons/Glia)';
    } else if (myogenic >= osteogenic) {
      dominant = 'Myogenic (Skeletal/Cardiomyocyte)';
    } else {
      dominant = 'Osteogenic (Cortical Bone/Osteoblast)';
    }

    return {
      neurogenic,
      myogenic,
      osteogenic,
      dominantLineage: dominant
    };
  });

  // Computed Exosome Paracrine Healing Profile
  readonly exosomeProfile = computed<IExosomeProfile>(() => {
    const density = this.mscColonyDensityMillionPerMl();
    const isActive = this.exosomeSecretionActive();
    const mult = isActive ? 1.0 : 0.2;

    const vesicleCount = Math.round(density * 1.8e8 * mult);
    const mirna21 = +(density * 14.2 * mult).toFixed(1);
    const vegf = +(density * 420 * mult).toFixed(0);
    const tgfBeta = +(0.85 * mult).toFixed(2);
    const antiFibrotic = Math.min(100, Math.round(density * 28 * mult));

    return {
      vesicleCountPerMicroLiter: vesicleCount,
      mirna21ConcentrationNm: mirna21,
      vegfPicogramsPerMl: vegf,
      tgfBetaSuppressionRatio: tgfBeta,
      antiFibroticScore: antiFibrotic
    };
  });

  // Computed Overall Regenerative Health Score (0 - 100)
  readonly regenerativePotencyScore = computed<number>(() => {
    const epiScore = Math.max(0, 100 - this.dnaMethylationPercentage());
    const exosomeScore = this.exosomeProfile().antiFibroticScore;
    const ayurScore = this.ayurvedicShukraDhatuOjas();
    const tcmScore = this.tcmPreHeavenYuanJing();

    return Math.round((epiScore * 0.3) + (exosomeScore * 0.3) + (ayurScore * 0.2) + (tcmScore * 0.2));
  });

  // Trigger 3-Factor Yamanaka Epigenetic Reset (OSK: Oct4, Sox2, Klf4)
  triggerYamanakaReprogramming(targetBioAge: number = 32): void {
    this.yamanakaFactorsActive.set(true);
    this.oct4Sox2Klf4ExpressionLevel.set(92);
    
    // Simulate biological age reversal and CpG demethylation
    this.biologicalAgeYears.set(Math.max(20, targetBioAge));
    this.dnaMethylationPercentage.set(31.2);
    this.telomereLengthKilobases.set(9.4);
    this.ayurvedicShukraDhatuOjas.update(v => Math.min(100, v + 20));
    this.tcmPreHeavenYuanJing.update(v => Math.min(100, v + 18));
  }

  // Reset to Baseline
  resetReprogramming(): void {
    this.yamanakaFactorsActive.set(false);
    this.oct4Sox2Klf4ExpressionLevel.set(15);
    this.biologicalAgeYears.set(this.chronologicalAgeYears());
    this.dnaMethylationPercentage.set(68.5);
    this.telomereLengthKilobases.set(7.2);
  }

  // Adjust Matrix Stiffness
  setSubstrateStiffness(kpa: number): void {
    this.substrateStiffnessKpa.set(Math.max(0.1, Math.min(50, kpa)));
  }

  // Nourish Regenerative Essence via Rasayana / Jing Botanicals
  nourishRasayanaJing(amount: number = 10): void {
    this.ayurvedicShukraDhatuOjas.update(v => Math.min(100, v + amount));
    this.tcmPreHeavenYuanJing.update(v => Math.min(100, v + amount));
    this.mscColonyDensityMillionPerMl.update(v => +(Math.min(5.0, v + 0.3)).toFixed(1));
  }
}
