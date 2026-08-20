import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const PHQ9_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Little interest or pleasure in doing things?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 2, question: 'Feeling down, depressed, or hopeless?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 3, question: 'Trouble falling or staying asleep, or sleeping too much?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 4, question: 'Feeling tired or having little energy?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 5, question: 'Poor appetite or overeating?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 6, question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 7, question: 'Trouble concentrating on things, such as reading the newspaper or watching television?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 8, question: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being fidgety or restless?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 9, question: 'Thoughts that you would be better off dead, or of hurting yourself in some way?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]}
];

export const PHQ9_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal / None', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Regular wellness monitoring & circadian hygiene.' },
  { min: 5, max: 9, label: 'Mild Depression', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Watchful waiting, lifestyle adjuncts, and biofeedback.' },
  { min: 10, max: 14, label: 'Moderate Depression', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Consider clinical consultation & supportive psychotherapy.' },
  { min: 15, max: 19, label: 'Moderately Severe Depression', colorClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30', recommendation: 'Clinical assessment recommended; psychotherapy or pharmacotherapy evaluation.' },
  { min: 20, max: 27, label: 'Severe Depression', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate clinical assessment and multidisciplinary care plan required.' }
];

export const Phq9Assessment: IAssessmentDefinition = {
  id: 'phq9',
  title: 'PHQ-9 (Patient Health Questionnaire-9)',
  shortName: 'PHQ-9 Depression',
  icon: '🧠',
  badge: 'LOINC 44261-6',
  category: 'mental_health',
  loincCode: '44261-6',
  citation: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.',
  maxScore: 27,
  questions: PHQ9_QUESTIONS,
  tiers: PHQ9_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 2 ? 'brain' : null,
  motivationalPrompt: (score, tier) => `I notice your PHQ-9 score is ${score}/27 (${tier.label}). What shifts have you noticed in your day-to-day energy, sleep, or mood recently?`,
  patientEducation: 'The PHQ-9 is a standardized 9-question instrument used worldwide by clinicians to understand depressive symptoms and track progress over time.'
};
