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
    (globalThis as any).ai = undefined;
    (globalThis as any).window = {};
    await expect(provider.analyzeImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='))
      .rejects
      .toThrow(/Chrome Canary 153\+|chrome:\/\/flags\/#prompt-api-multimodal-input/i);
  });

  it('5. Successfully analyzes multimodal image on-device when Chrome Multimodal API is available', async () => {
    const mockSession = {
      prompt: vi.fn().mockResolvedValue('Objective Observation: 1x1 pixel test swatch showing clear erythema-free boundary.'),
      destroy: vi.fn(),
    };
    (globalThis as any).window = globalThis;
    (globalThis as any).ai = {
      languageModel: {
        capabilities: vi.fn().mockResolvedValue({ available: 'readily' }),
        create: vi.fn().mockResolvedValue(mockSession),
      }
    };

    const result = await provider.analyzeImage(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'Dermatology inspection'
    );

    expect(result).toContain('Objective Observation');
    expect(mockSession.prompt).toHaveBeenCalled();
  });

  it('6. Integrates with window.ai.proofreader when available to flag clinical phrasing adjustments', async () => {
    (globalThis as any).window = globalThis;
    (globalThis as any).ai = {
      proofreader: {
        capabilities: vi.fn().mockResolvedValue({ available: 'readily' }),
        create: vi.fn().mockResolvedValue({
          proofread: vi.fn().mockResolvedValue({
            corrections: [
              { original: '5.0 mg', suggested: '5 mg', explanation: 'Prohibit trailing zero per ISMP standards' }
            ]
          })
        })
      }
    };

    const verification = await provider.verifySection('Prescription Details', 'Take 5.0 mg daily', 'Source');
    expect(verification.status).toContain('Verified by On-Device Built-in AI');
    expect(verification.issues.length).toBe(1);
    expect(verification.issues[0].suggestedFix).toBe('5 mg');
  });
});
