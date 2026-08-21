import '@angular/compiler';
import { expect, vi } from 'vitest';
import { WebLLMProvider, AVAILABLE_GEMMA_MODELS } from './webllm.provider';

describe('WebLLMProvider (WebGPU Local Gemma 3)', () => {
  let provider: WebLLMProvider;

  beforeEach(() => {
    provider = new WebLLMProvider();
  });

  it('1. Initialized with default Gemma 3 2B model and idle signals', () => {
    expect(provider.selectedModelId()).toBe('gemma-3-2b-it-q4f16_1-MLC');
    expect(provider.loadingProgress()).toBe('');
    expect(provider.isLoadingProgress()).toBe(false);
    expect(provider.tokensPerSecond()).toBe(0);
    expect(provider.estimatedVramUsageMb()).toBe(1450);
  });

  it('2. Switches model architecture and adjusts estimated VRAM requirements', () => {
    provider.setModel('gemma-3-7b-it-q4f16_1-MLC');
    expect(provider.selectedModelId()).toBe('gemma-3-7b-it-q4f16_1-MLC');
    expect(provider.estimatedVramUsageMb()).toBe(4200);

    provider.setModel('gemma-3-1b-it-q4f32_1-MLC');
    expect(provider.selectedModelId()).toBe('gemma-3-1b-it-q4f32_1-MLC');
    expect(provider.estimatedVramUsageMb()).toBe(950);
  });

  it('3. Generates rapid offline emergency disaster response protocols', () => {
    const maritime = provider.generateEmergencyProtocol('maritime hypothermia');
    expect(maritime.category).toBe('MARITIME_REMOTE');
    expect(maritime.immediateActions.length).toBeGreaterThan(0);
    expect(maritime.vitalTargets).toContain('35.0°C');

    const trauma = provider.generateEmergencyProtocol('wilderness burn and fracture');
    expect(trauma.category).toBe('WILDERNESS_TRAUMA');
    expect(trauma.vitalTargets).toContain('Radial pulse');

    const startTriage = provider.generateEmergencyProtocol('mass casualty event');
    expect(startTriage.category).toBe('MASS_CASUALTY_START');
    expect(startTriage.immediateActions[0]).toContain('GREEN');
  });

  it('4. Provides local greeting and offline knowledge synthesis', async () => {
    const greeting = await provider.getInitialGreeting('hello');
    expect(greeting).toContain('Google Gemma 3 2B Instruct');

    const synth = await provider.synthesizeKnowledge('test');
    expect(synth.source).toBe('LOCAL_GEMMA_3_OFFLINE');
    expect(synth.cochraneRiskOfBias).toBe('LOW');
  });
});
