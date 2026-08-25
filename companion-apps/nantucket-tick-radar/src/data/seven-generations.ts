export interface IIslandAdventureQuest {
  id: string;
  title: string;
  category: 'Coastal Waters' | 'Paved Cycling' | 'Open Sand Beach' | 'Mowed Moorland' | 'Historic Village';
  icon: string;
  location: string;
  tickRisk: 'Zero (Water)' | 'Near Zero (Paved/Sand)' | 'Low (Mowed Turf)';
  whyItIsAwesome: string;
  sevenGenWisdom: string;
  adventureTips: string[];
}

export interface ISevenGenEra {
  eraLabel: string;
  timeframe: string;
  ecologicalState: string;
  humanRelationship: string;
  legacyImpact: string;
}

export const SEVEN_GEN_TIMELINE: ISevenGenEra[] = [
  {
    eraLabel: 'Generation -3 (Ancestral & Maritime)',
    timeframe: '1850s–1920s',
    ecologicalState: 'Open pastoral sheep commons, active whaling harbor, minimal scrub brush.',
    humanRelationship: 'Agricultural sheep grazing kept moors clipped short; deer and tick populations were virtually zero.',
    legacyImpact: 'Demonstrates that tick abundance is linked to landscape ecology and brush succession.'
  },
  {
    eraLabel: 'Generation -2 & -1 (Regrowth & Hyper-Endemic Shift)',
    timeframe: '1970s–2010s',
    ecologicalState: 'Farmland abandoned; dense scrub oak, huckleberry, and invasive multiflora rose took over; deer re-established without natural apex predators.',
    humanRelationship: 'White-footed mice and deer boomed; Lyme and Babesiosis emerged as an island health emergency.',
    legacyImpact: 'Created the current crisis; highlighted the need for deliberate community ecological stewardship.'
  },
  {
    eraLabel: 'Generation 0 (Our Present Moment: The Bio-Stewardship Era)',
    timeframe: '2020s–Present',
    ecologicalState: 'High vector density, but active open-science citizen tracking and MIT Mice Against Ticks community governance.',
    humanRelationship: 'We equip our families with permethrin armor, rapid 72h clinical triage, and democratic town votes on biocontrol.',
    legacyImpact: 'We bridge scientific rigor with fearless outdoor enjoyment, refusing to let anxiety displace our love for the land.'
  },
  {
    eraLabel: 'Generation +1 & +2 (The Restored Commons)',
    timeframe: '2040s–2060s',
    ecologicalState: 'Mendelian-immune mouse populations disrupt Borrelia transmission; sandplain grasslands maintained via conservation burns.',
    humanRelationship: 'Children hike Nantucket trails with low pathogen transmission; the community models global ecological genetic governance.',
    legacyImpact: 'Nantucket becomes the gold-standard blueprint for island disease eradication worldwide.'
  },
  {
    eraLabel: 'Generation +3 & Beyond (Seven Generations Fulfilled)',
    timeframe: '2080s+',
    ecologicalState: 'Self-sustaining native coastal heathlands, balanced wildlife reservoirs, thriving biodiversity.',
    humanRelationship: 'Future islanders run through the moors in joyful harmony, honoring the seven-generations foresight of their ancestors.',
    legacyImpact: 'A healthy, resilient ecosystem gifted unbroken to descendants.'
  }
];

