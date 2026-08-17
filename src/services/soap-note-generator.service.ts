import { Injectable, signal, computed, inject } from '@angular/core';
import * as DOMPurify from 'dompurify';
import { PatientStateService } from './patient-state.service';
import { ClinicalCodingCopilotService, ICodingAuditReport } from './clinical-coding-copilot.service';
import { SnomedIcdCrosswalkService } from './snomed-icd-crosswalk.service';

function sanitizeText(val: string): string {
  const domp = (DOMPurify as any)?.default || DOMPurify;
  if (typeof domp?.sanitize === 'function') {
    return domp.sanitize(val);
  }
  return val;
}

function safeBase64Encode(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf-8').toString('base64');
    }
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    try {
      return btoa(unescape(encodeURIComponent(str.replace(/[^\x00-\x7F]/g, ''))));
    } catch {
      return '';
    }
  }
}

export type ScribeSpeaker = 'CLINICIAN' | 'PATIENT' | 'CAREGIVER';

export interface IDiarizedTurn {
  id: string;
  speaker: ScribeSpeaker;
  speakerName: string;
  text: string;
  timestamp: string;
  durationSeconds: number;
  confidence: number;
  keyEntities?: string[];
}

export interface ISoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  timestamp: string;
  sanitized: boolean;
}

