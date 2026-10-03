/**
 * Pediatric Dosing Engine Service
 * 
 * Clinical & Statutory Standards:
 * 1. WHO Model List of Essential Medicines for Children (EMLc 9th Edition, 2023/2024).
 * 2. WHO Integrated Management of Childhood Illness (IMCI) Clinical Guidelines:
 *    - Weight- and age-banded Artemisinin-based Combination Therapy (ACT: Artemether + Lumefantrine Coartem).
 *    - WHO Reduced Osmolarity Oral Rehydration Salts (ORS 245 mOsm/L) Plan A, B, and C protocols.
 *    - Zinc Sulfate dispersible tablet adjunct therapy (14-day mandatory course).
 *    - Amoxicillin dispersible tablets for fast-breathing non-severe pneumonia.
 * 3. ISMP High-Risk Pediatric Medication Safety Directives:
 *    - Prohibits trailing zeroes (e.g. 5 mg, never 5.0 mg) and naked decimals (0.5 mg, never .5 mg).
 *    - Strict weight-based safeguards and dispersible tablet administration guidance.
 */

import { Injectable, signal, computed } from '@angular/core';

export type PediatricMedicationKey =
  | 'artemether_lumefantrine'
  | 'ors_rehydration'
  | 'zinc_sulfate'
  | 'amoxicillin_dispersible';

export interface IArtemetherLumefantrineDose {
  weightKg: number;
  weightBandLabel: string;
  tabletsPerDose: number;
  totalTablets: number;
  strengthMg: string; // "20 mg Artemether / 120 mg Lumefantrine"
  scheduleDescription: string;
  scheduleHours: number[]; // [0, 8, 24, 36, 48, 60]
  isEligible: boolean;
  specialWarning: string | null;
  preparationAdvice: string;
  vomitRuleAdvice: string;
}

export interface IOrsCalculation {
  weightKg: number;
  plan: 'PLAN_A' | 'PLAN_B' | 'PLAN_C';
  planLabel: string;
  totalVolumeMl4Hours: number; // For Plan B
  hourlyRateMlHour: number;     // For Plan B
  perStoolVolumeMl: string;    // For Plan A
  ivFluidVolumeMl: number;     // For Plan C
  firstPhaseDuration: string;  // For Plan C
  secondPhaseDuration: string; // For Plan C
  sachetsToPrepare: number;
  mixingInstructions: string;
  zincAdjunctRequired: boolean;
  clinicalMonitoringRule: string;
}

export interface IZincDose {
  ageMonths: number;
  dailyDoseMg: number;
  tabletsPerDay: number; // 20 mg dispersible tablets
  tabletFractionLabel: string; // "1/2 tablet" or "1 tablet"
  durationDays: number; // 14 days
  totalTabletsDispensed: number;
  administrationGuidance: string;
  clinicalImpactSummary: string;
}

export interface IAmoxicillinDose {
  weightKg: number;
  ageMonths: number;
  tabletsPerDose: number; // 250 mg dispersible tablet
  doseMg: number;
  frequency: string; // "Twice daily (every 12 hours)"
  durationDays: number; // 5 days
  totalTabletsDispensed: number;
  administrationGuidance: string;
  clinicalIndication: string;
}

@Injectable({
  providedIn: 'root'
})
export class PediatricDosingEngineService {

  // Patient Weight & Age Inputs
  readonly childWeightKg = signal<number>(10.0);
  readonly childAgeMonths = signal<number>(18);

  // Active Selected Formulary Module
  readonly selectedMedication = signal<PediatricMedicationKey>('artemether_lumefantrine');

  // Active Dehydration Clinical Plan Selection
  readonly orsPlan = signal<'PLAN_A' | 'PLAN_B' | 'PLAN_C'>('PLAN_B');

  // ────────────────────────────────────────────────────────────────────────
  // Computed Module 1: Artemether + Lumefantrine (Coartem)
  // ────────────────────────────────────────────────────────────────────────

