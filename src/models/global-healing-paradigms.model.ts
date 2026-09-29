/**
 * The Global Decad of Healing Systems (10 Paradigms) Domain Model
 *
 * Epistemologically pluralistic, clinically rigorous taxonomy spanning:
 *  1. Allopathic Medicine (MD)
 *  2. Osteopathic Medicine (DO)
 *  3. Naturopathic Medicine (ND) — The Therapeutic Order & Vis Medicatrix Naturae
 *  4. Traditional Chinese Medicine (TCM) — Zang-Fu, Wu Xing, Qi & Blood
 *  5. Ayurvedic Medicine — Tridosha, Saptadhatu, Agni/Ama, Ojas, Rasayana
 *  6. Functional & Systems-Biology — Network Biology, Cellular Energy, Mucosal Barrier
 *  7. Unani-Tibb — Greco-Arabic Humoral Medicine, Akhlat, Mizaj, Quwwat-e-Mudabbira
 *  8. Indigenous Ethnomedicine & Traditional Ecological Knowledge (TEK)
 *  9. Siddha (Dravidian Kaya Kalpa) & Sowa-Rigpa (Tibetan Psycho-Somatic)
 * 10. Chronobiology & Environmental Exposomics — Circadian Clock Gates, SCN, Exposome
 */

export type TGlobalHealingParadigm =
  | 'allopathic_md'
  | 'osteopathic_do'
  | 'naturopathic_nd'
  | 'traditional_chinese'
  | 'ayurvedic'
  | 'functional_systems'
  | 'unani_tibb'
  | 'indigenous_tek'
  | 'siddha_sowa_rigpa'
  | 'chronobiology_exposomics';

// ── 1. Allopathic (MD) & Dual-Coded Diagnostic Ontology ────────────────────────
export interface ICrosswalkDiagnosis {
  icd11Code: string;       // Primary ICD-11 MMS ontology code (e.g., "BA00" Essential hypertension)
  icd11Title: string;      // Primary WHO ICD-11 description
  icd10CmCode: string;     // Projected ICD-10-CM billing code (e.g., "I10")
  snomedCode?: string;     // SNOMED CT clinical term concept ID
  ictmChapter26Code?: string; // WHO ICD-11 Chapter 26 Traditional Medicine code (e.g., "TM1-RLU-01")
}

export interface IAllopathicProfile {
  primaryDiagnoses?: ICrosswalkDiagnosis[];
  primaryDiagnosesIcd10: { code: string; label: string }[];
  vitalSignsRiskTier: 'OPTIMAL' | 'ELEVATED' | 'STAGE_1' | 'STAGE_2' | 'CRITICAL';
  uspstfPreventiveGaps: string[];
  cochraneEvidenceGrade: 'Level A (Replicated RCTs)' | 'Level B (Cohort / Preliminary)' | 'Level C (Expert Consensus)';
  pharmacotherapyRegimen: { drug: string; dose: string; targetReceptor: string }[];
  surgicalAcuity: 'None' | 'Elective' | 'Urgent' | 'Emergency STAT';
}

// ── 2. Osteopathic (DO) ─────────────────────────────────────────────────────
export interface ITartFinding {
  tissueTextureAbnormality: string; // e.g. "Hypertonic paraspinal boggy fullness T4-T6"
  asymmetry: string;               // e.g. "Right transverse process posterior"
  restrictionOfMotion: string;     // e.g. "Restricted in left rotation & sidebending"
  tendernessSeverity: 'Mild' | 'Moderate' | 'Severe';
}

export interface IOsteopathicProfile {
  somaticDysfunctionSegments: string[];
  tartFindings: ITartFinding[];
  craniosacralPrimaryRespiratoryRhythm: string; // e.g. "8-10 cpm, slightly dampened inhalation phase"
  thoracoabdominalDiaphragmPumpStatus: 'Free Motion' | 'Restricted Excursion' | 'Diaphragmatic Inversion';
  lymphaticDrainageCongestionRegions: string[];
  recommendedOmtTechniques: string[]; // e.g. "Suboccipital inhibition, Thoracic lymphatic pump, Rib raising"
}

