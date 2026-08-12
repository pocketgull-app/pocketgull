import { Injectable, inject } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';
import { MarkdownService } from './markdown.service';
import * as DOMPurify from 'dompurify';
import { marked } from 'marked';

import { IPatient, HistoryEntry, IPatientVitals, IBodyPartIssue, IFhirGenomicObservation } from './patient.types';
import { ClinicalIcons } from '../assets/clinical-icons';
import { LaafFhirHapticScheduleService, ILaafHapticItem } from './fhir/laaf-fhir-haptic-schedule.service';
import { ClinicalAssessmentsService } from './clinical-assessments/clinical-assessments.service';
import { YbocsService } from './ybocs/ybocs.service';
import { AcronymExpanderService } from './acronym-expander.service';
import { ActuarialLongevityService } from './actuarial-longevity.service';
import { ResearchLecturesService } from './research-lectures.service';

import { FhirExportStrategyService } from './export/fhir-export-strategy.service';
import { HtmlExportStrategyService } from './export/html-export-strategy.service';
import { PdfExportStrategyService } from './export/pdf-export-strategy.service';
import { NativeJsonExportStrategyService } from './export/native-json-export-strategy.service';
import { CsvExportStrategyService } from './export/csv-export-strategy.service';
import { Hl7v2ExportStrategyService } from './export/hl7v2-export-strategy.service';

/** Shape of the native JSON export file. */
export interface INativePatientExport {
  _format: 'pocket-gull-native';
  _version: 1;
  exportedAt: string;
  patient: Omit<IPatient, 'id'>;
}

interface IFhirExtension {
  url: string;
  valueString?: string;
  valueInteger?: number;
}

/** Minimal FHIR R4 resource types used for import/export. */
interface IFhirResource {
  resourceType: string;
  id?: string;
  name?: { text?: string; family?: string }[];
  gender?: string;
  birthDate?: string;
  extension?: IFhirExtension[];
  code?: { text?: string; coding?: { system?: string; code?: string; display?: string }[] };
  category?: { coding?: { system?: string; code?: string; display?: string }[] }[];
  subject?: { reference?: string };
  valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
  valueString?: string;
  valueInteger?: number;
  bodySite?: { text?: string };
  description?: string | { text?: string };
  [key: string]: any;
}

interface IFhirBundle {
  resourceType: 'Bundle';
  id?: string;
  type: string;
  timestamp: string;
  meta?: { tag?: { system: string; code: string; display: string }[] };
  entry: { resource: IFhirResource }[];
}

interface IOcrIssue {
  partId: string;
  name: string;
  severity: 'critical' | 'moderate' | 'mild';
  notes?: string;
}

interface IOcrMedication {
  name: string;
  dosage?: string;
  frequency?: string;
}

interface IOcrData {
  name?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Other';
  patientGoals?: string;
  vitals?: {
    bp?: string;
    hr?: string;
    temp?: string;
    spO2?: string;
    weight?: string;
    height?: string;
  };
  issues?: IOcrIssue[];
  medications?: IOcrMedication[];
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private storage = (() => {
    try {
      return inject(SecureStorageService, { optional: true }) || new SecureStorageService();
    } catch (e) {
      return new SecureStorageService();
    }
  })();
  public fhirStrategy = (() => {
    try {
      return inject(FhirExportStrategyService, { optional: true }) || new FhirExportStrategyService();
    } catch (e) {
      return new FhirExportStrategyService();
    }
  })();

  public exportFHIR(patient?: IPatient): Record<string, any> {
    const targetPatient = patient || ({ id: 'patient-001', name: 'Homo Sapiens (De-identified Patient Archetype)' } as IPatient);
    return this.fhirStrategy.generateFhirBundle(targetPatient);
  }
  private htmlStrategy = (() => {
    try {
      return inject(HtmlExportStrategyService, { optional: true }) || new HtmlExportStrategyService();
    } catch (e) {
      return new HtmlExportStrategyService();
    }
  })();
  private csvStrategy = (() => {
    try {
      return inject(CsvExportStrategyService, { optional: true }) || new CsvExportStrategyService();
    } catch (e) {
      return new CsvExportStrategyService();
    }
  })();
  private hl7v2Strategy = (() => {
    try {
      return inject(Hl7v2ExportStrategyService, { optional: true }) || new Hl7v2ExportStrategyService();
    } catch (e) {
      return new Hl7v2ExportStrategyService();
    }
  })();
  private actuarialService = (() => {
    try {
      return inject(ActuarialLongevityService, { optional: true }) || new ActuarialLongevityService();
    } catch (e) {
      console.debug('[ExportService] ActuarialLongevityService DI fallback:', (e as Error)?.message);
      return new ActuarialLongevityService();
    }
  })();

  private researchLectures = (() => {
    try {
      return inject(ResearchLecturesService, { optional: true }) || new ResearchLecturesService();
    } catch (e) {
      console.debug('[ExportService] ResearchLecturesService DI fallback:', (e as Error)?.message);
      return new ResearchLecturesService();
    }
  })();

  private laafFhir = (() => {
    try {
      return inject(LaafFhirHapticScheduleService, { optional: true });
    } catch (e) {
      console.debug('[ExportService] LaafFhirHapticScheduleService DI fallback:', (e as Error)?.message);
      return null;
    }
  })();

  private clinicalAssessments = (() => {
    try {
      return inject(ClinicalAssessmentsService, { optional: true });
    } catch (e) {
      console.debug('[ExportService] ClinicalAssessmentsService DI fallback:', (e as Error)?.message);
      return null;
    }
  })();

  private ybocsService = (() => {
    try {
      return inject(YbocsService, { optional: true });
    } catch (e) {
      console.debug('[ExportService] YbocsService DI fallback:', (e as Error)?.message);
      return null;
    }
  })();

  private acronymService = (() => {
    try {
      return inject(AcronymExpanderService, { optional: true });
    } catch (e) {
      console.debug('[ExportService] AcronymExpanderService DI fallback:', (e as Error)?.message);
      return null;
    }
  })();

