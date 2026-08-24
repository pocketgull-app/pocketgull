import { Injectable, signal, computed } from '@angular/core';
import { calculatePolygenicRiskPercentile, IPolygenicRiskPercentileResult } from '../../packages/core-sdk/src/stats/index';

export interface ITranscriptionFactorMotif {
  tfName: string; // e.g. NF-kB, FoxO3, GATA4, STAT3, HNF4A
  jasparId: string;
  bindingAffinityRef: number; // 0.0 - 1.0 (Ref allele binding score)
  bindingAffinityAlt: number; // 0.0 - 1.0 (Alt allele binding score)
  deltaAffinityScore: number; // Alt - Ref
  bindingDisrupted: boolean;
}

export interface ITissueExpressionDelta {
  tissueType: 'Cardiomyocytes' | 'Cortical Neurons' | 'Hepatocytes' | 'Immune PBMC' | 'Vascular Endothelium';
  baselineExpressionTpm: number;
  predictedDeltaLog2Fc: number; // -3.0 to +3.0
  chromatinAccessibilityShift: 'Closed -> Open' | 'Open -> Closed' | 'Neutral Stable';
  direction: 'Upregulated' | 'Downregulated' | 'Neutral';
}

export interface IRegulatoryVariant {
  id: string;
  rsId: string;
  targetGene: string;
  elementCategory: 'Distal Enhancer' | 'Core Promoter' | 'CTCF Insulator' | '5-UTR Silencer';
  chromosome: string;
  positionGRCh38: number;
  refAllele: string;
  altAllele: string;
  encodeCcreAccession: string; // e.g. EH38E1234567
  tfMotifs: ITranscriptionFactorMotif[];
  tissueDeltas: ITissueExpressionDelta[];
  associatedTrait: string;
  clinicalImpactSummary: string;
  actionableDietOrRx: string;
}

