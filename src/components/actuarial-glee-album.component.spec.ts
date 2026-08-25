import '@angular/compiler';
import * as DOMPurify from 'dompurify';
import { ActuarialGleeAlbumComponent } from './actuarial-glee-album.component';
import { signal, runInInjectionContext, createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { PatientStateService } from '../services/patient-state.service';
import { ActuarialGleeAudioService } from '../services/actuarial-glee-audio.service';

describe('ActuarialGleeAlbumComponent — 12-Track Duet Singalong & QALY Healthspan Suite', () => {
  let component: ActuarialGleeAlbumComponent;
  let mockPatientState: any;
  let mockAudioService: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    mockPatientState = {
      activePhilosophy: signal('western')
    };

    mockAudioService = {
      isPlaying: signal(false),
      gleeTracks: [
        { trackNumber: 1, title: 'Track 1', paradigm: 'western', qalyBonus: 1.0, lyrics: [{ role: 'Clinician', text: 'Sing' }] },
        { trackNumber: 2, title: 'Track 2', paradigm: 'eastern', qalyBonus: 1.5, lyrics: [{ role: 'Patient', text: 'Echo' }] }
      ],
      playTrack: vi.fn(),
      stopTrack: vi.fn()
    };

    injector = createEnvironmentInjector([
      { provide: PatientStateService, useValue: mockPatientState },
      { provide: ActuarialGleeAudioService, useValue: mockAudioService }
    ], undefined as any);

    runInInjectionContext(injector, () => {
      component = new ActuarialGleeAlbumComponent();
    });
  });

  it('should instantiate with track index 0 selected', () => {
    expect(component).toBeTruthy();
    expect(component.selectedTrackIndex()).toBe(0);
    expect(component.totalQalyGain()).toBe(2.5);
  });

  it('should select track index 1 and reset lyric index', () => {
    component.selectTrack(1);
    expect(component.selectedTrackIndex()).toBe(1);
    expect(component.currentLyricIndex()).toBe(0);
  });

  it('should toggle play state and increment glee score', () => {
    const initialScore = component.gleeScore();
    component.togglePlay();
    expect(mockAudioService.playTrack).toHaveBeenCalled();
    expect(component.gleeScore()).toBe(initialScore + 50);
  });
});
