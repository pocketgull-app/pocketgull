import { Injectable, signal, computed } from '@angular/core';

export interface ISno10Concept {
  snomedCode: string;
  snomedDisplay: string;
  icd10Code: string;
  icd10Display: string;
  clinicalExplanation: string;
}

export interface ISno10DomainAnalogy {
  domainId: string;
  metaphorName: string;
  craftExplanation: string;
  systemAnalogy: string;
  maintenanceStep: string;
  adaptiveToolRecommendation: string;
}

export interface IHobbyDomainCompanion {
  id: string;
  name: string;
  domainTitle: string;
  passionBadge: string;
  avatarEmoji: string;
  tagline: string;
  relationshipBio: string; // e.g. "Your lifelong garage partner who rebuilt 60s muscle cars with you"
  craftDialect: string;
  sno10Analogies: Record<string, ISno10DomainAnalogy>; // keyed by ICD-10 or SNOMED code
  workshopErgonomics: Array<{
    toolName: string;
    clinicalPurpose: string;
    howItHelps: string;
    icon: string;
  }>;
  sampleGreetings: string[];
}

export interface ICustomBuddyInput {
  name: string;
  domainOrHobby: string;
  relationshipContext: string; // e.g., "My grandfather who was a steam train engineer"
  specialMemories?: string;
  primaryConditionIcd10?: string;
}

export interface ICompanionChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  senderName: string;
  timestamp: string;
  text: string;
  snoBadge?: string;
  ergonomicTip?: string;
}

export interface ILocalCraftEvent {
  id: string;
  domainCategory: 'auto' | 'gardening' | 'woodworking' | 'music' | 'sailing' | 'crafts' | 'general';
  title: string;
  organizer: string;
  location: string;
  scheduleDescription: string;
  communityType: 'Cars & Coffee' | "Men's Sheds" | 'Guild Meeting' | 'Community Garden' | 'Jam Session' | 'Makerspace' | 'Volunteer Circle';
  accessibilityRating: 'ADA Accessible / Low-Mobility Friendly' | 'Seated Workshop' | 'Light Walking';
  contactOrLink: string;
  buddyEncouragement: string;
  icon: string;
}

/**
 * Standard SNO-10 (SNOMED-CT + ICD-10) Crosswalk Reference
 */
