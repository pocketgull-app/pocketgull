import '@angular/compiler';
import { vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { LocalGemmaStudioComponent } from './local-gemma-studio.component';
import { WebLLMProvider } from '../services/ai/webllm.provider';
import { PatientStateService } from '../services/patient-state.service';

describe('LocalGemmaStudioComponent (100% Offline Local Gemma 3 Edge AI Studio)', () => {
  const createComponent = () => {
    const mockWebLlm = {
      loadEngine: vi.fn(),
      setModel: vi.fn(),
      sendMessage: vi.fn().mockResolvedValue('[Gemma 3 Local]: Offline protocol evaluated.'),
      selectedModelId: signal('gemma-3-2b'),
      activeModelName: signal('Gemma 3 2B (Ultra-Light Edge)'),
      tokenThroughput: signal(28.4),
      loadingProgress: signal(''),
      isLoadingProgress: signal(false),
      generateReportStream$: vi.fn()
    };

    const mockState = {
      age: signal(42),
      gender: signal('Female'),
      symptoms: signal(['Fatigue'])
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
    expect(comp.availableModels.length).toBeGreaterThanOrEqual(3);
  });

  it('2. Triggers WebGPU engine initialization on demand', async () => {
    const { comp, mockWebLlm } = createComponent();
    await comp.initializeEngine();
    expect(mockWebLlm.loadEngine).toHaveBeenCalled();
  });

  it('3. Sends offline inquiry and updates chat history with Gemma 3 response', async () => {
    const { comp, mockWebLlm } = createComponent();
    await comp.sendQuery('Evaluate ACOG preeclampsia criteria for BP 160/110.');

    expect(mockWebLlm.sendMessage).toHaveBeenCalledWith('Evaluate ACOG preeclampsia criteria for BP 160/110.');
    expect(comp.messages().length).toBe(2);
    expect(comp.messages()[0].sender).toBe('user');
    expect(comp.messages()[1].sender).toBe('gemma');
    expect(comp.messages()[1].text).toContain('[Gemma 3 Local]');
  });
});
