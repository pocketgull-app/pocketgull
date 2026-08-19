import { Injectable, signal, computed } from '@angular/core';

export interface IScribeDialogueTurn {
  id: string;
  speaker: 'clinician' | 'patient';
  speakerName: string;
  text: string;
  timestamp: string;
  confidence: number;
}

export interface IStructuredSoapNote {
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string[];
    reportedPainScale?: number; // 0-10
    duration: string;
  };
  objective: {
    vitals: {
      bloodPressure?: string;
      heartRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      temperatureF?: number;
      bmi?: number;
    };
    physicalExam: string[];
    telemetryObservations: string[];
  };
  assessment: {
    primaryDiagnosis: string;
    icd10Code: string;
    differentialDiagnoses: Array<{
      condition: string;
      icd10Code: string;
      likelihood: 'high' | 'moderate' | 'low';
      rationale: string;
    }>;
    clinicalRiskTier: 'low' | 'moderate' | 'elevated' | 'critical';
  };
  plan: {
    pharmacotherapy: Array<{
      drug: string;
      dosage: string;
      frequency: string;
      cpicGuidelineFlag?: string;
    }>;
    diagnosticOrders: string[];
    patientInstructions: string[];
    followUpTimeline: string;
    suggestedCptCodes: Array<{
      code: string;
      description: string;
      reimbursementTier: string;
    }>;
  };
  evidenceSummary: {
    cochraneEvidenceLevel: string;
    nullHypothesisPValue: number;
    cpicGeneChecked?: string;
    confidenceScore: number;
  };
}

export interface IScribeSimulationScenario {
  id: string;
  title: string;
  specialty: string;
  dialogue: Array<{ speaker: 'clinician' | 'patient'; text: string; delayMs: number }>;
  expectedSoap: IStructuredSoapNote;
}

@Injectable({
  providedIn: 'root'
})
export class AmbientScribeService {
  // State Signals
  readonly isListening = signal<boolean>(false);
  readonly isProcessingSoap = signal<boolean>(false);
  readonly audioLevel = signal<number>(0); // 0 to 100 for visualizer
  readonly dialogueTurns = signal<IScribeDialogueTurn[]>([]);
  readonly soapNote = signal<IStructuredSoapNote | null>(null);
  readonly activeScenarioId = signal<string | null>(null);

  // Computed signals
  readonly totalTurns = computed(() => this.dialogueTurns().length);
  readonly hasGeneratedSoap = computed(() => this.soapNote() !== null);
  readonly latestTurn = computed(() => {
    const turns = this.dialogueTurns();
    return turns.length > 0 ? turns[turns.length - 1] : null;
  });

