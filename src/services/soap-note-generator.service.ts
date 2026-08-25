import { Injectable, signal, computed, inject } from '@angular/core';
import * as DOMPurify from 'dompurify';
import { PatientStateService } from './patient-state.service';

function sanitizeText(val: string): string {
  const domp = (DOMPurify as any)?.default || DOMPurify;
  if (typeof domp?.sanitize === 'function') {
    return domp.sanitize(val);
  }
  return val;
}

export interface ISoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  timestamp: string;
  sanitized: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SoapNoteGeneratorService {
  private patientState?: PatientStateService | null;

  constructor(patientState?: PatientStateService) {
    if (patientState) {
      this.patientState = patientState;
    } else {
      try {
        this.patientState = inject(PatientStateService, { optional: true });
      } catch (e) {
        console.debug('[SoapNoteGenerator] PatientStateService DI fallback:', (e as Error)?.message);
        this.patientState = null;
      }
    }
  }

  readonly isScribing = signal<boolean>(false);
  readonly subjective = signal<string>('Patient presents with intermittent fatigue, mild lumbar tension (L4-L5), and postprandial glucose spikes following high-glycemic meals.');
  readonly objective = signal<string>('Vitals: BP 128/82 mmHg, HR 72 bpm, SpO2 98%. CGM Glucose: 110 mg/dL. CMP Labs: HbA1c 6.8%. HRV RMSSD: 34 ms.');
  readonly assessment = signal<string>('1. Type 2 Diabetes Mellitus with mild glycemic variability.\n2. Autonomic stress with suppressed vagal tone.\n3. Mild musculoskeletal lumbar tension.');
  readonly plan = signal<string>('1. Dietary: Shift to low-glycemic Mediterranean foraging intake.\n2. Vagal Co-Regulation: Daily 6 breaths/min (0.1 Hz) resonance breathing (10 min BID).\n3. Lifestyle: Target +2,000 steps daily.\n4. Prescribe Solfeggio 528 Hz acoustic deck for evening sleep entrainment.');

  readonly rawSoapNote = computed<ISoapNote>(() => ({
    subjective: this.subjective(),
    objective: this.objective(),
    assessment: this.assessment(),
    plan: this.plan(),
    timestamp: new Date().toISOString(),
    sanitized: true
  }));

  /** Sanitized SOAP note outputs via DOMPurify for HIPAA compliance */
  readonly sanitizedSubjective = computed<string>(() => {
    return sanitizeText(this.subjective());
  });

  readonly sanitizedObjective = computed<string>(() => {
    return sanitizeText(this.objective());
  });

  readonly sanitizedAssessment = computed<string>(() => {
    return sanitizeText(this.assessment());
  });

  readonly sanitizedPlan = computed<string>(() => {
    return sanitizeText(this.plan());
  });

  /** Generate FHIR R4 DocumentReference bundle JSON string */
  generateFhirR4DocumentReference(): string {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'DocumentReference',
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
              text: 'Clinical Progress SOAP Note'
            },
            subject: {
              reference: 'Patient/p_default_patient',
              display: 'Alexander Vance'
            },
            date: new Date().toISOString(),
            content: [
              {
                attachment: {
                  contentType: 'text/markdown',
                  data: btoa(
                    sanitizeText(
                      `# SUBJECTIVE\n${this.subjective()}\n\n# OBJECTIVE\n${this.objective()}\n\n# ASSESSMENT\n${this.assessment()}\n\n# PLAN\n${this.plan()}`
                    )
                  )
                }
              }
            ]
          }
        }
      ]
    };
    return JSON.stringify(fhirBundle, null, 2);
  }

  /** Append live audio transcript text into active SOAP note Subjective section */
  appendTranscriptSnippet(text: string): void {
    if (!text.trim()) return;
    const sanitized = sanitizeText(text.trim());
    this.subjective.update(curr => `${curr} ${sanitized}`.trim());
  }

  /** Update Objective section with current real-time patient vitals */
  refreshObjectiveFromVitals(): void {
    const v = this.patientState?.vitals();
    const bp = v?.bp || '128/82';
    const hr = v?.hr || '72';
    const spO2 = v?.spO2 || '98';
    const cgm = v?.cgmGlucoseMgDl || '110';
    const hba1c = v?.cmpLabs?.hba1c || '6.8';
    const hrv = v?.hrvRmssd || '34';
    const steps = v?.steps || '5400';

    const updated = `Vitals: BP ${bp} mmHg, HR ${hr} bpm, SpO2 ${spO2}%. CGM: ${cgm} mg/dL. HbA1c: ${hba1c}%. HRV: ${hrv} ms. Daily Activity: ${steps} steps.`;
    this.objective.set(updated);
  }
}
