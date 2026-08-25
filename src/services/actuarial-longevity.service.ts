import { Injectable } from '@angular/core';

export interface IOccupationalHazardProfile {
  socCode: string;
  snomedCode: string;
  snomedDisplay: string;
  professionTitle: string;
  category: 
    | 'Construction & Trades' 
    | 'Transportation & Logistics' 
    | 'Healthcare & First Responders' 
    | 'Agriculture & Natural Resources' 
    | 'Corporate & Technology'
    | 'Life Sciences & Research'
    | 'Arts, Media & Entertainment'
    | 'Public Service, Legal & Governance'
    | 'Education & Clergy'
    | 'Hospitality, Childcare & Service'
    | 'Sovereignty & Traditional Guardianship'
    | 'Life Stage & Career Transition'
    | 'Athletics & Professional Sports'
    | 'Architecture & Engineering';
  oshaRiskLevel: 'High' | 'Moderate' | 'Elevated' | 'Standard';
  ergonomicStrainScore: number; // 0-10
  circadianDisruptionScore: number; // 0-10
  chemicalExposureScore: number; // 0-10
  allostaticBurnoutScore: number; // 0-10
  actuarialQalyImpact: number; // e.g. -3.5 years
  oshaMitigationDirectives: string[];
  therapeuticHobbies: string[];
  precisionOccupationalNutrition: string[];
  tcmOccupationalDirectives: string[];
  ayurvedicOccupationalDirectives: string[];
  arboristEcologicalDirectives: string[];
  vocalResonanceProtocol?: string;
}

export interface IGompertzMakehamParams {
  alpha: number; // Initial intrinsic vulnerability / base hazard rate
  beta: number;  // Aging acceleration factor per year
  lambda: number; // Extrinsic background mortality hazard rate
}

export interface ILongevityRiskPoint {
  age: number;
  baselineSurvival: number; // 0.0 - 1.0 (0% - 100%)
  personalizedSurvival: number; // 0.0 - 1.0 (0% - 100%)
  hazardRate: number; // Events per 1000 person-years
}

export interface IActuarialProfile {
  chronologicalAge: number;
  biologicalAge: number;
  biologicalAgeDelta: number; // e.g. -4.5 years
  projectedQalyGain: number;   // e.g. +7.2 QALYs
  baselineLifeExpectancy: number; // e.g. 77.5
  projectedLifespan: number; // e.g. 84.7
  survivalProbability5Year?: number; // 0.0 - 1.0
  gompertzParams?: IGompertzMakehamParams;
  occupationalProfile?: IOccupationalHazardProfile;
  hazardReductions: {
    cardiovascular: number; // e.g. 0.62 (38% risk reduction)
    metabolic: number;      // e.g. 0.55 (45% risk reduction)
    neurodegenerative: number; // e.g. 0.68
    oncological: number;    // e.g. 0.74
  };
}

@Injectable({
  providedIn: 'root'
})
export class ActuarialLongevityService {

