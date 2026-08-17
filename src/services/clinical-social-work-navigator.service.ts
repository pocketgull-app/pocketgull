import { Injectable, signal } from '@angular/core';

export interface ISdohPatientProfile {
  patientAge: number;
  housingStatus: 'Housed_Stable' | 'At_Risk_Of_Eviction' | 'Unhoused_Sheltered' | 'Unhoused_Unsheltered';
  foodSecurityLevel: 'Food_Secure' | 'Marginal_Food_Insecure' | 'Severe_Hunger_Skip_Meals';
  transportationAccess: 'Reliable_Personal_Vehicle' | 'Public_Transit_Dependent' | 'Zero_Transportation_Barrier';
  utilityInsecurity: boolean; // Gas/Electric shutoff risk
  caregiverSupportStatus: 'Supported_By_Family' | 'Living_Alone_Isolated' | 'Sole_Caregiver_High_Strain';
  caregiverSubjectiveBurdenScore?: number; // 0 to 88 on Zarit scale
  insuranceCoverage: 'Commercial' | 'Medicare_Only' | 'Medicaid_Dual_Eligible' | 'Uninsured';
  recentHospitalAdmissionsLast12Months: number;
}

export interface IClinicalSocialWorkReport {
  reportId: string;
  generatedAt: string;
  sdohRiskTier: 'LOW_VULNERABILITY' | 'MODERATE_NEEDS' | 'HIGH_CRITICAL_RISK';
  icd10ZCodeAssignments: Array<{
    zCode: string;
    description: string;
    clinicalJustification: string;
  }>;
  communityResourceActionPlan: {
    emergencyFoodAndNutritionLinkages: string[];
    housingAndUtilityAssistanceDirectives: string[];
    transportationAndAccessSolutions: string[];
    medicaidWaiverAndDualEligiblePrograms: string[];
  };
  caregiverRespitePlan?: {
    zaritBurdenSeverity: 'MILD' | 'MODERATE' | 'SEVERE_BURNOUT_RISK';
    recommendedRespiteHoursPerWeek: number;
    adultDayHealthCareEligibility: boolean;
  };
  dischargeSafetyReadmissionRisk: {
    estimated30DayReadmissionRiskPercent: number;
    primaryNonClinicalReadmissionDriver: string;
    mitigatingSocialIntervention: string;
  };
  socialWorkerVicariousTraumaShield: {
    administrativeDocumentationReductionMinutes: number;
    somaticDecompressionGuidance: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClinicalSocialWorkNavigatorService {
  readonly activeReports = signal<IClinicalSocialWorkReport[]>([]);

  /**
   * Synthesizes social determinants of health (SDoH), PRAPARE screening indicators,
   * ICD-10 Z-codes, community resource linkages, and caregiver burden mitigation.
   */
  evaluateSocialWorkNeeds(profile: ISdohPatientProfile): IClinicalSocialWorkReport {
    const zCodes: IClinicalSocialWorkReport['icd10ZCodeAssignments'] = [];

    // 1. Evaluate Housing
    if (profile.housingStatus === 'Unhoused_Unsheltered' || profile.housingStatus === 'Unhoused_Sheltered') {
      zCodes.push({
        zCode: 'Z59.00',
        description: 'Homelessness, unspecified',
        clinicalJustification: 'Patient lacks fixed, regular, and adequate nighttime residence.'
      });
    } else if (profile.housingStatus === 'At_Risk_Of_Eviction') {
      zCodes.push({
        zCode: 'Z59.81',
        description: 'Housing instability, housed, with risk of homelessness',
        clinicalJustification: 'Imminent risk of eviction or severe rent burden.'
      });
    }

    // 2. Evaluate Food Security
    if (profile.foodSecurityLevel === 'Severe_Hunger_Skip_Meals') {
      zCodes.push({
        zCode: 'Z59.41',
        description: 'Food insecurity',
        clinicalJustification: 'Patient routinely skips meals or lacks funds to purchase nutritious groceries.'
      });
    }

    // 3. Evaluate Utilities
    if (profile.utilityInsecurity) {
      zCodes.push({
        zCode: 'Z59.87',
        description: 'Material hardship, lack of basic utility service',
        clinicalJustification: 'Notice of impending electricity or heating shutoff.'
      });
    }

    // 4. Evaluate Transportation
    if (profile.transportationAccess === 'Zero_Transportation_Barrier') {
      zCodes.push({
        zCode: 'Z59.82',
        description: 'Transportation insecurity',
        clinicalJustification: 'Unable to attend clinical appointments or fill prescriptions due to lack of transport.'
      });
    }

    // 5. Evaluate Caregiver / Social Isolation
    if (profile.caregiverSupportStatus === 'Sole_Caregiver_High_Strain') {
      zCodes.push({
        zCode: 'Z63.6',
        description: 'Other specified problems with primary support group (Caregiver Strain)',
        clinicalJustification: 'Primary family caregiver experiencing significant physical and psychological fatigue.'
      });
    } else if (profile.caregiverSupportStatus === 'Living_Alone_Isolated') {
      zCodes.push({
        zCode: 'Z60.2',
        description: 'Problems related to living alone',
        clinicalJustification: 'Social isolation elevating risk of unmonitored falls and medication non-adherence.'
      });
    }

    // 6. Compute SDoH Risk Tier
    const zCount = zCodes.length;
    let riskTier: IClinicalSocialWorkReport['sdohRiskTier'] = 'LOW_VULNERABILITY';
    if (zCount >= 3 || profile.housingStatus.includes('Unhoused')) {
      riskTier = 'HIGH_CRITICAL_RISK';
    } else if (zCount >= 1) {
      riskTier = 'MODERATE_NEEDS';
    }

    // 7. Caregiver Respite Calculation (Zarit Scale)
    let respitePlan: IClinicalSocialWorkReport['caregiverRespitePlan'];
    if (profile.caregiverSubjectiveBurdenScore !== undefined || profile.caregiverSupportStatus === 'Sole_Caregiver_High_Strain') {
      const zarit = profile.caregiverSubjectiveBurdenScore || 52;
      let severity: 'MILD' | 'MODERATE' | 'SEVERE_BURNOUT_RISK' = 'MILD';
      let hours = 8;
      if (zarit >= 61) {
        severity = 'SEVERE_BURNOUT_RISK';
        hours = 24;
      } else if (zarit >= 41) {
        severity = 'MODERATE';
        hours = 16;
      }

      respitePlan = {
        zaritBurdenSeverity: severity,
        recommendedRespiteHoursPerWeek: hours,
        adultDayHealthCareEligibility: zarit >= 41
      };
    }

    // 8. 30-Day Readmission Risk & Discharge Safety
    const baseReadmission = 12;
    const sDohReadmissionUplift = zCount * 7.5 + (profile.recentHospitalAdmissionsLast12Months * 8);
    const readmissionPct = Math.min(85, Math.round(baseReadmission + sDohReadmissionUplift));

    const report: IClinicalSocialWorkReport = {
      reportId: `LCSW-NAV-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      sdohRiskTier: riskTier,
      icd10ZCodeAssignments: zCodes,
      communityResourceActionPlan: {
        emergencyFoodAndNutritionLinkages: [
          'Immediate SNAP (Food Stamps) expedited enrollment dossier',
          'Local food bank emergency box delivery and medically tailored meals (MTM) prescription'
        ],
        housingAndUtilityAssistanceDirectives: [
          'LIHEAP (Low Income Home Energy Assistance Program) crisis grant filing',
          'Coordinated Entry System (CES) voucher intake for housing stabilization'
        ],
        transportationAndAccessSolutions: [
          'Medicaid Non-Emergency Medical Transportation (NEMT) ride scheduling',
          'Local transit paratransit mobility pass application'
        ],
        medicaidWaiverAndDualEligiblePrograms: [
          'Section 1915(c) Home and Community-Based Services (HCBS) in-home caregiver waiver screening',
          'Medicare Savings Program (QMB/SLMB) premium assistance enrollment'
        ]
      },
      caregiverRespitePlan: respitePlan,
      dischargeSafetyReadmissionRisk: {
        estimated30DayReadmissionRiskPercent: readmissionPct,
        primaryNonClinicalReadmissionDriver: zCodes.length > 0 ? zCodes[0].description : 'Medication reconciliation ambiguity',
        mitigatingSocialIntervention: 'Post-discharge 48-hour home visit by Community Health Worker (CHW) + Meds-to-Beds delivery.'
      },
      socialWorkerVicariousTraumaShield: {
        administrativeDocumentationReductionMinutes: 120,
        somaticDecompressionGuidance: 'Take 3 cycles of physiological sighs (double inhale, long exhale) and mentally release patient circumstances to community support partners.'
      }
    };

    this.activeReports.update(reports => [report, ...reports.slice(0, 19)]);
    return report;
  }
}
