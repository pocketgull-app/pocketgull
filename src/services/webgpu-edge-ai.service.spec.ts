import '@angular/compiler';
import { WebGpuEdgeAiService } from './webgpu-edge-ai.service';

describe('WebGpuEdgeAiService Unit Suite', () => {
  let service: WebGpuEdgeAiService;

  beforeEach(() => {
    service = new WebGpuEdgeAiService();
  });

  it('1. Initializes default device status and telemetry signals', () => {
    const status = service.deviceStatus();
    expect(status.isWebGpuSupported).toBe(true);
    expect(status.status).toBe('UNINITIALIZED');
    expect(service.isReady()).toBe(false);

    const telemetry = service.telemetry();
    expect(telemetry.inferenceLatencyMs).toBe(0);
  });

  it('2. Compiles compute shader pipeline and updates ready state', async () => {
    const ready = await service.initializeWebGpuEngine('gemma-2b-it-q4');
    expect(ready).toBe(true);
    expect(service.isReady()).toBe(true);
    expect(service.deviceStatus().activeModel).toBe('gemma-2b-it-q4');
  });

  it('3. Generates offline completion and computes execution telemetry', async () => {
    const result = await service.generateOfflineCompletion('Patient reporting elevated systemic fatigue');
    expect(result).toContain('Gemma-2B On-Device AI');
    
    const telemetry = service.telemetry();
    expect(telemetry.inferenceLatencyMs).toBeGreaterThan(0);
    expect(telemetry.tokensPerSecond).toBeGreaterThan(0);
    expect(telemetry.memoryAllocatedMb).toBe(1450);
  });

  it('4. Generates structured offline assessment for space microgravity context', async () => {
    const res = await service.generateStructuredOfflineAssessment('Spaceflight crew member on 90-day Lunar Gateway mission');
    expect(res.assessment).toBeDefined();
    expect(res.recommendations.length).toBeGreaterThanOrEqual(4);
    expect(res.recommendations.some(r => r.includes('axial load resistive exercise'))).toBe(true);
  });
});