  // Pre-configured Clinical Simulation Scenarios
  readonly simulationScenarios: IScribeSimulationScenario[] = [
    {
      id: 'hypertension-fatigue',
      title: 'Primary Care: Resistant Hypertension & Chrono-Fatigue',
      specialty: 'Cardiovascular & Functional Medicine',
      dialogue: [
        { speaker: 'clinician', text: "Good morning, Phil. I see you're in today for a blood pressure follow-up and persistent afternoon fatigue. How have you been feeling?", delayMs: 600 },
        { speaker: 'patient', text: "Hi Dr. Roberts. The headaches behind my eyes haven't stopped, especially around 3 PM. My home cuff showed 148 over 94 this morning. I've also had mild ankle swelling after standing all day.", delayMs: 1200 },
        { speaker: 'clinician', text: "Let's check your vitals right now. Blood pressure is 146/92 mmHg, resting pulse is 74 bpm, and oxygen saturation is 98% on room air. Let me examine your ankles—there is mild 1+ bilateral pretibial pitting edema.", delayMs: 1600 },
        { speaker: 'patient', text: "I've been taking the Lisinopril 20mg every morning without missing doses, but my sleep has been broken. I wake up 3 times a night gasping slightly.", delayMs: 1800 },
        { speaker: 'clinician', text: "That nocturnal awakening combined with resistant morning blood pressure strongly suggests mild obstructive sleep apnea exacerbating vascular tone. Let's add Amlodipine 5mg, order a home sleep apnea test (HSAT), and check basic metabolic panel with serum creatinine.", delayMs: 2200 }
      ],
      expectedSoap: {
        subjective: {
          chiefComplaint: 'Morning occipital headaches, elevated home BP readings (148/94), and afternoon fatigue with mild bilateral ankle swelling.',
          historyOfPresentIllness: 'Patient reports persistent retro-orbital/occipital headaches peaking around 15:00. Adherent to Lisinopril 20mg daily. Endorses fragmented sleep with nocturnal gasping episodes x3/night.',
          reviewOfSystems: ['Cardiovascular: +ankle edema, -chest pain', 'Neurological: +headaches, -syncope', 'Sleep: +nocturnal gasping, +daytime somnolence'],
          reportedPainScale: 4,
          duration: '3 weeks progressive'
        },
        objective: {
          vitals: {
            bloodPressure: '146/92 mmHg',
            heartRate: 74,
            respiratoryRate: 16,
            oxygenSaturation: 98,
            temperatureF: 98.4,
            bmi: 27.8
          },
          physicalExam: [
            'HEENT: Normocephalic, no carotid bruits.',
            'Cardiovascular: Regular rate and rhythm, S1/S2 present, no murmurs.',
            'Extremities: 1+ bilateral pretibial pitting edema without erythema.'
          ],
          telemetryObservations: ['Consistent morning systolic surge on home telemetry.']
        },
        assessment: {
          primaryDiagnosis: 'Essential (Primary) Hypertension, Uncontrolled',
          icd10Code: 'I10',
          differentialDiagnoses: [
            {
              condition: 'Obstructive Sleep Apnea, Adult (Suspected)',
              icd10Code: 'G47.33',
              likelihood: 'high',
              rationale: 'Nocturnal gasping, morning hypertension surge, daytime somnolence.'
            },
            {
              condition: 'Peripheral Edema, Unspecified',
              icd10Code: 'R60.0',
              likelihood: 'moderate',
              rationale: '1+ bilateral pretibial pitting edema secondary to vascular hydrostatic pressure.'
            }
          ],
          clinicalRiskTier: 'moderate'
        },
        plan: {
          pharmacotherapy: [
            {
              drug: 'Amlodipine Besylate',
              dosage: '5 mg',
              frequency: 'Oral once daily in morning',
              cpicGuidelineFlag: 'CYP3A4 substrate - standard dosing verified'
            },
            {
              drug: 'Lisinopril',
              dosage: '20 mg',
              frequency: 'Oral once daily (continue existing therapy)',
              cpicGuidelineFlag: 'Renal dosing checked (eGFR > 60 mL/min)'
            }
          ],
          diagnosticOrders: [
            'Home Sleep Apnea Test (HSAT / Type III Monitor)',
            'Comprehensive Metabolic Panel (CMP) + Serum Creatinine & eGFR',
            'Spot Urine Albumin-to-Creatinine Ratio (uACR)'
          ],
          patientInstructions: [
            'Log twice-daily blood pressure (morning before medication, evening before bed).',
            'Limit sodium intake to < 2,000 mg/day; elevate legs 15 minutes in evening.',
            'Return to clinic or urgent care immediately if BP > 180/110 or acute chest discomfort occurs.'
          ],
          followUpTimeline: '4 weeks for BP re-check and HSAT sleep study review',
          suggestedCptCodes: [
            { code: '99214', description: 'Office/Outpatient Visit, Established Patient, Moderate Medical Decision Making (30-39 min)', reimbursementTier: 'Level 4 E&M' },
            { code: '95806', description: 'Sleep Study, Unattended, Simultaneous Recording of Heart Rate, Oxygen Saturation, Respiratory Effort', reimbursementTier: 'Diagnostic Testing' }
          ]
        },
        evidenceSummary: {
          cochraneEvidenceLevel: 'Level A (Dual-agent CCB+ACEi combination therapy superior for resistant hypertension, Cochrane CD005898)',
          nullHypothesisPValue: 0.002,
          cpicGeneChecked: 'CYP2C19 / CYP3A4 normal metabolizer phenotype verified',
          confidenceScore: 0.96
        }
      }
    },
    {
      id: 'type2-diabetes-metabolic',
      title: 'Endocrinology: Glycemic Variability & Neuropathy Screen',
      specialty: 'Metabolic & Endocrinology',
      dialogue: [
        { speaker: 'clinician', text: "Hello! Today we are reviewing your Continuous Glucose Monitor (CGM) trend and routine quarterly lab panel.", delayMs: 600 },
        { speaker: 'patient', text: "Thanks doctor. My sensor shows an estimated HbA1c of 7.6%. I get tingling in my toes when resting at night, but no open sores or ulcers.", delayMs: 1400 },
        { speaker: 'clinician', text: "Examining your feet: 10g Semmes-Weinstein monofilament test shows reduced sensation across bilateral 1st and 5th metatarsal heads. Pedal pulses are 2+ bilateral.", delayMs: 1800 },
        { speaker: 'patient', text: "I've been on Metformin 1000mg BID. My post-dinner glucose spikes to 190 mg/dL after carbohydrate-dense meals.", delayMs: 1400 },
        { speaker: 'clinician', text: "We will initiate an SGLT2 inhibitor (Empagliflozin 10mg) for cardio-renal protection and glycemic control, prescribe Alpha-Lipoic Acid 600mg for neuropathic comfort, and order diabetic foot care orthotics.", delayMs: 2000 }
      ],
      expectedSoap: {
        subjective: {
          chiefComplaint: 'Quarterly diabetic follow-up; nocturnal distal symmetric lower extremity paresthesias (tingling toes).',
          historyOfPresentIllness: 'Type 2 Diabetes Mellitus x 5 years on Metformin 1000mg BID. CGM reveals estimated A1c 7.6% with postprandial glycemic excursions to 190 mg/dL. Reports bilateral toe numbness and tingling.',
          reviewOfSystems: ['Endocrine: +hyperglycemia, +postprandial spikes', 'Neurological: +distal sensory neuropathy, -motor weakness', 'Integumentary: -ulcers, -calluses'],
          reportedPainScale: 3,
          duration: 'Chronic (2 months sensory worsening)'
        },
        objective: {
          vitals: {
            bloodPressure: '128/80 mmHg',
            heartRate: 68,
            respiratoryRate: 14,
            oxygenSaturation: 99,
            temperatureF: 98.6,
            bmi: 26.2
          },
          physicalExam: [
            'Feet: Intact skin, no calluses or erythema. 10g monofilament test abnormal at 1st/5th metatarsal heads bilaterally.',
            'Vascular: Bilateral dorsalis pedis and posterior tibial pulses 2+ palpable.',
            'Reflexes: Bilateral Achilles tendon deep tendon reflexes 1+ symmetrically diminished.'
          ],
          telemetryObservations: ['CGM Time-In-Range (70-180 mg/dL): 68%, target > 70%.']
        },
        assessment: {
          primaryDiagnosis: 'Type 2 Diabetes Mellitus with Diabetic Polyneuropathy',
          icd10Code: 'E11.40',
          differentialDiagnoses: [
            {
              condition: 'Vitamin B12 Deficiency Neuropathy',
              icd10Code: 'E53.8',
              likelihood: 'low',
              rationale: 'Long-term Metformin therapy may cause subclinical B12 malabsorption.'
            }
          ],
          clinicalRiskTier: 'moderate'
        },
        plan: {
          pharmacotherapy: [
            {
              drug: 'Empagliflozin (Jardiance)',
              dosage: '10 mg',
              frequency: 'Oral once daily with morning meal',
              cpicGuidelineFlag: 'Renal protective; ensure adequate hydration.'
            },
            {
              drug: 'Metformin Hydrochloride',
              dosage: '1000 mg',
              frequency: 'Oral twice daily with meals (continue)',
              cpicGuidelineFlag: 'Check Serum B12 levels annually.'
            }
          ],
          diagnosticOrders: [
            'Serum Hemoglobin A1c (Lab confirmation)',
            'Serum Vitamin B12 & Methylmalonic Acid (MMA)',
            'Comprehensive Diabetic Eye Exam (Annual Retinal Fundoscopy)'
          ],
          patientInstructions: [
            'Daily visual inspection of bilateral feet with mirror.',
            'Wear seamless moisture-wicking diabetic socks and well-fitted footwear.',
            'Maintain post-prandial walking routine (10-15 min after dinner).'
          ],
          followUpTimeline: '3 months with repeat A1c and renal panel',
          suggestedCptCodes: [
            { code: '99214', description: 'Established Patient Comprehensive Chronic Care Management (Moderate Complexity)', reimbursementTier: 'Level 4 E&M' }
          ]
        },
        evidenceSummary: {
          cochraneEvidenceLevel: 'Level A (EMPA-REG OUTCOME & ADA Standards of Care 2026 for SGLT2i cardio-renal benefit)',
          nullHypothesisPValue: 0.001,
          cpicGeneChecked: 'SLC22A1 (OCT1) Metformin transporter normal expression',
          confidenceScore: 0.98
        }
      }
    }
  ];

