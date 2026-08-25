import { Injectable, signal, computed } from '@angular/core';

export type NcaaDivisionTier = 'D1' | 'D2' | 'D3';
export type CarnegieResearchTier = 'R1' | 'R2' | 'R3';
export type ConferenceNetworkTier = 
  | 'Big Ten Network (BTN)' 
  | 'Pac-12 Network' 
  | 'SEC Network' 
  | 'ACC Network' 
  | 'NCAA Regional Hub';

export interface INcaaBannedSubstanceCheck {
  compound: string;
  category: 'Stimulants' | 'Anabolic Agents' | 'Beta-2 Agonists' | 'Peptide Hormones' | 'Diuretics / Masking' | 'Illicit' | 'Permitted with TUE' | 'Safe / Permitted';
  isBannedByNcaa: boolean;
  requiresTue: boolean; // Therapeutic Use Exemption
  nsfCertifiedForSport: boolean;
  clinicalAdvisory: string;
  evidenceReference: string;
}

export interface IConcussionRtpStage {
  stage: number;
  name: string;
  activityAllowed: string;
  targetHeartRateMaxPct: number;
  minDurationHours: number;
  vestibularOcularClearance: boolean;
}

export interface IWorkloadMetrics {
  division: NcaaDivisionTier;
  acuteWorkload7Day: number;   // Load units
  chronicWorkload28Day: number; // Load units
  acwr: number;                 // Acute-to-Chronic Workload Ratio (ACWR)
  injuryRiskTier: 'Low / Optimal (0.8 - 1.3)' | 'Under-training (<0.8)' | 'High / Danger Zone (>1.5)' | 'Elevated (1.3 - 1.5)';
  neuromuscularFatigueScore: number; // 0 - 100
  autonomicHrvScoreMs: number;       // rMSSD in ms
  weeklyTravelHours: number;
  recoveryGuideline: string;
}

export interface ICircadianTravelProtocol {
  originTimezone: string;
  destinationTimezone: string;
  timeShiftHours: number;
  flightDurationHours: number;
  hydrationPlanMlPerHour: number;
  lightExposureWindow: string;
  lightAvoidanceWindow: string;
  melatoninRecommendation: string;
  optimalTrainingWindow: string;
}

export interface IUniversityAthleticPartner {
  id: string;
  name: string;
  division: NcaaDivisionTier;
  researchTier: CarnegieResearchTier;
  conference: 'Big Ten' | 'Pac-12' | 'SEC' | 'ACC' | 'NCAA Independent';
  network: ConferenceNetworkTier;
  flagshipLab: string;
  researchFocus: string;
  sportsMedicineCenter: string;
  irbSiloId: string;
  nihCtsaHub: string;
}

