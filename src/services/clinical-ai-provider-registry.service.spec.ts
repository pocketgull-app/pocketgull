import { TestBed } from '@angular/core/testing';
import { ClinicalAiProviderRegistryService } from './clinical-ai-provider-registry.service';
import { GeminiProvider } from './ai/gemini.provider';
import { InteractionsProvider } from './ai/interactions.provider';

describe('ClinicalAiProviderRegistryService', () => {
  let service: ClinicalAiProviderRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GeminiProvider, useValue: { generateCompletion: () => Promise.resolve('Mock Gemini') } },
        { provide: InteractionsProvider, useValue: { generateMetrics: () => Promise.resolve({ complexity: 5, stability: 5, certainty: 5 }) } }
      ]
    });
    service = TestBed.inject(ClinicalAiProviderRegistryService);
  });

  it('1. Initializes default AI provider as Google Gemini 3.7 Interactions', () => {
    const current = service.currentEngine();
    expect(current.id).toBe('gemini-interactions');
    expect(current.name).toContain('Gemini 3.7 Interactions');
    expect(current.vendor).toContain('Google Cloud');
  });

  it('2. Switches provider to local WebGPU and executes unified inference', async () => {
    service.setActiveEngine('local-webgpu');
    expect(service.currentEngine().id).toBe('local-webgpu');

    const result = await service.executeUnifiedInference('Analyze fever');
    expect(result).toContain('On-Device AI');
  });

  it('3. Routes completion through IBM watsonx.ai provider', async () => {
    service.setActiveEngine('ibm-watsonx');
    const result = await service.executeUnifiedInference('Oncology staging evaluation');
    expect(result).toContain('IBM watsonx');
  });

  it('4. Executes inference via Gemini Interactions API engine', async () => {
    service.setActiveEngine('gemini-interactions');
    const result = await service.executeUnifiedInference('Differential diagnosis for thoracic pain');
    expect(result).toContain('Google Gemini 3.7 Interactions API');
    expect(result).toContain('Thinking Budget: 2048');
  });

  it('5. Switches provider to onnx-neural-edge and executes JAX/Flax ONNX inference', async () => {
    service.setActiveEngine('onnx-neural-edge');
    expect(service.currentEngine().id).toBe('onnx-neural-edge');
    expect(service.currentEngine().latencyMs).toBe(3);

    const result = await service.executeUnifiedInference('Evaluate patient vital risk');
    expect(result).toContain('JAX/Flax ONNX');
  });
});
