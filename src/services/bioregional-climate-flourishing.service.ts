import { Injectable } from '@angular/core';

export interface IBioregionalClimateInput {
  ecoregionId: string;
  urbanTreeCanopyCoveragePct: number;
  ambientElevationMeters: number;
  airConditioningType: 'CENTRAL_AC' | 'HEAT_PUMP' | 'WINDOW_UNIT' | 'NONE_PASSIVE';
  knownRespiratoryCardiacVulnerability: boolean;
}

export interface IBioregionalClimateOutput {
  cardiovascularHeatStrainTier: 'LOW_RESILIENT' | 'MODERATE_VIGILANCE' | 'SEVERE_HEAT_STRESS';
  projectedDangerousWetBulbDaysYearly: number;
  projectedWildfireSmokePm25Days: number;
  passiveCoolingPotentialPct: number;
  climateResiliencePrescriptions: string[];
}

export interface IFoodshedCarbonInput {
  householdAdultsCount: number;
  percentProduceFromLocalFarmsCsa: number;
  ancestralPlantRichDaysPerWeek: number;
  backyardOrCommunityGardenSqFt: number;
}

export interface IFoodshedCarbonOutput {
  foodshedSelfRelianceScore: number;
  householdDietaryCo2eAvoidanceKgYr: number;
  soilCarbonDrawdownContributionLbsYr: number;
  acresOfRegenerativeSoilSustained: number;
  planetaryHealthMilestones: string[];
}

export interface INativePlantGuildItem {
  plantCommonName: string;
  botanicalName: string;
  ecologicalRole: string;
  caterpillarPollinatorSpeciesHosted: number;
  medicinalOrCulinaryHumanUse: string;
}

export interface INativeBiodiversityInput {
  ecoregionId: string;
  outdoorSpaceType: 'BALCONY_CONTAINER' | 'URBAN_PATIO' | 'SUBURBAN_YARD' | 'RURAL_ACREAGE';
  weeklyNatureImmersionMinutes: number;
}

export interface INativeBiodiversityOutput {
  biophilicNatureConnectionTier: 'RESTORED_EQUILIBRIUM' | 'NATURE_DEFICIT_MILD' | 'DEEP_NATURE_DISCONNECTION';
  projectedSalivaryCortisolReductionPct: number;
  recommendedKeystonePlants: INativePlantGuildItem[];
  biocentricActionCompass: string;
}

@Injectable({
  providedIn: 'root'
})
export class BioregionalClimateFlourishingService {