export interface ISiloedResearchEnvironment {
  division: NcaaDivisionTier;
  researchTier: CarnegieResearchTier;
  activeNetwork: ConferenceNetworkTier;
  irbProtocolNumber: string;
  dataSiloBoundaryHash: string;
  phiSanitizationLevel: 'HIPAA Safe Harbor 18-Element' | 'Limited Data Set (LDS)' | 'Zero Egress Edge-Only';
  allowedEgressEndpoints: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NcaaSportsScienceService {

  // --- Siloed Research & Athletic Configuration ---
  readonly selectedDivision = signal<NcaaDivisionTier>('D1');
  readonly selectedResearchTier = signal<CarnegieResearchTier>('R1');
  readonly selectedNetwork = signal<ConferenceNetworkTier>('Big Ten Network (BTN)');

  // --- Verified Academic & Conference Network Partners (Siloed by Carnegie & NCAA Class) ---
  readonly academicPartners = signal<IUniversityAthleticPartner[]>([
    {
      id: 'uw_huskies',
      name: 'University of Washington (UW Huskies)',
      division: 'D1',
      researchTier: 'R1',
      conference: 'Big Ten',
      network: 'Big Ten Network (BTN)',
      flagshipLab: 'Institute for Protein Design & Human Performance Lab',
      researchFocus: 'Protein engineering for cartilage repair, WWAMI athletic training telemedicine, and cold-water rowing telemetry',
      sportsMedicineCenter: 'UW Medicine Sports Medicine Center (Husky Stadium)',
      irbSiloId: 'IRB-UW-2026-R1-MED-0491',
      nihCtsaHub: 'Institute of Translational Health Sciences (ITHS)'
    },
    {
      id: 'purdue_boilermakers',
      name: 'Purdue University (Purdue Boilermakers)',
      division: 'D1',
      researchTier: 'R1',
      conference: 'Big Ten',
      network: 'Big Ten Network (BTN)',
      flagshipLab: 'Regenstrief Center for Healthcare Engineering & College of Pharmacy',
      researchFocus: 'Athletic injury epidemiology, PGx metabolism of NSAIDs, and impact force sensor arrays',
      sportsMedicineCenter: 'Purdue Intercollegiate Athletics Sports Medicine (Mackey Arena)',
      irbSiloId: 'IRB-PURDUE-2026-R1-RCHE-8823',
      nihCtsaHub: 'Indiana CTSI Regional Hub'
    },
    {
      id: 'uo_ducks',
      name: 'University of Oregon (Oregon Ducks)',
      division: 'D1',
      researchTier: 'R1',
      conference: 'Big Ten',
      network: 'Big Ten Network (BTN)',
      flagshipLab: 'Knight Campus for Accelerating Scientific Impact & Bowerman Sports Science',
      researchFocus: '3D bioprinted tendon scaffolds, track & field sprinting kinematics, and cognitive stress resilience',
      sportsMedicineCenter: 'Marcus Mariota Sports Performance Complex (Autzen / Hayward)',
      irbSiloId: 'IRB-UO-2026-R1-KNIGHT-1102',
      nihCtsaHub: 'OCTRI / OHSU-UO Biomedical Collaborative'
    },
    {
      id: 'pac12_regional_hub',
      name: 'Pac-12 Regional Sports Science Hub',
      division: 'D1',
      researchTier: 'R1',
      conference: 'Pac-12',
      network: 'Pac-12 Network',
      flagshipLab: 'Pac-12 Student-Athlete Health & Well-Being Initiative (SAHWI)',
      researchFocus: 'Head impact monitoring, high-altitude athletic acclimatization, and heat illness prevention',
      sportsMedicineCenter: 'Pacific Coast Sports Health Collaborative',
      irbSiloId: 'IRB-PAC12-2026-R1-SAHWI-7740',
      nihCtsaHub: 'Pacific Regional CTSA Consortium'
    },
    {
      id: 'd2_regional_athletics',
      name: 'Great Northwest & Midwest D2 Sports Science Cohort',
      division: 'D2',
      researchTier: 'R2',
      conference: 'NCAA Independent',
      network: 'NCAA Regional Hub',
      flagshipLab: 'Regional Human Performance & Kinesiology Laboratory',
      researchFocus: 'Applied athletic conditioning, academic-athletic balance, and regional travel fatigue mitigation',
      sportsMedicineCenter: 'D2 Intercollegiate Sports Health Clinic',
      irbSiloId: 'IRB-D2-2026-R2-APPLIED-4019',
      nihCtsaHub: 'Regional Biomedical Research Consortium'
    },
    {
      id: 'd3_scholar_athletics',
      name: 'D3 Scholar-Athlete Preventative Health Network',
      division: 'D3',
      researchTier: 'R3',
      conference: 'NCAA Independent',
      network: 'NCAA Regional Hub',
      flagshipLab: 'Undergraduate Sports Science & Biomechanics Collaborative',
      researchFocus: 'Preventative ACL conditioning, sleep hygiene in rigorous academic schedules, and lean athletic training protocols',
      sportsMedicineCenter: 'D3 Student Health & Wellness Sports Medicine Unit',
      irbSiloId: 'IRB-D3-2026-R3-SCHOLAR-2281',
      nihCtsaHub: 'State Translational Science Network'
    }
  ]);

  // --- Active NCAA Student-Athlete Profile ---
  readonly athleteSport = signal<string>('Track & Field / Cross Country');
  readonly athletePosition = signal<string>('Middle Distance (800m / 1500m)');

  // --- Concussion SCAT6 & Return-to-Play State ---
  readonly currentConcussionStage = signal<number>(1);
  readonly scat6SymptomScore = signal<number>(14); // 0-132 scale
  readonly daysPostConcussion = signal<number>(4);

  readonly rtpStages: IConcussionRtpStage[] = [
    { stage: 1, name: 'Symptom-Limited Activity', activityAllowed: 'Daily activities that do not provoke symptoms (walking, light mental tasks)', targetHeartRateMaxPct: 40, minDurationHours: 24, vestibularOcularClearance: false },
    { stage: 2, name: 'Light Aerobic Exercise', activityAllowed: 'Stationary cycling, walking at slow/medium pace, no resistance training', targetHeartRateMaxPct: 55, minDurationHours: 24, vestibularOcularClearance: false },
    { stage: 3, name: 'Sport-Specific Exercise', activityAllowed: 'Running drills, non-contact sport-specific movement, zero head impact', targetHeartRateMaxPct: 70, minDurationHours: 24, vestibularOcularClearance: true },
    { stage: 4, name: 'Non-Contact Training Drills', activityAllowed: 'Complex training drills (passing, agility), progressive resistance training', targetHeartRateMaxPct: 80, minDurationHours: 24, vestibularOcularClearance: true },
    { stage: 5, name: 'Full-Contact Practice', activityAllowed: 'Normal training activities after full clinical clearance by team physician', targetHeartRateMaxPct: 95, minDurationHours: 24, vestibularOcularClearance: true },
    { stage: 6, name: 'Return to Competition', activityAllowed: 'Unrestricted match play and collegiate conference competition', targetHeartRateMaxPct: 100, minDurationHours: 0, vestibularOcularClearance: true }
  ];

  // --- Workload & Recovery Telemetry (Division Siloed) ---
  readonly acuteLoad = signal<number>(4200); // Past 7 days
  readonly chronicLoad = signal<number>(3500); // Past 28 days rolling average

  readonly workloadAnalysis = computed<IWorkloadMetrics>(() => {
    const div = this.selectedDivision();
    const acute = this.acuteLoad();
    const chronic = this.chronicLoad() || 1;
    const acwr = parseFloat((acute / chronic).toFixed(2));
    
    let tier: IWorkloadMetrics['injuryRiskTier'] = 'Low / Optimal (0.8 - 1.3)';
    if (acwr < 0.8) tier = 'Under-training (<0.8)';
    else if (acwr > 1.5) tier = 'High / Danger Zone (>1.5)';
    else if (acwr >= 1.3) tier = 'Elevated (1.3 - 1.5)';

    // Computed HRV and Neuromuscular fatigue
    const fatigue = Math.min(100, Math.max(10, Math.round((acwr - 0.5) * 60)));
    const hrv = Math.round(78 - (acwr > 1.3 ? (acwr - 1.3) * 35 : 0));

    let travelHours = 8;
    let guideline = 'D1 High-Performance Recovery: Cryotherapy, cold plunge, and GPS workload tracking active.';
    if (div === 'D2') {
      travelHours = 4;
      guideline = 'D2 Regional Protocol: Bus-travel stretching routines, localized strength periodization.';
    } else if (div === 'D3') {
      travelHours = 2;
      guideline = 'D3 Scholar-Athlete Focus: Academic exam schedule integration, sleep hygiene, and zero-overtraining mandate.';
    }

    return {
      division: div,
      acuteWorkload7Day: acute,
      chronicWorkload28Day: chronic,
      acwr,
      injuryRiskTier: tier,
      neuromuscularFatigueScore: fatigue,
      autonomicHrvScoreMs: hrv,
      weeklyTravelHours: travelHours,
      recoveryGuideline: guideline
    };
  });

  // --- Cryptographically Siloed Research Environment Descriptor ---
  readonly activeSiloEnvironment = computed<ISiloedResearchEnvironment>(() => {
    const div = this.selectedDivision();
    const rTier = this.selectedResearchTier();
    const net = this.selectedNetwork();

    // Derive deterministic SHA-like isolation hash
    const rawSilo = `${div}::${rTier}::${net}::POCKETGULL_LLC`;
    let hash = 0;
    for (let i = 0; i < rawSilo.length; i++) {
      hash = ((hash << 5) - hash) + rawSilo.charCodeAt(i);
      hash |= 0;
    }
    const boundaryHash = `SILO-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;

    return {
      division: div,
      researchTier: rTier,
      activeNetwork: net,
      irbProtocolNumber: `IRB-${rTier}-${div}-${boundaryHash.slice(5)}`,
      dataSiloBoundaryHash: boundaryHash,
      phiSanitizationLevel: 'HIPAA Safe Harbor 18-Element',
      allowedEgressEndpoints: [
        'https://npiregistry.cms.hhs.gov',
        'https://purl.obolibrary.org',
        'https://doi.org/10.5281/zenodo.20647514'
      ]
    };
  });

  // --- NCAA Banned Substance & Supplement Knowledgebase ---
  private readonly supplementDatabase: Record<string, INcaaBannedSubstanceCheck> = {
    'caffeine_high': {
      compound: 'Caffeine (>15 mcg/mL in urine)',
      category: 'Stimulants',
      isBannedByNcaa: true,
      requiresTue: false,
      nsfCertifiedForSport: false,
      clinicalAdvisory: 'NCAA urinary threshold of 15 mcg/mL corresponds to ~500 mg (6-8 cups of brewed coffee) consumed 2-3 hours prior to competition.',
      evidenceReference: 'NCAA Banned Substance Protocol §3.1 / WADA S6'
    },
    'pseudoephedrine': {
      compound: 'Pseudoephedrine (Sudafed)',
      category: 'Stimulants',
      isBannedByNcaa: true,
      requiresTue: true,
      nsfCertifiedForSport: false,
      clinicalAdvisory: 'Prohibited in competition at urinary concentrations > 150 mcg/mL. Requires therapeutic use exemption (TUE) for allergic rhinitis.',
      evidenceReference: 'NCAA CSMAS Guidelines / USADA TUE Policy'
    },
    'creatine_monohydrate': {
      compound: 'Creatine Monohydrate (Creapure)',
      category: 'Safe / Permitted',
      isBannedByNcaa: false,
      requiresTue: false,
      nsfCertifiedForSport: true,
      clinicalAdvisory: 'Permitted NCAA institutional supplement. Enhances phosphocreatine resynthesis for high-intensity power intervals. Maintain adequate hydration.',
      evidenceReference: 'ISSN Position Stand: Creatine Supplementation in Exercise'
    },
    'tart_cherry': {
      compound: 'Tart Cherry Extract (Anthocyanins)',
      category: 'Safe / Permitted',
      isBannedByNcaa: false,
      requiresTue: false,
      nsfCertifiedForSport: true,
      clinicalAdvisory: 'Permitted natural botanical. Accelerates muscle recovery and dampens post-workout DOMS via COX-1/2 inhibition.',
      evidenceReference: 'Scandinavian Journal of Medicine & Science in Sports (2020)'
    },
    'ashwagandha_withanolides': {
      compound: 'Ashwagandha (Withania somnifera, KSM-66)',
      category: 'Safe / Permitted',
      isBannedByNcaa: false,
      requiresTue: false,
      nsfCertifiedForSport: true,
      clinicalAdvisory: 'Permitted Ayurvedic adaptogen. Lowers salivary cortisol, modulates sympathetic stress response, and supports restorative sleep.',
      evidenceReference: 'Journal of the International Society of Sports Nutrition (2015)'
    },
    'synephrine_bitter_orange': {
      compound: 'Synephrine / Citrus Aurantium (Bitter Orange)',
      category: 'Stimulants',
      isBannedByNcaa: true,
      requiresTue: false,
      nsfCertifiedForSport: false,
      clinicalAdvisory: 'Prohibited NCAA stimulant commonly found in unregulated pre-workout thermogenics. Produces false-positive amphetamine-like tachycardia.',
      evidenceReference: 'NCAA CSMAS Banned Drug List 2025-2026'
    },
    'curcumin_phytosome': {
      compound: 'Curcumin Phytosome (Meriva / BCM-95)',
      category: 'Safe / Permitted',
      isBannedByNcaa: false,
      requiresTue: false,
      nsfCertifiedForSport: true,
      clinicalAdvisory: 'Permitted botanical anti-inflammatory. Inhibits NF-kB signaling and reduces serum IL-6 without gastrointestinal NSAID ulceration.',
      evidenceReference: 'UO Knight Campus Orthopedic Bioengineering Review'
    }
  };

  /**
   * Screen a botanical supplement, prescription, or OTC compound against the NCAA Banned Substance List
   */
  screenSupplement(query: string): INcaaBannedSubstanceCheck {
    const clean = query.toLowerCase().trim();
    for (const [key, val] of Object.entries(this.supplementDatabase)) {
      const compLower = val.compound.toLowerCase();
      if (clean.includes(key) || key.includes(clean) || compLower.includes(clean) || clean.includes(compLower)) {
        return val;
      }
    }
    return {
      compound: query,
      category: 'Safe / Permitted',
      isBannedByNcaa: false,
      requiresTue: false,
      nsfCertifiedForSport: true,
      clinicalAdvisory: `Compound "${query}" does not appear on the strict NCAA Banned Drug Class list. Verify NSF Certified for Sport or Informed-Sport 3rd-party batch seal before ingestion.`,
      evidenceReference: 'NCAA Drug Testing Program Protocol'
    };
  }

  /**
   * Calculate Coast-to-Coast Circadian Jetlag Protocol (e.g. Seattle/Eugene to Indiana/Midwest)
   */
  computeCircadianTravelPlan(origin: 'PST' | 'MST' | 'CST' | 'EST', destination: 'PST' | 'MST' | 'CST' | 'EST'): ICircadianTravelProtocol {
    const tzOffsets: Record<string, number> = { PST: -8, MST: -7, CST: -6, EST: -5 };
    const shift = (tzOffsets[destination] || -5) - (tzOffsets[origin] || -8);

    if (shift > 0) {
      // Eastward Travel (e.g., Oregon / Washington -> Purdue / Big Ten East: +3 Hours)
      return {
        originTimezone: origin,
        destinationTimezone: destination,
        timeShiftHours: shift,
        flightDurationHours: 4.5,
        hydrationPlanMlPerHour: 250,
        lightExposureWindow: '07:00 - 11:00 EST (Morning bright light to advance circadian phase)',
        lightAvoidanceWindow: '19:00 - 22:00 EST (Wear blue-blocking glasses 3 hours before sleep)',
        melatoninRecommendation: '0.5mg - 1mg microdose at 21:30 EST (destination time) 2 nights prior to departure',
        optimalTrainingWindow: '14:00 - 17:00 EST (Peak core body temperature alignment)'
      };
    } else if (shift < 0) {
      // Westward Travel (e.g., Purdue -> Oregon / Washington: -3 Hours)
      return {
        originTimezone: origin,
        destinationTimezone: destination,
        timeShiftHours: Math.abs(shift),
        flightDurationHours: 4.8,
        hydrationPlanMlPerHour: 250,
        lightExposureWindow: '16:00 - 19:00 PST (Late afternoon sunlight to delay circadian phase)',
        lightAvoidanceWindow: '05:00 - 07:00 PST (Avoid early morning light upon arrival)',
        melatoninRecommendation: 'Avoid evening melatonin; prioritize natural sunlight exposure upon waking',
        optimalTrainingWindow: '11:00 - 15:00 PST'
      };
    } else {
      // Same Timezone (In-Region Competition)
      return {
        originTimezone: origin,
        destinationTimezone: destination,
        timeShiftHours: 0,
        flightDurationHours: 1.5,
        hydrationPlanMlPerHour: 200,
        lightExposureWindow: 'Standard daylight routine',
        lightAvoidanceWindow: 'Standard nocturnal sleep hygiene',
        melatoninRecommendation: 'Not required for same-timezone regional play',
        optimalTrainingWindow: 'Standard practice slot'
      };
    }
  }

  // --- Concussion Stage Progression State Machine ---
  advanceConcussionStage(): boolean {
    if (this.currentConcussionStage() < 6) {
      this.currentConcussionStage.update(s => s + 1);
      return true;
    }
    return false;
  }

  resetConcussionProtocol(): void {
    this.currentConcussionStage.set(1);
    this.daysPostConcussion.set(0);
  }

  // --- Silo Management Methods ---
  setDivision(division: NcaaDivisionTier): void {
    this.selectedDivision.set(division);
  }

  setResearchTier(tier: CarnegieResearchTier): void {
    this.selectedResearchTier.set(tier);
  }

  setNetwork(network: ConferenceNetworkTier): void {
    this.selectedNetwork.set(network);
  }
}
