import { Injectable, signal, computed } from '@angular/core';

export interface IHealthAdventureQuest {
  id: string;
  adventureTitle: string;
  realmName: string;
  emojiBadge: string;
  unlockedByDataSource: string; // e.g. "Apple Health", "Dexcom CGM", "Oura Sleep", "Lab Panel"
  guidedPrompt: string;
  assignedPersona: string;
  progressPct: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataAdventureEngineService {
  private activeAdventures = signal<IHealthAdventureQuest[]>([
    {
      id: 'adv-001',
      adventureTitle: 'The Nocturnal REM Sanctuary',
      realmName: 'Realm of Somatic Recovery',
      emojiBadge: '😴🌙🌊',
      unlockedByDataSource: 'Oura / Apple Health Sleep Data',
      guidedPrompt: 'Peregrine, my HRV dropped to 32ms last night. Lead me on a 10-min 528Hz Solfeggio soundscape quest to restore vagal tone.',
      assignedPersona: '🦅 Peregrine & 🕊️ Nightingale',
      progressPct: 65
    },
    {
      id: 'adv-002',
      adventureTitle: 'The Island of Glycemic Stability',
      realmName: 'Realm of Metabolic Flow',
      emojiBadge: '⚡🔋🥑',
      unlockedByDataSource: 'Dexcom Continuous Glucose Monitor',
      guidedPrompt: 'Dr. Gulliver, analyze my post-meal glucose spikes and generate a 7-day metabolic adventure to keep my time-in-range above 85%.',
      assignedPersona: '🦉 Dr. Gulliver',
      progressPct: 40
    },
    {
      id: 'adv-003',
      adventureTitle: 'The Epigenetic Tree of Life',
      realmName: 'Realm of Longevity & Cellular Flourishing',
      emojiBadge: '🧬🌱🌟',
      unlockedByDataSource: '23andMe / TruDiagnostic DNA Methylation',
      guidedPrompt: 'Professor Puffin, guide me on a Socratic story quest to understand how my daily sleep and autophagy habits influence my biological age.',
      assignedPersona: '🐧 Professor Puffin',
      progressPct: 80
    }
  ]);

  readonly adventures = this.activeAdventures.asReadonly();
  readonly activeCount = computed(() => this.activeAdventures().length);

  /**
   * Unlock a new bio-adventure from an uploaded telemetry file
   */
  unlockAdventureFromUpload(fileName: string, dataType: string): IHealthAdventureQuest {
    const newAdv: IHealthAdventureQuest = {
      id: `adv-${Date.now().toString(36)}`,
      adventureTitle: `The ${dataType} Discovery Expedition`,
      realmName: 'Realm of Personal Bio-Sovereignty',
      emojiBadge: '📂🧬🚀',
      unlockedByDataSource: fileName,
      guidedPrompt: `Rx Robin and Dr. Gulliver, synthesize my uploaded ${fileName} dataset and recommend my top 3 high-impact health quests.`,
      assignedPersona: '🐦 Rx Robin & 🦉 Dr. Gulliver',
      progressPct: 0
    };

    this.activeAdventures.update(list => [newAdv, ...list]);
    return newAdv;
  }
}
