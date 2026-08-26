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

export interface IFhirGoalResource {
  resourceType: 'Goal';
  id: string;
  lifecycleStatus: string;
  achievementStatus: {
    coding: Array<{ system: string; code: string; display: string }>;
  };
  category: Array<{
    coding: Array<{ system: string; code: string; display: string }>;
  }>;
  description: {
    text: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  target: Array<{
    measure: {
      coding: Array<{ system: string; code: string; display: string }>;
      text: string;
    };
    detailQuantity: {
      value: number;
      unit: string;
      system: string;
    };
  }>;
  note?: Array<{
    text: string;
    time: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GoalPlanningEngineService {
  private readonly activeGoals = signal<IFhirClinicalGoal[]>([
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

  /**
   * Completes a quest on a goal, automatically updating achievement status
   */
  completeQuest(goalId: string): void {
    this.activeGoals.update(goals =>
      goals.map(goal => {
        if (goal.id !== goalId) return goal;
        const newCompleted = Math.min(goal.completedQuestsCount + 1, goal.milestoneQuestsCount);
        const newAchievement: IFhirClinicalGoal['achievementStatus'] =
          newCompleted === goal.milestoneQuestsCount ? 'achieved' : 'in-progress';
        return {
          ...goal,
          completedQuestsCount: newCompleted,
          achievementStatus: newAchievement
        };
      })
    );
  }

  /**
   * Updates the current metric value of an active goal
   */
  updateMetricValue(goalId: string, newValue: number): void {
    this.activeGoals.update(goals =>
      goals.map(goal => {
        if (goal.id !== goalId) return goal;
        return {
          ...goal,
          currentValue: newValue
        };
      })
    );
  }

  /**
   * Calculates overall quest completion percentage (0-100)
   */
  calculateProgress(goal: IFhirClinicalGoal): number {
    if (goal.milestoneQuestsCount <= 0) return 0;
    return Math.round((goal.completedQuestsCount / goal.milestoneQuestsCount) * 100);
  }

  /**
   * Serializes a clinical goal into a standardized HL7 FHIR R4 Goal resource
   */
  exportToFhirGoal(goal: IFhirClinicalGoal, patientId: string = 'patient-001'): IFhirGoalResource {
    return {
      resourceType: 'Goal',
      id: goal.id,
      lifecycleStatus: goal.lifecycleStatus,
      achievementStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/goal-achievement',
            code: goal.achievementStatus,
            display: goal.achievementStatus.toUpperCase()
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'https://pocketgull.app/fhir/CodeSystem/goal-category',
              code: goal.category,
              display: goal.category.replace(/_/g, ' ')
            }
          ]
        }
      ],
      description: {
        text: goal.title
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: 'Homo Sapiens (Patient)'
      },
      target: [
        {
          measure: {
            coding: [
              {
                system: 'https://pocketgull.app/fhir/CodeSystem/clinical-measures',
                code: goal.targetMetricName.toLowerCase().replace(/\s+/g, '-'),
                display: goal.targetMetricName
              }
            ],
            text: goal.targetMetricName
          },
          detailQuantity: {
            value: goal.targetValue,
            unit: goal.unit,
            system: 'http://unitsofmeasure.org'
          }
        }
      ],
      note: [
        {
          text: `Assigned AI Clinical Persona: ${goal.assignedPersona}. Quests: ${goal.completedQuestsCount}/${goal.milestoneQuestsCount} completed.`,
          time: new Date().toISOString()
        }
      ]
    };
  }
}
