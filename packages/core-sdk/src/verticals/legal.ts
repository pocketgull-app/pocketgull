import { IIndustryVerticalProfile } from './types.js';

export const LEGAL_VERTICAL_PROFILE: IIndustryVerticalProfile = {
  verticalCode: 'legal_compliance',
  brandName: 'LexGull',
  industryName: 'Legal Tech, Multi-Jurisdiction Compliance & Arbitration',
  regulatoryFramework: 'ABA_GDPR_EU_CIVIL',
  systemParadigms: [
    {
      id: 'common_law_precedent',
      name: 'Anglo-American Common Law & Stare Decisis',
      shortName: 'Common Law',
      lensType: 'primary',
      description: 'Binding precedent, statutory interpretation, circuit court splits, and procedural rules of evidence.',
      coreMetrics: ['ShepardNegativeTreatmentScore', 'CircuitSplitPlausibility', 'StatuteOfLimitationsDaysRemaining'],
      diagnosticOntology: 'Bluebook Uniform System of Citation / Restatement of the Law'
    },
    {
      id: 'civil_law_statutory',
      name: 'European & International Civil Statutory Codes',
      shortName: 'Civil Code',
      lensType: 'secondary',
      description: 'Inquisitorial statutory codes, EU GDPR fundamental rights, UNCITRAL international arbitration conventions.',
      coreMetrics: ['StatutoryArticleAlignment', 'ProportionalityIndex', 'CrossBorderTransferCompliancePct'],
      diagnosticOntology: 'EUR-Lex CELEX Database / UNCITRAL Model Law'
    },
    {
      id: 'corporate_governance_fiduciary',
      name: 'Corporate Fiduciary & Multi-Party Escrow Custody',
      shortName: 'Fiduciary Duty',
      lensType: 'environmental',
      description: 'Business judgment rule, anti-money laundering (AML/BSA), dual-custody treasury verification, and conflict-of-interest screening.',
      coreMetrics: ['DualCustodySignatureCompleteness', 'AMLDisbursementRiskScore', 'SanctionedEntityMatchDist'],
      diagnosticOntology: 'Delaware General Corporation Law (DGCL) / FinCEN SAR Taxonomy'
    }
  ],
  epistemology: {
    popperianNullHypothesisEnabled: true,
    alphaSignificanceThreshold: 0.05,
    riskOfBiasFramework: 'LEGAL_SHEPARD',
    evidenceTiers: {
      levelA: 'En Banc Supreme / Constitutional Court Binding Ruling & Codified Statute',
      levelB: 'Appellate Precedent / High Court Persuasive Authority',
      levelC: 'Law Review Scholarship / Restatement Commentary / Expert Witness Declaration'
    }
  },
  sovereignty: {
    defaultJurisdiction: 'US_FEDERAL_COURT',
    enforceZeroEgress: true,
    supportedSilos: ['ATTORNEY_CLIENT_PRIVILEGED', 'SEALED_GRAND_JURY', 'ESCROW_TREASURY', 'ARBITRATION_CONFIDENTIAL'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: 'GEOSPATIAL_GPS',
    defaultLenses: ['JurisdictionalCourtBoundaries', 'ContractEntityNetworkGraph', 'LitigationTimelineTrack'],
    telemetryStreamFormat: 'JSON_TIME_SERIES'
  },
  sampleUseCases: [
    'Real-Time Deposition Ambient Scribing & Fact-Claim Extraction',
    'Multi-Jurisdictional Cross-Statute GDPR vs CCPA Compliance Crosswalk',
    'Dual-Custody M-of-N Escrow Disbursement Attestation ($500+)',
    'Precedent Citation Shepardizing & Negative History Verification'
  ]
};
