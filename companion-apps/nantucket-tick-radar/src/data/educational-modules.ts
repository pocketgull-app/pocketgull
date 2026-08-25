export interface IEducationalTopic {
  id: string;
  category: 'vector_ecology' | 'biocontrol_science' | 'socratic_myths' | 'pathology_diagnostics';
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  deepDive: string;
  keyFacts: string[];
  socraticChallenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const EDUCATIONAL_MODULES: IEducationalTopic[] = [
  {
    id: 'nantucket-tri-partite-cycle',
    category: 'vector_ecology',
    title: 'The Tri-Partite Island Vector Cycle',
    subtitle: 'Why Nantucket has among the highest tick-borne pathogen rates in North America',
    icon: '🌾',
    summary: 'Lyme disease and Babesiosis transmission depends on an ecological feedback loop between the white-footed mouse, blacklegged tick, and white-tailed deer.',
    deepDive: 'Larval ticks hatch sterile (free of Borrelia burgdorferi and Babesia microti). When larvae feed on their primary reservoir host—the native White-Footed Mouse (Peromyscus leucopus)—over 80-90% become infected. The ticks molt into pinhead-sized Nymphs by the following summer, questing on trailside vegetation to bite humans. White-tailed deer (Odocoileus virginianus) do not amplify the bacteria, but serve as the vital reproductive mating host for adult ticks.',
    keyFacts: [
      'Larval ticks are born uninfected; mice are the true bacterial pathogen reservoir, not deer.',
      'Nymphal ticks cause >85% of human infections because their tiny poppy-seed size allows them to feed undetected for 3+ days.',
      'Nantucket has no natural predatory apex carnivores (like coyotes or foxes) to regulate the rodent and deer populations.'
    ],
    socraticChallenge: {
      question: 'Why does eliminating deer from an isolated island reduce tick numbers, but treating mice eliminates the bacteria?',
      options: [
        'Deer transmit the bacteria directly to humans through saliva.',
        'Deer provide the blood meal necessary for adult ticks to reproduce, while mice incubate and pass the bacteria to larval/nymph ticks.',
        'Ticks only live for 2 weeks and cannot survive without deer blood.',
        'Mice are immune to tick bites.'
      ],
      correctIndex: 1,
      explanation: 'Correct! White-tailed deer are the essential reproductive host for adult ticks (providing the massive blood meal required for egg laying), while white-footed mice are the primary competence reservoir that infects juvenile ticks with Borrelia and Babesia.'
    }
  },
  {
    id: 'mice-against-ticks-crispr',
    category: 'biocontrol_science',
    title: 'MIT "Mice Against Ticks" Citizen Bioengineering',
    subtitle: 'Dr. Kevin Esvelt’s community-guided genetic stewardship on Nantucket & Martha\'s Vineyard',
    icon: '🧬',
    summary: 'A revolutionary open-science initiative to introduce heritably Lyme-immune white-footed mice to break the island transmission chain.',
    deepDive: 'Developed by the MIT Media Lab Sculpting Evolution group led by evolutionary engineer Dr. Kevin Esvelt, "Mice Against Ticks" is a non-gene-drive approach. Researchers isolate the mouse antibody gene that targets the tick outer surface protein (OspA) and insert it directly into the native white-footed mouse genome. When released on an island, offspring inherit Lyme immunity naturally via standard Mendelian genetics without spreading unchecked to mainland ecosystems. The project is governed strictly through transparent Nantucket town hall citizen votes.',
    keyFacts: [
      'Uses standard Mendelian inheritance rather than runaway gene drives for strict geographical containment.',
      'Prevents ticks from acquiring Borrelia spirochetes when biting immune mice, clearing the island\'s nymph population over successive generations.',
      'Pioneered the "Open Science & Community Consent First" paradigm where local townspeople vote on every research milestone.'
    ],
    socraticChallenge: {
      question: 'Why did MIT researchers deliberately reject using an autonomous "CRISPR Gene Drive" for the Nantucket mouse project?',
      options: [
        'Gene drives are illegal under all international maritime treaties.',
        'A self-propagating gene drive cannot be recalled if a mouse accidentally escapes the island to the mainland on a ferry.',
        'Mice are unable to replicate synthetic DNA.',
        'Standard mice are already resistant to Lyme.'
      ],
      correctIndex: 1,
      explanation: 'Precisely! A self-propagating gene drive could potentially escape on freight boats or ferries and spread across the entire North American continent irreversibly. Engineered Mendelian resistance ensures the trait remains naturally constrained and can be managed locally.'
    }
  },
  {
    id: 'co-infection-synergies',
    category: 'pathology_diagnostics',
    title: 'Multi-Vector Co-Infection Dynamics',
    subtitle: 'Lyme (Bacteria) + Babesiosis (Protozoa) + Anaplasmosis (Intracellular Bacteria)',
    icon: '🔬',
    summary: 'A single tick bite on Nantucket frequently delivers multiple pathogens, causing atypical and severe illness.',
    deepDive: 'Up to 20-30% of adult Ixodes scapularis ticks on Nantucket harbor multiple pathogens simultaneously. While Borrelia burgdorferi is a spirochetal bacterium treated with Doxycycline or Amoxicillin, Babesia microti is an intraerythrocytic protozoan parasite (similar to malaria) requiring Atovaquone + Azithromycin. Anaplasma phagocytophilum attacks white blood cells, causing severe leukopenia and elevated liver enzymes. Treating only for Lyme when co-infected with Babesia leaves the patient vulnerable to severe hemolytic anemia.',
    keyFacts: [
      'Standard Lyme antibiotics (like Amoxicillin or Ceftriaxone) have zero efficacy against protozoan Babesia parasites.',
      'Co-infected patients suffer higher rates of hospital admission, longer symptom duration, and higher fever spikes.',
      'Blood smear microscopy with Giemsa staining or multi-target PCR is essential when severe systemic chills and hemolytic signs present.'
    ],
    socraticChallenge: {
      question: 'A patient treated with oral Amoxicillin for an Erythema migrans rash returns 5 days later with severe drenching night sweats, shaking chills, and yellowing sclera (jaundice). What is the most likely clinical cause?',
      options: [
        'The patient has an allergic reaction to Amoxicillin.',
        'The patient has an untreated concurrent Babesia microti co-infection causing red blood cell hemolysis.',
        'Lyme disease has mutated into a drug-resistant strain.',
        'The tick bite was merely an insect sting.'
      ],
      correctIndex: 1,
      explanation: 'Excellent clinical judgment! Amoxicillin treats Lyme bacteria but has no activity against protozoan Babesia microti parasites. The drenching night sweats, shaking chills, and hemolytic jaundice indicate active intraerythrocytic Babesiosis requiring Atovaquone and Azithromycin.'
    }
  },
  {
    id: 'two-tier-serology-paradox',
    category: 'socratic_myths',
    title: 'The 2-Tier Serology "Window Period" Paradox',
    subtitle: 'Why antibody blood tests are useless in the first 2 weeks after a bite',
    icon: '🩸',
    summary: 'Understanding the biological delay in human antibody production prevents dangerous false-negative diagnostic errors.',
    deepDive: 'The human immune system requires 14 to 28 days to synthesize detectable levels of IgM and IgG antibodies against Borrelia surface proteins. Performing a standard 2-tier Lyme ELISA or Western Blot during the first week of an acute tick bite yields a false-negative rate exceeding 60-70%. CDC and IDSA guidelines stipulate that clinical diagnosis of early Lyme must be made by visual identification of the expanding Erythema migrans rash and clinical exposure history, NOT blood serology.',
    keyFacts: [
      'Negative blood tests in weeks 1-2 do NOT rule out Lyme disease or tick-borne infection.',
      'Erythema migrans rash is diagnostic in itself and warrants immediate treatment without waiting for blood work.',
      'Blood serology is valuable for later-stage manifestations (such as Lyme arthritis 3-6 months later).'
    ],
    socraticChallenge: {
      question: 'Why should a clinician NOT order a Lyme blood test for a patient presenting with an expanding 8cm bullseye rash 6 days after a Nantucket hike?',
      options: [
        'Blood tests are too expensive.',
        'The rash is already diagnostic of Lyme disease, and early serology will likely be falsely negative due to the humoral lag period.',
        'Lyme disease cannot be treated if a blood test is ordered.',
        'Blood tests only work on children.'
      ],
      correctIndex: 1,
      explanation: 'Exactly! An expanding Erythema migrans (>5 cm) in an endemic area like Nantucket is definitively diagnostic. Ordering serology in the acute window risks a false negative that could mislead patients into delaying necessary antibiotic treatment.'
    }
  },
  {
    id: 'tick-saliva-pharmacopeia',
    category: 'biocontrol_science',
    title: 'Nature’s Stealth Bio-Engineers: What Ticks Teach Medicine',
    subtitle: 'From stroke-preventing anticoagulants to arthritis-taming evasins and tumor apoptosis',
    icon: '🧪',
    summary: 'Tick saliva is a pharmacological treasure trove containing over 3,000 bioactive molecules currently being engineered into cardiovascular, autoimmune, and oncology therapies.',
    deepDive: 'To feed undetected for 7 days, ticks evolved salivary "evasins" that neutralize human inflammatory chemokines (CCL2, CXCL8) like molecular sponges, plus targeted Factor Xa/thrombin inhibitors (Ixolaris, Variegin) that stop blood clotting without systemic bleeding risks. In oncology, the tick peptide Amblyomin-X has demonstrated selective destruction of melanoma and renal cancer cells while sparing healthy tissue.',
    keyFacts: [
      'Evasins bind directly to inflammatory chemokines, providing blueprints for novel rheumatoid arthritis and myocarditis drugs.',
      'Ixolaris and Variegin offer targeted anti-thrombotic action during cardiac surgery with lower hemorrhage risk than standard heparin.',
      'Amblyomin-X triggers proteasome disruption and selective apoptosis in tumor cells.',
      'Ticks in the wild nourish ground foragers (turkeys, quails, towhees) and predatory invertebrates (wolf spiders, carabid beetles).'
    ],
    socraticChallenge: {
      question: 'Why are cardiologists and immunologists so eager to study proteins found in tick saliva?',
      options: [
        'Tick saliva contains Lyme bacteria antibodies.',
        'Tick saliva contains highly specialized evasins and anticoagulants that stop clotting and inflammation without destroying surrounding healthy tissue.',
        'Tick saliva can be used as a natural sunscreen.',
        'Tick proteins make human skin permanently immune to insect bites.'
      ],
      correctIndex: 1,
      explanation: 'Correct! Ticks have spent over 100 million years perfecting stealth proteins (like evasins and direct Factor Xa inhibitors) that suppress inflammation and block blood clotting with surgical precision, offering revolutionary drug models for cardiovascular disease, arthritis, and cancer.'
    }
  }
];