  /**
   * 1. Evaluates downscaled wet-bulb thermal strain and wildfire PM2.5 exposure.
   */
  evaluateBioregionalClimate(data: IBioregionalClimateInput): IBioregionalClimateOutput {
    let baseWetBulbDays = 4;
    let baseSmokeDays = 8;

    if (data.ecoregionId === 'SONORAN_DESERT') {
      baseWetBulbDays = 24;
      baseSmokeDays = 5;
    } else if (data.ecoregionId === 'PACIFIC_NORTHWEST_CASCADIA') {
      baseWetBulbDays = 6;
      baseSmokeDays = 16;
    } else if (data.ecoregionId === 'EASTERN_DECIDUOUS') {
      baseWetBulbDays = 14;
      baseSmokeDays = 7;
    } else if (data.ecoregionId === 'GREAT_PLAINS') {
      baseWetBulbDays = 12;
      baseSmokeDays = 10;
    } else if (data.ecoregionId === 'MEDITERRANEAN_BASIN') {
      baseWetBulbDays = 18;
      baseSmokeDays = 12;
    } else if (data.ecoregionId === 'SUB_SAHARAN_SAHEL') {
      baseWetBulbDays = 28;
      baseSmokeDays = 6;
    } else if (data.ecoregionId === 'SOUTH_ASIAN_MONSOON') {
      baseWetBulbDays = 34;
      baseSmokeDays = 14;
    } else if (data.ecoregionId === 'ANDEAN_HIGHLANDS') {
      baseWetBulbDays = 2;
      baseSmokeDays = 4;
    } else if (data.ecoregionId === 'UK_MARITIME_ATLANTIC') {
      baseWetBulbDays = 3;
      baseSmokeDays = 2;
    }

    const canopyDeficit = Math.max(0.0, 40.0 - data.urbanTreeCanopyCoveragePct);
    let adjustedWetBulb = Math.round(baseWetBulbDays + (canopyDeficit * 0.25));

    const elevationRelief = Math.min(0.4, data.ambientElevationMeters / 3000.0);
    adjustedWetBulb = Math.max(1, Math.round(adjustedWetBulb * (1.0 - elevationRelief)));

    let heatTier: 'LOW_RESILIENT' | 'MODERATE_VIGILANCE' | 'SEVERE_HEAT_STRESS' = 'LOW_RESILIENT';
    if (adjustedWetBulb > 16 || (adjustedWetBulb > 8 && data.knownRespiratoryCardiacVulnerability)) {
      heatTier = 'SEVERE_HEAT_STRESS';
    } else if (adjustedWetBulb > 6) {
      heatTier = 'MODERATE_VIGILANCE';
    }

    const passivePot = Math.round(Math.min(85.0, Math.max(15.0, (data.urbanTreeCanopyCoveragePct * 0.8) + (data.airConditioningType === 'HEAT_PUMP' ? 25.0 : 15.0))) * 10) / 10;

    const recs: string[] = [];
    if (data.urbanTreeCanopyCoveragePct < 30.0) {
      recs.push('Plant shade trees on south and west exposures to reduce solar heat gain into building envelope by 30%.');
    }
    if (baseSmokeDays > 10) {
      recs.push('Assemble a low-cost Corsi-Rosenthal DIY MERV-13 air filtration cube prior to peak late-summer wildfire season.');
    }
    if (data.airConditioningType === 'NONE_PASSIVE' || data.airConditioningType === 'WINDOW_UNIT') {
      recs.push('Implement night-flush cross-ventilation: open windows between 11 PM and 6 AM, close and draw reflective shades by 8 AM.');
    }
    if (data.knownRespiratoryCardiacVulnerability) {
      recs.push('Establish a neighbor mutual-aid check-in protocol whenever regional heat index exceeds 95°F (35°C).');
    }
    if (recs.length === 0) {
      recs.push('Bioregional thermal resilience is high. Maintain passive shading and community air quality monitoring.');
    }

    return {
      cardiovascularHeatStrainTier: heatTier,
      projectedDangerousWetBulbDaysYearly: adjustedWetBulb,
      projectedWildfireSmokePm25Days: baseSmokeDays,
      passiveCoolingPotentialPct: passivePot,
      climateResiliencePrescriptions: recs
    };
  }

  /**
   * 2. Calculates 100-mile foodshed self-reliance and household soil carbon drawdown.
   */
  calculateFoodshedCarbonDrawdown(data: IFoodshedCarbonInput): IFoodshedCarbonOutput {
    const dietSavings = data.householdAdultsCount * (data.ancestralPlantRichDaysPerWeek * 110.0);
    const freightSavings = (data.percentProduceFromLocalFarmsCsa / 100.0) * (data.householdAdultsCount * 180.0);
    const gardenSavings = (data.backyardOrCommunityGardenSqFt / 100.0) * 45.0;

    const totalCo2e = Math.round((dietSavings + freightSavings + gardenSavings) * 10) / 10;

    const acresSupported = Math.round((data.householdAdultsCount * (data.percentProduceFromLocalFarmsCsa / 100.0) * 0.65) * 100) / 100;
    const carbonDrawdownLbs = Math.round((acresSupported * 3500.0) * 10) / 10;

    const rawResilience = (data.percentProduceFromLocalFarmsCsa * 0.65) + (Math.min(1000.0, data.backyardOrCommunityGardenSqFt) / 1000.0 * 25.0) + (data.ancestralPlantRichDaysPerWeek * 2.0);
    const resilienceScore = Math.round(Math.min(98.0, Math.max(10.0, rawResilience)) * 10) / 10;

    const milestones: string[] = [
      `You are actively sustaining ${acresSupported} acres of living regenerative topsoil in your regional 100-mile foodshed.`,
      `Your household diet avoids ${totalCo2e} kg of CO2e annually (equivalent to planting ${Math.round(totalCo2e / 22.0)} mature trees).`,
      `Drawing down ${carbonDrawdownLbs} lbs of atmospheric carbon directly into humic glomalin soil structures.`
    ];

    return {
      foodshedSelfRelianceScore: resilienceScore,
      householdDietaryCo2eAvoidanceKgYr: totalCo2e,
      soilCarbonDrawdownContributionLbsYr: carbonDrawdownLbs,
      acresOfRegenerativeSoilSustained: acresSupported,
      planetaryHealthMilestones: milestones
    };
  }

