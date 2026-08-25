import { WebLLMProvider } from './webllm.provider';

describe('WebLLMProvider (WebGPU Local Gemma)', () => {
  const provider = new WebLLMProvider();

  it('1. Initialized with idle loading signals', () => {
    expect(provider.loadingProgress()).toBe('');
    expect(provider.isLoadingProgress()).toBe(false);
  });

  it('2. Rejects verification payloads as deferred downward for WebGPU', async () => {
    await expect(provider.verifySection('Summary Overview', 'content', 'source')).rejects.toThrow(
      'WebGPU verification payload too large for current configuration. Deferring downward.'
    );
  });
});
