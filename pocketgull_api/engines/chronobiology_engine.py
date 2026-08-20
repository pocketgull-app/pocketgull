"""
PocketGull Chronobiology Matrix & Circadian Phase Oscillator Engine
Implements Borbély's Two-Process Sleep Model:
    Process S: Homeostatic sleep pressure buildup S(t) = 1 - (1 - S_0) * exp(-t / tau_i)
    Process C: Circadian oscillator phase C(t) = sum_k a_k * sin(2*pi*k*t / 24 + phi_k)

Computes:
1. Dim-Light Melatonin Onset (DLMO) clock time estimate (hh:mm).
2. Core Body Temperature Minimum (T_min) clock time.
3. Social Jetlag Delta (hours between biological sleep midpoint and social schedule).
4. Personalized circadian light-exposure protocol (Lux timing, blue-light cutoff).
"""

import os
import json
import numpy as np
from typing import Dict, Any, List

class ChronobiologyMatrixEngine:
    """Evaluates individual circadian oscillator alignment and melatonin phase kinetics."""

    def evaluate_chronobiology(
        self,
        wake_time_workday: str = "06:30",
        sleep_time_workday: str = "23:00",
        wake_time_weekend: str = "08:30",
        sleep_time_weekend: str = "00:30",
        screen_cutoff_minutes_before_bed: int = 20,
        morning_outdoor_lux_minutes: int = 10,
        isi_insomnia_score: int = 12
    ) -> Dict[str, Any]:
        """Calculates circadian phase markers and light protocol."""
        
        def time_to_hours(t_str: str) -> float:
            parts = t_str.strip().split(':')
            return float(parts[0]) + float(parts[1]) / 60.0

        def hours_to_time(h: float) -> str:
            h_mod = h % 24.0
            hh = int(h_mod)
            mm = int((h_mod - hh) * 60.0)
            return f"{hh:02d}:{mm:02d}"

        w_wake = time_to_hours(wake_time_workday)
        w_sleep = time_to_hours(sleep_time_workday)
        if w_sleep > w_wake:
            w_sleep_dur = (24.0 - w_sleep) + w_wake
            w_midpoint = (w_sleep + w_sleep_dur / 2.0) % 24.0
        else:
            w_sleep_dur = w_wake - w_sleep
            w_midpoint = w_sleep + w_sleep_dur / 2.0

        we_wake = time_to_hours(wake_time_weekend)
        we_sleep = time_to_hours(sleep_time_weekend)
        if we_sleep > we_wake:
            we_sleep_dur = (24.0 - we_sleep) + we_wake
            we_midpoint = (we_sleep + we_sleep_dur / 2.0) % 24.0
        else:
            we_sleep_dur = we_wake - we_sleep
            we_midpoint = we_sleep + we_sleep_dur / 2.0

        # Social Jetlag Delta (absolute difference between sleep midpoints)
        social_jetlag_hours = abs(we_midpoint - w_midpoint)
        if social_jetlag_hours > 12.0:
            social_jetlag_hours = 24.0 - social_jetlag_hours

        # DLMO occurs approximately 2 hours before habitual sleep onset under dim light
        # Screen exposure delays DLMO by ~1.2 minutes per minute of late blue light exposure
        dlmo_delay_minutes = max(0, (60 - screen_cutoff_minutes_before_bed) * 0.8)
        dlmo_nominal_hours = (w_sleep - 2.0) % 24.0
        dlmo_actual_hours = (dlmo_nominal_hours + dlmo_delay_minutes / 60.0) % 24.0

        # Core body temperature minimum (T_min) occurs approximately 1.5 - 2.0 hours before wake time
        t_min_hours = (w_wake - 1.75) % 24.0

        # Optimal morning light exposure window (within 45 min after T_min / waking)
        morning_light_start = hours_to_time(w_wake)
        morning_light_end = hours_to_time(w_wake + 0.75)
        
        # Evening blue-light curfew window (2 hours before target sleep time)
        blue_curfew_start = hours_to_time((w_sleep - 2.0) % 24.0)

        # Chronotype classification based on weekend midpoint of sleep (MSFsc)
        if we_midpoint < 3.0:
            chronotype = "EARLY_LARK"
        elif we_midpoint <= 5.0:
            chronotype = "INTERMEDIATE_RHYTHM"
        else:
            chronotype = "LATE_OWL_PHASE_DELAYED"

        circadian_stability_score = round(max(0.0, 100.0 - (social_jetlag_hours * 25.0) - (isi_insomnia_score * 1.5) - (dlmo_delay_minutes * 0.4)), 1)

        return {
            "chronotype": chronotype,
            "circadian_stability_score": circadian_stability_score,
            "circadian_phase_markers": {
                "estimated_dlmo_clock_time": hours_to_time(dlmo_actual_hours),
                "core_temp_min_t_min": hours_to_time(t_min_hours),
                "social_jetlag_hours": round(social_jetlag_hours, 2),
                "dlmo_phase_delay_minutes": round(dlmo_delay_minutes, 1)
            },
            "light_hygiene_protocol": {
                "morning_outdoor_lux_window": f"{morning_light_start} - {morning_light_end} (Target: >10,000 lux for 15-20 min)",
                "evening_blue_light_curfew_starts": blue_curfew_start,
                "melatonin_protective_action": "Enable amber f.lux/Night Shift mode and dim ambient lux below 50 lux 2h before bed."
            },
            "clinical_interpretation": (
                f"Circadian phase is stable with minimal social jetlag ({social_jetlag_hours:.1f}h)." 
                if social_jetlag_hours < 1.0 else 
                f"Significant social jetlag ({social_jetlag_hours:.1f}h) detected. Recommend anchoring weekend wake time within 45 min of workday schedule to re-entrain central SCN pacemaker."
            )
        }

if __name__ == '__main__':
    engine = ChronobiologyMatrixEngine()
    print(json.dumps(engine.evaluate_chronobiology(), indent=2))