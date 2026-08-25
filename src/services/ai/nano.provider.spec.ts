import { TestBed } from '@angular/core/testing';
import { NanoProvider } from './nano.provider';
import { AiCacheService } from '../ai-cache.service';

describe('NanoProvider', () => {
  let provider: NanoProvider;
  let mockCache: Partial<AiCacheService>;

  beforeEach(() => {
    mockCache = {
      generateKey: vi.fn().mockResolvedValue('test-key'),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      providers: [
        NanoProvider,
        { provide: AiCacheService, useValue: mockCache }
      ]
    });

    provider = TestBed.inject(NanoProvider);
  });

  it('1. Provides an initial greeting referencing Chrome Built-in AI', async () => {
    const greeting = await provider.getInitialGreeting('test');
    expect(greeting).toContain('Chrome Built-in AI');
    expect(greeting).toContain('Gemma 4');
  });

  it('2. Generates clinical metrics stub for on-device analysis', async () => {
    const metrics = await provider.generateMetrics('Sample Clinical Report');
    expect(metrics).toEqual({ complexity: 5, stability: 5, certainty: 5 });
  });

  it('3. Verifies clinical report section safely when proofreader is absent', async () => {
    const verification = await provider.verifySection('Functional Protocols', 'Report text', 'Source data');
    expect(verification.status).toContain('Verified');
    expect(verification.issues).toEqual([]);
  });

  it('4. Handles multimodal image analysis rejection with helpful Chrome Canary guidance when API is absent', async () => {
    await expect(provider.analyzeImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))
      .rejects
      .toThrow(/Chrome Canary 153\+|chrome:\/\/flags\/#prompt-api-multimodal-input/i);
  });
});
