export type BrainwaveFrequency = 'delta' | 'theta' | 'alpha' | 'beta';

export interface WaveProfile {
  id: BrainwaveFrequency;
  freq: number;
  desc: string;
}

export const WAVE_PROFILES: WaveProfile[] = [
  { id: 'delta', freq: 2.5, desc: 'Delta Wave (2.5Hz): Deep restorative sleep, somatic cell healing, cortisol mitigation.' },
  { id: 'theta', freq: 6.0, desc: 'Theta Wave (6.0Hz): Meditation, neural plasticity, profound autonomic nervous system reset.' },
  { id: 'alpha', freq: 10.0, desc: 'Alpha Wave (10.0Hz): Calm focus, anxiety release, cognitive integration.' },
  { id: 'beta', freq: 18.0, desc: 'Beta Wave (18.0Hz): Cognitive processing, focused problem solving, baseline alertness.' }
];

export type ColorTemperature = 'indigo' | 'emerald' | 'violet' | 'rose-earth';
export type ViewMode = 'clinician' | 'patient';
export type ProtocolMode = 'clinical' | 'athletic';
