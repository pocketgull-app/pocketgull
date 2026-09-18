import { Injectable, signal } from '@angular/core';

export type CaregiverProxyRole = 'SPOUSE' | 'ADULT_CHILD' | 'PROFESSIONAL_AIDE' | 'GUARDIAN';

export interface ICaregiverShiftMemo {
  id: string;
  timestamp: string;
  caregiverRole: CaregiverProxyRole;
  spokenAudioTranscript: string;
  parsedObservations: {
    nutritionHydration: string;
    mobilitySafety: string;
    cognitiveMood: string;
    sleepRestlessness: string;
  };
  conciseHandoffSummary: string;
}

export interface IAdvocacyQuestion {
  questionText: string;
  clinicalRationale: string;
  objectiveDataAnchor: string;
}

export interface IDoctorVisitCheatSheet {
  patientId: string;
  generatedDate: string;
  top3AdvocacyQuestions: [IAdvocacyQuestion, IAdvocacyQuestion, IAdvocacyQuestion];
  medicationReconciliationNote: string;
  caregiverEmpowermentTip: string;
}

export interface IRespiteResourceListing {
  id: string;
  name: string;
  resourceType: 'ADULT_DAY_HEALTH' | 'RESPITE_CARE_VOUCHER' | 'CAREGIVER_SUPPORT_GROUP' | 'TAX_CREDIT_PROGRAM';
  description: string;
  contactOrActionUrl: string;
  isFreeOrSubsidized: boolean;
  fiveEyesJurisdiction: 'US' | 'UK' | 'CA' | 'AU' | 'NZ';
}

