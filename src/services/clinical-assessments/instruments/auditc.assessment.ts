import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const AUDITC_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'How often do you have a drink containing alcohol?', options: [{ label: 'Never (0)', value: 0 }, { label: 'Monthly or less (1)', value: 1 }, { label: '2-4 times a month (2)', value: 2 }, { label: '2-3 times a week (3)', value: 3 }, { label: '4+ times a week (4)', value: 4 }] },
  { id: 2, question: 'How many standard drinks containing alcohol do you have on a typical day when you are drinking?', options: [{ label: '1 or 2 (0)', value: 0 }, { label: '3 or 4 (1)', value: 1 }, { label: '5 or 6 (2)', value: 2 }, { label: '7 to 9 (3)', value: 3 }, { label: '10 or more (4)', value: 4 }] },
  { id: 3, question: 'How often do you have six or more drinks on one occasion?', options: [{ label: 'Never (0)', value: 0 }, { label: 'Less than monthly (1)', value: 1 }, { label: 'Monthly (2)', value: 2 }, { label: 'Weekly (3)', value: 3 }, { label: 'Daily or almost daily (4)', value: 4 }] }
];

export const AUDITC_TIERS: ISeverityTier[] = [
  { min: 0, max: 2, label: 'Low Risk / Abstinent', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Standard lifestyle counseling and hepatic metabolic maintenance.' },
  { min: 3, max: 4, label: 'Moderate Risk / Hazardous Drinking', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Brief intervention counseling, alcohol reduction goals, and liver enzymes (GGT, ALT) tracking.' },
  { min: 5, max: 12, label: 'High Risk / Possible Dependence', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Referral for specialized addiction medicine evaluation and supervised medical detoxification if indicated.' }
];

export const AuditcAssessment: IAssessmentDefinition = {
  id: 'auditc',
  title: 'AUDIT-C (Alcohol Use Disorders Identification Test-Concise)',
  shortName: 'AUDIT-C Alcohol',
  icon: '🍷',
  badge: 'Metabolic & Lifestyle',
  category: 'functional',
  citation: 'Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA. The AUDIT alcohol consumption questions (AUDIT-C): an effective brief screening test for problem drinking. Arch Intern Med. 1998;158(16):1789-1795.',
  maxScore: 12,
  questions: AUDITC_QUESTIONS,
  tiers: AUDITC_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 2 ? 'abdomen' : null,
  motivationalPrompt: (score, tier) => `AUDIT-C score is ${score}/12 (${tier.label}). What personal health goals motivate your daily lifestyle choices?`,
  patientEducation: 'AUDIT-C is a 3-item screening tool that reliably identifies persons who are hazardous drinkers or have active alcohol use disorders.'
};
