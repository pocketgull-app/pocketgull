"""
Unit and Integration Tests for PocketGull's 5 Breakthrough Clinical AI Innovations:
1. In-Silico 24-Hour Forward Biophysical Twin Simulator
2. Contactless rPPG Pulse & Vocal Acoustic Stress Extraction Engine
3. Causal Polypharmacy De-Prescribing Sandbox Engine
4. Automated N-of-1 Clinical Trial Protocol & Bayesian Evaluator
5. 3D Transgenerational Epigenetic Lineage & Germline Protection Engine
"""

from fastapi.testclient import TestClient
from pocketgull_api.main import app
from pocketgull_api.engines.biophysical_twin_engine import BiophysicalTwinEngine
from pocketgull_api.engines.edge_contactless_biomarkers_engine import ContactlessBiomarkersEngine
from pocketgull_api.engines.deprescribing_sandbox_engine import DeprescribingSandboxEngine
from pocketgull_api.engines.nof1_trial_designer_engine import Nof1TrialDesignerEngine
from pocketgull_api.engines.epigenetic_lineage_engine import EpigeneticLineageEngine

client = TestClient(app)

def test_biophysical_twin_simulation_and_endpoint():
    """Validates 24-hour ODE trajectory simulation and FastAPI route."""
    engine = BiophysicalTwinEngine()
    res = engine.simulate_24h_twin(
        baseline_resting_hr=68.0,
        baseline_rmssd_ms=38.0,
        habitual_wake_hour=6.5,
        habitual_sleep_hour=23.0,
        caffeine_intake_hour=14.0,
        caffeine_mg=150.0,
        resonance_breathing_hour=13.5,
        resonance_breathing_minutes=15.0
    )
    assert res["simulation_horizon_hours"] == 24
    assert len(res["hourly_biophysical_twin"]) == 24
    assert "projected_peak_cognitive_alertness_window" in res["key_physiological_milestones"]
    assert res["key_physiological_milestones"]["bedtime_active_caffeine_mg"] > 0

    # Test HTTP endpoint
    response = client.post("/api/ml/biophysical-twin-simulate", json={
        "baseline_resting_hr": 68.0,
        "baseline_rmssd_ms": 38.0,
        "caffeine_intake_hour": 14.0,
        "caffeine_mg": 150.0
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["hourly_biophysical_twin"]) == 24
    assert "counterfactual_summary" in data

def test_contactless_biomarkers_and_endpoint():
    """Validates optical rPPG pulse extraction and vocal acoustic jitter."""
    engine = ContactlessBiomarkersEngine()
    res = engine.extract_rppg_and_vocal_biomarkers()
    
    assert res["optical_rppg_telemetry"]["estimated_heart_rate_bpm"] > 40.0
    assert res["vocal_acoustic_biomarkers"]["fundamental_frequency_f0_hz"] > 80.0
    assert 0.0 <= res["vocal_acoustic_biomarkers"]["vocal_affective_strain_score"] <= 100.0

    # Test HTTP endpoint
    response = client.post("/api/ml/contactless-biomarkers", json={})
    assert response.status_code == 200
    data = response.json()
    assert "optical_rppg_telemetry" in data
    assert "vocal_acoustic_biomarkers" in data

def test_deprescribing_simulation_and_endpoint():
    """Validates prescribing cascade unwinding and fall risk reductions."""
    engine = DeprescribingSandboxEngine()
    res = engine.simulate_deprescribing(
        current_medications=["Amlodipine", "Furosemide", "Omeprazole", "Diphenhydramine"],
        candidate_deprescribe_drugs=["Furosemide", "Diphenhydramine"],
        patient_age=74.0,
        baseline_egfr=48.0
    )
    assert len(res["regimen_analysis"]["detected_prescribing_cascades"]) >= 1
    assert res["cognitive_and_fall_metrics"]["baseline_anticholinergic_burden_acb"] > res["cognitive_and_fall_metrics"]["simulated_post_taper_acb"]
    assert res["cognitive_and_fall_metrics"]["absolute_fall_risk_reduction_pct"] > 0.0
    assert res["renal_preservation_trajectory"]["projected_1year_egfr_with_taper"] > 48.0

    # Test HTTP endpoint
    response = client.post("/api/ml/deprescribing-simulation", json={
        "current_medications": ["Amlodipine", "Furosemide", "Diphenhydramine"],
        "candidate_deprescribe_drugs": ["Furosemide", "Diphenhydramine"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "detected_prescribing_cascades" in data["regimen_analysis"]
    assert "absolute_fall_risk_reduction_pct" in data["cognitive_and_fall_metrics"]

def test_nof1_trial_design_and_endpoint():
    """Validates personalized N-of-1 trial protocol generation and empirical stats."""
    engine = Nof1TrialDesignerEngine()
    res = engine.design_and_analyze_nof1_trial(
        intervention_name="Resonance Breathing 10 min daily",
        target_outcome_metric="Nocturnal HRV RMSSD (ms)"
    )
    assert "individual_treatment_effect_delta" in res["empirical_statistical_analysis"]
    assert len(res["protocol_schedule"]) == 5
    assert "scientific_verdict" in res

    # Test HTTP endpoint
    response = client.post("/api/ml/nof1-trial-design", json={
        "intervention_name": "Resonance Frequency Breathing 10 min daily",
        "target_outcome_metric": "Nocturnal HRV RMSSD (ms)"
    })
    assert response.status_code == 200
    data = response.json()
    assert "empirical_statistical_analysis" in data
    assert "protocol_schedule" in data

def test_epigenetic_lineage_and_endpoint():
    """Validates 3-generation lineage vulnerability and germline transmission reduction."""
    engine = EpigeneticLineageEngine()
    res = engine.evaluate_lineage_tree(
        g1_grandparent_cardiometabolic_history=True,
        g1_grandparent_toxic_industrial_exposure=True,
        g2_parent_current_edc_burden_score=58.0,
        g2_parent_homocysteine=11.2,
        g2_parent_folate_repletion_active=True,
        days_in_preconception_protocol=45
    )
    assert len(res["3_generation_epigenetic_tree"]) == 3
    assert res["germline_fidelity_metrics"]["relative_risk_reduction_pct"] > 0.0
    assert "clinical_lineage_guidance" in res

    # Test HTTP endpoint
    response = client.post("/api/ml/epigenetic-lineage", json={
        "g1_grandparent_cardiometabolic_history": True,
        "g2_parent_current_edc_burden_score": 58.0,
        "days_in_preconception_protocol": 45
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["3_generation_epigenetic_tree"]) == 3
    assert "germline_fidelity_metrics" in data

def test_clinical_publishing_engine_and_endpoint():
    """Validates patient-centered article generation with SEO and FAQ schema."""
    from pocketgull_api.engines.clinical_publishing_engine import ClinicalPublishingEngine
    engine = ClinicalPublishingEngine()
    res = engine.generate_article("circadian")
    
    assert "wordpress_metadata" in res
    assert "article_markdown_content" in res
    assert "google_faq_json_ld_schema" in res
    assert "Why You Wake Up Tired" in res["wordpress_metadata"]["post_title"]

    # Test HTTP endpoint
    response = client.post("/api/ml/generate-patient-article", json={
        "topic_key": "vagal_coherence"
    })
    assert response.status_code == 200
    data = response.json()
    assert "wordpress_metadata" in data
    assert "The 6-Breaths-Per-Minute Secret" in data["wordpress_metadata"]["post_title"]