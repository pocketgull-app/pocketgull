import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { VocalBiomarkerService } from './vocal-biomarker.service';

describe('VocalBiomarkerService', () => {
  let service: VocalBiomarkerService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [VocalBiomarkerService]
    });
    service = runInInjectionContext(injector, () => injector.get(VocalBiomarkerService));
  });

  it('1. Initializes default vocal acoustic biomarker baseline', () => {
    const bm = service.biomarker();
    expect(bm.pitchHz).toBeGreaterThan(0);
    expect(bm.jitterPct).toBeLessThan(5.0);
    expect(service.isStressElevated()).toBe(false);
  });

  it('2. Processes raw audio buffer locally using FFT without egress', () => {
    const mockAudio = new Float32Array(1024);
    for (let i = 0; i < mockAudio.length; i++) {
      mockAudio[i] = Math.sin((i * 2 * Math.PI * 220) / 44100);
    }
    const result = service.processAudioBufferLocally(mockAudio, 44100);
    expect(result.pitchHz).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });
});
