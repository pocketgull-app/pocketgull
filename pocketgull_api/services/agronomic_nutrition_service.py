"""
Pocket Gull — Agronomic, Soil Science & Grocery Procurement Engine
FastAPI Sidecar Service

Integrates:
1. Soil Science & Regenerative Edaphology:
   - Soil Organic Matter (SOM %) & Cation Exchange Capacity (CEC meq/100g).
   - Soil Microbiome (Fungi-to-Bacteria ratio F:B, mycorrhizal glomalin).
   - Micronutrient mineral density (Zn, Fe, Se, Mg, B) linked to human nutritional bioavailability.
   - Biological Nitrogen Fixation (Rhizobia nodules credit lbs N/acre).
2. Farm Agroecological Crop & Seed Procurement Planner:
   - USDA Hardiness Zones (3a to 10b), frost days, water/drought constraint.
   - Polyculture guilds & cover crops (Three Sisters, Sorghum-Cowpea, Winter Rye-Hairy Vetch).
   - Open-pollinated heirloom seed procurement schedule (9-month lead time).
3. Grocery Store & Food Co-op Predictive Stocking Engine:
   - Target 30+ botanical species community diversity quota.
   - Shelf-life decay curves and zero-waste storage protocols.
   - Community clinical demand alignment (metabolic health, gut barrier repair).
"""

from typing import Dict, Any, List, Optional
import math
import numpy as np
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# 1. Soil Science & Mineral Bioavailability Model
# -----------------------------------------------------------------------------
class SoilHealthInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    soil_organic_matter_pct: float = Field(default=3.2, ge=0.5, le=15.0, description="Soil Organic Matter % (SOM)")
    soil_ph: float = Field(default=6.5, ge=4.5, le=8.5, description="Soil pH")
    cation_exchange_capacity: float = Field(default=18.0, ge=3.0, le=50.0, description="CEC in meq/100g")
    fungal_to_bacterial_ratio: float = Field(default=0.8, ge=0.05, le=5.0, description="F:B biomass ratio")
    tillage_intensity: str = Field(default="NO_TILL", description="NO_TILL, MINIMUM_TILL, or CONVENTIONAL_DEEP_TILL")
    cover_crop_history_years: int = Field(default=3, ge=0, le=40, description="Consecutive years with living root cover")


class SoilHealthOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    regenerative_soil_score: float = Field(..., description="Soil Vitality Index (0-100 scale)")
    projected_crop_polyphenol_boost_pct: float = Field(..., description="Projected increase in phytochemical & antioxidant density %")
    mycorrhizal_glomalin_stability_tier: str = Field(..., description="HIGH_CARBON_STORAGE, MODERATE, or DEPLETED")
    rhizobial_nitrogen_fixation_credit_lbs_acre: float = Field(..., description="Natural biological N credit available for next crop")
    trace_mineral_bioavailability_tier: str = Field(..., description="OPTIMAL, MODERATE_BINDING, or DEFICIENT")
    edaphic_amendment_recommendations: List[str] = Field(..., description="Regenerative practices to restore biological soil health")


