import { Injectable, signal, computed, inject } from '@angular/core';
import { AnalysisLens } from './clinical-intelligence.service';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface IExpertSubnet {
  id: string;
  name: string;
  lenses: AnalysisLens[];
  requiresSidecar: boolean;
  requiresAudioStream: boolean;
  requires3DShader: boolean;
  estimatedFlopsGiga: number;
}

export interface IGeminiThinkingConfig {
  /** Token budget for internal reasoning steps (-1 = dynamic auto, 0 = off, 1024-16384 for deep synthesis) */
  thinkingBudget: number;
  /** Whether to stream or include thought process in generation output */
  includeThoughts: boolean;
  /** Human-readable tier name for clinical telemetry HUDs */
  reasoningTier: 'Fast (Low Latency)' | 'Standard (Balanced)' | 'Deep Clinical Synthesis (High Acuity)';
}

export interface IPatientTriageEvaluation {
  patient: IPatient;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  esiLabel: string;
  acuityTier: 'STAT Emergency' | 'Emergent Sentinel' | 'Urgent Multi-System' | 'Less Urgent' | 'Non-Urgent Maintenance';
  news2Score: number;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  vitalsSummary: {
    bp: string;
    hr: string;
    spO2: string;
    temp: string;
    hasCriticalOutlier: boolean;
    criticalOutliers: string[];
  };
  predictedTopExperts: Array<{
    id: string;
    name: string;
    icon: string;
    probabilityPercent: number;
    routingRationale: string;
  }>;
  crossAttentionSynapse?: {
    title: string;
    mechanism: string;
  };
  priorityRationale: string;
  targetMaxWaitMinutes: number;
}

export type UiExpertCategory =
  | 'spatial-anatomy'
  | 'pharmacology'
  | 'counterfactual'
  | 'diagnostic-radar'
  | 'ambient-scribe'
  | 'biophysics-genomics'
  | 'clinical-synthesis'
  | 'referral-network'
  | 'clinical-research'
  | 'social-equity'
  | 'environmental-exposome';

export interface IUiExpertDefinition {
  id: string;
  name: string;
  shortLabel: string;
  icon: string;
  category: UiExpertCategory;
  description: string;
  componentTag: string;
  relevanceKeywords: string[];
  associatedBodyParts: string[];
  requiresHighAcuity: boolean;
  defaultWeight: number;
  computeCostFlops: number;
  cognitiveComplexity: number; // 1 (lightweight) to 5 (dense)
  telemetrySource: 'Local Edge Wasm' | 'WebGPU Shader' | 'Gemini 3.8 Flash' | 'Gemini 3.8 Pro Deep Think' | 'FHIR R4 Directory' | 'ClinicalTrials.gov NIH API' | 'US Census & CMS HRSN' | 'EPA AirNow & NOAA';
}

export interface IUiGatingScore {
  expert: IUiExpertDefinition;
  weight: number;          // 0.0 - 1.0 (Softmax normalized)
  rawScore: number;
  routingRationale: string;
  isPrimary: boolean;      // Top-1
  isSecondary: boolean;    // Top-2 (if k >= 2)
  isPrewarmCandidate: boolean; // Preload trigger (e.g. weight >= 0.15)
}

export interface ICrossAttentionBridge {
  id: string;
  primaryExpertId: string;
  secondaryExpertId: string;
  title: string;
  mechanism: string;
  clinicalImplication: string;
  actionableVector: string;
  benchmarkMetric: string;
}

