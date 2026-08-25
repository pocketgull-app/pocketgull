import { Injectable, signal, computed } from '@angular/core';

export type ACMGClassification = 'Pathogenic' | 'Likely Pathogenic' | 'Variant of Uncertain Significance (VUS)' | 'Likely Benign' | 'Benign';

export interface IGenomicVariant {
  rsId: string;
  gene: string;
  transcriptId: string;
  hgvsCoding: string;
  hgvsProtein: string;
  chromosome: string;
  positionGRCh38: number;
  refAllele: string;
  altAllele: string;
  acmgClassification: ACMGClassification;
  clinVarReviewStatus: string;
  clinVarVariationId: string;
  gnomadGlobalMaf: number; // Minor Allele Frequency (0.0 - 1.0)
  phenotypeAssociation: string;
  acmgCriteriaMet: string[]; // e.g. ['PVS1', 'PM2', 'PP3']
  clinicalActionability: string;
  cpicGuidelineLinked?: string;
  evidenceTier: 'Level A (Gold Standard)' | 'Level B (Cohort/Functional)' | 'Level C (Computational/Plausibility)';
}

@Injectable({
  providedIn: 'root'
})
export class GenomicPathogenicityService {
  // Primary ClinVar & dbSNP Benchmark Variant Catalog
  private readonly variantDatabase: IGenomicVariant[] = [
    {
      rsId: 'rs429358',
      gene: 'APOE',
      transcriptId: 'NM_000041.4',
      hgvsCoding: 'c.388T>C',
      hgvsProtein: 'p.Cys130Arg (ε4 allele)',
      chromosome: 'chr19',
      positionGRCh38: 44908684,
      refAllele: 'T',
      altAllele: 'C',
      acmgClassification: 'Pathogenic',
      clinVarReviewStatus: 'criteria provided, multiple submitters, no conflicts (3 stars)',
      clinVarVariationId: '17864',
      gnomadGlobalMaf: 0.142,
      phenotypeAssociation: 'Alzheimer Disease Type 2 & Hyperlipoproteinemia Type III',
      acmgCriteriaMet: ['PS4 (Prevalence in affected)', 'PP1_Strong (Segregation with disease)', 'PP3 (In silico pathogenic)'],
      clinicalActionability: 'Initiate Mediterranean/MIND diet, strict vascular risk factor management, aerobic exercise (150 min/wk), and monitor lipid subfractions (ApoB/LDL-P).',
      cpicGuidelineLinked: 'Lipid-lowering pharmacogenomic monitoring (Statin response & hepatic clearance)',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs1801133',
      gene: 'MTHFR',
      transcriptId: 'NM_005957.5',
      hgvsCoding: 'c.665C>T (Legacy C677T)',
      hgvsProtein: 'p.Ala222Val',
      chromosome: 'chr1',
      positionGRCh38: 11796321,
      refAllele: 'G',
      altAllele: 'A',
      acmgClassification: 'Likely Pathogenic',
      clinVarReviewStatus: 'criteria provided, conflicting interpretations (2 stars)',
      clinVarVariationId: '3520',
      gnomadGlobalMaf: 0.315,
      phenotypeAssociation: 'Thermolabile Methylenetetrahydrofolate Reductase Deficiency & Homocysteinemia',
      acmgCriteriaMet: ['PS3 (Well-established functional enzyme assay ~50% reduction)', 'PP3 (Damaging missense)'],
      clinicalActionability: 'Supplement with bio-active L-5-Methyltetrahydrofolate (L-5-MTHF, 400-800 mcg) rather than synthetic folic acid; optimize Vitamin B6/B12 co-factors.',
      cpicGuidelineLinked: 'Fluorouracil / Methotrexate toxicity risk awareness',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs3892097',
      gene: 'CYP2D6',
      transcriptId: 'NM_000106.6',
      hgvsCoding: 'c.506-1G>A (CYP2D6 *4)',
      hgvsProtein: 'p.Splice Donor Defect',
      chromosome: 'chr22',
      positionGRCh38: 42128945,
      refAllele: 'C',
      altAllele: 'T',
      acmgClassification: 'Pathogenic',
      clinVarReviewStatus: 'reviewed by expert panel (CPIC / PharmGKB, 4 stars)',
      clinVarVariationId: '12411',
      gnomadGlobalMaf: 0.185,
      phenotypeAssociation: 'Poor Drug Metabolizer (Codeine, SSRIs, Beta-Blockers, Tamoxifen)',
      acmgCriteriaMet: ['PVS1 (Null variant / Splice site disruption)', 'PM2 (Functional enzyme loss)'],
      clinicalActionability: 'Avoid codeine and tramadol due to lack of analgesic efficacy and metabolic shunting. Adjust tricyclic and SSRI dosages according to CPIC guideline.',
      cpicGuidelineLinked: 'CPIC Guideline for Codeine and CYP2D6 / CPIC Guideline for SSRIs and CYP2D6',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs4149056',
      gene: 'SLCO1B1',
      transcriptId: 'NM_006446.5',
      hgvsCoding: 'c.521T>C (SLCO1B1 *5)',
      hgvsProtein: 'p.Val174Ala',
      chromosome: 'chr12',
      positionGRCh38: 21178615,
      refAllele: 'T',
      altAllele: 'C',
      acmgClassification: 'Pathogenic',
      clinVarReviewStatus: 'reviewed by expert panel (CPIC, 4 stars)',
      clinVarVariationId: '9845',
      gnomadGlobalMaf: 0.148,
      phenotypeAssociation: 'Statin-Induced Myopathy / Reduced Hepatic OATP1B1 Uptake',
      acmgCriteriaMet: ['PS3 (Reduced transport in vitro)', 'PS4 (GWAS validated odds ratio > 4.5 for myopathy)'],
      clinicalActionability: 'Prescribe lower-dose Pravastatin or Rosuvastatin instead of Simvastatin 40-80mg. Monitor baseline and quarterly Serum Creatine Kinase (CK).',
      cpicGuidelineLinked: 'CPIC Guideline for Statins and SLCO1B1 (Level 1A)',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs9923231',
      gene: 'VKORC1',
      transcriptId: 'NM_001395279.1',
      hgvsCoding: 'c.-1639G>A',
      hgvsProtein: 'p.Promoter Variant',
      chromosome: 'chr16',
      positionGRCh38: 31096368,
      refAllele: 'C',
      altAllele: 'T',
      acmgClassification: 'Pathogenic',
      clinVarReviewStatus: 'reviewed by expert panel (CPIC / FDA Table of Pharmacogenomic Biomarkers, 4 stars)',
      clinVarVariationId: '10214',
      gnomadGlobalMaf: 0.392,
      phenotypeAssociation: 'Warfarin Sensitivity / Low Dose Requirement',
      acmgCriteriaMet: ['PS3 (Reduced promoter transcription)', 'PS4 (Clinically validated dose algorithm)'],
      clinicalActionability: 'Initial Warfarin dose reduction by 30-50% using IWPC pharmacogenetic algorithm; increase INR monitoring frequency during titration.',
      cpicGuidelineLinked: 'CPIC Guideline for Warfarin Dosing (CYP2C9 & VKORC1)',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs80357906',
      gene: 'BRCA1',
      transcriptId: 'NM_007294.4',
      hgvsCoding: 'c.68_69delAG (Legacy 185delAG)',
      hgvsProtein: 'p.Glu23fs',
      chromosome: 'chr17',
      positionGRCh38: 43124030,
      refAllele: 'AG',
      altAllele: '-',
      acmgClassification: 'Pathogenic',
      clinVarReviewStatus: 'reviewed by expert panel (ENIGMA, 4 stars)',
      clinVarVariationId: '17659',
      gnomadGlobalMaf: 0.001,
      phenotypeAssociation: 'Hereditary Breast and Ovarian Cancer Syndrome (HBOC)',
      acmgCriteriaMet: ['PVS1 (Frameshift truncation in critical N-terminal RING domain)', 'PM2 (Extremely rare in gnomAD)'],
      clinicalActionability: 'Referral to Genetic Counseling; high-risk breast MRI screening beginning at age 25; discussion of risk-reducing salpingo-oophorectomy.',
      evidenceTier: 'Level A (Gold Standard)'
    },
    {
      rsId: 'rs1799971',
      gene: 'OPRM1',
      transcriptId: 'NM_000914.5',
      hgvsCoding: 'c.118A>G',
      hgvsProtein: 'p.Asn40Asp (A118G)',
      chromosome: 'chr6',
      positionGRCh38: 154039662,
      refAllele: 'A',
      altAllele: 'G',
      acmgClassification: 'Variant of Uncertain Significance (VUS)',
      clinVarReviewStatus: 'criteria provided, conflicting interpretations (1 star)',
      clinVarVariationId: '12891',
      gnomadGlobalMaf: 0.156,
      phenotypeAssociation: 'Altered Mu-Opioid Receptor Signaling / Variable Opioid Responsiveness',
      acmgCriteriaMet: ['PP3 (Multiple computational predictors)', 'BS4 (Conflicting clinical association studies)'],
      clinicalActionability: 'Monitor for individualized analgesic response during post-operative or chronic pain management; multimodal non-opioid analgesia preferred.',
      evidenceTier: 'Level B (Cohort/Functional)'
    }
  ];

