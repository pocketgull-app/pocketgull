import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const ISI_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Difficulty falling asleep?', options: [{ label: 'None (0)', value: 0 }, { label: 'Mild (1)', value: 1 }, { label: 'Moderate (2)', value: 2 }, { label: 'Severe (3)', value: 3 }, { label: 'Very Severe (4)', value: 4 }] },
  { id: 2, question: 'Difficulty staying asleep?', options: [{ label: 'None (0)', value: 0 }, { label: 'Mild (1)', value: 1 }, { label: 'Moderate (2)', value: 2 }, { label: 'Severe (3)', value: 3 }, { label: 'Very Severe (4)', value: 4 }] },
  { id: 3, question: 'Problems waking up too early?', options: [{ label: 'None (0)', value: 0 }, { label: 'Mild (1)', value: 1 }, { label: 'Moderate (2)', value: 2 }, { label: 'Severe (3)', value: 3 }, { label: 'Very Severe (4)', value: 4 }] },
  { id: 4, question: 'How satisfied/dissatisfied are you with your current sleep pattern?', options: [{ label: 'Very Satisfied (0)', value: 0 }, { label: 'Satisfied (1)', value: 1 }, { label: 'Neutral (2)', value: 2 }, { label: 'Dissatisfied (3)', value: 3 }, { label: 'Very Dissatisfied (4)', value: 4 }] },
  { id: 5, question: 'How noticeable to others do you think your sleep problem is in terms of impairing quality of life?', options: [{ label: 'Not at all Noticeable (0)', value: 0 }, { label: 'A Little (1)', value: 1 }, { label: 'Somewhat (2)', value: 2 }, { label: 'Much (3)', value: 3 }, { label: 'Very Much Noticeable (4)', value: 4 }] },
  { id: 6, question: 'How worried/distressed are you about your current sleep problem?', options: [{ label: 'Not at all Worried (0)', value: 0 }, { label: 'A Little (1)', value: 1 }, { label: 'Somewhat (2)', value: 2 }, { label: 'Much (3)', value: 3 }, { label: 'Very Much Worried (4)', value: 4 }] },
  { id: 7, question: 'To what extent does your sleep problem interfere with daily functioning?', options: [{ label: 'Not at all (0)', value: 0 }, { label: 'A Little (1)', value: 1 }, { label: 'Somewhat (2)', value: 2 }, { label: 'Much (3)', value: 3 }, { label: 'Very Much Interfering (4)', value: 4 }] }
];

export const ISI_TIERS: ISeverityTier[] = [
  { min: 0, max: 7, label: 'No Clinically Significant Insomnia', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain standard sleep hygiene and dark-mode lighting.' },
  { min: 8, max: 14, label: 'Subthreshold Insomnia', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Optimize circadian timing, reduce evening blue light, and use Solfeggio 432Hz sleep decks.' },
  { min: 15, max: 21, label: 'Clinical Insomnia (Moderate Severity)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'CBT-I sleep restriction strategies & clinical sleep assessment.' },
  { min: 22, max: 28, label: 'Clinical Insomnia (Severe)', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive medical sleep study & clinical consultation recommended.' }
];

export const IsiAssessment: IAssessmentDefinition = {
  id: 'isi',
  title: 'ISI (Insomnia Severity Index)',
  shortName: 'ISI Insomnia',
  icon: '🌙',
  badge: 'LOINC 71960-9',
  category: 'sleep',
  loincCode: '71960-9',
  citation: 'Morin CM, Belleville G, Bélanger L, Ivers H. The Insomnia Severity Index: psychometric indicators to detect insomnia cases and evaluate treatment response. Sleep. 2011;34(5):601-608.',
  maxScore: 28,
  questions: ISI_QUESTIONS,
  tiers: ISI_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 2 ? 'brain' : null,
  motivationalPrompt: (score, tier) => `Your ISI score is ${score}/28 (${tier.label}). How does your sleep quality impact your daytime focus and physical recovery?`,
  patientEducation: 'The Insomnia Severity Index is a 7-item validated tool that evaluates the nature, severity, and impact of insomnia.'
};
