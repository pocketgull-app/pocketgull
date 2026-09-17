import { TestBed } from '@angular/core/testing';
import { OllamaProvider } from './ollama.provider';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('OllamaProvider Suite', () => {
  let provider: OllamaProvider;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    TestBed.configureTestingModule({
      providers: [OllamaProvider]
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('1. Initializes with default configuration and gemma4:latest model', () => {
    provider = TestBed.inject(OllamaProvider);
    expect(provider).toBeTruthy();
    expect(provider.baseUrl()).toBe('http://localhost:11434');
    expect(provider.selectedModelId()).toBe('gemma4:latest');
  });

  it('2. Discovers installed models via checkServerHealth()', async () => {
    const mockTagsResponse = {
      models: [
        {
          name: 'gemma4:latest',
          model: 'gemma4:latest',
          size: 9608350718,
          digest: 'c6eb396dbd5992bbe3f5cdb947e8bbc0ee413d7c17e2beaae69f5d569cf982eb',
          details: { parameter_size: '8.0B' }
        },
        {
          name: 'moondream:latest',
          model: 'moondream:latest',
          size: 1738451197,
          digest: '55fc3abd386771e5b5d1bbcc732f3c3f4df6e9f9f08f1131f9cc27ba2d1eec5b',
          details: { parameter_size: '1B' }
        }
      ]
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTagsResponse
    });

    provider = TestBed.inject(OllamaProvider);
    const connected = await provider.checkServerHealth();

    expect(connected).toBe(true);
    expect(provider.isConnected()).toBe(true);
    expect(provider.availableModels().length).toBe(2);
    expect(provider.selectedModelId()).toBe('gemma4:latest');
    expect(provider.statusMessage()).toContain('Ollama Server Connected');
  });

  it('3. Handles offline/unreachable server gracefully without crashing', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    provider = TestBed.inject(OllamaProvider);
    const connected = await provider.checkServerHealth();

    expect(connected).toBe(false);
    expect(provider.isConnected()).toBe(false);
    expect(provider.statusMessage()).toContain('unreachable');
  });

  it('4. Streams clinical report tokens from /api/chat', async () => {
    const mockStreamChunks = [
      JSON.stringify({ message: { role: 'assistant', content: 'Act 1: ' } }) + '\n',
      JSON.stringify({ message: { role: 'assistant', content: 'Genetic baseline stable. ' } }) + '\n',
      JSON.stringify({ message: { role: 'assistant', content: 'Act 2: PIRA controlled.' } }) + '\n'
    ];

    let chunkIdx = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(async () => {
        if (chunkIdx < mockStreamChunks.length) {
          const chunk = mockStreamChunks[chunkIdx++];
          return { done: false, value: new TextEncoder().encode(chunk) };
        }
        return { done: true, value: undefined };
      })
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => mockReader
      }
    });

    provider = TestBed.inject(OllamaProvider);
    const stream = provider.generateReportStream$('Patient Data', 'Functional Protocols', 'Instructions');

    let fullText = '';
    for await (const token of stream) {
      fullText += token;
    }

    expect(fullText).toBe('Act 1: Genetic baseline stable. Act 2: PIRA controlled.');
  });

  it('5. Generates structured clinical metrics with JSON parsing', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: {
          content: JSON.stringify({ complexity: 7.2, stability: 8.4, certainty: 9.1 })
        }
      })
    });

    provider = TestBed.inject(OllamaProvider);
    const metrics = await provider.generateMetrics('Sample report text');

    expect(metrics.complexity).toBe(7.2);
    expect(metrics.stability).toBe(8.4);
    expect(metrics.certainty).toBe(9.1);
  });

  it('6. Analyzes medical images with vision model', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: 'Brain MRI T2 FLAIR demonstrates hyperintense periventricular demyelinating lesions.'
      })
    });

    provider = TestBed.inject(OllamaProvider);
    provider.availableModels.set([
      { name: 'moondream:latest', model: 'moondream:latest', size: 1738451197, digest: 'abc' }
    ]);

    const result = await provider.analyzeImage('base64DataString', 'Multiple Sclerosis Protocol');
    expect(result).toContain('Brain MRI T2 FLAIR');
  });

  it('7. Maintains chat conversation history and sends messages', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { role: 'assistant', content: 'Consider cooling vest protocol for Uhthoff phenomenon.' }
      })
    });

    provider = TestBed.inject(OllamaProvider);
    await provider.startChat('Patient Mara Santos', 'MS Consult');
    const reply = await provider.sendMessage('What is the guidance for thermal fatigue?');

    expect(reply).toContain('cooling vest protocol');
  });
});
