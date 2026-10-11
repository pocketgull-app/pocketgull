import { Injectable, inject, signal, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { IsmpSafetyGuardService, IIsmpSafetyAudit } from './ismp-safety-guard.service';
import { IClinicalNote } from './patient.types';

export type ScribeProvider = 'abridge' | 'nuance_dax' | 'suki' | 'other' | 'manual';

export interface IScribeDrugInteractionAlert {
  primaryDrug: string;
  interactingDrug: string;
  severity: 'CRITICAL_LETHAL' | 'HIGH_RISK_WARNING' | 'MODERATE_MONITORING';
  clinicalMechanism: string;
  fdaBlackBoxWarning?: boolean;
  recommendedAction: string;
}

export interface IScribeExtractedEntities {
  symptoms: string[];
  vitals: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    temperatureFahrenheit?: number;
    bloodGlucoseMgDl?: number;
  };
  medications: Array<{
    name: string;
    dosage?: string;
    route?: string;
    frequency?: string;
    action: 'STARTED' | 'DISCONTINUED' | 'CONTINUED' | 'MODIFIED';
  }>;
  chiefComplaint?: string;
}

export interface IScribeCdsPathwayRecommendation {
  pathwayId: string;
  pathwayName: string;
  actTier: 'ACT_I_METABOLIC' | 'ACT_II_GLYMPHATIC' | 'ACT_III_RESILIENCE' | 'ACUTE_CRITICAL' | 'SALUTOGENIC_PRE_Rx';
  rationale: string;
  actionDirectives: string[];
}

export interface IScribeCptReimbursementCode {
  cptCode: string;
  title: string;
  category: 'RPM' | 'RTM' | 'CCM';
  estimatedPaymentUsd: number;
  clinicalRationale: string;
  qualifyingConditions: string[];
}

export interface IScribeAdjudicationResult {
  adjudicationId: string;
  scribeSource: ScribeProvider;
  timestamp: string;
  rawTranscriptLength: number;
  ismpSafetyAudit: IIsmpSafetyAudit;
  drugInteractions: IScribeDrugInteractionAlert[];
  extractedEntities: IScribeExtractedEntities;
  recommendedPathways: IScribeCdsPathwayRecommendation[];
  cptReimbursement: IScribeCptReimbursementCode[];
  totalEstimatedAnnualReimbursementUsd: number;
  sbarSummary: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  integrityDigest: string; // SHA-256 for FDA 21 CFR Part 11
  appliedToPatientState: boolean;
}

export interface IScribeIngestRequest {
  scribeSource: ScribeProvider;
  rawTranscript: string;
  encounterContext?: {
    patientId?: string;
    encounterType?: 'outpatient' | 'inpatient' | 'emergency' | 'telehealth';
    clinicianRole?: string;
    chiefComplaint?: string;
  };
  autoCommitToPatientState?: boolean;
}

/**
 * Standard Known Lethal & High-Risk Drug-Drug Interaction Catalog
 * Grounded in FDA Black Box Warnings, Beers Criteria, and ISMP safety standards.
 */
interface IKnownDdiRule {
  drugA: RegExp;
  drugB: RegExp;
  nameA: string;
  nameB: string;
  severity: 'CRITICAL_LETHAL' | 'HIGH_RISK_WARNING' | 'MODERATE_MONITORING';
  clinicalMechanism: string;
  fdaBlackBoxWarning: boolean;
  recommendedAction: string;
}

