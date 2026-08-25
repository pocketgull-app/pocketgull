import { Injectable, signal, computed, inject } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

export interface IQuest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {

  readonly points = signal<number>(0);
  readonly completedQuestIds = signal<string[]>([]);

  readonly quests = computed<IQuest[]>(() => {
    const completed = this.completedQuestIds();
    return [
      {
        id: 'circadian_survey',
        name: 'Circadian Alignment',
        description: 'Unlock secure passcode & submit Karolinska Sleepiness Scale (KSS).',
        xpReward: 100,
        completed: completed.includes('circadian_survey')
      },
      {
        id: 'select_patient',
        name: 'Load Patient Chart',
        description: 'Select a patient case profile to begin clinical evaluation.',
        xpReward: 100,
        completed: completed.includes('select_patient')
      },
      {
        id: 'click_anatomy',
        name: 'Anatomical Assessment',
        description: 'Investigate a specific anatomical zone of interest on the 3D body map.',
        xpReward: 100,
        completed: completed.includes('click_anatomy')
      },
      {
        id: 'generate_care_plan',
        name: 'Gemini Multi-Lens Generation',
        description: 'Generate real-time Clinical Strategy across 5 specialized lenses.',
        xpReward: 200,
        completed: completed.includes('generate_care_plan')
      },
      {
        id: 'explore_evidence',
        name: 'Deep Evidence Drill',
        description: 'Activate Evidence Focus on a recommendation to view clinical research context.',
        xpReward: 150,
        completed: completed.includes('explore_evidence')
      },
      {
        id: 'sentinel_triage',
        name: 'Sentinel Triage Briefing',
        description: 'Load a WHO/CDC Sentinel case (e.g. Global Sentinel) for regional threat monitoring.',
        xpReward: 200,
        completed: completed.includes('sentinel_triage')
      },
      {
        id: 'sync_registry',
        name: 'Registry Connectivity Sync',
        description: 'Synchronize sentinel triage reports to the National/WHO database.',
        xpReward: 150,
        completed: completed.includes('sync_registry')
      },
      {
        id: 'finalize_plan',
        name: 'Secure Compliance Archival',
        description: 'Finalize and archive the patient care record, and initiate print flow.',
        xpReward: 300,
        completed: completed.includes('finalize_plan')
      }
    ];
  });

  readonly level = computed<number>(() => {
    const pts = this.points();
    if (pts < 200) return 1;
    if (pts < 500) return 2;
    if (pts < 900) return 3;
    if (pts < 1400) return 4;
    return 5;
  });

  readonly levelTitle = computed<string>(() => {
    const lvl = this.level();
    switch (lvl) {
      case 1: return 'Triage Novice';
      case 2: return 'Clinical Investigator';
      case 3: return 'Epidemic Specialist';
      case 4: return 'WHO Field Director';
      default: return 'National Chief Medical Officer';
    }
  });

  readonly xpNeededForNextLevel = computed<number>(() => {
    const lvl = this.level();
    switch (lvl) {
      case 1: return 200;
      case 2: return 500;
      case 3: return 900;
      case 4: return 1400;
      default: return 2000;
    }
  });

  readonly xpMinForCurrentLevel = computed<number>(() => {
    const lvl = this.level();
    switch (lvl) {
      case 1: return 0;
      case 2: return 200;
      case 3: return 500;
      case 4: return 900;
      default: return 1400;
    }
  });

  readonly progressPercentage = computed<number>(() => {
    const pts = this.points();
    const min = this.xpMinForCurrentLevel();
    const max = this.xpNeededForNextLevel();
    if (pts >= max) return 100;
    const numerator = pts - min;
    const denominator = max - min;
    return Math.min(100, Math.max(0, Math.round((numerator / denominator) * 100)));
  });

  readonly nextStepText = computed<string>(() => {
    const completed = this.completedQuestIds();
    
    if (!completed.includes('circadian_survey')) {
      return 'Unlock the secure console and select sleepiness readiness (KSS).';
    }
    if (!completed.includes('select_patient')) {
      return 'Select a patient profile (or a Sentinel) to initiate a care plan.';
    }
    if (!completed.includes('click_anatomy')) {
      return 'Tap a highlighted organ or pain area on the 3D Body Viewer.';
    }
    if (!completed.includes('generate_care_plan')) {
      return 'Press "Generate Care Plan" to compile the Gemini intelligence strategy.';
    }
    if (!completed.includes('explore_evidence')) {
      return 'Hover or click a care recommendation line to activate inline Evidence Focus.';
    }
    
    // Check if a Sentinel patient is active
    const isSentinelActive = completed.includes('sentinel_triage');
    if (!isSentinelActive) {
      return 'Load a Sentinel patient (e.g. Global Sentinel) to investigate outbreak triage.';
    }
    if (!completed.includes('sync_registry')) {
      return 'Sync Sentinel findings to the central database in the Sentinel Triage Panel.';
    }
    if (!completed.includes('finalize_plan')) {
      return 'Click "Finalize & Archive" to seal the compliant record and print.';
    }
    return 'All missions completed! Feel free to triage other patients or explore additional systems.';
  });

  private storage = (() => {
    try { return inject(SecureStorageService); } catch (e) { return new SecureStorageService(); }
  })();

  constructor() {
    const savedPoints = this.storage.getItem('pg_game_points');
    const savedQuests = this.storage.getItem('pg_game_quests');
    if (savedPoints) {
      this.points.set(parseInt(savedPoints, 10));
    }
    if (savedQuests) {
      try {
        this.completedQuestIds.set(JSON.parse(savedQuests));
      } catch (e) {
        console.warn('[GamificationService] Failed to parse saved quest state, resetting:', e);
      }
    }
  }

  completeQuest(questId: string) {
    if (this.completedQuestIds().includes(questId)) return;

    const quest = this.quests().find(q => q.id === questId);
    if (!quest) return;

    this.completedQuestIds.update(ids => {
      const next = [...ids, questId];
      this.storage.setItem('pg_game_quests', JSON.stringify(next));
      return next;
    });

    const oldLevel = this.level();
    this.points.update(p => {
      const nextPts = p + quest.xpReward;
      this.storage.setItem('pg_game_points', nextPts.toString());
      return nextPts;
    });

    // Synthesize point chime
    this.playQuestChime(quest.xpReward);

    const newLevel = this.level();
    if (newLevel > oldLevel) {
      // Level Up! Play arpeggiated success chords.
      setTimeout(() => this.playLevelUpArpeggio(), 400);
    }
  }

  reset() {
    this.points.set(0);
    this.completedQuestIds.set([]);
    this.storage.removeItem('pg_game_points');
    this.storage.removeItem('pg_game_quests');
  }

  private playQuestChime(xp: number) {
    if (typeof window === 'undefined') return;
    try {
      // Create a nice positive synthesized ding
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      
      // Pitch based on XP
      const baseFreq = 523.25; // C5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15); // Slide up to G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // AudioContext unavailable (SSR or user gesture not yet received)
      if (typeof console !== 'undefined') console.debug('[GamificationService] Quest chime skipped:', e?.message);
    }
  }

  private playLevelUpArpeggio() {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const noteTime = now + (index * 0.08);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch (e) {
      // AudioContext unavailable (SSR or user gesture not yet received)
      if (typeof console !== 'undefined') console.debug('[GamificationService] Level-up arpeggio skipped:', e?.message);
    }
  }
}
