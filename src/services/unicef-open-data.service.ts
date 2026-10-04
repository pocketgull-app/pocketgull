import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * UNICEF SDMX Open Data Dataflow Specification.
 * Reference: https://data.unicef.org/open-data/ & SDMX REST API
 */
export interface IUnicefDataflow {
  id: string;
  name: string;
  category: 'NUTRITION' | 'CHILD_MORTALITY' | 'IMMUNIZATION' | 'MNCH' | 'WASH' | 'ECD';
  description: string;
  agencyId: 'UNICEF';
  defaultIndicators: string[];
}

/**
 * UNICEF Public Health Indicator definition with SDG alignment.
 */
export interface IUnicefIndicator {
  code: string;
  label: string;
  dataflowId: string;
  unit: string;
  sdgMapping?: string;
  globalTarget2030?: number;
  description: string;
}

/**
 * Regional or National UNICEF Benchmark Record.
 */
export interface IUnicefBenchmarkRecord {
  regionCode: string;
  regionName: string;
  indicatorCode: string;
  indicatorName: string;
  year: number;
  value: number;
  unit: string;
  tier: 'OPTIMAL' | 'MODERATE_CONCERN' | 'CRITICAL_ALERT';
  notes?: string;
}

/**
 * Consolidated Regional Child Survival Profile.
 */
export interface IUnicefRegionalChildProfile {
  regionCode: string;
  regionName: string;
  underFiveMortalityRatePer1k: number; // SDG 3.2.1 target <= 25
  neonatalMortalityRatePer1k: number;  // SDG 3.2.2 target <= 12
  childStuntingRatePct: number;        // Height-for-age < -2 SD
  childWastingRatePct: number;         // Weight-for-height < -2 SD
  severeAcuteMalnutritionPct: number;  // Weight-for-height < -3 SD or MUAC < 115mm
  zeroDoseChildrenPct: number;         // Missing DTP1 / Pentavalent 1
  measlesCoveragePct: number;          // MCV1 coverage
  exclusiveBreastfeedingPct: number;   // EBF 0-5 months
  basicWaterAccessPct: number;         // WASH basic drinking water
  earlyChildhoodDevelopmentIndex: number; // ECDI2030 (0-100)
  priorityInterventions: string[];
}

/**
 * UNICEF Supply Division Specifications for Ready-to-Use Therapeutic Food (RUTF).
 * Product code: S0000240 (Plumpy'Nut 92g sachet / 500 kcal).
 */
export interface IUnicefRutfDosageTier {
  weightMinKg: number;
  weightMaxKg: number;
  sachetsPerDay: number;
  sachetsPerWeek: number;
  targetDailyCaloriesKcal: number;
}

/**
 * UNICEF Inpatient vs Outpatient SAM Appetite Test Protocol Result.
 */
export interface IUnicefSamTriageAssessment {
  childWeightKg: number;
  muacMm: number;
  bilateralEdemaGrade: 'NONE' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3';
  appetiteTestPassed: boolean;
  appetiteSachetPortionConsumed: number; // 0.0 to 1.0 (>= 0.25 required)
  hasMedicalComplications: boolean;      // High fever, vomiting, convulsions, respiratory distress
  disposition: 'OUTPATIENT_THERAPEUTIC_PROGRAM' | 'INPATIENT_STABILIZATION_PHASE_1' | 'SUPPLEMENTARY_FEEDING_MAM' | 'ROUTINE_PREVENTIVE_CARE';
  dispositionLabel: string;
  badgeClass: string;
  dailyRutfSachets: number;
  weeklyRutfSachets: number;
  therapeuticFeedType: 'RUTF_PLUMPYNUT' | 'F75_THERAPEUTIC_MILK' | 'RUSF_SUPPLEMENTARY' | 'NONE';
  clinicalDirectives: string[];
}

/**
 * UNICEF / WHO Zero-Dose Child Screening Result (IA2030 Immunization Agenda).
 */
