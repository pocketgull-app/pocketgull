import { Injectable, signal } from '@angular/core';

export interface IArtTherapyPrompt {
  id: string;
  title: string;
  modality: 'mandala' | 'kintsugi' | 'somatic_brush' | 'chromesthesia';
  description: string;
  targetEmotion: string;
  recommendedPalette: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtTherapyService {
  readonly activePrompt = signal<IArtTherapyPrompt | null>(null);

  readonly artTherapyPrompts: IArtTherapyPrompt[] = [
    {
      id: 'art_kintsugi',
      title: 'Kintsugi Golden Seam Repair',
      modality: 'kintsugi',
      targetEmotion: 'Trauma Recovery & Post-Traumatic Growth',
      description: 'Gild emotional or bodily fracture lines with molten 24K gold leaf, honoring scars as symbols of strength and resilience.',
      recommendedPalette: ['#D4AF37', '#FFD700', '#222222', '#333333']
    },
    {
      id: 'art_mandala',
      title: 'HRV Bio-Resonance Mandala',
      modality: 'mandala',
      targetEmotion: 'Anxiety Reduction & Parasympathetic Alignment',
      description: 'Paint symmetrical bio-resonance mandalas synchronized with 6-second diaphragmatic breath cycles.',
      recommendedPalette: ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6']
    },
    {
      id: 'art_chromesthesia',
      title: 'Chromesthesia Color-Sound Canvas',
      modality: 'chromesthesia',
      targetEmotion: 'Sensory Integration & Neuro-Divergent Expression',
      description: 'Paint vibrant color waves that translate visual hues into 528 Hz / 432 Hz Solfeggio audio frequencies.',
      recommendedPalette: ['#EC4899', '#F59E0B', '#10B981', '#6366F1']
    }
  ];

  /**
   * Translates visual color hex codes to Solfeggio sound frequency Hz.
   */
  getColorToFrequencyHz(hexColor: string): number {
    if (hexColor.includes('10B981') || hexColor.includes('emerald')) return 528; // Transformation
    if (hexColor.includes('3B82F6') || hexColor.includes('blue')) return 432; // Harmonic
    if (hexColor.includes('EC4899') || hexColor.includes('pink')) return 639; // Heart Connection
    return 528;
  }
}
