"""
Unit tests for Pocket Gull Sovereignty Health Models Sidecar Service
"""

import pytest
from services.sovereignty_health_models_service import (
    PcosModelInput,
    evaluate_pcos_model,
    EndometriosisModelInput,
    evaluate_endometriosis_model,
    PrincetonCadInput,
    evaluate_princeton_cad_model,
    PsaTriageInput,
    evaluate_psa_density_model,
    GahtPkInput,
    simulate_gaht_pk_model,
    ErythrocytosisInput,
    forecast_erythrocytosis_model,
)


def test_pcos_model_classic_phenotype_a():
    inp = PcosModelInput(
        fasting_glucose_mg_dl=95.0,
        fasting_insulin_uu_ml=15.0,
        total_testosterone_ng_dl=65.0,
        shbg_nmol_l=25.0,
        oligo_anovulation=True,
        polycystic_ovary_morphology=True,
        clinical_hyperandrogenism=True,
    )
    out = evaluate_pcos_model(inp)
    assert "Phenotype A" in out.rotterdam_phenotype
    assert out.insulin_resistance_present is True
    assert out.homa_ir_score >= 2.0
    assert any("Myo-Inositol" in r for r in out.recommended_therapeutics)


def test_endometriosis_pelvic_pain_index():
    inp = EndometriosisModelInput(
        dysmenorrhea_scale_0_10=9,
        deep_dyspareunia=True,
        catamenial_dyschezia=True,
        cyclic_bloating_or_nausea=True,
        nsaid_refractory=True,
        family_history_endometriosis=True,
    )
    out = evaluate_endometriosis_model(inp)
    assert out.probability_percentage >= 70.0
    assert "High Suspicion" in out.clinical_risk_tier
    assert len(out.catamenial_indicators) >= 3


def test_princeton_cad_microvascular_model():
    inp = PrincetonCadInput(
        age=58.0,
        iief5_erectile_score=9,
        apob_mg_dl=125.0,
        hs_crp_mg_l=3.2,
        systolic_bp=142.0,
        takes_nitroglycerin=True,
    )
    out = evaluate_princeton_cad_model(inp)
    assert out.endothelial_dysfunction_tier == "Severe Microvascular Disease"
    assert out.pde5_inhibitor_cleared is False
    assert out.hard_stop_contraindication is not None
    assert "FATAL" in out.hard_stop_contraindication


def test_psa_density_biopsy_avoidance():
    # PSA 4.5, prostate volume 50cc -> density 0.09 (<0.15)
    inp = PsaTriageInput(
        total_psa_ng_ml=4.5,
        free_psa_percent=18.0,
        prostate_volume_cc=50.0,
    )
    out = evaluate_psa_density_model(inp)
    assert out.psa_density_ng_ml_cm3 < 0.15
    assert out.biopsy_safely_avoidable is True
    assert "Avoid blind biopsy" in out.clinical_guidance


def test_gaht_pk_simulator():
    inp = GahtPkInput(
        compound="Estradiol Valerate (IM/SubQ)",
        dose_mg=4.0,
        interval_days=7,
    )
    out = simulate_gaht_pk_model(inp)
    assert len(out.simulated_curve) > 10
    assert out.peak_concentration > out.trough_concentration
    assert out.trough_concentration > 0


def test_erythrocytosis_forecaster():
    inp = ErythrocytosisInput(
        baseline_hematocrit=42.0,
        current_hematocrit=54.5,
        months_on_testosterone=6,
        weekly_dose_mg=100.0,
        nocturnal_snoring_or_apnea=True,
    )
    out = forecast_erythrocytosis_model(inp)
    assert out.urgent_phlebotomy_indicated is True
    assert "CRITICAL" in out.clinical_recommendation
