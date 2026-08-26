#!/usr/bin/env python3
"""
Sensory Ambient, Environmental Telemetry & Clinician Fatigue Synthetic Dataset Generator.

Generates structured JSONL datasets for:
1. Context-Aware Ambient Prescription (Environmental Telemetry -> Protocol)
2. Clinician Cognitive Load & Shift Fatigue Adaptation (KSS -> UI State)
3. Autonomic Stabilization & Life Journey Matching (Patient Profile -> Sensory Path)
"""

import json
import os
import random
from typing import Dict, List, Any

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_ambient_environmental_dataset(n_samples: int = 25) -> List[Dict[str, Any]]:
    """Generate ambient environmental telemetry -> protocol prescriptions."""
    tracks = [
        ("Sacred Cedar Flute 432 Hz", "432Hz fundamental with natural breath harmonics"),
        ("Persian Sufi Ney", "Microtonal acoustic resonance for vagal soothing"),
        ("Water Drum 4.5 Hz", "Theta-frequency rhythm for acute sensory de-escalation"),
        ("Tibetan Singing Bowl 432 Hz", "Deep overtone acoustic bath for somatic grounding"),
        ("Ocean Wave Coastal Swell", "0.1 Hz cardiovascular resonance wave entrainment"),
        ("MIT 40 Hz Gamma Burst", "40 Hz auditory neuromodulation for cognitive clarity"),
    ]

    samples = []
    for _ in range(n_samples):
        # Fluctuating realistic environmental sensor telemetry
        baro_trend = random.choice(["rapid_drop", "stable_high", "slow_rise", "storm_depression", "diurnal_normal"])
        baro_hpa = round(random.uniform(992.0, 1028.0), 1)
        ambient_db = round(random.uniform(32.0, 84.0), 1)
        aqi = random.randint(15, 210)
        uv_index = round(random.uniform(0.5, 11.5), 1)
        schumann_hz = round(random.uniform(6.8, 8.4), 2)

        input_payload = {
            "barometric_trend": f"{baro_trend} ({baro_hpa} hPa)",
            "ambient_db": ambient_db,
            "aqi": aqi,
            "uv_index": uv_index,
            "schumann_hz": schumann_hz,
        }

        # Deterministic clinical risk & sensory rule engine
        if baro_trend in ["rapid_drop", "storm_depression"] or baro_hpa < 1004.0:
            risk = "Rapid barometric pressure drop triggering cranial vascular headache & parasympathetic withdrawal"
            track, desc = tracks[0]  # Sacred Cedar Flute
            vol_offset = -2.5
            rationale = "432 Hz acoustic flute harmonics lower sympathetic vascular tone and stabilize cranial blood flow during barometric depressions."
        elif ambient_db > 68.0:
            risk = "High environmental noise level inducing acute sympathetic overdrive and sensory fatigue"
            track, desc = tracks[2]  # Water Drum
            vol_offset = 3.5
            rationale = "4.5 Hz theta rhythmic masking decouples auditory sensory overload, fostering autonomic down-regulation in noisy environments."
        elif aqi > 120:
            risk = "Elevated particulate pollution (PM2.5) driving systemic subclinical neuro-inflammatory oxidative stress"
            track, desc = tracks[1]  # Persian Sufi Ney
            vol_offset = -1.0
            rationale = "Microtonal acoustic sufi melodies promote steady slow-wave diaphragmatic breathing to minimize particulate intake velocity."
        elif uv_index > 8.0:
            risk = "Elevated thermal & solar radiation load inducing dehydration-related autonomic strain"
            track, desc = tracks[4]  # Ocean Wave
            vol_offset = 0.0
            rationale = "0.1 Hz coastal wave rhythms induce Mayer wave heart rate variability resonance to counteract thermal cardiovascular strain."
        else:
            risk = "Nominal baseline environment with minor circadian variation"
            track, desc = tracks[3]  # Tibetan Singing Bowl
            vol_offset = 0.0
            rationale = "Harmonic 432 Hz overtone bath maintains homeostatic equilibrium and baseline vagal parasympathetic tone."

        output_payload = {
            "risk_detected": risk,
            "recommended_protocol": track,
            "volume_offset_db": vol_offset,
            "clinical_rationale": rationale,
        }

        samples.append({
            "paradigm": "ambient_environmental_telemetry",
            "instruction": (
                "You are PocketGull's Environmental Autonomic Engine.\n"
                "Evaluate real-time environmental sensor JSON (barometric_trend, ambient_db, aqi, uv_index, schumann_hz).\n"
                "Detect physiological risks, recommend the exact ambient harmonization track and volume offset (dB), "
                "and provide a one-sentence clinical rationale grounded in autonomic co-regulation.\n"
                "Output strict JSON with keys: 'risk_detected', 'recommended_protocol', 'volume_offset_db', 'clinical_rationale'."
            ),
            "input": json.dumps(input_payload),
            "output": json.dumps(output_payload),
        })

    return samples


