import { AnalysisLens } from './clinical-intelligence.service';

export interface IPatientAnatomicProfile {
  amputations: Array<'r_arm' | 'l_arm' | 'r_hand' | 'l_hand' | 'r_thigh' | 'r_shin' | 'r_foot' | 'l_thigh' | 'l_shin' | 'l_foot'>;
  phantomLimbPain: Array<{
    limbId: string;
    intensity: number;
    phantomAvsFrequencyHz: number;
  }>;
  customLiDARScanUrl?: string | null;
}

export const BODY_PART_NAMES: Record<string, string> = {
    'head': 'Head & Neck',
    'chest': 'Chest & Upper Torso',
    'abdomen': 'Abdomen & Stomach',
    'pelvis': 'Pelvis & Hips',
    'r_shoulder': 'Right Shoulder',
    'r_arm': 'Right Arm',
    'r_hand': 'Right Hand & Wrist',
    'l_shoulder': 'Left Shoulder',
    'l_arm': 'Left Arm',
    'l_hand': 'Left Hand & Wrist',
    'r_thigh': 'Right Thigh',
    'r_shin': 'Right Lower Leg',
    'r_foot': 'Right Foot',
    'l_thigh': 'Left Thigh',
    'l_shin': 'Left Lower Leg',
    'l_foot': 'Left Foot'
};

export const BODY_PART_MAPPING: Record<string, string> = {
    'head': 'head',
    'skull': 'head',
    'face': 'head',
    'neck': 'head',
    'chest': 'chest',
    'torso': 'chest',
    'stomach': 'abdomen',
    'abdomen': 'abdomen',
    'belly': 'abdomen',
    'hips': 'pelvis',
    'pelvis': 'pelvis',
    'groin': 'pelvis',
    'right shoulder': 'r_shoulder',
    'right arm': 'r_arm',
    'right bicep': 'r_arm',
    'right elbow': 'r_arm',
    'right forearm': 'r_arm',
    'right hand': 'r_hand',
    'right wrist': 'r_hand',
    'right fingers': 'r_fingers',
    'right thumb': 'r_fingers',
    'left shoulder': 'l_shoulder',
    'left arm': 'l_arm',
    'left bicep': 'l_arm',
    'left elbow': 'l_arm',
    'left forearm': 'l_arm',
    'left hand': 'l_hand',
    'left wrist': 'l_hand',
    'left fingers': 'l_fingers',
    'left thumb': 'l_fingers',
    'right thigh': 'r_thigh',
    'right upper leg': 'r_thigh',
    'right knee': 'r_shin',
    'right shin': 'r_shin',
    'right calf': 'r_shin',
    'right lower leg': 'r_shin',
    'right ankle': 'r_foot',
    'right foot': 'r_foot',
    'right toes': 'r_toes',
    'left thigh': 'l_thigh',
    'left upper leg': 'l_thigh',
    'left knee': 'l_shin',
    'left shin': 'l_shin',
    'left calf': 'l_shin',
    'left lower leg': 'l_shin',
    'left ankle': 'l_foot',
    'left foot': 'l_foot',
    'left toes': 'l_toes',
    'upper back': 'upper_back',
    'lower back': 'lower_back',
    'spine': 'upper_back',
    'back': 'upper_back',
    'glutes': 'glutes',
    'buttocks': 'glutes',
    'bottom': 'glutes'
};

export interface IPatientSymptom {
    name: string;
    type?: string;
    verified?: boolean;
    timeline?: string;
    [key: string]: any;
}

export interface IBodyPartIssue {
    id: string; // body part id
    noteId: string; // unique note id
    name: string;
    painLevel: number; // 1-10
    description: string;
    symptoms: (string | IPatientSymptom)[];
    recommendation?: string;
    // Tri-Paradigm Diagnostic Matrix (TDM) Extensions
    tcmPattern?: string;          // TCM disharmony mapping (e.g., Qi Stagnation)
    ayurvedicImbalance?: string;  // Ayurvedic dosha imbalance (e.g., Vata Aggravation)
}

