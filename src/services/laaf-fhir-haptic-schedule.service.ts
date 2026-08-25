import { Injectable, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import * as DOMPurify from 'dompurify';

export type LaafHapticModality = 
  | 'vagal_resonance' 
  | 'gamma_40hz' 
  | 'somatic_thermoregulation' 
  | 'kss_sleepiness_shield' 
  | 'abhyanga_grounding' 
  | 'box_breathing_haptic';

export type LaafAnatomicalSite = 
  | 'wrist_bilateral' 
  | 'mastoid_process' 
  | 'sternum_midline' 
  | 'palmar_surface' 
  | 'cervical_spine_vagus';

export interface ILaafHapticItem {
  id: string;
  title: string;
  modality: LaafHapticModality;
  frequencyHz: number;          // e.g. 0.1 Hz for baroreflex, 40 Hz for cognitive gamma entrainment
  amplitudePercent: number;     // 0 - 100% duty cycle / vibration strength
  anatomicalSite: LaafAnatomicalSite;
  durationMinutes: number;
  repeatFrequency: number;       // e.g. 3 times per period
  repeatPeriod: number;          // e.g. 1
  repeatPeriodUnit: 'h' | 'd' | 'wk'; // hours, days, weeks
  timeOfDay?: string[];          // e.g. ["08:00", "14:00", "21:00"]
  status: 'active' | 'completed' | 'on-hold' | 'draft';
  clinicalRationale: string;
}

export interface ILaafHapticSchedulePayload {
  patientId: string;
  patientName: string;
  scheduleTitle: string;
  createdDate: string;
  items: ILaafHapticItem[];
}

@Injectable({
  providedIn: 'root'
})
export class LaafFhirHapticScheduleService {
  private patientState = inject(PatientStateService);

  readonly LAAF_FHIR_BASE_URL = 'https://pocketgull.app/fhir/StructureDefinition';

  /**
   * Serializes LAAF Haptic Schedule into FHIR R4 Bundle containing CarePlan and DeviceRequest resources
   */
  toFhirBundle(payload: ILaafHapticSchedulePayload): any {
    const sanitize = (text: string) => {
      if (!text) return '';
      const purify = (DOMPurify as any).default || DOMPurify;
      return purify.sanitize(text);
    };

    const bundleId = `laaf-bundle-${Date.now()}`;
    const carePlanId = `laaf-careplan-${payload.patientId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const createdIso = new Date().toISOString();

    const deviceRequests = payload.items.map(item => this.toFhirDeviceRequest(payload.patientId, item));

    const carePlanResource: any = {
      resourceType: 'CarePlan',
      id: carePlanId,
      meta: {
        profile: [`${this.LAAF_FHIR_BASE_URL}/laaf-haptic-careplan`]
      },
      identifier: [
        {
          system: 'https://pocketgull.app/laaf/careplan',
          value: carePlanId
        }
      ],
      status: 'active',
      intent: 'plan',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '710081004',
              display: 'Neuromodulation and Haptic Sensory Biofeedback Protocol'
            }
          ],
          text: 'LAAF Local Agentic Assembly Haptic Schedule'
        }
      ],
      title: sanitize(payload.scheduleTitle),
      description: 'Local Agentic Assembly Framework (LAAF) compiled haptic care plan schedule targeting autonomic vagal resonance and cognitive entrainment.',
      subject: {
        reference: `Patient/${payload.patientId}`,
        display: sanitize(payload.patientName)
      },
      created: createdIso,
      activity: payload.items.map((item, idx) => ({
        outcomeCodeableConcept: [
          {
            coding: [
              {
                system: 'https://pocketgull.app/fhir/laaf-modality',
                code: item.modality,
                display: item.title
              }
            ]
          }
        ],
        reference: {
          reference: `DeviceRequest/${deviceRequests[idx].id}`,
          display: `${item.title} (${item.frequencyHz} Hz)`
        },
        detail: {
          kind: 'DeviceRequest',
          code: {
            coding: [
              {
                system: 'https://pocketgull.app/laaf/haptic-code',
                code: item.modality,
                display: item.title
              }
            ]
          },
          status: item.status === 'active' ? 'in-progress' : item.status === 'completed' ? 'completed' : 'scheduled',
          doNotPerform: false,
          scheduledTiming: {
            repeat: {
              frequency: item.repeatFrequency,
              period: item.repeatPeriod,
              periodUnit: item.repeatPeriodUnit === 'h' ? 'h' : item.repeatPeriodUnit === 'd' ? 'd' : 'wk',
              duration: item.durationMinutes,
              durationUnit: 'min',
              timeOfDay: item.timeOfDay || []
            }
          },
          description: sanitize(item.clinicalRationale)
        }
      }))
    };

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'collection',
      timestamp: createdIso,
      entry: [
        {
          fullUrl: `urn:uuid:${carePlanId}`,
          resource: carePlanResource
        },
        ...deviceRequests.map(dr => ({
          fullUrl: `urn:uuid:${dr.id}`,
          resource: dr
        }))
      ]
    };
  }

  /**
   * Maps an individual LAAF Haptic Schedule item into a FHIR R4 DeviceRequest resource
   */
  toFhirDeviceRequest(patientId: string, item: ILaafHapticItem): any {
    const sanitize = (text: string) => {
      if (!text) return '';
      const purify = (DOMPurify as any).default || DOMPurify;
      return purify.sanitize(text);
    };

    const drId = `dr-${item.id}`;

    return {
      resourceType: 'DeviceRequest',
      id: drId,
      meta: {
        profile: [`${this.LAAF_FHIR_BASE_URL}/laaf-haptic-device-request`]
      },
      extension: [
        {
          url: `${this.LAAF_FHIR_BASE_URL}/laaf-haptic-frequency`,
          valueQuantity: {
            value: item.frequencyHz,
            unit: 'Hz',
            system: 'http://unitsofmeasure.org',
            code: 'Hz'
          }
        },
        {
          url: `${this.LAAF_FHIR_BASE_URL}/laaf-haptic-amplitude`,
          valueQuantity: {
            value: item.amplitudePercent,
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%'
          }
        },
        {
          url: `${this.LAAF_FHIR_BASE_URL}/laaf-haptic-anatomical-site`,
          valueCode: item.anatomicalSite
        },
        {
          url: `${this.LAAF_FHIR_BASE_URL}/laaf-haptic-modality`,
          valueCode: item.modality
        }
      ],
      status: item.status === 'active' ? 'active' : item.status === 'completed' ? 'completed' : 'draft',
      intent: 'order',
      codeCodeableConcept: {
        coding: [
          {
            system: 'https://pocketgull.app/laaf/haptic-devices',
            code: item.modality,
            display: sanitize(item.title)
          }
        ],
        text: sanitize(item.title)
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      occurrenceTiming: {
        repeat: {
          frequency: item.repeatFrequency,
          period: item.repeatPeriod,
          periodUnit: item.repeatPeriodUnit === 'h' ? 'h' : item.repeatPeriodUnit === 'd' ? 'd' : 'wk',
          duration: item.durationMinutes,
          durationUnit: 'min',
          timeOfDay: item.timeOfDay || []
        }
      },
      note: [
        {
          text: sanitize(item.clinicalRationale)
        }
      ]
    };
  }

  /**
   * Deserializes a FHIR R4 CarePlan Bundle back into LAAF Haptic Schedule items
   */
  fromFhirBundle(fhirBundle: any): ILaafHapticItem[] {
    if (!fhirBundle || fhirBundle.resourceType !== 'Bundle' || !Array.isArray(fhirBundle.entry)) {
      return [];
    }

    const carePlanEntry = fhirBundle.entry.find((e: any) => e.resource?.resourceType === 'CarePlan');
    if (!carePlanEntry || !carePlanEntry.resource?.activity) {
      return [];
    }

    const deviceRequestEntries = fhirBundle.entry.filter((e: any) => e.resource?.resourceType === 'DeviceRequest');

    return carePlanEntry.resource.activity.map((act: any, idx: number) => {
      const detail = act.detail || {};
      const timing = detail.scheduledTiming?.repeat || {};

      // Match corresponding DeviceRequest by index or reference
      const drResource = deviceRequestEntries[idx]?.resource || {};
      const extensions = drResource.extension || [];

      const getExtVal = (urlSuffix: string) => {
        const ext = extensions.find((x: any) => x.url?.endsWith(urlSuffix));
        return ext?.valueQuantity?.value ?? ext?.valueCode ?? null;
      };

      const freqHz = getExtVal('laaf-haptic-frequency') ?? 0.1;
      const amplitude = getExtVal('laaf-haptic-amplitude') ?? 50;
      const site = (getExtVal('laaf-haptic-anatomical-site') as LaafAnatomicalSite) || 'wrist_bilateral';
      const modality = (getExtVal('laaf-haptic-modality') as LaafHapticModality) || 'vagal_resonance';

      return {
        id: drResource.id || `haptic-${idx + 1}`,
        title: act.outcomeCodeableConcept?.[0]?.coding?.[0]?.display || detail.code?.coding?.[0]?.display || `Haptic Schedule Item ${idx + 1}`,
        modality,
        frequencyHz: freqHz,
        amplitudePercent: amplitude,
        anatomicalSite: site,
        durationMinutes: timing.duration || 15,
        repeatFrequency: timing.frequency || 1,
        repeatPeriod: timing.period || 1,
        repeatPeriodUnit: timing.periodUnit || 'd',
        timeOfDay: timing.timeOfDay || [],
        status: detail.status === 'in-progress' || detail.status === 'active' ? 'active' : 'draft',
        clinicalRationale: detail.description || ''
      };
    });
  }
}
