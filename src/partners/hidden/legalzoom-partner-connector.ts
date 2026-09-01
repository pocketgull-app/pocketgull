import { Injectable, signal, computed } from '@angular/core';

export interface IHiddenPartnerDefinition {
  partnerId: string;
  partnerName: string;
  category: 'LEGAL_ESTATE' | 'TRAVEL_SPORTS' | 'COMMERCIAL_HEALTH' | 'FINANCIAL_AFFILIATE';
  isHidden: boolean;
  impactChecklistId?: string;
  officialPortalUrl: string;
  sovereignDataDirectivesSupported: boolean;
  privacyGuardrail: 'HIPAA_SAFE_HARBOR_164_514' | 'GDPR_ART_9_17';
}

@Injectable({
  providedIn: 'root'
})
export class LegalZoomPartnerConnectorService {
  readonly partnerMetadata = signal<IHiddenPartnerDefinition>({
    partnerId: 'partner_legalzoom_hidden_01',
    partnerName: 'LegalZoom Digital Estate & Living Will Connector',
    category: 'LEGAL_ESTATE',
    isHidden: true,
    impactChecklistId: 'IMPACT_CHECKLIST_ID',
    officialPortalUrl: 'https://www.legalzoom.com/partner-programs',
    sovereignDataDirectivesSupported: true,
    privacyGuardrail: 'HIPAA_SAFE_HARBOR_164_514'
  });

  readonly exportCapabilities = computed(() => [
    'Sovereign Digital Data Will Export',
    'Living Healthcare Directive & Power of Attorney',
    'HIPAA §164.514 Safe Harbor De-Identified Release',
    'Client-Side Zero API Key Document Bundle Generation'
  ]);
}
