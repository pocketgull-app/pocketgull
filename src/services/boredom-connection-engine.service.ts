import { Injectable, signal, computed } from '@angular/core';

export interface IBoredomFlowQuest {
  id: string;
  title: string;
  category: 'CREATIVE_IGNITION' | 'PHYSICAL_MICRO_ADVENTURE' | 'SOCRATIC_DEEP_DIVE';
  estimatedDurationMins: number;
  emojiBadge: string;
  description: string;
}

export interface IHumanConnectionQuest {
  id: string;
  title: string;
  category: 'GRATITUDE_PULSE' | 'INTERGENERATIONAL_ELDER' | 'PEER_UNIVERSITY_MATCH' | 'SYNCHRONIZED_SOUNDSCAPE';
  targetConnectionPartner: string;
  emojiBadge: string;
  description: string;
  impactMetrics: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoredomConnectionEngineService {
  private boredomQuests = signal<IBoredomFlowQuest[]>([
    {
      id: 'b-001',
      title: '10-Minute Solfeggio Acoustic Composition',
      category: 'CREATIVE_IGNITION',
      estimatedDurationMins: 10,
      emojiBadge: '🎨🎧🎹',
      description: 'Use your phone microphone to record 3 natural ambient sounds and harmonize them with a 528Hz Solfeggio tone.'
    },
    {
      id: 'b-002',
      title: 'Random Neighborhood Micro-Expedition',
      category: 'PHYSICAL_MICRO_ADVENTURE',
      estimatedDurationMins: 15,
      emojiBadge: '🥾🌲📸',
      description: 'Take a 15-minute walk along an unfamiliar block and photograph 3 unique botanical or architectural details.'
    },
    {
      id: 'b-003',
      title: 'Professor Puffin Socratic Biology Paradox',
      category: 'SOCRATIC_DEEP_DIVE',
      estimatedDurationMins: 12,
      emojiBadge: '🐧📚💡',
      description: 'Ask Professor Puffin: "What if human skin could photosynthesize like plant chloroplasts?" and explore the science.'
    }
  ]);

  private connectionQuests = signal<IHumanConnectionQuest[]>([
    {
      id: 'c-001',
      title: 'The Gratitude Pulse Note',
      category: 'GRATITUDE_PULSE',
      targetConnectionPartner: 'Friend, Family Member, or Mentor',
      emojiBadge: '☕🗣️💌',
      description: 'Send a 30-second voice message to someone who positively impacted your life, expressing specific gratitude.',
      impactMetrics: 'Elevates vagal HRV tone (+14%) and reduces systemic cortisol.'
    },
    {
      id: 'c-002',
      title: 'Intergenerational Legacy Story Hour',
      category: 'INTERGENERATIONAL_ELDER',
      targetConnectionPartner: 'Homebound Senior / Assisted Living Elder',
      emojiBadge: '👵📜🕊️',
      description: 'Pair with an elder for a 15-minute voice story session, capturing their life lessons into a FHIR digital memoir.',
      impactMetrics: 'Decreases feelings of loneliness in elders by 45%.'
    },
    {
      id: 'c-003',
      title: 'Trans-Atlantic Synchronized 528Hz Circle',
      category: 'SYNCHRONIZED_SOUNDSCAPE',
      targetConnectionPartner: 'Student Peer from Oxford / Stanford',
      emojiBadge: '🌊🎧🌐',
      description: 'Join a live, synchronized 528Hz Solfeggio AVS relaxation session with a peer across timezones.',
      impactMetrics: 'Boosts social coherence & shared autonomic entrainment.'
    }
  ]);

  readonly activeBoredomQuests = this.boredomQuests.asReadonly();
  readonly activeConnectionQuests = this.connectionQuests.asReadonly();

  readonly totalAvailableQuests = computed(() =>
    this.boredomQuests().length + this.connectionQuests().length
  );
}