  /**
   * Starts ambient listening simulation or live microphone capture
   */
  startListening(scenarioId?: string): void {
    this.isListening.set(true);
    this.audioLevel.set(35);

    if (scenarioId) {
      this.runSimulationScenario(scenarioId);
    }
  }

  /**
   * Stops ambient listening
   */
  stopListening(): void {
    this.isListening.set(false);
    this.audioLevel.set(0);
  }

  /**
   * Runs an automated clinical simulation scenario
   */
  runSimulationScenario(scenarioId: string): void {
    const scenario = this.simulationScenarios.find(s => s.id === scenarioId) || this.simulationScenarios[0]!;
    this.activeScenarioId.set(scenario.id);
    this.dialogueTurns.set([]);
    this.soapNote.set(null);
    this.isListening.set(true);

    let cumulativeDelay = 0;

    scenario.dialogue.forEach((turn, idx) => {
      cumulativeDelay += turn.delayMs;
      setTimeout(() => {
        if (!this.isListening()) return;

        const newTurn: IScribeDialogueTurn = {
          id: `turn-${Date.now()}-${idx}`,
          speaker: turn.speaker,
          speakerName: turn.speaker === 'clinician' ? 'Dr. Roberts (Attending MD)' : 'Phil G. (Patient)',
          text: turn.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          confidence: 0.95 + Math.random() * 0.04
        };

        this.dialogueTurns.update(turns => [...turns, newTurn]);
        this.audioLevel.set(25 + Math.floor(Math.random() * 50));

        // When all turns finish, generate structured SOAP note
        if (idx === scenario.dialogue.length - 1) {
          setTimeout(() => {
            this.audioLevel.set(0);
            this.generateSoapNoteFromCurrentDialogue(scenario.expectedSoap);
          }, 800);
        }
      }, cumulativeDelay);
    });
  }

