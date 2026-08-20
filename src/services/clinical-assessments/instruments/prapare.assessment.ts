import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const PRAPARE_QUESTIONS: IQuestionItem[] = [
  { id: 1, zCode: 'Z59.8', question: 'Do you have stable, safe housing to live in over the next 2 months?', options: [{ label: 'Stable Housing', value: 0 }, { label: 'Unstable / At Risk (Z59.8)', value: 2 }, { label: 'Unsheltered (Z59.0)', value: 3 }] },
  { id: 2, zCode: 'Z59.41', question: 'In the past year, have you worried that your food would run out before you got money to buy more?', options: [{ label: 'No Food Insecurity', value: 0 }, { label: 'Food Insecurity Present (Z59.41)', value: 2 }] },
  { id: 3, zCode: 'Z59.82', question: 'Has lack of transportation kept you from medical appointments or work?', options: [{ label: 'No Transportation Barrier', value: 0 }, { label: 'Transportation Barrier (Z59.82)', value: 2 }] },
  { id: 4, zCode: 'Z59.6', question: 'Are you currently experiencing hard financial stress in affording basic necessities (bills, medication)?', options: [{ label: 'Low Stress', value: 0 }, { label: 'Moderate Financial Stress (Z59.6)', value: 1 }, { label: 'Severe Strain (Z59.6)', value: 2 }] },
  { id: 5, zCode: 'Z60.2', question: 'How often do you feel lonely or isolated from family, friends, or community support?', options: [{ label: 'Rarely / Never', value: 0 }, { label: 'Sometimes', value: 1 }, { label: 'Always / Severely Isolated (Z60.2)', value: 2 }] }
];

export const PRAPARE_TIERS: ISeverityTier[] = [
  { min: 0, max: 0, label: 'Low SDOH Risk', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'No immediate social determinants of health barriers identified.' },
  { min: 1, max: 3, label: 'Moderate SDOH Need Identified', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'SDOH Z-codes mapped. Community resource navigation initiated.' },
  { min: 4, max: 11, label: 'HIGH SDOH Risk & Material Hardship', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate social work referral, food/housing voucher routing & SDOH Z-code FHIR export.' }
];

export const PrapareAssessment: IAssessmentDefinition = {
  id: 'prapare',
  title: 'PRAPARE (Protocol for Responding to & Assessing Patients Assets, Risks, and Experiences)',
  shortName: 'PRAPARE SDOH Risk',
  icon: '🏘️',
  badge: 'SDOH Z-Codes',
  category: 'functional',
  citation: 'National Association of Community Health Centers (NACHC). PRAPARE Assessment Protocol. 2019.',
  maxScore: 11,
  questions: PRAPARE_QUESTIONS,
  tiers: PRAPARE_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  motivationalPrompt: (score, tier) => `PRAPARE social determinants risk score is ${score}/11 (${tier.label}). Community navigation support available.`,
  patientEducation: 'PRAPARE captures social determinants of health (SDOH) to address non-medical factors impacting well-being.'
};
