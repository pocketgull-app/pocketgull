import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

export const AYURVEDA_QUESTIONS: IQuestionItem[] = [
  { id: 1, doshaVector: 'vata', question: 'Body Frame & Movement: Slender with light bones, dry skin, and quick, energetic movements?', options: YES_NO },
  { id: 2, doshaVector: 'pitta', question: 'Metabolic Heat & Focus: Warm body temp, intense appetite/thirst, sharp intellect, prone to feeling hot?', options: YES_NO },
  { id: 3, doshaVector: 'kapha', question: 'Stability & Endurance: Solid/broad frame, smooth moist skin, calm demeanor, steady digestion?', options: YES_NO },
  { id: 4, doshaVector: 'vata', question: 'Sleep & Mind: Sleep light or easily disturbed, fast creative mind prone to racing thoughts?', options: YES_NO },
  { id: 5, doshaVector: 'pitta', question: 'Digestion & Emotion: Acid reflux, heartburn, soft frequent stools, intense perfectionistic drive?', options: YES_NO },
  { id: 6, doshaVector: 'kapha', question: 'Fluid & Weight: Hold water easily, sinus congestion, heavy morning fatigue, hard to lose weight?', options: YES_NO }
];

export const AYURVEDA_TIERS: ISeverityTier[] = [
  { min: 0, max: 1, label: 'Sama Doshic Balance', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain tri-doshic seasonal diet (Ritucharya) & warm herbal teas.' },
  { min: 2, max: 3, label: 'Single Doshic Aggravation (Vikriti)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Pacify primary aggravated dosha via targeted pranayama & herbal adaptogens.' },
  { min: 4, max: 6, label: 'Dual/Tri-Doshic Imbalance', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive Panchakarma consultation & Agni/Ama metabolic reset required.' }
];

export const AyurvedaAssessment: IAssessmentDefinition<{ vata: number; pitta: number; kapha: number }> = {
  id: 'ayurveda',
  title: 'Ayurvedic Prakriti & Vikriti Tridosha Inventory',
  shortName: 'Ayurveda Tridosha',
  icon: '🛕',
  badge: 'Integrative VPK',
  category: 'integrative',
  citation: 'Charaka Samhita & Ashtanga Hridaya Tridosha Diagnostic Framework.',
  maxScore: 6,
  questions: AYURVEDA_QUESTIONS,
  tiers: AYURVEDA_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  calculateBreakdown: (answers) => {
    let vata = 0, pitta = 0, kapha = 0;
    AYURVEDA_QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.doshaVector === 'vata') vata += val;
      if (q.doshaVector === 'pitta') pitta += val;
      if (q.doshaVector === 'kapha') kapha += val;
    });
    return { vata, pitta, kapha };
  },
  mapToAnatomyPart: (qId, val) => {
    if (val !== 1) return null;
    const q = AYURVEDA_QUESTIONS.find(item => item.id === qId);
    if (!q || !q.doshaVector) return null;
    return q.doshaVector === 'vata' ? 'brain' : q.doshaVector === 'pitta' ? 'chest' : 'lungs';
  },
  motivationalPrompt: (score, tier) => `Ayurvedic Tridosha profile (${tier.label}). Balancing your daily circadian rhythm supports Agni and somatic vitality.`,
  patientEducation: 'Ayurvedic tridosha profiling identifies your natural baseline constitution (Prakriti) and current dynamic imbalances (Vikriti).'
};