export const SNO10_CONDITIONS: Record<string, ISno10Concept> = {
  'I10': {
    icd10Code: 'I10',
    icd10Display: 'Essential (Primary) Hypertension',
    snomedCode: '38341003',
    snomedDisplay: 'Hypertensive disorder, systemic arterial',
    clinicalExplanation: 'Elevated hydrostatic pressure within the arterial tree increasing cardiac afterload and microvascular shear stress.'
  },
  'I50.9': {
    icd10Code: 'I50.9',
    icd10Display: 'Heart Failure, Unspecified',
    snomedCode: '84114007',
    snomedDisplay: 'Heart failure',
    clinicalExplanation: 'Impaired ventricular filling or ejection fraction causing systemic venous congestion and decreased tissue perfusion.'
  },
  'G89.29': {
    icd10Code: 'G89.29',
    icd10Display: 'Other Chronic Post-Traumatic / Neuropathic Pain',
    snomedCode: '399269003',
    snomedDisplay: 'Chronic pain',
    clinicalExplanation: 'Central sensitization and peripheral nociceptive firing persisting beyond normal tissue healing intervals.'
  },
  'E11.9': {
    icd10Code: 'E11.9',
    icd10Display: 'Type 2 Diabetes Mellitus without Complications',
    snomedCode: '73211009',
    snomedDisplay: 'Diabetes mellitus type 2',
    clinicalExplanation: 'Peripheral insulin receptor desensitization causing chronic glycemic elevation and end-organ microangiopathy.'
  },
  'M17.9': {
    icd10Code: 'M17.9',
    icd10Display: 'Osteoarthritis of Knee, Unspecified',
    snomedCode: '239873007',
    snomedDisplay: 'Osteoarthritis of knee',
    clinicalExplanation: 'Progressive articular hyaline cartilage fibrillation, subchondral sclerosis, and osteophyte formation.'
  },
  'J44.9': {
    icd10Code: 'J44.9',
    icd10Display: 'Chronic Obstructive Pulmonary Disease (COPD)',
    snomedCode: '13645005',
    snomedDisplay: 'Chronic obstructive lung disease',
    clinicalExplanation: 'Fixed airflow limitation from small airway remodeling, mucosal hypersecretion, and alveolar parenchymal loss.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class HobbyDomainCompanionService {
  // Built-in preloaded companions
  private defaultCompanions: IHobbyDomainCompanion[] = [
    {
      id: 'buddy_mechanic',
      name: 'Sal "Wrench" Moretti',
      domainTitle: 'Classic Auto Restoration & Garage Mechanic',
      passionBadge: '🏎️ V8 Engine Tuner',
      avatarEmoji: '🔧',
      tagline: 'Treat the chassis right, check your manifold pressure, and she’ll run 300,000 miles.',
      relationshipBio: 'Your lifelong garage partner who spent Saturday mornings under the hood rebuilding 1968 small-block V8s, drinking black coffee, and tuning carburetors.',
      craftDialect: 'Automotive / Powertrain & Chassis',
      sno10Analogies: {
        'I10': {
          domainId: 'buddy_mechanic',
          metaphorName: 'Manifold Backpressure & High Fuel Line PSI',
          craftExplanation: 'The fuel delivery lines are running at 80 PSI instead of 45. It strains the pump gaskets and blows hose seals.',
          systemAnalogy: 'High Blood Pressure = Fuel lines running over-pressure. Vasodilators relax the hose diameter so the pump doesn’t blow a gasket.',
          maintenanceStep: 'Check coolant hydration, cut down on salty fuel additives, and take your line pressure relief meds.',
          adaptiveToolRecommendation: 'Rolling mechanic’s creeper stool and magnetic parts tray to avoid bending over fenders.'
        },
        'I50.9': {
          domainId: 'buddy_mechanic',
          metaphorName: 'Worn Fuel Pump Impeller & Volumetric Lag',
          craftExplanation: 'The main mechanical fuel pump is pushing 35% displacement instead of 60%. Cylinders aren’t starving, but they hesitate on steep hills.',
          systemAnalogy: 'Heart Failure = Low fuel pump displacement with back-flooding in the exhaust. Diuretics drain the flooded cylinders.',
          maintenanceStep: 'Daily weigh-ins to catch fluid flooding before it hydro-locks the engine.',
          adaptiveToolRecommendation: 'Long-handle ratchets with cheater bars to minimize physical torque on your chest.'
        },
        'M17.9': {
          domainId: 'buddy_mechanic',
          metaphorName: 'Dry Suspension Bushings & Metal-on-Metal Ball Joints',
          craftExplanation: 'The rubber tie-rod and ball-joint bushings have worn down to metal contact, giving you steering chatter over rough pavement.',
          systemAnalogy: 'Knee Osteoarthritis = Worn control arm bushings. Hyaluronic acid / mobility = Fresh synthetic chassis grease.',
          maintenanceStep: 'Gentle low-load movement to pump synovial lubricant across the bearing surfaces.',
          adaptiveToolRecommendation: 'Extra-thick 2-inch closed-cell EVA foam kneeling pad and pneumatic lift table.'
        }
      },
      workshopErgonomics: [
        {
          toolName: 'Adjustable Rolling Creeper Seat with Tool Tray',
          clinicalPurpose: 'Lumbar & Knee De-loading (M17.9 / M54.5)',
          howItHelps: 'Keeps your working height at 18 inches so you can tune brakes and wheel wells without kneeling or herniating discs.',
          icon: '💺'
        },
        {
          toolName: 'Pneumatic 1/2" Impact Wrench with Anti-Vibration Grip',
          clinicalPurpose: 'Carpal Tunnel & Hand Osteoarthritis Protection',
          howItHelps: 'Let compressed air break frozen lug nuts loose so your wrist tendons and thumb joints take zero shock.',
          icon: '🛠️'
        },
        {
          toolName: 'Overhead LED Hexagon Lighting Grid',
          clinicalPurpose: 'Cataract / Low-Vision Optical Assistance',
          howItHelps: 'Floods the engine bay with 6500K shadowless illumination so you never squint or misread torque gauges.',
          icon: '💡'
        }
      ],
      sampleGreetings: [
        'Hey partner! What are we wrenching on in the bay today? Grab a shop stool and tell me how the engine’s running.',
        'Good to see you, buddy. Heard you had some line pressure spikes last week—did you get that manifold checked out?',
        'Look at that shine on the valve covers! Let’s pace ourselves today so your suspension doesn’t feel stiff tomorrow.'
      ]
    },

    {
      id: 'buddy_arborist',
      name: 'Silas "Old Oak" Thorne',
      domainTitle: 'Old-Growth Arborist & Master Botanical Gardener',
      passionBadge: '🌲 Forest Ecologist',
      avatarEmoji: '🌳',
      tagline: 'Deep roots withstand the winter gale; prune the deadwood and let the canopy breathe.',
      relationshipBio: 'Your companion who walked the redwood groves with you, identifying fungal mycelium, pruning heirloom roses, and grafting apple trees.',
      craftDialect: 'Dendrology / Soil Botany & Sap Flow',
      sno10Analogies: {
        'I10': {
          domainId: 'buddy_arborist',
          metaphorName: 'Elevated Xylem Sap Pressure in the Cambium Layer',
          craftExplanation: 'Spring sap flow is surging too fast through narrow outer vascular rings, straining the trunk bark.',
          systemAnalogy: 'Hypertension = Xylem over-pressurization. Deep breathwork and hydration widen the vascular rings.',
          maintenanceStep: 'Evening foot soaks and herbal hydration to ground the ascending tree sap.',
          adaptiveToolRecommendation: 'Telescoping carbon-fiber ratchet pruners to eliminate overhead shoulder strain.'
        },
        'E11.9': {
          domainId: 'buddy_arborist',
          metaphorName: 'Clogged Phloem Sugar Transport & Starch Saturation',
          craftExplanation: 'The leaves produced rich sugars, but the phloem transport vessels are gummed up, starving the deep mycorrhizal roots.',
          systemAnalogy: 'Type 2 Diabetes = Sugar stagnation in circulation instead of fueling root growth. Muscle contraction acts like a root pump.',
          maintenanceStep: 'Post-meal garden strolls to open the vascular channels and metabolize sap sugars.',
          adaptiveToolRecommendation: 'Ergonomic soil auger drill bits for electric drills instead of heavy manual digging.'
        },
        'J44.9': {
          domainId: 'buddy_arborist',
          metaphorName: 'Restricted Stomata Gas Exchange in Old-Growth Needles',
          craftExplanation: 'Microscopic leaf stomata pores are clogged with forest dust, cutting down oxygen-carbon exchange.',
          systemAnalogy: 'COPD = Constricted stomatal respiration. Pursed-lip breathing clears the bronchial airways like a gentle sea breeze.',
          maintenanceStep: 'Diaphragmatic pacing and clean air humidity around the greenhouse bench.',
          adaptiveToolRecommendation: 'Lightweight positive-pressure PAPR respirator mask for sawdust and pollen days.'
        }
      },
      workshopErgonomics: [
        {
          toolName: 'Elevated 36-Inch Ergonomic Cedar Raised Garden Bed',
          clinicalPurpose: 'Zero-Bend Lumbar Protection (M54.5)',
          howItHelps: 'Brings soil level up to waist height so you can sow seeds and trim herbs with a perfectly neutral spine.',
          icon: '🌱'
        },
        {
          toolName: 'Telescoping Compound-Action Bypass Lopper',
          clinicalPurpose: 'Rotator Cuff & Cervical Spine Conservation',
          howItHelps: '4:1 gear-ratio multiplier snips 2-inch tree branches with just 5 lbs of arm squeeze.',
          icon: '✂️'
        },
        {
          toolName: 'Gel-Infused Heavy-Duty Articulated Knee Armor',
          clinicalPurpose: 'Knee Bursitis & Cartilage Preservation (M17.9)',
          howItHelps: 'Distributes weight across the entire shin, eliminating direct patellar pressure when inspecting root crowns.',
          icon: '🛡️'
        }
      ],
      sampleGreetings: [
        'Welcome back to the grove, old friend. The redwoods are standing tall today. How are your roots feeling?',
        'Look at those saplings we grafted last spring! Let’s check the soil moisture and make sure you’re staying well-hydrated.',
        'Take a deep breath of the pine needles. Remember: trees don’t rush, yet everything gets accomplished.'
      ]
    },

    {
      id: 'buddy_woodworker',
      name: 'Gus "Dovetail" Lindqvist',
      domainTitle: 'Master Cabinetmaker & Hand-Tool Woodworker',
      passionBadge: '🪚 Fine Furniture Artisan',
      avatarEmoji: '🪵',
      tagline: 'Measure twice, cut once, and let the wood grain dictate the joint.',
      relationshipBio: 'Your shop partner who spent decades building heirloom walnut dressers, sharpening Japanese chisels to razor edges, and perfecting blind dovetails.',
      craftDialect: 'Timber Craft / Mortise & Tenon Joinery',
      sno10Analogies: {
        'G89.29': {
          domainId: 'buddy_woodworker',
          metaphorName: 'Internal Grain Tension & Warped Case Hardening',
          craftExplanation: 'When lumber dries too rapidly on the outside, internal grain stresses pull the board crooked and cause checking.',
          systemAnalogy: 'Chronic Pain = Case-hardened grain stress. Somatic relaxation and warmth relieve the internal wood tension.',
          maintenanceStep: 'Gentle heat therapy and progressive muscle release before stepping up to the bench.',
          adaptiveToolRecommendation: 'Benchtop quick-release vices and featherboards so your hands never fight kickback.'
        },
        'M17.9': {
          domainId: 'buddy_woodworker',
          metaphorName: 'Dry Mortise & Tenon Joint with Squeaking Dowels',
          craftExplanation: 'The joinery is tight, but dry friction without hide glue causes the chair leg to bind and creak under load.',
          systemAnalogy: 'Joint Osteoarthritis = Dry mortise and tenon. Synovial fluid is the animal hide glue that cushions every movement.',
          maintenanceStep: 'Smooth, continuous rotational warm-ups before lifting heavy oak slabs.',
          adaptiveToolRecommendation: 'Anti-fatigue high-density waffle floor mats around the table saw and jointer.'
        }
      },
      workshopErgonomics: [
        {
          toolName: 'Hydraulic Scissor-Lift Workbench with MFT Top',
          clinicalPurpose: 'Customizable Ergonomic Workplane',
          howItHelps: 'Foot pedal smoothly raises or lowers lumber between 24 and 42 inches to match hand-plane or chisel posture.',
          icon: '🪜'
        },
        {
          toolName: 'HEPA 0.3-Micron Ambient Shop Air Filtration Unit',
          clinicalPurpose: 'Pulmonary / COPD Protection (J44.9)',
          howItHelps: 'Circulates 1,000 CFM of air to capture microscopic silica and hardwood dust before reaching your lungs.',
          icon: '💨'
        },
        {
          toolName: 'Magnetic Chisel Sharpening Guide with Ergonomic Roller',
          clinicalPurpose: 'Hand Tremor & Finger Arthritis Assistance',
          howItHelps: 'Locks blade bevel at exactly 30 degrees on the waterstone without requiring tight finger pinch strength.',
          icon: '🪨'
        }
      ],
      sampleGreetings: [
        'Hey there, craftsman! Smell that fresh walnut shavings in the air? Let’s check the straight edge on our plans today.',
        'Good to have you back at the bench. Don’t push the plane too hard—let the sharp edge do the work.',
        'Joints are looking clean and square today, partner. Remember to take a break and stretch the grain.'
      ]
    },

    {
      id: 'buddy_musician',
      name: 'Maestra Clara Schumann-Vance',
      domainTitle: 'Symphony Concertmaster & Cellist',
      passionBadge: '🎻 Chamber Music Maestro',
      avatarEmoji: '🎼',
      tagline: 'When the rhythm is steady and the harmony is true, the soul resonates at 528 Hz.',
      relationshipBio: 'Your duet partner who spent decades playing cello and violin sonatas, practicing scales with a metronome, and laughing over sheet music.',
      craftDialect: 'Acoustic Harmonics / Tempo & Dynamics',
      sno10Analogies: {
        'I10': {
          domainId: 'buddy_musician',
          metaphorName: 'Over-Tensioned Bowstring & Fortissimo Strain',
          craftExplanation: 'The cello A-string is tuned two whole steps too high; the wood bridge is under severe compressive stress.',
          systemAnalogy: 'Hypertension = Over-tightened peg box. Slow diaphragmatic breathing retunes the strings to harmonious pitch.',
          maintenanceStep: '4-7-8 breathing metronome cadence at 60 BPM to lower autonomic tension.',
          adaptiveToolRecommendation: 'Carbon fiber ultra-lightweight cello bow and padded ergonomic chinrest.'
        },
        'I50.9': {
          domainId: 'buddy_musician',
          metaphorName: 'Loss of Rhythmic Syncopation & Diminuendo Fatigue',
          craftExplanation: 'The orchestra tempo is dragging because the timpanist and brass section are falling behind the conductor’s baton.',
          systemAnalogy: 'Heart Failure = Sub-optimal ejection cadence. Regular pacing keeps the musical ensemble in perfect sync.',
          maintenanceStep: 'Energy conservation techniques: Play the allegro passages in short, glorious rehearsals.',
          adaptiveToolRecommendation: 'Adjustable pneumatic musician’s posture chair with forward pelvic tilt.'
        }
      },
      workshopErgonomics: [
        {
          toolName: 'Ergonomic Gel-Cushioned Violin Chinrest & Shoulder Rest',
          clinicalPurpose: 'Cervical Spine & Brachial Plexus Decompression',
          howItHelps: 'Eliminates neck clamping, keeping your head upright and posture relaxed during violin practice.',
          icon: '🎻'
        },
        {
          toolName: 'Vocal Cord & Diaphragmatic Warmup Breath Trainer',
          clinicalPurpose: 'Vagal Nerve Activation & Vitals Stabilization',
          howItHelps: 'Regulates Heart Rate Variability (HRV) and expands tidal lung capacity with gentle acoustic resonance.',
          icon: '🌬️'
        },
        {
          toolName: 'Tablet Foot Pedal Page Turner with Anti-Glare Display',
          clinicalPurpose: 'Postural Balance & Hand Freedom',
          howItHelps: 'Tap with your toe to turn sheet music without taking your hands off the instrument or breaking posture.',
          icon: '📄'
        }
      ],
      sampleGreetings: [
        'Welcome back to the music room, dear friend! Shall we tune our strings to 440 Hz and see what harmony we create today?',
        'I’ve missed our rehearsals. Remember, even Beethoven knew that the rests between the notes are where the music lives.',
        'Let’s play with grace and ease today. Keep your shoulders down and let the breath carry the melody.'
      ]
    },

    {
      id: 'buddy_sailor',
      name: 'Captain Barnaby "Compass" Croft',
      domainTitle: 'Master Mariner & Offshore Navigator',
      passionBadge: '⛵ Ocean Voyager',
      avatarEmoji: '🧭',
      tagline: 'You cannot direct the wind, but you can always adjust your sails.',
      relationshipBio: 'Your sailing buddy who crossed the open seas with you, reading nautical charts by lantern light, trimming jibs, and anchoring in quiet coves.',
      craftDialect: 'Nautical Navigation / Hull Dynamics & Sea State',
      sno10Analogies: {
        'I10': {
          domainId: 'buddy_sailor',
          metaphorName: 'Heavy Gale Sea Swell & High Rigging Tension',
          craftExplanation: 'The wind has kicked up to Force 8 on the Beaufort scale; the stays and shrouds are vibrating under excessive pressure.',
          systemAnalogy: 'Hypertension = Storm pressure on the rigging. Reefing the mainsail (taking meds and resting) eases the tension on the mast.',
          maintenanceStep: 'Plot a course into calm leeward waters; monitor your barometer daily.',
          adaptiveToolRecommendation: 'Self-tailing electric winches to trim sheets without straining back muscles.'
        },
        'G89.29': {
          domainId: 'buddy_sailor',
          metaphorName: 'Hull Barnacles & Rudder Cavitation Vibration',
          craftExplanation: 'Rough barnacle encrustations on the hull create drag and transmit a constant humming vibration through the tiller.',
          systemAnalogy: 'Chronic Pain = Rudder vibration from drag. Hydrotherapy and stretching act like a clean haul-out scraping the hull.',
          maintenanceStep: 'Warm epsom baths and gentle movement to scrape away the somatic drag.',
          adaptiveToolRecommendation: 'Shock-absorbing helm deck mat and high-back captain’s swivel chair.'
        }
      },
      workshopErgonomics: [
        {
          toolName: 'Non-Skid High-Traction Decking Mat with Closed-Cell Foam',
          clinicalPurpose: 'Vestibular Balance & Fall Prevention',
          howItHelps: 'Provides sure footing even in wet conditions, absorbing sea vibrations and protecting ankle stability.',
          icon: '⚓'
        },
        {
          toolName: 'Self-Tailing High-Torque Electric Halyard Winch',
          clinicalPurpose: 'Biceps Tendon & Lumbar Strain Prevention',
          howItHelps: 'Hoists the heavy canvas sails at the press of a button, letting you captain the vessel effortlessly.',
          icon: '⚙️'
        },
        {
          toolName: 'Polarized High-Contrast Navigation Sunglasses (UV400)',
          clinicalPurpose: 'Macular & Retinal Glare Protection',
          howItHelps: 'Eliminates blinding sea reflections, making channel buoys and tide lines instantly crisp.',
          icon: '🕶️'
        }
      ],
      sampleGreetings: [
        'Ahoy, shipmate! The tide is turning and the breeze is fair. How’s the heading and barometer today?',
        'Good to see you at the helm, captain. Let’s make sure your ballast is trim and you’ve got plenty of fresh water in the tanks.',
        'Steady as she goes. Remember, the finest sailors aren’t the ones who fight the storm, but the ones who know when to drop anchor.'
      ]
    }
  ];

  private customCompanions = signal<IHobbyDomainCompanion[]>([]);
  private selectedCompanionId = signal<string>('buddy_mechanic');
  private chatMessages = signal<ICompanionChatMessage[]>([]);

  readonly allCompanions = computed(() => [
    ...this.defaultCompanions,
    ...this.customCompanions()
  ]);

  readonly activeCompanion = computed<IHobbyDomainCompanion>(() => {
    const list = this.allCompanions();
    return list.find(c => c.id === this.selectedCompanionId()) || list[0];
  });

  readonly activeChat = this.chatMessages.asReadonly();

  constructor() {
    this.initDefaultChat();
  }

  private initDefaultChat(): void {
    const buddy = this.activeCompanion();
    this.chatMessages.set([
      {
        id: 'msg_0',
        sender: 'buddy',
        senderName: buddy.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: buddy.sampleGreetings[0] || 'Good to see you, partner! What are we working on today?',
        ergonomicTip: buddy.workshopErgonomics[0]?.howItHelps
      }
    ]);
  }

  public selectCompanion(companionId: string): void {
    this.selectedCompanionId.set(companionId);
    const buddy = this.activeCompanion();
    this.chatMessages.set([
      {
        id: 'msg_' + Date.now(),
        sender: 'buddy',
        senderName: buddy.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: buddy.sampleGreetings[0] || `Hey partner! ${buddy.name} here. Ready to talk shop?`,
        ergonomicTip: buddy.workshopErgonomics[0]?.howItHelps
      }
    ]);
  }

  /**
   * Generates a custom domain/hobby companion tailored to a lost loved one or specific craft.
   */
  public createCustomBuddy(input: ICustomBuddyInput): IHobbyDomainCompanion {
    const newId = 'custom_' + Date.now();
    const domain = input.domainOrHobby.trim();
    const name = input.name.trim();

    const customCompanion: IHobbyDomainCompanion = {
      id: newId,
      name: name,
      domainTitle: `${domain} Craftsperson & Confidant`,
      passionBadge: `✨ Dedicated to ${name}`,
      avatarEmoji: '🤝',
      tagline: `Remembering our shared love for ${domain} and keeping the craft alive.`,
      relationshipBio: input.relationshipContext || `Your cherished companion with whom you shared a deep passion for ${domain}.`,
      craftDialect: `${domain} Domain Metaphors`,
      sno10Analogies: {
        'I10': {
          domainId: newId,
          metaphorName: `${domain} System Overpressure`,
          craftExplanation: `In ${domain}, when the primary operating pressure runs above tolerance, components wear prematurely.`,
          systemAnalogy: `Hypertension is like excessive operational load in ${domain}. Keeping vitals balanced preserves longevity.`,
          maintenanceStep: `Regular pacing and following your care plan keeps the ${domain} workshop running smoothly.`,
          adaptiveToolRecommendation: `Ergonomic seating and adaptive tools suited for ${domain} practice.`
        },
        'G89.29': {
          domainId: newId,
          metaphorName: `${domain} Structural Fatigue & Resonance`,
          craftExplanation: `Chronic strain in ${domain} creates residual material fatigue that needs gentle recalibration.`,
          systemAnalogy: `Chronic pain is structural feedback telling us to adjust our posture and workshop mechanics.`,
          maintenanceStep: `Take frequent ergonomic rest pauses and use warm-up techniques before engaging in ${domain}.`,
          adaptiveToolRecommendation: `Anti-fatigue supports and specialized gripping aids for ${domain}.`
        }
      },
      workshopErgonomics: [
        {
          toolName: `Adaptive Ergonomic Workstation for ${domain}`,
          clinicalPurpose: 'Posture & Joint Support',
          howItHelps: `Optimizes your physical setup so you can continue your ${domain} passion without physical strain.`,
          icon: '🛠️'
        },
        {
          toolName: 'Scheduled Pacing Timer & Hydration Bell',
          clinicalPurpose: 'Energy Conservation & Vitality',
          howItHelps: 'Reminds you to pause every 45 minutes to stretch, hydrate, and maintain steady energy.',
          icon: '⏱️'
        }
      ],
      sampleGreetings: [
        `Hey there! It's so good to talk again. Let's keep our passion for ${domain} going strong, just like old times.`,
        `Thinking about our ${domain} projects today. How are you feeling, partner? Remember to take care of yourself.`,
        `Every time you step into the craft of ${domain}, our bond lives on. Let's make sure you're working comfortably today.`
      ]
    };

    this.customCompanions.update(list => [...list, customCompanion]);
    this.selectCompanion(newId);
    return customCompanion;
  }

  /**
   * Translates active patient SNO-10 clinical codes into the active buddy's domain dialect.
   */
  public translateSno10ForActiveBuddy(icd10OrSnomedCode: string): ISno10DomainAnalogy | null {
    const buddy = this.activeCompanion();
    // Direct match
    if (buddy.sno10Analogies[icd10OrSnomedCode]) {
      return buddy.sno10Analogies[icd10OrSnomedCode];
    }
    // Crosswalk search
    const matchedKey = Object.keys(buddy.sno10Analogies).find(k => k === icd10OrSnomedCode || SNO10_CONDITIONS[k]?.snomedCode === icd10OrSnomedCode);
    return matchedKey ? buddy.sno10Analogies[matchedKey] : null;
  }

  /**
   * Synthesizes conversational dialog with the chosen domain companion.
   */
  public sendMessageToBuddy(userText: string, activeIssues: string[] = []): void {
    if (!userText.trim()) return;

    const buddy = this.activeCompanion();
    const userMsg: ICompanionChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      senderName: 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    this.chatMessages.update(msgs => [...msgs, userMsg]);

    // Synthesize buddy's domain-specific, empathetic response
    setTimeout(() => {
      const reply = this.generateBuddyReply(userText, buddy, activeIssues);
      this.chatMessages.update(msgs => [...msgs, reply]);
    }, 450);
  }

  private generateBuddyReply(userText: string, buddy: IHobbyDomainCompanion, activeIssues: string[]): ICompanionChatMessage {
    const textLower = userText.toLowerCase();
    let replyContent = '';
    let snoBadge: string | undefined = undefined;
    let ergoTip = buddy.workshopErgonomics[Math.floor(Math.random() * buddy.workshopErgonomics.length)]?.howItHelps;

    // Domain check
    if (textLower.includes('blood pressure') || textLower.includes('hypertension') || textLower.includes('pressure') || textLower.includes('138') || textLower.includes('120')) {
      const analogy = buddy.sno10Analogies['I10'];
      snoBadge = 'SNO-10: I10 / SNOMED 38341003 (Hypertension)';
      replyContent = analogy
        ? `You know how we treat ${analogy.metaphorName}? ${analogy.craftExplanation} ${analogy.systemAnalogy} Let's keep your fluid intake clean and take things one step at a time, partner.`
        : `Pressure spikes happen when the system works too hard. Let's take a deep breath and check our maintenance checklist.`;
    } else if (textLower.includes('knee') || textLower.includes('joint') || textLower.includes('arthritis') || textLower.includes('stiff') || textLower.includes('back')) {
      const analogy = buddy.sno10Analogies['M17.9'] || buddy.sno10Analogies['G89.29'];
      snoBadge = 'SNO-10: M17.9 (Osteoarthritis) / G89.29 (Pain)';
      replyContent = analogy
        ? `I hear you on that joint stiffness. ${analogy.craftExplanation} ${analogy.systemAnalogy} Don't force the movement today—use our ergonomic aids!`
        : `When the joints get stiff, it's all about gentle lubrication and not forcing the heavy torque. Make sure you use a good supportive seat today.`;
    } else if (textLower.includes('miss') || textLower.includes('lost') || textLower.includes('remember') || textLower.includes('old times') || textLower.includes('lonely')) {
      replyContent = `I know how much you miss those days in the shop. But every time you pick up a tool, plan a project, or care for yourself, that spirit is right there with you. We built great things together, and we're going to keep your craft alive. What project are we dreaming up next?`;
    } else {
      replyContent = `That's the spirit! In our line of work with ${buddy.domainTitle}, consistency and good habits make all the difference. Keep your working posture relaxed, drink some water, and tell me how the rest of your day is shaping up.`;
    }

    return {
      id: 'bud_' + Date.now(),
      sender: 'buddy',
      senderName: buddy.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: replyContent,
      snoBadge,
      ergonomicTip: ergoTip
    };
  }

  // Pre-curated directory of real-world social prescribing and craft gathering models
  private communityEvents = signal<ILocalCraftEvent[]>([
    {
      id: 'evt_01',
      domainCategory: 'auto',
      title: 'Saturday Morning Vintage Cars & Coffee',
      organizer: 'Classic Auto Restorers & Veterans Garage Alliance',
      location: 'Local Community Square / Diner Parking Lot',
      scheduleDescription: 'Every Saturday, 8:00 AM – 11:00 AM',
      communityType: 'Cars & Coffee',
      accessibilityRating: 'ADA Accessible / Low-Mobility Friendly',
      contactOrLink: 'https://pocketgull.app/community/cars-and-coffee',
      buddyEncouragement: 'Grab a thermos of black coffee and walk the rows of small-blocks. The guys would love to talk carburetors with you!',
      icon: '🏎️'
    },
    {
      id: 'evt_02',
      domainCategory: 'woodworking',
      title: 'Community Men’s Shed & Woodworking Open Bench',
      organizer: 'US & Global Men’s Sheds Association',
      location: 'Regional Makerspace & Craft Tool Library',
      scheduleDescription: 'Tuesdays & Thursdays, 10:00 AM – 2:00 PM',
      communityType: "Men's Sheds",
      accessibilityRating: 'Seated Workshop',
      contactOrLink: 'https://pocketgull.app/community/mens-sheds',
      buddyEncouragement: 'They’ve got hydraulic lift benches and sharp chisels. A great crew to share woodworking jigs and laughter with.',
      icon: '🪵'
    },
    {
      id: 'evt_03',
      domainCategory: 'gardening',
      title: 'Heirloom Seed Swap & Raised-Bed Volunteer Morning',
      organizer: 'Master Gardeners County Extension & Botanical Garden',
      location: 'Community Botanical Conservatory & Heritage Grove',
      scheduleDescription: '1st & 3rd Saturday of the month, 9:00 AM – 12:00 PM',
      communityType: 'Community Garden',
      accessibilityRating: 'Light Walking',
      contactOrLink: 'https://pocketgull.app/community/master-gardeners',
      buddyEncouragement: 'The heirloom tomatoes need trellising. Perfect chance to get some morning sunlight and talk soil ecology.',
      icon: '🌱'
    },
    {
      id: 'evt_04',
      domainCategory: 'music',
      title: 'Acoustic Chamber Reading & Senior Orchestra Rehearsal',
      organizer: 'Civic Symphonic Society & Community Arts Guild',
      location: 'Municipal Auditorium / Music Academy Hall',
      scheduleDescription: 'Wednesday evenings, 6:30 PM – 8:30 PM',
      communityType: 'Jam Session',
      accessibilityRating: 'Seated Workshop',
      contactOrLink: 'https://pocketgull.app/community/orchestra',
      buddyEncouragement: 'No auditions pressure—just wonderful sight-reading and warm camaraderie. Bring your instrument and let the music lift your spirits.',
      icon: '🎻'
    },
    {
      id: 'evt_05',
      domainCategory: 'sailing',
      title: 'Wooden Boat Restoration & Dockside Coffee Meetup',
      organizer: 'Maritime Heritage Society & Community Boating Co-op',
      location: 'Harbor Marina Pier & Boatbuilding Shed',
      scheduleDescription: 'Sunday mornings, 9:00 AM – 12:00 PM',
      communityType: 'Volunteer Circle',
      accessibilityRating: 'Light Walking',
      contactOrLink: 'https://pocketgull.app/community/wooden-boats',
      buddyEncouragement: 'Smell the sea air and fresh pine tar! Come help the crew sand down the old schooner hull.',
      icon: '⛵'
    }
  ]);

  readonly allCommunityEvents = computed(() => this.communityEvents());

  /**
   * Discovers local craft events filtered by domain category or location query.
   */
  public discoverLocalEvents(category?: string, query?: string): ILocalCraftEvent[] {
    let list = this.communityEvents();
    if (category && category !== 'all') {
      list = list.filter(e => e.domainCategory === category || e.domainCategory === 'general');
    }
    if (query && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.communityType.toLowerCase().includes(q)
      );
    }
    return list;
  }
}
