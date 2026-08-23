import { INantucketTrail } from '../types.js';

export const NANTUCKET_TRAILS: INantucketTrail[] = [
  {
    id: 'sanford-farm',
    name: 'Sanford Farm, Ram Pasture & The Ocean',
    location: 'Madaket Road (West / Southwest)',
    conservationGroup: 'Nantucket Conservation Foundation (NCF)',
    riskRating: 'Extreme',
    habitatType: 'Coastal grassland, dense shrubland, pitch pine & open pasture',
    distance: '3.1 to 6.4 miles (Loop)',
    keySafetyTip: 'Stay in the center of the mowed carriage paths. Avoid brushing against waist-high scrub oak and huckleberry where questing nymph ticks are densest.',
    coordinates: { lat: 41.2672, lng: -70.1584 }
  },
  {
    id: 'middle-moors',
    name: 'Middle Moors & Serengeti Plain',
    location: 'Milestone Road (Central Island)',
    conservationGroup: 'NCF & Nantucket Land Bank',
    riskRating: 'Extreme',
    habitatType: 'Sandplain grassland, coastal heathland & scrub oak barrens',
    distance: '4.5 miles',
    keySafetyTip: 'White-tailed deer and white-footed mouse populations are dense here. Wear pre-treated permethrin gaiters and inspect gear immediately upon exiting.',
    coordinates: { lat: 41.2721, lng: -70.0512 }
  },
  {
    id: 'coskata-coatue',
    name: 'Coskata-Coatue Wildlife Refuge',
    location: 'Wauwinet (Northeast Peninsula)',
    conservationGroup: 'The Trustees of Reservations',
    riskRating: 'High',
    habitatType: 'Maritime cedar savanna, barrier beach dunes & salt marsh margins',
    distance: 'Up to 16 miles (Vehicle/Foot)',
    keySafetyTip: 'Extremely remote with patchy/zero cell reception. Carry physical tweezers, an offline-accessible guide, and avoid dune grass fringes.',
    coordinates: { lat: 41.3481, lng: -70.0249 }
  },
  {
    id: 'squam-swamp',
    name: 'Squam Swamp Nature Trail',
    location: 'Wauwinet Road (East Island)',
    conservationGroup: 'Nantucket Conservation Foundation',
    riskRating: 'Extreme',
    habitatType: 'Deciduous hardwood swamp, vernal pools, dense canopy ferns & sphagnum moss',
    distance: '1.75 mile loop',
    keySafetyTip: 'High humidity and dense shaded leaf litter provide ideal survival conditions for Ixodes scapularis nymphs from June to August.',
    coordinates: { lat: 41.3112, lng: -69.9984 }
  },
  {
    id: 'polpis-harbor',
    name: 'Masquetuck & Polpis Harbor Marsh',
    location: 'Polpis Road (Northeast)',
    conservationGroup: 'Nantucket Conservation Foundation',
    riskRating: 'High',
    habitatType: 'Salt marsh border, red maple swamp & young woodland',
    distance: '1.0 mile loop',
    keySafetyTip: 'Marsh edges support high rodent reservoir activity. Do not walk barefoot or in sandals on wooden boardwalk connectors.',
    coordinates: { lat: 41.2987, lng: -70.0381 }
  },
  {
    id: 'sconset-bluff',
    name: "'Sconset Bluff Walk & Coast",
    location: 'Siasconset Village (Far East)',
    conservationGroup: 'Public Historic Footpath',
    riskRating: 'Moderate',
    habitatType: 'Cottage borders, manicured lawns & coastal bluff edge',
    distance: '1.0 mile (Linear)',
    keySafetyTip: 'Lower risk on open manicured turf, but landscape beds and ivy borders harbor ticks. Check ankles after walking past cottage garden hedges.',
    coordinates: { lat: 41.2635, lng: -69.9621 }
  },
  {
    id: 'tupancy-links',
    name: 'Tupancy Links Cliff Walk',
    location: 'Cliff Road (North Shore)',
    conservationGroup: 'Nantucket Land Bank',
    riskRating: 'Moderate',
    habitatType: 'Open mowed grassland, coastal bluff overlooking Nantucket Sound',
    distance: '1.5 miles (Loop)',
    keySafetyTip: 'Wide open breezes and mowed paths keep risk lower, but dogs running in tall perimeter grasses can pick up ticks.',
    coordinates: { lat: 41.2952, lng: -70.1245 }
  },
  {
    id: 'linda-loring',
    name: 'Linda Loring Nature Foundation Trail',
    location: 'Eel Point Road (Northwest)',
    conservationGroup: 'Linda Loring Nature Foundation',
    riskRating: 'High',
    habitatType: 'Coastal shrubland, pitch pine and vernal pond borders',
    distance: '1.2 miles (Loop)',
    keySafetyTip: 'Stay on central woodchip paths; avoid waist-high huckleberry and bayberry shrubs.',
    coordinates: { lat: 41.2941, lng: -70.1852 }
  },
  {
    id: 'town-center',
    name: 'Nantucket Historic Town Center & Harbor',
    location: 'Downtown Nantucket (North Central)',
    conservationGroup: 'Historic District / Town of Nantucket',
    riskRating: 'Moderate',
    habitatType: 'Cobblestone streets, brick paths & residential gardens',
    distance: 'Urban walking',
    keySafetyTip: 'Ticks enter urban yards via suburban deer and songbirds. Pets walking through pocket parks require daily tick checks.',
    coordinates: { lat: 41.2835, lng: -70.0995 }
  }
];
