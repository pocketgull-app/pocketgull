export interface IIslandLocation {
  id: string;
  name: string;
  category: 'trail' | 'hospital' | 'pharmacy' | 'beach' | 'paved_corridor' | 'landmark' | 'town_hall' | 'library' | 'senior_center' | 'civic_center';
  lat: number;
  lng: number;
  riskRating: 'Zero' | 'Low' | 'Moderate' | 'High' | 'Extreme';
  tickExposureIndex: number; // 0 to 10 scale
  surfaceType: 'Asphalt / Paved' | 'Open Sand / Shore' | 'Mowed Wide Grass' | 'Overgrown Scrub Oak / Heath' | 'Dense Bog / Wetland';
  description: string;
  safetyTip: string;
  googleMapsQuery: string;
}

export interface ISafeCorridorRoute {
  id: string;
  name: string;
  fromLocationId: string;
  toLocationId: string;
  distanceMiles: number;
  estimatedBikeMinutes: number;
  estimatedWalkMinutes: number;
  tickExposureScore: number; // 0 (safest) to 10 (highest risk)
  isPavedCorridor: boolean;
  recommendedZoneArmor: 'Zone 1+2 Armor Required' | 'Zone 2 Skin Only' | 'Zero Chemical Needed';
  routeSummary: string;
  waypointCoordinates: Array<[number, number]>;
}

export const NANTUCKET_ISLAND_CENTER = {
  lat: 41.2835,
  lng: -70.0995,
  zoom: 12
};

