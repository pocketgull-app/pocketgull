"""
Unit tests for Pocket Gull Agronomic, Soil Science & Grocery Stocking Models
"""

import pytest
from services.agronomic_nutrition_service import (
    SoilHealthInput,
    evaluate_soil_health_model,
    FarmPlanningInput,
    plan_farm_crop_portfolio,
    GroceryStockingInput,
    plan_grocery_stocking,
)


def test_evaluate_soil_health_regenerative():
    inp = SoilHealthInput(
        soil_organic_matter_pct=4.8,
        soil_ph=6.4,
        cation_exchange_capacity=22.0,
        fungal_to_bacterial_ratio=1.2,
        tillage_intensity="NO_TILL",
        cover_crop_history_years=5,
    )
    out = evaluate_soil_health_model(inp)
    assert out.regenerative_soil_score >= 75.0
    assert out.mycorrhizal_glomalin_stability_tier == "HIGH_CARBON_STORAGE"
    assert out.trace_mineral_bioavailability_tier == "OPTIMAL"
    assert out.projected_crop_polyphenol_boost_pct > 20.0
    assert out.rhizobial_nitrogen_fixation_credit_lbs_acre > 100.0


def test_evaluate_soil_health_degraded():
    inp = SoilHealthInput(
        soil_organic_matter_pct=1.1,
        soil_ph=5.2,
        cation_exchange_capacity=8.0,
        fungal_to_bacterial_ratio=0.15,
        tillage_intensity="CONVENTIONAL_DEEP_TILL",
        cover_crop_history_years=0,
    )
    out = evaluate_soil_health_model(inp)
    assert out.regenerative_soil_score < 45.0
    assert out.mycorrhizal_glomalin_stability_tier == "DEPLETED"
    assert any("no-till" in r.lower() for r in out.edaphic_amendment_recommendations)
    assert any("limestone" in r.lower() for r in out.edaphic_amendment_recommendations)


def test_plan_farm_crop_portfolio_diabetes():
    inp = FarmPlanningInput(
        usda_hardiness_zone="6b",
        total_tillable_acres=40.0,
        water_availability="MODERATE_IRRIGATION",
        target_community_health_priority="METABOLIC_DIABETES_REVERSAL",
    )
    out = plan_farm_crop_portfolio(inp)
    assert len(out.recommended_crops) >= 3
    assert any("Corn" in c.crop_name or "Sorghum" in c.crop_name for c in out.recommended_crops)
    assert any("Fabaceae" in c.botanical_family for c in out.recommended_crops)
    assert "Three Sisters" in out.polyculture_guild_recommendation
    assert "guaranteed" in out.estimated_clinical_offtake_contracts.lower()


def test_plan_grocery_stocking_community():
    inp = GroceryStockingInput(
        store_type="COMMUNITY_COOP",
        weekly_shopper_volume=1500,
        current_fresh_produce_sku_count=45,
        refrigerated_shelf_footage_linear_ft=50.0,
    )
    out = plan_grocery_stocking(inp)
    assert out.microbiome_diversity_target_met is True
    assert len(out.recommended_produce_portfolio) == 4
    assert out.projected_spoilage_reduction_pct > 15.0
    assert "COMPATIBLE" in out.food_as_medicine_voucher_compatibility