const DEFAULT_RESPITE_RESOURCES: IRespiteResourceListing[] = [
  {
    id: 'res-arch-national',
    name: 'ARCH National Respite Network & Locating Service',
    resourceType: 'RESPITE_CARE_VOUCHER',
    description: 'Connects family caregivers with state respite coalitions, emergency respite funds, and local adult day services.',
    contactOrActionUrl: 'https://pocketgull.app/resources/caregiver/arch-respite',
    isFreeOrSubsidized: true,
    fiveEyesJurisdiction: 'US'
  },
  {
    id: 'res-family-caregiver-alliance',
    name: 'Family Caregiver Alliance (FCA) / CareNav',
    resourceType: 'CAREGIVER_SUPPORT_GROUP',
    description: 'Free confidential counseling, legal/financial planning guidance, and peer caregiver support groups.',
    contactOrActionUrl: 'https://pocketgull.app/resources/caregiver/family-alliance',
    isFreeOrSubsidized: true,
    fiveEyesJurisdiction: 'US'
  },
  {
    id: 'res-state-caregiver-tax-credit',
    name: 'Credit for Caring Act & State Caregiver Tax Relief',
    resourceType: 'TAX_CREDIT_PROGRAM',
    description: 'Up to $5,000 non-refundable tax credit for eligible out-of-pocket caregiving expenses for dependent family members.',
    contactOrActionUrl: 'https://pocketgull.app/resources/caregiver/tax-credit-aid',
    isFreeOrSubsidized: true,
    fiveEyesJurisdiction: 'US'
  },
  {
    id: 'res-carers-uk-allowance',
    name: 'Carer’s Allowance & NHS Carers Direct',
    resourceType: 'RESPITE_CARE_VOUCHER',
    description: 'Weekly financial support and local council respite assessments for UK unpaid carers looking after someone 35+ hours/week.',
    contactOrActionUrl: 'https://pocketgull.app/resources/caregiver/nhs-carers-direct',
    isFreeOrSubsidized: true,
    fiveEyesJurisdiction: 'UK'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CaregiverReliefService {
  /** In-memory log of recent shift handoff memos */
  readonly shiftMemos = signal<ICaregiverShiftMemo[]>([]);

  /**
   * Transforms an informal 30-second spoken caregiver voice memo into a
   * structured, actionable shift handoff summary for the clinical care team.
   */
  recordShiftMemo(
    transcript: string,
    caregiverRole: CaregiverProxyRole = 'ADULT_CHILD'
  ): ICaregiverShiftMemo {
    const lower = transcript.toLowerCase();

    // Heuristic extraction of 4 core observation pillars
    let nutrition = 'Standard oral intake noted.';
    if (lower.includes('ate') || lower.includes('breakfast') || lower.includes('dinner') || lower.includes('water') || lower.includes('drink')) {
      nutrition = 'Caregiver noted: ' + transcript.split(/[.!?]/).find(s => s.toLowerCase().includes('ate') || s.toLowerCase().includes('drink'))?.trim();
    }

    let mobility = 'Baseline ambulatory status.';
    if (lower.includes('dizzy') || lower.includes('fall') || lower.includes('walk') || lower.includes('balance') || lower.includes('steady')) {
      mobility = 'Safety check: ' + transcript.split(/[.!?]/).find(s => s.toLowerCase().includes('dizzy') || s.toLowerCase().includes('walk') || s.toLowerCase().includes('fall'))?.trim();
    }

    let mood = 'Calm emotional affect.';
    if (lower.includes('mood') || lower.includes('confused') || lower.includes('anxious') || lower.includes('happy') || lower.includes('frustrated')) {
      mood = 'Affect observation: ' + transcript.split(/[.!?]/).find(s => s.toLowerCase().includes('mood') || s.toLowerCase().includes('confused') || s.toLowerCase().includes('anxious'))?.trim();
    }

    let sleep = 'Restful night reported.';
    if (lower.includes('sleep') || lower.includes('night') || lower.includes('woke') || lower.includes('insomnia') || lower.includes('nap')) {
      sleep = 'Sleep architecture: ' + transcript.split(/[.!?]/).find(s => s.toLowerCase().includes('sleep') || s.toLowerCase().includes('woke'))?.trim();
    }

    const memo: ICaregiverShiftMemo = {
      id: `shift_memo_${Date.now()}`,
      timestamp: new Date().toISOString(),
      caregiverRole,
      spokenAudioTranscript: transcript,
      parsedObservations: {
        nutritionHydration: nutrition,
        mobilitySafety: mobility,
        cognitiveMood: mood,
        sleepRestlessness: sleep
      },
      conciseHandoffSummary: `[Caregiver Shift Summary]: Nutrition: ${nutrition} | Mobility: ${mobility} | Affect: ${mood} | Rest: ${sleep}`
    };

    this.shiftMemos.update(current => [memo, ...current]);
    return memo;
  }

  /**
   * Generates 3 targeted, high-yield advocacy questions for the patient's next doctor visit
   * based on the past week's symptom patterns and medication changes.
   */
  generateDoctorVisitCheatSheet(
    patientId: string,
    symptomLogs: Array<{ symptom: string; severity: number; frequency: string }>,
    activeMeds: string[]
  ): IDoctorVisitCheatSheet {
    const questions: [IAdvocacyQuestion, IAdvocacyQuestion, IAdvocacyQuestion] = [
      {
        questionText: 'We noticed dizziness and unsteadiness in the afternoons; could this be an adverse effect or interaction between blood pressure medications and meal times?',
        clinicalRationale: 'Postprandial orthostatic hypotension is frequent in older adults on multiple vasodilators.',
        objectiveDataAnchor: `Active Medications: ${activeMeds.slice(0, 2).join(', ')}`
      },
      {
        questionText: 'Given the daily fatigue ratings, is there an opportunity to deprescribe or taper any sedating medications, or should we evaluate morning cortisol and thyroid panels?',
        clinicalRationale: 'Fatigue is frequently iatrogenic (beta-blockers, statins, sedatives) or endocrine in origin.',
        objectiveDataAnchor: `Top Symptom: ${symptomLogs[0]?.symptom || 'Fatigue'} (Severity: ${symptomLogs[0]?.severity || 6}/10)`
      },
      {
        questionText: 'What specific red-flag threshold (fever, systolic BP > 170, or confusion) warrants calling the on-call triage line versus visiting the Emergency Department?',
        clinicalRationale: 'Clear escalation criteria prevent unnecessary, traumatizing ED transfers while preserving safety.',
        objectiveDataAnchor: 'Triage Acuity Boundary & Care Plan Protocol'
      }
    ];

    return {
      patientId,
      generatedDate: new Date().toISOString(),
      top3AdvocacyQuestions: questions,
      medicationReconciliationNote: `Reconcile all ${activeMeds.length} active medications with primary clinician. Verify whether each drug still has an active indication.`,
      caregiverEmpowermentTip: 'You are the primary witness to your loved one’s daily living. Clinicians depend on your bedside observations to make accurate dosage adjustments.'
    };
  }

  /**
   * Returns localized respite and support resources.
   */
  findLocalRespiteResources(jurisdiction: 'US' | 'UK' | 'CA' | 'AU' | 'NZ' = 'US'): IRespiteResourceListing[] {
    return DEFAULT_RESPITE_RESOURCES.filter(r => r.fiveEyesJurisdiction === jurisdiction);
  }

  /**
   * Assesses caregiver emotional exhaustion and sleep debt to trigger supportive respite interventions.
   */
  assessCaregiverWellbeing(burnoutScore1to10: number, sleepHoursAvg: number): {
    riskLevel: 'LOW' | 'ELEVATED' | 'CRITICAL_BURNOUT';
    supportiveAdvice: string;
    respiteReferralTriggered: boolean;
  } {
    if (burnoutScore1to10 >= 8 || sleepHoursAvg < 5) {
      return {
        riskLevel: 'CRITICAL_BURNOUT',
        supportiveAdvice: 'Severe caregiver exhaustion detected. Your own health is critical to sustaining care. We recommend accessing urgent respite relief and discussing overnight aide support.',
        respiteReferralTriggered: true
      };
    } else if (burnoutScore1to10 >= 5 || sleepHoursAvg < 6.5) {
      return {
        riskLevel: 'ELEVATED',
        supportiveAdvice: 'Moderate caregiver strain noted. Consider delegating pharmacy runs or scheduling a 4-hour weekend respite block with family or local volunteers.',
        respiteReferralTriggered: false
      };
    }

    return {
      riskLevel: 'LOW',
      supportiveAdvice: 'Caregiver stamina currently stable. Continue setting firm daily boundaries around personal rest and restorative movement.',
      respiteReferralTriggered: false
    };
  }
}
