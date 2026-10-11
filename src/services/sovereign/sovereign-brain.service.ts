import { Injectable, inject, signal, computed } from '@angular/core';
import { SovereignFhirTaggerService, IFhirR4Bundle } from './sovereign-fhir-tagger.service';
import { VagalCircadianShieldService, IBiometricTelemetry, IVagalCircadianEvaluation } from './vagal-circadian-shield.service';
import { SamdCryptographicLedgerService, ISamdAuditRecord } from './samd-cryptographic-ledger.service';
import { BackpackDispensaryService, IWhoEmlProtocol, IPediatricMuacTriageResult, IMultilingualPassportSummary } from './backpack-dispensary.service';
import { OllamaProvider } from '../ai/ollama.provider';

export type SovereignGullPersonaKey = 'gulliver' | 'swoop' | 'sentinel' | 'samaritan' | 'drift' | 'quill' | 'skimmer';

export interface ISovereignPersonaRouting {
  personaKey: SovereignGullPersonaKey;
  displayName: string;
  specialty: string;
  activeModel: string;
  hardwareAcceleration: 'Apple Metal (UMA)' | 'NVIDIA CUDA (Tensor Cores)' | 'AMD DirectML / Vulkan' | 'In-Browser WebGPU / WebNN' | 'Deterministic Pure-TS';
  sovereignVector: 'Clinical Overview & Synthesis' | 'Causal Posology' | 'Recovery Vigilance' | 'WHO EML Emergency Triage' | 'Circadian & Vagal Shield' | '6-Language Health Passport' | 'Low-Latency Edge Inference';
}

@Injectable({
  providedIn: 'root'
})
export class SovereignBrainService {
  readonly fhirTagger: SovereignFhirTaggerService;
  readonly vagalShield: VagalCircadianShieldService;
  readonly samdLedger: SamdCryptographicLedgerService;
  readonly backpackDispensary: BackpackDispensaryService;
  readonly ollamaProvider?: OllamaProvider | null;

  constructor(
    fhirTagger?: SovereignFhirTaggerService,
    vagalShield?: VagalCircadianShieldService,
    samdLedger?: SamdCryptographicLedgerService,
    backpackDispensary?: BackpackDispensaryService,
    ollamaProvider?: OllamaProvider | null
  ) {
    this.fhirTagger = fhirTagger ?? new SovereignFhirTaggerService();
    this.vagalShield = vagalShield ?? new VagalCircadianShieldService();
    this.samdLedger = samdLedger ?? new SamdCryptographicLedgerService();
    this.backpackDispensary = backpackDispensary ?? new BackpackDispensaryService();
    this.ollamaProvider = ollamaProvider ?? null;
  }

  readonly activePersonaKey = signal<SovereignGullPersonaKey>('gulliver');

  /**
   * Hardware & Silicon profile dynamically determined from host capabilities.
   */
  readonly detectedSilicon = computed(() => {
    if (typeof window === 'undefined') return 'Server-Side SSR (Node.js)';
    if ('gpu' in navigator) return 'WebGPU Hardware Accelerated (Metal / D3D12 / Vulkan)';
    if ('ml' in navigator) return 'WebNN Dedicated NPU (Copilot+ PC)';
    return 'Wasm SIMD / Pure-TypeScript Fallback';
  });

