import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { SecureStorageService } from './secure-storage.service';

export interface ICypVariant {
  gene: 'CYP2D6' | 'CYP2C19' | 'CYP3A4' | 'CYP2C9' | 'VKORC1' | 'SLCO1B1' | 'MTHFR';
  phenotype: 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Ultra-Rapid Metabolizer';
  diplotype: string;
  activityScore: number; // 0 - 3.0
  affectedDrugClasses: string[];
}

export interface IDrugGeneInteraction {
  drugName: string;
  gene: string;
  severity: 'contraindicated' | 'warning' | 'dosage_adjust' | 'normal';
  clinicalSummary: string;
  cpicGuidelineUrl: string;
  evidenceLevel: '1A' | '1B' | '2A';
}

export interface IPharmacogenomicProfile {
  patientId: string;
  timestamp: string;
  variants: ICypVariant[];
  interactions: IDrugGeneInteraction[];
  overallToxicityRisk: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class PharmacogenomicsService {
  private state = (() => { try { return inject(PatientStateService); } catch (e) { return null; } })();
  private storage = (() => { try { return inject(SecureStorageService); } catch (e) { return null; } })();

  readonly activeProfile = signal<IPharmacogenomicProfile | null>(null);

  readonly hasHighRiskInteractions = computed(() => {
    const profile = this.activeProfile();
    if (!profile) return false;
    return profile.interactions.some(i => i.severity === 'contraindicated' || i.severity === 'warning');
  });

  constructor() {
    this.initDefaultProfile();
  }

  public initDefaultProfile(): IPharmacogenomicProfile {
    const defaultVariants: ICypVariant[] = [
      {
        gene: 'CYP2D6',
        phenotype: 'Poor Metabolizer',
        diplotype: '*4/*4',
        activityScore: 0,
        affectedDrugClasses: ['SSRI Antidepressants', 'Codeine/Tramadol Opioids', 'Beta-Blockers']
      },
      {
        gene: 'CYP2C19',
        phenotype: 'Ultra-Rapid Metabolizer',
        diplotype: '*17/*17',
        activityScore: 2.5,
        affectedDrugClasses: ['Proton Pump Inhibitors (Omeprazole)', 'Clopidogrel (Plavix)']
      },
      {
        gene: 'MTHFR',
        phenotype: 'Intermediate Metabolizer',
        diplotype: 'C677T Heterozygous',
        activityScore: 0.7,
        affectedDrugClasses: ['Folate Metabolism', 'Methotrexate', 'Homocysteine Recycling']
      },
      {
        gene: 'SLCO1B1',
        phenotype: 'Poor Metabolizer',
        diplotype: '*5/*5',
        activityScore: 0,
        affectedDrugClasses: ['Statin Myopathy Risk (Simvastatin / Atorvastatin)']
      }
    ];

    const defaultInteractions: IDrugGeneInteraction[] = [
      {
        drugName: 'Codeine / Tramadol',
        gene: 'CYP2D6',
        severity: 'contraindicated',
        clinicalSummary: 'CYP2D6 Poor Metabolizer prevents bio-activation of codeine into morphine, causing zero analgesia while increasing parent drug toxicity.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
        evidenceLevel: '1A'
      },
      {
        drugName: 'Simvastatin',
        gene: 'SLCO1B1',
        severity: 'warning',
        clinicalSummary: 'SLCO1B1 *5/*5 markedly reduces hepatic uptake, resulting in 400% higher plasma exposure and high risk of statin-induced rhabdomyolysis.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-statins-and-slco1b1/',
        evidenceLevel: '1A'
      },
      {
        drugName: 'Omeprazole',
        gene: 'CYP2C19',
        severity: 'dosage_adjust',
        clinicalSummary: 'CYP2C19 Ultra-Rapid Metabolizer causes rapid clearance; standard dosing produces therapeutic failure. Dose escalation or H2RA alternative recommended.',
        cpicGuidelineUrl: 'https://cpicpgx.org/guidelines/guideline-for-proton-pump-inhibitors-and-cyp2c19/',
        evidenceLevel: '1B'
      }
    ];

    const profile: IPharmacogenomicProfile = {
      patientId: this.state?.activePatientSummary() ? 'P-GULL-ACTIVE' : 'P-GULL-DEMO',
      timestamp: new Date().toISOString(),
      variants: defaultVariants,
      interactions: defaultInteractions,
      overallToxicityRisk: 72
    };

    this.activeProfile.set(profile);
    this.storage?.setItem('pg_pharmacogenomic_profile', JSON.stringify(profile));
    return profile;
  }

  public checkDrugGeneSafety(drugName: string): IDrugGeneInteraction | null {
    const profile = this.activeProfile();
    if (!profile) return null;
    const match = profile.interactions.find(i => i.drugName.toLowerCase().includes(drugName.toLowerCase()));
    return match || null;
  }
}
