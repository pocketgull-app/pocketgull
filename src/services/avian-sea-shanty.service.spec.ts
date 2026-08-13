import '@angular/compiler';
import { AvianSeaShantyService } from './avian-sea-shanty.service';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('AvianSeaShantyService', () => {
  let service: AvianSeaShantyService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new AvianSeaShantyService();
    });
  });

  afterEach(() => {
    if (service.isPlaying()) {
      service.togglePlay();
    }
  });

  it('should initialize with 3 default 60 BPM vagal sea shanty tracks', () => {
    expect(service).toBeTruthy();
    expect(service.tracks().length).toBe(3);
    expect(service.activeTrack().tempoBpm).toBe(60);
    expect(service.activeTrack().id).toBe('track_wellerman');
  });

  it('should switch active track and reset lyric index', () => {
    service.selectTrack('track_leave_her_johnny');
    expect(service.activeTrack().id).toBe('track_leave_her_johnny');
    expect(service.currentLyricIndex()).toBe(0);
    expect(service.activeTrack().vagalTargetBranch).toBe('Pharyngeal Vagus');
  });

  it('should toggle play state and advance lyric cues during co-singing loop', () => {
    expect(service.isPlaying()).toBe(false);
    service.togglePlay();
    expect(service.isPlaying()).toBe(true);
    service.togglePlay();
    expect(service.isPlaying()).toBe(false);
  });
});
