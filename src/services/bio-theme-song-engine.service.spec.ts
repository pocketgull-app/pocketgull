import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { BioThemeSongEngineService } from './bio-theme-song-engine.service';

describe('BioThemeSongEngineService (Personal Bio-Theme Song & Haptic Vibrational QR Fanfare)', () => {
  let service: BioThemeSongEngineService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        BioThemeSongEngineService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(BioThemeSongEngineService));
  });

  it('1. Initializes default bio-theme song, frequency & haptic vibration parameters', () => {
    const song = service.myThemeSong();
    expect(song.themeSongName).toContain('Solfeggio');
    expect(song.baseFrequencyHz).toBe(528);
    expect(song.bpmPulse).toBe(72);
    expect(song.hapticVibrationPattern.length).toBeGreaterThan(0);
  });

  it('2. Updates personal theme song settings and triggers haptic vibration method', () => {
    service.updateThemeSong({
      themeSongName: "Phil's Rosetta Heroic Fanfare",
      baseFrequencyHz: 660,
      soundtrackGenre: 'HEROIC_FANFARE'
    });
    expect(service.myThemeSong().themeSongName).toContain('Rosetta Heroic');
    
    // Safely executes haptic vibration fallback on non-vibrating devices
    expect(() => service.triggerHapticVibrationPulse(80)).not.toThrow();
  });
});
