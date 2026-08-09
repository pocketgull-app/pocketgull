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

export interface IGeminiThinkingConfig {
  /** Token budget for internal reasoning steps (-1 = dynamic auto, 0 = off, 1024-16384 for deep synthesis) */
  thinkingBudget: number;
  /** Whether to stream or include thought process in generation output */
  includeThoughts: boolean;
  /** Human-readable tier name for clinical telemetry HUDs */
  reasoningTier: 'Fast (Low Latency)' | 'Standard (Balanced)' | 'Deep Clinical Synthesis (High Acuity)';
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalMoERouterService {
  // Active clinical state signals
  readonly activeLens = signal<AnalysisLens>('Summary Overview');
  readonly hasAcousticTelemetry = signal<boolean>(false);
  readonly hasDICOMVolume = signal<boolean>(false);
  readonly customThinkingBudget = signal<number | null>(null);

  /**
   * Gemini 2.5 Thinking Model Reasoning Budget Configuration.
   * Dynamically assigns reasoning token budgets based on active clinical lens acuity.
   * @see https://github.com/google-gemini/cookbook — Thinking Models & Reasoning Budgets
   */
  readonly currentThinkingConfig = computed<IGeminiThinkingConfig>(() => {
    const custom = this.customThinkingBudget();
    const lens = this.activeLens();

    if (custom !== null) {
      let tier: 'Fast (Low Latency)' | 'Standard (Balanced)' | 'Deep Clinical Synthesis (High Acuity)' = 'Standard (Balanced)';
      if (custom <= 1024) tier = 'Fast (Low Latency)';
      else if (custom >= 8192) tier = 'Deep Clinical Synthesis (High Acuity)';

      return {
        thinkingBudget: custom,
        includeThoughts: true,
        reasoningTier: tier
      };
    }

    switch (lens) {
      case 'Summary Overview':
      case 'Patient Education':
      case 'Console Debugging & Integrity':
        return {
          thinkingBudget: 1024,
          includeThoughts: true,
          reasoningTier: 'Fast (Low Latency)'
        };

      case 'Teledentistry & Systemic Health':
      case 'RSNA Knee Abnormality':
      case 'PhysioNet Telemetry':
      case 'Treatment Matrix':
      case 'Maternal & Postpartum':
      case 'Pre-Conception & Family Health':
        return {
          thinkingBudget: 8192,
          includeThoughts: true,
          reasoningTier: 'Deep Clinical Synthesis (High Acuity)'
        };

      case 'Functional Protocols':
      case 'Nutrition':
      case 'Monitoring & Follow-up':
      case 'Precision Nutrients':
      case 'Grow-Thyself Education':
      case 'Epigenetic Longevity':
      case 'Chronobiology Matrix':
      case 'Functional Medicine Matrix':
      case 'Seven Generations Stewardship':
      case 'Performance Optimization & Web Vitals':
      default:
        return {
          thinkingBudget: 4096,
          includeThoughts: true,
          reasoningTier: 'Standard (Balanced)'
        };
    }
  });

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

  public setCustomThinkingBudget(budget: number | null): void {
    this.customThinkingBudget.set(budget);
  }
}

