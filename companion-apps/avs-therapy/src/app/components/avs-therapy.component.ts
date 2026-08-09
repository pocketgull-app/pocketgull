import { Component, signal, computed, effect, inject, OnDestroy, PLATFORM_ID, Inject, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalContextAvsService } from '../services/clinical-context-avs.service';
import { LifestyleAdjunctService } from '../services/lifestyle-adjunct.service';
import { BreathGuideComponent } from './breath-guide.component';
import { AthleticProtocolService } from '../services/athletic-protocol.service';
import { AthleticState } from '../services/patient.types';
import { PythonBridgeService } from '../services/python-bridge.service';

import { BrainwaveFrequency, WAVE_PROFILES, ViewMode, ProtocolMode, ColorTemperature } from './avs.constants';
import { AvsHeaderComponent } from './avs-header.component';
import { AvsVisualizerComponent } from './avs-visualizer.component';
import { ClinicianConsoleComponent } from './clinician-console.component';
import { CircadianDashboardComponent } from './circadian-dashboard.component';
import { CoRegulationPanelComponent } from './co-regulation-panel.component';
import { SessionControlsComponent } from './session-controls.component';
import { LifestyleAdjunctPanelComponent } from './lifestyle-adjunct-panel.component';
import { PatientWaitingComponent } from './patient-waiting.component';

@Component({
  selector: 'app-avs-therapy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreathGuideComponent,
    AvsHeaderComponent,
    AvsVisualizerComponent,
    ClinicianConsoleComponent,
    CircadianDashboardComponent,
    CoRegulationPanelComponent,
    SessionControlsComponent,
    LifestyleAdjunctPanelComponent,
    PatientWaitingComponent
  ],
  templateUrl: './avs-therapy.component.html',
  styleUrl: './avs-therapy.component.css'
})
export class AvsTherapyComponent implements OnDestroy {
  patientState     = inject(PatientStateService);
  private contextAvs   = inject(ClinicalContextAvsService);
  readonly lifestyleAdj = inject(LifestyleAdjunctService);
  readonly athleticService = inject(AthleticProtocolService);
  private pythonBridge = inject(PythonBridgeService);
  private isBrowser = false;

  protocolMode = signal<ProtocolMode>('clinical');
  viewMode = signal<ViewMode>('clinician');
  athleticSport = signal('Sprinting');
  athleticState = signal<AthleticState>('priming');

  // --- Dynamic Telemetry & Settings Signals ---
  isActive = signal(false);
  voiceEnabled = signal(true);
  voicePacingEnabled = signal(false);
  vibrationEnabled = signal(false);

  targetHr = signal(70);
  targetBreathingRate = signal(6.0); // Respiration pacing per minute (coherence frequency)
  targetWave = signal<BrainwaveFrequency>('theta');
  customFrequency = signal<number | null>(null);
  colorTemp = signal<ColorTemperature>('indigo');

  // --- Web Audio API Properties ---
  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private mainGain: GainNode | null = null;

  // --- Speech & Vibration Interval Handles ---
  private guidanceTimer: any = null;
  private vibrationTimer: any = null;
  hasVibrator = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.hasVibrator = !!navigator.vibrate;

      // Closed-loop Gradient Tuning: Adjust targets dynamically based on physiological state deviations (RPP, heart rate)
      effect(() => {
        const liveVitals = this.patientState.vitals();
        if (liveVitals.hr) {
          const hrVal = parseInt(liveVitals.hr, 10);
          const bpParts = (liveVitals.bp || '120/80').split('/');
          const sbpVal = bpParts.length > 0 ? parseInt(bpParts[0], 10) : 120;

          if (!isNaN(hrVal) && !isNaN(sbpVal)) {
            const rpp = hrVal * sbpVal;

            // If the session is active, dynamically adjust on-the-fly to guide biometrics to target
            if (this.isActive()) {
              if (rpp > 12000 || hrVal > 85) {
                // High myocardial workload or tachycardia: step down target frequency and respiration rate
                this.targetWave.set('theta');
                this.targetBreathingRate.set(5.5);
                this.colorTemp.set('violet');
              } else if (hrVal < 55 || sbpVal < 100) {
                // Bradycardia or Hypotension: step up target frequency to maintain safe alertness
                this.targetWave.set('alpha');
                this.targetBreathingRate.set(6.5);
                this.colorTemp.set('emerald');
              } else {
                // Baseline target
                this.targetWave.set('alpha');
                this.targetBreathingRate.set(6.0);
                this.colorTemp.set('indigo');
              }
            } else {
              // Standby default recommendations
              if (rpp > 12000 || hrVal > 85) {
                this.targetWave.set('theta');
                this.targetBreathingRate.set(5.5);
              }
            }
          }
        }
      }, { allowSignalWrites: true });

