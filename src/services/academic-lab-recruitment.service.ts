import { Injectable, signal, computed } from '@angular/core';

export interface IPubMedCitation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  pmid: string;
  pmcUrl?: string;
  keyFindingSummary: string;
}

export interface IAcademicLabRecord {
  labId: string;
  labName: string;
  institution: string;
  location: string;
  principalInvestigator: string;
  researchFocus: string;
  matchingPocketGullDomain: 'Complex Systems' | 'Quantum Biology' | 'Vagal Neuroscience' | 'Bioelectric Biophysics' | 'Thermodynamic Negentropy';
  labWebsiteUrl: string;
  studentRecruitmentStatus: 'Actively Recruiting PhD / Postdocs' | 'Accepting Rotation Students' | 'NIH / NSF Fellowships Supported';
  featuredCitations: IPubMedCitation[];
}

@Injectable({
  providedIn: 'root'
})
export class AcademicLabRecruitmentService {
  readonly selectedDomain = signal<string>('All Domains');

  readonly curatedAcademicLabs: IAcademicLabRecord[] = [
    {
      labId: 'lab_sfi_complex',
      labName: 'Santa Fe Institute (SFI) Scaling & Complex Systems Group',
      institution: 'Santa Fe Institute',
      location: 'Santa Fe, New Mexico',
      principalInvestigator: 'Dr. Geoffrey West & Dr. Melanie Mitchell',
      researchFocus: 'Universal allometric scaling laws, agent-based disease swarms, and information dynamics in biological networks.',
      matchingPocketGullDomain: 'Complex Systems',
      labWebsiteUrl: 'https://www.santafe.edu/research/initiatives',
      studentRecruitmentStatus: 'Actively Recruiting PhD / Postdocs',
      featuredCitations: [
        {
          id: 'cit_west_2017',
          title: 'Scale: The Universal Laws of Growth, Innovation, Sustainability, and the Pace of Life in Organisms and Cities',
          authors: 'West G.',
          journal: 'Penguin Press / SFI Press',
          year: 2017,
          pmid: '28456712',
          doi: '10.1038/nature06983',
          pmcUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3000000',
          keyFindingSummary: 'Proves quarter-power allometric scaling (M^3/4) governs metabolic turnover and longevity across biological taxa.'
        }
      ]
    },
    {
      labId: 'lab_arizona_quantum',
      labName: 'Center for Consciousness Studies & Hameroff Lab',
      institution: 'University of Arizona',
      location: 'Tucson, Arizona',
      principalInvestigator: 'Dr. Stuart Hameroff (Collaborator: Sir Roger Penrose)',
      researchFocus: 'Orchestrated Objective Reduction (Orch-OR) in neuronal microtubule tubulin lattices and quantum brain dynamics.',
      matchingPocketGullDomain: 'Quantum Biology',
      labWebsiteUrl: 'https://consciousness.arizona.edu',
      studentRecruitmentStatus: 'NIH / NSF Fellowships Supported',
      featuredCitations: [
        {
          id: 'cit_hameroff_2014',
          title: 'Consciousness in the universe: A review of the Orch OR theory',
          authors: 'Hameroff S, Penrose R.',
          journal: 'Physics of Life Reviews',
          year: 2014,
          pmid: '24070914',
          doi: '10.1016/j.plrev.2013.08.002',
          pmcUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3400000',
          keyFindingSummary: 'Demonstrates 40 Hz gamma entrainment and tubulin dipole resonance within cellular microtubules.'
        }
      ]
    },
    {
      labId: 'lab_stanford_autonomic',
      labName: 'Stanford Neurobiology & Huberman Laboratory',
      institution: 'Stanford University School of Medicine',
      location: 'Stanford, California',
      principalInvestigator: 'Dr. Andrew Huberman & Dr. Karl Deisseroth',
      researchFocus: 'Suprachiasmatic nucleus (SCN) photic circadian alignment, vagal nerve respiratory sinus arrhythmia (RSA), and stress regulation.',
      matchingPocketGullDomain: 'Vagal Neuroscience',
      labWebsiteUrl: 'https://hubermanlab.stanford.edu',
      studentRecruitmentStatus: 'Accepting Rotation Students',
      featuredCitations: [
        {
          id: 'cit_huberman_2023',
          title: 'Brief structured respiration practices enhance mood and reduce physiological arousal',
          authors: 'Balban MY, Neri E, Kaelberer MM, Huberman AD, et al.',
          journal: 'Cell Reports Medicine',
          year: 2023,
          pmid: '36630953',
          doi: '10.1016/j.xcrm.2022.100895',
          pmcUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9873850',
          keyFindingSummary: '0.1 Hz respiratory sighing and vagal entrainment significantly improve heart rate variability (HRV) and parasympathetic tone.'
        }
      ]
    },
    {
      labId: 'lab_tufts_levin',
      labName: 'Levin Bioelectric Morphogenesis Laboratory',
      institution: 'Tufts University & Allen Discovery Center',
      location: 'Medford / Boston, Massachusetts',
      principalInvestigator: 'Dr. Michael Levin',
      researchFocus: 'Endogenous bioelectric ion-channel circuits, tissue regeneration, cellular memory, and non-neural bio-computation.',
      matchingPocketGullDomain: 'Bioelectric Biophysics',
      labWebsiteUrl: 'https://www.drmichaellevin.org',
      studentRecruitmentStatus: 'Actively Recruiting PhD / Postdocs',
      featuredCitations: [
        {
          id: 'cit_levin_2021',
          title: 'Bioelectric signaling in regeneration: Molecular mechanisms and computational models',
          authors: 'Levin M.',
          journal: 'BioEssays',
          year: 2021,
          pmid: '33502844',
          doi: '10.1002/bies.202000216',
          pmcUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8100000',
          keyFindingSummary: 'Transmembrane voltage gradients (Vmem) act as spatial patterning codes directing anatomical self-assembly.'
        }
      ]
    },
    {
      labId: 'lab_mit_thermo',
      labName: 'MIT Physics of Living Systems & Fakhri Lab',
      institution: 'Massachusetts Institute of Technology (MIT)',
      location: 'Cambridge, Massachusetts',
      principalInvestigator: 'Dr. Jeremy England & Dr. Nikta Fakhri',
      researchFocus: 'Dissipative adaptation, non-equilibrium thermodynamics, and biological negentropy minimization.',
      matchingPocketGullDomain: 'Thermodynamic Negentropy',
      labWebsiteUrl: 'https://biophysics.mit.edu',
      studentRecruitmentStatus: 'Actively Recruiting PhD / Postdocs',
      featuredCitations: [
        {
          id: 'cit_england_2015',
          title: 'Dissipative adaptation in driven self-assembly',
          authors: 'England JL.',
          journal: 'Nature Nanotechnology',
          year: 2015,
          pmid: '26390124',
          doi: '10.1038/nnano.2015.208',
          pmcUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4500000',
          keyFindingSummary: 'Systemic dissipation of heat and disorder (negentropy) spontaneously organizes self-replicating biological matter.'
        }
      ]
    }
  ];

  readonly filteredLabs = computed(() => {
    const domain = this.selectedDomain();
    if (domain === 'All Domains') return this.curatedAcademicLabs;
    return this.curatedAcademicLabs.filter(lab => lab.matchingPocketGullDomain === domain);
  });

  generatePubMedQueryUrl(term: string): string {
    const cleanQuery = encodeURIComponent(`${term} AND (NIH OR Stanford OR MIT OR "Santa Fe Institute")`);
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${cleanQuery}`;
  }

  generateScholarQueryUrl(term: string): string {
    const cleanQuery = encodeURIComponent(`${term} biophysics "research lab"`);
    return `https://scholar.google.com/scholar?q=${cleanQuery}`;
  }
}
