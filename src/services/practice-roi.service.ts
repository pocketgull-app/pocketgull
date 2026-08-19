import { Injectable, signal, computed } from '@angular/core';

export type TPocketGullTier = 'solo' | 'clinic' | 'enterprise';

export interface ICptItem {
  code: string;
  name: string;
  description: string;
  ratePerPatientMonthly: number;
  isOneTime?: boolean;
}

export const CMS_CPT_FEES: ICptItem[] = [
  {
    code: 'CPT 99453',
    name: 'Initial RPM Onboarding & Setup',
    description: 'Initial remote physiologic monitoring device setup and patient education.',
    ratePerPatientMonthly: 19.00,
    isOneTime: true
  },
  {
    code: 'CPT 99454',
    name: 'Monthly Telemetry Transmission',
    description: 'Monthly transmission of vitals and biophysical telemetry (16+ monitoring days).',
    ratePerPatientMonthly: 55.00
  },
  {
    code: 'CPT 99457',
    name: 'Clinical Decision Support (First 20m)',
    description: 'First 20 minutes of clinical staff remote patient monitoring and consultation.',
    ratePerPatientMonthly: 50.00
  },
  {
    code: 'CPT 99458',
    name: 'Extended Clinical CDS (Add-on 20m)',
    description: 'Additional 20 minutes of complex RPM care plan synthesis (est. on 30% of cohort).',
    ratePerPatientMonthly: 12.00 // 40.00 * 0.30
  },
  {
    code: 'CPT 99490',
    name: 'Chronic Care Management (CCM)',
    description: 'Non-face-to-face chronic care management and multi-paradigm care plan coordination.',
    ratePerPatientMonthly: 62.00
  }
];

export const TIER_PRICING: Record<TPocketGullTier, { name: string; costPerSeatMonthly: number; features: string[] }> = {
  solo: {
    name: 'Solo Practitioner',
    costPerSeatMonthly: 149,
    features: ['1 Clinician Seat', 'Unlimited Multimodal Voice AI', 'FHIR R4 Bundle Export', 'Standard CPT Coding']
  },
  clinic: {
    name: 'Group Practice & Clinic',
    costPerSeatMonthly: 199,
    features: ['Multi-Clinician Accounts', 'Real-time Multiplayer Consults', 'DICOM Radiomics & 3D Anatomy', 'Automated CMS Billing Batcher']
  },
  enterprise: {
    name: 'Enterprise Health System',
    costPerSeatMonthly: 299,
    features: ['Dedicated VPC / Cloud Run Isolation', 'Epic & Cerner EHR Connectors', 'Custom Pharmacogenomics Rules', '24/7 SLA & Business Associate Agreement (BAA)']
  }
};

@Injectable({
  providedIn: 'root'
})
export class PracticeRoiService {
  readonly patientCohortCount = signal<number>(200);
  readonly clinicianSeats = signal<number>(2);
  readonly selectedTier = signal<TPocketGullTier>('clinic');
  readonly enableRpm = signal<boolean>(true);
  readonly enableCcm = signal<boolean>(true);
  readonly enableInitialSetup = signal<boolean>(true);

  // Computed Financial Calculations
  readonly financialSummary = computed(() => {
    const patients = this.patientCohortCount();
    const seats = this.clinicianSeats();
    const tier = this.selectedTier();
    const rpmActive = this.enableRpm();
    const ccmActive = this.enableCcm();
    const setupActive = this.enableInitialSetup();

    let monthlyPerPatientRate = 0;
    let oneTimePerPatientRate = 0;

    if (rpmActive) {
      monthlyPerPatientRate += 55.00; // 99454
      monthlyPerPatientRate += 50.00; // 99457
      monthlyPerPatientRate += 12.00; // 99458 (30% weighted)
    }

    if (ccmActive) {
      monthlyPerPatientRate += 62.00; // 99490
    }

    if (setupActive && rpmActive) {
      oneTimePerPatientRate += 19.00; // 99453
    }

    const monthlyGrossReimbursement = Math.round(patients * monthlyPerPatientRate);
    const oneTimeOnboardingRevenue = Math.round(patients * oneTimePerPatientRate);
    const annualGrossReimbursement = (monthlyGrossReimbursement * 12) + oneTimeOnboardingRevenue;

    const monthlySaaSExpense = seats * TIER_PRICING[tier].costPerSeatMonthly;
    const annualSaaSExpense = monthlySaaSExpense * 12;

    const netAnnualPracticeProfit = annualGrossReimbursement - annualSaaSExpense;
    const roiMultiple = annualSaaSExpense > 0 ? +(annualGrossReimbursement / annualSaaSExpense).toFixed(1) : 0;
    
    // 42% Charting Overhead Reduction = ~18.5 hours saved per clinician per month
    const hoursSavedMonthly = +(seats * 18.5).toFixed(1);
    const clinicalTimeValueMonthly = Math.round(hoursSavedMonthly * 150); // $150/hr clinical time value

    const itemizedBreakdown = CMS_CPT_FEES.map(item => {
      let isEnabled = false;
      let monthlyTotal = 0;
      let annualTotal = 0;

      if (item.code === 'CPT 99453') {
        isEnabled = setupActive && rpmActive;
        monthlyTotal = 0;
        annualTotal = isEnabled ? Math.round(patients * item.ratePerPatientMonthly) : 0;
      } else if (item.code === 'CPT 99490') {
        isEnabled = ccmActive;
        monthlyTotal = isEnabled ? Math.round(patients * item.ratePerPatientMonthly) : 0;
        annualTotal = monthlyTotal * 12;
      } else {
        isEnabled = rpmActive;
        monthlyTotal = isEnabled ? Math.round(patients * item.ratePerPatientMonthly) : 0;
        annualTotal = monthlyTotal * 12;
      }

      return {
        ...item,
        isEnabled,
        monthlyTotal,
        annualTotal
      };
    });

    return {
      patients,
      seats,
      tier,
      tierDetails: TIER_PRICING[tier],
      monthlyPerPatientRate,
      monthlyGrossReimbursement,
      oneTimeOnboardingRevenue,
      annualGrossReimbursement,
      monthlySaaSExpense,
      annualSaaSExpense,
      netAnnualPracticeProfit,
      roiMultiple,
      hoursSavedMonthly,
      clinicalTimeValueMonthly,
      itemizedBreakdown
    };
  });

  setPatients(count: number): void {
    this.patientCohortCount.set(Math.max(1, count));
  }

  setSeats(count: number): void {
    this.clinicianSeats.set(Math.max(1, count));
  }

  setTier(tier: TPocketGullTier): void {
    this.selectedTier.set(tier);
  }

  toggleRpm(): void {
    this.enableRpm.update(v => !v);
  }

  toggleCcm(): void {
    this.enableCcm.update(v => !v);
  }

  toggleSetup(): void {
    this.enableInitialSetup.update(v => !v);
  }
}
