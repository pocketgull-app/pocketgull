import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

export const LIKERT_0_3_MBI = [
  { label: 'Never / Rarely (0)', value: 0 },
  { label: 'Monthly / Occasional (1)', value: 1 },
  { label: 'Weekly / Frequent (2)', value: 2 },
  { label: 'Daily / Constant (3)', value: 3 }
];

export const MBI_QUESTIONS: IQuestionItem[] = [
  // Emotional Exhaustion (EE)
  { id: 1, mbiVector: 'ee', question: 'Emotional Exhaustion: I feel emotionally drained from my day-to-day work.', options: LIKERT_0_3_MBI },
  { id: 2, mbiVector: 'ee', question: 'Emotional Exhaustion: I feel used up and completely depleted at the end of the workday.', options: LIKERT_0_3_MBI },
  { id: 3, mbiVector: 'ee', question: 'Emotional Exhaustion: I feel fatigued when I get up in the morning and have to face another day.', options: LIKERT_0_3_MBI },
  { id: 4, mbiVector: 'ee', question: 'Emotional Exhaustion: High-cognitive demand and continuous problem solving feels like an unsustainable strain.', options: LIKERT_0_3_MBI },
  { id: 5, mbiVector: 'ee', question: 'Emotional Exhaustion: I feel burned out, frustrated, or trapped by work obligations.', options: LIKERT_0_3_MBI },
  { id: 6, mbiVector: 'ee', question: 'Emotional Exhaustion: I feel I am working too hard on my job without adequate restorative recovery.', options: LIKERT_0_3_MBI },

  // Depersonalization / Cynicism (DP)
  { id: 7, mbiVector: 'dp', question: 'Depersonalization: I feel I treat colleagues, patients, or clients more impersonally than before.', options: LIKERT_0_3_MBI },
  { id: 8, mbiVector: 'dp', question: 'Depersonalization: I have become more callous toward people since taking on high-pressure responsibilities.', options: LIKERT_0_3_MBI },
  { id: 9, mbiVector: 'dp', question: 'Depersonalization: I worry that my professional environment is hardening me emotionally.', options: LIKERT_0_3_MBI },
  { id: 10, mbiVector: 'dp', question: 'Depersonalization: I find myself becoming skeptical or detached about the real-world value of my work.', options: LIKERT_0_3_MBI },
  { id: 11, mbiVector: 'dp', question: 'Depersonalization: I feel that stakeholders or peers blame me for factors outside my control.', options: LIKERT_0_3_MBI },

  // Personal Accomplishment / Efficacy (PA)
  { id: 12, mbiVector: 'pa', question: 'Personal Efficacy: I struggle to understand or empathize with what peers/clients are experiencing.', options: LIKERT_0_3_MBI },
  { id: 13, mbiVector: 'pa', question: 'Personal Efficacy: I feel ineffective at solving complex or critical operational problems.', options: LIKERT_0_3_MBI },
  { id: 14, mbiVector: 'pa', question: 'Personal Efficacy: I feel I am not making an effective or meaningful contribution through my work.', options: LIKERT_0_3_MBI },
  { id: 15, mbiVector: 'pa', question: 'Personal Efficacy: I lack daytime vitality, enthusiasm, and vigor for professional goals.', options: LIKERT_0_3_MBI },
  { id: 16, mbiVector: 'pa', question: 'Personal Efficacy: I struggle to stay calm and composed when unexpected crises arise.', options: LIKERT_0_3_MBI }
];

export const MBI_TIERS: ISeverityTier[] = [
  { min: 0, max: 12, label: 'Low Burnout / High Autonomic Resiliency', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain healthy cognitive pacing, flow-state boundaries, and restorative circadian sleep.' },
  { min: 13, max: 24, label: 'Moderate Burnout / Emerging Exhaustion', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Implement somatic grounding breaks, delegate non-core tasks, and enforce shift boundaries.' },
  { min: 25, max: 36, label: 'High Burnout / Critical Depersonalization', colorClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30', recommendation: 'Occupational health consultation, workload restructuring, and daily vagal nerve stimulation (AVS pacing).' },
  { min: 37, max: 48, label: 'Severe Clinical Burnout & Autonomic Overload', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate clinical sabbatical/leave evaluation, multidisciplinary psychological support, and adrenal recovery protocol.' }
];

export const MbiAssessment: IAssessmentDefinition<{ ee: number; dp: number; pa: number }> = {
  id: 'mbi',
  title: 'MBI (Maslach Burnout Inventory)',
  shortName: 'MBI Burnout',
  icon: '🔥',
  badge: 'Occupational Resiliency',
  category: 'occupational_burnout',
  citation: 'Maslach C, Jackson SE, Leiter MP. Maslach Burnout Inventory Manual. 4th ed. Mind Garden; 2016.',
  maxScore: 48,
  questions: MBI_QUESTIONS,
  tiers: MBI_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  calculateBreakdown: (answers) => {
    let ee = 0, dp = 0, pa = 0;
    MBI_QUESTIONS.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.mbiVector === 'ee') ee += val;
      if (q.mbiVector === 'dp') dp += val;
      if (q.mbiVector === 'pa') pa += val;
    });
    return { ee, dp, pa };
  },
  mapToAnatomyPart: (qId, val) => {
    if (val < 2) return null;
    const q = MBI_QUESTIONS.find(item => item.id === qId);
    if (!q || !q.mbiVector) return null;
    return q.mbiVector === 'ee' ? 'brain' : q.mbiVector === 'dp' ? 'chest' : 'brain';
  },
  motivationalPrompt: (score, tier) => `Your MBI Burnout score is ${score}/48 (${tier.label}). Where in your current workflow do you feel the heaviest cognitive friction?`,
  patientEducation: 'The Maslach Burnout Inventory measures occupational stress across Emotional Exhaustion, Depersonalization, and Personal Accomplishment.'
};
