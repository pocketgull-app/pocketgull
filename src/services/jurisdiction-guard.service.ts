import { Injectable, signal, computed } from '@angular/core';

export type SupportedJurisdiction = 'US' | 'PR' | 'VI' | 'GU' | 'AS' | 'MP' | 'UM' | 'INTERNATIONAL';

export interface IJurisdictionalCompliance {
  countryCode: string;
  isUsJurisdiction: boolean;
  activeRegulatoryFramework: 'US_FEDERAL_HIPAA_SSA_CMS' | 'INTERNATIONAL_WHO_GDPR';
  restrictedFeatures: string[];
  permittedFeatures: string[];
  disclaimer: string;
}

@Injectable({
  providedIn: 'root'
})
export class JurisdictionGuardService {
  // Current detected or user-selected country code (ISO 3166-1 alpha-2)
  readonly countryCode = signal<string>('US');

  // Valid US Federal & Territorial Jurisdictions
  private readonly US_JURISDICTIONS = new Set(['US', 'PR', 'VI', 'GU', 'AS', 'MP', 'UM']);

  // US-Only Domestic Statutory Systems
  private readonly US_ONLY_FEATURES = [
    'SSA_BLUE_BOOK_DISABILITY',
    'SSA_COMPASSIONATE_ALLOWANCES_CAL',
    'SSA_FORMS_3368_3373_44',
    'MEDICARE_IRMAA_SURCHARGE_APPEALS',
    'VA_PACT_ACT_MILITARY_TOXIC_REGISTRY',
    'CMS_DA_VINCI_PRIOR_AUTH',
    'HEDIS_STAR_RATINGS_NCQA',
    'HIPAA_SAFE_HARBOR_DE_ID'
  ];

  // Global Universal Clinical Systems
  private readonly GLOBAL_FEATURES = [
    'THREE_JS_3D_ANATOMY_VIEWER',
    'GENESIS_BIOPHYSICAL_PBR_SUBSTRATE',
    'FHIR_R4_INTEROPERABILITY_CORE',
    'WHO_CDC_HEALTH_EQUITY_INDEX',
    'WEBGPU_RPPG_TREMOR_ANALYZER',
    'ZEN_SANCTUARY_VAGAL_RESET',
    'PRECISION_NUTRITION_METABOLISM'
  ];

  /** Whether the active session is strictly within United States territorial jurisdiction */
  readonly isUsJurisdiction = computed<boolean>(() => {
    return this.US_JURISDICTIONS.has(this.countryCode().toUpperCase().trim());
  });

  /** Whether Social Security Administration (SSA) disability & Blue Book tools are accessible */
  readonly isSsaAccessible = computed<boolean>(() => this.isUsJurisdiction());

  /** Whether Medicare IRMAA Surcharges & SSA-44 Appeals are accessible */
  readonly isMedicareIrmaaAccessible = computed<boolean>(() => this.isUsJurisdiction());

  /** Whether Veterans Affairs (VA) PACT Act claims are accessible */
  readonly isVaVeteransAccessible = computed<boolean>(() => this.isUsJurisdiction());

  /** Comprehensive jurisdictional compliance snapshot */
  readonly complianceStatus = computed<IJurisdictionalCompliance>(() => {
    const isUs = this.isUsJurisdiction();
    const code = this.countryCode().toUpperCase().trim();

    return {
      countryCode: code,
      isUsJurisdiction: isUs,
      activeRegulatoryFramework: isUs ? 'US_FEDERAL_HIPAA_SSA_CMS' : 'INTERNATIONAL_WHO_GDPR',
      restrictedFeatures: isUs ? [] : [...this.US_ONLY_FEATURES],
      permittedFeatures: isUs ? [...this.GLOBAL_FEATURES, ...this.US_ONLY_FEATURES] : [...this.GLOBAL_FEATURES],
      disclaimer: isUs
        ? '🇺🇸 US Jurisdiction Active: Full access to Federal SSA Blue Book, Medicare IRMAA, and VA PACT Act suites.'
        : '🌐 International Access: American statutory features (SSA, Medicare, VA) are strictly restricted to the United States region per federal data sovereignty guidelines.'
    };
  });

  /**
   * Evaluates if a given feature key is permitted in the current jurisdiction.
   */
  public isFeaturePermitted(featureKey: string): boolean {
    if (this.US_ONLY_FEATURES.includes(featureKey)) {
      return this.isUsJurisdiction();
    }
    return true;
  }

  /**
   * Asserts US jurisdiction before executing a statutory operation.
   * Throws an error if invoked outside the United States.
   */
  public assertUsJurisdiction(featureName: string): void {
    if (!this.isUsJurisdiction()) {
      throw new Error(
        `[Jurisdiction Error] "${featureName}" is an American federal statutory tool and is only accessible from within the United States (US / US Territories).`
      );
    }
  }

  /**
   * Updates the detected country code (e.g. from server headers or user selection).
   */
  public setCountry(code: string): void {
    if (code && typeof code === 'string') {
      this.countryCode.set(code.trim().toUpperCase());
    }
  }
}