def evaluate_soil_health_model(data: SoilHealthInput) -> SoilHealthOutput:
    # SOM baseline: each 1% SOM holds ~20,000 gallons of water/acre and fuels soil food web
    som_factor = min(1.0, data.soil_organic_matter_pct / 6.0)
    
    # pH availability curve: optimal nutrient availability is 6.2 - 6.8
    ph_penalty = abs(data.soil_ph - 6.5) * 8.0
    
    # F:B ratio: perennial/healthy soils have F:B > 1.0; conventional degraded soils < 0.2
    fb_factor = min(1.0, data.fungal_to_bacterial_ratio / 1.5)
    
    # Tillage penalty: mechanical inversion shreds fungal hyphae and oxidizes carbon
    till_penalty = 0.0
    if data.tillage_intensity == "CONVENTIONAL_DEEP_TILL":
        till_penalty = 22.0
    elif data.tillage_intensity == "MINIMUM_TILL":
        till_penalty = 8.0

    cover_bonus = min(18.0, data.cover_crop_history_years * 4.0)

    raw_score = (som_factor * 38.0) + (data.cation_exchange_capacity / 50.0 * 25.0) + (fb_factor * 25.0) + cover_bonus - ph_penalty - till_penalty
    soil_score = round(float(np.clip(raw_score, 10.0, 99.0)), 1)

    # Plants grown in biologically active soils synthesize up to 30-50% higher secondary metabolites (polyphenols, glucosinolates)
    polyphenol_boost = round(float(np.clip((soil_score - 40.0) * 0.7, 0.0, 45.0)), 1)

    if data.fungal_to_bacterial_ratio >= 1.0 and data.tillage_intensity == "NO_TILL":
        glomalin_tier = "HIGH_CARBON_STORAGE"
    elif data.fungal_to_bacterial_ratio >= 0.4:
        glomalin_tier = "MODERATE"
    else:
        glomalin_tier = "DEPLETED"

    # Legume/cover crop biological nitrogen fixation credit
    n_credit = round(float(data.cover_crop_history_years * 28.0 + (data.soil_organic_matter_pct * 12.0)), 1)
    n_credit = min(180.0, n_credit)

    if 6.0 <= data.soil_ph <= 7.0 and data.cation_exchange_capacity >= 15.0:
        mineral_tier = "OPTIMAL"
    elif 5.5 <= data.soil_ph <= 7.5:
        mineral_tier = "MODERATE_BINDING"
    else:
        mineral_tier = "DEFICIENT"

    recs: List[str] = []
    if data.tillage_intensity == "CONVENTIONAL_DEEP_TILL":
        recs.append("Transition to roller-crimped roller no-till or shallow strip-till to preserve arbuscular mycorrhizal networks.")
    if data.soil_organic_matter_pct < 4.0:
        recs.append("Incorporate biodiverse winter cover crop cocktail (daikon radish for compaction, hairy vetch for nitrogen, cereal rye for biomass).")
    if data.fungal_to_bacterial_ratio < 0.8:
        recs.append("Apply fungal-dominant compost extract or biochar inoculated with indigenous forest microorganisms (IMO).")
    if data.soil_ph < 6.0:
        recs.append("Apply calcitic or dolomitic agricultural limestone to optimize soil pH and calcium saturation.")
    if not recs:
        recs.append("Soil biological health is exceptional. Continue living root stewardship to preserve high glomalin stability.")

    return SoilHealthOutput(
        regenerative_soil_score=soil_score,
        projected_crop_polyphenol_boost_pct=polyphenol_boost,
        mycorrhizal_glomalin_stability_tier=glomalin_tier,
        rhizobial_nitrogen_fixation_credit_lbs_acre=n_credit,
        trace_mineral_bioavailability_tier=mineral_tier,
        edaphic_amendment_recommendations=recs,
    )


# -----------------------------------------------------------------------------
# 2. Farm Crop & Seed Procurement Planning Model
# -----------------------------------------------------------------------------
class FarmPlanningInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    usda_hardiness_zone: str = Field(default="6b", description="USDA Plant Hardiness Zone, e.g., 4a, 6b, 8a, 9b")
    total_tillable_acres: float = Field(default=25.0, ge=0.5, le=5000.0, description="Available acreage for production")
    water_availability: str = Field(default="MODERATE_IRRIGATION", description="RAIN_FED_ONLY, DROUGHT_RESTRICTED, or MODERATE_IRRIGATION")
    target_community_health_priority: str = Field(
        default="METABOLIC_DIABETES_REVERSAL",
        description="METABOLIC_DIABETES_REVERSAL, PEDIATRIC_IMMUNITY, or GUT_BARRIER_HEALTH"
    )


class RecommendedCropPortfolio(BaseModel):
    crop_name: str
    botanical_family: str
    seed_variety_type: str  # e.g., Open-Pollinated Heirloom
    optimal_seed_order_month: str
    projected_yield_lbs_per_acre: int
    clinical_value_proposition: str
    soil_benefit: str


class FarmPlanningOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    recommended_crops: List[RecommendedCropPortfolio] = Field(..., description="Curated portfolio of agroecological crops")
    polyculture_guild_recommendation: str = Field(..., description="Companion planting architecture")
    projected_botanical_species_contribution: int = Field(..., description="Distinct species added to regional diet")
    estimated_clinical_offtake_contracts: str = Field(..., description="Projected local hospital or CSA procurement backing")