def generate_clinician_fatigue_dataset(n_samples: int = 25) -> List[Dict[str, Any]]:
    """Generate clinician fatigue adaptation (KSS -> UI State) dataset."""
    roles = [
        "Attending Emergency Physician",
        "Trauma Surgeon on Call",
        "Critical Care ICU Nurse",
        "Hospitalist Physician",
        "Pediatric Resident",
        "Telemedicine Triage Clinician",
    ]

    samples = []
    for _ in range(n_samples):
        kss = random.randint(1, 9)
        shift_hours = round(random.uniform(2.0, 16.0), 1)
        role = random.choice(roles)

        input_payload = {
            "karolinska_sleepiness_scale": kss,
            "shift_duration_hours": shift_hours,
            "active_clinical_role": role,
        }

        if kss >= 7 or shift_hours >= 12.0:
            theme = "Dark Obsidian"
            motion = False
            binaural_hz = 40.0
            protocol = "STAT shift fatigue mitigation: high-contrast dark obsidian surface, zero UI motion jitter, and pulsed 40 Hz gamma acoustic stimulation."
        elif kss >= 5:
            theme = "Raw Hemp Paper (Dark)"
            motion = False
            binaural_hz = 10.0
            protocol = "Moderate fatigue adaptation: low-glare warm paper contrast, reduced motion, and 10 Hz alpha-beta bridge entrainment."
        else:
            theme = "Light Parchment"
            motion = True
            binaural_hz = 7.83
            protocol = "Optimal circadian baseline: organic parchment texture, gentle wave parallax, and 7.83 Hz Schumann fundamental."

        output_payload = {
            "theme": theme,
            "motion_enabled": motion,
            "binaural_entrainment_hz": binaural_hz,
            "alertness_protocol": protocol,
        }

        samples.append({
            "paradigm": "clinician_fatigue_adaptive_ui",
            "instruction": (
                "You are PocketGull's Adaptive Interface Controller.\n"
                "Evaluate Karolinska Sleepiness Scale (1-9), shift_duration_hours, and active_clinical_role.\n"
                "Adjust UI theme, motion sensitivity, and binaural entrainment frequency to mitigate shift fatigue.\n"
                "Output strict JSON with keys: 'theme', 'motion_enabled', 'binaural_entrainment_hz', 'alertness_protocol'."
            ),
            "input": json.dumps(input_payload),
            "output": json.dumps(output_payload),
        })

    return samples


def generate_life_journey_sensory_dataset(n_samples: int = 25) -> List[Dict[str, Any]]:
    """Generate patient life journey & autonomic sensory matching dataset."""
    archetypes = [
        ("The Frontline Healer", "Burnout recovery and somatic decompression", "Bilateral EMDR Panning at 8 Hz with Purr Harmonics", "Bilateral 8 Hz Sinusoidal", "You have held space for others; now let the stillness hold and restore you."),
        ("The Wounded Traveler", "Chronic pain and autonomic hyper-reactivity", "Dorian 60 BPM Heartbeat with Vagal 4-7-8 Breath Pacer", "Cranial Crossfeed Center-Weighted", "Every slow breath softens the tension in your body, anchoring safe harbor."),
        ("The Sacred Beginning", "Postpartum transition and maternal-infant synchrony", "432 Hz Maternal Uterine Resonance & Gentle Lullaby Flow", "Diffused Spatial Surround", "You and your child are gently held within life's protective and ancient rhythm."),
        ("The Elder & Storyteller", "Cognitive longevity and peaceful twilight reflection", "528 Hz Solfeggio Golden Vein Kintsugi Waves", "Slow Orbital 0.05 Hz Panning", "Your wisdom has deep roots; let quiet peace nourish your mind and spirit."),
    ]

    samples = []
    for _ in range(n_samples):
        archetype, need, engine, panning, affirmation = random.choice(archetypes)
        energy = random.randint(1, 10)

        input_payload = {
            "patient_archetype": archetype,
            "current_subjective_energy": energy,
            "primary_need": need,
        }

        output_payload = {
            "audio_engine": engine,
            "panning_mode": panning,
            "grounding_phrase": affirmation,
        }

        samples.append({
            "paradigm": "life_journey_sensory_path",
            "instruction": (
                "You are the PocketGull 'Meet Them Where They Are' Personalization Agent.\n"
                "Evaluate patient archetype, current subjective energy (1-10), and primary clinical/emotional need.\n"
                "Select the primary auditory engine, spatial panning mode, and generate an empathetic micro-grounding affirmation under 20 words.\n"
                "Output strict JSON with keys: 'audio_engine', 'panning_mode', 'grounding_phrase'."
            ),
            "input": json.dumps(input_payload),
            "output": json.dumps(output_payload),
        })

    return samples


def main():
    print("[INFO] Generating PocketGull Sensory & Environmental Synthetic Datasets...")
    
    ambient_samples = generate_ambient_environmental_dataset(30)
    fatigue_samples = generate_clinician_fatigue_dataset(30)
    journey_samples = generate_life_journey_sensory_dataset(30)

    combined_samples = ambient_samples + fatigue_samples + journey_samples

    # Write combined sensory ambient dataset
    combined_path = os.path.join(OUTPUT_DIR, "sensory_ambient_training_dataset.jsonl")
    with open(combined_path, "w", encoding="utf-8") as f:
        for s in combined_samples:
            f.write(json.dumps(s) + "\n")
    print(f"  [OK] Saved {len(combined_samples)} samples to {combined_path}")

    # Append to master clinical_cot_training_dataset.jsonl
    master_path = os.path.join(OUTPUT_DIR, "clinical_cot_training_dataset.jsonl")
    with open(master_path, "a", encoding="utf-8") as f:
        for s in combined_samples[:6]:  # Add 6 exemplary samples directly to master
            f.write(json.dumps(s) + "\n")
    print(f"  [OK] Appended 6 exemplary sensory telemetry samples to master {master_path}")


if __name__ == "__main__":
    main()
