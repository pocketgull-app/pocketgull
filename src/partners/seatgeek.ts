import { Injectable, signal, computed } from '@angular/core';

export interface ISeatGeekPartnerConfig {
  partnerId: string;
  partnerName: string;
  developerPortalUrl: string;
  attributionLogoUrl: string;
  seatgeekSiteUrl: string;
  requiresLogoAttribution: boolean;
  termsLastUpdated: string;
  privacyGuardrail: 'HIPAA_SAFE_HARBOR_164_514' | 'APPLICATION_EULA_CONSENT';
}

@Injectable({
  providedIn: 'root'
})
export class SeatGeekPartnerModuleService {
  readonly partnerConfig = signal<ISeatGeekPartnerConfig>({
    partnerId: 'partner_seatgeek_official_01',
    partnerName: 'SeatGeek Official API/SDK Connector',
    developerPortalUrl: 'https://developer.seatgeek.com/login',
    attributionLogoUrl: 'https://seatgeek.com/press',
    seatgeekSiteUrl: 'https://seatgeek.com',
    requiresLogoAttribution: true,
    termsLastUpdated: '2025-03-17',
    privacyGuardrail: 'APPLICATION_EULA_CONSENT'
  });

  readonly complianceGuidelines = computed(() => [
    'Display SeatGeek Logo Attribution linking directly to https://seatgeek.com',
    'Explicit End-User Affirmative Authorization for all ticket booking actions',
    'Zero Non-Consensual Personal Data Processing or Automated Data Mining',
    'Third-Party Disclaimer (No Direct Endorsement or Sponsorship Implied)'
  ]);
}
