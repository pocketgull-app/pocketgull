import { Injectable, signal, computed, inject } from '@angular/core';
import { getSecureRandomId } from '../utils/security-helper';
import { AvsEngineService } from './avs-engine.service';
import { FhirR4BundleExportService } from './fhir-r4-bundle-export.service';

export type LesionSeverity = 'mild' | 'moderate' | 'critical';
export type LesionMorphology =
  | 'erythema'
  | 'edema'
  | 'calcification'
  | 'fibrosis'
  | 'laceration'
  | 'nodule'
  | 'rash'
  | 'inflammation';

export interface IVector3D {
  x: number;
  y: number;
  z: number;
}

export interface ISpatialLesion {
  id: string;
  label: string;
  partId: string;
  position: IVector3D;
  normal?: IVector3D;
  severity: LesionSeverity;
  morphology: LesionMorphology;
  clinicalNotes: string;
  snomedCode?: string;
  icd10Code?: string;
  createdAt: string;
  updatedAt: string;
}

export const LESION_SOLFEGGIO_MAP: Record<LesionMorphology, { hz: number; name: string; clinicalTarget: string }> = {
  inflammation: { hz: 528, name: '528Hz Cellular Transformation', clinicalTarget: 'Acute cytokine modulation & tissue repair' },
  erythema: { hz: 528, name: '528Hz Transformation & DNA Integrity', clinicalTarget: 'Microvascular hyperemia calming' },
  edema: { hz: 528, name: '528Hz Transformation', clinicalTarget: 'Lymphatic drainage & interstitial fluid dispersion' },
  calcification: { hz: 174, name: '174Hz Somatic Pain & Deep Tissue', clinicalTarget: 'Acoustic de-aggregation & pain relief' },
  fibrosis: { hz: 174, name: '174Hz Somatic Grounding', clinicalTarget: 'Myofascial softening & collagen remodeling' },
  laceration: { hz: 285, name: '285Hz Tissue Regeneration & Field Blueprint', clinicalTarget: 'Epithelial migration & wound healing' },
  nodule: { hz: 285, name: '285Hz Morphogenic Blueprint', clinicalTarget: 'Cellular normalization' },
  rash: { hz: 432, name: '432Hz Pythagorean Natural Tuning', clinicalTarget: 'Neuro-cutaneous calming & anti-pruritic stabilization' }
};

const MORPHOLOGY_SNOMED_MAP: Record<LesionMorphology, { code: string; display: string }> = {
  erythema: { code: '247441003', display: 'Erythema (finding)' },
  edema: { code: '267038008', display: 'Edema (finding)' },
  calcification: { code: '89100005', display: 'Tissue calcification (finding)' },
  fibrosis: { code: '112674009', display: 'Fibrosis (morphologic abnormality)' },
  laceration: { code: '312608009', display: 'Laceration - injury (disorder)' },
  nodule: { code: '27925004', display: 'Nodule (morphologic abnormality)' },
  rash: { code: '271807003', display: 'Eruption of skin (finding)' },
  inflammation: { code: '23583003', display: 'Inflammation (morphologic abnormality)' }
};

@Injectable({
  providedIn: 'root'
})
export class SpatialLesionMarkupService {
  private readonly avsEngine = (() => {
    try { return inject(AvsEngineService, { optional: true }); } catch { return null; }
  })();
  private readonly fhirExport = (() => {
    try { return inject(FhirR4BundleExportService, { optional: true }); } catch { return null; }
  })();

  readonly activeLesions = signal<ISpatialLesion[]>([]);
  readonly selectedLesionId = signal<string | null>(null);
  readonly isMarkupMode = signal<boolean>(false);
  readonly isAcousticPinningActive = signal<boolean>(false);
  readonly activeSeverity = signal<LesionSeverity>('moderate');
  readonly activeMorphology = signal<LesionMorphology>('inflammation');

  readonly selectedLesion = computed(() => {
    const id = this.selectedLesionId();
    if (!id) return null;
    return this.activeLesions().find(l => l.id === id) || null;
  });

  readonly recommendedLesionHarmonic = computed<{ hz: number; name: string; clinicalTarget: string } | null>(() => {
    const lesion = this.selectedLesion();
    if (!lesion) return null;
    return LESION_SOLFEGGIO_MAP[lesion.morphology] || { hz: 528, name: '528Hz Transformation', clinicalTarget: 'Cellular recovery' };
  });

  readonly lesionCountBySeverity = computed(() => {
    const counts = { mild: 0, moderate: 0, critical: 0 };
    for (const lesion of this.activeLesions()) {
      counts[lesion.severity]++;
    }
    return counts;
  });

  toggleMarkupMode(enabled?: boolean): boolean {
    const next = enabled !== undefined ? enabled : !this.isMarkupMode();
    this.isMarkupMode.set(next);
    if (!next) {
      this.selectedLesionId.set(null);
    }
    return next;
  }

  toggleAcousticPinning(enabled?: boolean): boolean {
    const next = enabled !== undefined ? enabled : !this.isAcousticPinningActive();
    this.isAcousticPinningActive.set(next);
    if (this.avsEngine) {
      this.avsEngine.toggleSpatialPanning(next);
      if (next && this.selectedLesion()) {
        const lesion = this.selectedLesion()!;
        const harmonic = this.recommendedLesionHarmonic();
        if (harmonic) {
          this.avsEngine.applySolfeggioTone(harmonic.hz);
        }
        this.avsEngine.updateSpatialAudioPosition(lesion.position);
      }
    }
    return next;
  }

