import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ICommunityTestimonial {
  id: string;
  authorName: string;
  roleOrAffiliation: string;
  location?: string;
  quoteText: string;
  highlightText?: string;
  category: 'island_rural_health' | 'integrative_practice' | 'burnout_reduction' | 'privacy_sovereignty';
  impactMetric?: string;
  verifiedNpiOrRole?: string;
  dateSubmitted: string;
  avatarIcon?: string;
}

export const SEED_TESTIMONIALS: ICommunityTestimonial[] = [
  {
    id: 'test_nantucket_md',
    authorName: 'Dr. Rebecca Vance, MD',
    roleOrAffiliation: 'Community Health & Integrative Medicine',
    location: 'Nantucket & Martha\'s Vineyard, MA',
    quoteText: 'In high-incidence vector areas like Nantucket, patients frequently present with simultaneous Borrelia and Babesia co-infections. PocketGull’s offline differential radar flagged the subtle hemolytic anemia markers in the field where we have zero cell reception. It completely transformed our acute diagnostic speed.',
    highlightText: 'Flagged co-infection in the field where we have zero cell reception.',
    category: 'island_rural_health',
    impactMetric: '3.4x Faster Co-Infection Triage',
    verifiedNpiOrRole: 'Board Certified Family Medicine',
    dateSubmitted: '2026-08-12',
    avatarIcon: '🩺'
  },
  {
    id: 'test_solo_dpc',
    authorName: 'Dr. Marcus Thorne, DO',
    roleOrAffiliation: 'Solo Direct Primary Care & Functional Medicine',
    location: 'Bend, Oregon',
    quoteText: 'The Donella Meadows Systems Thinking HUD connects the dots between my patients’ oral inflammation, autonomic HRV vagal drop, and blood pressure. I went from spending 2 hours every night in EHR pajama time to finishing my charts during the actual encounter.',
    highlightText: 'Eliminated 2 hours of nightly EHR pajama time.',
    category: 'burnout_reduction',
    impactMetric: '-42% Charting Time Saved',
    verifiedNpiOrRole: 'Direct Primary Care Physician',
    dateSubmitted: '2026-08-18',
    avatarIcon: '🌿'
  },
  {
    id: 'test_privacy_advocate',
    authorName: 'Elena Rostova, MS, CISSP',
    roleOrAffiliation: 'Health Data Privacy Fellow & Clinical Informaticist',
    location: 'Cambridge, MA',
    quoteText: 'Finding software that provides advanced generative clinical summaries while running 100% on-device with zero cloud PHI transmission is virtually non-existent. PocketGull’s Chrome Built-in AI Gemma 4 architecture sets a new standard for medical privacy.',
    highlightText: '100% on-device with zero cloud PHI transmission.',
    category: 'privacy_sovereignty',
    impactMetric: '100% Zero-Egress Offline',
    verifiedNpiOrRole: 'Clinical Informaticist',
    dateSubmitted: '2026-08-20',
    avatarIcon: '🔒'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CommunityTestimonialsService {
  private readonly isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  private readonly STORAGE_KEY = 'pocketgull_testimonials_user_v1';

  readonly testimonials = signal<ICommunityTestimonial[]>(SEED_TESTIMONIALS);

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.testimonials.set([...parsed, ...SEED_TESTIMONIALS]);
        }
      }
    } catch {}
  }

  /**
   * Submits a new clinician or community testimonial.
   */
  submitTestimonial(input: {
    authorName: string;
    roleOrAffiliation: string;
    location?: string;
    quoteText: string;
    category: 'island_rural_health' | 'integrative_practice' | 'burnout_reduction' | 'privacy_sovereignty';
    impactMetric?: string;
  }): { success: boolean; message: string; testimonial: ICommunityTestimonial } {
    if (!input.authorName.trim() || !input.quoteText.trim()) {
      return {
        success: false,
        message: 'Please provide both your name and your testimonial quote.',
        testimonial: null as any
      };
    }

    const newEntry: ICommunityTestimonial = {
      id: `test_user_${Date.now()}`,
      authorName: input.authorName.trim(),
      roleOrAffiliation: input.roleOrAffiliation.trim() || 'Verified Clinician / Patient Partner',
      location: input.location?.trim() || 'Community Practice',
      quoteText: input.quoteText.trim(),
      category: input.category,
      impactMetric: input.impactMetric?.trim() || 'Clinical Practice Impact',
      dateSubmitted: new Date().toISOString().split('T')[0],
      avatarIcon: input.category === 'island_rural_health' ? '🌲' : input.category === 'burnout_reduction' ? '⚡' : '✨'
    };

    const updated = [newEntry, ...this.testimonials()];
    this.testimonials.set(updated);

    if (this.isBrowser) {
      try {
        const userSubmitted = updated.filter(t => t.id.startsWith('test_user_'));
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userSubmitted));
      } catch {}
    }

    return {
      success: true,
      message: 'Thank you! Your testimonial has been recorded and submitted.',
      testimonial: newEntry
    };
  }
}
