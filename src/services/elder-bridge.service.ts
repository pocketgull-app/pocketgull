import { Injectable, signal, computed } from '@angular/core';

export interface IElderCareProgram {
  id: string;
  programTitle: string;
  targetSeniorGroup: string;
  companionRole: string;
  emojiBadge: string;
  participatingSeniorsCount: number;
  impactSummary: string;
}

export interface IElderVitalityProfile {
  id: string;
  seniorName: string;
  ageYears: number;
  balanceStabilityScore: number; // 0 - 100
  cognitiveVitalityIndex: number; // 0 - 100
  favoriteSoundscape: string;
  assignedStudentCompanion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElderBridgeService {
  private activePrograms = signal<IElderCareProgram[]>([
    {
      id: 'elder-001',
      programTitle: 'Legacy Storytelling & Reminiscence Quest',
      targetSeniorGroup: 'Homebound Seniors & Assisted Living Elders',
      companionRole: 'Student companions record life stories using Socratic Professor Puffin dialogues to boost cognitive vitality.',
      emojiBadge: '👵📜🕊️',
      participatingSeniorsCount: 840,
      impactSummary: 'Preserved 800+ oral history memoirs while improving cognitive memory recall scores by 18%.'
    },
    {
      id: 'elder-002',
      programTitle: 'Fall Prevention & Proprioceptive Balance Corps',
      targetSeniorGroup: 'Seniors at Risk for Falls',
      companionRole: 'Track wearable gait telemetry and guide gentle daily balance & posture quests.',
      emojiBadge: '👴⚖️🚶',
      participatingSeniorsCount: 1250,
      impactSummary: 'Reduced fall risk events by 32% across participating senior living communities.'
    },
    {
      id: 'elder-003',
      programTitle: 'Somatic 528Hz Relaxation for Memory Care',
      targetSeniorGroup: 'Memory Care & Dementia Units',
      companionRole: 'Facilitate 528Hz Solfeggio soundscapes to reduce agitation and improve nocturnal sleep.',
      emojiBadge: '🫀🎧👵',
      participatingSeniorsCount: 620,
      impactSummary: 'Decreased evening agitation (Sundowning) episodes by 41% without sedative medications.'
    }
  ]);

  private seniorProfiles = signal<IElderVitalityProfile[]>([
    {
      id: 's-101',
      seniorName: 'Eleanor Vance',
      ageYears: 84,
      balanceStabilityScore: 88,
      cognitiveVitalityIndex: 91,
      favoriteSoundscape: '528Hz Solfeggio Harmonic Wave',
      assignedStudentCompanion: 'Maya Lin (Stanford)'
    },
    {
      id: 's-102',
      seniorName: 'Arthur Pendelton',
      ageYears: 89,
      balanceStabilityScore: 82,
      cognitiveVitalityIndex: 85,
      favoriteSoundscape: 'Theta 6Hz Binaural Forest',
      assignedStudentCompanion: 'Marcus Vance (MIT)'
    }
  ]);

  readonly programs = this.activePrograms.asReadonly();
  readonly seniors = this.seniorProfiles.asReadonly();

  readonly totalSeniorsServed = computed(() =>
    this.activePrograms().reduce((sum, p) => sum + p.participatingSeniorsCount, 0)
  );

  readonly averageBalanceScore = computed(() => {
    const list = this.seniorProfiles();
    if (!list.length) return 0;
    const sum = list.reduce((acc, s) => acc + s.balanceStabilityScore, 0);
    return Math.round(sum / list.length);
  });
}
