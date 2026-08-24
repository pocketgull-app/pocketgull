import { Injectable, signal, computed } from '@angular/core';

export interface IPermaDimension {
  key: 'positiveEmotion' | 'engagement' | 'relationships' | 'meaning' | 'accomplishment' | 'vitality';
  name: string;
  shortName: string;
  icon: string;
  score: number; // 0 - 10
  description: string;
  evidenceBase: string;
  clinicalScaffoldTip: string;
}

export interface IAbcdeReframe {
  id: string;
  category: 'METABOLIC' | 'CARDIOVASCULAR' | 'SLEEP_CIRCADIAN' | 'FATIGUE_IMMUNE' | 'HABIT_ADHERENCE' | 'CUSTOM';
  adversity: string;
  pessimisticBelief: string;
  consequence: string;
  disputation: {
    permanence: string; // Temporary vs. Permanent
    pervasiveness: string; // Specific vs. Universal
    personalization: string; // Systemic/Empowered vs. Defective Self
  };
  energizationAction: string;
}

export interface IViaCharacterStrength {
  id: string;
  name: string;
  virtue: 'Wisdom' | 'Courage' | 'Humanity' | 'Justice' | 'Temperance' | 'Transcendence';
  icon: string;
  description: string;
  clinicalScaffoldingStrategy: string;
  suggestedHealthMicroHabit: string;
}

export interface IThreeGoodThingsEntry {
  id: string;
  timestamp: string;
  eventDescription: string;
  whyItWentWell: string;
  permaDimension: 'Positive Emotion' | 'Engagement' | 'Relationships' | 'Meaning' | 'Accomplishment' | 'Vitality';
  associatedViaStrength: string;
}

export interface ISnyderHopePathway {
  goalTitle: string;
  agencyScore: number; // 0 - 100 ("I can do this")
  pathwayScore: number; // 0 - 100 ("I have workable routes")
  compositeHopeIndex: number; // 0 - 100
  pathways: Array<{
    id: string;
    routeType: 'SOMATIC' | 'NUTRITIONAL' | 'ACOUSTIC_COGNITIVE' | 'COMMUNAL';
    title: string;
    actionPlan: string;
    frictionLevel: 'Low' | 'Moderate';
    estimatedAutonomicBenefit: string;
  }>;
}

/**
 * PositivePsychologyService — Dr. Martin E. P. Seligman Positive Psychology & Flourishing Engine
 * 
 * Evidence-Based Frameworks:
 * - PERMA-V Human Flourishing Assessment (Seligman, 2011)
 * - ABCDE Learned Optimism Explanatory Style Engine (Seligman, 1990)
 * - VIA 24 Character Strengths Matrix (Peterson & Seligman, 2004)
 * - Three Good Things RCT Protocol (Seligman et al., 2005)
 * - Snyder Hope Theory & Multi-Pathway Decision Rails (Snyder, 2002)
 * - Broaden-and-Build Cardiovascular "Undo Effect" (Fredrickson, 2001)
 */
@Injectable({
  providedIn: 'root'
})
export class PositivePsychologyService {

