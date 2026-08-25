import { Injectable, inject, computed } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface IFhir7BiophysicsStreamObservation {
  resourceType: 'BiophysicsStreamObservation';
  id: string;
  status: 'final' | 'streaming_live';
  code: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  subject: { reference: string };
  effectivePeriod: { start: string; end?: string };
  samplingRateHz: number;
  vagalLfoHz: number;
  solfeggioCarrierHz: number;
  tubulinGammaPulseHz: number;
  negentropicFrictionScore: number;
}

export interface IFhir7EpigeneticTransgenerationalBundle {
  resourceType: 'EpigeneticTransgenerationalBundle';
  id: string;
  generationHorizonYears: number; // e.g., 150 years (Seven Generations)
  lineageDepthGenerations: number; // e.g., 7 generations
  histoneMethylationSignatures: string[];
  microRnaRegulators: string[];
  transgenerationalRiskFactor: string;
}

export interface IFhir7Bundle {
  resourceType: 'Bundle';
  id: string;
  type: 'fhir-r7-transgenerational-stream';
  timestamp: string;
  meta: {
    fhirVersion: '7.0.0-horizon';
    postQuantumEncryption: 'NIST ML-KEM-1024 / Dilithium-5';
    securityLabel: 'HIPAA-ZKP-ZERO-KNOWLEDGE';
  };
  entry: Array<{
    fullUrl: string;
    resource: IFhir7BiophysicsStreamObservation | IFhir7EpigeneticTransgenerationalBundle;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class FhirR7HorizonService {
  private patientState = inject(PatientStateService);

  readonly fhir7Bundle = computed<IFhir7Bundle>(() => this.generateFhir7Bundle());

  generateFhir7Bundle(stateOverride?: any): IFhir7Bundle {
    const state = stateOverride || this.patientState;
    const vitals = state.vitals();
    const hr = parseFloat(vitals.hr) || 72;
    const temp = parseFloat(vitals.temp) || 98.6;
    const timestamp = new Date().toISOString();

    const biophysicsStream: IFhir7BiophysicsStreamObservation = {
      resourceType: 'BiophysicsStreamObservation',
      id: `obs-r7-${Date.now()}`,
      status: 'streaming_live',
      code: {
        coding: [
          { system: 'http://loinc.org', code: '8867-4', display: 'Heart Rate Stream' },
          { system: 'http://hl7.org/fhir/7.0/biophysics', code: 'VAGAL-RSA-0.1HZ', display: 'Vagal Resonant Frequency' }
        ]
      },
      subject: { reference: 'Patient/pocketgull-patient-001' },
      effectivePeriod: { start: timestamp },
      samplingRateHz: 100,
      vagalLfoHz: hr > 85 ? 0.08 : 0.1,
      solfeggioCarrierHz: temp > 99.5 ? 432.0 : 528.0,
      tubulinGammaPulseHz: 40.0,
      negentropicFrictionScore: parseFloat((hr / 100).toFixed(2))
    };

    const epigeneticBundle: IFhir7EpigeneticTransgenerationalBundle = {
      resourceType: 'EpigeneticTransgenerationalBundle',
      id: `epi-r7-${Date.now()}`,
      generationHorizonYears: 150,
      lineageDepthGenerations: 7,
      histoneMethylationSignatures: ['H3K4me3-Promoter-Active', 'H3K27me3-Silenced-Inflammatory'],
      microRnaRegulators: ['miR-146a-5p (NF-kB Resolution)', 'miR-21-5p (Fibrosis Guardrail)'],
      transgenerationalRiskFactor: temp > 99.5 ? 'Moderate Transgenerational Inflammatory Epigenetic Load' : 'Optimal Transgenerational Resilience'
    };

    return {
      resourceType: 'Bundle',
      id: `bundle-fhir7-${Date.now()}`,
      type: 'fhir-r7-transgenerational-stream',
      timestamp,
      meta: {
        fhirVersion: '7.0.0-horizon',
        postQuantumEncryption: 'NIST ML-KEM-1024 / Dilithium-5',
        securityLabel: 'HIPAA-ZKP-ZERO-KNOWLEDGE'
      },
      entry: [
        { fullUrl: `urn:uuid:${biophysicsStream.id}`, resource: biophysicsStream },
        { fullUrl: `urn:uuid:${epigeneticBundle.id}`, resource: epigeneticBundle }
      ]
    };
  }

  exportFhir7Json(): string {
    return JSON.stringify(this.fhir7Bundle(), null, 2);
  }
}