export interface IPolygenicTraitProfile {
  traitName: string;
  snpCount: number;
  patientRawScore: number;
  populationMean: number;
  populationStdDev: number;
  prsResult: IPolygenicRiskPercentileResult;
  topContributingGenes: string[];
  actionableClinicalGuidance: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlphaGenomeRegulatoryService {
  // Primary Non-Coding Regulatory Benchmark Variants
  private readonly regulatoryVariantsCatalog: IRegulatoryVariant[] = [
    {
      id: 'reg-9p21-cad',
      rsId: 'rs10757278',
      targetGene: 'CDKN2A / CDKN2B / ANRIL',
      elementCategory: 'Distal Enhancer',
      chromosome: 'chr9',
      positionGRCh38: 22124477,
      refAllele: 'A',
      altAllele: 'G',
      encodeCcreAccession: 'EH38E2219804',
      associatedTrait: 'Coronary Artery Disease & Vascular Senescence',
      clinicalImpactSummary: 'Disrupts TEAD3/STAT1 binding at the 9p21.3 risk locus, downregulating CDKN2A expression in vascular smooth muscle and increasing atheroma vulnerability.',
      actionableDietOrRx: 'Intensified ApoB lowering target (<60 mg/dL), daily vascular antioxidant polyphenols (EGCG/Resveratrol), and high-intensity interval conditioning.',
      tfMotifs: [
        { tfName: 'STAT1', jasparId: 'MA0137.3', bindingAffinityRef: 0.88, bindingAffinityAlt: 0.18, deltaAffinityScore: -0.70, bindingDisrupted: true },
        { tfName: 'TEAD3', jasparId: 'MA1122.1', bindingAffinityRef: 0.76, bindingAffinityAlt: 0.22, deltaAffinityScore: -0.54, bindingDisrupted: true },
        { tfName: 'NF-kB', jasparId: 'MA0105.4', bindingAffinityRef: 0.35, bindingAffinityAlt: 0.78, deltaAffinityScore: +0.43, bindingDisrupted: false }
      ],
      tissueDeltas: [
        { tissueType: 'Vascular Endothelium', baselineExpressionTpm: 42.5, predictedDeltaLog2Fc: -1.45, chromatinAccessibilityShift: 'Open -> Closed', direction: 'Downregulated' },
        { tissueType: 'Cardiomyocytes', baselineExpressionTpm: 28.0, predictedDeltaLog2Fc: -0.82, chromatinAccessibilityShift: 'Open -> Closed', direction: 'Downregulated' },
        { tissueType: 'Immune PBMC', baselineExpressionTpm: 65.2, predictedDeltaLog2Fc: +0.65, chromatinAccessibilityShift: 'Closed -> Open', direction: 'Upregulated' }
      ]
    },
    {
      id: 'reg-apoe-promoter',
      rsId: 'rs405509',
      targetGene: 'APOE',
      elementCategory: 'Core Promoter',
      chromosome: 'chr19',
      positionGRCh38: 44905910,
      refAllele: 'T',
      altAllele: 'G',
      encodeCcreAccession: 'EH38E3104928',
      associatedTrait: 'Late-Onset Alzheimer Disease & Brain Lipid Clearance',
      clinicalImpactSummary: 'G-allele in APOE promoter disrupts FoxO3 binding and attenuates microglial astrocytic APOE transcription by ~35%.',
      actionableDietOrRx: 'MIND Diet (leafy greens, berries, olive oil), optimized deep slow-wave sleep duration (glymphatic clearance), and DHA supplementation (1,000 mg/day).',
      tfMotifs: [
        { tfName: 'FoxO3', jasparId: 'MA0157.2', bindingAffinityRef: 0.92, bindingAffinityAlt: 0.31, deltaAffinityScore: -0.61, bindingDisrupted: true },
        { tfName: 'CREB1', jasparId: 'MA0018.3', bindingAffinityRef: 0.65, bindingAffinityAlt: 0.61, deltaAffinityScore: -0.04, bindingDisrupted: false },
        { tfName: 'HNF4A', jasparId: 'MA0114.4', bindingAffinityRef: 0.20, bindingAffinityAlt: 0.22, deltaAffinityScore: +0.02, bindingDisrupted: false }
      ],
      tissueDeltas: [
        { tissueType: 'Cortical Neurons', baselineExpressionTpm: 120.4, predictedDeltaLog2Fc: -0.92, chromatinAccessibilityShift: 'Open -> Closed', direction: 'Downregulated' },
        { tissueType: 'Hepatocytes', baselineExpressionTpm: 240.0, predictedDeltaLog2Fc: -0.34, chromatinAccessibilityShift: 'Neutral Stable', direction: 'Downregulated' }
      ]
    },
    {
      id: 'reg-tcf7l2-t2d',
      rsId: 'rs7903146',
      targetGene: 'TCF7L2 / GLP-1 Axis',
      elementCategory: 'Distal Enhancer',
      chromosome: 'chr10',
      positionGRCh38: 112998590,
      refAllele: 'C',
      altAllele: 'T',
      encodeCcreAccession: 'EH38E1102941',
      associatedTrait: 'Type 2 Diabetes Mellitus & Incretin Responsiveness',
      clinicalImpactSummary: 'T-risk allele creates a de novo open chromatin conformation in pancreatic islets, leading to aberrant overexpression of TCF7L2 and impaired insulin exocytosis.',
      actionableDietOrRx: 'GLP-1 receptor agonist therapy consideration; postprandial glycemic blunting with berberine/cinnamon and vinegar pre-meal acid load.',
      tfMotifs: [
        { tfName: 'HNF4A', jasparId: 'MA0114.4', bindingAffinityRef: 0.25, bindingAffinityAlt: 0.85, deltaAffinityScore: +0.60, bindingDisrupted: false },
        { tfName: 'FoxO1', jasparId: 'MA0031.1', bindingAffinityRef: 0.80, bindingAffinityAlt: 0.25, deltaAffinityScore: -0.55, bindingDisrupted: true }
      ],
      tissueDeltas: [
        { tissueType: 'Hepatocytes', baselineExpressionTpm: 88.0, predictedDeltaLog2Fc: +1.20, chromatinAccessibilityShift: 'Closed -> Open', direction: 'Upregulated' },
        { tissueType: 'Cardiomyocytes', baselineExpressionTpm: 15.2, predictedDeltaLog2Fc: +0.10, chromatinAccessibilityShift: 'Neutral Stable', direction: 'Neutral' }
      ]
    }
  ];

  // State Signals
  readonly allVariants = signal<IRegulatoryVariant[]>(this.regulatoryVariantsCatalog);
  readonly selectedVariant = signal<IRegulatoryVariant>(this.regulatoryVariantsCatalog[0]!);

  // Multi-Trait Polygenic Risk Profiles
  readonly polygenicProfiles = signal<IPolygenicTraitProfile[]>([
    {
      traitName: 'Coronary Artery Disease (CAD)',
      snpCount: 180,
      patientRawScore: 12.4,
      populationMean: 10.0,
      populationStdDev: 1.5,
      prsResult: calculatePolygenicRiskPercentile(12.4, 10.0, 1.5),
      topContributingGenes: ['CDKN2A/B (9p21)', 'LPA', 'LDLR', 'APOB'],
      actionableClinicalGuidance: 'Elevated CAD PRS: Target LDL-C < 70 mg/dL, coronary calcium scoring (CAC), and daily 30-min aerobic zone-2 exercise.'
    },
    {
      traitName: 'Type 2 Diabetes Mellitus (T2D)',
      snpCount: 142,
      patientRawScore: 14.8,
      populationMean: 14.2,
      populationStdDev: 1.8,
      prsResult: calculatePolygenicRiskPercentile(14.8, 14.2, 1.8),
      topContributingGenes: ['TCF7L2', 'KCNQ1', 'PPARG', 'SLC30A8'],
      actionableClinicalGuidance: 'Average T2D PRS: Maintain whole-food Mediterranean dietary pattern and yearly HbA1c screening.'
    },
    {
      traitName: 'Late-Onset Alzheimer Disease (LOAD)',
      snpCount: 85,
      patientRawScore: 8.9,
      populationMean: 7.0,
      populationStdDev: 1.1,
      prsResult: calculatePolygenicRiskPercentile(8.9, 7.0, 1.1),
      topContributingGenes: ['APOE', 'BIN1', 'CLU', 'PICALM'],
      actionableClinicalGuidance: 'Elevated LOAD PRS: Maximize cognitive reserve, sleep hygiene for glymphatic clearance, and dietary omega-3 index > 8%.'
    },
    {
      traitName: 'Exceptional Longevity (Centenarian Odds)',
      snpCount: 64,
      patientRawScore: 15.6,
      populationMean: 12.5,
      populationStdDev: 1.4,
      prsResult: calculatePolygenicRiskPercentile(15.6, 12.5, 1.4),
      topContributingGenes: ['FOXO3', 'SIRT1', 'IGF1R', 'APOE-e2'],
      actionableClinicalGuidance: 'High Longevity PRS (98.6th percentile): Favorable FoxO3/SIRT1 metabolic profile with enhanced cellular autophagy resilience.'
    }
  ]);

  // Computed Signals
  readonly topDisruptedTfs = computed(() => {
    const v = this.selectedVariant();
    return v.tfMotifs.filter(tf => tf.bindingDisrupted);
  });

  readonly highRiskPrsTraits = computed(() => {
    return this.polygenicProfiles().filter(p => p.prsResult.riskTier === 'High Polygenic Risk' || p.prsResult.riskTier === 'Elevated Risk');
  });

  /**
   * Selects an active regulatory variant
   */
  selectVariant(variant: IRegulatoryVariant): void {
    this.selectedVariant.set(variant);
  }

  /**
   * Finds a regulatory variant by rsID
   */
  findByRsId(rsId: string): IRegulatoryVariant | null {
    const q = rsId.toLowerCase().trim();
    return this.allVariants().find(v => v.rsId.toLowerCase() === q) || null;
  }

  /**
   * Exports an AlphaGenome Regulatory & PRS FHIR R4 Bundle
   */
  exportFhirR4AlphaGenomeBundle(patientId: string = 'homo-sapiens-34y'): Record<string, any> {
    const variant = this.selectedVariant();
    const bundleId = `bundle-alphagenome-${Date.now()}`;
    const obsId = `obs-regulatory-${variant.rsId}-${Date.now()}`;

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/bundle']
      },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:${obsId}`,
          resource: {
            resourceType: 'Observation',
            id: obsId,
            status: 'final',
            category: [
              {
                coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory', display: 'Laboratory' }]
              }
            ],
            code: {
              coding: [{ system: 'http://loinc.org', code: '69548-6', display: 'Genetic variant assessment' }],
              text: `AlphaGenome Regulatory Variant: ${variant.rsId} (${variant.targetGene})`
            },
            subject: { reference: `Patient/${patientId}` },
            component: [
              {
                code: { text: 'ENCODE cCRE Accession' },
                valueString: variant.encodeCcreAccession
              },
              {
                code: { text: 'Disrupted Transcription Factors' },
                valueString: variant.tfMotifs.filter(m => m.bindingDisrupted).map(m => `${m.tfName} (Δaffinity: ${m.deltaAffinityScore.toFixed(2)})`).join(', ')
              },
              {
                code: { text: 'Clinical Guidance' },
                valueString: variant.actionableDietOrRx
              }
            ]
          }
        }
      ]
    };
  }
}
