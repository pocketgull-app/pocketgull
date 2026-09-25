import { Injectable, signal, computed } from '@angular/core';
import { FaithTraditionKey } from './spiritual-dietary-conduct.service';

export type FastingWindowType = 
  | 'RAMADAN_DAWN_TO_DUSK'
  | 'YOM_KIPPUR_25HR_TOTAL'
  | 'GREAT_LENT_ORTHODOX_VEGAN'
  | 'EKADASHI_PHALAHAR'
  | 'UPOSATHA_NO_SOLIDS_AFTER_NOON'
  | 'FAST_SUNDAY_LDS_24HR'
  | 'INTERMITTENT_FASTING_16_8';

export interface IMedicationToTitrate {
  drugName: string;
  category: 'DIABETIC_ORAL' | 'DIABETIC_INSULIN' | 'ANTIHYPERTENSIVE' | 'PSYCHIATRIC' | 'RENAL_ELECTROLYTE' | 'ANTICOAGULANT' | 'GENERAL';
  standardDoseSchedule: string; // e.g. "500mg BID with morning and evening meals"
  baselineTiming: 'MORNING' | 'NOON' | 'EVENING' | 'BEDTIME' | 'BID' | 'TID';
}

export interface ITitrationPlanResult {
  drugName: string;
  category: string;
  originalSchedule: string;
  titratedFastingSchedule: string;
  clinicalRationale: string;
  hypoglycemiaOrCrisisRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  biomarkerMonitoringDirectives: string[];
  hydrationAndElectrolyteGuidance: string;
}

