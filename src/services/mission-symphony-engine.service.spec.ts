import '@angular/compiler';
import { MissionSymphonyEngineService, MISSION_THEMES } from './mission-symphony-engine.service';

describe('MissionSymphonyEngineService Suite', () => {
  let service: MissionSymphonyEngineService;

  beforeEach(() => {
    service = new MissionSymphonyEngineService();
  });

  it('1. Initializes with celestial_launch as default mission theme and inactive playback', () => {
    expect(service.isPlaying()).toBe(false);
    expect(service.currentPhase()).toBe('celestial_launch');
    expect(service.currentTheme().title).toContain('Interstellar Launch');
    expect(service.currentTheme().binauralBeatHz).toBe(7.83); // Schumann Earth Pulse
  });

  it('2. Contains 5 heroic mission soundtrack themes covering the complete clinical journey', () => {
    expect(MISSION_THEMES.length).toBe(5);

    const launch = MISSION_THEMES.find(t => t.phase === 'celestial_launch');
    expect(launch).toBeDefined();

    const healer = MISSION_THEMES.find(t => t.phase === 'noble_healer');
    expect(healer).toBeDefined();
    expect(healer?.scale).toContain('Dorian');

    const quest = MISSION_THEMES.find(t => t.phase === 'scientific_quest');
    expect(quest).toBeDefined();
    expect(quest?.binauralBeatHz).toBe(40.0); // MIT Gamma

    const triumph = MISSION_THEMES.find(t => t.phase === 'triumph_of_healing');
    expect(triumph).toBeDefined();
    expect(triumph?.binauralBeatHz).toBe(5.28); // 528 Hz Solfeggio

    const sevenGen = MISSION_THEMES.find(t => t.phase === 'seven_gen_vigil');
    expect(sevenGen).toBeDefined();
    expect(sevenGen?.binauralBeatHz).toBe(4.5); // Theta
  });

  it('3. Safely switches mission theme and updates reactive theme signal', () => {
    service.playTheme('scientific_quest');
    expect(service.currentPhase()).toBe('scientific_quest');
    expect(service.currentTheme().title).toContain('Scientific Quest');

    service.playTheme('seven_gen_vigil');
    expect(service.currentPhase()).toBe('seven_gen_vigil');
    expect(service.currentTheme().title).toContain('Seven Generations');
  });

  it('4. Handles volume adjustments within valid 0.0 to 1.0 boundary', () => {
    service.setVolume(0.8);
    expect(service.masterVolume()).toBe(0.8);

    service.setVolume(2.5);
    expect(service.masterVolume()).toBe(1.0);

    service.setVolume(-0.5);
    expect(service.masterVolume()).toBe(0.0);
  });
});
