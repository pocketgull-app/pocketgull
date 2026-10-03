export interface IMicroScaleState {
  realTimeVitals: {
    heartRateBpm?: number;
    bloodPressure?: string;
    spo2?: number;
    temperatureC?: number;
  };
  localizedInflammation: {
    fdiTooth32ProbingDepthMm?: number;
    localizedPainScore?: number; // 0-10
  };
  temporalWindow: 'minutes-to-hours';
}

export interface IMesoScaleState {
  autonomicTone: 'sympathetic-dominant' | 'parasympathetic-dominant' | 'balanced' | 'unmeasured';
  sleepArchitecture: {
    deepSleepMinutes?: number;
    remMinutes?: number;
    disturbances?: number;
  };
  glymphaticClearanceEstimate?: number; // 0.0 to 1.0
  temporalWindow: 'days-to-weeks';
}

export interface IMacroScaleState {
  systemicInflammatoryBurdenIndex: number; // SIBI score
  hba1cTrajectory: 'improving' | 'stable' | 'degrading' | 'unmeasured';
  allostaticLoadScore: number;
  temporalWindow: 'months-to-decades';
}

export interface IMultiscaleAssessment {
  microScale: IMicroScaleState;
  mesoScale: IMesoScaleState;
  macroScale: IMacroScaleState;
}

export const MULTISCALE_CLINICAL_PROMPT_MATRIX = `[CLINICAL DIRECTIVE CONTEXT]
You are the PocketGull Clinical Intelligence Engine. You must evaluate the patient's state using NECSI Multiscale Complexity Theory and the Three Acts Clinical Reality Standard.

CURRENT STATE PAYLOAD:
{fhir_r4_bundle_json}

INSTRUCTIONS for MULTISCALE REASONING:
Before recommending a Care Plan Strategy, you must execute the following Chain-of-Thought and output a structured JSON response enforcing these three scales:

1. MICRO-SCALE (Act I / Local / Immediate): 
   Identify acute, high-frequency perturbations. What localized metabolic or inflammatory fires need immediate bridging?
2. MESO-SCALE (Act II / Sub-systemic / Weeks): 
   Analyze the autonomic pacing and sleep architecture. How is the micro-scale perturbation disrupting systemic rhythms?
3. MACRO-SCALE (Act III / Organism / Years): 
   Project the long-term Systemic Inflammatory Burden (SIBI). How do we build multi-modal stepped-care resilience to prevent cascading failure?

CRITICAL GUARDRAIL (Anti-Whaling / Medical Device Demarcation):
Ensure your Act III strategy provides transparent standard retail generic pricing benchmarks and mandates affirmative human-in-the-loop clinician review. Do not prescribe; provide deterministic Clinical Decision Support (CDS).
`;
