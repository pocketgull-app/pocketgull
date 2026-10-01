import { Injectable, signal, computed, inject } from '@angular/core';
import { AnalysisLens } from './clinical-intelligence.service';
import { PatientStateService } from './patient-state.service';

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

export type UiExpertCategory =
  | 'spatial-anatomy'
  | 'pharmacology'
  | 'counterfactual'
  | 'diagnostic-radar'
  | 'ambient-scribe'
  | 'biophysics-genomics'
  | 'clinical-synthesis';

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
  telemetrySource: 'Local Edge Wasm' | 'WebGPU Shader' | 'Gemini 3.8 Flash' | 'Gemini 3.8 Pro Deep Think';
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

  /** Active 12-Hour Shift Roster Patient Record */
  readonly activeShiftPatient = computed<IShiftPatientRecord | null>(() => {
    const id = this.activeShiftPatientId();
    if (!id) return null;
    return SHIFT_CARE_PLAN_ROSTER.find(p => p.id === id) || null;
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
}
