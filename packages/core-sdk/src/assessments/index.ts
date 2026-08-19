/**
 * Clinical Assessment Scoring Engines
 * LOINC standard validated clinical screeners.
 */

export interface IClinicalScoreResult {
  loincCode: string;
  instrumentName: string;
  totalScore: number;
  maxScore: number;
  severity: string;
  clinicalAction: string;
  criticalAlert?: boolean;
}

/**
 * Scores PHQ-9 (Patient Health Questionnaire-9) Depression Scale (LOINC: 44249-1)
 * @param answers Array of 9 integer responses (each 0 to 3)
 */
export function scorePhq9(answers: number[]): IClinicalScoreResult {
  if (!answers || answers.length !== 9) {
    throw new Error('PHQ-9 requires exactly 9 item scores (0-3 each)');
  }

  const totalScore = answers.reduce((acc, v) => acc + Math.max(0, Math.min(3, Math.floor(v))), 0);
  const q9SelfHarm = answers[8]! > 0;

  let severity = 'None-minimal';
  let clinicalAction = 'Supportive care; repeat screening in 12 months.';

  if (totalScore >= 20) {
    severity = 'Severe';
    clinicalAction = 'Immediate pharmacotherapy and expedited psychiatric referral.';
  } else if (totalScore >= 15) {
    severity = 'Moderately Severe';
    clinicalAction = 'Active treatment with psychotherapy and/or pharmacotherapy.';
  } else if (totalScore >= 10) {
    severity = 'Moderate';
    clinicalAction = 'Treatment plan consideration (psychotherapy/pharmacotherapy).';
  } else if (totalScore >= 5) {
    severity = 'Mild';
    clinicalAction = 'Watchful waiting; repeat PHQ-9 in 4-6 weeks.';
  }

  return {
    loincCode: '44249-1',
    instrumentName: 'PHQ-9 Depression Screener',
    totalScore,
    maxScore: 27,
    severity,
    clinicalAction: q9SelfHarm
      ? `CRITICAL ALERT: Question 9 endorsed positive for self-harm/suicidal ideation. Immediate C-SSRS assessment and safety plan required. ${clinicalAction}`
      : clinicalAction,
    criticalAlert: q9SelfHarm
  };
}

/**
 * Scores GAD-7 (Generalized Anxiety Disorder-7) Scale (LOINC: 69737-5)
 * @param answers Array of 7 integer responses (each 0 to 3)
 */
export function scoreGad7(answers: number[]): IClinicalScoreResult {
  if (!answers || answers.length !== 7) {
    throw new Error('GAD-7 requires exactly 7 item scores (0-3 each)');
  }

  const totalScore = answers.reduce((acc, v) => acc + Math.max(0, Math.min(3, Math.floor(v))), 0);

  let severity = 'Minimal Anxiety';
  let clinicalAction = 'Supportive lifestyle and sleep hygiene recommendations.';

  if (totalScore >= 15) {
    severity = 'Severe Anxiety';
    clinicalAction = 'Active clinical intervention with CBT and possible SSRI/SNRI pharmacotherapy.';
  } else if (totalScore >= 10) {
    severity = 'Moderate Anxiety';
    clinicalAction = 'Further evaluation for Generalized Anxiety Disorder; consider psychotherapy.';
  } else if (totalScore >= 5) {
    severity = 'Mild Anxiety';
    clinicalAction = 'Watchful waiting; re-evaluate in 30 days.';
  }

  return {
    loincCode: '69737-5',
    instrumentName: 'GAD-7 Anxiety Screener',
    totalScore,
    maxScore: 21,
    severity,
    clinicalAction
  };
}

/**
 * Scores Edinburgh Postnatal Depression Scale (EPDS) (LOINC: 71354-5)
 * @param answers Array of 10 integer responses (each 0 to 3)
 */
export function scoreEpds(answers: number[]): IClinicalScoreResult {
  if (!answers || answers.length !== 10) {
    throw new Error('EPDS requires exactly 10 item scores (0-3 each)');
  }

  const totalScore = answers.reduce((acc, v) => acc + Math.max(0, Math.min(3, Math.floor(v))), 0);
  const q10SelfHarm = answers[9]! > 0;

  let severity = 'Low Depression Risk';
  let clinicalAction = 'Routine postpartum supportive care and maternal wellness coaching.';

  if (totalScore >= 13) {
    severity = 'Probable Major Postpartum Depression';
    clinicalAction = 'Urgent maternal mental health evaluation, lactation-safe medication review, and doula/family support network activation.';
  } else if (totalScore >= 10) {
    severity = 'Possible Mild-to-Moderate Depression';
    clinicalAction = 'Comprehensive clinical assessment; repeat EPDS in 2 weeks.';
  }

  return {
    loincCode: '71354-5',
    instrumentName: 'Edinburgh Postnatal Depression Scale (EPDS)',
    totalScore,
    maxScore: 30,
    severity,
    clinicalAction: q10SelfHarm
      ? `CRITICAL ALERT: Question 10 (self-harm thoughts) is positive. Immediate crisis support protocol required. ${clinicalAction}`
      : clinicalAction,
    criticalAlert: q10SelfHarm
  };
}
