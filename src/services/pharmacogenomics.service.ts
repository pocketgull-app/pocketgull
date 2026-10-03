import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export type CypGene = 'CYP2D6' | 'CYP2C19' | 'CYP3A4' | 'CYP2C9' | 'VKORC1' | 'SLCO1B1' | 'MTHFR';
export type CypPhenotype = 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Ultra-Rapid Metabolizer';

export interface ICypVariant {
  gene: CypGene;
  phenotype: CypPhenotype;
  diplotype: string;
  activityScore: number; // 0 - 3.0
  affectedDrugClasses: string[];
}

export interface IDrugGeneInteraction {
  drugName: string;
  gene: string;
  severity: 'contraindicated' | 'warning' | 'dosage_adjust' | 'normal';
  clinicalSummary: string;
  cpicGuidelineUrl: string;
  evidenceLevel: '1A' | '1B' | '2A';
}

export interface IProdrugActivationRisk {
  drugName: string;
  drugType: 'prodrug' | 'active_compound';
  primaryEnzyme: 'CYP2D6' | 'CYP2C19' | 'CYP3A4';
  activeMetabolite?: string;
  patientPhenotype: CypPhenotype;
  activationRiskScore: number; // 0-100 (100 = extreme danger/inefficacy)
  riskType: 'Therapeutic Inefficacy / Non-Response' | 'Severe Toxicity / Hyper-Activation' | 'Accumulation Toxicity' | 'Standard Response';
  clinicalRecommendation: string;
  fdaBlackBoxWarning?: boolean;
}

export interface ICypMetabolicInteraction {
  agentA: string;
  agentB: string;
  interactionType: 'drug-herb' | 'drug-drug';
  affectedEnzyme: CypGene;
  mechanism: 'competitive_inhibition' | 'mechanism_based_inactivation' | 'transcription_induction';
  clinicalSeverity: 'contraindicated' | 'high_risk' | 'moderate' | 'minor';
  riskSummary: string;
  alternativeSuggestion: string;
}

export interface IPharmacogenomicProfile {
  patientId: string;
  timestamp: string;
  variants: ICypVariant[];
  interactions: IDrugGeneInteraction[];
  overallToxicityRisk: number; // 0-100
  prodrugRisks?: IProdrugActivationRisk[];
  herbDrugInteractions?: ICypMetabolicInteraction[];
}

@Injectable({
  providedIn: 'root'
})
export class PharmacogenomicsService {
  private state = (() => { try { return inject(PatientStateService); } catch (e) { return null; } })();
  private storage = (() => { try { return inject(SecureStorageService); } catch (e) { return null; } })();

  readonly activeProfile = signal<IPharmacogenomicProfile | null>(null);

  readonly hasHighRiskInteractions = computed(() => {
    const profile = this.activeProfile();
    if (!profile) return false;
    return profile.interactions.some(i => i.severity === 'contraindicated' || i.severity === 'warning');
  });

  readonly highRiskProdrugs = computed(() => {
    const profile = this.activeProfile();
    if (!profile || !profile.prodrugRisks) return [];
    return profile.prodrugRisks.filter(r => r.activationRiskScore >= 70);
  });

  // Allele activity table per CPIC guidelines
  private static readonly ALLELE_ACTIVITY_MAP: Record<CypGene, Record<string, number>> = {
    CYP2D6: {
      '*1': 1.0,
      '*2': 1.0,
      '*9': 0.5,
      '*10': 0.25,
      '*17': 0.5,
      '*41': 0.5,
      '*3': 0.0,
      '*4': 0.0,
      '*5': 0.0,
      '*6': 0.0,
      '*1xN': 2.0,
      '*2xN': 2.0
    },
    CYP2C19: {
      '*1': 1.0,
      '*17': 1.5,
      '*2': 0.0,
      '*3': 0.0,
      '*4': 0.0,
      '*8': 0.0
    },
    CYP3A4: {
      '*1': 1.0,
      '*1B': 1.0,
      '*22': 0.5,
      '*20': 0.0
    },
    CYP2C9: {
      '*1': 1.0,
      '*2': 0.5,
      '*3': 0.0
    },
    SLCO1B1: {
      '*1': 1.0,
      '*5': 0.0,
      '*15': 0.0
    },
    VKORC1: {
      'G': 1.0,
      'A': 0.5
    },
    MTHFR: {
      'C677C': 1.0,
      'C677T': 0.7,
      'T677T': 0.3
    }
  };

