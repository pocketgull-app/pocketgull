/**
 * @file compassionate-nutrition-heritage.service.ts
 * @description Compassionate Nutrition & Cultural Foodways Service:
 * 1. Ancestral & Culturally Grounded Whole-Food Swaps (African Heritage, Latino/Mesoamerican, Asian, Mediterranean, Indigenous).
 * 2. Gut Mucosal Barrier Repair & Short-Chain Fatty Acid (SCFA Butyrate) Engine.
 * 3. Thermal Food Energetics & Digestive Fire Synthesis (TCM Five-Element & Ayurvedic Agni).
 * 4. Anti-Shame Food Relationship & Mindful Interoceptive Eating Scaffolding.
 */

import { Injectable, signal, computed } from '@angular/core';

export type CulturalHeritageTradition =
  | 'AFRICAN_HERITAGE'
  | 'LATINO_MESOAMERICAN'
  | 'ASIAN_TRADITIONAL'
  | 'MEDITERRANEAN'
  | 'INDIGENOUS_TURTLE_ISLAND';

export interface ICulturalFoodSwap {
  heritageTradition: CulturalHeritageTradition;
  belovedTraditionalDish: string;
  nourishingWholeFoodSwap: string;
  biochemicalMechanism: string;
  scfaButyrateYield: 'High' | 'Very High' | 'Exceptional';
  glycemicImpactReductionPercent: number;
  traditionalEnergeticProfile: string;
}

export interface IGutBarrierHealthAssessment {
  estimatedZonulinRisk: 'Low (Intact Mucosa)' | 'Moderate Permeability' | 'Elevated (Leaky Gut Risk)';
  butyrateSynthesizingCapacity: 'Sub-Optimal' | 'Robust' | 'Peak Protective';
  dailyFermentableFiberGrams: number;
  polyphenolDiversityCount: number;
  clinicalActionPlan: string[];
}

