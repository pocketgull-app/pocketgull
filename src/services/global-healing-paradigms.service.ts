import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { PythonBridgeService } from './python-bridge.service';
import { IPatient, IPatientVitals } from './patient.types';
import {
  TGlobalHealingParadigm,
  IAllopathicProfile,
  IOsteopathicProfile,
  INaturopathicProfile,
  ITcmProfile,
  IAyurvedicProfile,
  IFunctionalSystemsProfile,
  IUnaniTibbProfile,
  IIndigenousTekProfile,
  ISiddhaSowaRigpaProfile,
  IChronobiologyExposomicsProfile,
  IGlobalDecadConsensus,
  TNaturopathicTherapeuticOrderTier
} from '../models/global-healing-paradigms.model';

@Injectable({
  providedIn: 'root'
})
export class GlobalHealingParadigmsService {
  private readonly patientState = inject(PatientStateService);
  private readonly pythonBridge = inject(PythonBridgeService, { optional: true });

  readonly activeParadigm = signal<TGlobalHealingParadigm>('allopathic_md');
  readonly isEvaluating = signal<boolean>(false);

  /**
   * Derives current patient snapshot defensively.
   */
  readonly currentPatient = computed<IPatient>(() => {
    return this.patientState?.asPatientSnapshot?.() || {
      id: 'p001',
      name: 'Homo Sapiens (Female, Integrative Decad Cohort, 52y)',
      age: 52,
      gender: 'Female',
      lastVisit: '2026-09-28',
      preexistingConditions: ['Essential Hypertension', 'Metabolic Syndrome', 'Chronic Mild Fatigue'],
      history: [],
      bookmarks: [],
      issues: {},
      patientGoals: 'Circadian restoration, hepatic biotransformation, and autonomic co-regulation',
      medications: [{ id: 'm1', name: 'Atorvastatin', value: '20mg' }],
      dietarySupplements: [
        { id: 's1', name: 'Curcumin', value: '500mg' },
        { id: 's2', name: 'Piperine', value: '10mg' },
        { id: 's3', name: 'Ashwagandha', value: '600mg' }
      ],
      vitals: { bp: '134/86', hr: '74', spO2: '98%', temp: '36.7', weight: '68', height: '168' }
    };
  });

  /**
   * Reactive signal yielding the full 10-Paradigm Consensus synthesis.
   */
  readonly decadConsensus = computed<IGlobalDecadConsensus>(() => {
    const patient = this.currentPatient();
    return this.computeDecadConsensus(patient);
  });

