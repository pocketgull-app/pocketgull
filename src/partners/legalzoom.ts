import { Injectable, signal, computed } from '@angular/core';

export interface ILegalZoomPartnerConfig {
  partnerId: string;
  partnerName: string;
  impactChecklistId: string;
  officialPartnerProgramUrl: string;
  impactRadiusPartnerTrackingUrl: string;
  sovereignDataDirectivesSupported: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LegalZoomPartnerModuleService {
  readonly partnerConfig = signal<ILegalZoomPartnerConfig>({
    partnerId: 'partner_legalzoom_01',
    partnerName: 'LegalZoom Digital Estate & Living Will Connector',
    impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL',
    officialPartnerProgramUrl: 'https://www.legalzoom.com/partner-programs',
    impactRadiusPartnerTrackingUrl: 'https://app.impact.com/secure/mediapartner/checklist/checklist-instance.ihtml?id=___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL',
    sovereignDataDirectivesSupported: true
  });

  readonly features = computed(() => [
    'Client-Side Sovereign Data Will Generation',
    'Living Healthcare Directive & Power of Attorney',
    'HIPAA §164.514 Safe Harbor De-Identified Data Release',
    'Impact.com Affiliate Media Partner Link Integration'
  ]);
}
