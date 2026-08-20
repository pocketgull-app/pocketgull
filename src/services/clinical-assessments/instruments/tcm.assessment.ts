import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

export const TCM_QUESTIONS: IQuestionItem[] = [
  { id: 1, tcmVector: 'yang', question: 'Chills & Temperature: Frequently feel aversion to cold, cold hands/feet, preference for hot drinks?', options: YES_NO },
  { id: 2, tcmVector: 'heat', question: 'Perspiration & Heat: Spontaneous daytime sweating, night sweats, or afternoon hot flashes?', options: YES_NO },
  { id: 3, tcmVector: 'qi', question: 'Energy & Breath: Shortness of breath on exertion, weak voice, or heavy fatigue after eating?', options: YES_NO },
  { id: 4, tcmVector: 'blood', question: 'Tongue & Complexion: Tongue pale/purple/darkened with scalloped edges or thin coating?', options: YES_NO },
  { id: 5, tcmVector: 'yin', question: 'Mouth & Sleep: Dry mouth/throat at night, restless sleep, or five-palm heat (palms, soles, chest)?', options: YES_NO },
  { id: 6, tcmVector: 'cold', question: 'Abdomen & Stool: Dull abdominal pain relieved by warmth/pressure, or loose watery stools?', options: YES_NO }
];

export const TCM_TIERS: ISeverityTier[] = [
  { min: 0, max: 1, label: 'Balanced Qi & Blood Flow', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain seasonal Qigong practice & balanced organ meridian flow.' },
  { min: 2, max: 3, label: 'Moderate Pattern Imbalance (Ba Gang)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Harmonize Qi/Blood & apply targeted acupressure/moxibustion.' },
  { min: 4, max: 6, label: 'Significant Pattern Stagnation / Deficiency', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Acupuncture pattern evaluation & classical Kampo/TCM herbal prescription.' }
];

export const TcmAssessment: IAssessmentDefinition<{ yin: number; yang: number; qi: number; blood: number; heat: number; cold: number }> = {
  id: 'tcm',
  title: 'TCM Shi Wen 10-Questions Ba Gang Profile',
  shortName: 'TCM Shi Wen',
  icon: '☯️',
  badge: 'Integrative Meridian',
  category: 'integrative',
  citation: 'Huangdi Neijing (Yellow Emperor Classic of Internal Medicine) Ba Gang Eight Principles Diagnostic Model.',
  maxScore: 6,
  questions: TCM_QUESTIONS,
  tiers: TCM_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  calculateBreakdown: (answers) => {
    let yin = 0, yang = 0, qi = 0, blood = 0, heat = 0, cold = 0;
    TCM_QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.tcmVector === 'yin') yin += val;
      if (q.tcmVector === 'yang') yang += val;
      if (q.tcmVector === 'qi') qi += val;
      if (q.tcmVector === 'blood') blood += val;
      if (q.tcmVector === 'heat') heat += val;
      if (q.tcmVector === 'cold') cold += val;
    });
    return { yin, yang, qi, blood, heat, cold };
  },
  mapToAnatomyPart: (qId, val) => {
    if (val !== 1) return null;
    const q = TCM_QUESTIONS.find(item => item.id === qId);
    if (!q || !q.tcmVector) return null;
    const map = { yang: 'spine', heat: 'chest', qi: 'lungs', blood: 'heart', yin: 'kidneys', cold: 'abdomen' };
    return map[q.tcmVector] || 'abdomen';
  },
  motivationalPrompt: (score, tier) => `TCM Ba Gang assessment indicates ${tier.label}. Supporting your organ meridians with thermal regulation and breathwork nurtures Qi balance.`,
  patientEducation: 'TCM Shi Wen (Ten Questions) assesses systemic balance using Yin/Yang, Cold/Heat, and Deficiency/Excess principles.'
};
