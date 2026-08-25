import { WebLlmHealthCardComponent } from './webllm-health-card.component';
import { signal } from '@angular/core';

describe('WebLlmHealthCardComponent Suite', () => {
  let component: WebLlmHealthCardComponent;
  let mockHealthService: any;

  beforeEach(() => {
    mockHealthService = {
      profile: signal({
        supported: true,
        adapterVendor: 'NVIDIA',
        adapterDescription: 'GeForce RTX 4090',
        maxBufferSizeMb: 4096,
        maxStorageBufferMb: 2048,
        estimatedVramTier: 'Tier 3 (>8GB)',
        recommendedModel: 'Llama-3.1-8B-Instruct-Q4F16',
        storageQuotaMb: 120000,
        storageUsedMb: 4500,
        webWorkerSupported: true,
        status: 'ready',
        lastCheckedAt: new Date().toISOString()
      }),
      isChecking: signal(false),
      probeHardware: vi.fn()
    };

    component = new WebLlmHealthCardComponent();
    (component as any).healthService = mockHealthService;
    component.profile = mockHealthService.profile;
  });

  it('1. Initializes component and triggers hardware probe on ngOnInit', () => {
    component.ngOnInit();
    expect(mockHealthService.probeHardware).toHaveBeenCalled();
  });

  it('2. Reflects WebGPU profile state accurately', () => {
    const prof = component.profile();
    expect(prof.supported).toBe(true);
    expect(prof.estimatedVramTier).toBe('Tier 3 (>8GB)');
    expect(prof.recommendedModel).toContain('Llama-3.1-8B');
  });

  it('3. Refreshes hardware profile when refresh() is invoked', () => {
    component.refresh();
    expect(mockHealthService.probeHardware).toHaveBeenCalled();
  });
});