  /**
   * Routing table connecting each Gull Squadron persona to its designated model and hardware role.
   */
  readonly personaRoutings = signal<Record<SovereignGullPersonaKey, ISovereignPersonaRouting>>({
    gulliver: {
      personaKey: 'gulliver',
      displayName: 'Gulliver',
      specialty: 'Overview & Chart Synthesis',
      activeModel: 'pocketgull-clinical:latest',
      hardwareAcceleration: 'NVIDIA CUDA (Tensor Cores)',
      sovereignVector: 'Clinical Overview & Synthesis'
    },
    swoop: {
      personaKey: 'swoop',
      displayName: 'Swoop',
      specialty: 'Posology & Precision Interventions',
      activeModel: 'causal-posology-4b',
      hardwareAcceleration: 'Apple Metal (UMA)',
      sovereignVector: 'Causal Posology'
    },
    sentinel: {
      personaKey: 'sentinel',
      displayName: 'Sentinel',
      specialty: 'Recovery Vigilance & Trends',
      activeModel: 'pocketgull-sentinel-peft',
      hardwareAcceleration: 'In-Browser WebGPU / WebNN',
      sovereignVector: 'Recovery Vigilance'
    },
    samaritan: {
      personaKey: 'samaritan',
      displayName: 'Samaritan',
      specialty: 'Good Samaritan Emergency Override',
      activeModel: 'backpack_dispensary.py',
      hardwareAcceleration: 'Deterministic Pure-TS',
      sovereignVector: 'WHO EML Emergency Triage'
    },
    drift: {
      personaKey: 'drift',
      displayName: 'Drift',
      specialty: 'Circadian Wellness & Vagal Renewal',
      activeModel: 'vagal_circadian_shield.py',
      hardwareAcceleration: 'Deterministic Pure-TS',
      sovereignVector: 'Circadian & Vagal Shield'
    },
    quill: {
      personaKey: 'quill',
      displayName: 'Quill',
      specialty: 'Dyslexia-Friendly Multilingual Passport',
      activeModel: 'multilingual_passport.py',
      hardwareAcceleration: 'Deterministic Pure-TS',
      sovereignVector: '6-Language Health Passport'
    },
    skimmer: {
      personaKey: 'skimmer',
      displayName: 'Skimmer',
      specialty: 'Sub-10ms Edge Inference',
      activeModel: 'pocketgull-edge:3b',
      hardwareAcceleration: 'In-Browser WebGPU / WebNN',
      sovereignVector: 'Low-Latency Edge Inference'
    }
  });

  readonly activePersona = computed(() => this.personaRoutings()[this.activePersonaKey()]);

  /**
   * Selects active Gull persona and synchronizes local Ollama model if running.
   */
  selectPersona(key: SovereignGullPersonaKey) {
    this.activePersonaKey.set(key);
    const routing = this.personaRoutings()[key];
    if (this.ollamaProvider && (routing.activeModel.includes('pocketgull') || routing.activeModel.includes('gemma'))) {
      this.ollamaProvider.setModel(routing.activeModel);
    }
  }

  /**
   * Executes end-to-end sovereign clinical deliberation:
   * 1. Generates clinical recommendation via local model (or offline fallback)
   * 2. Auto-tags conditions & medications into HL7 FHIR R4 Bundle
   * 3. Signs immutable record in SaMD Cryptographic Ledger
   */
  async processClinicalConsultation(prompt: string, patientId: string = 'POCKETGULL-ANON'): Promise<{
    recommendation: string;
    fhirBundle: IFhirR4Bundle;
    auditRecord: ISamdAuditRecord;
  }> {
    let recommendation = '';
    const activeModel = this.activePersona().activeModel;

    if (this.ollamaProvider && this.ollamaProvider.isConnected()) {
      const res = await this.ollamaProvider.generateText({ prompt, temperature: 0.1 });
      recommendation = res.text;
    }

    if (!recommendation) {
      recommendation = `[Sovereign CDS Protocol - Countess Ada Lovelace Salutogenic Baseline]
Patient presentation evaluated. Prioritize non-pharmacological Generalized Resistance Resources (GRRs):
1. 0.1 Hz vagal resonant breathing pacer (6 breaths/min) to balance autonomic tone.
2. Scotopic 650nm amber/red spectrum lighting to preserve endogenous melatonin.
3. Postprandial contraction-mediated GLUT4 walking prompts to restore euglycemic homeostasis.
4. If acute hypertension or distress escalates, consult certified clinician.`;
    }

    // Auto-tag into FHIR R4
    const fhirBundle = this.fhirTagger.extractEntitiesAndBuildFhir(`${prompt}\n${recommendation}`, patientId);

    // Cryptographically sign under FDA 21 CFR Part 11 / EU MDR
    const auditRecord = await this.samdLedger.signClinicalRecommendation({
      modelId: activeModel,
      promptInput: prompt,
      recommendation,
      paradigmConsensus: {
        western: 'Evidence-based acute guideline screening',
        salutogenic: 'Autonomous vagal and circadian co-regulation'
      }
    });

    return {
      recommendation,
      fhirBundle,
      auditRecord
    };
  }
}
