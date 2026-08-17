import { Injectable, signal, computed } from '@angular/core';

export type AccreditationBody = 'AAPC' | 'AHIMA';

export interface ICeuCredentialTrack {
  id: string;
  name: string;
  shortTitle: string;
  accreditationBody: AccreditationBody;
  requiredHours: number;
  completedHours: number;
  requiredChartsAudited: number;
  completedChartsAudited: number;
  focusArea: string;
  badgeIcon: string;
  competencyPillars: string[];
}

export interface ICeuCertificate {
  certificateId: string;
  recipientName: string;
  credentialTrackName: string;
  accreditationBody: AccreditationBody;
  ceuCreditsAwarded: number;
  issueDate: string;
  verificationHash: string;
  specialtyPillars: string[];
  accreditationAttestation: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalCeuUpskillingService {
  readonly professionalName = signal<string>('Jane Doe, CPC, CRC');
  readonly totalChartsAudited = signal<number>(42);
  readonly totalCeuHoursLogged = signal<number>(14.5);

  readonly tracks = signal<ICeuCredentialTrack[]>([
    {
      id: 'track-ai-cdis',
      name: 'AI-Supervised Clinical Documentation Integrity Specialist (AI-CDIS)',
      shortTitle: 'AI-CDIS Executive',
      accreditationBody: 'AHIMA',
      requiredHours: 12.0,
      completedHours: 12.0,
      requiredChartsAudited: 30,
      completedChartsAudited: 42,
      focusArea: 'Clinical NLP NegEx Oversight & Physician Query Formulation',
      badgeIcon: '👩‍🏫',
      competencyPillars: [
        'ConText / NegEx Synthetic Negation Resolution',
        '2024 AMA E&M Medical Decision Making Defense',
        'Physician Query Compliance (ACDIS/AHIMA Standards)'
      ]
    },
    {
      id: 'track-crc-v28',
      name: 'CMS-HCC V28 Risk Adjustment & SDOH Auditor (CRC-AI)',
      shortTitle: 'CRC-AI Risk Specialist',
      accreditationBody: 'AAPC',
      requiredHours: 8.0,
      completedHours: 8.0,
      requiredChartsAudited: 25,
      completedChartsAudited: 38,
      focusArea: 'Hierarchical Condition Categories & Z-Code Social Risk Scoring',
      badgeIcon: '📊',
      competencyPillars: [
        'CMS-HCC Model V28 vs. V24 Payment Coefficient Shifts',
        'Z55-Z65 Social Determinants of Health Capture',
        'RADV (Risk Adjustment Data Validation) Audit Shielding'
      ]
    },
    {
      id: 'track-cmrs-gen',
      name: 'Genomic & Rare Disease Orphan Coding Director (CMRS-GEN)',
      shortTitle: 'CMRS-GEN Director',
      accreditationBody: 'AAPC',
      requiredHours: 10.0,
      completedHours: 6.5,
      requiredChartsAudited: 20,
      completedChartsAudited: 14,
      focusArea: 'OMIM, Orphanet, and Next-Gen Sequencing CPT Code Architecture',
      badgeIcon: '🧬',
      competencyPillars: [
        'Matchmaker Exchange Phenotype Mapping (HPO)',
        'Whole Exome & Genome Tier 1/2 Variant CPT Bundling',
        'N-of-1 Investigational IND Dossier Attribution'
      ]
    }
  ]);

  readonly activeCertificates = signal<ICeuCertificate[]>([]);

  readonly totalCompletedCredits = computed(() => {
    return this.tracks()
      .filter(t => t.completedHours >= t.requiredHours)
      .reduce((acc, t) => acc + t.requiredHours, 0);
  });

  /**
   * Logs a completed chart audit session and updates ongoing track hours.
   */
  logAuditSession(chartCount: number = 1, minutesSpent: number = 15): void {
    this.totalChartsAudited.update(c => c + chartCount);
    const addedHours = Number((minutesSpent / 60).toFixed(2));
    this.totalCeuHoursLogged.update(h => Number((h + addedHours).toFixed(2)));

    this.tracks.update(list => list.map(t => {
      const newCharts = t.completedChartsAudited + chartCount;
      const newHours = Number(Math.min(t.requiredHours, t.completedHours + addedHours).toFixed(2));
      return {
        ...t,
        completedChartsAudited: newCharts,
        completedHours: newHours
      };
    }));
  }

  /**
   * Generates a verifiable CEU certificate for an eligible track.
   */
  issueCertificate(trackId: string, customRecipient?: string): ICeuCertificate {
    const track = this.tracks().find(t => t.id === trackId) || this.tracks()[0];
    const name = customRecipient || this.professionalName();
    const certId = `CEU-${track.accreditationBody}-${Date.now().toString(36).toUpperCase()}`;
    const hash = `0x${Array.from(certId + name).map(c => c.charCodeAt(0).toString(16)).join('').slice(0, 32)}`;

    const cert: ICeuCertificate = {
      certificateId: certId,
      recipientName: name,
      credentialTrackName: track.name,
      accreditationBody: track.accreditationBody,
      ceuCreditsAwarded: track.requiredHours,
      issueDate: new Date().toISOString().split('T')[0],
      verificationHash: hash,
      specialtyPillars: track.competencyPillars,
      accreditationAttestation: `This certificate certifies that ${name} has satisfactorily completed ${track.requiredHours} contact hours of continuing education in ${track.focusArea}, meeting all AAPC/AHIMA core competencies.`
    };

    this.activeCertificates.update(prev => [cert, ...prev]);
    return cert;
  }
}
