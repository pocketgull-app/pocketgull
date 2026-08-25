import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { EyesFreeCameraScribeComponent } from './eyes-free-camera-scribe.component';
import { EyesFreeCameraScribeService } from '../services/eyes-free-camera-scribe.service';

describe('EyesFreeCameraScribeComponent Unit Suite', () => {
  let comp: EyesFreeCameraScribeComponent;
  let service: EyesFreeCameraScribeService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        EyesFreeCameraScribeComponent,
        EyesFreeCameraScribeService
      ]
    });
    comp = runInInjectionContext(injector, () => injector.get(EyesFreeCameraScribeComponent));
    service = comp.service;
  });

  it('1. Initializes cleanly with service injection', () => {
    expect(comp).toBeTruthy();
    expect(service.isCameraStreaming()).toBe(false);
    expect(service.lastInspection()).toBeTruthy();
  });

  it('2. Toggles camera state on button click', () => {
    comp.toggleCamera();
    expect(service.isCameraStreaming()).toBe(true);

    comp.toggleCamera();
    expect(service.isCameraStreaming()).toBe(false);
  });

  it('3. Selects different vision mode and triggers rescan', () => {
    comp.selectMode('LIGHT_AND_COLOR');
    expect(service.activeMode()).toBe('LIGHT_AND_COLOR');

    comp.rescan();
    expect(service.isAnalyzing()).toBe(true);
  });
});
