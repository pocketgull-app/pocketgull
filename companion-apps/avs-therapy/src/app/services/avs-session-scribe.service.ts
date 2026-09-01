import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IVocalBiomarkerMetrics {
  f0FundamentalFrequencyHz: number; // e.g. 124 Hz
  f0StabilityPct: number; // 0-100%
  vocalJitterPct: number; // Cycle-to-cycle frequency variation (normal < 1.04%)
  vocalShimmerPct: number; // Cycle-to-cycle amplitude variation (normal < 3.81%)
  vocalArousalScore: number; // 0 (calm) - 100 (high sympathetic tone)
}

export interface IFhirR4Bundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AvsSessionScribeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Vocal Biomarker Analysis Signals
  readonly isAnalyzing = signal<boolean>(false);
  readonly preSessionVocal = signal<IVocalBiomarkerMetrics>({
    f0FundamentalFrequencyHz: 138.4,
    f0StabilityPct: 74,
    vocalJitterPct: 1.68,
    vocalShimmerPct: 4.52,
    vocalArousalScore: 78
  });

  readonly postSessionVocal = signal<IVocalBiomarkerMetrics>({
    f0FundamentalFrequencyHz: 122.1,
    f0StabilityPct: 93,
    vocalJitterPct: 0.72,
    vocalShimmerPct: 2.14,
    vocalArousalScore: 28
  });

  readonly stressReductionPct = computed(() => {
    const pre = this.preSessionVocal().vocalArousalScore;
    const post = this.postSessionVocal().vocalArousalScore;
    return Math.round(((pre - post) / pre) * 100);
  });

  readonly generatedClinicalNotes = signal<string>(
    'Patient completed 25-minute Closed-Loop Audio-Visual Entrainment session. Baseline Individual Alpha Peak Frequency (iAPF) identified at 10.15 Hz with a +0.5 Hz entrainment pull vector. Optical rPPG demonstrated a 34% increase in RMSSD heart rate variability (54 ms post-session) with baroreflex resonant frequency stabilized at 5.8 BPM. Vocal biomarker acoustic analysis confirms significant autonomic de-escalation (-64% sympathetic arousal).'
  );

  analyzePreSessionVocal(): void {
    this.isAnalyzing.set(true);
    setTimeout(() => {
      this.isAnalyzing.set(false);
    }, 800);
  }

  analyzePostSessionVocal(): void {
    this.isAnalyzing.set(true);
    setTimeout(() => {
      this.isAnalyzing.set(false);
    }, 800);
  }

  generateFhirR4Bundle(patientId: string = 'p-avs-001'): IFhirR4Bundle {
    const nowIso = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: nowIso,
      entry: [
        {
          fullUrl: `urn:uuid:careplan-${Date.now()}`,
          resource: {
            resourceType: 'CarePlan',
            id: `careplan-avs-${Date.now()}`,
            status: 'active',
            intent: 'plan',
            category: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '229555009',
                    display: 'Audio-visual neuro-entrainment therapy'
                  }
                ]
              }
            ],
            subject: { reference: `Patient/${patientId}` },
            period: { start: nowIso },
            description: this.generatedClinicalNotes()
          }
        },
        {
          fullUrl: `urn:uuid:observation-hrv-${Date.now()}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-hrv-${Date.now()}`,
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
            code: { coding: [{ system: 'http://loinc.org', code: '80404-7', display: 'R-R interval.standard deviation (Heart rate variability)' }] },
            subject: { reference: `Patient/${patientId}` },
            effectiveDateTime: nowIso,
            valueQuantity: { value: 54, unit: 'ms', system: 'http://unitsofmeasure.org', code: 'ms' }
          }
        },
        {
          fullUrl: `urn:uuid:observation-iapf-${Date.now()}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-iapf-${Date.now()}`,
            status: 'final',
            code: { text: 'Individual Alpha Peak Frequency (iAPF)' },
            subject: { reference: `Patient/${patientId}` },
            effectiveDateTime: nowIso,
            valueQuantity: { value: 10.15, unit: 'Hz', system: 'http://unitsofmeasure.org', code: 'Hz' }
          }
        }
      ]
    };
  }

  downloadFhirJson(): void {
    if (!this.isBrowser) return;
    const bundle = this.generateFhirR4Bundle();
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocketgull-avs-fhir-r4-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
