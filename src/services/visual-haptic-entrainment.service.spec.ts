import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { VisualHapticEntrainmentService } from './visual-haptic-entrainment.service';

describe('VisualHapticEntrainmentService (Contactless Visual rPPG Camera Heartbeat-to-Haptic Entrainment)', () => {
  let service: VisualHapticEntrainmentService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        VisualHapticEntrainmentService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(VisualHapticEntrainmentService));
  });

  it('1. Initializes default optical pulse tracking parameters', () => {
    const target = service.activeTarget();
    expect(target.opticallyDetectedBpm).toBe(72);
    expect(target.confidencePct).toBe(94);
    expect(target.isStreaming).toBe(false);
  });

  it('2. Starts contactless visual camera haptic stream and updates target state', () => {
    service.startContactlessVisualHapticStream('Maya Lin');
    expect(service.activeTarget().targetAlias).toBe('Maya Lin');
    expect(service.activeTarget().isStreaming).toBe(true);

    service.stopVisualHapticStream();
    expect(service.activeTarget().isStreaming).toBe(false);
  });
});
