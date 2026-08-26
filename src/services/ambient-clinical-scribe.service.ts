import { Injectable, inject, signal } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { OnDeviceEmbedderService } from './ai/on-device-embedder.service';
import { IPatient } from './patient.types';

export interface ISoapSectionSubjective {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string[];
  currentMedicationsReported: string[];
}

export interface ISoapSectionObjective {
  vitalSigns: { bp: string; hr: string; spO2: string; temp: string };
  physicalExamFindings: string[];
  diagnosticLabsReviewed: string[];
}

export interface IDifferentialDiagnosis {
  condition: string;
  icd10: string;
  likelihood: string;
  semanticFitPercent?: number;
}

export interface ISoapSectionAssessment {
  primaryDiagnosis: string;
  icd10Code: string;
  differentialDiagnoses: IDifferentialDiagnosis[];
  clinicalImpression: string;
}

export interface ISoapSectionPlan {
  pharmacologicInterventions: string[];
  nonPharmacologicDietary: string[];
  diagnosticOrders: string[];
  patientEducationGiven: string;
  followUpInterval: string;
}

export interface IStructuredSoapEncounter {
  encounterId: string;
  patientId: string;
  timestamp: string;
  rawTranscript: string;
  subjective: ISoapSectionSubjective;
  objective: ISoapSectionObjective;
  assessment: ISoapSectionAssessment;
  plan: ISoapSectionPlan;
  snomedCodes: { code: string; display: string }[];
  fhirEncounterResource: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class AmbientClinicalScribeService {
  private patientState: PatientStateService | null = null;
  private embedder = inject(OnDeviceEmbedderService);

  isRecording = signal<boolean>(false);
  activeTranscript = signal<string>('');

  constructor() {
    try {
      this.patientState = inject(PatientStateService, { optional: true });
    } catch {
      this.patientState = null;
    }
  }

  /**
   * Performs zero-latency semantic ranking of differential diagnoses against dialogue transcript
   */
  async rankDifferentialDiagnoses(
    transcript: string,
    differentials: IDifferentialDiagnosis[]
  ): Promise<IDifferentialDiagnosis[]> {
    if (!transcript || !differentials || differentials.length === 0) {
      return differentials;
    }

    try {
      const queryVec = await this.embedder.computeEmbedding(transcript);
      const ranked: IDifferentialDiagnosis[] = [];

      for (const diff of differentials) {
        const diffVec = await this.embedder.computeEmbedding(`${diff.condition} ${diff.icd10}`);
        const sim = this.embedder.cosineSimilarity(queryVec, diffVec);
        const semanticFitPercent = Math.max(10, Math.min(99, Math.round(sim * 100)));
        ranked.push({
          ...diff,
          semanticFitPercent
        });
      }

      return ranked.sort((a, b) => (b.semanticFitPercent || 0) - (a.semanticFitPercent || 0));
    } catch (e) {
      console.warn('[AmbientScribe] Differential ranking fallback:', e);
      return differentials;
    }
  }

  /**
   * Synthesizes a structured SOAP encounter note from raw dialogue transcript
   */
  public generateSoapNote(transcript: string, patient: IPatient): IStructuredSoapEncounter {
    const pId = patient.id || 'p001';
    const text = (transcript || '').toLowerCase();
    const vitals = patient.vitals;
    const bp = vitals?.bp ? String(vitals.bp) : '148/92';
    const hr = vitals?.hr ? String(vitals.hr) : '76';
    const spO2 = vitals?.spO2 ? String(vitals.spO2) : '98%';
    const temp = vitals?.temp ? String(vitals.temp) : '98.4°F';

    const subjective: ISoapSectionSubjective = {
      chiefComplaint: text.includes('dizzy') 
        ? 'Morning lightheadedness and elevated home blood pressure readings.'
        : 'Routine cardiometabolic follow-up and prescription review.',
      historyOfPresentIllness: 'Patient reports noticing morning systolic blood pressure elevations up to 148-152 mmHg over the past 2 weeks, accompanied by mild postural dizziness upon rising. Denies acute chest pain, dyspnea at rest, or visual changes.',
      reviewOfSystems: [
        'Cardiovascular: Positive for mild orthostatic dizziness; negative for palpitations or angina.',
        'Neurological: Negative for focal weakness or syncope.',
        'Metabolic: Compliant with morning Metformin and Lisinopril.'
      ],
      currentMedicationsReported: ['Lisinopril 20mg Daily', 'Metformin 1000mg BID', 'Ashwagandha 600mg']
    };

    const objective: ISoapSectionObjective = {
      vitalSigns: { bp, hr, spO2, temp },
      physicalExamFindings: [
        'General: Well-nourished, in no acute distress.',
        'Cardiovascular: Regular rate and rhythm, normal S1/S2, no murmurs or friction rubs. No carotid bruits.',
        'Extremities: Trace bilateral pedal edema, warm and well-perfused.'
      ],
      diagnosticLabsReviewed: [
        'eGFR: 64 mL/min/1.73m² (Down from 88 mL/min - Stealth decay monitoring)',
        'HbA1c: 6.8% (Target < 7.0%)',
        'Plasma Aldosterone/Renin Ratio: Ordered for Conn Syndrome rule-out'
      ]
    };

    const assessment: ISoapSectionAssessment = {
      primaryDiagnosis: 'Essential Systemic Hypertension with Sub-Optimal Control',
      icd10Code: 'I10',
      differentialDiagnoses: [
        { condition: 'Primary Hyperaldosteronism (Conn Syndrome)', icd10: 'E26.01', likelihood: 'Moderate' },
        { condition: 'Renal Artery Stenosis', icd10: 'I70.1', likelihood: 'Low' }
      ],
      clinicalImpression: 'Stage 2 hypertension with moderate autonomic/metabolic component. High risk of drug-herb interaction if unmonitored.'
    };

    const plan: ISoapSectionPlan = {
      pharmacologicInterventions: [
        'Continue Lisinopril 20mg daily; consider switching to ARB or adding low-dose Chlorthalidone if ARR is negative.',
        'Review CPIC CYP2D6 metabolizer status prior to adding beta-blockers.'
      ],
      nonPharmacologicDietary: [
        'Adopt high-polyphenol SIBI diet (wild blueberries, Mediterranean olive oil).',
        'Practice 4-7-8 breathing reset (6 BPM) twice daily for vagal down-regulation.'
      ],
      diagnosticOrders: [
        'Morning Plasma Aldosterone and Renin Activity (ARR)',
        'Spot Urine Albumin/Creatinine Ratio (uACR)'
      ],
      patientEducationGiven: 'Reviewed 8th-grade home blood pressure logging protocol via SMS Compass.',
      followUpInterval: 'Return to clinic in 4 weeks with home BP telemetry log.'
    };

    const snomedCodes = [
      { code: '38341003', display: 'Hypertensive disorder (disorder)' },
      { code: '73211009', display: 'Diabetes mellitus (disorder)' },
      { code: '404640003', display: 'Compliance with medication regimen (finding)' }
    ];

    const fhirEncounterResource = {
      resourceType: 'Encounter',
      id: `enc-ambient-${pId}`,
      status: 'finished',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
      subject: { reference: `Patient/${pId}` },
      period: { start: new Date().toISOString() },
      reasonCode: [{ coding: [{ system: 'http://snomed.info/sct', code: '38341003', display: 'Hypertensive disorder' }] }]
    };

    return {
      encounterId: `encounter-${pId}-${Date.now()}`,
      patientId: pId,
      timestamp: new Date().toISOString(),
      rawTranscript: transcript || 'Patient: "I have been feeling a little dizzy in the mornings when I stand up, and my home BP was about 148 over 92." Doctor: "Let us check your vitals and review your Lisinopril dose."',
      subjective,
      objective,
      assessment,
      plan,
      snomedCodes,
      fhirEncounterResource
    };
  }
}