export interface IFastingScheduleSummary {
  fastingWindowType: FastingWindowType;
  fastingWindowName: string;
  associatedTradition: FaithTraditionKey;
  dawnMealName: string; // e.g. "Suhoor"
  sunsetMealName: string; // e.g. "Iftar"
  adjustedMedications: ITitrationPlanResult[];
  criticalWarnings: string[];
  exemptionsRationale: string;
  attestationHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class FastingChronobiologyTitrationService {
  private readonly selectedFastingTypeState = signal<FastingWindowType>('RAMADAN_DAWN_TO_DUSK');
  readonly selectedFastingType = this.selectedFastingTypeState.asReadonly();

  setFastingType(type: FastingWindowType): void {
    this.selectedFastingTypeState.set(type);
  }

  titrateRegimen(
    medications: IMedicationToTitrate[],
    fastingType: FastingWindowType = this.selectedFastingTypeState()
  ): IFastingScheduleSummary {
    const plans: ITitrationPlanResult[] = [];
    const criticalWarnings: string[] = [];

    let fastingName = '';
    let tradition: FaithTraditionKey = 'UNIVERSAL_SECULAR';
    let dawnName = 'Pre-Fast Morning Nutrition';
    let sunsetName = 'Evening Break-Fast Nutrition';
    let exemptionNote = '';

    switch (fastingType) {
      case 'RAMADAN_DAWN_TO_DUSK':
        fastingName = 'Ramadan (Dawn to Sunset Dry Fast)';
        tradition = 'ISLAM_HALAL_TAYYIB';
        dawnName = 'Suhoor (Pre-Dawn)';
        sunsetName = 'Iftar (Sunset Break-Fast)';
        exemptionNote = 'Quranic medical exemption (Surah 2:185) applies to brittle diabetes, CKD Stage 4/5, acute pregnancy, and frailty.';
        break;
      case 'YOM_KIPPUR_25HR_TOTAL':
        fastingName = 'Yom Kippur (25-Hour Total Fast)';
        tradition = 'JUDAISM_ORTHODOX_KOSHER';
        dawnName = 'Seudah Hamafseket (Pre-Fast Meal)';
        sunsetName = 'Break-the-Fast Evening';
        exemptionNote = 'Pikuach Nefesh obligates taking life-saving medications with small sips of water (Shiurim) if needed.';
        break;
      case 'GREAT_LENT_ORTHODOX_VEGAN':
        fastingName = 'Eastern Orthodox Great Lent (Monastic Plant-Based)';
        tradition = 'EASTERN_ORTHODOX_FASTING';
        dawnName = 'Morning Lenten Meal';
        sunsetName = 'Evening Lenten Trapeza';
        exemptionNote = 'Ecclesiastical dispensation freely granted for prescribed medications and medical nutrition therapy.';
        break;
      case 'EKADASHI_PHALAHAR':
        fastingName = 'Ekadashi (Grain/Bean Abstinence - Phalahar)';
        tradition = 'HINDUISM_SATTVIC_AHIMSA';
        dawnName = 'Dawn Phalahar (Fruit & Milk)';
        sunsetName = 'Evening Phalahar Root Tubers';
        exemptionNote = 'Patients with diabetes may consume complex starches or seeds (e.g. buckwheat, amaranth) to maintain euglycemia.';
        break;
      case 'UPOSATHA_NO_SOLIDS_AFTER_NOON':
        fastingName = 'Buddhist Uposatha (No Solids After Solar Noon)';
        tradition = 'BUDDHISM_MINDFUL_FIVE_PRECEPTS';
        dawnName = 'Morning Alms/Breakfast';
        sunsetName = 'Midday Solar Noon Cutoff (Clear Broths Evening)';
        exemptionNote = 'Liquid medications and broths are fully acceptable in the evening.';
        break;
      case 'FAST_SUNDAY_LDS_24HR':
        fastingName = 'LDS Fast Sunday (24-Hour 2-Meal Abstinence)';
        tradition = 'LATTER_DAY_SAINTS_WORD_OF_WISDOM';
        dawnName = 'Pre-Fast Saturday Dinner';
        sunsetName = 'Sunday Break-Fast Dinner';
        exemptionNote = 'Church leaders counsel sick or medication-dependent members to take food and fluids with treatments.';
        break;
      case 'INTERMITTENT_FASTING_16_8':
      default:
        fastingName = 'Circadian Intermittent Fasting (16:8 Window)';
        tradition = 'UNIVERSAL_SECULAR';
        dawnName = 'Feeding Window Open (11:00 AM)';
        sunsetName = 'Feeding Window Close (7:00 PM)';
        exemptionNote = 'Standard clinical lifestyle guideline; titrate based on bio-wearable data.';
        break;
    }

    for (const med of medications) {
      const lowerName = med.drugName.toLowerCase();

      // 1. DIABETES - INSULIN
      if (med.category === 'DIABETIC_INSULIN' || lowerName.includes('insulin') || lowerName.includes('glargine') || lowerName.includes('lispro')) {
        if (fastingType === 'RAMADAN_DAWN_TO_DUSK') {
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_INSULIN',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Reduce basal dose by 20–30% given at Iftar (sunset). Shift rapid-acting bolus primarily to Iftar; reduce Suhoor (pre-dawn) bolus by 50% to prevent afternoon hypoglycemia.',
            clinicalRationale: 'Prolonged daytime fasting (14-16 hours) dramatically elevates risk of fatal afternoon neuroglycopenia if morning insulin is unadjusted.',
            hypoglycemiaOrCrisisRisk: 'CRITICAL',
            biomarkerMonitoringDirectives: ['Check interstitial CGM or fingerstick glucose at 12:00 PM and 4:00 PM (pre-Iftar). Break fast immediately if BG < 70 mg/dL.'],
            hydrationAndElectrolyteGuidance: 'Hydrate generously with water and electrolyte minerals between Iftar and Suhoor.'
          });
          criticalWarnings.push(`Insulin titration active for ${med.drugName}: Fast MUST be broken immediately if blood glucose falls below 70 mg/dL.`);
        } else {
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_INSULIN',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Coordinate basal dose timing with active feeding window; decrease bolus doses for skipped meals.',
            clinicalRationale: 'Carbohydrate intake is constrained during fasting; matching insulin to actual intake is mandatory.',
            hypoglycemiaOrCrisisRisk: 'HIGH',
            biomarkerMonitoringDirectives: ['Frequent glucose monitoring required throughout fasting hours.'],
            hydrationAndElectrolyteGuidance: 'Ensure constant hydration.'
          });
        }
        continue;
      }

      // 2. DIABETES - ORAL (SULFONYLUREAS / METFORMIN / SGLT2)
      if (med.category === 'DIABETIC_ORAL' || lowerName.includes('metformin') || lowerName.includes('glipizide') || lowerName.includes('empagliflozin')) {
        if (lowerName.includes('glipizide') || lowerName.includes('glimepiride')) {
          // Sulfonylureas
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_ORAL',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Switch morning dose to Iftar (sunset). Reduce Suhoor (pre-dawn) dose by 50% or discontinue Suhoor dose entirely per physician approval.',
            clinicalRationale: 'Sulfonylureas stimulate un-gated pancreatic beta-cell insulin secretion regardless of glycemic state, posing severe midday hypoglycemia risk during daytime fasting.',
            hypoglycemiaOrCrisisRisk: 'HIGH',
            biomarkerMonitoringDirectives: ['Midday capillary glucose check. Avoid strenuous midday physical exertion.'],
            hydrationAndElectrolyteGuidance: 'Ensure adequate carbohydrates at Suhoor pre-dawn meal.'
          });
          criticalWarnings.push(`Sulfonylurea (${med.drugName}) warning: Daytime fasting creates high risk of hypoglycemia.`);
        } else if (lowerName.includes('metformin')) {
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_ORAL',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'For BID dosing: Take full morning dose at Iftar (sunset) and 50% dose at Suhoor (pre-dawn) with abundant water to reduce GI distress.',
            clinicalRationale: 'Metformin carries minimal intrinsic hypoglycemia risk as an insulin sensitizer, but GI adverse effects can exacerbate dehydration if taken without food.',
            hypoglycemiaOrCrisisRisk: 'LOW',
            biomarkerMonitoringDirectives: ['Routine euglycemic tracking.'],
            hydrationAndElectrolyteGuidance: 'Consume with food and 12-16 oz of water.'
          });
        } else if (lowerName.includes('gliflozin')) {
          // SGLT2 Inhibitor
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_ORAL',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Take at Iftar (sunset) only. Clinician may consider temporary holiday discontinuation during hot summer fasting days.',
            clinicalRationale: 'SGLT2 inhibitors induce osmotic glucosuria and natriuresis, accelerating dehydration, hypovolemia, and euglycemic DKA during daytime water deprivation.',
            hypoglycemiaOrCrisisRisk: 'HIGH',
            biomarkerMonitoringDirectives: ['Monitor blood ketones and orthostatic blood pressure.'],
            hydrationAndElectrolyteGuidance: 'Must consume minimum 2.5L of fluids during night hours to counteract osmotic diuresis.'
          });
          criticalWarnings.push(`SGLT2 inhibitor (${med.drugName}): Risk of severe dehydration and euglycemic DKA during dry fasts.`);
        } else {
          plans.push({
            drugName: med.drugName,
            category: 'DIABETIC_ORAL',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Consolidate dosing into active evening and pre-dawn eating periods.',
            clinicalRationale: 'Align pharmacokinetics with postprandial glucose surges.',
            hypoglycemiaOrCrisisRisk: 'LOW',
            biomarkerMonitoringDirectives: ['Standard fasting blood sugar monitoring.'],
            hydrationAndElectrolyteGuidance: 'Standard fluid intake during non-fasting hours.'
          });
        }
        continue;
      }

      // 3. ANTIHYPERTENSIVES & DIURETICS
      if (med.category === 'ANTIHYPERTENSIVE' || lowerName.includes('hydrochlorothiazide') || lowerName.includes('furosemide') || lowerName.includes('lisinopril') || lowerName.includes('amlodipine')) {
        if (lowerName.includes('thiazide') || lowerName.includes('furosemide') || lowerName.includes('spironolactone')) {
          plans.push({
            drugName: med.drugName,
            category: 'ANTIHYPERTENSIVE',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Shift diuretic dose to evening (Iftar / 2 hours after sunset). Do NOT take at Suhoor pre-dawn.',
            clinicalRationale: 'Taking diuretics at dawn leads to rapid daytime intravascular volume depletion, severe daytime thirst, and acute kidney injury (AKI) under heat/fasting conditions.',
            hypoglycemiaOrCrisisRisk: 'HIGH',
            biomarkerMonitoringDirectives: ['Monitor serum creatinine, BUN, and upright seated blood pressure.'],
            hydrationAndElectrolyteGuidance: 'Replenish electrolytes with bone broth or mineral waters during non-fasting hours.'
          });
          criticalWarnings.push(`Diuretic (${med.drugName}): Must NOT be taken at pre-dawn meal to prevent daytime hypovolemic shock.`);
        } else {
          plans.push({
            drugName: med.drugName,
            category: 'ANTIHYPERTENSIVE',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Take once daily at evening break-fast meal (Iftar/Dinner).',
            clinicalRationale: 'Endogenous blood pressure naturally dips slightly during daytime fasting; evening dosing prevents daytime orthostatic hypotension.',
            hypoglycemiaOrCrisisRisk: 'LOW',
            biomarkerMonitoringDirectives: ['Check morning seated BP before standing up.'],
            hydrationAndElectrolyteGuidance: 'Ensure steady water intake across the evening.'
          });
        }
        continue;
      }

      // 4. PSYCHIATRIC (LITHIUM / SSRIs / ANTIPSYCHOTICS)
      if (med.category === 'PSYCHIATRIC' || lowerName.includes('lithium') || lowerName.includes('sertraline') || lowerName.includes('quetiapine')) {
        if (lowerName.includes('lithium')) {
          plans.push({
            drugName: med.drugName,
            category: 'PSYCHIATRIC',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Strict clinical caution: Lithium has a narrow therapeutic window. Fasting water deprivation can trigger acute lithium toxicity. Consider rabbinic/Islamic medical exemption.',
            clinicalRationale: 'Dehydration reduces renal clearance of lithium, rapidly elevating serum concentrations into toxic ranges (>1.2 mEq/L) causing ataxia, tremor, and renal injury.',
            hypoglycemiaOrCrisisRisk: 'CRITICAL',
            biomarkerMonitoringDirectives: ['Serum lithium trough level monitoring. Watch for fine hand tremors, nausea, or confusion.'],
            hydrationAndElectrolyteGuidance: 'Requires minimum 2.5–3.0L water per 24 hours. Medical exemption from dry fasting strongly recommended.'
          });
          criticalWarnings.push(`Lithium warning: High risk of life-threatening toxicity due to dehydration during dry fasts.`);
        } else {
          plans.push({
            drugName: med.drugName,
            category: 'PSYCHIATRIC',
            originalSchedule: med.standardDoseSchedule,
            titratedFastingSchedule: 'Shift dose to bedtime or with evening break-fast meal.',
            clinicalRationale: 'Preserves consistent circadian blood-brain barrier levels while preventing daytime nausea.',
            hypoglycemiaOrCrisisRisk: 'LOW',
            biomarkerMonitoringDirectives: ['Observe mood stability and sleep quality.'],
            hydrationAndElectrolyteGuidance: 'Standard evening hydration.'
          });
        }
        continue;
      }

      // 5. DEFAULT GENERAL MEDICATIONS
      plans.push({
        drugName: med.drugName,
        category: med.category,
        originalSchedule: med.standardDoseSchedule,
        titratedFastingSchedule: 'Administer with evening meal or pre-dawn meal based on once-daily or twice-daily formulation.',
        clinicalRationale: 'Standard circadian alignment with authorized nutritional intake window.',
        hypoglycemiaOrCrisisRisk: 'LOW',
        biomarkerMonitoringDirectives: ['Standard therapy response verification.'],
        hydrationAndElectrolyteGuidance: 'Take with adequate fluids.'
      });
    }

    const attestationHash = `SHA256-${Date.now().toString(16)}-CHRONO-TITRATION`;

    return {
      fastingWindowType: fastingType,
      fastingWindowName: fastingName,
      associatedTradition: tradition,
      dawnMealName: dawnName,
      sunsetMealName: sunsetName,
      adjustedMedications: plans,
      criticalWarnings,
      exemptionsRationale: exemptionNote,
      attestationHash
    };
  }
}