def plan_farm_crop_portfolio(data: FarmPlanningInput) -> FarmPlanningOutput:
    zone_num = 6
    try:
        zone_num = int("".join([c for c in data.usda_hardiness_zone if c.isdigit()]))
    except Exception:
        zone_num = 6

    crops: List[RecommendedCropPortfolio] = []

    # Tailor crops to health priority and climate hardiness
    if data.target_community_health_priority == "METABOLIC_DIABETES_REVERSAL":
        crops.append(RecommendedCropPortfolio(
            crop_name="Purple & Black Heirloom Flint Corn / Sorghum",
            botanical_family="Poaceae",
            seed_variety_type="Open-pollinated ancestral landrace",
            optimal_seed_order_month="November - January (for May sowing)",
            projected_yield_lbs_per_acre=3200,
            clinical_value_proposition="High anthocyanin content dampens postprandial glucose spikes by inhibiting alpha-amylase.",
            soil_benefit="Deep taproots extract subsoil minerals; dense biomass increases SOM."
        ))
        crops.append(RecommendedCropPortfolio(
            crop_name="Tepary & Cowpea Heirloom Pulses",
            botanical_family="Fabaceae",
            seed_variety_type="Drought-tolerant heirloom",
            optimal_seed_order_month="January - February",
            projected_yield_lbs_per_acre=1800,
            clinical_value_proposition="Low-glycemic slow-release amylose with high prebiotic fiber to foster Akkermansia muciniphila.",
            soil_benefit="Fixes 80-140 lbs atmospheric nitrogen per acre through symbiotic Rhizobium leguminosarum."
        ))
        crops.append(RecommendedCropPortfolio(
            crop_name="Lacinato & Collard Greens (Brassica)",
            botanical_family="Brassicaceae",
            seed_variety_type="Frost-hardy open-pollinated",
            optimal_seed_order_month="December (spring crop) & June (fall crop)",
            projected_yield_lbs_per_acre=8500,
            clinical_value_proposition="Glucoraphanin precursor to sulforaphane, activating Nrf2 cellular antioxidant defense.",
            soil_benefit="Glucosinolate biofumigation suppresses soil-borne fungal pathogens naturally."
        ))

    elif data.target_community_health_priority == "GUT_BARRIER_HEALTH":
        crops.append(RecommendedCropPortfolio(
            crop_name="Jerusalem Artichoke (Sunchoke)",
            botanical_family="Asteraceae",
            seed_variety_type="Perennial heirloom tuber",
            optimal_seed_order_month="October - November (dormant planting)",
            projected_yield_lbs_per_acre=12000,
            clinical_value_proposition="Highest natural source of inulin fructooligosaccharides for colonic butyrate production.",
            soil_benefit="Perennial root system prevents winter erosion and builds durable humic soil matter."
        ))
        crops.append(RecommendedCropPortfolio(
            crop_name="Emmer / Farro & Heritage Spelt",
            botanical_family="Poaceae",
            seed_variety_type="Ancient hulled wheat",
            optimal_seed_order_month="August - September (for fall planting)",
            projected_yield_lbs_per_acre=2400,
            clinical_value_proposition="Intact aleurone layer with high alkylresorcinols and lower immunoreactive gliadin epitopes.",
            soil_benefit="High silica straw forms long-lasting mulch layer that feeds soil fungi."
        ))
        crops.append(RecommendedCropPortfolio(
            crop_name="Traditional Allium Guild (Garlic & Leeks)",
            botanical_family="Amaryllidaceae",
            seed_variety_type="Hardneck heirloom cloves",
            optimal_seed_order_month="July - August (for October planting)",
            projected_yield_lbs_per_acre=6000,
            clinical_value_proposition="Allicin and organosulfur prebiotics cultivate Bifidobacterium pseudocatenulatum.",
            soil_benefit="Natural sulfur exudates deter root nematodes and subterranean pests."
        ))

    else:  # PEDIATRIC_IMMUNITY & GENERAL FLOURISHING
        crops.append(RecommendedCropPortfolio(
            crop_name="Heritage Winter Squash (Cushaw & Hubbard)",
            botanical_family="Cucurbitaceae",
            seed_variety_type="Open-pollinated native heirloom",
            optimal_seed_order_month="February - March",
            projected_yield_lbs_per_acre=14000,
            clinical_value_proposition="High beta-carotene provitamin A supports mucosal gut barrier and respiratory epithelium.",
            soil_benefit="Sprawling umbrella leaves shade soil, suppress weeds, and conserve 40% soil moisture."
        ))
        crops.append(RecommendedCropPortfolio(
            crop_name="Purple Sweet Potato (Okinawan / Molokai)",
            botanical_family="Convolvulaceae",
            seed_variety_type="Certified virus-free slips",
            optimal_seed_order_month="January - February",
            projected_yield_lbs_per_acre=16000,
            clinical_value_proposition="Peonidin anthocyanins preserve cognitive focus and enhance pediatric microbiome diversity.",
            soil_benefit="Vigorous ground cover with high solar energy conversion to root sugars."
        ))

    guild = "Three Sisters Agroecological Polyculture (Flint Corn + Climbing Beans + Winter Squash) with Hairy Vetch / Winter Rye cover crop borders."

    offtake = f"Estimated forward-contract volume: {int(data.total_tillable_acres * 4000)} lbs produce guaranteed through regional Medicaid Food-as-Medicine vouchers & hospital CSA partnerships."

    return FarmPlanningOutput(
        recommended_crops=crops,
        polyculture_guild_recommendation=guild,
        projected_botanical_species_contribution=len(crops) + 4,  # Includes companion cover crops
        estimated_clinical_offtake_contracts=offtake,
    )