export const NANTUCKET_LOCATIONS: IIslandLocation[] = [
  // Town Halls, Libraries & Civic Centers
  {
    id: 'nantucket-town-hall',
    name: 'Nantucket Town Hall (16 Broad St)',
    category: 'town_hall',
    lat: 41.2858,
    lng: -70.0988,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Municipal headquarters for the Town of Nantucket, Select Board chambers, Town Clerk, and municipal public health administration.',
    safetyTip: 'Visit for official island maps, civic meeting agendas, and municipal health notices at 16 Broad Street.',
    googleMapsQuery: 'Nantucket+Town+Hall+16+Broad+St+Nantucket+MA'
  },
  {
    id: 'nantucket-atheneum',
    name: 'Nantucket Atheneum Free Public Library (1 India St)',
    category: 'library',
    lat: 41.2838,
    lng: -70.0994,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Historic free public library offering community research, librarian reference consultations, public Wi-Fi, educational family science kits, and community tick field guides.',
    safetyTip: 'Explore reference archives and children’s science programs at 1 India St in downtown Nantucket.',
    googleMapsQuery: 'Nantucket+Atheneum+1+India+St+Nantucket+MA'
  },
  {
    id: 'saltmarsh-senior-center',
    name: 'Saltmarsh Senior Center (81 Washington St)',
    category: 'senior_center',
    lat: 41.2798,
    lng: -70.0924,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Dedicated community center for island seniors, grandparents, and elder wellness programs with accessible wellness seminars, walking groups, and health consultations.',
    safetyTip: '81 Washington Street — community wellness seminars, senior fitness, and free tick awareness brochures.',
    googleMapsQuery: 'Saltmarsh+Senior+Center+81+Washington+St+Nantucket+MA'
  },
  {
    id: 'nantucket-health-dept',
    name: 'Nantucket Health & Human Services / Tick Drop-off (131 Pleasant St)',
    category: 'civic_center',
    lat: 41.2721,
    lng: -70.0982,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Town of Nantucket Health Department, public health nurse office, and official municipal tick specimen drop-off station for PCR pathogen testing.',
    safetyTip: 'Bring removed ticks in a sealed ziploc bag with damp paper towel for town species identification and pathogen testing.',
    googleMapsQuery: 'Nantucket+Health+Department+131+Pleasant+St+Nantucket+MA'
  },
  {
    id: 'nantucket-public-safety',
    name: 'Nantucket Public Safety Facility / Police & Fire HQ (4 Fairgrounds Rd)',
    category: 'civic_center',
    lat: 41.2655,
    lng: -70.0945,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Central 911 dispatch, Nantucket Police Department, Fire & Rescue headquarters, and emergency ambulance dispatch for all island sectors.',
    safetyTip: 'Dial 911 for anaphylaxis, severe acute medical emergencies, or ambulance transport.',
    googleMapsQuery: 'Nantucket+Public+Safety+Facility+4+Fairgrounds+Rd+Nantucket+MA'
  },
  {
    id: 'sconset-civic-hall',
    name: "Siasconset Union Chapel & Village Hall (18 New St, 'Sconset)",
    category: 'civic_center',
    lat: 41.2642,
    lng: -69.9654,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: "'Sconset village community center, historical civic hall, and local information point for East End residents and visitors.",
    safetyTip: 'Historic village square hub with community bulletin boards and paved walking access to the Bluff Walk.',
    googleMapsQuery: 'Siasconset+Union+Chapel+18+New+St+Siasconset+MA'
  },
  {
    id: 'madaket-community-hub',
    name: "Madaket Community Center & Millie's Civic Hub (326 Madaket Rd)",
    category: 'civic_center',
    lat: 41.2745,
    lng: -70.1985,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'West End community meeting point, NRTA Wave shuttle depot, and marine safety hub for Madaket Harbor.',
    safetyTip: 'Paved shuttle terminus and safe ocean walking paths; check socks before heading back onto sandy dune trails.',
    googleMapsQuery: 'Millies+326+Madaket+Rd+Nantucket+MA'
  },

  // Clinical & Emergency
  {
    id: 'nch-hospital',
    name: 'Nantucket Cottage Hospital (Walk-in & Emergency)',
    category: 'hospital',
    lat: 41.2721,
    lng: -70.0984,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Island sole community hospital, 24/7 emergency department, walk-in care, and Doxycycline prophylaxis administration.',
    safetyTip: 'Call (508) 825-1000 for walk-in triage or visit 57 Prospect St.',
    googleMapsQuery: 'Nantucket+Cottage+Hospital+57+Prospect+St+Nantucket+MA'
  },
  {
    id: 'dans-pharmacy',
    name: "Dan's Pharmacy",
    category: 'pharmacy',
    lat: 41.2785,
    lng: -70.1042,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Local pharmacy carrying Doxycycline prescriptions, EPA-registered Picaridin 20%, Permethrin clothing spray, and tick tweezers.',
    safetyTip: 'Located at 110 Pleasant St, Nantucket, MA 02554.',
    googleMapsQuery: 'Dans+Pharmacy+Pleasant+St+Nantucket+MA'
  },
  {
    id: 'nantucket-pharmacy',
    name: 'Nantucket Pharmacy (Historic Main St)',
    category: 'pharmacy',
    lat: 41.2831,
    lng: -70.0988,
    riskRating: 'Zero',
    tickExposureIndex: 0,
    surfaceType: 'Asphalt / Paved',
    description: 'Downtown Main Street pharmacy with over-the-counter insect repellents, tick removal kits, and first aid supplies.',
    safetyTip: 'Historic location at 45 Main St in Town.',
    googleMapsQuery: 'Nantucket+Pharmacy+45+Main+St+Nantucket+MA'
  },

  // Conservation Trails & Moors
  {
    id: 'sanford-farm',
    name: 'Sanford Farm & Ram Pasture',
    category: 'trail',
    lat: 41.2662,
    lng: -70.1585,
    riskRating: 'High',
    tickExposureIndex: 7.8,
    surfaceType: 'Mowed Wide Grass',
    description: '500+ acre conservation reserve with expansive grasslands leading to the ocean.',
    safetyTip: 'Stay in the center of mowed paths. Avoid brushing against side scrub oak.',
    googleMapsQuery: 'Sanford+Farm+Nantucket+MA'
  },
  {
    id: 'middle-moors',
    name: 'Middle Moors & Altar Rock',
    category: 'trail',
    lat: 41.2754,
    lng: -70.0381,
    riskRating: 'High',
    tickExposureIndex: 8.2,
    surfaceType: 'Overgrown Scrub Oak / Heath',
    description: 'Vast rolling heathland and Nantucket’s highest elevation (Altar Rock, 108ft). Dense tick habitat.',
    safetyTip: 'Wear Permethrin-treated socks and tuck pants into socks before entering.',
    googleMapsQuery: 'Altar+Rock+Nantucket+MA'
  },
  {
    id: 'squam-swamp',
    name: 'Squam Swamp Nature Trail',
    category: 'trail',
    lat: 41.3128,
    lng: -69.9982,
    riskRating: 'Extreme',
    tickExposureIndex: 9.5,
    surfaceType: 'Dense Bog / Wetland',
    description: 'Dense canopy forest with vernal pools and ferns. Maximum relative humidity (>90%) creating ideal microclimate for nymph quests.',
    safetyTip: 'Strict Two-Zone Armor required. Inspect socks immediately upon exiting.',
    googleMapsQuery: 'Squam+Swamp+Nantucket+MA'
  },
  {
    id: 'coatue-wildlife',
    name: 'Coskata-Coatue Wildlife Refuge',
    category: 'trail',
    lat: 41.3541,
    lng: -70.0315,
    riskRating: 'Moderate',
    tickExposureIndex: 4.5,
    surfaceType: 'Open Sand / Shore',
    description: 'Long barrier beach and cedar savanna. Sand tracks are tick-free; salt spray and wind desiccate ticks.',
    safetyTip: 'Stick to open sand trails and ocean shores. Avoid red cedar brush edges.',
    googleMapsQuery: 'Coatue+Wildlife+Refuge+Nantucket+MA'
  },
  {
    id: 'masquetuck-reserve',
    name: 'Masquetuck Reserve & Polpis Harbor',
    category: 'trail',
    lat: 41.2985,
    lng: -70.0152,
    riskRating: 'Moderate',
    tickExposureIndex: 5.0,
    surfaceType: 'Mowed Wide Grass',
    description: 'Salt marsh boardwalks and tidal creek views. Low brush contact on boardwalks.',
    safetyTip: 'Boardwalks and mowed lanes are safe; avoid marsh grass margins.',
    googleMapsQuery: 'Masquetuck+Reserve+Nantucket+MA'
  },
  {
    id: 'sconset-bluff',
    name: "'Sconset Bluff Walk",
    category: 'trail',
    lat: 41.2642,
    lng: -69.9615,
    riskRating: 'Low',
    tickExposureIndex: 2.1,
    surfaceType: 'Mowed Wide Grass',
    description: 'Historic public footpath between cottage rose gardens and Atlantic ocean bluffs.',
    safetyTip: 'Paved shell path. Safe for walking with minimal brush contact if you stay on the path.',
    googleMapsQuery: 'Sconset+Bluff+Walk+Nantucket+MA'
  },

  // Landmarks & Safe Recreation
  {
    id: 'great-point-light',
    name: 'Great Point Lighthouse',
    category: 'landmark',
    lat: 41.3900,
    lng: -70.0482,
    riskRating: 'Zero',
    tickExposureIndex: 0.2,
    surfaceType: 'Open Sand / Shore',
    description: 'Historic lighthouse at the northern tip. Surrounded entirely by sand, breaking surf, and ocean winds.',
    safetyTip: 'Near-zero tick risk on the outer sand spit. Perfect family day trip.',
    googleMapsQuery: 'Great+Point+Light+Nantucket+MA'
  },
  {
    id: 'brant-point-light',
    name: 'Brant Point Lighthouse',
    category: 'landmark',
    lat: 41.2899,
    lng: -70.0901,
    riskRating: 'Zero',
    tickExposureIndex: 0.1,
    surfaceType: 'Open Sand / Shore',
    description: 'Historic wooden lighthouse guarding Nantucket Harbor. 100% sand/paved access.',
    safetyTip: 'Completely tick-free coastal zone with iconic views of ferries entering the harbor.',
    googleMapsQuery: 'Brant+Point+Light+Nantucket+MA'
  },
  {
    id: 'madaket-beach',
    name: 'Madaket Beach & Millie’s',
    category: 'beach',
    lat: 41.2715,
    lng: -70.2015,
    riskRating: 'Zero',
    tickExposureIndex: 0.2,
    surfaceType: 'Open Sand / Shore',
    description: 'West-end sunset beach with broad open sand shoreline and coastal surf.',
    safetyTip: 'Stay on sand beaches. Do not walk through dune vegetation.',
    googleMapsQuery: 'Madaket+Beach+Nantucket+MA'
  },
  {
    id: 'cisco-brewers',
    name: 'Cisco Brewers & Hummock Pond Paved Corridor',
    category: 'landmark',
    lat: 41.2588,
    lng: -70.1252,
    riskRating: 'Low',
    tickExposureIndex: 1.5,
    surfaceType: 'Asphalt / Paved',
    description: 'Popular outdoor gathering destination connected to Town via dedicated paved bike path.',
    safetyTip: 'Access via the Hummock Pond paved multi-use trail for safe, tick-free cycling.',
    googleMapsQuery: 'Cisco+Brewers+Bartlett+Farm+Rd+Nantucket+MA'
  },
  {
    id: 'nantucket-town',
    name: 'Historic Nantucket Town (Cobblestones & Harbor)',
    category: 'landmark',
    lat: 41.2835,
    lng: -70.0995,
    riskRating: 'Zero',
    tickExposureIndex: 0.1,
    surfaceType: 'Asphalt / Paved',
    description: 'Historic downtown whaling district with cobblestone streets, brick sidewalks, and harbor docks.',
    safetyTip: 'Zero tick habitat on urban streets and paved paths.',
    googleMapsQuery: 'Nantucket+Town+Historic+District+MA'
  }
];