  /**
   * 3. Recommends hyper-local keystone native plant guilds and biophilic stress reduction.
   */
  evaluateNativeBiodiversity(data: INativeBiodiversityInput): INativeBiodiversityOutput {
    let tier: 'RESTORED_EQUILIBRIUM' | 'NATURE_DEFICIT_MILD' | 'DEEP_NATURE_DISCONNECTION' = 'RESTORED_EQUILIBRIUM';
    let cortisolDrop = 18.0;

    if (data.weeklyNatureImmersionMinutes >= 120) {
      tier = 'RESTORED_EQUILIBRIUM';
      cortisolDrop = Math.round(Math.min(32.0, 18.0 + (data.weeklyNatureImmersionMinutes / 60.0) * 3.0) * 10) / 10;
    } else if (data.weeklyNatureImmersionMinutes >= 60) {
      tier = 'NATURE_DEFICIT_MILD';
      cortisolDrop = 12.0;
    } else {
      tier = 'DEEP_NATURE_DISCONNECTION';
      cortisolDrop = 4.0;
    }

    let plants: INativePlantGuildItem[] = [];
    if (data.ecoregionId === 'PACIFIC_NORTHWEST_CASCADIA') {
      plants = [
        {
          plantCommonName: 'Garry Oak / Oregon White Oak',
          botanicalName: 'Quercus garryana',
          ecologicalRole: 'Apex keystone tree for Cascadia savannah ecosystems',
          caterpillarPollinatorSpeciesHosted: 280,
          medicinalOrCulinaryHumanUse: 'Leached acorn flour provides nutrient-dense complex carbs and prebiotic starch.'
        },
        {
          plantCommonName: 'Blue Elderberry',
          botanicalName: 'Sambucus cerulea',
          ecologicalRole: 'Nectar and berry resource for over 40 native songbird species',
          caterpillarPollinatorSpeciesHosted: 42,
          medicinalOrCulinaryHumanUse: 'Anthocyanin-rich berries proven to inhibit viral influenza replication.'
        },
        {
          plantCommonName: 'Showy Milkweed',
          botanicalName: 'Asclepias speciosa',
          ecologicalRole: 'Obligate host plant for Western Monarch butterfly caterpillars',
          caterpillarPollinatorSpeciesHosted: 18,
          medicinalOrCulinaryHumanUse: 'Attracts native predatory wasps that control garden agricultural pests.'
        }
      ];
    } else if (data.ecoregionId === 'SONORAN_DESERT') {
      plants = [
        {
          plantCommonName: 'Velvet Mesquite',
          botanicalName: 'Prosopis velutina',
          ecologicalRole: 'Nitrogen-fixing desert keystone providing microclimate shade',
          caterpillarPollinatorSpeciesHosted: 65,
          medicinalOrCulinaryHumanUse: 'Low-glycemic sweet pods ground into prebiotic mesquite meal flour.'
        },
        {
          plantCommonName: 'Saguaro Cactus',
          botanicalName: 'Carnegiea gigantea',
          ecologicalRole: 'Keystone architectural nesting home for desert birds and pollinators',
          caterpillarPollinatorSpeciesHosted: 30,
          medicinalOrCulinaryHumanUse: 'High-antioxidant crimson fruit and seeds traditionally made into syrups.'
        }
      ];
    } else if (data.ecoregionId === 'MEDITERRANEAN_BASIN') {
      plants = [
        {
          plantCommonName: 'Holm Oak / Cork Oak',
          botanicalName: 'Quercus ilex',
          ecologicalRole: 'Keystone evergreen oak of the Mediterranean dehesa ecosystem',
          caterpillarPollinatorSpeciesHosted: 195,
          medicinalOrCulinaryHumanUse: 'Tannin-rich bark astringent; foundational tree preventing regional desertification.'
        },
        {
          plantCommonName: 'Wild Rosemary & Thyme Guild',
          botanicalName: 'Salvia rosmarinus',
          ecologicalRole: 'Year-round nectar source for solitary bees and syrphid flies in dry rocky soils',
          caterpillarPollinatorSpeciesHosted: 35,
          medicinalOrCulinaryHumanUse: 'Rosmarinic acid and carnosic acid provide neuroprotective cognitive and antioxidant defense.'
        }
      ];
    } else if (data.ecoregionId === 'SUB_SAHARAN_SAHEL') {
      plants = [
        {
          plantCommonName: 'Faidherbia / White Acacia',
          botanicalName: 'Faidherbia albida',
          ecologicalRole: 'Reverse-phenology nitrogen-fixing tree that feeds soil in dry season without shading crops',
          caterpillarPollinatorSpeciesHosted: 110,
          medicinalOrCulinaryHumanUse: 'Nutrient-rich protein pods feed livestock while roots pump nitrogen directly to crops.'
        },
        {
          plantCommonName: 'African Baobab',
          botanicalName: 'Adansonia digitata',
          ecologicalRole: 'Water-storing keystone shelter sustaining thousands of bird, bat, and insect species',
          caterpillarPollinatorSpeciesHosted: 85,
          medicinalOrCulinaryHumanUse: 'Fruit pulp contains 10x vitamin C of oranges and soluble pectin fiber for gut barrier.'
        }
      ];
    } else if (data.ecoregionId === 'SOUTH_ASIAN_MONSOON') {
      plants = [
        {
          plantCommonName: 'Sacred Fig / Peepal Tree',
          botanicalName: 'Ficus religiosa',
          ecologicalRole: 'Obligate keystone supporting hundreds of frugivorous birds, bats, and fig wasps',
          caterpillarPollinatorSpeciesHosted: 140,
          medicinalOrCulinaryHumanUse: 'Day & night oxygen release; traditional Ayurvedic astringent and glycemic regulator.'
        },
        {
          plantCommonName: 'Neem Tree',
          botanicalName: 'Azadirachta indica',
          ecologicalRole: 'Drought-hardy bio-pesticidal canopy deterring locusts and agricultural pests naturally',
          caterpillarPollinatorSpeciesHosted: 55,
          medicinalOrCulinaryHumanUse: 'Azadirachtin and nimbin for systemic oral and skin microbiome balancing.'
        }
      ];
    } else if (data.ecoregionId === 'ANDEAN_HIGHLANDS') {
      plants = [
        {
          plantCommonName: 'Polylepis / Queñua Forest',
          botanicalName: 'Polylepis racemosa',
          ecologicalRole: 'High-altitude cloud forest tree regulating hydrological meltwater for whole mountain basins',
          caterpillarPollinatorSpeciesHosted: 75,
          medicinalOrCulinaryHumanUse: 'Hydrological watershed protection sustaining ancient terraced agriculture.'
        },
        {
          plantCommonName: 'Ancestral Quinoa & Tarwi Guild',
          botanicalName: 'Chenopodium quinoa',
          ecologicalRole: 'Frost-resilient high-altitude crops preserving alpine soil structure and native bee forage',
          caterpillarPollinatorSpeciesHosted: 32,
          medicinalOrCulinaryHumanUse: 'Complete amino acid profile with balanced mineral density resistant to frost and drought.'
        }
      ];
    } else {
      plants = [
        {
          plantCommonName: 'White Oak',
          botanicalName: 'Quercus alba',
          ecologicalRole: 'The ultimate North American keystone tree supporting whole trophic food webs',
          caterpillarPollinatorSpeciesHosted: 534,
          medicinalOrCulinaryHumanUse: 'Shade canopy reduces ground surface temperatures by up to 20°F.'
        },
        {
          plantCommonName: 'Purple Coneflower',
          botanicalName: 'Echinacea purpurea',
          ecologicalRole: 'Mid-summer nectar hub for native bumblebees and goldfinches',
          caterpillarPollinatorSpeciesHosted: 24,
          medicinalOrCulinaryHumanUse: 'Root alkylamides stimulate macrophage phagocytosis and immune resilience.'
        }
      ];
    }

    const compass = 'ACTIVE HOPE (Joanna Macy): Shift from passive consumer anxiety to an active biocentric participant. Planting a single keystone native shrub or oak sapling begins feeding dozens of migratory species immediately while anchoring you somatically to the soil.';

    return {
      biophilicNatureConnectionTier: tier,
      projectedSalivaryCortisolReductionPct: cortisolDrop,
      recommendedKeystonePlants: plants,
      biocentricActionCompass: compass
    };
  }
}