export interface ICmpLabs {
    // Cardiac
    troponinI?: string;
    ntProBnp?: string;
    ckMb?: string;
    // Hepatic / Liver
    alt?: string;
    ast?: string;
    alp?: string;
    totalBilirubin?: string;
    albumin?: string;
    // Renal / Kidneys
    egfr?: string;
    creatinine?: string;
    bun?: string;
    sodium?: string;
    potassium?: string;
    // Gastric / Metabolic
    glucose?: string;
    hba1c?: string;
    lipase?: string;
    amylase?: string;
    bicarbonate?: string;
    // Inflammatory / Skeletal
    hsCrp?: string;
    calcium?: string;
    uricAcid?: string;
}

export interface IPatientVitals {
    bp: string;      // Blood Pressure
    hr: string;      // Heart Rate
    temp: string;    // Temperature
    spO2: string;    // Oxygen Saturation
    weight: string;
    height: string;
    // Continuous Glucose Monitoring (CGM)
    cgmGlucoseMgDl?: string;
    // Biochemical Telemetry
    vitC?: string;
    vitD3?: string;
    magnesium?: string;
    zinc?: string;
    b12?: string;
    // Comprehensive Metabolic Panel (CMP)
    cmpLabs?: ICmpLabs;
    // Activity & Autonomic Telemetry
    steps?: string;
    sleepEfficiency?: string;
    hrvRmssd?: string;
    crp?: string;
    [key: string]: any;
}

export interface IDynamicMarker {
    id: string;
    name: string;
    value: string;
}

export interface IBiometricEntry {
    timestamp: string; // ISO string
    type: keyof IPatientVitals | 'pain' | 'hrv' | 'coherence' | 'breathing';
    value: string | number;
    unit?: string;
    source?: string;
}

export interface IClinicalNote {
    id: string;
    text: string;
    sourceLens: string;
    date: string;
}

export interface IDiagnosticScan {
    id: string;
    type: 'MRI' | 'X-Ray' | 'CT Scan' | 'Ultrasound' | 'Lab Report' | 'Document';
    title: string;
    date: string;
    bodyPartId?: string;
    description: string;
    status: 'Normal' | 'Abnormal' | 'Pending' | 'Reviewed';
    imageUrl?: string;
}

export interface IChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface IDraftSummaryItem {
    id: string;
    text: string;
}

export interface IShoppingListItem {
    id: string;
    name: string;
    completed: boolean;
    category?: string;
    referenceNotion?: string;
}

export interface IAyurvedicStatus {
    prakriti?: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridosha';
    vikriti?: string;      // Current doshic imbalance state
    agniStatus?: 'Sama' | 'Vishama' | 'Tikshna' | 'Manda';
    amaStatus?: 'Nirama' | 'Sama'; // Toxic accumulation status
    affectedDhatus?: ('Rasa' | 'Rakta' | 'Mamsa' | 'Medas' | 'Asthi' | 'Majja' | 'Shukra')[];
    blockedSrotas?: string[];
    dominantGunas?: string[];
}

export interface IFunctionalMedicineTelemetry {
    inflammatoryScore: number; // 0-100
    hsCrpEstimate: string; // e.g. "2.4 mg/L"
    mitochondrialReserve: number; // 0-100 %
    atpSynthesisRate: string; // e.g. "94% Optimal"
    mucosalBarrierIntegrity: number; // 0-100 %
    zonulinIndex: string; // e.g. "Normal (18 ng/mL)"
    detoxificationCapacity: number; // 0-100 %
    activeNode: 'Assimilate' | 'Defense & Repair' | 'Energize' | 'Biotransformation' | 'Transport' | 'Communication' | 'Structural';
}

export interface IChronobiologyTelemetry {
    circadianDisruptionIndex: number; // 0-100
    scnPhase: 'Morning Peak' | 'Solar Zenith' | 'Dusk Transition' | 'Melatonin Onset' | 'Nadir';
    bmal1ExpressionPct: number; // 0-100%
    per2DiurnalSlope: string; // e.g. "Steep (-0.45 ug/dL/hr)"
    melatoninAmplitude: 'Robust' | 'Suppressed' | 'Blunted';
    trfWindowHours: string; // e.g. "10:00 - 18:00 (8h TRF)"
}

