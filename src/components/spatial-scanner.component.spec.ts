import '@angular/compiler';
import { vi } from 'vitest';
import { SpatialScannerComponent } from './spatial-scanner.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';

describe('SpatialScannerComponent - Optical rPPG Pulse Acquisition & LiDAR Spatial Scanner', () => {
  let component: SpatialScannerComponent;
  let mockPatientState: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      vitals: signal({ hr: '72' }),
      updateVital: vi.fn(),
      anatomicProfile: signal({ gender: 'male', customLiDARScanUrl: '' })
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new SpatialScannerComponent();
    });
  });

  it('should initialize with default camera mode', () => {
    expect(component.scanMode()).toBe('camera');
    expect(component.isScanning()).toBe(false);
    expect(component.isAcquiringPulse()).toBe(false);
  });

  it('should switch scan modes between camera, pulse, and pointcloud', () => {
    component.scanMode.set('pulse');
    expect(component.scanMode()).toBe('pulse');

    component.scanMode.set('pointcloud');
    expect(component.scanMode()).toBe('pointcloud');
  });

  it('should start and update rPPG optical camera pulse sampling', () => {
    vi.useFakeTimers();
    component.scanMode.set('pulse');
    component.togglePulseAcquisition();
    expect(component.isAcquiringPulse()).toBe(true);

    vi.advanceTimersByTime(300);
    expect(component.pulseSamplingFrames()).toBeGreaterThan(0);
    expect(component.acquiredHeartRate()).toBeGreaterThan(60);

    component.togglePulseAcquisition();
    expect(component.isAcquiringPulse()).toBe(false);
    vi.useRealTimers();
  });

  it('should commit acquired pulse BPM to PatientStateService', () => {
    component.acquiredHeartRate.set(76);
    // Mock global alert to avoid jsdom missing alert error
    vi.stubGlobal('alert', vi.fn());
    component.commitPulseToVitals();
    expect(mockPatientState.updateVital).toHaveBeenCalledWith('hr', '76');
    vi.unstubAllGlobals();
  });
});
