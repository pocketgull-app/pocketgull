import { Injectable, signal, computed } from '@angular/core';

export type EcoCategory = 
  | 'COMPUTE_ENERGY'
  | 'PLANETARY_DIET'
  | 'ACTIVE_TRANSIT'
  | 'CIRCULAR_WASTE_REDUCTION'
  | 'JOYFUL_ECO_EXPERIENCE';

export interface IEcoRecommendation {
  id: string;
  category: EcoCategory;
  title: string;
  description: string;
  co2SavingsKgPerYear: number;
  healthCoBenefit: string;
  actionableStep: string;
  joyScore?: number; // 1-10
}

export interface ISustainabilityScorecard {
  totalCo2SavingsKgPerYear: number;
  energyEfficiencyScore: number; // 0-100
  recommendations: IEcoRecommendation[];
  sustainabilityTier: 'ECO_LEADER' | 'SUSTAINABLE' | 'MODERATE_IMPACT' | 'HIGH_CARBON_FOOTPRINT';
}

@Injectable({
  providedIn: 'root'
})
export class GreenComputingSustainabilityService {

  public readonly ecoRecommendations = signal<IEcoRecommendation[]>([
    {
      id: 'eco_1',
      category: 'COMPUTE_ENERGY',
      title: '⚡ On-Device WebGPU Edge Compute Mode',
      description: 'Run 3D organ biophysics and MedGemma ML inference directly on user GPU hardware to eliminate datacenter grid transmission losses.',
      co2SavingsKgPerYear: 14.2,
      healthCoBenefit: 'Zero-latency instant offline clinical consultations.',
      actionableStep: 'Enable client-side WebGPU acceleration in settings.',
      joyScore: 8
    },
    {
      id: 'eco_2',
      category: 'PLANETARY_DIET',
      title: '🌱 EAT-Lancet Planetary Health Nutrition',
      description: 'Incorporate 3 plant-forward anti-inflammatory meals weekly (legumes, leafy greens, walnuts) based on EAT-Lancet guidelines.',
      co2SavingsKgPerYear: 180.0,
      healthCoBenefit: 'Reduces systemic hs-CRP inflammation by ~28% and lowers cardiovascular risk.',
      actionableStep: 'Swap 3 meat meals per week for Mediterranean plant protein.',
      joyScore: 9
    },
    {
      id: 'eco_3',
      category: 'ACTIVE_TRANSIT',
      title: '🚴 Active Eco-Mobility & Transit Wellness',
      description: 'Choose walking or cycling for local medical appointments or errands under 2 miles.',
      co2SavingsKgPerYear: 120.5,
      healthCoBenefit: 'Adds 150 active cardiovascular exercise minutes weekly, improving blood glucose control.',
      actionableStep: 'Walk or bike for short-distance errands under 2 miles.',
      joyScore: 9
    },
    {
      id: 'eco_4',
      category: 'CIRCULAR_WASTE_REDUCTION',
      title: '📄 100% Digital FHIR PDF Care Plan Export',
      description: 'Export care plans and statutory advance directives via FHIR R4 JSON or PDF instead of paper printing.',
      co2SavingsKgPerYear: 8.5,
      healthCoBenefit: 'Eliminates paper clutter and protects HIPAA digital privacy.',
      actionableStep: 'Use 1-click digital FHIR export for medical records.',
      joyScore: 7
    },
    {
      id: 'eco_5',
      category: 'JOYFUL_ECO_EXPERIENCE',
      title: '🌻 Regenerative Community Gardening & Soil Serotonin',
      description: 'Plant heirloom herbs, microgreens, or native flowers. Soil contact exposes skin to Mycobacterium vaccae, triggering natural brain serotonin release.',
      co2SavingsKgPerYear: 25.0,
      healthCoBenefit: 'Natural serotonin boost, sensory tactile grounding, and fresh organic intake.',
      actionableStep: 'Spend 20 minutes potting organic herbs or tending a windowsill garden.',
      joyScore: 10
    },
    {
      id: 'eco_6',
      category: 'JOYFUL_ECO_EXPERIENCE',
      title: '🌲 Forest Bathing (Shinrin-yoku) & Airborne Phytoncides',
      description: 'Mindful walking in wooded parks or natural trails. Breathing airborne tree phytoncides increases Natural Killer (NK) immune cell activity by ~40%.',
      co2SavingsKgPerYear: 15.0,
      healthCoBenefit: 'Boosts antiviral immunity, lowers cortisol, and restores attention capacity.',
      actionableStep: 'Take a 30-minute quiet walk in a tree-canopied park weekly.',
      joyScore: 10
    },
    {
      id: 'eco_7',
      category: 'JOYFUL_ECO_EXPERIENCE',
      title: '🎨 Upcycled Botanical Art & Natural Pigment Crafting',
      description: 'Create zero-waste botanical dye art, flower presses, or natural watercolors from food peels (turmeric, red cabbage, avocado pits).',
      co2SavingsKgPerYear: 10.0,
      healthCoBenefit: 'Stimulates neuroplastic creative flow state and reduces mental anxiety.',
      actionableStep: 'Try pressing wildflowers or painting with natural plant dyes.',
      joyScore: 9
    }
  ]);

  public sustainabilityScorecard = computed<ISustainabilityScorecard>(() => {
    const list = this.ecoRecommendations();
    const totalSavings = list.reduce((sum, item) => sum + item.co2SavingsKgPerYear, 0);

    let tier: ISustainabilityScorecard['sustainabilityTier'] = 'ECO_LEADER';
    if (totalSavings < 50) tier = 'HIGH_CARBON_FOOTPRINT';
    else if (totalSavings < 150) tier = 'MODERATE_IMPACT';
    else if (totalSavings < 250) tier = 'SUSTAINABLE';

    return {
      totalCo2SavingsKgPerYear: Math.round(totalSavings * 10) / 10,
      energyEfficiencyScore: 92,
      recommendations: list,
      sustainabilityTier: tier
    };
  });

  public getRecommendationsByCategory(category: EcoCategory): IEcoRecommendation[] {
    return this.ecoRecommendations().filter(r => r.category === category);
  }
}
