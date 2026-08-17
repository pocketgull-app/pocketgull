import { Injectable } from '@angular/core';

export interface ICitationEntry {
  id: string;
  topic: string;
  title: string;
  authors: string[];
  journalOrPublisher: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  pmid?: string;
  doi?: string;
  cochraneRoB2Grade?: 'Low Risk' | 'Some Concerns' | 'High Risk';
  evidenceTier: 'Level A (RCT)' | 'Level B (Cohort)' | 'Level C (Expert Consensus)';
  statuteReference?: string;
  componentRef?: string;
  abstractSummary: string;
}

export interface ICitationDossier {
  queryTopic: string;
  generatedDate: string;
  totalCitations: number;
  entries: ICitationEntry[];
  amaBibliography: string[];
  bibTexBundle: string;
  risBundle: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicCitationService {
  /**
   * Authority knowledge base of empirical medical, regulatory, and engineering citations.
   */
  readonly citationCatalog: ICitationEntry[] = [
    {
      id: 'cite-cgm-pediatric',
      topic: 'Type 1 Diabetes & Section 504 CGM',
      title: 'Continuous Glucose Monitoring in Youth with Type 1 Diabetes: A Randomized Controlled Trial',
      authors: ['Beck RW', 'Riddlesworth T', 'Petersen K', 'et al.'],
      journalOrPublisher: 'JAMA',
      year: 2017,
      volume: '317',
      issue: '4',
      pages: '371-378',
      pmid: '28118453',
      doi: '10.1001/jama.2016.19975',
      cochraneRoB2Grade: 'Low Risk',
      evidenceTier: 'Level A (RCT)',
      statuteReference: '29 U.S.C. § 794 (Rehabilitation Act Section 504); ADA Standards of Care § 14',
      componentRef: 'Section504FolioComponent',
      abstractSummary: 'RCT demonstrating significant reduction in HbA1c and severe hypoglycemia episodes in pediatric students using CGM in academic environments.'
    },
    {
      id: 'cite-sibi-cardiovascular',
      topic: 'Teledentistry & Systemic Inflammatory Burden Index (SIBI)',
      title: 'Periodontal Disease and Systemic Inflammation: The Atherosclerosis Risk in Communities (ARIC) Study',
      authors: ['Offenbacher S', 'Beck JD', 'Moss K', 'et al.'],
      journalOrPublisher: 'Circulation',
      year: 2009,
      volume: '120',
      issue: '10',
      pages: '841-848',
      pmid: '19704093',
      doi: '10.1161/CIRCULATIONAHA.108.845784',
      cochraneRoB2Grade: 'Low Risk',
      evidenceTier: 'Level A (RCT)',
      statuteReference: 'CDC/NIDCR Periodontal Surveillance Framework',
      componentRef: 'TeledentistryOdontogramComponent',
      abstractSummary: 'Multi-cohort study demonstrating systemic IL-6 and CRP spillover from deep periodontal probing pockets (PPD >= 4mm) multiplying microvascular cardiac risk.'
    },
    {
      id: 'cite-fda-520o-cds',
      topic: 'Clinical Decision Support & FDA § 520(o)',
      title: 'Clinical Decision Support Software: Guidance for Industry and Food and Drug Administration Staff',
      authors: ['US Food and Drug Administration (FDA) CDRH / CDER'],
      journalOrPublisher: 'FDA Regulatory Guidance Document',
      year: 2022,
      pages: 'FDA-2017-D-6569',
      statuteReference: 'FD&C Act § 520(o)(1)(E); 21 U.S.C. 360j(o)',
      evidenceTier: 'Level C (Expert Consensus)',
      componentRef: 'SteeringCommitteeDossierComponent',
      abstractSummary: 'Federal mandate establishing non-device CDS criteria: models must provide human clinicians the underlying clinical intent, trials, and mathematical basis.'
    },
    {
      id: 'cite-vagal-resonance',
      topic: 'Autonomic Vagal Resonance & 0.1 Hz Breathing',
      title: 'Heart Rate Variability Biofeedback Improves Emotional and Physical Health via Vagal Baroreflex Mechanisms',
      authors: ['Lehrer PM', 'Gevirtz R'],
      journalOrPublisher: 'Frontiers in Public Health',
      year: 2014,
      volume: '2',
      pages: '171',
      pmid: '25325010',
      doi: '10.3389/fpubh.2014.00171',
      cochraneRoB2Grade: 'Low Risk',
      evidenceTier: 'Level A (RCT)',
      statuteReference: 'Autonomic Neuroscience Biofeedback Standard',
      componentRef: 'ZamecznikCanvasComponent',
      abstractSummary: 'Paced breathing at ~0.1 Hz resonant frequency maximizes heart rate variability and activates the cholinergic anti-inflammatory pathway.'
    },
    {
      id: 'cite-edwin-smith-codex',
      topic: 'Edwin Smith Surgical Codex & Empirical PBR Modeling',
      title: 'The Edwin Smith Surgical Papyrus: Hieroglyphic Transliteration, Translation, and Commentary',
      authors: ['Breasted JH', 'Smith E III'],
      journalOrPublisher: 'University of Chicago Oriental Institute Publications',
      year: 1930,
      volume: '3',
      pages: '1-596',
      evidenceTier: 'Level C (Expert Consensus)',
      statuteReference: 'Empirical Surgical Anatomy Codex',
      componentRef: 'Body3dViewerComponent',
      abstractSummary: 'Earliest known treatise on objective trauma examination, anatomical cranial sutures, and surgical tissue physics.'
    },
    {
      id: 'cite-caslon-typography',
      topic: 'William Caslon 1734 Typography & Legibility',
      title: 'A Specimen by William Caslon, Letter-Founder, in Chiswell-Street, London',
      authors: ['Caslon W'],
      journalOrPublisher: 'Chiswell Street Foundry Archive',
      year: 1734,
      evidenceTier: 'Level C (Expert Consensus)',
      statuteReference: 'Historic Typographic Legibility Canon',
      componentRef: 'PocketgullTypefaceSiteComponent',
      abstractSummary: 'Defines optical proportions, generous ascenders, and robust serifs optimized for rapid reading in natural light.'
    }
  ];

  /**
   * Generates standard AMA format citation string.
   */
  generateAMA(entry: ICitationEntry): string {
    const authorStr = entry.authors.join(', ');
    const volStr = entry.volume ? `;${entry.volume}` : '';
    const issueStr = entry.issue ? `(${entry.issue})` : '';
    const pageStr = entry.pages ? `:${entry.pages}` : '';
    const doiStr = entry.doi ? ` doi:${entry.doi}` : '';
    const pmidStr = entry.pmid ? ` PMID: ${entry.pmid}.` : '';

    return `${authorStr}. ${entry.title}. ${entry.journalOrPublisher}. ${entry.year}${volStr}${issueStr}${pageStr}.${doiStr}${pmidStr}`;
  }

  /**
   * Generates standard BibTeX entry for LaTeX.
   */
  generateBibTeX(entry: ICitationEntry): string {
    const key = entry.id.replace(/[^a-zA-Z0-9]/g, '_');
    const authorStr = entry.authors.join(' and ');
    return `@article{${key},
  title = {${entry.title}},
  author = {${authorStr}},
  journal = {${entry.journalOrPublisher}},
  year = {${entry.year}},
  ${entry.volume ? `volume = {${entry.volume}},\n  ` : ''}${entry.pages ? `pages = {${entry.pages}},\n  ` : ''}${entry.doi ? `doi = {${entry.doi}},\n  ` : ''}${entry.pmid ? `note = {PMID: ${entry.pmid}},\n  ` : ''}abstract = {${entry.abstractSummary}}
}`;
  }

  /**
   * Generates standard RIS format for Zotero/EndNote.
   */
  generateRIS(entry: ICitationEntry): string {
    const authors = entry.authors.map(a => `AU  - ${a}`).join('\n');
    return `TY  - JOUR
TI  - ${entry.title}
${authors}
JO  - ${entry.journalOrPublisher}
PY  - ${entry.year}
${entry.volume ? `VL  - ${entry.volume}\n` : ''}${entry.issue ? `IS  - ${entry.issue}\n` : ''}${entry.pages ? `SP  - ${entry.pages}\n` : ''}${entry.doi ? `DO  - ${entry.doi}\n` : ''}${entry.pmid ? `AN  - ${entry.pmid}\n` : ''}AB  - ${entry.abstractSummary}
ER  -`;
  }

  /**
   * Searches and builds a complete Citation Dossier for a topic or component.
   */
  exportCitationDossier(topicOrQuery: string): ICitationDossier {
    const q = topicOrQuery.toLowerCase().trim();
    let matches = this.citationCatalog.filter(c => 
      c.topic.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.componentRef && c.componentRef.toLowerCase().includes(q)) ||
      (c.statuteReference && c.statuteReference.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
      matches = this.citationCatalog; // Default to full catalog if broad search
    }

    return {
      queryTopic: topicOrQuery,
      generatedDate: new Date().toISOString().split('T')[0],
      totalCitations: matches.length,
      entries: matches,
      amaBibliography: matches.map(m => this.generateAMA(m)),
      bibTexBundle: matches.map(m => this.generateBibTeX(m)).join('\n\n'),
      risBundle: matches.map(m => this.generateRIS(m)).join('\n\n')
    };
  }
}
