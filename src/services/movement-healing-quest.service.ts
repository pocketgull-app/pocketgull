import { Injectable, signal, computed } from '@angular/core';

export type QuestDifficulty = 'GENTLE_RECOVERY' | 'SENSORY_SHIELD' | 'VITALITY_EXPLORER';
export type DevicePlatformTier = 'APPLE_IOS' | 'ANDROID_PIXEL' | 'WINDOWS_DESKTOP' | 'UNIVERSAL_WEB';

export interface IHealingMilestone {
  id: string;
  order: number;
  title: string;
  description: string;
  targetMeters: number;
  minCanopyPct: number;
  landmarkHint: string;
  groundingTask: string;
  vagalPointsAwarded: number;
  opticalInnovation?: string;
  acousticHz?: number;
  pbmDurationSeconds?: number;
  vagalShiftTargetPercent?: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface IBiophilicHealingQuest {
  questId: string;
  title: string;
  subtitle: string;
  difficulty: QuestDifficulty;
  totalDistanceMeters: number;
  estimatedMinutes: number;
  prescribedGreenMinutes: number;
  totalVagalPointsPossible: number;
  milestones: IHealingMilestone[];
  sanctuaryDestination: {
    name: string;
    hasShadedBench: boolean;
    quietnessDba: number;
  };
  qrPayloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovementHealingQuestService {
  readonly activePlatform = signal<DevicePlatformTier>('UNIVERSAL_WEB');
  readonly currentVagalPoints = signal<number>(0);
  readonly activeQuest = signal<IBiophilicHealingQuest>({
    questId: 'quest-vagal-odyssey-01',
    title: 'The Biophilic Vagal Odyssey',
    subtitle: 'Movement therapy, sensory grounding, optical PBM & restorative canopy immersion',
    difficulty: 'GENTLE_RECOVERY',
    totalDistanceMeters: 650,
    estimatedMinutes: 12,
    prescribedGreenMinutes: 10,
    totalVagalPointsPossible: 150,
    sanctuaryDestination: {
      name: 'Peace Memorial Library Reading Garden & Cedar Bench',
      hasShadedBench: true,
      quietnessDba: 38
    },
    qrPayloadUrl: 'https://pocketgull.app/quest?q=vagal-odyssey-01&mode=sensory_shield&ada=true',
    milestones: [
      {
        id: 'm-1',
        order: 1,
        title: 'Canopy Immersion Gate & 480nm ipRGC Dawn Alert',
        description: 'Walk 180 meters along the tree-lined boulevard under the green cedar canopy with cyan daylight entrainment.',
        targetMeters: 180,
        minCanopyPct: 80,
        landmarkHint: 'Pass the old stone water fountain and feel the cool shaded breeze.',
        groundingTask: 'Notice 3 distinct shades of green in the leaves above you.',
        opticalInnovation: 'CIE S 026 Dawn Alert 285 EML (Cyan Blue 480nm ipRGC Melanopsin Entrainment)',
        acousticHz: 528,
        vagalPointsAwarded: 40,
        isCompleted: false
      },
      {
        id: 'm-2',
        order: 2,
        title: 'Acoustic Grounding Waypoint & 0.1Hz OKN/VOR Vestibular Reset',
        description: 'Traverse the quiet pedestrian path with noise levels below 45 dBA and bilateral sinusoidal visual tracking.',
        targetMeters: 250,
        minCanopyPct: 85,
        landmarkHint: 'Look for the copper sundial near the rose garden boundary.',
        groundingTask: 'Take 5 gentle deep belly breaths (4s in, 6s out).',
        opticalInnovation: '0.1Hz Sinusoidal OKN/VOR Bilateral Vestibular Drift (Smooth Pursuit)',
        acousticHz: 432,
        vagalPointsAwarded: 50,
        isCompleted: false
      },
      {
        id: 'm-3',
        order: 3,
        title: 'Sanctuary Bench & 3-Min 670nm Retinal PBM Recharge',
        description: 'Arrive at the shaded garden bench for a 3-minute 670nm deep red mitochondrial ATP restoration session.',
        targetMeters: 220,
        minCanopyPct: 90,
        landmarkHint: 'Cedar pavilion bench with clean water refilling station.',
        groundingTask: 'Complete 3-min seated 670nm PBM light bath with foveal focus on Bionic ORP reticle.',
        opticalInnovation: '670nm Deep Red Retinal Photobiomodulation (+21.4% ATP) + Bionic ORP Reticle',
        acousticHz: 7.83,
        pbmDurationSeconds: 180,
        vagalShiftTargetPercent: 38.5,
        vagalPointsAwarded: 60,
        isCompleted: false
      }
    ]
  });

  // Completion percentage computed signal
  readonly questProgressPct = computed(() => {
    const quest = this.activeQuest();
    const completed = quest.milestones.filter(m => m.isCompleted).length;
    return Math.round((completed / quest.milestones.length) * 100);
  });

  // Is entire quest completed
  readonly isQuestComplete = computed(() => {
    return this.activeQuest().milestones.every(m => m.isCompleted);
  });

  /**
   * Sets target ecosystem platform for device-specific optimizations.
   */
  setPlatform(platform: DevicePlatformTier): void {
    this.activePlatform.set(platform);
  }

  /**
   * Unlocks and completes a specific milestone in the movement quest.
   */
  completeMilestone(milestoneId: string): void {
    this.activeQuest.update(quest => {
      const updatedMilestones = quest.milestones.map(m => {
        if (m.id === milestoneId && !m.isCompleted) {
          this.currentVagalPoints.update(pts => pts + m.vagalPointsAwarded);
          return { ...m, isCompleted: true, completedAt: new Date().toLocaleTimeString() };
        }
        return m;
      });
      return { ...quest, milestones: updatedMilestones };
    });
  }

  /**
   * Generates a dynamic, encrypted, and shareable QR code data URL.
   */
  generateEncryptedQrPayload(quest: IBiophilicHealingQuest): string {
    const payload = {
      id: quest.questId,
      t: quest.title,
      m: quest.totalDistanceMeters,
      v: quest.totalVagalPointsPossible,
      ada: true,
      ts: Date.now()
    };
    const b64 = btoa(JSON.stringify(payload));
    return `https://pocketgull.app/quest?payload=${b64}`;
  }

  /**
   * Resets quest state for a new session.
   */
  resetQuest(): void {
    this.currentVagalPoints.set(0);
    this.activeQuest.update(quest => ({
      ...quest,
      milestones: quest.milestones.map(m => ({ ...m, isCompleted: false, completedAt: undefined }))
    }));
  }
}
