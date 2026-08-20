import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const SARCF_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Strength: Difficulty lifting and carrying 10 pounds (heavy grocery bag)?', options: [{ label: 'None (0)', value: 0 }, { label: 'Some (1)', value: 1 }, { label: 'A lot or unable (2)', value: 2 }] },
  { id: 2, question: 'Assistance in Walking: Difficulty walking across a room?', options: [{ label: 'None (0)', value: 0 }, { label: 'Some (1)', value: 1 }, { label: 'A lot, use cane/walker, or unable (2)', value: 2 }] },
  { id: 3, question: 'Rise from a Chair: Difficulty transferring from a chair or bed without arm support?', options: [{ label: 'None (0)', value: 0 }, { label: 'Some (1)', value: 1 }, { label: 'A lot or unable (2)', value: 2 }] },
  { id: 4, question: 'Climb Stairs: Difficulty climbing a flight of 10 stairs?', options: [{ label: 'None (0)', value: 0 }, { label: 'Some (1)', value: 1 }, { label: 'A lot or unable (2)', value: 2 }] },
  { id: 5, question: 'Falls: How many times have you fallen in the past 1 year?', options: [{ label: 'None (0)', value: 0 }, { label: '1 to 3 falls (1)', value: 1 }, { label: '4 or more falls (2)', value: 2 }] }
];

export const SARCF_TIERS: ISeverityTier[] = [
  { min: 0, max: 3, label: 'Normal Muscle Function', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain progressive resistance training and adequate dietary leucine/protein (1.2-1.5 g/kg).' },
  { min: 4, max: 10, label: 'Predictive of Sarcopenia & Frailty', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Dual-energy X-ray absorptiometry (DEXA) body composition scan, physical therapy, and fall risk mitigation.' }
];

export const SarcfAssessment: IAssessmentDefinition = {
  id: 'sarcf',
  title: 'SARC-F (Sarcopenia & Physical Frailty Screener)',
  shortName: 'SARC-F Frailty',
  icon: '💪',
  badge: 'Musculoskeletal',
  category: 'somatic',
  citation: 'Malmstrom TK, Miller DK, Simonsick EM, Ferrucci L, Morley JE. SARC-F: a simple questionnaire to rapidly diagnose sarcopenia. J Am Med Dir Assoc. 2016;17(1):98-99.',
  maxScore: 10,
  questions: SARCF_QUESTIONS,
  tiers: SARCF_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 1 ? 'spine' : null,
  motivationalPrompt: (score, tier) => `SARC-F score is ${score}/10 (${tier.label}). Progressive resistance exercise and adequate protein preserve lean body mass.`,
  patientEducation: 'The SARC-F is a 5-item questionnaire designed to rapidly screen for sarcopenia, muscle weakness, and physical frailty.'
};
