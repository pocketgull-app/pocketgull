/**
 * 📼 Nantucket Nature Detective "Nature Play Tape" (Interactive Audio Cassette Player)
 * Safe, COPPA-compliant, edge-native audio storytelling and acoustic nature tapes for children and families.
 * Zero logins, zero tracking, zero personal data collection.
 */

export interface INaturePlayTapeTrack {
  id: string;
  trackNumber: number;
  side: 'A' | 'B';
  title: string;
  durationFormatted: string;
  durationSeconds: number;
  narrator: string;
  icon: string;
  tagline: string;
  synopsis: string;
  soundscapeType: 'moors_breeze' | 'bedtime_rhyme' | 'hot_foot_dance' | 'glacial_legend' | 'zooniverse_science';
  spokenStory: string;
}

export const NATURE_PLAY_TAPE_TRACKS: INaturePlayTapeTrack[] = [
  {
    id: 'track_1_moors_breeze',
    trackNumber: 1,
    side: 'A',
    title: 'The Whispering Grasses of Sanford Farm',
    durationFormatted: '1:45',
    durationSeconds: 105,
    narrator: 'Trail Guide Maya & Island Songbirds',
    icon: '🌾',
    tagline: 'Little Bluestem Grass & Gentle Atlantic Winds',
    synopsis: 'Listen to the rustle of golden bluestem grasses on the moors and discover why staying in the center of wide gravel paths keeps both you and fragile butterfly cocoons safe.',
    soundscapeType: 'moors_breeze',
    spokenStory: 'Welcome, young explorer, to Sanford Farm. Close your eyes and listen to the ocean wind rushing through the little bluestem grass. Can you hear the bobolink birds singing high in the sky? The trail beneath your sneakers is wide and gravelly. When you walk right down the center, you stay clear of questing tick nymphs, and you protect the rare wild lupine flowers growing at the trail edge. Take a deep breath of salty island air—you are an official Nantucket Land Steward!'
  },
  {
    id: 'track_2_bedtime_rhyme',
    trackNumber: 2,
    side: 'A',
    title: 'The 3-Minute Bedtime Tick Check Song',
    durationFormatted: '1:15',
    durationSeconds: 75,
    narrator: 'Barnaby the Island Barn Owl',
    icon: '🦉',
    tagline: 'Catchy Rhythmic Bedtime Rhyme for Kids & Parents',
    synopsis: 'A fun, reassuring rhyme to sing before bedtime stories: checking ankles, behind knees, and hairline long before any tick can transmit bacteria.',
    soundscapeType: 'bedtime_rhyme',
    spokenStory: 'Ankles, knees, and waistband too, / Check your hairline before bedtime brew! / Ticks take hours to wake up and bite, / So checking at bedtime keeps you sleeping light! / Tiny like a poppy seed, quick to spot and pull, / Safe on the moors with our pockets full!'
  },
  {
    id: 'track_3_hot_foot_dance',
    trackNumber: 3,
    side: 'A',
    title: 'Captain Permethrin’s Hot-Foot Trail Dance',
    durationFormatted: '1:30',
    durationSeconds: 90,
    narrator: 'Captain Gear & The Island Explorers',
    icon: '🥾',
    tagline: 'The Science of Treated Socks & Bug Physics',
    synopsis: 'Learn how Permethrin-treated socks feel like a hot dance floor to tiny tick feet, making them turn around and fall right off!',
    soundscapeType: 'hot_foot_dance',
    spokenStory: 'Imagine you are wearing magic superhero armor on your feet! When a tiny tick nymph on the tip of a grass blade touches a sneaker treated with Permethrin, its little feet say "Whoa! This dance floor is way too spicy!" It does a quick reverse spin and drops right back down into the leaf litter. Treated socks are the coolest, easiest armor in the whole world!'
  },
  {
    id: 'track_4_glacial_legend',
    trackNumber: 4,
    side: 'B',
    title: 'The Giant Glacier & The Kettle Bogs',
    durationFormatted: '2:10',
    durationSeconds: 130,
    narrator: 'Grandmother Cedar & The Glacial Echoes',
    icon: '🌊',
    tagline: '14,000 Years Ago: How Ice Carved Nantucket',
    synopsis: 'A calming bedtime nature tale about how a colossal sheet of ice drifted south, sculpted our sandy moraines, and melted into cranberry kettle bogs.',
    soundscapeType: 'glacial_legend',
    spokenStory: 'Long before ships sailed into Nantucket Harbor, a giant ice sheet over a mile high moved across the continent. When the great glacier rested right here, it dropped heaps of soft quartz sand and smooth river stones. Giant chunks of melting ice left deep bowl-shaped hollows called kettle bogs, where wild cranberries and pitcher plants grow today. When you walk across the moors, you are stepping on ancient glacial sand that has rested under the stars for fourteen thousand summers.'
  },
  {
    id: 'track_5_zooniverse_science',
    trackNumber: 5,
    side: 'B',
    title: 'Zooniverse Junior Science Spotter',
    durationFormatted: '1:50',
    durationSeconds: 110,
    narrator: 'Professor Pipette & Global Citizen Scientists',
    icon: '🔬',
    tagline: 'Safe, Anonymous Online Science for Kids Everywhere',
    synopsis: 'Discover how kids around the world help real university biologists classify camera-trap photos of deer, butterflies, and owls safely on Zooniverse.org without sharing any personal information.',
    soundscapeType: 'zooniverse_science',
    spokenStory: 'Did you know you can be a real wildlife scientist from your living room? On Zooniverse.org, thousands of kids look at photos taken by automated cameras in forests and coastal reserves. You might spot a white-tailed deer leaping across a meadow, or a short-eared owl hunting at twilight. You click what animal you see, and real university researchers use your answers to protect wild habitats. It is safe, private, and fun—no names, no emails, just pure scientific discovery!'
  }
];

