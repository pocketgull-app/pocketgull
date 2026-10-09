import { Injectable } from '@angular/core';

export interface ISeasonalHarvestItem {
  id: string;
  name: string;
  scientificName: string;
  peakMonths: number[]; // 1-12
  isCurrentlyInPeak: boolean;
  phytonutrientHighlight: string;
  clinicalTargetBenefit: string;
  estimatedRetailPriceIndex: 'Low / Peak Abundance' | 'Moderate' | 'High / Early Season';
  storageRecommendation: string;
  culinarySynergy: string;
}

export interface IRegionalSeasonalCalendar {
  regionId: string;
  regionName: string;
  currentMonth: number;
  currentMonthName: string;
  harvestItems: ISeasonalHarvestItem[];
  seasonalAdvice: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonalHarvestStockingCalendarService {
  private readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Retrieves the dynamic seasonal calendar and peak produce schedule for a destination foodshed
   */
  getSeasonalCalendar(cityId: string, monthOverride?: number): IRegionalSeasonalCalendar {
    const currentMonth = monthOverride !== undefined ? monthOverride : (new Date().getMonth() + 1);
    const monthName = this.monthNames[currentMonth - 1];

    const allItems = this.getHarvestDataForCity(cityId);
    const harvestItems: ISeasonalHarvestItem[] = allItems.map(item => ({
      ...item,
      isCurrentlyInPeak: item.peakMonths.includes(currentMonth),
      estimatedRetailPriceIndex: item.peakMonths.includes(currentMonth) ? 'Low / Peak Abundance' : 'Moderate'
    }));

    const peakCount = harvestItems.filter(i => i.isCurrentlyInPeak).length;
    const advice = peakCount > 0
      ? `${peakCount} local crops are currently in peak harvest this month (${monthName}) in this foodshed. Retail prices at co-ops and farm stands are at their seasonal low, with maximum polyphenol concentrations.`
      : `Transition season in ${monthName}. Focus on cellar-stored root crops, fermented heritage staples, and greenhouse cold-hardy greens.`;

    return {
      regionId: cityId,
      regionName: this.getCityDisplayName(cityId),
      currentMonth,
      currentMonthName: monthName,
      harvestItems,
      seasonalAdvice: advice
    };
  }

  private getCityDisplayName(cityId: string): string {
    switch (cityId) {
      case 'dest_ojai': return 'Ojai Valley, California';
      case 'dest_slo': return 'San Luis Obispo & Central Coast, California';
      case 'dest_sequim': return 'Sequim & Olympic Peninsula, Washington';
      case 'dest_dhs': return 'Desert Hot Springs & Coachella Valley, California';
      case 'dest_loma_linda': return 'Loma Linda Inland Empire, California';
      case 'dest_nicoya': return 'Nicoya Peninsula, Costa Rica';
      case 'dest_lewiston': return 'Lewiston & Androscoggin River, Maine';
      case 'dest_sahel_dakar': return 'Sahel & West Africa Agroecological Foodshed (Senegal/Mali/Niger)';
      case 'dest_ethiopia_highlands': return 'Horn of Africa & Ethiopian Highlands (Addis/Rift Valley)';
      default: return 'Regional Foodshed';
    }
  }

  private getHarvestDataForCity(cityId: string): Omit<ISeasonalHarvestItem, 'isCurrentlyInPeak' | 'estimatedRetailPriceIndex'>[] {
    switch (cityId) {
      case 'dest_sahel_dakar':
        return [
          {
            id: 'sahel_fonio',
            name: 'White Fonio (Acha)',
            scientificName: 'Digitaria exilis',
            peakMonths: [8, 9, 10, 11], // Post-monsoon Sahelian harvest
            phytonutrientHighlight: 'Low glycemic index (GI 49), methionine, cystine, leucine, prebiotic fiber',
            clinicalTargetBenefit: 'Metabolic disease reversal, diabetes insulin sensitivity, liver glutathione regeneration, and celiac gut healing (100% gluten-free).',
            storageRecommendation: 'Thoroughly dried whole grains store safely in earthenware or sealed containers for over 2 years without pest damage.',
            culinarySynergy: 'Steam as a fluffy couscous substitute; pair with moringa leaf sauce and slow-simmered cowpea stew.'
          },
          {
            id: 'sahel_moringa',
            name: 'Moringa Oleifera ("The Miracle Tree")',
            scientificName: 'Moringa oleifera',
            peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Year-round arid perennial foliage
            phytonutrientHighlight: '7x vitamin C of oranges, 4x calcium of milk, 3x potassium of bananas, quercetin, chlorogenic acid',
            clinicalTargetBenefit: 'Pediatric micronutrient fortification, postpartum galactagogue, endothelial antioxidant buffering, and postprandial glucose blunting.',
            storageRecommendation: 'Dry freshly picked leaves in gentle shade to preserve chlorophyll and polyphenols; grind into fine green powder.',
            culinarySynergy: 'Stir 1-2 tsp fresh or powdered moringa into vegetable stews, fonio porridge, or warm infusions at the end of cooking.'
          },
          {
            id: 'sahel_cowpeas',
            name: 'Cowpeas & Bambara Groundnut (Niebe)',
            scientificName: 'Vigna unguiculata / Vigna subterranea',
            peakMonths: [9, 10, 11, 12], // Dry season legume harvest
            phytonutrientHighlight: '24% bioavailable plant protein, resistant starch, soluble pectin, polyphenolic anthocyanins',
            clinicalTargetBenefit: 'Satiety regulation, colonic short-chain fatty acid (butyrate) synthesis, and blood lipid optimization; fixes living nitrogen into arid soils.',
            storageRecommendation: 'Sun-dry thoroughly with a dusting of clean wood ash to naturally deter weevils; store in dry clay silos.',
            culinarySynergy: 'Simmer with heirloom onions, tomatoes, and ground baobab fruit for a complete plant protein profile.'
          },
          {
            id: 'sahel_baobab',
            name: 'Baobab Fruit Pulp ("Tree of Life")',
            scientificName: 'Adansonia digitata',
            peakMonths: [12, 1, 2, 3, 4], // Ripens and dries naturally on tree branches
            phytonutrientHighlight: '50% dietary fiber (75% soluble prebiotic pectin), 6x vitamin C of citrus, calcium, potassium, magnesium',
            clinicalTargetBenefit: 'Microbiome prebiotic bifurcation (Akkermansia and Bifidobacteria bloom), immune barrier reinforcement, and electrolyte rehydration.',
            storageRecommendation: 'Naturally dry within its woody shell; pound dry pulp into powder. Shelf-stable at room temperature for 3 years.',
            culinarySynergy: 'Dissolve 1 tbsp into cold water, clean goat milk, or hibiscus infusion (Bissap) for an unheated probiotic elixir.'
          }
        ];

      case 'dest_ethiopia_highlands':
        return [
          {
            id: 'ethiopia_teff',
            name: 'Ivory & Brown Teff',
            scientificName: 'Eragrostis tef',
            peakMonths: [10, 11, 12, 1], // Post-Meher seasonal harvest
            phytonutrientHighlight: 'High bioavailable non-heme iron (15mg/100g), calcium (180mg/100g), 8 essential amino acids, slow-release prebiotic resistant starch',
            clinicalTargetBenefit: 'Severe microcytic anemia resolution, pregnancy red-cell mass expansion, microbiome butyrate fermentation, and steady glycemic curve.',
            storageRecommendation: 'Tiny grain size resists storage pests; keep in dry ventilated granaries.',
            culinarySynergy: 'Ferment with wild yeasts for 72 hours into sourdough Injera flatbread, enhancing zinc and iron bioavailability.'
          },
          {
            id: 'ethiopia_sorghum',
            name: 'Heirloom Bicolor Sorghum',
            scientificName: 'Sorghum bicolor',
            peakMonths: [11, 12, 1], // Late autumn harvest
            phytonutrientHighlight: '3-deoxyanthocyanidins, condensed tannins, insoluble fiber, policosanols',
            clinicalTargetBenefit: 'Profound antioxidant capacity surpassing blueberries; slows starch digestibility, preventing insulin resistance and metabolic surge.',
            storageRecommendation: 'Store unhulled grain in sealed earthenware urns in a cool pantry.',
            culinarySynergy: 'Coarsely crack and simmer into warming breakfast porridge or blend into sourdough flatbreads.'
          }
        ];
      case 'dest_ojai':
        return [
          {
            id: 'ojai_pixie',
            name: 'Ojai Pixie Tangerines',
            scientificName: 'Citrus reticulata',
            peakMonths: [3, 4, 5], // March - May
            phytonutrientHighlight: 'High hesperidin, naringenin, and ascorbic acid',
            clinicalTargetBenefit: 'Vascular endothelial resilience and downregulation of mast cell histamine release.',
            storageRecommendation: 'Room temperature for 1 week; crisper drawer for up to 3 weeks.',
            culinarySynergy: 'Pair with cold-pressed olive oil, fennel bulb, and walnuts in raw salads.'
          },
          {
            id: 'ojai_mission_olive',
            name: 'Early Harvest Mission Olives & Oil',
            scientificName: 'Olea europaea',
            peakMonths: [10, 11, 12], // Oct - Dec
            phytonutrientHighlight: 'Oleocanthal, oleuropein, hydroxytyrosol',
            clinicalTargetBenefit: 'Natural COX-1 and COX-2 inhibition for neuroinflammatory pain modulation.',
            storageRecommendation: 'Dark glass bottle in a cool dark pantry away from heat sources.',
            culinarySynergy: 'Drizzle over steamed bitter greens and roasted vegetables post-cooking.'
          },
          {
            id: 'ojai_avocado',
            name: 'Haas & Fuerte Heirloom Avocados',
            scientificName: 'Persea americana',
            peakMonths: [1, 2, 3, 4, 5, 6, 7, 8],
            phytonutrientHighlight: 'Monounsaturated oleic acid, beta-sitosterol, lutein',
            clinicalTargetBenefit: 'Lipid transport optimization and ocular macular protection.',
            storageRecommendation: 'Ripen at room temp; once yield occurs, store whole in refrigerator.',
            culinarySynergy: 'Mash with lime juice and sea salt as an anti-inflammatory fat base.'
          }
        ];

      case 'dest_slo':
        return [
          {
            id: 'slo_artichoke',
            name: 'Castroville & Coastal Green Globe Artichokes',
            scientificName: 'Cynara cardunculus var. scolymus',
            peakMonths: [3, 4, 5, 9, 10], // Spring & Autumn peaks
            phytonutrientHighlight: 'Inulin prebiotic fructans, cynarin, luteolin',
            clinicalTargetBenefit: 'Stimulates bile acid flow, hepatic phase II detoxification, and bifidobacterial colonization.',
            storageRecommendation: 'Refrigerate in a perforated produce bag with stems trimmed.',
            culinarySynergy: 'Steam whole with Meyer lemon and dip in garlic-infused olive oil.'
          },
          {
            id: 'slo_pinquito',
            name: 'Santa Maria Heirloom Pinquito Beans',
            scientificName: 'Phaseolus vulgaris',
            peakMonths: [8, 9, 10, 11], // Late Summer/Fall harvest
            phytonutrientHighlight: 'High resistant starch type 3, molybdenum, folate',
            clinicalTargetBenefit: 'Colonic butyrate hyper-production to heal intestinal epithelial tight junctions.',
            storageRecommendation: 'Airtight dry mason jar away from sunlight for up to 2 years.',
            culinarySynergy: 'Slow-simmer with organic rosemary, sweet onions, and kelp.'
          },
          {
            id: 'slo_purple_cauliflower',
            name: 'Coastal Purple Sprouting Brassica',
            scientificName: 'Brassica oleracea var. botrytis',
            peakMonths: [11, 12, 1, 2, 3], // Winter coastal crop
            phytonutrientHighlight: 'Sulforaphane, glucoraphanin, anthocyanins',
            clinicalTargetBenefit: 'Nrf2 cellular pathway activation and epigenetic antioxidant defense.',
            storageRecommendation: 'Refrigerate wrapped in a damp cloth in produce bin.',
            culinarySynergy: 'Lightly roast with mustard seeds and cold-pressed sesame oil.'
          }
        ];

      case 'dest_sequim':
        return [
          {
            id: 'seq_morel',
            name: 'Olympic Forest Morel Mushrooms',
            scientificName: 'Morchella esculenta',
            peakMonths: [4, 5, 6], // Spring Olympic rain-shadow
            phytonutrientHighlight: 'Beta-glucans, ergosterol (pre-Vitamin D2), selenium',
            clinicalTargetBenefit: 'Immune natural killer (NK) cell activation and gut-associated lymphoid tissue priming.',
            storageRecommendation: 'Store dry in paper bag in refrigerator; never store in airtight plastic.',
            culinarySynergy: 'Sauté gently in ghee or olive oil with wild thyme.'
          },
          {
            id: 'seq_huckleberry',
            name: 'Wild Cascade Mountain Huckleberries',
            scientificName: 'Vaccinium membranaceum',
            peakMonths: [7, 8, 9], // Summer into early fall
            phytonutrientHighlight: 'Cyanidin-3-glucoside, malvidin, proanthocyanidins',
            clinicalTargetBenefit: 'Microvascular capillary protection and reduction of neuro-oxidative stress.',
            storageRecommendation: 'Freeze on baking sheet, then transfer to freezer container.',
            culinarySynergy: 'Blend raw into chia puddings or simmer into an unsweetened reduction.'
          },
          {
            id: 'seq_crab',
            name: 'Dungeness Spit Wild Ocean Crab',
            scientificName: 'Metacarcinus magister',
            peakMonths: [11, 12, 1, 2, 3, 4], // Winter commercial & tribal season
            phytonutrientHighlight: 'Marine omega-3 (EPA/DHA), bioavailable zinc, copper',
            clinicalTargetBenefit: 'Neuronal membrane fluidity, synaptic transmission, and thyroid cofactor replenishment.',
            storageRecommendation: 'Consume day of live catch or refrigerate steamed meat up to 48 hours.',
            culinarySynergy: 'Serve steamed with freshly squeezed lemon and garden dill.'
          }
        ];

      case 'dest_lewiston':
        return [
          {
            id: 'lew_fiddlehead',
            name: 'Androscoggin River Ostrich Fiddlehead Ferns',
            scientificName: 'Matteuccia struthiopteris',
            peakMonths: [4, 5], // Brief early spring riverbank window
            phytonutrientHighlight: 'Omega-3 ALA, niacin, riboflavin, carotenoids',
            clinicalTargetBenefit: 'Cellular energy metabolism and mucous membrane repair.',
            storageRecommendation: 'Submerge in cold water in refrigerator; use within 3-4 days.',
            culinarySynergy: 'Boil for 10 minutes (per USDA food safety), then pan-sear with garlic and sea salt.'
          },
          {
            id: 'lew_blueberry',
            name: 'Maine Wild Lowbush Barren Blueberries',
            scientificName: 'Vaccinium angustifolium',
            peakMonths: [7, 8, 9], // High summer
            phytonutrientHighlight: 'Pterostilbene, anthocyanins (2x higher than cultivated)',
            clinicalTargetBenefit: 'Blood-brain barrier crossing neuroprotective agent; enhances cognitive processing speed.',
            storageRecommendation: 'Store unwashed in shallow breathable containers in refrigerator.',
            culinarySynergy: 'Eat fresh by the handful or blend into goat milk kefir.'
          },
          {
            id: 'lew_chaga',
            name: 'Maine Wild Birch Chaga Conk',
            scientificName: 'Inonotus obliquus',
            peakMonths: [10, 11, 12, 1, 2, 3], // Winter harvesting when sap is dormant
            phytonutrientHighlight: 'Betulinic acid, superoxide dismutase (SOD), melanin',
            clinicalTargetBenefit: 'Mitochondrial membrane stabilization and systemic oxidative buffering.',
            storageRecommendation: 'Air-dry chunks thoroughly; store in airtight glass jars.',
            culinarySynergy: 'Slow-simmer chunks in water for 4 hours as a nourishing dark medicinal tea.'
          }
        ];

      default:
        return [
          {
            id: 'generic_greens',
            name: 'Local Organic Seasonal Brassica & Field Greens',
            scientificName: 'Brassica oleracea',
            peakMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            phytonutrientHighlight: 'Chlorophyll, folate, sulforaphane, lutein',
            clinicalTargetBenefit: 'Cellular methylation support and endothelial nitric oxide augmentation.',
            storageRecommendation: 'Wrap in damp organic cotton towel in crisper drawer.',
            culinarySynergy: 'Dress with extra virgin olive oil and lemon juice.'
          }
        ];
    }
  }
}
