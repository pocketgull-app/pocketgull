import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const MOCA_QUESTIONS: IQuestionItem[] = [
  {
    id: 1,
    question: 'Visuospatial & Executive: Alternating Trail Making (1-A-2-B...5-E), Isometric Cube Copy & Clock Drawing Test (Contour, Numbers, Hands 11:10)',
    category: 'Visuospatial / Executive',
    options: [
      { label: 'Severe Deficit (0 pts)', value: 0 },
      { label: 'Marked Error (1 pt)', value: 1 },
      { label: 'Moderate Impairment (2 pts)', value: 2 },
      { label: 'Minor Error (3 pts)', value: 3 },
      { label: 'Near Perfect (4 pts)', value: 4 },
      { label: 'All 3 Intact (5 pts)', value: 5 }
    ]
  },
  {
    id: 2,
    question: 'Naming: Animal Identification (Lion, Rhinoceros, Dromedary Camel)',
    category: 'Naming',
    options: [
      { label: '0 Correct (0 pts)', value: 0 },
      { label: '1 Correct (1 pt)', value: 1 },
      { label: '2 Correct (2 pts)', value: 2 },
      { label: 'All 3 Correct (3 pts)', value: 3 }
    ]
  },
  {
    id: 3,
    question: 'Attention: Digit Span Forward (2-1-8-5-4) & Backward (7-4-2 -> 2-4-7)',
    category: 'Attention',
    options: [
      { label: 'Neither Span Passed (0 pts)', value: 0 },
      { label: '1 Span Passed (1 pt)', value: 1 },
      { label: 'Both Spans Passed (2 pts)', value: 2 }
    ]
  },
  {
    id: 4,
    question: 'Attention & Vigilance: 1 Hz Letter Tapping (Tap on letter "A" in 30-letter stream; ≤1 error)',
    category: 'Attention',
    options: [
      { label: 'Failed (≥2 errors) (0 pts)', value: 0 },
      { label: 'Passed (≤1 error) (1 pt)', value: 1 }
    ]
  },
  {
    id: 5,
    question: 'Attention & Calculation: Serial 7 Subtractions from 100 (93, 86, 79, 72, 65)',
    category: 'Calculation',
    options: [
      { label: '0 Correct (0 pts)', value: 0 },
      { label: '1 Correct (1 pt)', value: 1 },
      { label: '2-3 Correct (2 pts)', value: 2 },
      { label: '4-5 Correct (3 pts)', value: 3 }
    ]
  },
  {
    id: 6,
    question: 'Language: Sentence Repetition (2 sentences) & 60s Phonemic Fluency (≥11 words starting with "F")',
    category: 'Language',
    options: [
      { label: '0 Tasks Passed (0 pts)', value: 0 },
      { label: '1 Task Passed (1 pt)', value: 1 },
      { label: '2 Tasks Passed (2 pts)', value: 2 },
      { label: 'All 3 Tasks Passed (3 pts)', value: 3 }
    ]
  },
  {
    id: 7,
    question: 'Abstraction: Conceptual Similarities (Train - Bicycle: Transportation; Watch - Ruler: Measuring Tools)',
    category: 'Abstraction',
    options: [
      { label: '0 Pairs Correct (0 pts)', value: 0 },
      { label: '1 Pair Correct (1 pt)', value: 1 },
      { label: 'Both Pairs Correct (2 pts)', value: 2 }
    ]
  },
  {
    id: 8,
    question: 'Delayed Recall: Spontaneous Uncued Recall of 5 Words (Face, Velvet, Church, Daisy, Red)',
    category: 'Memory',
    options: [
      { label: '0 Words Recalled (0 pts)', value: 0 },
      { label: '1 Word Recalled (1 pt)', value: 1 },
      { label: '2 Words Recalled (2 pts)', value: 2 },
      { label: '3 Words Recalled (3 pts)', value: 3 },
      { label: '4 Words Recalled (4 pts)', value: 4 },
      { label: 'All 5 Words Recalled (5 pts)', value: 5 }
    ]
  },
  {
    id: 9,
    question: 'Orientation: Temporal & Spatial (Date, Month, Year, Day of Week, Place, City)',
    category: 'Orientation',
    options: [
      { label: '0-1 Correct (0 pts)', value: 0 },
      { label: '2 Correct (2 pts)', value: 2 },
      { label: '3 Correct (3 pts)', value: 3 },
      { label: '4 Correct (4 pts)', value: 4 },
      { label: '5 Correct (5 pts)', value: 5 },
      { label: 'All 6 Correct (6 pts)', value: 6 }
    ]
  }
];

export const MOCA_TIERS: ISeverityTier[] = [
  {
    min: 0,
    max: 9,
    label: 'Severe Cognitive Impairment',
    colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
    recommendation: 'STAT Comprehensive neuropsychological battery, structural neuroimaging (brain MRI), dementia specialist consult, and caregiver/driving safety assessment.'
  },
  {
    min: 10,
    max: 17,
    label: 'Moderate Cognitive Impairment',
    colorClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
    recommendation: 'Neurology evaluation for disease staging; laboratory screen for reversible causes (TSH, B12, CMP, RPR); occupational therapy home safety evaluation.'
  },
  {
    min: 18,
    max: 25,
    label: 'Mild Cognitive Impairment (MCI)',
    colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    recommendation: 'Cardiovascular risk factor control (BP < 120, HbA1c, lipids), Mediterranean-DASH MIND diet, physical exercise, and 6-month serial MoCA monitoring.'
  },
  {
    min: 26,
    max: 30,
    label: 'Normal Cognitive Function',
    colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    recommendation: 'Maintain lifelong cognitive enrichment, aerobic exercise, 7-9 hours restful sleep for glymphatic clearance, and annual wellness screening.'
  }
];

export const MocaAssessment: IAssessmentDefinition = {
  id: 'moca',
  title: 'Montreal Cognitive Assessment (MoCA 30-Point Standard Battery)',
  shortName: 'MoCA Cognition',
  icon: '🧩',
  badge: 'Cognitive Battery',
  category: 'cognitive',
  loincCode: '72106-8',
  citation: 'Nasreddine ZS, Phillips NA, Bédirian V, et al. The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. J Am Geriatr Soc. 2005;53(4):695-699.',
  maxScore: 30,
  questions: MOCA_QUESTIONS,
  tiers: MOCA_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val <= 2 ? 'head' : null,
  motivationalPrompt: (score, tier) => `Cognitive readiness score is ${score}/30 (${tier.label}). Engaging in novel learning, restful sleep, and heart-healthy lifestyle fosters neuroplasticity.`,
  patientEducation: 'The 30-point Montreal Cognitive Assessment evaluates visuospatial skills, executive function, naming, memory, attention, language, abstraction, and orientation.'
};
