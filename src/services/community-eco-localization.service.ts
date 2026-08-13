import { Injectable, signal, computed } from '@angular/core';

export type EcoHubType = 
  | 'FARMERS_MARKET'
  | 'COMMUNITY_GARDEN'
  | 'FOREST_PARK'
  | 'GREENWAY_BIKE_PATH'
  | 'SEED_TOOL_LIBRARY';

export interface IEcoHubLocation {
  id: string;
  type: EcoHubType;
  name: string;
  address: string;
  distanceMiles: number;
  description: string;
  ecoBenefit: string;
  openingHours?: string;
  websiteUrl?: string;
}

export interface ILocalizedEcoResult {
  city: string;
  region: string;
  zipCode?: string;
  hubs: IEcoHubLocation[];
  closestParkMiles: number;
  closestMarketMiles: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityEcoLocalizationService {

  public readonly currentCity = signal<string>('San Francisco');
  public readonly currentRegion = signal<string>('CA');

  public readonly localHubs = signal<IEcoHubLocation[]>([
    {
      id: 'hub_1',
      type: 'FARMERS_MARKET',
      name: 'Ferry Building Organic Farmers Market',
      address: '1 Ferry Building, San Francisco, CA',
      distanceMiles: 1.2,
      description: 'Regional organic farm produce, local legumes, fresh herbs, and bio-diverse honey.',
      ecoBenefit: 'Zero-food-mile EAT-Lancet planetary health nutrition.',
      openingHours: 'Sat 8:00 AM - 2:00 PM',
      websiteUrl: 'https://foodwise.org'
    },
    {
      id: 'hub_2',
      type: 'COMMUNITY_GARDEN',
      name: 'Alemany Community Urban Farm & Garden',
      address: '700 Alemany Blvd, San Francisco, CA',
      distanceMiles: 3.4,
      description: 'Public community plot for organic vegetable cultivation and soil microbiome contact.',
      ecoBenefit: 'Soil Mycobacterium vaccae serotonin boost & community connection.',
      openingHours: 'Daily Sunrise - Sunset'
    },
    {
      id: 'hub_3',
      type: 'FOREST_PARK',
      name: 'Golden Gate Park Botanical Gardens & Redwood Grove',
      address: '1199 9th Ave, San Francisco, CA',
      distanceMiles: 2.1,
      description: 'Old-growth redwoods, eucalyptus, and quiet canopy trails for Shinrin-yoku forest bathing.',
      ecoBenefit: 'Airborne tree phytoncides boosting Natural Killer (NK) antiviral immunity.',
      openingHours: 'Daily 7:30 AM - 6:00 PM'
    },
    {
      id: 'hub_4',
      type: 'GREENWAY_BIKE_PATH',
      name: 'Embarcadero Coastal Protected Greenway',
      address: 'Embarcadero Promenade, San Francisco, CA',
      distanceMiles: 0.8,
      description: 'Car-free coastal bike path and pedestrian promenade connecting water views.',
      ecoBenefit: 'Active transit exercise lowering blood glucose and zero vehicular emissions.',
      openingHours: '24/7'
    },
    {
      id: 'hub_5',
      type: 'SEED_TOOL_LIBRARY',
      name: 'SF Public Seed Sharing & Tool Library',
      address: '100 Larkin St, San Francisco, CA',
      distanceMiles: 1.5,
      description: 'Free heirloom organic seeds, gardening tool loans, and community compost drop-off.',
      ecoBenefit: 'Circular micro-waste reduction and seed biodiversity preservation.',
      openingHours: 'Tue-Sat 10:00 AM - 5:00 PM'
    }
  ]);

  public localizedEcoSummary = computed<ILocalizedEcoResult>(() => {
    const list = this.localHubs();
    const parks = list.filter(h => h.type === 'FOREST_PARK');
    const markets = list.filter(h => h.type === 'FARMERS_MARKET');

    const minParkDist = parks.length > 0 ? Math.min(...parks.map(p => p.distanceMiles)) : 0;
    const minMarketDist = markets.length > 0 ? Math.min(...markets.map(m => m.distanceMiles)) : 0;

    return {
      city: this.currentCity(),
      region: this.currentRegion(),
      hubs: list,
      closestParkMiles: minParkDist,
      closestMarketMiles: minMarketDist
    };
  });

  public getHubsByType(type: EcoHubType): IEcoHubLocation[] {
    return this.localHubs().filter(h => h.type === type);
  }
}