  // Known prodrugs and active compounds requiring enzymatic conversion or clearance
  private static readonly DRUG_DATABASE: Array<{
    name: string;
    type: 'prodrug' | 'active_compound';
    gene: 'CYP2D6' | 'CYP2C19' | 'CYP3A4';
    activeMetabolite?: string;
    fdaBlackBoxWarning?: boolean;
    pmRecommendation: string;
    umRecommendation: string;
    imRecommendation: string;
  }> = [
    {
      name: 'Codeine',
      type: 'prodrug',
      gene: 'CYP2D6',
      activeMetabolite: 'Morphine',
      fdaBlackBoxWarning: true,
      pmRecommendation: 'Avoid codeine due to lack of efficacy. Use non-CYP2D6 metabolized analgesics (e.g. acetaminophen, NSAIDs, morphine).',
      umRecommendation: 'CONTRAINDICATED: Risk of life-threatening respiratory depression and death from rapid conversion to high morphine levels.',
      imRecommendation: 'Use alternative analgesic or titrate with caution due to reduced morphine formation.'
    },
    {
      name: 'Tramadol',
      type: 'prodrug',
      gene: 'CYP2D6',
      activeMetabolite: 'O-desmethyltramadol (M1)',
      fdaBlackBoxWarning: true,
      pmRecommendation: 'Avoid tramadol due to lack of analgesic efficacy. Consider alternative non-opioid or direct-acting opioids.',
      umRecommendation: 'CONTRAINDICATED: Risk of lethal opioid toxicity and respiratory depression from ultra-rapid bioactivation.',
      imRecommendation: 'Monitor for inadequate analgesia; dose adjustment or alternative recommended.'
    },
    {
      name: 'Clopidogrel',
      type: 'prodrug',
      gene: 'CYP2C19',
      activeMetabolite: 'Active Thiol Metabolite',
      fdaBlackBoxWarning: true,
      pmRecommendation: 'CONTRAINDICATED: Inability to bioactivate clopidogrel leads to stent thrombosis and recurrent ischemic stroke. Switch to Prasugrel or Ticagrelor.',
      umRecommendation: 'Enhanced platelet inhibition. Standard dosing recommended; monitor for bleeding.',
      imRecommendation: 'High risk of hyporesponsiveness. Consider alternative antiplatelet agent (Prasugrel/Ticagrelor).'
    },
    {
      name: 'Tamoxifen',
      type: 'prodrug',
      gene: 'CYP2D6',
      activeMetabolite: 'Endoxifen (4-hydroxy-N-desmethyltamoxifen)',
      fdaBlackBoxWarning: false,
      pmRecommendation: 'Markedly reduced endoxifen plasma concentrations; increased breast cancer recurrence risk. Consider Aromatase Inhibitor or switch.',
      umRecommendation: 'Adequate endoxifen formation; standard therapeutic dosing.',
      imRecommendation: 'Consider dose escalation to 40 mg/day or switch to aromatase inhibitor.'
    },
    {
      name: 'Omeprazole',
      type: 'active_compound',
      gene: 'CYP2C19',
      pmRecommendation: 'Prolonged exposure and elevated gastrin levels. Lower starting dose or alternate PPI recommended.',
      umRecommendation: 'Rapid systemic clearance leading to therapeutic failure in GERD/H. pylori. Increase dose 100% or switch to rabeprazole.',
      imRecommendation: 'Standard dosing; monitor mucosal healing.'
    },
    {
      name: 'Metoprolol',
      type: 'active_compound',
      gene: 'CYP2D6',
      pmRecommendation: '300-500% increase in metoprolol exposure. High risk of severe bradycardia and heart block. Reduce dose 50% or choose bisoprolol/atenolol.',
      umRecommendation: 'Rapid clearance; consider alternative beta-blocker not dependent on CYP2D6 (carvedilol/atenolol).',
      imRecommendation: 'Titrate cautiously; monitor resting heart rate.'
    },
    {
      name: 'Tacrolimus',
      type: 'active_compound',
      gene: 'CYP3A4',
      pmRecommendation: 'Impaired clearance leading to nephrotoxicity and neurotoxicity. Initiate at 50% standard dose with rigorous trough TDM.',
      umRecommendation: 'Accelerated clearance; elevated risk of acute organ transplant rejection. Require up to 2x higher starting dose.',
      imRecommendation: 'Standard starting dose with close therapeutic drug monitoring (TDM).'
    }
  ];

