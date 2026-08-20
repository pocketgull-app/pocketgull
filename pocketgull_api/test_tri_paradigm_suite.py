"""
Unit and Integration Tests for PocketGull's Tri-Paradigm Integrative Medicine Suite:
1. Traditional Chinese Medicine (TCM) Jing-Luo Meridian & Zang-Fu Engine
2. Ayurvedic Tridosha, 7 Dhatu Tissue, & Agni/Ama Engine
3. Allopathic Molecular Pharmacology & Tri-Paradigm Bridge Engine
"""

from fastapi.testclient import TestClient
from pocketgull_api.main import app
from pocketgull_api.engines.tcm_meridian_engine import TcmMeridianEngine
from pocketgull_api.engines.ayurvedic_tridosha_engine import AyurvedicTridoshaEngine
from pocketgull_api.engines.allopathic_integrative_bridge_engine import AllopathicIntegrativeBridgeEngine

client = TestClient(app)

def test_tcm_meridian_engine_and_endpoint():
    """Validates 5-Element Wu Xing balance, Zang-Fu diagnosis, and Acupoints."""
    engine = TcmMeridianEngine()
    res = engine.evaluate_tcm_profile(
        stress_irritability_level=7.5,
        fatigue_postprandial_heaviness=6.5,
        tongue_body_color="pale_pink_teethmarks",
        tongue_coating="white_greasy",
        radial_pulse_type="wiry_and_slippery"
    )
    assert "wood_liver_gallbladder" in res["wu_xing_5_element_balance"]
    assert len(res["prescribed_acupoint_protocol"]) >= 3
    assert "Xiao Yao San" in res["tcm_diagnostic_summary"]["classical_herbal_formula"]

    # Test HTTP endpoint
    response = client.post("/api/ml/tcm-meridian-evaluate", json={
        "stress_irritability_level": 7.5,
        "fatigue_postprandial_heaviness": 6.5
    })
    assert response.status_code == 200
    data = response.json()
    assert "tcm_diagnostic_summary" in data
    assert "wu_xing_5_element_balance" in data

def test_ayurvedic_tridosha_engine_and_endpoint():
    """Validates Tridosha distribution, 7 Dhatu tissue ladder, and Agni/Ama states."""
    engine = AyurvedicTridoshaEngine()
    res = engine.evaluate_ayurvedic_profile(
        vata_symptoms_score=68.0,
        pitta_symptoms_score=45.0,
        kapha_symptoms_score=35.0,
        tongue_ama_coating="moderate_white",
        energy_stability=5.0
    )
    assert res["tridosha_vikriti_distribution"]["vata_pct"] > 40.0
    assert len(res["seven_dhatu_tissue_cascade"]) == 7
    assert res["ojas_vitality_reserve_score"] > 0
    assert "Ashwagandha" in res["prescribed_rasayana_protocol"]

    # Test HTTP endpoint
    response = client.post("/api/ml/ayurvedic-tridosha-evaluate", json={
        "vata_symptoms_score": 68.0,
        "pitta_symptoms_score": 45.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "tridosha_vikriti_distribution" in data
    assert "metabolic_agni_state" in data
    assert "seven_dhatu_tissue_cascade" in data

def test_allopathic_integrative_bridge_engine_and_endpoint():
    """Validates CYP450 enzyme checking, pharmacodynamic synergy, and hour-by-hour schedules."""
    engine = AllopathicIntegrativeBridgeEngine()
    res = engine.evaluate_tri_paradigm_safety(
        current_allopathic_drugs=["Metformin", "Amlodipine"],
        candidate_tcm_herbs=["Huang Lian (Berberine)"],
        candidate_ayurvedic_rasayanas=["Ashwagandha", "Curcumin (Turmeric)"]
    )
    assert len(res["hour_by_hour_dosing_schedule"]) == 5
    assert len(res["pharmacodynamic_synergies_and_warnings"]) >= 1
    assert "overall_safety_tier" in res

    # Test HTTP endpoint
    response = client.post("/api/ml/allopathic-integrative-bridge", json={
        "current_allopathic_drugs": ["Metformin", "Amlodipine"],
        "candidate_tcm_herbs": ["Huang Lian (Berberine)"],
        "candidate_ayurvedic_rasayanas": ["Ashwagandha"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "cyp450_pharmacokinetic_interactions" in data
    assert "hour_by_hour_dosing_schedule" in data