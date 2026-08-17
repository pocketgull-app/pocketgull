import { Injectable, signal, computed } from '@angular/core';

export type ScannerVenueType = 'AIRPORT_TSA' | 'STADIUM_ARENA';

export interface ITransitBodyScanResult {
  scanId: string;
  venueType: ScannerVenueType;
  venueNameOrIata: string; // e.g. 'SFO Airport', 'Stanford Stadium 🌲', 'Gillette Stadium 🏈'
  airportIataCode?: string;
  postureSymmetryScore: number; // e.g. 92%
  spinalCobbAngleDeg: number; // e.g. 3.2 deg
  coreThermalGradientC: number; // e.g. 36.8°C
  hydrationIndexPct: number; // e.g. 84%
  stadiumNoiseDbLimit?: number; // e.g. 108 dB SPL
  recommendedQuests: string[];
  recommendedInFlightQuests?: string[];
  privacyConsentTimestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransitWellnessGatewayService {
  readonly isTsaBioPassActive = signal<boolean>(true);
  readonly isStadiumPassActive = signal<boolean>(true);

  readonly latestTransitScan = signal<ITransitBodyScanResult>({
    scanId: 'scan-sfo-8821',
    venueType: 'AIRPORT_TSA',
    venueNameOrIata: 'SFO International Airport',
    postureSymmetryScore: 92,
    spinalCobbAngleDeg: 3.2,
    coreThermalGradientC: 36.8,
    hydrationIndexPct: 84,
    recommendedQuests: [
      '✈️ Hydration Protocol: 250ml electrolyte water per 2 hours',
      '🧘 In-Seat Ankle Pump & Calf Muscle Vagal Reset',
      '🌅 Circadian Blue-Light Blocking at 20:00 Target Timezone'
    ],
    privacyConsentTimestamp: new Date().toISOString()
  });

  readonly latestStadiumScan = signal<ITransitBodyScanResult>({
    scanId: 'scan-stadium-9901',
    venueType: 'STADIUM_ARENA',
    venueNameOrIata: 'Stanford Stadium 🌲 (Inter-Collegiate Coherence Bowl)',
    postureSymmetryScore: 94,
    spinalCobbAngleDeg: 2.1,
    coreThermalGradientC: 36.9,
    hydrationIndexPct: 88,
    stadiumNoiseDbLimit: 108,
    recommendedQuests: [
      '🎧 Ear Protection Ping: Stadium decibel levels exceed 105 dB',
      '💧 Pre-Game Hydration Electrolyte Refill',
      '🌲 Inter-University Coherence Cup: Contributed +88.4 Coherence Points to Stanford'
    ],
    privacyConsentTimestamp: new Date().toISOString()
  });

  /**
   * Process a voluntary, privacy-sanitized TSA transit or Stadium body scan payload
   */
  importVoluntaryScan(scanData: Partial<ITransitBodyScanResult>): ITransitBodyScanResult {
    const venueType = scanData.venueType || 'STADIUM_ARENA';
    const updated: ITransitBodyScanResult = {
      scanId: `scan-${Math.random().toString(36).substring(2, 8)}`,
      venueType,
      venueNameOrIata: scanData.venueNameOrIata || (venueType === 'STADIUM_ARENA' ? 'MetLife Stadium 🏈' : 'SFO Airport'),
      postureSymmetryScore: scanData.postureSymmetryScore || 91,
      spinalCobbAngleDeg: scanData.spinalCobbAngleDeg || 2.4,
      coreThermalGradientC: scanData.coreThermalGradientC || 36.8,
      hydrationIndexPct: scanData.hydrationIndexPct || 86,
      stadiumNoiseDbLimit: venueType === 'STADIUM_ARENA' ? 106 : undefined,
      recommendedQuests: venueType === 'STADIUM_ARENA' ? [
        '🎧 Active Ear Protection Alert (106 dB)',
        '🏆 Stadium Coherence Contribution Logged'
      ] : [
        '✈️ Mid-Flight Spinal Extension & Micro-Walk',
        '💧 Pre-Boarding Hydration Boost'
      ],
      privacyConsentTimestamp: new Date().toISOString()
    };

    if (venueType === 'STADIUM_ARENA') {
      this.latestStadiumScan.set(updated);
    } else {
      this.latestTransitScan.set(updated);
    }
    return updated;
  }
}
