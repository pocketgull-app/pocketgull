import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export interface ICircadianNutritionalStatus {
  currentHour: number;
  circadianPhase: 'Morning_Metabolic_Peak' | 'Midday_Sustained' | 'Dusk_Tapering' | 'Melatonin_Fast_Window';
  insulinSensitivityMultiplier: number; // 0.4 (late night) to 1.8 (early morning)
  melatoninLevelEstimate: 'Suppressed' | 'Rising' | 'Peak_Nocturnal';
  mtnr1bInterlockActive: boolean;
  recommendedMealType: 'Robust_Nutrient_Dense_Breakfast' | 'Balanced_Midday_Sustenance' | 'Light_Protein_Vegetable_Supper' | 'Cellular_Autophagy_Fast';
  optimalEatingWindow: {
    startHour: number; // e.g. 8 (8:00 AM)
    endHour: number; // e.g. 17 (5:00 PM)
    windowDurationHours: number;
    hoursRemainingInWindow: number;
  };
  lateNightConflictDetected: boolean;
  circadianPacingDirective: string;
}

@Injectable({
  providedIn: 'root'
})
export class CircadianChronoNutritionService {
  private readonly patientState = inject(PatientStateService);

  readonly hasMtnr1bRiskAllele = signal<boolean>(true); // Common variant in metabolic syndrome
  readonly simulatedHourOverride = signal<number | null>(null);

  readonly currentStatus = computed<ICircadianNutritionalStatus>(() => {
    const d = new Date();
    const currentHour = this.simulatedHourOverride() !== null ? this.simulatedHourOverride()! : d.getHours();

    let phase: ICircadianNutritionalStatus['circadianPhase'] = 'Midday_Sustained';
    let siMultiplier = 1.2;
    let melatonin: ICircadianNutritionalStatus['melatoninLevelEstimate'] = 'Suppressed';
    let mealType: ICircadianNutritionalStatus['recommendedMealType'] = 'Balanced_Midday_Sustenance';
    let conflict = false;

    if (currentHour >= 6 && currentHour < 11) {
      phase = 'Morning_Metabolic_Peak';
      siMultiplier = 1.8; // Peak GLUT4 translocation & insulin sensitivity
      melatonin = 'Suppressed';
      mealType = 'Robust_Nutrient_Dense_Breakfast';
    } else if (currentHour >= 11 && currentHour < 16) {
      phase = 'Midday_Sustained';
      siMultiplier = 1.4;
      melatonin = 'Suppressed';
      mealType = 'Balanced_Midday_Sustenance';
    } else if (currentHour >= 16 && currentHour < 20) {
      phase = 'Dusk_Tapering';
      siMultiplier = 0.9;
      melatonin = 'Rising';
      mealType = 'Light_Protein_Vegetable_Supper';
    } else {
      // 20:00 to 05:59
      phase = 'Melatonin_Fast_Window';
      siMultiplier = 0.4; // Nocturnal beta-cell desensitization
      melatonin = 'Peak_Nocturnal';
      mealType = 'Cellular_Autophagy_Fast';
      conflict = true;
    }

    const startHour = 8;
    const endHour = 17; // 9-hour eTRF window
    const duration = endHour - startHour;
    const remaining = Math.max(0, endHour - currentHour);

    const mtnr1bActive = this.hasMtnr1bRiskAllele() && (melatonin === 'Rising' || melatonin === 'Peak_Nocturnal');

    let directive = 'Circadian metabolic sync optimal. Maintain protein & low-GI complex carbs during daytime peak.';
    if (phase === 'Melatonin_Fast_Window') {
      directive = mtnr1bActive
        ? '⚠️ Critical MTNR1B Melatonin Interlock: Nocturnal melatonin suppresses pancreatic beta-cell insulin secretion. Avoid late carbohydrates to prevent prolonged nocturnal hyperglycemia (>160 mg/dL).'
        : 'Biological Fasting Window: Digestive organs entering cellular autophagy and glymphatic clearance. Water or herbal chamomile/hibiscus only.';
    } else if (phase === 'Dusk_Tapering') {
      directive = 'Metabolic twilight: Insulin sensitivity tapering. Prioritize leafy greens, healthy fats, and lean protein over dense starches.';
    }

    return {
      currentHour,
      circadianPhase: phase,
      insulinSensitivityMultiplier: siMultiplier,
      melatoninLevelEstimate: melatonin,
      mtnr1bInterlockActive: mtnr1bActive,
      recommendedMealType: mealType,
      optimalEatingWindow: {
        startHour,
        endHour,
        windowDurationHours: duration,
        hoursRemainingInWindow: remaining
      },
      lateNightConflictDetected: conflict,
      circadianPacingDirective: directive
    };
  });

  /**
   * Override simulated hour for clinical testing.
   */
  setSimulatedHour(hour: number | null): void {
    this.simulatedHourOverride.set(hour);
  }

  /**
   * Toggle MTNR1B risk allele presence.
   */
  setMtnr1bAllele(present: boolean): void {
    this.hasMtnr1bRiskAllele.set(present);
  }

  /**
   * Evaluate a prospective meal against current circadian phase.
   */
  evaluateMealTimingRisk(netCarbsGrams: number): {
    approved: boolean;
    severity: 'Safe' | 'Caution' | 'Contraindicated';
    projectedInsulinDemandMultiplier: number;
    guidance: string;
  } {
    const status = this.currentStatus();
    const effectiveInsulinDemand = Math.round((1.0 / status.insulinSensitivityMultiplier) * 100) / 100;

    if (status.lateNightConflictDetected && netCarbsGrams > 25) {
      return {
        approved: false,
        severity: 'Contraindicated',
        projectedInsulinDemandMultiplier: effectiveInsulinDemand,
        guidance: `High carbohydrate intake (${netCarbsGrams}g) during peak nocturnal melatonin window requires ${effectiveInsulinDemand}x insulin demand, precipitating severe morning fasting insulin resistance.`
      };
    }

    if (status.circadianPhase === 'Dusk_Tapering' && netCarbsGrams > 45) {
      return {
        approved: true,
        severity: 'Caution',
        projectedInsulinDemandMultiplier: effectiveInsulinDemand,
        guidance: 'Carbohydrate load exceeds dusk tapering threshold. Consider reducing portion by 30% or adding a brisk 10-minute walk before bed.'
      };
    }

    return {
      approved: true,
      severity: 'Safe',
      projectedInsulinDemandMultiplier: effectiveInsulinDemand,
      guidance: 'Meal timing perfectly aligned with circadian metabolic window. Robust pancreatic response expected.'
    };
  }
}
