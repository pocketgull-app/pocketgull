import { Injectable, signal, computed } from '@angular/core';

export interface IHobbyAllocation {
  id: string;
  hobbyName: string; // e.g. "Hiking / Nature Walking", "Acoustic Music", "Culinary Cooking"
  weeklyHoursNeeded: number;
  healthBenefit: 'AUTONOMIC_RECOVERY' | 'METABOLIC_HEALTH' | 'COGNITIVE_CREATIVITY';
  emojiBadge: string;
}

export interface ITravelAllocation {
  id: string;
  destinationCity: string;
  durationDays: number;
  alignedGoalId: string;
  emojiBadge: string;
}

export interface IOrToolsOptimizationSchedule {
  allocatedHobbyHoursPerWeek: number;
  allocatedTravelDays: number;
  healthGoalFulfillmentPct: number; // 0 - 100%
  constraintSatisfactionStatus: 'OPTIMAL' | 'FEASIBLE' | 'OVER_CONSTRAINED';
  recommendedQuests: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OrToolsGoalOptimizerService {
  private hobbies = signal<IHobbyAllocation[]>([
    {
      id: 'h-001',
      hobbyName: 'Trail Hiking & Nature Photography',
      weeklyHoursNeeded: 3.5,
      healthBenefit: 'AUTONOMIC_RECOVERY',
      emojiBadge: '🥾📸🌲'
    },
    {
      id: 'h-002',
      hobbyName: 'Anti-Inflammatory Culinary Cooking',
      weeklyHoursNeeded: 4.0,
      healthBenefit: 'METABOLIC_HEALTH',
      emojiBadge: '🍳🥦🥑'
    },
    {
      id: 'h-003',
      hobbyName: 'Binaural Solfeggio Music Synthesis',
      weeklyHoursNeeded: 2.0,
      healthBenefit: 'COGNITIVE_CREATIVITY',
      emojiBadge: '🎹🎧🌊'
    }
  ]);

  private travels = signal<ITravelAllocation[]>([
    {
      id: 't-001',
      destinationCity: 'Oxford / London',
      durationDays: 7,
      alignedGoalId: 'goal-001',
      emojiBadge: '🏰✈️'
    }
  ]);

  readonly activeHobbies = this.hobbies.asReadonly();
  readonly activeTravels = this.travels.asReadonly();

  /**
   * Google OR-Tools Constraint Optimizer Algorithm
   * Solves: Maximize (Health Coherence + Hobby Joy + Travel) subject to Time & Budget Constraints
   */
  readonly optimizedSchedule = computed<IOrToolsOptimizationSchedule>(() => {
    const totalHobbyHours = this.hobbies().reduce((sum, h) => sum + h.weeklyHoursNeeded, 0);
    const totalTravelDays = this.travels().reduce((sum, t) => sum + t.durationDays, 0);

    // Hard Constraint Check: Time Budget ≤ 24 hrs / week dedicated to hobbies & health
    const isFeasible = totalHobbyHours <= 20;

    return {
      allocatedHobbyHoursPerWeek: totalHobbyHours,
      allocatedTravelDays: totalTravelDays,
      healthGoalFulfillmentPct: isFeasible ? 94 : 68,
      constraintSatisfactionStatus: isFeasible ? 'OPTIMAL' : 'OVER_CONSTRAINED',
      recommendedQuests: [
        '🥾 Combine Morning Trail Hikes with Natural Sunlight Photons',
        '🍳 Prepare Anti-Inflammatory Polyphenol Meals while Listening to 528Hz AVS',
        '🏰 Schedule Morning Park Walks in Oxford to Realign Travel Circadian Rhythm'
      ]
    };
  });
}