// ── 3. Naturopathic (ND) ────────────────────────────────────────────────────
export type TNaturopathicTherapeuticOrderTier =
  | '1_Establish_Conditions_For_Health'     // Clean air, water, nutrition, circadian rhythm, psychological safety
  | '2_Stimulate_Self_Healing_Mechanisms'   // Hydrotherapy, acupuncture, homeopathy, lifestyle pacing (Vis Medicatrix)
  | '3_Support_Weakened_Organ_Systems'      // Botanical trophorestoratives, targeted micronutrients, digestive enzymes
  | '4_Correct_Structural_Integrity'        // Physical alignment, spinal manipulation, myofascial release
  | '5_Natural_Substances_For_Pathology'    // High-dose therapeutic botanicals, antimicrobial herbs, phytotherapy
  | '6_Synthetic_Pharmaceuticals'           // Prescription drug management (when natural options are insufficient)
  | '7_High_Force_Surgery_Intervention';   // Invasive surgery / emergency rescue (last resort)

export interface INaturopathicProfile {
  visMedicatrixNaturaeScore: number; // 0-100 (Innate vital vitality)
  tolleCausamRootEtiology: string;   // Deepest upstream physiological cause identified
  currentTherapeuticOrderTier: TNaturopathicTherapeuticOrderTier;
  recommendedSteppedCareActions: string[];
  nutritionalPrescriptions: string[];
  botanicalPhytotherapyFormulary: string[];
  hydrotherapyProtocols: string[];
}

// ── 4. Traditional Chinese Medicine (TCM) ───────────────────────────────────
export interface ITcmProfile {
  zangFuSyndrome: string; // e.g. "Liver Qi Stagnation with Spleen Deficiency & Damp-Heat"
  eightPrinciplesClassification: {
    yinYang: 'Yin Predominant' | 'Yang Predominant' | 'Yin-Yang Balanced';
    interiorExterior: 'Interior' | 'Exterior' | 'Half-Interior Half-Exterior';
    coldHeat: 'Deficiency Cold' | 'Excess Heat' | 'Damp-Heat' | 'True Cold False Heat';
    deficiencyExcess: 'Deficiency (Xu)' | 'Excess (Shi)' | 'Mixed Deficiency-Excess';
  };
  wuXingFiveElementsDynamics: {
    wood: 'Excess' | 'Deficient' | 'Harmonious';
    fire: 'Excess' | 'Deficient' | 'Harmonious';
    earth: 'Excess' | 'Deficient' | 'Harmonious';
    metal: 'Excess' | 'Deficient' | 'Harmonious';
    water: 'Excess' | 'Deficient' | 'Harmonious';
  };
  tongueDiagnosis: string; // e.g. "Pale red body, swollen with toothmarks, thick greasy yellow coat at root"
  pulseDiagnosis: string;  // e.g. "Wiry (Xian) on left Guan, Slippery (Hua) on right Guan"
  classicalHerbalFormulary: string; // e.g. "Chai Hu Shu Gan San + Er Chen Tang modified"
  keyAcupoints: string[];  // e.g. ["LV-3 (Taichong)", "SP-6 (Sanyinjiao)", "ST-36 (Zusanli)"]
}

// ── 5. Ayurvedic Medicine ───────────────────────────────────────────────────
export interface IAyurvedicProfile {
  prakritiConstitutionalBaseline: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshic';
  vikritiCurrentImbalance: 'Vata Aggravation' | 'Pitta Hyper-metabolism' | 'Kapha Stagnation' | 'Sama (Balanced)';
  agniMetabolicState: 'Sama (Balanced)' | 'Tikshna (Hyper-acidic / Fast)' | 'Manda (Sluggish / Hypo)' | 'Vishama (Irregular / Spastic)';
  amaToxicityLevel: 'Nirama (Clean)' | 'Madhyama (Moderate)' | 'Saama (High Systemic Ama)';
  saptadhatuTissueImpairment: string[]; // e.g. ["Rasa (Plasma)", "Rakta (Blood)", "Medas (Adipose)"]
  ojasImmuneVitalityScore: number;     // 0-100
  rasayanaRejuvenationProtocols: string[]; // e.g. ["Amalaki Rasayana", "Brahmi Ghritha", "Ashwagandha Ksheera Pak"]
  dailyDinacharyaRoutine: string[];
}

