"""
Unit tests for Food Inflation & Dietary Stockout ML Model Service in pocketgull_api.
"""

import pytest
from services.food_inflation_predictive_model_service import (
    FoodInflationRiskInput,
    FoodInflationRiskOutput,
    evaluate_food_inflation_risk_model,
)

def test_evaluate_berries_inflation_and_swap():
    data = FoodInflationRiskInput(
        category="Fresh Berries (Blackberries / Raspberries)",
        current_retail_cost_usd=5.49,
        regional_transport_miles=1200.0,
        energy_input_index=1.2,
        import_dependency_pct=50.0,
        dietary_restriction="ALL",
    )
    result = evaluate_food_inflation_risk_model(data)
    assert isinstance(result, FoodInflationRiskOutput)
    assert "Blueberries" in result.optimal_frugal_swap
    assert result.swap_cost_usd < data.current_retail_cost_usd
    assert result.projected_monthly_savings_usd > 50.0
    assert result.stockout_vulnerability_score > 0
    assert result.dietary_safety_confirmed is True

def test_evaluate_salmon_vegan_restriction_swap():
    data = FoodInflationRiskInput(
        category="Wild Sockeye Salmon Fillet",
        current_retail_cost_usd=7.99,
        regional_transport_miles=1800.0,
        energy_input_index=1.3,
        import_dependency_pct=60.0,
        dietary_restriction="VEGAN_PLANT_BASED",
    )
    result = evaluate_food_inflation_risk_model(data)
    assert isinstance(result, FoodInflationRiskOutput)
    assert "Lentils" in result.optimal_frugal_swap
    assert "Chia" in result.optimal_frugal_swap
    assert result.swap_cost_usd == 0.38
    assert result.dietary_safety_confirmed is True
    assert "zero fish antigen" in result.dietary_rationale

def test_evaluate_salmon_omnivore_swap():
    data = FoodInflationRiskInput(
        category="Wild Sockeye Salmon Fillet",
        current_retail_cost_usd=7.99,
        regional_transport_miles=1800.0,
        energy_input_index=1.3,
        import_dependency_pct=60.0,
        dietary_restriction="ALL",
    )
    result = evaluate_food_inflation_risk_model(data)
    assert "Sardines" in result.optimal_frugal_swap
    assert result.swap_cost_usd == 1.40
    assert result.dietary_safety_confirmed is True

def test_evaluate_nut_free_butter_swap():
    data = FoodInflationRiskInput(
        category="Artisanal Raw Almond Butter",
        current_retail_cost_usd=4.20,
        regional_transport_miles=900.0,
        energy_input_index=1.1,
        import_dependency_pct=25.0,
        dietary_restriction="NUT_FREE",
    )
    result = evaluate_food_inflation_risk_model(data)
    assert "Sunflower" in result.optimal_frugal_swap
    assert result.dietary_safety_confirmed is True
    assert "Tree Nut and Peanut-free" in result.dietary_rationale
