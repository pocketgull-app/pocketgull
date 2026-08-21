import { IIndustryVerticalProfile } from './types.js';

export const INDUSTRIAL_VERTICAL_PROFILE: IIndustryVerticalProfile = {
  verticalCode: 'industrial_manufacturing',
  brandName: 'PocketPlant',
  industryName: 'Smart Manufacturing, Industrial Robotics & Predictive Maintenance',
  regulatoryFramework: 'OSHA_ISO9001_REACH',
  systemParadigms: [
    {
      id: 'mechanical_dynamics',
      name: 'Rotary Mechanics, Vibration & Tribology',
      shortName: 'Mechanics',
      lensType: 'primary',
      description: 'Bearing FFT frequency spectrum, oil viscosity degradation, gear tooth meshing harmonics, and rotor imbalance.',
      coreMetrics: ['BearingFaultFactorHertz', 'VibrationVelocityRmsMmS', 'OilParticleCountISO4406'],
      diagnosticOntology: 'ISO 10816 / ISO 13373 (Condition Monitoring & Vibration Diagnostics)'
    },
    {
      id: 'thermal_thermodynamics',
      name: 'Thermal Dissipation, Motor Stator & Cooling Fluids',
      shortName: 'Thermal',
      lensType: 'secondary',
      description: 'Stator winding thermocouple thermography, heat exchanger fouling, coolant flow velocity, and thermal duty cycle.',
      coreMetrics: ['DeltaTemperatureCelsius', 'ThermalResistanceK_W', 'CoolantFlowLitresMin'],
      diagnosticOntology: 'IEC 60034 (Rotating Electrical Machines Thermal Ratings)'
    },
    {
      id: 'materials_chemical_compliance',
      name: 'Material Metallurgy, RoHS & REACH Environmental Compliance',
      shortName: 'Materials / REACH',
      lensType: 'environmental',
      description: 'Substance restriction screening (lead, cadmium, PFAs), corrosion rate (mpy), and galvanic potential.',
      coreMetrics: ['CorrosionRateMpy', 'SubstanceConcentrationPpm', 'RoHSExemptionExpiryDays'],
      diagnosticOntology: 'EU REACH Regulation (EC 1907/2006) / IEC 62321'
    }
  ],
  epistemology: {
    popperianNullHypothesisEnabled: true,
    alphaSignificanceThreshold: 0.05,
    riskOfBiasFramework: 'INDUSTRIAL_RCA',
    evidenceTiers: {
      levelA: 'Destructive Physical Failure Analysis (SEM/EDS) & Calibrated Bench Test',
      levelB: 'Edge SCADA / PLC High-Frequency Time-Series Sensor Streams (10kHz)',
      levelC: 'Mean-Time-Between-Failures (MTBF) Weibull Reliability Model'
    }
  },
  sovereignty: {
    defaultJurisdiction: 'US_OSHA_ISO',
    enforceZeroEgress: true,
    supportedSilos: ['LINE_TIER1_OEM', 'SUPPLIER_PROPRIETARY', 'SAFETY_CRITICAL_SIL3', 'FACTORY_AIRGAP'],
    deterministicSealAlgorithm: 'SHA-256'
  },
  spatialTwin: {
    coordinateSpace: '3D_CARTESIAN_MM',
    defaultLenses: ['MachineFloorCADThermal', 'ToolWearStressOverlay', 'RoboticJointVelocityVector'],
    telemetryStreamFormat: 'OPC_UA'
  },
  sampleUseCases: [
    'CNC Spindle Bearing Acute-to-Chronic Workload Ratio (ACWR) Failure Forecast',
    'RoHS & REACH Hazardous Substance Prohibited Chemical Screener',
    'Factory Floor Edge WASM Acoustic Vibration Anomaly Classifier',
    'Multi-Tier Supplier Intellectual Property Siloed Telemetry Vault'
  ]
};
