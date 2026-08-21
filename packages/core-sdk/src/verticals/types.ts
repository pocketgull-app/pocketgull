/**
 * Universal Industry Vertical & Multi-Lens Engine Types
 * @pocketgull/core-sdk
 */

export type IndustryVerticalCode = 
  | 'clinical_health'
  | 'aerospace_flight'
  | 'legal_compliance'
  | 'industrial_manufacturing'
  | 'agritech_veterinary';

export type RegulatoryFrameworkCode =
  | 'HIPAA_FDA520'
  | 'FAA_PART121_NASA'
  | 'ABA_GDPR_EU_CIVIL'
  | 'OSHA_ISO9001_REACH'
  | 'USDA_APHIS_WOAH';

export interface ISystemParadigmDefinition {
  id: string;
  name: string;
  shortName: string;
  lensType: 'primary' | 'secondary' | 'environmental' | 'empirical';
  description: string;
  coreMetrics: string[];
  diagnosticOntology: string;
}

export interface IEpistemologyConfig {
  popperianNullHypothesisEnabled: boolean;
  alphaSignificanceThreshold: number; // e.g. 0.05
  riskOfBiasFramework: 'RoB_2' | 'AEROSPACE_FMEA' | 'LEGAL_SHEPARD' | 'INDUSTRIAL_RCA';
  evidenceTiers: {
    levelA: string; // Highest empirical (RCT, Certified Avionics Test, Supreme Court Binding)
    levelB: string; // Cohort / Telemetry Observational
    levelC: string; // Expert Consensus / Mechanistic Plausibility
  };
}

export interface ISovereignPartitionConfig {
  defaultJurisdiction: string;
  enforceZeroEgress: boolean;
  supportedSilos: string[];
  deterministicSealAlgorithm: 'SHA-256' | 'CRC32_MANISSA';
}

export interface ISpatialTwinConfig {
  coordinateSpace: '3D_CARTESIAN_MM' | 'ANATOMICAL_BODY' | 'AIRFRAME_CAD' | 'GEOSPATIAL_GPS';
  defaultLenses: string[];
  telemetryStreamFormat: 'JSON_TIME_SERIES' | 'FHIR_OBSERVATION' | 'ARINC_429' | 'OPC_UA';
}

export interface IIndustryVerticalProfile {
  verticalCode: IndustryVerticalCode;
  brandName: string;
  industryName: string;
  regulatoryFramework: RegulatoryFrameworkCode;
  systemParadigms: ISystemParadigmDefinition[];
  epistemology: IEpistemologyConfig;
  sovereignty: ISovereignPartitionConfig;
  spatialTwin: ISpatialTwinConfig;
  sampleUseCases: string[];
}
