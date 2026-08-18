import { Injectable, inject, signal, computed, afterNextRender } from '@angular/core';
import { SecureStorageService } from './secure-storage.service';

export type UserAgeTier = 'adult' | 'parent' | 'clinician' | 'minor';

export interface IAgeTierMetadata {
  id: UserAgeTier;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  pediatricSafety: boolean;
  minAge: number;
}

export const AGE_TIER_METADATA: Record<UserAgeTier, IAgeTierMetadata> = {
  adult: {
    id: 'adult',
    title: 'Adult Self-Care',
    subtitle: 'Managing personal health & holistic care strategy (18+)',
    badge: 'Adult 18+',
    color: 'indigo',
    pediatricSafety: false,
    minAge: 18,
  },
  parent: {
    id: 'parent',
    title: 'Parent / Child Guardian',
    subtitle: 'Managing care for a minor child with pediatric safety guardrails',
    badge: 'Pediatric Guardian',
    color: 'emerald',
    pediatricSafety: true,
    minAge: 18,
  },
  clinician: {
    id: 'clinician',
    title: 'Healthcare Clinician',
    subtitle: 'MD, DO, ND, RN, or allied practitioner with LOINC & FHIR telemetry',
    badge: 'Clinician Pro',
    color: 'purple',
    pediatricSafety: false,
    minAge: 18,
  },
  minor: {
    id: 'minor',
    title: 'Youth Self-Care',
    subtitle: 'Health education, lifestyle habits, and mental wellness (<18)',
    badge: 'Youth <18',
    color: 'amber',
    pediatricSafety: true,
    minAge: 13,
  },
};

const AGE_TIER_STORAGE_KEY = 'pg_age_tier_v1';
const AGE_TIER_TS_KEY = 'pg_age_tier_ts_v1';

/**
 * Manages user age gating, persona selection, and clinical safety constraints.
 * Persists choices in SecureStorageService with zero remote leakage.
 */
@Injectable({ providedIn: 'root' })
export class AgeGateService {
  private storage = inject(SecureStorageService);

  /** Active age tier selection */
  readonly userTier = signal<UserAgeTier | null>(null);

  /** Timestamp when tier was selected */
  readonly tierSelectedTimestamp = signal<string | null>(null);

  /** Whether the user has completed the age gate */
  readonly hasSelectedTier = computed<boolean>(() => this.userTier() !== null);

  /** Whether pediatric clinical constraints are active */
  readonly isPediatricMode = computed<boolean>(() => {
    const tier = this.userTier();
    return tier === 'parent' || tier === 'minor';
  });

  /** Whether healthcare clinician expert mode is active */
  readonly isClinicianMode = computed<boolean>(() => this.userTier() === 'clinician');

  /** Whether youth self-care guardrails (helplines, no unverified rx) are active */
  readonly isYouthProtected = computed<boolean>(() => this.userTier() === 'minor');

  /** Active metadata for current tier */
  readonly activeTierMetadata = computed<IAgeTierMetadata | null>(() => {
    const tier = this.userTier();
    return tier ? AGE_TIER_METADATA[tier] : null;
  });

  constructor() {
    if (this.storage.isAvailable) {
      afterNextRender(() => {
        this.loadStoredTier();
      });
    }
  }

  /** Load persisted tier from local encrypted storage */
  public loadStoredTier(): void {
    const stored = this.storage.getItem(AGE_TIER_STORAGE_KEY) as UserAgeTier | null;
    if (stored && Object.keys(AGE_TIER_METADATA).includes(stored)) {
      this.userTier.set(stored);
      this.tierSelectedTimestamp.set(this.storage.getItem(AGE_TIER_TS_KEY));
    }
  }

  /** Select and persist an age / persona tier */
  public selectTier(tier: UserAgeTier): void {
    const now = new Date().toISOString();
    this.userTier.set(tier);
    this.tierSelectedTimestamp.set(now);
    this.storage.setItem(AGE_TIER_STORAGE_KEY, tier);
    this.storage.setItem(AGE_TIER_TS_KEY, now);
  }

  /** Reset tier selection (e.g. from Settings or Profile switcher) */
  public resetTier(): void {
    this.userTier.set(null);
    this.tierSelectedTimestamp.set(null);
    this.storage.removeItem(AGE_TIER_STORAGE_KEY);
    this.storage.removeItem(AGE_TIER_TS_KEY);
  }

  /**
   * Generates system prompt directive context for Gemini based on active tier.
   */
  public getAiDirectivePrompt(): string {
    const tier = this.userTier();
    if (!tier) return '';

    switch (tier) {
      case 'parent':
        return '[CLINICAL DIRECTIVE: PEDIATRIC GUARDIAN SAFETY MODE] Patient is a minor managed by a parent/guardian. Strictly enforce pediatric clinical safety: flag any infant fever (>=100.4F in infants <3 months), mandate weight-based dosing consultation, highlight pediatric red-flag symptoms, and require direct pediatrician evaluation for acute signs.';

      case 'minor':
        return '[CLINICAL DIRECTIVE: YOUTH EDUCATION & CRISIS SAFETY MODE] User is a minor (<18). Provide supportive, encouraging health literacy, sleep, stress, and nutrition education. Do NOT recommend prescription drug modifications or autonomous self-treatment. If acute psychological distress is detected, provide immediate 988 Suicide & Crisis Lifeline (call/text 988) and Crisis Text Line (Text HOME to 741741) resources.';

      case 'clinician':
        return '[CLINICAL DIRECTIVE: HEALTHCARE PRACTITIONER EXPERT MODE] User is a licensed clinician. Present findings with high diagnostic density, explicit LOINC codes, ICD-10 cross-references, Cochrane RoB-2 evidence grades, and Bayesian stopping criteria.';

      case 'adult':
      default:
        return '[CLINICAL DIRECTIVE: ADULT HOLISTIC CARE STRATEGY MODE] User is an adult (18+). Present clear, tri-paradigm consilience (Western Evidence, TCM Zang-Fu, Ayurvedic Doshas) with plain-English summaries and questions to discuss with their healthcare team.';
    }
  }
}