  pinLesionAcoustically(lesionId: string): void {
    this.selectedLesionId.set(lesionId);
    this.isAcousticPinningActive.set(true);
    const lesion = this.activeLesions().find(l => l.id === lesionId);
    if (lesion && this.avsEngine) {
      const harmonic = LESION_SOLFEGGIO_MAP[lesion.morphology] || { hz: 528 };
      this.avsEngine.applySolfeggioTone(harmonic.hz);
      this.avsEngine.toggleSpatialPanning(true);
      this.avsEngine.updateSpatialAudioPosition(lesion.position);
      if (!this.avsEngine.isPlaying()) {
        this.avsEngine.toggleSession(true);
      }
    }
  }

  addLesion(payload: Omit<ISpatialLesion, 'id' | 'createdAt' | 'updatedAt'>): ISpatialLesion {
    const id = `lesion_${Date.now()}_${getSecureRandomId()}`;
    const now = new Date().toISOString();
    const snomed = payload.snomedCode || MORPHOLOGY_SNOMED_MAP[payload.morphology]?.code || '404684003';

    const newLesion: ISpatialLesion = {
      ...payload,
      id,
      snomedCode: snomed,
      createdAt: now,
      updatedAt: now
    };

    this.activeLesions.update(list => [...list, newLesion]);
    this.selectedLesionId.set(id);
    return newLesion;
  }

  updateLesion(id: string, updates: Partial<Omit<ISpatialLesion, 'id' | 'createdAt'>>): void {
    this.activeLesions.update(list =>
      list.map(lesion => {
        if (lesion.id === id) {
          return {
            ...lesion,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return lesion;
      })
    );
  }

  removeLesion(id: string): void {
    this.activeLesions.update(list => list.filter(l => l.id !== id));
    if (this.selectedLesionId() === id) {
      this.selectedLesionId.set(null);
    }
  }

  selectLesion(id: string | null): void {
    this.selectedLesionId.set(id);
  }

  clearAllLesions(): void {
    this.activeLesions.set([]);
    this.selectedLesionId.set(null);
  }

  exportAsFhirObservations(patientId: string): any[] {
    return this.activeLesions().map(lesion => {
      const morph = MORPHOLOGY_SNOMED_MAP[lesion.morphology] || {
        code: '404684003',
        display: 'Clinical finding'
      };

      return {
        resourceType: 'Observation',
        id: lesion.id,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'exam',
                display: 'Exam'
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: lesion.snomedCode || morph.code,
              display: `${lesion.label} (${morph.display})`
            }
          ],
          text: lesion.label
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: lesion.createdAt,
        interpretation: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                code: lesion.severity === 'critical' ? 'AA' : lesion.severity === 'moderate' ? 'A' : 'N',
                display: lesion.severity.toUpperCase()
              }
            ]
          }
        ],
        bodySite: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: lesion.partId,
              display: lesion.partId.replace(/_/g, ' ')
            }
          ],
          text: lesion.partId
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/spatial-coordinates-3d',
            extension: [
              { url: 'x', valueDecimal: lesion.position.x },
              { url: 'y', valueDecimal: lesion.position.y },
              { url: 'z', valueDecimal: lesion.position.z }
            ]
          }
        ],
        note: [
          {
            text: lesion.clinicalNotes || 'Marked via PocketGull 3D Spatial Anatomy Telemetry'
          }
        ]
      };
    });
  }

  /**
   * Generates a complete HL7 FHIR R4 Document Bundle including 3D Lesion Observations and AVS Procedures
   */
  exportCompleteFhirBundle(patientId: string = 'pt-demo-01', patientName: string = 'Clinical Subject', avsSessionParams?: any): any {
    if (!this.fhirExport) return null;
    return this.fhirExport.generateSpatialLesionAndAvsBundle({
      patientId,
      patientName,
      lesions: this.activeLesions(),
      avsSession: avsSessionParams || (this.avsEngine ? {
        carrierFreqHz: this.avsEngine.sessionConfig().carrierFreqHz,
        binauralBeatHz: this.avsEngine.sessionConfig().binauralBeatHz,
        isIsochronicPulseEnabled: this.avsEngine.sessionConfig().isIsochronicPulseEnabled,
        isSpatialPanningEnabled: this.avsEngine.isSpatialPanningEnabled(),
        hapticMode: 'isochronic_pulse'
      } : undefined)
    });
  }

  /**
   * Triggers 1-click JSON download of the complete FHIR R4 3D Lesion & AVS Document Bundle
   */
  downloadFhirBundleJson(patientId: string = 'pt-demo-01', patientName: string = 'Clinical Subject'): boolean {
    if (!this.fhirExport) return false;
    return this.fhirExport.downloadSpatialLesionBundleJson({
      patientId,
      patientName,
      lesions: this.activeLesions(),
      avsSession: this.avsEngine ? {
        carrierFreqHz: this.avsEngine.sessionConfig().carrierFreqHz,
        binauralBeatHz: this.avsEngine.sessionConfig().binauralBeatHz,
        isIsochronicPulseEnabled: this.avsEngine.sessionConfig().isIsochronicPulseEnabled,
        isSpatialPanningEnabled: this.avsEngine.isSpatialPanningEnabled(),
        hapticMode: 'isochronic_pulse'
      } : undefined
    });
  }
}