// ── 6. Functional & Systems Biology ─────────────────────────────────────────
export interface IFunctionalSystemsProfile {
  networkNodesStatus: {
    assimilationGutBarrier: 'Optimal' | 'Mild Permeability' | 'Severe Hyperpermeability';
    defenseAndRepairImmune: 'Balanced' | 'Th1 Dominant' | 'Th2 Dominant' | 'Autoimmune Hyper-activation';
    cellularEnergyMitochondria: 'Optimal ATP' | 'Oxidative Stress' | 'Bioenergetic Deficit';
    biotransformationDetox: 'Optimal' | 'Phase I Sluggish' | 'Phase II Glucuronidation Depleted';
    transportMicrovascular: 'Optimal Perfusion' | 'Endothelial Strain' | 'Capillary Stasis';
    intercellularCommunicationHormonal: 'Euthyroid/Euglycemic' | 'Cortisol Rhythm Dysregulation' | 'Estrogen Dominance';
    structuralMusculoskeletal: 'Integrity Preserved' | 'Fascial/Extracellular Matrix Degradation';
  };
  zonulinGutPermeabilityEstimateNgMl: number;
  hsCrpSystemicInflammationMgL: number;
  apobCardiometabolicParticleRisk: 'Optimal (<60)' | 'Moderate (60-89)' | 'High (90-119)' | 'Critical (>=120)';
  longevitySwitchModulation: {
    ampkPhosphorylation: 'Activated' | 'Suppressed';
    mtorC1Activation: 'Anabolic Surge' | 'Balanced Autophagy' | 'Chronic Pathological Over-activation';
    sirtuinDeacetylation: 'Robust' | 'Blunted';
  };
}

// ── 7. Unani-Tibb (Greco-Arabic Humoral) ─────────────────────────────────────
export type THumorAkhlat = 'Dam_Blood' | 'Balgham_Phlegm' | 'Safra_YellowBile' | 'Sauda_BlackBile';
export type TMizajTemperament = 'Damwi_Sanguine' | 'Balghami_Phlegmatic' | 'Safrawi_Choleric' | 'Saudawi_Melancholic';

export interface IUnaniTibbProfile {
  dominantMizaj: TMizajTemperament;
  currentSueMizajDyscrasia: string; // e.g. "Su-e-Mizaj Safrawi Haar-Yaabis (Hot & Dry Choleric Imbalance)"
  dominantAkhlatExcess: THumorAkhlat;
  quwwatEMudabbiraSelfHealingPower: number; // 0-100 (Innate restorative vital power)
  asbabESittahZarooriyahPillars: {
    hawaAmbientAir: string;
    makulWaMashroobFoodDrink: string;
    harkatWaSukoonPhysicalMovementRest: string;
    harkatWaSukoonNafsaniMentalState: string;
    naumWaYaqzahSleepWakefulness: string;
    ihtibasWaIstifraghRetentionEvacuation: string;
  };
  recommendedTibbFormulary: string[]; // e.g. ["Sharbat-e-Bazoori Motadil (Diuretic/Cooling)", "Majun Dabeed-ul-Ward (Hepatoprotective)"]
}

// ── 8. Indigenous Ethnomedicine & Traditional Ecological Knowledge (TEK) ─────
export interface IIndigenousTekProfile {
  ecologicalReciprocityStatus: 'Harmonious Kinship' | 'Relational Discord' | 'Environmental Alienation';
  bioregionalPlantRelations: {
    botanicalName: string;
    indigenousTraditionalUse: string;
    ecologicalHarvestEthics: string;
    provenanceSovereignty: string;
  }[];
  somaticNervousSystemTraumaDischarge: string; // e.g. "Community circle rhythm, land-grounding, thermal sweating lodge"
  ancestralNutritionContinuity: string;       // Whole indigenous heritage staple alignment
}

