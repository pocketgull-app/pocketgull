import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { StorageService } from './storage.service';

export type UserLegacyArchetype =
  | 'CREATIVE_ARTISAN'
  | 'KNOWLEDGE_SCHOLAR'
  | 'LAND_STEWARD'
  | 'PHYSICAL_PRACTITIONER'
  | 'CIVIC_BUILDER'
  | 'OPEN_SCIENCE_CONTRIBUTOR';

export interface ILifelongPurposeQuest {
  id: string;
  title: string;
  description: string;
  archetype: UserLegacyArchetype;
  vitalityCategory: 'PHYSICAL' | 'MENTAL' | 'CREATIVE' | 'COMMUNITY' | 'LEGACY';
  impactScore: number; // 1-100
  isCompleted: boolean;
}

export interface ILivingExperienceSubmission {
  id: string;
  title: string;
  narrative: string;
  category: 'INTERVENTION_OUTCOME' | 'LIFESTYLE_DISCOVERY' | 'PHILOSOPHICAL_WISDOM' | 'RECOVERY_MILESTONE';
  snomedCode?: string;
  researchConsent: boolean;
  timestamp: string;
  upvotesCount: number;
}

export interface IPosthumousDataDirective {
  openScienceConsent: boolean;
  targetResearchArea: 'NEURODEGENERATION' | 'LONGEVITY' | 'CARDIOLOGY' | 'RARE_DISEASES' | 'ENVIRONMENTAL_GENOMICS';
  lineageEpigeneticSharing: boolean;
  digitalWisdomAvatarEnabled: boolean;
  endowmentPledgeFund: string;
  encryptedVaultHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrowThyselfLegacyEngineService {
  private patientState = inject(PatientStateService);
  private storage = inject(StorageService);

  readonly activeArchetype = signal<UserLegacyArchetype>('OPEN_SCIENCE_CONTRIBUTOR');

  readonly posthumousDirective = signal<IPosthumousDataDirective>({
    openScienceConsent: true,
    targetResearchArea: 'LONGEVITY',
    lineageEpigeneticSharing: true,
    digitalWisdomAvatarEnabled: true,
    endowmentPledgeFund: 'Alumni Health & Open Science Endowment',
    encryptedVaultHash: '0x8f2a9c1e3d4b7f8e90a1b2c3d4e5f6a7b8c9d0e1f2'
  });

  readonly livingSubmissions = signal<ILivingExperienceSubmission[]>([
    {
      id: 'sub_001',
      title: 'Mitochondrial Recovery via 528Hz Solfeggio & Zone-2 Aerobic Cadence',
      narrative: 'Combined morning 15-min optical rPPG alignment with 528Hz Solfeggio bio-theme haptics. Observed a 14ms increase in HRV RMSSD over 30 days.',
      category: 'INTERVENTION_OUTCOME',
      snomedCode: '366144005',
      researchConsent: true,
      timestamp: '2026-08-10T14:30:00Z',
      upvotesCount: 42
    },
    {
      id: 'sub_002',
      title: 'Epigenetic Phytoncide Exposure Protocol in Old-Growth Forests',
      narrative: 'Logged weekly 2-hour forest bathing walks. Reduced baseline serum C-reactive protein (CRP) from 2.8 mg/L to 1.1 mg/L.',
      category: 'LIFESTYLE_DISCOVERY',
      snomedCode: '428803005',
      researchConsent: true,
      timestamp: '2026-08-08T09:15:00Z',
      upvotesCount: 38
    }
  ]);

  readonly purposeQuests = signal<ILifelongPurposeQuest[]>([
    {
      id: 'q_001',
      title: 'Log 15-Min rPPG Circadian Alignment',
      description: 'Capture morning optical pulse telemetry to calibrate baseline autonomic balance.',
      archetype: 'PHYSICAL_PRACTITIONER',
      vitalityCategory: 'PHYSICAL',
      impactScore: 85,
      isCompleted: true
    },
    {
      id: 'q_002',
      title: 'Contribute De-Identified FHIR Vital to Open Corpus',
      description: 'Anonymize recent vital signs using HIPAA Safe Harbor rules and publish to open medical research.',
      archetype: 'OPEN_SCIENCE_CONTRIBUTOR',
      vitalityCategory: 'LEGACY',
      impactScore: 95,
      isCompleted: false
    },
    {
      id: 'q_003',
      title: 'Plant/Protect Forest Phytoncide Micro-Climate',
      description: 'Engage in outdoor forest bathing and record localized volatile organic compound exposure.',
      archetype: 'LAND_STEWARD',
      vitalityCategory: 'COMMUNITY',
      impactScore: 90,
      isCompleted: false
    },
    {
      id: 'q_004',
      title: 'Record Oral History Wisdom & Core Values',
      description: 'Prescribe 3 audio reflections on personal resilience for future family generations.',
      archetype: 'CREATIVE_ARTISAN',
      vitalityCategory: 'LEGACY',
      impactScore: 98,
      isCompleted: false
    }
  ]);

  readonly activeArchetypeDetails = computed(() => {
    const arch = this.activeArchetype();
    switch (arch) {
      case 'CREATIVE_ARTISAN':
        return {
          label: '🎨 Creative Artisan & Innovator',
          focus: 'Artistic expression, bio-theme audio creation, physical crafts, and aesthetic legacy.',
          motto: 'Transforming biophysical experience into timeless creative expression.'
        };
      case 'KNOWLEDGE_SCHOLAR':
        return {
          label: '🧠 Knowledge Scholar & Mentor',
          focus: 'Deep research, literature synthesis, mentorship, and intellectual archive curation.',
          motto: 'Building a bridge of wisdom across generations.'
        };
      case 'LAND_STEWARD':
        return {
          label: '🌲 Seven-Generations Land Steward',
          focus: 'Micro-climate protection, forest phytoncide exposure, and soil-epigenetic preservation.',
          motto: 'Protecting the earth so that seven generations hence may thrive.'
        };
      case 'PHYSICAL_PRACTITIONER':
        return {
          label: '🫀 Physical Practitioner & Athlete',
          focus: 'Cardiovascular longevity, movement, strength retention, and vital energy flow.',
          motto: 'Maintaining physical mastery and vital movement throughout all decades.'
        };
      case 'CIVIC_BUILDER':
        return {
          label: '🏛️ Civic & Community Builder',
          focus: 'Public health service, local community support, inter-generational mentorship, and mutual care.',
          motto: 'Strengthening the social fabric of health and shared well-being.'
        };
      case 'OPEN_SCIENCE_CONTRIBUTOR':
      default:
        return {
          label: '🧬 Open-Science & Medical Contributor',
          focus: 'De-identified data donation, rare disease research acceleration, and FHIR interop stewardship.',
          motto: 'Turning individual health telemetry into universal medical discoveries.'
        };
    }
  });

  readonly completedQuestCount = computed(() => {
    return this.purposeQuests().filter(q => q.isCompleted).length;
  });

  readonly totalLegacyImpactScore = computed(() => {
    return this.purposeQuests()
      .filter(q => q.isCompleted)
      .reduce((sum, q) => sum + q.impactScore, 0);
  });

  toggleQuest(id: string): void {
    this.purposeQuests.update(quests =>
      quests.map(q => q.id === id ? { ...q, isCompleted: !q.isCompleted } : q)
    );
  }

  setArchetype(archetype: UserLegacyArchetype): void {
    this.activeArchetype.set(archetype);
  }

  updatePosthumousDirective(update: Partial<IPosthumousDataDirective>): void {
    this.posthumousDirective.update(curr => ({ ...curr, ...update }));
  }

  submitExperience(submission: { title: string; narrative: string; category: ILivingExperienceSubmission['category']; researchConsent: boolean }): void {
    const newEntry: ILivingExperienceSubmission = {
      id: `sub_${Date.now()}`,
      title: submission.title.trim(),
      narrative: submission.narrative.trim(),
      category: submission.category,
      researchConsent: submission.researchConsent,
      timestamp: new Date().toISOString(),
      upvotesCount: 1
    };
    this.livingSubmissions.update(list => [newEntry, ...list]);
  }
}