  // --- PERMA-V Dimensions State ---
  readonly permaDimensions = signal<IPermaDimension[]>([
    {
      key: 'positiveEmotion',
      name: 'Positive Emotion (P)',
      shortName: 'Positive Emotion',
      icon: '☀️',
      score: 8.5,
      description: 'Savoring daily micro-joys, awe, serenity, and optimism.',
      evidenceBase: 'Barbara Fredrickson Broaden-and-Build: Positive affect accelerates cardiovascular recovery after acute stress (The Undo Effect).',
      clinicalScaffoldTip: 'Practice 3-minute morning savoring of warm tea and natural sunlight.'
    },
    {
      key: 'engagement',
      name: 'Engagement & Flow (E)',
      shortName: 'Engagement',
      icon: '🎨',
      score: 9.0,
      description: 'Deep psychological absorption in creative and cognitive pursuits.',
      evidenceBase: 'Mihaly Csikszentmihalyi: Flow state synchronizes thalamocortical alpha rhythms (8-12 Hz) and blunts cortisol hyper-secretion.',
      clinicalScaffoldTip: 'Engage in hands-on tactile tasks (gardening, origami, 3D anatomy inspection).'
    },
    {
      key: 'relationships',
      name: 'Relationships & Co-Regulation (R)',
      shortName: 'Relationships',
      icon: '🤝',
      score: 8.8,
      description: 'Warm reciprocal connections, shared laughter, and emotional safety.',
      evidenceBase: 'Holt-Lunstad Meta-Analysis (PLoS Med): Strong social integration confers a 50% increased likelihood of survival across chronic illness.',
      clinicalScaffoldTip: 'Share a nutrient-dense Mediterranean/Ayurvedic meal with a friend or caregiver.'
    },
    {
      key: 'meaning',
      name: 'Meaning & Purpose (M)',
      shortName: 'Meaning',
      icon: '🌱',
      score: 9.4,
      description: 'Serving something larger than the self; transgenerational stewardship.',
      evidenceBase: 'Viktor Frankl & Steger Purpose Index: High existential meaning correlates with lower IL-6 and higher natural killer cell cytotoxicity.',
      clinicalScaffoldTip: 'Frame daily health adherence as energy to steward family, community, and creative callings.'
    },
    {
      key: 'accomplishment',
      name: 'Accomplishment & Mastery (A)',
      shortName: 'Accomplishment',
      icon: '🏆',
      score: 8.9,
      description: 'Celebrating continuous micro-progress, growth, and self-efficacy.',
      evidenceBase: 'Albert Bandura & Teresa Amabile Progress Principle: Small daily micro-wins sustain dopamine receptor sensitivity and long-term habit permanence.',
      clinicalScaffoldTip: 'Track 3-day glycemic stability or 5-day breathwork streaks rather than all-or-nothing targets.'
    },
    {
      key: 'vitality',
      name: 'Vitality & Somatics (V)',
      shortName: 'Vitality',
      icon: '🍵',
      score: 8.6,
      description: 'Restorative sleep, circadian alignment, and autonomic balance.',
      evidenceBase: 'Martin Seligman (2018): Biological vitality provides the physiological substrate for emotional and cognitive flourishing.',
      clinicalScaffoldTip: 'Integrate 4608kbps 528Hz Solfeggio soundscapes with 0.1Hz baroreflex breathing.'
    }
  ]);

  // --- VIA Character Strengths Taxonomy (Peterson & Seligman 2004) ---
  readonly viaStrengthsCatalog = signal<IViaCharacterStrength[]>([
    {
      id: 'via_curiosity',
      name: 'Curiosity & Exploration',
      virtue: 'Wisdom',
      icon: '🔍',
      description: 'Taking an interest in ongoing experience for its own sake; finding fascinating subjects.',
      clinicalScaffoldingStrategy: 'Explore interactive Socratic biomarker HUDs and mechanistic biophysical twin simulations.',
      suggestedHealthMicroHabit: 'Inspect weekly glycemic & HRV telemetry curves as a scientific explorer rather than a judged patient.'
    },
    {
      id: 'via_perseverance',
      name: 'Perseverance & Grit',
      virtue: 'Courage',
      icon: '🏔️',
      description: 'Finishing what one starts; persisting in a course of action in spite of obstacles.',
      clinicalScaffoldingStrategy: 'Gamify micro-habit consistency with momentum streaks and incremental athletic load tracking.',
      suggestedHealthMicroHabit: 'Commit to 10-minute daily zone-2 walking before checking emails.'
    },
    {
      id: 'via_kindness',
      name: 'Kindness & Generosity',
      virtue: 'Humanity',
      icon: '🕊️',
      description: 'Doing favors and good deeds for others; helping and taking care of people.',
      clinicalScaffoldingStrategy: 'Connect personal healthy lifestyle habits with caring for family, mentoring, or shared healthy cooking.',
      suggestedHealthMicroHabit: 'Prepare a batch of anti-inflammatory bone broth or golden turmeric stew to share with a neighbor.'
    },
    {
      id: 'via_hope',
      name: 'Hope & Optimism',
      virtue: 'Transcendence',
      icon: '🌟',
      description: 'Expecting the best in the future and working to achieve it; believing a good future is something that can be brought about.',
      clinicalScaffoldingStrategy: 'Utilize Snyder Hope Pathways to visualize multiple achievable forks for every care goal.',
      suggestedHealthMicroHabit: 'Write down tomorrow morning’s primary vitalizing self-care activity before going to bed.'
    },
    {
      id: 'via_appreciation_beauty',
      name: 'Appreciation of Beauty',
      virtue: 'Transcendence',
      icon: '🌿',
      description: 'Noticing and appreciating beauty, excellence, and skilled performance in all domains of life.',
      clinicalScaffoldingStrategy: 'Biophilic nature foraging, coastal ocean walks, and acoustic harmonic soundscapes.',
      suggestedHealthMicroHabit: 'Spend 15 minutes outdoors observing coastal fauna and botanical textures without looking at screens.'
    },
    {
      id: 'via_zest',
      name: 'Zest & Vital Energy',
      virtue: 'Courage',
      icon: '⚡',
      description: 'Approaching life with excitement and energy; not doing things halfway or halfheartedly.',
      clinicalScaffoldingStrategy: 'High-intensity micro-burst workouts, cold water immersion, and rhythmic music entrainment.',
      suggestedHealthMicroHabit: 'Engage in 2 minutes of morning vigorous jumping jacks or brisk climbing to stimulate lymphatic flow.'
    },
    {
      id: 'via_self_regulation',
      name: 'Self-Regulation & Temperance',
      virtue: 'Temperance',
      icon: '⚖️',
      description: 'Regulating what one feels and does; being disciplined; controlling one’s appetites and emotions.',
      clinicalScaffoldingStrategy: 'Environmental choice architecture, circadian meal windows, and automated sleep cutoffs.',
      suggestedHealthMicroHabit: 'Set kitchen food cutoff 3 hours prior to bedtime to optimize nocturnal cellular autophagy.'
    },
    {
      id: 'via_humor',
      name: 'Humor & Playfulness',
      virtue: 'Transcendence',
      icon: '🎭',
      description: 'Liking to laugh and tease; bringing smiles to other people; seeing the light side.',
      clinicalScaffoldingStrategy: 'Laughter yoga, whimsical Seagullian coaching analogies, and playful micro-games.',
      suggestedHealthMicroHabit: 'Watch or listen to a 5-minute standup comedy snippet during lunch to trigger endorphins.'
    }
  ]);

