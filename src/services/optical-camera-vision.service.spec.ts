import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { OpticalCameraVisionService } from './optical-camera-vision.service';

describe('OpticalCameraVisionService (Multi-Lens Edge Camera Vision & Optical Analytics)', () => {
  let service: OpticalCameraVisionService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        OpticalCameraVisionService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(OpticalCameraVisionService));
  });

  it('1. Initializes default camera vision parameters and lens mode', () => {
    expect(service.currentLens()).toBe('RPPG_PULSE');
    expect(service.isCameraActive()).toBe(false);
    expect(service.frameData().privacyShieldActive).toBe(true);
  });

  it('2. Switches camera lens modes and updates optical frame metrics', () => {
    service.selectLens('PUPILLOMETRY_NEURO');
    expect(service.currentLens()).toBe('PUPILLOMETRY_NEURO');
    expect(service.frameData().pupilDilationMm).toBe(3.8);

    service.startCameraStream();
    expect(service.isCameraActive()).toBe(true);

    service.stopCameraStream();
    expect(service.isCameraActive()).toBe(false);
  });
});