  // Curated Herb-Drug and Drug-Drug Metabolic Interaction Rules
  private static readonly METABOLIC_INTERACTIONS: ICypMetabolicInteraction[] = [
    {
      agentA: 'Grapefruit Juice / Bergamottin',
      agentB: 'Simvastatin',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP3A4',
      mechanism: 'mechanism_based_inactivation',
      clinicalSeverity: 'contraindicated',
      riskSummary: 'Irreversible inhibition of intestinal CYP3A4 increases simvastatin bioavailability by up to 500%, precipitating acute rhabdomyolysis and renal failure.',
      alternativeSuggestion: 'Avoid grapefruit consumption or substitute Rosuvastatin / Pravastatin (minimal CYP3A4 dependence).'
    },
    {
      agentA: 'St. John\'s Wort (Hypericum)',
      agentB: 'Oral Contraceptives',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP3A4',
      mechanism: 'transcription_induction',
      clinicalSeverity: 'contraindicated',
      riskSummary: 'Potent PXR-mediated transcription induction of CYP3A4 and P-gp rapidly depletes estrogen/progestin serum levels, causing breakthrough bleeding and contraceptive failure.',
      alternativeSuggestion: 'Discontinue St. John\'s Wort immediately or use barrier/non-hormonal contraception.'
    },
    {
      agentA: 'St. John\'s Wort (Hypericum)',
      agentB: 'Cyclosporine / Tacrolimus',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP3A4',
      mechanism: 'transcription_induction',
      clinicalSeverity: 'contraindicated',
      riskSummary: 'Dramatic 50-70% reduction in calcineurin inhibitor trough concentrations leading to acute allograft rejection.',
      alternativeSuggestion: 'Absolute contraindication in solid organ transplant recipients.'
    },
    {
      agentA: 'Goldenseal (Hydrastis canadensis)',
      agentB: 'Metoprolol',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP2D6',
      mechanism: 'competitive_inhibition',
      clinicalSeverity: 'high_risk',
      riskSummary: 'Isoquinoline alkaloids (berberine/hydrastine) potent CYP2D6 inhibition elevates metoprolol plasma levels, causing profound bradycardia.',
      alternativeSuggestion: 'Substitute non-CYP2D6 beta-blocker or taper Goldenseal.'
    },
    {
      agentA: 'CBD (Cannabidiol)',
      agentB: 'Tacrolimus',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP3A4',
      mechanism: 'competitive_inhibition',
      clinicalSeverity: 'high_risk',
      riskSummary: 'Cannabidiol strongly inhibits CYP3A4, tripling tacrolimus AUC and triggering acute nephrotoxic crisis.',
      alternativeSuggestion: 'Hold CBD; monitor tacrolimus trough levels every 48 hours.'
    },
    {
      agentA: 'CBD (Cannabidiol)',
      agentB: 'Clopidogrel',
      interactionType: 'drug-herb',
      affectedEnzyme: 'CYP2C19',
      mechanism: 'competitive_inhibition',
      clinicalSeverity: 'high_risk',
      riskSummary: 'CBD inhibition of CYP2C19 reduces bioactivation of clopidogrel to active antiplatelet thiol, risking subacute stent thrombosis.',
      alternativeSuggestion: 'Avoid concurrent high-dose CBD with clopidogrel.'
    },
    {
      agentA: 'Fluoxetine / Paroxetine',
      agentB: 'Tamoxifen',
      interactionType: 'drug-drug',
      affectedEnzyme: 'CYP2D6',
      mechanism: 'mechanism_based_inactivation',
      clinicalSeverity: 'contraindicated',
      riskSummary: 'Strong CYP2D6 inhibition converts normal metabolizers into phenotypic Poor Metabolizers (phenocopying), preventing endoxifen synthesis and doubling breast cancer mortality.',
      alternativeSuggestion: 'Switch antidepressant to Venlafaxine or Escitalopram (minimal CYP2D6 inhibition).'
    },
    {
      agentA: 'Omeprazole',
      agentB: 'Clopidogrel',
      interactionType: 'drug-drug',
      affectedEnzyme: 'CYP2C19',
      mechanism: 'competitive_inhibition',
      clinicalSeverity: 'high_risk',
      riskSummary: 'Competitive inhibition of CYP2C19 decreases clopidogrel active metabolite by 45%, attenuating antiplatelet protection.',
      alternativeSuggestion: 'Switch to Pantoprazole (lowest CYP2C19 affinity) or H2-receptor antagonist (Famotidine).'
    }
  ];