  // Selected Patient Signature Strengths (Default: Curiosity, Kindness, Hope)
  readonly selectedSignatureStrengthIds = signal<string[]>(['via_curiosity', 'via_kindness', 'via_hope']);

  // --- Seligman ABCDE Explanatory Style Preset Library ---
  readonly abcdeLibrary = signal<IAbcdeReframe[]>([
    {
      id: 'abcde_glycemic_spike',
      category: 'METABOLIC',
      adversity: 'Postprandial Glucose spiked to 168 mg/dL after dining out with friends.',
      pessimisticBelief: 'My metabolism is permanently broken and I have zero willpower to control my diabetes.',
      consequence: 'Spike in anxiety, elevated evening cortisol, binge eating temptation, and self-blame.',
      disputation: {
        permanence: 'Temporary: Glucose fluctuates naturally and typically returns to baseline within 2–3 hours with gentle movement.',
        pervasiveness: 'Specific: My fasting glucose and 14-day average remain excellent; one meal does not define metabolic health.',
        personalization: 'Empowered Choice: The restaurant sauce had hidden refined starches; I can easily counter this with a 15-minute post-meal walk and apple cider vinegar.'
      },
      energizationAction: 'Drink a glass of water with 1 tbsp raw apple cider vinegar and take a gentle 15-minute neighborhood walk to activate GLUT4 muscle glucose uptake.'
    },
    {
      id: 'abcde_bp_stress_spike',
      category: 'CARDIOVASCULAR',
      adversity: 'Blood Pressure measured 142/90 mmHg during an intense work deadline week.',
      pessimisticBelief: 'My cardiovascular system is failing and my hypertension is spiraling out of control.',
      consequence: 'Sympathetic panic loop, tight chest breathing, and white-coat syndrome on re-testing.',
      disputation: {
        permanence: 'Temporary: Blood pressure is dynamic; acute sympathetic elevation is an adaptive physiological response to deadline load, not permanent vascular damage.',
        pervasiveness: 'Specific: My arterial elasticity and resting heart rate on weekends demonstrate robust autonomic reserve.',
        personalization: 'Empowered Choice: Deadline stress triggered rapid shallow breathing; initiating 0.1Hz resonant breathing will rapidly restore baroreflex sensitivity.'
      },
      energizationAction: 'Engage in 10 minutes of 4.0 bpm Box Breathing paired with 528Hz Solfeggio acoustic co-regulation to activate the vagus nerve.'
    },
    {
      id: 'abcde_sleep_disruption',
      category: 'SLEEP_CIRCADIAN',
      adversity: 'Woke up at 3:15 AM with racing thoughts and got only 5.2 hours of fragmented sleep.',
      pessimisticBelief: 'My entire week is ruined. My cognitive clarity is destroyed and I cannot function today.',
      consequence: 'Excessive morning caffeine consumption, dread, skipped workouts, and late afternoon exhaustion.',
      disputation: {
        permanence: 'Temporary: Acute sleep restriction is handled well by human physiology; deep NREM sleep architecture rebounds automatically the following night.',
        pervasiveness: 'Specific: Cognitive performance remains highly resilient for standard daily tasks; circadian rhythms remain intact.',
        personalization: 'Empowered Choice: Late evening screen exposure delayed melatonin release; I can anchor today with bright morning sunlight and an early evening cutoff.'
      },
      energizationAction: 'Get 10 minutes of direct outdoor sunlight in the eyes within 30 minutes of waking, and limit caffeine intake strictly to before 11:00 AM.'
    },
    {
      id: 'abcde_missed_workout',
      category: 'HABIT_ADHERENCE',
      adversity: 'Missed 3 scheduled strength training sessions due to travel and fatigue.',
      pessimisticBelief: 'I have lost all my momentum and muscle conditioning. I always fail to stick to fitness routines.',
      consequence: 'Lethargy, guilt, abandoned nutrition tracking, and prolonged sedentary streak.',
      disputation: {
        permanence: 'Temporary: Muscle memory and mitochondrial enzymes remain stable for 2–3 weeks of rest; zero meaningful muscle loss occurs in 3 days.',
        pervasiveness: 'Specific: My daily steps and hydration remained on point; rest was necessary for immune and tendon recovery.',
        personalization: 'Empowered Choice: Travel schedule created logistical friction; I can resume seamlessly today with a gentle 15-minute bodyweight mobility routine.'
      },
      energizationAction: 'Perform 10 pushups, 15 bodyweight air squats, and 5 minutes of spine mobility right now to reclaim physical momentum.'
    }
  ]);

