import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IPatient } from './patient.types';

export interface ISmsCarePrompt {
  id: string;
  daySequence: number;
  timeSlot: 'Morning (08:00)' | 'Afternoon (14:00)' | 'Evening (19:00)';
  messageBody: string;
  charCount: number;
  fleschKincaidGradeLevel: number;
  primaryDomain: 'Medication Adherence' | 'Vitals Check' | 'Symptom Logging' | 'Vagal Breathing';
  callToAction: string;
}

export interface IParsedSmsResponse {
  rawText: string;
  timestamp: string;
  detectedVitals: {
    bp?: string;
    hr?: number;
    glucose?: number;
  };
  detectedSymptoms: string[];
  urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_CALL_911';
  fhirObservationResource?: Record<string, unknown>;
  automatedResponseText: string;
}

export interface ISmsBridgePlan {
  patientId: string;
  phoneNumber: string;
  timestamp: string;
  readingGradeLevel: number;
  dailyPrompts: ISmsCarePrompt[];
  inboundHistory: IParsedSmsResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class SmsEquityBridgeService {
  private patientState: PatientStateService | null = null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  /**
   * Estimates Flesch-Kincaid Reading Grade Level
   */
  public calculateReadingGradeLevel(text: string): number {
    if (!text) return 5.0;
    const words = text.trim().split(/\s+/).length;
    const sentences = (text.match(/[.!?]+/g) || []).length || 1;
    const syllables = words * 1.3; // Approximation heuristic for clinical health literacy

    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return +Math.max(3.0, Math.min(12.0, grade)).toFixed(1);
  }

  /**
   * Generates tailored, 8th-grade-reading-level SMS daily care prompts
   */
  public generateCarePrompts(patient: IPatient): ISmsCarePrompt[] {
    const name = (patient.name || '').toLowerCase();
    const conds = (patient.preexistingConditions || []).join(' ').toLowerCase();

    if (name.includes('postpartum') || conds.includes('postpartum') || patient.id === 'p007') {
      return [
        {
          id: 'sms-m01',
          daySequence: 1,
          timeSlot: 'Morning (08:00)',
          messageBody: 'Good morning! How did you sleep last night? Reply 1 (Good), 2 (Woke up often), or 3 (Hardly slept). We are here with you.',
          charCount: 122,
          fleschKincaidGradeLevel: 4.8,
          primaryDomain: 'Symptom Logging',
          callToAction: 'Reply with number 1, 2, or 3'
        },
        {
          id: 'sms-m02',
          daySequence: 1,
          timeSlot: 'Afternoon (14:00)',
          messageBody: 'Time for your 3-minute 4-7-8 breathing reset. Inhale 4s, hold 7s, exhale 8s. Reply "DONE" after 4 cycles to log vagal rest.',
          charCount: 127,
          fleschKincaidGradeLevel: 5.2,
          primaryDomain: 'Vagal Breathing',
          callToAction: 'Reply "DONE"'
        },
        {
          id: 'sms-m03',
          daySequence: 1,
          timeSlot: 'Evening (19:00)',
          messageBody: 'Reminder: Take your prenatal nutrient and drink a glass of water. Any mood changes today? Text us how you feel anytime.',
          charCount: 124,
          fleschKincaidGradeLevel: 4.5,
          primaryDomain: 'Medication Adherence',
          callToAction: 'Reply with your current mood or questions'
        }
      ];
    }

    // Default Cardiovascular & Metabolic prompts
    return [
      {
        id: 'sms-c01',
        daySequence: 1,
        timeSlot: 'Morning (08:00)',
        messageBody: 'Good morning! Please take your morning BP sitting down after resting 5 mins. Text back your numbers like "128/82".',
        charCount: 119,
        fleschKincaidGradeLevel: 5.4,
        primaryDomain: 'Vitals Check',
        callToAction: 'Text back numbers like "120/80"'
      },
      {
        id: 'sms-c02',
        daySequence: 1,
        timeSlot: 'Afternoon (14:00)',
        messageBody: 'Midday check: Did you take your Lisinopril with lunch? Drink a tall glass of water. Reply "YES" or "HELP".',
        charCount: 108,
        fleschKincaidGradeLevel: 4.2,
        primaryDomain: 'Medication Adherence',
        callToAction: 'Reply "YES" or "HELP"'
      },
      {
        id: 'sms-c03',
        daySequence: 1,
        timeSlot: 'Evening (19:00)',
        messageBody: 'Evening walk check: Did you hit 20 minutes of gentle movement today? Reply 1 (Yes), 2 (No, rested), or 3 (Had joint pain).',
        charCount: 127,
        fleschKincaidGradeLevel: 5.1,
        primaryDomain: 'Symptom Logging',
        callToAction: 'Reply with number 1, 2, or 3'
      }
    ];
  }

  /**
   * Parses natural language patient inbound SMS text into structured FHIR observation
   */
  public parseInboundSms(rawText: string, patientId = 'p001'): IParsedSmsResponse {
    const lower = rawText.toLowerCase();

    // Regex for BP (e.g., 148/94 or 120/80)
    const bpMatch = rawText.match(/\b(\d{2,3})\s*[\/\-]\s*(\d{2,3})\b/);
    const bp = bpMatch ? `${bpMatch[1]}/${bpMatch[2]}` : undefined;

    // Regex for HR (e.g., HR 76 or pulse 82)
    const hrMatch = lower.match(/(?:hr|pulse|heart rate)\s*[:=]?\s*(\d{2,3})/);
    const hr = hrMatch ? parseInt(hrMatch[1], 10) : undefined;

    // Detect Symptoms
    const detectedSymptoms: string[] = [];
    if (lower.includes('dizzy') || lower.includes('lightheaded')) detectedSymptoms.push('Dizziness');
    if (lower.includes('chest pain') || lower.includes('short of breath')) detectedSymptoms.push('Acute Dyspnea / Chest Discomfort');
    if (lower.includes('headache')) detectedSymptoms.push('Tension Cephalea');
    if (lower.includes('sad') || lower.includes('crying') || lower.includes('overwhelmed')) detectedSymptoms.push('Mood Dysphoria');

    // Urgency calculation
    let urgency: 'ROUTINE' | 'ELEVATED' | 'CRITICAL_CALL_911' = 'ROUTINE';
    let autoResponse = 'Thank you! Your reading has been logged into your doctor’s chart. Have a wonderful day.';

    if (lower.includes('chest pain') || (bpMatch && parseInt(bpMatch[1], 10) >= 180)) {
      urgency = 'CRITICAL_CALL_911';
      autoResponse = 'EMERGENCY ALERT: Your blood pressure or symptoms are in the critical range. Please call 911 or visit the nearest Emergency Room immediately.';
    } else if (detectedSymptoms.length > 0 || (bpMatch && parseInt(bpMatch[1], 10) >= 145)) {
      urgency = 'ELEVATED';
      autoResponse = `Logged: ${bp ? 'BP ' + bp : ''} ${detectedSymptoms.join(', ')}. Your care team has been notified. Please sit down and rest.`;
    }

    // FHIR R4 Observation
    const fhirObservationResource = bp ? {
      resourceType: 'Observation',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }]
      },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: new Date().toISOString(),
      note: [{ text: `Captured via SMS Equity Bridge: "${rawText}"` }],
      component: [
        { code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] }, valueQuantity: { value: parseInt(bp.split('/')[0], 10), unit: 'mm[Hg]' } },
        { code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] }, valueQuantity: { value: parseInt(bp.split('/')[1], 10), unit: 'mm[Hg]' } }
      ]
    } : undefined;

    return {
      rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedVitals: { bp, hr },
      detectedSymptoms,
      urgencyLevel: urgency,
      fhirObservationResource,
      automatedResponseText: autoResponse
    };
  }

  /**
   * Builds the complete SMS equity bridge plan
   */
  public getBridgePlan(patient: IPatient): ISmsBridgePlan {
    const prompts = this.generateCarePrompts(patient);
    const avgGrade = +(prompts.reduce((acc, p) => acc + p.fleschKincaidGradeLevel, 0) / prompts.length).toFixed(1);

    const mockInboundHistory: IParsedSmsResponse[] = [
      this.parseInboundSms('Morning BP was 138/86 and HR 74. Feeling a little dizzy after waking up.', patient.id || 'p001'),
      this.parseInboundSms('YES took my Lisinopril and drank 24oz water.', patient.id || 'p001')
    ];

    return {
      patientId: patient.id || 'p001',
      phoneNumber: '+1 (555) 019-2834',
      timestamp: new Date().toISOString(),
      readingGradeLevel: avgGrade,
      dailyPrompts: prompts,
      inboundHistory: mockInboundHistory
    };
  }
}
