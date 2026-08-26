import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SleepInsomniaProtocolService } from './sleep-insomnia-protocol.service';

describe('SleepInsomniaProtocolService', () => {
  let service: SleepInsomniaProtocolService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SleepInsomniaProtocolService]
    });
    service = TestBed.inject(SleepInsomniaProtocolService);
  });

  it('should initialize in alpha-descent phase with 5.5 BPM resonant respiration', () => {
    expect(service.currentPhase()).toBe('alpha-descent');
    expect(service.dynamicBreathingBpm()).toBe(5.5);
    expect(service.dynamicTargetHz()).toBe(10.0);
  });

  it('should calculate spindle burst frequency dynamically', () => {
    service.setPhase('spindle-induction');
    expect(service.dynamicBreathingBpm()).toBe(4.5);
    expect(service.dynamicTargetHz()).toBe(5.0);

    service.sleepSpindleActive.set(true);
    expect(service.dynamicTargetHz()).toBe(13.5);
  });

  it('should engage slow-wave delta parameters', () => {
    service.setPhase('slow-wave-delta');
    expect(service.dynamicBreathingBpm()).toBe(3.5);
    expect(service.dynamicTargetHz()).toBeGreaterThanOrEqual(0.6);
  });
});
