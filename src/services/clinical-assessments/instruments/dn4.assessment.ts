import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

export const DN4_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Pain Qualities: Does the pain have burning, painful cold, or electric shock sensations?', options: YES_NO },
  { id: 2, question: 'Associated Symptoms: Is the pain associated with tingling, pins and needles, numbness, or itching in the same area?', options: YES_NO },
  { id: 3, question: 'Physical Examination: Is the pain located in an area with touch hypoesthesia or pinprick hypoesthesia?', options: YES_NO },
  { id: 4, question: 'Mechanical Allodynia: Can the pain be caused or increased by brushing with a soft cotton swab?', options: YES_NO }
];

export const DN4_TIERS: ISeverityTier[] = [
  { min: 0, max: 1, label: 'Likely Nociceptive / Somatic Pain', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Standard musculoskeletal therapy, NSAIDs/topicals, and biomechanical posture correction.' },
  { min: 2, max: 4, label: 'Neuropathic Pain Component Confirmed', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Neuropathic pharmacological evaluation (Gabapentinoids, SNRIs) & neuro-meridian electroacupuncture.' }
];

export const Dn4Assessment: IAssessmentDefinition = {
  id: 'dn4',
  title: 'DN4 (Douleur Neuropathique 4 Pain Screener)',
  shortName: 'DN4 Neuropathic',
  icon: '⚡',
  badge: 'Pain Discrimination',
  category: 'somatic',
  citation: 'Bouhassira D, Attal N, Alchaar H, et al. Comparison of pain syndromes associated with nervous or somatic lesions and development of a new neuropathic pain diagnostic questionnaire (DN4). Pain. 2005;114(1-2):29-36.',
  maxScore: 4,
  questions: DN4_QUESTIONS,
  tiers: DN4_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => val >= 1 ? 'spine' : null,
  motivationalPrompt: (score, tier) => `DN4 score is ${score}/4 (${tier.label}). Differentiating nerve pain from muscle soreness allows targeted relief strategies.`,
  patientEducation: 'The DN4 is a 4-question clinical tool that differentiates neuropathic (nerve) pain from nociceptive (tissue) pain.'
};
