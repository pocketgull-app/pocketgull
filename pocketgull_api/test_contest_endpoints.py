"""
Pocket Gull — Unit Tests for Contest Model Prediction Endpoints
"""

import os
from pathlib import Path
from fastapi.testclient import TestClient

try:
    from pocketgull_api.main import app
except ImportError:
    from main import app

client = TestClient(app)


def test_predict_physionet_2022_endpoint():
    payload = {
        "hr": 110.0,
        "bp_systolic": 145.0,
        "bp_diastolic": 90.0,
        "pcg_spike_freq": 2.1,
        "murmur_intensity": 3.8,
        "age": 62
    }
    response = client.post("/ml/predict/physionet-2022", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data
    assert len(data["entry"]) > 0


def test_predict_physionet_2023_endpoint():
    payload = {
        "eeg_alpha_theta": 0.3,
        "burst_suppression_ratio": 0.45,
        "spo2": 88.0,
        "temperature": 35.8,
        "gcs_motor": 2,
        "age": 68,
        "map": 65.0
    }
    response = client.post("/ml/predict/physionet-2023", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2024_endpoint():
    payload = {
        "qtc": 485.0,
        "pr": 210.0,
        "st_elevation": 2.2,
        "qrs": 130.0,
        "hr": 115.0,
        "spo2": 91.0,
        "age": 58
    }
    response = client.post("/ml/predict/physionet-2024", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2025_endpoint():
    payload = {
        "wbc": 18.5,
        "lactate": 4.2,
        "creatinine": 2.8,
        "hr": 125.0,
        "bp_systolic": 85.0,
        "spo2": 89.0,
        "temperature": 38.9,
        "age": 72
    }
    response = client.post("/ml/predict/physionet-2025", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_physionet_2026_endpoint():
    payload = {
        "spo2": 88.0,
        "hr": 92.0,
        "eeg_delta_power": 0.3,
        "age": 70,
        "sex": 1
    }
    response = client.post("/ml/predict/physionet-2026", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"


def test_predict_knee_recovery_endpoint():
    payload = {
        "koos_pain_score": 35.0,
        "koos_adl_score": 40.0,
        "knee_flexion_rom_deg": 85.0,
        "joint_effusion_grade": 2,
        "cartilage_thinning_rate_mm_yr": 0.95,
        "quad_symmetry_deficit_pct": 35.0,
        "days_post_intervention": 30.0
    }
    response = client.post("/ml/predict/knee-recovery", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_biological_age_endpoint():
    payload = {
        "albumin_g_dl": 3.4,
        "creatinine_mg_dl": 1.6,
        "fasting_glucose_mg_dl": 145.0,
        "hs_crp_mg_l": 6.8,
        "lymphocyte_pct": 18.0,
        "mcv_fl": 95.0,
        "rdw_pct": 15.2,
        "alk_phosphatase_u_l": 110.0,
        "wbc_count_10e3": 9.8,
        "chronological_age": 58.0
    }
    response = client.post("/ml/predict/biological-age", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_periodontal_risk_endpoint():
    payload = {
        "deep_pocket_count_ppd_ge_5mm": 10,
        "bleeding_on_probing_pct": 45.0,
        "clinical_attachment_loss_mm": 5.5,
        "systemic_hs_crp": 4.8,
        "hba1c_pct": 7.8,
        "tooth_loss_count": 4
    }
    response = client.post("/ml/predict/periodontal-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_ms_progression_endpoint():
    payload = {
        "serum_nfl_pg_ml": 18.2,
        "baseline_edss": 2.5,
        "timed_25ft_walk_sec": 6.5,
        "nine_hole_peg_test_sec": 24.0,
        "serum_vitamin_d_ng_ml": 18.0,
        "serum_homocysteine_umol_l": 14.1,
        "modified_fatigue_impact_score": 52.0
    }
    response = client.post("/ml/predict/ms-progression", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_who_hearts_cvd_endpoint():
    payload = {
        "age_years": 58.0,
        "systolic_bp_mmhg": 152.0,
        "body_mass_index": 32.8,
        "is_smoker": 1.0,
        "resting_heart_rate_bpm": 88.0,
        "waist_to_height_ratio": 0.68,
        "known_diabetes_history": 1.0
    }
    response = client.post("/ml/predict/who-hearts-cvd", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_dysautonomia_pem_endpoint():
    payload = {
        "orthostatic_hr_delta_bpm": 36.0,
        "resting_rmssd_ms": 18.0,
        "diurnal_pulse_pressure_variance": 38.0,
        "prior_day_exertion_load": 8500.0,
        "sleep_efficiency_pct": 58.0,
        "morning_vas_fatigue": 8.5
    }
    response = client.post("/ml/predict/dysautonomia-pem", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


def test_predict_oncology_cachexia_endpoint():
    payload = {
        "weight_loss_pct_6mo": 14.5,
        "crp_to_albumin_ratio": 2.85,
        "skeletal_muscle_index_cm2_m2": 34.2,
        "daily_caloric_deficit_kcal": 650.0,
        "anorexia_symptom_score": 8.0
    }
    response = client.post("/ml/predict/oncology-cachexia", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert "entry" in data


