export class SoundOfMoorsAudio {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;

  public toggleAmbientSound(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Generate 5 seconds of soft pink noise buffer for realistic ocean/wind swell
      const bufferSize = this.audioCtx.sampleRate * 5;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Low-pass filter to sound like soft coastal breeze & gentle surf
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      // Low Frequency Oscillator (LFO) to create gentle rhythmic swell (waves coming in every 7 seconds)
      this.lfoNode = this.audioCtx.createOscillator();
      this.lfoNode.frequency.setValueAtTime(0.14, this.audioCtx.currentTime); // ~7-second ocean swell cycle

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(180, this.audioCtx.currentTime);
      this.lfoNode.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);

      // Master Gain for smooth fade-in
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.35, this.audioCtx.currentTime + 2.0);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      this.noiseNode.start(0);
      this.lfoNode.start(0);
      this.isPlaying = true;
    } catch {
      // Defensive fallback
    }
  }

  public stop() {
    if (!this.audioCtx || !this.masterGain) return;
    try {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioCtx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.0);
      setTimeout(() => {
        try {
          this.noiseNode?.stop();
          this.lfoNode?.stop();
          this.audioCtx?.close();
        } catch {}
        this.isPlaying = false;
        this.audioCtx = null;
      }, 1000);
    } catch {
      this.isPlaying = false;
    }
  }
}
