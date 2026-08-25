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
    },
    {
      id: 'eminent_domain_land_rights',
      name: 'Eminent Domain, Inverse Condemnation & GIS Land Rights',
      shortName: 'Land Rights & Takings',
      lensType: 'empirical',
      description: 'Fifth Amendment public use analysis, just compensation severance damage appraisal, Penn Central regulatory takings balancing, and 3D geospatial easement overlays.',
      coreMetrics: ['SeveranceDamageRatio', 'EconomicDeprivationPct', 'AppraisalDisparityDelta'],
      diagnosticOntology: 'Uniform Relocation Act (49 CFR Part 24) / Uniform Appraisal Standards for Federal Land Acquisitions (Yellow Book)'
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
    supportedSilos: ['ATTORNEY_CLIENT_PRIVILEGED', 'SEALED_GRAND_JURY', 'ESCROW_TREASURY', 'ARBITRATION_CONFIDENTIAL', 'EMINENT_DOMAIN_CONDEMNATION'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: 'GEOSPATIAL_GPS',
    defaultLenses: [
      'ParcelBoundaryCadastralMap',
      'EasementRightOfWayCorridor',
      'JurisdictionalCourtBoundaries',
      'ContractEntityNetworkGraph',
      'LitigationTimelineTrack'
    ],
    telemetryStreamFormat: 'JSON_TIME_SERIES'
  },
  sampleUseCases: [
    'Real-Time Deposition Ambient Scribing & Fact-Claim Extraction',
    'Eminent Domain Just Compensation & Severance Damage Calculation',
    'Regulatory Taking vs Police Power Penn Central Three-Factor Balancing',
    'Multi-Jurisdictional Cross-Statute GDPR vs CCPA Compliance Crosswalk',
    'Dual-Custody M-of-N Escrow Disbursement Attestation ($500+)',
    'Precedent Citation Shepardizing & Negative History Verification',
    'Uniform Relocation Act (URA) 49 CFR Part 24 Compliance Dossier Scribing'
  ]
};
