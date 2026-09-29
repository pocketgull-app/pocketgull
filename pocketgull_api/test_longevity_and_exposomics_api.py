"""
Unit Test Suite for Actuarial QALY & Epigenetic Longevity and Geospatial Exposomics APIs
"""

import pytest  # type: ignore
from services.actuarial_qaly_service import (
    ActuarialQalyInput,
    ActuarialQalyOutput,
    evaluate_actuarial_qaly_engine,
)
from services.exposomics_risk_service import (
    ExposomicsRiskInput,
    ExposomicsRiskOutput,
    evaluate_exposomics_risk_model,
)


def test_actuarial_qaly_engine_baseline():
    payload = ActuarialQalyInput(
        chronological_age=42.5,
        vagal_breathing_mins=15.0,
        chrono_adherence_pct=80.0,
        sleep_efficiency_pct=85.0,
        anti_inflammatory_index=7.5,
        social_co_regulation_hrs=8.0,
        discount_rate_pct=3.0,
    )
    result = evaluate_actuarial_qaly_engine(payload)
    
    assert isinstance(result, ActuarialQalyOutput)
    assert result.chronological_age == 42.5
    assert result.biological_age < 42.5
    assert result.age_delta_years > 0.0
    assert result.epigenetic_pace_of_aging < 1.0
    assert result.projected_lifespan_gain_years > 0.0
    assert result.projected_discounted_qaly_gain > 0.0
    assert result.annual_healthcare_cost_dividend_usd > 0.0
    assert len(result.hazard_horizons) == 5
    assert "GrimAge_DNAm_Pai1_ng_ml" in result.epigenetic_markers_calibrated
    assert len(result.provenance_hash) == 64


def test_actuarial_qaly_engine_optimal_adherence():
    payload = ActuarialQalyInput(
        chronological_age=50.0,
        vagal_breathing_mins=30.0,
        chrono_adherence_pct=100.0,
        sleep_efficiency_pct=95.0,
        anti_inflammatory_index=10.0,
        social_co_regulation_hrs=15.0,
        discount_rate_pct=3.0,
    )
    result = evaluate_actuarial_qaly_engine(payload)
    
    assert result.age_delta_years >= 4.0
    assert result.epigenetic_pace_of_aging <= 0.95
    assert result.projected_undiscounted_qaly_gain > result.projected_discounted_qaly_gain


def test_exposomics_risk_model_clean_air():
    payload = ExposomicsRiskInput(
        pm25_ug_m3=5.0,
        pm10_ug_m3=12.0,
        ozone_ppb=25.0,
        no2_ppb=10.0,
        voc_tvoc_ppb=80.0,
        microplastics_deposition_rate=40.0,
        canopy_cover_pct=50.0,
        baseline_asthma_or_copd=False,
    )
    result = evaluate_exposomics_risk_model(payload)
    
    assert isinstance(result, ExposomicsRiskOutput)
    assert result.composite_toxicity_index < 35.0
    assert "Optimal" in result.air_quality_category or "Clean" in result.air_quality_category or "Moderate" in result.air_quality_category
    assert result.canopy_mitigation_buffering_pct > 15.0
    assert result.provenance_hash.startswith("sha256:")
    assert result.nsf_okn_causal_chain is not None
    assert "USGS" in result.nsf_okn_causal_chain.participating_agencies
    assert "EPA" in result.nsf_okn_causal_chain.participating_agencies


def test_exposomics_risk_model_hazardous_synergy():
    payload = ExposomicsRiskInput(
        pm25_ug_m3=55.0,
        pm10_ug_m3=110.0,
        ozone_ppb=85.0,
        no2_ppb=45.0,
        voc_tvoc_ppb=420.0,
        microplastics_deposition_rate=350.0,
        canopy_cover_pct=10.0,
        baseline_asthma_or_copd=True,
    )
    result = evaluate_exposomics_risk_model(payload)
    
    assert result.composite_toxicity_index >= 50.0
    assert result.pulmonary_oxidative_stress_hazard > 1.50
    assert result.recommended_hepa_cadr_cfm >= 200
    assert len(result.protective_interventions) >= 2
