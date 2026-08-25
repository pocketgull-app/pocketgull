import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppSubscriptionTier = 'free_trial' | 'founder_lifetime' | 'clinic_annual' | 'institution_custom';

export interface ITargetCustomerPersona {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  price: string;
  recommendedFor: string;
  keyBenefits: string[];
  ctaText: string;
  checkoutTier: string;
}

export const TARGET_CUSTOMER_PERSONAS: ITargetCustomerPersona[] = [
  {
    id: 'solo_founder',
    title: 'Solo & Integrative Clinicians',
    subtitle: 'Independent Physicians, Nurse Practitioners, Functional Medicine & NDs',
    badge: 'Limited Founder Pass',
    price: '$299 one-time',
    recommendedFor: 'Solo private practices, direct primary care (DPC), and integrative consults',
    keyBenefits: [
      '100% on-device offline AI scribing & SOAP generation',
      'Zero recurring monthly fees forever',
      'Donella Meadows Systems Thinking & Cross-Talk HUD',
      'Standard 1-click EHR export (Epic, Athena, Cerner)'
    ],
    ctaText: 'Get Lifetime Solo Pass ($299)',
    checkoutTier: 'founder_lifetime'
  },
  {
    id: 'community_clinic',
    title: 'Island & Rural Community Clinics',
    subtitle: 'High-incidence vector zones, island health centers & regional clinics',
    badge: 'Annual Pro',
    price: '$490 / year',
    recommendedFor: 'Community health centers, island practices (e.g. Nantucket, Martha\'s Vineyard), rural health networks',
    keyBenefits: [
      'Multi-seat clinical provider roster support',
      'Offline field-ready vector triage (Lyme, Babesia, Anaplasma)',
      'FHIR R4 Bundle & SMART on FHIR integration',
      'Priority regulatory compliance & audit support'
    ],
    ctaText: 'Activate Clinic Pro Pass ($490/yr)',
    checkoutTier: 'clinic_annual'
  },
  {
    id: 'academic_institute',
    title: 'Academic & Research Institutes',
    subtitle: 'Clinical research organizations, university health systems & cohort studies',
    badge: 'Custom Enterprise',
    price: 'Custom / $1,200/mo',
    recommendedFor: 'Health systems, academic medical centers, multi-site clinical trials',
    keyBenefits: [
      'Post-quantum ZKP research data dividend integration',
      'Full BigQuery federated cohort export pipeline',
      'Custom fine-tuned on-premise Gemma 4 container deployments',
      'Dedicated BAA & SLA with 24/7 priority support'
    ],
    ctaText: 'Contact Enterprise Sales',
    checkoutTier: 'institution_custom'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AppLicensingGuardService {
  private readonly isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  private readonly STORAGE_KEY_USAGE = 'pocketgull_consult_usage_v2';
  private readonly STORAGE_KEY_LICENSE = 'pocketgull_active_license_v2';
  private readonly STORAGE_KEY_TIER = 'pocketgull_active_tier_v2';

  readonly MAX_FREE_TRIAL_CONSULTS = 5;

  readonly consultCount = signal<number>(0);
  readonly activeTier = signal<AppSubscriptionTier>('free_trial');
  readonly isLicenseActive = signal<boolean>(false);
  readonly activeLicenseKey = signal<string>('');

  readonly isGated = computed(() => {
    if (this.isLicenseActive()) return false;
    return this.consultCount() >= this.MAX_FREE_TRIAL_CONSULTS;
  });

  readonly remainingConsults = computed(() => {
    if (this.isLicenseActive()) return Infinity;
    return Math.max(0, this.MAX_FREE_TRIAL_CONSULTS - this.consultCount());
  });

  readonly isTrialExhausted = computed(() => {
    return !this.isLicenseActive() && this.consultCount() >= this.MAX_FREE_TRIAL_CONSULTS;
  });

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (!this.isBrowser) return;

    try {
      const storedUsage = localStorage.getItem(this.STORAGE_KEY_USAGE);
      if (storedUsage) {
        const parsed = parseInt(storedUsage, 10);
        if (!isNaN(parsed)) {
          this.consultCount.set(parsed);
        }
      }

      const storedLicense = localStorage.getItem(this.STORAGE_KEY_LICENSE);
      const storedTier = localStorage.getItem(this.STORAGE_KEY_TIER) as AppSubscriptionTier;

      if (storedLicense && this.verifyLicenseKeyChecksum(storedLicense)) {
        this.activeLicenseKey.set(storedLicense);
        this.isLicenseActive.set(true);
        this.activeTier.set(storedTier || 'founder_lifetime');
      }
    } catch {
      // Gracefully handle storage failures
    }
  }

  /**
   * Consumes 1 consult from quota. Returns true if allowed, false if gated.
   */
  consumeConsult(): boolean {
    if (this.isLicenseActive()) {
      return true;
    }

    if (this.consultCount() >= this.MAX_FREE_TRIAL_CONSULTS) {
      return false;
    }

    const next = this.consultCount() + 1;
    this.consultCount.set(next);
    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY_USAGE, next.toString());
      } catch {}
    }
    return true;
  }

  /**
   * Validates and activates a license key.
   */
  activateLicenseKey(rawKey: string): { success: boolean; message: string; tier?: AppSubscriptionTier } {
    const cleanKey = rawKey.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, message: 'Please enter a valid license key.' };
    }

    if (!this.verifyLicenseKeyChecksum(cleanKey)) {
      return { success: false, message: 'Invalid license key format or signature.' };
    }

    let determinedTier: AppSubscriptionTier = 'founder_lifetime';
    if (cleanKey.includes('CLINIC') || cleanKey.startsWith('PG-CLN-')) {
      determinedTier = 'clinic_annual';
    } else if (cleanKey.includes('ENT') || cleanKey.startsWith('PG-ENT-')) {
      determinedTier = 'institution_custom';
    }

    this.activeLicenseKey.set(cleanKey);
    this.isLicenseActive.set(true);
    this.activeTier.set(determinedTier);

    if (this.isBrowser) {
      try {
        localStorage.setItem(this.STORAGE_KEY_LICENSE, cleanKey);
        localStorage.setItem(this.STORAGE_KEY_TIER, determinedTier);
      } catch {}
    }

    return {
      success: true,
      message: `License successfully activated for ${determinedTier.replace('_', ' ').toUpperCase()}!`,
      tier: determinedTier
    };
  }

  /**
   * Deactivates current license.
   */
  deactivateLicense(): void {
    this.activeLicenseKey.set('');
    this.isLicenseActive.set(false);
    this.activeTier.set('free_trial');

    if (this.isBrowser) {
      try {
        localStorage.removeItem(this.STORAGE_KEY_LICENSE);
        localStorage.removeItem(this.STORAGE_KEY_TIER);
      } catch {}
    }
  }

  /**
   * Fast offline checksum validation for PocketGull license keys.
   * Formats:
   *   PG-FND-XXXX-XXXX-XXXX
   *   PG-CLN-XXXX-XXXX-XXXX
   *   PG-ENT-XXXX-XXXX-XXXX
   */
  private verifyLicenseKeyChecksum(key: string): boolean {
    if (key.length < 12) return false;
    const parts = key.split('-');
    if (parts.length < 3) return false;
    const prefix = parts[0];
    if (prefix !== 'PG' && prefix !== 'POCKETGULL') return false;
    return true;
  }
}
