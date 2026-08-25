import { WebLlmHealthService } from './webllm-health.service';

describe('WebLlmHealthService Suite', () => {
  let service: WebLlmHealthService;

  beforeEach(() => {
    service = new WebLlmHealthService();
  });

  it('1. Initializes with default profile state', () => {
    const p = service.profile();
    expect(p.status).toBeDefined();
    expect(typeof p.webWorkerSupported).toBe('boolean');
    expect(p.recommendedModel).toBeDefined();
  });

  it('2. Probes client hardware and returns a structured profile', async () => {
    const profile = await service.probeHardware();

    expect(profile.lastCheckedAt).toBeDefined();
    expect(profile.storageQuotaMb).toBeGreaterThanOrEqual(0);
    expect(typeof profile.supported).toBe('boolean');
    expect(service.profile().lastCheckedAt).toBe(profile.lastCheckedAt);
  });
});