export const SAFE_CORRIDOR_ROUTES: ISafeCorridorRoute[] = [
  {
    id: 'town-to-sconset-paved',
    name: 'Town to Siasconset via Milestone Paved Path',
    fromLocationId: 'nantucket-town',
    toLocationId: 'sconset-bluff',
    distanceMiles: 7.5,
    estimatedBikeMinutes: 30,
    estimatedWalkMinutes: 120,
    tickExposureScore: 0.5,
    isPavedCorridor: true,
    recommendedZoneArmor: 'Zone 2 Skin Only',
    routeSummary: 'Wide asphalt multi-use path separated from roadway. Flat, smooth, and 100% free of brush overhang.',
    waypointCoordinates: [
      [41.2835, -70.0995],
      [41.2770, -70.0750],
      [41.2710, -70.0200],
      [41.2642, -69.9615]
    ]
  },
  {
    id: 'town-to-madaket-paved',
    name: 'Town to Madaket via Madaket Road Paved Path',
    fromLocationId: 'nantucket-town',
    toLocationId: 'madaket-beach',
    distanceMiles: 6.0,
    estimatedBikeMinutes: 25,
    estimatedWalkMinutes: 95,
    tickExposureScore: 0.4,
    isPavedCorridor: true,
    recommendedZoneArmor: 'Zone 2 Skin Only',
    routeSummary: 'Dedicated paved bike corridor leading to west-end sunsets. Completely clear of single-track scrub.',
    waypointCoordinates: [
      [41.2835, -70.0995],
      [41.2790, -70.1400],
      [41.2750, -70.1800],
      [41.2715, -70.2015]
    ]
  },
  {
    id: 'town-to-cisco-paved',
    name: 'Town to Cisco Brewers via Hummock Pond Path',
    fromLocationId: 'nantucket-town',
    toLocationId: 'cisco-brewers',
    distanceMiles: 2.8,
    estimatedBikeMinutes: 12,
    estimatedWalkMinutes: 45,
    tickExposureScore: 0.3,
    isPavedCorridor: true,
    recommendedZoneArmor: 'Zero Chemical Needed',
    routeSummary: 'Short, smooth paved path connecting Town to Bartlett Farm and Cisco Brewers with zero brush contact.',
    waypointCoordinates: [
      [41.2835, -70.0995],
      [41.2720, -70.1120],
      [41.2588, -70.1252]
    ]
  },
  {
    id: 'polpis-scenic-corridor',
    name: 'Polpis Road Scenic Bike Path to Masquetuck',
    fromLocationId: 'nantucket-town',
    toLocationId: 'masquetuck-reserve',
    distanceMiles: 4.8,
    estimatedBikeMinutes: 22,
    estimatedWalkMinutes: 80,
    tickExposureScore: 1.2,
    isPavedCorridor: true,
    recommendedZoneArmor: 'Zone 2 Skin Only',
    routeSummary: 'Paved bike path curving past salt marshes, cranberry bogs, and Polpis Harbor.',
    waypointCoordinates: [
      [41.2835, -70.0995],
      [41.2890, -70.0600],
      [41.2985, -70.0152]
    ]
  },
  {
    id: 'sanford-farm-trail-loop',
    name: 'Sanford Farm Mowed Perimeter Trail Loop',
    fromLocationId: 'sanford-farm',
    toLocationId: 'sanford-farm',
    distanceMiles: 6.2,
    estimatedBikeMinutes: 35,
    estimatedWalkMinutes: 110,
    tickExposureScore: 7.8,
    isPavedCorridor: false,
    recommendedZoneArmor: 'Zone 1+2 Armor Required',
    routeSummary: 'Grass conservation trail through sandplain moors. High questing nymph density along un-mowed edges.',
    waypointCoordinates: [
      [41.2662, -70.1585],
      [41.2550, -70.1550],
      [41.2420, -70.1520],
      [41.2662, -70.1585]
    ]
  },
  {
    id: 'squam-swamp-deep-loop',
    name: 'Squam Swamp Forest & Vernal Bog Trail',
    fromLocationId: 'squam-swamp',
    toLocationId: 'squam-swamp',
    distanceMiles: 1.8,
    estimatedBikeMinutes: 20,
    estimatedWalkMinutes: 45,
    tickExposureScore: 9.5,
    isPavedCorridor: false,
    recommendedZoneArmor: 'Zone 1+2 Armor Required',
    routeSummary: 'Dense wetland forest canopy with high humidity. Extreme nymph exposure; stay strictly on elevated boardwalks.',
    waypointCoordinates: [
      [41.3128, -69.9982],
      [41.3150, -69.9950],
      [41.3110, -69.9920],
      [41.3128, -69.9982]
    ]
  }
];

/**
 * Calculates distance in miles between two latitude/longitude coordinates (Haversine formula).
 */
export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Computes STAT emergency transit stats to Nantucket Cottage Hospital.
 */
export function computeHospitalTransitStats(currentLat: number, currentLng: number) {
  const nch = NANTUCKET_LOCATIONS.find(l => l.id === 'nch-hospital')!;
  const distanceMiles = calculateDistanceMiles(currentLat, currentLng, nch.lat, nch.lng);
  const drivingMinutes = Math.max(3, Math.round((distanceMiles / 25) * 60)); // ~25mph island speed limit
  const bikingMinutes = Math.round((distanceMiles / 12) * 60);

  return {
    hospitalName: nch.name,
    address: '57 Prospect St, Nantucket, MA 02554',
    phone: '(508) 825-1000',
    distanceMiles,
    drivingMinutes,
    bikingMinutes,
    googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nch.googleMapsQuery)}`
  };
}
