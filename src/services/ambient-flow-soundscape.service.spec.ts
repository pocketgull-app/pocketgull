import { AmbientFlowSoundscapeService, SOUNDSCAPE_PRESETS, SoundscapeType } from './ambient-flow-soundscape.service';

describe('AmbientFlowSoundscapeService', () => {
  let service: AmbientFlowSoundscapeService;

  beforeEach(() => {
    service = new AmbientFlowSoundscapeService();
  });

  it('should initialize with default states and soundscapes', () => {
    expect(service).toBeTruthy();
    expect(service.isPlaying()).toBe(false);
    expect(service.activeSoundscape()).toBe('golden_flow');
    expect(service.volume()).toBe(0.65);
    expect(service.timerMinutesRemaining()).toBeNull();
    expect(service.activePreset().id).toBe('golden_flow');
  });

  it('should have 5 restorative frequency presets', () => {
    expect(SOUNDSCAPE_PRESETS.length).toBe(5);
    const ids = SOUNDSCAPE_PRESETS.map(p => p.id);
    expect(ids).toContain('golden_flow');
    expect(ids).toContain('pacific_rain_gull');
    expect(ids).toContain('seven_gen_fireside');
    expect(ids).toContain('solfeggio_528');
    expect(ids).toContain('deep_space_gamma');
  });

  it('should allow setting volume within bounds', () => {
    service.setVolume(0.75);
    expect(service.volume()).toBe(0.75);

    service.setVolume(1.5);
    expect(service.volume()).toBe(1.0);

    service.setVolume(-0.5);
    expect(service.volume()).toBe(0);
  });

  it('should allow selecting different soundscape presets', async () => {
    await service.setSoundscape('pacific_rain_gull');
    expect(service.activeSoundscape()).toBe('pacific_rain_gull');
    expect(service.activePreset().title).toContain('Pacific Ocean');

    await service.setSoundscape('deep_space_gamma');
    expect(service.activeSoundscape()).toBe('deep_space_gamma');
    expect(service.activePreset().binauralBeatHz).toBe(40.0);
  });

  it('should handle timer configurations', () => {
    service.setTimer(30);
    expect(service.timerMinutesRemaining()).toBe(30);

    service.setTimer(null);
    expect(service.timerMinutesRemaining()).toBeNull();
  });

  it('should toggle mute state correctly', () => {
    expect(service.isMuted()).toBe(false);
    service.toggleMute();
    expect(service.isMuted()).toBe(true);
    service.toggleMute();
    expect(service.isMuted()).toBe(false);
  });
});
