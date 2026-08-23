export interface IRepellentActive {
  id: string;
  name: string;
  targetZone: 'Zone 1: Gear & Fabric ONLY' | 'Zone 2: Exposed Bare Skin';
  optimalConcentration: string;
  protectionDurationHours: string;
  mechanism: string;
  gearSafety: '100% Safe on Synthetics & Plastics' | 'Will Melt Synthetics / Plastics' | 'Applied Directly to Fabric';
  scentAndFeel: string;
  epaCertified: boolean;
  ageSafety: string;
  proTips: string[];
}

export const REPELLENT_DATABASE: IRepellentActive[] = [
  {
    id: 'permethrin-fabric',
    name: 'Permethrin (0.5% Contact Acaricide)',
    targetZone: 'Zone 1: Gear & Fabric ONLY',
    optimalConcentration: '0.5% Spray or Factory Soak',
    protectionDurationHours: 'Up to 6 Weeks or 6 Machine Washings',
    mechanism: 'Synthetic pyrethroid contact neurotoxin. Binds voltage-gated sodium channels in tick tarsi; tick experiences "hot foot" axonal shock and drops off within 5–15 seconds.',
    gearSafety: 'Applied Directly to Fabric',
    scentAndFeel: 'Odorless once dry • Non-staining on clothing and footwear',
    epaCertified: true,
    ageSafety: 'Safe for all ages once clothing is completely dry',
    proTips: [
      'NEVER apply liquid spray directly to human skin.',
      'Treat shoes, socks, gaiters, pants cuffs, and backpack straps.',
      'Allow clothing to dry completely for 2–4 hours before wearing.',
      '⚠️ CAT SAFETY: Keep wet permethrin away from pet cats while drying (cats lack the glucuronidation enzyme to metabolize pyrethroids until fully dried).'
    ]
  },
  {
    id: 'picaridin-skin',
    name: 'Picaridin / Icaridin (20% Skin Shield)',
    targetZone: 'Zone 2: Exposed Bare Skin',
    optimalConcentration: '20% Lotion or Pump Spray',
    protectionDurationHours: '8 to 12 Hours against Blacklegged Nymphs',
    mechanism: 'Derived from natural piperine (black pepper genus). Volatiles form an imperceptible vapor barrier that blocks sensory sensilla in the tick\'s Haller\'s organ, rendering human CO₂ and lactic acid invisible.',
    gearSafety: '100% Safe on Synthetics & Plastics',
    scentAndFeel: 'Virtually odorless, non-greasy, silky skin feel',
    epaCertified: true,
    ageSafety: 'Approved by CDC and AAP for infants 2+ months and adults',
    proTips: [
      'The premier modern alternative to DEET: will NOT melt nylon, Gore-Tex, watch crystals, or sunglasses.',
      'Apply like sunscreen to exposed ankles, wrists, waistline, and neck.',
      'Use 20% concentration for full 8–12 hour tick protection (10% formulations are shorter duration).'
    ]
  },
  {
    id: 'pmd-ole-skin',
    name: 'Oil of Lemon Eucalyptus (OLE / PMD 30%)',
    targetZone: 'Zone 2: Exposed Bare Skin',
    optimalConcentration: '30% PMD (p-menthane-3,8-diol)',
    protectionDurationHours: '6 to 8 Hours',
    mechanism: 'Purified botanical extract rich in p-menthane-3,8-diol. Jams olfactory receptors on the tick\'s tarsi.',
    gearSafety: '100% Safe on Synthetics & Plastics',
    scentAndFeel: 'Pleasant natural eucalyptus aroma, light non-sticky feel',
    epaCertified: true,
    ageSafety: 'Approved for children age 3 years and older (EPA standard)',
    proTips: [
      'The ONLY plant-based botanical active ingredient certified by the EPA/CDC with peer-reviewed efficacy matching DEET.',
      'Do NOT confuse with raw "lemon eucalyptus essential oil" (which lacks purified PMD and evaporates in <20 minutes).'
    ]
  },
  {
    id: 'deet-skin',
    name: 'DEET (N,N-Diethyl-meta-toluamide 20–30%)',
    targetZone: 'Zone 2: Exposed Bare Skin',
    optimalConcentration: '20% to 30%',
    protectionDurationHours: '6 to 10 Hours',
    mechanism: 'Blocks olfactory sensory neurons and inhibits electrophysiological response to human sweat plumes.',
    gearSafety: 'Will Melt Synthetics / Plastics',
    scentAndFeel: 'Distinctive chemical aroma, can feel greasy on skin',
    epaCertified: true,
    ageSafety: 'Approved for infants 2+ months at <=30% concentration',
    proTips: [
      'Concentrations above 30% provide longer duration, not higher repellency.',
      'Caution: DEET dissolves rayon, spandex, acetate, watch crystals, fly lines, and vehicle paint finishes.',
      'Apply to skin, avoid spraying directly onto high-end synthetic technical gear.'
    ]
  }
];

export interface IRepellentMythFact {
  myth: string;
  scientificReality: string;
  verdict: '❌ Dangerous / Ineffective Myth' | '✅ Evidence-Based Truth';
}

export const REPELLENT_MYTHS_FACTS: IRepellentMythFact[] = [
  {
    myth: 'Homemade essential oil sprays (lavender, tea tree, peppermint) provide all-day natural tick protection.',
    scientificReality: 'Unrefined essential oils are highly volatile and evaporate completely within 15–30 minutes, leaving hikers with zero protection against questing Ixodes nymphs. Only EPA-registered PMD (Oil of Lemon Eucalyptus) has stabilized 6+ hour efficacy.',
    verdict: '❌ Dangerous / Ineffective Myth'
  },
  {
    myth: 'Sunscreen and insect repellent should be combined in a single 2-in-1 bottle.',
    scientificReality: 'Sunscreen must be reapplied generously every 2 hours, whereas repellent should only be applied once every 6–8 hours. Reapplying a 2-in-1 product every 2 hours causes excessive skin absorption of repellent actives. Always apply sunscreen first, wait 15 minutes to dry, then apply repellent on top.',
    verdict: '❌ Dangerous / Ineffective Myth'
  },
  {
    myth: 'Treating your shoes and socks with Permethrin is more effective against Lyme disease than applying bug spray to your neck.',
    scientificReality: 'Over 85% of blacklegged nymph tick encounters occur when walking through brush under 18 inches tall. Ticks cling to shoes/socks and crawl upwards. Permethrin-treated socks provide an instant "hot-foot" knockdown barrier right at the point of initial contact.',
    verdict: '✅ Evidence-Based Truth'
  }
];
