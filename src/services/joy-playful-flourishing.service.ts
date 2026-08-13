import { Injectable, signal, computed } from '@angular/core';

export type JoyActivityCategory = 
  | 'MUSIC_RHYTHM'
  | 'NATURE_BOTANICAL'
  | 'CREATIVE_CRAFT'
  | 'LAUGHTER_STORYTELLING'
  | 'MINDFUL_MOVEMENT';

export interface IMicroJoyPrescription {
  id: string;
  title: string;
  category: JoyActivityCategory;
  durationMinutes: number; // e.g. 10 mins
  description: string;
  dopamineSerotoninBenefit: string;
  adaptedForTremorOrCognitive: boolean;
  isCompletedToday: boolean;
}

export interface IJoyPlayfulnessScorecard {
  positiveEmotionScore: number;  // 0-100
  engagementFlowScore: number;   // 0-100
  relationshipWarmthScore: number;// 0-100
  meaningPurposeScore: number;   // 0-100
  compositeJoyIndex: number;     // 0-100
  playfulFlourishingDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class JoyPlayfulFlourishingService {

  public dailyPrescriptions = signal<IMicroJoyPrescription[]>([
    {
      id: 'joy_1',
      title: '🎼 Acoustic Neuro-Rhythm & Harmonic Entrainment',
      category: 'MUSIC_RHYTHM',
      durationMinutes: 10,
      description: 'Listen to 60 BPM acoustic classical harmony or binaural acoustic rhythms while engaging in light tabletop finger-tapping to synchronize thalamocortical alpha-wave oscillations.',
      dopamineSerotoninBenefit: 'Enhances motor rhythm coordination, lowers salivary cortisol, and promotes 8-12 Hz alpha-wave mental calm.',
      adaptedForTremorOrCognitive: true,
      isCompletedToday: false
    },
    {
      id: 'joy_2',
      title: '🌿 Botanical Micro-Foraging & Aromatherapy',
      category: 'NATURE_BOTANICAL',
      durationMinutes: 15,
      description: 'Smell fresh rosemary, mint, or citrus leaves while sitting outdoors or near a sunny windowsill.',
      dopamineSerotoninBenefit: 'Olfactory phytoncides reduce salivary cortisol by ~22%.',
      adaptedForTremorOrCognitive: true,
      isCompletedToday: false
    },
    {
      id: 'joy_3',
      title: '🎨 Origami Crane & Papercraft Sculpting',
      category: 'CREATIVE_CRAFT',
      durationMinutes: 12,
      description: 'Fold soft colored paper into simple geometric birds or shapes to engage fine motor tactile feedback.',
      dopamineSerotoninBenefit: 'Fosters psychological flow state and tactile mindfulness.',
      adaptedForTremorOrCognitive: true,
      isCompletedToday: false
    },
    {
      id: 'joy_4',
      title: '📖 Nostalgic Family Legacy Storytelling',
      category: 'LAUGHTER_STORYTELLING',
      durationMinutes: 10,
      description: 'Share a favorite childhood memory, joke, or funny family story with a caregiver or record a 60-second audio snippet.',
      dopamineSerotoninBenefit: 'Oxytocin bonding and social warm-glow effect.',
      adaptedForTremorOrCognitive: true,
      isCompletedToday: false
    },
    {
      id: 'joy_5',
      title: '🌬️ Laughter Yoga & Vagal Entrainment',
      category: 'MINDFUL_MOVEMENT',
      durationMinutes: 8,
      description: 'Practice gentle rhythm belly laughs followed by slow 4-7-8 deep exhalations.',
      dopamineSerotoninBenefit: 'Instantly activates vagus nerve parasympathetic relaxation.',
      adaptedForTremorOrCognitive: true,
      isCompletedToday: false
    }
  ]);

  /**
   * Toggles completion status of a daily micro-joy prescription.
   */
  public toggleActivityCompletion(id: string): void {
    this.dailyPrescriptions.update(list => 
      list.map(item => item.id === id ? { ...item, isCompletedToday: !item.isCompletedToday } : item)
    );
  }

  /**
   * Computes PERMA+ Joy & Playfulness Scorecard.
   */
  public calculateJoyScorecard(): IJoyPlayfulnessScorecard {
    const list = this.dailyPrescriptions();
    const completedCount = list.filter(i => i.isCompletedToday).length;
    const completionRate = list.length > 0 ? (completedCount / list.length) : 0;

    const positiveEmotionScore = Math.min(100, Math.round(65 + completionRate * 30));
    const engagementFlowScore = Math.min(100, Math.round(70 + completionRate * 25));
    const relationshipWarmthScore = Math.min(100, Math.round(68 + completionRate * 25));
    const meaningPurposeScore = Math.min(100, Math.round(75 + completionRate * 20));

    const compositeJoyIndex = Math.round(
      (positiveEmotionScore * 0.3) +
      (engagementFlowScore * 0.3) +
      (relationshipWarmthScore * 0.2) +
      (meaningPurposeScore * 0.2)
    );

    let directive = '';
    if (compositeJoyIndex >= 85) {
      directive = '🌟 RADIANT FLOURISHING: Outstanding daily playfulness, rhythm engagement, and positive emotional vitality!';
    } else if (compositeJoyIndex >= 70) {
      directive = '🌱 VIBRANT WELLNESS: Strong joy foundation. Completing 1 more micro-play activity today will boost dopamine flow.';
    } else {
      directive = '☀️ PLAYFUL RESTORATION: Take 10 minutes now for acoustic neuro-rhythmic entrainment or botanical aromatherapy to restore vitality.';
    }

    return {
      positiveEmotionScore,
      engagementFlowScore,
      relationshipWarmthScore,
      meaningPurposeScore,
      compositeJoyIndex,
      playfulFlourishingDirective: directive
    };
  }
}
