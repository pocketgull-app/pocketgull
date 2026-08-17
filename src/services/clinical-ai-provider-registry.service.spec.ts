import { TestBed } from '@angular/core/testing';
import { ClinicalAiProviderRegistryService } from './clinical-ai-provider-registry.service';
import { GeminiProvider } from './ai/gemini.provider';

describe('ClinicalAiProviderRegistryService', () => {
  let service: ClinicalAiProviderRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: GeminiProvider, useValue: { generateCompletion: () => Promise.resolve('Mock Gemini') } }
      ]
    });
    service = TestBed.inject(ClinicalAiProviderRegistryService);
  });

  it('1. Initializes default AI provider as Google Gemini 2.5 Flash', () => {
    const current = service.currentEngine();
    expect(current.id).toBe('gcp-gemini');
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
});
