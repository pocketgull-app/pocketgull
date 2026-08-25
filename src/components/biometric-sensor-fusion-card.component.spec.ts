import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { BiometricSensorFusionCardComponent } from './biometric-sensor-fusion-card.component';
import { BiometricSensorFusionService } from '../services/hardware/biometric-sensor-fusion.service';

describe('BiometricSensorFusionCardComponent', () => {
  const createComponent = () => {
    const mockFusionService = {
      isStreaming: signal(false),
      currentFrame: signal({
        timestamp: new Date().toISOString(),
        ppgHrvMs: 65,
        cgmGlucoseMgDl: 104,
        respiratoryRateBpm: 16,
        spo2Pct: 98,
        fusionQualityIndex: 94,
        fusionStatus: 'optimal'
      }),
      activeAlerts: signal([]),
      startSensorStream: vi.fn(),
      stopSensorStream: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: BiometricSensorFusionService, useValue: mockFusionService }
      ]
    });

    const comp = runInInjectionContext(injector, () => new BiometricSensorFusionCardComponent());
    return { comp, mockFusionService };
  };

  it('1. Creates component and resolves sensor telemetry frame signals', () => {
    const { comp } = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.fusion.currentFrame()?.ppgHrvMs).toBe(65);
  });

  it('2. Toggles sensor streaming when toggleStream is invoked', () => {
    const { comp, mockFusionService } = createComponent();
    comp.toggleStream();
    expect(mockFusionService.startSensorStream).toHaveBeenCalled();
  });
});
