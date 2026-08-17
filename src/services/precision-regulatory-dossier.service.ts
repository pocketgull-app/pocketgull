import { Injectable } from '@angular/core';
import { IPrecisionCaseStudy } from './precision-medicine-might.service';
import { INOfOneSimulationResult } from './n-of-one-bayesian-simulator.service';

export interface INihGrantNarrative {
  grantMechanism: 'NIH U54 Center of Excellence' | 'NIH R21 Exploratory / Developmental Grant';
  projectTitle: string;
  principalInvestigator: string;
  targetGene: string;
  diseaseEntity: string;
  specificAims: string[];
  researchStrategyText: string;
  modelOrganismSection: string;
  humanSubjectsProtection: string;
  budgetDirectCosts: number;
  budgetIndirectCosts: number;
}

export interface IFdaExpandedAccessIndDossier {
  cfrRegulation: '21 CFR §312.310 (Individual Patient Expanded Access IND)';
  indProtocolId: string;
  drugSubstanceName: string;
  targetGene: string;
  patientAlias: string;
  clinicalRationalText: string;
  dosingRegimenText: string;
  trialDesign: 'ABAB Single-Subject Crossover with Bayesian Deciban Thresholds';
  stoppingRules: string[];
  investigatorCommitment: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrecisionRegulatoryDossierService {

  /**
   * Generates a formal NIH Grant Application Narrative (U54 / R21) for UDN/MOSC research funding.
   */
  generateNihGrantNarrative(study: IPrecisionCaseStudy, simResult?: INOfOneSimulationResult | null): INihGrantNarrative {
    const gene = study.primaryGene;
    const disease = study.diseaseName;

    const aims = [
      `Specific Aim 1: Multi-Omic Characterization and Transcriptomic Splicing Profiling of ${gene} pathogenic variants using long-read sequencing and targeted mass spectrometry.`,
      `Specific Aim 2: Functional in vivo rescue validation in Model Organism Screening Center (MOSC) systems (Drosophila melanogaster, Caenorhabditis elegans, and Danio rerio).`,
      `Specific Aim 3: Single-Subject N-of-1 Bayesian Adaptive Trial execution with Alan Turing Deciban sequential weight of evidence tracking for targeted repurposed therapeutic candidate (${study.trialProtocol.candidate.compoundName}).`
    ];

    const strategy = `
1. SIGNIFICANCE
Rare and ultra-rare monogenic diseases affect over 30 million Americans, with patients enduring an average 7.3-year diagnostic odyssey. Pathogenic variants in ${gene} lead to severe proteostasis collapse and organ dysregulation in ${disease}. This proposal leverages the Undiagnosed Diseases Network (UDN) computational knowledge graph infrastructure to rapidly map novel genomic variants directly to actionable, FDA-repurposed therapeutic chaperones.

2. INNOVATION
Rather than relying on empirical trial-and-error, this study deploys Dr. Matt Might's 5-step Precision Medicine Algorithm combined with real-time Bayesian adaptive N-of-1 ABAB crossover kinetics. Weight of evidence is continuously evaluated using Alan Turing's logarithmic Deciban metric (10 * log10(BF)), guaranteeing rigorous, reproducible stopping boundaries without unprincipled p-hacking.

3. APPROACH
- Cohort Identification & Multi-Omics: Deep HPO phenotyping linked to Trio Whole Genome Sequencing.
- MOSC Functional Screening: Transgenic tissue-specific CRISPR models in fruit flies, nematodes, and zebrafish to measure physiological motility, branchial arch cartilage symmetry, and mitochondrial ATP flux.
- N-of-1 Clinical Translation: 16-week structured ABAB protocol evaluating primary quantitative biomarker normalization under IRB expanded access oversight.
`.trim();

    const mosc = `
Model Organisms Screening Center (MOSC Phase II) Validation Protocol:
- Drosophila melanogaster: Negative geotaxis climbing assay & ATP luminescence quantification following Gal4/UAS human variant knock-in.
- Caenorhabditis elegans: U12 minor spliceosome intron excision reporter & brood survival assay.
- Danio rerio (Zebrafish): Ventral branchial arch cartilage Alcian blue staining and canonical Wnt-GFP reporter live confocal microscopy.
`.trim();

    const humanSubjects = `
Human Subjects Protection & HIPAA §164.514 Safe Harbor Compliance:
All patient genomic vectors, HPO phenotypes, and biometric telemetry are de-identified conforming to HIPAA §164.514 standards. Informed consent for single-patient compassionate expanded access will be obtained under institutional IRB guidelines, with zero third-party telemetry egress.
`.trim();

    return {
      grantMechanism: 'NIH U54 Center of Excellence',
      projectTitle: `Multi-Omic & Model Organism Functional Translation for ${gene}-Mediated ${disease}`,
      principalInvestigator: 'Clinical Precision Genomics Principal Investigator',
      targetGene: gene,
      diseaseEntity: disease,
      specificAims: aims,
      researchStrategyText: strategy,
      modelOrganismSection: mosc,
      humanSubjectsProtection: humanSubjects,
      budgetDirectCosts: 1850000,
      budgetIndirectCosts: 647500
    };
  }

  /**
   * Generates a formal FDA Single-Patient Expanded Access IND Protocol Dossier (21 CFR §312.310).
   */
  generateFdaExpandedAccessIndDossier(study: IPrecisionCaseStudy, simResult?: INOfOneSimulationResult | null): IFdaExpandedAccessIndDossier {
    const gene = study.primaryGene;
    const candidate = study.trialProtocol.candidate;

    return {
      cfrRegulation: '21 CFR §312.310 (Individual Patient Expanded Access IND)',
      indProtocolId: `FDA-IND-EXP-${gene}-${study.id.toUpperCase()}`,
      drugSubstanceName: candidate.compoundName,
      targetGene: gene,
      patientAlias: study.patientName,
      clinicalRationalText: `The patient presents with life-altering, treatment-refractory manifestations of ${study.diseaseName} resulting from ${gene} mutation (${study.variant.hgvs}). Automated knowledge graph reasoning (mediKanren / ROBOKOP) identified ${candidate.compoundName} (${candidate.fdaStatus.toUpperCase()}) as a targeted pathway modulator via ${candidate.repurposedMechanism}.`,
      dosingRegimenText: `Initial starting dose: ${candidate.recommendedInitialDose}. Dose titration guided by weekly ${candidate.primaryBiomarkerEndpoint} monitoring and continuous autonomic telemetry.`,
      trialDesign: 'ABAB Single-Subject Crossover with Bayesian Deciban Thresholds',
      stoppingRules: [
        'Evidence Rule: Bayesian weight of evidence drops below -10.0 dB / Decibans (Popperian falsification of efficacy).',
        'Safety Rule: Grade 3+ adverse clinical event or elevation in hepatic transaminases > 3x Upper Limit of Normal (ULN).',
        'Efficacy Confirmation: Accumulation of >= +20.0 dB / Decibans (100:1 odds in favor of pharmacological rescue).'
      ],
      investigatorCommitment: 'The treating physician certifies that the patient has no comparable or satisfactory alternative therapy available and that the potential benefit justifies the potential risks under 21 CFR §312.310.'
    };
  }
}
