import { Injectable, signal } from '@angular/core';

export type TriageAcuityLevel = 'STAT_EMERGENCY' | 'URGENT' | 'ROUTINE';

export interface IEmergencyRedFlag {
  category: 'STROKE_BE_FAST' | 'CARDIAC_ACS' | 'SEPSIS_QSOFA' | 'PSYCH_SUICIDE_RISK' | 'RESPIRATORY_FAILURE';
  description: string;
  mandatoryDirective: string;
  statutoryHotline: string;
}

export interface ITriageEvaluationResult {
  acuityLevel: TriageAcuityLevel;
  isDeterministicOverride: boolean;
  detectedRedFlags: IEmergencyRedFlag[];
  clinicalDirectives: string[];
  sanitizedOrderText?: string;
  ismpCompliant: boolean;
  fhirTriageCode: string;
}

export interface IPatientTriageInput {
  textNarrative?: string;
  age?: number;
  symptoms?: string[];
  vitals?: {
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    respiratoryRate?: number;
    spo2Pct?: number;
    temperatureC?: number;
  };
  knownConditions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalTriageGuardService {
  lastEvaluation = signal<ITriageEvaluationResult | null>(null);

  /**
   * Deterministic Red-Flag Gate
   * Evaluates patient inputs against zero-tolerance emergency triggers ahead of LLM generation.
   */
  evaluateTriageAcuity(input: IPatientTriageInput): ITriageEvaluationResult {
    const redFlags: IEmergencyRedFlag[] = [];
    const narrative = (input.textNarrative || '').toLowerCase();
    const symptoms = (input.symptoms || []).map(s => s.toLowerCase());
    const conditions = (input.knownConditions || []).map(c => c.toLowerCase());
    const allText = `${narrative} ${symptoms.join(' ')} ${conditions.join(' ')}`;

    // 1. BE-FAST Acute Stroke Criteria
    const hasFaceDroop = /facial\s*droop|face\s*droop|asymmetric\s*smile/i.test(allText);
    const hasArmDrift = /arm\s*drift|arm\s*weakness|hemiplegia|unilateral\s*weakness/i.test(allText);
    const hasSpeechDeficit = /slurred\s*speech|aphasia|dysarthria|cannot\s*speak/i.test(allText);
    const hasSuddenVisionLoss = /sudden\s*(?:loss\s*of\s*vision|blindness|diplopia)/i.test(allText);
    const hasSuddenAtaxia = /severe\s*ataxia|sudden\s*loss\s*of\s*balance/i.test(allText);

    if (hasFaceDroop || hasArmDrift || hasSpeechDeficit || hasSuddenVisionLoss || hasSuddenAtaxia) {
      redFlags.push({
        category: 'STROKE_BE_FAST',
        description: 'BE-FAST acute neurological deficits indicating potential ischemic or hemorrhagic stroke.',
        mandatoryDirective: 'STAT 911 / Code Stroke activation. Keep strictly NPO (zero oral intake). Do NOT administer aspirin until non-contrast head CT rules out hemorrhage. Note exact Last Known Well time.',
        statutoryHotline: '911 (US/CA) / 999 (UK) / 000 (AU) / 111 (NZ)'
      });
    }

    // 2. High-Risk Acute Coronary Syndrome (ACS)
    const hasChestPain = /(?:substernal\s+)?chest\s+(?:pain|tightness|pressure|discomfort|heaviness|squeezing)|substernal\s+(?:pain|pressure|tightness|discomfort)|angina/i.test(allText);
    const hasDiaphoresis = /diaphoresis|cold\s+sweat|profuse\s+sweat|clammy/i.test(allText);
    const hasDyspnea = /dyspnea|shortness\s+of\s+breath|breathless|gasping/i.test(allText);
    const isCardiacRiskAge = Boolean((input.age && input.age >= 40) || /hypertension|diabetes|coronary|smok|hyperlipid/i.test(allText));

    if (hasChestPain && (hasDiaphoresis || hasDyspnea || isCardiacRiskAge)) {
      redFlags.push({
        category: 'CARDIAC_ACS',
        description: 'Acute chest distress with autonomic or demographic risk factors for Acute Coronary Syndrome.',
        mandatoryDirective: 'Immediate STAT 12-lead ECG within 10 minutes and cardiac troponin assay. Administer chewable Aspirin 324 mg unless contraindicated.',
        statutoryHotline: '911 / Emergency Department Transfer'
      });
    }

    // 3. Suicidal Ideation / Crisis Protocol (C-SSRS / 988)
    const hasSuicidalIntent = /suicid|kill\s*myself|end\s*my\s*life|want\s*to\s*die|self-harm/i.test(allText);
    if (hasSuicidalIntent) {
      redFlags.push({
        category: 'PSYCH_SUICIDE_RISK',
        description: 'Active suicidal ideation or expressed self-harm intent requiring immediate crisis intervention.',
        mandatoryDirective: 'Immediate connection to 988 Suicide & Crisis Lifeline. Ensure continuous direct supervision. Remove lethal means.',
        statutoryHotline: '988 (US/CA) / 111 (UK) / Lifeline 13 11 14 (AU) / 1737 (NZ)'
      });
    }

    // 4. Sepsis / Severe Physiological Compromise (qSOFA & SpO2)
    const vitals = input.vitals || {};
    const sbp = vitals.systolicBp;
    const rr = vitals.respiratoryRate;
    const spo2 = vitals.spo2Pct;

    if (spo2 && spo2 < 90) {
      redFlags.push({
        category: 'RESPIRATORY_FAILURE',
        description: `Severe hypoxemia detected (SpO2 ${spo2}% < 90%).`,
        mandatoryDirective: 'Immediate supplemental oxygen therapy and emergency pulmonary evaluation.',
        statutoryHotline: '911 / Rapid Response'
      });
    }

    if (sbp && sbp <= 100 && rr && rr >= 22) {
      redFlags.push({
        category: 'SEPSIS_QSOFA',
        description: 'qSOFA sepsis criteria met (Hypotension SBP <= 100 mmHg + Tachypnea RR >= 22 bpm).',
        mandatoryDirective: 'STAT sepsis bundle: blood cultures, serum lactate, broad-spectrum IV antimicrobials, and IV crystalloid resuscitation.',
        statutoryHotline: '911 / Inpatient Sepsis Alert'
      });
    }

    // Determine Final Acuity Tier
    let acuityLevel: TriageAcuityLevel = 'ROUTINE';
    let isDeterministicOverride = false;
    let fhirTriageCode = 'routine';

    if (redFlags.length > 0) {
      acuityLevel = 'STAT_EMERGENCY';
      isDeterministicOverride = true;
      fhirTriageCode = 'emergency';
    } else if (hasDyspnea || (vitals.heartRate && (vitals.heartRate > 115 || vitals.heartRate < 45))) {
      acuityLevel = 'URGENT';
      fhirTriageCode = 'urgent';
    }

    // Perform ISMP Decimal Safety Check on any provided order text
    const sanitizedOrder = input.textNarrative ? this.sanitizeIsmpDecimals(input.textNarrative) : undefined;
    const ismpCompliant = sanitizedOrder === input.textNarrative;

    const result: ITriageEvaluationResult = {
      acuityLevel,
      isDeterministicOverride,
      detectedRedFlags: redFlags,
      clinicalDirectives: redFlags.map(rf => rf.mandatoryDirective),
      sanitizedOrderText: sanitizedOrder,
      ismpCompliant,
      fhirTriageCode
    };

    this.lastEvaluation.set(result);
    return result;
  }

  /**
   * ISMP High-Risk Decimal Sanitizer
   * Eliminates trailing zeros (5.0 mg -> 5 mg) and adds leading zeros (.5 mg -> 0.5 mg).
   */
  sanitizeIsmpDecimals(text: string): string {
    let sanitized = text.replace(/(\b\d+)\.0+(?=\s*(?:mg|mcg|g|kg|mL|L|units|mEq|mmol|mmHg|bpm|%|cm|mm)\b)/gi, '$1');
    sanitized = sanitized.replace(/(?<=\s|^|\()\.(\d+)(?=\s*(?:mg|mcg|g|kg|mL|L|units|mEq|mmol|mmHg|bpm|%|cm|mm)\b)/gi, '0.$1');
    return sanitized;
  }
}
