"""
Unit tests for Pocket Gull Human Flourishing & Co-Regulation Predictive ML Models
"""

import pytest
from services.flourishing_predictive_models_service import (
    GlymphaticClearanceInput,
    forecast_glymphatic_clearance,
    CouplesCoRegulationInput,
    predict_couples_co_regulation,
    GutBarrierModelInput,
    evaluate_gut_barrier_model,
    CaregiverAllostaticLoadInput,
    forecast_caregiver_allostatic_load,
)


def test_forecast_glymphatic_clearance_optimal():
    inp = GlymphaticClearanceInput(
        slow_wave_sleep_minutes=95.0,
        bedtime_lux_exposure=15.0,
        screen_apnea_pauses_per_hr=4.0,
        mayer_wave_resonance_coherence_pct=88.0,
    )
    out = forecast_glymphatic_clearance(inp)
    assert out.glymphatic_clearance_efficiency_pct >= 75.0
    assert out.astrocytic_aquaporin4_polarization_tier == "OPTIMAL"
    assert out.projected_morning_cognitive_fog_score < 4.0
    assert out.neuro_metabolite_washout_index > 7.0


def test_forecast_glymphatic_clearance_suppressed():
    inp = GlymphaticClearanceInput(
        slow_wave_sleep_minutes=35.0,
        bedtime_lux_exposure=400.0,
        screen_apnea_pauses_per_hr=32.0,
        mayer_wave_resonance_coherence_pct=40.0,
    )
    out = forecast_glymphatic_clearance(inp)
    assert out.glymphatic_clearance_efficiency_pct < 60.0
    assert out.astrocytic_aquaporin4_polarization_tier in ["PARTIALLY_IMPAIRED", "SUBSTANTIALLY_SUPPRESSED"]
    assert any("curfew" in rec.lower() for rec in out.posology_interventions)
    assert any("screen apnea" in rec.lower() or "micro-exhale" in rec.lower() for rec in out.posology_interventions)


def test_predict_couples_co_regulation_flooded():
    inp = CouplesCoRegulationInput(
        partner_a_heart_rate_bpm=108.0,
        partner_b_heart_rate_bpm=102.0,
        partner_a_rmssd_ms=14.0,
        partner_b_rmssd_ms=16.0,
        speech_turn_latency_seconds=0.4,
        unresolved_conflict_present=True,
    )
    out = predict_couples_co_regulation(inp)
    assert out.flooding_probability_pct > 60.0
    assert out.mandatory_timeout_minutes == 20
    assert out.polyvagal_state_partner_a == "SYMPATHETIC_ALARM"
    assert "20-MINUTE RECOVERY BUFFER" in out.de_escalation_protocol


def test_predict_couples_co_regulation_harmonious():
    inp = CouplesCoRegulationInput(
        partner_a_heart_rate_bpm=68.0,
        partner_b_heart_rate_bpm=70.0,
        partner_a_rmssd_ms=52.0,
        partner_b_rmssd_ms=55.0,
        speech_turn_latency_seconds=2.8,
        unresolved_conflict_present=False,
    )
    out = predict_couples_co_regulation(inp)
    assert out.flooding_probability_pct < 30.0
    assert out.mandatory_timeout_minutes == 0
    assert out.polyvagal_state_partner_a == "VENTRAL_VAGAL"
    assert out.autonomic_coupling_index > 0.3


def test_evaluate_gut_barrier_model_robust():
    inp = GutBarrierModelInput(
        weekly_botanical_species_count=34,
        ancestral_resistant_starch_grams_day=25.0,
        polyphenol_density_score=8.5,
        ultra_processed_food_caloric_share_pct=5.0,
    )
    out = evaluate_gut_barrier_model(inp)
    assert out.projected_fecal_butyrate_umol_g >= 12.0
    assert out.epithelial_barrier_integrity_score >= 80.0
    assert out.systemic_endotoxin_leakage_risk == "LOW"
    assert out.circulating_zonulin_risk_level == "LOW_PERMEABILITY"


def test_evaluate_gut_barrier_model_leaky_risk():
    inp = GutBarrierModelInput(
        weekly_botanical_species_count=10,
        ancestral_resistant_starch_grams_day=4.0,
        polyphenol_density_score=3.0,
        ultra_processed_food_caloric_share_pct=55.0,
    )
    out = evaluate_gut_barrier_model(inp)
    assert out.projected_fecal_butyrate_umol_g < 10.0
    assert out.epithelial_barrier_integrity_score < 60.0
    assert out.systemic_endotoxin_leakage_risk in ["MODERATE", "ELEVATED"]
    assert len(out.ancestral_nutrition_guidance) > 0


def test_forecast_caregiver_allostatic_load_critical():
    inp = CaregiverAllostaticLoadInput(
        nightly_awakenings_for_care=5,
        total_sleep_hours_actual=4.0,
        daily_transfer_biomechanical_mets=4.5,
        consecutive_caregiving_days_without_respite=28,
    )
    out = forecast_caregiver_allostatic_load(inp)
    assert out.allostatic_overload_tier == "EXHAUSTION_CRITICAL"
    assert out.cumulative_sleep_debt_hours_weekly > 18.0
    assert out.respite_urgency == "WITHIN_48_HOURS"
    assert out.prescribed_respite_shift_hours >= 24
    assert out.daytime_microsleep_risk_pct > 50.0


def test_forecast_caregiver_allostatic_load_stable():
    inp = CaregiverAllostaticLoadInput(
        nightly_awakenings_for_care=0,
        total_sleep_hours_actual=7.5,
        daily_transfer_biomechanical_mets=1.5,
        consecutive_caregiving_days_without_respite=3,
    )
    out = forecast_caregiver_allostatic_load(inp)
    assert out.allostatic_overload_tier == "STABLE_EQUILIBRIUM"
    assert out.cumulative_sleep_debt_hours_weekly < 5.0
    assert out.respite_urgency == "MAINTENANCE_PACE"
