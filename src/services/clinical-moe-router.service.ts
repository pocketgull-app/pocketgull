import { Injectable, signal, computed } from '@angular/core';
import { AnalysisLens } from './clinical-intelligence.service';

export interface IExpertSubnet {
  id: string;
  name: string;
  lenses: AnalysisLens[];
  requiresSidecar: boolean;
  requiresAudioStream: boolean;
  requires3DShader: boolean;
  estimatedFlopsGiga: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalMoERouterService {
  // Active clinical state signals
  readonly activeLens = signal<AnalysisLens>('Summary Overview');
  readonly hasAcousticTelemetry = signal<boolean>(false);
  readonly hasDICOMVolume = signal<boolean>(false);

  // Sparse Activation Map: Route to expert sub-networks only when needed (Pathways MoE Paradigm)
  readonly activeExpertCluster = computed<IExpertSubnet[]>(() => {
    const lens = this.activeLens();
    const experts: IExpertSubnet[] = [];

    // Base LLM Expert is always active for general clinical synthesis
    experts.push({
      id: 'gulliver-core',
      name: 'Gulliver Base Clinical Synthesizer',
      lenses: ['Summary Overview', 'Functional Protocols', 'Patient Education'],
      requiresSidecar: false,
      requiresAudioStream: false,
      requires3DShader: false,
      estimatedFlopsGiga: 1.2
    });

    // Sparse Expert 1: Acoustic Respiratory Sidecar
    if (this.hasAcousticTelemetry() || lens === 'PhysioNet Telemetry') {
      experts.push({
        id: 'acoustic-sidecar',
        name: 'ONNX Acoustic Dyspnea Analyzer',
        lenses: ['PhysioNet Telemetry'],
        requiresSidecar: true,
        requiresAudioStream: true,
        requires3DShader: false,
        estimatedFlopsGiga: 0.15
      });
    }

    // Sparse Expert 2: Teledentistry SIBI Bridge
    if (lens === 'Teledentistry & Systemic Health') {
      experts.push({
        id: 'sibi-bridge',
        name: 'Periodontal Systemic Inflammatory Burden Engine',
        lenses: ['Teledentistry & Systemic Health'],
        requiresSidecar: true,
        requiresAudioStream: false,
        requires3DShader: false,
        estimatedFlopsGiga: 0.08
      });
    }

    // Sparse Expert 3: Spatial 3D DICOM Shader
    if (this.hasDICOMVolume() || lens === 'RSNA Knee Abnormality') {
      experts.push({
        id: 'dicom-spatial-shader',
        name: 'Three.js Spatial Tensor Shader',
        lenses: ['RSNA Knee Abnormality'],
        requiresSidecar: false,
        requiresAudioStream: false,
        requires3DShader: true,
        estimatedFlopsGiga: 0.45
      });
    }

    return experts;
  });

  // Calculate dynamic compute efficiency savings percentage vs a dense monolithic evaluation
  readonly computeEfficiencySavingsPercent = computed<number>(() => {
    const totalPossibleFlops = 1.2 + 0.15 + 0.08 + 0.45; // 1.88 GFLOPs total dense pass
    const activeFlops = this.activeExpertCluster().reduce((sum, e) => sum + e.estimatedFlopsGiga, 0);
    return Math.round((1 - (activeFlops / totalPossibleFlops)) * 100);
  });

  public setActiveLens(lens: AnalysisLens): void {
    this.activeLens.set(lens);
  }

  public setAcousticTelemetryState(active: boolean): void {
    this.hasAcousticTelemetry.set(active);
  }

  public setDICOMVolumeState(active: boolean): void {
    this.hasDICOMVolume.set(active);
  }
}