  // --- Three Good Things Ledger (Seligman 2005 Protocol) ---
  readonly threeGoodThingsLogs = signal<IThreeGoodThingsEntry[]>([
    {
      id: 'tgt_001',
      timestamp: 'Today, 8:30 AM',
      eventDescription: 'Drank a hot ceremonial matcha tea in the morning sunlight with zero phone notifications.',
      whyItWentWell: 'I intentionally left my phone charging across the room to protect my morning peace and dopamine baseline.',
      permaDimension: 'Positive Emotion',
      associatedViaStrength: 'Self-Regulation'
    },
    {
      id: 'tgt_002',
      timestamp: 'Today, 1:15 PM',
      eventDescription: 'Prepared a fresh colorful Mediterranean salmon bowl with organic avocado and extra virgin olive oil.',
      whyItWentWell: 'I practiced batch prep yesterday so healthy ingredients were accessible and effortless to assemble.',
      permaDimension: 'Vitality',
      associatedViaStrength: 'Love of Learning'
    },
    {
      id: 'tgt_003',
      timestamp: 'Today, 4:45 PM',
      eventDescription: 'Shared an encouraging phone call with an old mentor and thanked them for their guidance.',
      whyItWentWell: 'I tapped into my signature strength of Gratitude and acted immediately rather than putting it off.',
      permaDimension: 'Relationships',
      associatedViaStrength: 'Gratitude'
    }
  ]);

