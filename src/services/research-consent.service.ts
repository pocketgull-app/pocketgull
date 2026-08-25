import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  IResearchCohortListing,
  IPatientResearchEnrollment,
  IResearchDividendLedgerEntry
} from '../models/research-cohort.types';

const INITIAL_COHORTS: IResearchCohortListing[] = [
  {
    id: 'cohort_diabetes_cgm',
    category: 'metabolic_endocrine',
    title: 'Type 2 Diabetes & Glycemic Trajectory Registry',
    sponsorOrInstitution: 'Stanford Center for Precision Medicine',
    ethicalFramework: 'nih_all_of_us',
    description: 'Longitudinal continuous glucose monitoring (CGM), HbA1c response, and metabolic dynamics telemetry.',
    clinicalObjective: 'Train predictive insulin sensitivity algorithms and assess individual glycemic variability patterns.',
    participantCount: 1420,
    dataPointsCount: 890000,
    compensationPerQueryUsd: 25.00,
    participantBenefitDescription: 'Receives monthly individualized Glycemic Variability & Time-in-Range trend analysis report.',
    sampleFields: ['timeInRangePercent', 'glucoseMeanMgDl', 'glycemicVariabilityCv', 'hba1cBaseline'],
    kAnonymityScore: 12,
    fhirResourceType: 'Observation',
    tags: ['NIH All of Us Model', 'CGM', 'Diabetes', 'Metabolic']
  },
  {
    id: 'cohort_oncology_biomarkers',
    category: 'oncology_genomics',
    title: 'Oncology Epigenetic & Longevity Biomarkers',
    sponsorOrInstitution: 'Mayo Clinic Comprehensive Cancer Center',
    ethicalFramework: 'luna_dna_public_benefit',
    description: 'De-identified genomic variant crosswalks, tumor somatic markers, and cellular longevity trajectories.',
    clinicalObjective: 'Accelerate personalized targeted immunotherapy response models.',
    participantCount: 680,
    dataPointsCount: 420000,
    compensationPerQueryUsd: 50.00,
    participantBenefitDescription: 'Shares directly in corporate licensing dividends + receiving comparative epigenetic longevity benchmarks.',
    sampleFields: ['epigeneticAgeDelta', 'crpMgL', 'telomereLengthIndex', 'immunotherapyToleranceScore'],
    kAnonymityScore: 8,
    fhirResourceType: 'DiagnosticReport',
    tags: ['LunaDNA Model', 'Oncology', 'Genomics', 'Biomarkers']
  },
  {
    id: 'cohort_long_covid_autonomic',
    category: 'post_viral_autonomic',
    title: 'Long-COVID & Autonomic HRV Telemetry Registry',
    sponsorOrInstitution: 'Oxford Health & Post-Viral Consortium',
    ethicalFramework: 'ciitizen_rare_disease',
    description: 'Post-viral dysautonomia, orthostatic heart rate variability (HRV), and respiratory acoustic waveforms.',
    clinicalObjective: 'Identify early autonomic biomarker markers for post-viral fatigue syndromes (PASC/ME).',
    participantCount: 950,
    dataPointsCount: 610000,
    compensationPerQueryUsd: 30.00,
    participantBenefitDescription: 'Accelerates FDA trial matching for novel neuro-immune modulation therapies.',
    sampleFields: ['rmssdMs', 'respiratoryRateBreathMin', 'orthostaticBpDelta', 'vagalToneIndex'],
    kAnonymityScore: 15,
    fhirResourceType: 'Observation',
    tags: ['Ciitizen Model', 'Long-COVID', 'HRV', 'Autonomic']
  },
  {
    id: 'cohort_cardiopulmonary_audio',
    category: 'cardiopulmonary',
    title: 'Cardiopulmonary Acoustic Waveform Registry',
    sponsorOrInstitution: 'Johns Hopkins Acoustic Medicine Lab',
    ethicalFramework: 'nih_all_of_us',
    description: 'Digital stethoscopic acoustic audio frequency spectrograms for adventitious breath and heart sounds.',
    clinicalObjective: 'Train edge AI models to detect sub-clinical valvular and bronchial murmurs.',
    participantCount: 520,
    dataPointsCount: 310000,
    compensationPerQueryUsd: 20.00,
    participantBenefitDescription: 'Provides automated cardiopulmonary sound spectral quality audit.',
    sampleFields: ['audioSpectrogramBandHz', 'systolicMurmurProbability', 'wheezeCrackleIndex'],
    kAnonymityScore: 9,
    fhirResourceType: 'Observation',
    tags: ['NIH All of Us Model', 'Acoustics', 'Cardiology', 'Pulmonology']
  },
  {
    id: 'cohort_neuro_developmental',
    category: 'neuro_developmental',
    title: 'Neurodiversity & Cognitive Executive State Registry',
    sponsorOrInstitution: 'UCLA Semel Institute for Neuroscience',
    ethicalFramework: 'luna_dna_public_benefit',
    description: 'Longitudinal focus metrics, circadian sleep architecture, and Socratic cognitive load indexes.',
    clinicalObjective: 'Develop non-pharmacological neuroplasticity and behavioral adjunct interventions.',
    participantCount: 840,
    dataPointsCount: 530000,
    compensationPerQueryUsd: 35.00,
    participantBenefitDescription: 'Includes circadian phase optimization recommendations.',
    sampleFields: ['executiveFunctionScore', 'circadianPhaseShiftHrs', 'sleepEfficiencyPercent'],
    kAnonymityScore: 10,
    fhirResourceType: 'Observation',
    tags: ['LunaDNA Model', 'Neuroscience', 'ADHD', 'Sleep']
  }
];

