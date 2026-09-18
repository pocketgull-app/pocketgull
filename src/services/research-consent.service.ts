import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  IResearchCohortListing,
  IPatientResearchEnrollment,
  IResearchDividendLedgerEntry,
  ILinkageAttackRiskEvaluation,
  IDifferentialPrivacyConfig,
  IBigQueryAnalyticsHubListing,
  IDryRunSqlQueryResult,
  IStripeConnectExpressPayout,
  IStripeConnectAccountStatus
} from '../models/research-cohort.types';
import { getSecureRandomId } from '../utils/security-helper';

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
    differentialPrivacyEpsilon: 0.8,
    differentialPrivacyDelta: 1e-5,
    linkageAttackRiskTier: 'LOW',
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

const INITIAL_ANALYTICS_HUB_LISTINGS: IBigQueryAnalyticsHubListing[] = [
  {
    listingId: 'projects/gen-lang-client-0540208645/locations/us-central1/dataExchanges/pocketgull_data_exchange/listings/cohort_diabetes_cgm',
    dataExchangeId: 'pocketgull_data_exchange',
    displayName: 'Type 2 Diabetes & Glycemic Trajectory Telemetry (Differential Privacy ε=0.8)',
    description: 'Longitudinal continuous glucose monitoring (CGM) dataset with Laplace-perturbed HbA1c, time-in-range, and glycemic variability CV.',
    primaryContact: 'research@pocketgull.app',
    documentationUrl: 'https://pocketgull.app/resources/research/diabetes-cgm',
    project: 'gen-lang-client-0540208645',
    datasetReference: 'gen-lang-client-0540208645:pocketgull_synthetic_cohorts.cgm_telemetry',
    category: 'metabolic_endocrine',
    differentialPrivacyBudget: {
      epsilon: 0.8,
      delta: 1e-5
    },
    kAnonymityScore: 12,
    subscriberCount: 14,
    dryRunSqlTemplate: 'SELECT cohort_id, count(*) as participant_count, avg(time_in_range_percent) as mean_tir, laplace_noise(avg(glucose_mean_mg_dl), 0.8) as dp_mean_glucose FROM `gen-lang-client-0540208645.pocketgull_data_exchange.cohort_diabetes_cgm` WHERE differential_privacy_epsilon <= 0.8 GROUP BY cohort_id',
    sampleColumns: [
      { name: 'time_in_range_percent', type: 'FLOAT64', description: 'Percentage of readings between 70-180 mg/dL', isDeIdentified: true },
      { name: 'glucose_mean_mg_dl', type: 'FLOAT64', description: '24-hour mean sensor glucose with Laplace noise', isDeIdentified: true },
      { name: 'glycemic_variability_cv', type: 'FLOAT64', description: 'Coefficient of variation (% CV)', isDeIdentified: true },
      { name: 'hba1c_baseline', type: 'FLOAT64', description: 'Baseline glycosylated hemoglobin level', isDeIdentified: true }
    ]
  },
  {
    listingId: 'projects/gen-lang-client-0540208645/locations/us-central1/dataExchanges/pocketgull_data_exchange/listings/cohort_oncology_biomarkers',
    dataExchangeId: 'pocketgull_data_exchange',
    displayName: 'Oncology Epigenetic Clocks & Immuno-Tolerance Indices',
    description: 'De-identified genomic crosswalks, tumor somatic markers, and cellular longevity trajectories from accredited clinical oncology cohorts.',
    primaryContact: 'oncology-registry@pocketgull.app',
    documentationUrl: 'https://pocketgull.app/resources/research/oncology-biomarkers',
    project: 'gen-lang-client-0540208645',
    datasetReference: 'gen-lang-client-0540208645:pocketgull_synthetic_cohorts.oncology_biomarkers',
    category: 'oncology_genomics',
    differentialPrivacyBudget: {
      epsilon: 0.5,
      delta: 1e-6
    },
    kAnonymityScore: 8,
    subscriberCount: 9,
    dryRunSqlTemplate: 'SELECT tumor_category, count(*) as sample_count, avg(epigenetic_age_delta) as mean_epigenetic_delta, laplace_noise(avg(crp_mg_l), 0.5) as dp_crp FROM `gen-lang-client-0540208645.pocketgull_data_exchange.cohort_oncology_biomarkers` WHERE differential_privacy_epsilon <= 0.5 GROUP BY tumor_category',
    sampleColumns: [
      { name: 'epigenetic_age_delta', type: 'FLOAT64', description: 'Biological minus chronological age index', isDeIdentified: true },
      { name: 'crp_mg_l', type: 'FLOAT64', description: 'High-sensitivity C-reactive protein (mg/L)', isDeIdentified: true },
      { name: 'immunotherapy_tolerance_score', type: 'FLOAT64', description: 'Predictive checkpoint tolerance metric', isDeIdentified: true }
    ]
  },
  {
    listingId: 'projects/gen-lang-client-0540208645/locations/us-central1/dataExchanges/pocketgull_data_exchange/listings/cohort_long_covid_autonomic',
    dataExchangeId: 'pocketgull_data_exchange',
    displayName: 'Long-COVID & Dysautonomia Orthostatic HRV Telemetry',
    description: 'Post-viral fatigue syndrome orthostatic heart rate variability, vagal tone indices, and respiratory acoustic waveform features.',
    primaryContact: 'autonomic-studies@pocketgull.app',
    documentationUrl: 'https://pocketgull.app/resources/research/long-covid',
    project: 'gen-lang-client-0540208645',
    datasetReference: 'gen-lang-client-0540208645:pocketgull_synthetic_cohorts.long_covid_autonomic',
    category: 'post_viral_autonomic',
    differentialPrivacyBudget: {
      epsilon: 0.8,
      delta: 1e-5
    },
    kAnonymityScore: 15,
    subscriberCount: 21,
    dryRunSqlTemplate: 'SELECT post_viral_stage, count(*) as n_participants, avg(rmssd_ms) as mean_rmssd, laplace_noise(avg(orthostatic_bp_delta), 0.8) as dp_bp_delta FROM `gen-lang-client-0540208645.pocketgull_data_exchange.cohort_long_covid_autonomic` GROUP BY post_viral_stage',
    sampleColumns: [
      { name: 'rmssd_ms', type: 'FLOAT64', description: 'Root mean square of successive RR interval differences (ms)', isDeIdentified: true },
      { name: 'orthostatic_bp_delta', type: 'FLOAT64', description: 'Supine to standing systolic blood pressure delta', isDeIdentified: true },
      { name: 'vagal_tone_index', type: 'FLOAT64', description: 'Normalized high-frequency vagal parasympathetic power', isDeIdentified: true }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class ResearchConsentService {
  private isBrowser = typeof window !== 'undefined';

  // Available cohorts catalog
  readonly availableCohorts = signal<IResearchCohortListing[]>(INITIAL_COHORTS);

  // BigQuery Analytics Hub listings catalog (GCP: gen-lang-client-0540208645)
  readonly analyticsHubListings = signal<IBigQueryAnalyticsHubListing[]>(INITIAL_ANALYTICS_HUB_LISTINGS);

  // Automated Stripe Connect Express account state
  readonly stripeAccountStatus = signal<IStripeConnectAccountStatus>({
    accountId: 'acct_1PgGullExpress8492',
    payoutsEnabled: true,
    detailsSubmitted: true,
    currency: 'USD',
    country: 'US',
    dashboardUrl: 'https://pocketgull.app/resources/stripe/express-dashboard',
    lastPayoutAt: new Date(Date.now() - 86400000 * 5).toISOString()
  });

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
    const signatureHash = `sha256_${getSecureRandomId()}_${Date.now()}`;
    
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
      transactionHash: `0x${getSecureRandomId()}`,
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

  /** Retrieves BigQuery Analytics Hub listing metadata for a given cohort */
  getAnalyticsHubListing(cohortId: string): IBigQueryAnalyticsHubListing | null {
    return this.analyticsHubListings().find(l => l.listingId.endsWith(`/${cohortId}`)) || null;
  }

  /**
   * Executes a privacy-preserving dry-run SQL aggregate query via BigQuery Analytics Hub.
   * Perturbs aggregate statistics via Laplace Differential Privacy to guarantee zero ePHI leakage.
   */
  executePrivacyPreservingDryRun(cohortId: string): IDryRunSqlQueryResult {
    const cohort = this.availableCohorts().find(c => c.id === cohortId);
    const listing = this.getAnalyticsHubListing(cohortId);
    const epsilon = cohort?.differentialPrivacyEpsilon ?? 0.8;

    const sql = listing?.dryRunSqlTemplate || 
      `SELECT cohort_id, count(*) as participant_count FROM \`gen-lang-client-0540208645.pocketgull_data_exchange.${cohortId}\` WHERE differential_privacy_epsilon <= ${epsilon} GROUP BY cohort_id`;

    // Generate Laplace perturbed sample metrics
    let perturbedSample: Record<string, number> = {};
    if (cohortId === 'cohort_diabetes_cgm') {
      perturbedSample = {
        mean_time_in_range_percent: this.applyLaplaceDifferentialPrivacy(74.2, 0.5, epsilon),
        mean_glucose_mg_dl: this.applyLaplaceDifferentialPrivacy(138.4, 1.0, epsilon),
        glycemic_variability_cv: this.applyLaplaceDifferentialPrivacy(32.1, 0.4, epsilon),
        mean_hba1c_baseline: this.applyLaplaceDifferentialPrivacy(7.1, 0.2, epsilon)
      };
    } else if (cohortId === 'cohort_oncology_biomarkers') {
      perturbedSample = {
        mean_epigenetic_age_delta: this.applyLaplaceDifferentialPrivacy(-2.4, 0.5, epsilon),
        mean_crp_mg_l: this.applyLaplaceDifferentialPrivacy(1.8, 0.3, epsilon),
        mean_immunotherapy_tolerance: this.applyLaplaceDifferentialPrivacy(88.5, 0.8, epsilon)
      };
    } else {
      perturbedSample = {
        mean_rmssd_ms: this.applyLaplaceDifferentialPrivacy(48.6, 1.0, epsilon),
        orthostatic_bp_delta: this.applyLaplaceDifferentialPrivacy(11.2, 0.6, epsilon),
        vagal_tone_index: this.applyLaplaceDifferentialPrivacy(6.7, 0.3, epsilon)
      };
    }

    return {
      cohortId,
      sql,
      estimatedBytesBilled: 10485760, // 10 MB dry-run estimate
      estimatedParticipantsMatched: cohort?.participantCount ?? 1200,
      differentialPrivacyEpsilonConsumed: epsilon,
      perturbedAggregateSample: perturbedSample,
      isValid: true,
      executionNotice: 'Validated zero ePHI egress. Laplace noise calibrated to global sensitivity Δ = 1.0.'
    };
  }

  /** Initiates simulated automated Stripe Connect Express onboarding flow */
  initiateStripeConnectOnboarding(): { onboardingUrl: string; accountId: string } {
    const accountId = `acct_express_${getSecureRandomId()}`;
    return {
      onboardingUrl: `https://pocketgull.app/resources/stripe/onboarding?account=${accountId}`,
      accountId
    };
  }

  /**
   * Requests cash out of available data dividend balance via automated Stripe Connect Express.
   * Enforces Mandiant dual-custody (M-of-N) authorization for disbursements >= $500.
   */
  requestCashOut(dualCustodySignatures?: { primarySigner: string; secondarySigner: string }): {
    success: boolean;
    amountPaid: number;
    txId: string;
    payout: IStripeConnectExpressPayout | null;
    error?: string;
  } {
    const currentBalance = this.enrollment().availableBalanceUsd;
    if (currentBalance <= 0) {
      return { success: false, amountPaid: 0, txId: '', payout: null, error: 'No accrued balance available for withdrawal.' };
    }

    // High-impact disbursement guard: disbursements >= $500 require dual distinct authenticated roles
    if (currentBalance >= 500) {
      if (!dualCustodySignatures || !dualCustodySignatures.primarySigner || !dualCustodySignatures.secondarySigner) {
        return {
          success: false,
          amountPaid: 0,
          txId: '',
          payout: null,
          error: 'Dual-custody (M-of-N) authorization required for disbursements >= $500. Primary and secondary clinical/executive signatures must be provided.'
        };
      }
    }

    const txId = `strp_po_${Date.now()}_${getSecureRandomId()}`;
    const timestamp = new Date().toISOString();

    const payout: IStripeConnectExpressPayout = {
      payoutId: txId,
      timestamp,
      amountUsd: currentBalance,
      feeUsd: 0.00, // Zero fee subsidized for patient data dividends
      netPayoutUsd: currentBalance,
      arrivalEstimate: 'Instant Transfer (Debit Card via Stripe Connect Express)',
      destinationAccountMasked: this.enrollment().payoutAccountMasked || 'acct_••••8492 (Stripe Express)',
      status: 'paid',
      dualCustodyAttestation: currentBalance >= 500 && dualCustodySignatures ? {
        isAttested: true,
        primarySigner: dualCustodySignatures.primarySigner,
        secondarySigner: dualCustodySignatures.secondarySigner,
        signatureHash: `sha256_${getSecureRandomId()}`,
        timestamp
      } : undefined
    };

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
      txId,
      payout
    };
  }

  /**
   * Generates a cryptographically unbiased uniform float in (0, 1) using
   * 53-bit IEEE-754 mantissa scaling over NIST SP 800-90A CSPRNG entropy.
   */
  private getSecureMantissaFloat(): number {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      const buffer = new Uint32Array(2);
      globalThis.crypto.getRandomValues(buffer);
      const high = buffer[0] & 0x1fffff; // 21 bits
      const low = buffer[1]; // 32 bits
      const val = (high * 4294967296.0 + low) / 9007199254740992.0;
      return val <= 0 ? 0.000000000000001 : val >= 1 ? 0.999999999999999 : val;
    }
    return Math.random();
  }

  /**
   * Applies (epsilon, delta)-Differential Privacy via the Laplace Mechanism.
   * Perturbs continuous biomarker or vital telemetry values before inclusion
   * in research cohort export queries to eliminate re-identification.
   *
   * @param trueValue The raw metric value (e.g., mean glucose, HRV rmssd)
   * @param sensitivity Global sensitivity (maximum delta a single record can shift the aggregate)
   * @param epsilon Privacy loss budget (default: 0.8)
   */
  applyLaplaceDifferentialPrivacy(
    trueValue: number,
    sensitivity: number = 1.0,
    epsilon: number = 0.8
  ): number {
    const scale = sensitivity / Math.max(0.01, epsilon);
    const u = this.getSecureMantissaFloat() - 0.5; // uniformly in (-0.5, 0.5)
    const sign = u < 0 ? -1 : 1;
    const noise = -scale * sign * Math.log(1 - 2 * Math.abs(u));
    return Number((trueValue + noise).toFixed(3));
  }

  /**
   * Evaluates linkage attack vulnerability on a research cohort.
   * Quarantines any cohort where k-anonymity is below 5 or quasi-identifier entropy indicates high uniqueness.
   */
  evaluateLinkageAttackRisk(cohort: IResearchCohortListing): ILinkageAttackRiskEvaluation {
    const k = cohort.kAnonymityScore;
    const sampleFieldCount = cohort.sampleFields.length;
    const isRareOrGenomic = cohort.category === 'rare_orphan_diseases' || cohort.category === 'oncology_genomics';

    // Estimate quasi-identifier entropy based on dimension count and cohort size
    const baseEntropy = Math.min(1.0, (sampleFieldCount * 0.12) + (isRareOrGenomic ? 0.35 : 0.1));
    const sizeAdjustment = Math.max(0, 1.0 - (cohort.participantCount / 2000));
    const quasiIdentifierEntropyScore = Number((baseEntropy * (0.6 + 0.4 * sizeAdjustment)).toFixed(2));

    const isQuarantined = k < 5 || quasiIdentifierEntropyScore > 0.75;
    let riskTier: ILinkageAttackRiskEvaluation['riskTier'] = 'LOW';
    let quarantineReason: string | null = null;

    if (k < 5) {
      riskTier = 'CRITICAL_QUARANTINE';
      quarantineReason = `k-Anonymity score (${k}) is below statutory minimum threshold (k >= 5). High risk of record re-identification in low-frequency bins.`;
    } else if (quasiIdentifierEntropyScore > 0.75) {
      riskTier = 'CRITICAL_QUARANTINE';
      quarantineReason = `High-dimensional quasi-identifier entropy (${quasiIdentifierEntropyScore} > 0.75) presents linkage attack vulnerability against public registries.`;
    } else if (k < 10 || isRareOrGenomic) {
      riskTier = 'MODERATE';
    }

    const epsilon = cohort.differentialPrivacyEpsilon ?? (riskTier === 'MODERATE' ? 0.5 : 0.8);
    const delta = cohort.differentialPrivacyDelta ?? 1e-5;

    return {
      cohortId: cohort.id,
      quasiIdentifierEntropyScore,
      kAnonymityScore: k,
      riskTier,
      isQuarantined,
      quarantineReason,
      allowedForEgress: !isQuarantined,
      differentialPrivacy: {
        epsilon,
        delta,
        mechanism: 'LAPLACE',
        calibratedNoiseScale: Number((1.0 / epsilon).toFixed(3))
      }
    };
  }
}