  // --- Snyder Hope Theory Pathways State ---
  readonly hopePathway = signal<ISnyderHopePathway>({
    goalTitle: 'Achieve Optimal Autonomic Recovery & Glycemic Balance (A1C < 5.6%)',
    agencyScore: 92,
    pathwayScore: 88,
    compositeHopeIndex: 90,
    pathways: [
      {
        id: 'path_somatic',
        routeType: 'SOMATIC',
        title: 'Route A • Autonomic Vagal Reset',
        actionPlan: '10 minutes of 0.1Hz Baroreflex Paced Box Breathing (4.0 bpm) upon waking and before sleep.',
        frictionLevel: 'Low',
        estimatedAutonomicBenefit: 'Elevates HRV RMSSD by +18ms and lowers baseline salivary cortisol.'
      },
      {
        id: 'path_nutritional',
        routeType: 'NUTRITIONAL',
        title: 'Route B • Circadian Chrono-Nutrition',
        actionPlan: 'Consume 30g protein at breakfast, followed by 1 tbsp apple cider vinegar before complex carb meals.',
        frictionLevel: 'Low',
        estimatedAutonomicBenefit: 'Blunts postprandial glucose excursions by 25-35% without calorie restriction.'
      },
      {
        id: 'path_acoustic',
        routeType: 'ACOUSTIC_COGNITIVE',
        title: 'Route C • 4608kbps 528Hz Solfeggio Co-Regulation',
        actionPlan: 'Listen to 15 minutes of Studio Lossless Solfeggio harmonics with Bauer HRTF pinna crossfeed.',
        frictionLevel: 'Low',
        estimatedAutonomicBenefit: 'Induces deep parasympathetic shift and alpha-theta brainwave coherence.'
      }
    ]
  });

  // --- Computed Metrics ---
  readonly flourishingIndex = computed<number>(() => {
    const dims = this.permaDimensions();
    const sum = dims.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((sum / (dims.length * 10)) * 100);
  });

  readonly lowestPermaDimension = computed<IPermaDimension>(() => {
    const dims = this.permaDimensions();
    return [...dims].sort((a, b) => a.score - b.score)[0];
  });

  readonly selectedSignatureStrengths = computed<IViaCharacterStrength[]>(() => {
    const ids = new Set(this.selectedSignatureStrengthIds());
    return this.viaStrengthsCatalog().filter(s => ids.has(s.id));
  });

  /**
   * Updates a specific PERMA-V dimension score
   */
  updateDimensionScore(key: IPermaDimension['key'], delta: number): void {
    this.permaDimensions.update(dims => 
      dims.map(d => {
        if (d.key === key) {
          const newScore = Math.max(1, Math.min(10, +(d.score + delta).toFixed(1)));
          return { ...d, score: newScore };
        }
        return d;
      })
    );
  }

  /**
   * Toggles a VIA signature strength selection
   */
  toggleSignatureStrength(id: string): void {
    this.selectedSignatureStrengthIds.update(current => {
      if (current.includes(id)) {
        if (current.length <= 1) return current; // Keep at least 1
        return current.filter(item => item !== id);
      } else {
        if (current.length >= 5) return current; // Max 5 signature strengths
        return [...current, id];
      }
    });
  }

  /**
   * Adds a new Three Good Things gratitude log entry
   */
  addThreeGoodThingsLog(eventDescription: string, whyItWentWell: string, permaDimension: IThreeGoodThingsEntry['permaDimension'], associatedStrength: string): void {
    if (!eventDescription.trim() || !whyItWentWell.trim()) return;

    const newEntry: IThreeGoodThingsEntry = {
      id: `tgt_${Date.now()}`,
      timestamp: 'Just now',
      eventDescription: eventDescription.trim(),
      whyItWentWell: whyItWentWell.trim(),
      permaDimension,
      associatedViaStrength: associatedStrength
    };

    this.threeGoodThingsLogs.update(logs => [newEntry, ...logs]);
  }

  /**
   * Generates a custom ABCDE learned optimism reframe
   */
  createCustomAbcdeReframe(adversity: string, pessimisticBelief: string): IAbcdeReframe {
    return {
      id: `abcde_${Date.now()}`,
      category: 'CUSTOM',
      adversity: adversity.trim(),
      pessimisticBelief: pessimisticBelief.trim(),
      consequence: 'Acute physiological stress response and transient reduction in perceived self-efficacy.',
      disputation: {
        permanence: `Temporary: This setback is a momentary data point in time; biological systems possess immense neuroplasticity and adaptive resilience.`,
        pervasiveness: `Specific: This challenge is confined to this specific encounter; your foundational character strengths and health baseline remain robust.`,
        personalization: `Empowered Choice: External friction caused the barrier; you have full agency to select an accessible micro-habit pathway right now.`
      },
      energizationAction: `Select one 5-minute micro-habit from your signature strengths to immediately restore momentum and autonomic ease.`
    };
  }
}
