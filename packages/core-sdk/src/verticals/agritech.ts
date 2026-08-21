import { IIndustryVerticalProfile } from './types.js';

export const AGRITECH_VERTICAL_PROFILE: IIndustryVerticalProfile = {
  verticalCode: 'agritech_veterinary',
  brandName: 'PocketAgri',
  industryName: 'Veterinary Medicine, Agritech & Soil Microbiome Intelligence',
  regulatoryFramework: 'USDA_APHIS_WOAH',
  systemParadigms: [
    {
      id: 'veterinary_clinical',
      name: 'Equine, Canine & Bovine Veterinary Medicine',
      shortName: 'Veterinary',
      lensType: 'primary',
      description: 'Species-specific pharmacokinetics, equine lameness gait analysis, and zoonotic pathology surveillance.',
      coreMetrics: ['LamenessGaitAsymmetryPct', 'EquineHeartRateRecoveryBpm', 'SerumCreatinineKinaseU_L'],
      diagnosticOntology: 'Veterinary Terminology Services (VeNom Coding Group) / SNOMED Veterinary'
    },
    {
      id: 'soil_regenerative_biome',
      name: 'Soil Microbiome, Mycology & Crop Rhizosphere Health',
      shortName: 'Soil Biome',
      lensType: 'secondary',
      description: 'Fungi-to-bacteria ratio, soil organic matter (SOM), nitrogen fixation flux, and mycorrhizal symbiosis.',
      coreMetrics: ['FungiBacteriaRatio', 'SoilOrganicCarbonPct', 'RhizospherePH'],
      diagnosticOntology: 'Soil Science Society of America (SSSA) / Plant Ontology (PO)'
    },
    {
      id: 'botanical_pest_defense',
      name: 'Botanical Defense, Allelopathy & Natural Biological Controls',
      shortName: 'Botanical Defense',
      lensType: 'environmental',
      description: 'Endogenous plant terpene synthesis, beneficial predator insect lures, and non-synthetic antifungal bio-fungicides.',
      coreMetrics: ['TerpeneEmissionIndex', 'PredatorPreyRatio', 'SporeColonyCountCfu'],
      diagnosticOntology: 'EPPO Global Database (Plant Protection Organization)'
    }
  ],
  epistemology: {
    popperianNullHypothesisEnabled: true,
    alphaSignificanceThreshold: 0.05,
    riskOfBiasFramework: 'RoB_2',
    evidenceTiers: {
      levelA: 'Multi-Season Replicated Field Randomized Trial & Peer-Reviewed Veterinary Trial',
      levelB: 'Remote Sensing Multispectral Drone / Field Telemetry In-Season Data',
      levelC: 'Botanical Allelopathic Plausibility & Master Agronomist Consensus'
    }
  },
  sovereignty: {
    defaultJurisdiction: 'US_USDA_FIELD',
    enforceZeroEgress: true,
    supportedSilos: ['FIELD_REMOTE_OFFLINE', 'BREEDER_GENOMICS_PRIVATE', 'QUARANTINE_ZOONOTIC', 'ORGANIC_CERT_AUDIT'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: 'GEOSPATIAL_GPS',
    defaultLenses: ['FarmlandMultispectralNDVI', 'LivestockGaitTracking', 'SoilMoistureTopographyMap'],
    telemetryStreamFormat: 'JSON_TIME_SERIES'
  },
  sampleUseCases: [
    'Equine Sport Performance Acute-to-Chronic Workload Ratio (ACWR) Tendon Strain Screen',
    'Off-Grid Offline Edge WASM Crop Disease Diagnosis via Leaf Image Ingestion',
    'Pedigree Equine & Canine Phenopacket Genetic Trait Mapping',
    'Non-Synthetic Tri-Paradigm Soil Biome & Botanical Pest Control Prescription'
  ]
};
