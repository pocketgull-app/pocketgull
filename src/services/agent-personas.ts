import { AnalysisLens } from './clinical-intelligence.service';

/**
 * Visual identity for each Gull Squadron agent.
 * @see DESIGN.md §7 — Avian Personas
 */
export interface IAgentPersona {
    /** Display name — e.g. 'Gulliver' */
    name: string;
    /** Short role title for badge display */
    role: string;
    /** Emoji icon for compact contexts */
    emoji: string;
    /** Signature tagline — italicized in UI */
    tagline: string;
    /** Hex accent color for theming */
    accentColor: string;
    /** Tailwind color class suffix — e.g. 'blue-500' */
    accentTailwind: string;
    /** Path to origami avatar image (relative to assets root) */
    avatarPath: string;
    /** Physical anthropomorphic props */
    props: string[];
    /** Name of keyframe SVG animation */
    svgAnimation: string;
    /** Maps to ADK / system orchestrator */
    adkMapping: string;
    /** Specific seagull variety name (Laridae family) */
    gullVariety?: string;
    /** Scientific Latin binomial */
    scientificName?: string;
    /** Adult wingspan in centimeters */
    wingspanCm?: number;
    /** Natural coastal / marine habitat */
    coastalHabitat?: string;
    /** Natural gull behavioral trait mapped to patient care */
    gullCareSpecialty?: string;
}

/**
 * The core personas of the Gull Squadron.
 * @see DESIGN.md §7 — Avian Personas
 */