export const REGISTERED_UI_EXPERTS: IUiExpertDefinition[] = [
  {
    id: 'knee-hologram',
    name: '3D Holographic Joint & Biomechanical HUD',
    shortLabel: '3D Knee Hologram',
    icon: '🩻',
    category: 'spatial-anatomy',
    description: 'RSNA multi-plane joint abnormality detection, articular cartilage thickness, and range of motion.',
    componentTag: 'app-knee-hologram-hud',
    relevanceKeywords: ['knee', 'joint', 'meniscus', 'acl', 'mcl', 'cartilage', 'osteoarthritis', 'crepitus', 'femur', 'tibia', 'patella', 'stiffness', 'walking', 'rom', 'gait'],
    associatedBodyParts: ['knee', 'leg', 'hip', 'joint', 'foot'],
    requiresHighAcuity: false,
    defaultWeight: 0.25,
    computeCostFlops: 0.45,
    cognitiveComplexity: 4,
    telemetrySource: 'WebGPU Shader'
  },
  {
    id: 'counterfactual-simulator',
    name: 'Inquisitive What-If Health Simulator',
    shortLabel: 'What-If Simulator',
    icon: '🔮',
    category: 'counterfactual',
    description: 'Socratic perturbation engine: simulate metabolic, lifestyle, and pharmacological interventions.',
    componentTag: 'app-counterfactual-simulator',
    relevanceKeywords: ['what-if', 'scenario', 'simulation', 'weight', 'hba1c', 'exercise', 'diet', 'intervention', 'projection', 'lifestyle', 'bmi', 'hypothetical'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.22,
    computeCostFlops: 0.20,
    cognitiveComplexity: 3,
    telemetrySource: 'Gemini 3.8 Flash'
  },
  {
    id: 'ismp-posology',
    name: 'ISMP High-Risk Posology & Deprescribing Engine',
    shortLabel: 'Posology & Safety',
    icon: '💊',
    category: 'pharmacology',
    description: 'Allometric scaling, Beers criteria alerts, renal eGFR clearance, and $4 generic benchmarks.',
    componentTag: 'app-clinical-posology-calculator',
    relevanceKeywords: ['medication', 'dosage', 'drug', 'posology', 'ismp', 'metformin', 'insulin', 'statin', 'interaction', 'clearance', 'renal', 'beers', 'prescription', 'nsaid', 'polypharmacy'],
    associatedBodyParts: ['liver', 'kidney'],
    requiresHighAcuity: false,
    defaultWeight: 0.20,
    computeCostFlops: 0.12,
    cognitiveComplexity: 3,
    telemetrySource: 'Local Edge Wasm'
  },
  {
    id: 'edge-ml-hud',
    name: 'Continuous Edge Risk & ONNX WebGPU Telemetry',
    shortLabel: 'Edge ML Vitals',
    icon: '⚡',
    category: 'diagnostic-radar',
    description: 'Real-time physiological anomaly detection via on-device ONNX models with zero cloud egress.',
    componentTag: 'app-edge-ml-hud',
    relevanceKeywords: ['vitals', 'continuous', 'risk', 'heart rate', 'spo2', 'cgm', 'telemetry', 'real-time', 'onnx', 'bp', 'hrv', 'glucose', 'tachycardia', 'bradycardia'],
    associatedBodyParts: ['heart', 'chest'],
    requiresHighAcuity: true,
    defaultWeight: 0.18,
    computeCostFlops: 0.15,
    cognitiveComplexity: 3,
    telemetrySource: 'WebGPU Shader'
  },
  {
    id: 'steeep-quality-hud',
    name: 'NAM STEEEP 6-Axis Quality & Safety Radar',
    shortLabel: 'STEEEP Radar',
    icon: '📊',
    category: 'diagnostic-radar',
    description: 'National Academy of Medicine 6-axis clinical quality radar (Safe, Timely, Effective, Efficient, Equitable, Patient-Centered).',
    componentTag: 'app-steeep-quality-hud',
    relevanceKeywords: ['quality', 'safety', 'steeep', 'nam', 'effectiveness', 'equity', 'efficiency', 'timeliness', 'audit', 'governance', 'compliance'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.10,
    computeCostFlops: 0.05,
    cognitiveComplexity: 2,
    telemetrySource: 'Local Edge Wasm'
  },
  {
    id: 'soap-generator',
    name: 'Ambient FHIR R4 Real-Time SOAP Note Generator',
    shortLabel: 'Ambient SOAP',
    icon: '📝',
    category: 'ambient-scribe',
    description: 'Ambient consultation synthesis generating structured FHIR R4 clinical documentation and billing crosswalks.',
    componentTag: 'app-soap-note-generator',
    relevanceKeywords: ['soap', 'note', 'documentation', 'scribe', 'ambient', 'fhir', 'encounter', 'assessment', 'plan', 'dictation', 'billing', 'cpt'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.12,
    computeCostFlops: 0.18,
    cognitiveComplexity: 2,
    telemetrySource: 'Gemini 3.8 Flash'
  },
  {
    id: 'biophysics-genomics',
    name: 'Frontier Molecular Biophysics & 3D Physical Genomics',
    shortLabel: 'Biophysics & DNA',
    icon: '⚛️',
    category: 'biophysics-genomics',
    description: 'Chromatin loop extrusion, biomolecular condensates, and CRISPR topological repair loci.',
    componentTag: 'app-lens-biomolecular-physics',
    relevanceKeywords: ['genomics', 'biophysics', 'crispr', 'condensate', 'chromatin', 'loop extrusion', 'protac', 'quantum', 'molecular', 'epigenetic', 'dna', 'rna'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.08,
    computeCostFlops: 0.40,
    cognitiveComplexity: 4,
    telemetrySource: 'Gemini 3.8 Pro Deep Think'
  },
  {
    id: 'analysis-report',
    name: 'Tri-Paradigm Clinical Synthesis Care Plan',
    shortLabel: 'Clinical Synthesis',
    icon: '📄',
    category: 'clinical-synthesis',
    description: 'Stepped-Care Tri-Paradigm (Western, Eastern TCM, Ayurvedic) unified clinical report.',
    componentTag: 'app-analysis-report',
    relevanceKeywords: ['summary', 'protocols', 'western', 'eastern', 'ayurvedic', 'synthesis', 'care plan', 'overview', 'general', 'holistic'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.20,
    computeCostFlops: 0.35,
    cognitiveComplexity: 3,
    telemetrySource: 'Gemini 3.8 Pro Deep Think'
  },
  {
    id: 'specialist-referral',
    name: 'Specialist Referral & Co-Management Dossier Hub',
    shortLabel: 'Specialist Referral',
    icon: '🏥',
    category: 'referral-network',
    description: 'Sub-specialty diagnostic pre-flight gates, SBAR clinical hand-off, and FHIR R4 ServiceRequest generation.',
    componentTag: 'app-specialist-referral-hub',
    relevanceKeywords: ['specialist', 'referral', 'cardiologist', 'neurologist', 'endocrinologist', 'rheumatologist', 'consult', 'sbar', 'second opinion', 'hand-off', 'subspecialty', 'doctor', 'network'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.15,
    computeCostFlops: 0.15,
    cognitiveComplexity: 3,
    telemetrySource: 'FHIR R4 Directory'
  },
  {
    id: 'clinical-trials-matcher',
    name: 'TrialFinder: NIH & NCI Active Clinical Trials Matcher',
    shortLabel: 'Clinical Trials',
    icon: '🔬',
    category: 'clinical-research',
    description: 'Matches active recruiting Phase 2/3 clinical trials within a 25-100 mile radius based on diagnosis, age, and biomarker criteria.',
    componentTag: 'app-clinical-trials-matcher',
    relevanceKeywords: ['clinical trial', 'trial', 'investigator', 'study', 'recruiting', 'phase', 'experimental', 'novel therapy', 'orphan disease', 'refractory', 'nih', 'nci', 'biomarker'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.14,
    computeCostFlops: 0.20,
    cognitiveComplexity: 3,
    telemetrySource: 'ClinicalTrials.gov NIH API'
  },
  {
    id: 'sdoh-navigator',
    name: 'Social Determinants of Health (SDOH) & Community Care Navigator',
    shortLabel: 'SDOH Navigator',
    icon: '🏘️',
    category: 'social-equity',
    description: 'Housing stability, food security, $4 generic pharmacy benchmarks, Produce Rx, and CMS HRSN / PRAPARE closed-loop referrals.',
    componentTag: 'app-sdoh-navigator',
    relevanceKeywords: ['sdoh', 'housing', 'food', 'insecurity', 'transportation', 'poverty', 'financial', 'copay', 'assistance', 'z59', 'snap', 'produce rx', 'community health', 'navigator', 'social care'],
    associatedBodyParts: [],
    requiresHighAcuity: false,
    defaultWeight: 0.18,
    computeCostFlops: 0.10,
    cognitiveComplexity: 2,
    telemetrySource: 'US Census & CMS HRSN'
  },
  {
    id: 'environmental-exposomics',
    name: 'Geofenced Environmental Exposomics & Climate Resilience Radar',
    shortLabel: 'Environmental Radar',
    icon: '🗺️',
    category: 'environmental-exposome',
    description: 'Real-time EPA AQI, wildfire smoke PM2.5, ambient heatwave thermostability, and micro-climate therapeutic relocation.',
    componentTag: 'app-geofenced-exposomics-radar',
    relevanceKeywords: ['environment', 'exposomics', 'aqi', 'air quality', 'wildfire', 'smoke', 'pm2.5', 'heatwave', 'temperature', 'ozone', 'weather', 'climate', 'micro-climate', 'relocation', 'thermostability'],
    associatedBodyParts: ['lung', 'skin', 'chest'],
    requiresHighAcuity: false,
    defaultWeight: 0.16,
    computeCostFlops: 0.18,
    cognitiveComplexity: 3,
    telemetrySource: 'EPA AirNow & NOAA'
  }
];

export const CROSS_ATTENTION_BRIDGES: ICrossAttentionBridge[] = [
  {
    id: 'bridge-knee-whatif',
    primaryExpertId: 'knee-hologram',
    secondaryExpertId: 'counterfactual-simulator',
    title: 'Kinematic Joint Stress vs. Cartilage Longevity Cross-Talk',
    mechanism: 'Finite-Element joint shear stress directly modulated by BMI and quadriceps peak torque variables.',
    clinicalImplication: 'Simulating a 5% body mass reduction decreases peak medial compartment joint reaction force by ~18%, preserving articular cartilage depth.',
    actionableVector: 'Prescribe low-impact eccentric quadriceps loading + 0.1 Hz vagal recovery pacing.',
    benchmarkMetric: '-18% Medial Shear Stress'
  },
  {
    id: 'bridge-posology-whatif',
    primaryExpertId: 'ismp-posology',
    secondaryExpertId: 'counterfactual-simulator',
    title: 'Renal Clearance & Glycemic Trajectory Cross-Talk',
    mechanism: 'eGFR-stratified drug excretion dynamics cross-referenced with simulated carbohydrate restriction.',
    clinicalImplication: 'Titrating metformin in mild CKD alongside dietary carbohydrate pacing avoids lactic acidosis while reducing HbA1c by 0.9%.',
    actionableVector: 'Calibrate eGFR threshold rule with $4 generic retail benchmark (Walmart/Kroger/Amazon Pharmacy).',
    benchmarkMetric: '0.9% HbA1c Reduction / eGFR Safe Harbor'
  },
  {
    id: 'bridge-knee-posology',
    primaryExpertId: 'knee-hologram',
    secondaryExpertId: 'ismp-posology',
    title: 'Analgesic Gastro-Renal Safety vs. Physical Mobility Cross-Talk',
    mechanism: 'NSAID cyclooxygenase inhibition balancing mechanical knee joint mobilization against renal perfusion.',
    clinicalImplication: 'Targeted topical NSAID reduces systemic plasma concentration by 95% compared to oral dosing, preventing acute kidney injury.',
    actionableVector: 'Switch from oral naproxen to topical diclofenac 1% gel with knee compression sleeve.',
    benchmarkMetric: '95% Reduction in Systemic Drug Egress'
  },
  {
    id: 'bridge-edgeml-posology',
    primaryExpertId: 'edge-ml-hud',
    secondaryExpertId: 'ismp-posology',
    title: 'Real-Time Hemodynamic Feedback to Antihypertensive Titration',
    mechanism: 'High-frequency ambulatory BP & nocturnal dipping telemetry directly gating ACEi/ARB posology timing.',
    clinicalImplication: 'Nocturnal non-dipping BP pattern indicates chronotherapeutic shift of medication administration to bedtime.',
    actionableVector: 'Shift lisinopril dosing from morning to 21:00 to restore nocturnal dip and protect renal parenchyma.',
    benchmarkMetric: 'Restoration of 10-20% Nocturnal Dipping'
  },
  {
    id: 'bridge-analysis-soap',
    primaryExpertId: 'analysis-report',
    secondaryExpertId: 'soap-generator',
    title: 'Tri-Paradigm Synthesis to Structured FHIR R4 Encounter Mapping',
    mechanism: 'Real-time extraction of Western/Eastern/Ayurvedic care vectors into structured SNOMED CT and LOINC codings.',
    clinicalImplication: 'Ambient dictation automatically maps holistic lifestyle recommendations into compliant billing codes.',
    actionableVector: 'Auto-populate Section A & P of SOAP note with validated ICD-10 & CPT codes.',
    benchmarkMetric: '100% FHIR R4 Bundle Syntactic Conformance'
  },
  {
    id: 'bridge-specialist-referral',
    primaryExpertId: 'specialist-referral',
    secondaryExpertId: 'soap-generator',
    title: 'Specialist Pre-Flight Dossier to Ambient Encounter Hand-off',
    mechanism: 'Auto-extracts diagnostic pre-flight prerequisites into structured SBAR handoff narrative.',
    clinicalImplication: 'Eliminates lost referrals and guarantees specialist receives complete imaging and lab history.',
    actionableVector: 'Generate FHIR R4 ServiceRequest bundle and transmit to targeted sub-specialist network.',
    benchmarkMetric: '100% Pre-Flight Diagnostic Completeness'
  },
  {
    id: 'bridge-trials-posology',
    primaryExpertId: 'clinical-trials-matcher',
    secondaryExpertId: 'ismp-posology',
    title: 'Refractory Disease Clinical Trial Matching & Posology Bridge',
    mechanism: 'Cross-references failing standard-of-care drug regimens with novel Phase 2/3 mechanism-of-action trials.',
    clinicalImplication: 'Identifies targeted investigational agents within patient driving radius without treatment delay.',
    actionableVector: 'Contact local study coordinator at nearby academic medical center with patient eligibility brief.',
    benchmarkMetric: 'Active Study Site < 50 Miles / Fast-Track Enrollment'
  },
  {
    id: 'bridge-sdoh-posology',
    primaryExpertId: 'sdoh-navigator',
    secondaryExpertId: 'ismp-posology',
    title: 'Socioeconomic Reality & $4 Generic Formulary Co-Titration Bridge',
    mechanism: 'Aligns clinical pharmacotherapy with patient out-of-pocket reality and grocery accessibility.',
    clinicalImplication: 'Prevents primary medication abandonment by substituting transparent $4 generics and issuing Produce Rx nutrition vouchers.',
    actionableVector: 'Prescribe $4 generic metformin/lisinopril benchmark at Walmart/Kroger + SNAP Produce Rx voucher.',
    benchmarkMetric: '>90% 12-Month Medication Persistence / Zero Copay Shock'
  }
];

export interface IShiftPatientRecord {
  id: string;
  name: string;
  clinicalDomain: string;
  intakeNote: string;
  intakeGoal: string;
  assessmentTab: string;
  assessmentName: string;
  paradigms: string[];
  researchQuery: string;
  cognitiveLevel: 'standard' | 'simplified' | 'dyslexia' | 'child';
  pdfPath: string;
  htmlPath: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  targetExpertId: string;
}

export const SHIFT_CARE_PLAN_ROSTER: IShiftPatientRecord[] = [
  {
    id: 'p001',
    name: 'Homo Sapiens (Male, Metabolic)',
    clinicalDomain: 'Metabolic & Cardiometabolic Medicine',
    intakeNote: 'Patient presents for 6-month metabolic follow-up. Reports ongoing difficulty with CPAP compliance (apnea episodes > 15/hr), fasting glucose fluctuating between 145-170 mg/dL, and bilateral lower extremity edema.',
    intakeGoal: 'Titrate GLP-1/GIP co-agonist therapy, achieve HbA1c < 7.0%, and optimize CPAP bilevel pressure support.',
    assessmentTab: 'phq9',
    assessmentName: 'PHQ-9 (Depression & Metabolic Anhedonia)',
    paradigms: ['Summary Overview', 'Treatment Matrix', 'Functional Protocols'],
    researchQuery: 'metabolic syndrome GLP-1 dual agonist renal protection',
    cognitiveLevel: 'simplified',
    pdfPath: 'artifacts/shift-care-plans/patient-p001-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p001-care-plan.html',
    age: '54',
    gender: 'male',
    targetExpertId: 'ismp-posology'
  },
  {
    id: 'p002',
    name: 'Homo Sapiens (Female, Asthma)',
    clinicalDomain: 'Pulmonary & Environmental Exposomics',
    intakeNote: '34yo female presenting with acute nocturnal wheezing, chest tightness following regional wildfire smoke exposure, and elevated absolute eosinophil count (580 cells/uL).',
    intakeGoal: 'Establish asthma action plan, consider biologic dupilumab initiation, and deploy HEPA environmental filtration.',
    assessmentTab: 'ros14',
    assessmentName: 'ROS-14 (Review of Systems - Pulmonary/Allergy)',
    paradigms: ['Environmental Exposomics & Toxicology', 'Functional Protocols', 'Monitoring & Follow-up'],
    researchQuery: 'severe eosinophilic asthma dupilumab particulate matter PM2.5',
    cognitiveLevel: 'dyslexia',
    pdfPath: 'artifacts/shift-care-plans/patient-p002-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p002-care-plan.html',
    age: '34',
    gender: 'female',
    targetExpertId: 'edge-ml-hud'
  },
  {
    id: 'p003',
    name: 'Homo Sapiens (Male, Cognitive)',
    clinicalDomain: 'Neurogeriatrics & Glymphatic Health',
    intakeNote: '71yo male accompanied by spouse reporting progressive short-term recall difficulties over 14 months, nocturnal sleep fragmentation, and autonomic orthostatic lightheadedness.',
    intakeGoal: 'Perform MoCA baseline screening, optimize slow-wave sleep glymphatic clearance, and screen for vascular vs neurodegenerative etiology.',
    assessmentTab: 'moca',
    assessmentName: 'MoCA (Montreal Cognitive Assessment 30-Point)',
    paradigms: ['Summary Overview', 'Chronobiology Matrix', 'Skeptical Epistemology & Socratic Audit'],
    researchQuery: 'glymphatic system slow wave sleep cognitive decline prevention',
    cognitiveLevel: 'child',
    pdfPath: 'artifacts/shift-care-plans/patient-p003-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p003-care-plan.html',
    age: '71',
    gender: 'male',
    targetExpertId: 'steeep-quality-hud'
  },
  {
    id: 'p004',
    name: 'Homo Sapiens (Female, Autoimmune)',
    clinicalDomain: 'Neuro-Endocrine & Functional Immunology',
    intakeNote: '42yo female presenting with persistent afternoon exhaustion, cold intolerance, widespread fibro-myalgic tenderness, and elevated anti-TPO antibodies (> 400 IU/mL).',
    intakeGoal: 'Implement low-dose naltrexone (LDN) trial, anti-inflammatory micronutrient protocol, and stress-induced HPA axis pacing.',
    assessmentTab: 'gad7',
    assessmentName: 'GAD-7 (Generalized Anxiety Screener)',
    paradigms: ['Functional Protocols', 'Treatment Matrix', 'Patient Education'],
    researchQuery: 'hashimoto thyroiditis low dose naltrexone gut permeability',
    cognitiveLevel: 'standard',
    pdfPath: 'artifacts/shift-care-plans/patient-p004-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p004-care-plan.html',
    age: '42',
    gender: 'female',
    targetExpertId: 'biomolecular-physics'
  },
  {
    id: 'p_charles_darwin',
    name: 'Charles Darwin',
    clinicalDomain: 'Complex Chronic Dysautonomia & Gastrointestinal',
    intakeNote: 'Chronic recurrent postprandial dyspepsia, severe gastric flatulence, persistent nausea, and profound autonomic exhaustion following cognitive exertion.',
    intakeGoal: 'Restore vagal nerve tone, modulate gastrointestinal enteric signaling, and rebalance sympathetic-parasympathetic tone.',
    assessmentTab: 'mbi',
    assessmentName: 'MBI (Allostatic Load & Autonomic Strain)',
    paradigms: ['Treatment Matrix', 'Functional Protocols', 'Skeptical Epistemology & Socratic Audit'],
    researchQuery: 'postprandial dysautonomia vagal nerve stimulation gastroparesis',
    cognitiveLevel: 'simplified',
    pdfPath: 'artifacts/shift-care-plans/patient-p_charles_darwin-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_charles_darwin-care-plan.html',
    age: '58',
    gender: 'male',
    targetExpertId: 'counterfactual-simulator'
  },
  {
    id: 'p_frida_kahlo',
    name: 'Frida Kahlo',
    clinicalDomain: 'Neuropathic Pain & Physical Rehabilitation',
    intakeNote: 'Severe central sensitization, burning causalgia, allodynia of the right lower extremity following multi-trauma and spinal stabilization surgery.',
    intakeGoal: 'Implement somatic grounding, multimodal neuropathic pain modulation, and phantom limb mirror neuro-visual retraining.',
    assessmentTab: 'dn4',
    assessmentName: 'DN4 (Douleur Neuropathique 4 Questions)',
    paradigms: ['Summary Overview', 'Treatment Matrix', 'Patient Education'],
    researchQuery: 'neuropathic pain central sensitization mirror visual feedback',
    cognitiveLevel: 'standard',
    pdfPath: 'artifacts/shift-care-plans/patient-p_frida_kahlo-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_frida_kahlo-care-plan.html',
    age: '47',
    gender: 'female',
    targetExpertId: 'soap-generator'
  },
  {
    id: 'p_marie_curie',
    name: 'Marie Curie',
    clinicalDomain: 'Hematology & Radiation Toxicology',
    intakeNote: 'Profound fatigue, petechial hemorrhages on distal forearms, normocytic normochromic anemia, and chronic cumulative ionizing radiation exposure.',
    intakeGoal: 'Prevent bone marrow hypoplasia, administer cellular antioxidant scavengers, and institute protective environmental shields.',
    assessmentTab: 'sarcf',
    assessmentName: 'Sarc-F (Frailty & Musculoskeletal Sarcopenia)',
    paradigms: ['Environmental Exposomics & Toxicology', 'Monitoring & Follow-up', 'Treatment Matrix'],
    researchQuery: 'ionizing radiation aplastic anemia hematopoietic stem cell protection',
    cognitiveLevel: 'simplified',
    pdfPath: 'artifacts/shift-care-plans/patient-p_marie_curie-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_marie_curie-care-plan.html',
    age: '66',
    gender: 'female',
    targetExpertId: 'biomolecular-physics'
  },
  {
    id: 'p_edwin_smith_3',
    name: 'Edwin Smith',
    clinicalDomain: 'Spinal Biomechanics & Osteopathic Ergonomics',
    intakeNote: 'C5-C6 and C6-C7 radiculopathy with progressive thenar atrophy, intermittent numbness along the C6 dermatome, and severe paraspinal muscle hypertonicity.',
    intakeGoal: 'Biomechanical cervical mobilization, postural ergonomic realignment, and neuroforaminal decompression.',
    assessmentTab: 'cvsq',
    assessmentName: 'CVSQ (Visual-Ergonomic Strain Questionnaire)',
    paradigms: ['Treatment Matrix', 'Global Health & WHO Initiatives', 'Summary Overview'],
    researchQuery: 'cervical radiculopathy conservative biomechanical decompression',
    cognitiveLevel: 'standard',
    pdfPath: 'artifacts/shift-care-plans/patient-p_edwin_smith_3-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_edwin_smith_3-care-plan.html',
    age: '62',
    gender: 'male',
    targetExpertId: 'knee-hologram'
  },
  {
    id: 'p_mara_santos',
    name: 'Mara Santos',
    clinicalDomain: 'Pediatric Pulmonology & Rare Disease Genetics',
    intakeNote: 'Adolescent female with Cystic Fibrosis (delta-F508 homozygous) presenting with sticky mucopurulent sputum, productive cough, and weight velocity plateauing.',
    intakeGoal: 'Optimize highly effective CFTR modulator therapy (elexacaftor/tezacaftor/ivacaftor), airway clearance vibrating vest, and high-calorie pancreatic enzyme dosing.',
    assessmentTab: 'growthyself',
    assessmentName: 'Grow-Thyself (Pediatric Wellness & Growth Screener)',
    paradigms: ['Summary Overview', 'Functional Protocols', 'Global Health & WHO Initiatives'],
    researchQuery: 'cystic fibrosis CFTR modulators pancreatic enzyme replacement therapy',
    cognitiveLevel: 'child',
    pdfPath: 'artifacts/shift-care-plans/patient-p_mara_santos-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_mara_santos-care-plan.html',
    age: '14',
    gender: 'female',
    targetExpertId: 'ismp-posology'
  },
  {
    id: 'p_srinivasa_ramanujan',
    name: 'Srinivasa Ramanujan',
    clinicalDomain: 'Infectious Hepatology & Nutritional Rehabilitation',
    intakeNote: 'Severe cachexia, right hypochondriac dull pain, low-grade remittent pyrexia, history of amebic dysentery with secondary hepatic amebiasis.',
    intakeGoal: 'Eradicate hepatic parasitic infection, initiate aggressive micronutrient re-alimentation (vitamin B12, iron, zinc), and restore intestinal mucosal barrier integrity.',
    assessmentTab: 'tcm',
    assessmentName: 'TCM Energetic Screener (Spleen-Liver Disharmony)',
    paradigms: ['Treatment Matrix', 'Global Health & WHO Initiatives', 'Patient Education'],
    researchQuery: 'amebic liver abscess nutritional rehabilitation hepatic recovery',
    cognitiveLevel: 'dyslexia',
    pdfPath: 'artifacts/shift-care-plans/patient-p_srinivasa_ramanujan-care-plan.pdf',
    htmlPath: 'artifacts/shift-care-plans/patient-p_srinivasa_ramanujan-care-plan.html',
    age: '32',
    gender: 'male',
    targetExpertId: 'counterfactual-simulator'
  }
];

export interface IVitalSignEntry {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'alert';
}

export interface IHeuristicTriggerProfile {
  matchedKeywords: string[];
  physiologicalTrigger: string;
  anatomicalSubstrate: string;
  diagnosticLensAffinity: string;
}

export interface IExpertProbabilityFlow {
  expertId: string;
  expertLabel: string;
  probabilityPercent: number;
  logit: number;
  isTop1: boolean;
  isTop2: boolean;
  routingRationale: string;
}

export interface IResultingRoutingSummary {
  primaryExpertId: string;
  primaryLabel: string;
  primaryRatio: number;
  secondaryExpertId: string;
  secondaryLabel: string;
  secondaryRatio: number;
  bridgeTitle: string;
  bridgeMechanism: string;
  bridgeActionableVector: string;
  bridgeBenchmark: string;
  noiseReductionPercent: number;
  dormantShelfCount: number;
}

export interface IPatientDecisionFlow {
  patientId: string;
  patientName: string;
  demographic: string;
  clinicalDomain: string;
  chiefComplaint: string;
  intakeGoal: string;
  vitalsSignature: IVitalSignEntry[];
  scannedTriggers: IHeuristicTriggerProfile;
  gatingProbabilities: IExpertProbabilityFlow[];
  resultingRouting: IResultingRoutingSummary;
  clinicalDecisionStory: string;
}

export const SHIFT_DECISION_FLOW_MAP: Record<string, IPatientDecisionFlow> = {
  p001: {
    patientId: 'p001',
    patientName: 'Homo Sapiens (Male, Metabolic)',
    demographic: '54y Male, Cardiometabolic & Renal',
    clinicalDomain: 'Metabolic & Cardiometabolic Medicine',
    chiefComplaint: 'Difficulty with CPAP compliance (apnea episodes > 15/hr), fasting glucose 145-170 mg/dL, bilateral ankle edema.',
    intakeGoal: 'Titrate dual GLP-1/GIP co-agonist, achieve HbA1c < 7.0%, and optimize bilevel pressure support.',
    vitalsSignature: [
      { label: 'Blood Pressure', value: '138/88 mmHg', status: 'warning' },
      { label: 'CGM Glucose', value: '162 mg/dL', status: 'alert' },
      { label: 'Heart Rate', value: '76 bpm', status: 'normal' },
      { label: 'Apnea-Hypopnea Index', value: '18.4 /hr', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['glucose', 'cgm', 'titrate', 'edema', 'glp-1', 'cpap'],
      physiologicalTrigger: 'Glycemic hyper-variability + obstructive hypopnea sympathetic surge',
      anatomicalSubstrate: 'Endothelial microvasculature, pancreatic beta-cells, renal glomeruli',
      diagnosticLensAffinity: 'Treatment Matrix & Precision Nutrients'
    },
    gatingProbabilities: [
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 41.5, logit: 3.8, isTop1: true, isTop2: false, routingRationale: 'High-risk GLP-1/GIP dual titration + renal eGFR dose gating' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 28.2, logit: 3.4, isTop1: false, isTop2: true, routingRationale: 'Projected HbA1c trajectory under CPAP compliance vs non-compliance' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 12.0, logit: 2.5, isTop1: false, isTop2: false, routingRationale: 'ADA Standards of Care clinical guideline compliance' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 6.5, logit: 1.9, isTop1: false, isTop2: false, routingRationale: 'Nocturnal snore soundscape analysis' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 5.2, logit: 1.7, isTop1: false, isTop2: false, routingRationale: 'Metabolic syndrome multi-system summary' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 3.4, logit: 1.3, isTop1: false, isTop2: false, routingRationale: 'Incretin receptor kinetic simulation' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 2.1, logit: 0.8, isTop1: false, isTop2: false, routingRationale: 'Routine follow-up encounter chart' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 1.1, logit: 0.2, isTop1: false, isTop2: false, routingRationale: 'Low joint disease priority' }
    ],
    resultingRouting: {
      primaryExpertId: 'ismp-posology',
      primaryLabel: 'ISMP Posology Guard',
      primaryRatio: 62,
      secondaryExpertId: 'counterfactual-simulator',
      secondaryLabel: 'Counterfactual Simulator',
      secondaryRatio: 38,
      bridgeTitle: 'In-Silico Glycemic & Microvascular Trajectory Projection',
      bridgeMechanism: 'Coupling dual incretin receptor titration with overnight AHI reduction to protect renal capillary beds.',
      bridgeActionableVector: 'Prescribe tirzepatide 5.0mg weekly with 4-week titration ladder, coupled with automated CPAP pressure auto-ramp.',
      bridgeBenchmark: 'HbA1c < 7.0%, AHI < 5.0/hr, eGFR stabilization',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'The SMoE Router detected critical glycemic instability (CGM 162 mg/dL) coupled with polypharmacy titration cues. The gating network prioritized the ISMP Posology Guard (41.5%) to verify zero trailing zeroes and renal dosing safety, paired with the Counterfactual Simulator (28.2%) to model the 6-month microvascular benefit of nocturnal CPAP adherence.'
  },

  p002: {
    patientId: 'p002',
    patientName: 'Homo Sapiens (Female, Asthma)',
    demographic: '34y Female, Pulmonary & Exposomics',
    clinicalDomain: 'Pulmonary & Environmental Exposomics',
    chiefComplaint: 'Nocturnal wheezing, chest tightness following wildfire PM2.5 smoke exposure, absolute eosinophils 580 cells/uL.',
    intakeGoal: 'Establish asthma action plan, evaluate biologic Dupilumab candidacy, and deploy HEPA environmental barrier.',
    vitalsSignature: [
      { label: 'Pulse Oximetry (SpO2)', value: '93%', status: 'alert' },
      { label: 'Heart Rate', value: '94 bpm', status: 'warning' },
      { label: 'Respiratory Rate', value: '22 /min', status: 'alert' },
      { label: 'Eosinophils', value: '580 /uL', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['wheeze', 'particulate', 'pm2.5', 'wildfire', 'dupilumab', 'eosinophil'],
      physiologicalTrigger: 'Acoustic expiratory wheeze + environmental particulate airway hyper-reactivity',
      anatomicalSubstrate: 'Bronchial smooth muscle, ciliated epithelial mucosa, type 2 inflammatory pathway',
      diagnosticLensAffinity: 'Environmental Exposomics & PhysioNet Telemetry'
    },
    gatingProbabilities: [
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 44.8, logit: 3.9, isTop1: true, isTop2: false, routingRationale: 'Real-time acoustic breath sound wheeze classification & FFT spectrogram' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 26.3, logit: 3.3, isTop1: false, isTop2: true, routingRationale: 'GINA Step 5 guideline adherence & biologic eligibility criteria' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 11.2, logit: 2.5, isTop1: false, isTop2: false, routingRationale: 'Particulate exposure reduction simulation' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 8.4, logit: 2.1, isTop1: false, isTop2: false, routingRationale: 'Inhaled corticosteroid dosage verification' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 4.1, logit: 1.4, isTop1: false, isTop2: false, routingRationale: 'Exposomic multi-lens overview' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 2.5, logit: 0.9, isTop1: false, isTop2: false, routingRationale: 'IL-4 / IL-13 receptor binding modeling' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 1.8, logit: 0.6, isTop1: false, isTop2: false, routingRationale: 'Urgent care pulmonary documentation' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.9, logit: 0.1, isTop1: false, isTop2: false, routingRationale: 'No musculoskeletal complaints' }
    ],
    resultingRouting: {
      primaryExpertId: 'edge-ml-hud',
      primaryLabel: 'Edge ML Audio Classifier',
      primaryRatio: 64,
      secondaryExpertId: 'steeep-quality-hud',
      secondaryLabel: 'NAM STEEEP Quality Radar',
      secondaryRatio: 36,
      bridgeTitle: 'Acoustic Respiratory Spectrogram to Biologic Initiation',
      bridgeMechanism: 'Coupling real-time acoustic wheeze detection with GINA clinical guideline decision trees.',
      bridgeActionableVector: 'Initiate dupilumab 600mg loading dose followed by 300mg Q2W; deploy true HEPA filtration in bedroom.',
      bridgeBenchmark: 'Zero nocturnal awakenings, SpO2 >= 97% on room air, FEV1 gain > 250mL',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Wildfire PM2.5 triggers and acute nocturnal dyspnea elevated acoustic breath-sound analysis to top priority. The SMoE router dispatched the Edge ML Audio Classifier (44.8%) to analyze frequency spectrograms while activating the NAM STEEEP Quality Radar (26.3%) to ensure immediate guideline compliance for biologic initiation.'
  },

  p003: {
    patientId: 'p003',
    patientName: 'Homo Sapiens (Male, Cognitive)',
    demographic: '71y Male, Neurogeriatrics & Sleep',
    clinicalDomain: 'Neurogeriatrics & Glymphatic Health',
    chiefComplaint: 'Progressive short-term memory lapses over 14 months, nocturnal sleep fragmentation, orthostatic lightheadedness.',
    intakeGoal: 'Perform MoCA screening, optimize slow-wave sleep glymphatic clearance, and protect cerebral perfusion.',
    vitalsSignature: [
      { label: 'Blood Pressure', value: '118/74 mmHg', status: 'normal' },
      { label: 'Heart Rate', value: '68 bpm', status: 'normal' },
      { label: 'Heart Rate Variability (SDNN)', value: '38 ms', status: 'warning' },
      { label: 'MoCA Cognitive Score', value: '22 / 30', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['moca', 'memory', 'sleep', 'glymphatic', 'fragmentation', 'recall'],
      physiologicalTrigger: 'Slow-wave sleep architecture deficit + impaired interstitial amyloid clearance',
      anatomicalSubstrate: 'Hippocampal CA1/CA3 regions, entorhinal cortex, cerebral aqueduct',
      diagnosticLensAffinity: 'Chronobiology Matrix & Summary Overview'
    },
    gatingProbabilities: [
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 38.6, logit: 3.7, isTop1: true, isTop2: false, routingRationale: 'Evidence-based cognitive impairment diagnostic workup & rule-out protocols' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 29.4, logit: 3.4, isTop1: false, isTop2: true, routingRationale: 'Chronobiology matrix & multi-paradigm sleep-neuro axis evaluation' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 14.1, logit: 2.7, isTop1: false, isTop2: false, routingRationale: 'Cognitive decline trajectory projection with sleep therapy' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 7.2, logit: 2.0, isTop1: false, isTop2: false, routingRationale: 'Geriatric cognitive assessment charting' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 4.5, logit: 1.5, isTop1: false, isTop2: false, routingRationale: 'Sleep soundscape acoustic monitoring' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 3.1, logit: 1.1, isTop1: false, isTop2: false, routingRationale: 'Beers criteria anticholinergic drug burden screening' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 2.0, logit: 0.7, isTop1: false, isTop2: false, routingRationale: 'Tau protein phosphorylation kinetics' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 1.1, logit: 0.1, isTop1: false, isTop2: false, routingRationale: 'No musculoskeletal focus' }
    ],
    resultingRouting: {
      primaryExpertId: 'steeep-quality-hud',
      primaryLabel: 'NAM STEEEP Quality Radar',
      primaryRatio: 58,
      secondaryExpertId: 'analysis-report',
      secondaryLabel: 'Multi-Lens Synthesizer',
      secondaryRatio: 42,
      bridgeTitle: 'Glymphatic Slow-Wave Pacing & Cognitive Preservation Bridge',
      bridgeMechanism: 'Optimizing non-REM delta slow-wave sleep to promote convective interstitial waste clearance.',
      bridgeActionableVector: 'Prescribe magnesium L-threonate 144mg + apigenin 50mg 60 min before bedtime; eliminate blue light after 20:00.',
      bridgeBenchmark: 'MoCA stabilization >= 24/30, slow-wave sleep percentage > 18%',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Subtle neuro-cognitive decline (MoCA 22/30) and sleep fragmentation triggered a stepped geriatric evaluation. The SMoE router allocated the NAM STEEEP Quality Radar (38.6%) to verify evidence-based cognitive protocols, while coupling the Multi-Lens Synthesizer (29.4%) to configure the Chronobiology sleep matrix.'
  },

  p004: {
    patientId: 'p004',
    patientName: 'Homo Sapiens (Female, Autoimmune)',
    demographic: '42y Female, Immunology & Thyroid',
    clinicalDomain: 'Neuro-Endocrine & Functional Immunology',
    chiefComplaint: 'Afternoon fatigue crashes, cold intolerance, generalized musculoskeletal tender points, anti-TPO antibodies > 400 IU/mL.',
    intakeGoal: 'Implement Low-Dose Naltrexone (LDN) trial, anti-inflammatory micronutrient protocol, and HPA axis pacing.',
    vitalsSignature: [
      { label: 'Body Temperature', value: '97.2 °F', status: 'warning' },
      { label: 'Heart Rate', value: '62 bpm', status: 'normal' },
      { label: 'Blood Pressure', value: '108/68 mmHg', status: 'normal' },
      { label: 'Anti-TPO Antibodies', value: '> 400 IU/mL', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['tpo', 'thyroid', 'naltrexone', 'autoimmune', 'ldn', 'fatigue'],
      physiologicalTrigger: 'Cellular molecular mimicry + microglial hyper-activation + HPA axis hypofunction',
      anatomicalSubstrate: 'Thyroid parenchyma, hypothalamic-pituitary-adrenal axis, central microglial cells',
      diagnosticLensAffinity: 'Physical Genomics & Functional Protocols'
    },
    gatingProbabilities: [
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 43.1, logit: 3.8, isTop1: true, isTop2: false, routingRationale: 'Immune complex binding kinetics & molecular mimicry structural simulation' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 27.5, logit: 3.3, isTop1: false, isTop2: true, routingRationale: 'Low-Dose Naltrexone (LDN) micro-titration posology safety (1.5mg to 4.5mg)' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 12.8, logit: 2.6, isTop1: false, isTop2: false, routingRationale: 'Antibody reduction trajectory modeling' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 7.9, logit: 2.1, isTop1: false, isTop2: false, routingRationale: 'Integrative autoimmune care standards' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 4.2, logit: 1.5, isTop1: false, isTop2: false, routingRationale: 'Functional medicine matrix integration' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 2.3, logit: 0.9, isTop1: false, isTop2: false, routingRationale: 'Functional endocrinology note' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 1.4, logit: 0.4, isTop1: false, isTop2: false, routingRationale: 'No respiratory/acoustic trigger' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.8, logit: -0.2, isTop1: false, isTop2: false, routingRationale: 'Non-articular widespread fibromyalgia' }
    ],
    resultingRouting: {
      primaryExpertId: 'biomolecular-physics',
      primaryLabel: 'Molecular Biophysics',
      primaryRatio: 61,
      secondaryExpertId: 'ismp-posology',
      secondaryLabel: 'ISMP Posology Guard',
      secondaryRatio: 39,
      bridgeTitle: 'Autoimmune Epitope Clearance to Low-Dose Naltrexone Calibration',
      bridgeMechanism: 'Transient opioid receptor blockade prompts rebound beta-endorphin surge, downregulating TLR4 cytokine signaling.',
      bridgeActionableVector: 'Compound LDN 1.5mg PO QHS for 14 days, titrating to 3.0mg then 4.5mg; add selenomethionine 200mcg daily.',
      bridgeBenchmark: 'Anti-TPO reduction > 30%, Morning Energy Index score > 7/10',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Elevated anti-TPO antibodies and multi-focal fatigue drove the router to activate Molecular Biophysics (43.1%) to evaluate immune complex clearance kinetics, partnered with the ISMP Posology Guard (27.5%) to safely guide Low-Dose Naltrexone (LDN) micro-titration.'
  },

  p_charles_darwin: {
    patientId: 'p_charles_darwin',
    patientName: 'Charles Darwin',
    demographic: '58y Male, Gastroenterology & Vagal Health',
    clinicalDomain: 'Complex Chronic Dysautonomia & Gastrointestinal',
    chiefComplaint: 'Postprandial flatulence, severe dyspepsia, intractable nausea, autonomic orthostatic exhaustion after intellectual work.',
    intakeGoal: 'Restore vagal tone, modulate gastrointestinal enteric signaling, and rebalance autonomic tone.',
    vitalsSignature: [
      { label: 'Resting Heart Rate', value: '82 bpm', status: 'warning' },
      { label: 'HRV RMSSD', value: '28 ms', status: 'alert' },
      { label: 'Blood Pressure', value: '112/70 mmHg', status: 'normal' },
      { label: 'Allostatic Strain Index', value: '7.8 / 10', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['dyspepsia', 'nausea', 'vagus', 'vagal', 'dysautonomia', 'exhaustion'],
      physiologicalTrigger: 'Postprandial sympathetic dominance + vagal baroreflex suppression + gastroparesis',
      anatomicalSubstrate: 'Vagus nerve (CN X), celiac ganglion, enteric plexus, gastric fundus',
      diagnosticLensAffinity: 'Functional Protocols & Treatment Matrix'
    },
    gatingProbabilities: [
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 46.2, logit: 3.9, isTop1: true, isTop2: false, routingRationale: 'Vagal HRV bio-pacing trajectory simulation & parasympathetic recovery' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 25.1, logit: 3.3, isTop1: false, isTop2: true, routingRationale: '0.1 Hz resonant audio breathing entrainment & vagal feedback' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 12.3, logit: 2.6, isTop1: false, isTop2: false, routingRationale: 'Skeptical epistemology & allostatic load analysis' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 7.4, logit: 2.1, isTop1: false, isTop2: false, routingRationale: 'Autonomic testing benchmark alignment' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 3.8, logit: 1.4, isTop1: false, isTop2: false, routingRationale: 'Chronic dysautonomia longitudinal charting' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 2.7, logit: 1.0, isTop1: false, isTop2: false, routingRationale: 'Gentian botanical dosing safety' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 1.6, logit: 0.5, isTop1: false, isTop2: false, routingRationale: 'Enterochromaffin serotonin signaling' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.9, logit: -0.1, isTop1: false, isTop2: false, routingRationale: 'No peripheral orthopedic pathology' }
    ],
    resultingRouting: {
      primaryExpertId: 'counterfactual-simulator',
      primaryLabel: 'Counterfactual Simulator',
      primaryRatio: 65,
      secondaryExpertId: 'edge-ml-hud',
      secondaryLabel: 'Edge ML Audio Classifier',
      secondaryRatio: 35,
      bridgeTitle: '0.1 Hz Autonomic Resonant Vagal Coherence Bridge',
      bridgeMechanism: 'Diaphragmatic pacing at 6 breaths/min stimulates carotid baroreceptors, elevating cardiac vagal efferents.',
      bridgeActionableVector: 'Prescribe 15 minutes of 0.1 Hz audio-visual resonant breathing post-meals + digestive bitter tincture.',
      bridgeBenchmark: 'RMSSD HRV gain > 45ms, cessation of postprandial nausea',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Severe postprandial dysautonomia and vagal depletion triggered an autonomic recovery pathway. The SMoE router selected the Counterfactual Simulator (46.2%) to model vagal pacing outcomes, paired with Edge ML Audio/Bio-Haptics (25.1%) to deliver 0.1 Hz parasympathetic entrainment.'
  },

  p_frida_kahlo: {
    patientId: 'p_frida_kahlo',
    patientName: 'Frida Kahlo',
    demographic: '47y Female, Neuropathology & Somatosensory',
    clinicalDomain: 'Neuropathic Pain & Physical Rehabilitation',
    chiefComplaint: 'Severe central sensitization, burning causalgia, lower extremity allodynia, post-spinal fusion phantom pain.',
    intakeGoal: 'Implement somatic grounding, multimodal pain modulation, and mirror neuro-visual retraining.',
    vitalsSignature: [
      { label: 'Pain Acuity Score', value: '9 / 10', status: 'alert' },
      { label: 'Heart Rate', value: '88 bpm', status: 'warning' },
      { label: 'Blood Pressure', value: '132/84 mmHg', status: 'warning' },
      { label: 'DN4 Neuropathy Score', value: '8 / 10', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['allodynia', 'causalgia', 'phantom', 'sensitization', 'spine', 'dn4'],
      physiologicalTrigger: 'Dorsal horn microglial wind-up + thalamocortical pain network remodeling',
      anatomicalSubstrate: 'Spinothalamic tract, primary somatosensory cortex S1, lumbosacral plexus',
      diagnosticLensAffinity: 'RSNA Knee Abnormality & Summary Overview'
    },
    gatingProbabilities: [
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 39.5, logit: 3.7, isTop1: true, isTop2: false, routingRationale: 'Complex multi-axial trauma narrative capture & OARS patient perspective' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 31.8, logit: 3.5, isTop1: false, isTop2: true, routingRationale: '3D spatial structural visualization of orthopedic & pelvic trauma vectors' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 13.4, logit: 2.6, isTop1: false, isTop2: false, routingRationale: 'Mirror therapy neuroplasticity projection' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 7.8, logit: 2.0, isTop1: false, isTop2: false, routingRationale: 'Non-opioid adjuvant titration guard' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 3.7, logit: 1.3, isTop1: false, isTop2: false, routingRationale: 'Chronic pain quality metrics' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 2.1, logit: 0.7, isTop1: false, isTop2: false, routingRationale: 'Holistic rehabilitation summary' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 1.1, logit: 0.1, isTop1: false, isTop2: false, routingRationale: 'Substance P neurokinin modeling' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 0.6, logit: -0.4, isTop1: false, isTop2: false, routingRationale: 'Low vocal biomarker priority' }
    ],
    resultingRouting: {
      primaryExpertId: 'soap-generator',
      primaryLabel: 'SOAP Note Scribe',
      primaryRatio: 56,
      secondaryExpertId: 'knee-hologram',
      secondaryLabel: 'RSNA Knee Hologram',
      secondaryRatio: 44,
      bridgeTitle: 'Somatosensory Re-Mapping & Central Sensitization Mitigation Bridge',
      bridgeMechanism: 'Mirror neuro-visual feedback decouples pathological thalamocortical hyper-synchrony, resetting cortical S1 body schema.',
      bridgeActionableVector: 'Implement 20 min daily progressive mirror feedback; compound topical ketamine/gabapentin/amitriptyline cream.',
      bridgeBenchmark: 'DN-4 reduction < 4/10, 50% improvement in continuous pain-free standing',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Profound central sensitization and multi-trauma history elevated empathetic clinical scribing (SOAP Note Scribe 39.5%) to capture subjective trauma dynamics, alongside the 3D Biomechanical/Knee Hologram (31.8%) to spatially inspect pelvic and spinal stabilization loads.'
  },

  p_marie_curie: {
    patientId: 'p_marie_curie',
    patientName: 'Marie Curie',
    demographic: '66y Female, Hematology & Radiation Toxicology',
    clinicalDomain: 'Hematology & Radiation Toxicology',
    chiefComplaint: 'Profound fatigue, petechial hemorrhages on distal arms, normocytic normochromic anemia, chronic cumulative ionizing radiation exposure.',
    intakeGoal: 'Prevent bone marrow hypoplasia, administer cellular antioxidant scavengers, and institute environmental shielding.',
    vitalsSignature: [
      { label: 'Hemoglobin', value: '8.1 g/dL', status: 'alert' },
      { label: 'Platelet Count', value: '62 x 10^9 /L', status: 'alert' },
      { label: 'White Blood Cell Count', value: '2.4 x 10^9 /L', status: 'alert' },
      { label: 'Resting Heart Rate', value: '92 bpm', status: 'warning' }
    ],
    scannedTriggers: {
      matchedKeywords: ['radiation', 'ionizing', 'petechial', 'anemia', 'hypoplasia', 'radium'],
      physiologicalTrigger: 'Hydroxyl free-radical cascade + chromosomal double-strand DNA scission',
      anatomicalSubstrate: 'Bone marrow microenvironment, CD34+ hematopoietic progenitors, capillary endothelium',
      diagnosticLensAffinity: 'Physical Genomics & Environmental Exposomics'
    },
    gatingProbabilities: [
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 48.7, logit: 4.1, isTop1: true, isTop2: false, routingRationale: 'Ionizing radiation radiolytic cleavage kinetics & free radical scavenger modeling' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 24.2, logit: 3.4, isTop1: false, isTop2: true, routingRationale: 'Occupational radiation safety benchmarks & OSHA/IAEA standard protocols' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 11.5, logit: 2.6, isTop1: false, isTop2: false, routingRationale: 'N-acetylcysteine & amifostine cytoprotection dosing' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 7.8, logit: 2.2, isTop1: false, isTop2: false, routingRationale: 'Marrow cellularity recovery timeline' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 4.1, logit: 1.6, isTop1: false, isTop2: false, routingRationale: 'Hematology exposomics report' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 2.0, logit: 0.9, isTop1: false, isTop2: false, routingRationale: 'Occupational disease documentation' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 1.1, logit: 0.3, isTop1: false, isTop2: false, routingRationale: 'No acoustic respiratory findings' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.6, logit: -0.3, isTop1: false, isTop2: false, routingRationale: 'No localized articular focus' }
    ],
    resultingRouting: {
      primaryExpertId: 'biomolecular-physics',
      primaryLabel: 'Molecular Biophysics',
      primaryRatio: 67,
      secondaryExpertId: 'steeep-quality-hud',
      secondaryLabel: 'NAM STEEEP Quality Radar',
      secondaryRatio: 33,
      bridgeTitle: 'Radioprotective N-Acetylcysteine & Glutathione Scavenger Bridge',
      bridgeMechanism: 'Glutathione donors quench reactive oxygen species before secondary DNA strand scission occurs in hematopoietic stem cells.',
      bridgeActionableVector: 'Prescribe liposomal glutathione 500mg BID + NAC 1200mg BID + environmental radon/gamma containment.',
      bridgeBenchmark: 'Platelet stabilization > 100k, absolute neutrophil count > 1500 /uL',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Life-threatening pancytopenia and cumulative radionuclide exposure triggered an urgent biophysical defense. The router mobilized Molecular Biophysics (48.7%) to compute free-radical radiolytic scavenging kinetics, backed by the NAM STEEEP Quality Radar (24.2%) to enforce statutory occupational safety guidelines.'
  },

  p_edwin_smith_3: {
    patientId: 'p_edwin_smith_3',
    patientName: 'Edwin Smith',
    demographic: '62y Male, Orthopedics & Biomechanics',
    clinicalDomain: 'Spinal Biomechanics & Osteopathic Ergonomics',
    chiefComplaint: 'C5-C6 and C6-C7 cervical radiculopathy, thenar muscle atrophy, C6 dermatome numbness, severe paraspinal spasm.',
    intakeGoal: 'Biomechanical cervical mobilization, postural ergonomic realignment, and neuroforaminal decompression.',
    vitalsSignature: [
      { label: 'Neck Disability Index (NDI)', value: '44%', status: 'alert' },
      { label: 'Blood Pressure', value: '128/78 mmHg', status: 'normal' },
      { label: 'Grip Strength (Right)', value: '24 kg', status: 'warning' },
      { label: 'Spurling A Maneuver', value: 'Positive', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['cervical', 'c5-c6', 'radiculopathy', 'thenar', 'decompression', 'ergonomic'],
      physiologicalTrigger: 'Mechanical neuroforaminal stenosis + C6 root microvascular ischemia',
      anatomicalSubstrate: 'Cervical intervertebral discs C5-C7, uncinate processes, thenar abductor pollicis brevis',
      diagnosticLensAffinity: 'RSNA Knee Abnormality & Treatment Matrix'
    },
    gatingProbabilities: [
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 52.3, logit: 4.2, isTop1: true, isTop2: false, routingRationale: '3D structural skeletal biomechanics & neuroforaminal vector raymarching' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 26.4, logit: 3.5, isTop1: false, isTop2: true, routingRationale: 'Traction angle & mechanical decompression kinematic simulation' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 8.9, logit: 2.4, isTop1: false, isTop2: false, routingRationale: 'Surgical vs conservative outcome analysis' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 5.1, logit: 1.8, isTop1: false, isTop2: false, routingRationale: 'NASS cervical spine guidelines' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 3.4, logit: 1.4, isTop1: false, isTop2: false, routingRationale: 'Physiatry procedural notes' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 2.1, logit: 0.9, isTop1: false, isTop2: false, routingRationale: 'Non-steroidal anti-inflammatory safety' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 1.2, logit: 0.3, isTop1: false, isTop2: false, routingRationale: 'Nucleus pulposus hydration modeling' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 0.6, logit: -0.4, isTop1: false, isTop2: false, routingRationale: 'No acoustic pulmonary trigger' }
    ],
    resultingRouting: {
      primaryExpertId: 'knee-hologram',
      primaryLabel: 'RSNA Knee Hologram',
      primaryRatio: 66,
      secondaryExpertId: 'counterfactual-simulator',
      secondaryLabel: 'Counterfactual Simulator',
      secondaryRatio: 34,
      bridgeTitle: 'Vector Cervical Traction & Neuroforaminal Unloading Bridge',
      bridgeMechanism: 'A 15-degree mechanical flexion traction vector widens the C5-C6 foraminal cross-section by 2.4 mm, relieving nerve root venous congestion.',
      bridgeActionableVector: 'Prescribe over-the-door pneumatic traction at 12 lbs for 15 min BID, coupled with deep cervical flexor retraining.',
      bridgeBenchmark: 'NDI reduction to < 20%, complete reversal of thenar paresthesia',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Cervical radiculopathy with thenar atrophy immediately triggered the 3D Holographic Spatial Engine (52.3%) to inspect disc heights and nerve root apertures, coupled with the Counterfactual Simulator (26.4%) to calculate optimal traction angles for non-surgical neuroforaminal decompression.'
  },

  p_mara_santos: {
    patientId: 'p_mara_santos',
    patientName: 'Mara Santos',
    demographic: '14y Female, Pediatric Pulmonology',
    clinicalDomain: 'Pediatric Pulmonology & Rare Disease Genetics',
    chiefComplaint: 'Cystic Fibrosis (delta-F508 homozygous), viscous mucopurulent sputum, productive morning cough, plateaued growth curve.',
    intakeGoal: 'Optimize highly effective CFTR modulator therapy, high-frequency chest wall oscillation, and pancreatic enzyme dosing.',
    vitalsSignature: [
      { label: 'BMI Percentile', value: '3rd Percentile', status: 'alert' },
      { label: 'Pulse Oximetry (SpO2)', value: '95%', status: 'warning' },
      { label: 'Sweat Chloride', value: '98 mmol/L', status: 'alert' },
      { label: 'FEV1 Percent Predicted', value: '68%', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['cystic', 'fibrosis', 'cftr', 'pancreatic', 'trikafta', 'vest'],
      physiologicalTrigger: 'Defective CFTR epithelial chloride transport + dehydrated thick mucus plug',
      anatomicalSubstrate: 'Submucosal bronchial glands, pancreatic ductal epithelium, intestinal crypts',
      diagnosticLensAffinity: 'Treatment Matrix & Summary Overview'
    },
    gatingProbabilities: [
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 45.6, logit: 4.0, isTop1: true, isTop2: false, routingRationale: 'Pediatric weight-adjusted CFTR modulator & high-potency pancreatic enzyme titration' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 28.1, logit: 3.5, isTop1: false, isTop2: true, routingRationale: 'Cystic Fibrosis Foundation pediatric clinical guidelines' },
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 12.3, logit: 2.7, isTop1: false, isTop2: false, routingRationale: 'Weight gain & FEV1 trajectory modeling' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 6.2, logit: 2.0, isTop1: false, isTop2: false, routingRationale: 'Airway clearance sound monitoring' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 3.8, logit: 1.5, isTop1: false, isTop2: false, routingRationale: 'Pediatric rare disease summary' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 2.1, logit: 0.9, isTop1: false, isTop2: false, routingRationale: 'Specialist pediatric pulmonology note' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 1.3, logit: 0.4, isTop1: false, isTop2: false, routingRationale: 'CFTR gating conformation analysis' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.6, logit: -0.3, isTop1: false, isTop2: false, routingRationale: 'No peripheral joint involvement' }
    ],
    resultingRouting: {
      primaryExpertId: 'ismp-posology',
      primaryLabel: 'ISMP Posology Guard',
      primaryRatio: 62,
      secondaryExpertId: 'steeep-quality-hud',
      secondaryLabel: 'NAM STEEEP Quality Radar',
      secondaryRatio: 38,
      bridgeTitle: 'CFTR Potentiator Kinetic Coupling & High-Calorie Pancrelipase Titration Bridge',
      bridgeMechanism: 'Elexacaftor/Tezacaftor/Ivacaftor restores cell-surface CFTR channel gating, rehydrating airway surface liquid.',
      bridgeActionableVector: 'Prescribe weight-based Trikafta (2 morning orange tablets + 1 evening blue tablet with fat-containing meal) + PERT 2500 lipase units/kg/meal.',
      bridgeBenchmark: 'FEV1 gain > 15%, BMI velocity acceleration above 25th percentile',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Pediatric Cystic Fibrosis management demands zero-error weight-adjusted posology. The SMoE router dispatched the ISMP Posology Guard (45.6%) to safeguard complex CFTR modulator and enzyme dosing, while the NAM STEEEP Quality Radar (28.1%) anchored adherence to CF Foundation pediatric care guidelines.'
  },

  p_srinivasa_ramanujan: {
    patientId: 'p_srinivasa_ramanujan',
    patientName: 'Srinivasa Ramanujan',
    demographic: '32y Male, Infectious Disease & Nutrition',
    clinicalDomain: 'Infectious Hepatology & Nutritional Rehabilitation',
    chiefComplaint: 'Severe cachexia, right hypochondriac dull pain, remittent pyrexia, history of amebic dysentery with hepatic sequelae.',
    intakeGoal: 'Eradicate hepatic parasitic infection, initiate aggressive micronutrient re-alimentation, and heal mucosal barrier.',
    vitalsSignature: [
      { label: 'Body Weight', value: '49.0 kg', status: 'alert' },
      { label: 'Body Temperature', value: '99.8 °F', status: 'warning' },
      { label: 'Serum Albumin', value: '2.8 g/dL', status: 'alert' },
      { label: 'AST / ALT', value: '84 / 92 U/L', status: 'alert' }
    ],
    scannedTriggers: {
      matchedKeywords: ['cachexia', 'hepatic', 'amebiasis', 'malnutrition', 'hypochondriac', 'micronutrient'],
      physiologicalTrigger: 'Intestinal mucosal erosion + parasitic hepatic cytolysis + severe protein-calorie wasting',
      anatomicalSubstrate: 'Right hepatic lobe parenchyma, mesenteric portal circulation, ileal enterocytes',
      diagnosticLensAffinity: 'Treatment Matrix & Summary Overview'
    },
    gatingProbabilities: [
      { expertId: 'counterfactual-simulator', expertLabel: 'Counterfactual Simulator', probabilityPercent: 42.8, logit: 3.8, isTop1: true, isTop2: false, routingRationale: 'Nutritional re-alimentation weight trajectory & hepatic regeneration modeling' },
      { expertId: 'analysis-report', expertLabel: 'Multi-Lens Synthesizer', probabilityPercent: 27.9, logit: 3.4, isTop1: false, isTop2: true, routingRationale: 'Integrative Ayurvedic & Western hepatoprotective botanical synthesis' },
      { expertId: 'ismp-posology', expertLabel: 'ISMP Posology Guard', probabilityPercent: 13.5, logit: 2.7, isTop1: false, isTop2: false, routingRationale: 'Refeeding syndrome electrolyte titration (phosphate, potassium, zinc)' },
      { expertId: 'steeep-quality-hud', expertLabel: 'NAM STEEEP Quality Radar', probabilityPercent: 7.2, logit: 2.0, isTop1: false, isTop2: false, routingRationale: 'Infectious disease cure benchmarks' },
      { expertId: 'soap-generator', expertLabel: 'SOAP Note Scribe', probabilityPercent: 4.1, logit: 1.5, isTop1: false, isTop2: false, routingRationale: 'Longitudinal clinical encounter charting' },
      { expertId: 'biomolecular-physics', expertLabel: 'Molecular Biophysics', probabilityPercent: 2.5, logit: 1.0, isTop1: false, isTop2: false, routingRationale: 'Parasitic protease enzymatic inhibition' },
      { expertId: 'edge-ml-hud', expertLabel: 'Edge ML Audio Classifier', probabilityPercent: 1.2, logit: 0.3, isTop1: false, isTop2: false, routingRationale: 'No acoustic trigger' },
      { expertId: 'knee-hologram', expertLabel: 'RSNA Knee Hologram', probabilityPercent: 0.8, logit: -0.1, isTop1: false, isTop2: false, routingRationale: 'No peripheral joint focus' }
    ],
    resultingRouting: {
      primaryExpertId: 'counterfactual-simulator',
      primaryLabel: 'Counterfactual Simulator',
      primaryRatio: 60,
      secondaryExpertId: 'analysis-report',
      secondaryLabel: 'Multi-Lens Synthesizer',
      secondaryRatio: 40,
      bridgeTitle: 'Enteric Mucosal Restoration & Hepatic Regenerative Kinetics Bridge',
      bridgeMechanism: 'Targeted L-glutamine and zinc carnosine accelerate intestinal epithelial tight-junction repair while silymarin mitigates lipid peroxidation.',
      bridgeActionableVector: 'Prescribe phased micro-nutrient re-alimentation (B12 1000mcg IM weekly, elemental zinc 30mg, L-glutamine 5g BID, and milk thistle extract).',
      bridgeBenchmark: 'Weight gain +8kg in 12 weeks, normalization of transaminases (AST/ALT < 35 U/L)',
      noiseReductionPercent: 75,
      dormantShelfCount: 6
    },
    clinicalDecisionStory: 'Severe cachexia and hepatic amebiasis sequelae required a delicate re-alimentation strategy. The router positioned the Counterfactual Simulator (42.8%) to project re-feeding curves without triggering refeeding electrolyte collapse, while the Multi-Lens Synthesizer (27.9%) orchestrated multi-paradigm hepatic repair protocols.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ClinicalMoERouterService {
  // Safe optional patient state injection
  private readonly patientState: PatientStateService | null = (() => {
    try {
      return inject(PatientStateService, { optional: true });
    } catch {
      return null;
    }
  })();

  // Active clinical state signals (Compute & Backend MoE)
  readonly activeLens = signal<AnalysisLens>('Summary Overview');
  readonly hasAcousticTelemetry = signal<boolean>(false);
  readonly hasDICOMVolume = signal<boolean>(false);
  readonly customThinkingBudget = signal<number | null>(null);

  // Active UI Gating signals (Frontend & UX MoE)
  readonly pinnedExpertId = signal<string | null>(null);
  readonly activeTranscriptQuery = signal<string>('');
  readonly kValue = signal<number>(2); // Top-k (default 2)
  readonly activeScenario = signal<'default' | 'knee_oa' | 'diabetic_neuropathy' | 'acute_vitals'>('default');
  readonly activeShiftPatientId = signal<string | null>(null);
  readonly analysisViewMode = signal<'canvas' | 'lenses' | 'suites'>('canvas');

  /** Active 12-Hour Shift Roster Patient Record */
  readonly activeShiftPatient = computed<IShiftPatientRecord | null>(() => {
    const id = this.activeShiftPatientId();
    if (!id) return null;
    return SHIFT_CARE_PLAN_ROSTER.find(p => p.id === id) || null;
  });

  /** Active 12-Hour Shift Decision Flow Profile */
  readonly activeDecisionFlow = computed<IPatientDecisionFlow | null>(() => {
    const id = this.activeShiftPatientId();
    if (!id) return null;
    return SHIFT_DECISION_FLOW_MAP[id] || null;
  });

  /**
   * Gemini 2.5/3.x Thinking Model Reasoning Budget Configuration.
   * Dynamically assigns reasoning token budgets based on active clinical lens acuity.
   */
  readonly currentThinkingConfig = computed<IGeminiThinkingConfig>(() => {
    const custom = this.customThinkingBudget();
    const lens = this.activeLens();

    if (custom !== null) {
      let tier: 'Fast (Low Latency)' | 'Standard (Balanced)' | 'Deep Clinical Synthesis (High Acuity)' = 'Standard (Balanced)';
      if (custom <= 512) tier = 'Fast (Low Latency)';
      else if (custom >= 2048) tier = 'Deep Clinical Synthesis (High Acuity)';

      return {
        thinkingBudget: custom,
        includeThoughts: custom > 0,
        reasoningTier: tier
      };
    }

    switch (lens) {
      case 'Summary Overview':
      case 'Patient Education':
      case 'Console Debugging & Integrity':
        return {
          thinkingBudget: 0,
          includeThoughts: false,
          reasoningTier: 'Fast (Low Latency)'
        };

      case 'Teledentistry & Systemic Health':
      case 'RSNA Knee Abnormality':
      case 'PhysioNet Telemetry':
      case 'Treatment Matrix':
      case 'Maternal & Postpartum':
      case 'Pre-Conception & Family Health':
      case 'Environmental Exposomics & Toxicology':
      case 'Skeptical Epistemology & Socratic Audit':
        return {
          thinkingBudget: 2048,
          includeThoughts: true,
          reasoningTier: 'Deep Clinical Synthesis (High Acuity)'
        };

      case 'Functional Protocols':
      case 'Nutrition':
      case 'Monitoring & Follow-up':
      case 'Precision Nutrients':
      case 'Grow-Thyself Education':
      case 'Epigenetic Longevity':
      case 'Chronobiology Matrix':
      case 'Functional Medicine Matrix':
      case 'Seven Generations Stewardship':
      case 'Performance Optimization & Web Vitals':
      default:
        return {
          thinkingBudget: 1024,
          includeThoughts: true,
          reasoningTier: 'Standard (Balanced)'
        };
    }
  });

  // Sparse Activation Map: Route to expert sub-networks only when needed (Pathways MoE Paradigm)
  readonly activeExpertCluster = computed<IExpertSubnet[]>(() => {
    const lens = this.activeLens();
    const experts: IExpertSubnet[] = [];

    // Base LLM Expert is always active for general clinical synthesis
    experts.push({
      id: 'gulliver-core',
      name: 'Gulliver Base Clinical Synthesizer',
      lenses: ['Summary Overview', 'Functional Protocols', 'Patient Education'],
      requiresSidecar: false,
      requiresAudioStream: false,
      requires3DShader: false,
      estimatedFlopsGiga: 1.2
    });

    // Sparse Expert 1: Acoustic Respiratory Sidecar
    if (this.hasAcousticTelemetry() || lens === 'PhysioNet Telemetry') {
      experts.push({
        id: 'acoustic-sidecar',
        name: 'ONNX Acoustic Dyspnea Analyzer',
        lenses: ['PhysioNet Telemetry'],
        requiresSidecar: true,
        requiresAudioStream: true,
        requires3DShader: false,
        estimatedFlopsGiga: 0.15
      });
    }

    // Sparse Expert 2: Teledentistry SIBI Bridge
    if (lens === 'Teledentistry & Systemic Health') {
      experts.push({
        id: 'sibi-bridge',
        name: 'Periodontal Systemic Inflammatory Burden Engine',
        lenses: ['Teledentistry & Systemic Health'],
        requiresSidecar: true,
        requiresAudioStream: false,
        requires3DShader: false,
        estimatedFlopsGiga: 0.08
      });
    }

    // Sparse Expert 3: Spatial 3D DICOM Shader
    if (this.hasDICOMVolume() || lens === 'RSNA Knee Abnormality') {
      experts.push({
        id: 'dicom-spatial-shader',
        name: 'Three.js Spatial Tensor Shader',
        lenses: ['RSNA Knee Abnormality'],
        requiresSidecar: false,
        requiresAudioStream: false,
        requires3DShader: true,
        estimatedFlopsGiga: 0.45
      });
    }

    return experts;
  });

  // Calculate dynamic compute efficiency savings percentage vs a dense monolithic evaluation
  readonly computeEfficiencySavingsPercent = computed<number>(() => {
    const totalPossibleFlops = 1.2 + 0.15 + 0.08 + 0.45; // 1.88 GFLOPs total dense pass
    const activeFlops = this.activeExpertCluster().reduce((sum, e) => sum + e.estimatedFlopsGiga, 0);
    return Math.round((1 - (activeFlops / totalPossibleFlops)) * 100);
  });

  // ---------------------------------------------------------------------------
  // FRONTEND UI GATING ROUTER: Dynamic Top-k Sparse UI Distribution
  // ---------------------------------------------------------------------------

  /**
   * Computes the Softmax-normalized probability distribution across all registered UI Experts
   * based on active symptoms, vitals deviations, emergency acuity, and conversational cues.
   */
  readonly uiGatingScores = computed<IUiGatingScore[]>(() => {
    const transcript = this.activeTranscriptQuery().toLowerCase().trim();
    const lens = this.activeLens().toLowerCase();
    const pinnedId = this.pinnedExpertId();
    const scenario = this.activeScenario();
    const isEmergency = this.patientState?.isEmergencyMode() || false;
    const issues = this.patientState?.issues() || {};
    const vitals = this.patientState?.vitals();

    // Collect active issue keywords and body part IDs
    const activeBodyPartIds = Object.keys(issues).map(k => k.toLowerCase());
    const activeIssueDescriptions: string[] = [];
    for (const key of Object.keys(issues)) {
      const issueList = issues[key] || [];
      for (const it of issueList) {
        if (it.description) activeIssueDescriptions.push(it.description.toLowerCase());
        if (it.name) activeIssueDescriptions.push(it.name.toLowerCase());
        if (Array.isArray(it.symptoms)) {
          it.symptoms.forEach(s => {
            if (typeof s === 'string') activeIssueDescriptions.push(s.toLowerCase());
            else if (s && typeof s === 'object' && s.name) activeIssueDescriptions.push(s.name.toLowerCase());
          });
        }
      }
    }
    const combinedIssueText = activeIssueDescriptions.join(' ');

    // Check physiological vitals deviations
    const hr = parseFloat(vitals?.hr || '72');
    const cgm = parseFloat(vitals?.cgmGlucoseMgDl || '110');
    const isCgmHigh = cgm > 140;
    const isCgmLow = cgm < 70;
    const isHrElevated = hr > 100 || hr < 50;

    // Calculate raw activation score for each expert
    const rawScores = REGISTERED_UI_EXPERTS.map(expert => {
      let score = expert.defaultWeight;
      const rationaleParts: string[] = [];

      // 1. Scenario Presets
      if (scenario === 'knee_oa' && expert.id === 'knee-hologram') {
        score += 3.5;
        rationaleParts.push('Active RSNA Knee OA scenario selected');
      } else if (scenario === 'knee_oa' && expert.id === 'counterfactual-simulator') {
        score += 1.8;
        rationaleParts.push('Co-activated What-If joint kinematic projection');
      } else if (scenario === 'diabetic_neuropathy' && expert.id === 'ismp-posology') {
        score += 3.2;
        rationaleParts.push('Active Diabetic Neuropathy polypharmacy scenario');
      } else if (scenario === 'diabetic_neuropathy' && expert.id === 'counterfactual-simulator') {
        score += 2.1;
        rationaleParts.push('Co-activated glycemic trajectory simulator');
      } else if (scenario === 'acute_vitals' && expert.id === 'edge-ml-hud') {
        score += 3.4;
        rationaleParts.push('Active Acute Telemetry flare scenario');
      } else if (scenario === 'acute_vitals' && expert.id === 'soap-generator') {
        score += 1.9;
        rationaleParts.push('Co-activated Emergency encounter scribe');
      }

      // 2. Transcript & Ambient Scribe cues
      if (transcript) {
        let transcriptHits = 0;
        for (const kw of expert.relevanceKeywords) {
          if (transcript.includes(kw)) {
            transcriptHits++;
          }
        }
        if (transcriptHits > 0) {
          const boost = Math.min(2.5, transcriptHits * 0.7);
          score += boost;
          rationaleParts.push(`Conversational cue match (${transcriptHits} keywords)`);
        }
      }

      // 3. Body Part Mapping
      const hasBodyPartMatch = expert.associatedBodyParts.some(bp => activeBodyPartIds.includes(bp));
      if (hasBodyPartMatch) {
        score += 2.0;
        rationaleParts.push(`Patient symptom localized to ${expert.associatedBodyParts.join(', ')}`);
      }

      // 4. Clinical Issue Description Keyword Matches
      let issueHits = 0;
      for (const kw of expert.relevanceKeywords) {
        if (combinedIssueText.includes(kw)) {
          issueHits++;
        }
      }
      if (issueHits > 0) {
        score += Math.min(2.0, issueHits * 0.5);
        rationaleParts.push(`EHR symptom description keyword match (${issueHits})`);
      }

      // 5. Active Diagnostic Lens Alignment
      for (const kw of expert.relevanceKeywords) {
        if (lens.includes(kw)) {
          score += 1.8;
          rationaleParts.push(`Diagnostic lens affinity: ${expert.name}`);
          break;
        }
      }

      // 6. Vitals & Acuity Deviations
      if ((isCgmHigh || isCgmLow) && (expert.id === 'ismp-posology' || expert.id === 'counterfactual-simulator')) {
        score += 1.2;
        rationaleParts.push(`Glycemic deviation trigger (CGM: ${cgm} mg/dL)`);
      }
      if (isHrElevated && expert.id === 'edge-ml-hud') {
        score += 1.4;
        rationaleParts.push(`Hemodynamic deviation trigger (HR: ${hr} bpm)`);
      }
      if (isEmergency && expert.requiresHighAcuity) {
        score += 2.5;
        rationaleParts.push('STAT Emergency Acuity override');
      }

      // 7. Manual Pinning Override
      if (pinnedId === expert.id) {
        score += 12.0;
        rationaleParts.unshift('Clinician Manual Pin Override');
      }

      return {
        expert,
        rawScore: Math.max(0.01, score),
        rationale: rationaleParts.length > 0 ? rationaleParts.join('; ') : 'Baseline clinical prior'
      };
    });

    // Softmax normalization with temperature T = 0.85
    const temperature = 0.85;
    const maxZ = Math.max(...rawScores.map(r => r.rawScore / temperature));
    const expScores = rawScores.map(r => ({
      ...r,
      expZ: Math.exp((r.rawScore / temperature) - maxZ)
    }));
    const sumExp = expScores.reduce((acc, r) => acc + r.expZ, 0);

    const scored = expScores.map(r => ({
      expert: r.expert,
      rawScore: Math.round(r.rawScore * 100) / 100,
      weight: Math.round((r.expZ / sumExp) * 1000) / 1000,
      routingRationale: r.rationale,
      isPrimary: false,
      isSecondary: false,
      isPrewarmCandidate: (r.expZ / sumExp) >= 0.14
    }));

    // Sort descending by probability weight
    scored.sort((a, b) => b.weight - a.weight);

    // Mark Top-1 and Top-2
    if (scored.length > 0) scored[0].isPrimary = true;
    if (scored.length > 1) scored[1].isSecondary = true;

    return scored;
  });

  /** Primary UI Expert (Top-1 in Gating Distribution) */
  readonly primaryUiExpert = computed<IUiGatingScore | null>(() => {
    const scores = this.uiGatingScores();
    return scores.length > 0 ? scores[0] : null;
  });

  /** Secondary UI Expert (Top-2 in Gating Distribution) */
  readonly secondaryUiExpert = computed<IUiGatingScore | null>(() => {
    const scores = this.uiGatingScores();
    return scores.length > 1 ? scores[1] : null;
  });

  /** Dormant / Latent UI Experts Shelf (Rank 3+) */
  readonly latentUiExperts = computed<IUiGatingScore[]>(() => {
    const scores = this.uiGatingScores();
    const k = this.kValue();
    return scores.slice(k);
  });

  /** Dynamically detects and surfaces active Cross-Attention Bridges between Top-1 and Top-2 */
  readonly activeCrossAttentionBridge = computed<ICrossAttentionBridge | null>(() => {
    const p = this.primaryUiExpert();
    const s = this.secondaryUiExpert();
    if (!p || !s) return null;

    return CROSS_ATTENTION_BRIDGES.find(b =>
      (b.primaryExpertId === p.expert.id && b.secondaryExpertId === s.expert.id) ||
      (b.primaryExpertId === s.expert.id && b.secondaryExpertId === p.expert.id)
    ) || null;
  });

  /**
   * Dynamic Softmax Viewport Proportioning:
   * Computes the percentage width (55% to 72%) allocated to the Primary Expert,
   * with the remaining width (28% to 45%) allocated to the Secondary Expert.
   */
  readonly primaryViewportRatio = computed<number>(() => {
    const p = this.primaryUiExpert();
    const s = this.secondaryUiExpert();
    if (!p || !s) return 100;

    const totalWeight = p.weight + s.weight;
    if (totalWeight <= 0) return 60;

    const normalizedRatio = p.weight / totalWeight;
    // Ergonomically clamp between 55% and 72%
    return Math.min(72, Math.max(55, Math.round(normalizedRatio * 100)));
  });

  readonly secondaryViewportRatio = computed<number>(() => {
    return 100 - this.primaryViewportRatio();
  });

  /** Screen Noise Reduction Percentage compared to a monolithic dashboard with 8 open panels */
  readonly cognitiveNoiseReductionPercent = computed<number>(() => {
    const totalPanels = REGISTERED_UI_EXPERTS.length;
    const activeK = this.kValue();
    return Math.round((1 - (activeK / totalPanels)) * 100);
  });

  /** Screen Cognitive Load Index (0-100 scale) */
  readonly cognitiveLoadScore = computed<number>(() => {
    const p = this.primaryUiExpert();
    const s = this.secondaryUiExpert();
    const pScore = p ? p.expert.cognitiveComplexity * 10 : 0;
    const sScore = s ? s.expert.cognitiveComplexity * 10 : 0;
    // Scale and adjust for noise discount
    return Math.min(100, Math.round((pScore + sScore) * 0.6));
  });

  // ---------------------------------------------------------------------------
  // PUBLIC CONTROLS & EVENT HANDLERS
  // ---------------------------------------------------------------------------

  public setActiveLens(lens: AnalysisLens): void {
    this.activeLens.set(lens);
  }

  public setAcousticTelemetryState(active: boolean): void {
    this.hasAcousticTelemetry.set(active);
  }

  public setDICOMVolumeState(active: boolean): void {
    this.hasDICOMVolume.set(active);
  }

  public setCustomThinkingBudget(budget: number | null): void {
    this.customThinkingBudget.set(budget);
  }

  public pinExpert(expertId: string | null): void {
    this.pinnedExpertId.set(expertId);
  }

  public setTranscriptQuery(query: string): void {
    this.activeTranscriptQuery.set(query);
  }

  public setKValue(k: number): void {
    this.kValue.set(Math.max(1, Math.min(3, k)));
  }

  public promoteLatentExpert(expertId: string): void {
    this.pinnedExpertId.set(expertId);
  }

  public loadDemoScenario(scenario: 'default' | 'knee_oa' | 'diabetic_neuropathy' | 'acute_vitals'): void {
    this.pinnedExpertId.set(null);
    this.activeTranscriptQuery.set('');
    this.activeScenario.set(scenario);
    if (scenario === 'knee_oa') {
      this.setActiveLens('RSNA Knee Abnormality');
      this.setDICOMVolumeState(true);
    } else if (scenario === 'acute_vitals') {
      this.setActiveLens('PhysioNet Telemetry');
      this.setAcousticTelemetryState(true);
    } else {
      this.setActiveLens('Summary Overview');
      this.setDICOMVolumeState(false);
      this.setAcousticTelemetryState(false);
    }
  }

  public loadShiftPatient(patientId: string): void {
    const p = SHIFT_CARE_PLAN_ROSTER.find(item => item.id === patientId);
    if (!p) return;

    this.activeShiftPatientId.set(patientId);
    this.pinnedExpertId.set(p.targetExpertId || null);
    this.activeTranscriptQuery.set(p.intakeNote);
    this.activeScenario.set('default');

    if (this.patientState) {
      this.patientState.patientName.set(p.name);
      this.patientState.patientAge.set(parseInt(p.age, 10) || 0);
      this.patientState.patientGender.set(p.gender);

      if (p.id === 'p001') {
        this.patientState.vitals.update(v => ({ ...v, hr: '76', cgmGlucoseMgDl: '162', bp: '138/88' }));
      } else if (p.id === 'p002') {
        this.patientState.vitals.update(v => ({ ...v, hr: '94', spO2: '93%', bp: '124/82' }));
      } else if (p.id === 'p003') {
        this.patientState.vitals.update(v => ({ ...v, hr: '68', hrv: '38', bp: '118/74' }));
      } else if (p.id === 'p_charles_darwin') {
        this.patientState.vitals.update(v => ({ ...v, hr: '82', hrv: '28', bp: '112/70' }));
      } else if (p.id === 'p_frida_kahlo') {
        this.patientState.vitals.update(v => ({ ...v, hr: '88', bp: '132/84' }));
      }
    }

    if (p.id === 'p001' || p.id === 'p_mara_santos') {
      this.setActiveLens('Treatment Matrix');
      this.setDICOMVolumeState(false);
      this.setAcousticTelemetryState(false);
    } else if (p.id === 'p002') {
      this.setActiveLens('PhysioNet Telemetry');
      this.setAcousticTelemetryState(true);
      this.setDICOMVolumeState(false);
    } else if (p.id === 'p003') {
      this.setActiveLens('Chronobiology Matrix');
      this.setDICOMVolumeState(false);
      this.setAcousticTelemetryState(false);
    } else if (p.id === 'p004' || p.id === 'p_marie_curie') {
      this.setActiveLens('Physical Genomics');
      this.setDICOMVolumeState(false);
      this.setAcousticTelemetryState(false);
    } else if (p.id === 'p_edwin_smith_3' || p.id === 'p_frida_kahlo') {
      this.setActiveLens('RSNA Knee Abnormality');
      this.setDICOMVolumeState(true);
      this.setAcousticTelemetryState(false);
    } else {
      this.setActiveLens('Summary Overview');
      this.setDICOMVolumeState(false);
      this.setAcousticTelemetryState(false);
    }
  }

  public clearOverrides(): void {
    this.pinnedExpertId.set(null);
    this.activeShiftPatientId.set(null);
    this.activeTranscriptQuery.set('');
    this.activeScenario.set('default');
    this.setActiveLens('Summary Overview');
  }

  /**
   * Retrieves the structured decision flow for a specific clinical shift patient.
   */
  public getDecisionFlow(patientId: string): IPatientDecisionFlow | null {
    return SHIFT_DECISION_FLOW_MAP[patientId] || null;
  }

  /**
   * Returns all 10 clinical shift decision flows.
   */
  public getAllDecisionFlows(): IPatientDecisionFlow[] {
    return Object.values(SHIFT_DECISION_FLOW_MAP);
  }

  /**
   * Synthesizes an epistemic explainability briefing for the AI Agent Chat or UI explorer,
   * detailing the exact mathematical logit weights, temperature Softmax probabilities,
   * scanned triggers, and Synapse Cross-Attention Bridge.
   */
  public explainDecisionFlow(patientId: string): string {
    const flow = SHIFT_DECISION_FLOW_MAP[patientId];
    if (!flow) {
      return `No SMoE decision flow profile found for patient ID: ${patientId}.`;
    }
    const top1 = flow.gatingProbabilities.find(p => p.isTop1);
    const top2 = flow.gatingProbabilities.find(p => p.isTop2);
    const dormant = flow.gatingProbabilities.filter(p => !p.isTop1 && !p.isTop2);

    return `### 🧠 SMoE Gating Decision Analysis: ${flow.patientName} (${flow.demographic})
**Clinical Domain:** ${flow.clinicalDomain}
**Chief Complaint:** ${flow.chiefComplaint}
**Intake Goal:** ${flow.intakeGoal}

#### 1. Ingested Vitals & Biometric Telemetry
${flow.vitalsSignature.map(v => `- **${v.label}**: ${v.value} [${v.status.toUpperCase()}]`).join('\n')}

#### 2. Scanned Heuristic Triggers & Neural Keyword Extraction
- **Matched Cues:** \`${flow.scannedTriggers.matchedKeywords.join('`, `')}\`
- **Physiological Trigger:** ${flow.scannedTriggers.physiologicalTrigger}
- **Anatomical Substrate:** ${flow.scannedTriggers.anatomicalSubstrate}
- **Diagnostic Lens Affinity:** ${flow.scannedTriggers.diagnosticLensAffinity}

#### 3. Sparse Gating Softmax Distribution (Temperature T=0.85)
- 🥇 **Primary Top-1 Slot:** **${top1?.expertLabel || 'Primary Expert'}** — **${top1?.probabilityPercent || 0}%** (logit: ${top1?.logit ?? 'N/A'})
  *Rationale:* ${top1?.routingRationale || 'Clinical priority'}
- 🥈 **Secondary Top-2 Slot:** **${top2?.expertLabel || 'Secondary Expert'}** — **${top2?.probabilityPercent || 0}%** (logit: ${top2?.logit ?? 'N/A'})
  *Rationale:* ${top2?.routingRationale || 'Stepped-care support'}
- 💤 **Dormant Shelf (6 Experts Shelved):** ${dormant.map(d => `${d.expertLabel} (${d.probabilityPercent}%)`).join(', ')}

#### 4. Synapse Cross-Attention Bridge Active
- **Bridge Title:** ${flow.resultingRouting.bridgeTitle}
- **Mechanism:** ${flow.resultingRouting.bridgeMechanism}
- **Actionable Vector:** ${flow.resultingRouting.bridgeActionableVector}
- **Target Clinical Benchmark:** ${flow.resultingRouting.bridgeBenchmark}
- **Cognitive Shield Impact:** **+${flow.resultingRouting.noiseReductionPercent}% noise reduction** (shelving 6 dormant experts to prevent clinical alarm fatigue).

*Synthesis Narrative:* ${flow.clinicalDecisionStory}`;
  }

  /**
   * Evaluates an individual patient record into an ESI Level 1-5 Acuity Tier,
   * calculates NEWS2 early warning score, extracts vital outliers, and pre-computes
   * the SMoE Top-2 UI Expert slot allocation and Synapse Cross-Attention Bridges.
   */
  public evaluatePatientTriage(patient: IPatient): IPatientTriageEvaluation {
    const vitals = (patient.vitals || {}) as Record<string, string>;
    const bp = vitals['bp'] || '120/80';
    const hr = parseFloat(vitals['hr'] || '72');
    const spO2Str = vitals['spO2'] || '98%';
    const spO2 = parseFloat(spO2Str.replace('%', '')) || 98;
    const tempStr = vitals['temp'] || '98.6°F';
    const temp = parseFloat(tempStr.replace('°F', '').replace('F', '')) || 98.6;

    // Parse Blood Pressure
    const bpParts = bp.split('/');
    const sysBp = parseInt(bpParts[0] || '120', 10) || 120;

    const criticalOutliers: string[] = [];
    if (sysBp >= 170 || sysBp <= 90) criticalOutliers.push(`Systolic BP ${sysBp} mmHg`);
    if (spO2 < 93) criticalOutliers.push(`SpO2 ${spO2}% (Hypoxemia)`);
    if (hr >= 115 || hr <= 48) criticalOutliers.push(`Heart Rate ${hr} bpm`);
    if (temp >= 101.5 || temp <= 95) criticalOutliers.push(`Temperature ${temp}°F`);

    // Calculate NEWS2 Score
    let news2 = 0;
    // Respiration / SpO2
    if (spO2 <= 91) news2 += 3;
    else if (spO2 <= 93) news2 += 2;
    else if (spO2 <= 95) news2 += 1;
    // Systolic BP
    if (sysBp <= 90 || sysBp >= 220) news2 += 3;
    else if (sysBp <= 100) news2 += 2;
    else if (sysBp <= 110) news2 += 1;
    // Pulse
    if (hr <= 40 || hr >= 131) news2 += 3;
    else if (hr >= 111 || hr <= 50) news2 += 2;
    else if (hr >= 91) news2 += 1;
    // Temp
    if (temp <= 95.0) news2 += 3;
    else if (temp >= 102.4) news2 += 2;
    else if (temp <= 96.8 || temp >= 100.4) news2 += 1;

    // Conditions and Chief Complaint text
    const condText = [
      ...(patient.preexistingConditions || []),
      patient.patientGoals || '',
      patient.id,
      patient.name
    ].join(' ').toLowerCase();

    // ESI Determination
    let esiLevel: 1 | 2 | 3 | 4 | 5 = 3;
    let esiLabel = 'ESI-3 • Urgent Multi-System';
    let acuityTier: IPatientTriageEvaluation['acuityTier'] = 'Urgent Multi-System';
    let badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    let badgeText = 'text-amber-300';
    let borderClass = 'border-amber-500/40 hover:border-amber-400';
    let priorityRationale = 'Requires multi-lens clinical synthesis and stepped-care intervention.';
    let targetMaxWaitMinutes = 30;

    // Level 1 criteria: Life threatening or severe hypoxemia/shock or radiation/aplastic crisis
    if (
      spO2 < 90 ||
      sysBp <= 85 ||
      condText.includes('radiation') ||
      condText.includes('aplastic') ||
      condText.includes('pancytopenia') ||
      (condText.includes('ischemic') && spO2 <= 92) ||
      condText.includes('resuscitation')
    ) {
      esiLevel = 1;
      esiLabel = 'ESI-1 • STAT Resuscitation';
      acuityTier = 'STAT Emergency';
      badgeBg = 'bg-red-600/30 text-red-200 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse';
      badgeText = 'text-red-300';
      borderClass = 'border-red-600/80 hover:border-red-500 shadow-red-950/30';
      priorityRationale = 'Immediate physician evaluation required; life-threatening metabolic, hemodynamic, or radiolytic compromise.';
      targetMaxWaitMinutes = 0;
    }
    // Level 2 criteria: High risk, severe pain, hypertensive crisis, sentinel case, severe OSA with hypoxia
    else if (
      sysBp >= 148 ||
      criticalOutliers.length > 0 ||
      condText.includes('trauma') ||
      condText.includes('polio') ||
      condText.includes('sentinel') ||
      condText.includes('severe obstructive sleep apnea') ||
      condText.includes('intractable pain') ||
      condText.includes('copd')
    ) {
      esiLevel = 2;
      esiLabel = 'ESI-2 • Emergent Sentinel';
      acuityTier = 'Emergent Sentinel';
      badgeBg = 'bg-orange-500/20 text-orange-200 border border-orange-500/50';
      badgeText = 'text-orange-300';
      borderClass = 'border-orange-500/60 hover:border-orange-400';
      priorityRationale = 'High-risk clinical presentation; severe pain, hypertensive stress, or organ system instability.';
      targetMaxWaitMinutes = 10;
    }
    // Level 4 criteria: Focused, single complaint, stable vitals
    else if (
      (patient.preexistingConditions || []).length <= 1 &&
      news2 <= 1 &&
      !criticalOutliers.length &&
      (condText.includes('lifestyle') || condText.includes('sprain') || condText.includes('mild'))
    ) {
      esiLevel = 4;
      esiLabel = 'ESI-4 • Less Urgent';
      acuityTier = 'Less Urgent';
      badgeBg = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      badgeText = 'text-emerald-400';
      borderClass = 'border-emerald-500/30 hover:border-emerald-400';
      priorityRationale = 'Single focused diagnostic issue with stable physiological telemetry.';
      targetMaxWaitMinutes = 60;
    }
    // Level 5 criteria: Preventive wellness check
    else if (
      patient.id === 'p_default_patient' ||
      condText.includes('preventive') ||
      condText.includes('wellness') ||
      condText.includes('checkup')
    ) {
      esiLevel = 5;
      esiLabel = 'ESI-5 • Non-Urgent';
      acuityTier = 'Non-Urgent Maintenance';
      badgeBg = 'bg-zinc-800 text-zinc-300 border border-zinc-700';
      badgeText = 'text-zinc-400';
      borderClass = 'border-zinc-800 hover:border-zinc-700';
      priorityRationale = 'Routine preventive health maintenance; baseline demographic and lifestyle audit.';
      targetMaxWaitMinutes = 120;
    }

    // Compute SMoE Expert Gating for this patient
    const rawScores = REGISTERED_UI_EXPERTS.map(expert => {
      let score = expert.defaultWeight;

      // Keyword matches
      let hits = 0;
      for (const kw of expert.relevanceKeywords) {
        if (condText.includes(kw)) {
          hits++;
        }
      }
      if (hits > 0) score += Math.min(3.5, hits * 0.8);

      // Body part issues
      if (patient.issues) {
        for (const bp of expert.associatedBodyParts) {
          if (patient.issues[bp]) score += 2.0;
        }
      }

      // Vitals influences
      if (expert.id === 'edge-ml-hud' && (spO2 < 95 || hr > 90)) score += 1.8;
      if (expert.id === 'ismp-posology' && (sysBp >= 140 || (patient.medications && patient.medications.length >= 3))) score += 2.2;
      if (expert.id === 'counterfactual-simulator' && (condText.includes('diabetes') || condText.includes('metabolic') || condText.includes('trajectory'))) score += 2.0;
      if (expert.id === 'biomolecular-physics' && (condText.includes('radiation') || condText.includes('antibody') || condText.includes('autoimmune') || condText.includes('curie'))) score += 3.5;
      if (expert.id === 'knee-hologram' && (condText.includes('knee') || condText.includes('joint') || condText.includes('ortho') || condText.includes('bone') || condText.includes('spine') || condText.includes('trauma'))) score += 3.2;

      return { expert, rawScore: score };
    });

    // Softmax normalization (T = 0.85)
    const T = 0.85;
    const maxLogit = Math.max(...rawScores.map(r => r.rawScore));
    const exps = rawScores.map(r => Math.exp((r.rawScore - maxLogit) / T));
    const sumExps = exps.reduce((acc, v) => acc + v, 0);

    const ranked = rawScores.map((r, i) => ({
      expert: r.expert,
      prob: Math.round((exps[i] / sumExps) * 1000) / 10
    })).sort((a, b) => b.prob - a.prob);

    const top1 = ranked[0];
    const top2 = ranked[1];

    const predictedTopExperts = [
      {
        id: top1.expert.id,
        name: top1.expert.name,
        icon: top1.expert.icon,
        probabilityPercent: top1.prob,
        routingRationale: `Primary slot: high affinity for ${top1.expert.category}`
      },
      {
        id: top2.expert.id,
        name: top2.expert.name,
        icon: top2.expert.icon,
        probabilityPercent: top2.prob,
        routingRationale: `Secondary slot: stepped-care co-activation`
      }
    ];

    // Synapse Cross-Attention Bridge Detection
    let crossAttentionSynapse: IPatientTriageEvaluation['crossAttentionSynapse'];
    const pairKey = [top1.expert.id, top2.expert.id].sort().join('+');
    if (pairKey.includes('knee-hologram') && pairKey.includes('counterfactual-simulator')) {
      crossAttentionSynapse = {
        title: 'Mechanical ⟷ Kinematic Synapse Bridge',
        mechanism: 'Joint space narrowing coupling with 6-month mobility trajectory'
      };
    } else if (pairKey.includes('ismp-posology') && pairKey.includes('counterfactual-simulator')) {
      crossAttentionSynapse = {
        title: 'Metabolic ⟷ Microvascular Synapse Bridge',
        mechanism: 'Glycemic stabilization co-modeling with posology titration'
      };
    } else if (pairKey.includes('biomolecular-physics') && pairKey.includes('ismp-posology')) {
      crossAttentionSynapse = {
        title: 'Immunological ⟷ Receptor Pharmacokinetics Bridge',
        mechanism: 'Receptor affinity kinetics aligned with low-dose micro-titration'
      };
    }

    return {
      patient,
      esiLevel,
      esiLabel,
      acuityTier,
      news2Score: news2,
      badgeBg,
      badgeText,
      borderClass,
      vitalsSummary: {
        bp,
        hr: `${hr} bpm`,
        spO2: `${spO2}%`,
        temp: `${temp}°F`,
        hasCriticalOutlier: criticalOutliers.length > 0,
        criticalOutliers
      },
      predictedTopExperts,
      crossAttentionSynapse,
      priorityRationale,
      targetMaxWaitMinutes
    };
  }

  /**
   * Evaluates all enrolled patients into a triage ranking, sorted primarily by
   * Emergency Severity Index (ESI Level 1 to 5) and secondarily by NEWS2 early warning score.
   */
  public evaluateAllPatientsTriage(patients: IPatient[]): IPatientTriageEvaluation[] {
    return patients
      .map(p => this.evaluatePatientTriage(p))
      .sort((a, b) => {
        // Primary sort: ESI Level ascending (1 is most critical, 5 is least)
        if (a.esiLevel !== b.esiLevel) return a.esiLevel - b.esiLevel;
        // Secondary sort: NEWS2 descending (higher score is higher risk)
        return b.news2Score - a.news2Score;
      });
  }
}
