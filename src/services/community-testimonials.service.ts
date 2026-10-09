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

export const SEED_TESTIMONIALS: ICommunityTestimonial[] = [];

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
