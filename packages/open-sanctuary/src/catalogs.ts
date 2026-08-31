/**
 * @pocketgull/open-sanctuary
 * Scientific & Acoustic Catalogs for Solfeggio, Brainwaves, and Persian Dastgah Modes.
 */

import {
  ISolfeggioTone,
  IBrainwavePreset,
  IDastgahScale,
  DastgahScaleName,
  IAvsSessionConfig,
  IBibliotherapyText
} from './types';

/**
 * 10 Grounded Solfeggio & Harmonic Frequencies
 */
export const SOLFEGGIO_CATALOG: readonly ISolfeggioTone[] = [
  {
    id: 'solf-174',
    name: '174 Hz — Foundation & Somatosensory Relief',
    carrierFreqHz: 174,
    clinicalContext: 'Natural anesthetic grounding; reduces peripheral musculoskeletal tension and downregulates nociceptive signaling.',
    chakraAffinity: 'Sub-Root / Grounding',
    harmonicDescription: 'Deep, resonant acoustic bedrock encouraging physical cellular relaxation.'
  },
  {
    id: 'solf-285',
    name: '285 Hz — Cellular Matrix Restoration',
    carrierFreqHz: 285,
    clinicalContext: 'Cellular quantum morphogenesis; promotes restorative biological tissue recovery.',
    chakraAffinity: 'Root / Etheric Field',
    harmonicDescription: 'Warm harmonic foundation aiding cellular homeostasis.'
  },
  {
    id: 'solf-396',
    name: '396 Hz — Liberation from Fear & Allostatic Burden',
    carrierFreqHz: 396,
    clinicalContext: 'Sympathetic downregulation; cleanses allostatic stress loops and autonomic fight-or-flight tension.',
    chakraAffinity: 'Muladhara (Root Chakra)',
    harmonicDescription: 'Low-frequency visceral anchor for stabilizing emotional security.'
  },
  {
    id: 'solf-417',
    name: '417 Hz — Facilitating Neuroplastic Change',
    carrierFreqHz: 417,
    clinicalContext: 'Dislodging stagnant behavioral conditioning and neuroplastic habituation.',
    chakraAffinity: 'Svadhisthana (Sacral Chakra)',
    harmonicDescription: 'Fluid, warm middle register encouraging adaptive cognitive shifts.'
  },
  {
    id: 'pyth-432',
    name: '432 Hz — Pythagorean Natural Harmonic Reference',
    carrierFreqHz: 432,
    clinicalContext: 'Verdi scientific tuning; synchronizes with natural planetary acoustics and heart rate variability (HRV) coherence.',
    chakraAffinity: 'Biofield Coherence',
    harmonicDescription: 'Mathematically harmonious acoustic proportion eliminating auditory fatigue.'
  },
  {
    id: 'solf-528',
    name: '528 Hz — Transformation & Mitochondrial Cellular Vitality',
    carrierFreqHz: 528,
    clinicalContext: 'Mitochondrial biophotonic resonance; stimulates cytochrome c oxidase efficiency and energetic homeostasis.',
    chakraAffinity: 'Manipura (Solar Plexus) & Bio-Resonance',
    harmonicDescription: 'The Golden Frequency of organic nature and cellular vitality.'
  },
  {
    id: 'solf-639',
    name: '639 Hz — Interpersonal & Heart Center Coherence',
    carrierFreqHz: 639,
    clinicalContext: 'Enhances social engagement system via myelinated vagus nerve, supporting empathy and emotional calm.',
    chakraAffinity: 'Anahata (Heart Chakra)',
    harmonicDescription: 'Enfolding melodic frequency supporting relational harmony.'
  },
  {
    id: 'solf-741',
    name: '741 Hz — Cellular Detoxification & Intuitive Clarity',
    carrierFreqHz: 741,
    clinicalContext: 'Stimulates intuitive problem-solving and cellular autophagic clearance of metabolic residue.',
    chakraAffinity: 'Vishuddha (Throat Chakra)',
    harmonicDescription: 'Piercing, crystalline timbre promoting cognitive clarity.'
  },
  {
    id: 'solf-852',
    name: '852 Hz — Awakening Intuition & Neural Order',
    carrierFreqHz: 852,
    clinicalContext: 'Returns neural firing patterns to pristine baseline; aids meditative focus and visual spatial awareness.',
    chakraAffinity: 'Ajna (Third Eye Chakra)',
    harmonicDescription: 'High-register luminous tone stimulating cortical synchrony.'
  },
  {
    id: 'solf-963',
    name: '963 Hz — Pineal Harmony & Pure Consciousness',
    carrierFreqHz: 963,
    clinicalContext: 'Pineal gland activation, circadian melatonin regulation, and transcendent cognitive unity.',
    chakraAffinity: 'Sahasrara (Crown Chakra)',
    harmonicDescription: 'Translucent high-frequency harmonic envelope.'
  }
];

