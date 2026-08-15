import { Injectable, signal, computed } from '@angular/core';

export interface IHealingPostcard {
  id: string;
  senderLocation: string;
  recoveryTopic: string;
  message: string;
  artworkStyle: 'lavender_watercolor' | 'golden_kintsugi' | 'coastal_sunset' | 'pine_forest';
  timestamp: string;
  clapsCount: number;
}

export type SanctuaryAmbientSound = 'none' | 'temple_bell_432hz' | 'gentle_rain' | 'ocean_tide';

@Injectable({
  providedIn: 'root'
})
export class ZenSanctuaryService {
  public readonly isSanctuaryActive = signal<boolean>(false);
  public readonly currentSound = signal<SanctuaryAmbientSound>('temple_bell_432hz');
  public readonly isKintsugiGlowActive = signal<boolean>(true);
  public readonly breathCyclePhase = signal<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  public readonly breathTimerSeconds = signal<number>(4);

  // Curated Postcards on the Pier
  public readonly postcards = signal<IHealingPostcard[]>([
    {
      id: 'card_1',
      senderLocation: 'Coastal Maine',
      recoveryTopic: 'Post-Op Knee Recovery',
      message: 'Day 14 after ACL rehab: Took my first unassisted steps out onto the deck this morning. The salt breeze felt like victory. Keep going, friend.',
      artworkStyle: 'coastal_sunset',
      timestamp: 'Just now',
      clapsCount: 24
    },
    {
      id: 'card_2',
      senderLocation: 'Kyoto, Japan',
      recoveryTopic: 'Chronic Fatigue & Rest',
      message: 'Rest is not wasted time. It is the soil preparing for spring. Be gentle with your body today.',
      artworkStyle: 'golden_kintsugi',
      timestamp: '2 hours ago',
      clapsCount: 42
    },
    {
      id: 'card_3',
      senderLocation: 'Blue Ridge Mountains',
      recoveryTopic: 'TBI & Cognitive Healing',
      message: 'To anyone struggling with screen headaches and brain fog: Put the phone down for 10 minutes and listen to the birds. You are mending beautifully.',
      artworkStyle: 'pine_forest',
      timestamp: '5 hours ago',
      clapsCount: 19
    },
    {
      id: 'card_4',
      senderLocation: 'Provence, France',
      recoveryTopic: 'Anxiety & Vagal Recovery',
      message: 'Inhaling calm, exhaling old weight. Sending you a field of lavender and quiet strength.',
      artworkStyle: 'lavender_watercolor',
      timestamp: 'Yesterday',
      clapsCount: 38
    }
  ]);

  private audioCtx: AudioContext | null = null;
  private activeOscillator: OscillatorNode | null = null;
  private activeGainNode: GainNode | null = null;

  public openSanctuary(): void {
    this.isSanctuaryActive.set(true);
    this.playTempleBell();
  }

  public closeSanctuary(): void {
    this.isSanctuaryActive.set(false);
    this.stopAudio();
  }

  public toggleKintsugiGlow(): void {
    this.isKintsugiGlowActive.update(active => !active);
  }

  public clapForPostcard(cardId: string): void {
    this.postcards.update(cards => 
      cards.map(c => c.id === cardId ? { ...c, clapsCount: c.clapsCount + 1 } : c)
    );
  }

  public sendPostcard(newCard: Omit<IHealingPostcard, 'id' | 'timestamp' | 'clapsCount'>): void {
    const card: IHealingPostcard = {
      ...newCard,
      id: `card_${Date.now()}`,
      timestamp: 'Just now',
      clapsCount: 1
    };
    this.postcards.update(cards => [card, ...cards]);
  }

  /**
   * Procedural Web Audio 432Hz Tibetan Bell Chime with Natural Exponential Decay
   */
  public playTempleBell(): void {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.stopAudio();

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Pure 432Hz harmonic tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      // Subtle pitch bend imitating singing bowl strike resonance
      osc.frequency.exponentialRampToValueAtTime(432.4, now + 3.0);

      // Strike attack and long 6-second resonant decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 6.6);

      this.activeOscillator = osc;
      this.activeGainNode = gain;
    } catch {
      // AudioContext unavailable in headless environments
    }
  }

  public stopAudio(): void {
    try {
      if (this.activeOscillator) {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
        this.activeOscillator = null;
      }
    } catch {
      // Ignore already stopped oscillators
    }
  }
}
