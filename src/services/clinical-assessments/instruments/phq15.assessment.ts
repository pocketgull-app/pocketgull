import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const LIKERT_0_2_SOMATIC = [
  { label: 'Not bothered', value: 0 },
  { label: 'Bothered a little', value: 1 },
  { label: 'Bothered a lot', value: 2 }
];

export const PHQ15_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Stomach pain?', options: LIKERT_0_2_SOMATIC },
  { id: 2, question: 'Back pain?', options: LIKERT_0_2_SOMATIC },
  { id: 3, question: 'Pain in your arms, legs, or joints (knees, hips, etc.)?', options: LIKERT_0_2_SOMATIC },
  { id: 4, question: 'Menstrual cramps or other problems with your periods?', options: LIKERT_0_2_SOMATIC },
  { id: 5, question: 'Headaches?', options: LIKERT_0_2_SOMATIC },
  { id: 6, question: 'Chest pain?', options: LIKERT_0_2_SOMATIC },
  { id: 7, question: 'Dizziness or lightheadedness?', options: LIKERT_0_2_SOMATIC },
  { id: 8, question: 'Fainting spells?', options: LIKERT_0_2_SOMATIC },
  { id: 9, question: 'Feeling your heart pound or race (palpitations)?', options: LIKERT_0_2_SOMATIC },
  { id: 10, question: 'Shortness of breath?', options: LIKERT_0_2_SOMATIC },
  { id: 11, question: 'Pain or problems during sexual intercourse?', options: LIKERT_0_2_SOMATIC },
  { id: 12, question: 'Constipation, loose bowels, or diarrhea?', options: LIKERT_0_2_SOMATIC },
  { id: 13, question: 'Nausea, gas, or indigestion?', options: LIKERT_0_2_SOMATIC },
  { id: 14, question: 'Feeling tired or having low energy?', options: LIKERT_0_2_SOMATIC },
  { id: 15, question: 'Trouble sleeping?', options: LIKERT_0_2_SOMATIC }
];

export const PHQ15_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal Somatic Burden', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Low physical symptom distress.' },
  { min: 5, max: 9, label: 'Low Somatic Symptom Severity', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Somatic pacing & vagal biofeedback recommended.' },
  { min: 10, max: 14, label: 'Medium Somatic Symptom Severity', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Evaluation for somatoform overlap & autonomic dysregulation.' },
  { min: 15, max: 30, label: 'High Somatic Symptom Severity', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive somatic & autonomic specialist evaluation required.' }
];

export const Phq15Assessment: IAssessmentDefinition = {
  id: 'phq15',
  title: 'PHQ-15 (Somatic Symptom Scale)',
  shortName: 'PHQ-15 Somatic',
  icon: '⚡',
  badge: 'Somatic Index',
  category: 'somatic',
  citation: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-15: validity of a new measure for evaluating the severity of somatic symptoms. Psychosom Med. 2002;64(2):258-266.',
  maxScore: 30,
  questions: PHQ15_QUESTIONS,
  tiers: PHQ15_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 1 ? 'chest' : null,
  motivationalPrompt: (score, tier) => `Your PHQ-15 somatic score is ${score}/30 (${tier.label}). Which physical sensations have been most noticeable during high-stress periods?`,
  patientEducation: 'The PHQ-15 measures the presence and severity of 15 common physical symptoms.'
};
