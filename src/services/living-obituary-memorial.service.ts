import { Injectable, signal, computed, inject } from '@angular/core';
import { GrowThyselfLegacyEngineService } from './grow-thyself-legacy-engine.service';
import { BioThemeSongEngineService } from './bio-theme-song-engine.service';

export interface ILivingObituaryMemorial {
  id: string;
  fullName: string;
  lifespanYears: string; // e.g. "1948 – 2026"
  archetypeTitle: string;
  biographySummary: string;
  themeSongFrequencyHz: number;
  baselineBpm: number;
  openScienceContributionsCount: number;
  memorialTreeCoordinates: string;
  curatedPrinciples: string[];
  peerTributesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class LivingObituaryMemorialService {
  private legacyEngine = inject(GrowThyselfLegacyEngineService);
  private themeEngine = inject(BioThemeSongEngineService);

  readonly activeMemorial = signal<ILivingObituaryMemorial>({
    id: 'obit_001',
    fullName: 'Dr. Eleanor Vance, MD',
    lifespanYears: '1952 – 2026',
    archetypeTitle: '🧬 Open-Science & Medical Contributor',
    biographySummary: 'Pioneer in integrative cardiology, forest phytoncide research, and open-access FHIR interop. Dedicated 40 years to curing chronic inflammatory burden.',
    themeSongFrequencyHz: 528,
    baselineBpm: 68,
    openScienceContributionsCount: 1420,
    memorialTreeCoordinates: '44.0978° N, 70.2104° W (Androscoggin Forest Preserve)',
    curatedPrinciples: [
      'Nature and science are two dialects of the same universal language.',
      'True clinical healing begins by treating the person, not the diagnostic label.',
      'Leave your biometrics to open research so future generations suffer less.'
    ],
    peerTributesCount: 128
  });

  playMemorialBioTheme(): void {
    const mem = this.activeMemorial();
    this.themeEngine.playPeerThemeSongOnQrScan({
      userId: mem.id,
      themeSongName: `${mem.fullName} Memorial Fanfare`,
      soundtrackGenre: 'SOLFEGGIO_AMBIENT',
      baseFrequencyHz: mem.themeSongFrequencyHz,
      bpmPulse: mem.baselineBpm,
      emojiBadge: '🕊️🎵',
      playOnQrScan: true,
      hapticVibrationPattern: [25, 40, 30, 40, 50]
    });
  }

  addPeerTribute(): void {
    this.activeMemorial.update(m => ({ ...m, peerTributesCount: m.peerTributesCount + 1 }));
  }
}