/**
 * 6 Brainwave Frequency Presets for Neural Entrainment
 */
export const BRAINWAVE_PRESETS: readonly IBrainwavePreset[] = [
  {
    id: 'deep-delta-sleep',
    name: 'Deep Delta Rest & Somatotropic Recovery',
    waveType: 'delta',
    beatFreqHz: 1.5,
    recommendedCarrierHz: 174,
    targetState: 'Stage 3/4 Slow-Wave Deep Sleep',
    clinicalRationale: 'Triggers somatotropin (human growth hormone) secretion and glymphatic brain metabolic clearance.'
  },
  {
    id: 'theta-meditation',
    name: 'Theta Hypnagogic & Subconscious Flow',
    waveType: 'theta',
    beatFreqHz: 5.5,
    recommendedCarrierHz: 528,
    targetState: 'Deep Meditative Absorption & Neuroplastic Visualization',
    clinicalRationale: 'Downregulates default mode network (DMN) hyperactivity to relieve anxiety and rumination.'
  },
  {
    id: 'schumann-resonance',
    name: 'Schumann Planetary Biospheric Resonance',
    waveType: 'schumann',
    beatFreqHz: 7.83,
    recommendedCarrierHz: 432,
    targetState: 'Bio-Electromagnetic Coherence',
    clinicalRationale: 'Fundamental electromagnetic resonance of the Earth ionospheric cavity (7.83 Hz) restoring circadian grounding.'
  },
  {
    id: 'alpha-relaxed-focus',
    name: 'Alpha Calm Focus & Attentive Clarity',
    waveType: 'alpha',
    beatFreqHz: 10.0,
    recommendedCarrierHz: 432,
    targetState: 'Relaxed Alertness & Reduced Cortisol',
    clinicalRationale: 'Promotes thalamocortical alpha synchrony, reducing situational performance stress while maintaining vigilance.'
  },
  {
    id: 'beta-high-cognition',
    name: 'Beta Executive Processing & Active Synthesis',
    waveType: 'beta',
    beatFreqHz: 18.0,
    recommendedCarrierHz: 528,
    targetState: 'Sharp Executive Problem-Solving & High Alertness',
    clinicalRationale: 'Stimulates left-hemispheric prefrontal cortex dopamine signaling and working memory capacity.'
  },
  {
    id: 'gamma-transcendence',
    name: 'Gamma 40Hz Microglial & Peak Synchrony',
    waveType: 'gamma',
    beatFreqHz: 40.0,
    recommendedCarrierHz: 432,
    targetState: 'Peak Cognitive Synthesis & Microglial Activation',
    clinicalRationale: '40Hz sensory entrainment clears hyperphosphorylated tau proteins and fosters whole-brain cross-modal binding.'
  }
];

/**
 * 4 Persian Dastgah Modal Scales Tuned to 432Hz Harmonic Base
 */
export const PERSIAN_DASTGAH_SCALES: Record<DastgahScaleName, IDastgahScale> = {
  Shur: {
    name: 'Shur',
    persianName: 'شور (Dastgāh-e Šūr)',
    description: 'The mother of all Persian modes; deeply restorative, meditative, and grounding.',
    emotionalAura: 'Parasympathetic Tranquility & Inner Stillness',
    frequencies: [108.0, 121.5, 135.0, 144.0, 162.0, 180.0, 192.0, 216.0, 243.0, 270.0, 324.0, 432.0]
  },
  Homayoun: {
    name: 'Homayoun',
    persianName: 'همایون (Dastgāh-e Homāyoun)',
    description: 'Noble, contemplative, and mystical; enhances creative focus and cognitive clarity.',
    emotionalAura: 'Regal Majesty & Introspective Flow',
    frequencies: [108.0, 114.75, 136.68, 144.0, 162.0, 172.12, 192.0, 216.0, 229.5, 273.37, 324.0, 432.0]
  },
  Segah: {
    name: 'Segah',
    persianName: 'سه‌گاه (Dastgāh-e Segāh)',
    description: 'Bright, uplifting, and rejuvenating; stimulates cellular vitality and optimism.',
    emotionalAura: 'Cellular Vitality & Spiritual Dawn',
    frequencies: [108.0, 126.56, 135.0, 151.87, 162.0, 189.84, 216.0, 253.12, 270.0, 303.75, 324.0, 432.0]
  },
  Chahargah: {
    name: 'Chahargah',
    persianName: 'چهارگاه (Dastgāh-e Chahārgāh)',
    description: 'Dynamic, courageous, and energizing; perfect for morning activation and motor entrainment.',
    emotionalAura: 'Heroic Energy & Neuromotor Awakening',
    frequencies: [108.0, 114.75, 136.68, 144.0, 162.0, 172.12, 205.03, 216.0, 229.5, 273.37, 288.0, 432.0]
  }
};

