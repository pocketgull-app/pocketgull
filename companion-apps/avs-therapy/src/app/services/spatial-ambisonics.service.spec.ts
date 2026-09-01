import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpatialAmbisonicsService } from './spatial-ambisonics.service';

describe('SpatialAmbisonicsService', () => {
  let service: SpatialAmbisonicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpatialAmbisonicsService]
    });
    service = TestBed.inject(SpatialAmbisonicsService);
  });

  it('should initialize in 4D HRTF orbit mode with pink noise', () => {
    expect(service.spatialMode()).toBe('4d-hrtf-orbit');
    expect(service.noiseType()).toBe('pink');
    expect(service.noiseVolume()).toBe(0.15);
  });

  it('should support switching spatial audio modes and noise types', () => {
    service.setSpatialMode('isochronic-speaker');
    expect(service.spatialMode()).toBe('isochronic-speaker');

    service.setNoiseType('brownian');
    expect(service.noiseType()).toBe('brownian');
  });
});