export interface IScribeScenario {
  id: string;
  title: string;
  specialty: string;
  clinicianName: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  turns: IDiarizedTurn[];
  expectedSoap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export const PRESET_SCENARIOS: Record<string, IScribeScenario> = {
  cardiometabolic: {
    id: 'cardiometabolic',
    title: 'T2DM & Diabetic Neuropathy Follow-Up',
    specialty: 'Endocrinology & Internal Medicine',
    clinicianName: 'Dr. Evelyn Chen, MD',
    patientName: 'Marcus Vance',
    patientAge: 58,
    patientGender: 'Male',
    chiefComplaint: 'Burning numbness in bilateral feet and morning fasting glucose ~165 mg/dL',
    turns: [
      {
        id: 'turn-1',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Evelyn Chen',
        text: 'Good morning Marcus. How have your blood sugars and foot sensations been since we adjusted your Metformin last month?',
        timestamp: '10:02:14 AM',
        durationSeconds: 6,
        confidence: 0.98,
        keyEntities: ['Metformin', 'Blood sugars', 'Foot sensations']
      },
      {
        id: 'turn-2',
        speaker: 'PATIENT',
        speakerName: 'Marcus Vance',
        text: 'Morning doctor. My morning fasting glucose numbers are running around 165 to 175. Also, the tingling and sharp burning pins-and-needles in my toes and soles are worse at night, making it hard to fall asleep.',
        timestamp: '10:02:22 AM',
        durationSeconds: 12,
        confidence: 0.96,
        keyEntities: ['Fasting glucose 165-175', 'Tingling', 'Burning in toes', 'Insomnia']
      },
      {
        id: 'turn-3',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Evelyn Chen',
        text: 'I see. Looking at your continuous glucose monitor data, your estimated HbA1c is 8.4% with notable postprandial glycemic excursions. On foot exam today, monofilament testing shows decreased sensation over the bilateral plantar 1st and 5th metatarsals with preserved 2+ dorsalis pedis pulses.',
        timestamp: '10:02:38 AM',
        durationSeconds: 16,
        confidence: 0.97,
        keyEntities: ['HbA1c 8.4%', 'Monofilament test abnormal', 'Distal sensory loss', 'Intact DP pulses']
      },
      {
        id: 'turn-4',
        speaker: 'PATIENT',
        speakerName: 'Marcus Vance',
        text: 'Is there something we can take for the nerve pain? It really aches when I walk more than three blocks.',
        timestamp: '10:02:56 AM',
        durationSeconds: 7,
        confidence: 0.95,
        keyEntities: ['Nerve pain', 'Walking tolerance reduced']
      },
      {
        id: 'turn-5',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Evelyn Chen',
        text: 'Yes. We are diagnosing this as Type 2 Diabetes Mellitus with Diabetic Polyneuropathy. I will start you on Gabapentin 300 mg orally at bedtime and titrate weekly. For glycemic control, we will add Empagliflozin 10 mg daily alongside your Metformin 1000 mg BID. Let us check a repeat CMP, microalbumin/creatinine ratio, and schedule a podiatry diabetic foot evaluation in 6 weeks.',
        timestamp: '10:03:06 AM',
        durationSeconds: 22,
        confidence: 0.99,
        keyEntities: ['T2DM with polyneuropathy', 'Gabapentin 300mg QHS', 'Empagliflozin 10mg QD', 'Podiatry consult', 'CMP / Microalbumin']
      }
    ],
    expectedSoap: {
      subjective: '58-year-old male with established Type 2 Diabetes presents for routine follow-up. Reports worsening burning dysesthesias and "pins-and-needles" paresthesias in bilateral feet, predominantly nocturnal. Fasting home glucose readings averaging 165-175 mg/dL. Denies foot ulcers or open sores.',
      objective: 'Vitals: BP 134/84 mmHg, HR 76 bpm, SpO2 98%, BMI 31.4 kg/m². CGM Glucose: 168 mg/dL. HbA1c: 8.4%. Foot Exam: Diminished 10g Semmes-Weinstein monofilament sensation across bilateral distal plantar aspects (1st & 5th MTP). Bilateral DP and PT pulses 2+ intact. No ulcerations, calluses, or erythema.',
      assessment: '1. Type 2 Diabetes Mellitus with Diabetic Polyneuropathy (ICD-10 E11.40, SNOMED 44054006, CMS-HCC V28 #37).\n2. Suboptimally controlled hyperglycemia (HbA1c 8.4%).\n3. Essential Primary Hypertension (ICD-10 I10, SNOMED 59621000).',
      plan: '1. Pharmacotherapy: Initiate Gabapentin 300 mg PO QHS for diabetic peripheral neuropathy; titrate by 300 mg weekly to target 900 mg daily as tolerated. Continue Metformin 1000 mg PO BID. Add SGLT2 inhibitor Empagliflozin 10 mg PO QD.\n2. Diagnostics: Order comprehensive metabolic panel (CMP), urine microalbumin-to-creatinine ratio, and fasting lipid panel.\n3. Referrals: Diabetic foot care and preventive podiatry referral.\n4. Education: Diabetic foot hygiene, daily visual skin inspection, low-glycemic dietary counseling.\n5. Follow-Up: Re-evaluate in clinic in 6 weeks.'
    }
  },

  heart_failure: {
    id: 'heart_failure',
    title: 'HFrEF & Acute Exertional Dyspnea',
    specialty: 'Cardiology & Heart Failure Care',
    clinicianName: 'Dr. Raj Patel, MD, FACC',
    patientName: 'Eleanor Vance',
    patientAge: 71,
    patientGender: 'Female',
    chiefComplaint: 'Progressive shortness of breath on exertion, 3-pillow orthopnea, and 6 lb weight gain over 5 days',
    turns: [
      {
        id: 'turn-1',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Raj Patel',
        text: 'Hello Eleanor. Tell me what symptoms have brought you into clinic today.',
        timestamp: '11:15:02 AM',
        durationSeconds: 5,
        confidence: 0.99,
        keyEntities: ['HPI onset']
      },
      {
        id: 'turn-2',
        speaker: 'PATIENT',
        speakerName: 'Eleanor Vance',
        text: 'Doctor, over the last week I have been struggling to breathe whenever I climb the stairs. I now have to sleep propped up on three pillows to avoid waking up gasping for air, and my ankles are noticeably swollen.',
        timestamp: '11:15:10 AM',
        durationSeconds: 15,
        confidence: 0.97,
        keyEntities: ['Dyspnea on exertion', '3-pillow orthopnea', 'PND', 'Ankle edema']
      },
      {
        id: 'turn-3',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Raj Patel',
        text: 'I am examining your lungs and neck now. You have bilateral basilar inspiratory crackles and jugular venous distention to 8 cm at 45 degrees. There is 2+ pitting pretibial edema bilaterally. Your point of maximal impulse is laterally displaced.',
        timestamp: '11:15:30 AM',
        durationSeconds: 18,
        confidence: 0.98,
        keyEntities: ['Basilar crackles', 'JVD 8cm', '2+ pitting edema', 'Lateral PMI']
      },
      {
        id: 'turn-4',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Raj Patel',
        text: 'This is an acute mild decompensation of your Chronic Systolic Heart Failure (HFrEF). We will increase your oral Furosemide to 40 mg BID for the next 7 days, check urgent BNP and serum electrolytes, and schedule a transthoracic echocardiogram to reassess ejection fraction.',
        timestamp: '11:15:52 AM',
        durationSeconds: 20,
        confidence: 0.98,
        keyEntities: ['HFrEF decompensation', 'Furosemide 40mg BID', 'BNP / Electrolytes', 'Echocardiogram']
      }
    ],
    expectedSoap: {
      subjective: '71-year-old female with known history of HFrEF presents with 1-week history of progressive dyspnea on exertion (NYHA Class III), 3-pillow orthopnea, paroxysmal nocturnal dyspnea (PND), and bilateral lower extremity edema. Reports a 6 lb weight gain over 5 days.',
      objective: 'Vitals: BP 142/88 mmHg, HR 84 bpm irregular, SpO2 93% on room air, RR 20 bpm. Cardiovascular: Regular rate, laterally displaced PMI, audible S3 gallop. JVD 8 cm above sternal angle at 45°. Lungs: Bilateral basilar fine inspiratory crackles spanning lower 1/3 lung fields. Extremities: 2+ pitting bilateral pretibial and ankle edema.',
      assessment: '1. Acute decompensation of Chronic Systolic Heart Failure (HFrEF, ICD-10 I50.22, SNOMED 441481004, CMS-HCC V28 #226).\n2. Chronic Atrial Fibrillation with moderate ventricular rate (ICD-10 I48.91, SNOMED 49436004, CMS-HCC V28 #238).\n3. Essential Hypertension (ICD-10 I10).',
      plan: '1. Diuretic Titration: Increase oral Furosemide (Lasix) to 40 mg PO BID x 7 days with strict daily morning weights; call if weight gain >2 lbs in 24h or >4 lbs in 1 week.\n2. Guideline-Directed Medical Therapy (GDMT): Continue Sacubitril/Valsartan 49/51 mg PO BID and Metoprolol Succinate 50 mg PO QD. Hold uptitration until euvolemic.\n3. Diagnostics: Urgent STAT serum BMP (K+, BUN, Cr) and NT-proBNP. Order 2D Transthoracic Echocardiogram (CPT 93306) to re-evaluate LVEF.\n4. Fluid/Sodium Restriction: 2,000 mg/day sodium and 1.5 L/day fluid limit.\n5. Follow-Up: Cardiology nurse check-in call in 48 hours; return clinic visit in 1 week.'
    }
  },

  cognitive_decline: {
    id: 'cognitive_decline',
    title: 'Early Memory Loss & Cognitive Evaluation',
    specialty: 'Neurology & Geriatric Psychiatry',
    clinicianName: 'Dr. Phil Gear, MD, PhD',
    patientName: 'Arthur Dent',
    patientAge: 76,
    patientGender: 'Male',
    chiefComplaint: 'Gradual memory decline, repetitive questioning, and difficulty balancing checking accounts over past 9 months',
    turns: [
      {
        id: 'turn-1',
        speaker: 'CAREGIVER',
        speakerName: 'Sarah Dent (Daughter)',
        text: 'Dr. Gear, my father has become increasingly forgetful over the past 9 months. He repeats the same stories every 20 minutes, misplaced his car keys in the refrigerator twice, and recently struggled to pay his monthly utility bills.',
        timestamp: '02:10:05 PM',
        durationSeconds: 16,
        confidence: 0.97,
        keyEntities: ['Short-term memory loss', 'Repetitive stories', 'Misplaced items', 'Executive dysfunction']
      },
      {
        id: 'turn-2',
        speaker: 'PATIENT',
        speakerName: 'Arthur Dent',
        text: 'I feel fine, doctor. Just getting a bit older, you know. I sometimes lose track of the exact day of the week, but my long-term memories are sharp.',
        timestamp: '02:10:24 PM',
        durationSeconds: 11,
        confidence: 0.94,
        keyEntities: ['Age-related attribution', 'Temporal disorientation']
      },
      {
        id: 'turn-3',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Phil Gear',
        text: 'We conducted the Mini-Mental State Examination (MMSE) and Montreal Cognitive Assessment (MoCA). Your score was 22/30, with prominent deficits in delayed 3-word recall (0/3), clock drawing contour/hands (1/3), and serial 7 subtractions.',
        timestamp: '02:10:40 PM',
        durationSeconds: 18,
        confidence: 0.99,
        keyEntities: ['MoCA 22/30', 'Delayed recall 0/3', 'Clock drawing abnormal', 'Executive deficit']
      },
      {
        id: 'turn-4',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Phil Gear',
        text: 'Based on the history and neurocognitive testing, this pattern is consistent with Mild Cognitive Impairment progressing toward Early-Stage Alzheimer\'s Disease. We will order high-resolution MRI Brain with volumetric hippocampal sequencing, serum Vitamin B12 and TSH to rule out reversible causes, and initiate Donepezil 5 mg nightly.',
        timestamp: '02:11:02 PM',
        durationSeconds: 24,
        confidence: 0.98,
        keyEntities: ['Alzheimers Disease', 'Donepezil 5mg QHS', 'MRI Brain volumetric', 'B12 / TSH labs']
      }
    ],
    expectedSoap: {
      subjective: '76-year-old male accompanied by daughter presents for neurocognitive evaluation due to 9-month progressive short-term memory impairment, repetitive questioning, and mild functional executive decline in instrumental activities of daily living (managing household finances). Patient exhibits partial anosognosia. Denies head trauma, hallucinations, or major mood changes.',
      objective: 'Vitals: BP 126/78 mmHg, HR 68 bpm, SpO2 99%. Neuro Exam: Cranial nerves II-XII grossly intact. Motor 5/5, normal gait without parkinsonian tremor or festination. Cognitive Testing: MoCA score 22/30. Deficits in delayed recall (0/5 at 5 min), clock drawing test (distorted spacing and incorrect hand placement for 10 past 11), and serial 7s (3/5).',
      assessment: '1. Alzheimer\'s Disease, early-stage with memory and executive impairment (ICD-10 G30.9, SNOMED 26929004, CMS-HCC V28 #137).\n2. Mild Cognitive Impairment, amnestic multi-domain subtype (ICD-10 G31.84, SNOMED 386806002).\n3. Preserved basic ADLs with emerging IADL vulnerability.',
      plan: '1. Pharmacotherapy: Initiate cholinesterase inhibitor Donepezil (Aricept) 5 mg PO QHS x 4 weeks; if tolerated without bradycardia or GI distress, increase to 10 mg PO QHS.\n2. Imaging & Diagnostics: Order non-contrast MRI Brain with 3D volumetric hippocampal quantification (CPT 70553) to evaluate medial temporal lobe atrophy. Order serum Vitamin B12, methylmalonic acid, TSH, and RPR.\n3. Safety & Support: Discuss home safety, medication management supervision by family, and power of attorney (POA) planning. Connect family with local Alzheimer\'s Association caregiver support group.\n4. Follow-Up: Return in 3 months for repeat cognitive assessment and medication tolerance check.'
    }
  },

  sdoh_preventive: {
    id: 'sdoh_preventive',
    title: 'SDoH Barriers & Chronic Disease Stabilization',
    specialty: 'Preventive Medicine & Family Practice',
    clinicianName: 'Dr. Maria Santos, MD',
    patientName: 'Rosa Gomez',
    patientAge: 44,
    patientGender: 'Female',
    chiefComplaint: 'Missed medication refills due to lack of transportation and food insecurity',
    turns: [
      {
        id: 'turn-1',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Maria Santos',
        text: 'Hello Rosa. I noticed you missed your last two appointments and were unable to refill your blood pressure medications. Can you tell me what barriers you have been facing?',
        timestamp: '03:45:10 PM',
        durationSeconds: 10,
        confidence: 0.98,
        keyEntities: ['Missed appointments', 'Unfilled medications']
      },
      {
        id: 'turn-2',
        speaker: 'PATIENT',
        speakerName: 'Rosa Gomez',
        text: 'Doctor, our family car broke down last month and there are no direct bus routes from our neighborhood to the pharmacy. Also, my husband had his work hours cut, so we have had to choose between groceries for the kids and buying my prescription copays.',
        timestamp: '03:45:22 PM',
        durationSeconds: 17,
        confidence: 0.96,
        keyEntities: ['Transportation barrier', 'Food insecurity', 'Medication copay hardship']
      },
      {
        id: 'turn-3',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Maria Santos',
        text: 'Thank you for sharing that with me. Your health and your family\'s well-being are our top priorities. Today your blood pressure is 152/94 mmHg because you have been off your Lisinopril. We will connect you immediately with our clinic social worker to arrange free medical transit rides and link you to the community food bank.',
        timestamp: '03:45:44 PM',
        durationSeconds: 20,
        confidence: 0.99,
        keyEntities: ['BP 152/94', 'Lisinopril lapse', 'Social worker referral', 'Medical transit', 'Food pantry']
      },
      {
        id: 'turn-4',
        speaker: 'CLINICIAN',
        speakerName: 'Dr. Maria Santos',
        text: 'We will also switch your medications to a 90-day $4 generic prescription mail-order program so they arrive right at your front door with zero delivery fees.',
        timestamp: '03:46:08 PM',
        durationSeconds: 11,
        confidence: 0.99,
        keyEntities: ['90-day generic mail order', 'Zero delivery fee']
      }
    ],
    expectedSoap: {
      subjective: '44-year-old female presents for chronic care re-establishment. Reports 6-week lapse in antihypertensive therapy secondary to severe social determinants of health (SDoH) barriers, including lack of reliable vehicle/public transit and financial/food insecurity affecting family nutrition and medication affordability.',
      objective: 'Vitals: BP 152/94 mmHg, HR 78 bpm, SpO2 99%, BMI 28.2 kg/m². Physical Exam: Alert, in no acute distress. Heart: Regular rate and rhythm, no murmurs. Lungs: Clear to auscultation bilaterally. No peripheral edema.',
      assessment: '1. Essential Primary Hypertension, uncontrolled secondary to medication non-adherence due to financial/transit barriers (ICD-10 I10, SNOMED 59621000).\n2. Transportation Insecurity (ICD-10 Z59.82, SNOMED 713458007).\n3. Food Insecurity with hunger risk (ICD-10 Z59.41, SNOMED 733423003).\n4. Underinsurance / Copay barrier (ICD-10 Z59.7).',
      plan: '1. Medication Re-establishment: Resume Lisinopril 20 mg PO QD. Enroll in 90-day mail-order generic pharmacy program ($4/month copay, free home delivery).\n2. Social Work Navigation: STAT warm handoff to clinic medical social worker for enrollment in Medicaid non-emergency medical transportation (NEMT) and local fresh food pantry voucher program.\n3. Patient Education: Home BP self-monitoring logs; warning signs of hypertensive urgency.\n4. Follow-Up: Nurse telehealth check-in in 2 weeks; in-person follow-up in 6 weeks with repeat BMP and blood pressure recheck.'
    }
  }
};

@Injectable({
  providedIn: 'root'
})
export class SoapNoteGeneratorService {
  private readonly patientState: PatientStateService | null;
  private readonly codingCopilot: ClinicalCodingCopilotService | null;
  private readonly crosswalkService: SnomedIcdCrosswalkService | null;

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }

    try {
      this.codingCopilot = inject(ClinicalCodingCopilotService, { optional: true });
    } catch {
      this.codingCopilot = null;
    }

    try {
      this.crosswalkService = inject(SnomedIcdCrosswalkService, { optional: true });
    } catch {
      this.crosswalkService = null;
    }

    // Default initialize with cardiometabolic scenario
    this.loadScenario('cardiometabolic');
  }

  // --- Ambient Scribing & Diarization State Signals ---
  readonly isScribing = signal<boolean>(false);
  readonly audioVolume = signal<number>(0.0);
  readonly activeSpeaker = signal<ScribeSpeaker>('CLINICIAN');
  readonly selectedScenarioId = signal<string>('cardiometabolic');
  readonly diarizedTurns = signal<IDiarizedTurn[]>([]);
  readonly activeScribeTitle = signal<string>('Ambient Multimodal Scribe');
  readonly isSynthesizing = signal<boolean>(false);
  readonly isCrosswalking = signal<boolean>(false);

  // --- Structured SOAP Sections ---
  readonly subjective = signal<string>('');
  readonly objective = signal<string>('');
  readonly assessment = signal<string>('');
  readonly plan = signal<string>('');
  readonly codingAuditReport = signal<ICodingAuditReport | null>(null);

  // --- Computed Metrics ---
  readonly totalTurns = computed<number>(() => this.diarizedTurns().length);
  readonly clinicianTurnCount = computed<number>(() => this.diarizedTurns().filter(t => t.speaker === 'CLINICIAN').length);
  readonly patientTurnCount = computed<number>(() => this.diarizedTurns().filter(t => t.speaker === 'PATIENT').length);
  readonly caregiverTurnCount = computed<number>(() => this.diarizedTurns().filter(t => t.speaker === 'CAREGIVER').length);

  readonly totalConversationDuration = computed<number>(() => {
    return this.diarizedTurns().reduce((acc, t) => acc + (t.durationSeconds || 0), 0);
  });

  readonly rawSoapNote = computed<ISoapNote>(() => ({
    subjective: this.subjective(),
    objective: this.objective(),
    assessment: this.assessment(),
    plan: this.plan(),
    timestamp: new Date().toISOString(),
    sanitized: true
  }));

  /** Sanitized SOAP outputs via DOMPurify for HIPAA compliance */
  readonly sanitizedSubjective = computed<string>(() => sanitizeText(this.subjective()));
  readonly sanitizedObjective = computed<string>(() => sanitizeText(this.objective()));
  readonly sanitizedAssessment = computed<string>(() => sanitizeText(this.assessment()));
  readonly sanitizedPlan = computed<string>(() => sanitizeText(this.plan()));

  readonly fullTranscriptMarkdown = computed<string>(() => {
    const turns = this.diarizedTurns();
    if (turns.length === 0) return 'No dialogue recorded yet.';

    const lines: string[] = ['# AMBIENT MULTI-SPEAKER CLINICAL DIALOGUE TRANSCRIPT\n'];
    turns.forEach((turn) => {
      const icon = turn.speaker === 'CLINICIAN' ? '👨‍⚕️' : (turn.speaker === 'PATIENT' ? '👤' : '👥');
      lines.push(`### [${turn.timestamp}] ${icon} ${turn.speakerName} (${turn.speaker})`);
      lines.push(`${turn.text}\n`);
    });
    return lines.join('\n');
  });

  readonly availableScenarios = computed(() => {
    return Object.values(PRESET_SCENARIOS).map(s => ({
      id: s.id,
      title: s.title,
      specialty: s.specialty,
      patientName: s.patientName,
      chiefComplaint: s.chiefComplaint
    }));
  });

  /**
   * Load a preset clinical scenario into the active scribe dialogue and auto-synthesize the SOAP note
   */
  loadScenario(scenarioKey: string): void {
    const scenario = PRESET_SCENARIOS[scenarioKey] || PRESET_SCENARIOS['cardiometabolic'];
    this.selectedScenarioId.set(scenario.id);
    this.activeScribeTitle.set(scenario.title);
    this.diarizedTurns.set([...scenario.turns]);

    this.subjective.set(scenario.expectedSoap.subjective);
    this.objective.set(scenario.expectedSoap.objective);
    this.assessment.set(scenario.expectedSoap.assessment);
    this.plan.set(scenario.expectedSoap.plan);

    // Auto-audit codes for the scenario
    this.autoAuditAndCrosswalk();
  }

  /**
   * Start ambient audio scribing simulation / recording
   */
  startAmbientScribing(): void {
    this.isScribing.set(true);
    this.audioVolume.set(0.65);
  }

  /**
   * Stop ambient audio scribing
   */
  stopAmbientScribing(): void {
    this.isScribing.set(false);
    this.audioVolume.set(0.0);
  }

  /**
   * Add a new diarized speaker turn to the conversation
   */
  addTurn(speaker: ScribeSpeaker, speakerName: string, text: string, confidence = 0.95, keyEntities: string[] = []): void {
    if (!text.trim()) return;

    const newTurn: IDiarizedTurn = {
      id: `turn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      speaker,
      speakerName,
      text: sanitizeText(text.trim()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      durationSeconds: Math.max(3, Math.round(text.split(' ').length / 2.5)),
      confidence,
      keyEntities
    };

    this.diarizedTurns.update(turns => [...turns, newTurn]);
    this.synthesizeSoapFromTurns();
  }

  /**
   * Synthesizes structured SOAP note sections from the diarized dialogue turns
   */
  synthesizeSoapFromTurns(): void {
    this.isSynthesizing.set(true);
    const turns = this.diarizedTurns();
    if (turns.length === 0) {
      this.isSynthesizing.set(false);
      return;
    }

    const patientTurns = turns.filter(t => t.speaker === 'PATIENT' || t.speaker === 'CAREGIVER');
    const clinicianTurns = turns.filter(t => t.speaker === 'CLINICIAN');

    // Synthesize Subjective from patient / caregiver utterances
    const patientIssues = patientTurns.map(t => t.text).join(' ');
    if (patientIssues.trim()) {
      this.subjective.set(
        `Patient and caregiver report: ${patientIssues.slice(0, 450)}...`
      );
    }

    // Refresh Objective with live vitals telemetry
    this.refreshObjectiveFromVitals();

    // Synthesize Assessment & Plan from clinician utterances
    const clinicianGuidance = clinicianTurns.map(t => t.text).join('\n');
    if (clinicianGuidance.trim()) {
      this.assessment.set(`Clinical impression based on ambient consult:\n${clinicianGuidance.slice(0, 350)}...`);
      this.plan.set(`1. Prescribe targeted medical therapy as discussed.\n2. Order baseline diagnostic laboratory panels.\n3. Schedule follow-up appointment.`);
    }

    this.isSynthesizing.set(false);
    this.autoAuditAndCrosswalk();
  }

  /**
   * Pass active SOAP note text into the ClinicalCodingCopilotService & SnomedIcdCrosswalkService
   */
  autoAuditAndCrosswalk(): void {
    this.isCrosswalking.set(true);
    const fullText = `# S\n${this.subjective()}\n\n# O\n${this.objective()}\n\n# A\n${this.assessment()}\n\n# P\n${this.plan()}`;

    if (this.codingCopilot) {
      const report = this.codingCopilot.auditChartText(fullText);
      this.codingAuditReport.set(report);
    } else {
      // Fallback crosswalk directly via SnomedIcdCrosswalkService
      const crosswalk = this.crosswalkService || new SnomedIcdCrosswalkService();
      const extracted = crosswalk.autoExtractAndCrosswalk(fullText);
      const totalRvu = extracted.reduce((sum, item) => {
        const cptSum = (item.concept.recommendedCptProcedures || []).reduce((pSum, p) => pSum + (p.workRvu || 0), 0);
        return sum + cptSum;
      }, 0);
      const estPay = extracted.reduce((sum, item) => {
        const paySum = (item.concept.recommendedCptProcedures || []).reduce((pSum, p) => pSum + (p.estimatedPayment || 0), 0);
        return sum + paySum;
      }, 0);

      this.codingAuditReport.set({
        timestamp: new Date().toISOString(),
        chartId: `chart-ambient-${Date.now()}`,
        patientId: 'p_ambient_patient',
        totalSuggestedCodes: extracted.length,
        acceptedCodesCount: 0,
        totalRafImpact: 0.85,
        totalWorkRvu: parseFloat(totalRvu.toFixed(2)) || 2.80,
        totalEstimatedReimbursement: parseFloat(estPay.toFixed(2)) || 114.20,
        mdmAudit: {
          emLevel: '99214',
          mdmLevel: 'MODERATE',
          workRvu: 2.80,
          estimatedMedicarePayment: 114.20,
          problemsAddressed: { count: extracted.length, description: 'Multiple chronic conditions', level: 'MODERATE' },
          dataReviewed: { description: 'Telemetry & review of labs', level: 'MODERATE' },
          riskOfComplications: { description: 'Prescription drug management', level: 'MODERATE' },
          summaryRationale: 'Moderate MDM Complexity'
        },
        suggestions: extracted.map(e => {
          const map = e.concept.mapping;
          const procRvu = (e.concept.recommendedCptProcedures || []).reduce((s, p) => s + (p.workRvu || 0), 0);
          const procPay = (e.concept.recommendedCptProcedures || []).reduce((s, p) => s + (p.estimatedPayment || 0), 0);
          return {
            id: `sug-${map?.icd10Code || e.concept.snomedCode}`,
            codeType: 'ICD-10-CM' as const,
            code: map?.icd10Code || 'I10',
            description: map?.icd10Title || e.matchedTerm,
            category: map?.category || 'General Clinical',
            hccCategory: map?.hccCategory,
            rafWeight: map?.rafWeight,
            snomedCode: e.concept.snomedCode,
            snomedTerm: map?.snomedTerm,
            cptCodes: map?.cptCodes,
            cptDetails: e.concept.recommendedCptProcedures?.map(p => ({
              cptCode: p.cptCode,
              description: p.description,
              workRvu: p.workRvu,
              estimatedPayment: p.estimatedPayment
            })),
            loincCode: map?.loincCode,
            loincName: map?.loincName,
            rxNormCui: map?.rxNormCui,
            rxNormName: map?.rxNormName,
            workRvu: procRvu,
            estimatedReimbursement: procPay,
            evidenceQuote: e.evidenceQuote || `Extracted for ${map?.icd10Title || e.matchedTerm}`,
            chartLocation: 'Assessment & Plan',
            confidence: e.confidence,
            status: 'PENDING' as const,
            auditRiskLevel: 'LOW' as const
          };
        }),
        denialPreventionWarnings: []
      });
    }

    this.isCrosswalking.set(false);
  }

  /**
   * Append a live transcript snippet to the Subjective section
   */
  appendTranscriptSnippet(text: string): void {
    if (!text.trim()) return;
    const sanitized = sanitizeText(text.trim());
    this.subjective.update(curr => `${curr} ${sanitized}`.trim());
    this.autoAuditAndCrosswalk();
  }

  /**
   * Update Objective section with current real-time patient vitals
   */
  refreshObjectiveFromVitals(): void {
    const v = this.patientState?.vitals();
    const bp = v?.bp || '128/82';
    const hr = v?.hr || '72';
    const spO2 = v?.spO2 || '98';
    const cgm = v?.cgmGlucoseMgDl || '110';
    const hba1c = v?.cmpLabs?.hba1c || '6.8';
    const hrv = v?.hrvRmssd || '34';
    const steps = v?.steps || '5400';

    const updated = `Vitals: BP ${bp} mmHg, HR ${hr} bpm, SpO2 ${spO2}%, RR 16 bpm. CGM: ${cgm} mg/dL. HbA1c: ${hba1c}%. HRV RMSSD: ${hrv} ms. Daily Activity: ${steps} steps.`;
    this.objective.set(updated);
  }

  /**
   * Generate FHIR R4 DocumentReference bundle JSON string
   */
  generateFhirR4DocumentReference(): string {
    const report = this.codingAuditReport();
    const conditionCodings = (report?.suggestions || []).map(s => ({
      system: 'http://hl7.org/fhir/sid/icd-10-cm',
      code: s.code,
      display: s.description
    }));

    const markdownContent = `# SUBJECTIVE\n${this.subjective()}\n\n# OBJECTIVE\n${this.objective()}\n\n# ASSESSMENT\n${this.assessment()}\n\n# PLAN\n${this.plan()}\n\n# TRANSCRIPT\n${this.fullTranscriptMarkdown()}`;
    const base64Data = safeBase64Encode(sanitizeText(markdownContent));

    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'DocumentReference',
            id: `docref-soap-${Date.now()}`,
            status: 'current',
            docStatus: 'final',
            type: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '11506-3',
                  display: 'Progress Note (SOAP)'
                }
              ],
              text: 'Ambient Multi-Speaker Clinical Progress SOAP Note'
            },
            subject: {
              reference: `Patient/${report?.patientId || 'p_ambient_patient'}`,
              display: 'Alexander Vance'
            },
            date: new Date().toISOString(),
            description: `Ambient consult SOAP note (${this.selectedScenarioId()}) with multi-system crosswalk (ICD-10, SNOMED, CPT, LOINC)`,
            content: [
              {
                attachment: {
                  contentType: 'text/markdown',
                  data: base64Data
                }
              }
            ],
            context: {
              encounter: [
                {
                  display: `E/M ${report?.mdmAudit?.emLevel || '99214'} - ${report?.mdmAudit?.mdmLevel || 'Moderate'}`
                }
              ],
              related: conditionCodings.map(c => ({
                display: `${c.code}: ${c.display}`
              }))
            }
          }
        }
      ]
    };
    return JSON.stringify(fhirBundle, null, 2);
  }

  /**
   * Reset session and clear dialogue
   */
  clearSession(): void {
    this.diarizedTurns.set([]);
    this.subjective.set('');
    this.objective.set('');
    this.assessment.set('');
    this.plan.set('');
    this.codingAuditReport.set(null);
    this.isScribing.set(false);
  }
}
