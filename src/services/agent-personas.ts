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
        tagline: 'I see the whole ocean from up here.',
        accentColor: '#1C6AFF',
        accentTailwind: 'blue-500',
        avatarPath: 'assets/images/agents/gulliver.png',
        props: ['Brass Telescope', 'Weathered Captain’s Logbook', 'Compass Rose'],
        svgAnimation: 'telescope-scan',
        adkMapping: 'overview_agent',
    },
    swoop: {
        name: 'Swoop',
        role: 'Interventions & Precision Dosing',
        emoji: '⚡',
        tagline: 'Spotted. Locked. Delivering.',
        accentColor: '#059669',
        accentTailwind: 'emerald-600',
        avatarPath: 'assets/images/agents/swoop.png',
        props: ['Leather Satchel', 'Stethoscope', 'Aviator Goggles'],
        svgAnimation: 'satchel-bounce',
        adkMapping: 'interventions_agent',
    },
    sentinel: {
        name: 'Sentinel',
        role: 'Recovery Vigilance & Trends',
        emoji: '🔦',
        tagline: 'I never blink. I never look away.',
        accentColor: '#D97706',
        accentTailwind: 'amber-600',
        avatarPath: 'assets/images/agents/sentinel.png',
        props: ['Lighthouse Cap', 'Binoculars', 'Signal Lantern'],
        svgAnimation: 'lantern-beam-rotate',
        adkMapping: 'monitoring_agent',
    },
    scribes: {
        name: 'Scribes',
        role: 'Patient Translation & Education',
        emoji: '📖',
        tagline: 'Let me explain that in a way that actually helps.',
        accentColor: '#7C3AED',
        accentTailwind: 'violet-600',
        avatarPath: 'assets/images/agents/scribes.png',
        props: ['Reading Spectacles', 'Open Storybook', 'Ink Quill'],
        svgAnimation: 'quill-write',
        adkMapping: 'education_agent',
    },
    skimmer: {
        name: 'Skimmer',
        role: 'Flash AI Inference Backbone',
        emoji: '⚡',
        tagline: 'Blink and you’ll miss me.',
        accentColor: '#06B6D4',
        accentTailwind: 'cyan-500',
        avatarPath: 'assets/images/agents/skimmer.png',
        props: ['Racing Goggles', 'Speed Lines', 'Mandible Probe'],
        svgAnimation: 'speed-dash',
        adkMapping: 'gemini-2.5-flash',
    },
    samaritan: {
        name: 'Samaritan',
        role: 'Good Samaritan Emergency Override',
        emoji: '🚨',
        tagline: 'I don’t wait for Wi-Fi. Lives don’t wait.',
        accentColor: '#EF4444',
        accentTailwind: 'red-500',
        avatarPath: 'assets/images/agents/samaritan.png',
        props: ['Red Cross Armband', 'Defibrillator Paddle', 'CPR Metronome'],
        svgAnimation: 'cpr-pulse-metronome',
        adkMapping: 'offline_emergency_bypass',
    },
    coach: {
        name: 'Head Coach Red',
        role: '1996 Dream Team Championship Strategy & Tactical Box Score',
        emoji: '🏀',
        tagline: 'Run the 96 Dream Team offense: execution, pace, and relentless defense!',
        accentColor: '#E11B22',
        accentTailwind: 'red-600',
        avatarPath: 'assets/images/agents/coach.png',
        props: ['Whistle & Lanyard', 'Chalkboard Playbook', '1996 Gold Championship Ring'],
        svgAnimation: 'playbook-whistle',
        adkMapping: 'head_coach_96_agent',
    },
    monk: {
        name: 'Brother Gulliver',
        role: 'Lenten Ascetic & Circadian Metabolic Autophagy Specialist',
        emoji: '🕊️',
        tagline: 'Restraint, silence, and circadian fasting for cellular renewal.',
        accentColor: '#8A4DAF',
        accentTailwind: 'purple-600',
        avatarPath: 'assets/images/agents/monk.png',
        props: ['Linen Habit', 'Contemplative Hourglass', 'Olive Oil & Herbs'],
        svgAnimation: 'candle-pulse',
        adkMapping: 'lenten_monk_agent',
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
    },
    debugger: {
        name: 'Zero',
        role: 'Console Integrity & Error Resolution',
        emoji: '🧹',
        tagline: 'Warnings are just errors waiting to happen. Let’s get to zero.',
        accentColor: '#10B981',
        accentTailwind: 'emerald-500',
        avatarPath: 'assets/images/agents/zero.png',
        props: ['Digital Broom', 'Magnifying Glass', 'Source Map Scroll'],
        svgAnimation: 'error-sweep',
        adkMapping: 'debug_integrity_agent',
    },
    beacon: {
        name: 'Beacon',
        role: 'Performance Optimization & Lighthouse Core Web Vitals',
        emoji: '🕯️',
        tagline: 'Illuminating the path to a perfect 100.',
        accentColor: '#FBBF24',
        accentTailwind: 'amber-400',
        avatarPath: 'assets/images/agents/beacon.png',
        props: ['Golden Lighthouse Trophy', 'Stopwatch', 'Prism Lens'],
        svgAnimation: 'beam-sweep-100',
        adkMapping: 'performance_optimization_agent',
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