      // Synchronize active AVS session state with the global PatientStateService for 3D body viewer entrainment
      effect(() => {
        const active = this.isActive();
        const rate = this.targetBreathingRate();
        const wave = this.targetWave();
        const freqHz = this.targetBrainwaveFrequencyHz();

        this.patientState.isAvsSessionActive.set(active);
        this.patientState.avsBreathingRate.set(rate);
        this.patientState.avsBrainwaveFrequency.set(wave);
        this.patientState.avsBrainwaveFrequencyHz.set(freqHz);
      }, { allowSignalWrites: true });
    }
  }

  // --- Computed Helpers ---
  targetBrainwaveFrequencyHz = computed(() => {
    const custom = this.customFrequency();
    if (custom !== null) return custom;
    const profile = WAVE_PROFILES.find(w => w.id === this.targetWave());
    return profile ? profile.freq : 6.0;
  });

  currentWaveFrequencyName = computed(() => {
    return this.targetWave().toUpperCase();
  });

  selectedWaveDescription = computed(() => {
    const profile = WAVE_PROFILES.find(w => w.id === this.targetWave());
    return profile ? profile.desc : '';
  });

  currentBaseFrequency = computed(() => {
    // Dynamically adjust carrier frequency based on target wave for optimal resonance
    switch (this.targetWave()) {
      case 'delta': return 150; // Low frequency base for somatic resonance
      case 'theta': return 200; // Calming frequency
      case 'alpha': return 250; // Meditative balance
      case 'beta': return 350;  // Focus-enhancing higher frequency
      default: return 200;
    }
  });

  pulseIntervalMs = computed(() => {
    // Breathing pacing in milliseconds per complete cycle
    return Math.round((60 / this.targetBreathingRate()) * 1000);
  });

  // --- Event Handlers for UI Sliders ---
  onHrSliderChange(value: number) {
    this.targetHr.set(value);

    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance("Target heart rate updated by practitioner. Directing entrainment toward " + value + " beats per minute.");
    }
  }

  onBreathingSliderChange(value: number) {
    this.targetBreathingRate.set(value);

    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance("Respiratory pacing adjusted. Breathing cycle is now set to " + value.toFixed(1) + " breaths per minute.");
    }
  }

  onFrequencySliderChange(value: number) {
    this.customFrequency.set(value);
    if (this.isActive()) {
      this.restartOscillators();
      if (this.voiceEnabled()) {
        this.speakGuidance(`Light modulation frequency tuned to ${value.toFixed(1)} Hertz.`);
      }
    }
  }

  selectColorTemp(temp: ColorTemperature) {
    this.colorTemp.set(temp);
    if (this.isActive() && this.voiceEnabled()) {
      this.speakGuidance(`Circadian color temperature preset shifted to ${temp.replace('-', ' ')}.`);
    }
  }

  // --- Co-Regulation Protocol Handlers ---

  /**
   * Invoke Gemini to generate a personalized AVS co-regulation protocol
   * from the patient's clinical context (PTSD, occupation, reason for visit).
   * Falls back to a deterministic heuristic if Gemini is unavailable.
   */
  async generateCoRegProtocol(): Promise<void> {
    await this.contextAvs.generateContextualProtocol();
  }

  /**
   * Apply the currently generated co-regulation protocol to the AVS session
   * controls and start the session.
   */
  applyProtocolToSession(): void {
    const proto = this.patientState.avsProtocol();
    if (!proto) return;
    this.targetWave.set(proto.wave as BrainwaveFrequency);
    this.targetBreathingRate.set(proto.breathing_bpm);
    if (!this.isActive()) this.startTherapy();
    else this.restartOscillators();
  }

  generateAthleticProtocol(): void {
    this.athleticService.generate({
      state: this.athleticState(),
      sportType: this.athleticSport(),
      preferredMusic: 'high-tempo'
    });
  }

  applyAthleticProtocol(): void {
    const session = this.athleticService.session();
    if (!session) return;

    // Auto-map athletic state to brainwave target
    const stateToWave: Record<AthleticState, BrainwaveFrequency> = {
      'priming': 'beta',
      'flow': 'alpha',
      'recovery': 'theta',
      'phase-shift': 'delta'
    };

    this.targetWave.set(stateToWave[this.athleticState()]);
    // Set a matching breathing rate (e.g. faster for priming, slower for recovery)
    if (this.athleticState() === 'priming') this.targetBreathingRate.set(12.0);
    else if (this.athleticState() === 'recovery') this.targetBreathingRate.set(5.5);
    else this.targetBreathingRate.set(6.0);

    if (!this.isActive()) this.startTherapy();
    else this.restartOscillators();
  }

  /** Scan chart and populate lifestyle adjunct recommendations (instant, no Gemini). */
  generateAdjuncts(): void {
    this.lifestyleAdj.generate();
  }

  selectWaveProfile(profileId: BrainwaveFrequency) {
    this.customFrequency.set(null);
    this.targetWave.set(profileId);

    if (this.isActive()) {
      // Live reload audio oscillators with the new frequencies immediately
      this.restartOscillators();

      if (this.voiceEnabled()) {
        this.speakGuidance(`Neurological target shifted to ${profileId} waves at ${this.targetBrainwaveFrequencyHz()} Hertz.`);
      }
    }
  }

  // --- Speech Therapy (WebSpeech API) ---
  private speakGuidance(text: string) {
    if (!this.isBrowser || !('speechSynthesis' in window)) return;

    // Stop any active utterance to prevent queue build up
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Slow, calming, clinical voice configuration
    utterance.rate = 0.8;
    utterance.pitch = 0.95;

    // Search for a warm, premium clinical/local voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Natural') || v.lang === 'en-US');
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // --- Session Controls ---
  toggleSession() {
    if (this.isActive()) {
      this.stopTherapy();
    } else {
      this.startTherapy();
    }
  }

  toggleVoice() {
    this.voiceEnabled.update(v => !v);
  }

  toggleVoicePacing() {
    this.voicePacingEnabled.update(v => !v);
  }

  toggleVibration() {
    if (!this.hasVibrator) return;
    this.vibrationEnabled.update(v => !v);

    if (this.isActive()) {
      if (this.vibrationEnabled()) {
        this.startHapticLoop();
      } else {
        this.stopHapticLoop();
      }
    }
  }

  // --- AVS Brainwave Synthesis (Web Audio API) ---
  private startTherapy() {
    if (!this.isBrowser) return;

    this.isActive.set(true);
    this.pythonBridge.startBiosignalStream('avs-session-' + Date.now());

    try {
      // 1. Initialize Audio Context
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      // 2. Setup Stereo Channel Merger Node (Input 0 -> Left, Input 1 -> Right)
      const merger = this.audioCtx.createChannelMerger(2);

      // 3. Setup oscillators with the carrier and differential frequencies
      const carrier = this.currentBaseFrequency();
      const difference = this.targetBrainwaveFrequencyHz();

      // Left Ear
      this.oscLeft = this.audioCtx.createOscillator();
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.value = carrier;

      // Right Ear (Carrier + Difference frequency creates the Binaural beat)
      this.oscRight = this.audioCtx.createOscillator();
      this.oscRight.type = 'sine';
      this.oscRight.frequency.value = carrier + difference;

      // Connect oscillators to corresponding channels
      this.oscLeft.connect(merger, 0, 0);
      this.oscRight.connect(merger, 0, 1);

      // 4. Generate Soothing Pink/Brown Background Noise
      const bufferSize = 4 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Filter to brown noise (extremely restorative low frequency rumble)
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain factor
      }

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Low pass filter to keep noise deeply restorative
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180; // Cut off high frequencies

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.value = 0.08; // Gentle background masking

      this.noiseNode.connect(filter);
      filter.connect(noiseGain);

      // 5. Setup Master Gain
      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(0.18, this.audioCtx.currentTime); // Standard comfortable volume

      // Connect components to Master Gain
      merger.connect(this.mainGain);
      noiseGain.connect(this.mainGain);

      // Connect Master Gain to Speaker destination
      this.mainGain.connect(this.audioCtx.destination);

      // 6. Start Audio generators
      this.oscLeft.start();
      this.oscRight.start();
      this.noiseNode.start();

      // 7. Initiate Speech Induction Flow
      if (this.voiceEnabled()) {
        const hr = this.patientState.vitals().hr || '80';
        this.speakGuidance(
          `Initiating clinical biometric entrainment session. Active heart rate telemetry is ${hr} beats per minute. ` +
          `Setting respiratory coherence pacing to ${this.targetBreathingRate()} breaths per minute. ` +
          `Please match your breathing to the orange pulsing light. Inhale as it expands, exhale as it contracts. Let's begin.`
        );
      }

      // 8. Start dynamic speech and haptic intervals
      this.startSpeechGuidanceLoop();
      if (this.vibrationEnabled()) {
        this.startHapticLoop();
      }

    } catch (e) {
      console.error('[AVS Therapy] Failed to initialize Web Audio API: ', e);
    }
  }

  private stopTherapy() {
    this.isActive.set(false);
    this.pythonBridge.stopBiosignalStream();

    // Stop WebSpeech
    if (this.isBrowser && ('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
    }

    // Clean up Audio Nodes
    try {
      if (this.oscLeft) { this.oscLeft.stop(); this.oscLeft.disconnect(); }
      if (this.oscRight) { this.oscRight.stop(); this.oscRight.disconnect(); }
      if (this.noiseNode) { this.noiseNode.stop(); this.noiseNode.disconnect(); }
      if (this.mainGain) { this.mainGain.disconnect(); }
      if (this.audioCtx) { this.audioCtx.close(); }
    } catch (_) {}

    this.oscLeft = null;
    this.oscRight = null;
    this.noiseNode = null;
    this.mainGain = null;
    this.audioCtx = null;

    // Stop intervals
    if (this.guidanceTimer) { clearInterval(this.guidanceTimer); this.guidanceTimer = null; }
    this.stopHapticLoop();
  }

  private restartOscillators() {
    if (!this.isActive() || !this.audioCtx) return;

    const carrier = this.currentBaseFrequency();
    const difference = this.targetBrainwaveFrequencyHz();

    if (this.oscLeft && this.oscRight) {
      // Smooth frequency transition using AudioParams
      const now = this.audioCtx.currentTime;
      this.oscLeft.frequency.setTargetAtTime(carrier, now, 0.2);
      this.oscRight.frequency.setTargetAtTime(carrier + difference, now, 0.2);
    }
  }

  // --- Guidance Loop (Adaptive clinical voice checks) ---
  private startSpeechGuidanceLoop() {
    if (this.guidanceTimer) clearInterval(this.guidanceTimer);

    let step = 0;
    this.guidanceTimer = setInterval(() => {
      if (!this.isActive() || !this.voiceEnabled() || this.voicePacingEnabled()) return;

      const hrVal = parseInt(this.patientState.vitals().hr || '80', 10);
      step++;

      if (step % 2 === 1) {
        // Clinical biometric feedback
        if (hrVal > this.targetHr()) {
          this.speakGuidance(
            `Elevated pulse detected. Focus on elongating your exhalation. ` +
            `Exhale for ${Math.round(this.pulseIntervalMs() / 2000)} seconds, and let your baseline targets stabilize.`
          );
        } else {
          this.speakGuidance(
            `Coherence achieved. Heart rate is fully synchronized. Continuing ${this.targetWave()} brainwave entrainment.`
          );
        }
      } else {
        // Restorative imagery guidance
        const prompts = [
          "Visualize neural pathways firing with crystal clarity. Calm, steady, focused.",
          "Inhale healing and vitality. Exhale tension, worry, and static noise.",
          "Feel the rhythmic resonance aligning your somatic and autonomic systems. Deep clinical restoration.",
          "Your nervous system is resetting. Neural pathways are finding quiet, cohesive flow."
        ];
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        this.speakGuidance(randomPrompt);
      }
    }, 28000); // Trigger soothing updates every 28 seconds
  }

  // --- Physical Haptic Loop (`navigator.vibrate`) ---
  private startHapticLoop() {
    this.stopHapticLoop();
    if (!this.isBrowser || !this.hasVibrator || !this.vibrationEnabled()) return;

    const pacingIntervalMs = this.pulseIntervalMs();

    // Heartbeat-like double vibration at the beginning of each inhalation cycle
    const heartbeatPattern = [120, 80, 120];

    this.vibrationTimer = setInterval(() => {
      if (this.isActive() && this.vibrationEnabled()) {
        navigator.vibrate(heartbeatPattern);
      }
    }, pacingIntervalMs);
  }

  private stopHapticLoop() {
    if (this.vibrationTimer) {
      clearInterval(this.vibrationTimer);
      this.vibrationTimer = null;
    }
    if (this.isBrowser && this.hasVibrator) {
      navigator.vibrate(0); // Cancel any active vibrations
    }
  }

  ngOnDestroy() {
    this.stopTherapy();
  }
}
