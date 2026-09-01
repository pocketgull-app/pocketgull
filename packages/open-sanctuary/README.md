# 🌌 Open Sanctuary (`@pocketgull/open-sanctuary`)

> **Zero-dependency, open-source bio-entrainment, Solfeggio acoustic resonance, 432Hz Persian Dastgah modal soundscapes, and Chladni cymatics visualizer engine.**  
> *Restoring deep parasympathetic calm, nervous system regulation, and mental clarity to humanity.*

---

## 🏛️ Philosophy & Mission

Modern life and digital interfaces are fraught with cognitive overload, fragmented attention, and chronic "screen apnea." Most sound-therapy and meditation apps gate basic nervous system regulation behind monthly subscriptions, intrusive analytics trackers, and locked-down ecosystems.

**Open Sanctuary** is an uncompromising public-benefit tool:
- **Zero Dependencies**: Pure HTML5 Canvas 2D and native Web Audio API.
- **Zero Tracking / 100% Client-Side**: No cloud egress, no telemetry, no cookies, no paywalls.
- **Scientifically Grounded**: Incorporates empirical acoustics, Solfeggio frequencies, 432Hz Pythagorean natural harmonic tuning, and **Rachel Nabors 0.1 Hz bio-rhythmic parasympathetic breathing pacing**.
- **Open Hardware & Software Dual-License**: Dual-licensed under **Apache-2.0** and **CERN Open Hardware License (CERN OHL-S v2)**.

---

## ⚡ Quickstart

### 1. Zero-Install Vanilla Browser Demo
Simply open [`demo/index.html`](file:///c:/Users/philg/Pocketgull/pocketgull/packages/open-sanctuary/demo/index.html) in any browser (Chromebook, iPhone, Android, or Desktop) or serve it statically.

### 2. Install as an NPM Package
```bash
npm install @pocketgull/open-sanctuary
```

```typescript
import { AvsAudioEngine, CymaticsRenderer, SOLFEGGIO_CATALOG, BRAINWAVE_PRESETS } from '@pocketgull/open-sanctuary';

// Initialize the pure Web Audio synthesizer
const engine = new AvsAudioEngine({
  carrierFreqHz: 528, // 528 Hz Solfeggio tone
  beatFreqHz: 7.83,   // Schumann resonance
  binauralEnabled: true,
  parasympatheticPacingEnabled: true, // 0.1 Hz breathing LFO
  noiseProfile: 'pink',
  volume: 0.7
});

// Start audio with smooth ramping
await engine.start();

// Connect to an HTML5 Canvas for real-time Chladni plate physics
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const renderer = new CymaticsRenderer(canvas, { mode: 'chladni_cymatics' });
renderer.connectAudioEngine(engine);
renderer.startAnimation();
```

---

## 🔬 Core Capabilities

### 1. 10 Grounded Solfeggio & Harmonic Frequencies
| Frequency | Harmonic Context | Target Neurological Effect |
| :--- | :--- | :--- |
| **174 Hz** | Foundation & Somatosensory Relief | Nociceptive downregulation & deep physical tension release |
| **285 Hz** | Cellular Matrix Restoration | Cellular tissue recovery & autonomic reset |
| **396 Hz** | Liberation from Fear & Allostasis | Downregulates sympathetic fight-or-flight loops |
| **417 Hz** | Neuroplastic Facilitation | Dissolves stagnant habituation loops |
| **432 Hz** | Pythagorean Natural Harmonic Reference | Verdi scientific tuning synchronized with Heart Rate Variability (HRV) |
| **528 Hz** | Transformation & Cellular Vitality | Mitochondrial resonance & biophotonic balance |
| **639 Hz** | Interpersonal & Heart Coherence | Stimulates myelinated vagus nerve for emotional security |
| **741 Hz** | Cellular Detox & Intuitive Clarity | Promotes cognitive clarity and autophagic clearance |
| **852 Hz** | Awakening & Neural Order | Returns cortical firing to coherent baseline |
| **963 Hz** | Pineal Harmony & Pure Consciousness | Circadian melatonin regulation & meditative absorption |

### 2. 6 Brainwave Frequency Bands
- **Delta (1.5 Hz)**: Stage 3/4 slow-wave sleep and somatotropin release.
- **Theta (5.5 Hz)**: Hypnagogic flow, neuroplastic visualization, and DMN downregulation.
- **Schumann Resonance (7.83 Hz)**: Planetary ionospheric cavity baseline coherence.
- **Alpha (10.0 Hz)**: Relaxed alertness with reduced situational cortisol.
- **Beta (18.0 Hz)**: Left-prefrontal executive cognition and working memory.
- **Gamma (40.0 Hz)**: Peak 40Hz microglial activation and whole-brain binding.

### 3. 432Hz Persian Dastgah Modal Soundscapes
- **Dastgāh-e Šūr (شور)**: Deeply restorative, grounding tranquility.
- **Dastgāh-e Homāyoun (همایون)**: Noble, contemplative, introspective flow.
- **Dastgāh-e Segāh (سه‌گاه)**: Bright, rejuvenating cellular vitality.
- **Dastgāh-e Chahārgāh (چهارگاه)**: Dynamic, neuromotor courage and activation.

### 4. Cymatics & Visual Harmonics Engine
- **Chladni Plate Nodal Simulation**: Particle dynamics simulating nodal lines on vibrating plates governed by 2D wave equations.
- **Lissajous Phase Orbits**: Real-time phase interference visualizing the exact stereo binaural relationship.
- **Sacred Mandala Geometry**: Golden ratio ($\phi \approx 1.618$) harmonic petals.
- **0.1 Hz Rachel Nabors Parasympathetic Breathing Ring**: 10-second visual bio-rhythmic guide (4s expansion / 6s contraction) to ease screen apnea.
- **🥽 Google Cardboard VR (Side-by-Side Stereoscopic Viewport)**: Zero-library 3D immersive entrainment with parallax offset for phone headsets.

### 5. 🌙 Sleep Chronobiology & Contactless Respiration Suite (`SleepEngine`)
- **🫁 Contactless Respiration & Movement Sonar**: Detects respiration rate and restlessness with zero wearables.
- **🌙 Hypnagogic Fall-Asleep Detection**: Automatically triggers a gentle 10-minute exponential volume fade-out upon sleep onset.
- **⏰ Smart Circadian 432Hz Sunrise Alarm**: Gently wakes you during light/REM sleep to eliminate morning grogginess.
- **🛌 Anti-Snore Positional Micro-Nudge**: Subtle 40ms haptic tap cues positional rotation.
- **☀️ Melatonin "Sleep Gate" Calculator**: Computes your personal biological sleep window.

### 6. 📖 Neuro-Bionic Speed Reader & Bibliotherapy (`BionicReaderEngine`)
- **Optimal Recognition Point (ORP) Fixation**: Central foveal anchor eliminating saccadic ocular fatigue.
- **40% Fixation Bolding**: Initial letters bolded to streamline rapid semantic processing ($150\text{--}900\text{ WPM}$).
- **Dual-Modality Soundscape Sync**: Automatically engages 40 Hz Gamma Focus or 528 Hz Solfeggio Calm when reading starts.
- **Curated Open Bibliotherapy**: Pre-loaded with Stoic self-regulation (*Marcus Aurelius*), biophilic healing (*Florence Nightingale*), and chrono-philosophy (*H.G. Wells*).

---

## 🛡️ License

Dual-licensed under:
1. **Apache License, Version 2.0** ([`LICENSE`](./LICENSE))
2. **CERN Open Hardware License — Strongly Permissive (CERN OHL-S v2)** for all cymatics equations and biophysical acoustic maps.
