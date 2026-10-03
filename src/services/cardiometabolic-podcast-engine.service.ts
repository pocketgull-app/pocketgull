import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IPodcastSegment {
  id: string;
  speaker: 'host' | 'investigator' | 'pharmacologist';
  speakerTitle: string;
  avatarEmoji: string;
  accentBadge: string;
  text: string;
  keyTakeaway: string;
}

export const CARDIOMETABOLIC_PODCAST_SCRIPT: IPodcastSegment[] = [
  {
    id: 'seg-1',
    speaker: 'host',
    speakerTitle: 'Dr. Sarah Carter',
    avatarEmoji: '🎙️',
    accentBadge: 'Host & Clinical Inquirer • en-US',
    text: "Welcome to Understory Trajectories! Today, we are exploring one of the most puzzling paradoxes in cardiometabolic medicine: the dedicated professional who eats clean, sits for eight hours at a desk, and yet experiences debilitating afternoon brain fog while their vascular endothelium takes a silent beating.",
    keyTakeaway: 'Static HbA1c masks acute postprandial glucose volatility and endothelial NO quenching.'
  },
  {
    id: 'seg-2',
    speaker: 'investigator',
    speakerTitle: 'Dr. Marc Hamilton (Author Archetype)',
    avatarEmoji: '🔬',
    accentBadge: 'Lead Biologist • en-GB (Scottish / Academic)',
    text: "Sarah, the fundamental issue is that our standard clinical tests are retrospective averages. When you sit with your feet flat, your major calf flexors are electrically silent. Glucose enters the bloodstream with an instantaneous velocity exceeding plus one point five milligrams per deciliter per minute, triggering reactive vascular stiffness.",
    keyTakeaway: 'Velocity (dG/dt >= +1.5 mg/dL/min) detects glucose influx before static thresholds are breached.'
  },
  {
    id: 'seg-3',
    speaker: 'host',
    speakerTitle: 'Dr. Sarah Carter',
    avatarEmoji: '🎙️',
    accentBadge: 'Host & Clinical Inquirer • en-US',
    text: "And that is where your soleus pushup discovery enters! But Marc, why specifically the soleus? Why not just do ordinary standing calf raises during a zoom call?",
    keyTakeaway: 'Knee angle dictates muscle recruitment: 90° flexion isolates the monoarticular soleus.'
  },
  {
    id: 'seg-4',
    speaker: 'investigator',
    speakerTitle: 'Dr. Marc Hamilton (Author Archetype)',
    avatarEmoji: '🔬',
    accentBadge: 'Lead Biologist • en-GB (Scottish / Academic)',
    text: "That is the critical biomechanical distinction. Flexing the knees to ninety degrees passively slackens the biarticular gastrocnemius. The monoarticular soleus takes the entire mechanical load. Because the soleus consists of roughly eighty percent slow-twitch Type One oxidative fibers, sustained rhythmic contractions mobilize non-insulin GLUT4 translocation directly, burning plasma glucose without depleting local glycogen or causing fatigue.",
    keyTakeaway: 'Slow-twitch oxidative soleus fibers consume blood glucose without muscle fatigue or glycogen depletion.'
  },
  {
    id: 'seg-5',
    speaker: 'pharmacologist',
    speakerTitle: 'Clinical Scribe (Skeptical CDS Guard)',
    avatarEmoji: '🛡️',
    accentBadge: 'Pharmacology & CDS Guard • en-CA',
    text: "A vital translational reality check: in the landmark 2022 iScience study, subjects performed soleus pushups for two hundred and seventy minutes—four and a half hours in a lab. In outpatient clinics, we prescribe ten to fifteen minutes post-meal. That delivers a realistic fifteen to twenty-five percent peak blunting, not fifty-two percent. And if adding Berberine, screen for CYP3A4 inhibition to avoid statin toxicity!",
    keyTakeaway: 'Calibrate realistic clinical blunting (15–25%) and enforce CYP3A4 & eGFR safety guardrails.'
  },
  {
    id: 'seg-6',
    speaker: 'host',
    speakerTitle: 'Dr. Sarah Carter',
    avatarEmoji: '🎙️',
    accentBadge: 'Host & Clinical Inquirer • en-US',
    text: "Superb distinction. So our actionable clinical triad is clear: sit comfortably fifteen minutes post-meal, keep knees at ninety degrees, tap your heels at forty to fifty beats per minute for ten to fifteen minutes, and combine with generic Metformin ER at four dollars a month. Science made practical, positive, and productive.",
    keyTakeaway: 'Stepped-care synergy: 10–15 min SPU + $4/mo generic Metformin ER + BMAL1 circadian fasting.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CardiometabolicPodcastEngineService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Web Audio Nodes
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private lfoOsc: OscillatorNode | null = null;

  // State Signals
  readonly isPlaying = signal<boolean>(false);
  readonly isPaused = signal<boolean>(false);
  readonly currentSegmentIndex = signal<number>(0);
  readonly currentWord = signal<string>('');
  readonly isAudioDucked = signal<boolean>(false);
  readonly vagalBedActive = signal<boolean>(true);
  readonly vagalBedVolume = signal<number>(0.12);
  readonly script = signal<IPodcastSegment[]>(CARDIOMETABOLIC_PODCAST_SCRIPT);
  readonly detectedVoices = signal<SpeechSynthesisVoice[]>([]);

  // Computed state
  readonly currentSegment = computed<IPodcastSegment>(() => {
    const list = this.script();
    const idx = this.currentSegmentIndex();
    return list[idx] || list[0];
  });

  readonly progressPercentage = computed<number>(() => {
    const total = this.script().length;
    if (total === 0) return 0;
    return Math.round(((this.currentSegmentIndex() + 1) / total) * 100);
  });

  constructor() {
    if (this.isBrowser) {
      this.initVoices();
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const populate = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        this.detectedVoices.set(v);
      }
    };
    populate();
    window.speechSynthesis.onvoiceschanged = populate;
  }

  /**
   * Lazily initializes Web Audio graph on first user interaction
   */
  async ensureAudioContext(): Promise<AudioContext | null> {
    if (!this.isBrowser) return null;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.audioCtx = new AudioCtxClass();

      // Analyser for real-time oscilloscope canvas
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;

      // Broadcast dynamics compressor
      const compressor = this.audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, this.audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, this.audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);

      // Low-shelf warm broadcast filter
      const eq = this.audioCtx.createBiquadFilter();
      eq.type = 'lowshelf';
      eq.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      eq.gain.setValueAtTime(3.5, this.audioCtx.currentTime);

      // Audio ducking gain node
      this.duckingGain = this.audioCtx.createGain();
      this.duckingGain.gain.setValueAtTime(this.vagalBedVolume(), this.audioCtx.currentTime);

      // Master volume node
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.audioCtx.currentTime);

      // Graph: duckingGain -> eq -> compressor -> masterGain -> analyser -> destination
      this.duckingGain.connect(eq);
      eq.connect(compressor);
      compressor.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  /**
   * Plays a pentatonic intro chime (Cmaj7 arpeggio: C4, E4, G4, B4, D5)
   */
  async playIntroChime(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx || !this.masterGain) return;

    return new Promise((resolve) => {
      const notes = [261.63, 329.63, 392.00, 493.88, 587.33]; // C4, E4, G4, B4, D5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        noteGain.gain.setValueAtTime(0.0001, now + idx * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.1 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.0);
      });

      setTimeout(resolve, 1100);
    });
  }

  /**
   * Starts a 432 Hz / 2 warm triangle wave with 0.1 Hz vagal breath modulation
   */
  startVagalBed(): void {
    if (!this.vagalBedActive() || !this.audioCtx || !this.duckingGain || this.ambientOsc) return;

    try {
      const now = this.audioCtx.currentTime;

      // Carrier: 216 Hz (warm sub-octave of 432 Hz)
      this.ambientOsc = this.audioCtx.createOscillator();
      this.ambientOsc.type = 'triangle';
      this.ambientOsc.frequency.setValueAtTime(216, now);

      // LFO: 0.1 Hz parasympathetic vagal rhythm
      this.lfoOsc = this.audioCtx.createOscillator();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.1, now);

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(0.03, now);

      this.lfoOsc.connect(lfoGain.gain);
      this.ambientOsc.connect(this.duckingGain);

      this.ambientOsc.start();
      this.lfoOsc.start();
    } catch {
      // AudioContext safe catch
    }
  }

  stopVagalBed(): void {
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); } catch {}
      this.ambientOsc.disconnect();
      this.ambientOsc = null;
    }
    if (this.lfoOsc) {
      try { this.lfoOsc.stop(); } catch {}
      this.lfoOsc.disconnect();
      this.lfoOsc = null;
    }
  }

  /**
   * Sets audio ducking volume when voice speaks
   */
  setDucking(isSpeaking: boolean): void {
    this.isAudioDucked.set(isSpeaking);
    if (!this.audioCtx || !this.duckingGain) return;
    const target = isSpeaking ? 0.02 : this.vagalBedVolume();
    this.duckingGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.15);
  }

  /**
   * Selects best voice based on speaker persona and detected dialects
   */
  getVoiceForSpeaker(speaker: 'host' | 'investigator' | 'pharmacologist'): SpeechSynthesisVoice | null {
    const list = this.detectedVoices();
    if (!list.length) return null;

    if (speaker === 'investigator') {
      // Prioritize Scottish, Irish, or British academic cadence
      return (
        list.find(v => v.lang.startsWith('en-GB') && (v.name.includes('Ryan') || v.name.includes('Oliver') || v.name.includes('Natural'))) ||
        list.find(v => v.name.toLowerCase().includes('scotland') || v.name.toLowerCase().includes('fiona') || v.name.toLowerCase().includes('moira')) ||
        list.find(v => v.lang === 'en-GB' || v.lang === 'en-IE') ||
        list.find(v => v.lang.startsWith('en')) || null
      );
    }

    if (speaker === 'pharmacologist') {
      // Prioritize Canadian or British precision voice
      return (
        list.find(v => v.lang === 'en-CA' || (v.lang.startsWith('en-GB') && v.name.includes('Sonia'))) ||
        list.find(v => v.lang.startsWith('en') && v.name.includes('Clara')) ||
        list.find(v => v.lang.startsWith('en')) || null
      );
    }

    // Default Host: Warm, energetic American or Australian voice
    return (
      list.find(v => v.lang.startsWith('en-US') && (v.name.includes('Jenny') || v.name.includes('Samantha') || v.name.includes('Natural'))) ||
      list.find(v => v.lang.startsWith('en-AU')) ||
      list.find(v => v.lang.startsWith('en-US')) ||
      list[0] || null
    );
  }

  /**
   * Speaks an individual podcast segment
   */
  private speakSegment(segment: IPodcastSegment): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBrowser || !('speechSynthesis' in window)) return resolve();

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(segment.text);
      const voice = this.getVoiceForSpeaker(segment.speaker);
      if (voice) utterance.voice = voice;

      // Pacing & tone micro-calibrations
      if (segment.speaker === 'host') {
        utterance.rate = 1.02;
        utterance.pitch = 1.05;
      } else if (segment.speaker === 'investigator') {
        utterance.rate = 0.90;
        utterance.pitch = 0.94;
      } else {
        utterance.rate = 0.98;
        utterance.pitch = 1.00;
      }

      utterance.onstart = () => {
        this.setDucking(true);
      };

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const word = segment.text.substring(event.charIndex, event.charIndex + event.charLength);
          this.currentWord.set(word);
        }
      };

      utterance.onend = () => {
        this.setDucking(false);
        resolve();
      };

      utterance.onerror = () => {
        this.setDucking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Starts playback of the narrative podcast
   */
  async startPodcast(): Promise<void> {
    if (!this.isBrowser) return;

    await this.ensureAudioContext();
    this.isPlaying.set(true);
    this.isPaused.set(false);

    // 1. Play intro chime on fresh start
    if (this.currentSegmentIndex() === 0) {
      await this.playIntroChime();
    }

    // 2. Start gentle 432 Hz vagal background bed
    this.startVagalBed();

    // 3. Play through segments
    const scriptList = this.script();
    while (this.isPlaying() && this.currentSegmentIndex() < scriptList.length) {
      const idx = this.currentSegmentIndex();
      await this.speakSegment(scriptList[idx]);

      if (!this.isPlaying()) break;

      // Check if paused
      if (this.isPaused()) {
        break;
      }

      // Conversational turn-taking pause (450ms)
      if (idx + 1 < scriptList.length) {
        await new Promise(r => setTimeout(r, 450));
        this.currentSegmentIndex.set(idx + 1);
      } else {
        // Reached end
        this.stopPodcast();
        break;
      }
    }
  }

  pausePodcast(): void {
    if (!this.isBrowser) return;
    this.isPaused.set(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.setDucking(false);
  }

  resumePodcast(): void {
    if (!this.isBrowser) return;
    this.isPaused.set(false);
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.setDucking(true);
    } else {
      this.startPodcast();
    }
  }

  stopPodcast(): void {
    this.isPlaying.set(false);
    this.isPaused.set(false);
    this.currentWord.set('');
    this.currentSegmentIndex.set(0);

    if (this.isBrowser && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.stopVagalBed();
    this.setDucking(false);
  }

  skipToSegment(index: number): void {
    const list = this.script();
    if (index >= 0 && index < list.length) {
      this.currentSegmentIndex.set(index);
      if (this.isPlaying()) {
        if (this.isBrowser && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        this.startPodcast();
      }
    }
  }

  nextSegment(): void {
    this.skipToSegment(this.currentSegmentIndex() + 1);
  }

  previousSegment(): void {
    this.skipToSegment(Math.max(0, this.currentSegmentIndex() - 1));
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }
}
