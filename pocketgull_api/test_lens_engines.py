"""
Unit and Integration Tests for PocketGull's 5 Lens-Specific Clinical ML Engines:
1. Chronobiology Matrix & DLMO Circadian Phase Engine
2. Epigenetic Longevity & PhenoAge Biological Clock Engine
3. Perinatal Hemodynamics & Postpartum Mood Trajectory Engine
4. Periodontal-Cardiometabolic Systemic Bridge Engine
5. Transgenerational Epigenetics & Environmental Toxicology Engine
"""

from fastapi.testclient import TestClient
from pocketgull_api.main import app
from pocketgull_api.engines.chronobiology_engine import ChronobiologyMatrixEngine
from pocketgull_api.engines.epigenetic_longevity_engine import EpigeneticLongevityEngine
from pocketgull_api.engines.perinatal_trajectory_engine import PerinatalTrajectoryEngine
from pocketgull_api.engines.periodontal_systemic_bridge_engine import PeriodontalSystemicBridgeEngine
from pocketgull_api.engines.transgenerational_stewardship_engine import TransgenerationalStewardshipEngine

client = TestClient(app)

def test_chronobiology_lens_engine_and_endpoint():
    """Validates Two-Process model, DLMO estimation, and FastAPI route."""
    engine = ChronobiologyMatrixEngine()
    res = engine.evaluate_chronobiology(
        wake_time_workday="06:30",
        sleep_time_workday="23:00",
        wake_time_weekend="08:30",
        sleep_time_weekend="00:30",
        screen_cutoff_minutes_before_bed=15,
        morning_outdoor_lux_minutes=15,
        isi_insomnia_score=14
    )
    assert res["chronotype"] in ["EARLY_LARK", "INTERMEDIATE_RHYTHM", "LATE_OWL_PHASE_DELAYED"]
    assert 0.0 <= res["circadian_stability_score"] <= 100.0
    assert "estimated_dlmo_clock_time" in res["circadian_phase_markers"]
    assert "morning_outdoor_lux_window" in res["light_hygiene_protocol"]

    # Test HTTP endpoint
    response = client.post("/api/ml/chronobiology-matrix", json={
        "wake_time_workday": "06:30",
        "sleep_time_workday": "23:00",
        "wake_time_weekend": "08:30",
        "sleep_time_weekend": "00:30"
    })
    assert response.status_code == 200
    data = response.json()
    assert "circadian_phase_markers" in data
    assert "light_hygiene_protocol" in data

def test_epigenetic_longevity_lens_engine_and_endpoint():
    """Validates PhenoAge biological clock, delta age, and FastAPI route."""
    engine = EpigeneticLongevityEngine()
    res = engine.compute_phenoage(
        chronological_age=50.0,
        albumin_g_dl=4.4,
        creatinine_mg_dl=1.1,
        glucose_mg_dl=105.0,
        crp_mg_l=1.8,
        lymphocyte_pct=28.0,
        resting_rmssd_ms=30.0,
        systolic_bp=135.0
    )
    assert res["chronological_age"] == 50.0
    assert res["biological_phenotypic_age"] > 0
    assert res["aging_trajectory"] in ["DECELERATED_AGING", "ACCELERATED_SENESCENCE", "PHYSIOLOGICAL_CONCORDANCE"]
    assert "organ_specific_ages" in res
    assert "renal_systemic_age" in res["organ_specific_ages"]

    # Test HTTP endpoint
    response = client.post("/api/ml/epigenetic-longevity", json={
        "chronological_age": 50.0,
        "albumin_g_dl": 4.4,
        "creatinine_mg_dl": 1.1,
        "glucose_mg_dl": 105.0,
        "crp_mg_l": 1.8
    })
    assert response.status_code == 200
    data = response.json()
    assert "biological_phenotypic_age" in data
    assert "longevity_potential" in data

def test_perinatal_trajectory_lens_engine_and_endpoint():
    """Validates maternal MAP, preeclampsia risk, EPDS slope, and FastAPI route."""
    engine = PerinatalTrajectoryEngine()
    res = engine.evaluate_maternal_trajectory(
        gestational_age_weeks=36.0,
        is_postpartum=False,
        systolic_bp=138.0,
        diastolic_bp=88.0,
        current_epds_score=11,
        prior_epds_score=7,
        days_between_epds_screens=28,
        is_lactating=True
    )
    assert res["mean_arterial_pressure_mmhg"] > 90.0
    assert "preeclampsia_screening" in res
    assert res["postpartum_mood_trajectory"]["epds_monthly_slope"] > 0
    assert len(res["lactation_micronutrient_protocol"]) > 0


    # Test HTTP endpoint
    response = client.post("/api/ml/perinatal-trajectory", json={
        "gestational_age_weeks": 32.0,
        "systolic_bp": 138.0,
        "diastolic_bp": 88.0,
        "current_epds_score": 11
    })
    assert response.status_code == 200
    data = response.json()
    assert "mean_arterial_pressure_mmhg" in data
    assert "preeclampsia_screening" in data

def test_periodontal_bridge_lens_engine_and_endpoint():
    """Validates PISA index, systemic hs-CRP spillover, and FastAPI route."""
    engine = PeriodontalSystemicBridgeEngine()
    res = engine.evaluate_oral_systemic_axis(
        bleeding_on_probing_pct=35.0,
        mean_probing_depth_mm=4.8,
        deep_pockets_count_over_5mm=12,
        has_periodontitis_diagnosis=True,
        baseline_hscrp_mg_l=3.2,
        baseline_hba1c_pct=6.5
    )
    assert res["periodontal_inflammatory_surface_area_pisa_mm2"] > 400.0
    assert res["systemic_inflammatory_impact"]["projected_oral_crp_contribution"] > 0.0
    assert len(res["co_management_directive"]) == 3

    # Test HTTP endpoint
    response = client.post("/api/ml/periodontal-systemic-bridge", json={
        "bleeding_on_probing_pct": 35.0,
        "mean_probing_depth_mm": 4.8,
        "baseline_hscrp_mg_l": 3.2
    })
    assert response.status_code == 200
    data = response.json()
    assert "periodontal_inflammatory_surface_area_pisa_mm2" in data
    assert "systemic_inflammatory_impact" in data

def test_transgenerational_stewardship_lens_engine_and_endpoint():
    """Validates EDC xenobiotic index, germline resilience, and FastAPI route."""
    engine = TransgenerationalStewardshipEngine()
    res = engine.evaluate_stewardship_profile(
        tap_water_unfiltered=True,
        canned_food_weekly_servings=5,
        synthetic_fragrance_exposure_daily=True,
        pesticide_organic_food_pct=30.0,
        homocysteine_umol_l=12.5,
        serum_folate_ng_ml=8.0,
        days_until_target_conception=60
    )
    assert res["cumulative_edc_xenobiotic_index"] > 30.0
    assert 0.0 <= res["germline_methylation_resilience_score"] <= 100.0
    assert res["preconception_90day_gamete_clock"]["days_until_target_conception"] == 60
    assert len(res["seven_generations_stewardship_protocol"]) > 0

    # Test HTTP endpoint
    response = client.post("/api/ml/transgenerational-stewardship", json={
        "tap_water_unfiltered": True,
        "canned_food_weekly_servings": 5,
        "homocysteine_umol_l": 12.5
    })
    assert response.status_code == 200
    data = response.json()
    assert "cumulative_edc_xenobiotic_index" in data
    assert "germline_methylation_resilience_score" in data