export const AGENT_PERSONAS: Record<string, IAgentPersona> = {
    gulliver: {
        name: 'Gulliver',
        role: 'Overview & Chart Synthesis',
        emoji: '🔭',
        tagline: 'Gently mapping the whole horizon so you always have a clear, hopeful path forward.',
        accentColor: '#1C6AFF',
        accentTailwind: 'blue-500',
        avatarPath: 'assets/images/agents/gulliver.png',
        props: ['Brass Telescope', 'Weathered Captain’s Logbook', 'Compass Rose'],
        svgAnimation: 'telescope-scan',
        adkMapping: 'overview_agent',
        gullVariety: 'Glaucous-winged Gull',
        scientificName: 'Larus glaucescens',
        wingspanCm: 137,
        coastalHabitat: 'Pacific Northwest Rocky Coasts & Puget Sound',
        gullCareSpecialty: 'Panoramic Shoreline Scouting: Glides above coastal updrafts to synthesize the full longitudinal clinical picture.',
    },
    swoop: {
        name: 'Swoop',
        role: 'Interventions & Precision Dosing',
        emoji: '⚡',
        tagline: 'Delivering thoughtful, practical care steps right where they help the most.',
        accentColor: '#059669',
        accentTailwind: 'emerald-600',
        avatarPath: 'assets/images/agents/swoop.png',
        props: ['Leather Satchel', 'Stethoscope', 'Aviator Goggles'],
        svgAnimation: 'satchel-bounce',
        adkMapping: 'interventions_agent',
        gullVariety: 'Franklin\'s Gull',
        scientificName: 'Leucophaeus pipixcan',
        wingspanCm: 90,
        coastalHabitat: 'Inland Prairie Marshes & Pacific Coastal Flyways',
        gullCareSpecialty: 'Agile Care Precision: Highly nimble flyer that swoops in with targeted non-pharmacological care steps before problems escalate.',
    },
    sentinel: {
        name: 'Sentinel',
        role: 'Recovery Vigilance & Trends',
        emoji: '🔦',
        tagline: 'Keeping a warm, steady lighthouse glowing on the horizon to watch your recovery take flight.',
        accentColor: '#D97706',
        accentTailwind: 'amber-600',
        avatarPath: 'assets/images/agents/sentinel.png',
        props: ['Lighthouse Cap', 'Binoculars', 'Signal Lantern'],
        svgAnimation: 'lantern-beam-rotate',
        adkMapping: 'monitoring_agent',
        gullVariety: 'Black-legged Kittiwake',
        scientificName: 'Rissa tridactyla',
        wingspanCm: 91,
        coastalHabitat: 'Sheer Arctic Sea Cliffs & Open Ocean Waters',
        gullCareSpecialty: 'Pelagic Vigilance: True oceanic cliff gull that rides storm winds without landing, monitoring recovery trends and vital signals.',
    },
    scribes: {
        name: 'Scribes',
        role: 'Patient Translation & Education',
        emoji: '📖',
        tagline: 'Translating complex medical science into clear, empowering steps with a supportive smile.',
        accentColor: '#7C3AED',
        accentTailwind: 'violet-600',
        avatarPath: 'assets/images/agents/scribes.png',
        props: ['Reading Spectacles', 'Open Storybook', 'Ink Quill'],
        svgAnimation: 'quill-write',
        adkMapping: 'education_agent',
        gullVariety: 'Heermann\'s Gull',
        scientificName: 'Larus heermanni',
        wingspanCm: 118,
        coastalHabitat: 'Baja California Islets & Pacific Sandy Beaches',
        gullCareSpecialty: 'Empowering Translation: Highly communicative Pacific gull that translates complex medical Latin into warm, dyslexia-friendly patient stories.',
    },
    skimmer: {
        name: 'Skimmer',
        role: 'Flash AI Inference Backbone',
        emoji: '⚡',
        tagline: 'Nimble, high-speed insights designed to make your day run smoothly.',
        accentColor: '#06B6D4',
        accentTailwind: 'cyan-500',
        avatarPath: 'assets/images/agents/skimmer.png',
        props: ['Racing Goggles', 'Speed Lines', 'Mandible Probe'],
        svgAnimation: 'speed-dash',
        adkMapping: 'gemini-3.8-flash',
        gullVariety: 'Sabine\'s Gull',
        scientificName: 'Xema sabini',
        wingspanCm: 89,
        coastalHabitat: 'High Arctic Wet Tundra & Pelagic Ocean Currents',
        gullCareSpecialty: 'High-Speed Edge Inference: Fork-tailed, ultra-fast pelagic gull that skims on-device Chrome Prompt API / Gemma 4 with zero network drag.',
    },
    samaritan: {
        name: 'Samaritan',
        role: 'Good Samaritan Emergency Override',
        emoji: '🚨',
        tagline: 'Always ready by your side, online or offline, whenever an extra helping hand is needed.',
        accentColor: '#EF4444',
        accentTailwind: 'red-500',
        avatarPath: 'assets/images/agents/samaritan.png',
        props: ['Red Cross Armband', 'Defibrillator Paddle', 'CPR Metronome'],
        svgAnimation: 'cpr-pulse-metronome',
        adkMapping: 'offline_emergency_bypass',
        gullVariety: 'Great Black-backed Gull',
        scientificName: 'Larus marinus',
        wingspanCm: 165,
        coastalHabitat: 'North Atlantic Rocky Coasts & Windswept Ocean Islands',
        gullCareSpecialty: 'Good Samaritan Rescuer: The largest and most powerful gull in the world; delivers heavy-lift emergency triage and protective life support.',
    },
    coach: {
        name: 'Head Coach Red',
        role: '1996 Championship Strategy & Team Encouragement',
        emoji: '🏀',
        tagline: 'Teamwork, high spirits, and steady fundamentals: let’s bring out everyone’s best!',
        accentColor: '#E11B22',
        accentTailwind: 'red-600',
        avatarPath: 'assets/images/agents/coach.png',
        props: ['Whistle & Lanyard', 'Chalkboard Playbook', '1996 Gold Championship Ring'],
        svgAnimation: 'playbook-whistle',
        adkMapping: 'head_coach_96_agent',
        gullVariety: 'Western Gull',
        scientificName: 'Larus occidentalis',
        wingspanCm: 135,
        coastalHabitat: 'Pacific Coast Bluffs, Harbors & Offshore Islands',
        gullCareSpecialty: 'Steadfast Team Fundamentals: Formidable, unflappable anchor of the Pacific coast who keeps the multidisciplinary care team focused and confident.',
    },
    monk: {
        name: 'Brother Gulliver',
        role: 'Circadian Wellness & Restful Renewal Guide',
        emoji: '🕊️',
        tagline: 'Gentle rhythms, quiet mindfulness, and restorative rest for body and mind.',
        accentColor: '#8A4DAF',
        accentTailwind: 'purple-600',
        avatarPath: 'assets/images/agents/monk.png',
        props: ['Linen Habit', 'Contemplative Hourglass', 'Olive Oil & Herbs'],
        svgAnimation: 'candle-pulse',
        adkMapping: 'lenten_monk_agent',
        gullVariety: 'Ross\'s Gull',
        scientificName: 'Rhodostethia rosea',
        wingspanCm: 84,
        coastalHabitat: 'High Arctic Sea Ice, Pack Floes & Siberian Tundra',
        gullCareSpecialty: 'Circadian Renewal & Peace: Delicate pink-washed Arctic gull that brings quiet contemplation, parasympathetic vagal rhythm, and restorative rest.',
    },
    curie: {
        name: 'Madame Marie Curie',
        role: 'Pioneer Radiologist & PET Isotope Decay Specialist',
        emoji: '🔬',
        tagline: 'Nothing in life is to be feared, it is only to be understood.',
        accentColor: '#00FF88',
        accentTailwind: 'emerald-500',
        avatarPath: 'assets/images/agents/curie.png',
        props: ['Electrometer', 'Radium Test Tube', '1903 Nobel Medal'],
        svgAnimation: 'radium-glow',
        adkMapping: 'madame_curie_agent',
        gullVariety: 'Ivory Gull',
        scientificName: 'Pagophila eburnea',
        wingspanCm: 108,
        coastalHabitat: 'Arctic Drift Ice & High Latitude Nunataks',
        gullCareSpecialty: 'Alabaster Empirical Rigor: Pure white high-arctic gull that thrives at the ice edge, cutting through diagnostic fog with dispassionate physical truth.',
    },
    debugger: {
        name: 'Zero',
        role: 'System Polish & Harmony Caretaker',
        emoji: '🧹',
        tagline: 'Polishing every detail with care so your clinical experience stays effortless and bright.',
        accentColor: '#10B981',
        accentTailwind: 'emerald-500',
        avatarPath: 'assets/images/agents/zero.png',
        props: ['Digital Broom', 'Magnifying Glass', 'Source Map Scroll'],
        svgAnimation: 'error-sweep',
        adkMapping: 'debug_integrity_agent',
        gullVariety: 'Laughing Gull',
        scientificName: 'Leucophaeus atricilla',
        wingspanCm: 100,
        coastalHabitat: 'Atlantic & Gulf Coastal Salt Marshes & Sandy Beaches',
        gullCareSpecialty: 'Beachcomber Polish: Methodical coastal cleaner that searches every tidepool and line of code to keep clinical workflows smooth and sparkling.',
    },
    beacon: {
        name: 'Beacon',
        role: 'Performance Optimization & Core Web Vitals',
        emoji: '🕯️',
        tagline: 'Shining a clear, bright light to keep every interaction lightning-fast and responsive.',
        accentColor: '#FBBF24',
        accentTailwind: 'amber-400',
        avatarPath: 'assets/images/agents/beacon.png',
        props: ['Golden Lighthouse Trophy', 'Stopwatch', 'Prism Lens'],
        svgAnimation: 'beam-sweep-100',
        adkMapping: 'performance_optimization_agent',
        gullVariety: 'Silver Gull',
        scientificName: 'Chroicocephalus novaehollandiae',
        wingspanCm: 93,
        coastalHabitat: 'Southern Coastal Waters, Bays & Lighthouse Headlands',
        gullCareSpecialty: 'Lighthouse Beacon: Radiant silver-and-white coastal gull that shines a luminous beam to keep web interactions lightning fast.',
    },
    osteopath: {
        name: 'Dr. Elena Gullwing, DO',
        role: 'Whole-Person Osteopathic Care & Collaborative Rounds',
        emoji: '🦴',
        tagline: 'Nurturing the whole person with warmth, structural balance, and thoughtful clinical collaboration.',
        accentColor: '#D97706',
        accentTailwind: 'amber-600',
        avatarPath: 'assets/images/agents/osteopath.png',
        props: ['Spine Biomechanical Model', 'Compassionate Somatic Tuning Fork', 'OMT Palpation Gauge'],
        svgAnimation: 'somatic-resonance',
        adkMapping: 'osteopathic_rounds_director',
        gullVariety: 'Herring Gull',
        scientificName: 'Larus argentatus',
        wingspanCm: 145,
        coastalHabitat: 'North Atlantic Rocky Shores, Estuaries & Ocean Headlands',
        gullCareSpecialty: 'Somatic Vagal Resonance: Master of effortless whole-body thermal soaring; aligns physical biomechanics and vagal resonance with zero gavels.',
    },
};

