"""
Pocket Gull — Bioregional Climate, Planetary Health & Carbon Drawdown Engine
FastAPI Sidecar Service

Integrates:
1. Bioregional Climate Vulnerability & Thermal Stress Model:
   - Downscaled IPCC wet-bulb temperature thresholds (Twb >= 31°C).
   - Urban heat island canopy deficit & wildfire smoke PM2.5 exposure days.
   - Cardiovascular heat strain tiers and passive cooling architectural posology.
2. 100-Mile Foodshed & Regenerative Soil Carbon Drawdown Model:
   - Percentage of fresh diet achievable within 100-mile local foodshed.
   - Dietary greenhouse gas (GHG) reduction via ancestral whole-food swaps.
   - Tons of CO2e drawn down annually through supported regenerative acres.
3. Native Keystone Biodiversity & Biophilic Grounding Model:
   - Hyper-local native plant keystone guilds (supporting pollinators, wild bees, birds).
   - Somatic active hope and cortisol reduction via biophilic nature immersion.
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# 1. Bioregional Climate & Thermal Stress Model
# -----------------------------------------------------------------------------
class BioregionalClimateInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    ecoregion_id: str = Field(default="PACIFIC_NORTHWEST_CASCADIA", description="Bioregion identifier, e.g. PACIFIC_NORTHWEST_CASCADIA, SONORAN_DESERT, EASTERN_DECIDUOUS, GREAT_PLAINS")
    urban_tree_canopy_coverage_pct: float = Field(default=22.0, ge=0.0, le=90.0, description="Neighborhood tree canopy percentage")
    ambient_elevation_meters: float = Field(default=120.0, ge=-50.0, le=4500.0, description="Elevation in meters")
    air_conditioning_type: str = Field(default="HEAT_PUMP", description="CENTRAL_AC, HEAT_PUMP, WINDOW_UNIT, or NONE_PASSIVE")
    known_respiratory_cardiac_vulnerability: bool = Field(default=False, description="Asthma, COPD, heart failure, or elderly")


class BioregionalClimateOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    cardiovascular_heat_strain_tier: str = Field(..., description="LOW_RESILIENT, MODERATE_VIGILANCE, or SEVERE_HEAT_STRESS")
    projected_dangerous_wet_bulb_days_yearly: int = Field(..., description="Days with Wet-Bulb Temp >= 29-31°C where sweat cooling is impaired")
    projected_wildfire_smoke_pm25_days: int = Field(..., description="Days with AQI > 100 due to wildfire plume transport")
    passive_cooling_potential_pct: float = Field(..., description="Percentage of summer cooling achievable without grid electricity")
    climate_resilience_prescriptions: List[str] = Field(..., description="Actionable architectural and physiological adaptations")


def evaluate_bioregional_climate_model(data: BioregionalClimateInput) -> BioregionalClimateOutput:
    # Baseline climate risks by ecoregion
    base_wet_bulb_days = 4
    base_smoke_days = 8

    if data.ecoregion_id == "SONORAN_DESERT":
        base_wet_bulb_days = 24
        base_smoke_days = 5
    elif data.ecoregion_id == "PACIFIC_NORTHWEST_CASCADIA":
        base_wet_bulb_days = 6
        base_smoke_days = 16
    elif data.ecoregion_id == "EASTERN_DECIDUOUS":
        base_wet_bulb_days = 14
        base_smoke_days = 7
    elif data.ecoregion_id == "GREAT_PLAINS":
        base_wet_bulb_days = 12
        base_smoke_days = 10
    elif data.ecoregion_id == "MEDITERRANEAN_BASIN":
        base_wet_bulb_days = 18
        base_smoke_days = 12
    elif data.ecoregion_id == "SUB_SAHARAN_SAHEL":
        base_wet_bulb_days = 28
        base_smoke_days = 6
    elif data.ecoregion_id == "SOUTH_ASIAN_MONSOON":
        base_wet_bulb_days = 34
        base_smoke_days = 14
    elif data.ecoregion_id == "ANDEAN_HIGHLANDS":
        base_wet_bulb_days = 2
        base_smoke_days = 4
    elif data.ecoregion_id == "UK_MARITIME_ATLANTIC":
        base_wet_bulb_days = 3
        base_smoke_days = 2

    # Urban heat island effect: Every 10% drop in tree canopy increases microclimate temperature by 1.5°F
    canopy_deficit = max(0.0, 40.0 - data.urban_tree_canopy_coverage_pct)
    adjusted_wet_bulb_days = int(base_wet_bulb_days + (canopy_deficit * 0.25))

    # Elevation relief: ~6.5°C drop per 1000m altitude
    elevation_relief_factor = min(0.4, data.ambient_elevation_meters / 3000.0)
    adjusted_wet_bulb_days = max(1, int(adjusted_wet_bulb_days * (1.0 - elevation_relief_factor)))

    # Heat strain tier
    if adjusted_wet_bulb_days > 16 or (adjusted_wet_bulb_days > 8 and data.known_respiratory_cardiac_vulnerability):
        heat_tier = "SEVERE_HEAT_STRESS"
    elif adjusted_wet_bulb_days > 6:
        heat_tier = "MODERATE_VIGILANCE"
    else:
        heat_tier = "LOW_RESILIENT"

    # Passive cooling potential based on canopy and ventilation
    passive_pot = round(float(np.clip((data.urban_tree_canopy_coverage_pct * 0.8) + (25.0 if data.air_conditioning_type == "HEAT_PUMP" else 15.0), 15.0, 85.0)), 1)

    recs: List[str] = []
    if data.urban_tree_canopy_coverage_pct < 30.0:
        recs.append("Plant shade trees on south and west exposures to reduce solar heat gain into building envelope by 30%.")
    if base_smoke_days > 10:
        recs.append("Assemble a low-cost Corsi-Rosenthal DIY MERV-13 air filtration cube prior to peak late-summer wildfire season.")
    if data.air_conditioning_type in ["NONE_PASSIVE", "WINDOW_UNIT"]:
        recs.append("Implement night-flush cross-ventilation: open windows between 11 PM and 6 AM, close and draw reflective shades by 8 AM.")
    if data.known_respiratory_cardiac_vulnerability:
        recs.append("Establish a neighbor mutual-aid check-in protocol whenever regional heat index exceeds 95°F (35°C).")
    if not recs:
        recs.append("Bioregional thermal resilience is high. Maintain passive shading and community air quality monitoring.")

    return BioregionalClimateOutput(
        cardiovascular_heat_strain_tier=heat_tier,
        projected_dangerous_wet_bulb_days_yearly=adjusted_wet_bulb_days,
        projected_wildfire_smoke_pm25_days=base_smoke_days,
        passive_cooling_potential_pct=passive_pot,
        climate_resilience_prescriptions=recs,
    )


# -----------------------------------------------------------------------------
# 2. 100-Mile Foodshed & Carbon Drawdown Model
# -----------------------------------------------------------------------------
class FoodshedCarbonInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    household_adults_count: int = Field(default=2, ge=1, le=12, description="Number of adults in household")
    percent_produce_from_local_farms_csa: float = Field(default=35.0, ge=0.0, le=100.0, description="Fresh produce sourced within 100 miles %")
    ancestral_plant_rich_days_per_week: int = Field(default=5, ge=0, le=7, description="Days per week eating ancestral plant-rich meals")
    backyard_or_community_garden_sq_ft: float = Field(default=150.0, ge=0.0, le=10000.0, description="Square footage of home or community food growing space")


class FoodshedCarbonOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    foodshed_self_reliance_score: float = Field(..., description="Regional food security resilience index (0-100 scale)")
    household_dietary_co2e_avoidance_kg_yr: float = Field(..., description="Annual greenhouse gas reduction (kg CO2e)")
    soil_carbon_drawdown_contribution_lbs_yr: float = Field(..., description="Atmospheric carbon sequestered via supported regenerative acreage (lbs)")
    acres_of_regenerative_soil_sustained: float = Field(..., description="Total regional farmland acreage financially sustained")
    planetary_health_milestones: List[str] = Field(..., description="Concrete community and culinary impact milestones")


def calculate_foodshed_carbon_drawdown(data: FoodshedCarbonInput) -> FoodshedCarbonOutput:
    # Average Western diet generates ~2,500 kg CO2e per person per year
    # Shifting 5 days/wk to ancestral whole foods (legumes, ancient grains, local greens) saves ~750 kg CO2e/person/yr
    co2e_per_plant_day = 110.0  # kg saved per day/wk over the year per person
    diet_savings = data.household_adults_count * (data.ancestral_plant_rich_days_per_week * co2e_per_plant_day)
    
    # Local food miles savings (replacing 1500-mile industrial freight with <100-mile regional CSA)
    freight_savings = (data.percent_produce_from_local_farms_csa / 100.0) * (data.household_adults_count * 180.0)
    
    # Home garden contribution: each 100 sq ft yields ~75 lbs fresh hyper-local produce with zero transport emissions
    garden_savings = (data.backyard_or_community_garden_sq_ft / 100.0) * 45.0

    total_co2e_avoidance = round(float(diet_savings + freight_savings + garden_savings), 1)

    # Regenerative soil carbon drawdown: 1 acre of healthy living soil with cover crops sequesters 1.5 - 2.5 tons CO2e/yr
    # An average adult eats ~1,500 lbs of food/yr. Sourcing 35% locally sustains ~0.25 acres of local farmland per person
    acres_supported = round(float(data.household_adults_count * (data.percent_produce_from_local_farms_csa / 100.0) * 0.65), 2)
    carbon_drawdown_lbs = round(float(acres_supported * 3500.0), 1)

    # Foodshed self-reliance score
    raw_resilience = (data.percent_produce_from_local_farms_csa * 0.65) + (min(1000.0, data.backyard_or_community_garden_sq_ft) / 1000.0 * 25.0) + (data.ancestral_plant_rich_days_per_week * 2.0)
    resilience_score = round(float(np.clip(raw_resilience, 10.0, 98.0)), 1)

    milestones: List[str] = [
        f"You are actively sustaining {acres_supported} acres of living regenerative topsoil in your regional 100-mile foodshed.",
        f"Your household diet avoids {total_co2e_avoidance} kg of CO2e annually (equivalent to planting {int(total_co2e_avoidance / 22.0)} mature trees).",
        f"Drawing down {carbon_drawdown_lbs} lbs of atmospheric carbon directly into humic glomalin soil structures."
    ]

    return FoodshedCarbonOutput(
        foodshed_self_reliance_score=resilience_score,
        household_dietary_co2e_avoidance_kg_yr=total_co2e_avoidance,
        soil_carbon_drawdown_contribution_lbs_yr=carbon_drawdown_lbs,
        acres_of_regenerative_soil_sustained=acres_supported,
        planetary_health_milestones=milestones,
    )


# -----------------------------------------------------------------------------
# 3. Native Keystone Biodiversity & Biophilic Grounding Model
# -----------------------------------------------------------------------------
class NativeBiodiversityInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    ecoregion_id: str = Field(default="PACIFIC_NORTHWEST_CASCADIA", description="Bioregion code")
    outdoor_space_type: str = Field(default="SUBURBAN_YARD", description="BALCONY_CONTAINER, URBAN_PATIO, SUBURBAN_YARD, or RURAL_ACREAGE")
    weekly_nature_immersion_minutes: int = Field(default=90, ge=0, le=1500, description="Minutes spent in wild or greenspace per week")


class NativePlantGuildItem(BaseModel):
    plant_common_name: str
    botanical_name: str
    ecological_role: str
    caterpillar_pollinator_species_hosted: int
    medicinal_or_culinary_human_use: str


class NativeBiodiversityOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    biophilic_nature_connection_tier: str = Field(..., description="RESTORED_EQUILIBRIUM, NATURE_DEFICIT_MILD, or DEEP_NATURE_DISCONNECTION")
    projected_salivary_cortisol_reduction_pct: float = Field(..., description="Projected drop in stress hormone from 120-min nature rule %")
    recommended_keystone_plants: List[NativePlantGuildItem] = Field(..., description="Top native keystone plants for the user's bioregion")
    biocentric_action_compass: str = Field(..., description="Psychological Active Hope reflection")


def evaluate_native_biodiversity_model(data: NativeBiodiversityInput) -> NativeBiodiversityOutput:
    # White et al. (2019) Nature Scientific Reports: 120 minutes/week in greenspace is the critical threshold for human health
    if data.weekly_nature_immersion_minutes >= 120:
        tier = "RESTORED_EQUILIBRIUM"
        cortisol_drop = round(float(min(32.0, 18.0 + (data.weekly_nature_immersion_minutes / 60.0) * 3.0)), 1)
    elif data.weekly_nature_immersion_minutes >= 60:
        tier = "NATURE_DEFICIT_MILD"
        cortisol_drop = 12.0
    else:
        tier = "DEEP_NATURE_DISCONNECTION"
        cortisol_drop = 4.0

    plants: List[NativePlantGuildItem] = []

    if data.ecoregion_id == "PACIFIC_NORTHWEST_CASCADIA":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Garry Oak / Oregon White Oak",
                botanical_name="Quercus garryana",
                ecological_role="Apex keystone tree for Cascadia savannah ecosystems",
                caterpillar_pollinator_species_hosted=280,
                medicinal_or_culinary_human_use="Leached acorn flour provides nutrient-dense complex carbs and prebiotic starch."
            ),
            NativePlantGuildItem(
                plant_common_name="Blue Elderberry",
                botanical_name="Sambucus cerulea",
                ecological_role="Nectar and berry resource for over 40 native songbird species",
                caterpillar_pollinator_species_hosted=42,
                medicinal_or_culinary_human_use="Anthocyanin-rich berries proven to inhibit viral influenza replication."
            ),
            NativePlantGuildItem(
                plant_common_name="Showy Milkweed",
                botanical_name="Asclepias speciosa",
                ecological_role="Obligate host plant for Western Monarch butterfly caterpillars",
                caterpillar_pollinator_species_hosted=18,
                medicinal_or_culinary_human_use="Attracts native predatory wasps that control garden agricultural pests."
            )
        ]
    elif data.ecoregion_id == "SONORAN_DESERT":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Velvet Mesquite",
                botanical_name="Prosopis velutina",
                ecological_role="Nitrogen-fixing desert keystone providing microclimate shade",
                caterpillar_pollinator_species_hosted=65,
                medicinal_or_culinary_human_use="Low-glycemic sweet pods ground into prebiotic mesquite meal flour."
            ),
            NativePlantGuildItem(
                plant_common_name="Saguaro Cactus",
                botanical_name="Carnegiea gigantea",
                ecological_role="Keystone architectural nesting home for desert birds and pollinators",
                caterpillar_pollinator_species_hosted=30,
                medicinal_or_culinary_human_use="High-antioxidant crimson fruit and seeds traditionally made into syrups."
            )
        ]
    elif data.ecoregion_id == "MEDITERRANEAN_BASIN":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Holm Oak / Cork Oak",
                botanical_name="Quercus ilex",
                ecological_role="Keystone evergreen oak of the Mediterranean dehesa ecosystem",
                caterpillar_pollinator_species_hosted=195,
                medicinal_or_culinary_human_use="Tannin-rich bark astringent; foundational tree preventing regional desertification."
            ),
            NativePlantGuildItem(
                plant_common_name="Wild Rosemary & Thyme Guild",
                botanical_name="Salvia rosmarinus",
                ecological_role="Year-round nectar source for solitary bees and syrphid flies in dry rocky soils",
                caterpillar_pollinator_species_hosted=35,
                medicinal_or_culinary_human_use="Rosmarinic acid and carnosic acid provide neuroprotective cognitive and antioxidant defense."
            )
        ]
    elif data.ecoregion_id == "SUB_SAHARAN_SAHEL":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Faidherbia / White Acacia",
                botanical_name="Faidherbia albida",
                ecological_role="Reverse-phenology nitrogen-fixing tree that feeds soil in dry season without shading crops",
                caterpillar_pollinator_species_hosted=110,
                medicinal_or_culinary_human_use="Nutrient-rich protein pods feed livestock while roots pump nitrogen directly to crops."
            ),
            NativePlantGuildItem(
                plant_common_name="African Baobab",
                botanical_name="Adansonia digitata",
                ecological_role="Water-storing keystone shelter sustaining thousands of bird, bat, and insect species",
                caterpillar_pollinator_species_hosted=85,
                medicinal_or_culinary_human_use="Fruit pulp contains 10x vitamin C of oranges and soluble pectin fiber for gut barrier."
            )
        ]
    elif data.ecoregion_id == "SOUTH_ASIAN_MONSOON":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Sacred Fig / Peepal Tree",
                botanical_name="Ficus religiosa",
                ecological_role="Obligate keystone supporting hundreds of frugivorous birds, bats, and fig wasps",
                caterpillar_pollinator_species_hosted=140,
                medicinal_or_culinary_human_use="Day & night oxygen release; traditional Ayurvedic astringent and glycemic regulator."
            ),
            NativePlantGuildItem(
                plant_common_name="Neem Tree",
                botanical_name="Azadirachta indica",
                ecological_role="Drought-hardy bio-pesticidal canopy deterring locusts and agricultural pests naturally",
                caterpillar_pollinator_species_hosted=55,
                medicinal_or_culinary_human_use="Azadirachtin and nimbin for systemic oral and skin microbiome balancing."
            )
        ]
    elif data.ecoregion_id == "ANDEAN_HIGHLANDS":
        plants = [
            NativePlantGuildItem(
                plant_common_name="Polylepis / Queñua Forest",
                botanical_name="Polylepis racemosa",
                ecological_role="High-altitude cloud forest tree regulating hydrological meltwater for whole mountain basins",
                caterpillar_pollinator_species_hosted=75,
                medicinal_or_culinary_human_use="Hydrological watershed protection sustaining ancient terraced agriculture."
            ),
            NativePlantGuildItem(
                plant_common_name="Ancestral Quinoa & Tarwi Guild",
                botanical_name="Chenopodium quinoa",
                ecological_role="Frost-resilient high-altitude crops preserving alpine soil structure and native bee forage",
                caterpillar_pollinator_species_hosted=32,
                medicinal_or_culinary_human_use="Complete amino acid profile with balanced mineral density resistant to frost and drought."
            )
        ]
    else:  # EASTERN_DECIDUOUS / GENERAL
        plants = [
            NativePlantGuildItem(
                plant_common_name="White Oak",
                botanical_name="Quercus alba",
                ecological_role="The ultimate North American keystone tree supporting whole trophic food webs",
                caterpillar_pollinator_species_hosted=534,
                medicinal_or_culinary_human_use="Shade canopy reduces ground surface temperatures by up to 20°F."
            ),
            NativePlantGuildItem(
                plant_common_name="Purple Coneflower",
                botanical_name="Echinacea purpurea",
                ecological_role="Mid-summer nectar hub for native bumblebees and goldfinches",
                caterpillar_pollinator_species_hosted=24,
                medicinal_or_culinary_human_use="Root alkylamides stimulate macrophage phagocytosis and immune resilience."
            )
        ]

    compass = "ACTIVE HOPE (Joanna Macy): Shift from passive consumer anxiety to an active biocentric participant. Planting a single keystone native shrub or oak sapling begins feeding dozens of migratory species immediately while anchoring you somatically to the soil."

    return NativeBiodiversityOutput(
        biophilic_nature_connection_tier=tier,
        projected_salivary_cortisol_reduction_pct=cortisol_drop,
        recommended_keystone_plants=plants,
        biocentric_action_compass=compass,
    )
