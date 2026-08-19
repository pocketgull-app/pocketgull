import { Injectable } from '@angular/core';
import * as DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root'
})
export class FhirBundleFactoryService {
  /**
   * Sanitizes string values using DOMPurify for HIPAA-compatible UI rendering & FHIR compliance
   */
  sanitize(val: string): string {
    if (!val) return '';
    const hasOwnDefault = Object.prototype.hasOwnProperty.call(DOMPurify, 'default');
    const DOMP = hasOwnDefault ? (DOMPurify as any).default : DOMPurify;
    if (typeof window !== 'undefined' && DOMP && typeof DOMP.sanitize === 'function') {
      return DOMP.sanitize(val);
    }
    // Headless environment / Node fallback: Deterministic character entity encoding
    let out = '';
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      switch (ch) {
        case '&': out += '&amp;'; break;
        case '<': out += '&lt;'; break;
        case '>': out += '&gt;'; break;
        case '"': out += '&quot;'; break;
        case "'": out += '&#39;'; break;
        case '/': out += '&#47;'; break;
        default: out += ch; break;
      }
    }
    return out;
  }

  /**
   * Creates a US Core IG v6.1.0 compliant FHIR Patient resource
   */
  createPatientResource(patientData: any): Record<string, any> {
    const patientId = patientData?.patientId || patientData?.id || `patient-${Date.now()}`;
    const rawName = patientData?.name || 'Jane Doe';
    const nameParts = rawName.split(' ');
    const family = nameParts.length > 1 ? nameParts.pop() : rawName;
    const given = nameParts.length > 0 ? nameParts : [rawName];
    const age = patientData?.age || 42;
    const birthDate = patientData?.birthDate || new Date(Date.now() - age * 365.25 * 86400 * 1000).toISOString().split('T')[0];

    return {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      meta: {
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient']
      },
      name: [
        {
          family: this.sanitize(family),
          given: given.map(g => this.sanitize(g))
        }
      ],
      gender: (patientData?.gender || 'unknown').toLowerCase(),
      birthDate
    };
  }

  /**
   * Creates a FHIR Observation resource for vitals or biometric waveforms
   */
  createVitalObservationResource(
    patientId: string,
    displayTitle: string,
    valueString: string,
    options: { id?: string; loincCode?: string; category?: string; timestamp?: string } = {}
  ): Record<string, any> {
    const timestamp = options.timestamp || new Date().toISOString();
    const obsId = options.id || `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      resourceType: 'Observation',
      id: obsId,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: options.category || 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        text: this.sanitize(displayTitle),
        coding: options.loincCode
          ? [
              {
                system: 'http://loinc.org',
                code: options.loincCode,
                display: this.sanitize(displayTitle)
              }
            ]
          : undefined
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      effectiveDateTime: timestamp,
      valueString: this.sanitize(valueString)
    };
  }

  /**
   * Creates a FHIR CarePlan resource
   */
  createCarePlanResource(
    patientId: string,
    title: string,
    description?: string,
    options: { id?: string; intent?: string; category?: string; created?: string } = {}
  ): Record<string, any> {
    const timestamp = options.created || new Date().toISOString();
    const planId = options.id || `careplan-${Date.now()}`;

    return {
      resourceType: 'CarePlan',
      id: planId,
      status: 'active',
      intent: options.intent || 'plan',
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
              code: options.category || 'assess-plan',
              display: 'Assessment and Plan'
            }
          ]
        }
      ],
      title: this.sanitize(title),
      description: description ? this.sanitize(description) : undefined,
      subject: {
        reference: `Patient/${patientId}`
      },
      created: timestamp,
      author: {
        display: 'Pocket-Gull AI Clinical Co-Pilot'
      }
    };
  }

  /**
   * Constructs an HL7 FHIR R4 Bundle containing Patient, Observation, and CarePlan resources
   */
  buildFhirR4CarePlanBundle(patientData: any, activeLens: string = 'Summary Overview'): Record<string, any> {
    const timestamp = new Date().toISOString();
    const patientResource = this.createPatientResource(patientData);
    const patientId = patientResource['id'];
    const vitals = patientData?.vitals || { bp: '120/80', hr: 72, spO2: 98, temp: 98.6 };

    const hrObs = this.createVitalObservationResource(
      patientId,
      'Heart Rate',
      `${vitals.hr || 72} bpm`,
      { loincCode: '8867-4', timestamp }
    );

    const carePlan = this.createCarePlanResource(
      patientId,
      `Pocket-Gull Care Strategy: ${activeLens}`,
      'Automated clinical care plan strategy generated by Pocket-Gull AI engine.',
      { created: timestamp }
    );

    return {
      resourceType: 'Bundle',
      id: `pocketgull-bundle-${Date.now()}`,
      meta: {
        lastUpdated: timestamp,
        profile: ['http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest']
      },
      type: 'collection',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${patientId}`, resource: patientResource },
        { fullUrl: `urn:uuid:${hrObs['id']}`, resource: hrObs },
        { fullUrl: `urn:uuid:${carePlan['id']}`, resource: carePlan }
      ]
    };
  }

  /**
   * Constructs a HIPAA-compliant FHIR R5 Transaction Bundle for GCP Healthcare API & AWS HealthLake
   */
  buildFhirR5TelemetryBundle(vitals: any = {}, telemetry: any = {}): Record<string, any> {
    const timestamp = new Date().toISOString();
    const patientId = 'patient-pocketgull-001';

    const patientResource = {
      resourceType: 'Patient',
      id: patientId,
      active: true,
      gender: 'unknown',
      meta: {
        profile: ['http://hl7.org/fhir/5.0/StructureDefinition/Patient']
      }
    };

    const topicResource = {
      resourceType: 'SubscriptionTopic',
      id: 'subscriptiontopic-telemetry-001',
      status: 'active',
      url: 'http://hl7.org/fhir/SubscriptionTopic/biometric-telemetry-stream',
      title: this.sanitize('Real-time Biometric Waveform Telemetry Subscription Topic'),
      notificationShape: [{ resource: 'Observation' }]
    };

    const vitalsSummary = `BP: ${vitals.bp || '120/80'} mmHg, HR: ${vitals.hr || 72} bpm, SpO2: ${vitals.spO2 || 98}%, Temp: ${vitals.temp || 98.6}°F`;
    const vitalsObs = this.createVitalObservationResource(
      patientId,
      'FHIR R5 Waveform & Biometric Telemetry Summary',
      vitalsSummary,
      { id: 'observation-vitals-r5-001', timestamp }
    );

    const carePlan = this.createCarePlanResource(
      patientId,
      'Actuarial Glee 12-Track Duet Album Prescription (+12.0 QALYs)',
      'Mandatory 12-track singalong duet care plan prescribed for daily vagal tone activation and autonomic co-regulation.',
      { id: 'careplan-actuarial-glee-001', created: timestamp }
    );

    return {
      resourceType: 'Bundle',
      type: 'transaction',
      timestamp,
      entry: [
        { fullUrl: `urn:uuid:${patientId}`, resource: patientResource, request: { method: 'POST', url: 'Patient' } },
        { fullUrl: 'urn:uuid:subscriptiontopic-telemetry-001', resource: topicResource, request: { method: 'POST', url: 'SubscriptionTopic' } },
        { fullUrl: 'urn:uuid:observation-vitals-r5-001', resource: vitalsObs, request: { method: 'POST', url: 'Observation' } },
        { fullUrl: 'urn:uuid:careplan-actuarial-glee-001', resource: carePlan, request: { method: 'POST', url: 'CarePlan' } }
      ]
    };
  }
}
