import { expect } from 'vitest';
import { WebLLMProvider, LOCAL_GEMMA_MODELS } from './webllm.provider';

describe('WebLLMProvider (WebGPU Local Gemma 3 Edge AI)', () => {
  const provider = new WebLLMProvider();

  it('1. Initialized with idle loading signals and Gemma 3 default model', () => {
    expect(provider.loadingProgress()).toBe('');
    expect(provider.isLoadingProgress()).toBe(false);
    expect(provider.selectedModelId()).toBe('gemma-3-2b');
    expect(provider.getAvailableModels().length).toBe(3);
  });

  it('2. Switches models accurately between Gemma 3 2B, Gemma 3 7B, and Gemma 2 2B', () => {
    provider.setModel('gemma-3-7b');
    expect(provider.selectedModelId()).toBe('gemma-3-7b');
    expect(provider.activeModelName()).toContain('Gemma 3 7B');

    provider.setModel('gemma-3-2b');
    expect(provider.selectedModelId()).toBe('gemma-3-2b');
  });

  it('3. Generates offline hermetic responses for emergency field prompts', async () => {
    const preeclampsiaRes = await provider.sendMessage('Emergency preeclampsia protocol with BP 165/112');
    expect(preeclampsiaRes).toContain('Labetalol');
    expect(preeclampsiaRes).toContain('Magnesium Sulfate');

    const cypRes = await provider.sendMessage('Check CYP2D6 metabolizer status for Codeine');
    expect(cypRes).toContain('CYP2D6');
    expect(cypRes).toContain('CPIC');
  });

  it('4. Rejects verification payloads as deferred downward for WebGPU', async () => {
    await expect(provider.verifySection('Summary Overview', 'content', 'source')).rejects.toThrow(
      'WebGPU verification payload too large for current configuration. Deferring downward.'
    );
  });
});