@Injectable({
  providedIn: 'root'
})
export class ResearchConsentService {
  private isBrowser = typeof window !== 'undefined';

  // Available cohorts catalog
  readonly availableCohorts = signal<IResearchCohortListing[]>(INITIAL_COHORTS);

  // Patient's research enrollment & ledger state
  readonly enrollment = signal<IPatientResearchEnrollment>({
    enrolledCohortIds: ['cohort_diabetes_cgm'],
    isHipaaAuthorized: true,
    hipaaAuthorizationSignedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    authorizationSignatureHash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    ethicalCharterAccepted: true,
    returnOfInsightsEnabled: true,
    payoutMethod: 'stripe_connect',
    payoutAccountMasked: 'acct_••••8492 (Stripe Express)',
    lifetimeEarningsUsd: 125.00,
    availableBalanceUsd: 50.00,
    ledger: [
      {
        id: 'div_001',
        timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
        cohortId: 'cohort_diabetes_cgm',
        cohortTitle: 'Type 2 Diabetes & Glycemic Trajectory Registry',
        buyerInstitution: 'Stanford Center for Precision Medicine',
        ethicalFramework: 'nih_all_of_us',
        amountUsd: 25.00,
        patientRevenueSharePercent: 85,
        status: 'paid_out',
        transactionHash: '0x8f2d9c1e4a7b3c2d1e0f',
        researchFindingSummary: 'Identified 14% reduction in nocturnal hypoglycemia using predictive adaptive bolus guidance.'
      },
      {
        id: 'div_002',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        cohortId: 'cohort_diabetes_cgm',
        cohortTitle: 'Type 2 Diabetes & Glycemic Trajectory Registry',
        buyerInstitution: 'Novartis Institute for Biomedical Research',
        ethicalFramework: 'luna_dna_public_benefit',
        amountUsd: 25.00,
        patientRevenueSharePercent: 85,
        status: 'paid_out',
        transactionHash: '0x3a4b5c6d7e8f9a0b1c2d',
        researchFindingSummary: 'Demonstrated circadian rhythm entrainment correlates with improved post-prandial insulin sensitivity.'
      },
      {
        id: 'div_003',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        cohortId: 'cohort_diabetes_cgm',
        cohortTitle: 'Type 2 Diabetes & Glycemic Trajectory Registry',
        buyerInstitution: 'Oxford Health & Post-Viral Consortium',
        ethicalFramework: 'ciitizen_rare_disease',
        amountUsd: 25.00,
        patientRevenueSharePercent: 85,
        status: 'accrued',
        transactionHash: '0x7e8f9a0b1c2d3e4f5a6b',
        researchFindingSummary: 'Correlated autonomic tone fluctuations with glycemic recovery time.'
      },
      {
        id: 'div_004',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        cohortId: 'cohort_diabetes_cgm',
        cohortTitle: 'Type 2 Diabetes & Glycemic Trajectory Registry',
        buyerInstitution: 'Broad Institute of MIT and Harvard',
        ethicalFramework: 'nih_all_of_us',
        amountUsd: 25.00,
        patientRevenueSharePercent: 85,
        status: 'accrued',
        transactionHash: '0x1b2c3d4e5f6a7b8c9d0e',
        researchFindingSummary: 'Published open-access benchmark for continuous metabolic tracking models.'
      }
    ]
  });