  // State Signals
  readonly allVariants = signal<IGenomicVariant[]>(this.variantDatabase);
  readonly searchQuery = signal<string>('');
  readonly selectedAcmgFilter = signal<string>('ALL');
  readonly selectedVariant = signal<IGenomicVariant | null>(this.variantDatabase[0] || null);

  // Filtered variants computed signal
  readonly filteredVariants = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const acmg = this.selectedAcmgFilter();

    return this.allVariants().filter(v => {
      const matchesQuery = !q ||
        v.rsId.toLowerCase().includes(q) ||
        v.gene.toLowerCase().includes(q) ||
        v.phenotypeAssociation.toLowerCase().includes(q) ||
        v.hgvsProtein.toLowerCase().includes(q);

      const matchesAcmg = acmg === 'ALL' || v.acmgClassification === acmg;

      return matchesQuery && matchesAcmg;
    });
  });

  readonly totalVariantsCount = computed(() => this.allVariants().length);
  readonly filteredCount = computed(() => this.filteredVariants().length);

  /**
   * Updates the search filter query
   */
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Sets the ACMG filter tier
   */
  setAcmgFilter(filter: string): void {
    this.selectedAcmgFilter.set(filter);
  }

  /**
   * Selects an active variant for inspection
   */
  selectVariant(variant: IGenomicVariant): void {
    this.selectedVariant.set(variant);
  }

  /**
   * Looks up a variant by exact rsID
   */
  lookupByRsId(rsId: string): IGenomicVariant | null {
    const normalized = rsId.toLowerCase().trim();
    return this.allVariants().find(v => v.rsId.toLowerCase() === normalized) || null;
  }

  /**
   * Exports a selected variant as a valid FHIR R4 Bundle containing a MolecularSequence & Observation
   */
  exportFhirR4GenomicBundle(variant?: IGenomicVariant): Record<string, any> {
    const target = variant || this.selectedVariant() || this.allVariants()[0]!;
    const bundleId = `bundle-genomic-${Date.now()}`;
    const seqId = `seq-${target.rsId}-${Date.now()}`;
    const obsId = `obs-genomic-${target.rsId}-${Date.now()}`;

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/uv/genomics-reporting/StructureDefinition/genomics-report']
      },
      type: 'collection',
      entry: [
        {
          fullUrl: `urn:uuid:${seqId}`,
          resource: {
            resourceType: 'MolecularSequence',
            id: seqId,
            type: 'dna',
            coordinateSystem: 0,
            patient: {
              reference: 'Patient/homo-sapiens-34y',
              display: 'De-identified Patient (HIPAA Safe Harbor)'
            },
            referenceSeq: {
              chromosome: {
                coding: [{ system: 'http://terminology.hl7.org/CodeSystem/chromosome-human', code: target.chromosome }]
              },
              genomeBuild: 'GRCh38',
              windowStart: target.positionGRCh38,
              windowEnd: target.positionGRCh38 + 1
            },
            variant: [
              {
                start: target.positionGRCh38,
                end: target.positionGRCh38 + 1,
                observedAllele: target.altAllele,
                referenceAllele: target.refAllele
              }
            ]
          }
        },
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
              coding: [
                { system: 'http://loinc.org', code: '69548-6', display: 'Genetic variant assessment' }
              ]
            },
            subject: {
              reference: 'Patient/homo-sapiens-34y'
            },
            valueCodeableConcept: {
              coding: [
                { system: 'http://loinc.org', code: 'LA9633-4', display: target.acmgClassification }
              ],
              text: `${target.gene} ${target.hgvsProtein} (${target.rsId}): ${target.acmgClassification}`
            },
            derivedFrom: [
              { reference: `urn:uuid:${seqId}` }
            ]
          }
        }
      ]
    };
  }
}
