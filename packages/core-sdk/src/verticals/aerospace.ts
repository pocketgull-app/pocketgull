import { IIndustryVerticalProfile } from './types.js';

export const AEROSPACE_VERTICAL_PROFILE: IIndustryVerticalProfile = {
  verticalCode: 'aerospace_flight',
  brandName: 'PocketAero',
  industryName: 'Aerospace, Flight Readiness & Aviation Medicine',
  regulatoryFramework: 'FAA_PART121_NASA',
  systemParadigms: [
    {
      id: 'avionics_systems',
      name: 'Avionics, Flight Control & Electrical Telemetry',
      shortName: 'Avionics',
      lensType: 'primary',
      description: 'Fly-by-wire buses, pitot-static sensors, inertial measurement units (IMUs), and engine FADEC telemetry.',
      coreMetrics: ['BusLatencyMs', 'SensorSignalToNoiseRatio', 'ActuatorHysteresisPct'],
      diagnosticOntology: 'ATA 100 Chapter 22/34 (Flight Controls & Navigation)'
    },
    {
      id: 'human_factors_crew',
      name: 'Flight Crew Biophysical Fatigue & Hypoxia Readiness',
      shortName: 'Crew Health',
      lensType: 'secondary',
      description: 'Pilot circadian duty cycles, cockpit oxygen partial pressure, micro-sleep saccade tracking, and G-LOC resistance.',
      coreMetrics: ['CircadianDesynchronosisIndex', 'SpO2CockpitAltitude', 'PVTReactionTimeMs'],
      diagnosticOntology: 'FAA Part 67 Medical Standards / NASA Standard-3001'
    },
    {
      id: 'structural_aerodynamics',
      name: 'Airframe Structural Stress & Environmental Dynamics',
      shortName: 'Airframe',
      lensType: 'environmental',
      description: 'Wing spar strain gauge load, clear-air turbulence encounter, ice accretion, and cyclic cabin pressurization fatigue.',
      coreMetrics: ['GForceExcursionPeak', 'SparDeflectionMm', 'SkinVibrationRms'],
      diagnosticOntology: 'ATA 100 Chapter 51/57 (Structures & Wings)'
    }
  ],
  epistemology: {
    popperianNullHypothesisEnabled: true,
    alphaSignificanceThreshold: 0.01, // Stricter 99% confidence for aviation safety
    riskOfBiasFramework: 'AEROSPACE_FMEA',
    evidenceTiers: {
      levelA: 'FAA/EASA Type-Certified Rig Test & Full-Scale Fatigue Testing',
      levelB: 'Fleet Flight Data Recorder (FDR / QAR) Real-Time Telemetry',
      levelC: 'High-Fidelity Computational Fluid Dynamics (CFD) / FEA Simulation'
    }
  },
  sovereignty: {
    defaultJurisdiction: 'US_FAA_ITAR',
    enforceZeroEgress: true,
    supportedSilos: ['COMMERCIAL_FLEET', 'DEFENSE_ITAR', 'EXPERIMENTAL_FLIGHT', 'AIR_AMBULANCE'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: 'AIRFRAME_CAD',
    defaultLenses: ['AirframeStressHeatmap', 'AvionicsWiringLoom', 'PressurizedCockpitZone'],
    telemetryStreamFormat: 'ARINC_429'
  },
  sampleUseCases: [
    'Trans-Meridian Flight Crew Circadian Rest & Fatigue Mitigation Plan',
    'Cockpit High-Altitude Rapid Decompression Hypoxia Scribing',
    'Airframe Wing-Root Cyclic Fatigue ACWR Predictive Inspection',
    'Zero-Cloud-Egress In-Cockpit Flight Readiness Diagnostic Assistant'
  ]
};
