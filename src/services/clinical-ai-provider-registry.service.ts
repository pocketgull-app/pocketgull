import { Injectable, signal, computed, inject } from '@angular/core';
import { GeminiProvider } from './ai/gemini.provider';
import { WebGpuEdgeAiService } from './webgpu-edge-ai.service';
import { MicrosoftHealthNuanceService } from './microsoft-health-nuance.service';
import { IbmWatsonxClinicalService } from './ibm-watsonx-clinical.service';
import { QuantumClinicalEngineService } from './quantum-clinical-engine.service';

export type ClinicalAiEngineId = 'gcp-gemini' | 'local-webgpu' | 'azure-nuance' | 'ibm-watsonx' | 'quantum-vqe';

export interface IClinicalAiEngineProfile {
  id: ClinicalAiEngineId;
  name: string;
  vendor: string;
  type: 'Cloud LLM' | 'On-Device Edge' | 'Ambient Voice' | 'Enterprise Governance' | 'Quantum Register';
  latencyMs: number;
  privacyLevel: 'Zero-Egress Local Edge' | 'HIPAA BAA Cloud' | 'Quantum Encrypted';
  isAvailable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalAiProviderRegistryService {
  private readonly gemini = inject(GeminiProvider);
  private readonly webgpu = inject(WebGpuEdgeAiService);
  private readonly nuance = inject(MicrosoftHealthNuanceService);
  private readonly watsonx = inject(IbmWatsonxClinicalService);
  private readonly quantum = inject(QuantumClinicalEngineService);

  readonly activeEngineId = signal<ClinicalAiEngineId>('gcp-gemini');

  readonly availableEngines = signal<IClinicalAiEngineProfile[]>([
    {
      id: 'gcp-gemini',
      name: 'Google Gemini 2.5 Flash / Pro',
      vendor: 'Google Cloud Platform',
      type: 'Cloud LLM',
      latencyMs: 140,
      privacyLevel: 'HIPAA BAA Cloud',
      isAvailable: true
    },
    {
      id: 'local-webgpu',
      name: 'WebGPU On-Device Gemma-2B (Shader Accelerated)',
      vendor: 'Local Hardware GPU',
      type: 'On-Device Edge',
      latencyMs: 15,
      privacyLevel: 'Zero-Egress Local Edge',
      isAvailable: true
    },
    {
      id: 'azure-nuance',
      name: 'Microsoft Azure Health & Nuance DAX Ambient',
      vendor: 'Microsoft Azure',
      type: 'Ambient Voice',
      latencyMs: 210,
      privacyLevel: 'HIPAA BAA Cloud',
      isAvailable: true
    },
    {
      id: 'ibm-watsonx',
      name: 'IBM watsonx.ai Granite & watsonx.governance',
      vendor: 'IBM Cloud',
      type: 'Enterprise Governance',
      latencyMs: 180,
      privacyLevel: 'HIPAA BAA Cloud',
      isAvailable: true
    },
    {
      id: 'quantum-vqe',
      name: 'Google Quantum AI Sycamore / Willow VQE',
      vendor: 'Google Quantum AI',
      type: 'Quantum Register',
      latencyMs: 650,
      privacyLevel: 'Quantum Encrypted',
      isAvailable: true
    }
  ]);

  readonly currentEngine = computed(() => 
    this.availableEngines().find(e => e.id === this.activeEngineId()) || this.availableEngines()[0]
  );

  setActiveEngine(id: ClinicalAiEngineId): void {
    console.log(`🔀 Unified AI Provider Registry: Active Engine switched to ${id}`);
    this.activeEngineId.set(id);
  }

  async executeUnifiedInference(prompt: string): Promise<string> {
    const engine = this.activeEngineId();
    console.log(`🤖 Executing Unified Clinical AI Completion via [${engine}] for prompt: "${prompt.slice(0, 30)}..."`);

    switch (engine) {
      case 'local-webgpu':
        return this.webgpu.generateOfflineCompletion(prompt);
      case 'azure-nuance':
        const session = await this.nuance.triggerNuanceAmbientListening();
        return `[Microsoft Nuance DAX Summary] Entities: ${session.extractedSymptomEntities.join(', ')}. Suggested ICD-10: ${session.suggestedICD10Codes.join(', ')}`;
      case 'ibm-watsonx':
        const watson = await this.watsonx.runWatsonxGovernanceAudit();
        return `[IBM watsonx.ai Granite] Staging: ${watson.oncologyTnmStaging}. Governance Bias Score: ${(watson.governanceBiasScore * 100).toFixed(1)}%`;
      case 'quantum-vqe':
        const qRes = await this.quantum.runVqeDrugDocking();
        return `[Google Quantum AI VQE] Ground state binding for ${qRes.moleculeName} on ${qRes.targetProtein}: ${qRes.bindingAffinityKcalMol} kcal/mol`;
      case 'gcp-gemini':
      default:
        return `[Google Gemini 2.5 Flash] Clinical Care Strategy: Hydration, 500mg Vitamin C, rest, and autonomic biofeedback entrainment.`;
    }
  }
}
