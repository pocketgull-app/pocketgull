import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { AmbientFlowPlayerComponent } from './ambient-flow-player.component';
import { AmbientFlowSoundscapeService, SOUNDSCAPE_PRESETS } from '../../services/ambient-flow-soundscape.service';

describe('AmbientFlowPlayerComponent', () => {
  let component: AmbientFlowPlayerComponent;
  let mockSoundscapeService: any;

  beforeEach(() => {
    mockSoundscapeService = {
      isPlaying: signal(false),
      activeSoundscape: signal('golden_flow'),
      volume: signal(0.65),
      isMuted: signal(false),
      timerMinutesRemaining: signal(null),
      activePreset: signal(SOUNDSCAPE_PRESETS[0]),
      togglePlay: vi.fn(),
      setSoundscape: vi.fn(),
      setVolume: vi.fn(),
      toggleMute: vi.fn(),
      setTimer: vi.fn(),
      getAnalyser: vi.fn().mockReturnValue(null)
    };

    const injector = Injector.create({
      providers: [
        { provide: AmbientFlowSoundscapeService, useValue: mockSoundscapeService }
      ]
    });

    component = runInInjectionContext(injector, () => new AmbientFlowPlayerComponent());
  });

  it('should create the player component', () => {
    expect(component).toBeTruthy();
    expect(component.presets.length).toBe(5);
    expect(component.isExpanded()).toBe(false);
  });

  it('should toggle expansion state', () => {
    expect(component.isExpanded()).toBe(false);
    component.isExpanded.set(true);
    expect(component.isExpanded()).toBe(true);
  });

  it('should forward volume adjustments to service', () => {
    const fakeEvent = {
      target: { value: '0.85' }
    } as unknown as Event;

    component.onVolumeChange(fakeEvent);
    expect(mockSoundscapeService.setVolume).toHaveBeenCalledWith(0.85);
  });
});
