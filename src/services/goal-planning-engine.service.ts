import { Injectable, signal, computed } from '@angular/core';

export interface IFhirClinicalGoal {
  id: string;
  title: string;
  category: 'AUTONOMIC_RECOVERY' | 'GLYCEMIC_STABILITY' | 'EPIGENETIC_LONGEVITY' | 'STRESS_RESILIENCE';
  lifecycleStatus: 'proposed' | 'active' | 'completed' | 'on-hold';
  achievementStatus: 'in-progress' | 'achieved' | 'sustaining';
  targetMetricName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  emojiBadge: string;
  assignedPersona: string;
  milestoneQuestsCount: number;
  completedQuestsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoalPlanningEngineService {
  private activeGoals = signal<IFhirClinicalGoal[]>([
    {
      id: 'goal-001',
      title: 'Autonomic Vagal Tone Optimization',
      category: 'AUTONOMIC_RECOVERY',
      lifecycleStatus: 'active',
      achievementStatus: 'in-progress',
      targetMetricName: 'HRV RMSSD',
      currentValue: 45,
      targetValue: 75,
      unit: 'ms',
      emojiBadge: '🫀⚡🧘',
      assignedPersona: '🦅 Peregrine & 🕊️ Nightingale',
      milestoneQuestsCount: 5,
      completedQuestsCount: 3
    },
    {
      id: 'goal-002',
      title: 'Continuous Glucose Time-in-Range',
      category: 'GLYCEMIC_STABILITY',
      lifecycleStatus: 'active',
      achievementStatus: 'in-progress',
      targetMetricName: 'CGM Time-in-Range',
      currentValue: 74,
      targetValue: 88,
      unit: '%',
      emojiBadge: '⚡🔋',
      assignedPersona: '🦉 Dr. Gulliver',
      milestoneQuestsCount: 4,
      completedQuestsCount: 2
    },
    {
      id: 'goal-003',
      title: 'Cellular Epigenetic Deceleration',
      category: 'EPIGENETIC_LONGEVITY',
      lifecycleStatus: 'active',
      achievementStatus: 'sustaining',
      targetMetricName: 'DNA Methylation Rate',
      currentValue: 0.82,
      targetValue: 0.75,
      unit: 'ratio',
      emojiBadge: '🧬🌱🌟',
      assignedPersona: '🐧 Professor Puffin',
      milestoneQuestsCount: 6,
      completedQuestsCount: 4
    }
  ]);

  readonly goals = this.activeGoals.asReadonly();
  readonly activeCount = computed(() => this.activeGoals().filter(g => g.lifecycleStatus === 'active').length);

  /**
   * Decompose user intent into a FHIR-compliant SMART Goal with milestone quests
   */
  createSmartGoal(
    title: string,
    category: IFhirClinicalGoal['category'],
    targetMetricName: string,
    targetValue: number,
    unit: string,
    emojiBadge: string
  ): IFhirClinicalGoal {
    const newGoal: IFhirClinicalGoal = {
      id: `goal-${Date.now().toString(36)}`,
      title,
      category,
      lifecycleStatus: 'active',
      achievementStatus: 'in-progress',
      targetMetricName,
      currentValue: 0,
      targetValue,
      unit,
      emojiBadge,
      assignedPersona: '🦅 Peregrine & 🦉 Dr. Gulliver',
      milestoneQuestsCount: 4,
      completedQuestsCount: 0
    };

    this.activeGoals.update(list => [newGoal, ...list]);
    return newGoal;
  }
}
