import { IIndustryVerticalProfile } from './types.js';

export const CLINICAL_VERTICAL_PROFILE: IIndustryVerticalProfile = {
  verticalCode: 'clinical_health',
  brandName: 'PocketGull',
  industryName: 'Clinical Medicine, Sports Science & Precision Health',
  regulatoryFramework: 'HIPAA_FDA520',
  systemParadigms: [
    {
      id: 'allopathic',
      name: 'Conventional Western Allopathic Medicine',
      shortName: 'Conventional',
      lensType: 'primary',
      description: 'Biochemical pathways, randomized controlled trials, pharmacokinetics, and standard-of-care clinical guidelines.',
      coreMetrics: ['HbA1c', 'eGFR', 'VO2Max', 'HeartRateVariability', 'ACWR'],
      diagnosticOntology: 'ICD-10-CM / SNOMED-CT / LOINC'
    },
    {
      id: 'ayurvedic',
      name: 'Classical Vedic Ayurvedic Medicine',
      shortName: 'Ayurveda',
      lensType: 'secondary',
      description: 'Tridosha dynamic equilibrium (Vata, Pitta, Kapha), Agni metabolic fire, and botanical adaptogens.',
      coreMetrics: ['DoshaBalanceRatio', 'AgniScore', 'DhatuTissueTonicity'],
      diagnosticOntology: 'AYUSH Traditional Medicine Morbidity Codes (NAMASTE)'
    },
    {
      id: 'tcm',
      name: 'Traditional Chinese Medicine & Acupuncture',
      shortName: 'TCM',
      lensType: 'environmental',
      description: 'Zang-Fu organ meridian networks, Qi and Blood dynamic circulation, and Yin-Yang balance.',
      coreMetrics: ['MeridianImpedance', 'PulseRadialTension', 'TongueCoatHydration'],
      diagnosticOntology: 'WHO International Classification of Traditional Medicine (ICTM)'
    }
  ],
  epistemology: {
    popperianNullHypothesisEnabled: true,
    alphaSignificanceThreshold: 0.05,
    riskOfBiasFramework: 'RoB_2',
    evidenceTiers: {
      levelA: 'Double-Blind Randomized Controlled Trials (RCTs) & Cochrane Meta-Analyses',
      levelB: 'Prospective Longitudinal Cohorts & Real-World Registry Telemetry',
      levelC: 'Mechanistic Plausibility & Peer Expert Consensus'
    }
  },
  sovereignty: {
    defaultJurisdiction: 'US_NCAA',
    enforceZeroEgress: true,
    supportedSilos: ['D1_ATHLETE', 'D2_SCHOLAR', 'D3_CAMPUS', 'R1_ACADEMIC', 'IRB_GEOFENCE'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: 'ANATOMICAL_BODY',
    defaultLenses: ['SkeletalBiomechanics', 'MeridianChannels', 'OrganVascularTree'],
    telemetryStreamFormat: 'FHIR_OBSERVATION'
  },
  sampleUseCases: [
    'SCAT6 Concussion Return-to-Play Graduated Progression',
    'Tri-Paradigm Botanical-Drug Interaction Screen',
    'NCAA Acute-to-Chronic Workload Ratio (ACWR) Injury Prevention',
    'Coast-to-Coast Flight Circadian Jetlag Optimization'
  ]
};