  constructor() {
    this.initDefaultProfile();
  }

  /**
   * Translates a pair of alleles into an activity score and phenotype according to CPIC standards.
   */
  public callDiplotype(
    gene: CypGene,
    maternalAllele: string,
    paternalAllele: string
  ): { diplotype: string; activityScore: number; phenotype: CypPhenotype } {
    const geneMap = PharmacogenomicsService.ALLELE_ACTIVITY_MAP[gene] || {};
    const score1 = geneMap[maternalAllele] ?? 1.0;
    const score2 = geneMap[paternalAllele] ?? 1.0;
    const activityScore = score1 + score2;
    const diplotype = `${maternalAllele}/${paternalAllele}`;

    let phenotype: CypPhenotype;
    if (gene === 'CYP2D6') {
      if (activityScore === 0) {
        phenotype = 'Poor Metabolizer';
      } else if (activityScore > 0 && activityScore <= 1.0) {
        phenotype = 'Intermediate Metabolizer';
      } else if (activityScore > 1.0 && activityScore <= 2.0) {
        phenotype = 'Normal Metabolizer';
      } else {
        phenotype = 'Ultra-Rapid Metabolizer';
      }
    } else if (gene === 'CYP2C19') {
      if (activityScore === 0) {
        phenotype = 'Poor Metabolizer';
      } else if (activityScore > 0 && activityScore <= 1.0) {
        phenotype = 'Intermediate Metabolizer';
      } else if (activityScore > 1.0 && activityScore <= 2.0) {
        phenotype = 'Normal Metabolizer';
      } else {
        phenotype = 'Ultra-Rapid Metabolizer';
      }
    } else if (gene === 'CYP3A4') {
      if (activityScore <= 0.5) {
        phenotype = 'Poor Metabolizer';
      } else if (activityScore > 0.5 && activityScore < 1.5) {
        phenotype = 'Intermediate Metabolizer';
      } else if (activityScore >= 1.5 && activityScore <= 2.0) {
        phenotype = 'Normal Metabolizer';
      } else {
        phenotype = 'Ultra-Rapid Metabolizer';
      }
    } else {
      phenotype = activityScore === 0 ? 'Poor Metabolizer' : (activityScore < 1.5 ? 'Intermediate Metabolizer' : 'Normal Metabolizer');
    }

    return { diplotype, activityScore, phenotype };
  }