  readonly artemetherLumefantrine = computed<IArtemetherLumefantrineDose>(() => {
    const wt = this.childWeightKg();

    if (wt < 5.0) {
      return {
        weightKg: wt,
        weightBandLabel: '<5 kg (Infant / Low Birthweight)',
        tabletsPerDose: 0,
        totalTablets: 0,
        strengthMg: '20 mg Artemether / 120 mg Lumefantrine',
        scheduleDescription: 'Not routinely recommended for infants under 5 kg without pediatric specialist consultation.',
        scheduleHours: [],
        isEligible: false,
        specialWarning: '⚠️ Patient under 5 kg: WHO guidelines recommend expert referral or alternative therapy (e.g. Quinine or Artesunate if severe).',
        preparationAdvice: 'Consult referral hospital for tailored micro-dosing.',
        vomitRuleAdvice: 'N/A'
      };
    }

    let tabletsPerDose = 1;
    let bandLabel = '5 to <15 kg (5–35 months)';

    if (wt >= 35.0) {
      tabletsPerDose = 4;
      bandLabel = '≥35 kg (>12 years & adolescents)';
    } else if (wt >= 25.0) {
      tabletsPerDose = 3;
      bandLabel = '25 to <35 kg (9–12 years)';
    } else if (wt >= 15.0) {
      tabletsPerDose = 2;
      bandLabel = '15 to <25 kg (3–8 years)';
    }

    const totalTablets = tabletsPerDose * 6;

    return {
      weightKg: wt,
      weightBandLabel: bandLabel,
      tabletsPerDose,
      totalTablets,
      strengthMg: '20 mg Artemether / 120 mg Lumefantrine dispersible tablet',
      scheduleDescription: `${tabletsPerDose} tablet(s) per dose: 6 doses over 3 days (Hour 0, 8, 24, 36, 48, 60)`,
      scheduleHours: [0, 8, 24, 36, 48, 60],
      isEligible: true,
      specialWarning: null,
      preparationAdvice: 'Crush or dissolve dispersible tablet in 5–10 mL of clean water or breastmilk. ALWAYS administer with milk or a meal containing fat (essential for Lumefantrine bioavailability).',
      vomitRuleAdvice: '🚨 VOMIT PROTOCOL: If the child vomits within 1 hour of taking the dose, repeat the full dose immediately. If vomited again, seek urgent hospital referral.'
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // Computed Module 2: WHO Reduced Osmolarity ORS
  // ────────────────────────────────────────────────────────────────────────

  readonly orsCalculation = computed<IOrsCalculation>(() => {
    const wt = this.childWeightKg();
    const age = this.childAgeMonths();
    const plan = this.orsPlan();

    // Plan B formula: 75 mL/kg over 4 hours
    const planBTotal = Math.round(wt * 75);
    const planBHourly = Math.round(planBTotal / 4);

    // Plan C formula: 100 mL/kg IV Ringer's Lactate
    const planCTotal = Math.round(wt * 100);

    let planLabel = 'Plan B: Some Dehydration (4-Hour Facility Oral Rehydration)';
    let sachets = Math.ceil(planBTotal / 1000);
    let perStool = '50–100 mL after each loose stool';
    let monitoring = 'Reassess hydration status every 1–2 hours. Switch to Plan A once fully rehydrated.';

    if (plan === 'PLAN_A') {
      planLabel = 'Plan A: No Dehydration (Home Diarrhea Fluid Maintenance)';
      if (age < 24) {
        perStool = '50–100 mL after each loose stool (up to 500 mL/day)';
      } else if (age < 120) {
        perStool = '100–200 mL after each loose stool (up to 1000 mL/day)';
      } else {
        perStool = 'As much as desired (up to 2000 mL/day)';
      }
      sachets = 1;
      monitoring = 'Continue regular feeding/breastfeeding. Instruct caregiver on dehydration danger signs (lethargy, sunken eyes, inability to drink).';
    } else if (plan === 'PLAN_C') {
      planLabel = 'Plan C: Severe Dehydration (STAT IV Fluid Resuscitation)';
      sachets = 0;
      monitoring = '🚨 MEDICAL EMERGENCY: Start IV Ringer\'s Lactate or Normal Saline STAT. Reassess pulse and capillary refill every 15 minutes.';
    }

    const isInfant = age < 12;
    const firstPhase = isInfant ? '30 mL/kg over 1 hour' : '30 mL/kg over 30 minutes';
    const secondPhase = isInfant ? '70 mL/kg over 5 hours (total 6 hours)' : '70 mL/kg over 2.5 hours (total 3 hours)';

    return {
      weightKg: wt,
      plan,
      planLabel,
      totalVolumeMl4Hours: plan === 'PLAN_B' ? planBTotal : 0,
      hourlyRateMlHour: plan === 'PLAN_B' ? planBHourly : 0,
      perStoolVolumeMl: perStool,
      ivFluidVolumeMl: plan === 'PLAN_C' ? planCTotal : 0,
      firstPhaseDuration: firstPhase,
      secondPhaseDuration: secondPhase,
      sachetsToPrepare: Math.max(1, sachets),
      mixingInstructions: 'Dissolve exactly 1 sachet in exactly 1.0 Liter (1000 mL) of clean boiled or potable water. Stir thoroughly until completely dissolved. Discard unused solution after 24 hours.',
      zincAdjunctRequired: true,
      clinicalMonitoringRule: monitoring
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // Computed Module 3: Zinc Sulfate Dispersible Tablets
  // ────────────────────────────────────────────────────────────────────────

  readonly zincDose = computed<IZincDose>(() => {
    const age = this.childAgeMonths();

    const isInfantUnder6Mo = age < 6;
    const dailyDoseMg = isInfantUnder6Mo ? 10 : 20;
    const fraction = isInfantUnder6Mo ? '1/2 tablet' : '1 tablet';
    const tabletsPerDay = isInfantUnder6Mo ? 0.5 : 1;
    const totalTablets = isInfantUnder6Mo ? 7 : 14;

    return {
      ageMonths: age,
      dailyDoseMg,
      tabletsPerDay,
      tabletFractionLabel: fraction,
      durationDays: 14,
      totalTabletsDispensed: totalTablets,
      administrationGuidance: `Place ${fraction} (20 mg dispersible tablet) in a small spoon with 5 mL clean water, ORS, or breastmilk. It dissolves in under 60 seconds. Administer once daily.`,
      clinicalImpactSummary: 'WHO EMLc Essential Diarrhea Adjunct: Reduces episode duration by 25%, decreases stool volume by 30%, and prevents recurrent diarrheal episodes for up to 3 months. Complete the full 14-day course even after diarrhea stops.'
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // Computed Module 4: Amoxicillin Dispersible (WHO IMCI Fast-Breathing Pneumonia)
  // ────────────────────────────────────────────────────────────────────────

  readonly amoxicillinDose = computed<IAmoxicillinDose>(() => {
    const wt = this.childWeightKg();
    const age = this.childAgeMonths();

    // WHO IMCI: 40-50 mg/kg/dose BID (or 250mg dispersible tab: <10kg -> 1 tab BID; >=10kg -> 2 tabs BID)
    let tabletsPerDose = 1;
    let doseMg = 250;

    if (wt >= 10.0 || age >= 12) {
      tabletsPerDose = 2;
      doseMg = 500;
    }

    const totalTablets = tabletsPerDose * 2 * 5; // BID x 5 days

    return {
      weightKg: wt,
      ageMonths: age,
      tabletsPerDose,
      doseMg,
      frequency: 'Twice daily (every 12 hours) with or without food',
      durationDays: 5,
      totalTabletsDispensed: totalTablets,
      administrationGuidance: `Administer ${tabletsPerDose} tablet(s) (250 mg dispersible) twice daily for 5 full days. Dissolve in 5–10 mL clean water or allow child to chew.`,
      clinicalIndication: 'WHO IMCI First-Line Antibiotic for Fast-Breathing Pneumonia (without chest indrawing or general danger signs). Reassess after 48–72 hours.'
    };
  });

  // ────────────────────────────────────────────────────────────────────────
  // State Mutation Helpers
  // ────────────────────────────────────────────────────────────────────────

  public setWeightKg(kg: number): void {
    const bounded = Math.max(2.0, Math.min(60.0, Number(kg.toFixed(1))));
    this.childWeightKg.set(bounded);
  }

  public setAgeMonths(months: number): void {
    const bounded = Math.max(0, Math.min(180, Math.round(months)));
    this.childAgeMonths.set(bounded);
  }

  public setSelectedMedication(med: PediatricMedicationKey): void {
    this.selectedMedication.set(med);
  }

  public setOrsPlan(plan: 'PLAN_A' | 'PLAN_B' | 'PLAN_C'): void {
    this.orsPlan.set(plan);
  }
}
