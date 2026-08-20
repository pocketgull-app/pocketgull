import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const GAD7_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Feeling nervous, anxious, or on edge?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 2, question: 'Not being able to stop or control worrying?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 3, question: 'Worrying too much about different things?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 4, question: 'Trouble relaxing?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 5, question: 'Being so restless that it is hard to sit still?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 6, question: 'Becoming easily annoyed or irritable?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]},
  { id: 7, question: 'Feeling afraid as if something awful might happen?', options: [
    { label: 'Not at all', value: 0 }, { label: 'Several days', value: 1 }, { label: 'More than half the days', value: 2 }, { label: 'Nearly every day', value: 3 }
  ]}
];

export const GAD7_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal Anxiety', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain standard stress resiliency routines.' },
  { min: 5, max: 9, label: 'Mild Anxiety', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Execute 0.1 Hz vagal resonance biofeedback & somatic breathing.' },
  { min: 10, max: 14, label: 'Moderate Anxiety', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Activate Somatic Grounding Loop & clinical evaluation.' },
  { min: 15, max: 21, label: 'Severe Anxiety', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate clinical evaluation & high-frequency parasympathetic regulation.' }
];

export const Gad7Assessment: IAssessmentDefinition = {
  id: 'gad7',
  title: 'GAD-7 (Generalized Anxiety Disorder 7)',
  shortName: 'GAD-7 Anxiety',
  icon: '🌿',
  badge: 'LOINC 69737-5',
  category: 'mental_health',
  loincCode: '69737-5',
  citation: 'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
  maxScore: 21,
  questions: GAD7_QUESTIONS,
  tiers: GAD7_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 2 ? 'chest' : null,
  motivationalPrompt: (score, tier) => `Your GAD-7 score is ${score}/21 (${tier.label}). What tools or situations currently bring you the greatest sense of calm?`,
  patientEducation: 'The GAD-7 measures symptom severity for generalized anxiety, assessing physiological tension and excessive worry.'
};
