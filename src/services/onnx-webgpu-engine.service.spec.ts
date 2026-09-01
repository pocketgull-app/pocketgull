import '@angular/compiler';
import { OnnxWebGpuEngineService } from './onnx-webgpu-engine.service';

describe('OnnxWebGpuEngineService Unit Suite', () => {
  let service: OnnxWebGpuEngineService;

  beforeEach(() => {
    service = new OnnxWebGpuEngineService();
  });

  it('1. Initializes default model metadata and backend detection signals', () => {
    const meta = service.modelMetadata();
    expect(meta.modelName).toBe('flax_nnx_clinical_scorer');
    expect(meta.opsetVersion).toBe(20);
    expect(meta.inputDim).toBe(32);
    expect(meta.outputDim).toBe(1);
    expect(service.isReady()).toBe(false);
    expect(service.lastInference()).toBeNull();
  });

  it('2. Compiles compute kernels, runs warmup pass, and updates ready state', async () => {
    const ready = await service.initializeEngine();
    expect(ready).toBe(true);
    expect(service.isReady()).toBe(true);
    expect(service.modelMetadata().isWarmedUp).toBe(true);
  });

  it('3. Evaluates single-patient risk score with calibrated sigmoid probability and attestation', async () => {
    await service.initializeEngine();
    const features = new Array(32).fill(0.5);
    const result = await service.scorePatient('PT-JAX-001', features);

    expect(result.patientId).toBe('PT-JAX-001');
    expect(result.riskScore).toBeGreaterThanOrEqual(0.0);
    expect(result.riskScore).toBeLessThanOrEqual(1.0);
    expect(['STAT_EMERGENCY', 'URGENT', 'ROUTINE']).toContain(result.acuityLevel);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0.0);
    expect(result.integrityDigest).toMatch(/^0x_onnx_/);
    expect(service.lastInference()?.patientId).toBe('PT-JAX-001');
  });

  it('4. Executes vectorized batch scoring and computes throughput telemetry', async () => {
    await service.initializeEngine();
    const batch = [
      { patientId: 'PT-001', features: new Array(32).fill(0.2) },
      { patientId: 'PT-002', features: new Array(32).fill(0.8) },
      { patientId: 'PT-003', features: new Array(32).fill(0.5) }
    ];

    const batchRes = await service.scoreBatch(batch);
    expect(batchRes.results.length).toBe(3);
    expect(batchRes.totalLatencyMs).toBeGreaterThanOrEqual(0.0);
    expect(batchRes.results[0].patientId).toBe('PT-001');
    expect(batchRes.results[1].patientId).toBe('PT-002');
    expect(batchRes.results[2].patientId).toBe('PT-003');
  });
});
