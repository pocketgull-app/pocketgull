import { Injectable, signal, computed } from '@angular/core';

export interface ITravelCircadianState {
  originTimezone: string; // e.g. "America/Los_Angeles"
  destinationTimezone: string; // e.g. "Europe/London"
  timezoneOffsetHours: number; // e.g. +8
  travelDate: string;
  circadianAdaptationDay: number; // Day 1 to 5
}

export interface IWellnessBudgetItem {
  id: string;
  title: string;
  category: 'FREE_EDGETECH' | 'BUDGET_NUTRITION' | 'WEARABLE_TELEMETRY' | 'TRAVEL_LOCAL';
  costUsdPerMonth: number;
  healthImpactTier: 'HIGH' | 'TRANSFORMATIVE' | 'ESSENTIAL';
  description: string;
  emojiBadge: string;
}

@Injectable({
  providedIn: 'root'
})
export class TravelLocalizationService {
  readonly currentTravelState = signal<ITravelCircadianState>({
    originTimezone: 'America/Los_Angeles',
    destinationTimezone: 'Europe/London',
    timezoneOffsetHours: 8,
    travelDate: new Date().toISOString().split('T')[0],
    circadianAdaptationDay: 1
  });

  readonly monthlyBudgetCapUsd = signal<number>(50); // Default $50/mo budget cap

  private budgetItems = signal<IWellnessBudgetItem[]>([
    {
      id: 'b-001',
      title: 'Morning Sunlight & Circadian Photons',
      category: 'FREE_EDGETECH',
      costUsdPerMonth: 0,
      healthImpactTier: 'TRANSFORMATIVE',
      description: '10-15 mins of natural morning sunlight to entrain cortisol & nocturnal melatonin.',
      emojiBadge: '🌅👀'
    },
    {
      id: 'b-002',
      title: 'WebAudio 528Hz Solfeggio & AVS Entrainment',
      category: 'FREE_EDGETECH',
      costUsdPerMonth: 0,
      healthImpactTier: 'TRANSFORMATIVE',
      description: 'In-browser binaural acoustic entrainment for vagal tone reset & travel jetlag sleep.',
      emojiBadge: '🎧🌊'
    },
    {
      id: 'b-003',
      title: 'Elemental Magnesium Glycinate & Electrolytes',
      category: 'BUDGET_NUTRITION',
      costUsdPerMonth: 15,
      healthImpactTier: 'HIGH',
      description: 'High-bioavailability muscle relaxation & nocturnal sleep support.',
      emojiBadge: '💊💧'
    },
    {
      id: 'b-004',
      title: 'Local Farmers Market Organic Produce Bundle',
      category: 'BUDGET_NUTRITION',
      costUsdPerMonth: 35,
      healthImpactTier: 'HIGH',
      description: 'Fresh local polyphenols & fiber supporting gut microbiome diversity.',
      emojiBadge: '🍎🥦'
    }
  ]);

  readonly catalog = this.budgetItems.asReadonly();

  readonly affordableItems = computed(() => {
    const cap = this.monthlyBudgetCapUsd();
    return this.budgetItems().filter(item => item.costUsdPerMonth <= cap);
  });

  readonly totalSelectedCost = computed(() =>
    this.affordableItems().reduce((sum, item) => sum + item.costUsdPerMonth, 0)
  );

  /**
   * Set user travel destination and compute recommended jetlag quests
   */
  setTravelDestination(destinationTz: string, offsetHours: number): void {
    this.currentTravelState.update(s => ({
      ...s,
      destinationTimezone: destinationTz,
      timezoneOffsetHours: offsetHours,
      circadianAdaptationDay: 1
    }));
  }

  /**
   * Set user monthly health budget cap
   */
  setBudgetCap(usdAmount: number): void {
    this.monthlyBudgetCapUsd.set(usdAmount);
  }
}
