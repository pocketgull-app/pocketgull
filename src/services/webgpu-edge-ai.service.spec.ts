import { TestBed } from '@angular/core/testing';
import { WebGpuEdgeAiService } from './webgpu-edge-ai.service';

describe('WebGpuEdgeAiService', () => {
  let service: WebGpuEdgeAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebGpuEdgeAiService);
  });

  it('1. Initializes WebGPU device status with hardware vendor', () => {
    const status = service.deviceStatus();
    expect(status.isWebGpuSupported).toBe(true);
    expect(status.gpuVendor).toBe('NVIDIA CUDA / TensorCore');
    expect(status.status).toBe('UNINITIALIZED');
  });

  it('2. Detects native hardware GPU adapter', async () => {
    const detected = await service.detectNativeGpuHardware();
    expect(detected.maxBufferBindingSizeMb).toBeGreaterThan(0);
  });

  it('3. Loads model weights and compiles WebGPU compute shader pipeline', async () => {
    const success = await service.initializeWebGpuEngine('gemma-2b-it-q4');
    expect(success).toBe(true);
    expect(service.isReady()).toBe(true);
    expect(service.deviceStatus().activeModel).toBe('gemma-2b-it-q4');
  });

  it('4. Generates offline completion via on-device native GPU', async () => {
    const response = await service.generateOfflineCompletion('Evaluate acute cough and low grade fever');
    expect(response).toContain('Gemma-2B On-Device AI');
  });
});
