import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContactlessRppgService } from './contactless-rppg.service';

describe('ContactlessRppgService', () => {
  let service: ContactlessRppgService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContactlessRppgService]
    });
    service = TestBed.inject(ContactlessRppgService);
  });

  it('should initialize with baseline cardiovascular and HRV signals', () => {
    expect(service.liveHeartRateBpm()).toBeGreaterThan(50);
    expect(service.hrvRmssdMs()).toBeGreaterThan(30);
    expect(service.baroreflexResonanceBpm()).toBe(5.8);
    expect(service.opticalPulseBuffer().length).toBe(100);
  });

  it('should calibrate baroreflex resonance based on current HRV', () => {
    service.hrvRmssdMs.set(60);
    service.calibrateBaroreflexResonance();
    expect(service.baroreflexResonanceBpm()).toBeCloseTo(6.0, 1);
  });
});
