import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { LocalGemmaStudioComponent } from './local-gemma-studio.component';
import { WebLLMProvider, AVAILABLE_GEMMA_MODELS } from '../services/ai/webllm.provider';
import { PatientStateService } from '../services/patient-state.service';

describe('LocalGemmaStudioComponent', () => {
  const createComponent = () => {
    const mockWebLlm = {
      loadEngine: vi.fn(),
      loadingProgress: signal(''),
      isLoadingProgress: signal(false),
      isEngineReady: signal(true),
      tokensPerSecond: signal(18.5),
      estimatedVramUsageMb: signal(1450),
      selectedModelId: signal('gemma-3-2b-it-q4f16_1-MLC'),
      currentModel: signal(AVAILABLE_GEMMA_MODELS[0]),
      setModel: vi.fn(),
      generateReportStream$: vi.fn(),
      generateEmergencyProtocol: vi.fn().mockReturnValue({
        scenario: 'Remote Maritime Protocol',
        category: 'MARITIME_REMOTE',
        immediateActions: ['Thermal wrap'],
        vitalTargets: 'Target 35°C',
        redFlags: ['Arrhythmia']
      })
    };

    const mockState = {
      age: signal(42),
      gender: signal('Female'),
      symptoms: signal(['Fatigue']),
      selectedIssues: signal([])
    };

    const injector = Injector.create({
      providers: [
        { provide: WebLLMProvider, useValue: mockWebLlm },
        { provide: PatientStateService, useValue: mockState }
      ]
    });

    const comp = runInInjectionContext(injector, () => new LocalGemmaStudioComponent());
    return { comp, mockWebLlm };
  };

  it('1. Creates component cleanly and initializes messages state', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.messages().length).toBe(0);
    expect(comp.availableModels.length).toBeGreaterThan(2);
  });

  it('2. Triggers WebGPU engine initialization on demand', async () => {
    const { comp, mockWebLlm } = createComponent();
    await comp.initializeEngine();
    expect(mockWebLlm.loadEngine).toHaveBeenCalled();
  });

  it('3. Triggers disaster emergency presets into chat stream', () => {
    const { comp, mockWebLlm } = createComponent();
    comp.triggerDisasterPreset('maritime');
    expect(mockWebLlm.generateEmergencyProtocol).toHaveBeenCalledWith('maritime');
    expect(comp.messages().length).toBe(2);
    expect(comp.messages()[1].text).toContain('Remote Maritime Protocol');
  });

  it('4. Selects Gemma 3 model architectures', () => {
    const { comp, mockWebLlm } = createComponent();
    comp.onSelectModel('gemma-3-7b-it-q4f16_1-MLC');
    expect(mockWebLlm.setModel).toHaveBeenCalledWith('gemma-3-7b-it-q4f16_1-MLC');
  });
});
