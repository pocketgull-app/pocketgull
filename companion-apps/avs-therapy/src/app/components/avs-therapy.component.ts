import { Component, ChangeDetectionStrategy, signal, computed, effect, inject, OnDestroy, PLATFORM_ID, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../services/patient-state.service';
import { ClinicalContextAvsService } from '../services/clinical-context-avs.service';
import { LifestyleAdjunctService } from '../services/lifestyle-adjunct.service';
import { AthleticProtocolService } from '../services/athletic-protocol.service';
import { AthleticState } from '../services/patient.types';
import { PythonBridgeService } from '../services/python-bridge.service';
import { AvsUiService } from '../services/avs-ui.service';
import { GlobalAvsService } from '../services/global-avs.service';

import { BrainwaveFrequency, WAVE_PROFILES, ViewMode, ProtocolMode, ColorTemperature } from './avs.constants';
import { AvsHeaderComponent } from './avs-header.component';
import { AvsVisualizerComponent } from './avs-visualizer.component';
import { ClinicianConsoleComponent } from './clinician-console.component';
import { CircadianDashboardComponent } from './circadian-dashboard.component';
import { CoRegulationPanelComponent } from './co-regulation-panel.component';
import { SessionControlsComponent } from './session-controls.component';
import { LifestyleAdjunctPanelComponent } from './lifestyle-adjunct-panel.component';
import { PatientWaitingComponent } from './patient-waiting.component';

// Next-Gen Innovation Components
import { QeegHudComponent } from './qeeg-hud.component';
import { SleepInsomniaPanelComponent } from './sleep-insomnia-panel.component';
import { RppgCameraHudComponent } from './rppg-camera-hud.component';
import { WebglSacredGeometryComponent } from './webgl-sacred-geometry.component';
import { DyadicSyncHudComponent } from './dyadic-sync-hud.component';
import { AvsExportModalComponent } from './avs-export-modal.component';
import { OpticalInnovationsHudComponent } from './optical-innovations-hud.component';
import { BiophilicVagalOdysseyHudComponent } from './biophilic-vagal-odyssey-hud.component';
import { NeuroBionicReaderComponent } from './neuro-bionic-reader.component';

// Next-Gen Services
import { QeegEntrainmentService } from '../services/qeeg-entrainment.service';
import { SleepInsomniaProtocolService } from '../services/sleep-insomnia-protocol.service';
import { ContactlessRppgService } from '../services/contactless-rppg.service';
import { SpatialAmbisonicsService } from '../services/spatial-ambisonics.service';
import { DyadicCoRegulationService } from '../services/dyadic-co-regulation.service';
import { AvsSessionScribeService } from '../services/avs-session-scribe.service';
import { OpticalInnovationsService } from '../services/optical-innovations.service';

export type AvsInnovationTab = 'qeeg' | 'sleep' | 'rppg' | 'spatial' | 'dyadic' | 'coreg' | 'optical' | 'odyssey' | 'reader';

@Component({
  selector: 'app-avs-therapy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AvsHeaderComponent,
    AvsVisualizerComponent,
    ClinicianConsoleComponent,
    CircadianDashboardComponent,
    CoRegulationPanelComponent,
    SessionControlsComponent,
    LifestyleAdjunctPanelComponent,
    PatientWaitingComponent,
    QeegHudComponent,
    SleepInsomniaPanelComponent,
    RppgCameraHudComponent,
    WebglSacredGeometryComponent,
    DyadicSyncHudComponent,
    AvsExportModalComponent,
    OpticalInnovationsHudComponent,
    BiophilicVagalOdysseyHudComponent,
    NeuroBionicReaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avs-therapy.component.html',
  styleUrl: './avs-therapy.component.css'
})
export class AvsTherapyComponent implements OnDestroy {
  readonly patientState    = inject(PatientStateService);
  private readonly contextAvs  = inject(ClinicalContextAvsService);
  readonly lifestyleAdj    = inject(LifestyleAdjunctService);
  readonly athleticService = inject(AthleticProtocolService);
  private readonly pythonBridge = inject(PythonBridgeService);
  readonly avsUi           = inject(AvsUiService);
  readonly globalAvs       = inject(GlobalAvsService);

  // Injected Next-Gen Services
  readonly qeeg    = inject(QeegEntrainmentService);
  readonly sleep   = inject(SleepInsomniaProtocolService);
  readonly rppg    = inject(ContactlessRppgService);
  readonly spatial = inject(SpatialAmbisonicsService);
  readonly dyadic  = inject(DyadicCoRegulationService);
  readonly scribe  = inject(AvsSessionScribeService);
  readonly optical = inject(OpticalInnovationsService);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser  = isPlatformBrowser(this.platformId);

  protocolMode = signal<ProtocolMode>('clinical');
  viewMode = signal<ViewMode>('clinician');
  athleticSport = signal('Sprinting');
  athleticState = signal<AthleticState>('priming');

  // Navigation tab for the 9 next-gen clinical innovations
  activeInnovationTab = signal<AvsInnovationTab>('qeeg');
  isExportModalOpen = signal<boolean>(false);

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

  // Solfeggio & Acoustic Controls
  activeCarrierHz = signal<number>(432);
  volume = signal<number>(75);
  pinkNoiseEnabled = signal<boolean>(true);
  sessionDurationMinutes = signal<number>(15);
  sessionSecondsRemaining = signal<number | null>(null);
  isCprActive = computed(() => this.globalAvs.isCprMetronomeActive());

  // --- Web Audio API Properties ---
  private audioCtx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private mainGain: GainNode | null = null;

  // --- Interval & Timer Handles ---
  private guidanceTimer: any = null;
  private vibrationTimer: any = null;
  private countdownTimer: any = null;
  hasVibrator = false;

  constructor() {
    if (this.isBrowser) {
      this.hasVibrator = !!navigator.vibrate;

      // Closed-loop Gradient Tuning: Adjust targets dynamically based on physiological state deviations
      effect(() => {
        const liveVitals = this.patientState.vitals();
        if (liveVitals.hr) {
          const hrVal = parseInt(liveVitals.hr, 10);
          const bpParts = (liveVitals.bp || '120/80').split('/');
          const sbpVal = bpParts.length > 0 ? parseInt(bpParts[0], 10) : 120;

          if (!isNaN(hrVal) && !isNaN(sbpVal)) {
            const rpp = hrVal * sbpVal;

            if (this.isActive()) {
              if (rpp > 12000 || hrVal > 85) {
                this.targetWave.set('theta');
                this.targetBreathingRate.set(5.5);
                this.colorTemp.set('violet');
              } else if (hrVal < 55 || sbpVal < 100) {
                this.targetWave.set('alpha');
                this.targetBreathingRate.set(6.5);
                this.colorTemp.set('emerald');
              } else {
                this.targetWave.set('alpha');
                this.targetBreathingRate.set(6.0);
                this.colorTemp.set('indigo');
              }
            }
          }
        }
      }, { allowSignalWrites: true });

      // Synchronize active AVS session state with PatientStateService
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
    // If closed-loop qEEG is active, reflect real-time adaptive iAPF / SMR frequency
    if (this.activeInnovationTab() === 'qeeg') {
      return this.qeeg.targetFrequencyHz();
    }
    // If sleep insomnia engine is active, reflect phase-dependent curve
    if (this.activeInnovationTab() === 'sleep') {
      return this.sleep.dynamicTargetHz();
    }

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
    return this.activeCarrierHz();
  });

  pulseIntervalMs = computed(() => {
    return Math.round((60 / this.targetBreathingRate()) * 1000);
  });

  setInnovationTab(tab: AvsInnovationTab): void {
    this.avsUi.playTransition();
    this.activeInnovationTab.set(tab);
  }

  openExportModal(): void {
    this.avsUi.playHover();
    this.isExportModalOpen.set(true);
  }

  closeExportModal(): void {
    this.isExportModalOpen.set(false);
  }

  // --- Event Handlers for UI Sliders & Controls ---
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

  selectCarrierTone(hz: number) {
    this.activeCarrierHz.set(hz);
    this.globalAvs.setSolfeggioTone(hz);
    if (this.isActive()) {
      this.restartOscillators();
      if (this.voiceEnabled()) {
        this.speakGuidance(`Acoustic carrier harmonic locked to ${hz} Hertz.`);
      }
    }
  }

  selectWaveProfile(wave: BrainwaveFrequency) {
    this.targetWave.set(wave);
    this.customFrequency.set(null);
    if (this.isActive()) {
      this.restartOscillators();
      if (this.voiceEnabled()) {
        this.speakGuidance(`Brainwave target updated to ${wave.toUpperCase()} frequency profile.`);
      }
    }
  }

  setVolume(vol: number): void {
    this.volume.set(vol);
    if (this.mainGain && this.audioCtx) {
      const targetGain = (vol / 100) * 0.35;
      this.mainGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
  }

  togglePinkNoise(): void {
    this.pinkNoiseEnabled.update(p => !p);
    if (this.noiseGain && this.audioCtx) {
      const targetGain = this.pinkNoiseEnabled() ? 0.025 : 0.0001;
      this.noiseGain.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
  }

  setDurationMinutes(mins: number): void {
    this.sessionDurationMinutes.set(mins);
    if (this.isActive()) {
      this.startCountdownTimer();
    }
  }

  toggleCprMetronome(): void {
    if (this.globalAvs.isCprMetronomeActive()) {
      this.globalAvs.stopCprMetronome();
    } else {
      this.globalAvs.startCprMetronome();
    }
  }

  async generateCoRegProtocol(): Promise<void> {
    await this.contextAvs.generateContextualProtocol();
  }

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

    const stateToWave: Record<AthleticState, BrainwaveFrequency> = {
      'priming': 'beta',
      'flow': 'alpha',
      'recovery': 'theta',
      'phase-shift': 'delta'
    };

    this.targetWave.set(stateToWave[this.athleticState()]);
    if (this.athleticState() === 'priming') this.targetBreathingRate.set(12.0);
    else if (this.athleticState() === 'recovery') this.targetBreathingRate.set(5.5);
    else this.targetBreathingRate.set(6.0);

    if (!this.isActive()) this.startTherapy();
    else this.restartOscillators();
  }

  generateAdjuncts(): void {
    this.lifestyleAdj.generate();
  }

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
    this.vibrationEnabled.update(v => !v);
    if (this.vibrationEnabled() && this.isActive()) {
      this.startVibrationLoop();
    } else {
      this.stopVibrationLoop();
    }
  }

  async startTherapy() {
    this.isActive.set(true);
    if (this.isBrowser) {
      await this.initWebAudio();
      this.startVoiceGuidanceLoop();
      this.startCountdownTimer();
      if (this.vibrationEnabled()) {
        this.startVibrationLoop();
      }
    }
  }

  stopTherapy() {
    this.isActive.set(false);
    this.stopWebAudio();
    this.stopVoiceGuidanceLoop();
    this.stopVibrationLoop();
    this.stopCountdownTimer();
    if (this.globalAvs.isCprMetronomeActive()) {
      this.globalAvs.stopCprMetronome();
    }
  }

  private startCountdownTimer(): void {
    this.stopCountdownTimer();
    const mins = this.sessionDurationMinutes();
    if (mins <= 0) {
      this.sessionSecondsRemaining.set(null);
      return;
    }
    this.sessionSecondsRemaining.set(mins * 60);

    this.countdownTimer = setInterval(() => {
      const cur = this.sessionSecondsRemaining();
      if (cur !== null && cur > 0) {
        this.sessionSecondsRemaining.set(cur - 1);
        if (cur - 1 === 0) {
          this.avsUi.playFinalizeChord();
          this.speakGuidance("AVS session target duration reached. Gentle return to wakeful baseline.");
          this.stopTherapy();
        }
      }
    }, 1000);
  }

  private stopCountdownTimer(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    this.sessionSecondsRemaining.set(null);
  }

  private async initWebAudio() {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const initialGain = (this.volume() / 100) * 0.35;
      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(initialGain, this.audioCtx.currentTime);
      this.mainGain.connect(this.audioCtx.destination);

      // Initialize Pink Noise floor generator
      this.initPinkNoise();

      // Initialize Spatial Ambisonics Sub-system
      this.spatial.initAudioGraph(this.audioCtx, this.mainGain);

      this.restartOscillators();
    } catch (e) {
      console.debug('Web Audio API unavailable in current execution context', e);
    }
  }

  private initPinkNoise(): void {
    if (!this.audioCtx || !this.mainGain) return;
    try {
      const bufferSize = this.audioCtx.sampleRate * 8; // 8s loop
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.audioCtx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.noiseGain = this.audioCtx.createGain();
      this.noiseGain.gain.setValueAtTime(this.pinkNoiseEnabled() ? 0.025 : 0.0001, this.audioCtx.currentTime);

      this.noiseNode.connect(this.noiseGain);
      this.noiseGain.connect(this.mainGain);
      this.noiseNode.start();
    } catch {}
  }

  private restartOscillators() {
    if (!this.audioCtx || !this.mainGain) return;

    if (this.oscLeft) {
      try { this.oscLeft.stop(); this.oscLeft.disconnect(); } catch (e) {}
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); this.oscRight.disconnect(); } catch (e) {}
    }

    const baseFreq = this.currentBaseFrequency();
    const diffFreq = this.targetBrainwaveFrequencyHz();

    // Channel splitters and mergers for pristine stereo binaural separation
    const merger = this.audioCtx.createChannelMerger(2);

    this.oscLeft = this.audioCtx.createOscillator();
    this.oscLeft.type = 'sine';
    this.oscLeft.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);

    this.oscRight = this.audioCtx.createOscillator();
    this.oscRight.type = 'sine';
    this.oscRight.frequency.setValueAtTime(baseFreq + diffFreq, this.audioCtx.currentTime);

    this.oscLeft.connect(merger, 0, 0);
    this.oscRight.connect(merger, 0, 1);

    merger.connect(this.mainGain);

    this.oscLeft.start();
    this.oscRight.start();
  }

  private stopWebAudio() {
    if (this.oscLeft) {
      try { this.oscLeft.stop(); this.oscLeft.disconnect(); } catch (e) {}
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); this.oscRight.disconnect(); } catch (e) {}
      this.oscRight = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch (e) {}
      this.noiseNode = null;
    }
    if (this.noiseGain) {
      try { this.noiseGain.disconnect(); } catch (e) {}
      this.noiseGain = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch (e) {}
      this.audioCtx = null;
    }
    this.spatial.stopAmbisonics();
  }

  private startVoiceGuidanceLoop() {
    if (!this.isBrowser || !('speechSynthesis' in window)) return;
    this.stopVoiceGuidanceLoop();

    const phrases = [
      "Inhale deeply and expand the diaphragm...",
      "Slowly exhale and release all sympathetic tension...",
      "Allow your brainwaves to synchronize with the acoustic pulse...",
      "Relax your shoulders, feeling the heart rate gently settle...",
      "Deep, rhythmic breathing to engage the vagal nerve tone..."
    ];

    let phraseIndex = 0;
    this.guidanceTimer = setInterval(() => {
      if (this.voiceEnabled() && this.isActive()) {
        const text = phrases[phraseIndex % phrases.length];
        this.speakGuidance(text);
        phraseIndex++;
      }
    }, 18000);
  }

  private stopVoiceGuidanceLoop() {
    if (this.guidanceTimer) {
      clearInterval(this.guidanceTimer);
      this.guidanceTimer = null;
    }
    if (this.isBrowser && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
  }

  private startVibrationLoop() {
    if (!this.isBrowser || !this.hasVibrator) return;
    this.stopVibrationLoop();

    const interval = this.pulseIntervalMs();
    this.vibrationTimer = setInterval(() => {
      if (this.vibrationEnabled() && this.isActive()) {
        try {
          navigator.vibrate([15, 30, 25]); // Double heart pulse pattern
        } catch (e) {}
      }
    }, interval);
  }

  private stopVibrationLoop() {
    if (this.vibrationTimer) {
      clearInterval(this.vibrationTimer);
      this.vibrationTimer = null;
    }
    if (this.isBrowser && this.hasVibrator) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }

  private speakGuidance(text: string) {
    if (!this.isBrowser || !('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      utterance.volume = 0.6;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  ngOnDestroy() {
    this.stopTherapy();
  }
}
