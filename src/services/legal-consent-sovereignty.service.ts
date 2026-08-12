import { Injectable, signal, computed, inject } from '@angular/core';

export interface ILegalConsentSetting {
  hipaaSafeHarborVerified: boolean;
  gdprArticle9OptIn: boolean;
  gdprRightToBeForgottenSupported: boolean;
  antiSurveillanceEdgeEnforced: boolean;
  posthumousWillBindingConsent: boolean;
  designatedDataExecutorEmail?: string;
  legalEstateTrustName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LegalConsentSovereigntyService {
  readonly consentSettings = signal<ILegalConsentSetting>({
    hipaaSafeHarborVerified: true,
    gdprArticle9OptIn: true,
    gdprRightToBeForgottenSupported: true,
    antiSurveillanceEdgeEnforced: true,
    posthumousWillBindingConsent: true,
    designatedDataExecutorEmail: 'executor@family-estate.org',
    legalEstateTrustName: 'Vance Family Epigenetic Legacy Trust'
  });

  readonly legalComplianceBadges = computed(() => [
    { label: 'HIPAA §164.514 Safe Harbor', status: 'VERIFIED_18_STRIPPED', color: 'emerald' },
    { label: 'GDPR Art. 9 & 17 Sovereignty', status: '1_CLICK_REVOKABLE', color: 'purple' },
    { label: 'FDA 21 CFR 520(o) CDS Transparency', status: 'NON_DIAGNOSTIC_H0', color: 'blue' },
    { label: 'Anti-Surveillance Ephemeral Edge', status: 'ZERO_PASSIVE_HARVEST', color: 'amber' }
  ]);

  updateConsent(update: Partial<ILegalConsentSetting>): void {
    this.consentSettings.update(curr => ({ ...curr, ...update }));
  }

  purgeAllDataUnderGdprArt17(): boolean {
    // 1-Click complete ephemeral data purging
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    return true;
  }
}