export const ISLAND_ADVENTURE_QUESTS: IIslandAdventureQuest[] = [
  {
    id: 'great-point-surfcasting',
    title: 'Great Point Lighthouse Beach Safari & Surfcasting',
    category: 'Open Sand Beach',
    icon: '🎣',
    location: 'Coskata-Coatue Outer Beach & Great Point',
    tickRisk: 'Near Zero (Paved/Sand)',
    whyItIsAwesome: 'Drive an over-sand 4x4 out to the northernmost tip of Nantucket where the Atlantic meets Nantucket Sound. World-class surfcasting for striped bass and bluefish, seal colonies, and historic lighthouse views.',
    sevenGenWisdom: 'Honor the coastline: Sand, wind, and breaking saltwater surf are completely inhospitable to ticks. Enjoying the open dunes keeps you fully immersed in wild nature with zero brush contact.',
    adventureTips: [
      'Stay on the hard-packed sand intertidal zone; avoid tall dune grass fringes where mice nest.',
      'Bring a 10-foot surfcasting rod and watch for diving gannets and seals at the rip current.',
      'Pack a beach fire permit for sunset s\'mores by the tide line.'
    ]
  },
  {
    id: 'polpis-madaket-bike-expedition',
    title: 'Nantucket Coast-to-Coast Paved Rail-Trail Ride',
    category: 'Paved Cycling',
    icon: '🚲',
    location: 'Polpis Road & Madaket Paved Multi-Use Paths',
    tickRisk: 'Near Zero (Paved/Sand)',
    whyItIsAwesome: 'Over 35 miles of dedicated, smooth asphalt bike paths crisscrossing the island without single-track brush contact. Cruise past Milestone cranberry bogs, historic saltbox cottages, and finish with legendary Madaket sunsets.',
    sevenGenWisdom: 'Connecting through movement: Paved cycling allows kids, elders, and families to experience the full breadth of Nantucket\'s beauty while staying centered on wide, clear corridors.',
    adventureTips: [
      'Rent a road bike, cruiser, or tandem from town and take the Polpis Path to Siasconset.',
      'Stop at the Milestone Cranberry Bogs for sweeping open-horizon photos.',
      'End at Madaket Harbor for fish tacos at Millie\'s while watching the sun sink into the ocean.'
    ]
  },
  {
    id: 'harbor-kayak-paddleboard',
    title: 'Polpis Harbor & Sesachacha Salt Pond Marine Paddle',
    category: 'Coastal Waters',
    icon: '🛶',
    location: 'Polpis Harbor / Masquetuck Estuary & Sesachacha Pond',
    tickRisk: 'Zero (Water)',
    whyItIsAwesome: 'Glide over crystal-clear salt marsh waters watching nesting ospreys, egrets, horseshoe crabs, and harbor seals. Absolutely zero tick risk on the open water!',
    sevenGenWisdom: 'Reverence for water: The Wampanoag people traveled these waters by canoe for millennia. Marine exploration connects us to the lifeblood of the island.',
    adventureTips: [
      'Launch paddleboards or kayaks at high tide at the Polpis Harbor ramp.',
      'Explore the Masquetuck creek channels for tranquil birdwatching away from crowds.',
      'Pack waterproof binoculars to spot nesting ospreys on conservation platforms.'
    ]
  },
  {
    id: 'sconset-bluff-sunrise',
    title: "'Sconset Rose-Covered Cottage & Bluff Walk",
    category: 'Historic Village',
    icon: '🌅',
    location: 'Siasconset Village & Sankaty Head Lighthouse',
    tickRisk: 'Near Zero (Paved/Sand)',
    whyItIsAwesome: 'Walk the historic footpath perched high on the ocean bluffs. Passed 18th-century fisherman cottages draped in climbing pink roses, ending at the iconic red-and-white Sankaty Head Light.',
    sevenGenWisdom: 'Living history: Preserving architectural heritage and coastal paths reminds us that community care sustains an island across generations.',
    adventureTips: [
      'Start at dawn to watch the first sunrise in America hit the Atlantic bluffs.',
      'Walk the manicured historic shell path in Siasconset village.',
      'Keep pets leashed on the path to prevent them from diving into garden ivy beds.'
    ]
  },
  {
    id: 'milestone-moor-kite-flying',
    title: 'Milestone Moorland Big-Sky Kite Flying & Stargazing',
    category: 'Mowed Moorland',
    icon: '🪁',
    location: 'Milestone Road Wide Mowed Meadows',
    tickRisk: 'Low (Mowed Turf)',
    whyItIsAwesome: 'Unobstructed 360-degree ocean horizon with constant steady ocean breezes—the premier kite-flying arena in New England. At night, with zero light pollution, the Milky Way arcs clearly from horizon to horizon.',
    sevenGenWisdom: 'Wonder for the cosmos: Laying under dark island skies inspires the humility and long-term vision that guides seven-generation stewardship.',
    adventureTips: [
      'Choose wide, freshly mowed conservation paths away from waist-high scrub.',
      'Bring a dual-line stunt kite or giant prism kite for the steady 15-knot ocean wind.',
      'Bring a blanket with a waterproof bottom layer for nighttime meteor shower watching.'
    ]
  }
];
