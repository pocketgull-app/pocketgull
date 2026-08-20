import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const LIKERT_0_3_CVSQ = [
  { label: 'Never (0)', value: 0 },
  { label: 'Occasionally / Mild (1)', value: 1 },
  { label: 'Often / Moderate (2)', value: 2 },
  { label: 'Always / Severe (3)', value: 3 }
];

export const CVSQ_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Burning sensation in the eyes during or after digital device use?', options: LIKERT_0_3_CVSQ },
  { id: 2, question: 'Itching or scratchy sensation in the eyes?', options: LIKERT_0_3_CVSQ },
  { id: 3, question: 'Feeling of a foreign body or grittiness in the eyes?', options: LIKERT_0_3_CVSQ },
  { id: 4, question: 'Excessive tearing or watery eyes while viewing screens?', options: LIKERT_0_3_CVSQ },
  { id: 5, question: 'Excessive blinking or inability to maintain natural blink rate?', options: LIKERT_0_3_CVSQ },
  { id: 6, question: 'Eye redness (conjunctival hyperemia)?', options: LIKERT_0_3_CVSQ },
  { id: 7, question: 'Eye pain or dull aching around or behind the eye sockets?', options: LIKERT_0_3_CVSQ },
  { id: 8, question: 'Heavy eyelids or difficulty keeping eyes open during computer work?', options: LIKERT_0_3_CVSQ },
  { id: 9, question: 'Dryness or lack of moisture in the eyes (keratoconjunctivitis sicca symptoms)?', options: LIKERT_0_3_CVSQ },
  { id: 10, question: 'Blurred vision when looking at digital displays or documents?', options: LIKERT_0_3_CVSQ },
  { id: 11, question: 'Double vision (diplopia) or shadow images?', options: LIKERT_0_3_CVSQ },
  { id: 12, question: 'Difficulty refocusing when switching between near screen and distant objects?', options: LIKERT_0_3_CVSQ },
  { id: 13, question: 'Increased sensitivity to light, screen glare, or overhead illumination (photophobia)?', options: LIKERT_0_3_CVSQ },
  { id: 14, question: 'Colored halos or visual artifacts around on-screen text or light sources?', options: LIKERT_0_3_CVSQ },
  { id: 15, question: 'Feeling that visual acuity is gradually worsening as the workday progresses?', options: LIKERT_0_3_CVSQ },
  { id: 16, question: 'Headaches originating around the temples, forehead, or retro-orbital area during screen work?', options: LIKERT_0_3_CVSQ }
];

export const CVSQ_TIERS: ISeverityTier[] = [
  { min: 0, max: 5, label: 'Normal / Minimal Visual Strain', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain standard 20-20-20 visual ergonomics & humidified workspaces.' },
  { min: 6, max: 15, label: 'Mild Computer Vision Syndrome (CVS)', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Enforce 20-20-20 micro-pauses, preservative-free artificial tears, and anti-glare screen filtering.' },
  { min: 16, max: 28, label: 'Moderate Computer Vision Syndrome', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Comprehensive optometric evaluation, refractive accommodation check, and ergonomic workstation audit.' },
  { min: 29, max: 48, label: 'Severe Asthenopia & Digital Eye Strain', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate ophthalmological examination for meibomian gland dysfunction, convergence insufficiency, or dry eye disease.' }
];

export const CvsqAssessment: IAssessmentDefinition = {
  id: 'cvsq',
  title: 'CVS-Q (Computer Vision Syndrome Questionnaire)',
  shortName: 'CVS-Q Vision Strain',
  icon: '👁️',
  badge: 'Optometry Standard',
  category: 'visual_ergonomics',
  citation: 'Seguí M del M, Cabrero-García J, Crespo A, Verdú J, Ronda E. A reliable and valid questionnaire was developed to measure computer vision syndrome at the workplace. J Clin Epidemiol. 2015;68(6):662-673.',
  maxScore: 48,
  questions: CVSQ_QUESTIONS,
  tiers: CVSQ_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 2 ? 'head' : null,
  motivationalPrompt: (score, tier) => `Your CVS-Q score is ${score}/48 (${tier.label}). Have you considered applying the 20-20-20 rule (looking 20 feet away for 20 seconds every 20 minutes)?`,
  patientEducation: 'The CVS-Q is a 16-item validated optometric questionnaire assessing ocular and visual symptoms caused by prolonged digital screen usage.'
};