  /**
   * BLS Standard Occupational Classification (SOC) and OSHA Workplace Hazard Matrix database.
   */
  private readonly occupationalDatabase: Record<string, IOccupationalHazardProfile> = {
    '47-2061': {
      socCode: '47-2061',
      snomedCode: '702859005',
      snomedDisplay: 'Occupational exposure to silica dust (finding)',
      professionTitle: 'Construction & Heavy Trades',
      category: 'Construction & Trades',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.8,
      circadianDisruptionScore: 4.2,
      chemicalExposureScore: 7.5,
      allostaticBurnoutScore: 6.0,
      actuarialQalyImpact: -3.2,
      oshaMitigationDirectives: [
        'OSHA 1926.1153 Silica Dust: Mandate N95/PAPR respiratory filtration',
        'HAVS Vibration Shielding: Anti-vibration dampened gloves & tool mounts',
        'L4/L5 Spinal Decompression: Ergonomic lifting belts & 45-min rotational breaks'
      ],
      therapeuticHobbies: [
        '🏊 Hydrotherapy & Swimming: Zero-gravity intervertebral disc decompression',
        '🧘 Tai Chi & Qi Gong: Postural realignment & synovial joint lubrication',
        '🎨 Clay Sculpting / Fine Motor Arts: Hand-arm vibration recovery'
      ],
      precisionOccupationalNutrition: [
        '🦴 Hydrolyzed Collagen Type I/III (10g) + Vit C (500mg): Tendon & fascia remodeling',
        '🫁 N-Acetyl Cysteine (NAC 1200mg): Pulmonary silica clearance & glutathione synthesis',
        '⚡ Magnesium Glycinate (400mg): Neuromuscular anti-spasmodic muscle recovery'
      ],
      tcmOccupationalDirectives: [
        '☯️ Bi Syndrome Damp-Heat Clearance: Moxibustion on ST-36 Zusanli & Du Mai warmers',
        '🌱 Kidney Jing Preservation: Astragalus (Huang Qi) & Bone Broth for tendon strength'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Joint Vata Pacification: Daily warm Abhyanga sesame oil massage',
        '🌿 Boswellia (Shallaki) & Guggulu: Anti-inflammatory synovial fluid protection'
      ],
      arboristEcologicalDirectives: [
        '🌳 Cambium De-compaction: Deep root mulching & medicinal Reishi mushroom tea'
      ]
    },
    '53-3032': {
      socCode: '53-3032',
      snomedCode: '713399009',
      snomedDisplay: 'Whole body vibration syndrome due to occupational exposure (disorder)',
      professionTitle: 'Heavy Trucking & Long-Haul Logistics',
      category: 'Transportation & Logistics',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 9.2,
      chemicalExposureScore: 5.0,
      allostaticBurnoutScore: 7.8,
      actuarialQalyImpact: -4.1,
      oshaMitigationDirectives: [
        'OSHA Hours of Service & Sleep Apnea Screening (STOP-Bang evaluation)',
        'Circadian Reset Protocol: 10,000 lux photic therapy at shift initiation',
        'Whole-Body Vibration (WBV) Mitigation: Air-ride suspension seating & hourly walks'
      ],
      therapeuticHobbies: [
        '🌱 Urban Gardening & Horticulture: Grounding, natural daylight, & light aerobic movement',
        '🚴 Recumbent Cycling / Rowing: Pelvic ischemia reversal & lower-limb venous return',
        '🔭 Night Sky Astronomy: Circadian phase-shift alignment & mindfulness'
      ],
      precisionOccupationalNutrition: [
        '🍒 Tart Cherry Juice (Montmorency): Endogenous melatonin & joint anti-inflammatory',
        '🫀 High-Concentration EPA/DHA Omega-3 (2000mg): Endothelial nitric oxide & blood flow',
        '⚡ L-Carnitine Tartrate (2000mg) + CoQ10 (200mg): Sitting metabolic mitochondrial support'
      ],
      tcmOccupationalDirectives: [
        '☯️ Four Gates Regulation (LV-3 + LI-4): Disperse Liver Qi stagnation from long driving hours',
        '🍵 Xiao Yao San Herbal Formula: Smooth Qi flow & relieve pelvic blood stasis'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Agni Ignition: Trikatu (Ginger, Black Pepper, Long Pepper) before meals for sitting Mandagni',
        '🌿 Ashwagandha Taila: Foot & lower back oil application for Vata vibration control'
      ],
      arboristEcologicalDirectives: [
        '🌳 Root Sap Velocity Restoration: Mycorrhizal fungal inoculants & outdoor soil grounding'
      ]
    },
    '29-1141': {
      socCode: '29-1141',
      snomedCode: '423409001',
      snomedDisplay: 'Shift work sleep disorder (disorder)',
      professionTitle: 'Healthcare ER & Bedside Registered Nurse',
      category: 'Healthcare & First Responders',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.8,
      circadianDisruptionScore: 9.5,
      chemicalExposureScore: 6.2,
      allostaticBurnoutScore: 9.0,
      actuarialQalyImpact: -2.8,
      oshaMitigationDirectives: [
        'OSHA Safe Patient Handling & Mobility: Zero manual lifting per 29 CFR 1910.1030',
        'Shift-Work Sleep Disorder (SWSD) Protocol: Blue-blockers 2 hrs prior to sleep',
        'HPA-Axis Autonomic Recovery: 6 breaths/min vagal HRV biofeedback during handoffs'
      ],
      therapeuticHobbies: [
        '🌲 Forest Bathing (Shinrin-Yoku): Cortisol reduction & Natural Killer (NK) cell activation',
        '🏺 Pottery & Ceramic Arts: Sensory tactile grounding & parasympathetic shift',
        '🎵 Acoustic Instrument Playing: Rhythm-driven vagal nerve stimulation'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): HPA-axis burnout regulation',
        '☀️ Vitamin D3 (5000 IU) + K2 MK-7 (100mcg): Shift-worker immune & bone defense',
        '🧠 Phosphatidylserine (300mg): Night-shift nocturnal cortisol suppression'
      ],
      tcmOccupationalDirectives: [
        '☯️ Heart-Kidney Harmony: Acupressure on KI-3 Taixi & HT-7 Shenmen for night shifts',
        '🍵 Suan Zao Ren Tang Decoction: Nourish Heart Yin & settle disturbed Shen'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Sadhaka Pitta Cooling: Brahmi ghee & Nasya oil drops before day-sleeping',
        '🌿 Shirodhara Forehead Warm Oil Therapy: Deactivate sympathetic hyper-arousal'
      ],
      arboristEcologicalDirectives: [
        '🌳 Canopy Shade Protection: Phytoncide inhalation & pine forest terpene exposure'
      ],
      vocalResonanceProtocol: '🎵 Choral Glee Vagal Entrainment: 432 Hz polyvagal harmonic singing to elevate sIgA (+150%) & flush shift cortisol'
    },
    '29-1141-T': {
      socCode: '29-1141-T',
      snomedCode: '423409001',
      snomedDisplay: 'Shift work sleep disorder with relocation stress (disorder)',
      professionTitle: 'Travel Registered Nurses',
      category: 'Healthcare & First Responders',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.0,
      circadianDisruptionScore: 9.8,
      chemicalExposureScore: 5.8,
      allostaticBurnoutScore: 9.5,
      actuarialQalyImpact: -3.4,
      oshaMitigationDirectives: [
        'OSHA Rapid Facility Orientation Safety: Emergency exit & needle-stick protocol check on day 1',
        'Travel Circadian Re-alignment: 10,000 lux phototherapy light box during timezone transition',
        'Blackout Sleep Sanitation: Portable magnetic blackout shades & white noise sleep kit'
      ],
      therapeuticHobbies: [
        '🥾 Local Nature Exploration & Trail Walking: Grounding in new regional natural environments',
        '🧘 Restorative Yin Yoga & Stretching: Relieve long-shift fascia tension in temporary housing',
        '📓 Creative Journaling & Reflection: Dislocation anxiety processing & emotional grounding'
      ],
      precisionOccupationalNutrition: [
        '🍒 Montmorency Tart Cherry Concentrate (30ml): Shift & travel jet-lag sleep onset',
        '🌿 Adaptogenic Tri-Complex (Ashwagandha, Rhodiola, Tulsi): Multi-facility stress resilience',
        '💧 High-Potency Electrolyte & Hydration Packets: Combat dry airport & hospital air'
      ],
      tcmOccupationalDirectives: [
        '☯️ Regulate Qi & Nourish Blood: Acupressure on ST-36 Zusanli & SP-6 Sanyinjiao across climates',
        '🍵 Ba Zhen Tang Herbal Tea: Tonify Qi & Blood after intense 13-week contract rotations'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Travel Vata Pacification: Daily self-Abhyanga warm sesame oil massage in hotel/housing',
        '🌿 Golden Turmeric Milk with Nutmeg: Pacify Vata & promote restorative sleep in new places'
      ],
      arboristEcologicalDirectives: [
        '🌳 Bioregional Grounding: Immediate contact & walking among native regional trees'
      ]
    },
    '29-1215': {
      socCode: '29-1215',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related burnout disorder (disorder)',
      professionTitle: 'Doctors, Physicians & Surgeons',
      category: 'Healthcare & First Responders',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 4.5,
      allostaticBurnoutScore: 9.4,
      actuarialQalyImpact: -2.9,
      oshaMitigationDirectives: [
        'OSHA Surgical Ergonomics: Calibrated surgical loupe posture angle (15-20° neck angle)',
        'EHR Dictation Micro-Pause: Voice-to-text dictation to eliminate documentation wrist strain',
        '36-Hour Call Recovery Protocol: Mandatory 24-hr off-duty sleep window post surgical call'
      ],
      therapeuticHobbies: [
        '⛵ Ocean Sailing & Marine Navigation: Pure mental focus away from clinical pagers',
        '🎹 Classical Piano / Violin: Fine surgical motor dexterity & harmonic relaxation',
        '⛳ Golf & Walking Green Courses: Open outdoor daylight & low-impact aerobic walking'
      ],
      precisionOccupationalNutrition: [
        '🧠 Phosphatidylserine (300mg) + L-Theanine (200mg): Steady hand precision & surgical calm',
        '🫀 CoQ10 (200mg) + High-DHA Omega-3 (2000mg): Cardiovascular protection during high-stress cases',
        '☀️ Vitamin D3 (5000 IU) + K2: Hospital indoor fluorescent light compensation'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Liver Blood & Settle Liver Yang: Acupressure on LR-3 Taichong & GB-20 Fengchi',
        '🍵 Tian Ma Gou Teng Yin Tea: Settle internal liver wind & relieve high surgical tension'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Brahmi & Shankhpushpi Rasayana: Maintain supreme cognitive clarity & diagnostic precision',
        '🌿 Nasya Herbal Oil & Foot Abhyanga: Release cranial pressure & soothe high-responsibility stress'
      ],
      arboristEcologicalDirectives: [
        '🌳 Old-Growth Redwood Canopy Immersion: High-altitude forest perspective & tranquility'
      ]
    },
    '45-2092': {
      socCode: '45-2092',
      snomedCode: '412089004',
      snomedDisplay: 'Occupational exposure to organophosphate pesticide (finding)',
      professionTitle: 'Commercial Agriculture & Farming',
      category: 'Agriculture & Natural Resources',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.2,
      circadianDisruptionScore: 5.5,
      chemicalExposureScore: 8.8,
      allostaticBurnoutScore: 5.0,
      actuarialQalyImpact: -3.5,
      oshaMitigationDirectives: [
        'OSHA 1928 Agricultural Standards: Cholinesterase monitoring for pesticide handlers',
        'UV Oncological Protection: Broad-brim headgear & UPF 50+ UV shielding',
        'Acoustic Hearing Protection: Double-attenuation ear defenders near machinery'
      ],
      therapeuticHobbies: [
        '🐝 Apiculture & Beekeeping: Focused mindful observation & low-impact movement',
        '♟️ Chess & Strategic Games: Non-physical cognitive restoration',
        '🎸 Acoustic Fingerpicking Guitar: Hand dexterity & neurological relaxation'
      ],
      precisionOccupationalNutrition: [
        '🥦 Sulforaphane / Broccoli Sprout Extract (30mg): Phase II hepatic pesticide detox',
        '🛡️ Astaxanthin (12mg) + Lycopene (15mg): Internal systemic UV photoprotection',
        '🌿 Milk Thistle Extract / Silymarin (80% 420mg): Hepatoprotective clearance'
      ],
      tcmOccupationalDirectives: [
        '☯️ Expel Wind-Cold-Damp: Moxibustion on BL-23 Shenshu for lumbar farm strain',
        '🍵 Ginger & Cinnamon Bark Tea: Warm meridians & clear joint humidity'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Pitta Sun-Heat Balance: Amalaki (Amla) & Shatavari cooling tonics',
        '🌿 Coconut Water & Cumin Infusion: Hydrate plasma (Rasa Dhatu) & reduce internal fire'
      ],
      arboristEcologicalDirectives: [
        '🌳 Soil Biochar & Organic Humus: Regenerative soil microbial interaction'
      ]
    },
    '15-1252': {
      socCode: '15-1252',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome (disorder)',
      professionTitle: 'Software Developer & Tech Executive',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 6.5,
      circadianDisruptionScore: 6.0,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 8.2,
      actuarialQalyImpact: -1.8,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Computer Workstation (20-20-20 visual rest rule for asthenopia)',
        'Sedentary Ischemia Prevention: Sit-stand desk transition every 45 mins',
        'Digital Blue-Light Hygiene: 432 Hz Solfeggio decompression post-screen time'
      ],
      therapeuticHobbies: [
        '🧗 Bouldering & Rock Climbing: 3D spatial problem solving & full-body posture reversal',
        '🏃 Trail Running: Outdoor natural light, visual divergence, & cardiac output',
        '🍳 Culinary Arts & Fermentation: Tactile sensory creativity away from screens'
      ],
      precisionOccupationalNutrition: [
        '👁️ Lutein (20mg) + Zeaxanthin (4mg): Macular blue-light filtration & eye fatigue',
        '🧠 L-Theanine (200mg) + Magnesium L-Threonate (144mg): Alpha brainwave calm',
        '🌿 Bacopa Monnieri (300mg 50% Bacosides): Cholinergic memory & mental clarity'
      ],
      tcmOccupationalDirectives: [
        '☯️ Liver Blood & Eye Nourishment: Acupressure on GB-20 Fengchi & BL-2 Zanzhu',
        '🍵 Goji Berry (Gou Qi Zi) + Chrysanthemum (Ju Hua) Tea: Clear screen heat & brighten vision'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Majja Dhatu (Nervous System) Calm: Gotu Kola (Mandukaparni) & Shankhpushpi syrup',
        '🌿 Triphala Ghee Netra Tarpana: Cool optic nerve dryness & pacify eye Pitta'
      ],
      arboristEcologicalDirectives: [
        '🌳 Phototropism Reversal: Visual focus on natural green tree canopy divergence'
      ]
    },
    '19-1029': {
      socCode: '19-1029',
      snomedCode: '410005002',
      snomedDisplay: 'Biological research strain and field investigation fatigue (disorder)',
      professionTitle: 'Naturalist, Geologist & Evolutionary Biologist',
      category: 'Life Sciences & Research',
      oshaRiskLevel: 'Standard',
      ergonomicStrainScore: 4.5,
      circadianDisruptionScore: 3.2,
      chemicalExposureScore: 2.1,
      allostaticBurnoutScore: 5.8,
      actuarialQalyImpact: 1.5,
      oshaMitigationDirectives: [
        'Field Expedition Safety: Tropical vector protection (mosquito netting & insect repellent for Chagas/malaria risk)',
        'Desk & Microscope Ergonomics: Adjustable specimen posture & optical lighting for asthenopia',
        'Post-Voyage Recovery Protocol: Structured physical rest cycles following long sea voyages & intensive writing'
      ],
      therapeuticHobbies: [
        '🪴 Down House Garden Botany & Earthworm Studies: Gentle soil ecology & plant breeding',
        '🚶 Daily Sandwalk Strolls: Rhythmic nature walks for contemplative mental restoration',
        '✍️ Scientific Correspondence & Epistolary Writing: Structured intellectual reflection'
      ],
      precisionOccupationalNutrition: [
        '🫀 CoQ10 (Ubiquinol 200mg): Mitochondrial bioenergetics & bio-energetic stamina',
        '🌿 Ginger & Peppermint Infusion: Soothe gastric hyper-reactivity & post-prandial dysmotility',
        '⚡ Magnesium Glycinate (400mg): Neuromuscular relaxation & stress mitigation'
      ],
      tcmOccupationalDirectives: [
        '☯️ Harmonize Spleen & Stomach Qi: Acupressure on ST-36 Zusanli & CV-12 Zhongwan for digestive agni',
        '🍵 Warm Chamomile & Licorice Root Tea: Calm liver wood overacting on spleen earth'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Pacify Vata & Agni Balance: Warm, spiced kitchari & ghee for intestinal vishamagni',
        '🌿 Ashwagandha & Brahmi Rasayana: Rejuvenate nervous tissue & calm intellectual exertion'
      ],
      arboristEcologicalDirectives: [
        '🌳 Down House Oak & Orchids: Deep connection to botanical evolutionary selection'
      ],
      vocalResonanceProtocol: '🎵 Resonant Pastoral Humming (0.1 Hz): Parasympathetic vagal activation to calm post-expedition stomach motility'
    },
    '27-1024': {
      socCode: '27-1024',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome (disorder)',
      professionTitle: 'Graphic Designers',
      category: 'Arts, Media & Entertainment',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 6.5,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 7.5,
      actuarialQalyImpact: -2.1,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Drawing Tablet Angle (15-20° incline for cervical spine)',
        'Asthenopia Rest Protocol: 20-20-20 eye divergence & glare-free screen Hood',
        'Neutral Wrist Neutral Alignment: Ergonomic stylus grip & wrist rest'
      ],
      therapeuticHobbies: [
        '🏺 Pottery & Clay Sculpting: Physical 3D tactile form creation away from flat screens',
        '🎨 Plein Air Urban Sketching: Natural daylight visual focus & color accuracy',
        '🎸 Classical Acoustic Guitar: Fine motor finger dexterity & melodic relaxation'
      ],
      precisionOccupationalNutrition: [
        '👁️ Bilberry Extract (160mg) + Lutein (20mg): Retinal rhodopsin regeneration',
        '🦴 Hydrolyzed Collagen Peptides (10g): Wrist tendon sheath lubrication',
        '🧠 L-Theanine (200mg): Calm focused alpha-wave brain activity'
      ],
      tcmOccupationalDirectives: [
        '☯️ Liver Blood Nourishment: Acupressure on GB-20 Fengchi & BL-2 Zanzhu for eye strain',
        '🍵 Goji Berry (Gou Qi Zi) + Chrysanthemum Tea: Brighten eyes & nourish Liver Yin'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Netra Tarpana: Eye bathing with Triphala Ghee to cool optic nerve heat',
        '🌿 Sandalwood & Rosewater Spray: Cool facial Pitta after long monitor hours'
      ],
      arboristEcologicalDirectives: [
        '🌳 Canopy Leaf Geometry Divergence: Eye muscle relaxation via natural fractal leaf patterns'
      ]
    },
    '43-9031': {
      socCode: '43-9031',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome (disorder)',
      professionTitle: 'Desktop Publishers',
      category: 'Arts, Media & Entertainment',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 5.5,
      chemicalExposureScore: 1.8,
      allostaticBurnoutScore: 7.0,
      actuarialQalyImpact: -1.9,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Workstation Layout: Dual monitor eye-level center alignment',
        'Cervical Micro-Break Protocol: Hourly chin tucks & scapular retraction stretches',
        'Blue-Light Screen Filter: Calibrated 450nm wavelength suppression'
      ],
      therapeuticHobbies: [
        '🧗 Bouldering & Wall Climbing: Full spinal extension & postural reversal',
        '🪵 Traditional Woodworking: Tactile physical craftsmanship',
        '🌱 Indoor Houseplant Cultivation: Natural humidity & visual softness'
      ],
      precisionOccupationalNutrition: [
        '👁️ Astaxanthin (12mg): Ciliary muscle fatigue reduction & ocular focus speed',
        '⚡ Magnesium Glycinate (400mg): Cervical & upper trapezius spasm prevention',
        '☀️ Vitamin D3 (4000 IU): Indoor worker immune support'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Kidney & Liver Yin: Acupressure on KI-3 Taixi & SP-6 Sanyinjiao',
        '🍵 Pearl Powder & Mulberry Leaf Tea: Clear internal heat & nourish essence'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Brahmi & Shankhpushpi Syrup: Neural clarity & mental endurance',
        '🌿 Anutaila Nasal Drops: Lubricate cranial passages & clear mental heaviness'
      ],
      arboristEcologicalDirectives: [
        '🌳 Forest Understory Shade Exposure: Soft ambient green light absorption'
      ]
    },
    '27-1011': {
      socCode: '27-1011',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related stress disorder (disorder)',
      professionTitle: 'Art Directors',
      category: 'Arts, Media & Entertainment',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 6.0,
      circadianDisruptionScore: 7.8,
      chemicalExposureScore: 2.5,
      allostaticBurnoutScore: 8.8,
      actuarialQalyImpact: -2.5,
      oshaMitigationDirectives: [
        'OSHA Deadline Stress Mitigation: Mandatory post-campaign 48-hr recovery window',
        'Circadian Photic Hygiene: Bright morning sunlight & 100% blue-blockers post 8 PM',
        'Vagal HRV Resonant Breathing: 6 breaths/min biofeedback before executive reviews'
      ],
      therapeuticHobbies: [
        '🖼️ Plein Air Landscape Oil Painting: Unstructured creative expression',
        '🏹 Archery & Target Focus: Steady breath control & posture centering',
        '🌲 Forest Bathing (Shinrin-Yoku): Cortisol reduction & sensory immersion'
      ],
      precisionOccupationalNutrition: [
        '🌿 Rhodiola Rosea (300mg) + Ashwagandha (600mg): HPA-axis cortisol modulation',
        '🧠 Phosphatidylserine (300mg): High-stress campaign adrenal regulation',
        '🫀 High-Dose EPA/DHA Omega-3 (2000mg): Neuro-inflammatory protection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Disperse Liver Qi Stagnation: Acupressure on LV-3 Taichong & GB-34 Yanglingquan',
        '🍵 Xiao Yao San Tea: Smooth Qi movement & relieve chest constraint'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Shirodhara Oil Therapy: Warm herbal oil stream over forehead for mental calm',
        '🌿 Jatamansi (Spikenard) Tonic: Pacify Sadhaka Pitta & emotional heat'
      ],
      arboristEcologicalDirectives: [
        '🌳 Old-Growth Redwood Canopy Exposure: Phytoncide terpene immunity'
      ]
    },
    '13-1121': {
      socCode: '13-1121',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related stress disorder (disorder)',
      professionTitle: 'Event Planners',
      category: 'Public Service, Legal & Governance',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.8,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 9.2,
      actuarialQalyImpact: -3.0,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Footwear & Orthotics: Cushioned arch support for 15,000+ daily steps',
        'Event Wind-Down Protocol: Photic dark-room decompression post-event execution',
        'Acoustic Decibel Monitoring: Earplug protection at venue soundchecks'
      ],
      therapeuticHobbies: [
        '🥣 Sound Bath & Himalayan Singing Bowl Meditation: Parasympathetic resonance reset',
        '🌊 Sensory Deprivation Float Tank: Zero-gravity sensory decompression',
        '🧘 Restorative Yin Yoga: Deep fascial release after prolonged standing'
      ],
      precisionOccupationalNutrition: [
        '🧠 Magnesium L-Threonate (144mg): Fast-acting neural calm & sleep onset',
        '🌿 Holy Basil / Tulsi Extract (500mg): Cortisol dampening after event stress',
        '💧 Deep Sea Electrolyte Complex: Cellular rehydration during long movement hours'
      ],
      tcmOccupationalDirectives: [
        '☯️ Calming Heart Shen: Acupressure on HT-7 Shenmen & PC-6 Neiguan',
        '🍵 Suan Zao Ren Tang Decoction: Nourish Heart Yin & settle nighttime racing thoughts'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Foot Abhyanga Massage: Warm Ksheerabala oil application on soles for Vata grounding',
        '🌿 Chamomile & Licorice Infusion: Cool digestive Pitta & calm nervous system'
      ],
      arboristEcologicalDirectives: [
        '🌳 Meadow Grass Grounding: Barefoot earthing post-formal footwear wear'
      ]
    },
    '35-1011': {
      socCode: '35-1011',
      snomedCode: '702859005',
      snomedDisplay: 'Occupational exposure to grease and heat fumes (finding)',
      professionTitle: 'Chefs and Head Cooks',
      category: 'Hospitality, Childcare & Service',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.5,
      circadianDisruptionScore: 8.8,
      chemicalExposureScore: 6.8,
      allostaticBurnoutScore: 8.5,
      actuarialQalyImpact: -3.6,
      oshaMitigationDirectives: [
        'OSHA 1910.106 Commercial Hood Ventilation: Grease & particulate fume extraction',
        'Anti-Fatigue Floor Matting: Shock-absorbing kitchen matting for standing joints',
        'Compression Hosiery: Class 1 medical compression socks for venous insufficiency'
      ],
      therapeuticHobbies: [
        '🚣 Kayaking & Stand-Up Paddleboarding: Cooling water environment & upper body balance',
        '🎸 Acoustic Fingerpicking Guitar: Hand dexterity & non-culinary creative flow',
        '🐝 Apiculture & Beekeeping: Outdoor peaceful nature interaction'
      ],
      precisionOccupationalNutrition: [
        '🥦 Sulforaphane (30mg) + Curcumin (500mg): Phase II hepatic grease smoke detox',
        '💧 Electrolyte Potassium Citrate: Rehydrate after high-heat kitchen sweat loss',
        '🌿 Milk Thistle Extract / Silymarin (420mg): Hepatoprotective clearance'
      ],
      tcmOccupationalDirectives: [
        '☯️ Clear Stomach Fire & Damp-Heat: Acupressure on ST-44 Neiguan & SP-9 Yinlingquan',
        '🍵 Mung Bean & Green Tea Decoction: Cool internal kitchen heat & purge toxins'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Pitta Sun & Fire Cooling: Coconut water with Coriander seed powder',
        '🌿 Sandalwood (Chandana) Body Mist: Cool skin temperature post-kitchen shift'
      ],
      arboristEcologicalDirectives: [
        '🌳 Wetland Marsh Bio-filtration: Cool moist atmospheric air inhalation'
      ]
    },
    '43-4051': {
      socCode: '43-4051',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related emotional exhaustion (disorder)',
      professionTitle: 'Customer Service Agents',
      category: 'Public Service, Legal & Governance',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 6.8,
      circadianDisruptionScore: 6.2,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 8.6,
      actuarialQalyImpact: -2.2,
      oshaMitigationDirectives: [
        'OSHA Acoustic Decibel Limiter (85 dBA headset ceiling per 29 CFR 1910.95)',
        'Vocal Cord Hydration Protocol: 250ml water per 60 mins of continuous call time',
        'De-escalation Micro-Pause: 3-min silent breathing break post angry customer call'
      ],
      therapeuticHobbies: [
        '🥾 Outdoor Trail Hiking: Open silent space & natural light exposure',
        '🎙️ Choir & Vocal Singing: Vocal resonance rehabilitation & positive emotional expression',
        '🏺 Hand-Built Pottery: Quiet tactile creation'
      ],
      precisionOccupationalNutrition: [
        '🌱 Slippery Elm (400mg) + Marshmallow Root (300mg): Vocal cord mucosal hydration',
        '🧠 L-Theanine (200mg) + Lemon Balm (300mg): Emotional patience & nervous system calm',
        '⚡ Vitamin B-Complex (Active Methylated): Adrenal fatigue support'
      ],
      tcmOccupationalDirectives: [
        '☯️ Moistening Lung Yin & Throat: Acupressure on LU-9 Taiyuan & KI-6 Zhaohei',
        '🍵 Nin Jiom Pei Pa Koa (Loquat Syrup) Tea: Soothe voice & moisten lungs'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Yashtimadhu (Licorice Root) Chewing: Vocal cord lubrication & throat cooling',
        '🌿 Anutaila Nasal Drops: Keep sinus passages hydrated under air-conditioned office air'
      ],
      arboristEcologicalDirectives: [
        '🌳 Deciduous Forest Oxygenation: Oxygen-rich moist forest air walking'
      ]
    },
    '15-1221': {
      socCode: '15-1221',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome (disorder)',
      professionTitle: 'Computer Scientists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 6.2,
      circadianDisruptionScore: 6.8,
      chemicalExposureScore: 1.2,
      allostaticBurnoutScore: 7.9,
      actuarialQalyImpact: -1.7,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Monitor Alignment: Dual 4K screen top 1/3 at eye level',
        'Hyper-Focus Break Timer: Pomodoro 50/10 visual divergence break',
        'Blue-Light Spectrum Attenuation: 450nm display calibration'
      ],
      therapeuticHobbies: [
        '♟️ Physical Chess & Go: Tangible non-digital strategic problem solving',
        '🧗 Bouldering & Climbing: 3D spatial problem solving & full-body motor engagement',
        '🎸 Acoustic Fingerpicking Guitar: Neurological rhythm & tactile expression'
      ],
      precisionOccupationalNutrition: [
        '🧠 Alpha-GPC (300mg) + Bacopa Monnieri (300mg): Acetylcholine & memory synthesis',
        '🌿 L-Theanine (200mg): Alpha brainwave promotion for complex coding',
        '🫀 High-DHA Omega-3 (1000mg): Neuronal membrane fluidity'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Kidney Essence & Marrow: Acupressure on KI-1 Yongquan & DU-20 Baihui',
        '🍵 Walnut & Black Sesame Seed Decoction: Brain marrow nutrition & essence preservation'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Medhya Rasayana (Brahmi + Jyotishmati): Memory enhancer & mental endurance',
        '🌿 Warm Sesame Oil Head Massage: Calm hyper-active Vata in head & mind'
      ],
      arboristEcologicalDirectives: [
        '🌳 Pine Resin Terpene Inhalation: Neural dendritic arborization stimulation'
      ]
    },
    '15-1251': {
      socCode: '15-1251',
      snomedCode: '412089004',
      snomedDisplay: 'Repetitive motion disorder (disorder)',
      professionTitle: 'Computer Programmers',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 7.8,
      circadianDisruptionScore: 7.0,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 8.0,
      actuarialQalyImpact: -1.9,
      oshaMitigationDirectives: [
        'OSHA Split Ergonomic Keyboard (15° tenting angle to eliminate forearm pronation)',
        'Vertical Ergonomic Mouse: Neutral handshake wrist positioning',
        'Sit-Stand Transition Schedule: Standing 15 mins every 45 mins'
      ],
      therapeuticHobbies: [
        '🥋 Martial Arts & Brazilian Jiu-Jitsu: Full-body tactile awareness & posture reversal',
        '📷 Outdoor Nature Photography: Visual divergence & walking movement',
        '🏃 Trail Running: High cardiac output & outdoor oxygenation'
      ],
      precisionOccupationalNutrition: [
        '🦴 Magnesium L-Threonate (144mg) + Vit B6 (50mg): Wrist nerve conduction',
        '🌿 Turmeric Curcumin (1000mg 95% Curcuminoids): Forearm flexor anti-inflammatory',
        '🦴 Hydrolyzed Collagen Type I/III (10g): Tendon sheath repair'
      ],
      tcmOccupationalDirectives: [
        '☯️ Unblock Channel Stagnation in Arms: Acupressure on LI-11 Quchi & SJ-5 Waiguan',
        '🍵 Gui Zhi (Cinnamon Twig) Tea: Warm & unblock arm channels'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Mahanarayana Oil Wrist Massage: Pacify local Vata & tendon friction',
        '🌿 Shallaki (Boswellia Serrata): Joint & wrist tendon comfort'
      ],
      arboristEcologicalDirectives: [
        '🌳 Forest Floor Biomass Walking: Proprioceptive foot-to-brain grounding'
      ]
    },
    '25-4022': {
      socCode: '25-4022',
      snomedCode: '702859005',
      snomedDisplay: 'Occupational exposure to paper mold and dust (finding)',
      professionTitle: 'Librarians',
      category: 'Education & Clergy',
      oshaRiskLevel: 'Standard',
      ergonomicStrainScore: 5.5,
      circadianDisruptionScore: 3.5,
      chemicalExposureScore: 4.5,
      allostaticBurnoutScore: 4.0,
      actuarialQalyImpact: -0.8,
      oshaMitigationDirectives: [
        'OSHA Archive Air Quality Standards: HEPA air filtration in book stacks',
        'Ergonomic Book Loading: Trolley height loading to prevent lumbar flexion',
        'Step-Stool Ladder Safety: Three-point contact for high-shelf retrieves'
      ],
      therapeuticHobbies: [
        '🦅 Bird Watching & Field Ornithology: Outdoor visual distance tracking',
        '🌱 Gardening & Botanical Cultivation: Fresh outdoor air & soil contact',
        '🎹 Classical Piano: Multi-hand dexterity & rhythmic engagement'
      ],
      precisionOccupationalNutrition: [
        '🛡️ Quercetin Phytosome (500mg) + Vit C (500mg): Paper dust allergy & histamine defense',
        '🦠 Spore-Based Probiotics: Gut-lung axis respiratory immunity',
        '☀️ Vitamin D3 (4000 IU): Indoor archive lighting compensation'
      ],
      tcmOccupationalDirectives: [
        '☯️ Reinforce Wei Qi Protective Shield: Acupressure on LU-7 Lieque & ST-36 Zusanli',
        '🍵 Yu Ping Feng San (Jade Screen Powder) Tea: Fortify lung defense against dust'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Tulsi (Holy Basil) & Turmeric Decoction: Clear upper respiratory passages',
        '🌿 Neti Pot Saline Nasal Irrigation: Flush daily paper dust from nasal mucosa'
      ],
      arboristEcologicalDirectives: [
        '🌳 Conifer Needle Terpene Exposure: Natural airway clearing via evergreen trees'
      ]
    },
    '27-4021': {
      socCode: '27-4021',
      snomedCode: '412089004',
      snomedDisplay: 'Occupational cervical spine strain due to equipment load (disorder)',
      professionTitle: 'Photographers',
      category: 'Arts, Media & Entertainment',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 6.0,
      chemicalExposureScore: 3.0,
      allostaticBurnoutScore: 6.0,
      actuarialQalyImpact: -1.6,
      oshaMitigationDirectives: [
        'OSHA Dual-Shoulder Camera Harness (eliminating cervical spine neck strap strain)',
        'Ergonomic Knee Pads: Joint cushioning during low-angle ground shooting',
        'Hydration & Weight Redistribution: Modular belt pouch system for lenses'
      ],
      therapeuticHobbies: [
        '🏊 Swimming & Hydrotherapy: Decompress cervical spine & shoulder girdle',
        '🚴 Outdoor Cycling: Aerobic endurance & leg fluid circulation',
        '🎸 Acoustic Guitar Playing: Relaxed posture & hand coordination'
      ],
      precisionOccupationalNutrition: [
        '🦴 Glucosamine Sulfate (1500mg) + Chondroitin (1200mg): Knee & spine joint cushion',
        '⚡ Vitamin C (1000mg) + Zinc (15mg): Collagen synthesis for heavy gear load',
        '💧 Deep Sea Electrolyte Fluid: Hydration during long outdoor shoots'
      ],
      tcmOccupationalDirectives: [
        '☯️ Relax Sinews & Channels: Acupressure on GB-34 Yanglingquan & SI-11 Tianzong',
        '🍵 Du Huo Ji Sheng Tang Tea: Expel Wind-Damp & strengthen lower back/knees'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Dhanwantharam Thailam Shoulder Massage: Warm herbal oil for heavy camera strain',
        '🌿 Nirgundi Extract: Natural herbal joint comfort'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sunlit Forest Canopy Photography: Luminescent natural light eye restoration'
      ]
    },
    '15-2051': {
      socCode: '15-2051',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome (disorder)',
      professionTitle: 'Data Scientists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 6.8,
      circadianDisruptionScore: 6.5,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 8.2,
      actuarialQalyImpact: -1.8,
      oshaMitigationDirectives: [
        'OSHA Ergonomic Monitor Alignment: Dual 4K display top 1/3 at eye level',
        'Pomodoro 50/10 Visual Divergence: 10-min visual break after complex statistical modeling',
        'Sit-Stand Transition Schedule: Standing 15 mins every 45 mins'
      ],
      therapeuticHobbies: [
        '🧗 Outdoor Rock Climbing / Bouldering: 3D spatial problem solving & full postural reversal',
        '🏃 Trail Running: Outdoor natural light, visual divergence, & aerobic cardiac output',
        '♟️ Physical Chess & Board Games: Tangible non-digital strategic engagement'
      ],
      precisionOccupationalNutrition: [
        '🧠 Alpha-GPC (300mg) + Bacopa Monnieri (300mg): Acetylcholine & memory synthesis',
        '👁️ Lutein (20mg) + Zeaxanthin (4mg): Macular blue-light filtration',
        '🫀 High-DHA Omega-3 (1000mg): Neuronal membrane fluidity & brain focus'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Kidney Essence & Liver Blood: Acupressure on KI-1 Yongquan & GB-20 Fengchi',
        '🍵 Goji Berry (Gou Qi Zi) + Chrysanthemum Tea: Brighten vision & clear screen heat'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Medhya Rasayana (Brahmi + Jyotishmati): Cognitive endurance & mental clarity',
        '🌿 Triphala Ghee Netra Tarpana: Cool optic nerve dryness'
      ],
      arboristEcologicalDirectives: [
        '🌳 Canopy Fractal Geometry Divergence: Eye muscle relaxation via natural leaf patterns'
      ]
    },
    '13-1031': {
      socCode: '13-1031',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related stress disorder (disorder)',
      professionTitle: 'Bankers & Financial Analysts',
      category: 'Public Service, Legal & Governance',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 6.5,
      circadianDisruptionScore: 7.5,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 9.0,
      actuarialQalyImpact: -2.4,
      oshaMitigationDirectives: [
        'OSHA Volatility Stress Mitigation: Mandatory 6bpm vagal HRV breathing before market calls',
        'Ergonomic Lumbar Chair Adjustment: 100-110° recline to reduce disc compression',
        'Photic Night Hygiene: Blue-blocker glasses post 8 PM during earnings season'
      ],
      therapeuticHobbies: [
        '🚴 Road Cycling / Spinning: High-intensity cardiovascular stress clearance',
        '🎾 Squash & Racket Sports: High-speed aerobic reaction & physical focus',
        '🌊 Sensory Deprivation Float Tank: Zero-gravity autonomic sympathetic shutdown'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): Adrenal cortisol modulation',
        '🧠 Magnesium L-Threonate (144mg): Fast neural calm & sleep onset',
        '🫀 Coenzyme Q10 (200mg): Cardiovascular energy support during long hours'
      ],
      tcmOccupationalDirectives: [
        '☯️ Disperse Liver Qi & Calm Shen: Acupressure on LV-3 Taichong & HT-7 Shenmen',
        '🍵 Xiao Yao San Tea: Smooth Qi flow & relieve financial market chest tightness'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Shirodhara Forehead Warm Oil Therapy: Deactivate sympathetic hyper-arousal',
        '🌿 Brahmi Ghee: Nourish Majja Dhatu & calm nervous system'
      ],
      arboristEcologicalDirectives: [
        '🌳 Old-Growth Oak Forest Grounding: Deep root stability & grounding'
      ]
    },
    '25-0000-S': {
      socCode: '25-0000-S',
      snomedCode: '423409001',
      snomedDisplay: 'Academic sleep deprivation disorder (disorder)',
      professionTitle: 'Higher Education Student',
      category: 'Education & Clergy',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 6.2,
      circadianDisruptionScore: 8.8,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 8.5,
      actuarialQalyImpact: -2.0,
      oshaMitigationDirectives: [
        'OSHA Exam Sleep Hygiene: 7-8 hrs restorative sleep ceiling prior to final exams',
        'Ergonomic Backpack Weight Redistribution: Dual shoulder straps with sternum clip',
        'Digital Screen Decompression: 100% blue-light filter after midnight study sessions'
      ],
      therapeuticHobbies: [
        '🏀 Intramural Team Sports / Basketball: Social movement & physical release',
        '🎸 Acoustic / Electric Guitar Playing: Creative non-academic mental expression',
        '🥾 Outdoor Group Hiking & Camping: Complete nature disconnect & daylight reset'
      ],
      precisionOccupationalNutrition: [
        '🧠 L-Theanine (200mg) + Magnesium Glycinate (400mg): Exam anxiety calm & sleep onset',
        '☀️ Vitamin D3 (4000 IU): Dormitory indoor light compensation',
        '⚡ Active B-Complex: Energy & neuro-transmitter synthesis'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Heart Yin & Spleen Qi: Acupressure on SP-6 Sanyinjiao & PC-6 Neiguan',
        '🍵 Suan Zao Ren Tang Night Tea: Settle racing thoughts before exam mornings'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Shankhpushpi Syrup: Neural retention & study memory enhancement',
        '🌿 Anutaila Nasal Drops: Clear nasal passages & mental fatigue'
      ],
      arboristEcologicalDirectives: [
        '🌳 Open Campus Meadow Exposure: Expansive outdoor horizon visual relaxation'
      ]
    },
    '25-1099': {
      socCode: '25-1099',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related emotional exhaustion (disorder)',
      professionTitle: 'Higher Education Professor',
      category: 'Education & Clergy',
      oshaRiskLevel: 'Standard',
      ergonomicStrainScore: 5.8,
      circadianDisruptionScore: 5.0,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 7.2,
      actuarialQalyImpact: -1.2,
      oshaMitigationDirectives: [
        'OSHA Lecture Hall Acoustic Amplification (lapel microphone to prevent vocal strain)',
        'Ergonomic Grading Station: Monitor eye-level setup for long manuscript reviews',
        'Research Interval Protocol: 45-min writing blocks with standing stretches'
      ],
      therapeuticHobbies: [
        '📚 Unstructured Non-Academic Literature Reading: Pure leisure reading',
        '🌿 Botanical Gardening & Plant Breeding: Slow peaceful outdoor nurture',
        '🎨 Watercolor Painting: Soft visual expression away from academic rigor'
      ],
      precisionOccupationalNutrition: [
        '🌱 Slippery Elm (400mg) + Marshmallow Root (300mg): Lecture vocal cord mucosal hydration',
        '🧠 Phosphatidylserine (300mg): Grant submission deadline stress regulation',
        '🛡️ Vitamin C (1000mg) + Zinc (15mg): Classroom immune protection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Moisten Lung Yin & Clear Throat: Acupressure on LU-9 Taiyuan & KI-6 Zhaohei',
        '🍵 Loquat Syrup (Pi Pa Gao) Tea: Soothe lecture voice & moisten lungs'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Yashtimadhu (Licorice) Tea: Vocal cord lubrication & throat cooling',
        '🌿 Dhanwantharam Oil Back Massage: Relieve lecture standing fatigue'
      ],
      arboristEcologicalDirectives: [
        '🌳 Redwood Forest Canopy Walking: Contemplative canopy shade immersion'
      ]
    },
    '53-2011': {
      socCode: '53-2011',
      snomedCode: '423409001',
      snomedDisplay: 'Circadian dysrhythmia due to flight exposure (disorder)',
      professionTitle: 'Commercial & Airline Pilots',
      category: 'Transportation & Logistics',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 9.8,
      chemicalExposureScore: 6.0,
      allostaticBurnoutScore: 8.8,
      actuarialQalyImpact: -3.8,
      oshaMitigationDirectives: [
        'FAA Part 117 Flight & Duty Limitations: Strict mandatory cockpit rest rest-periods',
        'Cosmic Radiation Photic Shielding: Polarized flight deck UV/cosmic radiation visor',
        'Hypoxia & Barotrauma Prevention: Automatic cabin pressure monitoring & oxygen mask check'
      ],
      therapeuticHobbies: [
        '🏊 Deep Water Hydrotherapy & Swimming: Zero-gravity intervertebral decompression post-flight',
        '🌱 Gardening & Earth Soil Grounding: Physical re-connection to ground level biosphere',
        '🎷 Saxophone / Acoustic Wind Instruments: Diaphragmatic respiratory control & vagal stimulation'
      ],
      precisionOccupationalNutrition: [
        '🍒 Montmorency Tart Cherry Concentrate (30ml): Rapid timezone circadian melatonin realignment',
        '🛡️ Astaxanthin (12mg) + Lycopene (15mg): High-altitude cosmic radiation DNA protection',
        '🫀 CoQ10 (200mg) + Alpha-Lipoic Acid (300mg): Mitochondrial high-altitude hypobaric support'
      ],
      tcmOccupationalDirectives: [
        '☯️ Harmonize Spleen Qi & Disperse Liver Qi across Timezones: Acupressure on ST-36 & PC-6',
        '🍵 Chai Hu Shu Gan San Tea: Smooth Qi movement after rapid long-haul flight crossings'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Rapid Air Vata Pacification: Warm Abhyanga sesame oil massage immediately post-landing',
        '🌿 Golden Turmeric Milk with Cardamom & Nutmeg: Deep grounding sleep in hotel overnight stays'
      ],
      arboristEcologicalDirectives: [
        '🌳 Troposphere Canopy Re-connection: Thick pine & fir forest terpene walking post-flight'
      ]
    },
    '19-2011-NASA': {
      socCode: '19-2011-NASA',
      snomedCode: '713399009',
      snomedDisplay: 'Spaceflight-associated neuro-ocular syndrome and osteopenia (disorder)',
      professionTitle: 'Astronauts & Space Explorers',
      category: 'Healthcare & First Responders',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 9.8,
      circadianDisruptionScore: 10.0,
      chemicalExposureScore: 8.5,
      allostaticBurnoutScore: 9.8,
      actuarialQalyImpact: -4.5,
      oshaMitigationDirectives: [
        'NASA Microgravity ARED Exercise Protocol: 2.5 hrs/day heavy resistive load training for bone preservation',
        'Spaceflight-Associated Neuro-Ocular Syndrome (SANS) Protocol: Lower body negative pressure (LBNP) treatment',
        'Galactic Cosmic Ray (GCR) Dosimetry: Real-time habitat radiation shielding & solar particle event shelters'
      ],
      therapeuticHobbies: [
        '👨‍🌾 Hydroponic Space Botanical Gardening: Cultivating living green plant life in space habitats',
        '🎨 Zero-Gravity Watercolor & Digital Art: Expressing microgravity visual perspectives',
        '📻 Earth Radio & Ground Operator Ham Radio: Connecting with ground human community'
      ],
      precisionOccupationalNutrition: [
        '🦴 Collagen Type I (15g) + Vit D3 (10,000 IU) + K2 MK-7 (200mcg): Microgravity bone matrix protection',
        '🛡️ Molecular Hydrogen Water + NAC (1200mg): Galactic Cosmic Ray (GCR) radiation oxidative detox',
        '👁️ Lutein (20mg) + Zeaxanthin (4mg): Optic disc edema & SANS macular preservation'
      ],
      tcmOccupationalDirectives: [
        '☯️ Fortify Kidney Jing & Nourish Bone Marrow in Zero-G: Acupressure on KI-3 Taixi & DU-4 Mingmen',
        '🍵 Du Zhong (Eucommia Bark) + Xu Duan (Dipsacus) Decoction: Preserve tendon & bone essence in microgravity'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Ultimate Vata-Ether Balance: Infinite Ether pacification via daily warm Mahanarayana Taila self-massage',
        '🌿 Ashwagandha Rasayana (1000mg): Prevent neuromuscular atrophy & preserve Ojas in orbit'
      ],
      arboristEcologicalDirectives: [
        '🌳 Terran Earth Biosphere Inhalation: Inhalation of preserved Earth soil terpenes & living plant moss'
      ]
    },
    '33-3051': {
      socCode: '33-3051',
      snomedCode: '417893002',
      snomedDisplay: 'Post-traumatic occupational stress disorder (disorder)',
      professionTitle: 'Public Safety Officers & First Responders',
      category: 'Healthcare & First Responders',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.5,
      circadianDisruptionScore: 9.2,
      chemicalExposureScore: 7.5,
      allostaticBurnoutScore: 9.6,
      actuarialQalyImpact: -4.2,
      oshaMitigationDirectives: [
        'OSHA 1910.134 Respiratory Protection: Mandatory SCBA mask fit-testing & toxic smoke clearance',
        'Critical Incident Stress Debriefing (CISD): Mandatory 24-hr psychological reset post traumatic call',
        'Tactical Ergonomics: Ballistic vest weight distribution & lumbar spine support'
      ],
      therapeuticHobbies: [
        '🥋 Brazilian Jiu-Jitsu / Defensive Grappling: Controlled physical stress outlet & tactical grounding',
        '🚣 Kayaking & Wilderness Paddleboarding: Calm water environments & upper body balance',
        '🌲 Wilderness Backpacking & Camping: Complete off-grid nature immersion away from sirens'
      ],
      precisionOccupationalNutrition: [
        '🫁 N-Acetyl Cysteine (NAC 1200mg) + Vit C (1000mg): Smoke particulate pulmonary detox',
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): Adrenal cortisol & PTSD resilience',
        '🫀 High-Dose EPA/DHA Omega-3 (2000mg): Cardiovascular anti-inflammatory protection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Anchor Kidney Qi & Settle Disturbed Shen: Acupressure on KI-1 Yongquan & PC-6 Neiguan',
        '🍵 An Shen Bu Xin Wan Decoction: Calm heart spirit & relieve post-dispatch hyper-arousal'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Trauma Vata-Pitta Pacification: Daily warm Mahanarayana oil massage for joint/muscle tension',
        '🌿 Brahmi & Ashwagandha Rasayana: Rebuild Ojas & soothe sympathetic nervous system'
      ],
      arboristEcologicalDirectives: [
        '🌳 Conifer Forest Terpene Cleanse: High phytoncide pine forest air for airway & lung clearance'
      ],
      vocalResonanceProtocol: '🎵 Firehouse Choral Glee Vagal Resonation: Group vocalization to process trauma & reset autonomic tone post-dispatch'
    },
    '11-1031': {
      socCode: '11-1031',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related severe emotional and public scrutiny stress disorder (disorder)',
      professionTitle: 'Politicians & Public Representatives',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 6.5,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 9.5,
      actuarialQalyImpact: -3.1,
      oshaMitigationDirectives: [
        'OSHA Public Scrutiny Cortisol Management: Mandatory post-session 48-hr media disconnect window',
        'Security Detail Ergonomics: Posture alignment during prolonged standing press conferences',
        'Vagal HRV Resonant Breathing: 6 breaths/min biofeedback before legislative debates'
      ],
      therapeuticHobbies: [
        '🥾 Solitary Mountain Trail Hiking: Quiet solitude escape away from public scrutiny & cameras',
        '⛵ Solo Offshore Sailing: Absolute focus on wind & water navigation',
        '♟️ Physical Strategic Chess: Non-political tactical mental engagement'
      ],
      precisionOccupationalNutrition: [
        '🌿 Holy Basil / Tulsi (500mg) + Phosphatidylserine (300mg): Debate cortisol dampening',
        '🧠 Magnesium L-Threonate (144mg): Neural calm & restorative sleep onset',
        '⚡ Active B-Complex: High-demand cognitive energy synthesis'
      ],
      tcmOccupationalDirectives: [
        '☯️ Smooth Constricted Liver Qi & Clear Heart Fire: Acupressure on LV-3 Taichong & HT-7 Shenmen',
        '🍵 Xiao Yao San Decoction: Relieve chest constraint & smooth emotional Qi flow'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Sadhaka Pitta Cooling: Shirodhara forehead warm oil therapy to cool public debate heat',
        '🌿 Sandalwood & Rosewater Spray: Cool facial Pitta post-camera lighting'
      ],
      arboristEcologicalDirectives: [
        '🌳 Ancient Redwood Forest Solitude: Perspective grounding under towering ancient canopy'
      ],
      vocalResonanceProtocol: '🎵 Town Hall Vocal Recovery Glee: Diaphragmatic 528 Hz harmonic vocalization post-debate to soothe strained vocal folds'
    },
    '27-2042': {
      socCode: '27-2042',
      snomedCode: '412089004',
      snomedDisplay: 'Occupational focal dystonia and repetitive motion disorder (disorder)',
      professionTitle: 'Musicians & Singers',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.2,
      circadianDisruptionScore: 9.4,
      chemicalExposureScore: 3.5,
      allostaticBurnoutScore: 8.9,
      actuarialQalyImpact: -2.7,
      oshaMitigationDirectives: [
        'OSHA 1910.95 Acoustic Hearing Protection: Custom 15dB/25dB attenuated stage in-ear monitors',
        'Touring Sleep Hygiene Protocol: Bus blackout shades & 10,000 lux phototherapy upon arrival',
        'Instrument Focal Dystonia Prevention: Micro-stretch breaks every 45 mins of rehearsal'
      ],
      therapeuticHobbies: [
        '🌱 Organic Vegetable Gardening: Earth soil grounding away from stage decibels & spotlights',
        '🏊 Hydrotherapy & Swimming: Instrumental postural reversal & shoulder girdle release',
        '🍳 Culinary Arts & Cooking: Tactile sensory creation away from musical instruments'
      ],
      precisionOccupationalNutrition: [
        '🧠 Magnesium L-Threonate (144mg) + Vit B6 (50mg): Stage tremor & wrist nerve conduction',
        '👁️ Bilberry (160mg) + Lutein (20mg): Stage lighting glare retinal protection',
        '🌱 Slippery Elm (400mg) + Marshmallow Root: Vocal fold mucosal hydration for vocalists'
      ],
      tcmOccupationalDirectives: [
        '☯️ Unblock Arm Channels & Nourish Heart Blood: Acupressure on SJ-5 Waiguan & HT-7 Shenmen',
        '🍵 Gui Zhi Tang or Suan Zao Ren Tang: Warm channels & settle post-concert Shen'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Wrist & Finger Abhyanga: Warm Mahanarayana oil massage for instrumentalists',
        '🌿 Yashtimadhu (Licorice) Tea: Vocal fold lubrication & cooling'
      ],
      arboristEcologicalDirectives: [
        '🌳 Quiet Forest Floor Walking: Acoustic sanctuary away from decibel amplification'
      ],
      vocalResonanceProtocol: '🎵 Harmonic Choir Glee Resonance: Ensemble vocal warmup & cooldown at 432 Hz to prevent vocal fold nodule formation'
    },
    '27-1013': {
      socCode: '27-1013',
      snomedCode: '702859005',
      snomedDisplay: 'Occupational exposure to solvent and pigment fumes (finding)',
      professionTitle: 'Painters & Fine Artists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 5.5,
      chemicalExposureScore: 7.2,
      allostaticBurnoutScore: 6.8,
      actuarialQalyImpact: -2.0,
      oshaMitigationDirectives: [
        'OSHA 1910.107 Studio Ventilation: Local exhaust hood for turpentine & solvent vapor extraction',
        'Respirator Safety Protocol: PAPR or N95 respirator during spray & pigment mixing',
        'Easel Height Ergonomics: Adjustable easel positioning to prevent cervical neck flexion'
      ],
      therapeuticHobbies: [
        '🏊 Hydrotherapy & Swimming: Full cervical spine & shoulder extension',
        '🏃 Outdoor Trail Running: Natural daylight, visual divergence, & aerobic movement',
        '🎼 Classical Symphony Concerts: Pure auditory artistic stimulation'
      ],
      precisionOccupationalNutrition: [
        '🫁 N-Acetyl Cysteine (NAC 1200mg) + Alpha-Lipoic Acid (300mg): Solvent hepatic detox',
        '🦴 Hydrolyzed Collagen Peptides (10g): Shoulder tendon sheath lubrication',
        '👁️ Lutein (20mg) + Zeaxanthin (4mg): Fine detail visual focus protection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Clear Liver Solvent Toxins & Relax Sinews: Acupressure on GB-34 Yanglingquan & LV-2 Xingjian',
        '🍵 Green Tea & Mung Bean Decoction: Clear internal chemical heat & purge toxins'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Silymarin & Turmeric Hepatic Cleansing: Protect liver cells from paint thinners',
        '🌿 Dhanwantharam Shoulder Massage: Warm herbal oil for easel arm strain'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sunlit Botanical Garden Immersion: Inhaling natural flower/plant terpenes vs synthetic pigments'
      ],
      vocalResonanceProtocol: '🎵 Studio Solfeggio Humming: Low 432 Hz vocal humming while painting to maintain parasympathetic breathing'
    },
    '27-2011': {
      socCode: '27-2011',
      snomedCode: '417893002',
      snomedDisplay: 'Identity dissociation and post-performance emotional burnout (disorder)',
      professionTitle: 'Actors & Performing Artists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.8,
      circadianDisruptionScore: 8.8,
      chemicalExposureScore: 3.0,
      allostaticBurnoutScore: 9.1,
      actuarialQalyImpact: -2.6,
      oshaMitigationDirectives: [
        'OSHA Stunt & Stage Safety: Rigorous harness inspection & floor impact matting',
        'Emotional Role De-Role Protocol: Mandatory debriefing to transition out of intense dramatic states',
        'Stage Lighting UV Shielding: Skin photoprotection & hydration under high-wattage lights'
      ],
      therapeuticHobbies: [
        '🌲 Forest Bathing (Shinrin-Yoku): Authentic self-grounding in quiet nature away from cameras',
        '🧘 Kundalini Yoga & Breathing: Autonomic nervous system centering & energy balancing',
        '👨‍🍳 Baking & Culinary Arts: Tactile physical process with tangible comforting outcome'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg): Emotional role-transition cortisol balance',
        '🧠 L-Theanine (200mg) + Mag Threonate (144mg): Stage fright calm & neural relaxation',
        '🌱 Slippery Elm (400mg): Vocal cord protection under loud projection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Anchor Shen & Nourish Heart Blood: Acupressure on HT-7 Shenmen & PC-6 Neiguan',
        '🍵 Tian Wang Bu Xin Dan Tea: Nourish Heart Yin & settle post-performance emotional agitation'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Brahmi Ghee & Shirodhara: Calm emotional hyper-arousal after intense role portrayal',
        '🌿 Nasya Herbal Oil Drops: Clear head & sinuses after heavy stage makeup'
      ],
      arboristEcologicalDirectives: [
        '🌳 Deep Woodland Canopy Solitude: Re-connecting to personal baseline identity among trees'
      ],
      vocalResonanceProtocol: '🎵 Theatre Glee Vocal De-Role Protocol: Choral ensemble vocal cooldown to transition out of intense dramatic character states'
    },
    '27-3023': {
      socCode: '27-3023',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related breaking-news adrenaline stress disorder (disorder)',
      professionTitle: 'News Media Anchors & Broadcast Journalists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 8.9,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 9.4,
      actuarialQalyImpact: -3.0,
      oshaMitigationDirectives: [
        'OSHA Teleprompter Focal Rest: 20-20-20 visual divergence to prevent eye fatigue under studio lights',
        'Breaking News Surge Protocol: Mandatory post-breaking news 12-hr circadian reset',
        'Broadcast Lighting Photoprotection: Skin photoprotection & hydration under 1000W studio lamps'
      ],
      therapeuticHobbies: [
        '🌊 Solitary Kayaking & Ocean Rowing: Quiet nature movement away from breaking news feeds',
        '🎹 Classical Piano Playing: Rhythmic acoustic focus & motor dexterity',
        '🌲 Silent Forest Bathing (Unplugged): Sensory restoration with zero digital news alerts'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): Live broadcast cortisol regulation',
        '👁️ Bilberry Extract (160mg) + Lutein (20mg): Teleprompter retinal glare protection',
        '🌱 Slippery Elm (400mg) + Marshmallow Root: Vocal fold mucosal hydration for continuous broadcast'
      ],
      tcmOccupationalDirectives: [
        '☯️ Clear Heart Fire & Nourish Liver Blood: Acupressure on HT-7 Shenmen & GB-20 Fengchi',
        '🍵 Suan Zao Ren Tang Decoction: Nourish Heart Yin & settle live broadcast adrenaline'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Cool High Sadhaka Pitta: Shirodhara forehead warm oil therapy & Rosewater eye drops',
        '🌿 Brahmi Ghee: Maintain diagnostic clarity under breaking news pressure'
      ],
      arboristEcologicalDirectives: [
        '🌳 Deep Canopy Green Divergence: Visual relaxation from teleprompter red cue lights'
      ],
      vocalResonanceProtocol: '🎵 Newsroom Ensemble Glee Cooldown: Harmonic 432 Hz vocal humming post-broadcast to de-escalate breaking news adrenaline'
    },
    '11-1021-INN': {
      socCode: '11-1021-INN',
      snomedCode: '417893002',
      snomedDisplay: 'Intellectual hyper-focus exhaustion & founder burnout disorder (disorder)',
      professionTitle: 'Innovators, Inventors & R&D Founders',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 6.8,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 2.5,
      allostaticBurnoutScore: 9.7,
      actuarialQalyImpact: -2.8,
      oshaMitigationDirectives: [
        'OSHA Prototype Sprint Limits: Mandatory 48-hr recovery window post major R&D release',
        'Pitch Stress Vagal Breathing: 6 breaths/min biofeedback prior to key investor & partner demos',
        'Whiteboard Ergonomics: Height-adjusted drafting desks to prevent shoulder & cervical strain'
      ],
      therapeuticHobbies: [
        '🧗 Outdoor Bouldering & Free Climbing: 3D spatial breakthrough thinking away from screens',
        '⛵ Long-Distance Offshore Sailing: Complete environmental focus on wind, waves, & strategy',
        '🎨 Abstract Fluid Acrylic Painting: Unstructured creative expression with zero constraint'
      ],
      precisionOccupationalNutrition: [
        '🧠 Alpha-GPC (300mg) + Bacopa Monnieri (300mg): Deep creative synthesis & memory retention',
        '🧠 Magnesium L-Threonate (144mg): Sleep onset after late-night breakthrough ideation loops',
        '🫀 High-DHA Omega-3 (2000mg): Neuronal membrane fluidity for complex problem solving'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Kidney Marrow & Anchor Qi: Acupressure on KI-1 Yongquan & DU-20 Baihui',
        '🍵 Walnut & Black Sesame Seed Decoction: Brain marrow nutrition & essence preservation'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Medhya Rasayana (Brahmi, Shankhpushpi, Jyotishmati): Rebuild Ojas & sustain founder vision',
        '🌿 Warm Sesame Oil Head Massage: Calm hyper-active Vata mental loops'
      ],
      arboristEcologicalDirectives: [
        '🌳 Redwood Forest Canopy Immersion: Long-term generational perspective under ancient trees'
      ],
      vocalResonanceProtocol: '🎵 Innovation Lab Choral Resonance: Group vocal harmony during ideation sprints to induce 8-12 Hz Alpha brainwaves'
    },
    '99-9999-RET': {
      socCode: '99-9999-RET',
      snomedCode: '105493001',
      snomedDisplay: 'Retirement from work and active life-stage transition (finding)',
      professionTitle: 'Active Retirees & Sabbatical Explorers',
      category: 'Life Stage & Career Transition',
      oshaRiskLevel: 'Standard',
      ergonomicStrainScore: 2.0,
      circadianDisruptionScore: 2.0,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 1.5,
      actuarialQalyImpact: 4.5,
      oshaMitigationDirectives: [
        'Purpose & Structured Engagement: Daily community volunteering, mentoring, or passion projects to prevent cognitive decline',
        'Natural Circadian Realignment: Wake up with natural morning sunlight without alarm clock cortisol shocks',
        'Daily Dynamic Movement Ceiling: Target 8,000+ steps across varied outdoor terrain to preserve bone density & muscle mass'
      ],
      therapeuticHobbies: [
        '🌿 Organic Permaculture Gardening: Daily soil physical grounding & fresh vegetable cultivation',
        '🚶 Intercontinental Pilgrimage / Long-Distance Trail Walking: Endurance movement & spiritual reflection',
        '🎨 Fine Art Painting & Wood Sculpting: Creative motor expression with zero deadline pressure',
        '🎹 Learning a New Musical Instrument: High neuro-plasticity brain stimulation'
      ],
      precisionOccupationalNutrition: [
        '🧠 Phosphatidylserine (300mg) + Bacopa Monnieri (300mg): Synaptic plasticity & age-related memory protection',
        '🦴 Collagen Peptides (10g) + Vit D3 (5000 IU) + K2 (200mcg): Joint cartilage & bone density maintenance',
        '🫀 CoQ10 (200mg) + Trans-Resveratrol (250mg): Mitochondrial longevity & vascular endothelial support'
      ],
      tcmOccupationalDirectives: [
        '☯️ Tonify Kidney Jing & Preserve Vital Qi: Acupressure on KI-3 Taixi & DU-4 Mingmen',
        '🍵 Liu Wei Di Huang Wan or Astragalus (Huang Qi) Tea: Fortify root essence & prolong lifespan'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Rasayana Rejuvenation: Daily warm Abhyanga sesame oil massage to rebuild Ojas & nourish Rasa Dhatu',
        '🌿 Chyawanprash Herbal Jam (1 tbsp daily): Rebuild immune defense & promote systemic longevity'
      ],
      arboristEcologicalDirectives: [
        '🌳 Old-Growth Forest Canopy Immersion: Daily microclimatology grounding among mature trees'
      ],
      vocalResonanceProtocol: '🎵 Community Choir & Intergenerational Glee: Shared harmonic singing to boost oxytocin (+150%), lower solitude loneliness, and preserve vocal strength'
    },
    '99-9999-PIV': {
      socCode: '99-9999-PIV',
      snomedCode: '417893002',
      snomedDisplay: 'Career transition stress and role adaptation disorder (disorder)',
      professionTitle: 'Career Changers & Mid-Life Transition Pivoters',
      category: 'Life Stage & Career Transition',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 5.5,
      circadianDisruptionScore: 6.8,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 8.5,
      actuarialQalyImpact: 2.2,
      oshaMitigationDirectives: [
        'Pivot Stress Vagal Breathing: 6 breaths/min biofeedback during reskilling bootcamps & job interviews',
        'Ergonomic Retraining Station: Sit-stand workstation adjustment during intensive study/code retraining',
        'Identity Shift Reflection: Structured debriefing on past professional accomplishments to eliminate imposter syndrome'
      ],
      therapeuticHobbies: [
        '🧗 Bouldering & Outdoor Rock Climbing: Metaphorical climbing, 3D spatial problem solving, & physical release',
        '🚣 Kayaking & Rowing: Continuous rhythmic movement & nature disconnect',
        '♟️ Physical Chess & Strategy: Strategic non-work problem solving'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + L-Theanine (200mg): Transition anxiety calm & sharp mental focus',
        '🧠 Alpha-GPC (300mg): Accelerated new skill acquisition & memory synthesis',
        '⚡ Active B-Complex (Methylated): Sustained energy during career transition study'
      ],
      tcmOccupationalDirectives: [
        '☯️ Smooth Liver Qi Stagnation & Fortify Spleen: Acupressure on LV-3 Taichong & ST-36 Zusanli',
        '🍵 Xiao Yao San Decoction: Relieve transition chest tightness & harmonize internal Qi'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Stabilize Vata Transition Storms: Shirodhara forehead warm oil therapy & Brahmi Rasayana',
        '🌿 Warm Golden Turmeric Milk: Calm nervous system & promote restorative sleep during transition'
      ],
      arboristEcologicalDirectives: [
        '🌳 Deciduous Seasonal Transition Awareness: Observing seasonal tree leaf shedding as a natural model for letting go of past roles'
      ],
      vocalResonanceProtocol: '🎵 Transition Cohort Glee & Resonance: Group vocal entrainment to build confidence, voice projection, and communal support during career pivots'
    },
    '23-1011': {
      socCode: '23-1011',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related severe litigation stress and adversarial burnout disorder (disorder)',
      professionTitle: 'Lawyers, Attorneys & Judicial Counsel',
      category: 'Public Service, Legal & Governance',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.0,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 9.6,
      actuarialQalyImpact: -3.4,
      oshaMitigationDirectives: [
        'OSHA Billable-Hour Burnout Limits: Mandatory 48-hr post-trial wind-down window',
        'Brief Analysis Visual Hygiene: 20-20-20 visual divergence rule during contract analysis',
        'Courtroom Standing Ergonomics: Height-adjusted podium & posture alignment during 6+ hr trial arguments'
      ],
      therapeuticHobbies: [
        '🚴 Long-Distance Road Cycling: High-cadence endurance cardiovascular release',
        '⛵ Offshore Sailing & Navigation: Complete mental focus on wind, tides, & water',
        '🎾 Competitive Tennis / Squash: High-intensity physical stress discharge',
        '📚 Non-Legal Classical Literature Reading: Non-adversarial intellectual stimulation'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): Litigation cortisol regulation & endurance',
        '🧠 Phosphatidylserine (300mg) + Mag L-Threonate (144mg): Brief analysis memory & trial sleep onset',
        '🌱 Slippery Elm (400mg): Vocal cord mucosal protection for prolonged courtroom arguments'
      ],
      tcmOccupationalDirectives: [
        '☯️ Clear Liver Fire & Soothe Stagnant Qi: Acupressure on LV-3 Taichong & GB-20 Fengchi',
        '🍵 Long Dan Xie Gan Tang or Xiao Yao San: Relieve courtroom adversarial frustration & clear Liver heat'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Cool High Sadhaka Pitta: Shirodhara forehead warm oil therapy & Brahmi Ghee',
        '🌿 Sandalwood Facial Mist: Cool facial Pitta after intense oral cross-examinations'
      ],
      arboristEcologicalDirectives: [
        '🌳 Ancient Oak Canopy Immersion: Grounding under centuries-old oak trees for long-term wisdom & perspective'
      ],
      vocalResonanceProtocol: '🎵 Bar Association Choral Resonance: Ensemble vocal warmup & 528 Hz harmonic chanting post-trial to restore vocal fold elasticity and release adversarial tension'
    },
    '11-1011-ROYAL': {
      socCode: '11-1011-ROYAL',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related severe sovereign duty and dynastic responsibility stress disorder (disorder)',
      professionTitle: 'Barons, Kings, Queens & Sovereign Heads of State',
      category: 'Sovereignty & Traditional Guardianship',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.0,
      circadianDisruptionScore: 8.8,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 9.8,
      actuarialQalyImpact: -3.6,
      oshaMitigationDirectives: [
        'Sovereign Crown & Regalia Ergonomics: Cervical posture alignment to mitigate heavy crown compression on C1-C7 vertebrae',
        'State Ceremony Seclusion Protocol: Mandatory 24-hr secluded wind-down window post coronation & state banquets',
        'Dynastic Duty Biofeedback: 6bpm vagal HRV breathing prior to royal addresses & diplomatic summits'
      ],
      therapeuticHobbies: [
        '🐎 Equestrian Horseback Riding & Dressage: Postural spinal extension & deep animal connection',
        '🦅 Falconry & Raptor Conservation: Unfiltered outdoor focus & ancient art of falcon partnership',
        '🌿 Botanical Estate Arboriculture: Caring for living historic trees & estate gardens',
        '🎻 Classical Cello / Harpsichord: Acoustic musical expression in quiet sanctuary'
      ],
      precisionOccupationalNutrition: [
        '🌿 Ashwagandha KSM-66 (600mg) + Rhodiola Rosea (300mg): Dynastic duty cortisol regulation & resilience',
        '🫀 CoQ10 (200mg) + Trans-Resveratrol (250mg): Sovereign longevity & vascular endothelial protection',
        '🧠 Phosphatidylserine (300mg): Diplomatic memory, speech recall, & constitutional focus'
      ],
      tcmOccupationalDirectives: [
        '☯️ Anchor Emperor Shen & Nourish Heart Blood: Acupressure on HT-7 Shenmen & DU-20 Baihui',
        '🍵 Tian Wang Bu Xin Dan & Imperial Wild Ginseng Tea: Settle imperial spirit & fortify primordial Qi'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Royal Abhyanga Massage: Warm sesame & sandalwood oil massage for sovereign joint/spine decompression',
        '🌿 Brahmi & Gold Bhasma Rasayana: Preserve royal wisdom, clarity, & Ojas'
      ],
      arboristEcologicalDirectives: [
        '🌳 Ancient Royal Estate Tree Sanctuary: Grounding under 500-year-old estate oak & yew trees for dynastic perspective'
      ],
      vocalResonanceProtocol: '🎵 Royal Chapel Choral Resonance: High-cathedral polyphonic choral singing (432 Hz) to elevate sIgA (+150%), calm regal anxiety, and preserve vocal majesty'
    },
    '11-1011-CHIEF': {
      socCode: '11-1011-CHIEF',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related indigenous community guardianship and intergenerational duty stress disorder (disorder)',
      professionTitle: 'Sovereign Tribal Chiefs & Indigenous Community Leaders',
      category: 'Sovereignty & Traditional Guardianship',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 6.5,
      circadianDisruptionScore: 7.8,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 9.4,
      actuarialQalyImpact: -2.5,
      oshaMitigationDirectives: [
        'Sovereign Intergenerational Guardianship Protocol: Mandatory ancestral land ceremony & community wind-down rest windows',
        'Tribal Council Ergonomics: Ergonomic seat alignment during multi-day elder council sessions',
        'Vagal Ancestral Biofeedback: 6bpm vagal breathing prior to treaty negotiations & tribal land council summits'
      ],
      therapeuticHobbies: [
        '🌿 Sacred Botanical Cultivation & Seed Saving: Preserving indigenous heirloom flora',
        '🏹 Traditional Archery & Woodcraft: Mindful physical focus & traditional craftsmanship',
        '🚣 Tribal Canoe & Waterway Stewardship: Rhythmic paddling & river/ocean conservation',
        '📜 Oral Storytelling & Ancestral History Preservation: Intergenerational wisdom sharing'
      ],
      precisionOccupationalNutrition: [
        '🫐 Indigenous Wild Blueberry Anthocyanins (500mg): Retinal & neuro-protective antioxidant defense',
        '🌿 Cedar & Sweetgrass Infusions: Respiratory mucosal defense & traditional grounding',
        '🧠 Phosphatidylserine (300mg): Intergenerational memory, tribal law retention, & mental focus'
      ],
      tcmOccupationalDirectives: [
        '☯️ Harmonize Earth Spleen & Anchor Shen: Acupressure on ST-36 Zusanli & DU-20 Baihui',
        '🍵 Astragalus (Huang Qi) & Wild Ginseng Tea: Fortify root Qi & nourish community guardianship energy'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Ojas Rebuilding Massage: Warm Bala & Ashwagandha oil massage to pacify Vata and nourish traditional Ojas',
        '🌿 Chyawanprash & Sacred Tulsi Tea: Systemic immune defense & ancestral vitality'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sacred Old-Growth Cedar & Pine Grove Immersion: Deep spiritual & ecological connection with ancient native canopy'
      ],
      vocalResonanceProtocol: '🎵 Tribal Ensemble Glee & Chant: Traditional communal chanting and harmonic vocalization to strengthen community coherence, elevate sIgA (+150%), and release intergenerational burden'
    },
    '39-9011': {
      socCode: '39-9011',
      snomedCode: '412089004',
      snomedDisplay: 'Repetitive child lifting and pediatric viral exposure strain (disorder)',
      professionTitle: 'Babysitters & Childcare Workers',
      category: 'Hospitality, Childcare & Service',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 6.0,
      chemicalExposureScore: 3.0,
      allostaticBurnoutScore: 8.0,
      actuarialQalyImpact: -1.8,
      oshaMitigationDirectives: [
        'Child Lifting Ergonomics: Mandatory hip-hinge squat posture during child pickups to prevent L4-L5 disc strain',
        'Pediatric Infection Control: Strict hand hygiene & surface sanitization protocol after diapering & play',
        'Playroom Noise Protection: Low-attenuation earplugs during high-decibel indoor group play sessions'
      ],
      therapeuticHobbies: [
        '🎨 Watercolor Painting & Crafting: Quiet creative artistic expression away from active childcare',
        '🧘 Restorative Yin Yoga & Lumbar Decompression: Reversing child carrying lumbar lordosis strain',
        '🥾 Solitary Nature Walking: Uninterrupted quiet nature walks for autonomic reset'
      ],
      precisionOccupationalNutrition: [
        '🛡️ Elderberry Extract (500mg) + Vit C (1000mg) + Zinc (15mg): Pediatric viral immune defense',
        '🦴 Hydrolyzed Collagen Peptides (10g): Lumbar & hip joint disc resilience',
        '🧠 L-Theanine (200mg): Patience enhancement & sympathetic stress calming'
      ],
      tcmOccupationalDirectives: [
        '☯️ Fortify Spleen Qi & Calm Heart Shen: Acupressure on ST-36 Zusanli & HT-7 Shenmen',
        '🍵 Gui Pi Tang Tea: Nourish Spleen Qi & Heart Blood after active childcare supervision'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Warm Bala Oil Massage: Lower back & knee Abhyanga for child lifting joint strain',
        '🌿 Golden Turmeric Milk with Cardamom: Deep sleep recovery & immune support'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sunlit Meadow & Garden Immersion: Refreshing sensory calm after active child supervision'
      ],
      vocalResonanceProtocol: '🎵 Nursery Rhyme & Storyteller Glee: Rhythmic melodic singing to soothe child tension and preserve vocal cord flexibility'
    },
    '35-3023': {
      socCode: '35-3023',
      snomedCode: '702859005',
      snomedDisplay: 'Hot grease fume exposure and commercial kitchen heat strain (finding)',
      professionTitle: 'Fast Food Workers & Counter Attendants',
      category: 'Hospitality, Childcare & Service',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.8,
      circadianDisruptionScore: 8.5,
      chemicalExposureScore: 6.8,
      allostaticBurnoutScore: 9.0,
      actuarialQalyImpact: -3.2,
      oshaMitigationDirectives: [
        'OSHA 1910.107 Commercial Grease Hood Extraction: Continuous local exhaust ventilation above deep fryers',
        'ASTM F2913 Slip Resistance: Non-slip certified footwear to prevent grease-slick floor falls',
        'Heat Stress Hydration Breaks: Mandatory 15-min hydration breaks every 2 hrs near grill/fryer stations'
      ],
      therapeuticHobbies: [
        '🏊 Hydrotherapy & Swimming: Reversing 8+ hours of hard floor standing & joint compression',
        '🎸 Acoustic Guitar Playing: Creative tactile focus away from kitchen noise',
        '🚴 Outdoor Leisure Cycling: Open air cardiovascular flushing after kitchen shifts'
      ],
      precisionOccupationalNutrition: [
        '🥦 Sulforaphane (30mg) + Curcumin (500mg): Deep fryer grease fume pulmonary & hepatic detox',
        '💧 Deep Sea Electrolyte Fluid: Hydration replacement for commercial kitchen heat loss',
        '🦴 Glucosamine Sulfate (1500mg) + Chondroitin (1200mg): Hard floor foot & knee joint cushion'
      ],
      tcmOccupationalDirectives: [
        '☯️ Clear Stomach Heat & Expel Damp-Heat: Acupressure on ST-44 Neiting & SP-9 Yinlingquan',
        '🍵 Green Tea & Barley Water Decoction: Clear internal kitchen heat & drain lower limb dampness'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Foot Abhyanga with Ksheerabala Oil: Soothe plantar fascia & ankle strain after standing shifts',
        '🌿 Coriander & Fennel Cooling Tea: Neutralize Pitta kitchen heat & digestive acidity'
      ],
      arboristEcologicalDirectives: [
        '🌳 Evergreen Forest Walk: Breathing clean pine phytoncides away from commercial fryers'
      ],
      vocalResonanceProtocol: '🎵 Fast-Food Crew Ensemble Glee: Upbeat group vocalization to boost team morale & flush shift fatigue'
    },
    '53-7065': {
      socCode: '53-7065',
      snomedCode: '412089004',
      snomedDisplay: 'Repetitive heavy lifting and cold storage exposure strain (disorder)',
      professionTitle: 'Grocery Store Stockers & Order Fillers',
      category: 'Transportation & Logistics',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.8,
      circadianDisruptionScore: 8.0,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 7.8,
      actuarialQalyImpact: -2.9,
      oshaMitigationDirectives: [
        'OSHA 1910.178 Pallet Jack & Lifting Ergonomics: Squat-pivot lifting to prevent lumbar strain',
        'Walk-In Freezer Thermal Protection: Insulated thermal gloves & layered jacket per OSHA cold stress guidelines',
        'Micro-Break Schedule: 5-min ergonomic micro-stretches every 60 mins during heavy case stocking'
      ],
      therapeuticHobbies: [
        '🧘 Restorative Yoga & Spinal Decompression: Reversing heavy box lifting spinal compression',
        '🎯 Target Darts & Archery: Fine hand-eye precision away from heavy warehouse lifting',
        '🪵 Traditional Wood Carving: Mindful hand crafting & focus'
      ],
      precisionOccupationalNutrition: [
        '🦴 Collagen Type I/III (10g) + Vit C (1000mg): Biceps & lumbar tendon sheath resilience',
        '⚡ Magnesium Glycinate (400mg): Overnight stocking shift muscle cramp prevention',
        '☀️ Vit D3 (5000 IU) + K2 (200mcg): Sunlight compensation for indoor/overnight stocking'
      ],
      tcmOccupationalDirectives: [
        '☯️ Relax Sinews & Invigorate Blood: Acupressure on GB-34 Yanglingquan & BL-40 Weizhong',
        '🍵 Du Huo Ji Sheng Tang Tea: Expel Cold-Damp from walk-in freezers & strengthen lumbar spine'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Warm Mahanarayana Oil Massage: Shoulder & lumbar Abhyanga post-shift',
        '🌿 Ginger & Ashwagandha Tea: Warm internal channels after cold storage stocking'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sunlit Deciduous Forest Walk: Replenishing natural daylight after cold storage & overnight shifts'
      ],
      vocalResonanceProtocol: '🎵 Night-Shift Stocker Rhythmic Vocalization: Low-frequency vocal humming during stocking shifts to maintain breathing rhythm and prevent fatigue'
    },
    '21-2011': {
      socCode: '21-2011',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related pastoral emotional exhaustion and spiritual burnout disorder (disorder)',
      professionTitle: 'Pastors, Clergy, Nuns & Religious Leaders',
      category: 'Education & Clergy',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 6.8,
      circadianDisruptionScore: 7.5,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 9.2,
      actuarialQalyImpact: 1.5,
      oshaMitigationDirectives: [
        'Pastoral Counseling Emotional Boundary Protocol: Mandatory 24-hr silent retreat window post bereavement & crisis counseling',
        'Sermon & Liturgical Standing Ergonomics: Posture alignment during 3+ hr Sunday services & genuflection knee cushion',
        'Vagal Prayer & Contemplative Biofeedback: 6bpm vagal HRV breathing during silent meditation & liturgical prayer'
      ],
      therapeuticHobbies: [
        '🌿 Monastery Herb & Botanical Gardening: Cultivating medicinal herbs & quiet outdoor soil grounding',
        '🚶 Labyrinth Walking & Contemplative Solitude: Rhythmic reflective walking away from congregational demands',
        '📜 Ancient Scriptural Calligraphy: Mindful fine hand motor focus & artistic meditation',
        '🐝 Apiculture & Beekeeping: Calming focus on hive harmony & nature rhythms'
      ],
      precisionOccupationalNutrition: [
        '🌿 Holy Basil / Tulsi (500mg): Pastoral grief & compassion fatigue cortisol reduction',
        '🧠 Phosphatidylserine (300mg): Scriptural memory retention & contemplative focus',
        '🦴 Hydrolyzed Collagen Peptides (10g): Genuflection knee joint cartilage protection'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Heart Blood & Quiet Disturbed Shen: Acupressure on HT-7 Shenmen & PC-6 Neiguan',
        '🍵 Tian Wang Bu Xin Dan & Frankincense (Ru Xiang) Tea: Settle spiritual heart & relieve pastoral grief'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Ojas & Sadhaka Pitta Pacification: Warm Brahmi Ghee & Frankincense/Sandalwood aromatherapy',
        '🌿 Warm Golden Milk with Nutmeg: Settle nervous system & support deep contemplative sleep'
      ],
      arboristEcologicalDirectives: [
        '🌳 Monastery Cloister Garden & Ancient Cedar Grove Immersion: Contemplative walking under monastic trees'
      ],
      vocalResonanceProtocol: '🎵 Monastic Gregorian Chant & Choir Glee: 432 Hz / 528 Hz liturgical chanting to stimulate the vagus nerve, boost sIgA (+150%), flush pastoral grief, and induce deep inner peace'
    },
    '27-2021-SWIM': {
      socCode: '27-2021-SWIM',
      snomedCode: '412089004',
      snomedDisplay: 'Swimmer shoulder glenohumeral instability and pool chlorine airway strain (disorder)',
      professionTitle: 'Endurance & Marathon Swimmers',
      category: 'Athletics & Professional Sports',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 8.5,
      circadianDisruptionScore: 6.5,
      chemicalExposureScore: 6.2,
      allostaticBurnoutScore: 8.0,
      actuarialQalyImpact: 3.2,
      oshaMitigationDirectives: [
        'Chlorine Airway Neutralization: Post-swim nasal saline flush & Vitamin C spray to neutralize pool chlorine fumes',
        'Rotator Cuff Load Balancing: Scapular retraction drills & rotator cuff tendon sheath rest windows',
        'Hypothermic Rewarming Protocol: Active core rewarming & insulation post open-water marathon swims'
      ],
      therapeuticHobbies: [
        '🚴 Easy Recovery Cycling: Low-impact leg fluid circulation',
        '🎷 Acoustic Wind Instruments: Diaphragmatic respiratory control & vagal stimulation',
        '🎨 Hand-Built Pottery & Ceramics: Tactile dry-land artistic expression'
      ],
      precisionOccupationalNutrition: [
        '🦴 Hydrolyzed Collagen (15g) + Vit C (1000mg): Glenohumeral shoulder tendon sheath repair',
        '🫁 N-Acetyl Cysteine (NAC 1200mg): Pool chlorine airway oxidative detox',
        '💧 Deep Sea Electrolyte Fluid: Plasma sodium & potassium replacement post long swims'
      ],
      tcmOccupationalDirectives: [
        '☯️ Relax Shoulder Sinews & Moisten Lungs: Acupressure on LU-5 Chize & LI-15 Jianyu',
        '🍵 Yu Ping Feng San & Loquat Syrup (Pi Pa Gao) Tea: Protect Lung Qi & moisten chlorine-exposed airways'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Dhanwantharam Shoulder Massage: Warm herbal oil for glenohumeral rotator cuff strain',
        '🌿 Cooling Coconut Water with Fennel: Neutralize internal pool heat & soothe plasma (Rasa Dhatu)'
      ],
      arboristEcologicalDirectives: [
        '🌳 Sunlit Redwood Forest Walk: Inhaling fresh woodland phytoncides after chlorine pool training'
      ],
      vocalResonanceProtocol: '🎵 Swimmer Diaphragmatic Breath Glee: Controlled 528 Hz vocal hums post-swim to open lung alveoli and restore vocal fold moisture'
    },
    '27-2021-BIKE': {
      socCode: '27-2021-BIKE',
      snomedCode: '412089004',
      snomedDisplay: 'Perineal nerve entrapment and cervical spine hyper-extension strain (disorder)',
      professionTitle: 'Endurance & Road Cyclists',
      category: 'Athletics & Professional Sports',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 9.0,
      circadianDisruptionScore: 7.0,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 8.5,
      actuarialQalyImpact: 3.0,
      oshaMitigationDirectives: [
        'Biomechanical Bike Fit & Cutout Saddle: Central relief channel to eliminate pudendal nerve compression & pelvic ischemia',
        'Cervical Hyper-Extension Micro-Break: Hourly neck retraction micro-stretches during aero-bar riding',
        'Road Hazard Safety & Impact Protection: MIPS-certified helmet inspection & high-visibility active lighting'
      ],
      therapeuticHobbies: [
        '🏊 Hydrotherapy & Aquatic Floating: Zero-gravity spinal decompression post long ride',
        '♟️ Physical Chess & Board Games: Strategic non-physical mental engagement',
        '🎻 Classical Cello Playing: Postural extension & rhythmic musical focus'
      ],
      precisionOccupationalNutrition: [
        '🍒 Montmorency Tart Cherry Concentrate (30ml): Rapid quadriceps DOMS muscle recovery',
        '🦴 Glucosamine Sulfate (1500mg) + Chondroitin (1200mg): Hip & knee joint cartilage cushion',
        '⚡ Magnesium Glycinate (400mg): Night-time calf cramp & neuromuscular spasm prevention'
      ],
      tcmOccupationalDirectives: [
        '☯️ Invigorate Leg Channels & Unblock Qi: Acupressure on ST-36 Zusanli & GB-30 Huantiao',
        '🍵 Du Huo Ji Sheng Tang Tea: Expel Wind-Damp from knee joints & strengthen lower back'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Mahanarayana Quadriceps & Hamstring Massage: Warm herbal oil for leg muscle stiffness',
        '🌿 Ginger & Ashwagandha Recovery Tea: Warm internal channels & accelerate glycogen recovery'
      ],
      arboristEcologicalDirectives: [
        '🌳 Broadleaf Oak Canopy Shade Immersion: Visual relaxation & cooling post-road ride'
      ],
      vocalResonanceProtocol: '🎵 Peloton Cohort Glee & Rhythm Chant: Cadence-matched vocalization during recovery rides to synchronize diaphragmatic rhythm'
    },
    '27-2021-RUN': {
      socCode: '27-2021-RUN',
      snomedCode: '412089004',
      snomedDisplay: 'Plantar fasciitis and tibial stress reaction disorder (disorder)',
      professionTitle: 'Endurance & Marathon Runners',
      category: 'Athletics & Professional Sports',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 9.2,
      circadianDisruptionScore: 6.8,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 8.2,
      actuarialQalyImpact: 3.5,
      oshaMitigationDirectives: [
        'Ground Impact Load Ceiling: Midsole shoe cushioning replacement every 400 miles & trail surface preference',
        'Tibial Stress Fracture Screening: Bi-weekly bone density & localized shin tenderness monitoring',
        'Heat Strain Hydration Ceiling: Sweat-rate fluid replacement calculation with sodium balancing'
      ],
      therapeuticHobbies: [
        '🏊 Zero-Impact Hydrotherapy & Swimming: Cardiovascular maintenance with zero joint ground impact',
        '🧘 Deep Restorative Yin Yoga: Hamstring, Achilles, & plantar fascia lengthening',
        '🎨 Abstract Oil Painting: Creative tactile expression away from running trails'
      ],
      precisionOccupationalNutrition: [
        '🦴 Collagen Type I/III (15g) + Vit D3 (5000 IU) + K2 (200mcg): Tibial bone matrix & Achilles tendon repair',
        '🍒 Montmorency Tart Cherry Extract: DOMS reduction & systemic oxidative calm',
        '🫀 CoQ10 (200mg): Cardiac mitochondrial energy & stroke volume efficiency'
      ],
      tcmOccupationalDirectives: [
        '☯️ Strengthen Lower Back & Tendons: Acupressure on BL-40 Weizhong & KI-3 Taixi',
        '🍵 Niu Xi (Achyranthes) & Astragalus Decoction: Direct Qi to feet & strengthen tendon matrix'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Foot & Calf Abhyanga with Ksheerabala Oil: Soothe plantar fascia & Achilles tendon strain',
        '🌿 Ashwagandha & Bala Rasayana: Rebuild muscular Ojas & strengthen connective tissue'
      ],
      arboristEcologicalDirectives: [
        '🌳 Soft Dirt Trail & Conifer Needle Grounding: Running on shock-absorbing forest floor biomass'
      ],
      vocalResonanceProtocol: '🎵 Marathon Finish-Line Choir Glee: Harmonic group vocalization post-race to flush lactic acid, elevate oxytocin (+150%), and induce deep parasympathetic recovery'
    },
    '27-2031': {
      socCode: '27-2031',
      snomedCode: '412089004',
      snomedDisplay: 'Metatarsal stress reaction and flexor hallucis longus tendonitis (disorder)',
      professionTitle: 'Dancers, Ballerinas & Choreographers',
      category: 'Arts, Media & Entertainment',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 9.5,
      circadianDisruptionScore: 7.2,
      chemicalExposureScore: 1.0,
      allostaticBurnoutScore: 8.8,
      actuarialQalyImpact: 2.8,
      oshaMitigationDirectives: [
        'DIN 18032-2 Sprung Dance Floor: Mandatory sprung subfloor absorption to mitigate vertical landing impact',
        'Ballet Pointe Shoe Pressure Relief: Micro-break padding & metatarsal pressure relief protocol for en pointe work',
        'Achilles Tendon Thermal Reset: Active thermal warming & compression post-rehearsal to prevent tendonitis'
      ],
      therapeuticHobbies: [
        '🏊 Zero-Impact Hydrotherapy & Swimming: Joint unloading & buoyant spinal decompression',
        '🏺 Hand-Built Pottery & Clay Sculpting: Mindful 3D tactile form creation',
        '🌿 Organic Flower Gardening: Outdoor soil grounding & gentle movement',
        '🎻 Classical Chamber Music Listening: Auditory artistic inspiration without physical strain'
      ],
      precisionOccupationalNutrition: [
        '🦴 Hydrolyzed Collagen Peptides (15g) + Vit C (1000mg): Achilles tendon & ligament elasticity',
        '🦴 Calcium Citrate (1000mg) + Vit D3 (5000 IU) + K2 MK-7: Metatarsal bone density protection',
        '⚡ Magnesium Glycinate (400mg): Rehearsal calf spasm & foot cramping prevention'
      ],
      tcmOccupationalDirectives: [
        '☯️ Invigorate Leg Channels & Nourish Liver Blood: Acupressure on GB-34 Yanglingquan & SP-6 Sanyinjiao',
        '🍵 Shao Yao Gan Cao Tang (Peony & Licorice) Tea: Relieve muscle spasms & soften tight tendons'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Foot & Ankle Ksheerabala Abhyanga: Warm herbal oil massage for metatarsals & ankles',
        '🌿 Ashwagandha & Shatavari Rasayana: Deep connective tissue & Dhatu Pushthi nourishment'
      ],
      arboristEcologicalDirectives: [
        '🌳 Soft Meadow Grass Barefoot Walking: Walking barefoot on natural moist grass to decompress foot arches'
      ],
      vocalResonanceProtocol: '🎵 Dance Ensemble Breath & Vocal Resonance: Rhythmic vocalization during rehearsals to synchronize breathing, release performance adrenaline, and elevate oxytocin (+150%)'
    },
    '17-1011': {
      socCode: '17-1011',
      snomedCode: '401004000',
      snomedDisplay: 'Computer vision syndrome and drafting cervical spine flexion strain (disorder)',
      professionTitle: 'Architects & Building Designers',
      category: 'Architecture & Engineering',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 6.8,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 8.2,
      actuarialQalyImpact: -1.9,
      oshaMitigationDirectives: [
        'Drafting Table & CAD Ergonomics: 15-20° inclined CAD drafting board / dual 4K monitor setup to eliminate forward cervical flex',
        'OSHA 1926 Construction Site Safety: Hard hat, high-vis vest, & steel-toe boot compliance during site inspections',
        'Spatial Ideation Visual Divergence: 20-20-20 visual rest rule during 3D BIM modeling'
      ],
      therapeuticHobbies: [
        '🏺 Hand-Built Architectural Pottery & Ceramics: Tactile 3D form creation',
        '📐 Physical Origami & Paper Geometry: Mindful non-digital geometric folding',
        '🥾 Outdoor Architectural Nature Sketching: Natural daylight & urban landscape focus'
      ],
      precisionOccupationalNutrition: [
        '👁️ Lutein (20mg) + Zeaxanthin (4mg): Macular blue-light filtration during BIM modeling',
        '🦴 Hydrolyzed Collagen Peptides (10g): Cervical spine disc hydration & joint comfort',
        '🧠 L-Theanine (200mg): Calm focus for complex spatial design charrettes'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Liver Blood & Brighten Vision: Acupressure on GB-20 Fengchi & BL-2 Zanzhu',
        '🍵 Goji Berry & Chrysanthemum Tea: Clear drafting screen heat & nourish Liver Yin'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Netra Tarpana with Triphala Ghee: Cool optic nerve dryness after CAD drafting',
        '🌿 Sandalwood Facial Mist: Cool facial Pitta after long monitor sessions'
      ],
      arboristEcologicalDirectives: [
        '🌳 Natural Timber Structure & Forest Canopy Inspiration: Observing structural bio-mimicry in tree trunks & branches'
      ],
      vocalResonanceProtocol: '🎵 Architectural Studio Choral Resonance: Ensemble 432 Hz vocal humming during design charrettes to foster collaborative spatial flow'
    },
    '17-2051': {
      socCode: '17-2051',
      snomedCode: '702859005',
      snomedDisplay: 'Field site acoustic noise and structural particulate hazard exposure (finding)',
      professionTitle: 'Civil, Structural & Mechanical Engineers',
      category: 'Architecture & Engineering',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.5,
      circadianDisruptionScore: 6.5,
      chemicalExposureScore: 5.5,
      allostaticBurnoutScore: 8.0,
      actuarialQalyImpact: -2.4,
      oshaMitigationDirectives: [
        'OSHA 1926 Construction Site PPE: High-decibel ear defenders near heavy machinery & N95 dust protection',
        'FEA / Structural Analysis Ergonomics: Pomodoro visual divergence breaks during Finite Element Analysis',
        'Bridge & Infrastructure Scaffolding Safety: 100% fall protection tie-off during structural inspections'
      ],
      therapeuticHobbies: [
        '🧗 Outdoor Rock Climbing: Structural balance, physical mechanics, & anchor safety',
        '🚣 Kayaking & Rowing: Upper body conditioning & water stewardship',
        '♟️ Physical Chess & Mechanical Clockwork Repair: Tactile mechanical engineering focus'
      ],
      precisionOccupationalNutrition: [
        '🫁 N-Acetyl Cysteine (NAC 1200mg) + Vit C (1000mg): Field site dust & diesel exhaust detox',
        '🦴 Hydrolyzed Collagen Peptides (10g): Joint & ligament resilience',
        '🧠 Alpha-GPC (300mg): Acetylcholine synthesis for complex structural calculations'
      ],
      tcmOccupationalDirectives: [
        '☯️ Fortify Spleen Qi & Relax Sinews: Acupressure on ST-36 Zusanli & GB-34 Yanglingquan',
        '🍵 Huang Qi (Astragalus) & Ginseng Tea: Build protective Wei Qi for field site inspections'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Warm Mahanarayana Shoulder & Back Oil Massage: Relieve field site fatigue',
        '🌿 Ashwagandha Rasayana: Rebuild Ojas & sustain physical/mental endurance'
      ],
      arboristEcologicalDirectives: [
        '🌳 Old-Growth Bridge Canopy Immersion: Studying natural root-and-canopy structural load distribution'
      ],
      vocalResonanceProtocol: '🎵 Field Engineering Crew Rhythmic Vocalization: Upbeat group vocalization post-site inspection to de-escalate environmental stress'
    },
    '11-1021-POLY': {
      socCode: '11-1021-POLY',
      snomedCode: '417893002',
      snomedDisplay: 'Work-related cognitive hyper-synthesis and multi-domain context switching overload disorder (disorder)',
      professionTitle: 'Polymaths, Renaissance Scholars & Interdisciplinary Synthesizers',
      category: 'Life Stage & Career Transition',
      oshaRiskLevel: 'Elevated',
      ergonomicStrainScore: 6.8,
      circadianDisruptionScore: 7.8,
      chemicalExposureScore: 1.5,
      allostaticBurnoutScore: 8.9,
      actuarialQalyImpact: 4.2,
      oshaMitigationDirectives: [
        'Cognitive Context-Switching Buffer: Mandatory 30-min cognitive reset window between disparate field transitions (e.g. math to art)',
        'Hyper-Ideation Sleep Ceiling: 100% blue-blocker & non-digital wind-down 90 mins prior to sleep to quiet cross-domain neural loops',
        'Multi-Modal Ergonomic Station: Alternating sit-stand-lounge workstation for diverse intellectual tasks'
      ],
      therapeuticHobbies: [
        '🎻 Multimodal Musical Improvisation: Spontaneous multi-tonal creative expression',
        '🌿 Permaculture & Bio-Dome Ecosystem Design: Complex natural system modeling & hands-on soil grounding',
        '♟️ Physical Multi-Dimensional Chess: Complex spatial strategy without screen fatigue',
        '📜 Ancient Script & Polyglot Calligraphy: Tactile language synthesis & fine motor meditation'
      ],
      precisionOccupationalNutrition: [
        '🧠 Alpha-GPC (300mg) + Bacopa Monnieri (300mg): Interdisciplinary memory synthesis & neural plasticity',
        '🧠 Magnesium L-Threonate (144mg): Sleep onset after multi-domain breakthrough ideation loops',
        '🫀 High-DHA Omega-3 (2000mg): Neuronal membrane fluidity for complex cross-field synthesis'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Heart Blood & Anchor Universal Shen: Acupressure on HT-7 Shenmen & DU-20 Baihui',
        '🍵 Tian Wang Bu Xin Dan & Wild Ginseng Decoction: Settle racing spirit & fortify primordial Qi'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Medhya Rasayana (Brahmi, Shankhpushpi, Jyotishmati): Rebuild Ojas & sustain multi-disciplinary clarity',
        '🌿 Warm Sesame Oil Head Massage (Shirodhara): Calm hyper-active Vata mental loops'
      ],
      arboristEcologicalDirectives: [
        '🌳 Mixed Botanical Bio-Dome & Forest Edge Immersion: Observing edge-effect biodiversity where two distinct ecosystems meet'
      ],
      vocalResonanceProtocol: '🎵 Polyphonic Renaissance Choral Glee: Multi-part polyphonic singing (432 Hz) to synchronize bilateral hemisphere integration and induce 8-12 Hz Alpha brainwave harmony'
    },
    '37-3011': {
      socCode: '37-3011',
      snomedCode: '702859005',
      snomedDisplay: 'Pesticide herbicide chemical exposure and outdoor UV heat strain (finding)',
      professionTitle: 'Gardeners, Landscapers & Groundskeepers',
      category: 'Agriculture & Natural Resources',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.5,
      circadianDisruptionScore: 5.5,
      chemicalExposureScore: 6.8,
      allostaticBurnoutScore: 6.5,
      actuarialQalyImpact: 2.5,
      oshaMitigationDirectives: [
        'OSHA 1910.132 PPE for Pesticides & Trimmers: Organic vapor respirator, safety goggles, & cut-resistant chaps during power equipment use',
        'Solar UV & Heat Stress Mitigation: Wide-brim hat, broad-spectrum mineral sunscreen (SPF 50+), & hourly electrolyte hydration breaks',
        'Vibrational Tool Micro-Break: Anti-vibration gloves during mower/weed-trimmer operation to prevent Raynaud vibration syndrome'
      ],
      therapeuticHobbies: [
        '🐝 Apiculture & Honeybee Conservation: Mindful hive care & natural ecosystem support',
        '🌾 Heirloom Seed Preservation & Rare Botany: Botanical genetics cultivation & seed saving',
        '🎨 Botanical Watercolors: Detailed plant study & soft visual expression'
      ],
      precisionOccupationalNutrition: [
        '🫁 N-Acetyl Cysteine (NAC 1200mg) + Vit C (1000mg): Herbicide/pesticide hepatic detox',
        '☀️ Vit D3 (2000 IU) + K2 (100mcg): Balanced outdoor sun exposure management',
        '💧 Deep Sea Electrolyte Fluid: Replenishing sweat loss during outdoor summer maintenance'
      ],
      tcmOccupationalDirectives: [
        '☯️ Expel Damp-Heat & Strengthen Spleen Qi: Acupressure on SP-9 Yinlingquan & ST-36 Zusanli',
        '🍵 Green Tea & Barley Water Decoction: Clear summer heat & drain lower limb dampness'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Foot & Hand Abhyanga with Ksheerabala Oil: Soothe outdoor manual labor strain',
        '🌿 Coriander & Fennel Cooling Tea: Neutralize Pitta heat after summer gardening shifts'
      ],
      arboristEcologicalDirectives: [
        '🌳 Arboretum Canopy Stewardship: Direct biological connection with diverse botanical species'
      ],
      vocalResonanceProtocol: '🎵 Landscaper Outdoor Folk Glee: Rhythmic outdoor singing and whistle entrainment to maintain physical pace and boost diaphragmatic air exchange'
    },
    '37-2011': {
      socCode: '37-2011',
      snomedCode: '412089004',
      snomedDisplay: 'Repetitive facility maintenance lumbar strain and chemical exposure (disorder)',
      professionTitle: 'Caretakers, Property Custodians & Estate Guardians',
      category: 'Hospitality, Childcare & Service',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 8.2,
      circadianDisruptionScore: 6.0,
      chemicalExposureScore: 4.5,
      allostaticBurnoutScore: 7.2,
      actuarialQalyImpact: 1.8,
      oshaMitigationDirectives: [
        'OSHA 1910.1200 HazCom Cleaning Chemical PPE: Nitrile gloves & eye protection during commercial disinfectant application',
        'Ladder & Scaffolding Fall Safety: 3-point contact rule during estate gutter & roof maintenance',
        'Ergonomic Machinery Handling: Squat-pivot lifting & mechanical dolly use for heavy property equipment'
      ],
      therapeuticHobbies: [
        '🪵 Traditional Woodworking & Furniture Restoration: Tactile crafting & timber repair',
        '🧩 Mechanical Locksmithing & Puzzle Solving: Precision mechanical problem solving',
        '🥾 Solitary Forest Trail Walking: Quiet outdoor nature disconnect'
      ],
      precisionOccupationalNutrition: [
        '🦴 Hydrolyzed Collagen Peptides (10g) + Vit C (1000mg): Lumbar disc & joint protection',
        '⚡ Magnesium Glycinate (400mg): Lumbar muscle relaxation & overnight cramp prevention',
        '🧠 L-Theanine (200mg): Calm focus during solo estate maintenance'
      ],
      tcmOccupationalDirectives: [
        '☯️ Relax Sinews & Invigorate Blood: Acupressure on GB-34 Yanglingquan & BL-40 Weizhong',
        '🍵 Du Huo Ji Sheng Tang Tea: Expel Cold-Damp from lower back & knees'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Mahanarayana Lumbar Oil Massage: Warm herbal oil massage for lower back strain',
        '🌿 Ginger & Ashwagandha Tea: Warm internal channels post-maintenance shift'
      ],
      arboristEcologicalDirectives: [
        '🌳 Historic Estate Garden Grounding: Walking among mature estate shade trees'
      ],
      vocalResonanceProtocol: '🎵 Custodial Crew Work Song Glee: Upbeat group vocalization to boost work cadence and release physical maintenance fatigue'
    },
    '55-1011-ASTRO': {
      socCode: '55-1011-ASTRO',
      snomedCode: '410526002',
      snomedDisplay: 'Microgravity cephalad fluid-shift ocular syndrome and trabecular spaceflight osteopenia (disorder)',
      professionTitle: 'Commercial & Orbital Spaceflight Astronauts',
      category: 'Sovereignty & Traditional Guardianship',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 7.2,
      circadianDisruptionScore: 9.2,
      chemicalExposureScore: 4.0,
      allostaticBurnoutScore: 8.5,
      actuarialQalyImpact: 1.8,
      oshaMitigationDirectives: [
        'NASA / Spaceflight Ergonomics: 2.5-hour daily ARED resistive loading & cycle ergometer with vibration isolation',
        'Cephalad Fluid Shift & SANS Mitigation: Lower body negative pressure (LBNP) therapy during sleep',
        'Cosmic Radiation Protection: Passive shielding monitoring & high-solitary solar particle event shelter protocol'
      ],
      therapeuticHobbies: [
        '📷 Astronomical Astrophotography & Sky Observation: Cosmic observation & deep-space imaging',
        '🌱 Zero-G Hydroponic Botany: Closed-loop plant cultivation & micro-green gardening',
        '♟️ 3D Orbital Spatial Chess: Multidimensional mental geometry exercise'
      ],
      precisionOccupationalNutrition: [
        '🦴 Vit K2 (MK-7 100mcg) + Vit D3 (4000 IU) + Calcium Citrate: Trabecular bone mineral preservation',
        '👁️ Astaxanthin (12mg) + Lutein (20mg): Retinal & optic nerve protection against SANS & cosmic rays',
        '🫀 Molecular Hydrogen Water + CoQ10 (200mg): Cosmic radiation ROS scavenging'
      ],
      tcmOccupationalDirectives: [
        '☯️ Anchor Upward Rising Qi & Nourish Kidney Essence: Acupressure on KI-1 Yongquan & DU-20 Baihui',
        '🍵 Tian Wang Bu Xin Dan & Lingzhi (Reishi) Decoction: Settle Shen & calm orbital hyper-alertness'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Shiroabhyanga with Warm Brahmi Oil: Relieve cranial fluid pressure & nourish nervous system',
        '🌿 Ashwagandha & Shilajit Rasayana: Rebuild Ojas & sustain physical bone/muscle density'
      ],
      arboristEcologicalDirectives: [
        '🌳 Orbital Earth Canopy Viewing (Overview Effect): Deep emotional reverence observing Earth forest biomes from orbit'
      ],
      vocalResonanceProtocol: '🎵 Zero-G Orbital Resonant Vocal Sweep: Low-frequency vocal sweeps (128 Hz) to relieve intracranial venous congestion caused by microgravity fluid shifts'
    },
    '55-1011-AQUA': {
      socCode: '55-1011-AQUA',
      snomedCode: '412089004',
      snomedDisplay: 'Dysbaric osteonecrosis and saturation decompression stress syndrome (disorder)',
      professionTitle: 'Deep-Sea Aquanauts & Commercial Saturation Divers',
      category: 'Agriculture & Natural Resources',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 9.0,
      circadianDisruptionScore: 8.0,
      chemicalExposureScore: 6.0,
      allostaticBurnoutScore: 8.2,
      actuarialQalyImpact: -2.4,
      oshaMitigationDirectives: [
        'OSHA 1910.424 Commercial Saturation Diving PPE: Mandatory chamber decompression tables & Trimix gas auditing',
        'High-Pressure Nervous Syndrome (HPNS) Protocol: Slow compression rates & Heliox gas density optimization',
        'Hyperbaric Chamber Thermal Management: Active hot-water suit flushing & continuous core temp monitoring'
      ],
      therapeuticHobbies: [
        '🤿 Freediving & Static Apnea Breathing: Breath-hold awareness & parasympathetic heart rate lowering',
        '📸 Underwater Macro Photography: Marine ecosystem exploration',
        '⛵ Coastal Sailing & Navigation: Wind-powered surface navigation'
      ],
      precisionOccupationalNutrition: [
        '🫀 Alpha-Lipoic Acid (ALA 600mg) + CoQ10 (200mg): Endothelial cell protection under hyperbaric hyperoxia',
        '🧠 Magnesium Bisglycinate (400mg): HPNS neuromuscular tremor reduction & GABA activation',
        '🦴 Vitamin K2 (100mcg) + Collagen Peptides (10g): Prevention of dysbaric osteonecrosis'
      ],
      tcmOccupationalDirectives: [
        '☯️ Warm Kidney Yang & Dispel Cold-Damp: Acupressure on CV-4 Guanyuan & BL-23 Shenshu',
        '🍵 Cinnamon & Dried Ginger Herbal Decoction: Expel deep aquatic cold & warm blood vessels'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Post-Dive Sesame Oil Abhyanga: Expel Vata aggravation caused by pressure changes & cold Heliox',
        '🌿 Dashamoola & Pippali Decoction: Strengthen respiratory channels & warm deep tissues'
      ],
      arboristEcologicalDirectives: [
        '🌳 Marine Kelp Forest & Mangrove Sanctuary Exploration: Connection with underwater coastal forest biomes'
      ],
      vocalResonanceProtocol: '🎵 Heliox Acoustic Pitch Correction & Deep Vagal Glee: Diaphragmatic chest humming to restore vocal fold neuromuscular tone after prolonged compressed Heliox speech'
    },
    '27-2021-ALPINE': {
      socCode: '27-2021-ALPINE',
      snomedCode: '417893002',
      snomedDisplay: 'High-altitude hypobaric hypoxia and pulmonary cerebral edema risk syndrome (finding)',
      professionTitle: 'High-Altitude Alpine Mountaineers & Expedition Sherpas',
      category: 'Athletics & Professional Sports',
      oshaRiskLevel: 'High',
      ergonomicStrainScore: 8.8,
      circadianDisruptionScore: 7.2,
      chemicalExposureScore: 2.0,
      allostaticBurnoutScore: 7.5,
      actuarialQalyImpact: 2.1,
      oshaMitigationDirectives: [
        'UIAA High Altitude Acclimatization Ascent Profile: Max 300-500m daily sleep elevation gain above 3000m',
        'Hypobaric Hypoxia Monitoring: Continuous pulse oximetry (SpO2 target >80%) & Gamow bag availability',
        'Glacial UV & Avalanche PPE: Category 4 glacier glasses, avalanche transceiver, probe, & airbag pack'
      ],
      therapeuticHobbies: [
        '🏔️ High-Pass Trail Running & Fastpacking: Alpine cardiovascular endurance',
        '🧘 Himalayan Meditation & Breathwork: High-altitude mental stillness',
        '🪵 Traditional Alpine Wood Carving: Tactile indoor focus during storm days'
      ],
      precisionOccupationalNutrition: [
        '🫀 Inorganic Nitrate / Beetroot Extract (500mg): Nitric oxide elevation for hypobaric tissue oxygenation',
        '🌿 Rhodiola Rosea (300mg): Altitude hypoxia adaptation & stamina enrichment',
        '🩸 Iron Bisglycinate (25mg) + Vit C (500mg): Sustained erythropoiesis & hemoglobin synthesis'
      ],
      tcmOccupationalDirectives: [
        '☯️ Tonify Lung & Kidney Qi: Acupressure on LU-9 Taiyuan & KI-3 Taixi for altitude endurance',
        '🍵 Cordyceps Sinensis (Dong Chong Xia Cao) Decoction: Enhance lung oxygen utilization & kidney Jing'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Shilajit & Ashwagandha Rasayana: Premier high-altitude mineral & physical endurance tonic',
        '🌿 Warm Ghee & Cardamom Milk: Soothe high-altitude dry airway & calm Vata'
      ],
      arboristEcologicalDirectives: [
        '🌳 High-Alpine Larch & Bristlecone Pine Immersion: Resilience wisdom from ancient high-elevation trees'
      ],
      vocalResonanceProtocol: '🎵 Hypobaric Diaphragmatic Breath Chant: Rhythmic alpine chanting (0.1 Hz) to optimize ventilation-perfusion matching and prevent HAPE'
    },
    '51-8011': {
      socCode: '51-8011',
      snomedCode: '412089004',
      snomedDisplay: 'Ionizing radiation vigilance and hyper-attentional control overload (disorder)',
      professionTitle: 'Nuclear Power Reactor Operators & Health Physicists',
      category: 'Corporate & Technology',
      oshaRiskLevel: 'Moderate',
      ergonomicStrainScore: 4.2,
      circadianDisruptionScore: 7.0,
      chemicalExposureScore: 3.5,
      allostaticBurnoutScore: 7.4,
      actuarialQalyImpact: 1.2,
      oshaMitigationDirectives: [
        'OSHA / NRC 10 CFR 20 Radiation Safety PPE: TLD dosimeter badge tracking & ALARA (As Low As Reasonably Achievable) protocol',
        'SCADA Control Console Ergonomics: Minimum 14pt typography on alarm displays & ergonomic control seating',
        'Vigilance Rotation Shift Schedule: Mandatory 45-min console rotation & Pomodoro cognitive reset breaks'
      ],
      therapeuticHobbies: [
        '🎻 Classical Violin or Cello Playing: Auditory precision & acoustic relaxation',
        '🌱 Indoor Bonsai Cultivation: Patient, long-term meticulous plant shaping',
        '📷 Film Photography & Darkroom Developing: Analog chemistry & visual art'
      ],
      precisionOccupationalNutrition: [
        '🛡️ Potassium Iodide (130mg emergency backup) + Spirulina (3000mg): Thyroid radioprotection',
        '🧠 N-Acetyl Cysteine (NAC 1200mg) + Reduced Glutathione (500mg): Radiation ROS DNA repair support',
        '🌿 L-Theanine (200mg) + Magnesium Taurate (200mg): Sustained attentional focus without jitter'
      ],
      tcmOccupationalDirectives: [
        '☯️ Nourish Yin & Clear Deficiency Fire: Acupressure on KI-6 Zhaohai & HT-7 Shenmen for alarm stress',
        '🍵 Ophiopogon & Rehmannia (Mai Men Dong) Tea: Protect body fluids from dry control room air'
      ],
      ayurvedicOccupationalDirectives: [
        '🧘 Brahmi & Shankhpushpi Syrup: Sustained cognitive vigilance & mental stress reduction',
        '🌿 Rose Water Eye Drops: Soothe screen fatigue from multi-monitor SCADA displays'
      ],
      arboristEcologicalDirectives: [
        '🌳 Evergreen Pine Grove Immersion: Absorbing natural phytoncides to balance synthetic control rooms'
      ],
      vocalResonanceProtocol: '🎵 Control Room Auditory De-escalation Humming: Low-pitch 432 Hz vocal humming during shift handovers to clear cognitive fatigue'
    },
  };

  /**
   * Resolves occupational hazard profile by BLS SOC code or occupation search text.
   */
  public getOccupationalProfile(occupationOrSocCode?: string): IOccupationalHazardProfile {
    if (!occupationOrSocCode) {
      return this.occupationalDatabase['15-1252']; // Default tech baseline
    }

    const cleaned = occupationOrSocCode.trim().toLowerCase();
    if (this.occupationalDatabase[cleaned]) {
      return this.occupationalDatabase[cleaned];
    }

    if (cleaned.includes('data scientist') || cleaned.includes('machine learning') || cleaned.includes('ai engineer') || cleaned.includes('statistician')) {
      return this.occupationalDatabase['15-2051'];
    }
    if (cleaned.includes('banker') || cleaned.includes('financial analyst') || cleaned.includes('finance') || cleaned.includes('trader') || cleaned.includes('investment')) {
      return this.occupationalDatabase['13-1031'];
    }
    if (cleaned.includes('student') || cleaned.includes('undergrad') || cleaned.includes('graduate student') || cleaned.includes('phd student')) {
      return this.occupationalDatabase['25-0000-S'];
    }
    if (cleaned.includes('professor') || cleaned.includes('academic') || cleaned.includes('lecturer') || cleaned.includes('faculty') || cleaned.includes('teacher')) {
      return this.occupationalDatabase['25-1099'];
    }

    if (cleaned.includes('graphic') || cleaned.includes('designer') || cleaned.includes('ui/ux')) {
      return this.occupationalDatabase['27-1024'];
    }
    if (cleaned.includes('desktop publisher') || cleaned.includes('publisher') || cleaned.includes('layout')) {
      return this.occupationalDatabase['43-9031'];
    }
    if (cleaned.includes('art director') || cleaned.includes('creative director')) {
      return this.occupationalDatabase['27-1011'];
    }
    if (cleaned.includes('event') || cleaned.includes('planner') || cleaned.includes('convention')) {
      return this.occupationalDatabase['13-1121'];
    }
    if (cleaned.includes('chef') || cleaned.includes('cook') || cleaned.includes('kitchen')) {
      return this.occupationalDatabase['35-1011'];
    }
    if (cleaned.includes('customer service') || cleaned.includes('agent') || cleaned.includes('support') || cleaned.includes('call center')) {
      return this.occupationalDatabase['43-4051'];
    }
    if (cleaned.includes('computer scientist') || cleaned.includes('researcher')) {
      return this.occupationalDatabase['15-1221'];
    }
    if (cleaned.includes('public safety') || cleaned.includes('police') || cleaned.includes('firefighter') || cleaned.includes('ems') || cleaned.includes('sheriff')) {
      return this.occupationalDatabase['33-3051'];
    }
    if (cleaned.includes('politician') || cleaned.includes('senator') || cleaned.includes('governor') || cleaned.includes('mayor') || cleaned.includes('legislator')) {
      return this.occupationalDatabase['11-1031'];
    }
    if (cleaned.includes('musician') || cleaned.includes('singer') || cleaned.includes('vocalist') || cleaned.includes('pianist') || cleaned.includes('guitarist')) {
      return this.occupationalDatabase['27-2042'];
    }
    if (cleaned.includes('painter') || cleaned.includes('fine artist') || cleaned.includes('sculptor') || cleaned.includes('illustrator')) {
      return this.occupationalDatabase['27-1013'];
    }
    if (cleaned.includes('news') || cleaned.includes('anchor') || cleaned.includes('journalist') || cleaned.includes('reporter') || cleaned.includes('broadcast')) {
      return this.occupationalDatabase['27-3023'];
    }
    if (cleaned.includes('swimmer') || cleaned.includes('swimming')) {
      return this.occupationalDatabase['27-2021-SWIM'];
    }
    if (cleaned.includes('cyclist') || cleaned.includes('cycling') || cleaned.includes('bicyclist') || cleaned.includes('biking')) {
      return this.occupationalDatabase['27-2021-BIKE'];
    }
    if (cleaned.includes('runner') || cleaned.includes('running') || cleaned.includes('marathoner') || cleaned.includes('triathlete')) {
      return this.occupationalDatabase['27-2021-RUN'];
    }
    if (cleaned.includes('gardener') || cleaned.includes('gardening') || cleaned.includes('landscaper') || cleaned.includes('groundskeeper') || cleaned.includes('horticulturist')) {
      return this.occupationalDatabase['37-3011'];
    }
    if (cleaned.includes('caretaker') || cleaned.includes('custodian') || cleaned.includes('janitor') || cleaned.includes('estate guardian') || cleaned.includes('facility manager')) {
      return this.occupationalDatabase['37-2011'];
    }
    if (cleaned.includes('polymath') || cleaned.includes('renaissance scholar') || cleaned.includes('interdisciplinary') || cleaned.includes('generalist') || cleaned.includes('universal genius')) {
      return this.occupationalDatabase['11-1021-POLY'];
    }
    if (cleaned.includes('innovator') || cleaned.includes('inventor') || cleaned.includes('founder') || cleaned.includes('r&d')) {
      return this.occupationalDatabase['11-1021-INN'];
    }
    if (cleaned.includes('architect') || cleaned.includes('architecture') || cleaned.includes('building designer')) {
      return this.occupationalDatabase['17-1011'];
    }
    if (cleaned.includes('civil engineer') || cleaned.includes('structural engineer') || cleaned.includes('mechanical engineer') || cleaned.includes('engineer')) {
      return this.occupationalDatabase['17-2051'];
    }
    if (cleaned.includes('dancer') || cleaned.includes('ballet') || cleaned.includes('ballerina') || cleaned.includes('choreographer') || cleaned.includes('dance')) {
      return this.occupationalDatabase['27-2031'];
    }
    if (cleaned.includes('librarian') || cleaned.includes('library') || cleaned.includes('archivist')) {
      return this.occupationalDatabase['25-4022'];
    }
    if (cleaned.includes('travel nurse') || cleaned.includes('contract nurse')) {
      return this.occupationalDatabase['29-1141-T'];
    }
    if (cleaned.includes('doctor') || cleaned.includes('physician') || cleaned.includes('surgeon') || cleaned.includes('md') || cleaned.includes('do')) {
      return this.occupationalDatabase['29-1215'];
    }
    if (cleaned.includes('astronaut') || cleaned.includes('spaceflight') || cleaned.includes('cosmonaut') || cleaned.includes('orbital') || cleaned.includes('space')) {
      return this.occupationalDatabase['55-1011-ASTRO'] || this.occupationalDatabase['19-2011-NASA'];
    }
    if (cleaned.includes('aquanaut') || cleaned.includes('saturation diver') || cleaned.includes('deep sea') || cleaned.includes('hyperbaric diver') || cleaned.includes('diver')) {
      return this.occupationalDatabase['55-1011-AQUA'];
    }
    if (cleaned.includes('mountaineer') || cleaned.includes('alpine') || cleaned.includes('sherpa') || cleaned.includes('climber') || cleaned.includes('altitude')) {
      return this.occupationalDatabase['27-2021-ALPINE'];
    }
    if (cleaned.includes('nuclear') || cleaned.includes('reactor') || cleaned.includes('health physicist') || cleaned.includes('atomic')) {
      return this.occupationalDatabase['51-8011'];
    }
    if (/\bactor\b/.test(cleaned) || cleaned.includes('actress') || cleaned.includes('performer') || cleaned.includes('theatre')) {
      return this.occupationalDatabase['27-2011'];
    }
    if (cleaned.includes('pilot') || cleaned.includes('aviator') || cleaned.includes('flight engineer') || cleaned.includes('airline pilot')) {
      return this.occupationalDatabase['53-2011'];
    }
    if (cleaned.includes('photo') || cleaned.includes('photographer') || cleaned.includes('camera')) {
      return this.occupationalDatabase['27-4021'];
    }
    if (cleaned.includes('truck') || cleaned.includes('driver') || cleaned.includes('logistics')) {
      return this.occupationalDatabase['53-3032'];
    }
    if (cleaned.includes('nurse') || cleaned.includes('er nurse') || cleaned.includes('emergency room') || cleaned.includes('hospital') || cleaned.includes('first responder')) {
      return this.occupationalDatabase['29-1141'];
    }
    if (cleaned.includes('construct') || cleaned.includes('trade') || cleaned.includes('carpenter') || cleaned.includes('builder')) {
      return this.occupationalDatabase['47-2061'];
    }
    if (cleaned.includes('retire') || cleaned.includes('sabbatical') || cleaned.includes('pension')) {
      return this.occupationalDatabase['99-9999-RET'];
    }
    if (cleaned.includes('career change') || cleaned.includes('pivot') || cleaned.includes('reskilling') || cleaned.includes('retraining') || cleaned.includes('transition')) {
      return this.occupationalDatabase['99-9999-PIV'];
    }
    if (cleaned.includes('lawyer') || cleaned.includes('attorney') || cleaned.includes('counsel') || cleaned.includes('prosecutor') || cleaned.includes('litigation')) {
      return this.occupationalDatabase['23-1011'];
    }
    if (cleaned.includes('tribal chief') || cleaned.includes('sachem') || cleaned.includes('sagamore') || cleaned.includes('indigenous leader') || cleaned.includes('chief')) {
      return this.occupationalDatabase['11-1011-CHIEF'];
    }
    if (cleaned.includes('king') || cleaned.includes('queen') || cleaned.includes('baron') || cleaned.includes('monarch') || cleaned.includes('sovereign') || cleaned.includes('royal') || cleaned.includes('prince') || cleaned.includes('princess') || cleaned.includes('duke') || cleaned.includes('duchess') || cleaned.includes('heir')) {
      return this.occupationalDatabase['11-1011-ROYAL'];
    }
    if (cleaned.includes('babysitter') || cleaned.includes('nanny') || cleaned.includes('childcare') || cleaned.includes('daycare')) {
      return this.occupationalDatabase['39-9011'];
    }
    if (cleaned.includes('fast food') || cleaned.includes('burger') || cleaned.includes('fryer') || cleaned.includes('counter worker')) {
      return this.occupationalDatabase['35-3023'];
    }
    if (cleaned.includes('stocker') || cleaned.includes('grocery') || cleaned.includes('shelf') || cleaned.includes('order filler')) {
      return this.occupationalDatabase['53-7065'];
    }
    if (cleaned.includes('pastor') || cleaned.includes('clergy') || cleaned.includes('nun') || cleaned.includes('monk') || cleaned.includes('priest') || cleaned.includes('rabbi') || cleaned.includes('imam') || cleaned.includes('minister')) {
      return this.occupationalDatabase['21-2011'];
    }
    if (cleaned.includes('farm') || cleaned.includes('agri') || cleaned.includes('crop')) {
      return this.occupationalDatabase['45-2092'];
    }
    if (cleaned.includes('naturalist') || cleaned.includes('biologist') || cleaned.includes('evolution') || cleaned.includes('geologist') || cleaned.includes('botanist') || cleaned.includes('zoologist') || cleaned.includes('darwin')) {
      return this.occupationalDatabase['19-1029'];
    }

    return this.occupationalDatabase['15-1252'];
  }

  /**
   * Resolves personalized occupational profile with dynamic nutrition dosage adjustments
   * based on patient vitals, medications, SDOH score, and active symptoms.
   */
  public getPersonalizedOccupationalProfile(
    occupationOrSocCode?: string,
    vitals?: { hr?: string; spO2?: string; bp?: string },
    medications: string[] = [],
    sdohScore: number = 75
  ): IOccupationalHazardProfile {
    const baseProfile = this.getOccupationalProfile(occupationOrSocCode);
    const hrVal = parseFloat(vitals?.hr || '72');
    const spO2Val = parseFloat(vitals?.spO2 || '98');
    const sysBp = parseFloat((vitals?.bp || '120/80').split('/')[0] || '120');

    // Clone array so baseline template remains immutable
    const personalizedNutrition = [...baseProfile.precisionOccupationalNutrition];
    const personalizedTcm = [...baseProfile.tcmOccupationalDirectives];

    // 1. Cardiovascular / Autonomic Hyper-arousal Adaptation (HR > 80 or Sys BP > 130)
    if (hrVal > 80 || sysBp > 130) {
      const existingMgIndex = personalizedNutrition.findIndex(n => n.includes('Magnesium'));
      if (existingMgIndex >= 0) {
        personalizedNutrition[existingMgIndex] = '⚡ Magnesium L-Threonate (144mg–200mg elemental Mg): Scaled for elevated heart rate & autonomic calm';
      } else {
        personalizedNutrition.push('⚡ Magnesium L-Threonate (144mg elemental Mg): Upregulated for autonomic sympathetic reduction');
      }
      personalizedNutrition.push('🌿 L-Theanine (200mg–400mg): Downregulates central sympathetic overdrive & lowers resting pulse');
    }

    // 2. Hypoxia / Low Oxygen Saturation Adaptation (SpO2 < 95%)
    if (spO2Val < 95) {
      personalizedNutrition.unshift('🫀 Inorganic Nitrate / Beetroot Extract (500mg): Nitric oxide elevation for tissue hypoxia (SpO2 < 95%)');
      personalizedNutrition.push('🌿 Rhodiola Rosea (300mg): Altitude/hypoxia cellular adaptation & stamina enrichment');
    }

    // 3. Anticoagulant & Antiplatelet Safety Guardrail
    const isAnticoagulated = medications.some(m => {
      const lower = m.toLowerCase();
      return lower.includes('warfarin') || lower.includes('coumadin') || lower.includes('eliquis') || lower.includes('xarelto') || lower.includes('plavix') || lower.includes('aspirin');
    });

    if (isAnticoagulated) {
      personalizedNutrition.forEach((n, idx) => {
        if (n.includes('Omega-3') || n.includes('DHA') || n.includes('Fish Oil')) {
          personalizedNutrition[idx] = '⚠️ Safety Guardrail: High-DHA Omega-3 capped at <=1000mg daily due to concomitant anticoagulant therapy';
        }
      });
    }

    // 4. Low SDOH & Allostatic Burnout Adaptation (SDOH < 60)
    if (sdohScore < 60 || baseProfile.allostaticBurnoutScore >= 8.0) {
      const existingBacopa = personalizedNutrition.some(n => n.includes('Bacopa'));
      if (!existingBacopa) {
        personalizedNutrition.push('🧠 Bacopa Monnieri (300mg 55% Bacosides): Standardized working memory & fatigue resilience');
      }
    }

    return {
      ...baseProfile,
      precisionOccupationalNutrition: personalizedNutrition,
      tcmOccupationalDirectives: personalizedTcm
    };
  }

  /**
   * Calculates Gompertz-Makeham hazard rate curve parameters, OSHA occupational impact & projected QALY gains.
   * h(t) = alpha * e^(beta * t) + lambda
   */
  public calculateActuarialProfile(
    vitals: { hr?: string; spO2?: string; bp?: string },
    sdohScore: number = 75,
    age: number = 45,
    occupationOrSocCode?: string
  ): IActuarialProfile {
    const hrVal = parseFloat(vitals?.hr || '72');
    const spO2Val = parseFloat(vitals?.spO2 || '98');
    
    // Resolve OSHA occupational profile from BLS SOC classification with dynamic personalization
    const occProfile = this.getPersonalizedOccupationalProfile(occupationOrSocCode, vitals, [], sdohScore);

    // Calculate biological age penalty/bonus based on vitals, SDOH, and OSHA workplace hazards
    let bioAgeDelta = 0;
    if (hrVal < 65) bioAgeDelta -= 2.0;
    else if (hrVal > 80) bioAgeDelta += 2.5;

    if (spO2Val >= 98) bioAgeDelta -= 1.5;
    else if (spO2Val < 95) bioAgeDelta += 3.0;

    if (sdohScore > 80) bioAgeDelta -= 2.5;
    else if (sdohScore < 50) bioAgeDelta += 3.5;

    // Apply OSHA workplace hazard impact to biological age
    bioAgeDelta += Math.abs(occProfile.actuarialQalyImpact) * 0.4;

    const biologicalAge = Math.max(18, age + bioAgeDelta);

    // QALY calculation based on hazard reduction & occupational risk
    const qalyGain = parseFloat((Math.abs(bioAgeDelta) * 1.4 + 2.5).toFixed(1));
    const baselineLifeExpectancy = 77.5;
    const projectedLifespan = parseFloat((baselineLifeExpectancy - bioAgeDelta * 0.8).toFixed(1));

    // Gompertz-Makeham hazard model calibration: h(t) = alpha * e^(beta * t) + lambda
    // Standard baseline calibrated to human actuarial tables: alpha ~ 0.00003, beta ~ 0.085, lambda ~ 0.0005
    const baseAlpha = 0.00003;
    const baseBeta = 0.085;
    const baseLambda = 0.0005;

    // Adjust parameters by biological age acceleration and occupational allostatic load
    const accelFactor = Math.max(0.6, 1.0 + (bioAgeDelta * 0.02) + (occProfile.allostaticBurnoutScore * 0.015));
    const gompertzParams: IGompertzMakehamParams = {
      alpha: parseFloat((baseAlpha * accelFactor).toFixed(6)),
      beta: parseFloat((baseBeta * (bioAgeDelta > 0 ? 1.02 : 0.98)).toFixed(4)),
      lambda: parseFloat((baseLambda + (occProfile.chemicalExposureScore * 0.0001)).toFixed(5))
    };

    // Calculate 5-year survival probability using integrated hazard function
    const survivalProbability5Year = this.calculateSurvivalProbability(biologicalAge, 5, gompertzParams);

    return {
      chronologicalAge: age,
      biologicalAge: parseFloat(biologicalAge.toFixed(1)),
      biologicalAgeDelta: parseFloat(bioAgeDelta.toFixed(1)),
      projectedQalyGain: qalyGain,
      baselineLifeExpectancy,
      projectedLifespan,
      survivalProbability5Year,
      gompertzParams,
      occupationalProfile: occProfile,
      hazardReductions: {
        cardiovascular: 0.62,
        metabolic: 0.55,
        neurodegenerative: 0.68,
        oncological: 0.74
      }
    };
  }

  /**
   * Calculates survival probability S(t, t+dt) over a given time horizon using Gompertz-Makeham hazard model:
   * S(dt) = exp( - (alpha/beta) * e^(beta*t) * (e^(beta*dt) - 1) - lambda * dt )
   */
  public calculateSurvivalProbability(
    currentAge: number,
    yearsAhead: number,
    params?: IGompertzMakehamParams
  ): number {
    const alpha = params?.alpha ?? 0.00003;
    const beta = params?.beta ?? 0.085;
    const lambda = params?.lambda ?? 0.0005;

    const integratedGompertzHazard = (alpha / beta) * Math.exp(beta * currentAge) * (Math.exp(beta * yearsAhead) - 1);
    const integratedMakehamHazard = lambda * yearsAhead;
    const totalHazard = integratedGompertzHazard + integratedMakehamHazard;

    const survival = Math.exp(-totalHazard);
    return parseFloat(Math.min(1.0, Math.max(0.0, survival)).toFixed(4));
  }

  /**
   * Generates a multi-point survival curve array from current age up to target max age (default 100).
   */
  public generateLongevityRiskCurve(
    currentAge: number,
    maxAge: number = 100,
    params?: IGompertzMakehamParams
  ): ILongevityRiskPoint[] {
    const points: ILongevityRiskPoint[] = [];
    const baselineParams: IGompertzMakehamParams = { alpha: 0.00003, beta: 0.085, lambda: 0.0005 };

    for (let targetAge = currentAge; targetAge <= maxAge; targetAge += 5) {
      const dt = targetAge - currentAge;
      const baselineSurvival = this.calculateSurvivalProbability(currentAge, dt, baselineParams);
      const personalizedSurvival = this.calculateSurvivalProbability(currentAge, dt, params);

      // Instantaneous hazard rate h(t) per 1,000 person-years
      const alpha = params?.alpha ?? 0.00003;
      const beta = params?.beta ?? 0.085;
      const lambda = params?.lambda ?? 0.0005;
      const hazardRate = parseFloat(((alpha * Math.exp(beta * targetAge) + lambda) * 1000).toFixed(2));

      points.push({
        age: targetAge,
        baselineSurvival,
        personalizedSurvival,
        hazardRate
      });
    }

    return points;
  }
}