/**
 * Default Sanctuary Session Configuration
 */
export const DEFAULT_AVS_CONFIG: IAvsSessionConfig = {
  carrierFreqHz: 528,
  beatFreqHz: 7.83, // Schumann resonance default
  binauralEnabled: true,
  isochronicEnabled: false,
  isochronicPulseRateHz: 7.83,
  waveform: 'sine',
  noiseProfile: 'pink',
  noiseVolume: 0.12,
  parasympatheticPacingEnabled: true,
  volume: 0.7,
  saturationProfile: 'tape_velvet'
};

export const BIBLIOTHERAPY_CATALOG: readonly IBibliotherapyText[] = [
  {
    id: 'meditations',
    title: 'Meditations (Book IV)',
    author: 'Marcus Aurelius',
    genre: 'Stoic Cognitive Self-Regulation',
    coverEmoji: '🏛️',
    wordCount: 320,
    text: `Men seek retreats for themselves, houses in the country, sea-shores, and mountains; and thou too art wont to desire such things very much. But this is altogether a mark of the most common sort of men, for it is in thy power whenever thou shalt choose to retire into thyself. For nowhere either with more quiet or more freedom from trouble does a man retire than into his own soul, particularly when he has within him such thoughts that by looking into them he is immediately in perfect tranquility; and I affirm that tranquility is nothing else than the good ordering of the mind. Constantly then give to thyself this retreat, and renew thyself; and let thy rules be short and fundamental, which, as soon as they occur, will purge away all trouble.`
  },
  {
    id: 'nightingale',
    title: 'Notes on Nursing: What It Is, and What It Is Not',
    author: 'Florence Nightingale',
    genre: 'Biophilic Healing & Ventilation',
    coverEmoji: '🌿',
    wordCount: 290,
    text: `The very first canon of nursing, the first and the last thing upon which a nurse's attention must be fixed, the first essential to the patient, without which all the rest you can do for him is as nothing, with which I had almost said you may leave all the rest alone, is this: TO KEEP THE AIR HE BREATHES AS PURE AS THE EXTERNAL AIR, WITHOUT CHILLING HIM. Yet what is so little attended to? Even where the most lavish care is bestowed on the patient, he is continually made to breathe his own breath again and again. Do you ever go into the bedrooms of any persons of any class, whether they contain one, two, or twenty people, and find the air pure?`
  },
  {
    id: 'time_machine',
    title: 'The Time Machine (Chapter I)',
    author: 'H. G. Wells',
    genre: 'Dimensional Chrono-Philosophy',
    coverEmoji: '⏳',
    wordCount: 280,
    text: `The Time Traveller was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. "You must follow me carefully. I shall have to controvert one or two ideas that are universally accepted. There are really four dimensions, three which we call the three planes of Space, and a fourth, Time. There is, however, a tendency to draw an unreal distinction between the former three dimensions and the latter, because our consciousness moves intermittently along the latter from the beginning to the end of our lives."`
  }
];

export function getSolfeggioToneById(id: string): ISolfeggioTone | undefined {
  return SOLFEGGIO_CATALOG.find(t => t.id === id);
}

export function getBrainwavePresetById(id: string): IBrainwavePreset | undefined {
  return BRAINWAVE_PRESETS.find(p => p.id === id);
}

export function getBibliotherapyTextById(id: string): IBibliotherapyText | undefined {
  return BIBLIOTHERAPY_CATALOG.find(b => b.id === id);
}
