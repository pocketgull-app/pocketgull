import { IQuestionItem, ISeverityTier } from './types';

// Standard 4-point Likert options (0-3) for PHQ-9 and GAD-7
export const LIKERT_0_3 = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 }
];

export const LIKERT_0_3_GROW = [
  { label: 'Strongly Disagree (0)', value: 0 },
  { label: 'Somewhat Disagree (1)', value: 1 },
  { label: 'Somewhat Agree (2)', value: 2 },
  { label: 'Strongly Agree (3)', value: 3 }
];

export const LIKERT_0_2_SOMATIC = [
  { label: 'Not bothered', value: 0 },
  { label: 'Bothered a little', value: 1 },
  { label: 'Bothered a lot', value: 2 }
];

export const YES_NO = [
  { label: 'Negative (No)', value: 0 },
  { label: 'Positive (Yes)', value: 1 }
];

// PHQ-9 (Patient Health Questionnaire 9)
export const PHQ9_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Little interest or pleasure in doing things?', options: LIKERT_0_3 },
  { id: 2, question: 'Feeling down, depressed, or hopeless?', options: LIKERT_0_3 },
  { id: 3, question: 'Trouble falling or staying asleep, or sleeping too much?', options: LIKERT_0_3 },
  { id: 4, question: 'Feeling tired or having little energy?', options: LIKERT_0_3 },
  { id: 5, question: 'Poor appetite or overeating?', options: LIKERT_0_3 },
  { id: 6, question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?', options: LIKERT_0_3 },
  { id: 7, question: 'Trouble concentrating on things, such as reading the newspaper or watching television?', options: LIKERT_0_3 },
  { id: 8, question: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless?', options: LIKERT_0_3 },
  { id: 9, question: 'Thoughts that you would be better off dead, or of hurting yourself in some way?', options: LIKERT_0_3 }
];

export const PHQ9_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal / None', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Regular wellness monitoring & circadian hygiene.' },
  { min: 5, max: 9, label: 'Mild Depression', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Watchful waiting, lifestyle adjuncts, and biofeedback.' },
  { min: 10, max: 14, label: 'Moderate Depression', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Consider clinical consultation & supportive psychotherapy.' },
  { min: 15, max: 19, label: 'Moderately Severe Depression', colorClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30', recommendation: 'Clinical assessment recommended; psychotherapy or pharmacotherapy evaluation.' },
  { min: 20, max: 27, label: 'Severe Depression', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate clinical assessment and multidisciplinary care plan required.' }
];

// GAD-7 (Generalized Anxiety Disorder 7)
export const GAD7_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Feeling nervous, anxious, or on edge?', options: LIKERT_0_3 },
  { id: 2, question: 'Not being able to stop or control worrying?', options: LIKERT_0_3 },
  { id: 3, question: 'Worrying too much about different things?', options: LIKERT_0_3 },
  { id: 4, question: 'Trouble relaxing?', options: LIKERT_0_3 },
  { id: 5, question: 'Being so restless that it is hard to sit still?', options: LIKERT_0_3 },
  { id: 6, question: 'Becoming easily annoyed or irritable?', options: LIKERT_0_3 },
  { id: 7, question: 'Feeling afraid as if something awful might happen?', options: LIKERT_0_3 }
];

export const GAD7_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal Anxiety', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain standard stress resiliency routines.' },
  { min: 5, max: 9, label: 'Mild Anxiety', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Execute 0.1 Hz vagal resonance biofeedback & somatic breathing.' },
  { min: 10, max: 14, label: 'Moderate Anxiety', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Activate Somatic Grounding Loop & clinical evaluation.' },
  { min: 15, max: 21, label: 'Severe Anxiety', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate clinical evaluation & high-frequency parasympathetic regulation.' }
];

// ISI (Insomnia Severity Index)
export const ISI_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Difficulty falling asleep?', options: [{ label: 'None', value: 0 }, { label: 'Mild', value: 1 }, { label: 'Moderate', value: 2 }, { label: 'Severe', value: 3 }, { label: 'Very Severe', value: 4 }] },
  { id: 2, question: 'Difficulty staying asleep?', options: [{ label: 'None', value: 0 }, { label: 'Mild', value: 1 }, { label: 'Moderate', value: 2 }, { label: 'Severe', value: 3 }, { label: 'Very Severe', value: 4 }] },
  { id: 3, question: 'Problems waking up too early?', options: [{ label: 'None', value: 0 }, { label: 'Mild', value: 1 }, { label: 'Moderate', value: 2 }, { label: 'Severe', value: 3 }, { label: 'Very Severe', value: 4 }] },
  { id: 4, question: 'How satisfied/dissatisfied are you with your current sleep pattern?', options: [{ label: 'Very Satisfied', value: 0 }, { label: 'Satisfied', value: 1 }, { label: 'Neutral', value: 2 }, { label: 'Dissatisfied', value: 3 }, { label: 'Very Dissatisfied', value: 4 }] },
  { id: 5, question: 'How noticeable to others do you think your sleep problem is in terms of impairing your quality of life?', options: [{ label: 'Not at all Noticeable', value: 0 }, { label: 'A Little', value: 1 }, { label: 'Somewhat', value: 2 }, { label: 'Much', value: 3 }, { label: 'Very Much Noticeable', value: 4 }] },
  { id: 6, question: 'How worried/distressed are you about your current sleep problem?', options: [{ label: 'Not at all Worried', value: 0 }, { label: 'A Little', value: 1 }, { label: 'Somewhat', value: 2 }, { label: 'Much', value: 3 }, { label: 'Very Much Worried', value: 4 }] },
  { id: 7, question: 'To what extent do you consider your sleep problem to interfere with your daily functioning?', options: [{ label: 'Not at all', value: 0 }, { label: 'A Little', value: 1 }, { label: 'Somewhat', value: 2 }, { label: 'Much', value: 3 }, { label: 'Very Much Interfering', value: 4 }] }
];

export const ISI_TIERS: ISeverityTier[] = [
  { min: 0, max: 7, label: 'No Clinically Significant Insomnia', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain standard sleep hygiene and dark-mode lighting.' },
  { min: 8, max: 14, label: 'Subthreshold Insomnia', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Optimize circadian timing, reduce evening blue light, and use Solfeggio 432Hz sleep decks.' },
  { min: 15, max: 21, label: 'Clinical Insomnia (Moderate Severity)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'CBT-I sleep restriction strategies & clinical sleep assessment.' },
  { min: 22, max: 28, label: 'Clinical Insomnia (Severe)', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive medical sleep study & clinical consultation recommended.' }
];

// C-SSRS (Columbia Suicide Severity Rating Scale — Screen)
export const CSSRS_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Have you wished you were dead or wished you could go to sleep and not wake up?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] },
  { id: 2, question: 'Have you actually had any thoughts of killing yourself?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }] },
  { id: 3, question: 'Have you been thinking about how you might do this (method)?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 2 }] },
  { id: 4, question: 'Have you had these thoughts and had some intention of acting on them?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 3 }] },
  { id: 5, question: 'Have you started to work out or worked out the details of how to kill yourself?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 4 }] },
  { id: 6, question: 'Have you done anything, started to do anything, or prepared to do anything to end your life?', options: [{ label: 'No', value: 0 }, { label: 'Yes', value: 5 }] }
];

export const CSSRS_TIERS: ISeverityTier[] = [
  { min: 0, max: 0, label: 'Low Risk / Screen Negative', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Standard supportive care & routine wellness checks.' },
  { min: 1, max: 2, label: 'Moderate Risk — Ideation Present', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Behavioral health referral & safety plan development.' },
  { min: 3, max: 16, label: 'HIGH RISK Sentinel Alert', colorClass: 'bg-rose-600 text-white border-rose-700 animate-pulse', recommendation: 'IMMEDIATE CLINICAL SAFETY TRIAGE REQUIRED. Activate 988 Suicide & Crisis Lifeline.' }
];

// ROS-14 (14-System Review of Systems Intake)
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

// PHQ-15 (Somatic Symptom Scale)
export const PHQ15_QUESTIONS: IQuestionItem[] = [
  { id: 1, question: 'Stomach pain?', options: LIKERT_0_2_SOMATIC },
  { id: 2, question: 'Back pain?', options: LIKERT_0_2_SOMATIC },
  { id: 3, question: 'Pain in your arms, legs, or joints (knees, hips, etc.)?', options: LIKERT_0_2_SOMATIC },
  { id: 4, question: 'Menstrual cramps or other problems with your periods?', options: LIKERT_0_2_SOMATIC },
  { id: 5, question: 'Headaches?', options: LIKERT_0_2_SOMATIC },
  { id: 6, question: 'Chest pain?', options: LIKERT_0_2_SOMATIC },
  { id: 7, question: 'Dizziness or lightheadedness?', options: LIKERT_0_2_SOMATIC },
  { id: 8, question: 'Fainting spells?', options: LIKERT_0_2_SOMATIC },
  { id: 9, question: 'Feeling your heart pound or race (palpitations)?', options: LIKERT_0_2_SOMATIC },
  { id: 10, question: 'Shortness of breath?', options: LIKERT_0_2_SOMATIC },
  { id: 11, question: 'Pain or problems during sexual intercourse?', options: LIKERT_0_2_SOMATIC },
  { id: 12, question: 'Constipation, loose bowels, or diarrhea?', options: LIKERT_0_2_SOMATIC },
  { id: 13, question: 'Nausea, gas, or indigestion?', options: LIKERT_0_2_SOMATIC },
  { id: 14, question: 'Feeling tired or having low energy?', options: LIKERT_0_2_SOMATIC },
  { id: 15, question: 'Trouble sleeping?', options: LIKERT_0_2_SOMATIC }
];

export const PHQ15_TIERS: ISeverityTier[] = [
  { min: 0, max: 4, label: 'Minimal Somatic Burden', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Low physical symptom distress.' },
  { min: 5, max: 9, label: 'Low Somatic Symptom Severity', colorClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/30', recommendation: 'Somatic pacing & vagal biofeedback recommended.' },
  { min: 10, max: 14, label: 'Medium Somatic Symptom Severity', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Evaluation for somatoform overlap & autonomic dysregulation.' },
  { min: 15, max: 30, label: 'High Somatic Symptom Severity', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive somatic & autonomic specialist evaluation required.' }
];

// PRAPARE (SDOH Protocol)
export const PRAPARE_QUESTIONS: IQuestionItem[] = [
  { id: 1, zCode: 'Z59.8', question: 'Do you have stable, safe housing to live in over the next 2 months?', options: [{ label: 'Stable Housing', value: 0 }, { label: 'Unstable / At Risk (Z59.8)', value: 2 }, { label: 'Unsheltered (Z59.0)', value: 3 }] },
  { id: 2, zCode: 'Z59.41', question: 'In the past year, have you worried that your food would run out before you got money to buy more?', options: [{ label: 'No Food Insecurity', value: 0 }, { label: 'Food Insecurity Present (Z59.41)', value: 2 }] },
  { id: 3, zCode: 'Z59.82', question: 'Has lack of transportation kept you from medical appointments or work?', options: [{ label: 'No Transportation Barrier', value: 0 }, { label: 'Transportation Barrier (Z59.82)', value: 2 }] },
  { id: 4, zCode: 'Z59.6', question: 'Are you currently experiencing hard financial stress in affording basic necessities (bills, medication)?', options: [{ label: 'Low Stress', value: 0 }, { label: 'Moderate Financial Stress (Z59.6)', value: 1 }, { label: 'Severe Strain (Z59.6)', value: 2 }] },
  { id: 5, zCode: 'Z60.2', question: 'How often do you feel lonely or isolated from family, friends, or community support?', options: [{ label: 'Rarely / Never', value: 0 }, { label: 'Sometimes', value: 1 }, { label: 'Always / Severely Isolated (Z60.2)', value: 2 }] }
];

export const PRAPARE_TIERS: ISeverityTier[] = [
  { min: 0, max: 0, label: 'Low SDOH Risk', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'No immediate social determinants of health barriers identified.' },
  { min: 1, max: 3, label: 'Moderate SDOH Need Identified', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'SDOH Z-codes mapped. Community resource navigation initiated.' },
  { min: 4, max: 11, label: 'HIGH SDOH Risk & Material Hardship', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Immediate social work referral, food/housing voucher routing & SDOH Z-code FHIR export.' }
];

// AYURVEDIC PRAKRITI & VIKRITI TRIDOSHA INVENTORY
export const AYURVEDA_QUESTIONS: IQuestionItem[] = [
  { id: 1, doshaVector: 'vata', question: 'Body Frame & Movement: Are you naturally slender with light bones, dry skin, and quick, energetic movements?', options: YES_NO },
  { id: 2, doshaVector: 'pitta', question: 'Metabolic Heat & Focus: Do you have a warm body temperature, intense appetite/thirst, sharp intellect, and propensity to feel hot?', options: YES_NO },
  { id: 3, doshaVector: 'kapha', question: 'Stability & Endurance: Do you have a solid/broad frame, smooth moist skin, calm demeanor, and slow steady digestion?', options: YES_NO },
  { id: 4, doshaVector: 'vata', question: 'Sleep & Mind: Is your sleep light or easily disturbed, accompanied by a fast, creative mind prone to anxiety or racing thoughts?', options: YES_NO },
  { id: 5, doshaVector: 'pitta', question: 'Digestion & Emotion: Do you experience acid reflux, heartburn, soft frequent stools, or intense perfectionistic drive?', options: YES_NO },
  { id: 6, doshaVector: 'kapha', question: 'Fluid & Weight: Do you hold water easily, experience sinus congestion, heavy morning fatigue, or find it hard to lose weight?', options: YES_NO }
];

export const AYURVEDA_TIERS: ISeverityTier[] = [
  { min: 0, max: 1, label: 'Sama Doshic Balance', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain tri-doshic seasonal diet (Ritucharya) & warm herbal teas.' },
  { min: 2, max: 3, label: 'Single Doshic Aggravation (Vikriti)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Pacify primary aggravated dosha via targeted pranayama & herbal adaptogens.' },
  { min: 4, max: 6, label: 'Dual/Tri-Doshic Imbalance', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Comprehensive Panchakarma consultation & Agni/Ama metabolic reset required.' }
];

// TRADITIONAL CHINESE MEDICINE (TCM) SHI WEN TEN QUESTIONS
export const TCM_QUESTIONS: IQuestionItem[] = [
  { id: 1, tcmVector: 'yang', question: 'Chills & Temperature: Do you frequently feel aversion to cold, cold hands/feet, or preference for hot drinks?', options: YES_NO },
  { id: 2, tcmVector: 'heat', question: 'Perspiration & Heat: Do you experience spontaneous daytime sweating, night sweats, or afternoon hot flashes?', options: YES_NO },
  { id: 3, tcmVector: 'qi', question: 'Energy & Breath: Do you experience shortness of breath on exertion, weak voice, or heavy fatigue after eating?', options: YES_NO },
  { id: 4, tcmVector: 'blood', question: 'Tongue & Complexion: Is your tongue body pale or purple/darkened with scalloped edges or thin coating?', options: YES_NO },
  { id: 5, tcmVector: 'yin', question: 'Mouth & Sleep: Do you have a dry mouth/throat at night, restless sleep, or five-palm heat (palms, soles, chest)?', options: YES_NO },
  { id: 6, tcmVector: 'cold', question: 'Abdomen & Stool: Do you have dull abdominal pain relieved by warmth/pressure, or loose watery stools?', options: YES_NO }
];

export const TCM_TIERS: ISeverityTier[] = [
  { min: 0, max: 1, label: 'Balanced Qi & Blood Flow', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Maintain seasonal Qigong practice & balanced organ meridian flow.' },
  { min: 2, max: 3, label: 'Moderate Pattern Imbalance (Ba Gang)', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Harmonize Qi/Blood & apply targeted acupressure/moxibustion.' },
  { min: 4, max: 6, label: 'Significant Pattern Stagnation / Deficiency', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Acupuncture pattern evaluation & classical Kampo/TCM herbal prescription.' }
];

// GROW THYSELF LIFE SOVEREIGNTY & EPIGENETIC FLOURISHING INVENTORY
export const GROW_THYSELF_QUESTIONS: IQuestionItem[] = [
  { id: 1, growDomain: 'purpose', question: 'Purpose & Ikigai: I have a clear sense of personal mission, and my daily activities align with my core values.', options: LIKERT_0_3_GROW },
  { id: 2, growDomain: 'somatic', question: 'Circadian & Somatic Sovereignty: I get morning sunlight, regulate my breath under stress, and prioritize high-quality sleep.', options: LIKERT_0_3_GROW },
  { id: 3, growDomain: 'nutrition', question: 'Epigenetic & Gut Vitality: I consume whole, nutrient-dense foods rich in phytoncides while minimizing ultra-processed inflammatory stressors.', options: LIKERT_0_3_GROW },
  { id: 4, growDomain: 'emotional', question: 'Relational & Emotional Depth: I maintain authentic relationships, express vulnerability, and adapt smoothly to life challenges.', options: LIKERT_0_3_GROW },
  { id: 5, growDomain: 'cognitive', question: 'Cognitive Agency & Focus: I maintain strong digital hygiene, preserve deep focus, and practice cognitive self-efficacy.', options: LIKERT_0_3_GROW }
];

export const GROW_THYSELF_TIERS: ISeverityTier[] = [
  { min: 0, max: 5, label: 'Flourishing Seed — High Potential', colorClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30', recommendation: 'Activate core Grow-Thyself foundational routines (sunlight, vagal breath, purpose journal).' },
  { min: 6, max: 10, label: 'Developing Growth — Emerging Sovereignty', colorClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30', recommendation: 'Optimize circadian timing, phytoncide foraging, and cognitive focus blocks.' },
  { min: 11, max: 15, label: 'Flourishing Sovereign — High Resilience', colorClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', recommendation: 'Master level alignment across purpose, somatic resilience, and epigenetic vitality.' }
];
