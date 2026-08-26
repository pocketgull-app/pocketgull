import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { LocalGemmaStudioComponent } from './local-gemma-studio.component';
import { WebLLMProvider, AVAILABLE_GEMMA_MODELS } from '../services/ai/webllm.provider';
import { NanoProvider } from '../services/ai/nano.provider';
import { OnDeviceEmbedderService } from '../services/ai/on-device-embedder.service';
import { HardwareTelemetryService } from '../services/hardware/hardware-telemetry.service';
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

    const mockNano = {
      isAiSupported: signal(true),
      isProofreaderSupported: signal(true),
      isClassifierSupported: signal(true),
      verifySection: vi.fn().mockResolvedValue({
        isSupported: true,
        passed: false,
        issues: [
          { type: 'clarity', severity: 'error', message: 'Avoid trailing zero (5.0 mg)', suggestion: 'Use 5 mg' }
        ]
      }),
      generateReportStream$: vi.fn()
    };

    const mockEmbedder = {
      isSupported: signal(true),
      isComputing: signal(false),
      computeEmbedding: vi.fn().mockResolvedValue(new Float32Array(256).fill(0.1)),
      findTopMatches: vi.fn().mockResolvedValue([
        { id: 'dpn', data: { label: 'Diabetic Peripheral Neuropathy' }, score: 0.92, text: 'burning pain' },
        { id: 'pots', data: { label: 'POTS' }, score: 0.45, text: 'orthostatic' }
      ])
    };

    const mockHardware = {
      primaryGpu: signal({ vendor: 'intel', name: 'Intel Iris Xe' }),
      recommendedExecutionPath: signal('on-device-nano')
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
        { provide: NanoProvider, useValue: mockNano },
        { provide: OnDeviceEmbedderService, useValue: mockEmbedder },
        { provide: HardwareTelemetryService, useValue: mockHardware },
        { provide: PatientStateService, useValue: mockState }
      ]
    });

    const comp = runInInjectionContext(injector, () => new LocalGemmaStudioComponent());
    return { comp, mockWebLlm, mockNano, mockEmbedder };
  };

  it('1. Creates component cleanly and initializes default signals', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.messages().length).toBe(0);
    expect(comp.activeTab()).toBe('chat');
    expect(comp.selectedEngine()).toBe('builtin-gemma4');
  });

  it('2. Switches active studio tabs', () => {
    const { comp } = createComponent();
    comp.setActiveTab('embedder');
    expect(comp.activeTab()).toBe('embedder');
    comp.setActiveTab('proofreader');
    expect(comp.activeTab()).toBe('proofreader');
    comp.setActiveTab('classifier');
    expect(comp.activeTab()).toBe('classifier');
  });

  it('3. Runs vector RAG embedding match', async () => {
    const { comp, mockEmbedder } = createComponent();
    comp.embedQueryText = 'burning foot pain';
    await comp.runEmbedderMatching();
    expect(mockEmbedder.findTopMatches).toHaveBeenCalledWith('burning foot pain', expect.any(Array), 7);
    expect(comp.archetypeMatches().length).toBe(2);
    expect(comp.archetypeMatches()[0].label).toContain('Diabetic Peripheral Neuropathy');
  });

  it('4. Audits clinical note safety in proofreader tab', async () => {
    const { comp, mockNano } = createComponent();
    comp.proofreaderInputText = 'Administer Morphine 5.0 mg IV';
    await comp.runProofreaderCheck();
    expect(mockNano.verifySection).toHaveBeenCalled();
    expect(comp.proofreadResults()).toBeTruthy();
    expect(comp.proofreadResults()!.passed).toBe(false);
    expect(comp.proofreadResults()!.issues.length).toBeGreaterThan(0);
  });

  it('5. Classifies triage acuity correctly', () => {
    const { comp } = createComponent();
    comp.setClassifierPreset('stat');
    expect(comp.classifierResult()?.level).toBe('STAT_EMERGENCY');
    expect(comp.classifierResult()?.confidence).toBeGreaterThan(0.9);

    comp.setClassifierPreset('routine');
    expect(comp.classifierResult()?.level).toBe('ROUTINE');
  });

  it('6. Triggers disaster emergency presets into chat stream', () => {
    const { comp, mockWebLlm } = createComponent();
    comp.triggerDisasterPreset('maritime');
    expect(mockWebLlm.generateEmergencyProtocol).toHaveBeenCalledWith('maritime');
    expect(comp.messages().length).toBe(2);
    expect(comp.messages()[1].text).toContain('Remote Maritime Protocol');
  });
});
