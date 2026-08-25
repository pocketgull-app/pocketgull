"""
Unit and Integration Tests for PocketGull's 5 Advanced Clinical ML Engines:
1. Dynamic Survival Analysis & Breslow Multi-Horizon Curves
2. Causal Inference & X-Learner Treatment Effect Estimation
3. 1D Waveform CNN Arrhythmia & Autonomic Tone Classifier
4. Bipartite CYP450 Graph Drug-Herb Interaction Network
5. Multi-Morbid Bayesian Co-Occurrence Propagation
"""

import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

from pocketgull_api.main import app
from pocketgull_api.survival_analysis_engine import CoxSurvivalEstimator, train_ckd_decompensation_survival_model
from pocketgull_api.causal_treatment_engine import XLearnerCausalEstimator, train_vagal_breathing_causal_model
from pocketgull_api.waveform_1d_cnn import Waveform1DCNNClassifier
from pocketgull_api.graph_synergy_engine import PharmacokineticGraphSynergyEngine
from pocketgull_api.cooccurrence_prior_engine import BayesianCooccurrenceEngine

client = TestClient(app)

def test_survival_analysis_engine_and_endpoint():
    """Validates Cox survival estimator curve generation and FastAPI route."""
    model = train_ckd_decompensation_survival_model()
    df = pd.DataFrame([{
        'age': 72.0,
        'egfr_current': 35.0,
        'egfr_annual_slope': -5.2,
        'uacr_mg_g': 340.0,
        'sbp_current': 155.0,
        'hba1c_current': 8.6
    }])
    curves = model.predict_survival_curve(df, [30, 90, 180, 365, 730])[0]
    
    assert curves["partial_hazard_ratio"] > 0
    assert "30d" in curves["horizons"]
    assert "730d" in curves["horizons"]
    assert curves["horizons"]["30d"]["survival_probability"] >= curves["horizons"]["730d"]["survival_probability"]
    
    # Test HTTP endpoint
    response = client.post("/api/ml/survival-curve", json={
        "age": 72.0,
        "egfr_current": 35.0,
        "egfr_annual_slope": -5.2,
        "uacr_mg_g": 340.0,
        "sbp_current": 155.0,
        "hba1c_current": 8.6,
        "horizons_days": [30, 90, 180, 365, 730]
    })
    assert response.status_code == 200
    data = response.json()
    assert "patient_partial_hazard_ratio" in data
    assert "projected_median_event_free_days" in data
    assert "365d" in data["curves"]

def test_causal_treatment_engine_and_endpoint():
    """Validates X-Learner causal counterfactual estimation with conformal bounds."""
    model = train_vagal_breathing_causal_model()
    df = pd.DataFrame([{
        'age': 52.0,
        'baseline_sbp': 150.0,
        'baseline_rmssd': 18.0,
        'isi_score': 20.0
    }])
    effects = model.estimate_treatment_effect(df)[0]
    
    assert "individual_treatment_effect_point" in effects
    assert len(effects["conformal_95_ci"]) == 2
    assert effects["conformal_95_ci"][0] <= effects["individual_treatment_effect_point"] <= effects["conformal_95_ci"][1]
    assert 0.0 <= effects["propensity_score"] <= 1.0

    # Test HTTP endpoint
    response = client.post("/api/ml/causal-treatment-effect", json={
        "age": 52.0,
        "baseline_sbp": 150.0,
        "baseline_rmssd": 18.0,
        "isi_score": 20.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "individual_treatment_effect_point" in data
    assert "conformal_95_ci" in data

def test_waveform_1d_cnn_classifier_and_endpoint():
    """Validates 1D temporal waveform feature extraction and rhythm classification."""
    clf = Waveform1DCNNClassifier()
    t = np.linspace(0, 10, 2500)
    # Synthetic normal rhythm signal with clear peaks
    synthetic_ecg = np.sin(2 * np.pi * 1.2 * t) + 0.3 * np.sin(2 * np.pi * 2.4 * t)
    res = clf.classify_waveform(synthetic_ecg)
    
    assert res["predicted_rhythm"] in Waveform1DCNNClassifier.CLASSES
    assert 0.0 <= res["confidence"] <= 1.0
    assert "telemetry" in res
    assert res["telemetry"]["heart_rate_bpm"] > 0

    # Test HTTP endpoint
    response = client.post("/api/ml/classify-waveform", json={
        "signal": synthetic_ecg.tolist()
    })
    assert response.status_code == 200
    data = response.json()
    assert "predicted_rhythm" in data
    assert "class_probabilities" in data

def test_graph_synergy_engine_and_endpoint():
    """Validates Bipartite CYP450 / P-gp interaction evaluator."""
    engine = PharmacokineticGraphSynergyEngine()
    
    # Warfarin + St. John's Wort -> Critical interaction
    crit_res = engine.evaluate_pair("Warfarin", "St. John's Wort")
    assert crit_res["risk_tier"] in ["CRITICAL_CONTRAINDICATION", "MODERATE_TO_HIGH"]
    assert crit_res["kinetic_shift_score"] > 0.5
    
    # Sertraline + St. John's Wort -> Serotonin toxicity alert
    ss_res = engine.evaluate_pair("Sertraline", "St. John's Wort")
    assert ss_res["risk_tier"] == "CRITICAL_CONTRAINDICATION"
    
    # Multi-regimen evaluation endpoint
    response = client.post("/api/ml/drug-herb-synergy", json={
        "drugs": ["Warfarin", "Sertraline", "Atorvastatin"],
        "botanicals": ["St. John's Wort", "Curcumin", "Ashwagandha"]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["regimen_summary"]["pairwise_comparisons"] == 9
    assert data["regimen_summary"]["critical_contraindications"] >= 1

def test_bayesian_cooccurrence_engine_and_endpoint():
    """Validates multi-morbid conditional risk propagation and anatomical mapping."""
    engine = BayesianCooccurrenceEngine()
    prop_res = engine.propagate_risks(["cvsq", "isi"])
    
    assert "posterior_comorbidity_probabilities" in prop_res
    assert prop_res["posterior_comorbidity_probabilities"]["cvsq"] == 1.0
    assert prop_res["posterior_comorbidity_probabilities"]["isi"] == 1.0
    # Burnout (MBI) should be elevated due to screen time + insomnia links
    assert prop_res["posterior_comorbidity_probabilities"]["mbi"] > 0.60
    assert len(prop_res["anatomical_tension_hotspots"]) > 0

    # Test HTTP endpoint
    response = client.post("/api/ml/comorbidity-propagation", json={
        "active_positive_instruments": ["cvsq", "isi"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "anatomical_tension_hotspots" in data