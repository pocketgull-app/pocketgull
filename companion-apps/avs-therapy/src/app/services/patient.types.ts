export type AnalysisLens = 'western' | 'eastern' | 'ayurvedic' | 'grow-thy-self' | 'Memory Palace' | 'EMT Handoff';

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
}

export interface IPatientVitals {
    bp: string;      // Blood Pressure
    hr: string;      // Heart Rate
    temp: string;    // Temperature
    spO2: string;    // Oxygen Saturation
    weight: string;
    height: string;
    // Biochemical Telemetry
    vitC?: string;
    vitD3?: string;
    magnesium?: string;
    zinc?: string;
    b12?: string;
}

export interface IDynamicMarker {
    id: string;
    name: string;
    value: string;
}

export interface IBiometricEntry {
    timestamp: string; // ISO string
    type: keyof IPatientVitals | 'pain';
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

export interface IPatientState {
    issues: Record<string, IBodyPartIssue[]>;
    patientGoals: string;
    vitals: IPatientVitals;
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
    activePhilosophy?: 'western' | 'eastern' | 'ayurvedic' | 'grow-thy-self';
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

/**
 * Gemini-generated AVS co-regulation protocol, personalized from patient context.
 * Applied by ClinicalContextAvsService → GlobalAvsService.
 */
export interface IAvsProtocol {
    wave: 'delta' | 'theta' | 'alpha' | 'beta';
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

export type IAvsAdjunct = ILifestyleAdjunct;

export interface IBookmark {

    title: string;
    url: string;
    authors?: string;
    doi?: string;
    publicationDate?: string;
    publisher?: string;
    isPeerReviewed?: boolean;
    cited?: boolean; // If true, should be included in references
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
