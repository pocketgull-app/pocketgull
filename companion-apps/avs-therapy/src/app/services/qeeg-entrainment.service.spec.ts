import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QeegEntrainmentService } from './qeeg-entrainment.service';

describe('QeegEntrainmentService', () => {
  let service: QeegEntrainmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QeegEntrainmentService]
    });
    service = TestBed.inject(QeegEntrainmentService);
  });

  it('should initialize with iAPF nudge protocol by default', () => {
    expect(service.activeProtocol()).toBe('iapf-nudge');
    expect(service.measuredIapfHz()).toBe(10.15);
    expect(service.dynamicNudgeOffsetHz()).toBe(0.5);
    expect(service.targetFrequencyHz()).toBe(10.65);
  });

  it('should calculate lateralized split frequencies for Davidson FAA protocol', () => {
    service.setProtocol('faa-davidson');
    expect(service.leftHemisphereTargetHz()).toBe(14.0);
    expect(service.rightHemisphereTargetHz()).toBe(10.0);
  });

  it('should dynamically adapt target frequency when TBR fatigue occurs', () => {
    service.setProtocol('tbr-fatigue-damping');
    // TBR is 2.45 initially (normal) -> SMR 12.0 Hz
    expect(service.targetFrequencyHz()).toBe(12.0);
  });
});
