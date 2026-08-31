/**
 * @pocketgull/open-sanctuary
 * Type definitions for bio-entrainment, Solfeggio resonance, Persian modal acoustics,
 * and Chladni cymatics visualization.
 */

export type BrainwaveBand = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'schumann';

export type DastgahScaleName = 'Shur' | 'Homayoun' | 'Segah' | 'Chahargah';

export type AvsWaveform = 'sine' | 'triangle' | 'warm_harmonic';

export type NoiseProfile = 'off' | 'pink' | 'brown' | 'rain';

export type AvsSaturationProfile = 'tube_warmth' | 'tape_velvet' | 'pristine_linear';

export type CymaticVisualizerMode = 
  | 'chladni_cymatics' 
  | 'lissajous_phase' 
  | 'sacred_mandala' 
  | 'fft_spectrogram' 
  | 'parasympathetic_ring';

export interface ISolfeggioTone {
  id: string;
  name: string;
  carrierFreqHz: number;
  clinicalContext: string;
  chakraAffinity: string;
  harmonicDescription: string;
}

export interface IBrainwavePreset {
  id: string;
  name: string;
  waveType: BrainwaveBand;
  beatFreqHz: number;
  recommendedCarrierHz: number;
  targetState: string;
  clinicalRationale: string;
}

export interface IDastgahScale {
  name: DastgahScaleName;
  persianName: string;
  description: string;
  emotionalAura: string;
  frequencies: number[]; // Frequencies tuned to 432Hz Pythagorean standard
}

export interface IAvsSessionConfig {
  carrierFreqHz: number;
  beatFreqHz: number;
  binauralEnabled: boolean;
  isochronicEnabled: boolean;
  isochronicPulseRateHz: number;
  waveform: AvsWaveform;
  noiseProfile: NoiseProfile;
  noiseVolume: number; // 0.0 to 1.0
  parasympatheticPacingEnabled: boolean; // 0.1Hz Rachel Nabors bio-rhythmic modulation
  volume: number; // 0.0 to 1.0
  saturationProfile: AvsSaturationProfile;
}

export interface ICymaticParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  alpha: number;
  size: number;
}

export interface ICymaticOptions {
  mode: CymaticVisualizerMode;
  particleCount?: number;
  damping?: number;
  plateNodalN?: number;
  plateNodalM?: number;
  colorScheme?: 'teal_emerald' | 'indigo_violet' | 'amber_gold' | 'cyan_pristine';
  bloomEffect?: boolean;
  stereoscopicVrEnabled?: boolean; // Google Cardboard / Side-by-Side Dual-Eye Viewport
  interpupillaryDistancePx?: number; // IPD parallax offset in pixels
}

export interface IAutonomicBioState {
  label: string;
  tone: 'parasympathetic_dominant' | 'balanced_equilibrium' | 'sympathetic_hyperarousal';
  hrvCoherenceEstimatePct: number;
  pacingCycleSeconds: number;
  colorHex: string;
}

export interface IPacingBreathingState {
  phase: 'inhale' | 'inhale_hold' | 'exhale' | 'exhale_hold';
  progressPct: number; // 0 to 100 within current breath
  currentSeconds: number;
  totalCycleSeconds: number; // default 10s (0.1 Hz)
  instructions: string;
}

export type SleepStageEstimate = 'awake' | 'light_rem' | 'deep_delta';

export interface ISleepTrackingReading {
  timestamp: number;
  respirationRateBpm: number;
  movementIntensity: number; // 0.0 (still) to 1.0 (restless)
  isSnoringDetected: boolean;
  estimatedStage: SleepStageEstimate;
  ambientNoiseDb: number;
}

export interface ISmartAlarmConfig {
  enabled: boolean;
  targetWakeTimestamp: number; // Date.now() timestamp
  windowMinutes: number; // e.g. 20 min before target
  carrierFreqHz: number; // 432Hz or Solfeggio for gentle wake
  volumeRampSeconds: number; // e.g. 60 seconds smooth sunrise fade-in
}

export interface ISleepSessionConfig {
  autoFadeoutOnSleep: boolean;
  autoFadeoutDurationMin: number;
  antiSnoreNudgeEnabled: boolean;
  adaptivePacingEnabled: boolean;
  smartAlarm: ISmartAlarmConfig;
}

export interface ISleepGateRecommendation {
  idealBedtimeStr: string;
  idealWakeTimeStr: string;
  circadianPhaseLabel: string;
  melatoninOnsetWindow: string;
  sleepDebtMinutes: number;
  suggestedPresetId: string;
}

export interface IRSVPToken {
  raw: string;
  prefix: string;       // Bionic bolded letters before the ORP
  orpChar: string;      // Optimal Recognition Point character (central foveal anchor)
  suffix: string;       // Remaining letters of the word
  hasCommaOrPause: boolean;
  hasSentenceEnd: boolean;
  hasParagraphBreak: boolean;
  wordIndex: number;
  delayMs: number;      // Punctuation-weighted display duration
}

export type ReaderEntrainmentMode = 'gamma40' | 'alpha10' | 'solfeggio528' | 'silent';

export interface IBionicReaderConfig {
  wpm: number;
  entrainmentMode: ReaderEntrainmentMode;
  isBionicBoldEnabled: boolean;
  isPunctuationPauseWeighted: boolean;
}

export interface IBibliotherapyText {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverEmoji: string;
  wordCount: number;
  text: string;
}
