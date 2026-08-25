import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const LIKERT_0_3_GROW = [
  { label: 'Strongly Disagree (0)', value: 0 },
  { label: 'Somewhat Disagree (1)', value: 1 },
  { label: 'Somewhat Agree (2)', value: 2 },
  { label: 'Strongly Agree (3)', value: 3 }
];

export const GROW_THYSELF_QUESTIONS: IQuestionItem[] = [
  { id: 1, growDomain: 'purpose', question: 'Purpose & Ikigai: I have a clear sense of personal mission, and my daily activities align with core values.', options: LIKERT_0_3_GROW },
  { id: 2, growDomain: 'somatic', question: 'Circadian & Somatic Sovereignty: I get morning sunlight, regulate breath under stress, prioritize quality sleep.', options: LIKERT_0_3_GROW },
  { id: 3, growDomain: 'nutrition', question: 'Epigenetic & Gut Vitality: I consume nutrient-dense whole foods rich in phytoncides while minimizing inflammatory stressors.', options: LIKERT_0_3_GROW },
  { id: 4, growDomain: 'emotional', question: 'Relational & Emotional Depth: I maintain authentic relationships, express vulnerability, adapt smoothly to challenges.', options: LIKERT_0_3_GROW },
  { id: 5, growDomain: 'cognitive', question: 'Cognitive Agency & Focus: I maintain strong digital hygiene, preserve deep focus, practice cognitive self-efficacy.', options: LIKERT_0_3_GROW }
];

export const GROW_THYSELF_TIERS: ISeverityTier[] = [
  { min: 0, max: 5, label: 'Flourishing Seed — High Potential', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Activate core Grow-Thyself foundational routines (sunlight, vagal breath, purpose journal).' },
  { min: 6, max: 10, label: 'Developing Growth — Emerging Sovereignty', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Optimize circadian timing, phytoncide foraging, and cognitive focus blocks.' },
  { min: 11, max: 15, label: 'Flourishing Sovereign — High Resilience', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Exemplary alignment across purpose, somatic resilience, and epigenetic vitality.' }
];

export const GrowThyselfAssessment: IAssessmentDefinition<{ purpose: number; somatic: number; nutrition: number; emotional: number; cognitive: number }> = {
  id: 'growthyself',
  title: 'Grow-Thyself Life Sovereignty & Epigenetic Flourishing Inventory',
  shortName: 'Grow-Thyself Life Index',
  icon: '🌱',
  badge: 'Life Sovereignty',
  category: 'functional',
  citation: 'Grow-Thyself Epigenetic Flourishing & Human Agency Framework (Pocket-Gull Integrative Medicine).',
  maxScore: 15,
  questions: GROW_THYSELF_QUESTIONS,
  tiers: GROW_THYSELF_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  calculateBreakdown: (answers) => {
    let purpose = 0, somatic = 0, nutrition = 0, emotional = 0, cognitive = 0;
    GROW_THYSELF_QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.growDomain === 'purpose') purpose += val;
      if (q.growDomain === 'somatic') somatic += val;
      if (q.growDomain === 'nutrition') nutrition += val;
      if (q.growDomain === 'emotional') emotional += val;
      if (q.growDomain === 'cognitive') cognitive += val;
    });
    return { purpose, somatic, nutrition, emotional, cognitive };
  },
  mapToAnatomyPart: (qId, val) => {
    if (val >= 2) return null;
    const q = GROW_THYSELF_QUESTIONS.find(item => item.id === qId);
    if (!q || !q.growDomain) return null;
    const map = { purpose: 'brain', somatic: 'chest', nutrition: 'abdomen', emotional: 'heart', cognitive: 'brain' };
    return map[q.growDomain] || 'brain';
  },
  motivationalPrompt: (score, tier) => `Your Grow-Thyself Sovereignty score is ${score}/15 (${tier.label}). Which dimension of flourishing feels most inspiring to nourish today?`,
  patientEducation: 'Grow-Thyself empowers proactive sovereignty across purpose, circadian somatic pacing, nutrition, relationships, and cognitive focus.'
};