export interface IPatientState {
    issues: Record<string, IBodyPartIssue[]>;
    patientGoals: string;
    vitals: IPatientVitals;
    ayurvedicStatus?: IAyurvedicStatus;
    functionalMedicineTelemetry?: IFunctionalMedicineTelemetry;
    chronobiologyTelemetry?: IChronobiologyTelemetry;
    dynamicNutrients?: IDynamicMarker[];
    oxidativeStressMarkers?: IDynamicMarker[];
    antioxidantSources?: IDynamicMarker[];
    medications?: IDynamicMarker[];
    biometricHistory?: IBiometricEntry[];
    clinicalNotes?: IClinicalNote[];
    checklist?: IChecklistItem[];
    shoppingList?: IShoppingListItem[];
    scans?: IDiagnosticScan[];
    /** Patient's occupational category — used to select AVS co-regulation profile. */
    occupation?: string;
    /** Chief complaint / reason for this encounter (may differ from patientGoals). */
    reasonForVisit?: string;
    /** Dietary Protocol / Nutrition Strategy for patient. */
    dietaryProtocol?: string;
    /** Trauma safety flags extracted from chart — gates AVS protocol selection. */
    traumaFlags?: ITraumaFlags;
    /** Current AI-generated AVS co-regulation protocol. */
    avsProtocol?: IAvsProtocol;
    /** Selected medical paradigm / philosophy mode. */
    activePhilosophy?: 'western' | 'eastern' | 'ayurvedic' | 'osteopathic';
    /** Eastern TCM Diagnostic Intake findings. */
    tcmIntake?: ITcmIntake;
    /** Ayurvedic Tridosha & Ashtavidha Intake findings. */
    ayurvedicIntake?: IAyurvedicIntake;
    /** Custom expansive key-value biomarker and note fields. */
    customFields?: { key: string; value: string }[];
    genomicVariants?: IGeneticVariant[];
    biochemicalPathways?: IBiochemicalPathway[];
    pkInteractions?: IPharmacokineticInteraction[];
    ewarsAlerts?: IEwarsOutbreakAlert[];
    travelProfile?: ITravelMedicineProfile;
    awareStewardship?: IWhoAwareClassification[];
    environmentalIndex?: IEnvironmentalHealthIndex;
    [key: string]: any;
}