export interface IZeroDoseScreeningResult {
  childAgeMonths: number;
  receivedDtp1: boolean;
  receivedDtp3: boolean;
  receivedMcv1: boolean;
  isZeroDose: boolean;
  isUnderImmunized: boolean;
  statusBadge: string;
  missedVaccines: string[];
  clinicalDirectives: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UnicefOpenDataService {
  private readonly http?: HttpClient;

  constructor() {
    try {
      this.http = inject(HttpClient, { optional: true }) ?? undefined;
    } catch {
      // Gracefully handles instantiation outside Angular DI context (e.g. server / unit tests)
    }
  }

  /** Base UNICEF SDMX REST API endpoint */
  public readonly sdmxBaseUrl = 'https://sdmx.data.unicef.org/ws/public/sdmxapi/rest';
  public readonly sdmxV2DataUrl = 'https://sdmx.data.unicef.org/sdmx/v2/data';

  /** Selected region for active benchmarking */
  public readonly selectedRegionCode = signal<string>('GLOBAL');

  /** Live API Query status */
  public readonly isQueryingLiveApi = signal<boolean>(false);
  public readonly liveApiError = signal<string | null>(null);
  public readonly liveApiLastResult = signal<unknown | null>(null);

  /**
   * Official UNICEF Dataflows available through the SDMX Registry.
   * Reference: https://data.unicef.org/open-data/
   */
  public readonly dataflows: readonly IUnicefDataflow[] = [
    {
      id: 'NUTRITION',
      name: 'Child Nutrition & Infant Feeding',
      category: 'NUTRITION',
      description: 'Global monitoring of stunting, wasting, severe acute malnutrition (SAM), overweight, and infant & young child feeding (IYCF) practices.',
      agencyId: 'UNICEF',
      defaultIndicators: ['NT_ANT_HA_Z_2', 'NT_ANT_WH_Z_2', 'NT_ANT_WH_Z_3', 'NT_BF_EBF', 'NT_MAD']
    },
    {
      id: 'CME',
      name: 'Child Mortality Estimation (UN IGME)',
      category: 'CHILD_MORTALITY',
      description: 'Under-five mortality rate (U5MR), infant mortality rate (IMR), and neonatal mortality rate (NMR) harmonized by the UN Inter-agency Group.',
      agencyId: 'UNICEF',
      defaultIndicators: ['CME_MRY0T4', 'CME_MRY0', 'CME_MRM0']
    },
    {
      id: 'IMMUNISATION',
      name: 'Immunization Coverage & Zero-Dose Tracking',
      category: 'IMMUNIZATION',
      description: 'Global, regional, and national vaccination rates for DTP1, DTP3, MCV1/Measles, Polio, Rotavirus, and Zero-Dose children.',
      agencyId: 'UNICEF',
      defaultIndicators: ['IM_DTP1', 'IM_DTP3', 'IM_MCV1', 'IM_POL3', 'IM_ROTC']
    },
    {
      id: 'MNCH',
      name: 'Maternal, Newborn & Child Health',
      category: 'MNCH',
      description: 'Antenatal care attendance (ANC4+), skilled birth attendants (SBA), early initiation of breastfeeding (EIBF), and postnatal checks.',
      agencyId: 'UNICEF',
      defaultIndicators: ['MNCH_ANC4', 'MNCH_SBA', 'MNCH_EIBF', 'MNCH_PNC_M']
    },
    {
      id: 'WASH',
      name: 'Water, Sanitation & Hygiene (WHO/UNICEF JMP)',
      category: 'WASH',
      description: 'Household, school, and health care facility access to basic drinking water, safely managed sanitation, and open defecation reduction.',
      agencyId: 'UNICEF',
      defaultIndicators: ['WS_PPL_W-B', 'WS_PPL_S-B', 'WS_PPL_OD']
    },
    {
      id: 'ECD',
      name: 'Early Childhood Development Index 2030 (ECDI2030)',
      category: 'ECD',
      description: 'Population-level tracking of children developmentally on track in health, learning, and psychosocial well-being.',
      agencyId: 'UNICEF',
      defaultIndicators: ['ECD_ECDI2030', 'ECD_CHLD_LRN', 'ECD_CHLD_SOC']
    }
  ] as const;

  /**
   * Core UNICEF Public Health Indicators.
   */
  public readonly coreIndicators: readonly IUnicefIndicator[] = [
    {
      code: 'NT_ANT_HA_Z_2',
      label: 'Stunting Prevalence (Height-for-Age < -2 SD)',
      dataflowId: 'NUTRITION',
      unit: '% of children < 5 years',
      sdgMapping: 'SDG 2.2.1',
      globalTarget2030: 12.0,
      description: 'Chronic undernutrition leading to impaired physical and cognitive growth.'
    },
    {
      code: 'NT_ANT_WH_Z_2',
      label: 'Wasting Prevalence (Weight-for-Height < -2 SD)',
      dataflowId: 'NUTRITION',
      unit: '% of children < 5 years',
      sdgMapping: 'SDG 2.2.2',
      globalTarget2030: 3.0,
      description: 'Acute undernutrition causing rapid weight loss and severe immune vulnerability.'
    },
    {
      code: 'NT_ANT_WH_Z_3',
      label: 'Severe Acute Malnutrition (Weight-for-Height < -3 SD or MUAC < 115mm)',
      dataflowId: 'NUTRITION',
      unit: '% of children < 5 years',
      sdgMapping: 'SDG 2.2.2',
      globalTarget2030: 0.5,
      description: 'Life-threatening severe acute malnutrition requiring therapeutic feeding.'
    },
    {
      code: 'CME_MRY0T4',
      label: 'Under-5 Mortality Rate (U5MR)',
      dataflowId: 'CME',
      unit: 'Deaths per 1,000 live births',
      sdgMapping: 'SDG 3.2.1',
      globalTarget2030: 25.0,
      description: 'Probability of dying between birth and exactly 5 years of age.'
    },
    {
      code: 'CME_MRM0',
      label: 'Neonatal Mortality Rate (NMR)',
      dataflowId: 'CME',
      unit: 'Deaths per 1,000 live births',
      sdgMapping: 'SDG 3.2.2',
      globalTarget2030: 12.0,
      description: 'Probability of dying during the first 28 days of life.'
    },
    {
      code: 'IM_DTP1',
      label: 'DTP1 Coverage (Zero-Dose Marker)',
      dataflowId: 'IMMUNISATION',
      unit: '% of surviving infants',
      sdgMapping: 'SDG 3.b.1',
      globalTarget2030: 95.0,
      description: 'Children missing DTP1 represent zero-dose children deprived of essential immunizations.'
    },
    {
      code: 'IM_DTP3',
      label: 'DTP3 / Pentavalent 3 Full 3-Dose Series',
      dataflowId: 'IMMUNISATION',
      unit: '% of surviving infants',
      sdgMapping: 'SDG 3.b.1',
      globalTarget2030: 90.0,
      description: 'Global benchmark for routine childhood immunization system strength.'
    },
    {
      code: 'IM_MCV1',
      label: 'Measles-Containing Vaccine 1st Dose (MCV1)',
      dataflowId: 'IMMUNISATION',
      unit: '% of surviving infants',
      sdgMapping: 'SDG 3.b.1',
      globalTarget2030: 95.0,
      description: 'Primary protection against highly contagious pediatric measles outbreaks.'
    },
    {
      code: 'NT_BF_EBF',
      label: 'Exclusive Breastfeeding Rate (< 6 months)',
      dataflowId: 'NUTRITION',
      unit: '% of infants 0-5 months',
      sdgMapping: 'SDG 2.2',
      globalTarget2030: 70.0,
      description: 'Infants exclusively breastfed with no complementary foods or liquids.'
    },
    {
      code: 'WS_PPL_W-B',
      label: 'Basic Drinking Water Access',
      dataflowId: 'WASH',
      unit: '% of population',
      sdgMapping: 'SDG 6.1.1',
      globalTarget2030: 100.0,
      description: 'Drinking water from an improved source collected within a 30-minute round trip.'
    },
    {
      code: 'ECD_ECDI2030',
      label: 'Early Childhood Development Index 2030',
      dataflowId: 'ECD',
      unit: '% of children 24-59 months',
      sdgMapping: 'SDG 4.2.1',
      globalTarget2030: 90.0,
      description: 'Children developmentally on track in health, learning, and psychosocial well-being.'
    }
  ] as const;

  /**
   * Pre-Compiled High-Fidelity 2024–2026 UNICEF Global & Regional Benchmark Database.
   * Enables 100% offline functionality in low-connectivity frontline field clinics.
   */
  public readonly regionalProfiles: readonly IUnicefRegionalChildProfile[] = [
    {
      regionCode: 'GLOBAL',
      regionName: 'Global Benchmark (All Countries)',
      underFiveMortalityRatePer1k: 37.1,
      neonatalMortalityRatePer1k: 17.5,
      childStuntingRatePct: 22.3,
      childWastingRatePct: 6.8,
      severeAcuteMalnutritionPct: 1.9,
      zeroDoseChildrenPct: 14.2,
      measlesCoveragePct: 83.0,
      exclusiveBreastfeedingPct: 48.0,
      basicWaterAccessPct: 73.0,
      earlyChildhoodDevelopmentIndex: 75.4,
      priorityInterventions: [
        'Universal primary healthcare task-shifting for community health workers',
        'Routine distribution of Ready-to-Use Therapeutic Food (RUTF) in drought/conflict zones',
        'Catch-up campaigns for zero-dose children missing DTP1/Pentavalent'
      ]
    },
    {
      regionCode: 'SSA_WEST_CENTRAL',
      regionName: 'Sub-Saharan Africa (West & Central)',
      underFiveMortalityRatePer1k: 71.4,
      neonatalMortalityRatePer1k: 28.6,
      childStuntingRatePct: 32.5,
      childWastingRatePct: 8.9,
      severeAcuteMalnutritionPct: 2.7,
      zeroDoseChildrenPct: 28.5,
      measlesCoveragePct: 69.0,
      exclusiveBreastfeedingPct: 34.0,
      basicWaterAccessPct: 56.0,
      earlyChildhoodDevelopmentIndex: 61.2,
      priorityInterventions: [
        'Urgent scale-up of outpatient therapeutic feeding (Plumpy\'Nut) via mobile CHW teams',
        'Zero-dose outreach targeting remote rural settlements and displaced populations',
        'Clean water delivery and household chlorine disinfection (WASH)'
      ]
    },
    {
      regionCode: 'SSA_EAST_SOUTH',
      regionName: 'Sub-Saharan Africa (Eastern & Southern)',
      underFiveMortalityRatePer1k: 51.2,
      neonatalMortalityRatePer1k: 23.4,
      childStuntingRatePct: 31.0,
      childWastingRatePct: 6.1,
      severeAcuteMalnutritionPct: 1.8,
      zeroDoseChildrenPct: 17.2,
      measlesCoveragePct: 78.0,
      exclusiveBreastfeedingPct: 60.0,
      basicWaterAccessPct: 62.0,
      earlyChildhoodDevelopmentIndex: 68.4,
      priorityInterventions: [
        'Maternal and neonatal resuscitation training (Helping Babies Breathe)',
        'Drought-resilient agricultural nutrition and biofortified crops',
        'Expansion of solar direct-drive cold chain refrigerators for remote vaccine posts'
      ]
    },
    {
      regionCode: 'SOUTH_ASIA',
      regionName: 'South Asia (India, Pakistan, Bangladesh, Nepal)',
      underFiveMortalityRatePer1k: 35.8,
      neonatalMortalityRatePer1k: 22.1,
      childStuntingRatePct: 30.7,
      childWastingRatePct: 14.1,
      severeAcuteMalnutritionPct: 4.8,
      zeroDoseChildrenPct: 12.8,
      measlesCoveragePct: 89.0,
      exclusiveBreastfeedingPct: 58.0,
      basicWaterAccessPct: 89.0,
      earlyChildhoodDevelopmentIndex: 72.0,
      priorityInterventions: [
        'Intensive community management of severe and moderate wasting (CMAM)',
        'Reduction of neonatal hypothermia via community Kangaroo Mother Care (KMC)',
        'Maternal micronutrient supplementation (Multiple Micronutrient Supplements - MMS)'
      ]
    },
    {
      regionCode: 'LATIN_AMERICA',
      regionName: 'Latin America & Caribbean',
      underFiveMortalityRatePer1k: 13.8,
      neonatalMortalityRatePer1k: 8.2,
      childStuntingRatePct: 11.5,
      childWastingRatePct: 1.4,
      severeAcuteMalnutritionPct: 0.4,
      zeroDoseChildrenPct: 15.6,
      measlesCoveragePct: 84.0,
      exclusiveBreastfeedingPct: 43.0,
      basicWaterAccessPct: 88.0,
      earlyChildhoodDevelopmentIndex: 82.5,
      priorityInterventions: [
        'Strengthening indigenous community outreach and overcoming rural geographic barriers',
        'Reversing immunization drop-out rates post-pandemic',
        'Combating dual burden of malnutrition (stunting alongside childhood obesity)'
      ]
    },
    {
      regionCode: 'MIDDLE_EAST_NA',
      regionName: 'Middle East & North Africa (MENA)',
      underFiveMortalityRatePer1k: 19.5,
      neonatalMortalityRatePer1k: 11.0,
      childStuntingRatePct: 16.2,
      childWastingRatePct: 6.4,
      severeAcuteMalnutritionPct: 2.1,
      zeroDoseChildrenPct: 14.0,
      measlesCoveragePct: 81.0,
      exclusiveBreastfeedingPct: 36.0,
      basicWaterAccessPct: 86.0,
      earlyChildhoodDevelopmentIndex: 78.1,
      priorityInterventions: [
        'Rebuilding destroyed healthcare infrastructure and cold chains in conflict zones',
        'Emergency trauma and nutritional stabilization centers in Yemen and Syria',
        'Psychosocial trauma support and ECDI2030 early childhood enrichment'
      ]
    },
    {
      regionCode: 'HIGH_INCOME',
      regionName: 'High-Income Jurisdictions (US / EU / Five Eyes Baseline)',
      underFiveMortalityRatePer1k: 4.8,
      neonatalMortalityRatePer1k: 2.9,
      childStuntingRatePct: 2.1,
      childWastingRatePct: 0.5,
      severeAcuteMalnutritionPct: 0.1,
      zeroDoseChildrenPct: 3.2,
      measlesCoveragePct: 93.0,
      exclusiveBreastfeedingPct: 26.0,
      basicWaterAccessPct: 99.5,
      earlyChildhoodDevelopmentIndex: 94.2,
      priorityInterventions: [
        'Combating vaccine hesitancy and misinformation to sustain herd immunity',
        'Supportive breastfeeding workplace policies and paid parental leave',
        'Addressing racial and socioeconomic health disparities in infant mortality'
      ]
    }
  ] as const;

  /**
   * Official UNICEF Supply Division RUTF Outpatient Sachet Dosing Schedule.
   * Product specification: 92g sachet = 500 kcal (~200 kcal/kg/day target).
   */
  public readonly rutfDosingTiers: readonly IUnicefRutfDosageTier[] = [
    { weightMinKg: 3.5, weightMaxKg: 3.9, sachetsPerDay: 1.5, sachetsPerWeek: 11, targetDailyCaloriesKcal: 750 },
    { weightMinKg: 4.0, weightMaxKg: 5.4, sachetsPerDay: 2.0, sachetsPerWeek: 14, targetDailyCaloriesKcal: 1000 },
    { weightMinKg: 5.5, weightMaxKg: 6.9, sachetsPerDay: 2.5, sachetsPerWeek: 18, targetDailyCaloriesKcal: 1250 },
    { weightMinKg: 7.0, weightMaxKg: 8.4, sachetsPerDay: 3.0, sachetsPerWeek: 21, targetDailyCaloriesKcal: 1500 },
    { weightMinKg: 8.5, weightMaxKg: 9.4, sachetsPerDay: 3.5, sachetsPerWeek: 25, targetDailyCaloriesKcal: 1750 },
    { weightMinKg: 9.5, weightMaxKg: 10.4, sachetsPerDay: 4.0, sachetsPerWeek: 28, targetDailyCaloriesKcal: 2000 },
    { weightMinKg: 10.5, weightMaxKg: 11.9, sachetsPerDay: 4.5, sachetsPerWeek: 32, targetDailyCaloriesKcal: 2250 },
    { weightMinKg: 12.0, weightMaxKg: 25.0, sachetsPerDay: 5.0, sachetsPerWeek: 35, targetDailyCaloriesKcal: 2500 }
  ] as const;

  /**
   * Currently active regional child profile.
   */
  public readonly activeRegionalProfile = computed<IUnicefRegionalChildProfile>(() => {
    const code = this.selectedRegionCode();
    const found = this.regionalProfiles.find(r => r.regionCode === code);
    return found || this.regionalProfiles[0];
  });

  /**
   * Returns all available pre-compiled regional profiles.
   */
  public listRegionalProfiles(): readonly IUnicefRegionalChildProfile[] {
    return this.regionalProfiles;
  }

  /**
   * Retrieves a regional benchmark profile by region code.
   */
  public getProfileByRegion(code: string): IUnicefRegionalChildProfile {
    return this.regionalProfiles.find(r => r.regionCode === code) || this.regionalProfiles[0];
  }

  /**
   * Evaluates child triage against UNICEF Severe Acute Malnutrition (SAM) protocols,
   * including the mandatory Inpatient vs Outpatient Appetite Test.
   */
  public evaluateSamAppetiteAndTriage(
    childWeightKg: number,
    muacMm: number,
    bilateralEdemaGrade: 'NONE' | 'GRADE_1' | 'GRADE_2' | 'GRADE_3' = 'NONE',
    appetiteSachetPortionConsumed: number = 0.3, // 0.0 to 1.0
    hasMedicalComplications: boolean = false
  ): IUnicefSamTriageAssessment {
    const wt = Math.max(3.5, childWeightKg);
    const passedAppetite = appetiteSachetPortionConsumed >= 0.25;

    // Determine SAM / MAM / Normal
    const isSam = muacMm < 115 || bilateralEdemaGrade !== 'NONE';
    const isMam = !isSam && muacMm >= 115 && muacMm <= 124;

    // Calculate RUTF dosage according to UNICEF Supply Division Schedule
    const tier = this.rutfDosingTiers.find(t => wt >= t.weightMinKg && wt <= t.weightMaxKg) || this.rutfDosingTiers[1];

    if (isSam) {
      // Inpatient Referral Rule: Failed appetite test, +++ generalized edema, or medical complications
      if (!passedAppetite || bilateralEdemaGrade === 'GRADE_3' || hasMedicalComplications) {
        return {
          childWeightKg: wt,
          muacMm,
          bilateralEdemaGrade,
          appetiteTestPassed: passedAppetite,
          appetiteSachetPortionConsumed,
          hasMedicalComplications,
          disposition: 'INPATIENT_STABILIZATION_PHASE_1',
          dispositionLabel: 'STAT Inpatient Referral (Phase 1 Stabilization)',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-600',
          dailyRutfSachets: 0,
          weeklyRutfSachets: 0,
          therapeuticFeedType: 'F75_THERAPEUTIC_MILK',
          clinicalDirectives: [
            'Immediate transfer to Inpatient Stabilization Center (SC) / District Hospital.',
            'Initiate F-75 Therapeutic Milk (100 kcal/kg/day, low protein, low sodium) in small frequent feeds.',
            'Do NOT administer standard RUTF or high-sodium fluids during acute decompensation.',
            'Administer ReSoMal (oral rehydration solution for severe acute malnutrition) if dehydrated.',
            'Keep child warm: strictly prevent hypothermia (kangaroo mother care / thermal blanket).'
          ]
        };
      }

      // Outpatient Therapeutic Program (OTP) Rule: Good appetite, alert, edema <= Grade 2, no complications
      return {
        childWeightKg: wt,
        muacMm,
        bilateralEdemaGrade,
        appetiteTestPassed: true,
        appetiteSachetPortionConsumed,
        hasMedicalComplications: false,
        disposition: 'OUTPATIENT_THERAPEUTIC_PROGRAM',
        dispositionLabel: 'Outpatient Therapeutic Program (OTP) - Plumpy\'Nut',
        badgeClass: 'bg-rose-900/80 text-rose-200 border-rose-500',
        dailyRutfSachets: tier.sachetsPerDay,
        weeklyRutfSachets: tier.sachetsPerWeek,
        therapeuticFeedType: 'RUTF_PLUMPYNUT',
        clinicalDirectives: [
          `Dispense ${tier.sachetsPerWeek} sachets of UNICEF-spec RUTF (Plumpy\'Nut) for 7 days (${tier.sachetsPerDay} sachets/day).`,
          'Administer 7-day course of routine oral Amoxicillin (50-100 mg/kg/day divided BID).',
          'Single-dose Vitamin A capsule at enrollment (unless edema present or given in past month).',
          'Single-dose Albendazole (200mg if 1-2y; 400mg if >=2y) deworming at 2nd weekly visit.',
          'Instruct mother: RUTF is food and medicine for this sick child only; do not share with siblings; provide plenty of clean potable water.'
        ]
      };
    }

    if (isMam) {
      return {
        childWeightKg: wt,
        muacMm,
        bilateralEdemaGrade: 'NONE',
        appetiteTestPassed: true,
        appetiteSachetPortionConsumed: 1.0,
        hasMedicalComplications: false,
        disposition: 'SUPPLEMENTARY_FEEDING_MAM',
        dispositionLabel: 'Targeted Supplementary Feeding Program (TSFP)',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-600',
        dailyRutfSachets: 1,
        weeklyRutfSachets: 7,
        therapeuticFeedType: 'RUSF_SUPPLEMENTARY',
        clinicalDirectives: [
          'Enroll in Supplementary Feeding Program (1 sachet RUSF or fortified blended food/day).',
          'Provide infant and young child feeding (IYCF) counseling and promote diverse local foods.',
          'Administer deworming and Vitamin A if due.',
          'Follow-up in 14 days to verify weight velocity and prevent deterioration into SAM.'
        ]
      };
    }

    return {
      childWeightKg: wt,
      muacMm,
      bilateralEdemaGrade: 'NONE',
      appetiteTestPassed: true,
      appetiteSachetPortionConsumed: 1.0,
      hasMedicalComplications: false,
      disposition: 'ROUTINE_PREVENTIVE_CARE',
      dispositionLabel: 'Well-Nourished Child (Routine Prevention)',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-600',
      dailyRutfSachets: 0,
      weeklyRutfSachets: 0,
      therapeuticFeedType: 'NONE',
      clinicalDirectives: [
        'Child is well-nourished (MUAC >= 125 mm).',
        'Support continued exclusive breastfeeding up to 6 months and complementary feeding with animal-source foods.',
        'Verify vaccination schedule and provide routine Growth Monitoring and Promotion (GMP).'
      ]
    };
  }

  /**
   * Evaluates child vaccination status against the UNICEF/WHO Expanded Programme on Immunization (EPI)
   * to detect "Zero-Dose" children (missed DTP1/Penta1).
   */
  public evaluateZeroDoseStatus(
    childAgeMonths: number,
    receivedDtp1: boolean,
    receivedDtp3: boolean,
    receivedMcv1: boolean
  ): IZeroDoseScreeningResult {
    const isZeroDose = childAgeMonths >= 2 && !receivedDtp1;
    const isUnderImmunized = !isZeroDose && (
      (childAgeMonths >= 4 && !receivedDtp3) ||
      (childAgeMonths >= 9 && !receivedMcv1)
    );

    const missed: string[] = [];
    if (!receivedDtp1 && childAgeMonths >= 2) missed.push('Pentavalent-1 (DTP-HepB-Hib) + OPV-1 + PCV-1 + Rotavirus-1');
    if (!receivedDtp3 && childAgeMonths >= 4) missed.push('Pentavalent-3 + OPV-3 + IPV + PCV-3');
    if (!receivedMcv1 && childAgeMonths >= 9) missed.push('Measles-Rubella-1 (MR-1) + Vitamin A');

    const directives: string[] = [];
    if (isZeroDose) {
      directives.push('🚨 ZERO-DOSE CHILD ALERT: Patient has missed primary DTP1 vaccination.');
      directives.push('Priority catch-up: Immediately administer Pentavalent-1, OPV-1, PCV-1, and Rotavirus-1.');
      directives.push('Issue Home-Based Child Health Card (Vaccination Record) and schedule 4-week follow-up.');
      directives.push('Flag settlement or household for CHW peer community outreach to screen missed siblings.');
    } else if (isUnderImmunized) {
      directives.push('⚠️ UNDER-IMMUNIZED ALERT: Patient has dropped out after first doses.');
      directives.push(`Administer missing antigens: ${missed.join(', ')}.`);
      directives.push('Reinforce value of completing full 3-dose series to prevent breakthrough pertussis and measles outbreaks.');
    } else {
      directives.push('✅ Immunization status on track for age.');
      directives.push('Maintain scheduled wellness visits and track upcoming milestone vaccines.');
    }

    let statusBadge = 'bg-emerald-950 text-emerald-300 border-emerald-600';
    if (isZeroDose) statusBadge = 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse';
    else if (isUnderImmunized) statusBadge = 'bg-amber-950 text-amber-300 border-amber-600';

    return {
      childAgeMonths,
      receivedDtp1,
      receivedDtp3,
      receivedMcv1,
      isZeroDose,
      isUnderImmunized,
      statusBadge,
      missedVaccines: missed,
      clinicalDirectives: directives
    };
  }

  /**
   * Constructs an official SDMX REST API URL for querying UNICEF indicators.
   * Reference: https://sdmx.data.unicef.org/ws/public/sdmxapi/rest/
   *
   * @param dataflowId e.g. "NUTRITION", "CME", "IMMUNISATION"
   * @param countryOrRegionCode e.g. "GLOBAL", "NER", "YEM", "IND" (omit or '*' for all)
   * @param indicatorCode e.g. "NT_ANT_WH_Z_3"
   */
  public buildSdmxQueryUrl(
    dataflowId: string,
    countryOrRegionCode: string = 'all',
    indicatorCode: string = 'all'
  ): string {
    const country = countryOrRegionCode === 'all' ? '' : countryOrRegionCode;
    const indicator = indicatorCode === 'all' ? '' : indicatorCode;
    const dimensionKey = country && indicator ? `${country}.${indicator}` : (country || indicator || 'all');
    return `${this.sdmxBaseUrl}/data/${dataflowId}/${dimensionKey}?format=sdmx-json&detail=full`;
  }

  /**
   * Executes a live query against the UNICEF SDMX REST API with offline graceful fallback.
   */
  public async fetchLiveSdmxData(
    dataflowId: string,
    countryOrRegionCode: string = 'all',
    indicatorCode: string = 'all'
  ): Promise<{ success: boolean; data: unknown; isFallback: boolean }> {
    this.isQueryingLiveApi.set(true);
    this.liveApiError.set(null);

    const queryUrl = this.buildSdmxQueryUrl(dataflowId, countryOrRegionCode, indicatorCode);

    try {
      if (this.http) {
        const response = await firstValueFrom(this.http.get(queryUrl));
        this.liveApiLastResult.set(response);
        this.isQueryingLiveApi.set(false);
        return { success: true, data: response, isFallback: false };
      } else if (typeof globalThis.fetch === 'function') {
        const res = await globalThis.fetch(queryUrl, {
          headers: { 'Accept': 'application/vnd.sdmx.data+json;version=1.0.0, application/json' }
        });
        if (!res.ok) {
          throw new Error(`UNICEF SDMX API HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        this.liveApiLastResult.set(data);
        this.isQueryingLiveApi.set(false);
        return { success: true, data, isFallback: false };
      } else {
        throw new Error('No HTTP client or fetch available in runtime.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.liveApiError.set(`Offline Fallback Active (${msg}). Showing pre-compiled UNICEF 2024–2026 reference benchmarks.`);
      this.isQueryingLiveApi.set(false);

      // Return local pre-compiled benchmark as graceful fallback
      const fallbackData = this.activeRegionalProfile();
      this.liveApiLastResult.set(fallbackData);
      return { success: true, data: fallbackData, isFallback: true };
    }
  }

  /**
   * Changes the selected benchmarking region.
   */
  public selectRegion(regionCode: string): void {
    this.selectedRegionCode.set(regionCode);
  }
}
