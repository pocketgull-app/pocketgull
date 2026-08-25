/**
 * Kachinka Procedural Web Audio Synthesizer
 * Generates tactile mechanical clicks, relay latches, gear ticks, and spring thuds
 * without requiring external MP3/WAV audio files.
 */
export class KachinkaAudioEngine {
  private ctx: AudioContext | null = null;

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play satisfying mechanical "Ka-chink!" sound (relay latch + spring thud)
   */
  public playKaChink(): void {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Initial Metallic Click (Noise Transient)
    const bufferSize = this.ctx.sampleRate * 0.05; // 50ms
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(4.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);

    // 2. Heavy Resonant Body Thud ("Chink" component)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now + 0.015);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    oscGain.gain.setValueAtTime(0.6, now + 0.015);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now + 0.015);
    osc.stop(now + 0.13);
  }

  /**
   * Play crisp brass gear tick for detents or dials
   */
  public playGearTick(): void {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }
}

export const kachinkaAudio = new KachinkaAudioEngine();
