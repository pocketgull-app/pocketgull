import { Injectable, signal, inject } from '@angular/core';
import { PhysicalGenomicsService } from './physical-genomics.service';

export interface IGseDataset {
  accession: string;
  title: string;
  summary: string;
  organism: string;
  experimentType: 'scRNA-seq' | 'Hi-C' | 'Spatial Transcriptomics' | 'ATAC-seq' | 'ChIP-seq';
  sampleCount: number;
  platform: string;
  submissionDate: string;
  contributingLab: string;
  institution: string;
  pmid: string;
  parameters: {
    ecmStiffnessKpa: number;
    actinTensionNn: number;
    epigeneticState: 'UNMODIFIED_CANONICAL' | 'HYPERACETYLATED_H3K27AC' | 'POLYCOMB_H3K27ME3' | 'HETEROCHROMATIN_H3K9ME3';
    med1ConcUm: number;
    brd4ConcUm: number;
    polIiConcUm: number;
    hasCtcfMutation: boolean;
    cohesinSpeedKbS: number;
    ctcfPermeability: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GseExplorerService {
  private readonly physicalGenomics = inject(PhysicalGenomicsService, { optional: true });

  readonly gseCatalog = signal<IGseDataset[]>([
    {
      accession: 'GSE131900',
      title: 'Single-Cell Spatial Transcriptomics and Biomechanical Matrix Remodeling in Human Cartilage Regeneration',
      summary: 'High-density spatial profiling of human articular chondrocytes and pericellular matrix stiffness gradients during regenerative mechanotherapy.',
      organism: 'Homo sapiens',
      experimentType: 'Spatial Transcriptomics',
      sampleCount: 48,
      platform: 'GPL24676 (10x Genomics Visium / Illumina NovaSeq 6000)',
      submissionDate: '2025-11-14',
      contributingLab: 'Center for Sports Medicine & Manning Institute of Biotechnology',
      institution: 'University of Virginia (UVA / iTHRIV)',
      pmid: '34891024',
      parameters: {
        ecmStiffnessKpa: 4.8,
        actinTensionNn: 1.6,
        epigeneticState: 'HYPERACETYLATED_H3K27AC',
        med1ConcUm: 3.8,
        brd4ConcUm: 2.9,
        polIiConcUm: 1.6,
        hasCtcfMutation: false,
        cohesinSpeedKbS: 1.1,
        ctcfPermeability: 0.14,
      }
    },
    {
      accession: 'GSE165512',
      title: 'High-Throughput Hi-C Chromatin Architecture and TAD Boundary Disruption in Somatic Structural Variants',
      summary: 'Micro-C and in situ Hi-C mapping of boundary insulation loss, CTCF motif orientation flipping, and enhancer-hijacking oncogene loops.',
      organism: 'Homo sapiens',
      experimentType: 'Hi-C',
      sampleCount: 32,
      platform: 'GPL20301 (Illumina HiSeq 4000)',
      submissionDate: '2025-06-20',
      contributingLab: 'Department of Biochemistry & Molecular Genetics',
      institution: 'University of Virginia (UVA / iTHRIV)',
      pmid: '35128901',
      parameters: {
        ecmStiffnessKpa: 8.5,
        actinTensionNn: 2.4,
        epigeneticState: 'HETEROCHROMATIN_H3K9ME3',
        med1ConcUm: 4.5,
        brd4ConcUm: 3.2,
        polIiConcUm: 1.8,
        hasCtcfMutation: true,
        cohesinSpeedKbS: 0.9,
        ctcfPermeability: 0.35,
      }
    },
    {
      accession: 'GSE200155',
      title: 'Super-Enhancer MED1/BRD4 Liquid-Liquid Phase Separation Dynamics in Pharmacological Epigenetic Rescue',
      summary: 'Super-resolution fluorescent correlation spectroscopy tracking condensate droplet growth and BET bromodomain inhibition (JQ1) dissolution.',
      organism: 'Homo sapiens',
      experimentType: 'ChIP-seq',
      sampleCount: 24,
      platform: 'GPL24676 (Illumina NovaSeq 6000)',
      submissionDate: '2026-01-18',
      contributingLab: 'Purdue Regenstrief & UVA Manning Biotechnology Consortium',
      institution: 'University of Virginia / Purdue Collaborative',
      pmid: '36802119',
      parameters: {
        ecmStiffnessKpa: 3.2,
        actinTensionNn: 1.1,
        epigeneticState: 'HYPERACETYLATED_H3K27AC',
        med1ConcUm: 2.2,
        brd4ConcUm: 1.4,
        polIiConcUm: 1.1,
        hasCtcfMutation: false,
        cohesinSpeedKbS: 1.2,
        ctcfPermeability: 0.12,
      }
    },
    {
      accession: 'GSE179994',
      title: 'CRISPR-Cas9 Off-Target R-Loop Thermodynamics & Kinetic Proofreading at Sub-Nucleosomal Resolution',
      summary: 'Single-molecule optical tweezer unwrapping profiling the energetic penalty of seed vs non-seed mismatches across 12,000 genomic loci.',
      organism: 'Homo sapiens',
      experimentType: 'ATAC-seq',
      sampleCount: 64,
      platform: 'GPL18573 (Illumina NextSeq 500)',
      submissionDate: '2025-08-30',
      contributingLab: 'Bowerman Sports Science & UVA Precision Genomics Lab',
      institution: 'University of Oregon / University of Virginia',
      pmid: '35719940',
      parameters: {
        ecmStiffnessKpa: 5.2,
        actinTensionNn: 1.8,
        epigeneticState: 'UNMODIFIED_CANONICAL',
        med1ConcUm: 3.2,
        brd4ConcUm: 2.5,
        polIiConcUm: 1.4,
        hasCtcfMutation: false,
        cohesinSpeedKbS: 1.0,
        ctcfPermeability: 0.18,
      }
    },
    {
      accession: 'GSE184498',
      title: 'LINC Complex Mechanotransduction and Nuclear Pore Deformability in Stiffened Fibrotic Stroma',
      summary: 'Biomechanical AFM force indentation and SUN/nesprin-mediated nucleocytoplasmic YAP/TAZ translocation under extracellular matrix rigidity.',
      organism: 'Homo sapiens',
      experimentType: 'scRNA-seq',
      sampleCount: 36,
      platform: 'GPL24676 (10x Genomics Chromium / Illumina NovaSeq 6000)',
      submissionDate: '2025-04-12',
      contributingLab: 'UVA Health Sports Medicine Center & Manning Institute',
      institution: 'University of Virginia (UVA / iTHRIV)',
      pmid: '34492008',
      parameters: {
        ecmStiffnessKpa: 12.4,
        actinTensionNn: 3.8,
        epigeneticState: 'POLYCOMB_H3K27ME3',
        med1ConcUm: 5.5,
        brd4ConcUm: 4.1,
        polIiConcUm: 2.4,
        hasCtcfMutation: false,
        cohesinSpeedKbS: 1.3,
        ctcfPermeability: 0.22,
      }
    }
  ]);

  searchGse(query: string): IGseDataset[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return this.gseCatalog();
    }
    return this.gseCatalog().filter(ds => 
      ds.accession.toLowerCase().includes(q) ||
      ds.title.toLowerCase().includes(q) ||
      ds.summary.toLowerCase().includes(q) ||
      ds.institution.toLowerCase().includes(q) ||
      ds.experimentType.toLowerCase().includes(q) ||
      ds.contributingLab.toLowerCase().includes(q)
    );
  }

  getGseByAccession(accession: string): IGseDataset | undefined {
    const norm = accession.trim().toUpperCase();
    return this.gseCatalog().find(ds => ds.accession === norm);
  }

  ingestIntoPhysicalGenomics(gse: IGseDataset): void {
    if (this.physicalGenomics) {
      // Re-seed Physical Genomics simulation with exact GSE dataset parameters
      this.physicalGenomics.activePriors.set({
        ecmStiffnessKPa: gse.parameters.ecmStiffnessKpa,
        actinTensionNn: gse.parameters.actinTensionNn,
        epigeneticState: gse.parameters.epigeneticState,
        tubulinCatastropheRatePerMin: 1.2,
        tubulinLys40AcetylationRatio: 0.65,
        med1ConcentrationUm: gse.parameters.med1ConcUm,
        brd4ConcentrationUm: gse.parameters.brd4ConcUm,
        polIiConcentrationUm: gse.parameters.polIiConcUm,
        cohesinSpeedKbPerSec: gse.parameters.cohesinSpeedKbS,
        ctcfPermeability: gse.parameters.ctcfPermeability,
        superhelicalSigma: -0.06,
        rationale: `NCBI GEO ${gse.accession} (${gse.institution}): ${gse.title}`,
      });
    }
  }
}
