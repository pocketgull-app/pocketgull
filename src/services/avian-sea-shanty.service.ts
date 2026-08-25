import { Injectable, signal, computed } from '@angular/core';

export interface ISeaShantyTrack {
  id: string;
  title: string;
  tempoBpm: number; // Strictly 60 BPM for 0.1 Hz baroreflex entrainment
  vagalTargetBranch: 'Pharyngeal Vagus' | 'Auricular Vagus' | 'Recurrent Laryngeal Vagus';
  lyrics: Array<{
    line: string;
    breathCue: 'INHALE 4s' | 'EXHALE 6s (SING)' | 'HOLD 2s';
    singer: 'Gulliver (Tenor)' | 'Swoop (Bass)' | 'Duet Co-Sing';
  }>;
  hfHrvBoostPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvianSeaShantyService {
  readonly tracks = signal<ISeaShantyTrack[]>([
    {
      id: 'track_wellerman',
      title: 'The Wellerman (60 BPM Baroreflex RSA Entrainment)',
      tempoBpm: 60,
      vagalTargetBranch: 'Recurrent Laryngeal Vagus',
      lyrics: [
        { line: 'There once was a ship that put to sea,', breathCue: 'INHALE 4s', singer: 'Gulliver (Tenor)' },
        { line: 'The name of the ship was the Billy of Tea,', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' },
        { line: 'The winds blew up, her bow dipped down,', breathCue: 'HOLD 2s', singer: 'Swoop (Bass)' },
        { line: 'O blow, my bully boys, blow! (HUH!)', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' }
      ],
      hfHrvBoostPercentage: 35
    },
    {
      id: 'track_leave_her_johnny',
      title: 'Leave Her, Johnny (60 BPM Slow Diaphragmatic Exhalation)',
      tempoBpm: 60,
      vagalTargetBranch: 'Pharyngeal Vagus',
      lyrics: [
        { line: 'I thought I heard the Captain say,', breathCue: 'INHALE 4s', singer: 'Gulliver (Tenor)' },
        { line: 'Leave her, Johnny, leave her!', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' },
        { line: 'Tomorrow you will get your pay,', breathCue: 'HOLD 2s', singer: 'Swoop (Bass)' },
        { line: 'And it\'s time for us to leave her!', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' }
      ],
      hfHrvBoostPercentage: 42
    },
    {
      id: 'track_blow_man_down',
      title: 'Blow the Man Down (60 BPM Auricular & Vagal Entrainment)',
      tempoBpm: 60,
      vagalTargetBranch: 'Auricular Vagus',
      lyrics: [
        { line: 'Come all ye young fellows that follow the sea,', breathCue: 'INHALE 4s', singer: 'Gulliver (Tenor)' },
        { line: 'Way-hey, blow the man down!', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' },
        { line: 'Now blow the man down, bullies, blow the man down,', breathCue: 'HOLD 2s', singer: 'Swoop (Bass)' },
        { line: 'Give us a chance to blow the man down!', breathCue: 'EXHALE 6s (SING)', singer: 'Duet Co-Sing' }
      ],
      hfHrvBoostPercentage: 28
    }
  ]);

  readonly activeTrackId = signal<string>('track_wellerman');
  readonly isPlaying = signal<boolean>(false);
  readonly currentLyricIndex = signal<number>(0);
  readonly vagalToneScore = signal<number>(72); // 0-100 HRV index

  readonly activeTrack = computed(() =>
    this.tracks().find(t => t.id === this.activeTrackId()) || this.tracks()[0]
  );

  readonly currentLyric = computed(() => {
    const track = this.activeTrack();
    const idx = this.currentLyricIndex();
    return track.lyrics[idx % track.lyrics.length];
  });

  selectTrack(id: string) {
    this.activeTrackId.set(id);
    this.currentLyricIndex.set(0);
  }

  togglePlay() {
    this.isPlaying.set(!this.isPlaying());
    if (this.isPlaying()) {
      this.simulateCoSingingLoop();
    }
  }

  private timerId?: any;

  private simulateCoSingingLoop() {
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (!this.isPlaying()) {
        clearInterval(this.timerId);
        return;
      }

      this.currentLyricIndex.update(idx => idx + 1);
      
      // Boost vagal tone score as co-singing progresses
      this.vagalToneScore.update(score => Math.min(100, score + 2));
    }, 4000); // 4-second tempo pulse matching 60 BPM rhythm
  }
}
