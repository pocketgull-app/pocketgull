import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CardiometabolicPodcastEngineService,
  CARDIOMETABOLIC_PODCAST_SCRIPT
} from './cardiometabolic-podcast-engine.service';

describe('CardiometabolicPodcastEngineService', () => {
  let service: CardiometabolicPodcastEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CardiometabolicPodcastEngineService]
    });
    service = TestBed.inject(CardiometabolicPodcastEngineService);
  });

  it('should initialize with the 6-segment narrative podcast script', () => {
    expect(service.script().length).toBe(6);
    expect(service.currentSegmentIndex()).toBe(0);
    expect(service.isPlaying()).toBe(false);
    expect(service.isPaused()).toBe(false);

    const firstSeg = service.currentSegment();
    expect(firstSeg.speaker).toBe('host');
    expect(firstSeg.speakerTitle).toContain('Dr. Sarah Carter');
  });

  it('should calculate accurate progress percentage as segments advance', () => {
    expect(service.progressPercentage()).toBe(17); // 1/6 ~ 17%
    service.skipToSegment(2);
    expect(service.progressPercentage()).toBe(50); // 3/6 = 50%
    service.skipToSegment(5);
    expect(service.progressPercentage()).toBe(100); // 6/6 = 100%
  });

  it('should accurately step through segments forward and backward', () => {
    service.nextSegment();
    expect(service.currentSegmentIndex()).toBe(1);
    expect(service.currentSegment().speaker).toBe('investigator');
    expect(service.currentSegment().speakerTitle).toContain('Dr. Marc Hamilton');

    service.nextSegment();
    expect(service.currentSegmentIndex()).toBe(2);

    service.previousSegment();
    expect(service.currentSegmentIndex()).toBe(1);

    service.previousSegment();
    expect(service.currentSegmentIndex()).toBe(0);
    service.previousSegment(); // Boundary guard at 0
    expect(service.currentSegmentIndex()).toBe(0);
  });

  it('should assign voices prioritizing regional dialects for investigator and host', () => {
    // Mock detected voices
    const mockVoices: any[] = [
      { name: 'Google US English', lang: 'en-US' },
      { name: 'Microsoft Ryan Online (Natural) - English (United Kingdom)', lang: 'en-GB' },
      { name: 'Fiona (Scottish)', lang: 'en-GB' },
      { name: 'Clara (Canadian)', lang: 'en-CA' }
    ];
    service.detectedVoices.set(mockVoices);

    const invVoice = service.getVoiceForSpeaker('investigator');
    expect(invVoice?.lang).toBe('en-GB');

    const hostVoice = service.getVoiceForSpeaker('host');
    expect(hostVoice?.lang).toBe('en-US');

    const pharmVoice = service.getVoiceForSpeaker('pharmacologist');
    expect(pharmVoice?.lang).toBe('en-CA');
  });

  it('should reset state on stopPodcast', () => {
    service.skipToSegment(3);
    service.currentWord.set('glucose');
    service.isPlaying.set(true);

    service.stopPodcast();

    expect(service.isPlaying()).toBe(false);
    expect(service.isPaused()).toBe(false);
    expect(service.currentSegmentIndex()).toBe(0);
    expect(service.currentWord()).toBe('');
  });
});