  /**
   * Evaluates prodrug bioactivation risk or active compound clearance risk for a drug given active phenotype.
   */
  public evaluateProdrugRisk(drugName: string, targetGene?: 'CYP2D6' | 'CYP2C19' | 'CYP3A4'): IProdrugActivationRisk | null {
    const entry = PharmacogenomicsService.DRUG_DATABASE.find(d => 
      d.name.toLowerCase() === drugName.toLowerCase() ||
      drugName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (!entry) return null;

    const geneToUse = targetGene || entry.gene;
    const profile = this.activeProfile();
    const variant = profile?.variants.find(v => v.gene === geneToUse);
    const phenotype = variant ? variant.phenotype : 'Normal Metabolizer';

    let activationRiskScore = 15;
    let riskType: IProdrugActivationRisk['riskType'] = 'Standard Response';
    let recommendation = 'Standard clinical dosing with routine therapeutic monitoring.';

    if (entry.type === 'prodrug') {
      if (phenotype === 'Poor Metabolizer') {
        activationRiskScore = entry.fdaBlackBoxWarning ? 95 : 85;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.pmRecommendation;
      } else if (phenotype === 'Ultra-Rapid Metabolizer') {
        activationRiskScore = entry.fdaBlackBoxWarning ? 98 : 88;
        riskType = 'Severe Toxicity / Hyper-Activation';
        recommendation = entry.umRecommendation;
      } else if (phenotype === 'Intermediate Metabolizer') {
        activationRiskScore = 55;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.imRecommendation;
      }
    } else {
      // Active compound cleared by the enzyme
      if (phenotype === 'Poor Metabolizer') {
        activationRiskScore = 80;
        riskType = 'Accumulation Toxicity';
        recommendation = entry.pmRecommendation;
      } else if (phenotype === 'Ultra-Rapid Metabolizer') {
        activationRiskScore = 75;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.umRecommendation;
      } else if (phenotype === 'Intermediate Metabolizer') {
        activationRiskScore = 40;
        recommendation = entry.imRecommendation;
      }
    }

    return {
      drugName: entry.name,
      drugType: entry.type,
      primaryEnzyme: entry.gene,
      activeMetabolite: entry.activeMetabolite,
      patientPhenotype: phenotype,
      activationRiskScore,
      riskType,
      clinicalRecommendation: recommendation,
      fdaBlackBoxWarning: entry.fdaBlackBoxWarning
    };
  }

  /**
   * Evaluates interactions between a set of medications and herbs/supplements.
   */
  public evaluateHerbDrugInteractions(
    medications: string[],
    herbsAndSupplements: string[]
  ): ICypMetabolicInteraction[] {
    const results: ICypMetabolicInteraction[] = [];

    for (const rule of PharmacogenomicsService.METABOLIC_INTERACTIONS) {
      const matchDrug = medications.some(m => rule.agentB.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(rule.agentB.toLowerCase()));
      const matchAgentA = (rule.interactionType === 'drug-herb' ? herbsAndSupplements : medications).some(a => 
        rule.agentA.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(rule.agentA.toLowerCase())
      );

      if (matchDrug && matchAgentA) {
        results.push(rule);
      }
    }

    return results;
  }

  /**
   * Sets or updates a patient diplotype dynamically and recalculates profile risks.
   */
  public setDiplotype(gene: CypGene, maternalAllele: string, paternalAllele: string): IPharmacogenomicProfile {
    const called = this.callDiplotype(gene, maternalAllele, paternalAllele);
    const current = this.activeProfile();
    const existingVariants = current?.variants ? [...current.variants] : [];

    const idx = existingVariants.findIndex(v => v.gene === gene);
    const affected = this.getDrugClassesForGene(gene);

    const newVariant: ICypVariant = {
      gene,
      phenotype: called.phenotype,
      diplotype: called.diplotype,
      activityScore: called.activityScore,
      affectedDrugClasses: affected
    };

    if (idx >= 0) {
      existingVariants[idx] = newVariant;
    } else {
      existingVariants.push(newVariant);
    }

    // Recompute drug-gene interactions
    const recomputedInteractions = this.computeInteractionsForVariants(existingVariants);

    // Recompute prodrug risks
    const prodrugRisks = PharmacogenomicsService.DRUG_DATABASE
      .map(d => this.evaluateProdrugRiskWithVariants(d.name, existingVariants))
      .filter((r): r is IProdrugActivationRisk => r !== null);

    // Compute overall toxicity risk
    const highRiskCount = prodrugRisks.filter(p => p.activationRiskScore >= 70).length +
      recomputedInteractions.filter(i => i.severity === 'contraindicated').length;
    const overallToxicityRisk = Math.min(100, Math.max(10, highRiskCount * 25));

    const updatedProfile: IPharmacogenomicProfile = {
      patientId: current?.patientId || 'P-GULL-ACTIVE',
      timestamp: new Date().toISOString(),
      variants: existingVariants,
      interactions: recomputedInteractions,
      overallToxicityRisk,
      prodrugRisks,
      herbDrugInteractions: current?.herbDrugInteractions || []
    };

    this.activeProfile.set(updatedProfile);
    this.storage?.setItem('pg_pharmacogenomic_profile', JSON.stringify(updatedProfile));
    return updatedProfile;
  }

  public initDefaultProfile(): IPharmacogenomicProfile {
    const defaultVariants: ICypVariant[] = [
      {
        gene: 'CYP2D6',
        phenotype: 'Poor Metabolizer',
        diplotype: '*4/*4',
        activityScore: 0,
        affectedDrugClasses: ['SSRI Antidepressants', 'Codeine/Tramadol Opioids', 'Beta-Blockers']
      },
      {
        gene: 'CYP2C19',
        phenotype: 'Ultra-Rapid Metabolizer',
        diplotype: '*17/*17',
        activityScore: 3.0,
        affectedDrugClasses: ['Proton Pump Inhibitors (Omeprazole)', 'Clopidogrel (Plavix)']
      },
      {
        gene: 'CYP3A4',
        phenotype: 'Normal Metabolizer',
        diplotype: '*1/*1',
        activityScore: 2.0,
        affectedDrugClasses: ['Calcineurin Inhibitors (Tacrolimus)', 'Statins (Simvastatin)', 'Macrolides']
      },
      {
        gene: 'MTHFR',
        phenotype: 'Intermediate Metabolizer',
        diplotype: 'C677T Heterozygous',
        activityScore: 0.7,
        affectedDrugClasses: ['Folate Metabolism', 'Methotrexate', 'Homocysteine Recycling']
      },
      {
        gene: 'SLCO1B1',
        phenotype: 'Poor Metabolizer',
        diplotype: '*5/*5',
        activityScore: 0,
        affectedDrugClasses: ['Statin Myopathy Risk (Simvastatin / Atorvastatin)']
      }
    ];

    const defaultInteractions: IDrugGeneInteraction[] = [
      {
        drugName: 'Codeine / Tramadol',
        gene: 'CYP2D6',
        severity: 'contraindicated',
        clinicalSummary: 'CYP2D6 Poor Metabolizer prevents bio-activation of codeine into morphine, causing zero analgesia while increasing parent drug toxicity.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
        evidenceLevel: '1A'
      },
      {
        drugName: 'Simvastatin',
        gene: 'SLCO1B1',
        severity: 'warning',
        clinicalSummary: 'SLCO1B1 *5/*5 markedly reduces hepatic uptake, resulting in 400% higher plasma exposure and high risk of statin-induced rhabdomyolysis.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/',
        evidenceLevel: '1A'
      },
      {
        drugName: 'Omeprazole',
        gene: 'CYP2C19',
        severity: 'dosage_adjust',
        clinicalSummary: 'CYP2C19 Ultra-Rapid Metabolizer causes rapid clearance; standard dosing produces therapeutic failure. Dose escalation or H2RA alternative recommended.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/',
        evidenceLevel: '1B'
      }
    ];

    const prodrugRisks = PharmacogenomicsService.DRUG_DATABASE
      .map(d => this.evaluateProdrugRiskWithVariants(d.name, defaultVariants))
      .filter((r): r is IProdrugActivationRisk => r !== null);

    const defaultHerbInteractions: ICypMetabolicInteraction[] = [
      PharmacogenomicsService.METABOLIC_INTERACTIONS[0], // Grapefruit + Simvastatin
      PharmacogenomicsService.METABOLIC_INTERACTIONS[1]  // St. John's Wort + Oral Contraceptives
    ];

    const profile: IPharmacogenomicProfile = {
      patientId: this.state?.activePatientSummary() ? 'P-GULL-ACTIVE' : 'P-GULL-DEMO',
      timestamp: new Date().toISOString(),
      variants: defaultVariants,
      interactions: defaultInteractions,
      overallToxicityRisk: 72,
      prodrugRisks,
      herbDrugInteractions: defaultHerbInteractions
    };

    this.activeProfile.set(profile);
    this.storage?.setItem('pg_pharmacogenomic_profile', JSON.stringify(profile));
    return profile;
  }

  public checkDrugGeneSafety(drugName: string): IDrugGeneInteraction | null {
    const profile = this.activeProfile();
    if (!profile) return null;
    const match = profile.interactions.find(i => i.drugName.toLowerCase().includes(drugName.toLowerCase()));
    return match || null;
  }

  private evaluateProdrugRiskWithVariants(drugName: string, variants: ICypVariant[]): IProdrugActivationRisk | null {
    const entry = PharmacogenomicsService.DRUG_DATABASE.find(d => 
      d.name.toLowerCase() === drugName.toLowerCase() ||
      drugName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (!entry) return null;

    const variant = variants.find(v => v.gene === entry.gene);
    const phenotype = variant ? variant.phenotype : 'Normal Metabolizer';

    let activationRiskScore = 15;
    let riskType: IProdrugActivationRisk['riskType'] = 'Standard Response';
    let recommendation = 'Standard clinical dosing with routine therapeutic monitoring.';

    if (entry.type === 'prodrug') {
      if (phenotype === 'Poor Metabolizer') {
        activationRiskScore = entry.fdaBlackBoxWarning ? 95 : 85;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.pmRecommendation;
      } else if (phenotype === 'Ultra-Rapid Metabolizer') {
        activationRiskScore = entry.fdaBlackBoxWarning ? 98 : 88;
        riskType = 'Severe Toxicity / Hyper-Activation';
        recommendation = entry.umRecommendation;
      } else if (phenotype === 'Intermediate Metabolizer') {
        activationRiskScore = 55;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.imRecommendation;
      }
    } else {
      if (phenotype === 'Poor Metabolizer') {
        activationRiskScore = 80;
        riskType = 'Accumulation Toxicity';
        recommendation = entry.pmRecommendation;
      } else if (phenotype === 'Ultra-Rapid Metabolizer') {
        activationRiskScore = 75;
        riskType = 'Therapeutic Inefficacy / Non-Response';
        recommendation = entry.umRecommendation;
      } else if (phenotype === 'Intermediate Metabolizer') {
        activationRiskScore = 40;
        recommendation = entry.imRecommendation;
      }
    }

    return {
      drugName: entry.name,
      drugType: entry.type,
      primaryEnzyme: entry.gene,
      activeMetabolite: entry.activeMetabolite,
      patientPhenotype: phenotype,
      activationRiskScore,
      riskType,
      clinicalRecommendation: recommendation,
      fdaBlackBoxWarning: entry.fdaBlackBoxWarning
    };
  }

  private computeInteractionsForVariants(variants: ICypVariant[]): IDrugGeneInteraction[] {
    const results: IDrugGeneInteraction[] = [];

    const cyp2d6 = variants.find(v => v.gene === 'CYP2D6');
    if (cyp2d6?.phenotype === 'Poor Metabolizer') {
      results.push({
        drugName: 'Codeine / Tramadol',
        gene: 'CYP2D6',
        severity: 'contraindicated',
        clinicalSummary: 'CYP2D6 Poor Metabolizer prevents bio-activation of codeine into morphine, causing zero analgesia while increasing parent drug toxicity.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
        evidenceLevel: '1A'
      });
    }

    const cyp2c19 = variants.find(v => v.gene === 'CYP2C19');
    if (cyp2c19?.phenotype === 'Ultra-Rapid Metabolizer') {
      results.push({
        drugName: 'Omeprazole',
        gene: 'CYP2C19',
        severity: 'dosage_adjust',
        clinicalSummary: 'CYP2C19 Ultra-Rapid Metabolizer causes rapid clearance; standard dosing produces therapeutic failure. Dose escalation or H2RA alternative recommended.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/',
        evidenceLevel: '1B'
      });
    } else if (cyp2c19?.phenotype === 'Poor Metabolizer') {
      results.push({
        drugName: 'Clopidogrel (Plavix)',
        gene: 'CYP2C19',
        severity: 'contraindicated',
        clinicalSummary: 'CYP2C19 Poor Metabolizer prevents formation of active antiplatelet thiol metabolite. High risk of in-stent thrombosis.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-clopidogrel-and-cyp2c19/',
        evidenceLevel: '1A'
      });
    }

    const slco = variants.find(v => v.gene === 'SLCO1B1');
    if (slco?.phenotype === 'Poor Metabolizer') {
      results.push({
        drugName: 'Simvastatin',
        gene: 'SLCO1B1',
        severity: 'warning',
        clinicalSummary: 'SLCO1B1 *5/*5 markedly reduces hepatic uptake, resulting in 400% higher plasma exposure and high risk of statin-induced rhabdomyolysis.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/',
        evidenceLevel: '1A'
      });
    }

    return results;
  }

  private getDrugClassesForGene(gene: CypGene): string[] {
    switch (gene) {
      case 'CYP2D6':
        return ['SSRI Antidepressants', 'Codeine/Tramadol Opioids', 'Beta-Blockers', 'Tamoxifen'];
      case 'CYP2C19':
        return ['Proton Pump Inhibitors (Omeprazole)', 'Clopidogrel (Plavix)', 'Voriconazole'];
      case 'CYP3A4':
        return ['Calcineurin Inhibitors (Tacrolimus)', 'Statins (Simvastatin)', 'Macrolides', 'Amlodipine'];
      case 'CYP2C9':
        return ['Warfarin', 'Phenytoin', 'NSAIDs (Celecoxib)'];
      case 'SLCO1B1':
        return ['Statin Myopathy Risk (Simvastatin / Atorvastatin)'];
      case 'VKORC1':
        return ['Warfarin Sensitivity'];
      case 'MTHFR':
        return ['Folate Metabolism', 'Methotrexate', 'Homocysteine Recycling'];
      default:
        return ['Various Xenobiotics'];
    }
  }
}
