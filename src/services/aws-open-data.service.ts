/**
 * Big Four Open Health Data Federation Service.
 * Connects PocketGull to open biomedical, genomic, pharmacology, and clinical literature
 * hosted across Amazon Web Services (RODA), Google Cloud (BigQuery/GCS), Microsoft Azure,
 * and Apple Health Academic Research Studies (Stanford, Harvard, Michigan).
 *
 * @module services/aws-open-data.service
 */
import { Injectable, signal, computed } from '@angular/core';

export interface IOpenHealthDataset {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure' | 'apple';
  providerLabel: string;
  description: string;
  documentationUrl: string;
  storageUri: string;
  regionOrLocation: string;
  category: 'clinical' | 'genomics' | 'pharmacology' | 'imaging' | 'epidemiology';
  tags: string[];
  license: string;
  managedBy: string;
  queryOrAccessMethod: 'S3 Direct' | 'BigQuery Public' | 'Azure Blob' | 'HTTPS REST' | 'FHIR / On-Device';
  directAccessUrl?: string;
}

export const FEDERATED_OPEN_HEALTH_DATASETS: IOpenHealthDataset[] = [
  // ── 1. AWS RODA DATASETS ───────────────────────────────────────
  {
    id: 'nih-pubmed-pmc',
    name: 'NIH PubMed Central Open Access Subset',
    provider: 'aws',
    providerLabel: 'AWS RODA',
    description: 'Full-text open access biomedical journal literature from the National Center for Biotechnology Information (NCBI) and National Library of Medicine (NLM).',
    documentationUrl: 'https://registry.opendata.aws/pubmed-open-access/',
    storageUri: 's3://pmc-oa-opendata/',
    regionOrLocation: 'us-east-1 (AWS)',
    category: 'clinical',
    tags: ['pubmed', 'clinical trials', 'peer review', 'biomedical literature'],
    license: 'Custom Open Access / CC-BY / Public Domain',
    managedBy: 'National Institutes of Health (NIH)',
    queryOrAccessMethod: 'S3 Direct',
    directAccessUrl: 'https://pmc-oa-opendata.s3.amazonaws.com/',
  },
  {
    id: 'chembl-open-data',
    name: 'ChEMBL Open Bioactivity Database on AWS',
    provider: 'aws',
    providerLabel: 'AWS RODA',
    description: 'Curated database of bioactivity data of drug-like small molecules, targets, bioassays, and approved pharmaceutical mechanisms from EMBL-EBI.',
    documentationUrl: 'https://registry.opendata.aws/chembl/',
    storageUri: 's3://aws-roda-chembl/',
    regionOrLocation: 'us-east-1 (AWS)',
    category: 'pharmacology',
    tags: ['chembl', 'bioactivity', 'drug discovery', 'pharmacokinetics', 'ic50'],
    license: 'CC-BY-SA 3.0',
    managedBy: 'EMBL-EBI',
    queryOrAccessMethod: 'S3 Direct',
    directAccessUrl: 'https://aws-roda-chembl.s3.amazonaws.com/',
  },
  {
    id: '1000-genomes-aws',
    name: '1000 Genomes Project (Phase 3 & High Coverage)',
    provider: 'aws',
    providerLabel: 'AWS RODA',
    description: 'Deep whole-genome and exome sequencing data from 2,504 individuals across 26 global populations for genetic variation and clinical pathogenicity analysis.',
    documentationUrl: 'https://registry.opendata.aws/1000genomes/',
    storageUri: 's3://1000genomes/',
    regionOrLocation: 'us-east-1 (AWS)',
    category: 'genomics',
    tags: ['genomics', 'variants', 'vcf', 'population genetics', 'grch38'],
    license: 'CC0 1.0 Universal / Public Domain',
    managedBy: 'International Genome Sample Resource (IGSR)',
    queryOrAccessMethod: 'S3 Direct',
    directAccessUrl: 'https://1000genomes.s3.amazonaws.com/',
  },
  {
    id: 'ncbi-clinvar-aws',
    name: 'NCBI ClinVar Genomic Variation & Pathogenicity',
    provider: 'aws',
    providerLabel: 'AWS RODA',
    description: 'Public archive of reports of the relationships among human genomic variations and phenotypes, with supporting clinical evidence and ACR classifications.',
    documentationUrl: 'https://registry.opendata.aws/ncbi-clinvar/',
    storageUri: 's3://ncbi-clinvar-aws/',
    regionOrLocation: 'us-east-1 (AWS)',
    category: 'genomics',
    tags: ['clinvar', 'pathogenic', 'benign', 'vus', 'genomic variants'],
    license: 'Public Domain / US Government Work',
    managedBy: 'NCBI / NIH',
    queryOrAccessMethod: 'S3 Direct',
    directAccessUrl: 'https://ncbi-clinvar-aws.s3.amazonaws.com/',
  },
  {
    id: 'tcga-cancer-atlas-aws',
    name: 'The Cancer Genome Atlas (TCGA) Pan-Cancer Data',
    provider: 'aws',
    providerLabel: 'AWS RODA',
    description: 'Molecular characterization of over 20,000 primary cancer and matched normal samples spanning 33 cancer types for precision oncology benchmarking.',
    documentationUrl: 'https://registry.opendata.aws/tcga/',
    storageUri: 's3://tcga-2-open/',
    regionOrLocation: 'us-east-1 (AWS)',
    category: 'imaging',
    tags: ['oncology', 'cancer', 'rna-seq', 'histopathology', 'mutation'],
    license: 'NIH GDC Open Access',
    managedBy: 'National Cancer Institute (NCI)',
    queryOrAccessMethod: 'S3 Direct',
    directAccessUrl: 'https://tcga-2-open.s3.amazonaws.com/',
  },

  // ── 2. GOOGLE CLOUD BIGQUERY & GCS DATASETS ────────────────────
  {
    id: 'gcp-clinical-trials',
    name: 'NIH ClinicalTrials.gov on Google BigQuery',
    provider: 'gcp',
    providerLabel: 'Google Cloud',
    description: 'Live searchable SQL dataset of all registered global clinical trials, protocol designs, eligibility criteria, study phases, and outcome measures.',
    documentationUrl: 'https://cloud.google.com/healthcare-api/docs/resources/public-datasets',
    storageUri: 'bigquery-public-data.nih_clinical_trials',
    regionOrLocation: 'US Multi-Region (GCP)',
    category: 'clinical',
    tags: ['clinical trials', 'nih', 'interventions', 'recruitment', 'phase 3'],
    license: 'Public Domain',
    managedBy: 'National Library of Medicine (NLM)',
    queryOrAccessMethod: 'BigQuery Public',
    directAccessUrl: 'https://console.cloud.google.com/bigquery?p=bigquery-public-data&d=nih_clinical_trials',
  },
  {
    id: 'gcp-openfda',
    name: 'FDA OpenFDA Adverse Drug Events & Recalls',
    provider: 'gcp',
    providerLabel: 'Google Cloud',
    description: 'Structured repository of post-marketing adverse drug event reports, 510(k) device clearances, drug product labeling, and recall notices.',
    documentationUrl: 'https://open.fda.gov/',
    storageUri: 'bigquery-public-data.fda_drug',
    regionOrLocation: 'US Multi-Region (GCP)',
    category: 'pharmacology',
    tags: ['fda', 'pharmacovigilance', 'adverse events', 'faers', 'drug recalls'],
    license: 'CC0 1.0 Universal',
    managedBy: 'U.S. Food and Drug Administration (FDA)',
    queryOrAccessMethod: 'BigQuery Public',
    directAccessUrl: 'https://console.cloud.google.com/bigquery?p=bigquery-public-data&d=fda_drug',
  },
  {
    id: 'gcp-gnomad',
    name: 'Genome Aggregation Database (gnomAD v4)',
    provider: 'gcp',
    providerLabel: 'Google Cloud',
    description: 'Harmonized exome and whole-genome sequencing dataset across 807,162 individuals, providing allele frequencies and constraint metrics.',
    documentationUrl: 'https://cloud.google.com/life-sciences/docs/resources/public-datasets/gnomad',
    storageUri: 'gs://gcp-public-data--gnomad/release/4.0/',
    regionOrLocation: 'US Multi-Region (GCP)',
    category: 'genomics',
    tags: ['gnomad', 'exomes', 'genomes', 'allele frequency', 'broad institute'],
    license: 'ODC Open Database License (ODbL)',
    managedBy: 'Broad Institute of MIT and Harvard',
    queryOrAccessMethod: 'BigQuery Public',
    directAccessUrl: 'https://console.cloud.google.com/storage/browser/gcp-public-data--gnomad',
  },

  // ── 3. MICROSOFT AZURE & MSR OPEN DATASETS ─────────────────────
  {
    id: 'azure-open-targets',
    name: 'Open Targets Genomics Platform on Azure',
    provider: 'azure',
    providerLabel: 'Microsoft Azure',
    description: 'Evidence-based drug target discovery data lake linking disease targets, human genetics, somatic mutations, and tractability scores on Azure Blob Storage.',
    documentationUrl: 'https://learn.microsoft.com/en-us/azure/open-datasets/dataset-open-targets',
    storageUri: 'https://azureopendatastorage.blob.core.windows.net/opentargets/',
    regionOrLocation: 'East US 2 (Azure)',
    category: 'pharmacology',
    tags: ['open targets', 'drug targets', 'genetics', 'tractability', 'chembl'],
    license: 'Apache-2.0 / CC0',
    managedBy: 'Open Targets Consortium / Microsoft',
    queryOrAccessMethod: 'Azure Blob',
    directAccessUrl: 'https://azureopendatastorage.blob.core.windows.net/opentargets/',
  },
  {
    id: 'azure-illumina-platinum',
    name: 'Illumina Platinum Genomes on Azure',
    provider: 'azure',
    providerLabel: 'Microsoft Azure',
    description: 'High-confidence benchmark human reference genomes (NA12878 / CEPH pedigree) for validating variant calling pipelines and diagnostic assays.',
    documentationUrl: 'https://learn.microsoft.com/en-us/azure/open-datasets/dataset-illumina-platinum-genomes',
    storageUri: 'https://azureopendatastorage.blob.core.windows.net/genomicscontainer/',
    regionOrLocation: 'West US 2 (Azure)',
    category: 'genomics',
    tags: ['platinum genomes', 'illumina', 'na12878', 'benchmark', 'deep sequencing'],
    license: 'Creative Commons Attribution 4.0 (CC-BY-4.0)',
    managedBy: 'Illumina & Microsoft Azure',
    queryOrAccessMethod: 'Azure Blob',
    directAccessUrl: 'https://azureopendatastorage.blob.core.windows.net/genomicscontainer/',
  },
  {
    id: 'msr-biomedical-nlp',
    name: 'Microsoft Research Biomedical NLP & PubMed Benchmarks',
    provider: 'azure',
    providerLabel: 'MSR Open Data',
    description: 'Curated scientific machine reading datasets, clinical entity linking corpora (BioREx, PubMedQA), and medical QA benchmarks.',
    documentationUrl: 'https://msropendata.com/',
    storageUri: 'https://msropendata.com/datasets/pubmed-qa-msr',
    regionOrLocation: 'Global (MSR)',
    category: 'clinical',
    tags: ['msr', 'nlp', 'pubmedqa', 'biomedical reading', 'question answering'],
    license: 'MIT / MSR Open Data Terms',
    managedBy: 'Microsoft Research (MSR)',
    queryOrAccessMethod: 'HTTPS REST',
    directAccessUrl: 'https://msropendata.com/',
  },

  // ── 4. APPLE HEALTH & ACADEMIC RESEARCH DATASETS ───────────────
  {
    id: 'apple-heart-study-stanford',
    name: 'Stanford Medicine Apple Heart Study Cohort',
    provider: 'apple',
    providerLabel: 'Apple & Stanford',
    description: 'Landmark AFib detection and PPG pulse tachogram dataset across 419,297 participants conducted by Stanford Medicine and Apple.',
    documentationUrl: 'https://med.stanford.edu/appleheartstudy.html',
    storageUri: 'https://med.stanford.edu/appleheartstudy.html',
    regionOrLocation: 'Stanford Medicine / NEJM',
    category: 'clinical',
    tags: ['apple health', 'stanford', 'afib', 'ecg', 'ppg', 'cardiology'],
    license: 'Open Access Research (NEJM)',
    managedBy: 'Stanford University School of Medicine',
    queryOrAccessMethod: 'FHIR / On-Device',
    directAccessUrl: 'https://med.stanford.edu/appleheartstudy.html',
  },
  {
    id: 'apple-carekit-open-source',
    name: 'Apple CareKit Clinical Care Plan Standard',
    provider: 'apple',
    providerLabel: 'Apple Open Source',
    description: 'Open-source framework for structured patient care plans, outcome tracking, medication adherence, and FHIR synchronization.',
    documentationUrl: 'https://developer.apple.com/carekit/',
    storageUri: 'https://github.com/carekit-apple/CareKit',
    regionOrLocation: 'GitHub Open Source',
    category: 'clinical',
    tags: ['carekit', 'care plan', 'medication adherence', 'fhir', 'apple health'],
    license: 'BSD-3-Clause',
    managedBy: 'Apple Inc. & CareKit Community',
    queryOrAccessMethod: 'HTTPS REST',
    directAccessUrl: 'https://developer.apple.com/carekit/',
  },
  {
    id: 'apple-womens-health-harvard',
    name: "Harvard Apple Women's Health Study (NIEHS)",
    provider: 'apple',
    providerLabel: 'Apple & Harvard',
    description: 'First-of-its-kind landmark longitudinal study analyzing menstrual health, PCOS, and cardiometabolic markers across 100,000+ participants.',
    documentationUrl: 'https://www.hsph.harvard.edu/applewomenshealthstudy/',
    storageUri: 'https://www.hsph.harvard.edu/applewomenshealthstudy/',
    regionOrLocation: 'Harvard T.H. Chan / NIEHS',
    category: 'epidemiology',
    tags: ['womens health', 'harvard', 'niehs', 'pcos', 'endocrinology'],
    license: 'Academic Open Access',
    managedBy: 'Harvard T.H. Chan School of Public Health',
    queryOrAccessMethod: 'HTTPS REST',
    directAccessUrl: 'https://www.hsph.harvard.edu/applewomenshealthstudy/',
  },
  {
    id: 'apple-hearing-who',
    name: 'University of Michigan Apple Hearing Study (WHO)',
    provider: 'apple',
    providerLabel: 'Apple & Michigan',
    description: 'Longitudinal environmental sound exposure and audiometric threshold dataset contributing directly to WHO global safe listening standards.',
    documentationUrl: 'https://sph.umich.edu/applehearingstudy/',
    storageUri: 'https://sph.umich.edu/applehearingstudy/',
    regionOrLocation: 'Univ. of Michigan / WHO',
    category: 'epidemiology',
    tags: ['audiology', 'hearing', 'who', 'michigan', 'environmental noise'],
    license: 'WHO / Academic Open Access',
    managedBy: 'University of Michigan School of Public Health',
    queryOrAccessMethod: 'HTTPS REST',
    directAccessUrl: 'https://sph.umich.edu/applehearingstudy/',
  }
];

