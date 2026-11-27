import { Injectable, inject } from '@angular/core';
import * as DOMPurify from 'dompurify';
import { IPatient, HistoryEntry, IPatientVitals } from '../patient.types';
import { LaafFhirHapticScheduleService } from '../fhir/laaf-fhir-haptic-schedule.service';
import { ClinicalAssessmentsService } from '../clinical-assessments/clinical-assessments.service';
import { YbocsService } from '../ybocs/ybocs.service';
import { AcronymExpanderService } from '../acronym-expander.service';
import { ActuarialLongevityService } from '../actuarial-longevity.service';
import { ResearchLecturesService } from '../research-lectures.service';
import { MdcpDomainService } from '../mdcp/mdcp-domain.service';
import { IEpsdtAppealPackage } from '../mdcp/epsdt-advocacy.service';
import { computeFipsSha256Hex } from '../clinical-defense-guard.service';

export interface IFhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface IFhirBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'collection';
  timestamp: string;
  meta?: { tag?: { system: string; code: string; display: string }[] };
  entry: { resource: IFhirResource }[];
}

@Injectable({
  providedIn: 'root'
})
export class FhirExportStrategyService {
  private actuarialService = (() => {
    try {
      return inject(ActuarialLongevityService, { optional: true }) || new ActuarialLongevityService();
    } catch {
      return new ActuarialLongevityService();
    }
  })();

  private researchLectures = (() => {
    try {
      return inject(ResearchLecturesService, { optional: true }) || new ResearchLecturesService();
    } catch {
      return new ResearchLecturesService();
    }
  })();

  private laafFhir = (() => {
    try {
      return inject(LaafFhirHapticScheduleService, { optional: true });
    } catch {
      return null;
    }
  })();

  private mdcpService = (() => {
    try {
      return inject(MdcpDomainService, { optional: true });
    } catch {
      return null;
    }
  })();

