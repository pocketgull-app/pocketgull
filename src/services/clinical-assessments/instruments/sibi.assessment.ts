import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

export const SIBI_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Periodontal Probing Depth: Presence of periodontal pockets >= 4mm across FDI quadrants', options: [{ label: 'None (0)', value: 0 }, { label: 'Localized 1-2 sites (1)', value: 1 }, { label: 'Generalized >= 3 sites (2)', value: 2 }] },
  { id: 2, question: 'Smith & Knight Tooth Wear Index (TWI): Enamel loss or dentin exposure (Grades 0-4)', options: [{ label: 'Grade 0-1 Minimal (0)', value: 0 }, { label: 'Grade 2 Enamel/Dentin (1)', value: 1 }, { label: 'Grade 3-4 Severe/Pulp (2)', value: 2 }] },
  { id: 3, question: 'Bleeding on Probing (BOP): Gingival marginal bleeding index', options: [{ label: '<10% Normal (0)', value: 0 }, { label: '10-30% Moderate Gingivitis (1)', value: 1 }, { label: '>30% Severe Periodontitis (2)', value: 2 }] },
  { id: 4, question: 'Cardiovascular Cross-Talk: Comorbid elevated hs-CRP (>= 2.0 mg/L) or hypertension', options: YES_NO },
  { id: 5, question: 'Masticatory Myofascial Strain: Nocturnal bruxism, masseter hypertrophy, or TMJ crepitus', options: YES_NO }
];

export const SIBI_TIERS: ISeverityTier[] = [
  { min: 0, max: 2, label: 'Low Systemic Inflammatory Burden', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Routine teledentistry hygiene and preventive fluoride/hydroxyapatite care.' },
  { min: 3, max: 5, label: 'Moderate Systemic Inflammatory Cross-Talk', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Full-mouth ultrasonic debridement, occlusal splint for TWI, and systemic metabolic monitoring.' },
  { min: 6, max: 8, label: 'High Endothelial & Cardiovascular Inflammatory Burden', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Urgent interdisciplinary periodontal-cardiovascular co-management to mitigate atheroma risk.' }
];

export const SibiAssessment: IAssessmentDefinition = {
  id: 'sibi',
  title: 'SIBI (Systemic Inflammatory Burden & Teledentistry Index)',
  shortName: 'SIBI Oral-Systemic',
  icon: '🦷',
  badge: 'Teledentistry & CRP',
  category: 'somatic',
  citation: 'Pocket-Gull Teledentistry & Periodontal-Cardiovascular Systemic Inflammatory Cross-Talk Protocol (LOINC 93030-9).',
  maxScore: 8,
  questions: SIBI_QUESTIONS,
  tiers: SIBI_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 1 ? 'head' : null,
  motivationalPrompt: (score, tier) => `SIBI score is ${score}/8 (${tier.label}). Oral microbial health directly influences systemic cardiovascular inflammation.`,
  patientEducation: 'The SIBI measures oral inflammatory markers, tooth wear index, and systemic cardiovascular cross-talk.'
};
