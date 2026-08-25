import { Injectable, signal, computed } from '@angular/core';

export type LifeJourneyStage = 
  | 'seeker_student'       // Learning, discovery, academic focus (40 Hz Gamma / Lydian)
  | 'frontline_healer'     // High output, decision fatigue, clinician in trenches (Dorian / 60 BPM)
  | 'wounded_traveler'     // Chronic illness, trauma recovery, post-viral fatigue (EMDR / Feline 25Hz)
  | 'sacred_first_1000'    // Preconception, pregnancy, postpartum maternal-infant bonding (528 Hz Cetacean)
  | 'elder_storyteller';   // Reflective wisdom, twilight peace, Seven Generations (Persian Ney 432 Hz)

export interface ILifeJourneyProfile {
  stage: LifeJourneyStage;
  title: string;
  subtitle: string;
  compassionateMotto: string;
  primaryNeed: string;
  recommendedTheme: 'celestial_launch' | 'noble_healer' | 'scientific_quest' | 'triumph_of_healing' | 'seven_gen_vigil';
  acousticResonance: string;
  languageTone: 'scientific_rigorous' | 'empathetic_grounded' | 'gentle_restorative' | 'nurturing_maternal' | 'reverent_ancestral';
  suggestedAction: string;
  icon: string;
}

export const LIFE_JOURNEY_PROFILES: ILifeJourneyProfile[] = [
  {
    stage: 'seeker_student',
    title: 'The Seeker & Scholar',
    subtitle: 'Curiosity, biomedical inquiry, and academic mastery',
    compassionateMotto: '“Knowledge begins when we listen to the mystery of living biology.”',
    primaryNeed: 'Cognitive lucidity & deep scientific engagement without burnout',
    recommendedTheme: 'scientific_quest',
    acousticResonance: 'MIT 40 Hz Gamma Synchrony + Lydian Wonder',
    languageTone: 'scientific_rigorous',
    suggestedAction: 'Explore N-of-1 trial designer & GA4GH Phenopackets',
    icon: '🎓'
  },
  {
    stage: 'frontline_healer',
    title: 'The Frontline Healer',
    subtitle: 'Clinicians, nurses, and caregivers in the demanding exam room trenches',
    compassionateMotto: '“You cannot pour from an empty cup. Your breath is the anchor of the room.”',
    primaryNeed: 'Eliminating administrative burden & real-time vagal autonomic stabilization',
    recommendedTheme: 'noble_healer',
    acousticResonance: 'Dorian 60 BPM Heartbeat + Canine Cardiac Co-Regulation',
    languageTone: 'empathetic_grounded',
    suggestedAction: 'Activate Ambient Clinical Scribe & 10-Minute Vagal Reset',
    icon: '🩺'
  },
  {
    stage: 'wounded_traveler',
    title: 'The Wounded Traveler',
    subtitle: 'Navigating chronic illness, pain flares, post-viral fatigue, or emotional grief',
    compassionateMotto: '“Rest is not surrender; it is the holy soil where cellular repair takes place.”',
    primaryNeed: 'Zero judgment, gentle somatic soothing, and micro-restorative pacing',
    recommendedTheme: 'triumph_of_healing',
    acousticResonance: 'EMDR Bilateral Alternating Panning (8 Hz) + Feline 25–140 Hz Bone Healing Purr',
    languageTone: 'gentle_restorative',
    suggestedAction: 'Enter 15-Minute Somatic Sanctuary & Monroe Focus 10 Theta Rest',
    icon: '🩹'
  },
  {
    stage: 'sacred_first_1000',
    title: 'The Sacred Beginning',
    subtitle: 'Preconception, pregnancy, postpartum recovery, and the First 1,000 Days',
    compassionateMotto: '“Every beat of the mother’s heart writes the epigenetic foundation of the child.”',
    primaryNeed: 'Maternal oxytocin co-regulation, non-toxic nourishment, and cradleboard bonding',
    recommendedTheme: 'triumph_of_healing',
    acousticResonance: 'Cetacean 528 Hz Solfeggio + Circadian Dawn Chorus',
    languageTone: 'nurturing_maternal',
    suggestedAction: 'View First 1,000 Days Epigenetic Shield & Traditional Herbal Safety',
    icon: '👶'
  },
  {
    stage: 'elder_storyteller',
    title: 'The Elder & Storyteller',
    subtitle: 'Carriers of memory, twilight peace, and ancestral wisdom for the next generations',
    compassionateMotto: '“The ancient trees shade the young saplings through the heaviest winter snows.”',
    primaryNeed: 'Unhurried presence, joint comfort, and intergenerational oral history preservation',
    recommendedTheme: 'seven_gen_vigil',
    acousticResonance: 'Persian Sufi Ney (432 Hz) + White Pine & Cedar Forest Harmonics',
    languageTone: 'reverent_ancestral',
    suggestedAction: 'Open Seven Generations Lens & Indigenous Botanical Codex',
    icon: '🌲'
  }
];

@Injectable({
  providedIn: 'root'
})
export class LifeJourneyNavigatorService {
  readonly currentStage = signal<LifeJourneyStage>('frontline_healer');
  readonly energyLevel = signal<number>(5); // 1 (Depleted) to 10 (Thriving)

  readonly currentProfile = computed<ILifeJourneyProfile>(() => {
    return LIFE_JOURNEY_PROFILES.find(p => p.stage === this.currentStage()) || LIFE_JOURNEY_PROFILES[1];
  });

  /**
   * Set active life journey stage to adapt the platform tone and soundscapes
   */
  setJourneyStage(stage: LifeJourneyStage): void {
    this.currentStage.set(stage);
  }

  /**
   * Adjust subjective energy level (1-10) to calibrate cognitive load
   */
  setEnergyLevel(level: number): void {
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    this.energyLevel.set(clamped);
  }
}
