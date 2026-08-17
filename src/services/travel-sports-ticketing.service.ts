import { Injectable, signal, computed, inject } from '@angular/core';
import { TransitWellnessGatewayService } from './transit-wellness-gateway.service';

export interface IAirlineTicketOffer {
  offerId: string;
  airlineName: string;
  flightNumber: string;
  originIata: string;
  destinationIata: string;
  departureTime: string;
  ticketPriceUsd: number;
  circadianRating: 'OPTIMAL_CIRCADIAN' | 'LOW_JETLAG_RISK' | 'RED_EYE';
  wellnessAddOnIncluded: boolean;
  affiliateCommissionEstimatedUsd: number;
}

export interface ISportsTicketOffer {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  venueName: string;
  eventDate: string;
  ticketPriceUsd: number;
  fastTrackBioPassAccess: boolean;
  stadiumNoiseProtectionKit: boolean;
  affiliateCommissionEstimatedUsd: number;
}

@Injectable({
  providedIn: 'root'
})
export class TravelSportsTicketingService {
  private transitGateway = inject(TransitWellnessGatewayService);

  readonly featuredFlightOffers = signal<IAirlineTicketOffer[]>([
    {
      offerId: 'flt_sfo_lhr_01',
      airlineName: 'United Airlines (Fly-Well Partner)',
      flightNumber: 'UA 930',
      originIata: 'SFO',
      destinationIata: 'LHR',
      departureTime: '19:45',
      ticketPriceUsd: 840,
      circadianRating: 'OPTIMAL_CIRCADIAN',
      wellnessAddOnIncluded: true,
      affiliateCommissionEstimatedUsd: 42.00
    },
    {
      offerId: 'flt_bos_sfo_02',
      airlineName: 'Delta Air Lines',
      flightNumber: 'DL 472',
      originIata: 'BOS',
      destinationIata: 'SFO',
      departureTime: '08:30',
      ticketPriceUsd: 390,
      circadianRating: 'LOW_JETLAG_RISK',
      wellnessAddOnIncluded: true,
      affiliateCommissionEstimatedUsd: 19.50
    }
  ]);

  readonly featuredSportsOffers = signal<ISportsTicketOffer[]>([
    {
      eventId: 'evt_stanford_cal_01',
      homeTeam: 'Stanford Cardinal 🌲',
      awayTeam: 'Cal Bears 🐻',
      venueName: 'Stanford Stadium (Bio-Pass Gate 3)',
      eventDate: '2026-11-21',
      ticketPriceUsd: 125,
      fastTrackBioPassAccess: true,
      stadiumNoiseProtectionKit: true,
      affiliateCommissionEstimatedUsd: 8.75
    },
    {
      offerId: 'evt_nfl_patriots_02',
      homeTeam: 'New England Patriots 🏈',
      awayTeam: 'San Francisco 49ers 🌉',
      venueName: 'Gillette Stadium (Arena Coherence Arch)',
      eventDate: '2026-10-18',
      ticketPriceUsd: 210,
      fastTrackBioPassAccess: true,
      stadiumNoiseProtectionKit: true,
      affiliateCommissionEstimatedUsd: 14.70
    } as unknown as ISportsTicketOffer
  ]);

  readonly totalAffiliateRevenueGeneratedUsd = signal<number>(348.50);

  bookFlightTicket(offerId: string): void {
    const offer = this.featuredFlightOffers().find(f => f.offerId === offerId);
    if (offer) {
      this.totalAffiliateRevenueGeneratedUsd.update(val => val + offer.affiliateCommissionEstimatedUsd);
      if (typeof window !== 'undefined') {
        alert(`Redirecting to ${offer.airlineName} checkout. $${offer.affiliateCommissionEstimatedUsd.toFixed(2)} affiliate revenue logged for Pocketgull Philanthropic Fund.`);
      }
    }
  }

  bookSportsTicket(eventId: string): void {
    const event = this.featuredSportsOffers().find(e => e.eventId === eventId);
    if (event) {
      this.totalAffiliateRevenueGeneratedUsd.update(val => val + event.affiliateCommissionEstimatedUsd);
      if (typeof window !== 'undefined') {
        alert(`Redirecting to ${event.venueName} ticket checkout with Fast-Track Bio-Pass entry. $${event.affiliateCommissionEstimatedUsd.toFixed(2)} affiliate revenue logged.`);
      }
    }
  }
}
