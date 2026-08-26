export type BrainwaveFrequency = 'delta' | 'theta' | 'alpha' | 'beta' | 'schumann' | 'gamma';

export interface WaveProfile {
  id: BrainwaveFrequency;
  freq: number;
  desc: string;
}

export const WAVE_PROFILES: WaveProfile[] = [
  { id: 'delta', freq: 2.5, desc: 'Delta Wave (2.5Hz): Deep restorative sleep, somatic cell healing, cortisol mitigation.' },
  { id: 'theta', freq: 6.0, desc: 'Theta Wave (6.0Hz): Meditation, neural plasticity, profound autonomic nervous system reset.' },
  { id: 'schumann', freq: 7.83, desc: 'Schumann Resonance (7.83Hz): Earth geomagnetic ionospheric synchronization.' },
  { id: 'alpha', freq: 10.0, desc: 'Alpha Wave (10.0Hz): Calm focus, anxiety release, cognitive integration.' },
  { id: 'beta', freq: 18.0, desc: 'Beta Wave (18.0Hz): Cognitive processing, focused problem solving, baseline alertness.' },
  { id: 'gamma', freq: 40.0, desc: 'Gamma Wave (40.0Hz): Microglial amyloid clearance, high-level gamma synchrony.' }
];

export interface ISolfeggioTone {
  hz: number;
  name: string;
  chakra: string;
  colorHex: string;
  description: string;
}

export const SOLFEGGIO_CATALOG: ISolfeggioTone[] = [
  { hz: 174, name: '174 Hz', chakra: 'Physical Foundation', colorHex: '#71717a', description: 'Pain mitigation, somatic stabilization & grounding' },
  { hz: 285, name: '285 Hz', chakra: 'Morphogenic Field', colorHex: '#a1a1aa', description: 'Tissue regeneration & cellular blueprint restructuring' },
  { hz: 396, name: '396 Hz', chakra: 'Root Chakra (Muladhara)', colorHex: '#ef4444', description: 'Liberating guilt, trauma alleviation & fear reduction' },
  { hz: 417, name: '417 Hz', chakra: 'Sacral Chakra (Svadhisthana)', colorHex: '#f97316', description: 'Facilitating change & breaking negative behavioral loops' },
  { hz: 432, name: '432 Hz', chakra: 'Universal Pythagorean Harmonic', colorHex: '#10b981', description: 'Natural mathematical resonance & parasympathetic tone' },
  { hz: 528, name: '528 Hz', chakra: 'Solar Plexus / Heart (Anahata)', colorHex: '#eab308', description: 'Cellular repair, transformation & DNA integrity' },
  { hz: 639, name: '639 Hz', chakra: 'Heart (Anahata Connection)', colorHex: '#22c55e', description: 'Interpersonal resonance, empathy & emotional balance' },
  { hz: 741, name: '741 Hz', chakra: 'Throat Chakra (Vishuddha)', colorHex: '#06b6d4', description: 'Intuition, creative expression & metabolic cellular detox' },
  { hz: 852, name: '852 Hz', chakra: 'Third Eye Chakra (Ajna)', colorHex: '#6366f1', description: 'Spiritual clarity, deep insight & neural awakening' },
  { hz: 963, name: '963 Hz', chakra: 'Crown Chakra (Sahasrara)', colorHex: '#a855f7', description: 'Higher consciousness & pineal gland activation' }
];

export type ColorTemperature = 'indigo' | 'emerald' | 'violet' | 'rose-earth';
export type ViewMode = 'clinician' | 'patient';
export type ProtocolMode = 'clinical' | 'athletic' | 'qeeg-closed-loop' | 'sleep-insomnia' | 'contactless-rppg' | 'spatial-geometry' | 'dyadic-sync';