// ── 9. Siddha & Sowa-Rigpa ──────────────────────────────────────────────────
export interface ISiddhaSowaRigpaProfile {
  siddhaMuppuBioenergeticAlignment: {
    vatham: 'Balanced' | 'Aggravated' | 'Depleted';
    pitham: 'Balanced' | 'Aggravated' | 'Depleted';
    kabam: 'Balanced' | 'Aggravated' | 'Depleted';
  };
  kayaKalpaRejuvenationIndex: number; // 0-100 (Biophysical cellular longevity)
  sowaRigpaThreeHumors: {
    rlungWind: 'Equilibrium' | 'Excess (Neuro-cognitive Agitation)' | 'Depleted';
    mkhrisPaFire: 'Equilibrium' | 'Excess (Hepatic / Inflammatory Heat)' | 'Depleted';
    badKanPhlegm: 'Equilibrium' | 'Excess (Metabolic / Fluid Stagnation)' | 'Depleted';
  };
  rootKleshasAfflictionAssessment: {
    dodChagAttachmentDesire: 'Mild' | 'Moderate' | 'Severe Disturbance (Rlung trigger)' | string;
    zheSdangAversionAnger: 'Mild' | 'Moderate' | 'Severe Disturbance (Mkhris-pa trigger)' | string;
    gtiMugIgnoranceConfusion: 'Mild' | 'Moderate' | 'Severe Disturbance (Bad-kan trigger)' | string;
  };
  tibetanHerbalFormularyRecommendation: string; // e.g. "Agar 35 (Sems-kyi bde-skyid for Wind agitation) + Gikyang 11"
}

// ── 10. Chronobiology & Environmental Exposomics ────────────────────────────
export interface IChronobiologyExposomicsProfile {
  circadianClockGeneAlignment: {
    bmal1ClockPeakPhase: 'Morning Solar Sync' | 'Delayed Diurnal Shift' | 'Flattened Amplitude';
    per2CryPhaseSlope: string; // e.g. "Normal steep evening descent"
  };
  suprachiasmaticNucleusScnEntrainment: 'Optimal Sunlight Anchored' | 'Blue-Light Desynchronized' | 'Shift-Work Disrupted';
  melanopicLuxMorningExposure: number; // Target >= 1000 lux
  timeRestrictedFeedingWindow: string; // e.g. "08:30 - 17:30 (9h circadian metabolic window)"
  photobiomodulationNearInfraredStatus: 'Deficient (Chronic Indoor)' | 'Adequate Solar NIR Exposure';
  cumulativeExposomicToxicityIndex: number; // 0-100
}

// ── Decad Synthesis & Cross-Paradigm Consensus ──────────────────────────────
export interface IParadigmConsensusPoint {
  paradigmSource: TGlobalHealingParadigm;
  paradigmLabel: string;
  identifiedMechanism: string;
  suggestedAction: string;
}

export interface IGlobalDecadConsensus {
  patientId: string;
  timestampUtc: string;
  totalParadigmsEvaluated: number;
  epistemicConvergenceScore: number; // 0.0 to 1.0 (Agreement magnitude across paradigms)
  concordantRootEtiology: string;   // Harmonized multi-system root conclusion
  consensusActionPlan: string[];     // Actions agreed upon by >= 3 independent traditions
  crossParadigmContraindications: string[]; // Safety flags across all traditions
  therapeuticOrderSteppedLadder: {
    tier: TNaturopathicTherapeuticOrderTier;
    status: 'Satisfied' | 'In_Progress' | 'Pending_Escalation';
    actions: string[];
  }[];
  allopathic: IAllopathicProfile;
  osteopathic: IOsteopathicProfile;
  naturopathic: INaturopathicProfile;
  tcm: ITcmProfile;
  ayurvedic: IAyurvedicProfile;
  functional: IFunctionalSystemsProfile;
  unaniTibb: IUnaniTibbProfile;
  indigenousTek: IIndigenousTekProfile;
  siddhaSowaRigpa: ISiddhaSowaRigpaProfile;
  chronobiologyExposomics: IChronobiologyExposomicsProfile;
  fdaPart11IntegrityDigest: string;
}