export interface IEwarsOutbreakAlert {
    id: string;
    pathogen: string;
    viralCopyCount: string; // e.g., "4.2x10^5 copies/mL (CDC NWSS)"
    surgeStatus: 'Baseline' | 'Monitoring' | 'Active Surge' | 'Outbreak Alert';
    whoBulletin: string;
    riskToPatient: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface ITravelMedicineProfile {
    destination: string;
    departureDate: string;
    cdcNoticeLevel: 'Level 1 - Watch' | 'Level 2 - Alert' | 'Level 3 - Avoid';
    requiredVaccines: string[];
    vectorRisks: string[];
    prophylacticProtocol: string[];
}

export interface IWhoAwareClassification {
    medication: string;
    category: 'Access' | 'Watch' | 'Reserve';
    resistanceRisk: 'Low' | 'Moderate' | 'High';
    stewardshipNote: string;
}

export interface IEnvironmentalHealthIndex {
    aqi: number;
    pm25: string;
    ozone: string;
    pollenDensity: 'Low' | 'Moderate' | 'High' | 'Severe';
    heatIndex: string;
    vulnerabilityWarning: string;
}

export interface IGeneticVariant {
    rsId: string;
    gene: string;
    chromosome: string;
    position: string;
    genotype: string;
    clinicalSignificance: string;
    pathogenicity: 'Benign' | 'Likely Benign' | 'VUS' | 'Likely Pathogenic' | 'Pathogenic';
}

export interface IBiochemicalPathway {
    id: string;
    name: string;
    status: 'Optimal' | 'Sub-optimal' | 'Blocked';
    activeEnzymes: string[];
    blocks: string[];
}

export interface IPharmacokineticInteraction {
    agent: string;
    target: string;
    affinity: string; // e.g., "Ki = 1.2 nM" or similar bioactivity value
    effect: string;   // e.g., "Inhibition", "Activation"
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface ITcmIntake {
    tongueColor?: 'pale' | 'pink' | 'red' | 'scarlet' | 'purple';
    tongueCoating?: 'thin-white' | 'thick-white' | 'yellow-dry' | 'yellow-greasy' | 'peeled';
    pulseQuality?: 'normal' | 'wiry' | 'slippery' | 'deep-thready' | 'floating-rapid' | 'choppy';
    thermalPreference?: 'neutral' | 'aversion-cold' | 'aversion-heat' | 'afternoon-tidal-heat';
    sweatPattern?: 'normal' | 'spontaneous-day' | 'night-sweats' | 'none';
    tasteInMouth?: 'normal' | 'bitter' | 'sweet' | 'metallic' | 'bland';
    tcmPattern?: string;
}

export interface IAyurvedicIntake {
    prakritiVata?: number;
    prakritiPitta?: number;
    prakritiKapha?: number;
    vikritiVata?: number;
    vikritiPitta?: number;
    vikritiKapha?: number;
    agniType?: 'samagni' | 'vishamagni' | 'tikshnagni' | 'mandagni';
    amaScore?: number;
    nadiPulseType?: 'snake-vata' | 'frog-pitta' | 'swan-kapha';
    ashtavidhaStatus?: string;
    ayurvedicImbalance?: string;
}

/**
 * Trauma safety flags — gates AVS protocol selection.
 * These are extracted from clinical notes and medications by ClinicalContextAvsService.
 * Contraindicated flags block AVS from activating.
 */
export interface ITraumaFlags {
    hasPtsd: boolean;
    hasSeizureDisorder: boolean;
    hasDissociativeEpisodes: boolean;
    hasCombatTrauma: boolean;
    hasActivePsychosis: boolean;
    hasPhotosensitivity: boolean;
    hasStimulantMedication: boolean;
    acuteSuicidality: boolean;
    /** Free-text known triggers (extracted from notes). */
    knownTriggers: string[];
}

export interface IAvsNarrativeStage {
  stageNumber: number;
  name: string; // e.g. "Stage 1: Sympathetic Induction", "Stage 2: Deep Vagal Entrainment", "Stage 3: Harmonic Integration", "Stage 4: Cognitive Awakening"
  durationSeconds: number; // e.g. 180, 540, 240, 240
  targetWave: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  targetHz: number; // e.g. 12, 7.83, 528, 10
  solfeggioToneHz: number; // e.g. 174, 432, 528, 639
  narrativeDescription: string;
}

export interface IAvsProtocol {
    wave: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
    breathing_bpm: number;
    color_palette: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose-earth';
    noise_type: 'brown' | 'pink' | 'white';
    breath_ratio: { inhale: number; hold: number; exhale: number; };
    /** Clinician-facing intent statement (clinical framing). */
    session_intent: string;
    /** Patient-facing message (wellness framing, no diagnoses). */
    patient_message: string;
    /** Non-blocking advisory warnings for the clinician. */
    safety_flags: string[];
    /** Blocking conditions — AVS will not activate if any are present. */
    contraindications: string[];
    generated_at: number;
    context_hash: string;
    /** Prescribed session duration in minutes (5-20 min range, 15 min default). */
    session_duration_minutes?: number;
    /** Safety auto-cutoff toggle ensuring session hard-stops when session timer expires. */
    auto_cutoff_enabled?: boolean;
    /** 4-Stage Therapeutic Narrative Arc Exploration. */
    narrative_arc?: IAvsNarrativeStage[];
}

/**
 * Disorders of Consciousness (DOC) classification.
 * Drives which stimulation approach is clinically indicated.
 */
export type DocLevel =
  | 'coma'          // GCS 3–7, no wake-sleep cycle
  | 'vs-uws'        // Vegetative / Unresponsive Wakefulness Syndrome — wake-sleep cycles present, no awareness
  | 'mcs-minus'     // Minimally Conscious State (non-verbal responses only)
  | 'mcs-plus'      // Minimally Conscious State+ (command-following, occasional yes/no)
  | 'emcs'          // Emerging from MCS — functional communication / object use
  | 'locked-in';    // Locked-in Syndrome — fully conscious, motor-locked

export interface IDocProfile {
    gcsScore:          number;        // 3–15
    docLevel:          DocLevel;
    daysPostOnset:     number;        // Days since injury/onset
    etiology:          string;        // e.g. "TBI", "hypoxic", "stroke", "metabolic"
    hasAutonomicStorming: boolean;    // Paroxysmal sympathetic hyperactivity
    preferredMusic:    string;        // Patient's preferred genre/artist (from family)
    familyVoiceAvailable: boolean;   // Family willing to record/participate
    hasHearingAid:     boolean;
    hasPhotosensitivity: boolean;     // Block flicker protocols
    activeIcpMonitor:  boolean;       // Intracranial pressure monitor present
}

/** A single scheduled stimulation block within a DOC session. */
export interface IDocStimBlock {
    label:        string;
    durationMin:  number;
    modality:     'auditory' | 'vibroacoustic' | 'tactile-audio' | 'quiet' | 'familiar-voice' | 'gamma-light';
    frequencyHz:  number | null;      // null = no entrainment frequency (e.g. rest/quiet)
    instruction:  string;             // For nursing/family at bedside
    rationale:    string;             // Evidence-based clinical rationale
    contraindications: string[];
}

/** Full DOC stimulation session protocol output. */
export interface IDocStimulationSession {
    profile:      IDocProfile;
    schedule:     IDocStimBlock[];    // Ordered sequence for the session
    totalDurationMin: number;
    sessionsPerDay: number;
    clinician_note: string;
    safety_warnings: string[];
    family_guidance: string[];        // Plain-language instructions for family at bedside
    evidence_references: string[];
}

/**
 * Athletic State classification for AVS Performance Enhancement.
 */
export type AthleticState =
  | 'priming'      // Pre-workout / Event High-Beta/Gamma
  | 'flow'         // Skill-training SMR / Alpha
  | 'recovery'     // Post-workout Down-regulation Theta
  | 'phase-shift'; // Circadian Jet Lag mitigation

export interface IAthleticProfile {
    state:             AthleticState;
    sportType:         string;        // e.g. "Sprinting", "Golf", "Powerlifting", "Esports"
    timeToEventMin?:   number;        // Time until the event/game
    targetTimezoneOffset?: number;    // For phase-shift
    preferredMusic:    string;
}

export interface IAthleticStimBlock {
    label:        string;
    durationMin:  number;
    modality:     'auditory' | 'vibroacoustic' | 'ambient-light' | 'quiet' | 'visual-focus';
    frequencyHz:  number | null;
    instruction:  string;
    rationale:    string;
}

export interface IAthleticSession {
    profile:      IAthleticProfile;
    schedule:     IAthleticStimBlock[];
    totalDurationMin: number;
    coach_note: string;
    athlete_guidance: string[];
    evidence_references: string[];
}

/**
 * Substance use and lifestyle context extracted from the patient chart.
 * All fields are optional — only populated when the chart contains evidence.
 */
export interface ILifestyleContext {
    hasCaffeine:       boolean;   // Coffee, energy drinks
    hasAlcohol:        boolean;   // Active use or in recovery
    inAlcoholRecovery: boolean;   // Explicitly noted as in recovery/AA
    isSmoker:          boolean;   // Tobacco / nicotine
    isCannabisUser:    boolean;   // THC (recreational or medical)
    usesCbd:           boolean;   // CBD without significant THC
    isDiabetic:        boolean;   // T1, T2, or gestational
    isPreDiabetic:     boolean;
    hasNeuroCondition?: boolean;  // Pre-existing neuro conditions (MS, demyelination, neuropathy)
    hasVisualImpairment?: boolean; // Blindness, optic neuritis, low vision
    hasCognitiveSensitivity?: boolean; // Dyslexia, ADHD, Autism, MCI, Concussion/TBI
    hasCaffeineWithinSession: boolean; // "had coffee before appointment"
    notes: string[];              // Free-text extraction from chart
}

/** A single beverage or lifestyle recommendation for the session. */
export interface ISessionRecommendation {
    category: 'beverage' | 'timing' | 'avs-adjustment' | 'caution' | 'wind-down';
    title:    string;
    detail:   string;
    emoji:    string;
    /** If set, this adjusts an AVS parameter. */
    avsAdjust?: { param: 'breathing_bpm' | 'wave'; value: string | number; };
}

/** Full lifestyle adjunct output for the current clinical encounter. */
export interface ILifestyleAdjunct {
    context:         ILifestyleContext;
    recommendations: ISessionRecommendation[];
    /** One-sentence summary for the clinician. */
    clinician_note:  string;
}

export interface IBookmark {