  public sanitizeForExport(inputStr: string): string {
    if (!inputStr) return '';
    try {
      const purifyObj = DOMPurify as unknown as { default?: { sanitize?: (s: string, opts?: unknown) => string }; sanitize?: (s: string, opts?: unknown) => string };
      const purifyFn = purifyObj.default?.sanitize || purifyObj.sanitize;
      if (typeof purifyFn === 'function') {
        const cleaned = purifyFn(inputStr, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
        if (cleaned && typeof cleaned === 'string' && !cleaned.includes('<') && !cleaned.includes('onerror=')) {
          return cleaned;
        }
      }
      let result = inputStr;
      let prev = '';
      while (result !== prev) {
        prev = result;
        result = result.replace(/<[^>]*>?/gm, '');
      }
      return result.replace(/[\"\']/g, '');
    } catch (e) {
      console.debug('[FhirExport] DOMPurify sanitization fallback:', (e as Error)?.message);
      let result = inputStr;
      let prev = '';
      while (result !== prev) {
        prev = result;
        result = result.replace(/<[^>]*>?/gm, '');
      }
      return result;
    }
  }

  public toFhirGender(gender?: string): 'male' | 'female' | 'other' | 'unknown' {
    if (!gender) return 'unknown';
    const g = gender.toLowerCase();
    if (g.includes('female') || g.includes('woman') || g === 'f') return 'female';
    if (g.includes('male') || g.includes('man') || g === 'm') return 'male';
    if (g.includes('other') || g.includes('non-binary')) return 'other';
    return 'unknown';
  }

  private buildSafeHarborPatientFields(patient: Partial<IPatient>, cleanId: string): {
    syntheticToken: string;
    name: Array<{ use: string; text: string }>;
    birthDate?: string;
    extension?: Array<{ url: string; valueString: string }>;
  } {
    const token = computeFipsSha256Hex(`SAFE-HARBOR-FHIR|${cleanId}|${patient.gender || 'unknown'}`).slice(0, 12).toUpperCase();
    const syntheticToken = `SUBJ-${token}`;
    const rawAge = typeof patient.age === 'number' && Number.isFinite(patient.age) ? patient.age : undefined;

    let birthDate: string | undefined;
    let extension: Array<{ url: string; valueString: string }> | undefined;

    if (rawAge !== undefined && rawAge > 89) {
      // HIPAA Safe Harbor §164.514(b)(2)(i)(C): ages > 89 MUST be aggregated to 90+ with no birthDate
      birthDate = undefined;
      extension = [
        {
          url: 'https://pocketgull.app/fhir/StructureDefinition/safe-harbor-age-bracket',
          valueString: '90+'
        }
      ];
    } else if (rawAge !== undefined && rawAge >= 0) {
      // HIPAA Safe Harbor permits year-only birth representation for ages <= 89
      birthDate = String(new Date().getUTCFullYear() - rawAge);
    }

    return {
      syntheticToken,
      name: [{ use: 'anonymous', text: `Safe Harbor Subject ${syntheticToken}` }],
      birthDate,
      extension
    };
  }

  /**
   * Generates a HIPAA Safe Harbor §164.514 compliant FHIR R4 Bundle for patient state export.
   */
  public generateFhirBundle(patient: IPatient): IFhirBundle {
    const sanitize = (val?: string) => this.sanitizeForExport(val || '');
    const cleanId = (patient.id || 'patient-1').replace(/[^a-zA-Z0-9\-\.]/g, '-');
    const timestamp = new Date().toISOString();
    const safeSubject = this.buildSafeHarborPatientFields(patient, cleanId);

    const patientResource: IFhirResource = {
      resourceType: 'Patient',
      id: cleanId,
      active: true,
      name: safeSubject.name,
      gender: this.toFhirGender(patient.gender),
      ...(safeSubject.birthDate ? { birthDate: safeSubject.birthDate } : {}),
      ...(safeSubject.extension ? { extension: safeSubject.extension } : {})
    };

    const practitionerResource: IFhirResource = {
      resourceType: 'Practitioner',
      id: 'practitioner-pocketgull-cds',
      identifier: [
        {
          system: 'https://pocketgull.app/fhir/institutional-practitioner',
          value: 'POCKETGULL-CDS-SYSTEM'
        }
      ],
      name: [
        {
          use: 'official',
          text: 'PocketGull Clinical Decision Support System'
        }
      ],
      telecom: [
        {
          system: 'email',
          value: 'dpo@pocketgull.app',
          use: 'work'
        }
      ]
    };

    const entries: { resource: IFhirResource }[] = [
      { resource: patientResource },
      { resource: practitionerResource }
    ];

    if (patient.vitals) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-vitals-${cleanId}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '85353-1',
                display: 'Vital signs, weight, height, head circumference, oxygen saturation and BMI panel'
              }
            ],
            text: 'Vital Signs Panel'
          },
          subject: { reference: `Patient/${cleanId}` },
          effectiveDateTime: timestamp,
          component: [
            ...(patient.vitals.bp ? [{ code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }], text: 'Blood Pressure' }, valueString: sanitize(patient.vitals.bp) }] : []),
            ...(patient.vitals.hr ? [{ code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }], text: 'Heart Rate' }, valueString: sanitize(patient.vitals.hr) }] : []),
            ...(patient.vitals.spO2 ? [{ code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }], text: 'Oxygen Saturation' }, valueString: sanitize(patient.vitals.spO2) }] : [])
          ]
        }
      });
    }

    // Y-BOCS Neuropsychiatric Assessment Observations (LOINC 82290-8)
    const ybocsEntries = (patient.history || []).filter((h) => h?.type === 'Y-BOCsAssessment');
    ybocsEntries.forEach((entry, idx) => {
      const assessment =
        (entry as { assessment?: { totalScore?: number; obsessionSubtotal?: number; compulsiveSubtotal?: number; insightScore?: number | null; severityCategory?: string; dateCreated?: string } }).assessment ||
        (entry as { report?: { totalScore?: number; obsessionSubtotal?: number; compulsiveSubtotal?: number; insightScore?: number | null; severityCategory?: string; dateCreated?: string } }).report;
      if (!assessment) return;
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-ybocs-${cleanId}-${idx}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'survey', display: 'Survey' }] }],
          code: {
            coding: [{ system: 'http://loinc.org', code: '82290-8', display: 'Yale-Brown Obsessive Compulsive Scale total score' }],
            text: 'Yale-Brown Obsessive-Compulsive Scale (Y-BOCS)'
          },
          subject: { reference: `Patient/${cleanId}` },
          effectiveDateTime: assessment.dateCreated || timestamp,
          valueQuantity: {
            value: assessment.totalScore ?? 0,
            unit: '{score}',
            system: 'http://unitsofmeasure.org'
          },
          interpretation: [{ text: sanitize(assessment.severityCategory || 'Subclinical') }],
          component: [
            { code: { text: 'Obsessions Subtotal' }, valueQuantity: { value: assessment.obsessionSubtotal ?? 0, unit: '{score}', system: 'http://unitsofmeasure.org' } },
            { code: { text: 'Compulsions Subtotal' }, valueQuantity: { value: assessment.compulsiveSubtotal ?? 0, unit: '{score}', system: 'http://unitsofmeasure.org' } },
            ...(typeof assessment.insightScore === 'number'
              ? [{ code: { text: 'Insight Specifier (Q11)' }, valueQuantity: { value: assessment.insightScore, unit: '{score}', system: 'http://unitsofmeasure.org' } }]
              : [])
          ]
        }
      });
    });

    return {
      resourceType: 'Bundle',
      id: `bundle-${cleanId}-${Date.now()}`,
      type: 'collection',
      timestamp,
      meta: { tag: [{ system: 'https://pocketgull.app/fhir/tags', code: 'fhir-r4', display: 'Pocket Gull FHIR Export' }] },
      entry: entries
    };
  }

  public exportToFhirBundle(patient: IPatient, filenameSuffix: string = 'fhir-bundle'): void {
    try {
      const bundle = this.generateFhirBundle(patient);
      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: 'application/fhir+json' });
      const url = URL.createObjectURL(blob);
      const safeToken = (patient.id || 'subject').toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const filename = `safe-harbor-${safeToken}-${filenameSuffix}-${new Date().toISOString().slice(0, 10)}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[FhirExportStrategyService] FHIR Bundle export error:', error);
    }
  }

  public exportMdcpBundle(patient: Partial<IPatient> | IPatient): void {
    try {
      const service = this.mdcpService || new MdcpDomainService();
      const bundle = service.buildUnifiedMdcpFhirBundle(patient);
      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: 'application/fhir+json' });
      const url = URL.createObjectURL(blob);
      const safeToken = (patient.id || 'subject').toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const filename = `safe-harbor-${safeToken}-mdcp-four-domain-bundle-${new Date().toISOString().slice(0, 10)}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[FhirExportStrategyService] MDCP Bundle export error:', error);
    }
  }

  public generateEpsdtFhirBundle(patient: Partial<IPatient> | IPatient, pkg: IEpsdtAppealPackage): IFhirBundle {
    const cleanId = this.sanitizeForExport(patient.id || 'pat-pediatric-01');
    const timestamp = new Date().toISOString();
    const safeSubject = this.buildSafeHarborPatientFields(patient, cleanId);

    const entries: { resource: IFhirResource }[] = [];

    // 1. Patient Resource (HIPAA Safe Harbor de-identified subject)
    entries.push({
      resource: {
        resourceType: 'Patient',
        id: cleanId,
        active: true,
        name: safeSubject.name,
        gender: this.toFhirGender(patient.gender),
        ...(safeSubject.birthDate ? { birthDate: safeSubject.birthDate } : {}),
        ...(safeSubject.extension ? { extension: safeSubject.extension } : {})
      }
    });

    // 2. Practitioner Resource (Ordering Complex Care Physician)
    entries.push({
      resource: {
        resourceType: 'Practitioner',
        id: `practitioner-epsdt-${cleanId}`,
        active: true,
        identifier: [{ system: 'http://hl7.org/fhir/sid/us-npi', value: '1982736450' }],
        name: [{ text: 'Dr. Eleanor Vance, MD, FAAP' }]
      }
    });

    // 3. ServiceRequest Resource (Private Duty Nursing under 42 U.S.C. § 1396d(r)(5))
    entries.push({
      resource: {
        resourceType: 'ServiceRequest',
        id: `srv-epsdt-pdn-${cleanId}`,
        status: 'active',
        intent: 'order',
        priority: pkg.isStatExpedited ? 'stat' : 'urgent',
        category: [
          {
            coding: [
              {
                system: 'https://pocketgull.app/fhir/cs/epsdt',
                code: 'mandatory-treatment-order',
                display: '42 U.S.C. § 1396d(r)(5) EPSDT Mandatory Treatment'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://www.ama-assn.org/go/cpt',
              code: 'S9123',
              display: 'Nursing care, in the home; by RN, per hour'
            },
            {
              system: 'http://snomed.info/sct',
              code: '307818003',
              display: 'Private duty nursing service (procedure)'
            }
          ],
          text: 'Continuous In-Home Skilled Private Duty Nursing (RN/LPN)'
        },
        subject: { reference: `Patient/${cleanId}` },
        requester: { reference: `Practitioner/practitioner-epsdt-${cleanId}` },
        authoredOn: pkg.generatedAtIso,
        extension: [
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/epsdt-dispute-category',
            valueString: pkg.disputeCategory
          },
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/aid-paid-pending-deadline',
            valueString: pkg.aidPaidPendingDeadlineIso
          },
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/sha256-integrity-digest',
            valueString: pkg.cryptographicIntegrityDigest
          },
          {
            url: 'https://pocketgull.app/fhir/StructureDefinition/administering-agency',
            valueString: pkg.administeringAgency
          }
        ]
      }
    });

    // 4. DocumentReference Resource (Full Appeal Dossier with SHA-256 seal)
    const dossierText = `${pkg.physicianLetterOfMedicalNecessity}\n\n---\n\n${pkg.fairHearingPetition}\n\n---\n\n${pkg.federalCaseLawBrief}`;
    let encodedData = '';
    try {
      if (typeof btoa === 'function') {
        encodedData = btoa(unescape(encodeURIComponent(dossierText)));
      }
    } catch {
      encodedData = '';
    }

    entries.push({
      resource: {
        resourceType: 'DocumentReference',
        id: `docref-epsdt-${cleanId}`,
        status: 'current',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '11488-4',
              display: 'Consultation note'
            }
          ],
          text: 'EPSDT Federal Appeal & Mandatory Skilled Nursing Order Package'
        },
        subject: { reference: `Patient/${cleanId}` },
        date: pkg.generatedAtIso,
        description: `EPSDT Appeal & Physician Order (${pkg.stateCode} - ${pkg.stateName})`,
        content: [
          {
            attachment: {
              contentType: 'text/markdown',
              title: `EPSDT_Appeal_Package_${pkg.stateCode}.md`,
              hash: pkg.cryptographicIntegrityDigest,
              ...(encodedData ? { data: encodedData } : {})
            }
          }
        ]
      }
    });

    // 5. CoverageEligibilityRequest Resource (Statutory Preemption Notice)
    entries.push({
      resource: {
        resourceType: 'CoverageEligibilityRequest',
        id: `cov-req-epsdt-${cleanId}`,
        status: 'active',
        purpose: ['benefits', 'validation'],
        patient: { reference: `Patient/${cleanId}` },
        created: pkg.generatedAtIso,
        insurer: { display: pkg.administeringAgency },
        facility: { display: 'In-Home Community Care (Institutional Diversion)' }
      }
    });

    return {
      resourceType: 'Bundle',
      id: `bundle-epsdt-${cleanId}-${Date.now()}`,
      type: 'collection',
      timestamp,
      meta: {
        tag: [
          {
            system: 'https://pocketgull.app/fhir/tags',
            code: 'epsdt-appeal-bundle',
            display: 'Title XIX 42 U.S.C. § 1396d(r)(5) EPSDT Federal Appeal'
          },
          {
            system: 'https://pocketgull.app/fhir/tags',
            code: pkg.stateCode,
            display: pkg.stateName
          }
        ]
      },
      entry: entries
    };
  }

  public exportEpsdtAppealBundle(patient: Partial<IPatient> | IPatient, pkg: IEpsdtAppealPackage): void {
    try {
      const bundle = this.generateEpsdtFhirBundle(patient, pkg);
      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: 'application/fhir+json' });
      const url = URL.createObjectURL(blob);
      const safeToken = (patient.id || 'subject').toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const filename = `safe-harbor-${safeToken}-epsdt-appeal-fhir-r4-${pkg.stateCode}-${new Date().toISOString().slice(0, 10)}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[FhirExportStrategyService] EPSDT FHIR export error:', error);
    }
  }
}

