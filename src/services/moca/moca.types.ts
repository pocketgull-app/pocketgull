/**
 * Montreal Cognitive Assessment (MoCA 30-Point Standard Battery) Types
 * 
 * Standardized 30-point neurocognitive screening protocol for Mild Cognitive
 * Impairment (MCI) and dementia detection across 8 validated cognitive domains.
 * Reference: Nasreddine ZS, Phillips NA, Bédirian V, et al. J Am Geriatr Soc. 2005;53(4):695-699.
 * LOINC Code: 72106-8 (Montreal Cognitive Assessment [MoCA])
 * LOINC Total Score: 72172-0 (MoCA Total Score)
 */

export type MocaDomainId =
  | 'visuospatial_executive'
  | 'naming'
  | 'memory_registration'
  | 'attention'
  | 'language'
  | 'abstraction'
  | 'delayed_recall'
  | 'orientation';

export type MocaDiagnosticTier =
  | 'NORMAL'
  | 'MILD_COGNITIVE_IMPAIRMENT'
  | 'MODERATE_IMPAIRMENT'
  | 'SEVERE_IMPAIRMENT';

export interface IMocaDomainScore {
  domainId: MocaDomainId;
  name: string;
  earned: number;
  max: number;
  loincComponentCode?: string;
  notes?: string;
}

export interface ITrailNode {
  id: string; // '1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'
  label: string;
  x: number; // Normalized coordinate 0-100
  y: number; // Normalized coordinate 0-100
  type: 'number' | 'letter';
  sequenceIndex: number; // 0 to 9
}

export interface IClockDrawingScores {
  contour: boolean; // 1 pt: Circle drawn with only minor distortion
  numbers: boolean; // 1 pt: All 12 numbers present, correct order and quadrants
  hands: boolean;   // 1 pt: Exactly 2 hands pointing to 11:10, hour hand visibly shorter
}

export interface IAnimalNamingScores {
  lion: boolean;       // 1 pt
  rhinoceros: boolean; // 1 pt
  camel: boolean;      // 1 pt
}

export interface IMemoryWordState {
  word: string;
  trial1Recalled: boolean;
  trial2Recalled: boolean;
  delayedSpontaneous: boolean; // 1 pt per word spontaneously recalled
  delayedCategoryCued?: boolean; // Clinical diagnostic sub-typing (0 pts on official score)
  delayedChoiceCued?: boolean;   // Clinical diagnostic sub-typing (0 pts on official score)
  categoryCue: string;
  choiceOptions: string[];
}

export interface IAttentionScores {
  digitSpanForward: boolean;  // 1 pt: 2-1-8-5-4 recalled in forward order
  digitSpanBackward: boolean; // 1 pt: 7-4-2 recalled in reverse order (2-4-7)
  vigilanceTapping: boolean;  // 1 pt: <= 1 error during 30-letter 1Hz 'A' tap test
  vigilanceOmissions: number;
  vigilanceCommissions: number;
  serial7CorrectCount: number; // 0-5 subtractions correct (100-7=93, 86, 79, 72, 65)
  serial7Score: number;        // 4-5 correct: 3 pts, 2-3 correct: 2 pts, 1 correct: 1 pt, 0 correct: 0 pts
}

export interface ILanguageScores {
  sentence1: boolean;      // 1 pt: "I only know that John is the one to help today."
  sentence2: boolean;      // 1 pt: "The cat always hid under the couch when dogs were in the room."
  fluencyCount: number;    // Words generated starting with 'F' in 60s
  fluencyPassed: boolean;  // 1 pt: >= 11 words
  fluencyWords: string[];
}

export interface IAbstractionScores {
  trainBicycle: boolean; // 1 pt: Transportation / vehicles
  watchRuler: boolean;   // 1 pt: Measuring instruments / tools
}

export interface IOrientationScores {
  date: boolean;      // 1 pt: exact day of month
  month: boolean;     // 1 pt: exact month
  year: boolean;      // 1 pt: exact year
  dayOfWeek: boolean; // 1 pt: exact day
  place: boolean;     // 1 pt: hospital/clinic/home name
  city: boolean;      // 1 pt: exact city
}

export interface IMocaSessionState {
  patientId: string;
  patientName: string;
  examinerName: string;
  examinerCertificationId?: string;
  sessionTimestamp: string;
  educationYears: number; // <= 12 years qualifies for +1 point education adjustment

  // Domain 1: Visuospatial / Executive (5 pts)
  trailMakingCompleted: boolean;
  trailMakingScore: number; // 0 or 1
  cubeCopyScore: number;     // 0 or 1
  clockScores: IClockDrawingScores; // 0 to 3

  // Domain 2: Naming (3 pts)
  animalNaming: IAnimalNamingScores; // 0 to 3

  // Domain 3: Memory Registration (0 pts immediate baseline)
  memoryWords: IMemoryWordState[];

  // Domain 4: Attention (6 pts)
  attention: IAttentionScores; // 0 to 6

  // Domain 5: Language (3 pts)
  language: ILanguageScores; // 0 to 3

  // Domain 6: Abstraction (2 pts)
  abstraction: IAbstractionScores; // 0 to 2

  // Domain 7: Delayed Recall (5 pts)
  // (Derived from memoryWords.delayedSpontaneous)

  // Domain 8: Orientation (6 pts)
  orientation: IOrientationScores; // 0 to 6

  // Canvas Stroke Data (Base64 data URLs)
  trailCanvasDataUrl?: string;
  cubeCanvasDataUrl?: string;
  clockCanvasDataUrl?: string;
}

export interface IMocaSummaryResult {
  rawScore: number; // 0-30
  educationBonus: number; // 0 or 1 (+1 if education <= 12 years and rawScore < 30)
  totalAdjustedScore: number; // 0-30
  tier: MocaDiagnosticTier;
  tierLabel: string;
  tierColor: string;
  clinicalInterpretation: string;
  recommendations: string[];
  domainBreakdown: IMocaDomainScore[];
  deficitProfile: 'NORMAL' | 'AMNESTIC_HIPPOCAMPAL' | 'FRONTAL_EXECUTIVE_RETRIEVAL' | 'MULTI_DOMAIN';
}

export interface IFhirObservationComponent {
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  valueInteger?: number;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
}

export interface IFhirMocaObservation {
  resourceType: 'Observation';
  id: string;
  status: 'final';
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime: string;
  performer?: Array<{
    display: string;
  }>;
  valueInteger: number;
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;
  note?: Array<{
    text: string;
  }>;
  component: IFhirObservationComponent[];
}

export interface IFhirMocaBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'collection';
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: Record<string, any>;
  }>;
}
