# SPDX-License-Identifier: Apache-2.0
"""Unit tests for Asymmetric Clinical Gain (ACG), Wearable Tri-Modal Readiness, and Fahrenheit normalization."""

import numpy as np
from pocketgull_api.services.asymmetric_loss_engine import (
    WearableTriModalTelemetryInput,
    compute_asymmetric_gain,
    evaluate_wearable_asymmetric_gain,
)
from pocketgull_api.train_clinical_risk_models import normalize_temperature_fahrenheit


def test_compute_asymmetric_gain_rewards_true_positive_interception() -> None:
    """Verify Dual Log-Likelihood Information Gain, Vickers Net Benefit, and Salutogenic Reserve."""
    y_true = np.array([1.0, 1.0, 0.0, 0.0, 1.0])
    y_prob = np.array([0.92, 0.88, 0.06, 0.08, 0.91])
    metrics = compute_asymmetric_gain(y_true, y_prob, gamma_fn=4.0, gamma_fp=1.0, tau=0.25)

    assert metrics["asymmetric_information_gain"] > 1.5
    assert metrics["vickers_net_benefit"] > 0.45
    assert metrics["salutogenic_reserve_gain"] > 0.85
    assert metrics["composite_asymmetric_gain_score"] > 0.70


def test_evaluate_wearable_asymmetric_gain_trimodal_and_mst_debiasing() -> None:
    """Verify Doing, Feeling, and Not Doing gains alongside Monk Skin Tone PPG debiasing."""
    baseline_payload = WearableTriModalTelemetryInput(
        watch_platform="apple_watch_healthkit",
        monk_skin_tone_scale=3,
        paced_breathing_minutes=8.0,
        post_meal_walk_minutes=15.0,
        hrv_rmssd_ms=52.0,
        spo2_raw_percent=98.5,
        subjective_energy_vas=8.0,
        perceived_tremor_or_fog_vas=1.0,
        wrist_temp_delta_c=0.05,
        stopped_before_exhaustion=True,
        orthostatic_hr_delta_bpm=12.0,
        screen_blue_light_cutoff_mins_before_bed=45.0,
        unnecessary_polypharmacy_avoided_count=2,
    )
    baseline_res = evaluate_wearable_asymmetric_gain(baseline_payload)
    assert baseline_res.total_shock_trooper_readiness_gain > 80.0
    assert baseline_res.estimated_pem_crash_hours_saved > 40.0

    mst9_overexerted_payload = baseline_payload.model_copy(
        update={"monk_skin_tone_scale": 9, "stopped_before_exhaustion": False}
    )
    mst9_res = evaluate_wearable_asymmetric_gain(mst9_overexerted_payload)
    assert mst9_res.mst_calibrated_spo2_percent < baseline_res.mst_calibrated_spo2_percent
    assert (
        mst9_res.total_shock_trooper_readiness_gain
        < baseline_res.total_shock_trooper_readiness_gain
    )
    assert mst9_res.estimated_pem_crash_hours_saved < baseline_res.estimated_pem_crash_hours_saved


def test_normalize_temperature_fahrenheit_converts_celsius() -> None:
    """Verify Celsius inputs (e.g. 38.9 C) are converted to Fahrenheit (102.02 F)."""
    assert abs(normalize_temperature_fahrenheit(37.0) - 98.6) < 0.05
    assert abs(normalize_temperature_fahrenheit(38.9) - 102.02) < 0.05
    assert abs(normalize_temperature_fahrenheit(98.6) - 98.6) < 0.01
