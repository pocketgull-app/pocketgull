import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { LocalGemmaStudioComponent } from './local-gemma-studio.component';
import { WebLLMProvider } from '../services/ai/webllm.provider';
import { PatientStateService } from '../services/patient-state.service';

describe('LocalGemmaStudioComponent', () => {
  const createComponent = () => {
    const mockWebLlm = {
      loadEngine: vi.fn(),
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
  });

  it('2. Triggers WebGPU engine initialization on demand', async () => {
    const { comp, mockWebLlm } = createComponent();
    await comp.initializeEngine();
    expect(mockWebLlm.loadEngine).toHaveBeenCalled();
  });
});