  readonly isHipaaAuthorized = computed(() => this.enrollment().isHipaaAuthorized);
  readonly availableBalance = computed(() => this.enrollment().availableBalanceUsd);
  readonly lifetimeEarnings = computed(() => this.enrollment().lifetimeEarningsUsd);
  readonly enrolledCohortCount = computed(() => this.enrollment().enrolledCohortIds.length);
  readonly recentLedger = computed(() => this.enrollment().ledger.slice(0, 10));

  /** Signs HIPAA Research Authorization (§ 164.508) & Ethical Research Charter */
  signHipaaAuthorization(signatureName: string): string {
    const timestamp = new Date().toISOString();
    const signatureHash = `sha256_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    
    this.enrollment.update(current => ({
      ...current,
      isHipaaAuthorized: true,
      ethicalCharterAccepted: true,
      returnOfInsightsEnabled: true,
      hipaaAuthorizationSignedAt: timestamp,
      authorizationSignatureHash: signatureHash
    }));

    return signatureHash;
  }

  /** Toggles enrollment in a disease research cohort */
  toggleCohortEnrollment(cohortId: string): boolean {
    let nowEnrolled = false;
    this.enrollment.update(current => {
      const exists = current.enrolledCohortIds.includes(cohortId);
      const nextIds = exists
        ? current.enrolledCohortIds.filter(id => id !== cohortId)
        : [...current.enrolledCohortIds, cohortId];
      nowEnrolled = !exists;
      return {
        ...current,
        enrolledCohortIds: nextIds
      };
    });
    return nowEnrolled;
  }

  /** Checks if patient is enrolled in a specific cohort */
  isCohortEnrolled(cohortId: string): boolean {
    return this.enrollment().enrolledCohortIds.includes(cohortId);
  }

  /** Revokes HIPAA Authorization and purges active enrollment */
  revokeAuthorizationAndPurge(): void {
    this.enrollment.update(current => ({
      ...current,
      isHipaaAuthorized: false,
      ethicalCharterAccepted: false,
      hipaaAuthorizationSignedAt: null,
      authorizationSignatureHash: null,
      enrolledCohortIds: []
    }));
  }

  /** Simulates a research institution query dividend distribution */
  simulateDividendAccrual(cohortId: string, institutionName: string): IResearchDividendLedgerEntry | null {
    const cohort = this.availableCohorts().find(c => c.id === cohortId);
    if (!cohort || !this.isCohortEnrolled(cohortId) || !this.isHipaaAuthorized()) {
      return null;
    }

    const dividendAmount = cohort.compensationPerQueryUsd;
    const newEntry: IResearchDividendLedgerEntry = {
      id: `div_${Date.now()}`,
      timestamp: new Date().toISOString(),
      cohortId: cohort.id,
      cohortTitle: cohort.title,
      buyerInstitution: institutionName,
      ethicalFramework: cohort.ethicalFramework,
      amountUsd: dividendAmount,
      patientRevenueSharePercent: 85,
      status: 'accrued',
      transactionHash: `0x${Math.random().toString(16).substring(2, 12)}`,
      researchFindingSummary: `Accredited study query by ${institutionName} to accelerate evidence-based treatment discovery.`
    };

    this.enrollment.update(current => ({
      ...current,
      lifetimeEarningsUsd: Number((current.lifetimeEarningsUsd + dividendAmount).toFixed(2)),
      availableBalanceUsd: Number((current.availableBalanceUsd + dividendAmount).toFixed(2)),
      ledger: [newEntry, ...current.ledger]
    }));

    return newEntry;
  }

  /** Requests cash out of available data dividend balance via Stripe Connect */
  requestCashOut(): { success: boolean; amountPaid: number; txId: string } {
    const currentBalance = this.enrollment().availableBalanceUsd;
    if (currentBalance <= 0) {
      return { success: false, amountPaid: 0, txId: '' };
    }

    const txId = `strp_po_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    this.enrollment.update(current => ({
      ...current,
      availableBalanceUsd: 0,
      ledger: current.ledger.map(entry => 
        entry.status === 'accrued' ? { ...entry, status: 'paid_out' as const } : entry
      )
    }));

    return {
      success: true,
      amountPaid: currentBalance,
      txId
    };
  }
}
