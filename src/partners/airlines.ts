import { Injectable, signal, computed } from '@angular/core';

export interface IAirlinePartnerOffer {
  airlineId: string;
  airlineName: string;
  iataCode: string;
  circadianFlightOptimization: boolean;
  inFlightHydrationProtocol: boolean;
  affiliateCommissionPct: number;
}

@Injectable({
  providedIn: 'root'
})
export class AirlinePartnerModuleService {
  readonly partnerAirlines = signal<IAirlinePartnerOffer[]>([
    {
      airlineId: 'air_united_01',
      airlineName: 'United Airlines (Fly-Well Partner)',
      iataCode: 'UA',
      circadianFlightOptimization: true,
      inFlightHydrationProtocol: true,
      affiliateCommissionPct: 4.0
    },
    {
      airlineId: 'air_delta_02',
      airlineName: 'Delta Air Lines',
      iataCode: 'DL',
      circadianFlightOptimization: true,
      inFlightHydrationProtocol: true,
      affiliateCommissionPct: 3.8
    },
    {
      airlineId: 'air_ba_03',
      airlineName: 'British Airways',
      iataCode: 'BA',
      circadianFlightOptimization: true,
      inFlightHydrationProtocol: true,
      affiliateCommissionPct: 4.5
    }
  ]);

  readonly totalPartnerAirlinesCount = computed(() => 
    this.partnerAirlines().length
  );
}
