import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const MOCA_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Visuospatial & Executive: Clock Drawing & Alternating Trail Making Test', options: [{ label: 'Incorrect / Impaired (0)', value: 0 }, { label: 'Partially Accurate (1)', value: 1 }, { label: 'Intact & Exact (2)', value: 2 }] },
  { id: 2, question: 'Naming: Animal Identification (Lion, Rhinoceros, Dromedary Camel)', options: [{ label: '0-1 Correct (0)', value: 0 }, { label: '2 Correct (1)', value: 1 }, { label: 'All 3 Correct (2)', value: 2 }] },
  { id: 3, question: 'Attention: Forward & Backward Digit Span (5-digits forward, 3-digits backward)', options: [{ label: 'Failed (0)', value: 0 }, { label: 'Passed 1 Span (1)', value: 1 }, { label: 'Passed Both Spans (2)', value: 2 }] },
  { id: 4, question: 'Language: Repetition of Complex Sentences & 1-Minute Phonemic Fluency', options: [{ label: 'Impaired (<11 words) (0)', value: 0 }, { label: 'Mild Delay (1)', value: 1 }, { label: 'Intact (>11 words) (2)', value: 2 }] },
  { id: 5, question: 'Delayed Recall: 5-Word Uncued Memory Recall (Face, Velvet, Church, Daisy, Red)', options: [{ label: '0-1 Words (0)', value: 0 }, { label: '2-3 Words (1)', value: 1 }, { label: '4-5 Words (2)', value: 2 }] },
  { id: 6, question: 'Orientation: Date, Month, Year, Day, Place, and City Precision', options: [{ label: 'Disoriented (0)', value: 0 }, { label: 'Partial Orientation (1)', value: 1 }, { label: 'Fully Oriented (2)', value: 2 }] }
];

export const MOCA_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Severe Cognitive Impairment', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive neuropsychological battery & structural neuroimaging required.' },
  { min: 5, max: 8, label: 'Mild Cognitive Impairment (MCI)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Cardiovascular risk factor management, Mediterranean-DASH diet, and cognitive rehabilitation.' },
  { min: 9, max: 12, label: 'Normal Cognitive Function', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain lifelong cognitive enrichment, aerobic exercise, and sleep hygiene.' }
];

export const MocaAssessment: IAssessmentDefinition = {
  id: 'moca',
  title: 'MoCA / Mini-Cog Rapid Cognitive Screener',
  shortName: 'MoCA Cognition',
  icon: '🧩',
  badge: 'Cognitive Battery',
  category: 'cognitive',
  citation: 'Nasreddine ZS, Phillips NA, Bédirian V, et al. The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. J Am Geriatr Soc. 2005;53(4):695-699.',
  maxScore: 12,
  questions: MOCA_QUESTIONS,
  tiers: MOCA_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val <= 1 ? 'brain' : null,
  motivationalPrompt: (score, tier) => `Cognitive readiness score is ${score}/12 (${tier.label}). Engaging in complex learning and restful sleep maintains neuroplasticity.`,
  patientEducation: 'The MoCA screener assesses visuospatial, executive, memory, attention, language, and orientation domains.'
};
