import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BioHapticFeedbackService } from './bio-haptic-feedback.service';

describe('BioHapticFeedbackService', () => {
  let service: BioHapticFeedbackService;

  beforeEach(() => {
    service = new BioHapticFeedbackService();
  });

  it('should initialize with inactive audio tone state', () => {
    expect(service.isAudioToneActive()).toBe(false);
    expect(service.currentFrequencyHz()).toBe(528);
  });

  it('should trigger haptic pulse without throwing error', () => {
    expect(() => service.triggerHapticPulse('inhale')).not.toThrow();
    expect(() => service.triggerHapticPulse('hold')).not.toThrow();
    expect(() => service.triggerHapticPulse('exhale')).not.toThrow();
  });

  it('should play NASA Saturn SKR plasma audio tone without throwing error', () => {
    expect(() => service.playNasaSaturnSkrTone(1000)).not.toThrow();
  });
});
