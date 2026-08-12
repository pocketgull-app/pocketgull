import { Injectable, signal, computed, inject } from '@angular/core';
import { LegalZoomPartnerConnectorService, IHiddenPartnerDefinition } from './legalzoom-partner-connector';

@Injectable({
  providedIn: 'root'
})
export class HiddenPartnersRegistryService {
  private legalZoomConnector = inject(LegalZoomPartnerConnectorService);

  readonly registeredHiddenPartners = signal<IHiddenPartnerDefinition[]>([
    this.legalZoomConnector.partnerMetadata(),
    {
      partnerId: 'partner_flywell_airlines_02',
      partnerName: 'Fly-Well Circadian Airline Ticket Gateway',
      category: 'TRAVEL_SPORTS',
      isHidden: true,
      officialPortalUrl: 'https://pocketgull.app/travel',
      sovereignDataDirectivesSupported: true,
      privacyGuardrail: 'HIPAA_SAFE_HARBOR_164_514'
    },
    {
      partnerId: 'partner_arena_biopass_03',
      partnerName: 'Arena Bio-Pass Fast-Track Sports Ticketing Gateway',
      category: 'TRAVEL_SPORTS',
      isHidden: true,
      officialPortalUrl: 'https://pocketgull.app/sports',
      sovereignDataDirectivesSupported: true,
      privacyGuardrail: 'HIPAA_SAFE_HARBOR_164_514'
    }
  ]);

  readonly activeHiddenPartnersCount = computed(() => 
    this.registeredHiddenPartners().length
  );
}