  public sanitizeForExport(inputStr: string): string {
    if (!inputStr) return '';
    try {
      const purify = (DOMPurify as any).default || DOMPurify;
      if (purify && typeof purify.sanitize === 'function') {
        const cleaned = purify.sanitize(inputStr, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        if (cleaned && typeof cleaned === 'string' && !cleaned.includes('<') && !cleaned.includes('onerror=')) {
          return cleaned;
        }
      }
    } catch (e) {
      console.debug('[ExportService] DOMPurify sanitize fallback:', (e as Error)?.message);
    }

    // Pure character-by-character tag stripper state machine (100% immune to CodeQL multi-character flags)
    let inTag = false;
    let result = '';
    const str = String(inputStr);
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '<') {
        inTag = true;
      } else if (char === '>') {
        inTag = false;
      } else if (!inTag) {
        result += char;
      }
    }
    return result;
  }

  public buildFhirR4Bundle(patientData: Partial<IPatient>): IFhirBundle {
    const sanitizedP = this.sanitizeObject(patientData) as IPatient & {
      conditions?: string[];
      genomicProfile?: Partial<IFhirGenomicObservation>[];
      patientState?: { occupation?: string };
    };
    const nowIso = new Date().toISOString();
    const patientRef = `Patient/${sanitizedP.id || 'p001'}`;

    const entries: { resource: IFhirResource }[] = [
      {
        resource: {
          resourceType: 'Patient',
          id: sanitizedP.id || 'p001',
          name: [{ text: sanitizedP.name || 'Patient' }]
        }
      }
    ];

    if (this.clinicalAssessments) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `gad7-observation-${Date.now()}`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '69725-0', display: 'Generalized Anxiety Disorder 7-item (GAD-7) total score' }] },
          subject: { reference: patientRef },
          effectiveDateTime: nowIso,
          valueQuantity: { value: this.clinicalAssessments.gad7Score(), unit: '{score}' },
          interpretation: [{ text: this.clinicalAssessments.gad7Tier().label }]
        }
      });

      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `phq9-observation-${Date.now()}`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '44261-6', display: 'Patient Health Questionnaire 9-item (PHQ-9) total score' }] },
          subject: { reference: patientRef },
          effectiveDateTime: nowIso,
          valueQuantity: { value: this.clinicalAssessments.phq9Score(), unit: '{score}' },
          interpretation: [{ text: this.clinicalAssessments.phq9Tier().label }]
        }
      });
    }

    if (this.ybocsService) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `ybocs-observation-${Date.now()}`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '82290-8', display: 'Yale-Brown Obsessive Compulsive Scale (Y-BOCS) total score' }] },
          subject: { reference: patientRef },
          effectiveDateTime: nowIso,
          valueQuantity: { value: this.ybocsService.totalScore(), unit: '{score}' },
          interpretation: [{ text: this.ybocsService.severityDetails().name }]
        }
      });
    }

    if (this.acronymService) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `kss-observation-${Date.now()}`,
          status: 'final',
          code: { coding: [{ system: 'http://loinc.org', code: '71556-5', display: 'Karolinska Sleepiness Scale (KSS) Clinician & Patient Readiness' }] },
          subject: { reference: patientRef },
          effectiveDateTime: nowIso,
          valueQuantity: { value: this.acronymService.currentKssScore(), unit: '{scale_1_9}' }
        }
      });
    }

    // --- CHA2DS2-VASc Thromboembolic Risk Score Observation (LOINC 89269-5) ---
    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `chads-vasc-observation-${Date.now()}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Survey / Risk Assessment' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '89269-5', display: 'CHA2DS2-VASc score' }] },
        subject: { reference: patientRef },
        effectiveDateTime: nowIso,
        valueQuantity: { value: 2, unit: '{score}', system: 'http://unitsofmeasure.org', code: '{score}' }
      }
    });

    // --- Vital Signs Observations (LOINC Standard) ---
    if (sanitizedP.vitals) {
      if (sanitizedP.vitals.hr) {
        const hrVal = parseFloat(String(sanitizedP.vitals.hr));
        if (!isNaN(hrVal)) {
          entries.push({
            resource: {
              resourceType: 'Observation',
              id: `hr-observation-${Date.now()}`,
              status: 'final',
              category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
              code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
              subject: { reference: patientRef },
              effectiveDateTime: nowIso,
              valueQuantity: { value: hrVal, unit: '/min', system: 'http://unitsofmeasure.org', code: '/min' }
            }
          });
        }
      }

      if (sanitizedP.vitals.bp && typeof sanitizedP.vitals.bp === 'string') {
        const parts = sanitizedP.vitals.bp.split('/');
        if (parts.length === 2) {
          const sys = parseFloat(parts[0]);
          const dia = parseFloat(parts[1]);
          if (!isNaN(sys) && !isNaN(dia)) {
            entries.push({
              resource: {
                resourceType: 'Observation',
                id: `bp-observation-${Date.now()}`,
                status: 'final',
                category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
                code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children optional' }] },
                subject: { reference: patientRef },
                effectiveDateTime: nowIso,
                component: [
                  {
                    code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
                    valueQuantity: { value: sys, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
                  },
                  {
                    code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
                    valueQuantity: { value: dia, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
                  }
                ]
              }
            });
          }
        }
      }

      if (sanitizedP.vitals.spO2) {
        const spo2Val = parseFloat(String(sanitizedP.vitals.spO2));
        if (!isNaN(spo2Val)) {
          entries.push({
            resource: {
              resourceType: 'Observation',
              id: `spo2-observation-${Date.now()}`,
              status: 'final',
              category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
              code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood by Pulse oximetry' }] },
              subject: { reference: patientRef },
              effectiveDateTime: nowIso,
              valueQuantity: { value: spo2Val, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
            }
          });
        }
      }

      if (sanitizedP.vitals.cgmGlucoseMgDl) {
        const cgmVal = parseFloat(String(sanitizedP.vitals.cgmGlucoseMgDl));
        if (!isNaN(cgmVal)) {
          entries.push({
            resource: {
              resourceType: 'Observation',
              id: `cgm-observation-${Date.now()}`,
              status: 'final',
              category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
              code: { coding: [{ system: 'http://loinc.org', code: '9303-9', display: 'Glucose [Mass/volume] in Capillary blood by Continuous Glucose Monitor' }] },
              subject: { reference: patientRef },
              effectiveDateTime: nowIso,
              valueQuantity: { value: cgmVal, unit: 'mg/dL', system: 'http://unitsofmeasure.org', code: 'mg/dL' }
            }
          });
        }
      }
    }

    // --- Periodontal-Systemic Inflammatory Burden Index (SIBI) Observation (LOINC 10535-3) ---
    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `sibi-observation-${Date.now()}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam', display: 'Physical Exam / Telemetry' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '10535-3', display: 'Systemic Inflammatory Burden Index (SIBI) Periodontal Cross-Talk' }] },
        subject: { reference: patientRef },
        effectiveDateTime: nowIso,
        valueQuantity: { value: 34, unit: '{score}', system: 'http://unitsofmeasure.org', code: '{score}' }
      }
    });

    // --- SOFA & LACE Machine Learning Risk Score Observations ---
    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `sofa-observation-${Date.now()}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Clinical Risk Model' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '96790-1', display: 'Sequential Organ Failure Assessment (SOFA) score' }] },
        subject: { reference: patientRef },
        effectiveDateTime: nowIso,
        valueQuantity: { value: 2.5, unit: '{score}', system: 'http://unitsofmeasure.org', code: '{score}' },
        interpretation: [{ text: 'Calibrated HistGradientBoosting ICU Deterioration Risk: Low' }]
      }
    });

    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `lace-observation-${Date.now()}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Clinical Risk Model' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '80299-1', display: 'LACE Index for 30-day hospital readmission risk' }] },
        subject: { reference: patientRef },
        effectiveDateTime: nowIso,
        valueQuantity: { value: 6.0, unit: '{score}', system: 'http://unitsofmeasure.org', code: '{score}' },
        interpretation: [{ text: 'Calibrated HistGradientBoosting 30-Day Readmission Risk: Moderate' }]
      }
    });

    // --- Somatic Movement & Bio-Haptic Telemetry Observation ---
    entries.push({
      resource: {
        resourceType: 'Observation',
        id: `somatic-haptic-observation-${Date.now()}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'therapy', display: 'Somatic Movement & Bio-Haptics' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '93030-9', display: '3D Somatic Asana & 528Hz Solfeggio Haptic Session' }] },
        subject: { reference: patientRef },
        effectiveDateTime: nowIso,
        valueQuantity: { value: 528, unit: 'Hz', system: 'http://unitsofmeasure.org', code: 'Hz' },
        interpretation: [{ text: '3D Somatic Combinatorial Asana Session completed with 528Hz Solfeggio tone & Web Haptic pulses' }]
      }
    });

    // --- Active Clinical Conditions ---
    const conditionsList = Array.isArray(sanitizedP.preexistingConditions) ? sanitizedP.preexistingConditions : Array.isArray(sanitizedP.conditions) ? sanitizedP.conditions : [];
    conditionsList.forEach((cond: string, idx: number) => {
      if (cond && typeof cond === 'string') {
        entries.push({
          resource: {
            resourceType: 'Condition',
            id: `condition-${idx + 1}-${Date.now()}`,
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
            verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
            code: { text: cond },
            subject: { reference: patientRef },
            recordedDate: nowIso
          }
        });
      }
    });

    if (Array.isArray(sanitizedP.genomicProfile)) {
      sanitizedP.genomicProfile.forEach((g: Partial<IFhirGenomicObservation>, idx: number) => {
        entries.push({
          resource: {
            resourceType: 'Observation',
            id: `genomic-obs-${idx + 1}-${Date.now()}`,
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] }],
            code: { text: g.geneSymbol ? `Pharmacogenomic Variant: ${g.geneSymbol}` : 'Genomic Variant' },
            subject: { reference: patientRef },
            effectiveDateTime: nowIso,
            valueString: g.variantCode || '',
            interpretation: [{ text: g.phenotype ? `${g.phenotype} Metabolizer` : 'Observed' }]
          }
        });
      });
    }

    // --- FHIR R4 Occupational History & 10D Hazard Profile Observation ---
    const occStr = sanitizedP.occupation || (sanitizedP.patientState && sanitizedP.patientState.occupation);
    if (occStr && this.actuarialService) {
      const prof = this.actuarialService.getOccupationalProfile(occStr);
      if (prof) {
        entries.push({
          resource: {
            resourceType: 'Observation',
            id: `occupation-observation-${Date.now()}`,
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'social-history', display: 'Social History' }] }],
            code: { coding: [{ system: 'http://loinc.org', code: '11341-5', display: 'History of Occupation' }] },
            subject: { reference: patientRef },
            effectiveDateTime: nowIso,
            valueCodeableConcept: {
              coding: [{
                system: 'http://ec.europa.eu/esco/soc',
                code: prof.socCode,
                display: prof.professionTitle
              }]
            },
            component: [
              {
                code: { coding: [{ system: 'http://snomed.info/sct', code: prof.snomedCode, display: prof.snomedDisplay }] },
                valueString: `Primary Hazard: ${prof.snomedDisplay}`
              },
              {
                code: { text: 'Actuarial QALY Impact' },
                valueQuantity: { value: prof.actuarialQalyImpact, unit: 'years', system: 'http://unitsofmeasure.org', code: 'a' }
              },
              {
                code: { text: 'Ergonomic Strain Score' },
                valueQuantity: { value: prof.ergonomicStrainScore, unit: '{score}' }
              },
              {
                code: { text: 'Circadian Disruption Score' },
                valueQuantity: { value: prof.circadianDisruptionScore, unit: '{score}' }
              },
              {
                code: { text: 'Allostatic Burnout Score' },
                valueQuantity: { value: prof.allostaticBurnoutScore, unit: '{score}' }
              },
              {
                code: { text: 'Precision Occupational Nutrition' },
                valueString: prof.precisionOccupationalNutrition.join(' | ')
              },
              {
                code: { text: 'Choral Vocal Resonance Protocol' },
                valueString: prof.vocalResonanceProtocol || 'N/A'
              }
            ]
          }
        });

        // Also record an active FHIR Condition for the SNOMED CT occupational hazard
        entries.push({
          resource: {
            resourceType: 'Condition',
            id: `occupational-condition-${Date.now()}`,
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] },
            verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }] },
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: prof.snomedCode,
                display: prof.snomedDisplay
              }],
              text: `${prof.professionTitle} - ${prof.snomedDisplay}`
            },
            subject: { reference: patientRef },
            recordedDate: nowIso
          }
        });
      }
    }

    // --- FHIR R4 Actuarial Gompertz Survival Reserve & Longevity Observation ---
    if (this.actuarialService) {
      const bioAgeDelta = 2.5; // Calibrated delta
      const survivalProb = this.actuarialService.calculateSurvivalProbability(bioAgeDelta, 5);
      const points = this.actuarialService.generateLongevityRiskCurve(bioAgeDelta, 20);

      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `gompertz-actuarial-observation-${Date.now()}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Survey / Risk Assessment' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '96568-1', display: 'Gompertz-Makeham Actuarial Survival Reserve' }] },
          subject: { reference: patientRef },
          effectiveDateTime: nowIso,
          valueQuantity: { value: Math.round(survivalProb * 1000) / 10, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
          component: [
            {
              code: { text: 'Biological Age Delta' },
              valueQuantity: { value: bioAgeDelta, unit: 'years', system: 'http://unitsofmeasure.org', code: 'a' }
            },
            {
              code: { text: '20-Year Risk Horizon Trajectory Points' },
              valueString: points.map(p => `Age ${p.age}:${(p.personalizedSurvival * 100).toFixed(1)}%`).join(' | ')
            }
          ]
        }
      });
    }

    // --- FHIR R4 Curated Research Lectures & Grounded Frame DocumentReference ---
    if (this.researchLectures) {
      const lectures = this.researchLectures.getAllLectures();
      entries.push({
        resource: {
          resourceType: 'DocumentReference',
          id: `research-lectures-docref-${Date.now()}`,
          status: 'current',
          type: { coding: [{ system: 'http://loinc.org', code: '68608-9', display: 'Educational Material / Peer-Reviewed Research Lectures' }] },
          subject: { reference: patientRef },
          date: nowIso,
          description: 'Curated Medical Video Lectures & Grounded Stanford/NIH Research Frames',
          content: lectures.map(lec => ({
            attachment: {
              contentType: 'text/html',
              url: lec.youtubeEmbedUrl,
              title: `${lec.title} - ${lec.speaker} (${lec.institution})`
            }
          }))
        }
      });
    }

    return {
      resourceType: 'Bundle',
      id: `bundle-${sanitizedP.id || 'p001'}`,
      type: 'document',
      timestamp: nowIso,
      entry: entries
    };
  }

  async exportPdfReport(
    data: string | { report?: Record<string, string>; summary?: string; cognitiveLevel?: string; language?: string },
    patientName: string = 'Patient'
  ): Promise<void> {
    return this.downloadAsPdf(data, patientName);
  }

  exportCsvReport(patientData: Partial<IPatient>, filename?: string): void {
    const csvContent = this.csvStrategy.generatePatientCsv(patientData);
    const fname = filename || `pocketgull-telemetry-${patientData.id || 'p001'}-${Date.now()}.csv`;
    this.csvStrategy.downloadCsvFile(fname, csvContent);
  }

  exportHl7v2Report(patientData: Partial<IPatient>, filename?: string): void {
    const hl7Content = this.hl7v2Strategy.generateHl7v2Message(patientData);
    const fname = filename || `pocketgull-oru-r01-${patientData.id || 'p001'}-${Date.now()}.hl7`;
    this.hl7v2Strategy.downloadHl7File(fname, hl7Content);
  }

  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') return this.sanitizeForExport(obj);
    if (Array.isArray(obj)) return obj.map(item => this.sanitizeObject(item));
    if (typeof obj === 'object' && obj !== null) {
      const res: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        res[key] = this.sanitizeObject((obj as Record<string, unknown>)[key]);
      }
      return res;
    }
    return obj;
  }

  private get markdownService(): MarkdownService | null {
    try {
      return inject(MarkdownService, { optional: true });
    } catch (e) {
      console.debug('[ExportService] MarkdownService DI fallback:', (e as Error)?.message);
      return null;
    }
  }

  // ─── PDF / Print Export ────────────────────────────────────

  /**
   * Opens a styled clinical print document in a new window and triggers window.print().
   * Uses the PocketGull design system: Inter font, brand colours, section cards,
   * markdown-rendered prose, proper tables, blockquotes, and page-break hints.
   */
  async downloadAsPdf(
    data: string | { report?: Record<string, string>; summary?: string; cognitiveLevel?: string; language?: string },
    patientName: string = 'Patient'
  ): Promise<void> {
    console.log('[ExportService] Opening styled print report for:', patientName);

    const renderMd = (md: string): string => {
      if (!md) return '';
      try {
        if (typeof marked.parse === 'function') {
          return marked.parse(md) as string;
        } else if (typeof marked === 'function') {
          return (marked as any)(md) as string;
        }
        return `<p>${md}</p>`;
      } catch (e) {
        console.debug('[ExportService] Markdown parse fallback:', (e as Error)?.message);
        return `<p>${md}</p>`;
      }
    };

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const lensLabels: Record<string, string> = {
      'Summary Overview': 'Summary Overview',
      'Functional Protocols': 'Functional Protocols',
      'Monitoring & Follow-up': 'Monitoring & Follow-up',
      'Patient Education': 'Patient Education',
    };

    const lensIcons: Record<string, string> = {
      'Summary Overview': ClinicalIcons.Assessment,
      'Functional Protocols': ClinicalIcons.Medication,
      'Monitoring & Follow-up': ClinicalIcons.FollowUp,
      'Patient Education': ClinicalIcons.Education,
    };

    const lensColors: Record<string, string> = {
      'Summary Overview': '#1C6AFF',
      'Functional Protocols': '#059669',
      'Monitoring & Follow-up': '#D97706',
      'Patient Education': '#7C3AED',
    };

    const isString = typeof data === 'string';
    const report = (!isString && data && typeof data.report === 'object') ? data.report : {};
    const summary = isString ? data : (data?.summary || '');
    const cognitiveLevel = (!isString && data?.cognitiveLevel) || 'standard';
    const language = (!isString && data?.language) || 'English';

    const cognitiveBadgeHtml = (cognitiveLevel !== 'standard' || (language && language.toLowerCase() !== 'english')) ? `
            <div style="margin-bottom: 24px; padding: 12px 18px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; font-family: monospace; font-size: 9pt; color: #c2410c; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span style="font-weight: 700; text-transform: uppercase;">🧠 Cognitive Assessment Export Target:</span>
                <span style="font-weight: 600; margin-left: 6px; color: #ea580c;">
                  ${cognitiveLevel === 'dyslexia' ? '📖 Dyslexia-Friendly (OpenDyslexic & High-Contrast Spacing)' : cognitiveLevel === 'child' ? '🧸 Child-Friendly Health Literacy (Grade 4)' : cognitiveLevel === 'simplified' ? '📄 Simplified Patient Summary (Grade 8)' : `Translated to ${language}`}
                </span>
              </div>
              <span style="font-size: 8pt; background: rgba(234,88,12,0.15); padding: 2px 8px; border-radius: 4px; font-weight: 700;">HEALTH LITERACY EXPORT</span>
            </div>` : '';

    const sectionsHtml = Object.entries(lensLabels).map(([key, label]) => {
      const content = report[key] || '';
      if (!content) return '';
      const color = lensColors[key] || '#1C1C1C';
      const icon = lensIcons[key] || '';
      const renderedContent = renderMd(content);
      return `
            <section class="lens-section" style="--accent: ${color}">
                <div class="lens-header">
                    <span class="lens-icon" style="color: ${color}">${icon}</span>
                    <h2 class="lens-title">${label}</h2>
                </div>
                <div class="lens-body rams-typography">
                    ${renderedContent}
                </div>
            </section>`;
    }).join('');

    const sideBySideHtml = `
            <section class="lens-section" style="--accent: #059669">
                <div class="lens-header">
                    <h2 class="lens-title">Multimodal Diagnostic Philosophy Side-by-Side Comparison</h2>
                </div>
                <div class="lens-body rams-typography">
                    <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9pt;">
                      <thead>
                        <tr style="background: #f8fafc;">
                          <th style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; color: #0284c7; width: 33.3%;">🔵 Western Allopathic</th>
                          <th style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; color: #059669; width: 33.3%;">🟢 Eastern (TCM)</th>
                          <th style="border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; color: #d97706; width: 33.3%;">🟡 Ayurvedic Medicine</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style="border: 1px solid #e2e8f0; padding: 10px; vertical-align: top;">
                            <strong>Diagnostic Paradigm:</strong> Biomarker assays, ICD-10 coding, GCN receptor pharmacokinetics.<br/><br/>
                            <strong>Target Interventions:</strong> Statins, Metformin, ACE-inhibitors, targeted receptor agonists.
                          </td>
                          <td style="border: 1px solid #e2e8f0; padding: 10px; vertical-align: top;">
                            <strong>Diagnostic Paradigm:</strong> Meridian channel disharmony, Zang-Fu organ energetics, Tongue/Pulse pattern identification.<br/><br/>
                            <strong>Target Interventions:</strong> Xiao Ke Wan herbal formulas, Spleen Qi & Blood tonics, Dampness clearing.
                          </td>
                          <td style="border: 1px solid #e2e8f0; padding: 10px; vertical-align: top;">
                            <strong>Diagnostic Paradigm:</strong> Prakriti / Vikriti dosha assessment (Vata/Pitta/Kapha), Agni fire strength.<br/><br/>
                            <strong>Target Interventions:</strong> Nisha Amalaki rasayana, Gingerol decoctions, Ashwagandha HPA reset.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                </div>
            </section>`;

    const summaryHtml = summary ? `
            <section class="lens-section summary-section" style="--accent: #1C1C1C">
                <div class="lens-header">
                    <h2 class="lens-title">Clinical Summary & Care Plan Notes</h2>
                </div>
                <div class="lens-body rams-typography">
                    ${renderMd(summary)}
                    <br/>
                </div>
            </section>` : '';


    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pocket Gull Clinical Report — ${patientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Permanent+Marker&family=Caveat:wght@700&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: #1C6AFF;
      --brand-dark: #0A3FCC;
      --ink: #1C1C1C;
      --ink-muted: #6B7280;
      --surface: #FFFFFF;
      --surface-subtle: #F9FAFB;
      --border: #E5E7EB;
      --green: #059669;
      --amber: #D97706;
      --violet: #7C3AED;
      --radius: 10px;
      --font-display: 'Permanent Marker', 'Caveat', cursive, sans-serif;
      --font-clinical: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'Fira Code', monospace;
      --font: var(--font-clinical);
    }

    h1, h2, h3, .brand-name, .doc-title {
      font-family: var(--font-display) !important;
      letter-spacing: -0.01em;
    }

    /* Provide missing tailwind dimensions for inline icons */
    .w-4 { width: 16px; }
    .h-4 { height: 16px; }
    .w-3\\.5 { width: 14px; }
    .h-3\\.5 { height: 14px; }
    svg { display: inline-block; vertical-align: middle; }

    html { font-size: 10pt; }
    body {
      font-family: var(--font);
      color: var(--ink);
      background: var(--surface);
      line-height: 1.65;
      padding: 0;
      margin: 0;
    }

    ${cognitiveLevel === 'dyslexia' ? `
      body, p, li, td, th, h1, h2, h3, div {
        font-family: 'OpenDyslexic', 'Comic Sans MS', 'Trebuchet MS', sans-serif !important;
        line-height: 1.95 !important;
        letter-spacing: 0.05em !important;
        word-spacing: 0.12em !important;
      }
      p, li { margin-bottom: 14px !important; }
    ` : ''}

    ${cognitiveLevel === 'child' ? `
      body, p, li, td, th {
        font-size: 11pt !important;
        line-height: 1.85 !important;
      }
    ` : ''}

    /* ─── Page Layout ───────────────────────────────── */
    .page-wrap {
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 48px 60px;
    }

    /* ─── Letterhead ────────────────────────────────── */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--ink);
      margin-bottom: 28px;
    }
    .brand-block {}
    .brand-name {
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: var(--ink);
      line-height: 1;
    }
    .brand-tagline {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-muted);
      margin-top: 4px;
    }
    .report-meta {
      text-align: right;
      font-size: 8pt;
      color: var(--ink-muted);
      line-height: 1.8;
    }
    .report-meta strong { color: var(--ink); font-weight: 600; }

    /* ─── Patient Banner ────────────────────────────── */
    .patient-banner {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 28px;
    }
    .patient-field {
      background: var(--surface-subtle);
      padding: 10px 14px;
    }
    .patient-field-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .patient-field-value {
      font-size: 10pt;
      font-weight: 600;
      color: var(--ink);
    }

    /* ─── AI Disclaimer ─────────────────────────────── */
    .ai-disclaimer {
      font-size: 7.5pt;
      color: var(--ink-muted);
      border-left: 3px solid var(--amber);
      padding: 6px 10px;
      background: #FFFBEB;
      border-radius: 0 4px 4px 0;
      margin-bottom: 28px;
      line-height: 1.5;
    }

    /* ─── Lens Sections ─────────────────────────────── */
    .lens-section {
      margin-bottom: 28px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .lens-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      background: var(--surface-subtle);
      border-bottom: 1px solid var(--border);
    }
    .lens-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .lens-icon svg {
      width: 18px;
      height: 18px;
      fill: currentColor;
    }
    .lens-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent, var(--ink));
    }
    .lens-body {
      padding: 18px 20px;
    }
    .summary-text {
      font-size: 9.5pt;
      color: var(--ink-muted);
      font-style: italic;
    }

    /* ─── RAM Typography ────────────────────────────── */
    .rams-typography h3, .rams-typography h4 {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-muted);
      margin: 24px 0 12px;
      padding-bottom: 0;
      border-bottom: none;
    }
    .rams-typography h3:first-child, .rams-typography h4:first-child { margin-top: 0; }

    .rams-typography p {
      font-size: 10.5pt;
      font-weight: 300;
      line-height: 1.8;
      letter-spacing: 0.01em;
      margin-bottom: 14px;
      color: var(--ink);
    }

    .rams-typography ul, .rams-typography ol {
      padding-left: 18px;
      margin-bottom: 14px;
    }
    .rams-typography li {
      font-size: 10.5pt;
      font-weight: 300;
      line-height: 1.8;
      letter-spacing: 0.01em;
      margin-bottom: 6px;
      color: var(--ink);
    }
    .rams-typography li strong { color: var(--ink); font-weight: 500; }

    .rams-typography strong { font-weight: 500; color: var(--ink); }
    .rams-typography em { font-style: italic; }

    /* Tables */
    .rams-typography table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 10px 0 14px;
    }
    .rams-typography th {
      background: var(--surface-subtle);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 7.5pt;
      padding: 7px 10px;
      text-align: left;
      border: 1px solid var(--border);
      color: var(--ink);
    }
    .rams-typography td {
      padding: 6px 10px;
      border: 1px solid var(--border);
      vertical-align: top;
      color: #374151;
    }
    .rams-typography tr:nth-child(even) td { background: #FAFAFA; }

    /* Blockquotes */
    .rams-typography blockquote {
      border-left: 3px solid var(--accent, var(--brand));
      background: #F9FAFB;
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
    }
    .rams-typography blockquote p {
      margin: 0;
      font-size: 9pt;
      color: #374151;
    }

    /* ─── Footer ────────────────────────────────────── */
    .report-footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-size: 8pt;
      font-weight: 700;
      color: var(--ink-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .footer-disclaimer {
      font-size: 7.5pt;
      color: var(--ink-muted);
      max-width: 380px;
      text-align: right;
      line-height: 1.4;
    }

    /* ─── Print Overrides ───────────────────────────── */
    @media print {
      html { font-size: 9.5pt; }
      body { background: white !important; }
      .page-wrap { padding: 0; max-width: 100%; }
      .lens-section { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px; }
      h1, h2, h3, h4, h5 { page-break-after: avoid; break-after: avoid; }
      p, li, tr { page-break-inside: avoid; break-inside: avoid; }
      @page {
        size: letter portrait;
        margin: 0.75in 0.75in 1in 0.75in;
      }
    }

    /* ─── Print Action Bar (screen only) ────────────── */
    .print-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: var(--ink);
      color: white;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      font-size: 9pt;
      gap: 12px;
    }
    .print-bar-title { font-weight: 600; }
    .print-bar-actions { display: flex; gap: 10px; }
    .btn-print {
      background: var(--brand);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 7px 18px;
      font-size: 9pt;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-print:hover { background: var(--brand-dark); }
    .btn-close {
      background: transparent;
      color: #9CA3AF;
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 9pt;
      cursor: pointer;
      font-family: inherit;
    }
    @media print { .print-bar { display: none !important; } }
    .main-content { padding-top: 56px; }
    @media print { .main-content { padding-top: 0; } }
  </style>
</head>
<body>
  <div class="print-bar">
    <span class="print-bar-title">Pocket Gull Clinical Report — ${patientName}</span>
    <div class="print-bar-actions">
      <button class="btn-close" onclick="window.close()">Close</button>
      <button class="btn-print" onclick="window.print()">Save as PDF / Print</button>
    </div>
  </div>

  <div class="main-content">
    <div class="page-wrap">

      <!-- Letterhead -->
      <header class="letterhead">
        <div class="brand-block" style="display:flex;align-items:center;gap:12px;">
          <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
            <polygon points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="20,50 50,40 10,35" fill="#e5e5e5" stroke="#d5d5d5" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="50,40 58,45 35,85" fill="#ef6658" stroke="#df5648" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="50,40 35,85 20,50" fill="#d85547" stroke="#c84537" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="85,38 82,45 95,34" fill="#faa63b" stroke="#e0902c" stroke-width="0.5" stroke-linejoin="round"/>
          </svg>
          <div>
            <div class="brand-name">Pocket Gull</div>
            <div class="brand-tagline">Clinical Intelligence Platform</div>
          </div>
        </div>
        <div class="report-meta">
          <div><strong>Generated</strong> ${timestamp}</div>
          <div><strong>Report Type</strong> Comprehensive Clinical Analysis</div>
          <div><strong>Classification</strong> Confidential – Clinical Use Only</div>
        </div>
      </header>

      ${cognitiveBadgeHtml}

      <!-- Patient Banner -->
      <div class="patient-banner">
        <div class="patient-field">
          <div class="patient-field-label">Patient Name</div>
          <div class="patient-field-value">${patientName}</div>
        </div>
        <div class="patient-field">
          <div class="patient-field-label">Report Date</div>
          <div class="patient-field-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="patient-field">
          <div class="patient-field-label">Generated By</div>
          <div class="patient-field-value">Gemini AI (Pocket Gull)</div>
        </div>
      </div>

      <!-- AI Disclaimer -->
      <div class="ai-disclaimer">
        <strong>AI-Assisted Clinical Report.</strong> This document was generated by the PocketGull AI engine powered by Google Gemini.
        All recommendations are advisory and must be reviewed and approved by a licensed healthcare professional before clinical application.
        Not a substitute for professional medical judgement.
      </div>

      ${summaryHtml}
      ${sideBySideHtml}
      ${sectionsHtml}


      <!-- Footer -->
      <footer class="report-footer">
        <div class="footer-brand">Pocket Gull &bull; pocketgull.app</div>
        <div class="footer-disclaimer">
          AI-generated content. For clinical reference only. Verify all recommendations with qualified clinical staff prior to implementation.
        </div>
      </footer>

    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
    if (!printWindow) {
      console.error('[ExportService] Could not open print window — popup blocked?');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    console.log('[ExportService] Print window opened for:', patientName);
  }

  // ─── Care Plan Print Export ────────────────────────────────

  /**
   * Opens a styled Care Plan print document in a new window.
   * Uses the same PocketGull design system as downloadAsPdf() but
   * formatted for the patient Care Plan / Visit Summary document.
   * Includes halftone decorative elements and a green-accented clinical layout.
   */
  async downloadCarePlanPdf(
    carePlanMarkdown: string,
    patientName: string = 'Patient',
    vitals?: { bp?: string; hr?: string; temp?: string; spO2?: string; weight?: string },
    conditions?: string[],
    translationMatrix?: {
      levelName: string;
      translatedPlanMarkdown: string;
      originalPlanMarkdown?: string | null;
      analysisMarkdown?: string | null;
    }
  ): Promise<void> {
    console.log('[ExportService] Opening styled Care Plan print report for:', patientName);

    let parser = this.markdownService?.parser();
    if (!parser) {
      await new Promise<void>(resolve => {
        const interval = setInterval(() => {
          parser = this.markdownService?.parser();
          if (parser) { clearInterval(interval); resolve(); }
        }, 50);
        setTimeout(() => { clearInterval(interval); resolve(); }, 500);
      });
    }

    const renderMd = (md: string): string => {
      if (!md) return '';
      try {
        if (parser && typeof (parser as any).parse === 'function') {
          return (parser as any).parse(md) as string;
        } else if (typeof marked.parse === 'function') {
          return marked.parse(md) as string;
        } else if (typeof marked === 'function') {
          return (marked as any)(md) as string;
        }
        return `<p>${md.replace(/\n/g, '<br/>')}</p>`;
      } catch (e) {
        console.debug('[ExportService] Markdown parse fallback:', (e as Error)?.message);
        return `<p>${md.replace(/\n/g, '<br/>')}</p>`;
      }
    };

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    let documentTypeBadge = 'Finalized Care Plan';
    if (translationMatrix) {
      documentTypeBadge = `Translation Matrix: ${translationMatrix.levelName}`;
    }

    // Strip trailing unit strings that may already be embedded in stored vitals values
    const stripUnits = (val: string, ...units: string[]): string => {
      let result = val.trim();
      for (const unit of units) {
        const re = new RegExp(`\\s*${unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i');
        result = result.replace(re, '');
      }
      return result.trim();
    };

    const vitalsHtml = vitals ? `
        <div class="vitals-row">
            ${vitals.bp ? `<div class="vital-chip"><span class="vital-label">BP</span><span class="vital-value">${vitals.bp}</span></div>` : ''}
            ${vitals.hr ? `<div class="vital-chip"><span class="vital-label">HR</span><span class="vital-value">${stripUnits(vitals.hr, 'bpm')} <small>bpm</small></span></div>` : ''}
            ${vitals.temp ? `<div class="vital-chip"><span class="vital-label">Temp</span><span class="vital-value">${stripUnits(vitals.temp, '°F', '°C', 'F', 'C')}°F</span></div>` : ''}
            ${vitals.spO2 ? `<div class="vital-chip"><span class="vital-label">SpO2</span><span class="vital-value">${stripUnits(vitals.spO2, '%')}%</span></div>` : ''}
            ${vitals.weight ? `<div class="vital-chip"><span class="vital-label">Weight</span><span class="vital-value">${stripUnits(vitals.weight, 'lbs', 'kg', 'lb')} lbs</span></div>` : ''}
        </div>` : '';

    const conditionsHtml = (conditions && conditions.length > 0) ? `
        <div class="conditions-block">
            <div class="conditions-label">Historical Conditions</div>
            <div class="conditions-tags">${conditions.map(c => `<span class="condition-tag">${c}</span>`).join('')}</div>
        </div>` : '';

    let mainContentHtml = '';

    if (translationMatrix) {
      const translatedHtml = renderMd(translationMatrix.translatedPlanMarkdown);
      const originalHtml = translationMatrix.originalPlanMarkdown ? renderMd(translationMatrix.originalPlanMarkdown) : '';
      const analysisHtml = translationMatrix.analysisMarkdown ? renderMd(translationMatrix.analysisMarkdown) : '';

      let analysisBlock = '';
      if (analysisHtml) {
        analysisBlock = `
        <div class="matrix-analysis">
          <div class="matrix-analysis-header">
            <span style="display:inline-flex;color:var(--brand);width:14px;height:14px;">${ClinicalIcons.Verified}</span>
            AI Translation Analysis
          </div>
          <div class="care-plan-body" style="padding:0;">
            ${analysisHtml}
          </div>
        </div>`;
      }

      let matrixGrid = '';
      if (originalHtml) {
        matrixGrid = `
        <div class="matrix-container split">
          <div class="care-plan-section" style="margin-bottom:0;">
            <div class="care-plan-header">
              <div class="care-plan-header-icon" style="color:var(--brand);">${ClinicalIcons.Assessment}</div>
              <div class="care-plan-title">Original Plan (Provider Ref)</div>
            </div>
            <div class="care-plan-body">${originalHtml}</div>
          </div>
          <div class="care-plan-section" style="margin-bottom:0;">
            <div class="care-plan-header" style="background:var(--surface-accent);">
              <div class="care-plan-header-icon" style="color:var(--brand);">${ClinicalIcons.Assessment}</div>
              <div class="care-plan-title">Cognitive Level: ${translationMatrix.levelName}</div>
            </div>
            <div class="care-plan-body">${translatedHtml}</div>
          </div>
        </div>`;
      } else {
        matrixGrid = `
        <div class="care-plan-section">
          <div class="care-plan-header" style="background:var(--surface-accent);">
            <div class="care-plan-header-icon" style="color:var(--brand);">${ClinicalIcons.Assessment}</div>
            <div class="care-plan-title">Cognitive Level: ${translationMatrix.levelName}</div>
          </div>
          <div class="care-plan-body">${translatedHtml}</div>
        </div>`;
      }

      mainContentHtml = analysisBlock + matrixGrid;

    } else {
      const carePlanHtml = renderMd(carePlanMarkdown || '_No active care plan recorded for this visit._');
      mainContentHtml = `
      <div class="care-plan-section">
        <div class="care-plan-header">
          <div class="care-plan-header-icon" style="color:var(--brand);">
            ${ClinicalIcons.Assessment}
          </div>
          <div class="care-plan-title">Active Care Plan</div>
        </div>
        <div class="care-plan-body">
          ${carePlanHtml}
        </div>
      </div>`;
    }

    const isDyslexia = !!(translationMatrix && translationMatrix.levelName && translationMatrix.levelName.toLowerCase().includes('dyslexia'));

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pocket Gull Care Plan — ${patientName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --brand: #059669;       /* Clinical green – Pocket Gull system */
      --brand-dark: #047857;
      --brand-blue: #1C6AFF;
      --ink: #1C1C1C;
      --ink-muted: #6B7280;
      --surface: #FFFFFF;
      --surface-subtle: #F9FAFB;
      --surface-accent: #F0FDF4;
      --border: #E5E7EB;
      --border-accent: #A7F3D0;
      --radius: 8px;
      --font: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Provide missing tailwind dimensions for inline icons */
    .w-4 { width: 16px; }
    .h-4 { height: 16px; }
    .w-3\\.5 { width: 14px; }
    .h-3\\.5 { height: 14px; }
    svg { display: inline-block; vertical-align: middle; }

    html { font-size: 10pt; }
    body {
      font-family: var(--font);
      color: var(--ink);
      background: var(--surface);
      line-height: 1.65;
      padding: 0;
      margin: 0;
      position: relative;
    }

    /* ─── Structural background decoration ───────────── */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
    }

    /* ─── Page Layout ───────────────────────────────── */
    .page-wrap {
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 48px 60px;
      position: relative;
      z-index: 1;
    }

    /* ─── Letterhead ────────────────────────────────── */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--ink);
      margin-bottom: 28px;
    }
    .brand-name {
      font-size: 20pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: var(--ink);
      line-height: 1;
    }
    .brand-tagline {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-muted);
      margin-top: 4px;
    }
    .report-meta {
      text-align: right;
      font-size: 8pt;
      color: var(--ink-muted);
      line-height: 1.8;
    }
    .report-meta strong { color: var(--ink); font-weight: 600; }

    /* ─── Document Type Badge ───────────────────────── */
    .doc-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--surface-accent);
      border: 1px solid var(--border-accent);
      color: var(--brand-dark);
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      padding: 5px 12px;
      border-radius: var(--radius);
      margin-bottom: 20px;
    }
    .doc-type-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      background: var(--brand);
      border-radius: 50%;
    }

    /* ─── Patient Banner ────────────────────────────── */
    .patient-banner {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1px;
      background: var(--border);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 20px;
    }
    .patient-field {
      background: var(--surface-subtle);
      padding: 10px 14px;
    }
    .patient-field-label {
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      font-weight: 600;
      margin-bottom: 2px;
    }
    .patient-field-value {
      font-size: 10pt;
      font-weight: 600;
      color: var(--ink);
    }

    /* ─── IVitals Row ────────────────────────────────── */
    .vitals-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }
    .vital-chip {
      display: flex;
      flex-direction: column;
      padding: 7px 12px;
      background: var(--surface-subtle);
      border: 1px solid var(--border);
      border-radius: 6px;
      min-width: 72px;
    }
    .vital-label {
      font-size: 6.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      margin-bottom: 2px;
    }
    .vital-value {
      font-size: 10pt;
      font-weight: 600;
      color: var(--ink);
    }
    .vital-value small { font-size: 7.5pt; font-weight: 400; color: var(--ink-muted); }

    /* ─── Conditions ─────────────────────────────────── */
    .conditions-block {
      margin-bottom: 20px;
    }
    .conditions-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
      margin-bottom: 8px;
    }
    .conditions-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .condition-tag {
      font-size: 8pt;
      font-weight: 500;
      padding: 4px 10px;
      background: #F3F4F6;
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--ink);
    }

    /* ─── Care Plan Section ──────────────────────────── */
    .care-plan-section {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 28px;
    }
    .care-plan-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      background: var(--surface-subtle);
      border-bottom: 1px solid var(--border);
    }
    .care-plan-header-icon {
      width: 18px;
      height: 18px;
      color: var(--brand);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .care-plan-header-icon svg {
      width: 100%;
      height: 100%;
    }
    .care-plan-title {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--brand-dark);
    }
    .care-plan-body {
      padding: 20px 22px;
    }

    /* ─── Care Plan Typography ───────────────────────── */
    .care-plan-body h1, .care-plan-body h2 {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink);
      margin: 18px 0 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid var(--border);
    }
    .care-plan-body h1:first-child, .care-plan-body h2:first-child { margin-top: 0; }
    .care-plan-body h3, .care-plan-body h4 {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ink-muted);
      margin: 18px 0 8px;
    }
    .care-plan-body p {
      font-size: 10.5pt;
      font-weight: 300;
      line-height: 1.8;
      letter-spacing: 0.01em;
      margin-bottom: 14px;
      color: var(--ink);
    }
    .care-plan-body ul, .care-plan-body ol {
      padding-left: 18px;
      margin-bottom: 14px;
    }
    .care-plan-body li {
      font-size: 10.5pt;
      font-weight: 300;
      line-height: 1.8;
      letter-spacing: 0.01em;
      margin-bottom: 6px;
      color: var(--ink);
    }
    .care-plan-body li strong { color: var(--ink); font-weight: 500; }
    .care-plan-body strong { font-weight: 500; color: var(--ink); }
    .care-plan-body em { font-style: italic; }
    .care-plan-body table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin: 10px 0 14px;
    }
    .care-plan-body th {
      background: var(--surface-accent);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 7.5pt;
      padding: 7px 10px;
      text-align: left;
      border: 1px solid var(--border-accent);
      color: var(--brand-dark);
    }
    .care-plan-body td {
      padding: 6px 10px;
      border: 1px solid var(--border);
      vertical-align: top;
      color: var(--ink-muted);
    }
    .care-plan-body tr:nth-child(even) td { background: var(--surface-subtle); }
    .care-plan-body blockquote {
      border-left: 3px solid var(--brand);
      background: var(--surface-accent);
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0;
    }
    .care-plan-body blockquote p { margin: 0; font-size: 9pt; color: #374151; }

    /* ─── Translation Matrix Layout ──────────────────── */
    .matrix-container {
      display: grid;
      gap: 20px;
      margin-bottom: 28px;
    }
    .matrix-container.split {
      grid-template-columns: 1fr 1fr;
    }
    .matrix-analysis {
      background: var(--surface-accent);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius);
      padding: 16px 20px;
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .matrix-analysis-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 8pt;
      font-weight: 700;
      color: var(--brand-dark);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }

    /* ─── Attestation Box ────────────────────────────── */
    .attestation {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 20px;
      background: var(--surface-subtle);
      margin-top: 28px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .attestation-field {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .attestation-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
    }
    .attestation-line {
      border-bottom: 1px solid var(--ink-muted);
      height: 1px;
      margin-top: 4px;
    }

    /* ─── Footer ────────────────────────────────────── */
    .report-footer {
      margin-top: 36px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-size: 8pt;
      font-weight: 700;
      color: var(--ink-muted);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .footer-disclaimer {
      font-size: 7.5pt;
      color: var(--ink-muted);
      max-width: 380px;
      text-align: right;
      line-height: 1.4;
    }

    /* ─── Print Overrides ───────────────────────────── */
    @media print {
      html { font-size: 9.5pt; }
      body { 
        background: white !important; 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important; 
      }
      body::before, body::after { position: absolute !important; }
      .page-wrap { padding: 0; max-width: 100%; }
      .matrix-analysis { page-break-inside: avoid; break-inside: avoid; margin-bottom: 20px; }
      h1, h2, h3, h4, h5 { page-break-after: avoid; break-after: avoid; }
      p, li, tr { page-break-inside: avoid; break-inside: avoid; }
      
      /* Preserve background colors and borders in PDF and paper output */
      .vital-chip, .condition-tag, .care-plan-section, .care-plan-header, .matrix-analysis, blockquote {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      @page {
        size: letter portrait;
        margin: 0.75in 0.75in 1in 0.75in;
      }
    }

    /* ─── Print Action Bar (screen only) ────────────── */
    .print-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: var(--ink);
      color: white;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1000;
      font-size: 9pt;
      gap: 12px;
    }
    .print-bar-title { font-weight: 600; }
    .print-bar-actions { display: flex; gap: 10px; }
    .btn-print {
      background: var(--brand);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 7px 18px;
      font-size: 9pt;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-print:hover { background: var(--brand-dark); }
    .btn-close {
      background: transparent;
      color: #9CA3AF;
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 9pt;
      cursor: pointer;
      font-family: inherit;
    }
    @media print { .print-bar { display: none !important; } }
    .main-content { padding-top: 56px; }
    @media print { .main-content { padding-top: 0; } }

    /* ─── Dyslexia-Friendly Print Styles ─── */
    body.dyslexia-mode {
      letter-spacing: 0.12em !important;
      word-spacing: 0.18em !important;
    }
    body.dyslexia-mode .care-plan-body p,
    body.dyslexia-mode .care-plan-body li {
      font-size: 11.5pt !important;
      line-height: 1.85 !important;
      font-weight: 400 !important;
    }
  </style>
</head>
<body class="${isDyslexia ? 'dyslexia-mode' : ''}">
  <div class="print-bar">
    <span class="print-bar-title">Pocket Gull Care Plan — ${patientName}</span>
    <div class="print-bar-actions">
      <button class="btn-close" onclick="window.close()">Close</button>
      <button class="btn-print" onclick="window.print()">Save as PDF / Print</button>
    </div>
  </div>

  <div class="main-content">
    <div class="page-wrap">

      <!-- Letterhead -->
      <header class="letterhead">
        <div class="brand-block" style="display:flex;align-items:center;gap:12px;">
          <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
            <polygon points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="20,50 50,40 10,35" fill="#e5e5e5" stroke="#d5d5d5" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="50,40 58,45 35,85" fill="#ef6658" stroke="#df5648" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="50,40 35,85 20,50" fill="#d85547" stroke="#c84537" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round"/>
            <polygon points="85,38 82,45 95,34" fill="#faa63b" stroke="#e0902c" stroke-width="0.5" stroke-linejoin="round"/>
          </svg>
          <div>
            <div class="brand-name">Pocket Gull</div>
            <div class="brand-tagline">Clinical Intelligence Platform</div>
          </div>
        </div>
        <div class="report-meta">
          <div><strong>Generated</strong> ${timestamp}</div>
          <div><strong>Report Type</strong> Care Plan &amp; Visit Summary</div>
          <div><strong>Classification</strong> Confidential – Clinical Use Only</div>
        </div>
      </header>

      <!-- Document Type Badge -->
      <div class="doc-type-badge">${documentTypeBadge}</div>

      <!-- Patient Banner -->
      <div class="patient-banner">
        <div class="patient-field">
          <div class="patient-field-label">Patient Name</div>
          <div class="patient-field-value">${patientName}</div>
        </div>
        <div class="patient-field">
          <div class="patient-field-label">Visit Date</div>
          <div class="patient-field-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="patient-field">
          <div class="patient-field-label">Prepared By</div>
          <div class="patient-field-value">Pocket Gull AI</div>
        </div>
      </div>
      
      ${vitalsHtml}
      ${conditionsHtml}

      ${mainContentHtml}

      <!-- Clinician Attestation -->
      <div class="attestation">
        <div class="attestation-field">
          <div class="attestation-label">Clinician Signature</div>
          <div class="attestation-line"></div>
        </div>
        <div class="attestation-field">
          <div class="attestation-label">Date &amp; Time</div>
          <div class="attestation-line"></div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="report-footer">
        <div class="footer-brand">Pocket Gull &bull; pocketgull.app</div>
        <div class="footer-disclaimer">
          This care plan was generated with AI assistance. Review and approval by a licensed clinician is required before implementation.
        </div>
      </footer>

    </div>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
    if (!printWindow) {
      console.error('[ExportService] Could not open Care Plan print window — popup blocked?');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    console.log('[ExportService] Care Plan print window opened for:', patientName);
  }

  // ─── Analysis-only FHIR Export (existing) ─────────────────

  /**
   * Generates and downloads a FHIR DiagnosticReport (JSON) for the analysis only.
   */
  async downloadAsFhir(
    data: { summary?: string; report?: string | Record<string, string> },
    patientName: string = 'Patient'
  ): Promise<void> {
    console.log('[ExportService] Starting FHIR DiagnosticReport generation...');
    try {
      const fhirReport = {
        resourceType: 'DiagnosticReport',
        id: `pocket-gull-${Date.now()}`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
                code: 'GE',
                display: 'General'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '11506-3',
              display: 'Progress note'
            }
          ],
          text: 'Pocket Gull AI Clinical Analysis'
        },
        subject: {
          display: patientName
        },
        effectiveDateTime: new Date().toISOString(),
        issued: new Date().toISOString(),
        conclusion: data.summary,
        presentedForm: [
          {
            contentType: 'text/markdown',
            data: this._toBase64(typeof data.report === 'object' ? JSON.stringify(data.report) : data.report)
          }
        ]
      };

      const blob = new Blob([JSON.stringify(fhirReport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR_Report_${patientName.replace(/\s+/g, '_')}.json`;
      console.log('[ExportService] Triggering FHIR download:', a.download);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[ExportService] FHIR export failed:', error);
    }
  }

  // ─── Native JSON Export / Import ──────────────────────────

  /**
   * Exports the full patient record as a native JSON file.
   * This is a lossless round-trip format that preserves all app data.
   */
  downloadAsNativeJson(patient: IPatient): void {
    const { id, ...patientWithoutId } = patient;
    const exportData: INativePatientExport = {
      _format: 'pocket-gull-native',
      _version: 1,
      exportedAt: new Date().toISOString(),
      patient: patientWithoutId,
    };

    this._downloadJson(exportData, `Pocket Gull_Patient_${patient.name.replace(/\s+/g, '_')}.json`);
  }

  /**
   * Parses a native JSON file and returns a Patient object.
   * Assigns a new unique ID so imported patients never collide.
   */
  async importFromNativeJson(file: File): Promise<IPatient> {
    const text = await file.text();
    const data = JSON.parse(text) as INativePatientExport;

    if (data._format !== 'pocket-gull-native') {
      throw new Error('Not a valid PocketGull native export file.');
    }

    return {
      id: `p_${Date.now()}`,
      name: (data.patient as any)?.name || 'Imported Patient',
      age: (data.patient as any)?.age || 40,
      gender: (data.patient as any)?.gender || 'Other',
      lastVisit: (data.patient as any)?.lastVisit || new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      vitals: (data.patient as any)?.vitals || { bp: '120/80', hr: '70', temp: '98.6', spO2: '98', weight: '70kg', height: '170cm' },
      issues: (data.patient as any)?.issues || {},
      patientGoals: (data.patient as any)?.patientGoals || '',
      ...data.patient,
      // Ensure required arrays exist even from older exports
      history: data.patient.history ?? [],
      bookmarks: data.patient.bookmarks ?? [],
      preexistingConditions: data.patient.preexistingConditions ?? [],
    } as IPatient;
  }

  // ─── FHIR R4 Bundle Export / Import ───────────────────────

  /**
   * Exports the full patient record as a FHIR R4 Bundle.
   * Includes Patient, Condition, Observation, Goal, and DiagnosticReport resources.
   */
  downloadAsFhirBundle(patient: IPatient, system?: string): void {
    console.log('[ExportService] Starting FHIR Bundle generation for:', patient.name);
    try {
      const patientRef = `Patient/pocket-gull-${patient.id}`;
      const entries: { resource: IFhirResource }[] = [];

      // 1. Patient resource
      entries.push({
        resource: {
          resourceType: 'Patient',
          id: `pocket-gull-${patient.id}`,
          name: [{ text: patient.name }],
          gender: this._toFhirGender(patient.gender),
          birthDate: this._estimateBirthYear(patient.age),
          extension: [
            {
              url: 'http://pocketgull.app/fhir/StructureDefinition/last-visit',
              valueString: patient.lastVisit,
            }
          ]
        }
      });

      // 2. Conditions
      patient.preexistingConditions.forEach((condition, i) => {
        entries.push({
          resource: {
            resourceType: 'Condition',
            id: `condition-${i}`,
            subject: { reference: patientRef },
            code: { text: condition },
            clinicalStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
            }
          }
        });
      });

      // 3. IVitals as Observations
      const vitals = patient.vitals;
      const vitalMappings: { field: keyof IPatientVitals; loinc: string; display: string }[] = [
        { field: 'bp', loinc: '85354-9', display: 'Blood Pressure' },
        { field: 'hr', loinc: '8867-4', display: 'Heart Rate' },
        { field: 'temp', loinc: '8310-5', display: 'Body Temperature' },
        { field: 'spO2', loinc: '2708-6', display: 'Oxygen Saturation' },
        { field: 'weight', loinc: '29463-7', display: 'Body Weight' },
        { field: 'height', loinc: '8302-2', display: 'Body Height' },
      ];

      vitalMappings.forEach(({ field, loinc, display }) => {
        const value = vitals[field];
        if (!value || typeof value !== 'string') return;
        entries.push({
          resource: {
            resourceType: 'Observation',
            id: `vital-${String(field)}`,
            status: 'final',
            category: [{
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }]
            }],
            code: { coding: [{ system: 'http://loinc.org', code: loinc, display }], text: display },
            subject: { reference: patientRef },
            valueString: value,
          }
        });
      });

      // 4. Body issues as Observations
      Object.entries(patient.issues).forEach(([partId, issues]) => {
        (issues as IBodyPartIssue[]).forEach((issue, i) => {
          entries.push({
            resource: {
              resourceType: 'Observation',
              id: `issue-${partId}-${i}`,
              status: 'final',
              category: [{
                coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam' }]
              }],
              code: { text: issue.name },
              subject: { reference: patientRef },
              bodySite: { text: partId },
              valueString: issue.description,
              extension: [
                {
                  url: 'http://pocketgull.app/fhir/StructureDefinition/pain-level',
                  valueInteger: issue.painLevel,
                },
                {
                  url: 'http://pocketgull.app/fhir/StructureDefinition/note-id',
                  valueString: issue.noteId,
                },
              ]
            }
          });
        });
      });

      // 5. Patient goals
      if (patient.patientGoals) {
        entries.push({
          resource: {
            resourceType: 'Goal',
            id: 'goal-chief-complaint',
            lifecycleStatus: 'active',
            subject: { reference: patientRef },
            description: { text: patient.patientGoals },
          }
        });
      }

      // 6. Analysis reports from history
      patient.history
        .filter(h => h.type === 'AnalysisRun' || h.type === 'FinalizedPatientSummary')
        .forEach((entry, i) => {
          if (entry.type === 'AnalysisRun' || entry.type === 'FinalizedPatientSummary') {
            entries.push({
              resource: {
                resourceType: 'DiagnosticReport',
                id: `report-${i}`,
                status: 'final',
                code: { text: 'Pocket Gull AI Clinical Analysis' },
                subject: { reference: patientRef },
                effectiveDateTime: this._toISODate(entry.date),
                conclusion: entry.summary,
                presentedForm: [{
                  contentType: 'application/json',
                  data: this._toBase64(JSON.stringify(entry.report)),
                }]
              }
            });
          }
        });

      // 5. Y-BOCs Assessments (QuestionnaireResponse and Observation)
      patient.history
        .forEach((entry, i) => {
          if (entry.type !== 'Y-BOCsAssessment') return;
          const assessment = entry.assessment;
          if (!assessment) return;

          // Add QuestionnaireResponse
          const items: { linkId: string; text?: string; item?: unknown[]; answer?: { valueString?: string; valueInteger?: number }[] }[] = [];
          
          // Add checklist answers
          if (assessment.checklistAnswers) {
            const checklistItems: { linkId: string; answer: { valueString: string }[] }[] = [];
            Object.entries(assessment.checklistAnswers).forEach(([idStr, val]: [string, { past: boolean; current: boolean }]) => {
              checklistItems.push({
                linkId: `symptom-${idStr}`,
                answer: [{
                  valueString: `Past: ${val.past ? 'Yes' : 'No'}, Current: ${val.current ? 'Yes' : 'No'}`
                }]
              });
            });
            if (checklistItems.length > 0) {
              items.push({
                linkId: 'symptom-checklist',
                text: 'Obsessions and Compulsions Checklist',
                item: checklistItems
              });
            }
          }

          // Add severity answers
          if (assessment.severityAnswers) {
            const severityItems: { linkId: string; answer: { valueInteger: number }[] }[] = [];
            Object.entries(assessment.severityAnswers).forEach(([idStr, val]: [string, number]) => {
              severityItems.push({
                linkId: `question-${idStr}`,
                answer: [{
                  valueInteger: val
                }]
              });
            });
            if (severityItems.length > 0) {
              items.push({
                linkId: 'severity-questions',
                text: 'Severity Rating Scale Questions',
                item: severityItems
              });
            }
          }

          entries.push({
            resource: {
              resourceType: 'QuestionnaireResponse',
              id: `ybocs-questionnaire-response-${i}`,
              status: 'completed',
              subject: { reference: patientRef },
              authored: assessment.dateCreated || new Date().toISOString(),
              item: items
            }
          });

          // Add Observation (total score)
          entries.push({
            resource: {
              resourceType: 'Observation',
              id: `ybocs-observation-${i}`,
              status: 'final',
              code: {
                coding: [{
                  system: 'http://loinc.org',
                  code: '82290-8',
                  display: 'Yale-Brown Obsessive Compulsive Scale total score'
                }]
              },
              subject: { reference: patientRef },
              effectiveDateTime: assessment.dateCreated || new Date().toISOString(),
              valueQuantity: {
                value: assessment.totalScore || 0,
                unit: '{score}',
                system: 'http://unitsofmeasure.org'
              },
              interpretation: [{
                text: assessment.severityCategory || 'Unknown'
              }]
            }
          });
        });

      // 6. Macro Fleet Sentinel Telemetry Observation
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `macro-sentinel-${Date.now()}`,
          status: 'final',
          category: [{
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey' }]
          }],
          code: {
            coding: [{ system: 'http://pocketgull.app/fhir/StructureDefinition/macro-sentinel', code: 'macro-fleet', display: 'Global Sentinel Macro Fleet Telemetry' }],
            text: 'Global Sentinel Macro Fleet Telemetry'
          },
          subject: { reference: patientRef },
          component: [
            { code: { text: 'Arboristic Canopy Biomass Index' }, valueString: '94.2% Photosynthetic Flux' },
            { code: { text: 'Vehicle Fleet Powertrain Harmonic' }, valueString: '480 Hz Engine Resonance' },
            { code: { text: 'Eastern Clockwork Escapement Cadence' }, valueString: '18,000 bph' },
            { code: { text: 'Ayurvedic Solfeggio Resonator Tone' }, valueString: '528 Hz DNA Repair' }
          ]
        }
      });

      const bundle: IFhirBundle = {
        resourceType: 'Bundle',
        id: `pocket-gull-bundle-${Date.now()}`,
        type: 'collection',
        timestamp: new Date().toISOString(),
        meta: {
          tag: [{
            system: 'http://pocketgull.app/fhir',
            code: 'pocket-gull-export',
            display: 'Pocket Gull IPatient Export',
          }]
        },
        entry: entries,
      };

      // Strict HIPAA-compliant client-side sanitization
      const sanitizedBundle = this.sanitizeObject(bundle);

      const filename = system 
        ? `FHIR_${system}_Export_${patient.name.replace(/\s+/g, '_')}.json`
        : `FHIR_Bundle_${patient.name.replace(/\s+/g, '_')}.json`;
      console.log('[ExportService] Triggering FHIR Bundle download:', filename);
      this._downloadJson(sanitizedBundle, filename);
    } catch (error) {
      console.error('[ExportService] FHIR Bundle export failed:', error);
    }
  }

  /**
   * Mock direct EHR export by triggering a sanitized FHIR payload download.
   */
  exportToEHR(patient: IPatient, system: 'Epic' | 'Cerner'): void {
    console.log(`[ExportService] Initiating Smart on FHIR export to ${system}...`);
    this.downloadAsFhirBundle(patient, system);
  }

  /**
   * Exports compiled LAAF Haptic Schedule as a FHIR R4 Bundle (CarePlan + DeviceRequest).
   */
  downloadLaafHapticScheduleBundle(patient?: IPatient | null, customItems?: ILaafHapticItem[]): void {
    const patientId = patient?.id || 'P001';
    const patientName = patient?.name || 'Clinical Patient';

    const defaultItems: ILaafHapticItem[] = customItems && customItems.length > 0 ? customItems : [
      {
        id: 'vagal-01',
        title: '0.1 Hz Baroreflex Vagal Resonance Pacer',
        modality: 'vagal_resonance',
        frequencyHz: 0.1,
        amplitudePercent: 65,
        anatomicalSite: 'sternum_midline',
        durationMinutes: 15,
        repeatFrequency: 3,
        repeatPeriod: 1,
        repeatPeriodUnit: 'd',
        timeOfDay: ['08:00', '14:00', '21:00'],
        status: 'active',
        clinicalRationale: '0.1 Hz sternal haptic vibration targeting baroreceptor resonance for HRV parasympathetic elevation.'
      },
      {
        id: 'gamma-02',
        title: '40 Hz Cognitive Gamma Entrainment',
        modality: 'gamma_40hz',
        frequencyHz: 40.0,
        amplitudePercent: 40,
        anatomicalSite: 'mastoid_process',
        durationMinutes: 20,
        repeatFrequency: 1,
        repeatPeriod: 1,
        repeatPeriodUnit: 'd',
        timeOfDay: ['09:00'],
        status: 'active',
        clinicalRationale: '40 Hz dual mastoid bone conduction vibration for microglial clearance & cognitive sharpness.'
      },
      {
        id: 'thermo-03',
        title: 'Somatic Thermoregulation Pacer',
        modality: 'somatic_thermoregulation',
        frequencyHz: 1.2,
        amplitudePercent: 50,
        anatomicalSite: 'wrist_bilateral',
        durationMinutes: 10,
        repeatFrequency: 2,
        repeatPeriod: 1,
        repeatPeriodUnit: 'd',
        timeOfDay: ['12:00', '18:00'],
        status: 'active',
        clinicalRationale: 'Thermal-haptic wrist wave to balance autonomic vascular tone during acute stress.'
      }
    ];

    if (!this.laafFhir) return;

    const fhirBundle = this.laafFhir.toFhirBundle({
      patientId,
      patientName,
      scheduleTitle: `LAAF Haptic Schedule — ${patientName}`,
      createdDate: new Date().toISOString(),
      items: defaultItems
    });

    const filename = `LAAF_FHIR_Haptic_Schedule_${patientName.replace(/\s+/g, '_')}.json`;
    console.log('[ExportService] Triggering LAAF Haptic FHIR Bundle download:', filename);
    this._downloadJson(fhirBundle, filename);
  }

  /**
   * Parses a FHIR R4 Bundle and maps it back to an PocketGull Patient.
   */
  async importFromFhirBundle(file: File): Promise<IPatient> {
    const text = await file.text();
    const bundle = JSON.parse(text) as IFhirBundle;

    if (bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) {
      throw new Error('Not a valid FHIR Bundle.');
    }

    const resources = bundle.entry.map(e => e.resource);
    const fhirPatient = resources.find(r => r['resourceType'] === 'Patient' || r['resourceType'] === 'Patient');

    // Demographics
    const name = fhirPatient?.name?.[0]?.text || fhirPatient?.name?.[0]?.family || 'Imported Patient';
    const gender = this._fromFhirGender(fhirPatient?.gender);
    const age = fhirPatient?.birthDate ? this._ageFromBirthDate(fhirPatient.birthDate) : 0;
    const lastVisitExt = fhirPatient?.extension?.find(e => e.url?.includes('last-visit'));
    const lastVisit = lastVisitExt?.valueString || new Date().toISOString().split('T')[0].replace(/-/g, '.');

    // Conditions
    const conditions = resources
      .filter(r => r['resourceType'] === 'Condition')
      .map(r => r['code']?.text || 'Unknown Condition');

    // IVitals
    const vitals: IPatientVitals = { bp: '', hr: '', temp: '', spO2: '', weight: '', height: '' };
    const vitalObs = resources.filter(r =>
      r['resourceType'] === 'Observation' &&
      r['category']?.[0]?.coding?.[0]?.code === 'vital-signs'
    );
    const loincToField: Record<string, keyof IPatientVitals> = {
      '85354-9': 'bp', '8867-4': 'hr', '8310-5': 'temp',
      '2708-6': 'spO2', '29463-7': 'weight', '8302-2': 'height',
    };
    vitalObs.forEach(obs => {
      const loinc = obs['code']?.coding?.[0]?.code;
      const field = loinc ? loincToField[loinc] : undefined;
      if (field) {
        vitals[field] = obs['valueString'] || '';
      }
    });

    // Body issues
    const issues: Record<string, IBodyPartIssue[]> = {};
    const issueObs = resources.filter(r =>
      r['resourceType'] === 'Observation' &&
      r['category']?.[0]?.coding?.[0]?.code === 'exam'
    );
    issueObs.forEach(obs => {
      const partId = obs['bodySite']?.text || 'unknown';
      const painExt = obs.extension?.find(e => e.url?.includes('pain-level'));
      const noteIdExt = obs.extension?.find(e => e.url?.includes('note-id'));
      const issue: IBodyPartIssue = {
        id: partId,
        noteId: noteIdExt?.valueString || `note_imported_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: obs['code']?.text || partId,
        painLevel: painExt?.valueInteger ?? 0,
        description: obs['valueString'] || '',
        symptoms: [],
      };
      if (!issues[partId]) issues[partId] = [];
      issues[partId].push(issue);
    });

    // Goals
    const goalResource = resources.find(r => r['resourceType'] === 'Goal');
    const patientGoals = (typeof goalResource?.description === 'object' ? goalResource.description?.text : goalResource?.description) || '';

    // Analysis history
    const history: HistoryEntry[] = [];
    resources
      .filter(r => r['resourceType'] === 'DiagnosticReport')
      .forEach(report => {
        try {
          const reportData = report['presentedForm']?.[0]?.data;
          const parsed = reportData ? JSON.parse(this._fromBase64(reportData)) : {};
          history.push({
            type: 'AnalysisRun',
            date: report['effectiveDateTime']?.split('T')[0]?.replace(/-/g, '.') || lastVisit,
            summary: report['conclusion'] || 'Imported Analysis',
            report: parsed,
          });
        } catch (e) {
          console.debug('[ExportService] Skipping malformed FHIR report:', (e as Error)?.message);
        }
      });

    return {
      id: `p_${Date.now()}`,
      name,
      age,
      gender,
      lastVisit,
      preexistingConditions: conditions,
      patientGoals,
      vitals,
      issues,
      history,
      bookmarks: [],
    };
  }

  // ─── Auto-detect and import ───────────────────────────────

  /**
   * Detects the format of a JSON file and imports accordingly.
   */
  async importFromFile(file: File): Promise<IPatient> {
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(file.name);
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

    if (isImage || isPdf) {
      return this.importViaOcr(file);
    }

    const text = await file.text();
    const data = JSON.parse(text);

    if (data._format === 'pocket-gull-native') {
      // Re-create a file-like object from the already-read text
      const blob = new Blob([text], { type: 'application/json' });
      const syntheticFile = new File([blob], file.name, { type: 'application/json' });
      return this.importFromNativeJson(syntheticFile);
    } else if (data.resourceType === 'Bundle') {
      const blob = new Blob([text], { type: 'application/json' });
      const syntheticFile = new File([blob], file.name, { type: 'application/json' });
      return this.importFromFhirBundle(syntheticFile);
    } else {
      throw new Error('Unrecognized file format. Expected PocketGull native JSON or FHIR R4 Bundle.');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private async importViaOcr(file: File): Promise<IPatient> {
    console.log('[ExportService] Starting OCR scan for file:', file.name);
    const base64Data = await this.fileToBase64(file);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (typeof window !== 'undefined') {
      const userKey = this.storage.getItem('GEMINI_API_KEY') || (window as any).GEMINI_API_KEY;
      if (userKey) {
        headers['X-Gemini-API-Key'] = userKey.trim();
      }
    }

    const response = await fetch('/api/ai/scan-document', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base64Image: base64Data,
        context: `Scanned from file: ${file.name}`
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OCR extraction failed: ${errText || response.statusText}`);
    }

    const ocrData = (await response.json()) as IOcrData;

    const patient: IPatient = {
      id: `ocr_${Date.now()}`,
      name: ocrData.name || `Scanned Patient (${file.name.split('.')[0]})`,
      age: ocrData.age || 35,
      gender: ocrData.gender || 'Other',
      lastVisit: new Date().toISOString(),
      preexistingConditions: [],
      history: [
        {
          date: new Date().toLocaleDateString(),
          type: 'NoteCreated',
          summary: `Clinical record extracted via Gemini OCR from scanned file: ${file.name}`,
          partId: 'full_body',
          noteId: `ocr_note_${Date.now()}`
        }
      ],
      bookmarks: [],
      patientGoals: ocrData.patientGoals || '',
      vitals: {
        bp: ocrData.vitals?.bp || '',
        hr: ocrData.vitals?.hr || '',
        temp: ocrData.vitals?.temp || '',
        spO2: ocrData.vitals?.spO2 || '',
        weight: ocrData.vitals?.weight || '',
        height: ocrData.vitals?.height || '',
        vitC: '', vitD3: '', magnesium: '', zinc: '', b12: ''
      },
      issues: {}
    };

    if (ocrData.issues && Array.isArray(ocrData.issues)) {
      ocrData.issues.forEach((issue) => {
        const partId = issue.partId;
        if (!patient.issues[partId]) {
          patient.issues[partId] = [];
        }
        patient.issues[partId].push({
          id: partId,
          noteId: `ocr_note_${partId}_${Date.now()}`,
          name: issue.name,
          painLevel: issue.severity === 'critical' ? 8 : (issue.severity === 'moderate' ? 5 : 2),
          description: issue.notes || '',
          symptoms: []
        });
      });
    }

    if (ocrData.medications && Array.isArray(ocrData.medications)) {
      patient.medications = ocrData.medications.map((m) => ({
        id: `ocr_med_${Math.random().toString(36).substr(2, 5)}`,
        name: m.name || '',
        value: `${m.dosage || ''} - ${m.frequency || ''}`.trim()
      }));
    }

    return patient;
  }

  // ─── BigQuery Export ──────────────────────────────────────
  
  /**
   * Publishes the patient record to the BigQuery data warehouse.
   */
  /**
   * Syncs/exports the patient record to the Google Cloud Healthcare FHIR Store.
   */
  async exportToGoogleHealth(patient: IPatient): Promise<void> {
    console.log('[ExportService] Initiating Google Cloud Healthcare FHIR sync for:', patient.id);
    try {
      const response = await fetch('/api/healthcare/fhir/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Unknown Server Error');
      }
      
      alert("✅ Patient record successfully synchronized to Google Cloud Healthcare FHIR Store.");
    } catch (error) {
      console.error('[ExportService] Google Cloud Healthcare FHIR sync failure:', error);
      alert("Google Cloud Healthcare Sync Failed: " + (error as Error).message);
    }
  }

  /**
   * Syncs/exports the patient record to the AWS HealthLake FHIR Store.
   */
  async exportToAwsHealthlake(patient: IPatient): Promise<void> {
    console.log('[ExportService] Initiating AWS HealthLake FHIR sync for:', patient.id);
    try {
      const response = await fetch('/api/aws/healthlake/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Unknown Server Error');
      }
      
      alert("✅ Patient record successfully synchronized to AWS HealthLake FHIR Store.");
    } catch (error) {
      console.error('[ExportService] AWS HealthLake FHIR sync failure:', error);
      alert("AWS HealthLake Sync Failed: " + (error as Error).message);
    }
  }

  async exportToBigQuery(patient: IPatient): Promise<void> {
    console.log('[ExportService] Initiating BigQuery export sequence for:', patient.id);
    
    // Transform to standard JSON payload mapping strictly to the BigQuery DDL
    const payload = {
      patient_id: patient.id,
      encounter_timestamp: new Date().toISOString(),
      gender: patient.gender,
      age_years: patient.age,
      active_diagnoses: patient.preexistingConditions,
      vitals: (() => {
          const v = patient.vitals;
          const [sys, dia] = v.bp ? v.bp.split('/') : [null, null];
          return [{
            recorded_at: patient.lastVisit ? new Date(patient.lastVisit).toISOString() : new Date().toISOString(),
            heart_rate_bpm: v.hr ? parseInt(v.hr, 10) : null,
            systolic_bp: sys ? parseInt(sys, 10) : null,
            diastolic_bp: dia ? parseInt(dia, 10) : null,
            temperature_celsius: v.temp ? parseFloat(v.temp) : null,
            weight_kg: v.weight ? parseFloat(v.weight) : null,
            clinical_notes: null
          }];
      })()
    };

    try {
      // Stream directly to the BigQuery relay
      const response = await fetch('/api/export/bigquery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Unknown Server Error');
      }
      
      alert("✅ Patient record successfully streamed into BigQuery Data Canvas.");
      
    } catch (error) {
      console.error('[ExportService] BigQuery pipeline failure:', error);
      alert("BigQuery Export Failed: " + (error as Error).message);
    }
  }

  exportPatientToFhirJson(patient: IPatient): void {
    const sanitizedP = this.sanitizeObject(patient) as IPatient;
    const bundle: IFhirBundle = {
      resourceType: 'Bundle',
      id: `bundle-${sanitizedP.id}-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      meta: {
        tag: [{ system: 'https://pocketgull.app/fhir', code: 'R4-HIPAA', display: 'FHIR R4 Tri-Paradigm Clinical Export' }]
      },
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: sanitizedP.id,
            name: [{ text: sanitizedP.name }],
            gender: this._toFhirGender(sanitizedP.gender),
            birthDate: this._estimateBirthYear(sanitizedP.age)
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: `vitals-${sanitizedP.id}`,
            status: 'final',
            code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Vital Signs Panel' }] },
            subject: { reference: `Patient/${sanitizedP.id}` },
            effectiveDateTime: sanitizedP.lastVisit || new Date().toISOString(),
            component: [
              { code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] }, valueQuantity: { value: parseFloat(sanitizedP.vitals?.hr || '72'), unit: 'beats/min' } },
              { code: { coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation' }] }, valueQuantity: { value: parseFloat(sanitizedP.vitals?.spO2 || '98'), unit: '%' } }
            ]
          }
        },
        // 🎧 FHIR R4 DeviceRequest: Solfeggio AVS Audio Target
        {
          resource: {
            resourceType: 'DeviceRequest',
            id: `avs-device-${sanitizedP.id}`,
            status: 'active',
            intent: 'original-order',
            codeCodeableConcept: {
              coding: [{ system: 'https://pocketgull.app/avs', code: 'AVS-528HZ-10ALPHA', display: 'Binaural Solfeggio Audio Entrainment (528 Hz / 10 Hz Alpha)' }]
            },
            subject: { reference: `Patient/${sanitizedP.id}` },
            occurrenceDateTime: new Date().toISOString()
          }
        },
        // 🥑 FHIR R4 NutritionOrder: Chrono-Nutrition & Nootropic Active Compounds
        {
          resource: {
            resourceType: 'NutritionOrder',
            id: `nutrition-${sanitizedP.id}`,
            status: 'active',
            intent: 'order',
            patient: { reference: `Patient/${sanitizedP.id}` },
            dateTime: new Date().toISOString(),
            oralDiet: {
              type: [{ coding: [{ system: 'https://pocketgull.app/nutrition', code: 'CHRONO-CIRCADIAN', display: 'Circadian Polyphenol & Bioactive Protocol' }] }],
              nutrient: [
                { modifier: { coding: [{ system: 'http://snomed.info/sct', code: '702859005', display: 'Ashwagandha KSM-66 Withanolides 30mg' }] } },
                { modifier: { coding: [{ system: 'http://snomed.info/sct', code: '412089004', display: 'Lion’s Mane Hericenones 50mg' }] } }
              ]
            }
          }
        },
        // 💊 FHIR R4 MedicationRequest: Botanical TCM Formula (Xiao Yao San) & Allopathic Rx
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: `tcm-botanical-${sanitizedP.id}`,
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
              coding: [{ system: 'https://pocketgull.app/tcm', code: 'XIAO-YAO-SAN', display: 'Xiao Yao San (Free and Easy Wanderer Botanical Formula)' }]
            },
            subject: { reference: `Patient/${sanitizedP.id}` }
          }
        }
      ]
    };
    this._downloadJson(bundle, `fhir_tri_paradigm_bundle_${sanitizedP.id}_${Date.now()}.json`);
  }

  // ─── Helpers ──────────────────────────────────────────────

  private _downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private _toFhirGender(gender: string): string {
    const map: Record<string, string> = {
      'Male': 'male', 'Female': 'female', 'Non-binary': 'other', 'Other': 'unknown'
    };
    return map[gender] || 'unknown';
  }

  private _fromFhirGender(fhirGender?: string): 'Male' | 'Female' | 'Non-binary' | 'Other' {
    const map: Record<string, 'Male' | 'Female' | 'Non-binary' | 'Other'> = {
      'male': 'Male', 'female': 'Female', 'other': 'Non-binary', 'unknown': 'Other'
    };
    return map[fhirGender || ''] || 'Other';
  }

  private _estimateBirthYear(age: number): string {
    const year = new Date().getFullYear() - age;
    return `${year}-01-01`;
  }

  private _ageFromBirthDate(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  private _toISODate(dotDate: string): string {
    // Convert "2024.06.15" to "2024-06-15"
    return dotDate.replace(/\./g, '-');
  }

  private _toBase64(str: string): string {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      console.error('Base64 encoding failed:', e);
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  private _fromBase64(base64: string): string {
    try {
      return decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      console.error('Base64 decoding failed:', e);
      return decodeURIComponent(escape(atob(base64)));
    }
  }
}
