import { IAssessmentDefinition, ISeverityTier, IQuestionItem } from '../types';

const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

export const ROS14_QUESTIONS: IQuestionItem[] = [
  { id: 1, category: 'Constitutional', question: 'Fever, chills, night sweats, or unintentional weight loss?', options: YES_NO },
  { id: 2, category: 'Eyes', question: 'Vision changes, eye pain, redness, or discharge?', options: YES_NO },
  { id: 3, category: 'ENT / Mouth', question: 'Hearing loss, tinnitus, sore throat, or nasal congestion?', options: YES_NO },
  { id: 4, category: 'Cardiovascular', question: 'Chest tightness, palpitations, or leg swelling (edema)?', options: YES_NO },
  { id: 5, category: 'Respiratory', question: 'Shortness of breath, wheezing, or chronic cough?', options: YES_NO },
  { id: 6, category: 'Gastrointestinal', question: 'Abdominal pain, nausea, reflux, or changes in bowel habits?', options: YES_NO },
  { id: 7, category: 'Genitourinary', question: 'Dysuria, urgency, flank pain, or urinary frequency?', options: YES_NO },
  { id: 8, category: 'Musculoskeletal', question: 'Joint pain, muscle stiffness, back pain, or swelling?', options: YES_NO },
  { id: 9, category: 'Integumentary / Skin', question: 'Rash, itching, new skin lesions, or delayed healing?', options: YES_NO },
  { id: 10, category: 'Neurological', question: 'Headaches, dizziness, numbness, tingling, or tremors?', options: YES_NO },
  { id: 11, category: 'Psychiatric', question: 'Anxiety, depressed mood, panic attacks, or sleep disruption?', options: YES_NO },
  { id: 12, category: 'Endocrine', question: 'Cold/heat intolerance, polydipsia (excessive thirst), or fatigue?', options: YES_NO },
  { id: 13, category: 'Hematological / Lymphatic', question: 'Easy bruising, swollen lymph nodes, or frequent infections?', options: YES_NO },
  { id: 14, category: 'Allergy / Immunology', question: 'Environmental allergies, hives, or frequent allergic reactions?', options: YES_NO }
];

export const ROS14_TIERS: ISeverityTier[] = [
  { min: 0, max: 0, label: '14-System Review Clear', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'No active organ system complaints reported.' },
  { min: 1, max: 3, label: 'Mild Organ System Burden', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Localized organ system findings logged to patient chart.' },
  { min: 4, max: 7, label: 'Moderate Multi-System Involvement', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Comprehensive physical examination & diagnostic workup recommended.' },
  { min: 8, max: 14, label: 'High Multi-System Burden', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Urgent multidisciplinary specialist review and organ system stratification required.' }
];

export const Ros14Assessment: IAssessmentDefinition = {
  id: 'ros14',
  title: 'ROS-14 (14-System Review of Systems Intake)',
  shortName: 'ROS-14 Systems Review',
  icon: '🩺',
  badge: 'Clinical Intake',
  category: 'somatic',
  citation: 'Standard CMS 14-System Review of Systems (ROS) Evaluation and Management Clinical Documentation.',
  maxScore: 14,
  questions: ROS14_QUESTIONS,
  tiers: ROS14_TIERS,
  calculateScore: (answers) => Object.values(answers).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
  mapToAnatomyPart: (qId, val) => {
    if (val !== 1) return null;
    const catMap = { 1: 'systemic', 2: 'head', 3: 'head', 4: 'chest', 5: 'lungs', 6: 'abdomen', 7: 'pelvis', 8: 'spine', 9: 'skin', 10: 'brain', 11: 'brain', 12: 'thyroid', 13: 'lymph', 14: 'systemic' };
    return catMap[qId] || 'chest';
  },
  motivationalPrompt: (score, tier) => `ROS-14 review identifies ${score}/14 positive organ systems (${tier.label}). Let us review each identified symptom in sequence.`,
  patientEducation: 'The 14-System Review of Systems is a structured survey of symptoms across every major organ system.'
};
