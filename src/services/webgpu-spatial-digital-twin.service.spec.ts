import '@angular/compiler';
import { describe, it, beforeEach, expect } from 'vitest';
import { WebgpuSpatialDigitalTwinService } from './webgpu-spatial-digital-twin.service';

describe('WebgpuSpatialDigitalTwinService Unit Suite', () => {
  let service: WebgpuSpatialDigitalTwinService;

  beforeEach(() => {
    service = new WebgpuSpatialDigitalTwinService();
  });

  it('1. Computes baseline cardiac organ biophysics', () => {
    service.selectedOrgan.set('HEART');
    service.heartRate.set(70);
    service.spo2Percent.set(98);

    const bio = service.organBiophysics();
    expect(bio.organ).toBe('HEART');
    expect(bio.perfusionRateMlMin).toBe(250);
    expect(bio.metabolicStressIndex).toBeLessThan(15);
    expect(bio.webgpuWdslShader).toContain('WebGPU WGSL');
  });

  it('2. Computes metabolic stress under hypoxia and tachycardia', () => {
    service.selectedOrgan.set('BRAIN');
    service.heartRate.set(130);
    service.spo2Percent.set(85);

    const bio = service.organBiophysics();
    expect(bio.metabolicStressIndex).toBeGreaterThan(40);
  });

  it('3. Generates 3D digital twin frame vector', () => {
    service.selectedOrgan.set('LIVER');
    const frame = service.computeDigitalTwinFrame();

    expect(frame.organ).toBe('LIVER');
    expect(frame.colorThermalVector.length).toBe(3);
    expect(frame.meshDeformationFactor).toBeGreaterThan(1.0);
  });
});
