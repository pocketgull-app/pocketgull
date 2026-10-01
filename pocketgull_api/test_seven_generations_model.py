"""
Unit tests for Seven Generations Protocol & Epigenetic Longevity Model
"""

import os
import sys
sys.modules['numexpr'] = None
import pytest
import numpy as np
import pandas as pd
import joblib
import json

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
MODEL_PATH = os.path.join(MODELS_DIR, 'seven_generations_protocol_model.joblib')
META_PATH = os.path.join(MODELS_DIR, 'seven_generations_protocol_model.metadata.json')

def test_seven_generations_model_and_card_exist():
    assert os.path.exists(MODEL_PATH), "Model .joblib file must exist."
    assert os.path.exists(META_PATH), "Model metadata .json must exist."
    
    with open(META_PATH, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    
    assert meta["model_name"] == "seven_generations_protocol_model"
    assert meta["metrics"]["oof_roc_auc"] >= 0.85
    assert meta["metrics"]["expected_calibration_gap_ecg_ece"] <= 0.03
    assert "TRIPOD+AI" in meta["standards_compliance"]

def test_seven_generations_model_inference():
    model = joblib.load(MODEL_PATH)
    
    with open(META_PATH, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    feature_names = meta["features"]
    
    # 1. Resilient Individual (Healthy vagal tone, high HRV, low PFAS, low homocysteine)
    resilient_patient = pd.DataFrame([{
        "ecg_mean_rr_ms": 850.0,
        "ecg_hrv_rmssd_ms": 65.0,
        "ecg_hrv_sdnn_ms": 80.0,
        "ecg_qtc_bazett_ms": 405.0,
        "ecg_lf_hf_ratio": 1.1,
        "water_pfas_ppb": 0.2,
        "water_heavy_metals_ppb": 1.0,
        "edc_xenobiotic_score": 18.0,
        "homocysteine_umol_l": 6.8,
        "serum_folate_ng_ml": 18.0,
        "glutathione_peroxidase_u_g_hb": 55.0,
        "mthfr_c677t_variant": 0
    }])[feature_names]
    
    # 2. Vulnerable Individual (Low vagal tone, prolonged QTc, high PFAS, hyperhomocysteinemia)
    vulnerable_patient = pd.DataFrame([{
        "ecg_mean_rr_ms": 620.0,
        "ecg_hrv_rmssd_ms": 14.0,
        "ecg_hrv_sdnn_ms": 22.0,
        "ecg_qtc_bazett_ms": 465.0,
        "ecg_lf_hf_ratio": 4.2,
        "water_pfas_ppb": 18.5,
        "water_heavy_metals_ppb": 22.0,
        "edc_xenobiotic_score": 78.0,
        "homocysteine_umol_l": 18.5,
        "serum_folate_ng_ml": 4.2,
        "glutathione_peroxidase_u_g_hb": 22.0,
        "mthfr_c677t_variant": 2
    }])[feature_names]
    
    prob_resilient = model.predict_proba(resilient_patient)[0, 1]
    prob_vulnerable = model.predict_proba(vulnerable_patient)[0, 1]
    
    assert prob_resilient < prob_vulnerable, "Vulnerable profile must yield higher transgenerational risk probability."
    assert prob_resilient < 0.35, f"Resilient profile expected low risk, got {prob_resilient:.3f}"
    assert prob_vulnerable > 0.70, f"Vulnerable profile expected high risk, got {prob_vulnerable:.3f}"
