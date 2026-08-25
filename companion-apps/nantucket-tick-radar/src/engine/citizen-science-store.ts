import { ICitizenScienceEncounter, TickSpecies, AttachmentDwellTier } from '../types.js';

const STORAGE_KEY = 'nantucket_tick_citizen_science_v1';

const INITIAL_BENCHMARK_ENCOUNTERS: ICitizenScienceEncounter[] = [
  {
    id: 'enc-001',
    timestamp: '2026-06-14T10:30:00Z',
    trailId: 'sanford-farm',
    species: 'ixodes_nymph',
    dwellTier: '36_to_72h',
    hostType: 'Human',
    notes: 'Found in sock line after loop trail hike.',
    symptomReported: false
  },
  {
    id: 'enc-002',
    timestamp: '2026-06-20T16:15:00Z',
    trailId: 'middle-moors',
    species: 'ixodes_nymph',
    dwellTier: '24_to_36h',
    hostType: 'Human',
    notes: 'Attached behind knee after birdwatching.',
    symptomReported: true
  },
  {
    id: 'enc-003',
    timestamp: '2026-07-02T11:00:00Z',
    trailId: 'squam-swamp',
    species: 'ixodes_adult',
    dwellTier: 'under_24h',
    hostType: 'Canine',
    notes: 'Golden retriever picked up 3 ticks near boardwalk.',
    symptomReported: false
  },
  {
    id: 'enc-004',
    timestamp: '2026-07-15T14:45:00Z',
    trailId: 'coskata-coatue',
    species: 'dermacentor_dog',
    dwellTier: 'unattached',
    hostType: 'Gear / Clothing',
    notes: 'Crawling on backpack after surfcasting.',
    symptomReported: false
  },
  {
    id: 'enc-005',
    timestamp: '2026-08-04T09:20:00Z',
    trailId: 'polpis-harbor',
    species: 'ixodes_nymph',
    dwellTier: '36_to_72h',
    hostType: 'Human',
    notes: 'Nymph tick removed; initiated 72h Doxycycline prophylaxis.',
    symptomReported: false
  },
  {
    id: 'enc-006',
    timestamp: '2026-08-18T17:00:00Z',
    trailId: 'sanford-farm',
    species: 'amblyomma_lonestar',
    dwellTier: 'under_24h',
    hostType: 'Human',
    notes: 'Lone star adult female with white dot.',
    symptomReported: false
  }
];

export class CitizenScienceStore {
  private encounters: ICitizenScienceEncounter[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.encounters = JSON.parse(stored);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory encounters', e);
    }
    this.encounters = [...INITIAL_BENCHMARK_ENCOUNTERS];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.encounters));
      }
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  public getAll(): ICitizenScienceEncounter[] {
    return [...this.encounters].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addEncounter(
    trailId: string,
    species: TickSpecies,
    dwellTier: AttachmentDwellTier,
    hostType: 'Human' | 'Canine' | 'Feline' | 'Gear / Clothing' = 'Human',
    notes = '',
    symptomReported = false
  ): ICitizenScienceEncounter {
    const newEnc: ICitizenScienceEncounter = {
      id: `enc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      trailId,
      species,
      dwellTier,
      hostType,
      notes,
      symptomReported
    };

    this.encounters.unshift(newEnc);
    this.saveToStorage();
    return newEnc;
  }

  public getStats() {
    const total = this.encounters.length;
    const bySpecies: Record<string, number> = {};
    const byTrail: Record<string, number> = {};
    let nymphCount = 0;
    let attachedHighRiskCount = 0;

    for (const enc of this.encounters) {
      bySpecies[enc.species] = (bySpecies[enc.species] || 0) + 1;
      byTrail[enc.trailId] = (byTrail[enc.trailId] || 0) + 1;
      if (enc.species === 'ixodes_nymph') nymphCount++;
      if (enc.dwellTier === '36_to_72h' || enc.dwellTier === 'over_72h') {
        attachedHighRiskCount++;
      }
    }

    return {
      total,
      nymphPercentage: total > 0 ? Math.round((nymphCount / total) * 100) : 0,
      attachedHighRiskCount,
      bySpecies,
      byTrail
    };
  }

  public resetToBenchmarks(): void {
    this.encounters = [...INITIAL_BENCHMARK_ENCOUNTERS];
    this.saveToStorage();
  }
}
