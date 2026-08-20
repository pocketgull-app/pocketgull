import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const CSSRS_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Have you wished you were dead or wished you could go to sleep and not wake up?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] },
  { id: 2, question: 'Have you actually had any thoughts of killing yourself?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] },
  { id: 3, question: 'Have you been thinking about how you might do this (method)?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 2 }] },
  { id: 4, question: 'Have you had these thoughts and had some intention of acting on them?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 3 }] },
  { id: 5, question: 'Have you started to work out or worked out the details of how to kill yourself?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 4 }] },
  { id: 6, question: 'Have you done anything, started to do anything, or prepared to do anything to end your life?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 5 }] }
];

export const CSSRS_TIERS: ISeverityTier[] = [
  { min: 0, max: 0, label: 'Low Risk / Screen Negative', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Standard supportive care & routine wellness checks.' },
  { min: 1, max: 2, label: 'Moderate Risk — Ideation Present', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Behavioral health referral & safety plan development.' },
  { min: 3, max: 16, label: 'HIGH RISK Sentinel Alert', colorClass: 'bg-rose-600 text-white border-rose-700 animate-pulse', recommendation: 'IMMEDIATE CLINICAL SAFETY TRIAGE REQUIRED. Activate 988 Suicide & Crisis Lifeline.' }
];

export const CssrsAssessment: IAssessmentDefinition = {
  id: 'cssrs',
  title: 'C-SSRS (Columbia Suicide Severity Rating Scale)',
  shortName: 'C-SSRS Safety Sentinel',
  icon: '🚨',
  badge: 'Safety Sentinel',
  category: 'mental_health',
  citation: 'Posner K, Brown GK, Stanley B, et al. The Columbia-Suicide Severity Rating Scale: initial validity and internal consistency findings. Am J Psychiatry. 2011;168(12):1266-1277.',
  maxScore: 16,
  questions: CSSRS_QUESTIONS,
  tiers: CSSRS_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  motivationalPrompt: (score, tier) => `Safety triage score is ${score}/16. Clinician review active.`,
  patientEducation: 'The C-SSRS is the gold standard assessment tool for suicide risk assessment and safety triage.'
};