// Alias for backward compatibility
export type IAwsOpenDataset = IOpenHealthDataset;
export const CURATED_BIOMEDICAL_DATASETS = FEDERATED_OPEN_HEALTH_DATASETS;

@Injectable({
  providedIn: 'root'
})
export class AwsOpenDataService {
  /** All available datasets across AWS, GCP, Azure, and Apple */
  private datasets = signal<IOpenHealthDataset[]>(FEDERATED_OPEN_HEALTH_DATASETS);

  /** Active provider filter */
  activeProvider = signal<'all' | 'aws' | 'gcp' | 'azure' | 'apple'>('all');

  /** Active category filter */
  activeCategory = signal<string>('all');

  /** Search query */
  searchQuery = signal<string>('');

  /** Filtered dataset list */
  filteredDatasets = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.activeCategory();
    const provider = this.activeProvider();
    let list = this.datasets();

    if (provider !== 'all') {
      list = list.filter(d => d.provider === provider);
    }

    if (cat !== 'all') {
      list = list.filter(d => d.category === cat);
    }

    if (q) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        d.managedBy.toLowerCase().includes(q) ||
        d.providerLabel.toLowerCase().includes(q)
      );
    }

    return list;
  });

  /** Selected dataset for inspection */
  selectedDataset = signal<IOpenHealthDataset | null>(null);

  /** Sets provider filter */
  setProvider(provider: 'all' | 'aws' | 'gcp' | 'azure' | 'apple'): void {
    this.activeProvider.set(provider);
  }

  /** Sets category filter */
  setCategory(category: string): void {
    this.activeCategory.set(category);
  }

  /** Sets search query */
  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  /** Selects a dataset */
  selectDataset(dataset: IOpenHealthDataset | null): void {
    this.selectedDataset.set(dataset);
  }
}