export const CANONICAL_HERITAGE_SWAPS: ICulturalFoodSwap[] = [
  {
    heritageTradition: 'AFRICAN_HERITAGE',
    belovedTraditionalDish: 'Refined White Corn Grits / White Rice with Fried Catfish',
    nourishingWholeFoodSwap: 'Ancient Fonio Grain or Sorghum with Slow-Simmered Collard Greens (potlikker rich in magnesium & calcium) & Black-Eyed Peas',
    biochemicalMechanism: 'Fonio and sorghum are low-glycemic ancestral grains high in resistant starch type 3, feeding Roseburia and Faecalibacterium prausnitzii to produce protective butyrate.',
    scfaButyrateYield: 'Exceptional',
    glycemicImpactReductionPercent: 45,
    traditionalEnergeticProfile: 'TCM Earth tonifying; Ayurvedic Vata-Pitta grounding without aggravating Kapha.'
  },
  {
    heritageTradition: 'LATINO_MESOAMERICAN',
    belovedTraditionalDish: 'Refined Flour Tortillas & Lard-Refried Pinto Beans',
    nourishingWholeFoodSwap: 'Nixtamalized Heirloom Blue/Yellow Corn Tortillas (calcium-fortified) with Epazote-Spiced Pot Beans (Frijoles de Olla) & Nopal Cactus',
    biochemicalMechanism: 'Nixtamalization unlocks bioavailable niacin (B3) and resistant starch; nopal soluble mucilage blunts postprandial glucose excursions by slowing gastric emptying.',
    scfaButyrateYield: 'Exceptional',
    glycemicImpactReductionPercent: 52,
    traditionalEnergeticProfile: 'TCM Spleen-nourishing; Ayurvedic Pitta cooling and Agni stabilizing.'
  },
  {
    heritageTradition: 'ASIAN_TRADITIONAL',
    belovedTraditionalDish: 'Polished Jasmine White Rice with Heavy Sweet Soy Sauce',
    nourishingWholeFoodSwap: 'Steamed Half-Milled Haiga-Mai or Black Forbidden Rice with Fermented Kimchi / Miso, Steamed Bok Choy & Shiitake Mushroom Broth',
    biochemicalMechanism: 'Black rice anthocyanins downregulate NF-kB inflammatory cascades; living probiotic lactobacilli strengthen claudin-1 and occludin tight-junction proteins.',
    scfaButyrateYield: 'Very High',
    glycemicImpactReductionPercent: 40,
    traditionalEnergeticProfile: 'TCM Kidney Jing tonifying; restores Lung and Large Intestine Yin moisture.'
  },
  {
    heritageTradition: 'MEDITERRANEAN',
    belovedTraditionalDish: 'Refined White Semolina Pasta with Creamy Sauce',
    nourishingWholeFoodSwap: 'Al Dente Farro / Spelt Grain Bowl with Extra Virgin Olive Oil (high oleocanthal), Wild Greens (Horta), Roasted Chickpeas & Crumbled Sheep Feta',
    biochemicalMechanism: 'Oleocanthal acts as a natural COX-1/COX-2 inhibitor analogous to low-dose ibuprofen; high fiber density feeds mucosal mucin-producing Akkermansia muciniphila.',
    scfaButyrateYield: 'Very High',
    glycemicImpactReductionPercent: 48,
    traditionalEnergeticProfile: 'Balanced Tridoshic nourishment; clears Heart vascular heat.'
  },
  {
    heritageTradition: 'INDIGENOUS_TURTLE_ISLAND',
    belovedTraditionalDish: 'Refined White Flour Frybread',
    nourishingWholeFoodSwap: 'The Three Sisters Stew (Flint Corn, Tepary Beans, & Winter Squash) with Wild Rice & Hand-Gathered Cedar/Rosehip Tea',
    biochemicalMechanism: 'Complete amino acid profile; tepary beans have exceptional drought-hardy soluble fiber and amylose content, creating sustained, crash-free metabolic energy.',
    scfaButyrateYield: 'Exceptional',
    glycemicImpactReductionPercent: 60,
    traditionalEnergeticProfile: 'Seven Generations grounding; ancestral cellular epigenetic resonance.'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CompassionateNutritionHeritageService {
  readonly selectedTradition = signal<CulturalHeritageTradition>('AFRICAN_HERITAGE');
  readonly dailyServingsCulturedFerments = signal<number>(2);
  readonly dailyResistantStarchServings = signal<number>(3);
  readonly distinctWeeklyPlantSpeciesCount = signal<number>(24); // American Gut Project benchmark >= 30
  readonly hasDigestiveBloatingOrGas = signal<boolean>(false);

  readonly availableSwaps = signal<ICulturalFoodSwap[]>(CANONICAL_HERITAGE_SWAPS);

  readonly activeHeritageSwaps = computed(() => {
    const tradition = this.selectedTradition();
    return this.availableSwaps().filter(s => s.heritageTradition === tradition);
  });

  readonly gutBarrierAssessment = computed<IGutBarrierHealthAssessment>(() => {
    const plants = this.distinctWeeklyPlantSpeciesCount();
    const ferments = this.dailyServingsCulturedFerments();
    const starch = this.dailyResistantStarchServings();
    const hasSymptoms = this.hasDigestiveBloatingOrGas();

    let zonulin: 'Low (Intact Mucosa)' | 'Moderate Permeability' | 'Elevated (Leaky Gut Risk)' = 'Moderate Permeability';
    if (plants >= 25 && ferments >= 2 && !hasSymptoms) {
      zonulin = 'Low (Intact Mucosa)';
    } else if (plants < 15 || hasSymptoms) {
      zonulin = 'Elevated (Leaky Gut Risk)';
    }

    let butyrate: 'Sub-Optimal' | 'Robust' | 'Peak Protective' = 'Sub-Optimal';
    if (starch >= 3 && plants >= 20) {
      butyrate = 'Peak Protective';
    } else if (starch >= 2 || plants >= 15) {
      butyrate = 'Robust';
    }

    const actions: string[] = [
      `Celebrate beloved ancestral dishes with heritage swaps that boost resistant starch type 3.`,
      `Target 30+ distinct botanical species per week (herbs, seeds, legumes, leafy greens) to maximize microbial diversity.`
    ];

    if (zonulin === 'Elevated (Leaky Gut Risk)') {
      actions.push('Incorporate bone broth or simmered glutamine-rich cabbage stews to tighten intestinal epithelial junctions.');
    }
    if (ferments < 2) {
      actions.push('Introduce 1-2 tablespoons of raw lacto-fermented foods (kimchi, sauerkraut, kefir, miso) with meals.');
    }

    return {
      estimatedZonulinRisk: zonulin,
      butyrateSynthesizingCapacity: butyrate,
      dailyFermentableFiberGrams: starch * 8 + 12,
      polyphenolDiversityCount: plants,
      clinicalActionPlan: actions
    };
  });

  setTradition(tradition: CulturalHeritageTradition): void {
    this.selectedTradition.set(tradition);
  }

  updateIntake(plantsCount: number, fermentsServings: number, starchServings: number, symptoms: boolean): void {
    this.distinctWeeklyPlantSpeciesCount.set(Math.max(1, Math.min(60, plantsCount)));
    this.dailyServingsCulturedFerments.set(Math.max(0, Math.min(10, fermentsServings)));
    this.dailyResistantStarchServings.set(Math.max(0, Math.min(10, starchServings)));
    this.hasDigestiveBloatingOrGas.set(symptoms);
  }
}
