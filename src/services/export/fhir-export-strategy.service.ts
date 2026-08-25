import { Injectable, inject } from '@angular/core';
import * as DOMPurify from 'dompurify';
import { IPatient, HistoryEntry, IPatientVitals } from '../patient.types';
import { LaafFhirHapticScheduleService } from '../laaf-fhir-haptic-schedule.service';
import { ClinicalAssessmentsService } from '../clinical-assessments/clinical-assessments.service';
import { YbocsService } from '../ybocs/ybocs.service';
import { AcronymExpanderService } from '../acronym-expander.service';
import { ActuarialLongevityService } from '../actuarial-longevity.service';
import { ResearchLecturesService } from '../research-lectures.service';

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
    } catch (e) {
      console.debug('[FhirExport] ActuarialLongevityService DI fallback:', (e as Error)?.message);
      return new ActuarialLongevityService();
    }
  })();

  private researchLectures = (() => {
    try {
      return inject(ResearchLecturesService, { optional: true }) || new ResearchLecturesService();
    } catch (e) {
      console.debug('[FhirExport] ResearchLecturesService DI fallback:', (e as Error)?.message);
      return new ResearchLecturesService();
    }
  })();

  private laafFhir = (() => {
    try {
      return inject(LaafFhirHapticScheduleService, { optional: true });
    } catch (e) {
      console.debug('[FhirExport] LaafFhirHapticScheduleService DI fallback:', (e as Error)?.message);
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

  /**
   * Generates a FHIR R4 Bundle for patient state export.
   */
  public generateFhirBundle(patient: IPatient): IFhirBundle {
    const sanitize = (val?: string) => this.sanitizeForExport(val || '');
    const cleanId = (patient.id || 'patient-1').replace(/[^a-zA-Z0-9\-\.]/g, '-');
    const timestamp = new Date().toISOString();

    const patientResource: IFhirResource = {
      resourceType: 'Patient',
      id: cleanId,
      active: true,
      name: [{ use: 'official', text: sanitize(patient.name) }],
      gender: this.toFhirGender(patient.gender),
      birthDate: patient.age ? `${new Date().getFullYear() - patient.age}-01-01` : undefined
    };

    const entries: { resource: IFhirResource }[] = [{ resource: patientResource }];

    if (patient.vitals) {
      entries.push({
        resource: {
          resourceType: 'Observation',
          id: `obs-vitals-${cleanId}`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs', display: 'Vital Signs' }] }],
          subject: { reference: `Patient/${cleanId}` },
          effectiveDateTime: timestamp,
          component: [
            ...(patient.vitals.bp ? [{ code: { text: 'Blood Pressure' }, valueString: sanitize(patient.vitals.bp) }] : []),
            ...(patient.vitals.hr ? [{ code: { text: 'Heart Rate' }, valueString: sanitize(patient.vitals.hr) }] : []),
            ...(patient.vitals.spO2 ? [{ code: { text: 'Oxygen Saturation' }, valueString: sanitize(patient.vitals.spO2) }] : [])
          ]
        }
      });
    }

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
      const cleanName = (patient.name || 'patient').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${cleanName}-${filenameSuffix}-${new Date().toISOString().slice(0, 10)}.json`;

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
}
