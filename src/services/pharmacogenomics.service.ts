import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export type CpicEvidenceLevel = 'CPIC Level A (Strongest)' | 'CPIC Level B (Moderate)' | 'CPIC Level C (Optional)';

export interface ICypVariant {
  gene: 'CYP2D6' | 'CYP2C19' | 'CYP2C9' | 'CYP3A4' | 'SLCO1B1' | 'HLA-B*57:01' | 'HLA-B*15:02' | 'TPMT' | 'DPYD' | 'VKORC1' | 'MTHFR';
  phenotype: 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Rapid Metabolizer' | 'Ultra-Rapid Metabolizer' | 'Positive / High Risk' | 'Negative / Normal';
  diplotype: string;
  activityScore: number;
  affectedDrugClasses: string[];
}

export interface IDrugGeneInteraction {
  drugName: string;
  gene: string;
  severity: 'contraindicated' | 'warning' | 'dosage_adjust' | 'normal';
  clinicalSummary: string;
  recommendedAlternative: string;
  cpicGuidelineUrl: string;
  evidenceLevel: CpicEvidenceLevel;
  phenoconversionRisk?: string;
}

export interface IPharmacogenomicProfile {
  patientId: string;
  timestamp: string;
  variants: ICypVariant[];
  interactions: IDrugGeneInteraction[];
  concomitantInhibitors: string[];
  overallToxicityRisk: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class PharmacogenomicsService {
  private state: PatientStateService | null = null;
  private storage: SecureStorageService | null = null;

  readonly activeProfile = signal<IPharmacogenomicProfile | null>(null);
  readonly selectedConcomitantInhibitors = signal<string[]>([]);

  readonly hasHighRiskInteractions = computed(() => {
    const profile = this.activeProfile();
    if (!profile) return false;
    return profile.interactions.some(i => i.severity === 'contraindicated' || i.severity === 'warning');
  });

  readonly contraindicatedCount = computed(() => {
    const profile = this.activeProfile();
    if (!profile) return 0;
    return profile.interactions.filter(i => i.severity === 'contraindicated').length;
  });

  constructor() {
    try {
      this.state = inject(PatientStateService, { optional: true });
    } catch {
      this.state = null;
    }
    try {
      this.storage = inject(SecureStorageService, { optional: true });
    } catch {
      this.storage = null;
    }
    this.initDefaultProfile();
  }


  public initDefaultProfile(): IPharmacogenomicProfile {
    const defaultVariants: ICypVariant[] = [
      {
        gene: 'CYP2D6',
        phenotype: 'Poor Metabolizer',
        diplotype: '*4/*4',
        activityScore: 0,
        affectedDrugClasses: ['Codeine / Tramadol', 'Tamoxifen', 'Paroxetine', 'Metoprolol']
      },
      {
        gene: 'CYP2C19',
        phenotype: 'Poor Metabolizer',
        diplotype: '*2/*2',
        activityScore: 0,
        affectedDrugClasses: ['Clopidogrel (Plavix)', 'Omeprazole', 'Escitalopram', 'Voriconazole']
      },
      {
        gene: 'SLCO1B1',
        phenotype: 'Poor Metabolizer',
        diplotype: '*5/*5 (c.521T>C)',
        activityScore: 0,
        affectedDrugClasses: ['Simvastatin', 'Atorvastatin', 'Statin Myopathy']
      },
      {
        gene: 'HLA-B*57:01',
        phenotype: 'Positive / High Risk',
        diplotype: 'HLA-B*57:01 Pos',
        activityScore: 0,
        affectedDrugClasses: ['Abacavir (Ziagen)']
      },
      {
        gene: 'DPYD',
        phenotype: 'Intermediate Metabolizer',
        diplotype: '*2A/*1',
        activityScore: 1.0,
        affectedDrugClasses: ['Fluorouracil (5-FU)', 'Capecitabine']
      },
      {
        gene: 'TPMT',
        phenotype: 'Intermediate Metabolizer',
        diplotype: '*1/*3A',
        activityScore: 1.0,
        affectedDrugClasses: ['Azathioprine', '6-Mercaptopurine']
      }
    ];

    const profile: IPharmacogenomicProfile = {
      patientId: this.state?.activePatientSummary() ? 'P-GULL-ACTIVE' : 'P-GULL-DEMO',
      timestamp: new Date().toISOString(),
      variants: defaultVariants,
      interactions: this.evaluateCpicInteractions(defaultVariants, []),
      concomitantInhibitors: [],
      overallToxicityRisk: 78
    };

    this.activeProfile.set(profile);
    return profile;
  }

  /**
   * Evaluates CPIC Level A guidelines across given diplotypes and concomitant inhibitor phenoconversions.
   */
  public evaluateCpicInteractions(variants: ICypVariant[], inhibitors: string[]): IDrugGeneInteraction[] {
    const interactions: IDrugGeneInteraction[] = [];

    const cyp2d6 = variants.find(v => v.gene === 'CYP2D6');
    const cyp2c19 = variants.find(v => v.gene === 'CYP2C19');
    const slco1b1 = variants.find(v => v.gene === 'SLCO1B1');
    const hlaB5701 = variants.find(v => v.gene === 'HLA-B*57:01');
    const dpyd = variants.find(v => v.gene === 'DPYD');
    const tpmt = variants.find(v => v.gene === 'TPMT');

    const hasStrong2D6Inhibitor = inhibitors.some(inh => inh.toLowerCase().includes('fluoxetine') || inh.toLowerCase().includes('bupropion') || inh.toLowerCase().includes('paroxetine'));

    // 1. CYP2D6 <-> Codeine / Tramadol
    if (cyp2d6) {
      if (cyp2d6.phenotype === 'Poor Metabolizer' || hasStrong2D6Inhibitor) {
        interactions.push({
          drugName: 'Codeine / Tramadol',
          gene: 'CYP2D6',
          severity: 'contraindicated',
          clinicalSummary: 'CYP2D6 Poor Metabolizer prevents bio-activation of prodrug codeine into morphine. Results in complete lack of analgesia with toxic accumulation of parent opioid.',
          recommendedAlternative: 'Switch to non-CYP2D6 metabolized analgesics: Morphine, Hydromorphone, or NSAIDs.',
          cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
          evidenceLevel: 'CPIC Level A (Strongest)',
          phenoconversionRisk: hasStrong2D6Inhibitor ? 'Phenoconversion: Concomitant CYP2D6 inhibitor induces Poor Metabolizer state.' : undefined
        });
      } else if (cyp2d6.phenotype === 'Ultra-Rapid Metabolizer') {
        interactions.push({
          drugName: 'Codeine / Tramadol',
          gene: 'CYP2D6',
          severity: 'contraindicated',
          clinicalSummary: 'Ultra-rapid conversion of codeine to morphine causes life-threatening respiratory depression and fatal opioid toxicity even at standard doses.',
          recommendedAlternative: 'Strictly avoid codeine/tramadol. Use non-prodrug analgesic (e.g. low-dose acetaminophen or non-opioid multimodal).',
          cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
          evidenceLevel: 'CPIC Level A (Strongest)'
        });
      }
    }

    // 2. CYP2C19 <-> Clopidogrel (Plavix)
    if (cyp2c19) {
      if (cyp2c19.phenotype === 'Poor Metabolizer' || cyp2c19.phenotype === 'Intermediate Metabolizer') {
        interactions.push({
          drugName: 'Clopidogrel (Plavix)',
          gene: 'CYP2C19',
          severity: 'contraindicated',
          clinicalSummary: 'Loss-of-function alleles (*2/*2) prevent conversion of clopidogrel into active antiplatelet thiol metabolite, resulting in high risk of acute stent thrombosis and recurrent myocardial infarction.',
          recommendedAlternative: 'Switch to alternative P2Y12 inhibitor not reliant on CYP2C19 bioactivation: Prasugrel (Effient) or Ticagrelor (Brilinta).',
          cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/',
          evidenceLevel: 'CPIC Level A (Strongest)'
        });
      }
    }

    // 3. SLCO1B1 <-> Simvastatin
    if (slco1b1) {
      if (slco1b1.phenotype === 'Poor Metabolizer' || slco1b1.diplotype.includes('*5')) {
        interactions.push({
          drugName: 'Simvastatin',
          gene: 'SLCO1B1',
          severity: 'warning',
          clinicalSummary: 'SLCO1B1 *5 (c.521T>C) impairs hepatic OATP1B1 transport, elevating systemic simvastatin plasma AUC by 400%, significantly increasing risk of severe myopathy and rhabdomyolysis.',
          recommendedAlternative: 'Prescribe hydrophilic statin: Rosuvastatin (Crestor) or Pravastatin at lower starting dosage, or non-statin Ezetimibe / PCSK9 inhibitor.',
          cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/',
          evidenceLevel: 'CPIC Level A (Strongest)'
        });
      }
    }

    // 4. HLA-B*57:01 <-> Abacavir
    if (hlaB5701 && hlaB5701.phenotype === 'Positive / High Risk') {
      interactions.push({
        drugName: 'Abacavir (Ziagen)',
        gene: 'HLA-B*57:01',
        severity: 'contraindicated',
        clinicalSummary: 'HLA-B*57:01 positivity confers a 50% risk of severe, potentially fatal multi-organ immunologic hypersensitivity reaction upon abacavir exposure.',
        recommendedAlternative: 'Strict contraindication. Prescribe Tenofovir alafenamide (TAF) or Tenofovir disoproxil fumarate (TDF) containing regimens.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-abacavir-and-hla-b/',
        evidenceLevel: 'CPIC Level A (Strongest)'
      });
    }

    // 5. DPYD <-> 5-Fluorouracil (5-FU) / Capecitabine
    if (dpyd && (dpyd.phenotype === 'Poor Metabolizer' || dpyd.phenotype === 'Intermediate Metabolizer')) {
      interactions.push({
        drugName: 'Fluorouracil (5-FU) / Capecitabine',
        gene: 'DPYD',
        severity: 'warning',
        clinicalSummary: 'Dihydropyrimidine dehydrogenase (DPD) deficiency severely retards 5-FU clearance, causing lethal neutropenia, mucositis, and neurotoxicity.',
        recommendedAlternative: 'Reduce initial 5-FU / Capecitabine dose by 50% with therapeutic drug monitoring, or choose alternative non-fluoropyrimidine chemotherapy.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-fluoropyrimidines-and-dpyd/',
        evidenceLevel: 'CPIC Level A (Strongest)'
      });
    }

    // 6. TPMT <-> Azathioprine
    if (tpmt && (tpmt.phenotype === 'Poor Metabolizer' || tpmt.phenotype === 'Intermediate Metabolizer')) {
      interactions.push({
        drugName: 'Azathioprine / 6-Mercaptopurine',
        gene: 'TPMT',
        severity: 'dosage_adjust',
        clinicalSummary: 'Reduced TPMT catalytic activity causes toxic accumulation of thioguanine nucleotides (6-TGN), leading to severe bone marrow suppression and pancytopenia.',
        recommendedAlternative: 'Reduce standard Azathioprine dosage by 30-70% with regular CBC monitoring, or consider biological therapy.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-thiopurines-and-tpmt/',
        evidenceLevel: 'CPIC Level A (Strongest)'
      });
    }

    return interactions;
  }

  /**
   * Update a specific gene diplotype and recalculate active profile interactions.
   */
  public updateGeneDiplotype(geneName: string, diplotype: string): void {
    const current = this.activeProfile();
    if (!current) return;

    const updatedVariants = current.variants.map(v => {
      if (v.gene === geneName) {
        let phenotype = v.phenotype;
        let score = v.activityScore;

        if (diplotype.includes('*1/*1')) {
          phenotype = 'Normal Metabolizer';
          score = 2.0;
        } else if (diplotype.includes('*1/*2') || diplotype.includes('*1/*4') || diplotype.includes('*1/*5')) {
          phenotype = 'Intermediate Metabolizer';
          score = 1.0;
        } else if (diplotype.includes('*4/*4') || diplotype.includes('*2/*2') || diplotype.includes('*5/*5')) {
          phenotype = 'Poor Metabolizer';
          score = 0.0;
        } else if (diplotype.includes('*17/*17') || diplotype.includes('*1xN')) {
          phenotype = 'Ultra-Rapid Metabolizer';
          score = 2.5;
        } else if (diplotype.includes('Neg')) {
          phenotype = 'Negative / Normal';
          score = 2.0;
        } else if (diplotype.includes('Pos')) {
          phenotype = 'Positive / High Risk';
          score = 0.0;
        }

        return {
          ...v,
          diplotype,
          phenotype,
          activityScore: score
        };
      }
      return v;
    });

    const interactions = this.evaluateCpicInteractions(updatedVariants, this.selectedConcomitantInhibitors());
    const toxicity = Math.min(100, Math.round(interactions.length * 16));

    const updatedProfile: IPharmacogenomicProfile = {
      ...current,
      variants: updatedVariants,
      interactions,
      overallToxicityRisk: toxicity,
      timestamp: new Date().toISOString()
    };

    this.activeProfile.set(updatedProfile);
  }

  /**
   * Toggle a concomitant inhibitor to trigger real-time phenoconversion.
   */
  public toggleInhibitor(inhibitorName: string): void {
    const current = this.selectedConcomitantInhibitors();
    let updated: string[];
    if (current.includes(inhibitorName)) {
      updated = current.filter(i => i !== inhibitorName);
    } else {
      updated = [...current, inhibitorName];
    }
    this.selectedConcomitantInhibitors.set(updated);

    const prof = this.activeProfile();
    if (prof) {
      const interactions = this.evaluateCpicInteractions(prof.variants, updated);
      this.activeProfile.set({
        ...prof,
        interactions,
        concomitantInhibitors: updated,
        timestamp: new Date().toISOString()
      });
    }
  }

  public checkDrugGeneSafety(drugName: string): IDrugGeneInteraction | null {
    const profile = this.activeProfile();
    if (!profile) return null;
    const match = profile.interactions.find(i => i.drugName.toLowerCase().includes(drugName.toLowerCase()));
    return match || null;
  }
}