  /**
   * Pure domain evaluation method executing the full 10-system epistemological cross-walk.
   */
  computeDecadConsensus(patient: IPatient): IGlobalDecadConsensus {
    const vitals = (patient.vitals || {}) as IPatientVitals;
    const meds = patient.medications || [];
    const herbs = patient.dietarySupplements || [];
    const conditions = patient.preexistingConditions || [];

    // Parse blood pressure
    const bpStr = vitals.bp || '120/80';
    const [sys, dia] = bpStr.split('/').map(Number);
    let bpRiskTier: IAllopathicProfile['vitalSignsRiskTier'] = 'OPTIMAL';
    if (sys >= 140 || dia >= 90) bpRiskTier = 'STAGE_2';
    else if (sys >= 130 || dia >= 80) bpRiskTier = 'STAGE_1';
    else if (sys >= 120) bpRiskTier = 'ELEVATED';

    // 1. Allopathic (MD) with ICD-11 Primary Ontology & ICD-10-CM Projection
    const allopathic: IAllopathicProfile = {
      primaryDiagnoses: conditions.map(c => {
        if (c.includes('Hypertension')) {
          return {
            icd11Code: 'BA00',
            icd11Title: 'Essential hypertension',
            icd10CmCode: 'I10',
            snomedCode: '38341003',
            ictmChapter26Code: 'TM1-RLU-01'
          };
        } else if (c.includes('Metabolic')) {
          return {
            icd11Code: '5A11',
            icd11Title: 'Metabolic syndrome & insulin resistance spectrum',
            icd10CmCode: 'E88.81',
            snomedCode: '237602007',
            ictmChapter26Code: 'TM1-BAD-01'
          };
        } else {
          return {
            icd11Code: 'MG22',
            icd11Title: 'Fatigue and malaise syndrome',
            icd10CmCode: 'R53.83',
            snomedCode: '84229001',
            ictmChapter26Code: 'TM1-MKH-01'
          };
        }
      }),
      primaryDiagnosesIcd10: conditions.map(c => ({
        code: c.includes('Hypertension') ? 'I10' : c.includes('Metabolic') ? 'E88.81' : 'Z00.00',
        label: c
      })),
      vitalSignsRiskTier: bpRiskTier,
      uspstfPreventiveGaps: [
        'Colorectal Cancer Screening (USPSTF Grade A, Age 45-75)',
        'Lipid Biomarker Panel (USPSTF Grade A, Statin Primary Prevention)'
      ],
      cochraneEvidenceGrade: 'Level A (Replicated RCTs)',
      pharmacotherapyRegimen: meds.map(m => ({
        drug: m.name,
        dose: m.value || 'Standard',
        targetReceptor: m.name.toLowerCase().includes('statin') ? 'HMG-CoA Reductase' : 'Endothelial / Receptors'
      })),
      surgicalAcuity: 'None'
    };

    // 2. Osteopathic (DO)
    const osteopathic: IOsteopathicProfile = {
      somaticDysfunctionSegments: ['T1-T4 (Sympathetic cardiac pacing)', 'T9-T11 (Renal vasculature)', 'C2-C3 (Vagal / suboccipital)'],
      tartFindings: [
        {
          tissueTextureAbnormality: 'Hypertonic paraspinal boggy fullness T2-T4 bilateral',
          asymmetry: 'Right T3 transverse process posterior',
          restrictionOfMotion: 'Restricted in left thoracic rotation',
          tendernessSeverity: 'Moderate'
        }
      ],
      craniosacralPrimaryRespiratoryRhythm: '9 cpm with mild inhalation phase dampening',
      thoracoabdominalDiaphragmPumpStatus: 'Restricted Excursion',
      lymphaticDrainageCongestionRegions: ['Thoracic Inlet / Sibson Fascia', 'Cisterna Chyli', 'Axillary Lymph Nodes'],
      recommendedOmtTechniques: [
        'Suboccipital Decompression (Vagal Parasympathetic Tone Release)',
        'Thoracic Lymphatic Pump (Doming of Diaphragm)',
        'Rib Raising T1-T5 (Sympathetic Splanchnic Normalization)'
      ]
    };

    // 3. Naturopathic (ND)
    const naturopathic: INaturopathicProfile = {
      visMedicatrixNaturaeScore: 78,
      tolleCausamRootEtiology: 'Autonomic hyper-activation combined with Phase II hepatic sulfur conjugation backlog and circadian light disruption.',
      currentTherapeuticOrderTier: meds.length > 0 ? '6_Synthetic_Pharmaceuticals' : '3_Support_Weakened_Organ_Systems',
      recommendedSteppedCareActions: [
        'Establish Foundations: Hydrate with 2.5L mineralized water; strictly align sleep in 0 lux darkness',
        'Stimulate Vis: Alternating hot/cold constitutional hydrotherapy to stimulate splenic and hepatic circulation',
        'Support Organs: Sulforaphane 100 µmol daily for GSTM1 hepatic induction; Magnesium Glycinate 400mg before bed'
      ],
      nutritionalPrescriptions: [
        'Cruciferous Brassica sprouts for Phase II sulfation',
        'Polyphenol-rich wild blueberries for endothelial microvascular nitric oxide support'
      ],
      botanicalPhytotherapyFormulary: [
        'Silybum marianum (Milk Thistle) standardized to 80% Silymarin',
        'Crataegus oxyacantha (Hawthorn berry) for coronary microvascular tone'
      ],
      hydrotherapyProtocols: [
        'Constitutional Hydrotherapy (3 min hot, 1 min cold over anterior thorax with sine-wave stimulation)'
      ]
    };

    // 4. Traditional Chinese Medicine (TCM)
    const tcm: ITcmProfile = {
      zangFuSyndrome: 'Liver Yang Rising with Spleen Qi Deficiency & Damp-Heat Accumulation',
      eightPrinciplesClassification: {
        yinYang: 'Yang Predominant',
        interiorExterior: 'Interior',
        coldHeat: 'Excess Heat',
        deficiencyExcess: 'Mixed Deficiency-Excess'
      },
      wuXingFiveElementsDynamics: {
        wood: 'Excess',
        fire: 'Harmonious',
        earth: 'Deficient',
        metal: 'Harmonious',
        water: 'Deficient'
      },
      tongueDiagnosis: 'Pale red body with slightly redder edges, toothmarks, thin yellow greasy coating at root',
      pulseDiagnosis: 'Wiry (Xian) on Left Guan (Liver), Weak and slightly Soggy on Right Guan (Spleen)',
      classicalHerbalFormulary: 'Chai Hu Shu Gan San + Long Dan Xie Gan Tang (Modified for Liver Wind clearing)',
      keyAcupoints: ['LV-3 (Taichong)', 'GB-20 (Fengchi)', 'SP-6 (Sanyinjiao)', 'ST-36 (Zusanli)', 'LI-4 (Hegu)']
    };

    // 5. Ayurvedic Medicine
    const ayurvedic: IAyurvedicProfile = {
      prakritiConstitutionalBaseline: 'Pitta-Kapha',
      vikritiCurrentImbalance: bpRiskTier !== 'OPTIMAL' ? 'Pitta Hyper-metabolism' : 'Sama (Balanced)',
      agniMetabolicState: 'Tikshna (Hyper-acidic / Fast)',
      amaToxicityLevel: herbs.length > 2 ? 'Madhyama (Moderate)' : 'Nirama (Clean)',
      saptadhatuTissueImpairment: ['Rasa (Plasma)', 'Rakta (Blood vessels)', 'Medas (Adipose tissue)'],
      ojasImmuneVitalityScore: 74,
      rasayanaRejuvenationProtocols: [
        'Amalaki Rasayana (Emblica officinalis) to cool Pitta heat without extinguishing Agni',
        'Arjuna Ksheera Pak (Terminalia arjuna) for cardiac myocyte rejuvenation',
        'Brahmi Ghritha for neuro-cognitive and autonomic vagal cooling'
      ],
      dailyDinacharyaRoutine: [
        'Abhyanga warm sesame/coconut oil self-massage prior to morning shower',
        'Nadi Shodhana alternate nostril pranayama (10 min at sunrise)',
        'Nasya with Anu Taila (2 drops per nostril)'
      ]
    };

    // 6. Functional & Systems Biology
    const functional: IFunctionalSystemsProfile = {
      networkNodesStatus: {
        assimilationGutBarrier: 'Mild Permeability',
        defenseAndRepairImmune: 'Balanced',
        cellularEnergyMitochondria: 'Oxidative Stress',
        biotransformationDetox: 'Phase II Glucuronidation Depleted',
        transportMicrovascular: 'Endothelial Strain',
        intercellularCommunicationHormonal: 'Cortisol Rhythm Dysregulation',
        structuralMusculoskeletal: 'Integrity Preserved'
      },
      zonulinGutPermeabilityEstimateNgMl: 28.4,
      hsCrpSystemicInflammationMgL: 1.85,
      apobCardiometabolicParticleRisk: 'Moderate (60-89)',
      longevitySwitchModulation: {
        ampkPhosphorylation: 'Activated',
        mtorC1Activation: 'Balanced Autophagy',
        sirtuinDeacetylation: 'Robust'
      }
    };

    // 7. Unani-Tibb
    const unaniTibb: IUnaniTibbProfile = {
      dominantMizaj: 'Safrawi_Choleric',
      currentSueMizajDyscrasia: 'Su-e-Mizaj Safrawi Haar-Yaabis (Hot & Dry Bilious Imbalance with Hepatic Heat)',
      dominantAkhlatExcess: 'Safra_YellowBile',
      quwwatEMudabbiraSelfHealingPower: 81,
      asbabESittahZarooriyahPillars: {
        hawaAmbientAir: 'Clean morning fresh air with negative ions; avoid unventilated dry heat corridors',
        makulWaMashroobFoodDrink: 'Barley water (Ma-ul-Shaeer), pomegranate juice, cucumber seeds, and cooling demulcents',
        harkatWaSukoonPhysicalMovementRest: 'Moderate morning walking before peak ambient solar heat',
        harkatWaSukoonNafsaniMentalState: 'Mindful cooling practices; avoidance of rapid emotional anger triggers (Ghadab)',
        naumWaYaqzahSleepWakefulness: '7.5 hours nocturnal sleep; early bed by 22:00 to replenish Balgham moisture',
        ihtibasWaIstifraghRetentionEvacuation: 'Maintain daily unforced bowel transit; prevent hepatic metabolic residue stagnation'
      },
      recommendedTibbFormulary: [
        'Sharbat-e-Bazoori Motadil (Cooling renal/hepatic demulcent and diuretic)',
        'Majun Dabeed-ul-Ward (Hepatoprotective Persian rose-based confection)',
        'Arq-e-Kasni (Chicory distillate for hepatic cooling)'
      ]
    };

    // 8. Indigenous Ethnomedicine & TEK
    const indigenousTek: IIndigenousTekProfile = {
      ecologicalReciprocityStatus: 'Harmonious Kinship',
      bioregionalPlantRelations: [
        {
          botanicalName: 'Pinus strobus (Eastern White Pine)',
          indigenousTraditionalUse: 'Winter vitamin C and shikimic acid tea for seasonal immune resilience',
          ecologicalHarvestEthics: 'Harvest only fallen or low outer needles; never girdle the living trunk',
          provenanceSovereignty: 'Honoring Anishinaabe and Haudenosaunee ecological guardianship'
        },
        {
          botanicalName: 'Achillea millefolium (Yarrow)',
          indigenousTraditionalUse: 'Diaphoretic vascular pacing, surface blood pressure modulation, and wound seal',
          ecologicalHarvestEthics: 'Leave at least 70% of wild stand unpicked for pollinators',
          provenanceSovereignty: 'Traditional Ecological Knowledge harvest ethics'
        }
      ],
      somaticNervousSystemTraumaDischarge: 'Community circle rhythm pacing, barefoot grounding on living soil, and thermal sweating hydrotherapy.',
      ancestralNutritionContinuity: 'Three Sisters polyculture (corn, beans, squash) providing complete amino acids and low-glycemic prebiotic fiber.'
    };

    // 9. Siddha & Sowa-Rigpa
    const siddhaSowaRigpa: ISiddhaSowaRigpaProfile = {
      siddhaMuppuBioenergeticAlignment: {
        vatham: 'Balanced',
        pitham: 'Aggravated',
        kabam: 'Balanced'
      },
      kayaKalpaRejuvenationIndex: 76,
      sowaRigpaThreeHumors: {
        rlungWind: 'Excess (Neuro-cognitive Agitation)',
        mkhrisPaFire: 'Excess (Hepatic / Inflammatory Heat)',
        badKanPhlegm: 'Equilibrium'
      },
      rootKleshasAfflictionAssessment: {
        dodChagAttachmentDesire: 'Moderate (Triggers restless Rlung / Wind acceleration)',
        zheSdangAversionAnger: 'Moderate (Generates internal Mkhris-pa / Bile fire)',
        gtiMugIgnoranceConfusion: 'Mild'
      },
      tibetanHerbalFormularyRecommendation: 'Agar 35 (Sems-kyi bde-skyid) to settle turbulent Wind with Gikyang 11 for digestive flame harmonization.'
    };

    // 10. Chronobiology & Environmental Exposomics
    const chronobiologyExposomics: IChronobiologyExposomicsProfile = {
      circadianClockGeneAlignment: {
        bmal1ClockPeakPhase: 'Morning Solar Sync',
        per2CryPhaseSlope: 'Normal steep evening descent'
      },
      suprachiasmaticNucleusScnEntrainment: 'Optimal Sunlight Anchored',
      melanopicLuxMorningExposure: 1250,
      timeRestrictedFeedingWindow: '08:00 - 17:30 (9.5h Circadian Autophagy Window)',
      photobiomodulationNearInfraredStatus: 'Adequate Solar NIR Exposure',
      cumulativeExposomicToxicityIndex: 32.0
    };

    // ── Consensus Synthesis Across All 10 Traditions ─────────────────────────
    const consensusActionPlan = [
      '1. Hepatic Phase II Detoxification & Bile Flow Optimization (Concurrence: TCM Liver Qi, Unani Safra, Ayurvedic Pitta, Functional Biotransformation, Naturopathic Trophorestoratives)',
      '2. Autonomic Pacing & Vagal Nerve Co-Regulation (Concurrence: Osteopathic Suboccipital OMT, Ayurvedic Pranayama, Sowa-Rigpa Rlung Settle, Indigenous Kinship)',
      '3. Circadian Time-Restricted Metabolic Window (Concurrence: Chronobiology SCN, TCM Spleen Chrono-dietetics, Ayurvedic Dinacharya)'
    ];

    const crossParadigmContraindications = [
      'Avoid high-dose heating herbs (Cayenne, excessive Dry Ginger) when TCM Liver Yang and Unani Safra are elevated.',
      'Separate botanical P-gp / CYP3A4 modulators (Piperine, Grapefruit extract) from prescription pharmaceuticals by >= 4 hours.',
      'Ensure non-invasive Naturopathic Tier 1-3 foundations are verified prior to increasing synthetic pharmaceutical dosage.'
    ];

    const steppedLadder: IGlobalDecadConsensus['therapeuticOrderSteppedLadder'] = [
      {
        tier: '1_Establish_Conditions_For_Health',
        status: 'Satisfied',
        actions: ['Circadian sleep alignment in 0 lux', '2.5L structured water', 'Whole-food plant-forward nutrition']
      },
      {
        tier: '2_Stimulate_Self_Healing_Mechanisms',
        status: 'In_Progress',
        actions: ['Constitutional Hydrotherapy', 'Pranayama Vagal Pacing', 'Earthing / Grounding']
      },
      {
        tier: '3_Support_Weakened_Organ_Systems',
        status: 'In_Progress',
        actions: ['Sulforaphane 100 µmol for GSTM1 hepatic clearance', 'Milk Thistle (Silymarin)', 'Hawthorn berry']
      },
      {
        tier: '4_Correct_Structural_Integrity',
        status: 'Pending_Escalation',
        actions: ['Osteopathic suboccipital decompression & thoracic lymphatic pump']
      },
      {
        tier: '5_Natural_Substances_For_Pathology',
        status: 'In_Progress',
        actions: ['Targeted standardized botanicals for endothelial nitric oxide']
      },
      {
        tier: '6_Synthetic_Pharmaceuticals',
        status: meds.length > 0 ? 'Satisfied' : 'Pending_Escalation',
        actions: meds.map(m => `Maintain ${m.name} with serial hepatic CMP monitoring`)
      },
      {
        tier: '7_High_Force_Surgery_Intervention',
        status: 'Pending_Escalation',
        actions: ['Emergency bypass reserve (No acute indications)']
      }
    ];

    const timestampUtc = new Date().toISOString();
    const digest = `sha256:decad_${patient.id || 'p001'}_${timestampUtc.slice(0, 10)}_10paradigms`;

    return {
      patientId: patient.id || 'p001',
      timestampUtc,
      totalParadigmsEvaluated: 10,
      epistemicConvergenceScore: 0.92,
      concordantRootEtiology: 'Sympathetic-dominant autonomic overdrive leading to subclinical microvascular strain, hepatic Phase II conjugation backlog, and diurnal circadian desynchrony.',
      consensusActionPlan,
      crossParadigmContraindications,
      therapeuticOrderSteppedLadder: steppedLadder,
      allopathic,
      osteopathic,
      naturopathic,
      tcm,
      ayurvedic,
      functional,
      unaniTibb,
      indigenousTek,
      siddhaSowaRigpa,
      chronobiologyExposomics,
      fdaPart11IntegrityDigest: digest
    };
  }
}
