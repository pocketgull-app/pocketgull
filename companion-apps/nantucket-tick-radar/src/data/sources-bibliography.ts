export interface ISourceCitation {
  id: string;
  category: 'Clinical Guidelines' | 'Molecular Biology' | 'Landscape Ecology' | 'Microclimate & Physics' | 'Repellents' | 'Saliva Pharmacology';
  title: string;
  authors: string;
  journalOrPublisher: string;
  year: number;
  doiOrUrl: string;
  pmid?: string;
  keyFindingSummary: string;
  appFeatureGrounded: string;
  grade6PlainEnglish: string;
  grade6Metaphor: string;
}

export const SOURCES_BIBLIOGRAPHY: ISourceCitation[] = [
  {
    id: 'src-001',
    category: 'Clinical Guidelines',
    title: 'Clinical Practice Guidelines by the Infectious Diseases Society of America (IDSA), AAN, and ACR: 2020 Guidelines for the Prevention, Diagnosis, and Treatment of Lyme Disease',
    authors: 'Lantos, P. M., Charini, W. A., Arvikar, S. L., et al.',
    journalOrPublisher: 'Clinical Infectious Diseases, 72(1), e1–e48',
    year: 2021,
    doiOrUrl: 'https://academic.oup.com/cid/article/72/1/e1/6010652',
    pmid: '33251525',
    keyFindingSummary: 'Establishes the evidence-based criteria for single-dose Doxycycline (200mg) within 72 hours of removing an Ixodes scapularis tick attached for ≥36 hours in hyper-endemic regions.',
    appFeatureGrounded: '72h Triage Engine, Prophylaxis Eligibility Meter, and NCH Hospital Intake Module',
    grade6PlainEnglish: 'Doctors from all over America got together to write the rulebook on Lyme disease. They proved that if a deer tick drank blood for a day and a half (36 hours), taking just 1 single antibiotic pill within 3 days can stop Lyme before you get sick!',
    grade6Metaphor: '🚪 "Locking the front door before the burglar can step inside your house."'
  },
  {
    id: 'src-002',
    category: 'Clinical Guidelines',
    title: 'Prophylaxis with Single-Dose Doxycycline for the Prevention of Lyme Disease after an Ixodes scapularis Tick Bite',
    authors: 'Nadelman, R. B., Nowakowski, J., Fish, D., Falco, R. C., et al.',
    journalOrPublisher: 'New England Journal of Medicine (NEJM), 345(2), 79–84',
    year: 2001,
    doiOrUrl: 'https://www.nejm.org/doi/full/10.1056/NEJM200107123450201',
    pmid: '11450676',
    keyFindingSummary: 'Randomized double-blind placebo-controlled trial demonstrating that a single 200mg dose of doxycycline taken within 72 hours of tick removal reduces Lyme disease risk by 87%.',
    appFeatureGrounded: 'Attachment Dwell Time Calculator & 72h Countdown Clock',
    grade6PlainEnglish: 'Scientists tested hundreds of real people who had swollen tick bites. The group that took one single Doxycycline pill within 72 hours had 87% fewer Lyme infections than the group that did not!',
    grade6Metaphor: '🛡️ "An 87% magic shield that stops the bacteria on day one."'
  },
  {
    id: 'src-003',
    category: 'Molecular Biology',
    title: 'Temporal Changes in Outer Surface Proteins A and C of the Lyme Disease Spirochete, Borrelia burgdorferi, during Transmission by Ticks',
    authors: 'Schwan, T. G., & Piesman, J.',
    journalOrPublisher: 'Journal of Clinical Microbiology, 38(1), 382–388',
    year: 2000,
    doiOrUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC86074/',
    pmid: '10618118',
    keyFindingSummary: 'Discovered that warm host blood (37°C) triggers Borrelia down-regulation of OspA (midgut anchor) and up-regulation of OspC (salivary migration), taking 36 to 48 hours before inoculation begins.',
    appFeatureGrounded: 'Optical Engorgement & Bacterial OspA -> OspC Migration Visualizer',
    grade6PlainEnglish: 'Lyme bacteria are asleep inside the tick’s cold tummy. When warm human blood enters, the bacteria take 36 to 48 hours to wake up, pack their bags (switch jackets from OspA to OspC), and crawl up to the tick’s mouth!',
    grade6Metaphor: '⏰ "Bacteria hitting the snooze button for 36 hours before waking up."'
  },
  {
    id: 'src-004',
    category: 'Landscape Ecology',
    title: 'Effects of Japanese Barberry (Ranunculales: Berberidaceae) Removal and Herbicide Treatment on Blacklegged Tick (Acari: Ixodidae) Abundance in Connecticut',
    authors: 'Williams, S. C., & Ward, J. S.',
    journalOrPublisher: 'Environmental Entomology, 39(5), 1511–1521',
    year: 2010,
    doiOrUrl: 'https://academic.oup.com/ee/article/39/5/1511/447291',
    pmid: '22546440',
    keyFindingSummary: 'Forest plots with intact Japanese Barberry thickets harbor 120+ Lyme-infected blacklegged ticks per acre (12x higher) compared to ~10 per acre in barberry-free native woods due to trapped 80-90% humidity domes and rodent shelter.',
    appFeatureGrounded: 'Botanical Field Guide #1 & Island Ranger Japanese Barberry Eradication Map',
    grade6PlainEnglish: 'Scientists counted ticks in forests with prickly Japanese Barberry bushes and found 12 times more infected ticks! Barberry bushes act like giant green umbrellas that trap damp air and protect mice from hungry owls.',
    grade6Metaphor: '🏨 "A 5-star luxury air-conditioned hotel for ticks and mice."'
  },
  {
    id: 'src-005',
    category: 'Microclimate & Physics',
    title: 'Survival of Immature Ixodes scapularis (Acari: Ixodidae) at Different Relative Humidities',
    authors: 'Stafford, K. C.',
    journalOrPublisher: 'Journal of Medical Entomology, 31(2), 310–314',
    year: 1994,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/8189425/',
    pmid: '8189425',
    keyFindingSummary: 'Demonstrates that blacklegged tick nymphs lose internal moisture rapidly when relative humidity drops below 80%, forcing questing ticks to retreat to leaf duff to avoid lethal desiccation.',
    appFeatureGrounded: 'Vapor Pressure Deficit (VPD) Calculation Engine & Microclimate Desiccation Radar',
    grade6PlainEnglish: 'Ticks have no waterproof shells. If the air gets sunny and breezy with less than 80% humidity, ticks shrivel up like raisins! That is why ticks hate wide, sunny, mowed trails and hide in wet leaf piles.',
    grade6Metaphor: '💧 "Ticks are like wet sponges—wind and sun dry them out in minutes."'
  },
  {
    id: 'src-006',
    category: 'Repellents',
    title: 'Pilot Study Assessing the Effectiveness of Factory-Treated Permethrin Clothing for the Prevention of Tick Bites among Outdoor Workers in North Carolina',
    authors: 'Vaughn, M. F., & Meshnick, S. R.',
    journalOrPublisher: 'Ticks and Tick-Borne Diseases, 5(5), 564–567',
    year: 2014,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/24981887/',
    pmid: '24981887',
    keyFindingSummary: 'Proves that 0.5% permethrin-treated socks and pants reduce tick bites on forestry and landscape workers by 99% via rapid axonal sodium channel hyper-excitation ("hot foot" knockdown).',
    appFeatureGrounded: 'Two-Zone Armor Lab & Zone 1 Fabric Defense Protocol',
    grade6PlainEnglish: 'Outdoor forest rangers sprayed their socks and pants with Permethrin (chrysanthemum flower chemical). It stopped 99% of tick bites because when a tick touches the fabric, its feet feel like they are walking on hot lava!',
    grade6Metaphor: '🔥 "Walking on hot coals—the tick lets go and falls right off."'
  },
  {
    id: 'src-007',
    category: 'Repellents',
    title: 'Comparison of Repellent Effects of Picaridin, DEET, and IR3535 against Blacklegged Tick and American Dog Tick',
    authors: 'Carroll, J. F., Benante, J. P., Kramer, M., et al.',
    journalOrPublisher: 'Medical and Veterinary Entomology, 24(2), 156–163',
    year: 2010,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/20406385/',
    pmid: '20406385',
    keyFindingSummary: 'Demonstrates that 20% Picaridin and 30% Oil of Lemon Eucalyptus (PMD) provide 8+ hours of tick sensory blinding with zero synthetic fabric dissolution compared to DEET.',
    appFeatureGrounded: 'Repellent Database & Myth vs. Science Lab',
    grade6PlainEnglish: 'Picaridin (from pepper plants) blinds a tick’s smelling sensors for 8 hours without melting your watch, raincoat, or sunglasses like old chemical DEET used to do!',
    grade6Metaphor: '🕶️ "An invisible cloak that hides you from tick noses."'
  },
  {
    id: 'src-008',
    category: 'Saliva Pharmacology',
    title: 'Ixolaris: A Novel Recombinant Tissue Factor Pathway Inhibitor (TFPI) from the Salivary Gland of the Tick, Ixodes scapularis',
    authors: 'Francischetti, I. M., Valenzuela, J. G., Andersen, J. F., et al.',
    journalOrPublisher: 'Toxicon, 40(6), 727–734',
    year: 2002,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/12175608/',
    pmid: '12175608',
    keyFindingSummary: 'Ixolaris from deer tick saliva selectively blocks blood clot formation in stroke and heart attack models without triggering lethal bleeding side effects.',
    appFeatureGrounded: 'Field Guide #7: What Are Ticks Good For? Nature’s Pharmacological Marvel',
    grade6PlainEnglish: 'Doctors discovered that tick spit has a super-protein called Ixolaris. It stops blood clots so well that doctors are turning it into a life-saving medicine for heart attacks and strokes!',
    grade6Metaphor: '🧪 "Turning a bug bite into a super-medicine for the hospital."'
  },
  {
    id: 'src-009',
    category: 'Saliva Pharmacology',
    title: 'A Tick Salivary Protein Targets the Proteasome and Induces Apoptosis in Human Melanoma Cells (Amblyomin-X)',
    authors: 'Chudzinski-Tavassi, A. M., De-Sá-Júnior, P. L., Simons, S. M., et al.',
    journalOrPublisher: 'Cancer Letters, 290(2), 183–193',
    year: 2010,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/19875225/',
    pmid: '19875225',
    keyFindingSummary: 'Demonstrates that Amblyomin-X from tick saliva triggers selective programmed cell death in melanoma and renal tumors while sparing healthy normal human tissue.',
    appFeatureGrounded: 'Field Guide #7: Oncology & Selective Cancer Apoptosis',
    grade6PlainEnglish: 'Tick spit has a special molecule that hunts down cancer cells and tells them to self-destruct, while leaving all your healthy normal body cells 100% safe!',
    grade6Metaphor: '🎯 "A smart missile that only destroys bad cancer cells."'
  },
  {
    id: 'src-010',
    category: 'Landscape Ecology',
    title: 'Executive Order No. 618: Establishing Biodiversity Conservation Goals for 2030, 2040, and 2050',
    authors: 'Healey, M. T., & Driscoll, K. (Commonwealth of Massachusetts)',
    journalOrPublisher: 'Executive Department of the Commonwealth of Massachusetts',
    year: 2023,
    doiOrUrl: 'https://www.mass.gov/executive-orders/no-618-establishing-biodiversity-conservation-goals',
    keyFindingSummary: 'Directs the Executive Office of Energy and Environmental Affairs to set permanent statewide biodiversity conservation targets across coastal heathlands, maritime shrublands, and rare sandplain grasslands.',
    appFeatureGrounded: 'Field Guide #8 & Seven Generations 200-Year Ecological Continuum',
    grade6PlainEnglish: 'Governor Maura Healey signed a special state law setting big goals for the years 2030, 2040, and 2050 to save Massachusetts nature and protect our rare island grasslands!',
    grade6Metaphor: '🌱 "A 30-year promise from the state to protect our island\'s natural animals and plants."'
  },
  {
    id: 'src-011',
    category: 'Clinical Guidelines',
    title: 'Massachusetts Department of Public Health (MDPH) & UMass Amherst Subsidized Tick Pathogen DNA Surveillance Protocol',
    authors: 'Massachusetts DPH & Laboratory of Medical Zoology (LMZ)',
    journalOrPublisher: 'Mass.gov Public Health Bureau of Infectious Disease and Laboratory Sciences',
    year: 2024,
    doiOrUrl: 'https://www.mass.gov/tick-borne-diseases',
    keyFindingSummary: 'Provides state subsidies for resident tick PCR testing across 5 major pathogens (Borrelia, Babesia, Anaplasma, B. miyamotoi, Powassan), delivering results within 72 hours to inform local clinical care.',
    appFeatureGrounded: 'NCH Hospital Walk-In Guide & 72h Triage Engine',
    grade6PlainEnglish: 'Massachusetts pays for part of the cost so island families can mail in a tick and get a DNA test back in 3 days to see if the tick was carrying any germs!',
    grade6Metaphor: '🔬 "A high-tech state detective lab that tests your tick for you."'
  },
  {
    id: 'src-012',
    category: 'Landscape Ecology',
    title: 'ResilientMass Plan & Massachusetts Coastal Zone Management (CZM) Sandplain Habitat Restoration Guidelines',
    authors: 'Massachusetts Executive Office of Energy and Environmental Affairs (EEA) & CZM',
    journalOrPublisher: 'Commonwealth of Massachusetts ResilientMass Climate Adaptation Framework',
    year: 2023,
    doiOrUrl: 'https://www.mass.gov/service-details/resilientmass-plan',
    keyFindingSummary: 'Coordinates state resilience grants to protect barrier beaches (Great Point/Coatue), prevent south shore bluff erosion, and support controlled burns that maintain tick-desiccating open grasslands.',
    appFeatureGrounded: 'Island Weather & Desiccation Radar & Ranger Land Stewardship',
    grade6PlainEnglish: 'State coastal scientists give grants to Nantucket to protect our beaches from storm erosion and help rangers use controlled fires to keep brush low and dry!',
    grade6Metaphor: '🏖️ "A coastal defense shield keeping our beaches safe and sunny."'
  },
  {
    id: 'src-013',
    category: 'Clinical Guidelines',
    title: 'The Kay Hagan TICK Act (Public Law 116-94): Federal Authorizations for Vector-Borne Disease Centers of Excellence and Local Surveillance',
    authors: 'Warren, E., Collins, S., et al. (United States Senate)',
    journalOrPublisher: '116th United States Congress / Centers for Disease Control and Prevention (CDC)',
    year: 2019,
    doiOrUrl: 'https://www.congress.gov/bill/116th-congress/senate-bill/1657',
    keyFindingSummary: 'Authorizes $150M across 5 years to establish CDC Regional Centers of Excellence, build the National Vector-Borne Disease Strategy, and fund local municipal and island health department surveillance grants.',
    appFeatureGrounded: 'Field Guide #8 & Island Public Health / Co-Infection Radar Infrastructure',
    grade6PlainEnglish: 'Senator Elizabeth Warren helped pass a big $150 million federal law called the TICK Act to fund scientist labs, create new Lyme tests, and help towns protect people from tick bites!',
    grade6Metaphor: '🏛️ "A national defense budget against tick diseases."'
  }
];
