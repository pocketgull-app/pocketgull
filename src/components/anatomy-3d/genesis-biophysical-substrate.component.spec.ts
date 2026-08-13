import '@angular/compiler';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { GenesisBiophysicalSubstrateComponent } from './genesis-biophysical-substrate.component';
import { WebGpuEdgeAiService } from '../../services/webgpu-edge-ai.service';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} })
  };
});

describe('GenesisBiophysicalSubstrateComponent Unit Suite', () => {
  let component: GenesisBiophysicalSubstrateComponent;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: WebGpuEdgeAiService }] });
    component = runInInjectionContext(injector, () => new GenesisBiophysicalSubstrateComponent());
  });

  it('1. Initializes default active substrate to bone', () => {
    expect(component.activeSubstrate()).toBe('bone');
    expect(component.currentParams().roughness).toBe(0.65);
    expect(component.bmdResorptionRate()).toBe(1.5);
    expect(component.sibiScore()).toBe(6.2);
  });

  it('2. Switches substrate and updates physical material parameters', () => {
    component.setSubstrate('dental');
    expect(component.activeSubstrate()).toBe('dental');
    expect(component.currentParams().roughness).toBe(0.15);
    expect(component.currentParams().metalness).toBe(0.0);

    component.setSubstrate('vascular');
    expect(component.activeSubstrate()).toBe('vascular');
    expect(component.currentParams().roughness).toBe(0.25);
  });

  it('3. Updates microgravity BMD resorption and SIBI burden signals', () => {
    component.bmdResorptionRate.set(2.4);
    expect(component.bmdResorptionRate()).toBe(2.4);

    component.sibiScore.set(8.5);
    expect(component.sibiScore()).toBe(8.5);
  });

  it('4. Executes offline edge AI assessment trigger', async () => {
    await component.runOfflineEdgeAssessment();
    expect(component.edgeAi.telemetry().computeBackend).toBeDefined();
  });
});