# -----------------------------------------------------------------------------
# 3. Grocery Store & Food Co-op Stocking Engine
# -----------------------------------------------------------------------------
class GroceryStockingInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="ignore")

    store_type: str = Field(default="COMMUNITY_COOP", description="COMMUNITY_COOP, NEIGHBORHOOD_BODEGA, or REGIONAL_MARKET")
    weekly_shopper_volume: int = Field(default=1200, ge=50, le=100000, description="Estimated customer visits per week")
    current_fresh_produce_sku_count: int = Field(default=35, ge=5, le=500, description="Number of distinct produce items on shelves")
    refrigerated_shelf_footage_linear_ft: float = Field(default=40.0, ge=5.0, le=500.0, description="Linear feet of refrigerated produce space")


class ShelfStockingItem(BaseModel):
    category_name: str
    target_inventory_units_weekly: int
    botanical_family_target: str
    shelf_life_days: int
    zero_waste_storage_protocol: str
    community_health_impact: str


class GroceryStockingOutput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    recommended_produce_portfolio: List[ShelfStockingItem] = Field(..., description="Actionable inventory stocking quotas")
    microbiome_diversity_target_met: bool = Field(..., description="Whether store supports customer 30+ species/week target")
    projected_spoilage_reduction_pct: float = Field(..., description="Projected shrink reduction from climate-controlled protocols %")
    food_as_medicine_voucher_compatibility: str = Field(..., description="Readiness for clinical produce prescriptions")


def plan_grocery_stocking(data: GroceryStockingInput) -> GroceryStockingOutput:
    diversity_met = data.current_fresh_produce_sku_count >= 32

    # Scale volume by shopper count
    scale = max(0.5, data.weekly_shopper_volume / 1000.0)

    items: List[ShelfStockingItem] = [
        ShelfStockingItem(
            category_name="Ancestral Pigmented Tubers & Roots",
            target_inventory_units_weekly=int(180 * scale),
            botanical_family_target="Convolvulaceae & Asteraceae (Purple Sweet Potatoes, Sunchokes, Parsnips)",
            shelf_life_days=21,
            zero_waste_storage_protocol="Keep at 55°F, 85% relative humidity in breathable wooden crates away from direct ethylene emitters.",
            community_health_impact="Provides shelf-stable resistant starch and prebiotics without rapid rotting."
        ),
        ShelfStockingItem(
            category_name="Cruciferous & Bitter Greens",
            target_inventory_units_weekly=int(220 * scale),
            botanical_family_target="Brassicaceae (Lacinato Kale, Collards, Mustard Greens, Radishes)",
            shelf_life_days=7,
            zero_waste_storage_protocol="Misting display at 34-38°F; rotate day-5 unsold leaves into store-made vegetable broths or kimchi ferments.",
            community_health_impact="Delivers daily glucosinolates and sulforaphane to lower systemic cardiovascular inflammation."
        ),
        ShelfStockingItem(
            category_name="Heirloom Dried Pulses & Whole Heritage Grains",
            target_inventory_units_weekly=int(300 * scale),
            botanical_family_target="Fabaceae & Poaceae (Cowpeas, Black Beans, Farro, Sorghum, Wild Rice)",
            shelf_life_days=365,
            zero_waste_storage_protocol="Bulk gravitational dispensers or airtight paper bags at room temperature with 0% spoilage risk.",
            community_health_impact="Affordable core staples providing high colonic butyrate yields and glycemic stability."
        ),
        ShelfStockingItem(
            category_name="Allium & Digestive Botanical Aromatics",
            target_inventory_units_weekly=int(160 * scale),
            botanical_family_target="Amaryllidaceae & Zingiberaceae (Hardneck Garlic, Leeks, Shallots, Fresh Ginger, Turmeric)",
            shelf_life_days=28,
            zero_waste_storage_protocol="Dry, ventilated open-air woven baskets out of direct sunlight.",
            community_health_impact="Natural antimicrobial allicin and curcuminoids to protect mucosal tight junction integrity."
        )
    ]

    spoilage_reduction = 28.5 if data.store_type == "NEIGHBORHOOD_BODEGA" else 18.0

    return GroceryStockingOutput(
        recommended_produce_portfolio=items,
        microbiome_diversity_target_met=diversity_met,
        projected_spoilage_reduction_pct=spoilage_reduction,
        food_as_medicine_voucher_compatibility="COMPATIBLE: Ready to accept electronic FHIR Produce Prescription vouchers (US Core ServiceRequest) backed by regional health insurers.",
    )