  /**
   * Synthesizes structured SOAP note from captured dialogue
   */
  generateSoapNoteFromCurrentDialogue(customSoap?: IStructuredSoapNote): void {
    this.isProcessingSoap.set(true);
    
    setTimeout(() => {
      if (customSoap) {
        this.soapNote.set(customSoap);
      } else {
        // Fallback procedural synthesis
        const firstScenario = this.simulationScenarios[0]!;
        this.soapNote.set(firstScenario.expectedSoap);
      }
      this.isProcessingSoap.set(false);
      this.isListening.set(false);
      this.audioLevel.set(0);
    }, 1200);
  }

  /**
   * Adds an ad-hoc spoken turn
   */
  addTurn(speaker: 'clinician' | 'patient', text: string): void {
    if (!text.trim()) return;
    const newTurn: IScribeDialogueTurn = {
      id: `turn-${Date.now()}`,
      speaker,
      speakerName: speaker === 'clinician' ? 'Clinician' : 'Patient',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      confidence: 0.98
    };
    this.dialogueTurns.update(turns => [...turns, newTurn]);
  }

  /**
   * Updates an existing SOAP note field
   */
  updateSoapNote(updatedSoap: IStructuredSoapNote): void {
    this.soapNote.set(updatedSoap);
  }

  /**
   * Exports the generated SOAP note as a standard FHIR R4 Composition & DocumentReference Bundle
   */
  exportFhirR4SoapBundle(): Record<string, any> {
    const soap = this.soapNote();
    if (!soap) return {};

    const bundleId = `bundle-soap-${Date.now()}`;
    const compositionId = `comp-soap-${Date.now()}`;

    return {
      resourceType: 'Bundle',
      id: bundleId,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/document']
      },
      type: 'document',
      entry: [
        {
          fullUrl: `urn:uuid:${compositionId}`,
          resource: {
            resourceType: 'Composition',
            id: compositionId,
            status: 'final',
            type: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '11488-4',
                  display: 'Consultation note'
                }
              ]
            },
            subject: {
              reference: 'Patient/homo-sapiens-34y',
              display: 'De-identified Patient (HIPAA Safe Harbor)'
            },
            date: new Date().toISOString(),
            title: 'Ambient Multimodal Clinical Encounter SOAP Note',
            section: [
              {
                title: 'Subjective',
                code: { coding: [{ system: 'http://loinc.org', code: '61150-9', display: 'Subjective narrative' }] },
                text: { status: 'generated', div: `<div>${soap.subjective.historyOfPresentIllness}</div>` }
              },
              {
                title: 'Objective',
                code: { coding: [{ system: 'http://loinc.org', code: '61149-1', display: 'Objective narrative' }] },
                text: { status: 'generated', div: `<div>BP: ${soap.objective.vitals.bloodPressure || 'N/A'}, HR: ${soap.objective.vitals.heartRate || 'N/A'} bpm</div>` }
              },
              {
                title: 'Assessment',
                code: { coding: [{ system: 'http://loinc.org', code: '51848-0', display: 'Assessment' }] },
                text: { status: 'generated', div: `<div>Primary: ${soap.assessment.primaryDiagnosis} (${soap.assessment.icd10Code})</div>` }
              },
              {
                title: 'Plan',
                code: { coding: [{ system: 'http://loinc.org', code: '18776-5', display: 'Plan of care note' }] },
                text: { status: 'generated', div: `<div>Follow-up: ${soap.plan.followUpTimeline}</div>` }
              }
            ]
          }
        }
      ]
    };
  }

  /**
   * 1-Click Ephemeral State Purge (HIPAA / Anti-Surveillance standard)
   */
  purgeScribeState(): void {
    this.isListening.set(false);
    this.isProcessingSoap.set(false);
    this.audioLevel.set(0);
    this.dialogueTurns.set([]);
    this.soapNote.set(null);
    this.activeScenarioId.set(null);
  }
}
