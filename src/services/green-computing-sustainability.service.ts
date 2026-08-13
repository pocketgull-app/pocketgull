import { Injectable, signal, computed } from '@angular/core';

export type EcoCategory = 
  | 'COMPUTE_ENERGY'
  | 'PLANETARY_DIET'
  | 'ACTIVE_TRANSIT'
  | 'CIRCULAR_WASTE_REDUCTION';

export interface IEcoRecommendation {
  id: string;
  category: EcoCategory;
  title: string;
  description: string;
  co2SavingsKgPerYear: number;
  healthCoBenefit: string;
  actionableStep: string;
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
      actionableStep: 'Enable client-side WebGPU acceleration in settings.'
    },
    {
      id: 'eco_2',
      category: 'PLANETARY_DIET',
      title: '🌱 EAT-Lancet Planetary Health Nutrition',
      description: 'Incorporate 3 plant-forward anti-inflammatory meals weekly (legumes, leafy greens, walnuts) based on EAT-Lancet guidelines.',
      co2SavingsKgPerYear: 180.0,
      healthCoBenefit: 'Reduces systemic hs-CRP inflammation by ~28% and lowers cardiovascular risk.',
      actionableStep: 'Swap 3 meat meals per week for Mediterranean plant protein.'
    },
    {
      id: 'eco_3',
      category: 'ACTIVE_TRANSIT',
      title: '🚴 Active Eco-Mobility & Transit Wellness',
      description: 'Choose walking or cycling for local medical appointments or errands under 2 miles.',
      co2SavingsKgPerYear: 120.5,
      healthCoBenefit: 'Adds 150 active cardiovascular exercise minutes weekly, improving blood glucose control.',
      actionableStep: 'Walk or bike for short-distance errands under 2 miles.'
    },
    {
      id: 'eco_4',
      category: 'CIRCULAR_WASTE_REDUCTION',
      title: '📄 100% Digital FHIR PDF Care Plan Export',
      description: 'Export care plans and statutory advance directives via FHIR R4 JSON or PDF instead of paper printing.',
      co2SavingsKgPerYear: 8.5,
      healthCoBenefit: 'Eliminates paper clutter and protects HIPAA digital privacy.',
      actionableStep: 'Use 1-click digital FHIR export for medical records.'
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