    title: string;
    url: string;
    authors?: string;
    doi?: string;
    publicationDate?: string;
    publisher?: string;
    isPeerReviewed?: boolean;
    cited?: boolean; // If true, should be included in references
    paradigms?: ('western' | 'eastern' | 'ayurvedic')[];
    tcmMeridians?: string[];
    ayurvedicDoshas?: ('Vata' | 'Pitta' | 'Kapha')[];
}

export interface IYbocsAssessmentData {
    checklistAnswers?: Record<string, { past: boolean; current: boolean }>;
    severityAnswers?: Record<string, number>;
    dateCreated?: string;
    totalScore?: number;
    severityCategory?: string;
}

export type HistoryEntry = {
    type: 'Visit';
    date: string;
    summary: string;
    state: IPatientState;
} | {
    type: 'ChartArchived';
    date: string;
    summary: string;
    state: IPatientState;
} | {
    type: 'PatientSummaryUpdate';
    date: string;
    summary: string;
} | {
    type: 'BookmarkAdded';
    date: string;
    summary: string;
    bookmark: IBookmark;
} | {
    type: 'NoteCreated';
    date: string;
    summary: string;
    partId: string;
    noteId: string;
} | {
    type: 'NoteDeleted';
    date: string;
    summary: string;
    partId: string;
    noteId: string;
} | {
    type: 'AnalysisRun';
    date: string;
    summary: string;
    report: Partial<Record<AnalysisLens, string>>;
} | {
    type: 'FinalizedPatientSummary';
    date: string;
    summary: string;
    report: Partial<Record<AnalysisLens, string>>;
    annotations: Record<string, Record<string, { note: string, bracketState: 'normal' | 'added' | 'removed' }>>;
} | {
    type: 'Y-BOCsAssessment';
    date: string;
    summary: string;
    assessment: IYbocsAssessmentData;
};

export interface IPatient extends IPatientState {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Non-binary' | 'Other';
    lastVisit: string;
    preexistingConditions: string[];
    history: HistoryEntry[];
    bookmarks: IBookmark[];
    occupation?: string;
    reasonForVisit?: string;
}

export interface IFhirGenomicObservation {
    resourceType: 'Observation';
    geneSymbol: 'CYP2D6' | 'CYP2C19' | 'CYP3A4' | 'SLCO1B1';
    variantCode: string;
    phenotype: 'Poor' | 'Intermediate' | 'Normal' | 'Rapid' | 'Ultra-Rapid';
}

export interface IMlParetoWeights {
    costWeight: number;      // 0.0 - 1.0
    speedWeight: number;     // 0.0 - 1.0
    adherenceWeight: number; // 0.0 - 1.0
}

export interface IMlBanditState {
    clinicianSpecialty: 'Cardiology' | 'Integrative' | 'Public Health' | 'General';
    weights: Record<string, number>;
}

export interface ISirOdeResult {
    effectiveR0: number;
    r0Delta: number;
    infectionsAverted: number;
    dollarsSaved: number;
    containmentRoiPerAvertedInfection: number;
}

export interface IGcnInteractionResult {
    optionName: string;
    paradigm: string;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
    hasGenomicInteraction: boolean;
    interactionDetails: string[];
}