export class NaturePlayTapeEngine {
  private activeTrackId = 'track_1_moors_breeze';
  private isPlaying = false;
  private tapePositionSeconds = 0;
  private activeSide: 'A' | 'B' = 'A';
  private speechUtterance: any = null;
  private playbackTimer: any = null;

  public getActiveTrack(): INaturePlayTapeTrack {
    return NATURE_PLAY_TAPE_TRACKS.find(t => t.id === this.activeTrackId) || NATURE_PLAY_TAPE_TRACKS[0];
  }

  public getTracksForSide(side: 'A' | 'B'): INaturePlayTapeTrack[] {
    return NATURE_PLAY_TAPE_TRACKS.filter(t => t.side === side);
  }

  public getActiveSide(): 'A' | 'B' {
    return this.activeSide;
  }

  public setSide(side: 'A' | 'B') {
    this.activeSide = side;
    const firstTrackOnSide = this.getTracksForSide(side)[0];
    if (firstTrackOnSide) {
      this.selectTrack(firstTrackOnSide.id);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getTapePosition(): number {
    return this.tapePositionSeconds;
  }

  public selectTrack(trackId: string) {
    const track = NATURE_PLAY_TAPE_TRACKS.find(t => t.id === trackId);
    if (track) {
      this.stop();
      this.activeTrackId = track.id;
      this.activeSide = track.side;
      this.tapePositionSeconds = 0;
    }
  }

  public play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const track = this.getActiveTrack();

    // Browser Speech Synthesis for narration with natural voice selection
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(track.spokenStory);
      utterance.rate = 0.92; // Gentle, clear storytelling pace
      utterance.pitch = 1.04;

      // Select best available natural voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const naturalVoice = voices.find(v =>
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel') || v.name.includes('Ava')) &&
          (v.lang.startsWith('en'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }
      }

      utterance.onend = () => {
        this.nextTrack();
      };
      this.speechUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }

    // Playback progression timer
    this.playbackTimer = setInterval(() => {
      this.tapePositionSeconds += 1;
      const currentTrack = this.getActiveTrack();
      if (this.tapePositionSeconds >= currentTrack.durationSeconds) {
        this.nextTrack();
      }
    }, 1000);
  }

  public pause() {
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  public stop() {
    this.isPlaying = false;
    this.tapePositionSeconds = 0;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  public rewind() {
    this.tapePositionSeconds = Math.max(0, this.tapePositionSeconds - 15);
    if (this.isPlaying) {
      this.stop();
      this.play();
    }
  }

  public fastForward() {
    const currentTrack = this.getActiveTrack();
    this.tapePositionSeconds = Math.min(currentTrack.durationSeconds, this.tapePositionSeconds + 15);
  }

  public nextTrack() {
    const sideTracks = this.getTracksForSide(this.activeSide);
    const currentIndex = sideTracks.findIndex(t => t.id === this.activeTrackId);
    if (currentIndex >= 0 && currentIndex < sideTracks.length - 1) {
      this.selectTrack(sideTracks[currentIndex + 1].id);
      this.play();
    } else {
      // Flip side or stop
      const nextSide = this.activeSide === 'A' ? 'B' : 'A';
      this.setSide(nextSide);
      this.play();
    }
  }

  public prevTrack() {
    const sideTracks = this.getTracksForSide(this.activeSide);
    const currentIndex = sideTracks.findIndex(t => t.id === this.activeTrackId);
    if (currentIndex > 0) {
      this.selectTrack(sideTracks[currentIndex - 1].id);
      this.play();
    } else {
      this.rewind();
    }
  }
}