/**
 * Returns the full visual persona for a given diagnostic lens.
 * Centralizes the lens → agent mapping formerly split across
 * getAgentNameForLens() and getAgentRoleForLens().
 */
export function getPersonaForLens(lens: AnalysisLens): IAgentPersona {
    switch (lens) {
        case 'Summary Overview':
            return AGENT_PERSONAS['gulliver'];
        case 'Functional Protocols':
        case 'Nutrition':
        case 'Precision Nutrients':
        case 'Treatment Matrix':
            return AGENT_PERSONAS['swoop'];
        case 'Monitoring & Follow-up':
            return AGENT_PERSONAS['sentinel'];
        case 'Patient Education':
            return AGENT_PERSONAS['scribes'];
        case 'Console Debugging & Integrity':
            return AGENT_PERSONAS['debugger'];
        case 'Performance Optimization & Web Vitals':
            return AGENT_PERSONAS['beacon'];
        case 'Teledentistry & Systemic Health':
            return AGENT_PERSONAS['swoop'];
        default:
            return AGENT_PERSONAS['gulliver'];
    }
}

export interface IPersonaPropBadge {
  primaryProp: string;
  badgeLabel: string;
  badgeEmoji: string;
  badgeClass: string;
}

/**
 * Returns contextual prop badge details for a given clinical lens.
 */
export function getPersonaPropBadge(lens: AnalysisLens): IPersonaPropBadge {
  const persona = getPersonaForLens(lens);
  return {
    primaryProp: persona.props[0] || 'Origami Badge',
    badgeLabel: `${persona.name} — ${persona.props[0]}`,
    badgeEmoji: persona.emoji,
    badgeClass: `anim-${persona.svgAnimation}`,
  };
}
