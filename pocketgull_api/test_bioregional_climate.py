"""
Unit tests for Pocket Gull Bioregional Climate, Foodshed Carbon Drawdown & Biodiversity Engine
"""

import pytest
from services.bioregional_climate_service import (
    BioregionalClimateInput,
    evaluate_bioregional_climate_model,
    FoodshedCarbonInput,
    calculate_foodshed_carbon_drawdown,
    NativeBiodiversityInput,
    evaluate_native_biodiversity_model,
)


def test_evaluate_bioregional_climate_cascadia():
    inp = BioregionalClimateInput(
        ecoregion_id="PACIFIC_NORTHWEST_CASCADIA",
        urban_tree_canopy_coverage_pct=35.0,
        ambient_elevation_meters=150.0,
        air_conditioning_type="HEAT_PUMP",
        known_respiratory_cardiac_vulnerability=False,
    )
    out = evaluate_bioregional_climate_model(inp)
    assert out.cardiovascular_heat_strain_tier in ["LOW_RESILIENT", "MODERATE_VIGILANCE"]
    assert out.projected_wildfire_smoke_pm25_days == 16
    assert out.passive_cooling_potential_pct > 40.0
    assert any("merv-13" in r.lower() or "filtration" in r.lower() for r in out.climate_resilience_prescriptions)


def test_evaluate_bioregional_climate_desert_severe():
    inp = BioregionalClimateInput(
        ecoregion_id="SONORAN_DESERT",
        urban_tree_canopy_coverage_pct=8.0,
        ambient_elevation_meters=300.0,
        air_conditioning_type="NONE_PASSIVE",
        known_respiratory_cardiac_vulnerability=True,
    )
    out = evaluate_bioregional_climate_model(inp)
    assert out.cardiovascular_heat_strain_tier == "SEVERE_HEAT_STRESS"
    assert out.projected_dangerous_wet_bulb_days_yearly > 15
    assert any("shade trees" in r.lower() for r in out.climate_resilience_prescriptions)


def test_calculate_foodshed_carbon_drawdown_household():
    inp = FoodshedCarbonInput(
        household_adults_count=2,
        percent_produce_from_local_farms_csa=45.0,
        ancestral_plant_rich_days_per_week=5,
        backyard_or_community_garden_sq_ft=200.0,
    )
    out = calculate_foodshed_carbon_drawdown(inp)
    assert out.household_dietary_co2e_avoidance_kg_yr > 1000.0
    assert out.acres_of_regenerative_soil_sustained > 0.4
    assert out.soil_carbon_drawdown_contribution_lbs_yr > 1500.0
    assert out.foodshed_self_reliance_score > 30.0
    assert len(out.planetary_health_milestones) == 3


def test_evaluate_native_biodiversity_restored():
    inp = NativeBiodiversityInput(
        ecoregion_id="PACIFIC_NORTHWEST_CASCADIA",
        outdoor_space_type="SUBURBAN_YARD",
        weekly_nature_immersion_minutes=150,
    )
    out = evaluate_native_biodiversity_model(inp)
    assert out.biophilic_nature_connection_tier == "RESTORED_EQUILIBRIUM"
    assert out.projected_salivary_cortisol_reduction_pct >= 20.0
    assert len(out.recommended_keystone_plants) >= 2
    assert any("Quercus" in p.botanical_name for p in out.recommended_keystone_plants)
    assert "active hope" in out.biocentric_action_compass.lower()
