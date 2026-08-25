import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PetAuditoryService {
  private audioCtx: AudioContext | null = null;
  private nodes: any[] = [];
  private isPlaying = false;
  private activeMode: 'feline' | 'canine' | 'cetacean' | 'avian' | 'dreamteam' | null = null;
  private recognition: any = null;
  private isListening = false;

  constructor() {
    this.initWakeWordListening();
  }

  public initWakeWordListening() {
    if (typeof window === 'undefined') return;
    if (this.recognition) return;

    if (typeof navigator !== 'undefined' && navigator.webdriver) {
      console.log('[Pet Auditory] Automated test environment detected. Skipping STT initialization.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastResultIndex = event.resultIndex;
        const transcript = event.results[lastResultIndex][0].transcript.toLowerCase().trim();
        console.log('[Pet Auditory Wake Word STT]', transcript);

        if (transcript.includes('canine comfort') || transcript.includes('canine')) {
          this.playCanineHeartbeat();
        } else if (transcript.includes('feline comfort') || transcript.includes('feline') || transcript.includes('purr')) {
          this.playFelinePurr();
        } else if (transcript.includes('cetacean comfort') || transcript.includes('cetacean')) {
          this.playCetaceanTherapy();
        } else if (transcript.includes('avian comfort') || transcript.includes('avian') || transcript.includes('bird')) {
          this.playAvianTherapy();
        } else if (transcript.includes('stop comfort') || transcript.includes('stop audio') || transcript.includes('stop')) {
          this.stop();
        }
      };

      this.recognition.onerror = (err: any) => {
        const errType = err.error || '';
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          console.warn('[Pet Auditory] Microphone permission denied or service unavailable. Disabling STT.');
          this.stopWakeWordListening();
        } else {
          console.warn('Pet Auditory STT error:', errType || err);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart Pet Auditory STT', e);
          }
        }
      };

      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      console.error('Failed to initialize Pet Auditory STT', e);
    }
  }

  public stopWakeWordListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Recognition may already be stopped; expected during teardown
      }
    }
  }

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private timerId: any = null;

  public stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.audioCtx) {
      this.nodes.forEach(n => {
        try { n.stop(); } catch(e) { /* AudioNode may already be stopped */ }
        try { n.disconnect(); } catch(e) { /* AudioNode may already be disconnected */ }
      });
      this.nodes = [];
    }
    this.isPlaying = false;
    this.activeMode = null;
  }

  /** Schedules automatic safety cutoff aligned with species attention span limits. */
  private scheduleSpeciesAutoCutoff(durationMinutes: number) {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      console.log(`[Pet Auditory] ${this.activeMode} attention-span limit reached (${durationMinutes} min). Auto-stopping.`);
      this.stop();
    }, durationMinutes * 60 * 1000);
  }

  public get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public get currentMode(): 'feline' | 'canine' | 'cetacean' | 'avian' | 'dreamteam' | null {
    return this.activeMode;
  }

  /**
   * Simulates a feline purr using a low-frequency oscillator (25Hz) modulated
   * by a slower LFO to create the rhythmic breathing/purring cadence.
   */
  public playFelinePurr() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    // Base purr frequency (25Hz - 50Hz is therapeutic for cats)
    const carrier = this.audioCtx.createOscillator();
    carrier.type = 'sawtooth'; // Sawtooth gives a nice rumbly texture
    carrier.frequency.value = 25;

    // Amplitude modulation to simulate breathing/purring rhythm
    const modulator = this.audioCtx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 1.5; // 1.5 Hz ~ 90 BPM (fast breathing)

    const modulatorGain = this.audioCtx.createGain();
    modulatorGain.gain.value = 0.5;

    // A lowpass filter to remove harsh high frequencies from the sawtooth
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = 0; // fade in

    // Routing
    modulator.connect(modulatorGain);
    modulatorGain.connect(masterGain.gain);
    carrier.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.audioCtx.destination);

    // Fade in
    masterGain.gain.setTargetAtTime(0.4, this.audioCtx.currentTime, 1.0);

    carrier.start();
    modulator.start();

    this.nodes.push(carrier, modulator, modulatorGain, filter, masterGain);
    this.isPlaying = true;
    this.activeMode = 'feline';
    this.scheduleSpeciesAutoCutoff(2.0); // 2-minute feline attention span micro-dose
  }

  /**
   * Simulates a rhythmic, soothing heartbeat for dogs.
   * Uses a low-frequency sine wave with an envelope.
   */
  public playCanineHeartbeat() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    const BPM = 60;
    const beatDuration = 60 / BPM;
    
    this.isPlaying = true;
    this.activeMode = 'canine';
    let nextBeatTime = this.audioCtx.currentTime + 0.1;

    const scheduleBeat = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      // First thump
      this.createThump(nextBeatTime);
      // Second thump
      this.createThump(nextBeatTime + 0.2);

      nextBeatTime += beatDuration;
      
      // Schedule next beat
      const timeUntilNext = (nextBeatTime - this.audioCtx.currentTime) * 1000;
      setTimeout(scheduleBeat, timeUntilNext - 100);
    };

    scheduleBeat();
  }

  private createThump(time: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(45, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.8, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.2);

    // Keep track of master nodes if we need to completely halt, but short nodes garbage collect.
  }

  /**
   * Simulates deep ocean cetacean (orca/dolphin) sounds.
   * Combines high-pitched frequency-swept whistles, short echolocation clicks,
   * and a deep marine ambient drone.
   */
  public playCetaceanTherapy() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.activeMode = 'cetacean';

    const ctx = this.audioCtx;

    // 1. Deep ocean low-frequency drone (hum at 60Hz and 90Hz)
    const drone1 = ctx.createOscillator();
    const drone2 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone1.type = 'sine';
    drone1.frequency.value = 60;
    drone2.type = 'sine';
    drone2.frequency.value = 90;
    droneGain.gain.value = 0.08;

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone1.start();
    drone2.start();
    this.nodes.push(drone1, drone2, droneGain);

    // 2. Scheduler for whistles and clicks
    const scheduleCetaceanSounds = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      // Randomly choose between generating a whistle or a series of clicks
      const r = Math.random();
      if (r < 0.45) {
        // Generate a therapeutic whale/dolphin whistle
        this.createWhistle(ctx.currentTime + 0.1);
      } else if (r < 0.85) {
        // Generate a series of dolphin echolocation clicks
        this.createClicks(ctx.currentTime + 0.1);
      }

      // Schedule next sounds in 3.5 - 6.5 seconds
      const delaySec = 3.5 + Math.random() * 3.0;
      const timeoutId = setTimeout(scheduleCetaceanSounds, delaySec * 1000);
      this.nodes.push({ stop: () => clearTimeout(timeoutId), disconnect: () => {} });
    };

    scheduleCetaceanSounds();
  }

  private createWhistle(startTime: number) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // Dolphin/orca whistles: frequency sweeps between 2.2kHz and 6.5kHz
    const startFreq = 2200 + Math.random() * 1500;
    const endFreq = startFreq + 1200 + Math.random() * 2000;
    const duration = 1.2 + Math.random() * 1.6;

    osc.frequency.setValueAtTime(startFreq, startTime);
    // Smooth frequency sweep
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration * 0.45);
    osc.frequency.exponentialRampToValueAtTime(startFreq - 400, startTime + duration);

    // Smooth gain envelope (fade-in, fade-out)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.04, startTime + 0.15);
    gain.gain.setValueAtTime(0.04, startTime + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  private createClicks(startTime: number) {
    if (!this.audioCtx) return;
    const count = 6 + Math.floor(Math.random() * 8);
    let time = startTime;

    for (let i = 0; i < count; i++) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Extremely high-frequency click (e.g. 7.5kHz - 9.5kHz)
      osc.frequency.setValueAtTime(8500 + (Math.random() - 0.5) * 1500, time);

      // Short click envelope (1-3ms)
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.05, time + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.003);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(time);
      osc.stop(time + 0.01);

      // Click interval: rapid (25ms to 90ms spacing)
      time += 0.025 + Math.random() * 0.065;
    }
  }

  /**
   * Simulates a soothing forest ambient soundscape with procedurally generated
   * calls from Crows, Parrots, and Peregrine Falcons.
   */
  public playAvianTherapy() {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    this.isPlaying = true;
    this.activeMode = 'avian';

    const ctx = this.audioCtx;

    // Forest ambient sound (low hum/wind sound)
    const forestGain = ctx.createGain();
    forestGain.gain.value = 0.03;

    const noise = ctx.createOscillator();
    noise.type = 'sine';
    noise.frequency.value = 80;
    
    noise.connect(forestGain);
    forestGain.connect(ctx.destination);
    noise.start();
    this.nodes.push(noise, forestGain);

    const scheduleAvianSounds = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      const r = Math.random();
      if (r < 0.33) {
        this.createFalconScreech(ctx.currentTime + 0.1);
      } else if (r < 0.66) {
        this.createCrowCaw(ctx.currentTime + 0.1);
      } else {
        this.createParrotWhistle(ctx.currentTime + 0.1);
      }

      // Schedule next sound in 2.5 - 5.0 seconds
      const delaySec = 2.5 + Math.random() * 2.5;
      const timeoutId = setTimeout(scheduleAvianSounds, delaySec * 1000);
      this.nodes.push({ stop: () => clearTimeout(timeoutId), disconnect: () => {} });
    };

    scheduleAvianSounds();
  }

  private createFalconScreech(startTime: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2800, startTime);
    osc.frequency.linearRampToValueAtTime(1600, startTime + 0.6);

    vibrato.frequency.value = 45; // 45 Hz rapid vibrato
    vibratoGain.gain.value = 250; // Pitch vibrato depth

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.015, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);

    vibrato.start(startTime);
    osc.start(startTime);

    vibrato.stop(startTime + 0.6);
    osc.stop(startTime + 0.6);
  }

  private createCrowCaw(startTime: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const cawCount = 2 + Math.floor(Math.random() * 2);
    let time = startTime;

    for (let i = 0; i < cawCount; i++) {
      const osc = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, time);
      osc.frequency.linearRampToValueAtTime(580, time + 0.35);

      modulator.type = 'sawtooth';
      modulator.frequency.value = 85; // fast modulation for buzzy raspy tone
      modGain.gain.value = 180;

      filter.type = 'bandpass';
      filter.frequency.value = 750;
      filter.Q.value = 2.0;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.03, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      modulator.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      modulator.start(time);
      osc.start(time);
      modulator.stop(time + 0.35);
      osc.stop(time + 0.35);

      time += 0.45;
    }
  }

  private createParrotWhistle(startTime: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, startTime);
    osc.frequency.exponentialRampToValueAtTime(3200, startTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(1800, startTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(2600, startTime + 0.45);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.025, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.5);
  }
}
