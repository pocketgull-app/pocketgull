import { Injectable, signal, computed } from '@angular/core';

export interface ITicketmasterPartnerConfig {
  partnerId: string;
  partnerName: string;
  category: 'SPORTS_ARENA_TICKETING';
  impactChecklistId: string;
  supportedVenues: string[];
  fastTrackBioPassEnabled: boolean;
  acousticEarplugKitIncluded: boolean;
  affiliateCommissionPct: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketmasterPartnerModuleService {
  readonly partnerConfig = signal<ITicketmasterPartnerConfig>({
    partnerId: 'partner_ticketmaster_seatgeek_01',
    partnerName: 'SeatGeek, Ticketmaster & AXS Fast-Track Arena Bio-Pass Connector',
    category: 'SPORTS_ARENA_TICKETING',
    impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL',
    supportedVenues: [
      'Stanford Stadium 🌲',
      'Gillette Stadium 🏈',
      'TD Garden 🏀',
      'Chase Center 🌉'
    ],
    fastTrackBioPassEnabled: true,
    acousticEarplugKitIncluded: true,
    affiliateCommissionPct: 5.5
  });

  readonly features = computed(() => [
    'SeatGeek / Ticketmaster / AXS Impact Radius Affiliate Revenue Tracking',
    'Fast-Track Arena Bio-Pass Entry Arch',
    'Acoustic Decibel Noise Protection Kit',
    'Inter-Collegiate Bio-Coherence Student Section Access'
  ]);
}