const KNOWN_DDI_RULES: IKnownDdiRule[] = [
  {
    drugA: /\b(gabapentin|pregabalin|neurontin|lyrica)\b/i,
    drugB: /\b(clonazepam|lorazepam|diazepam|alprazolam|morphine|oxycodone|hydrocodone|fentanyl|methadone|tramadol)\b/i,
    nameA: 'Gabapentinoids (Gabapentin/Pregabalin)',
    nameB: 'Benzodiazepines / Opioids',
    severity: 'CRITICAL_LETHAL',
    clinicalMechanism: 'Synergistic CNS and respiratory depression; FDA Black Box Warning for severe respiratory arrest and fatality.',
    fdaBlackBoxWarning: true,
    recommendedAction: 'Avoid concurrent prescribing unless non-sedating alternatives fail; if mandatory, initiate at 50% standard dosage and co-prescribe naloxone nasal spray.'
  },
  {
    drugA: /\b(warfarin|coumadin|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|pradaxa)\b/i,
    drugB: /\b(ibuprofen|motrin|advil|naproxen|aleve|ketorolac|toradol|meloxicam|diclofenac|aspirin)\b/i,
    nameA: 'Anticoagulants / DOACs',
    nameB: 'NSAIDs / Systemic Anti-inflammatories',
    severity: 'HIGH_RISK_WARNING',
    clinicalMechanism: 'Inhibition of platelet aggregation combined with gastric mucosal erosion dramatically elevates major gastrointestinal hemorrhage risk (3-6x relative risk).',
    fdaBlackBoxWarning: false,
    recommendedAction: 'Substitute acetaminophen for mild pain; if anti-inflammatory therapy is critical, prescribe topical NSAID or add mandatory PPI gastroprotection.'
  },
  {
    drugA: /\b(lisinopril|enalapril|ramipril|losartan|valsartan)\b/i,
    drugB: /\b(spironolactone|eplerenone|triamterene|potassium chloride)\b/i,
    nameA: 'ACE Inhibitors / ARBs',
    nameB: 'Potassium-Sparing Diuretics / K+ Supplements',
    severity: 'HIGH_RISK_WARNING',
    clinicalMechanism: 'Dual aldosterone blockade and reduced renal potassium clearance triggering life-threatening severe hyperkalemia (>6.5 mEq/L) and ventricular arrhythmias.',
    fdaBlackBoxWarning: false,
    recommendedAction: 'Order serum potassium and creatinine within 7 days of initiation; educate patient on avoiding potassium-rich salt substitutes.'
  },
  {
    drugA: /\b(sertraline|fluoxetine|paroxetine|citalopram|escitalopram|duloxetine|venlafaxine)\b/i,
    drugB: /\b(tramadol|linezolid|selegiline|phenelzine|sumatriptan|rizatriptan|st\.? john's wort)\b/i,
    nameA: 'SSRIs / SNRIs',
    nameB: 'Serotonergic Analgesics / MAOIs / Triptans',
    severity: 'CRITICAL_LETHAL',
    clinicalMechanism: 'Massive synaptic 5-HT accumulation inducing Serotonin Syndrome: autonomic instability, neuromuscular hyperreflexia, clonus, and hyperthermia.',
    fdaBlackBoxWarning: true,
    recommendedAction: 'Immediate discontinuation of offending agent; screen for myoclonus, ocular tremor, and diaphoresis; do not co-prescribe without 14-day washout.'
  },
  {
    drugA: /\b(amiodarone|sotalol|dofetilide)\b/i,
    drugB: /\b(azithromycin|clarithromycin|levofloxacin|ciprofloxacin|haloperidol|quetiapine)\b/i,
    nameA: 'Antiarrhythmics (Class III)',
    nameB: 'QT-Prolonging Antibiotics / Antipsychotics',
    severity: 'CRITICAL_LETHAL',
    clinicalMechanism: 'Additive delayed potassium rectifier (IKr) blockade leading to QTc prolongation (>500 ms) and fatal Torsades de Pointes polymorphic VT.',
    fdaBlackBoxWarning: true,
    recommendedAction: 'Perform baseline 12-lead ECG; select alternative non-QT-prolonging antimicrobials (e.g. amoxicillin, doxycycline).'
  },
  {
    drugA: /\b(metformin|glucophage)\b/i,
    drugB: /\b(iodinated contrast|iohexol|iopamidol)\b/i,
    nameA: 'Metformin',
    nameB: 'Iodinated Radiographic Contrast Media',
    severity: 'HIGH_RISK_WARNING',
    clinicalMechanism: 'Contrast-induced acute kidney injury (CI-AKI) causing rapid metformin bioaccumulation and fatal lactic acidosis.',
    fdaBlackBoxWarning: true,
    recommendedAction: 'Withhold metformin at time of or prior to iodinated contrast imaging; resume after 48 hours only if eGFR remains stable.'
  },
  {
    drugA: /\b(simvastatin|atorvastatin|lovastatin)\b/i,
    drugB: /\b(clarithromycin|itraconazole|ketoconazole|protease inhibitors|gemfibrozil)\b/i,
    nameA: 'Statins (CYP3A4 Substrates)',
    nameB: 'Potent CYP3A4 Inhibitors / Fibrates',
    severity: 'HIGH_RISK_WARNING',
    clinicalMechanism: 'Marked elevation in statin area under curve (AUC) precipitating skeletal muscle toxicity, rhabdomyolysis, and acute myoglobinuric renal failure.',
    fdaBlackBoxWarning: false,
    recommendedAction: 'Temporarily pause statin during antimicrobial course or substitute rosuvastatin/pravastatin.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AmbientScribeAdapterService {
  private patientState = inject(PatientStateService, { optional: true });
  private ismpGuard = inject(IsmpSafetyGuardService);

  readonly adjudicationHistory = signal<IScribeAdjudicationResult[]>([]);

  readonly totalTranscriptsIngested = computed(() => this.adjudicationHistory().length);

  readonly activeAlertsCount = computed(() => {
    return this.adjudicationHistory().reduce((acc, a) => {
      return acc + a.drugInteractions.length + a.ismpSafetyAudit.violations.length;
    }, 0);
  });

  /**
   * Ingests and adjudicates a raw transcript from an external ambient scribe (Abridge, Nuance DAX, Suki).
   * Performs HIPAA Safe Harbor sanitization, ISMP safety verification, drug-drug interaction screening,
   * clinical entity extraction, CDS pathway mapping, and optional state commitment.
   */
  async adjudicateTranscript(request: IScribeIngestRequest): Promise<IScribeAdjudicationResult> {
    const raw = request.rawTranscript || '';
    const source = request.scribeSource || 'other';

    // 1. HIPAA Safe Harbor De-identification
    const deidentifiedText = this.sanitizeHipaaSafeHarbor(raw);

    // 2. ISMP Medication Safety Audit (trailing zeroes, naked decimals, LASA tall man)
    const ismpAudit = this.ismpGuard.auditPrescription(deidentifiedText);

    // 3. Drug-Drug Interaction (DDI) & FDA Black Box Screening
    const drugInteractions = this.screenDrugInteractions(deidentifiedText);

    // 4. Clinical Entity & SBAR Extraction
    const extractedEntities = this.extractClinicalEntities(deidentifiedText, request.encounterContext);

    // 5. CDS Pathway Recommendations (Three Acts)
    const recommendedPathways = this.mapCdsPathways(extractedEntities, drugInteractions);

    // 6. Synthesize Structured SBAR Clinical Summary
    const sbarSummary = this.synthesizeSbar(source, extractedEntities, drugInteractions, ismpAudit);

    // 7. CPT RPM / RTM Coding & Reimbursement Optimization
    const { codes: cptReimbursement, totalAnnualUsd: totalEstimatedAnnualReimbursementUsd } =
      this.evaluateCptReimbursement(extractedEntities, deidentifiedText);

    // 8. Generate FDA 21 CFR Part 11 SHA-256 Digital Provenance Hash
    const integrityPayload = `${source}::${Date.now()}::${deidentifiedText}::${JSON.stringify(drugInteractions)}::${JSON.stringify(extractedEntities)}::${JSON.stringify(cptReimbursement)}`;
    const integrityDigest = await this.computeIntegrityDigest(integrityPayload);

    // 9. Generate Adjudication ID
    const entropyBytes = new Uint8Array(4);
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(entropyBytes);
    }
    const entropy = Array.from(entropyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const adjudicationId = `adj_${source}_${Date.now()}_${entropy}`;

    // 10. Optional Automatic Commitment to Patient State
    let appliedToPatientState = false;
    if (request.autoCommitToPatientState && this.patientState) {
      this.commitToPatientState(adjudicationId, source, extractedEntities, drugInteractions, sbarSummary);
      appliedToPatientState = true;
    }

    const result: IScribeAdjudicationResult = {
      adjudicationId,
      scribeSource: source,
      timestamp: new Date().toISOString(),
      rawTranscriptLength: raw.length,
      ismpSafetyAudit: ismpAudit,
      drugInteractions,
      extractedEntities,
      recommendedPathways,
      cptReimbursement,
      totalEstimatedAnnualReimbursementUsd,
      sbarSummary,
      integrityDigest,
      appliedToPatientState
    };

    // Update history signal
    this.adjudicationHistory.update(history => [result, ...history]);

    return result;
  }

  /**
   * Strips HIPAA §164.514 Safe Harbor direct identifiers (SSNs, telephone numbers, MRNs, dates of birth).
   */
  sanitizeHipaaSafeHarbor(text: string): string {
    return text
      // SSNs: 000-00-0000
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED-SSN]')
      // US 10-digit Phone numbers: (123) 456-7890 or 123-456-7890
      .replace(/(?:\(\d{3}\)\s?|\b\d{3}[-.\s])\d{3}[-.\s]\d{4}\b/g, '[REDACTED-PHONE]')
      // Medical Record Numbers (MRN)
      .replace(/\b(?:MRN|mrn|Record\s*#?)\s*:?\s*[A-Z0-9-]{6,12}\b/gi, '[REDACTED-MRN]')
      // Dates of birth (DOB)
      .replace(/\b(?:DOB|Date\s*of\s*Birth)\s*:?\s*\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/gi, '[REDACTED-DOB]');
  }

  /**
   * Evaluates text for dangerous polypharmacy and drug-drug interactions.
   */
  screenDrugInteractions(text: string): IScribeDrugInteractionAlert[] {
    const alerts: IScribeDrugInteractionAlert[] = [];

    for (const rule of KNOWN_DDI_RULES) {
      const matchA = rule.drugA.test(text);
      const matchB = rule.drugB.test(text);

      if (matchA && matchB) {
        alerts.push({
          primaryDrug: rule.nameA,
          interactingDrug: rule.nameB,
          severity: rule.severity,
          clinicalMechanism: rule.clinicalMechanism,
          fdaBlackBoxWarning: rule.fdaBlackBoxWarning,
          recommendedAction: rule.recommendedAction
        });
      }
    }

    return alerts;
  }

  /**
   * Extracts clinical entities (symptoms, vitals, medications) using rule-based parsing.
   */
  extractClinicalEntities(text: string, context?: IScribeIngestRequest['encounterContext']): IScribeExtractedEntities {
    const symptoms: string[] = [];
    const symptomKeywords = [
      'chest pain', 'shortness of breath', 'dyspnea', 'burning pain', 'numbness',
      'fever', 'cough', 'dizziness', 'headache', 'fatigue', 'insomnia',
      'diarrhea', 'vomiting', 'nausea', 'edema', 'joint pain', 'back pain',
      'muscle spasm', 'palpitations', 'rash', 'wheezing', 'abdominal pain'
    ];

    for (const kw of symptomKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        symptoms.push(kw);
      }
    }

    // Vitals Extraction
    const vitals: IScribeExtractedEntities['vitals'] = {};

    // Blood Pressure: e.g. "138/84" or "BP is 120/80"
    const bpMatch = text.match(/\b(?:BP|blood pressure)?\s*(?:is|was|of)?\s*(\d{2,3})\s*\/\s*(\d{2,3})\b/i);
    if (bpMatch) {
      vitals.bloodPressureSystolic = parseInt(bpMatch[1], 10);
      vitals.bloodPressureDiastolic = parseInt(bpMatch[2], 10);
    }

    // Heart Rate: e.g. "heart rate 74" or "pulse is 82" or "HR: 76"
    const hrMatch = text.match(/\b(?:heart rate|pulse|HR)\s*(?:is|was|of|:)?\s*(\d{2,3})\b/i);
    if (hrMatch) {
      vitals.heartRate = parseInt(hrMatch[1], 10);
    }

    // Respiratory Rate: e.g. "respiratory rate 18" or "RR 20"
    const rrMatch = text.match(/\b(?:respiratory rate|RR|breaths per min)\s*(?:is|was|of|:)?\s*(\d{1,2})\b/i);
    if (rrMatch) {
      vitals.respiratoryRate = parseInt(rrMatch[1], 10);
    }

    // Oxygen Saturation: e.g. "O2 sat 98%" or "SpO2: 97%"
    const spo2Match = text.match(/\b(?:SpO2|O2\s*sat|saturation)\s*(?:is|was|of|:)?\s*(\d{2,3})%?\b/i);
    if (spo2Match) {
      vitals.oxygenSaturation = parseInt(spo2Match[1], 10);
    }

    // Temperature: e.g. "temp 98.6" or "temperature is 101.2"
    const tempMatch = text.match(/\b(?:temp|temperature)\s*(?:is|was|of|:)?\s*(\d{2,3}(?:\.\d)?)\b/i);
    if (tempMatch) {
      vitals.temperatureFahrenheit = parseFloat(tempMatch[1]);
    }

    // Blood Glucose: e.g. "blood sugar 154" or "glucose 160" or "glucose is 142 mg/dL"
    const glucoseMatch = text.match(/\b(?:blood\s*sugar|glucose|fingerstick|fsbg)\s*(?:is|was|of|:)?\s*(\d{2,3})\b/i);
    if (glucoseMatch) {
      vitals.bloodGlucoseMgDl = parseInt(glucoseMatch[1], 10);
    }

    // Medications Extraction
    const medications: IScribeExtractedEntities['medications'] = [];
    const medMatches = text.matchAll(/\b(?:start|prescribe|order|give|add|continue|increase|decrease|stop|discontinue)?\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|units))\b/gi);

    for (const match of medMatches) {
      const drugName = match[1].trim();
      const dosage = match[2].trim();
      const fullPhrase = match[0].toLowerCase();

      let action: 'STARTED' | 'DISCONTINUED' | 'CONTINUED' | 'MODIFIED' = 'STARTED';
      if (fullPhrase.includes('stop') || fullPhrase.includes('discontinue')) {
        action = 'DISCONTINUED';
      } else if (fullPhrase.includes('continue')) {
        action = 'CONTINUED';
      } else if (fullPhrase.includes('increase') || fullPhrase.includes('decrease') || fullPhrase.includes('change')) {
        action = 'MODIFIED';
      }

      medications.push({
        name: drugName,
        dosage,
        action
      });
    }

    return {
      symptoms,
      vitals,
      medications,
      chiefComplaint: context?.chiefComplaint || (symptoms.length > 0 ? symptoms[0] : 'General Clinical Consultation')
    };
  }

  /**
   * Maps extracted entities and DDI alerts to Pocket-Gull Three Acts and CDS pathways.
   */
  mapCdsPathways(
    entities: IScribeExtractedEntities,
    interactions: IScribeDrugInteractionAlert[]
  ): IScribeCdsPathwayRecommendation[] {
    const recommendations: IScribeCdsPathwayRecommendation[] = [];

    // Salutogenic Stepped-Care Intercept (Prior to Prescribing)
    // Triggered whenever medications are proposed or when acute pain, insomnia, or elevated blood pressure are identified
    const hasMedicationsProposed = entities.medications.length > 0;
    const hasPainOrInsomnia = entities.symptoms.some(s => ['burning pain', 'back pain', 'insomnia', 'fatigue', 'numbness', 'anxiety'].includes(s));
    const hasElevatedBp = !!(entities.vitals.bloodPressureSystolic && entities.vitals.bloodPressureSystolic >= 130);

    if (hasMedicationsProposed || hasPainOrInsomnia || hasElevatedBp) {
      const salutogenicDirectives: string[] = [];

      if (entities.symptoms.includes('burning pain') || entities.symptoms.includes('back pain') || entities.symptoms.includes('numbness')) {
        salutogenicDirectives.push('Biomechanical Decompression: Initiate McKenzie directional preference (repeated lumbar extensions) and seated sciatic nerve flossing to reduce radicular mechanical tension before gabapentinoids or opioids.');
      }
      if (entities.symptoms.includes('insomnia') || entities.symptoms.includes('fatigue')) {
        salutogenicDirectives.push('Sleep Architecture & Circadian Entrainment: Enforce first-line CBT-I stimulus control (bed for sleep only), morning outdoor daylight exposure (10,000+ lux), and evening 650nm scotopic light shift prior to hypnotic sedatives.');
      }
      if (hasElevatedBp) {
        salutogenicDirectives.push('Autonomic Nitric Oxide Scaffolding: Prescribe high-resistance Inspiratory Muscle Strength Training (IMST, 30 breaths/day) and dietary magnesium bicarbonate/potassium repletion (-9 to -12 mmHg systolic reduction target).');
      }
      salutogenicDirectives.push('Antonovsky Sense of Coherence (SOC): Demystify symptom pathophysiology with the patient, establish daily 0.10 Hz vagal resonant breathing (Philocardia), and preserve patient self-healing agency.');

      recommendations.push({
        pathwayId: 'SALUTOGENIC_PRE_RX_BASELINE',
        pathwayName: 'Salutogenic Stepped-Care Intercept (Evidence-Based Baseline Prior to Prescribing)',
        actTier: 'SALUTOGENIC_PRE_Rx',
        rationale: 'Clinical guidelines prioritize non-pharmacological, biomechanical, and autonomic interventions to restore endogenous regulation before escalating to prescription pharmacotherapy.',
        actionDirectives: salutogenicDirectives
      });
    }

    // Critical Lethal DDI Pathway
    if (interactions.some(i => i.severity === 'CRITICAL_LETHAL')) {
      recommendations.push({
        pathwayId: 'STAT_DDI_INTERVENTION',
        pathwayName: 'Emergency Polypharmacy & Lethal Drug-Drug Interaction Intercept',
        actTier: 'ACUTE_CRITICAL',
        rationale: 'Transcript contains concurrent prescription of high-mortality drug pairs with FDA Black Box warnings.',
        actionDirectives: [
          'Halt or hold newly ordered sedating / interacting medication pending clinician reconciliation.',
          'Issue alert in clinical portal with peer-reviewed alternatives.',
          'Document informed consent and co-prescribe rescue agents (e.g. Naloxone) if concurrent use is clinically unavoidable.'
        ]
      });
    }

    // Act I: Auxiliary Metabolic Bridge (Elevated BP, Metabolic, Pain)
    if (entities.vitals.bloodPressureSystolic && entities.vitals.bloodPressureSystolic >= 130) {
      recommendations.push({
        pathwayId: 'ACT_I_METABOLIC_HYPERTENSION',
        pathwayName: 'Act I: Auxiliary Metabolic Bridge & Cardiovascular Protection (Days 0–30)',
        actTier: 'ACT_I_METABOLIC',
        rationale: `Systolic BP of ${entities.vitals.bloodPressureSystolic} mmHg exceeds Stage 1 hypertension threshold.`,
        actionDirectives: [
          'Initiate home ambulatory blood pressure monitoring (ABPM) log.',
          'Assess renal function panel (eGFR, serum creatinine, BUN) and urine albumin-to-creatinine ratio (uACR).',
          'Align with standard generic retail benchmark pricing ($4-$10/month at retail partners).'
        ]
      });
    }

    // Act II: Sleep Architecture & Autonomic Pacing (Insomnia, Pain, Neuropathy)
    if (entities.symptoms.includes('insomnia') || entities.symptoms.includes('burning pain') || entities.symptoms.includes('numbness')) {
      recommendations.push({
        pathwayId: 'ACT_II_SLEEP_GLYMPHATIC_PACING',
        pathwayName: 'Act II: Sleep Architecture, Glymphatic Protection & Neuropathic Pacing (Weeks 2–12)',
        actTier: 'ACT_II_GLYMPHATIC',
        rationale: 'Patient exhibits symptoms of sleep disturbance or peripheral neuropathic radiculopathy.',
        actionDirectives: [
          'Enforce non-pharmacologic CBT-I (Cognitive Behavioral Therapy for Insomnia) sleep hygiene protocols.',
          'Titrate gabapentinoid cautiously to bedtime dosing to minimize daytime somnolence.',
          'Maintain autonomic pacing log (0.1 Hz resonant breathing exercises).'
        ]
      });
    }

    // Act III: Multi-Modal Stepped-Care Partnership (Long-term Resilience)
    recommendations.push({
      pathwayId: 'ACT_III_STEPPED_CARE_PARTNERSHIP',
      pathwayName: 'Act III: Multi-Modal Stepped-Care Partnership & Long-Term Resilience (Months 6+)',
      actTier: 'ACT_III_RESILIENCE',
      rationale: 'Standard longitudinal chronic care stewardship and lifestyle integration.',
      actionDirectives: [
        'Engage dyadic co-regulation and caregiver support portal.',
        'Periodic re-evaluation of medication necessity to deprescribe polypharmacy burden.'
      ]
    });

    return recommendations;
  }

  /**
   * Synthesizes an SBAR (Situation, Background, Assessment, Recommendation) note.
   */
  synthesizeSbar(
    source: ScribeProvider,
    entities: IScribeExtractedEntities,
    interactions: IScribeDrugInteractionAlert[],
    ismpAudit: IIsmpSafetyAudit
  ): IScribeAdjudicationResult['sbarSummary'] {
    const sourceLabel = source.toUpperCase().replace(/_/g, ' ');
    const vitalsStr = entities.vitals.bloodPressureSystolic
      ? `BP: ${entities.vitals.bloodPressureSystolic}/${entities.vitals.bloodPressureDiastolic || '--'} mmHg, HR: ${entities.vitals.heartRate || '--'} bpm`
      : 'Vitals: Not explicitly dictated';

    const medsStr = entities.medications.length > 0
      ? entities.medications.map(m => `${m.action} ${m.name} ${m.dosage || ''}`).join('; ')
      : 'None reported';

    const ddiAlertsStr = interactions.length > 0
      ? `⚠️ ${interactions.length} DRUG INTERACTION(S) DETECTED: ` + interactions.map(i => `[${i.severity}] ${i.primaryDrug} + ${i.interactingDrug}`).join(' | ')
      : 'No high-risk drug-drug interactions detected.';

    const ismpStatusStr = ismpAudit.hasViolations
      ? `⚠️ ISMP DOSING DEFECTS (${ismpAudit.violations.length}): ` + ismpAudit.violations.map(v => `${v.type}: "${v.original}" -> "${v.corrected}"`).join('; ')
      : '✓ ISMP posology clean (Zero trailing zeroes / naked decimals).';

    return {
      situation: `Ambient transcript ingested from ${sourceLabel}. Chief Complaint / Focus: ${entities.chiefComplaint}.`,
      background: `Symptoms noted: ${entities.symptoms.join(', ') || 'Routine encounter'}. Current recorded vitals: ${vitalsStr}. Medications in discussion: ${medsStr}.`,
      assessment: `${ddiAlertsStr}\n${ismpStatusStr}`,
      recommendation: `1. Prioritize Salutogenic Stepped-Care Interventions (CBT-I, biomechanical flossing, 0.10 Hz autonomic pacing) prior to initiating or escalating pharmacotherapy.\n2. Review medication safety alerts before e-prescribing.\n3. Verify suggested CDS care pathways.\n4. Clinical decision support staged for practitioner sign-off.`
    };
  }

  /**
   * Commits extracted entities and SBAR summary to the central PatientStateService.
   */
  private commitToPatientState(
    adjudicationId: string,
    source: ScribeProvider,
    entities: IScribeExtractedEntities,
    interactions: IScribeDrugInteractionAlert[],
    sbar: IScribeAdjudicationResult['sbarSummary']
  ): void {
    if (!this.patientState) return;

    // 1. Update Vitals if parsed
    if (entities.vitals.bloodPressureSystolic && entities.vitals.bloodPressureDiastolic) {
      this.patientState.updateVital('bp', `${entities.vitals.bloodPressureSystolic}/${entities.vitals.bloodPressureDiastolic}`);
    }
    if (entities.vitals.heartRate) {
      this.patientState.updateVital('hr', String(entities.vitals.heartRate));
    }
    if (entities.vitals.oxygenSaturation) {
      this.patientState.updateVital('spO2', `${entities.vitals.oxygenSaturation}%`);
    }
    if (entities.vitals.temperatureFahrenheit) {
      this.patientState.updateVital('temp', `${entities.vitals.temperatureFahrenheit}°F`);
    }

    // 2. Append Clinical Note
    const noteText = `[AMBIENT SCRIBE ADJUDICATION - ${source.toUpperCase()}]
ID: ${adjudicationId}
DATE: ${new Date().toLocaleString()}

S (Situation):
${sbar.situation}

B (Background):
${sbar.background}

A (Assessment & Safety Intercept):
${sbar.assessment}

R (Recommendation):
${sbar.recommendation}`;

    const clinicalNote: IClinicalNote = {
      id: adjudicationId,
      text: noteText,
      sourceLens: `Ambient Scribe (${source})`,
      date: new Date().toISOString()
    };

    this.patientState.addClinicalNote(clinicalNote);
  }

  /**
   * Evaluates qualifying CPT Remote Physiologic Monitoring (RPM) and Remote Therapeutic Monitoring (RTM)
   * reimbursement codes based on extracted clinical entities, vital signs, and encounter dialogue.
   */
  evaluateCptReimbursement(
    entities: IScribeExtractedEntities,
    text: string
  ): { codes: IScribeCptReimbursementCode[]; totalAnnualUsd: number } {
    const codes: IScribeCptReimbursementCode[] = [];
    const lower = text.toLowerCase();

    const hasHypertension = (entities.vitals.bloodPressureSystolic && entities.vitals.bloodPressureSystolic >= 130) ||
      lower.includes('hypertension') || lower.includes('blood pressure') || lower.includes('lisinopril');

    const hasGlucose = (entities.vitals.bloodGlucoseMgDl && entities.vitals.bloodGlucoseMgDl >= 140) ||
      lower.includes('diabetes') || lower.includes('glucose') || lower.includes('metformin');

    const hasRespiratoryOrPain = lower.includes('respiratory') || lower.includes('breathing') ||
      lower.includes('asthma') || lower.includes('copd') || lower.includes('back pain') || lower.includes('sciatica');

    if (hasHypertension || hasGlucose) {
      codes.push({
        cptCode: '99453',
        title: 'RPM Initial Device Setup & Patient Education',
        category: 'RPM',
        estimatedPaymentUsd: 19.65,
        clinicalRationale: 'Initial setup of cellular/Bluetooth physiologic monitoring hardware (blood pressure cuff or glucometer) and patient onboarding.',
        qualifyingConditions: hasHypertension ? ['Essential Hypertension (ICD-10 I10)'] : ['Type 2 Diabetes (ICD-10 E11.9)']
      });
      codes.push({
        cptCode: '99454',
        title: 'RPM Monthly Transmission (>= 16 Days of Daily Readings)',
        category: 'RPM',
        estimatedPaymentUsd: 62.44,
        clinicalRationale: 'Recurring monthly supply of device transmission for continuous physiologic monitoring (minimum 16 days of readings in 30 days).',
        qualifyingConditions: hasHypertension ? ['Essential Hypertension (ICD-10 I10)'] : ['Type 2 Diabetes (ICD-10 E11.9)']
      });
      codes.push({
        cptCode: '99457',
        title: 'RPM Clinical Staff Care Management (First 20 Min/Month)',
        category: 'RPM',
        estimatedPaymentUsd: 51.54,
        clinicalRationale: '20 minutes of clinical staff/physician review, trend interpretation, and interactive communication with the patient.',
        qualifyingConditions: hasHypertension ? ['Essential Hypertension (ICD-10 I10)'] : ['Type 2 Diabetes (ICD-10 E11.9)']
      });
    }

    if (hasRespiratoryOrPain) {
      codes.push({
        cptCode: '98975',
        title: 'RTM Initial Setup & Patient Education',
        category: 'RTM',
        estimatedPaymentUsd: 19.65,
        clinicalRationale: 'Remote Therapeutic Monitoring onboarding for digital musculoskeletal or respiratory adherence tracking.',
        qualifyingConditions: ['Lumbar Radiculopathy / Chronic Pain (ICD-10 M54.16)']
      });
      codes.push({
        cptCode: '98977',
        title: 'RTM Musculoskeletal Device Supply & Data Transmission',
        category: 'RTM',
        estimatedPaymentUsd: 55.72,
        clinicalRationale: 'Monthly transmission of therapeutic exercise adherence, pain scale logging, and neuromuscular recovery metrics.',
        qualifyingConditions: ['Musculoskeletal Rehabilitation / Spine Pain']
      });
    }

    // Default general RPM baseline if no specific match
    if (codes.length === 0) {
      codes.push({
        cptCode: '99453',
        title: 'RPM Initial Setup & Education',
        category: 'RPM',
        estimatedPaymentUsd: 19.65,
        clinicalRationale: 'Remote physiologic monitoring initiation for chronic care stabilization.',
        qualifyingConditions: ['Chronic Disease Management']
      });
      codes.push({
        cptCode: '99454',
        title: 'RPM Monthly Device Transmission',
        category: 'RPM',
        estimatedPaymentUsd: 62.44,
        clinicalRationale: 'Monthly recurring telemetry transmission.',
        qualifyingConditions: ['Chronic Disease Management']
      });
    }

    // Compute annualized revenue: 1x setup + 12x monthly recurring
    const setupTotal = codes.filter(c => c.cptCode === '99453' || c.cptCode === '98975').reduce((sum, c) => sum + c.estimatedPaymentUsd, 0);
    const recurringMonthly = codes.filter(c => c.cptCode !== '99453' && c.cptCode !== '98975').reduce((sum, c) => sum + c.estimatedPaymentUsd, 0);
    const totalAnnualUsd = Math.round(setupTotal + (recurringMonthly * 12));

    return { codes, totalAnnualUsd };
  }

  /**
   * Computes SHA-256 integrity hash for FDA 21 CFR Part 11 non-repudiation.
   */
  async computeIntegrityDigest(content: string): Promise<string> {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Deterministic fallback for environments without subtle crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Clears past adjudication records from in-memory signal.
   */
  clearHistory(): void {
    this.adjudicationHistory.set([]);
  }
}
